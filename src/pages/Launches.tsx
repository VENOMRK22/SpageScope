import { useContext, useState, useEffect, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Activity, CheckCircle, XCircle, Clock, AlertTriangle, Menu, BarChart3, ArrowLeft, Wind, Gauge, Satellite, Globe2, Layers, Cpu } from 'lucide-react';
import clsx from 'clsx';
import { useOutletContext, useLocation } from 'react-router-dom';
import { EventGlobe } from '../components/EventGlobe';
// import { MetricTooltip } from '../components/MetricTooltip';
import type { SkyEvent } from '../services/spaceData';

// --- Adapter for EventGlobe ---
const launchToEventStub = (launch: any): SkyEvent => ({
    id: launch.id,
    title: launch.name,
    date: launch.net,
    type: 'terrestrial',
    visibility: 'High',
    description: launch.mission?.description || "No mission briefing available for this launch.",
    coverage: {
        shape: 'ring',
        center: { lat: parseFloat(launch.pad.latitude || "28.5"), lng: parseFloat(launch.pad.longitude || "-80.6") },
        radius: 1,
        color: 'rgba(59, 130, 246, 0.8)'
    },
    bestViewing: {
        city: launch.pad.location.name.split(',')[0],
        coordinates: { lat: parseFloat(launch.pad.latitude || "28.5"), lng: parseFloat(launch.pad.longitude || "-80.6") }
    }
} as any);

// --- Helpers ---
const calculateTimeLeft = (targetDate: string) => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }
    return timeLeft;
};

// --- REALISTIC DATA GENERATOR ---
// Generates consistent "physics" data based on string hash of the ID
// This ensures the same launch always has the same "random" velocity/altitude layout
const generateTelemetry = (launch: any) => {
    const seed = launch.id.charCodeAt(0) + launch.id.charCodeAt(launch.id.length - 1);

    // Orbit Type Heuristics
    const orbitName = launch.mission?.orbit?.name || "Low Earth Orbit";
    const isGeo = orbitName.includes("Geostationary") || orbitName.includes("GTO");

    // Velocity (LEO ~27000km/h, GTO needs more energy but visually standard velocity at burn)
    const baseVelocity = 27000;
    const velocity = baseVelocity + (seed * 10);

    // Altitude (LEO 400km, GEO 35000km)
    const altitude = isGeo ? 35786 : 400 + (seed % 200);

    // Inclination (Based on latitude usually, but randomize slightly)
    const lat = parseFloat(launch.pad.latitude) || 28.5;
    const inclination = Math.max(lat, lat + (seed % 10));

    // Stages
    const stages = (seed % 2) + 2; // 2 or 3 stages

    return {
        velocity: velocity.toLocaleString(),
        altitude: altitude.toLocaleString(),
        inclination: inclination.toFixed(2),
        stages: stages,
        efficiency: (95 + (seed % 5)).toFixed(1), // 95-99%
        payloadMass: (seed * 50).toLocaleString(), // Mock payload kg
        burnTime: 120 + (seed % 100) // Seconds
    };
};

// --- Components ---

// 1. Dashboard Countdown
const DashboardCountdown = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft(targetDate)), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeUnit = ({ vals, label }: { vals: number, label: string }) => (
        <div className="flex flex-col items-center mx-2 md:mx-4">
            <span className="text-3xl md:text-5xl font-bold font-orbitron text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {vals.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] md:text-[10px] font-mono text-cyan-300/60 uppercase mt-1 tracking-widest">{label}</span>
        </div>
    );

    return (
        <div className="inline-flex flex-col items-center mt-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-2xl blur-xl opacity-75" />
                <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-8 py-6 flex items-center justify-center space-x-2 md:space-x-4">
                    <TimeUnit vals={timeLeft.days} label="Days" />
                    <span className="text-xl md:text-3xl text-cyan-500/20 font-thin -mt-4">:</span>
                    <TimeUnit vals={timeLeft.hours} label="Hours" />
                    <span className="text-xl md:text-3xl text-cyan-500/20 font-thin -mt-4">:</span>
                    <TimeUnit vals={timeLeft.minutes} label="Mins" />
                    <span className="text-xl md:text-3xl text-cyan-500/20 font-thin -mt-4">:</span>
                    <TimeUnit vals={timeLeft.seconds} label="Secs" />
                </div>
            </div>
            <div className="mt-3 flex items-center space-x-2 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em]">T-Minus to Liftoff</span>
            </div>
        </div>
    );
};

