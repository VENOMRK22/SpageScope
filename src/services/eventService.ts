import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { SkyEvent } from './spaceData';

const CACHE_DOC_ID = 'global_events_pure_v3'; // BUMPED TO REFRESH LOCAL CONDITIONS
const CACHE_COLLECTION = 'astronomy_center';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 Hour Cache

// --- 1. The Hive Mind (Shared Cache Logic) ---
export const getCachedEvents = async (): Promise<SkyEvent[]> => {
    try {
        console.log("🔭 INITIALIZING STAR GAZER UPLINK...");
        const docRef = doc(db, CACHE_COLLECTION, CACHE_DOC_ID);
        const docSnap = await getDoc(docRef);

        let events: SkyEvent[] = [];
        let needsUpdate = true;

        if (docSnap.exists()) {
            const data = docSnap.data();
            const age = Date.now() - (data.lastUpdated || 0);

            if (age < CACHE_DURATION_MS && data.events) {
                console.log(`⚡ STAR GAZER: CACHE HIT (${(age / 1000 / 60).toFixed(0)}m old).`);
                events = data.events as SkyEvent[];
                needsUpdate = false;
            }
        }

        if (needsUpdate) {
            console.log("📡 STAR GAZER: CALCULATING CELESTIAL MECHANICS...");
            const freshEvents = await fetchDeepSpaceEvents();
            if (freshEvents.length > 0) {
                await setDoc(docRef, {
                    events: freshEvents,
                    lastUpdated: Date.now()
                });
                console.log("💾 STAR GAZER: UPDATED GLOBAL DATABASE.");
                events = freshEvents;
            } else {
                console.warn("⚠️ STAR GAZER: CALCULATION FAILED. USING ARCHIVES.");
                if (docSnap.exists()) events = docSnap.data().events;
            }
        }

        return events;

    } catch (error) {
        console.error("Star Gazer Error:", error);
        return [];
    }
};

// --- 2. Data Generators & Fetchers ---

const fetchDeepSpaceEvents = async (): Promise<SkyEvent[]> => {
    // 1. Static Math (Curated List 2024-2026)
    const astronomicalEvents = generateAstronomicalEvents();

    // Sort all by Date
    return astronomicalEvents.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
};

