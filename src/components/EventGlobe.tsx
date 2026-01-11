import React, { useEffect, useRef, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import type { SkyEvent } from '../services/spaceData';
import { Loader2, Crosshair } from 'lucide-react';
import * as THREE from 'three';

interface EventGlobeProps {
    event: SkyEvent;
}

export const EventGlobe: React.FC<EventGlobeProps> = ({ event }) => {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Data State for Polygons
    const [countries, setCountries] = useState({ features: [] });

    // TACTICAL RESET 
    const [isResetting, setIsResetting] = useState(false);
    const [activeEvent, setActiveEvent] = useState<SkyEvent>(event);

    // 0. Load GeoJSON for Borders (Restored)
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => setCountries(data))
            .catch(err => console.error("Failed to load map data", err));
    }, []);

    // 1. Handle Event Switching
    useEffect(() => {
        setIsResetting(true);
        setActiveEvent(event);

        const timer = setTimeout(() => {
            setIsResetting(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [event.id]);

    // Responsive Sizing
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 2. Calculate RINGS (Decoupled System)
    const ringsData = useMemo(() => {
        if (!activeEvent.coverage) return [];

        const coverageCenter = activeEvent.coverage.center;
        const radius = activeEvent.coverage.radius;
        const baseColor = activeEvent.coverage.color || 'rgba(0, 243, 255, 0.6)';

        const rings = [];

        // RING 1: Broad Coverage Area (Scientific Region)
        rings.push({
            id: `${activeEvent.id}-coverage`,
            lat: coverageCenter.lat,
            lng: coverageCenter.lng,
            maxR: radius,
            propagationSpeed: 2,
            repeatPeriod: 2000,
            color: () => baseColor
        });

        // RING 2: Precise "Best Viewing" Pinpoint (User Hotspot)
        if (activeEvent.bestViewing) {
            rings.push({
                id: `${activeEvent.id}-pinpoint`,
                lat: activeEvent.bestViewing.coordinates.lat,
                lng: activeEvent.bestViewing.coordinates.lng,
                maxR: 2.5, // The White Ring (Visual Anchor)
                propagationSpeed: 8,
                repeatPeriod: 800,
                color: () => 'rgba(255, 255, 255, 0.9)'
            });
        }

        return rings;
    }, [activeEvent]);

    // 3. Custom Marker
    const markerData = useMemo(() => {
        if (!activeEvent.bestViewing) return [];
        return [{
            lat: activeEvent.bestViewing.coordinates.lat,
            lng: activeEvent.bestViewing.coordinates.lng,
            city: activeEvent.bestViewing.city,
            id: activeEvent.id
        }];
    }, [activeEvent]);


    // 4. Custom Globe Material (Lighter Grey Water)
    const globeMaterial = useMemo(() => {
        return new THREE.MeshPhongMaterial({
            color: '#27272a', // Zinc-800 (Lighter than Land)
            shininess: 0.7,
        });
    }, []);


    // 5. Auto-Rotate 
    // Prioritize showing the Center of the Coverage Region
    useEffect(() => {
        if (!isResetting && globeEl.current && activeEvent.coverage) {
            const targetLat = activeEvent.coverage.center.lat;
            const targetLng = activeEvent.coverage.center.lng;

            globeEl.current.pointOfView({
                lat: targetLat,
                lng: targetLng,
                altitude: 1.9
            }, 800);
        }
    }, [isResetting, activeEvent]);

    // Marker Renderer (Clean Text Only)
    const renderMarker = (d: any) => {
        const el = document.createElement('div');
        el.innerHTML = `
            <div style="
                position: relative; 
                transform: translate(-50%, -120%);
                display: flex; 
                flex-direction: column; 
                align-items: center;
                pointer-events: none;
            ">
                <div style="
                    color: rgba(255, 255, 255, 0.9);
                    font-family: monospace;
                    font-size: 10px;
                    font-weight: bold;
                    white-space: nowrap;
                    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
                    letter-spacing: 0.5px;
                ">
                    ${d.city}
                </div>
            </div>
        `;
        return el;
    };

    // Calculate Coverage Stats
    const coverageKm = activeEvent.coverage ? Math.round(activeEvent.coverage.radius * 111) : 0;

    return (
        <div ref={containerRef} className="w-full h-full relative bg-transparent">

            {/* TACTICAL LOADING OVERLAY */}
            {isResetting && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-neon-cyan border border-white/5">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <div className="text-xs font-mono tracking-[0.2em] font-bold animate-pulse">
                        TACTICAL REFRESH...
                    </div>
                </div>
            )}

            {/* REGION LABEL OVERLAY (Bottom Left) */}
            {!isResetting && activeEvent.coverage && (
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    <div className="flex items-center space-x-2 text-neon-cyan mb-1">
                        <Crosshair size={14} className="animate-pulse" />
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">TARGET ACQUIRED</span>
                    </div>
                    <div className="bg-black/80 border-l-2 border-neon-cyan p-2 pl-3 backdrop-blur-sm">
                        <div className="text-sm font-bold text-white font-mono leading-none tracking-wide text-neon-cyan uppercase mb-1">{activeEvent.bestViewing?.city || "UNKNOWN SECTOR"}</div>
                        <div className="text-[9px] text-gray-400 font-mono">
                            VISIBILITY: {activeEvent.visibility.toUpperCase()}
                        </div>
                        <div className="text-[9px] text-neon-cyan/70 font-mono mt-1">
                            COORDS: {activeEvent.coverage.center.lat.toFixed(2)}°N, {activeEvent.coverage.center.lng.toFixed(2)}°E
                        </div>
                        <div className="text-[9px] text-white/50 font-mono mt-0.5">
                            RNG: ~{coverageKm.toLocaleString()} KM
                        </div>
                    </div>
                </div>
            )}

            {/* GLOBE INSTANCE */}
            {!isResetting && dimensions.width > 0 && (
                <Globe
                    key={activeEvent.id}
                    ref={globeEl}
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor="rgba(0,0,0,0)"

                    // CUSTOM MATERIAL THEME
                    globeImageUrl={null!}
                    bumpImageUrl={null!}
                    globeMaterial={globeMaterial}

                    // POLYGONS (Dark High-Contrast)
                    polygonsData={countries.features}
                    polygonCapColor={() => '#18181b'} // Zinc-900 (Dark Shadow Grey Land)
                    polygonSideColor={() => 'rgba(0,0,0,0)'}
                    polygonStrokeColor={() => '#ffffff'} // Pure White Borders
                    polygonAltitude={0.005}

                    atmosphereColor="#ffffff" // Clean White Atmosphere
                    atmosphereAltitude={0.15}

                    // RINGS Only (Multi-Source)
                    ringsData={ringsData}
                    ringColor="color"
                    ringMaxRadius="maxR"
                    ringPropagationSpeed="propagationSpeed"
                    ringRepeatPeriod="repeatPeriod"
                    ringAltitude={0.015} // Ensure rings float ABOVE land (0.005)

                    htmlElementsData={markerData}
                    htmlElement={renderMarker}

                    labelsData={[]}
                />
            )}
        </div>
    );
};
