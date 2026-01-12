import { useContext, useState, useRef, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { Sun, Wind, Activity, Radio, Zap, AlertTriangle, RefreshCw, Info, Magnet, X, Volume2, VolumeX, Menu } from 'lucide-react';
import clsx from 'clsx';
import type { SpaceWeather } from '../services/weatherService';
import { AnimatePresence, motion } from 'framer-motion';
import * as Tone from 'tone';
import { useOutletContext } from 'react-router-dom';

// --- FLARE CLASS DATA ---
const FLARE_CLASSES = [
    { id: 'A', power: '10⁻⁸', desc: 'Background levels. Always present during solar minimum.', color: 'text-gray-500', bar: 'bg-gray-700' },
    { id: 'B', power: '10⁻⁷', desc: 'Minor activity. No Earth consequences.', color: 'text-blue-400', bar: 'bg-blue-600' },
    { id: 'C', power: '10⁻⁶', desc: 'Small flares. Minor effect on HF radio near poles.', color: 'text-green-400', bar: 'bg-green-500' },
    { id: 'M', power: '10⁻⁵', desc: 'Medium. Brief radio blackouts. Radiation storms possible.', color: 'text-yellow-400', bar: 'bg-yellow-500' },
    { id: 'X', power: '10⁻⁴', desc: 'Major. Global radio blackouts. Long-lasting storms.', color: 'text-red-500', bar: 'bg-red-600' }
];

// --- Educational Definitions ---
const METRICS = {
    flux: {
        title: "X-Ray Flux",
        desc: "Measurement of solar flare intensity. Higher flux means stronger ionization of Earth's upper atmosphere.",
        impact: "Causes radio blackouts and GPS errors."
    },
    windSpeed: {
        title: "Solar Wind Velocity",
        desc: "Speed of plasma particles ejected from the Sun. Normal is ~300-400 km/s.",
        impact: "High speed (>500 km/s) can trigger geomagnetic storms."
    },
    windDensity: {
        title: "Plasma Density",
        desc: "Concentration of protons in the solar wind stream.",
        impact: "High density increases the pressure on Earth's magnetosphere."
    },
    windTemp: {
        title: "Plasma Temperature",
        desc: "Thermal energy of the solar wind particles.",
        impact: "Correlates with wind speed and source region (Coronal Holes)."
    },
    bt: {
        title: "Total Magnetic Field (Bt)",
        desc: "The total strength of the Interplanetary Magnetic Field (IMF).",
        impact: "Higher Bt allows for stronger coupling with Earth's field during storms."
    },
    bz: {
        title: "Z-Component (Bz)",
        desc: "The north-south direction of the IMF. Southward (Negative) is CRITICAL.",
        impact: "Negative Bz cancels Earth's field, opening a 'hole' for solar energy to pour in (Storm Trigger)."
    },
    kp: {
        title: "Planetary K-index (Kp)",
        desc: "Global geomagnetic storm index ranging from 0 (Quiet) to 9 (Extreme).",
        impact: "Kp >= 5 indicates a storm. Kp >= 7 is severe, causing bright auroras and grid fluctuations."
    },
    aurora: {
        title: "Aurora Probability",
        desc: "Likelihood of visible aurora overhead based on your latitude and current Kp.",
        impact: "Visual spectacle caused by charged particles hitting the atmosphere."
    }
};

// --- Sub-Components ---

// 1. Independent Tooltip Component (Fixed Position)
const HoverTooltip = ({
    activeMetric,
    anchorRect
}: {
    activeMetric: keyof typeof METRICS | null,
    anchorRect: DOMRect | null
}) => {
    if (!activeMetric || !anchorRect) return null;

    const info = METRICS[activeMetric];

    // Calculate Position: Prefer Right, Flip to Left if no space
    const GAP = 10;
    const CARD_WIDTH = 320; // Fixed width w-80 (20rem = 320px)

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    let left = anchorRect.right + GAP;
    let top = anchorRect.top;

    // Horizontal Flip Check
    if (left + CARD_WIDTH > viewWidth - 20) {
        left = anchorRect.left - CARD_WIDTH - GAP;
    }

    // Vertical Flip Check (Simple: push up if bottom overflows)
    // We don't know exact height yet, but we can guess ~200px. 
    // Better strategy: Use bottom alignment if current top is low.
    if (top + 250 > viewHeight) {
        top = viewHeight - 260; // Force it up and keep some padding
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
                position: 'fixed',
                top: top,
                left: left,
                width: CARD_WIDTH,
                zIndex: 99999
            }}
            className="bg-black border border-neon-cyan shadow-[0_0_30px_rgba(0,0,0,0.9)] rounded-xl p-5"
        >
            {/* Header */}
            <h4 className="text-neon-cyan font-bold font-orbitron text-sm mb-3 uppercase tracking-wide border-b border-gray-800 pb-2 flex items-center gap-2">
                <Info size={16} />
                {info.title}
            </h4>

            {/* Description */}
            <p className="text-sm text-gray-200 mb-4 leading-relaxed font-sans">{info.desc}</p>

            {/* Impact Section */}
            <div className="bg-gray-900 border border-red-500/30 rounded-lg p-3">
                <span className="text-[10px] text-red-400 font-bold uppercase block mb-1">Impact Analysis</span>
                <span className="text-xs text-gray-300 leading-tight block">{info.impact}</span>
            </div>
        </motion.div>
    );
};

