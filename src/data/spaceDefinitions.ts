export interface SpaceTerm {
    label: string;
    simple: string;
    detail?: string;
}

export const SPACE_METRICS: Record<string, SpaceTerm> = {
    // Basic Clarity
    visibility: {
        label: "Visibility",
        simple: "How easy it is to see with your naked eye.",
    },
    quality: {
        label: "Viewing Quality",
        simple: "Overall rating of the current observation conditions."
    },

    // Positioning Data
    ra: {
        label: "Right Ascension (RA)",
        simple: "Longitude in the sky. Keeps the object's E/W position fixed among stars."
    },
    dec: {
        label: "Declination (Dec)",
        simple: "Latitude in the sky. How far North (+) or South (-) from the celestial equator."
    },
    azimuth: {
        label: "Azimuth",
        simple: "Compass direction. 0° is North, 90° East, 180° South, 270° West."
    },
    elevation: {
        label: "Elevation (Alt)",
        simple: "Height above the horizon. 0° is horizon, 90° is directly overhead (Zenith)."
    },

    // Physical Properties
    magnitude: {
        label: "Magnitude",
        simple: "Brightness scale. Lower numbers = Brighter! (Sun is -26, faint star is +6)."
    },
    phase: {
        label: "Illumination Phase",
        simple: "Percentage of the object's face lit by the Sun as seen from Earth."
    },
    distance: {
        label: "Distance",
        simple: "How far away the object is from Earth right now."
    },
    size: {
        label: "Angular Size",
        simple: "How big it appears in the sky (measured in degrees or arcseconds)."
    },

    // Event Specific - Meteor
    peak_time: {
        label: "Peak Time",
        simple: "The specific moment when the event is at its maximum intensity."
    },
    "zenith hourly rate": {
        label: "Zenithal Hourly Rate (ZHR)",
        simple: "Estimated number of meteors per hour under perfect conditions."
    },
    velocity: {
        label: "Velocity",
        simple: "Speed at which the object/meteor enters the atmosphere."
    },
    "radiant altitude": {
        label: "Radiant Altitude",
        simple: "How high the meteor shower's origin point is in the sky."
    },
    "abs magnitude": {
        label: "Absolute Magnitude",
        simple: "Intrinsic brightness if the object were 10 parsecs away (Standard scientific measure)."
    },

    // Event Specific - Eclipse
    "eclipse magnitude": {
        label: "Eclipse Magnitude",
        simple: "Fraction of the Sun's diameter covered by the Moon."
    },
    obscuration: {
        label: "Obscuration",
        simple: "Percentage of the Sun's area covered by the Moon."
    },
    gamma: {
        label: "Gamma",
        simple: "How centrally the shadow strikes Earth (0 = Dead Center)."
    },
    "totality duration": {
        label: "Totality Duration",
        simple: "How long the sun is completely covered."
    },
    "path width": {
        label: "Path Width",
        simple: "Width of the moon's shadow on Earth."
    },

    // Event Specific - Conjunction
    "angular sep": {
        label: "Angular Separation",
        simple: "The apparent distance between two objects in the sky (in degrees)."
    },
    elongation: {
        label: "Elongation",
        simple: "Angle between the Sun and the planet."
    },
    "phase angle": {
        label: "Phase Angle",
        simple: "Angle between light source and observer (100% = Full Phase)."
    },

    // Event Specific - Comet
    "total mag (m1)": {
        label: "Total Magnitude (M1)",
        simple: "Integrated brightness of the comet's entire coma."
    },
    "deg. condensation": {
        label: "Deg. of Condensation",
        simple: "How concentrated the comet's core looks (0=Diffuse, 9=Star-like)."
    },
    "coma diameter": {
        label: "Coma Diameter",
        simple: "Width of the glowing gas cloud around the nucleus."
    },
    "tail length": {
        label: "Tail Length",
        simple: "Projected length of the comet's tail in the sky."
    },
    afrho: {
        label: "AfRho",
        simple: "Proxy for dust production rate (cm)."
    },


    // Local Conditions
    seeing: {
        label: "Atmospheric Seeing",
        simple: "Blurriness caused by turbulence. Lower arc-seconds is better!"
    },
    "sky brightness": {
        label: "Sky Brightness",
        simple: "Darkness of the background sky (Higher mag/arcsec² is darker/better)."
    },
    "bortle class": {
        label: "Bortle Scale",
        simple: "Light pollution level. Class 1 is Excellent Dark Sky, Class 9 is City Center."
    },
    "limiting mag": {
        label: "Limiting Magnitude",
        simple: "Faintest star visible to the naked eye at this location."
    },

    // Event Specific - Aliases & New Telemetry
    zhr: {
        label: "Zenithal Hourly Rate",
        simple: "Estimated number of meteors you can see per hour under perfect, dark skies."
    },
    separation: {
        label: "Angular Separation",
        simple: "The apparent visual distance between two objects in the sky."
    },
    "ring tilt": {
        label: "Ring Tilt",
        simple: "The angle of Saturn's rings as seen from Earth (0° = Invisible/Edge-on)."
    },
    totality: {
        label: "Totality Duration",
        simple: "High-value window where the Sun is completely covered by the Moon."
    },
    perihelion: {
        label: "Perihelion Distance",
        simple: "The point in an orbit closest to the Sun (in Astronomical Units)."
    },
    "kp index": {
        label: "Planetary K-index",
        simple: "Global geomagnetic storm index (0-9). 5+ is a storm, 9 is extreme."
    },
    "dst index": {
        label: "Dst Index",
        simple: "Disturbance Storm Time. Negative numbers mean stronger magnetic storms."
    }
};