// C. Smart Static Generator (The 'Astronomy API' Simulation)
// Focus: Near Past (2024-2025) and Near Future (2026)
const generateAstronomicalEvents = (): SkyEvent[] => {

    // Helper to randomize realistic conditions
    const conditions = (bortle: number) => ({
        seeing: (0.4 + Math.random() * 0.8).toFixed(1) + '"',
        skyBrightness: (22 - bortle * 0.5 + Math.random() * 0.2).toFixed(1),
        bortleClass: `Class ${bortle}`,
        limitingMag: (7.6 - bortle * 0.5).toFixed(1)
    });

    return [
        // --- RECENT PAST (2024) ---
        {
            id: 202401,
            title: "Total Solar Eclipse (NA)",
            date: "2024-04-08",
            type: 'eclipse',
            visibility: "North America",
            description: "A historic total solar eclipse traversing Mexico, the US, and Canada. 4 minutes of totality.",
            viewingQuality: "Perfect",
            coordinates: { ra: "01h 06m", dec: "+05° 50'" },
            bestViewing: { city: "Dallas, TX", coordinates: { lat: 32.7, lng: -96.7 } },
            coverage: { shape: 'ring', center: { lat: 32.7, lng: -96.7 }, radius: 50, color: 'rgba(255, 140, 0, 0.6)' },
            telemetry: [{ label: "Totality", value: "4m 28s", unit: "" }, { label: "Path Width", value: "198", unit: "km" }],
            conditions: conditions(3)
        },
        {
            id: 202402,
            title: "Super G5 Solar Storm",
            date: "2024-05-10",
            type: 'aurora',
            visibility: "Global",
            description: "Extreme geomagnetic storm (G5) creating auroras visible as far south as Florida and India.",
            viewingQuality: "Historical",
            magnitude: "Kp 9.0",
            coordinates: { ra: "N/A", dec: "N/A" },
            bestViewing: { city: "Global", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 90, lng: 0 }, radius: 60, color: 'rgba(50, 255, 50, 0.5)' },
            telemetry: [{ label: "Kp Index", value: "9.0", unit: "max" }, { label: "Dst Index", value: "-412", unit: "nT" }],
            conditions: conditions(4)
        },
        {
            id: 202403,
            title: "Comet C/2023 A3",
            date: "2024-10-12",
            type: 'comet',
            visibility: "Global",
            description: "Comet Tsuchinshan-ATLAS reached peak brightness, putting on a spectacular show at sunset.",
            viewingQuality: "Excellent",
            magnitude: "-4.9",
            coordinates: { ra: "13h 05m", dec: "-02° 30'" },
            bestViewing: { city: "Western Horizon", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 0, lng: 0 }, radius: 100, color: 'rgba(0, 243, 255, 0.4)' },
            telemetry: [{ label: "Tail Length", value: "15", unit: "deg" }, { label: "Distance", value: "0.47", unit: "AU" }],
            conditions: conditions(2)
        },

        // --- 2025 EVENTS (Expanded) ---
        {
            id: 202500,
            title: "Jupiter at Opposition",
            date: "2025-01-20",
            type: 'planet',
            visibility: "Global",
            description: "Jupiter is at its closest and brightest for the year. Cloud bands and 4 moons visible with binoculars.",
            viewingQuality: "Superior",
            magnitude: "-2.6",
            coordinates: { ra: "06h 45m", dec: "+23° 10'" },
            bestViewing: { city: "Global", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 0, lng: 0 }, radius: 180, color: 'rgba(255, 200, 100, 0.3)' },
            telemetry: [{ label: "Diameter", value: "48", unit: "deg" }, { label: "Distance", value: "4.2", unit: "AU" }],
            conditions: conditions(5) // Urban viewing possible
        },
        {
            id: 202501,
            title: "Total Lunar Eclipse",
            date: "2025-03-14",
            type: 'lunar',
            visibility: "Americas, Europe",
            description: "The 'Blood Moon'. Total eclipse visible from North America and parts of Europe.",
            viewingQuality: "Good",
            magnitude: "1.2",
            coordinates: { ra: "11h 55m", dec: "+01° 30'" },
            bestViewing: { city: "New York, NY", coordinates: { lat: 40.7, lng: -74.0 } },
            coverage: { shape: 'ring', center: { lat: 40.7, lng: -74.0 }, radius: 180, color: 'rgba(255, 100, 100, 0.4)' },
            telemetry: [{ label: "Duration", value: "1h 05m", unit: "" }, { label: "Gamma", value: "0.4", unit: "" }],
            conditions: conditions(6)
        },
        {
            id: 202502,
            title: "Saturn Ring Plane Crossing",
            date: "2025-03-23",
            type: 'planet',
            visibility: "Global",
            description: "Saturn's rings appear edge-on to Earth, making them almost invisible for a brief period.",
            viewingQuality: "Rare",
            magnitude: "0.8",
            coordinates: { ra: "23h 30m", dec: "-06° 00'" },
            bestViewing: { city: "Global", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 0, lng: 0 }, radius: 180, color: 'rgba(255, 220, 100, 0.3)' },
            telemetry: [{ label: "Ring Tilt", value: "0.02", unit: "deg" }, { label: "Distance", value: "9.5", unit: "AU" }],
            conditions: conditions(3)
        },
        {
            id: 202503,
            title: "Lyrids Meteor Shower",
            date: "2025-04-22",
            type: 'meteor',
            visibility: "Northern Hemisphere",
            description: "Average shower producing about 20 meteors per hour. Some fireballs possible.",
            viewingQuality: "Variable",
            magnitude: "2.1",
            coordinates: { ra: "18h 04m", dec: "+34° 00'" },
            bestViewing: { city: "Dark Sky Park", coordinates: { lat: 35.0, lng: -110.0 } },
            coverage: { shape: 'ring', center: { lat: 40, lng: 0 }, radius: 90, color: 'rgba(0, 255, 255, 0.4)' },
            telemetry: [{ label: "ZHR", value: "18", unit: "m/h" }, { label: "Moon", value: "35", unit: "%" }],
            conditions: conditions(2)
        },
        {
            id: 202504,
            title: "Venus-Jupiter Conjunction",
            date: "2025-08-12",
            type: 'conjunction',
            visibility: "Global",
            description: "The two brightest planets pass within 0.4 degrees of each other in the morning sky.",
            viewingQuality: "Spectacular",
            coordinates: { ra: "08h 30m", dec: "+14° 00'" },
            bestViewing: { city: "Eastern Horizon", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 0, lng: 0 }, radius: 180, color: 'rgba(255, 255, 200, 0.5)' },
            telemetry: [{ label: "Separation", value: "0.4", unit: "deg" }, { label: "Mag", value: "-4.0", unit: "" }],
            conditions: conditions(5)
        },
        {
            id: 202505,
            title: "Orionids Meteor Shower",
            date: "2025-10-21",
            type: 'meteor',
            visibility: "Global",
            description: "Fast meteors from the debris of Halley's Comet. Peaks at ~20 meteors/hour.",
            viewingQuality: "Good",
            magnitude: "2.0",
            coordinates: { ra: "06h 20m", dec: "+16° 00'" },
            bestViewing: { city: "Global", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 0, lng: 0 }, radius: 100, color: 'rgba(100, 100, 255, 0.4)' },
            telemetry: [{ label: "ZHR", value: "20", unit: "m/h" }, { label: "Velocity", value: "66", unit: "km/s" }],
            conditions: conditions(2)
        },

        // --- FUTURE (2026+) ---
        {
            id: 202601,
            title: "High Arctic Solar Eclipse",
            date: "2026-08-12",
            type: 'eclipse',
            visibility: "Europe, Arctic",
            description: "Total solar eclipse visible from Greenland, Iceland, and Northern Spain.",
            viewingQuality: "Perfect",
            coordinates: { ra: "09h 35m", dec: "+15° 00'" },
            bestViewing: { city: "Reykjavik, Iceland", coordinates: { lat: 64.1, lng: -21.9 } },
            coverage: { shape: 'ring', center: { lat: 64.1, lng: -21.9 }, radius: 40, color: 'rgba(255, 140, 0, 0.6)' },
            telemetry: [{ label: "Totality", value: "2m 18s", unit: "" }, { label: "Obscuration", value: "100", unit: "%" }],
            conditions: conditions(3)
        },

        // --- DISTANT FUTURE ANCHOR ---
        {
            id: 206101,
            title: "Halley's Comet Return",
            date: "2061-07-28",
            type: 'comet',
            visibility: "Global",
            description: "The legitimate return of 1P/Halley. The most famous comet in history.",
            viewingQuality: "Projected",
            magnitude: "-0.3",
            coordinates: { ra: "05h 50m", dec: "+15° 00'" },
            bestViewing: { city: "Future", coordinates: { lat: 0, lng: 0 } },
            coverage: { shape: 'ring', center: { lat: 0, lng: 0 }, radius: 100, color: 'rgba(100, 200, 255, 0.4)' },
            telemetry: [{ label: "Period", value: "75.3", unit: "years" }, { label: "Perihelion", value: "0.59", unit: "AU" }],
            conditions: conditions(1) // Assuming pristine future skies!
        }
    ];
};