// 2. Detail View Countdown (Simpler)
const DetailCountdown = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft(targetDate)), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeUnit = ({ vals, label }: { vals: number, label: string }) => (
        <div className="flex flex-col items-center mx-1">
            <span className="text-xl font-bold font-orbitron text-white">{vals.toString().padStart(2, '0')}</span>
            <span className="text-[7px] font-mono text-cyan-500/60 uppercase tracking-widest">{label}</span>
        </div>
    );

    return (
        <div className="flex justify-center items-center py-2 bg-black/40 rounded-lg border border-white/10 mt-4">
            <TimeUnit vals={timeLeft.days} label="D" />
            <span className="text-sm text-gray-500 mx-1">:</span>
            <TimeUnit vals={timeLeft.hours} label="H" />
            <span className="text-sm text-gray-500 mx-1">:</span>
            <TimeUnit vals={timeLeft.minutes} label="M" />
            <span className="text-sm text-gray-500 mx-1">:</span>
            <TimeUnit vals={timeLeft.seconds} label="S" />
        </div>
    );
};

// --- VIEW 1: DASHBOARD (Hero + Lists) ---
const LaunchDashboard = ({ launches, onSelect }: { launches: any[], onSelect: (id: string) => void }) => {
    // Partition Data
    const now = new Date();
    const futureLaunches = launches.filter((l: any) => new Date(l.net) > now).sort((a: any, b: any) => new Date(a.net).getTime() - new Date(b.net).getTime());
    const pastMissions = launches.filter((l: any) => new Date(l.net) <= now).sort((a: any, b: any) => new Date(b.net).getTime() - new Date(a.net).getTime());

    const nextMission = futureLaunches.length > 0 ? futureLaunches[0] : null;
    const upcomingManifest = futureLaunches.length > 0 ? futureLaunches.slice(1) : [];

    const DashboardCard = ({ mission, isHero = false }: { mission: any, isHero?: boolean }) => {
        const statusConfig: any = {
            Success: { color: "text-emerald-400", border: "border-emerald-500/30" },
            Failure: { color: "text-red-400", border: "border-red-500/30" },
            Scheduled: { color: "text-blue-400", border: "border-blue-500/30" },
            Go: { color: "text-emerald-400", border: "border-emerald-500/30" },
            TBD: { color: "text-gray-400", border: "border-gray-500/30" }
        };
        const statusKey = Object.keys(statusConfig).find(k => mission.status.name.includes(k)) || 'TBD';
        const style = statusConfig[statusKey];

        if (isHero) {
            return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full overflow-hidden mb-12 cursor-pointer group" onClick={() => onSelect(mission.id)}>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 group-hover:border-blue-500/50 transition-colors">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Next Mission Status: GO</h2>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold font-orbitron text-white tracking-wide uppercase group-hover:text-blue-200 transition-colors">
                                {mission.name}
                            </h1>
                        </div>
                    </div>
                    <DashboardCountdown targetDate={mission.net} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        {/* Summary Stats */}
                        {[
                            { label: "Configuration", val: new Date(mission.net).toLocaleDateString(), sub: new Date(mission.net).toLocaleTimeString() },
                            { label: "Provider", val: mission.launch_service_provider.name, sub: mission.launch_service_provider.type || "Commercial" },
                            { label: "Complex", val: mission.pad.location.name, sub: mission.pad.name }
                        ].map((item, i) => (
                            <div key={i} className="border-l border-white/20 pl-4">
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">{item.label}</div>
                                <div className="text-lg font-orbitron text-white leading-tight">{item.val}</div>
                                <div className="text-sm font-mono text-gray-400 mt-1">{item.sub}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => onSelect(mission.id)}
                className="group relative border-b border-white/5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-200 group-hover:text-blue-400 transition-colors font-orbitron tracking-wide">{mission.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs font-mono text-gray-500">
                            <span>{new Date(mission.net).toLocaleDateString()}</span>
                            <span className="text-gray-700">|</span>
                            <span>{mission.launch_service_provider.name}</span>
                        </div>
                    </div>
                    <div className="text-right hidden md:block w-1/3">
                        <div className="text-xs text-gray-400 font-mono leading-tight">{mission.pad.location.name}</div>
                    </div>
                    <div className={clsx("text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border w-fit", style.color, style.border)}>
                        {statusKey}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="relative h-full w-full overflow-y-auto">
            {/* BACKGROUND IMAGE - Full Coverage */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img src="/launch_hero.png" alt="Launch Pad" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
            </div>

            <div className="relative z-30 p-8 max-w-7xl mx-auto pb-32">
                <div className="mb-16 border-b border-white/10 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-xs font-bold font-mono text-blue-400 tracking-[0.3em] mb-2">MISSION CONTROL // LIVE FEED</h1>
                        <p className="text-3xl font-orbitron text-white font-bold">GLOBAL LAUNCH MANIFEST</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-mono text-gray-500">SYSTEM TIME (UTC)</div>
                        <div className="text-lg font-mono text-white">{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>

                {nextMission && <DashboardCard mission={nextMission} isHero />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="h-px bg-blue-500/50 flex-1" />
                            <h2 className="text-sm font-bold font-orbitron text-blue-400 tracking-widest whitespace-nowrap">UPCOMING SEQUENCES</h2>
                            <div className="h-px bg-blue-500/50 flex-1" />
                        </div>
                        <div className="space-y-0">
                            {upcomingManifest.map((mission: any) => <DashboardCard key={mission.id} mission={mission} />)}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="h-px bg-gray-700 flex-1" />
                            <h2 className="text-sm font-bold font-orbitron text-gray-500 tracking-widest whitespace-nowrap">MISSION LOGS</h2>
                            <div className="h-px bg-gray-700 flex-1" />
                        </div>
                        <div className="space-y-0 opacity-60 hover:opacity-100 transition-opacity duration-500">
                            {pastMissions.map((mission: any) => <DashboardCard key={mission.id} mission={mission} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- VIEW 2: DETAIL CONTROL CENTER (New Data-Rich Layout) ---
const LaunchControlCenter = ({ launches, activeId, onBack }: { launches: any[], activeId: string, setActiveId: (id: string) => void, onBack: () => void }) => {
    const selectedLaunch = launches.find((l: any) => l.id === activeId) || launches[0];
    const isUpcoming = new Date(selectedLaunch.net) > new Date();

    const statusConfig: any = {
        Success: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle },
        Failure: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle },
        Scheduled: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Clock },
        Go: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle },
        TBD: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/30", icon: AlertTriangle }
    };
    const statusKey = Object.keys(statusConfig).find(k => selectedLaunch.status.name.includes(k)) || 'TBD';
    const StatusStyle = statusConfig[statusKey];
    const StatusIcon = StatusStyle.icon;

    // Generate enhanced data
    const telemetry = useMemo(() => generateTelemetry(selectedLaunch), [selectedLaunch.id]);

    return (
        <div className="flex-1 flex overflow-hidden bg-[#08090C]">
            {/* COL 1: MISSION INTEL (Wider, replaced list) 30% */}
            <div className="w-[30%] bg-[#08090C] border-r border-white/10 flex flex-col shrink-0 relative z-20 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
                {/* HEADER with BACK BUTTON */}
                <div className="p-4 border-b border-white/10 bg-[#0B0C10] flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-blue-500/20 text-gray-400 hover:text-white transition-all border border-white/10 hover:border-blue-500/50 group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Command Link</div>
                            <div className="text-sm font-bold text-white font-orbitron tracking-wide">MISSION INTEL</div>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-8 no-scrollbar bg-gradient-to-b from-[#08090C] to-[#050505]">
                    {/* Title Block */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <div className={clsx("px-2 py-0.5 rounded text-[9px] font-bold border flex items-center space-x-1 w-fit", StatusStyle.bg, StatusStyle.border, StatusStyle.color)}>
                                <StatusIcon size={10} />
                                <span>{statusKey.toUpperCase()}</span>
                            </div>
                            <div className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                FAMILY: {selectedLaunch.rocket.configuration.family || 'UNKNOWN'}
                            </div>
                        </div>
                        <h1 className="text-3xl font-orbitron font-bold text-white leading-tight drop-shadow-lg">
                            {selectedLaunch.name}
                        </h1>
                        <div className="flex items-center space-x-2 mt-2 text-xs font-mono text-gray-400">
                            <Calendar size={12} className="text-blue-500" />
                            <span>{new Date(selectedLaunch.net).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-sm text-gray-300 leading-7 font-sans">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest flex items-center gap-2">
                            <Activity size={12} className="text-blue-500" /> Mission Objective
                        </div>
                        <p className="bg-white/5 p-4 rounded-lg border border-white/5 border-l-2 border-l-blue-500/50">
                            {selectedLaunch.mission?.description || "Classified mission profile. No public briefing data available."}
                        </p>
                    </div>

                    {/* Orbit & Window */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0f1014] p-4 rounded border border-white/5">
                            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Target Orbit</div>
                            <div className="text-white font-mono font-bold flex items-center gap-2">
                                <Satellite size={14} className="text-purple-400" />
                                {selectedLaunch.mission?.orbit?.name || "LEO (Projected)"}
                            </div>
                        </div>
                        <div className="bg-[#0f1014] p-4 rounded border border-white/5">
                            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Launch Window</div>
                            <div className="text-white font-mono font-bold flex items-center gap-2">
                                <Clock size={14} className="text-emerald-400" />
                                {selectedLaunch.window_start ? new Date(selectedLaunch.window_start).toLocaleTimeString() : 'INSTANTANEOUS'}
                            </div>
                        </div>
                    </div>

                    {/* Agency Info */}
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Launch Authority</div>
                        <div className="flex items-center space-x-4 bg-white/5 p-4 rounded border border-white/5">
                            {/* Placeholder for Logo if available */}
                            <div className="flex-1">
                                <div className="text-lg font-orbitron text-white">{selectedLaunch.launch_service_provider.name}</div>
                                <div className="text-xs font-mono text-blue-400 mt-1">{selectedLaunch.launch_service_provider.type || 'Commercial Provider'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: GLOBE (Larger 45%) */}
            <div className="w-[45%] relative flex flex-col min-w-0 bg-black/40 border-r border-white/10">
                <div className="absolute inset-0 z-0 opacity-80">
                    <EventGlobe key={selectedLaunch.id} event={launchToEventStub(selectedLaunch)} />
                </div>

                {/* Top Overlay just showing Pad Name */}
                <div className="absolute top-4 left-0 right-0 text-center z-20 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-mono text-gray-300">
                        <MapPin size={10} className="inline mr-1 text-red-500" />
                        {selectedLaunch.pad.name}
                    </span>
                </div>

                {/* Bottom Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* COL 3: ANALYTICS (Narrower 25%) */}
            <div className="w-[25%] h-full bg-[#08090C] flex flex-col shrink-0 relative z-20 shadow-[-5px_0_20px_rgba(0,0,0,0.5)]">
                <div className="p-4 border-b border-white/10 bg-[#0B0C10]">
                    <div className="flex items-center space-x-2 text-neon-cyan mb-1">
                        <BarChart3 size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Flight Diagnostics</span>
                    </div>
                    <div className="text-[10px] text-gray-500">REAL-TIME TELEMETRY & PREDICTIONS</div>
                </div>

                <div className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto no-scrollbar">

                    {isUpcoming && <DetailCountdown targetDate={selectedLaunch.net} />}

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Velocity */}
                        <div className="bg-white/5 p-4 rounded border border-white/5 hover:border-blue-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <Gauge size={16} className="text-blue-400 group-hover:text-white transition-colors" />
                                <span className="text-[9px] font-mono text-gray-500">TARGET VELOCITY</span>
                            </div>
                            <div className="text-2xl font-orbitron text-white">{telemetry.velocity}</div>
                            <div className="text-[10px] text-gray-500 mt-1">KM/H @ BURNOUT</div>
                        </div>
                        {/* Altitude */}
                        <div className="bg-white/5 p-4 rounded border border-white/5 hover:border-blue-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <Layers size={16} className="text-purple-400 group-hover:text-white transition-colors" />
                                <span className="text-[9px] font-mono text-gray-500">APOGEE</span>
                            </div>
                            <div className="text-2xl font-orbitron text-white">{telemetry.altitude}</div>
                            <div className="text-[10px] text-gray-500 mt-1">KM (PROJECTED)</div>
                        </div>
                        {/* Payload */}
                        <div className="bg-white/5 p-4 rounded border border-white/5 hover:border-blue-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <Wind size={16} className="text-emerald-400 group-hover:text-white transition-colors" />
                                <span className="text-[9px] font-mono text-gray-500">PAYLOAD ESTIMATE</span>
                            </div>
                            <div className="text-2xl font-orbitron text-white">{telemetry.payloadMass}</div>
                            <div className="text-[10px] text-gray-500 mt-1">KG MASS</div>
                        </div>
                        {/* Inclination */}
                        <div className="bg-white/5 p-4 rounded border border-white/5 hover:border-blue-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <Globe2 size={16} className="text-amber-400 group-hover:text-white transition-colors" />
                                <span className="text-[9px] font-mono text-gray-500">INCLINATION</span>
                            </div>
                            <div className="text-2xl font-orbitron text-white">{telemetry.inclination}°</div>
                            <div className="text-[10px] text-gray-500 mt-1">ORBITAL PLANE</div>
                        </div>
                    </div>

                    {/* Vehicle Config with Stages */}
                    <div className="bg-white/5 rounded border border-white/5 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-[#0f1014] flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Vehicle Configuration</span>
                            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <Cpu size={10} /> {telemetry.stages} STAGE
                            </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[9px] text-gray-500 uppercase mb-1">Variant</div>
                                <div className="text-lg font-orbitron text-white">{selectedLaunch.rocket.configuration.name}</div>
                            </div>
                            <div>
                                <div className="text-[9px] text-gray-500 uppercase mb-1">System Efficiency</div>
                                <div className="text-lg font-orbitron text-white text-right">{telemetry.efficiency}%</div>
                            </div>
                        </div>
                        {selectedLaunch.rocket.configuration.image_url && (
                            <div className="h-24 w-full bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${selectedLaunch.rocket.configuration.image_url})` }} />
                        )}
                    </div>

                    {/* Launch Complex Coordinates */}
                    <div className="bg-[#0f1014] p-4 rounded border border-white/5 flex justify-between items-center">
                        <div>
                            <div className="text-[9px] text-gray-500 uppercase mb-1">Pad Latitude</div>
                            <div className="font-mono text-blue-300">{parseFloat(selectedLaunch.pad.latitude).toFixed(4)}°</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-right">
                            <div className="text-[9px] text-gray-500 uppercase mb-1">Pad Longitude</div>
                            <div className="font-mono text-blue-300">{parseFloat(selectedLaunch.pad.longitude).toFixed(4)}°</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- MAIN WRAPPER using State Switch ---
export const Launches = () => {
    const { launches, loading } = useContext(DataContext);
    const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);
    const { setSidebarOpen } = useOutletContext<{ setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }>();
    const location = useLocation();

    // Handle Incoming State
    useEffect(() => {
        if (location.state?.launchId) {
            setSelectedLaunchId(location.state.launchId);
            window.history.replaceState({}, document.title); // Clean URL state
        }
    }, [location.state]);

    if (loading || !launches) return (
        <div className="flex h-screen items-center justify-center bg-black">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <div className="font-mono text-blue-500/70 tracking-widest text-xs animate-pulse">ESTABLISHING UPLINK...</div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full">
            {selectedLaunchId ? (
                // MODE 2: DETAIL VIEW
                <LaunchControlCenter
                    launches={launches}
                    activeId={selectedLaunchId}
                    setActiveId={setSelectedLaunchId}
                    onBack={() => setSelectedLaunchId(null)}
                />
            ) : (
                // MODE 1: DASHBOARD VIEW
                <>
                    <div className="absolute top-4 left-4 z-50">
                        <button onClick={() => setSidebarOpen((prev) => !prev)} className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                            <Menu size={20} />
                        </button>
                    </div>
                    <LaunchDashboard launches={launches} onSelect={setSelectedLaunchId} />
                </>
            )}
        </div>
    );
};
