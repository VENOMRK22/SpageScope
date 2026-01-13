// Types
export interface SkyEvent {
    id: number | string;
    title: string;
    date: string;
    type: 'meteor' | 'eclipse' | 'conjunction' | 'comet' | 'planet' | 'satellite' | 'aurora' | 'lunar' | 'terrestrial';
    visibility: string;
    description: string;

    // Top-Level Summaries for Cards
    viewingQuality?: string;
    magnitude?: string;
    coordinates?: {
        ra: string;
        dec: string;
    };

    bestViewing?: {
        city: string;
        coordinates: { lat: number; lng: number };
    };
    // GIS-Ready Visualization Data
    coverage?: {
        shape: 'ring';
        center: { lat: number; lng: number }; // Scientific Center (Region/Pole)
        radius: number;
        color?: string;
    };
    // Event-Specific Scientific Metrics
    telemetry?: {
        label: string;
        value: string;
        unit?: string;
    }[];
    // Local Observing Conditions
    conditions?: {
        seeing: string; // FWHM 
        skyBrightness: string; // mag/arcsec²
        bortleClass: string;
        limitingMag: string;
    };
}

export interface SolarData {
    flrID: string;
    beginTime: string;
    peakTime: string;
    classType: string;
    sourceLocation: string;
    note: string;
    imageUrl?: string; // Legacy
    sunImageUrl: string; // New required field
    kpIndex: number;
    solarWindSpeed: number;
}



export interface Launch {
    id: string;
    name: string;
    status: { name: string; abbrev: string };
    net: string; // No Earlier Than date
    launch_service_provider: { name: string };
    rocket: { configuration: { name: string; image_url: string | null } };
    pad: {
        name: string;
        latitude?: string;
        longitude?: string;
        location: { name: string }
    };
    mission: { description: string } | null;
}

// Coordinate Helper (Robust Fallback)
const getLaunchCoordinates = (pad: Launch['pad']) => {
    // 1. Try Direct API Data
    if (pad.latitude && pad.longitude) {
        return { lat: parseFloat(pad.latitude), lng: parseFloat(pad.longitude) };
    }

    // 2. Text-Based Fallback (Geocoding by Name)
    const loc = (pad.location.name + " " + pad.name).toLowerCase();

    if (loc.includes('sriharikota') || loc.includes('india') || loc.includes('satish')) return { lat: 13.72, lng: 80.23 }; // ISRO
    if (loc.includes('kennedy') || loc.includes('cape canaveral') || loc.includes('florida')) return { lat: 28.57, lng: -80.64 }; // KSC/CCSFS
    if (loc.includes('vandenberg') || loc.includes('california')) return { lat: 34.63, lng: -120.61 }; // VSFB
    if (loc.includes('boca chica') || loc.includes('starbase')) return { lat: 25.99, lng: -97.15 }; // Starbase
    if (loc.includes('baikonur') || loc.includes('kazakhstan')) return { lat: 45.96, lng: 63.30 }; // Baikonur
    if (loc.includes('plesetsk') || loc.includes('russia')) return { lat: 62.92, lng: 40.57 }; // Plesetsk
    if (loc.includes('french guiana') || loc.includes('kourou')) return { lat: 5.23, lng: -52.77 }; // ESA
    if (loc.includes('china') || loc.includes('jiuquan')) return { lat: 40.96, lng: 100.29 }; // Jiuquan
    if (loc.includes('xichang')) return { lat: 28.24, lng: 102.02 }; // Xichang
    if (loc.includes('wenchang')) return { lat: 19.61, lng: 110.95 }; // Wenchang
    if (loc.includes('japan') || loc.includes('tanegashima')) return { lat: 30.40, lng: 130.97 }; // JAXA
    if (loc.includes('new zealand') || loc.includes('mahia')) return { lat: -39.26, lng: 177.86 }; // Rocket Lab

    return { lat: 0, lng: 0 }; // Null Island (Unknown)
};

