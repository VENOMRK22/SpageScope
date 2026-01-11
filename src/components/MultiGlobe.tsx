import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';

export type GlobeMode = 'clouds' | 'day-night' | 'hexed' | 'population' | 'airlines' | 'satellites';

interface MultiGlobeProps {
    mode: GlobeMode;
}

export const MultiGlobe: React.FC<MultiGlobeProps> = ({ mode }) => {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const [width, setWidth] = useState(window.innerWidth);

    // Data States
    const [hex, setHex] = useState<any[]>([]);
    const [pop, setPop] = useState<any[]>([]);
    const [airports, setAirports] = useState<any[]>([]); // For Airlines
    const [routes, setRoutes] = useState<any[]>([]);     // For Airlines

    // Resize handler
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-rotate
    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.6;
        }
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        // Load Hex Data (Countries GeoJSON)
        if (mode === 'hexed' && hex.length === 0) {
            fetch('//unpkg.com/world-atlas/countries-110m.json')
                .then(res => res.json())
                .then(data => setHex((data as any).objects.countries.geometries)) // Storing geometries for now, react-globe.gl handles TopoJSON internally usually or we fetch GeoJSON directly. 
            // ACTUALLY: Let's use the raw GeoJSON from the example for direct compatibility with hexBinPointsData logic if we want points, 
            // BUT hexPolygonsData needs polygons. The example uses 'hexed-polygons' which consumes GeoJSON.
            // Let's use the specific URL from the plan.

            // RETRY with direct GeoJSON for Hexed Polygons mode
            fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
                .then(res => res.json())
                .then(data => setHex(data.features));
        }

        // Load Population Data (CSV)
        if (mode === 'population' && pop.length === 0) {
            fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/world_population.csv')
                .then(res => res.text())
                .then(csv => {
                    const lines = csv.split('\n').slice(1); // Skip header
                    const data = lines.map(line => {
                        const [lng, lat, pop] = line.split(',');
                        return { lng: parseFloat(lng), lat: parseFloat(lat), pop: parseFloat(pop) };
                    }).filter(d => !isNaN(d.lng));
                    setPop(data);
                });
        }

        // Load Airline Routes
        if (mode === 'airlines' && airports.length === 0) {
            // We need airports to map the routes
            Promise.all([
                fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_10m_airports.geojson').then(r => r.json()),
                fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/airport_routes_1.json').then(r => r.json())
            ]).then(([airportsData, routesData]) => {
                // Process Airports Map
                const airportMap = new Map();
                // @ts-ignore
                airportsData.features.forEach(attr => {
                    // @ts-ignore
                    airportMap.set(attr.properties.iata_code, attr.geometry.coordinates);
                });

                // Filter valid routes
                // @ts-ignore
                const validRoutes = routesData.map(route => {
                    const src = airportMap.get(route.src_iata);
                    const dst = airportMap.get(route.dst_iata);
                    if (src && dst) {
                        return {
                            startLat: src[1],
                            startLng: src[0],
                            endLat: dst[1],
                            endLng: dst[0]
                        };
                    }
                    return null;
                }).filter((d: any) => d !== null);

                setAirports(airportsData.features); // Optional: if we want to show airports dots
                setRoutes(validRoutes);
            });
        }

    }, [mode]);

    // --- MOCK SATELLITES (Generative) ---
    // Generating 1500 satellites to mimic the "space-track-leo" visual without TLE parsing overhead
    const satellitesData = useMemo(() => {
        return Array.from({ length: 1500 }).map(() => ({
            lat: (Math.random() - 0.5) * 180,
            lng: (Math.random() - 0.5) * 360,
            alt: 0.1 + Math.random() * 0.3, // LEO Altitude
            size: Math.random() * 0.3
        }));
    }, []);


    // --- RENDER PROPS BASED ON MODE ---
    const commonProps = {
        width: width,
        height: window.innerHeight,
        backgroundColor: "rgba(0,0,0,0)",
        showAtmosphere: true,
    };

    const getGlobeProps = () => {
        switch (mode) {
            case 'clouds':
                return {
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
                    bumpImageUrl: "//unpkg.com/three-globe/example/img/earth-topology.png",
                    atmosphereColor: "#00aaff",
                    atmosphereAltitude: 0.15
                };
            case 'day-night':
                return {
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-night.jpg",
                    atmosphereColor: "#FFD700",
                };
            case 'hexed':
                return {
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-dark.jpg",
                    hexPolygonsData: hex,
                    hexPolygonResolution: 3,
                    hexPolygonMargin: 0.3,
                    hexPolygonColor: () => 'rgba(0, 243, 255, 0.7)', // Neon Cyan
                    hexPolygonUseDots: true, // Cyberpunk dot-matrix style from example
                };
            case 'population':
                return {
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-night.jpg",
                    pointsData: pop,
                    pointAltitude: (d: any) => d.pop / 1000000, // Escalate height based on pop
                    pointColor: () => '#FF0055', // Neon Pink
                    pointRadius: 0.5,
                };
            case 'airlines':
                return {
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-night.jpg",
                    arcsData: routes,
                    arcColor: () => '#00F3FF', // Neon Cyan Arcs
                    arcDashLength: 0.4,
                    arcDashGap: 0.2,
                    arcDashAnimateTime: 1500,
                    arcStroke: 0.3,
                    // Optional: Show airports
                    // pointsData: airports,
                    // pointColor: () => 'white',
                    // pointRadius: 0.2
                };
            case 'satellites':
                return {
                    globeImageUrl: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
                    objectsData: satellitesData,
                    objectLat: "lat",
                    objectLng: "lng",
                    objectAltitude: "alt",
                    objectThreeObject: () => new THREE.Mesh(
                        new THREE.SphereGeometry(0.5, 6, 6),
                        new THREE.MeshBasicMaterial({ color: '#FF0055' })
                    )
                };
            default:
                return {};
        }
    };

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto">
            <Globe
                ref={globeEl}
                {...commonProps}
                {...getGlobeProps()}
            />
        </div>
    );
};
