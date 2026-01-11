import React from 'react';
import { Bot } from 'lucide-react';

interface CaptainNovaProps {
    year: number;
}

export const CaptainNova: React.FC<CaptainNovaProps> = ({ year }) => {

    const getMessage = (year: number) => {
        if (year < 2000) return "Analyzing historical data. Earth appears rich in vegetation.";
        if (year > 2040) return "Critical Warning: Projecting severe climate anomalies. High temperatures detected.";
        return "Systems Online. Commander, use the Time Slider to view Earth's potential future.";
    };

    return (
        <div className="absolute bottom-8 right-8 z-20 hidden lg:flex items-end space-x-4 animate-fade-in-up">
            <div className="flex flex-col items-end">
                <div className="glass-panel px-4 py-3 rounded-t-xl rounded-bl-xl border-white/10 max-w-xs">
                    <p className="text-sm text-starlight-white leading-relaxed">
                        {getMessage(year)}
                    </p>
                </div>
                <span className="text-[10px] text-neon-cyan mt-1 tracking-wider uppercase font-bold">Captain Nova</span>
            </div>

            <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center border border-neon-cyan shadow-neon-glow shrink-0">
                <Bot size={24} className="text-neon-cyan" />
            </div>
        </div>
    );
};