// Mock Data with SCIENTIFICALLY DECOUPLED CENTERS
const MOCK_EVENTS: SkyEvent[] = [
    {
        id: 1,
        title: "Perseids Meteor Shower",
        date: "2025-08-12",
        type: 'meteor',
        visibility: "Northern Hemisphere",
        description: "One of the brightest meteor showers of the year. Radiant is in Perseus, high in the northern sky.",
        viewingQuality: "Excellent",
        magnitude: "2.1",
        coordinates: { ra: "03h 04m", dec: "+58° 00'" },
        bestViewing: { city: "Mauna Kea, Hawaii", coordinates: { lat: 19.8, lng: -155.4 } },
        coverage: {
            shape: 'ring',
            center: { lat: 90, lng: 0 },
            radius: 80,
            color: 'rgba(0, 243, 255, 0.4)'
        },
        telemetry: [
            { label: "Zenith Hourly Rate", value: "120", unit: "ZHR" },
            { label: "Population Index (r)", value: "2.1", unit: "" },
            { label: "Velocity", value: "59", unit: "km/s" },
            { label: "Radiant Altitude", value: "65", unit: "deg" },
            { label: "Abs Magnitude", value: "-2.5", unit: "mag" }
        ],
        conditions: {
            seeing: "0.4\"",
            skyBrightness: "21.9",
            bortleClass: "Class 2",
            limitingMag: "7.1"
        }
    },
    {
        id: 2,
        title: "Total Solar Eclipse",
        date: "2026-08-12",
        type: 'eclipse',
        visibility: "Europe, North America",
        description: "A total eclipse visible across the Arctic, Greenland, Iceland, and Spain.",
        viewingQuality: "Perfect",
        magnitude: "-26.7",
        coordinates: { ra: "09h 32m", dec: "+14° 23'" },
        bestViewing: { city: "Palma, Spain", coordinates: { lat: 39.5, lng: 2.6 } },
        coverage: {
            shape: 'ring',
            center: { lat: 39.5, lng: 2.6 },
            radius: 35,
            color: 'rgba(255, 140, 0, 0.6)'
        },
        telemetry: [
            { label: "Eclipse Magnitude", value: "1.015", unit: "" },
            { label: "Obscuration", value: "100", unit: "%" },
            { label: "Gamma", value: "0.87", unit: "" },
            { label: "Totality Duration", value: "2m 18s", unit: "" },
            { label: "Path Width", value: "290", unit: "km" }
        ],
        conditions: {
            seeing: "1.2\"",
            skyBrightness: "18.5",
            bortleClass: "Class 5",
            limitingMag: "5.5"
        }
    },
    {
        id: 3,
        title: "Jupiter-Mars Conjunction",
        date: "2025-01-20",
        type: 'conjunction',
        visibility: "Global",
        description: "A close approach of Jupiter and Mars, visible globally.",
        viewingQuality: "Good",
        magnitude: "-2.8",
        coordinates: { ra: "06h 12m", dec: "+22° 18'" },
        bestViewing: { city: "Atacama Desert, Chile", coordinates: { lat: -24.5, lng: -69.2 } },
        coverage: {
            shape: 'ring',
            center: { lat: -24.5, lng: -69.2 },
            radius: 170, // Global
            color: 'rgba(200, 100, 255, 0.3)'
        },
        telemetry: [
            { label: "Angular Sep", value: "0.4", unit: "deg" },
            { label: "Jupiter Mag", value: "-2.8", unit: "mag" },
            { label: "Mars Mag", value: "-0.8", unit: "mag" },
            { label: "Elongation", value: "165", unit: "deg W" },
            { label: "Phase Angle", value: "99.8", unit: "%" }
        ],
        conditions: {
            seeing: "0.6\"",
            skyBrightness: "22.0",
            bortleClass: "Class 1",
            limitingMag: "7.5"
        }
    },
    {
        id: 4,
        title: "Comet C/2025 S1",
        date: "2025-11-05",
        type: 'comet',
        visibility: "Southern Hemisphere",
        description: "A newly discovered comet reaching near naked-eye visibility in the southern skies.",
        viewingQuality: "Fair",
        magnitude: "5.2",
        coordinates: { ra: "14h 45m", dec: "-32° 10'" },
        bestViewing: { city: "Sydney, Australia", coordinates: { lat: -33.8, lng: 151.2 } },
        coverage: {
            shape: 'ring',
            center: { lat: -90, lng: 0 },
            radius: 80,
            color: 'rgba(0, 255, 100, 0.4)'
        },
        telemetry: [
            { label: "Total Mag (m1)", value: "5.2", unit: "mag" },
            { label: "Deg. Condensation", value: "6", unit: "DC" },
            { label: "Coma Diameter", value: "8", unit: "arcmin" },
            { label: "Tail Length", value: "1.5", unit: "deg" },
            { label: "AfRho", value: "1200", unit: "cm" }
        ],
        conditions: {
            seeing: "1.5\"",
            skyBrightness: "18.0",
            bortleClass: "Class 8",
            limitingMag: "4.5"
        }
    },
    {
        id: 5,
        title: "Saturn at Opposition",
        date: "2025-09-21",
        type: 'planet',
        visibility: "Global",
        description: "Saturn will be at its closest to Earth and its face will be fully illuminated by the Sun. Seeliger Effect visible.",
        viewingQuality: "Perfect",
        magnitude: "0.4",
        coordinates: { ra: "23h 14m", dec: "-08° 12'" },
        bestViewing: { city: "Flagstaff, AZ", coordinates: { lat: 35.1, lng: -111.6 } },
        coverage: {
            shape: 'ring',
            center: { lat: 35.1, lng: -111.6 },
            radius: 180,
            color: 'rgba(255, 220, 100, 0.3)'
        },
        telemetry: [
            { label: "Ring Tilt", value: "4.2", unit: "deg" },
            { label: "Dist to Earth", value: "8.76", unit: "AU" },
            { label: "Ang. Diameter", value: "19.2", unit: "arcsec" },
            { label: "Phase", value: "100", unit: "%" },
            { label: "Seeliger Boost", value: "+0.4", unit: "mag" }
        ],
        conditions: {
            seeing: "0.5\"",
            skyBrightness: "21.6",
            bortleClass: "Class 3",
            limitingMag: "6.8"
        }
    },
    {
        id: 6,
        title: "G4 Geomagnetic Storm",
        date: "2025-03-20",
        type: 'aurora',
        visibility: "High Latitudes",
        description: "Severe geomagnetic storm predicted following a major coronal mass ejection (CME).",
        viewingQuality: "Excellent",
        magnitude: "Kp 8.3",
        coordinates: { ra: "N/A", dec: "N/A" },
        bestViewing: { city: "Tromsø, Norway", coordinates: { lat: 69.6, lng: 18.9 } },
        coverage: {
            shape: 'ring',
            center: { lat: 90, lng: 0 },
            radius: 40, // Expanded auroral oval
            color: 'rgba(50, 255, 50, 0.5)'
        },
        telemetry: [
            { label: "Kp Index", value: "8.3", unit: "" },
            { label: "Solar Wind Speed", value: "750", unit: "km/s" },
            { label: "Bz Component", value: "-15", unit: "nT" },
            { label: "Density", value: "12", unit: "p/cm3" },
            { label: "Hemispheric Power", value: "95", unit: "GW" }
        ],
        conditions: {
            seeing: "2.1\"",
            skyBrightness: "20.1",
            bortleClass: "Class 4",
            limitingMag: "5.2"
        }
    },
    {
        id: 7,
        title: "ISS Lunar Transit",
        date: "2025-06-15",
        type: 'satellite',
        visibility: "Narrow Path (Europe)",
        description: "The International Space Station will transit across the face of the Moon for observers in central Europe.",
        viewingQuality: "Good",
        magnitude: "-3.5",
        coordinates: { ra: "18h 45m", dec: "-24° 15'" },
        bestViewing: { city: "Berlin, Germany", coordinates: { lat: 52.5, lng: 13.4 } },
        coverage: {
            shape: 'ring',
            center: { lat: 52.5, lng: 13.4 },
            radius: 5, // Very narrow visibility
            color: 'rgba(255, 255, 255, 0.6)'
        },
        telemetry: [
            { label: "Transit Duration", value: "0.82", unit: "s" },
            { label: "ISS Ang Size", value: "44", unit: "arcsec" },
            { label: "Moon Phase", value: "88", unit: "%" },
            { label: "Range", value: "480", unit: "km" },
            { label: "Relative Vel", value: "7.6", unit: "km/s" }
        ],
        conditions: {
            seeing: "1.1\"",
            skyBrightness: "17.0",
            bortleClass: "Class 8",
            limitingMag: "4.0"
        }
    },
    {
        id: 8,
        title: "Super Blue Moon",
        date: "2025-10-31",
        type: 'lunar',
        visibility: "Global",
        description: "A rare Super Blue Moon occurring on Halloween. The Moon will appear 14% larger and 30% brighter.",
        viewingQuality: "Perfect",
        magnitude: "-12.8",
        coordinates: { ra: "02h 30m", dec: "+14° 20'" },
        bestViewing: { city: "New York, USA", coordinates: { lat: 40.7, lng: -74.0 } },
        coverage: {
            shape: 'ring',
            center: { lat: 40.7, lng: -74.0 },
            radius: 170, // Global
            color: 'rgba(200, 200, 255, 0.4)'
        },
        telemetry: [
            { label: "Distance", value: "356,800", unit: "km" },
            { label: "Illumination", value: "100", unit: "%" },
            { label: "Ang. Diameter", value: "33.5", unit: "arcmin" },
            { label: "Libration Lat", value: "+4.2", unit: "deg" },
            { label: "Age", value: "14.8", unit: "days" }
        ],
        conditions: {
            seeing: "1.8\"",
            skyBrightness: "15.0", // Moon washes out sky
            bortleClass: "Class 9",
            limitingMag: "3.5"
        }
    },
    {
        id: 9,
        title: "Vela Supernova Remnant",
        date: "Indefinite",
        type: 'conjunction',
        visibility: "Southern Hemisphere",
        description: "Deep sky imaging opportunity for the Vela SNR. Best visibility window opens this week.",
        viewingQuality: "Excellent",
        magnitude: "N/A",
        coordinates: { ra: "08h 35m", dec: "-45° 10'" },
        bestViewing: { city: "Coonabarabran, AUS", coordinates: { lat: -31.3, lng: 149.3 } },
        coverage: {
            shape: 'ring',
            center: { lat: -90, lng: 0 },
            radius: 50,
            color: 'rgba(255, 100, 100, 0.3)'
        },
        telemetry: [
            { label: "Surface Brightness", value: "24.5", unit: "mag" },
            { label: "O-III Strength", value: "High", unit: "" },
            { label: "H-Alpha Flux", value: "Medium", unit: "" },
            { label: "Apparent Size", value: "480", unit: "arcmin" },
            { label: "Distance", value: "800", unit: "ly" }
        ],
        conditions: {
            seeing: "0.7\"",
            skyBrightness: "21.8",
            bortleClass: "Class 1",
            limitingMag: "7.2"
        }
    }
];

