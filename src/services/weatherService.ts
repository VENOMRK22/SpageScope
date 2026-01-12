import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// --- Types ---
export interface SpaceWeather {
    solar: {
        wind: { speed: number; density: number; temp: number };
        flares: { class: string; flux: number; history: { time: string, flux: number }[] };
        sunspots: { count: number; image: string };
        cme: { active: boolean; arrival: string | null; note: string };
    };
    geomagnetic: {
        kp: { current: number; status: string; history: { time: string, kp: number }[] };
        magneticField: { bt: number; bz: number; status: string }; // Bz < 0 is critical
    };
    radiation: {
        status: string; // S-Scale (S1-S5)
        flux: number;
    };
    location: {
        city: string;
        lat: number;
        coords: [number, number];
        auroraProbability: number;
    };
    alerts: { type: 'G' | 'S' | 'R'; level: number; message: string; timestamp: string }[];
    lastUpdated: number;
}

const CACHE_DOC_ID = 'global_readings';
const CACHE_COLLECTION = 'weather_station';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 Minutes

// --- 1. The Hive Mind (Shared Cache Logic) ---
export const getSpaceWeather = async (): Promise<SpaceWeather | null> => {
    try {
        console.log("🛰️ INITIALIZING HIVE MIND LINK...");
        const docRef = doc(db, CACHE_COLLECTION, CACHE_DOC_ID);
        const docSnap = await getDoc(docRef);

        let data: SpaceWeather | null = null;
        let needsUpdate = true;

        if (docSnap.exists()) {
            data = docSnap.data() as SpaceWeather;
            const age = Date.now() - data.lastUpdated;
            if (age < CACHE_DURATION_MS) {
                console.log(`⚡ HIVE MIND: CACHE HIT (${(age / 1000 / 60).toFixed(1)}m old). NO API CALLS.`);
                needsUpdate = false;
            }
        }

        if (needsUpdate) {
            console.log("📡 HIVE MIND: DATA STALE. BECOMING ACTIVE PROBE. FETCHING NOAA DATA...");
            // WE are the chosen one. Fetch fresh data.
            const freshData = await fetchFreshNOAAData();
            if (freshData) {
                await setDoc(docRef, freshData);
                console.log("💾 HIVE MIND: UPDATED GLOBAL DATABASE.");
                data = freshData;
            } else {
                console.warn("⚠️ HIVE MIND: FETCH FAILED. USING STALE DATA IF AVAILABLE.");
            }
        }

        // Always inject *Client Specific* location data (Don't cache this globally obviously)
        if (data) {
            const userLoc = await getUserLocation();
            data.location = {
                ...userLoc,
                auroraProbability: calculateAuroraProb(userLoc.lat, data.geomagnetic.kp.current)
            };
        }

        return data;

    } catch (error) {
        console.error("Hive Mind Error:", error);
        return null;
    }
};

// --- 2. Raw NOAA Fetchers ---
const fetchFreshNOAAData = async (): Promise<SpaceWeather | null> => {
    try {
        // Fetch all endpoints in parallel
        const [windRes, magRes, kpRes, flaresRes, sunspotsRes] = await Promise.all([
            fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json').then(r => r.ok ? r.json() : null), // [time, density, speed, temp]
            fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json').then(r => r.ok ? r.json() : null),   // [time, bt, bz, ...]
            fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json').then(r => r.ok ? r.json() : null),     // [time, kp, a_running, station_count]
            fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json').then(r => r.ok ? r.json() : null),     // Flare history
            fetch('https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json').then(r => r.ok ? r.json() : null) // Sunspots
        ]);

        // --- Parsing Logic (Robust to failures) ---

        // Solar Wind (Use last entry)
        const windData = windRes && windRes.length > 1 ? windRes[windRes.length - 1] : ["", 5, 400, 100000];
        const wind = {
            density: parseFloat(windData[1]) || 5, // p/cm3
            speed: parseFloat(windData[2]) || 400, // km/s
            temp: parseFloat(windData[3]) || 100000 // K
        };

        // Magnetic Field
        const magData = magRes && magRes.length > 1 ? magRes[magRes.length - 1] : ["", 0, 0, 0, 0, 0, 5];
        const mag = {
            bt: parseFloat(magData[6]) || 5, // Total Field (nT)
            bz: parseFloat(magData[3]) || 0, // Z-Component (nT) - CRITICAL
            status: parseFloat(magData[3]) < -10 ? "CRITICAL (South)" : parseFloat(magData[3]) < -5 ? "Unstable" : "Stable"
        };

        // Kp Index
        const kpData = kpRes && kpRes.length > 1 ? kpRes[kpRes.length - 1] : ["", 2];
        const kp = parseFloat(kpData[1]) || 2;

        // Flares (Get current flux and history)
        const currentFlare = flaresRes && flaresRes.length > 0 ? flaresRes[flaresRes.length - 1] : { flux: 1e-6 }; // ~B1 default
        const flux = currentFlare.flux || 1e-6;
        const flareClass = getFlareClass(flux);

        // Sunspots (Real NOAA Data)
        const sunspotData = sunspotsRes && sunspotsRes.length > 0 ? sunspotsRes[sunspotsRes.length - 1] : { "ssn": 145 };
        const sunspots = {
            count: sunspotData.ssn || 145,
            image: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg"
        };

        return {
            solar: {
                wind,
                flares: {
                    class: flareClass,
                    flux: flux,
                    history: flaresRes ? flaresRes.slice(-50).map((f: any) => ({ time: f.time_tag, flux: f.flux })) : []
                },
                sunspots,
                cme: { active: false, arrival: null, note: "No Earth-directed CMEs detected." }
            },
            geomagnetic: {
                kp: { current: kp, status: kp >= 5 ? "STORM" : "QUIET", history: [] },
                magneticField: mag
            },
            radiation: { status: "S1", flux: 10 }, // Placeholder for now
            location: { city: "Unknown", lat: 0, coords: [0, 0], auroraProbability: 0 }, // Will be overwritten by client
            alerts: [], // Generate alerts based on values
            lastUpdated: Date.now()
        };

    } catch (e) {
        console.error("NOAA Fetch Error:", e);
        return null;
    }
};

// --- 3. Helpers ---

const getUserLocation = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        return {
            city: data.city || "Orbit",
            lat: data.latitude || 0,
            coords: [data.latitude || 0, data.longitude || 0] as [number, number]
        };
    } catch (e) {
        console.warn("Location fetch failed, using Null Island");
        return { city: "Unknown Sector", lat: 0, coords: [0, 0] as [number, number] };
    }
};

const calculateAuroraProb = (lat: number, kp: number) => {
    // Basic probability heuristic
    const absLat = Math.abs(lat);
    if (absLat < 40) return 0; // Too close to equator

    // Required KP for latitude
    // 60deg -> Kp 3
    // 50deg -> Kp 7
    // 40deg -> Kp 9

    const requiredKp = 9 - ((absLat - 40) / 20) * 6; // linear approx
    if (kp >= requiredKp) return Math.min(100, (kp - requiredKp + 1) * 30);
    return Math.max(0, (kp - requiredKp) * 20); // falloff
};

const getFlareClass = (flux: number) => {
    if (flux < 1e-7) return "A";
    if (flux < 1e-6) return "B";
    if (flux < 1e-5) return "C";
    if (flux < 1e-4) return "M";
    return "X";
};
