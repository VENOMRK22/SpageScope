// Types
export interface SkyEvent {
    id: number;
    title: string;
    date: string;
    type: 'meteor' | 'eclipse' | 'conjunction' | 'comet';
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

/* 
   REAL API INTEGRATION STRATEGY (ADAPTER PATTERN)
   -----------------------------------------------
   When we switch to Real APIs, we map raw data to 'coverage' schema:
   
   1. METEOR SHOWERS (e.g., Perseids)
      - API Input: Radiant Declination.
      - Transformation: 
        If Dec > 0 (North), Center = { lat: 90, lng: 0 }, Radius = 90.
        If Dec < 0 (South), Center = { lat: -90, lng: 0 }, Radius = 90.
        This covers the matching hemisphere.
        "Best Viewing" is calculated separately based on User Location or Dark Sky DB.

   2. LOCAL EVENTS (Eclipses)
      - Center = Greatest Eclipse Point.
      - Radius = Max Visibility Range.
*/

export interface SolarData {
    flrID: string;
    beginTime: string;
    peakTime: string;
    classType: string;
    sourceLocation: string;
    note: string;
    imageUrl?: string;
}

export interface Launch {
    id: string;
    name: string;
    status: { name: string; abbrev: string };
    net: string; // No Earlier Than date
    launch_service_provider: { name: string };
    rocket: { configuration: { name: string; image_url: string | null } };
    pad: { name: string; location: { name: string } };
    mission: { description: string } | null;
}

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
            // DECOUPLED: Center is North Pole for true "Hemisphere" coverage
            center: { lat: 90, lng: 0 },
            radius: 80, // Covers down to Lat 10
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
            // SYNCED: For narrow events, Center = Viewing
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
            // DECOUPLED: South Pole Center
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
    }
];

// Named Exports
export const fetchSkyEvents = async (): Promise<SkyEvent[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_EVENTS;
};

export const fetchSolarData = async (): Promise<SolarData | null> => {
    try {
        return {
            flrID: "FLR-2025-001",
            beginTime: new Date().toISOString(),
            peakTime: new Date(Date.now() + 3600000).toISOString(),
            classType: "M1.2",
            sourceLocation: "N15E20",
            note: "Moderate solar flare detected.",
            imageUrl: "https://svs.gsfc.nasa.gov/vis/a010000/a011300/a011353/SDO_Year5_304.jpg"
        };
    } catch (error) {
        console.error("Error in mock solar fetch", error);
        return null;
    }
};

export const fetchLaunches = async (): Promise<Launch[]> => {
    try {
        return [
            {
                id: "1",
                name: "Starship Flight 7",
                status: { name: "Go for Launch", abbrev: "Go" },
                net: "2025-03-15T12:00:00Z",
                launch_service_provider: { name: "SpaceX" },
                rocket: { configuration: { name: "Starship", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Starship_S24_on_OLM_2023.jpg/800px-Starship_S24_on_OLM_2023.jpg" } },
                pad: { name: "Orbital Launch Mount A", location: { name: "Starbase, TX" } },
                mission: { description: "Orbital test flight of Starship launch vehicle." }
            }
        ];
    } catch (error) {
        console.error("Error in mock launch fetch", error);
        return [];
    }
};