// Named Exports
export const fetchSkyEvents = async (): Promise<SkyEvent[]> => {
    // 1. Get Mock Events
    const mockEvents = [...MOCK_EVENTS];

    // 2. Try to fetch Real Events (Launches mapped to SkyEvents)
    try {
        const realEvents = await fetchRealSkyEvents();
        return [...mockEvents, ...realEvents];
    } catch (e) {
        console.warn("Failed to fetch real events, falling back to mock only", e);
        return mockEvents;
    }
};



// ADAPTER: Real Launch Data -> SkyEvent Interface
export const fetchRealSkyEvents = async (): Promise<SkyEvent[]> => {
    // 1. Check Use-Case Cache (Preserves all metrics/units exactly as generated)
    try {
        // Use 24h TTL for the daily event summary
        const cachedData = await getSmartCache('global_sky_events', 24);
        if (cachedData) {
            console.log(`[Cache Hit] Serving Full Event Logic from Storage ⚡`);
            return cachedData as SkyEvent[];
        }
    } catch (e) {
        console.warn("Cache read error", e);
    }

    try {
        // 2. Fetch Raw API
        const launches = await fetchRealLaunches();

        // 3. Adapter Logic (Generate Metrics/Units)
        const adaptedEvents = launches.map((launch, index) => {
            const coords = getLaunchCoordinates(launch.pad);

            return {
                id: 1000 + index,
                title: `[LIVE] ${launch.name}`,
                date: launch.net,
                type: 'satellite',
                visibility: "Global Stream",
                description: launch.mission?.description || `Live launch of ${launch.name} from ${launch.pad.location.name}.`,
                viewingQuality: "Good",
                magnitude: "N/A",
                coordinates: { ra: "N/A", dec: "N/A" },
                bestViewing: {
                    city: launch.pad.location.name.split(',')[0],
                    coordinates: coords
                },
                coverage: {
                    shape: 'ring',
                    center: coords,
                    radius: 10,
                    color: 'rgba(255, 100, 50, 0.5)'
                },
                telemetry: [ // <--- THESE ARE THE UNITS/METRICS USER WANTS STORED
                    { label: "Provider", value: launch.launch_service_provider.name, unit: "ORG" },
                    { label: "Rocket", value: launch.rocket.configuration.name, unit: "TYPE" },
                    { label: "Status", value: launch.status.name, unit: "STAT" },
                    { label: "Window", value: new Date(launch.net).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), unit: "T-0" }
                ],
                conditions: {
                    seeing: "1.0\"",
                    skyBrightness: "N/A",
                    bortleClass: "Class 4",
                    limitingMag: "6.0"
                }
            } as SkyEvent;
        });

        // 4. Save EXACT Result to Cache
        await setSmartCache('global_sky_events', adaptedEvents);

        return adaptedEvents;

    } catch (error) {
        console.error("Error adapting real events:", error);
        return [];
    }
}

