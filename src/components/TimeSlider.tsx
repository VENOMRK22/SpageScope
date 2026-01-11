import React from 'react';

interface TimeSliderProps {
    year: number;
    onYearChange: (year: number) => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ year, onYearChange }) => {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 w-11/12 max-w-lg">
            <div className="glass-panel px-8 py-6 rounded-2xl w-full border border-white/20 shadow-neon-glow transition-all duration-300">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-muted-gray text-sm font-light tracking-widest uppercase">Timeline</span>
                    <span className="text-4xl font-bold font-orbitron text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                        {year}
                    </span>
                </div>

                <input
                    type="range"
                    min="1990"
                    max="2050"
                    value={year}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cyan hover:accent-starlight-white transition-all"
                />

                <div className="flex justify-between text-xs text-muted-gray mt-2 font-mono">
                    <span>1990</span>
                    <span>PRESENT</span>
                    <span>2050</span>
                </div>
            </div>

            <div className="text-[10px] text-white/30 mt-2 uppercase tracking-[0.2em] font-light">
                Secure Time-Link Established
            </div>
        </div>
    );
};
