import React from 'react';
import { Sun } from 'lucide-react';

export const Weather: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-sans">
            <div className="bg-white/5 p-12 rounded-3xl border border-white/10 backdrop-blur-md flex flex-col items-center shadow-2xl">
                <Sun className="w-16 h-16 text-yellow-400 mb-6 animate-pulse" />
                <h1 className="text-3xl font-bold font-orbitron tracking-wider text-center bg-gradient-to-r from-yellow-200 to-orange-500 bg-clip-text text-transparent">
                    Chunk 5: Cosmic Weather Station
                </h1>
                <p className="mt-4 text-gray-400 uppercase tracking-[0.2em] text-sm">
                    (Coming Next)
                </p>
            </div>
        </div>
    );
};
