import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const SolarSystem: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full absolute inset-0 bg-black">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300 group"
                title="Back to Home"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <iframe
                src="https://eyes.nasa.gov/apps/solar-system/#/home"
                className="w-full h-full border-0"
                title="NASA Solar System Exploration"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};
