
import React, { useRef, useEffect, useState, useContext } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import clsx from 'clsx';
// @ts-ignore
import * as solar from 'solar-calculator';
import { Cloud, SunMoon, Users, Satellite, Loader2 } from 'lucide-react';

type ViewMode = 'clouds' | 'day-night' | 'population' | 'satellites';

import { useOutletContext } from 'react-router-dom';
import { DataContext } from '../context/DataContext';

export const Home: React.FC = () => {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const { isSidebarOpen } = useOutletContext<{ isSidebarOpen: boolean }>(); // Get Sidebar State

    const [view, setView] = useState<ViewMode>('clouds');
    const [loading, setLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);

    // Helper to sync state
    const updateIframeState = () => {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'SIDEBAR_STATE',
                isOpen: isSidebarOpen
            }, '*');
        }
    };

    // Trigger on Toggle
    useEffect(() => {
        updateIframeState();
    }, [isSidebarOpen]);

    // Trigger on Load is handled by iframe onLoad prop below

    // Data States
    const [hexData, setHexData] = useState<any>(null); // GeoJSON for Population (Polygons)

    // Resize handler
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-rotate & General Config
    // FIX: Re-apply this whenever we finish a Hard Reset (Globe Remounts)
    useEffect(() => {
        if (!isTransitioning && globeEl.current) {
            const controls = globeEl.current.controls();
            if (controls) {
                // Stop rotation ONLY for population view
                controls.autoRotate = view !== 'population';
                controls.autoRotateSpeed = 0.35;
            }
        }
    }, [isTransitioning, view]);

    // Helper for stable colors
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }

    // Sun Position (Day/Night) logic
    // We rely on the globeImageUrl (earth-day) and standard lighting for the effect.

    // Hard Reset Handler to clear WebGL context issues between modes
    const handleViewChange = (newView: ViewMode) => {
        if (newView === view) return;

        setIsTransitioning(true);
        setView(newView);

        // Force unmount/remount cycle
        setTimeout(() => {
            setIsTransitioning(false);
        }, 100);
    };

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === 'population' && !hexData) {
                    // Fetch GeoJSON for "Population" view (formerly Hexed mode visual)
                    const res = await fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
                    const data = await res.json();
                    setHexData(data);
                }
                else if (view === 'satellites') {
                    // Iframe implementation used - no fetch needed here
                }
            } catch (err) {
                console.error("Failed to fetch dataset:", err);
            }
            setLoading(false);
        };

        if (!isTransitioning) {
            fetchData();
        }
    }, [view, isTransitioning]);

    // Global Data Context
    const { events, weather, launches, loading: isGlobalLoading } = useContext(DataContext);

    // Verify Data Load
    useEffect(() => {
        if (!isGlobalLoading) {
            console.log("🌌 SPACE DATA LOADED:", { events, weather, launches });
        }
    }, [isGlobalLoading, events, weather, launches]);


    // --- VIEW SPECIFIC LOGIC ---

    // Clouds: Custom Layer
    useEffect(() => {
        if (isTransitioning) return; // Skip if resetting

        let cloudsMesh: THREE.Mesh | undefined;
        let animationFrameId: number;

        if (globeEl.current && view === 'clouds') {
            // User requested: https://github.com/turban/webgl-earth/blob/master/images/fair_clouds_4k.png
            // Converting to RAW URL for it to work as a texture:
            const CLOUD_IMG_URL = 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png';

            new THREE.TextureLoader().load(
                CLOUD_IMG_URL,
                cloudsTexture => {
                    if (!globeEl.current) return;

                    const globeRadius = globeEl.current.getGlobeRadius();

                    // Geometry: 1.01 radius as requested
                    const geometry = new THREE.SphereGeometry(globeRadius * 1.01, 75, 75);

                    // Material: MeshPhongMaterial as requested
                    const material = new THREE.MeshPhongMaterial({
                        map: cloudsTexture,
                        transparent: true,
                        opacity: 0.8
                    });

                    const clouds = new THREE.Mesh(geometry, material);

                    (globeEl.current.scene() as THREE.Scene).add(clouds);
                    cloudsMesh = clouds;

                    console.log("Clouds layer added (Phong + fair_clouds_4k)");

                    // Animation: Rotate independently
                    // Snippet Logic: CLOUDS_ROTATION_SPEED = -0.006 deg/frame
                    const CLOUDS_ROTATION_SPEED = -0.006;

                    const rotateClouds = () => {
                        if (clouds) {
                            clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
                        }
                        animationFrameId = requestAnimationFrame(rotateClouds);
                    };
                    rotateClouds();
                },
                undefined,
                (err) => console.error("Cloud texture failed to load", err)
            );
        }

        // Cleanup
        return () => {
            if (cloudsMesh && globeEl.current) {
                (globeEl.current.scene() as THREE.Scene).remove(cloudsMesh);
                if (cloudsMesh.geometry) cloudsMesh.geometry.dispose();
                // @ts-ignore
                if (cloudsMesh.material) cloudsMesh.material.dispose();
            }
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [view, isTransitioning]);





    // --- PROPS CONFIGURATION ---
    const getProps = () => {
        // DEFAULT STATE: Explicitly clear all data layers to prevent "Stacking"
        const base = {
            width,
            height: window.innerHeight,
            backgroundColor: "rgba(0,0,0,0)",
            // Force clear all potential data layers
            hexPolygonsData: [],
            arcsData: [],
            pointsData: [],
            labelsData: [],
            ringsData: [],
            objectsData: [], // if used
        };

        switch (view) {
            case 'clouds':
                return {
                    ...base,
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
                    bumpImageUrl: "//unpkg.com/three-globe/example/img/earth-topology.png",
                };
            case 'day-night':
                return {
                    ...base,
                    // No default image - we are aggressively injecting a shader
                    globeImageUrl: undefined,
                    showAtmosphere: true,
                    atmosphereColor: "lightskyblue",
                    atmosphereAltitude: 0.15,
                };
            case 'population':
                // Formerly "Hexagons" visual -> Now "Population"
                return {
                    ...base,
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-dark.jpg",
                    hexPolygonsData: hexData ? hexData.features : [],
                    hexPolygonResolution: 3,
                    hexPolygonMargin: 0.3,
                    hexPolygonColor: ({ properties: d }: any) => stringToColor(d.ADMIN || ''),
                    hexPolygonLabel: ({ properties: d }: any) => `
                        <div class="px-3 py-2 bg-black/80 text-white rounded-lg border border-neon-cyan/40 shadow-[0_0_10px_rgba(0,243,255,0.2)] backdrop-blur-md font-sans">
                            <div class="font-bold text-neon-cyan text-sm mb-0.5">${d.ADMIN} (${d.ISO_A2})</div>
                            <div class="text-xs text-gray-300">Population: <span class="text-white">${d.POP_EST ? (d.POP_EST / 1e6).toFixed(1) + 'M' : 'N/A'}</span></div>
                        </div>
                    `
                };
            default:
                return base;
        }
    };


    return (
        <div className="fixed inset-0 z-10 pointer-events-none">
            {/* System Status Indicator (Data Layer Check) */}
            {!isGlobalLoading && (
                <div className="absolute top-4 right-4 z-50 text-[10px] text-neon-cyan/50 font-orbitron tracking-widest pointer-events-none text-right">
                    SYSTEM STATUS: ONLINE
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                    <Loader2 className="animate-spin text-neon-cyan mb-2" size={32} />
                    <span className="text-neon-cyan text-sm font-orbitron tracking-widest">LOADING DATASET...</span>
                </div>
            )}

            {/* Only Render Globe if NOT transitioning (Hard Reset) */}
            {!isTransitioning && (
                (view === 'day-night' || view === 'satellites') ? (
                    <iframe
                        src={view === 'satellites' ? '/satellites.html' : '/day-night.html'}
                        className="w-full h-full border-0 absolute inset-0"
                        title="Globe Visualization"
                        onLoad={updateIframeState} // Sync state when iframe is ready
                        style={{ pointerEvents: 'auto' }}
                    />
                ) : (
                    <div className="fixed inset-0 w-full h-full pointer-events-auto">
                        <Globe
                            ref={globeEl}
                            {...getProps()}
                        />
                    </div>
                )
            )}

            {/* Control Bar - Fixed position relative to screen */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-fit max-w-6xl pointer-events-auto">
                <div className="glass-panel p-1 rounded-2xl flex space-x-1 overflow-x-auto border border-white/10 shadow-lg">
                    {[
                        { id: 'clouds', label: 'Clouds', icon: Cloud },
                        { id: 'day-night', label: 'Day/Night', icon: SunMoon },
                        { id: 'population', label: 'Population', icon: Users },
                        { id: 'satellites', label: 'Satellites', icon: Satellite },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleViewChange(item.id as ViewMode)}
                            className={clsx(
                                "flex flex-col items-center justify-center min-w-[60px] px-2 py-1.5 rounded-xl transition-all duration-300 group",
                                view === item.id
                                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                                    : "hover:bg-white/5 text-muted-gray hover:text-white border border-transparent"
                            )}
                        >
                            <item.icon size={16} className={clsx("mb-1 transition-transform group-hover:scale-110", view === item.id && "animate-pulse")} />
                            <span className="text-[10px] font-orbitron tracking-wider whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