export const fetchSolarData = async (): Promise<SolarData | null> => {
    try {
        return {
            flrID: "FLR-2025-001",
            beginTime: new Date().toISOString(),
            peakTime: new Date(Date.now() + 3600000).toISOString(),
            classType: "X2.1", // Upgraded to X-Class for demo excitement
            sourceLocation: "AR3290",
            note: "Strong radio blackout in progress.",
            imageUrl: "https://svs.gsfc.nasa.gov/vis/a010000/a011300/a011353/SDO_Year5_304.jpg",
            sunImageUrl: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg",
            kpIndex: 7.2,
            solarWindSpeed: 540
        };
    } catch (error) {
        console.error("Error in mock solar fetch", error);
        return null;
    }
};

// --- HIVE MIND CACHING ---
import { getSmartCache, setSmartCache } from '../lib/cacheUtils';


export const fetchRealLaunches = async (): Promise<Launch[]> => {
    try {
        console.log("🚀 INITIALIZING LAUNCH CONTROL UPLINK...");

        // 1. Check Cache (1 Hour TTL)
        const cachedLaunches = await getSmartCache('global_launches', 1);
        if (cachedLaunches) {
            console.log("⚡ LAUNCH CONTROL: CACHE HIT (Standardized).");
            return cachedLaunches as Launch[];
        }

        // 2. Fetch Fresh Data if needed
        console.log("📡 LAUNCH CONTROL: CONTACTING GLOBAL NETWORK...");

        // Fetch Upcoming and Previous in parallel
        const [upcomingRes, previousRes] = await Promise.all([
            fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=10'),
            fetch('https://lldev.thespacedevs.com/2.2.0/launch/previous/?limit=10')
        ]);

        if (!upcomingRes.ok || !previousRes.ok) throw new Error('Network response was not ok');

        const upcomingData = await upcomingRes.json();
        const previousData = await previousRes.json();

        // Deduplicate (API might return overlaps or same mission if time windows are close)
        const rawList = [...upcomingData.results, ...previousData.results];
        const uniqueMap = new Map();
        rawList.forEach((l: any) => uniqueMap.set(l.id, l));
        const freshLaunches = Array.from(uniqueMap.values()) as Launch[];

        // 3. Update Cache (Generic 'items' wrapper used by setSmartCache)
        await setSmartCache('global_launches', freshLaunches);
        console.log("💾 LAUNCH CONTROL: UPDATED GLOBAL DATABASE.");

        return freshLaunches;

    } catch (error) {
        console.error("Error fetching real launches:", error);
        return fetchLaunchesMock();
    }
};

