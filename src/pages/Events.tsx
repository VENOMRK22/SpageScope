import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { Activity, BarChart3, Radio, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useOutletContext, useLocation } from 'react-router-dom';
import { EventGlobe } from '../components/EventGlobe';
import { MetricTooltip } from '../components/MetricTooltip';
import { SPACE_METRICS } from '../data/spaceDefinitions';

export const Events: React.FC = () => {
    const { events, loading } = useContext(DataContext);
    const [selectedEventId, setSelectedEventId] = useState<number | string | null>(null);
    const { setSidebarOpen } = useOutletContext<{ setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }>();
    const location = useLocation();

    // Handle Incoming State or Query Params
    const queryParams = new URLSearchParams(location.search);
    const queryEventId = queryParams.get('eventId');

    useEffect(() => {
        if (location.state?.eventId) {
            setSelectedEventId(location.state.eventId);
            window.history.replaceState({}, document.title); // Clean URL state
        } else if (queryEventId) {
             const parsedId = parseInt(queryEventId, 10);
             if (!isNaN(parsedId)) {
                 setSelectedEventId(parsedId);
             }
        } else if (!selectedEventId && events.length > 0) {
            setSelectedEventId(events[0].id);
        }
    }, [events, location.state, queryEventId]);

    const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

    if (loading) return null;

    return (
        // Integrated Layout (No longer fixed overlay)
        <div className="w-full h-full bg-[#08090C] text-gray-300 font-sans flex flex-col">

            {/* Top Bar */}
            <div className="h-14 border-b border-white/10 bg-[#0B0C10] flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="mr-4 p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <Radio size={16} className="text-neon-cyan animate-pulse" />
                        <span className="text-xs font-mono font-bold tracking-widest text-white">STAR GAZER NETWORK</span>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                    LIVE FEED • {events.length} EVENTS DETECTED
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">

                {/* --- COL 1: EVENT LIST (280px) --- */}
                <div className="w-[280px] bg-[#08090C] border-r border-white/10 flex flex-col shrink-0">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center space-x-2 text-neon-cyan mb-1">
                            <Activity size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Active Signals</span>
                        </div>
                        <div className="text-[10px] text-gray-500">REAL-TIME MONITORING</div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-4">
                        {/* UPCOMING SECTION */}
                        <div>
                            <div className="px-2 mb-2 text-[10px] font-bold text-neon-cyan/70 uppercase tracking-widest sticky top-0 bg-[#08090C]/90 backdrop-blur z-10 py-1">Upcoming</div>
                            <div className="space-y-1">
                                {events.filter(e => new Date(e.date) >= new Date()).concat(events.filter(e => e.date === 'Indefinite')) // Keep Indefinite in upcoming
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((event) => (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedEventId(event.id)}
                                            className={clsx(
                                                "w-full text-left p-3 rounded border transition-all duration-300 group relative overflow-hidden",
                                                selectedEventId === event.id
                                                    ? "bg-white/5 border-neon-cyan/50 text-white"
                                                    : "bg-transparent border-transparent hover:bg-white/5 text-gray-400"
                                            )}
                                        >
                                            {selectedEventId === event.id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neon-cyan shadow-[0_0_10px_#00f3ff]" />
                                            )}
                                            <div className="text-xs font-bold font-orbitron truncate pr-2 group-hover:text-neon-cyan transition-colors">
                                                {event.title.toUpperCase()}
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] font-mono opacity-70">{new Date(event.date).toLocaleDateString()}</span>
                                                <span className={clsx(
                                                    "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold",
                                                    event.type === 'meteor' ? "bg-purple-500/10 text-purple-400" :
                                                        event.type === 'eclipse' ? "bg-amber-500/10 text-amber-400" :
                                                            event.type === 'conjunction' ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                                                )}>
                                                    {event.type.toUpperCase()}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* PAST SECTION */}
                        <div>
                            <div className="px-2 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest sticky top-0 bg-[#08090C]/90 backdrop-blur z-10 py-1 border-t border-white/5 pt-2">Past Events</div>
                            <div className="space-y-1 opacity-70 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
                                {events.filter(e => new Date(e.date) < new Date() && e.date !== 'Indefinite')
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent past first
                                    .map((event) => (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedEventId(event.id)}
                                            className={clsx(
                                                "w-full text-left p-3 rounded border transition-all duration-300 group relative overflow-hidden",
                                                selectedEventId === event.id
                                                    ? "bg-white/5 border-white/20 text-white"
                                                    : "bg-transparent border-transparent hover:bg-white/5 text-gray-500"
                                            )}
                                        >
                                            {selectedEventId === event.id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/50" />
                                            )}
                                            <div className="text-xs font-bold font-orbitron truncate pr-2 group-hover:text-white transition-colors">
                                                {event.title.toUpperCase()}
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] font-mono opacity-70">{new Date(event.date).toLocaleDateString()}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/5 text-gray-400 border border-white/5">
                                                    ARCHIVED
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- COL 2: MAIN MAP VISUALIZATION (Flexible) --- */}
                <div className="flex-1 relative flex flex-col min-w-0 bg-black/20">
                    <div className="absolute inset-0 z-0">
                        {/* Pass key to force remount on event change for clean transition */}
                        <EventGlobe key={selectedEvent.id} event={selectedEvent} />
                    </div>

                    {/* EVENT HEADER OVERLAY (Restored) */}
                    <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                        <div className="flex justify-between items-start max-w-4xl mx-auto">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-3xl font-bold text-white font-orbitron tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                        {selectedEvent.title.toUpperCase()}
                                    </h2>
                                    <div className={clsx(
                                        "px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-md",
                                        selectedEvent.visibility === 'High' ? "bg-green-500/20 border-green-500/50 text-green-300" :
                                            selectedEvent.visibility === 'Medium' ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" :
                                                "bg-red-500/20 border-red-500/50 text-red-300"
                                    )}>
                                        VISIBILITY: {selectedEvent.visibility.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Overlay for Tactical Feel */}
                    <div className="absolute inset-0 pointer-events-none z-10 opacity-10"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    />
                </div>

                {/* --- COL 3: RIGHT ANALYSIS (450px) --- */}
                <div className="w-[450px] h-full max-h-full bg-[#08090C] border-l border-white/10 flex flex-col shrink-0">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center space-x-2 text-neon-cyan mb-1">
                            <BarChart3 size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Telemetry Analysis</span>
                        </div>
                        <div className="text-[10px] text-gray-500">REAL-TIME EVENT METRICS</div>
                    </div>

                    <div className="flex-1 min-h-0 p-4 space-y-6 overflow-y-auto no-scrollbar">

                        {/* Mission Brief (Moved from Center) */}
                        <div className="text-sm text-gray-300 leading-relaxed border-b border-white/10 pb-4">
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Mission Brief</div>
                            {selectedEvent.description}
                        </div>

                        {/* Dynamic Telemetry Data - 2 Column Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {selectedEvent.telemetry ? (
                                selectedEvent.telemetry.map((stat: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col justify-between">
                                        <MetricTooltip termKey={stat.label.toLowerCase() as keyof typeof SPACE_METRICS} className="w-full">
                                            <span className="text-[10px] text-gray-400 uppercase mb-1 block hover:text-white transition-colors">{stat.label}</span>
                                        </MetricTooltip>
                                        <div className="text-right">
                                            <span className="text-xl font-mono text-white font-light leading-none">{stat.value}</span>
                                            <span className="text-[10px] text-neon-cyan ml-1 block mt-1">{stat.unit}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-xs text-gray-600 italic p-4 text-center border border-dashed border-gray-800 rounded">
                                    NO TELEMETRY DATA AVAILABLE
                                </div>
                            )}
                        </div>

                        {/* Local Conditions Block - 2 Column Grid */}
                        {selectedEvent.conditions && (
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 pt-4 border-t border-white/10">Local Conditions (Simulated)</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center group relative cursor-help">
                                        <MetricTooltip termKey="seeing" className="w-full flex justify-between">
                                            <div className="text-[8px] text-gray-500 uppercase group-hover:text-neon-cyan transition-colors">Seeing</div>
                                            <div className="text-sm font-mono text-white">{selectedEvent.conditions.seeing}</div>
                                        </MetricTooltip>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center group relative cursor-help">
                                        <MetricTooltip termKey="bortle class" className="w-full flex justify-between">
                                            <div className="text-[8px] text-gray-500 uppercase group-hover:text-neon-cyan transition-colors">Bortle</div>
                                            <div className="text-sm font-mono text-white">{selectedEvent.conditions.bortleClass}</div>
                                        </MetricTooltip>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center group relative cursor-help">
                                        <MetricTooltip termKey="sky brightness" className="w-full flex justify-between">
                                            <div className="text-[8px] text-gray-500 uppercase group-hover:text-neon-cyan transition-colors">Sky Bright.</div>
                                            <div className="text-sm font-mono text-white">{selectedEvent.conditions.skyBrightness}</div>
                                        </MetricTooltip>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center group relative cursor-help">
                                        <MetricTooltip termKey="limiting mag" className="w-full flex justify-between">
                                            <div className="text-[8px] text-gray-500 uppercase group-hover:text-neon-cyan transition-colors">Lim. Mag</div>
                                            <div className="text-sm font-mono text-white">{selectedEvent.conditions.limitingMag}</div>
                                        </MetricTooltip>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VISIBILITY METRICS */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-[#0B0C10] border border-white/5 rounded-lg p-3 relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-1">
                                    <MetricTooltip termKey="quality" showIcon>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold font-mono group-hover:text-neon-cyan transition-colors">QUALITY</div>
                                    </MetricTooltip>
                                    <div className="flex space-x-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => {
                                            // Dynamic Score Calculation
                                            const q = (selectedEvent.viewingQuality || "Good").toLowerCase();
                                            const score = q.includes('perfect') || q.includes('excellent') ? 5 :
                                                q.includes('good') ? 4 :
                                                    q.includes('fair') ? 3 :
                                                        q.includes('poor') ? 2 : 1;

                                            return (
                                                <div
                                                    key={s}
                                                    className={clsx(
                                                        "w-1 h-3 rounded-full transition-all duration-300",
                                                        s <= score ? "bg-neon-cyan shadow-[0_0_5px_rgba(0,243,255,0.8)]" : "bg-gray-800"
                                                    )}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-white font-orbitron">{selectedEvent.viewingQuality || "Excellent"}</div>
                                <div className="text-[9px] text-gray-500 mt-1">OPTIMAL CONDITIONS DETECTED</div>
                            </div>

                            <div className="bg-[#0B0C10] border border-white/5 rounded-lg p-3 group">
                                <div className="flex items-center justify-between mb-1">
                                    <MetricTooltip termKey="visibility" showIcon>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold font-mono group-hover:text-neon-cyan transition-colors">VISIBILITY</div>
                                    </MetricTooltip>
                                    <div className={clsx(
                                        "w-2 h-2 rounded-full animate-pulse",
                                        selectedEvent.visibility === 'High' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-yellow-500"
                                    )} />
                                </div>
                                <div className="text-xl font-bold text-white font-orbitron tracking-wide">{selectedEvent.visibility.toUpperCase()}</div>
                                <div className="text-[9px] text-gray-500 mt-1">NAKED EYE VISIBLE</div>
                            </div>
                        </div>

                        {/* DATA GRID */}
                        <div className="grid grid-cols-2 gap-px bg-white/5 rounded-lg overflow-hidden font-mono mb-4 text-xs border border-white/5">
                            {/* RA */}
                            <div className="bg-[#0B0C10] p-3 text-center hover:bg-white/5 transition-colors group">
                                <MetricTooltip termKey="ra">
                                    <div className="text-[9px] text-gray-500 mb-1 group-hover:text-neon-cyan transition-colors">RA</div>
                                </MetricTooltip>
                                <div className="text-neon-cyan font-bold">{selectedEvent.coordinates?.ra || "N/A"}</div>
                            </div>
                            {/* DEC */}
                            <div className="bg-[#0B0C10] p-3 text-center hover:bg-white/5 transition-colors group">
                                <MetricTooltip termKey="dec">
                                    <div className="text-[9px] text-gray-500 mb-1 group-hover:text-neon-cyan transition-colors">DEC</div>
                                </MetricTooltip>
                                <div className="text-neon-cyan font-bold">{selectedEvent.coordinates?.dec || "N/A"}</div>
                            </div>
                            {/* MAG */}
                            <div className="bg-[#0B0C10] p-3 text-center hover:bg-white/5 transition-colors group">
                                <MetricTooltip termKey="magnitude">
                                    <div className="text-[9px] text-gray-500 mb-1 group-hover:text-neon-cyan transition-colors">MAG</div>
                                </MetricTooltip>
                                <div className="text-white relative z-10">{selectedEvent.magnitude}</div>
                                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1 group-hover:via-neon-cyan transition-all" />
                            </div>
                            {/* PHASE */}
                            <div className="bg-[#0B0C10] p-3 text-center hover:bg-white/5 transition-colors group">
                                <MetricTooltip termKey="phase">
                                    <div className="text-[9px] text-gray-500 mb-1 group-hover:text-neon-cyan transition-colors">PHASE</div>
                                </MetricTooltip>
                                <div className="text-white">84%</div>
                            </div>
                            {/* AZ */}
                            <div className="bg-[#0B0C10] p-3 text-center hover:bg-white/5 transition-colors group">
                                <MetricTooltip termKey="azimuth">
                                    <div className="text-[9px] text-gray-500 mb-1 group-hover:text-neon-cyan transition-colors">AZ</div>
                                </MetricTooltip>
                                <div className="text-neon-blue font-bold">142° SE</div>
                            </div>
                            {/* ALT */}
                            <div className="bg-[#0B0C10] p-3 text-center hover:bg-white/5 transition-colors group">
                                <MetricTooltip termKey="elevation">
                                    <div className="text-[9px] text-gray-500 mb-1 group-hover:text-neon-cyan transition-colors">ALT</div>
                                </MetricTooltip>
                                <div className="text-neon-blue font-bold">45°</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
