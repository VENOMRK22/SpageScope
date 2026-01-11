import React from 'react';
import clsx from 'clsx';
import { Cloud, SunMoon, Hexagon, Users, Plane, Satellite } from 'lucide-react';
import type { GlobeMode } from './MultiGlobe';

interface GalleryUIProps {
    currentMode: GlobeMode;
    onModeChange: (mode: GlobeMode) => void;
}

const MODES: { id: GlobeMode; label: string; icon: React.FC<any> }[] = [
    { id: 'clouds', label: 'Clouds', icon: Cloud },
    { id: 'day-night', label: 'Day/Night', icon: SunMoon },
    { id: 'hexed', label: 'Hexed', icon: Hexagon },
    { id: 'population', label: 'Population', icon: Users },
    { id: 'airlines', label: 'Airlines', icon: Plane },
    { id: 'satellites', label: 'Satellites', icon: Satellite },
];

export const GalleryUI: React.FC<GalleryUIProps> = ({ currentMode, onModeChange }) => {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-fit max-w-5xl">
            <div className="glass-panel p-2 rounded-2xl flex space-x-2 overflow-x-auto">
                {MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = currentMode === mode.id;

                    return (
                        <button
                            key={mode.id}
                            onClick={() => onModeChange(mode.id)}
                            className={clsx(
                                "flex flex-col items-center justify-center min-w-[30px] px-2 py-3 rounded-xl transition-all duration-300 group",
                                isActive
                                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-neon-glow"
                                    : "hover:bg-white/5 text-muted-gray hover:text-white border border-transparent"
                            )}
                        >
                            <Icon size={24} className={clsx("mb-2", isActive && "animate-pulse")} />
                            <span className="text-xs font-orbitron tracking-wide whitespace-nowrap">{mode.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="text-center mt-3">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-light">Select Visualization Module</p>
            </div>
        </div>
    );
};
