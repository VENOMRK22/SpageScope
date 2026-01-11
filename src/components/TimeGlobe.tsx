import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';

interface TimeGlobeProps {
    year: number;
}

export const TimeGlobe: React.FC<TimeGlobeProps> = ({ year }) => {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const [width, setWidth] = useState(window.innerWidth);

    // Handle resize
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Visual Storytelling Logic ---

    // Interpolate Atmosphere Color: Cool Blue (1990) -> Fire Red (2050)
    const atmosphereColor = useMemo(() => {
        // Normal Space Blue: #00aaff (RGB: 0, 170, 255)
        // Warning Red: #ff2200 (RGB: 255, 34, 0)

        const startYear = 2020;
        const endYear = 2050;

        if (year <= startYear) return '#00aaff'; // Cool Blue
        if (year >= endYear) return '#ff2200';   // Hot Red

        // Calculate interpolation factor (0 to 1)
        const t = (year - startYear) / (endYear - startYear);

        // Simple Linear Interpolation (Lerp) for RGB
        const r = Math.round(0 + (255 - 0) * t);
        const g = Math.round(170 + (34 - 170) * t);
        const b = Math.round(255 + (0 - 255) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }, [year]);

    // Interpolate Atmosphere Altitude: Thin (1990) -> Thick Haze (2050)
    const atmosphereAltitude = useMemo(() => {
        const minAlt = 0.15;
        const maxAlt = 0.35;

        const startYear = 2000;
        const endYear = 2050;

        if (year <= startYear) return minAlt;
        if (year >= endYear) return maxAlt;

        const t = (year - startYear) / (endYear - startYear);
        return minAlt + (maxAlt - minAlt) * t;
    }, [year]);

    // Auto-rotate setup
    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.6;
        }
    }, []);

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto">
            <Globe
                ref={globeEl}
                width={width}
                height={window.innerHeight}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                showAtmosphere={true}
                atmosphereColor={atmosphereColor}
                atmosphereAltitude={atmosphereAltitude}
            />
        </div>
    );
};