// 2. Flare Deep Dive Modal
const FlareDeepDive = ({
    active,
    onClose,
    currentClass
}: {
    active: boolean,
    onClose: () => void,
    currentClass: string
}) => {
    if (!active) return null;

    // Parse current class letter (e.g., "M1.2" -> "M")
    const currentLetter = currentClass.charAt(0).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-black border border-orange-500/50 w-full max-w-lg rounded-2xl p-6 shadow-[0_0_50px_rgba(234,88,12,0.2)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold font-orbitron text-white">SOLAR FLARE CLASSIFICATION</h2>
                        <p className="text-xs text-orange-400 font-mono mt-1">LOGARITHMIC POWER SCALE (Watts/m²)</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-400 hover:text-white" />
                    </button>
                </div>

                <div className="space-y-3">
                    {FLARE_CLASSES.map((cls) => {
                        const isCurrent = cls.id === currentLetter;
                        return (
                            <div
                                key={cls.id}
                                className={clsx(
                                    "flex items-center p-3 rounded-lg border transition-all relative overflow-hidden",
                                    isCurrent ? "bg-orange-950/30 border-orange-500" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                                )}
                            >
                                {/* Class Letter */}
                                <div className={clsx("text-2xl font-bold font-orbitron w-12 text-center", cls.color)}>
                                    {cls.id}
                                </div>

                                {/* Info */}
                                <div className="flex-1 px-4">
                                    <div className="flex justify-between text-[10px] font-mono mb-1 text-gray-400">
                                        <span>POWER: {cls.power}</span>
                                        {isCurrent && <span className="text-orange-400 font-bold animate-pulse">&gt;&gt;&gt; CURRENT STATUS</span>}
                                    </div>
                                    <p className="text-xs text-gray-200 leading-tight">{cls.desc}</p>
                                </div>

                                {/* Active Glow */}
                                {isCurrent && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-scan" style={{ animationDuration: '3s' }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-3">
                    <Info size={16} className="text-orange-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                        Solar flares are giant explosions on the sun that send energy, light and high speed particles into space. These flares are often associated with solar magnetic storms known as Coronal Mass Ejections (CMEs).
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatCard = ({ label, value, unit, icon: Icon, color = "text-white", subtext = "", metricKey, onHover }: any) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (metricKey && onHover && cardRef.current) {
            onHover(metricKey, cardRef.current.getBoundingClientRect());
        }
    };

    const handleMouseLeave = () => {
        if (onHover) {
            onHover(null, null);
        }
    };

    return (
        <div
            ref={cardRef}
            className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between h-full relative overflow-hidden group/card hover:bg-white/5 transition-colors cursor-help"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex justify-between items-start mb-2 z-10">
                <h3 className="text-[10px] font-bold text-gray-400 font-orbitron tracking-widest uppercase flex items-center gap-1">
                    {label}
                    {metricKey && <Info size={10} className="text-gray-600 group-hover/card:text-neon-cyan transition-colors" />}
                </h3>
                <Icon size={16} className={clsx(color, "opacity-70 group-hover/card:opacity-100 transition-opacity")} />
            </div>

            <div className="z-10">
                <div className="flex items-baseline space-x-1">
                    <span className={clsx("text-2xl font-bold font-orbitron", color)}>{value}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{unit}</span>
                </div>
                {subtext && <div className="text-[9px] text-gray-400 mt-1 font-mono">{subtext}</div>}
            </div>

            {/* Background Grid Accent */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Icon size={60} />
            </div>
        </div>
    );
};

const SolarWindGauge = ({ wind, onHover }: { wind: SpaceWeather['solar']['wind'], onHover: any }) => {
    return (
        <div className="space-y-3">
            <StatCard
                label="Velocity"
                value={wind.speed.toFixed(0)}
                unit="km/s"
                icon={Wind}
                color={wind.speed > 600 ? "text-red-400" : "text-neon-cyan"}
                subtext={wind.speed > 500 ? "HIGH SPEED STREAM" : "NOMINAL FLOW"}
                metricKey="windSpeed"
                onHover={onHover}
            />
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="Density"
                    value={wind.density.toFixed(1)}
                    unit="p/cm³"
                    icon={Activity}
                    color="text-yellow-400"
                    metricKey="windDensity"
                    onHover={onHover}
                />
                <StatCard
                    label="Thermal"
                    value={(wind.temp / 1000).toFixed(0)}
                    unit="kK"
                    icon={Sun}
                    color="text-orange-400"
                    metricKey="windTemp"
                    onHover={onHover}
                />
            </div>
        </div>
    );
};

const HeaderTicker = ({ alerts }: { alerts: SpaceWeather['alerts'] }) => {
    return (
        <div className="w-full bg-red-900/10 border-y border-red-500/20 overflow-hidden h-6 flex items-center relative mb-6">
            <div className="absolute left-0 bg-red-900/80 text-white px-2 py-0.5 text-[9px] font-bold z-20 flex items-center h-full">
                <AlertTriangle size={10} className="mr-1" /> ALERTS
            </div>

            <div className="flex animate-marquee whitespace-nowrap pl-20 items-center h-full">
                {alerts.length > 0 ? alerts.map((alert, i) => (
                    <span key={i} className="mx-8 text-[10px] font-mono text-red-300">
                        [{alert.type}{alert.level}] {alert.message}
                    </span>
                )) : (
                    <span className="mx-8 text-[10px] font-mono text-green-400/70">
                        NO ACTIVE SPACE WEATHER WARNINGS • SYSTEM NOMINAL •
                    </span>
                )}
            </div>
        </div>
    );
};

const AuroraMap = ({ location, kp }: { location: SpaceWeather['location'], kp: number }) => {
    const mapY = (1 - (location.lat + 90) / 180) * 100;
    const mapX = ((location.coords[1] + 180) / 360) * 100;
    const auroraExtent = Math.max(0, (kp * 5));

    return (
        <div className="relative w-full h-48 bg-[#0a0f1e] rounded-lg overflow-hidden border border-white/10 group mb-4">
            <div className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'invert(1) hue-rotate(180deg)'
                }}
            />
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-green-500/30 to-transparent transition-all duration-1000" style={{ height: `${20 + auroraExtent}% `, filter: 'blur(20px)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-green-500/30 to-transparent transition-all duration-1000" style={{ height: `${20 + auroraExtent}% `, filter: 'blur(20px)' }} />

            {/* User Location Pin */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/pin cursor-help z-20"
                style={{ top: `${mapY}% `, left: `${mapX}% ` }}
            >
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-ping absolute" />
                <div className="w-2 h-2 bg-white rounded-full z-10 shadow-[0_0_10px_white]" />

                {/* TOOLTIP: City Name */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 transition-opacity z-[100] pointer-events-none">
                    <div className="bg-black border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap relative">
                        {location.city}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black" />
                    </div>
                </div>
            </div>

            <div className="absolute top-2 right-2 text-right pointer-events-none">
                <div className="text-[10px] text-gray-400 font-mono">AURORA PROBABILITY</div>
                <div className={clsx("text-xl font-bold font-orbitron", location.auroraProbability > 50 ? "text-green-400" : "text-gray-500")}>
                    {location.auroraProbability.toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

// RELIABLE CSS-Based 3D Sun (No WebGL crashes)
const SunModel3D = ({ textureUrl }: { textureUrl: string }) => {
    return (
        <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center perspective-[800px]">
            {/* Spinning Glow Layer */}
            <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />

            {/* The 3D Sphere */}
            <div className="relative w-32 h-32 rounded-full shadow-[0_0_50px_rgba(255,165,0,0.6)] animate-[spin_60s_linear_infinite]"
                style={{
                    backgroundImage: `url(${textureUrl})`,
                    backgroundSize: '200% 100%', // Wrap texture twice for seamless spin
                    boxShadow: 'inset -10px -10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(234, 88, 12, 0.6)'
                }}
            >
                {/* Pseudo-3D shading overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 via-transparent to-black/60 rounded-full" />
            </div>

            <div className="absolute top-2 left-3 flex items-center space-x-2 pointer-events-none z-10">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white tracking-widest opacity-80">LIVE MODEL // SDO FEED</span>
            </div>
        </div>
    );
};

// --- Main Page ---

export const Weather = () => {
    const context = useContext(DataContext);
    // Tooltip State lifted to Page Level
    const [hoveredMetric, setHoveredMetric] = useState<keyof typeof METRICS | null>(null);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const { setSidebarOpen } = useOutletContext<{ setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }>();

    // Deep Dive State
    const [showFlareModal, setShowFlareModal] = useState(false);

    // --- AUDIO SONIFICATION ENGINE ---
    const [isAudioActive, setIsAudioActive] = useState(false);
    const oscRef = useRef<Tone.Oscillator | null>(null);
    const distortionRef = useRef<Tone.Distortion | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);

    // Deriving storm status for audio texture
    // If context is available, we check if Kp >= 5
    const isStorm = context?.weather?.geomagnetic.kp.current ? context.weather.geomagnetic.kp.current >= 5 : false;
    const windSpeed = context?.weather?.solar.wind.speed || 300;

    const toggleAudio = async () => {
        if (!isAudioActive) {
            // ACTIVATE
            await Tone.start();
            console.log("🔊 COSMIC DJ: Audio Context Started");

            // Create Audio Chain
            // Osc -> Distortion -> Reverb -> Destination
            const reverb = new Tone.Reverb(3).toDestination(); // Large space reverb
            await reverb.generate(); // Pre-calculate impulse

            const dist = new Tone.Distortion(0).connect(reverb);
            const osc = new Tone.Oscillator(200, "sine").connect(dist);

            osc.start();

            // Save Refs
            oscRef.current = osc;
            distortionRef.current = dist;
            reverbRef.current = reverb;

            setIsAudioActive(true);
        } else {
            // DEACTIVATE
            oscRef.current?.stop();
            oscRef.current?.dispose();
            distortionRef.current?.dispose();
            reverbRef.current?.dispose();

            setIsAudioActive(false);
        }
    };

    // Responsive Audio Mapping
    useEffect(() => {
        if (!isAudioActive || !oscRef.current || !distortionRef.current) return;

        // 1. Map Wind Speed (300-800) to Pitch (100-600Hz)
        // Clamp speed between 300 and 800 for normalization
        const clampedSpeed = Math.max(300, Math.min(800, windSpeed));
        const normalizedSpeed = (clampedSpeed - 300) / 500; // 0.0 to 1.0
        const targetFreq = 100 + (normalizedSpeed * 500); // 100Hz to 600Hz

        oscRef.current.frequency.rampTo(targetFreq, 0.5);

        // 2. Map Storm Status to Distortion
        // Peaceful = 0, Storm = 0.4
        const targetDist = isStorm ? 0.4 : 0;
        distortionRef.current.distortion = targetDist;

    }, [windSpeed, isStorm, isAudioActive]);

    // Cleanup on Unmount
    useEffect(() => {
        return () => {
            if (oscRef.current) {
                oscRef.current.stop();
                oscRef.current.dispose();
            }
            distortionRef.current?.dispose();
            reverbRef.current?.dispose();
        };
    }, []);


    const handleHover = (metric: keyof typeof METRICS | null, rect: DOMRect | null) => {
        setHoveredMetric(metric);
        setAnchorRect(rect);
    };

    if (!context) return null;
    const { weather, loading } = context;

    if (loading || !weather) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="flex flex-col items-center space-y-4">
                    <RefreshCw className="animate-spin text-neon-cyan" size={32} />
                    <div className="font-mono text-neon-cyan/70 tracking-widest text-xs">ESTABLISHING HIVE MIND UPLINK...</div>
                </div>
            </div>
        );
    }

    const { solar, geomagnetic, location, alerts } = weather;

    return (
        <div className="h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/40 via-[#050a14] to-black relative flex flex-col overflow-hidden">

            {/* --- FIXED TOP BAR (Standardized) --- */}
            <div className="h-16 border-b border-white/10 bg-[#0B0C10]/80 backdrop-blur flex items-center px-6 justify-between shrink-0 z-40">
                <div className="flex items-center space-x-4">
                    <button onClick={() => setSidebarOpen((prev) => !prev)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10">
                        <Menu size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold font-orbitron text-white tracking-widest flex items-center gap-2">
                            <Sun size={18} className="text-orange-500" /> SOLAR COMMAND
                        </h1>
                        <p className="text-[10px] text-gray-500 font-mono tracking-wider">
                            LOC: {location.city.toUpperCase()} • TELEMETRY LINK: ACTIVE
                        </p>
                    </div>
                </div>
                {/* Audio Toggle (Moved to Header) */}
                <div className="flex items-center">
                    <button
                        onClick={toggleAudio}
                        className={clsx(
                            "flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-300 border text-[10px] font-bold font-mono",
                            isAudioActive ? "bg-purple-900/40 border-purple-500/50 text-purple-300" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
                        )}
                    >
                        {isAudioActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        <span>{isAudioActive ? "AUDIO ON" : "AUDIO OFF"}</span>
                    </button>
                </div>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="flex-1 overflow-y-auto p-6 relative">

                {/* Global Tooltip Portal (Disable if modal open) */}
                <AnimatePresence>
                    {hoveredMetric && anchorRect && !showFlareModal && (
                        <HoverTooltip activeMetric={hoveredMetric} anchorRect={anchorRect} />
                    )}
                </AnimatePresence>

                {/* Flare Deep Dive Modal */}
                <AnimatePresence>
                    {showFlareModal && (
                        <FlareDeepDive
                            active={showFlareModal}
                            onClose={() => setShowFlareModal(false)}
                            currentClass={solar.flares.class}
                        />
                    )}
                </AnimatePresence>

                <HeaderTicker alerts={alerts} />

                <div className="pb-6 max-w-7xl mx-auto">
                    {/* (Title Block Removed - Moved to Header) */}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* SECTION 1: SOLAR EMISSIONS (Source) */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 border-b border-white/10 pb-2 mb-4">
                                <Sun size={16} className="text-orange-400" />
                                <h2 className="text-sm font-bold font-orbitron text-gray-300">I. SOLAR EMISSIONS</h2>
                            </div>

                            <SunModel3D textureUrl={solar.sunspots.image} />

                            {/* Flare Stats - Clickable Container */}
                            <div
                                className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-orange-500/50 transition-colors cursor-pointer"
                                onClick={() => setShowFlareModal(true)}
                            >
                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wide">Click for Analysis</span>
                                </div>

                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase">Current Flare Class</div>
                                        <div className="text-3xl text-white font-orbitron font-bold flex items-baseline">
                                            {solar.flares.class} <span className="text-xs text-gray-500 ml-2 font-mono">X-RAY FLUX</span>
                                        </div>
                                    </div>
                                    <Info size={14} className="text-gray-600 mb-1" />
                                </div>
                                {/* Realistic Flux Monitor Graph */}
                                <div className="h-16 w-full mt-3 relative border-t border-b border-white/5 bg-black/20">
                                    {/* Grid Lines (Log Scale Reference) */}
                                    <div className="absolute top-[20%] w-full h-px bg-red-500/20 pointer-events-none"><span className="absolute -left-1 -top-1.5 text-[6px] text-red-500">M</span></div>
                                    <div className="absolute top-[50%] w-full h-px bg-yellow-500/20 pointer-events-none"><span className="absolute -left-1 -top-1.5 text-[6px] text-yellow-500">C</span></div>
                                    <div className="absolute top-[80%] w-full h-px bg-green-500/20 pointer-events-none"><span className="absolute -left-1 -top-1.5 text-[6px] text-green-500">B</span></div>

                                    {/* SVG Data Visualization */}
                                    <svg className="w-full h-full" preserveAspectRatio="none">
                                        <polyline
                                            points={solar.flares.history.map((pt, i) => {
                                                const x = (i / (solar.flares.history.length - 1)) * 100;
                                                // Log mapping: X-Class (10^-4) is top, A-Class (10^-8) is bottom
                                                // Y = 100 - ((Log10(Flux) + 8) / 4) * 100  (Range -8 to -4 maps to 0-100%)
                                                const logFlux = Math.log10(Math.max(pt.flux, 1e-9));
                                                const y = 100 - ((logFlux + 8) / 4) * 100;
                                                return `${x},${Math.max(0, Math.min(100, y))}`;
                                            }).join(' ')}
                                            fill="none"
                                            stroke="orange"
                                            strokeWidth="1.5"
                                            vectorEffect="non-scaling-stroke"
                                            className="drop-shadow-[0_0_4px_rgba(255,165,0,0.8)]"
                                        />
                                        {/* Gradient Area under curve */}
                                        <defs>
                                            <linearGradient id="fluxGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="orange" stopOpacity="0.4" />
                                                <stop offset="100%" stopColor="orange" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <polygon
                                            points={`0,100 ${solar.flares.history.map((pt, i) => {
                                                const x = (i / (solar.flares.history.length - 1)) * 100;
                                                const logFlux = Math.log10(Math.max(pt.flux, 1e-9));
                                                const y = 100 - ((logFlux + 8) / 4) * 100;
                                                return `${x},${Math.max(0, Math.min(100, y))}`;
                                            }).join(' ')} 100,100`}
                                            fill="url(#fluxGradient)"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: INTERPLANETARY MEDIUM (Transit) */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 border-b border-white/10 pb-2 mb-4">
                                <Wind size={16} className="text-neon-cyan" />
                                <h2 className="text-sm font-bold font-orbitron text-gray-300">II. SOLAR WIND</h2>
                            </div>

                            <SolarWindGauge wind={solar.wind} onHover={handleHover} />

                            {/* Magnetometer */}
                            <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[10px] font-bold text-gray-400 font-orbitron uppercase">IMF Magnetometer</h3>
                                    <Magnet size={14} className="text-gray-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        className="bg-white/5 rounded p-2 text-center relative group hover:bg-white/10 transition-colors cursor-help"
                                        onMouseEnter={(e) => handleHover('bt', e.currentTarget.getBoundingClientRect())}
                                        onMouseLeave={() => handleHover(null, null)}
                                    >
                                        <div className="text-[9px] text-gray-500 mb-1">Total Field (Bt)</div>
                                        <div className="text-lg font-mono font-bold text-white">{geomagnetic.magneticField.bt.toFixed(1)} <span className="text-[9px]">nT</span></div>
                                    </div>
                                    <div
                                        className={clsx("bg-white/5 rounded p-2 text-center border relative group hover:bg-white/10 transition-colors cursor-help", geomagnetic.magneticField.bz < -5 ? "border-red-500/50 bg-red-500/10" : "border-transparent")}
                                        onMouseEnter={(e) => handleHover('bz', e.currentTarget.getBoundingClientRect())}
                                        onMouseLeave={() => handleHover(null, null)}
                                    >
                                        <div className="text-[9px] text-gray-500 mb-1">Z-Component (Bz)</div>
                                        <div className="text-lg font-mono font-bold text-white">{geomagnetic.magneticField.bz.toFixed(1)} <span className="text-[9px]">nT</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: GEOSPACE IMPACT (Earth) */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 border-b border-white/10 pb-2 mb-4">
                                <Zap size={16} className="text-purple-400" />
                                <h2 className="text-sm font-bold font-orbitron text-gray-300">III. GEOSPACE IMPACT</h2>
                            </div>

                            {/* Kp Gauge */}
                            <div
                                className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-md text-center relative group hover:bg-white/5 transition-colors cursor-help"
                                onMouseEnter={(e) => handleHover('kp', e.currentTarget.getBoundingClientRect())}
                                onMouseLeave={() => handleHover(null, null)}
                            >
                                <h3 className="text-[10px] font-bold text-gray-400 font-orbitron mb-2 uppercase flex justify-center gap-1">
                                    K-Index (Storm Level)
                                    <Info size={10} className="text-gray-600" />
                                </h3>
                                <div className={clsx(
                                    "text-5xl font-bold font-orbitron mb-2 transition-colors",
                                    geomagnetic.kp.current >= 5 ? "text-red-500 drop-shadow-[0_0_10px_red]" : "text-green-400"
                                )}>
                                    {geomagnetic.kp.current.toFixed(1)}
                                </div>
                                <div className="flex justify-center space-x-1 h-1.5 mb-2 px-8">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className={clsx(
                                            "w-2 rounded-full",
                                            i < geomagnetic.kp.current ? (i >= 5 ? "bg-red-500" : "bg-green-500") : "bg-gray-800"
                                        )} />
                                    ))}
                                </div>
                                <div className="text-[10px] font-bold text-gray-300 tracking-widest">{geomagnetic.kp.status}</div>
                            </div>

                            <AuroraMap location={location} kp={geomagnetic.kp.current} />

                            {/* Mission Advisory */}
                            <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Radio size={14} className="text-blue-400" />
                                    <h3 className="text-[10px] font-bold text-blue-300 font-orbitron uppercase">Tactical Advisory</h3>
                                </div>
                                <p className="text-[10px] text-gray-300 font-mono leading-relaxed">
                                    {geomagnetic.kp.current >= 5
                                        ? "STORM WARNING: Satellite drag increasing. HF Radio blackout probable. Aurora visible at lower latitudes. Check Bz orientation."
                                        : "CONDITIONS NOMINAL. Solar wind stable. Good conditions for satellite operations."}
                                </p>
                            </div>

                            {/* AUDIO SONIFICATION MODULE (Moved to Header, kept minimal status here if needed or removed) */}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