export const fetchLaunchesMock = async (): Promise<Launch[]> => {
    // Return original mock data as fallback
    try {
        return [
            {
                id: "1",
                name: "Starship Flight 7",
                status: { name: "Go for Launch", abbrev: "Go" },
                net: "2025-06-15T12:00:00Z",
                launch_service_provider: { name: "SpaceX" },
                rocket: { configuration: { name: "Starship", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Starship_S24_on_OLM_2023.jpg/800px-Starship_S24_on_OLM_2023.jpg" } },
                pad: { name: "Orbital Launch Mount A", location: { name: "Starbase, TX" } },
                mission: { description: "Orbital test flight of Starship launch vehicle attempting tower catch." }
            },
            {
                id: "2",
                name: "Artemis III",
                status: { name: "TBC", abbrev: "TBC" },
                net: "2026-09-01T14:30:00Z",
                launch_service_provider: { name: "NASA" },
                rocket: { configuration: { name: "SLS Block 1B", image_url: "https://www.nasa.gov/sites/default/files/styles/full_width/public/thumbnails/image/artemis_i_launch_night.jpg" } },
                pad: { name: "LC-39B", location: { name: "Kennedy Space Center, FL" } },
                mission: { description: "First crewed lunar landing since Apollo 17." }
            },
            {
                id: "3",
                name: "Electron | 'Love At First Insight'",
                status: { name: "Scheduled", abbrev: "Go" },
                net: "2025-05-20T09:15:00Z",
                launch_service_provider: { name: "Rocket Lab" },
                rocket: { configuration: { name: "Electron", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Electron_launch_vehicle_on_pad_LC-1.jpg/600px-Electron_launch_vehicle_on_pad_LC-1.jpg" } },
                pad: { name: "LC-1A", location: { name: "Mahia Peninsula, NZ" } },
                mission: { description: "Deployment of Earth observation satellites for BlackSky." }
            }
        ];
    } catch (error) {
        console.error("Error in mock launch fetch", error);
        return [];
    }
};

// Use this for the dedicated Launches widget if needed, or mapped events above.
export const fetchLaunches = fetchRealLaunches;
