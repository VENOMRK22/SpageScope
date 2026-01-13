
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Wind, Droplets, Activity, MapPin, AlertTriangle, Leaf, Globe, Info, Clock, Satellite } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { getDailyCache, setDailyCache } from '../lib/cacheUtils';

// Constants
const API_METEO = 'https://api.open-meteo.com/v1/forecast';
const API_AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const API_EPIC = 'https://api.nasa.gov/EPIC/api/natural?api_key=DEMO_KEY';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_CLIMATE: ClimateData = {
    current: { temp: 24.5, windSpeed: 12.8, soilTemp: 21.2, soilMoisture: 0.35 },
    hourly: {
        time: Array.from({ length: 24 }, (_, i) => new Date().setHours(i).toString()),
        temp: Array.from({ length: 24 }, () => 20 + Math.random() * 5),
        rain: Array.from({ length: 24 }, () => Math.random() * 2),
        soilMoisture: Array.from({ length: 24 }, () => 0.3 + Math.random() * 0.1)
    },
    daily: { uvIndex: 6.2, rainSum: 4.5 }
};

const MOCK_AIR: AirData = {
    current: { pm10: 28, pm2_5: 15, co: 245 },
    hourly: {
        time: Array.from({ length: 24 }, (_, i) => new Date().setHours(i).toString()),
        pm10: Array.from({ length: 24 }, () => 20 + Math.random() * 15),
        pm2_5: Array.from({ length: 24 }, () => 10 + Math.random() * 10)
    }
};

const MOCK_DISASTERS = [
    {
        id: 'mock-1',
        title: 'Pacific Ring: Seismic Spike',
        geometry: [{ date: new Date().toISOString(), coordinates: [139.6, 35.6] }],
        categories: [{ title: 'Geophysical' }]
    },
    {
        id: 'mock-2',
        title: 'Amazon Basin: Thermal Anomaly',
        geometry: [{ date: new Date().toISOString(), coordinates: [-60.0, -3.4] }],
        categories: [{ title: 'Wildfires' }]
    }
];

// --- CONTEXTUAL METRICS DICTIONARY ---
const METRICS = {
    pm25: {
        title: "PM2.5 Particulate Matter",
        desc: "Fine inhalable particles with diameters that are generally 2.5 micrometers and smaller.",
        impact: "Penetrates deep into lungs. High levels cause respiratory distress.",
        satellite: "Sentinel-5P (Copernicus Atmosphere Monitoring Service)"
    },
    pm10: {
        title: "PM10 Particulate Matter",
        desc: "Inhalable particles, with diameters that are generally 10 micrometers and smaller.",
        impact: "Irritates eyes and throat. Major component of dust storms.",
        satellite: "Sentinel-5P"
    },
    co: {
        title: "Carbon Monoxide (CO)",
        desc: "Colorless, odorless gas produced by burning fuel.",
        impact: "Reduces oxygen delivery to the body's organs.",
        satellite: "Sentinel-5P (TROPOMI Instrument)"
    },
    soilMoisture: {
        title: "Surface Soil Moisture",
        desc: "Water content in the top 0-5cm of soil.",
        impact: "Critical for crop health and flood forecasting.",
        satellite: "NASA SMAP (Soil Moisture Active Passive)"
    },
    soilTemp: {
        title: "Soil Temperature",
        desc: "Temperature of the soil at surface level.",
        impact: "Determines seed germination rates and microbial activity.",
        satellite: "MODIS (Terra/Aqua Satellites)"
    },
    uvIndex: {
        title: "Solar UV Radiation",
        desc: "Measure of the strength of sunburn-producing ultraviolet radiation.",
        impact: "High index requires protection. Values > 11 are extreme.",
        satellite: "EUMETSAT Polar System / NOAA"
    },
    rain: {
        title: "Precipitation Rate",
        desc: "Intensity of rainfall or snowfall in the area.",
        impact: "Essential for hydrology balance and flood alerts.",
        satellite: "NASA GPM (Global Precipitation Measurement)"
    },
    wind: {
        title: "Wind Velocity",
        desc: "Speed of air movement at 10 meters above surface.",
        impact: "Impacts pollution dispersion and storm severity.",
        satellite: "Aeolus / Scatterometer Data"
    }
};

// Types
interface ClimateData {
    current: {
        temp: number;
        windSpeed: number;
        soilTemp: number;
        soilMoisture: number;
    };
    hourly: {
        time: string[];
        temp: number[];
        rain: number[];
        soilMoisture: number[];
    };
    daily: {
        uvIndex: number;
        rainSum: number;
    };
}

interface AirData {
    current: {
        pm10: number;
        pm2_5: number;
        co: number;
    };
    hourly: {
        time: string[];
        pm10: number[];
        pm2_5: number[];
    };
}

// --- TOOLTIP COMPONENT ---
const HoverTooltip = ({ activeMetric, anchorRect }: { activeMetric: keyof typeof METRICS | null, anchorRect: DOMRect | null }) => {
    if (!activeMetric || !anchorRect) return null;
    const info = METRICS[activeMetric];

    // Position Logic
    const GAP = 10;
    const CARD_WIDTH = 300;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    let left = anchorRect.right + GAP;
    let top = anchorRect.top;

    // Flip if off screen
    if (left + CARD_WIDTH > viewWidth - 20) left = anchorRect.left - CARD_WIDTH - GAP;
    if (top + 200 > viewHeight) top = viewHeight - 210;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top, left, width: CARD_WIDTH, zIndex: 99999 }}
            className="bg-slate-900/95 border border-white/20 shadow-2xl rounded-xl p-4 backdrop-blur-xl text-white pointer-events-none"
        >
            <h4 className="font-bold text-sm mb-2 text-neon-cyan uppercase tracking-wider flex items-center gap-2">
                <Info size={14} /> {info.title}
            </h4>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed border-b border-white/10 pb-3 font-sans">
                {info.desc}
            </p>
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <Activity size={12} className="text-red-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-gray-400 leading-tight">
                        <strong className="text-red-300">IMPACT:</strong> {info.impact}
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    <Globe size={12} className="text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-gray-400 leading-tight">
                        <strong className="text-blue-300">SOURCE:</strong> {info.satellite}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export const Impact = () => {
    // 1. State Management
    const [location, setLocation] = useState<{ lat: number; lon: number; city: string | null }>({ lat: 0, lon: 0, city: null });
    const [climateData, setClimateData] = useState<ClimateData | null>(null);
    const [airData, setAirData] = useState<AirData | null>(null);
    const [disasters, setDisasters] = useState<any[]>([]);
    const [epicImages, setEpicImages] = useState<any[]>([]); // New State for Earth Gallery
    const [loading, setLoading] = useState(true);
    const [isSimulated, setIsSimulated] = useState(false); // Track if using fallback

    // Tooltip State
    const [hoveredMetric, setHoveredMetric] = useState<keyof typeof METRICS | null>(null);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    // 2. On Mount: Get Local Coords
    useEffect(() => {
        if (!navigator.geolocation) {
            handleError("Geolocation is not supported by your browser.", true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                fetchData(latitude, longitude);
                try {
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();
                    const city = data.city || data.locality || data.principalSubdivision || "Unknown Sector";
                    setLocation({ lat: latitude, lon: longitude, city: `${city}, ${data.countryCode}` });
                } catch (e) {
                    console.warn("Geocoding failed", e);
                    setLocation({ lat: latitude, lon: longitude, city: null });
                }
            },
            (err) => {
                console.warn("Location denied:", err);
                const fallbackLat = 28.6139;
                const fallbackLon = 77.2090;
                setLocation({ lat: fallbackLat, lon: fallbackLon, city: "New Delhi (Default)" });
                fetchData(fallbackLat, fallbackLon);
            }
        );
    }, []);

    // 3. New Effect: Daily Earth Scan (EPIC)
    useEffect(() => {
        const fetchEpic = async () => {
            try {
                // 0. Check Cache
                const cached = await getDailyCache('epic');
                if (cached) {
                    setEpicImages(cached.map((item: any) => ({
                        ...item,
                        date: new Date(item.date) // Rehydrate Date object
                    })));
                    return;
                }

                // 1. Fetch API
                const res = await fetch(API_EPIC);
                if (!res.ok) throw new Error("EPIC API Failed");
                const data = await res.json();

                // Process only first 8 images
                const processed = data.slice(0, 8).map((item: any) => {
                    const date = new Date(item.date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return {
                        id: item.identifier,
                        date: date.toISOString(), // Store as string for JSON/Firestore compatibility
                        imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${item.image}.png`
                    };
                });

                // 2. Set State
                setEpicImages(processed.map((item: any) => ({
                    ...item,
                    date: new Date(item.date)
                })));

                // 3. Cache
                setDailyCache('epic', processed);

            } catch (err) {
                console.warn("Failed to fetch Earth Gallery:", err);
                // Fallback handled by empty state rendering holographic earth
            }
        };

        fetchEpic();
    }, []);

    const handleError = (msg: string, forceMock: boolean = false) => {
        console.warn(`Error: ${msg}. Switching to Simulation Mode.`);

        if (forceMock || true) {
            setClimateData(MOCK_CLIMATE);
            setAirData(MOCK_AIR);
            setDisasters(MOCK_DISASTERS);
            setIsSimulated(true);
            setLoading(false);
        }
    };

    const fetchData = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            setIsSimulated(false);

            try {
                const [meteoRes, airRes, disasterRes] = await Promise.all([
                    fetch(`${API_METEO}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&hourly=temperature_2m,rain,soil_moisture_0_to_1cm&daily=uv_index_max,precipitation_sum`),
                    fetch(`${API_AIR}?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide&hourly=pm10,pm2_5`),
                    fetch('https://eonet.gsfc.nasa.gov/api/v3/events?limit=2&status=open')
                ]);

                if (!meteoRes.ok || !airRes.ok) throw new Error("API Limit / Unstable");

                const meteo = await meteoRes.json();
                const air = await airRes.json();
                const disasterData = await disasterRes.json();

                setClimateData({
                    current: {
                        temp: meteo.current.temperature_2m,
                        windSpeed: meteo.current.wind_speed_10m,
                        soilTemp: meteo.current.soil_temperature_0cm,
                        soilMoisture: meteo.current.soil_moisture_0_to_1cm
                    },
                    hourly: {
                        time: meteo.hourly.time.slice(0, 24),
                        temp: meteo.hourly.temperature_2m.slice(0, 24),
                        rain: meteo.hourly.rain.slice(0, 24),
                        soilMoisture: meteo.hourly.soil_moisture_0_to_1cm.slice(0, 24)
                    },
                    daily: {
                        uvIndex: meteo.daily.uv_index_max[0],
                        rainSum: meteo.daily.precipitation_sum[0]
                    }
                });

                setAirData({
                    current: {
                        pm10: air.current.pm10,
                        pm2_5: air.current.pm2_5,
                        co: air.current.carbon_monoxide
                    },
                    hourly: {
                        time: air.hourly.time.slice(0, 24),
                        pm10: air.hourly.pm10.slice(0, 24),
                        pm2_5: air.hourly.pm2_5.slice(0, 24)
                    }
                });

                setDisasters(disasterData.events || []);

            } catch (err) {
                console.error("Fetch failed, triggering fallback:", err);
                handleError("Satellite Link Failed", true);
            }

        } catch (err) {
            console.error("Critical Failure:", err);
            handleError("System Failure", true);
        } finally {
            setLoading(false);
        }
    };

    const handleHover = (metric: keyof typeof METRICS | null, rect: DOMRect | null) => {
        setHoveredMetric(metric);
        setAnchorRect(rect);
    };

    // Helper: PM2.5 Color
    const getAQIColor = (pm25: number) => {
        if (pm25 < 10) return "text-emerald-400";
        if (pm25 < 25) return "text-yellow-400";
        return "text-red-500";
    };

    const getAQIStatus = (pm25: number) => {
        if (pm25 < 10) return "Excellent";
        if (pm25 < 25) return "Moderate";
        return "Hazardous";
    };

    // Charts
    const airChartData = airData?.hourly.time.map((_, i) => ({
        time: i + ':00',
        pm25: airData.hourly.pm2_5[i]
    }));

    const soilChartData = climateData?.hourly.time.map((_, i) => ({
        time: i + ':00',
        moisture: climateData.hourly.soilMoisture[i],
        rain: climateData.hourly.rain[i]
    }));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-white">
                <Globe className="w-16 h-16 animate-pulse text-neon-cyan mb-4" />
                <h2 className="text-xl font-orbitron tracking-widest animate-pulse">TRIANGULATING SATELLITE SIGNAL...</h2>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8 pt-24 text-white overflow-y-auto relative z-20">

            {/* TOOLTIP PORTAL */}
            <AnimatePresence>
                {hoveredMetric && anchorRect && (
                    <HoverTooltip activeMetric={hoveredMetric} anchorRect={anchorRect} />
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="mb-8 border-b border-white/10 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            IMPACT STATION
                        </h1>
                        <p className="text-neon-cyan/80 font-mono mt-2 flex items-center gap-2">
                            <MapPin size={16} />
                            TARGET: {location.city || "Acquiring Target..."}
                            <span className="opacity-50 mx-2">|</span>
                            <span className="font-mono text-xs">{location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E</span>
                            <span className="text-gray-500 mx-2">|</span>
                            {isSimulated ? (
                                <span className="animate-pulse text-orange-400 text-xs flex items-center gap-1">
                                    <AlertTriangle size={10} /> SIMULATION MODE (OFFLINE)
                                </span>
                            ) : (
                                <span className="animate-pulse text-green-500 text-xs">● LIVE SATELLITE FEED</span>
                            )}
                        </p>
                    </div>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">

                {/* 1. Pollution Tracking */}
                <div
                    className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-neon-cyan/30 transition-all duration-500 cursor-help"
                    onMouseEnter={(e) => handleHover('pm25', e.currentTarget.getBoundingClientRect())}
                    onMouseLeave={() => handleHover(null, null)}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-50"><Wind className="w-8 h-8 text-gray-600" /></div>

                    <h2 className="text-xl font-bold font-orbitron text-gray-200 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-neon-cyan rounded-full"></span>
                        ATMOSPHERIC PURITY
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-gray-400 text-sm font-mono mb-1 flex items-center gap-1">PM2.5 CONCENTRATION <Info size={12} /></p>
                            <div className={clsx("text-6xl font-black font-mono tracking-tighter", getAQIStatus(airData?.current.pm2_5 || 0) === 'Hazardous' ? "text-red-500" : getAQIStatus(airData?.current.pm2_5 || 0) === 'Moderate' ? "text-yellow-400" : "text-emerald-400")}>
                                {airData?.current.pm2_5.toFixed(1)}
                                <span className="text-lg text-gray-500 font-normal ml-2">µg/m³</span>
                            </div>
                            <p className={clsx("text-lg font-bold mt-2", getAQIColor(airData?.current.pm2_5 || 0))}>
                                STATUS: {getAQIStatus(airData?.current.pm2_5 || 0)}
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                            <div
                                className="flex justify-between items-center mb-2 cursor-help hover:text-neon-cyan transition-colors"
                                onMouseEnter={(e) => { e.stopPropagation(); handleHover('pm10', e.currentTarget.getBoundingClientRect()); }}
                                onMouseLeave={() => handleHover(null, null)}
                            >
                                <span className="text-gray-400 text-xs flex items-center gap-1">PM10 <Info size={10} /></span>
                                <span className="text-xl font-bold">{airData?.current.pm10.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden mb-4">
                                <div className="bg-blue-500 h-full" style={{ width: `${Math.min((airData?.current.pm10 || 0) / 100 * 100, 100)}%` }}></div>
                            </div>

                            <div
                                className="flex justify-between items-center mb-2 mt-4 cursor-help hover:text-neon-cyan transition-colors"
                                onMouseEnter={(e) => { e.stopPropagation(); handleHover('co', e.currentTarget.getBoundingClientRect()); }}
                                onMouseLeave={() => handleHover(null, null)}
                            >
                                <span className="text-gray-400 text-xs flex items-center gap-1">CO (Carbon Monoxide) <Info size={10} /></span>
                                <span className="text-xl font-bold">{airData?.current.co.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full" style={{ width: `${Math.min((airData?.current.co || 0) / 300 * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={airChartData}>
                                <defs>
                                    <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                                <Area type="monotone" dataKey="pm25" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPm)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Agriculture / Soil */}
                <div
                    className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-50"><Leaf className="w-8 h-8 text-green-800" /></div>

                    <h2 className="text-xl font-bold font-orbitron text-gray-200 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                        AGRONOMY & SOIL
                    </h2>

                    <div className="flex items-end gap-6 mb-8">
                        <div
                            className="cursor-help"
                            onMouseEnter={(e) => handleHover('soilMoisture', e.currentTarget.getBoundingClientRect())}
                            onMouseLeave={() => handleHover(null, null)}
                        >
                            <p className="text-gray-400 text-sm font-mono mb-1 flex items-center gap-1">SOIL MOISTURE <Info size={12} /></p>
                            <div className="text-5xl font-black font-mono tracking-tighter text-white">
                                {climateData?.current.soilMoisture.toFixed(2)}
                                <span className="text-lg text-gray-500 font-normal ml-2">m³/m³</span>
                            </div>
                        </div>
                        <div
                            className="mb-2 cursor-help"
                            onMouseEnter={(e) => handleHover('soilTemp', e.currentTarget.getBoundingClientRect())}
                            onMouseLeave={() => handleHover(null, null)}
                        >
                            <p className="text-gray-400 text-sm font-mono mb-1 flex items-center gap-1">SOIL TEMP <Info size={12} /></p>
                            <div className="text-2xl font-bold text-orange-300">
                                {climateData?.current.soilTemp.toFixed(1)}°C
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={soilChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                <Bar dataKey="rain" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="moisture" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Global Disaster & Climate Watch (Full Width) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Climate Metrics */}
                    <div
                        className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-help"
                        onMouseEnter={(e) => handleHover('wind', e.currentTarget.getBoundingClientRect())}
                        onMouseLeave={() => handleHover(null, null)}
                    >
                        <div>
                            <p className="text-gray-400 text-xs font-mono uppercase flex items-center gap-1">Wind Velocity <Info size={10} /></p>
                            <p className="text-2xl font-bold text-white mt-1">{climateData?.current.windSpeed.toFixed(1)} km/h</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Wind size={20} />
                        </div>
                    </div>

                    <div
                        className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-help"
                        onMouseEnter={(e) => handleHover('uvIndex', e.currentTarget.getBoundingClientRect())}
                        onMouseLeave={() => handleHover(null, null)}
                    >
                        <div>
                            <p className="text-gray-400 text-xs font-mono uppercase flex items-center gap-1">UV Radiation (Max) <Info size={10} /></p>
                            <p className={clsx("text-2xl font-bold mt-1", (climateData as any)?.daily?.uvIndex > 7 ? 'text-red-400' : 'text-white')}>
                                {(climateData as any)?.daily?.uvIndex} UV
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <AlertTriangle size={20} />
                        </div>
                    </div>

                    <div
                        className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-help"
                        onMouseEnter={(e) => handleHover('rain', e.currentTarget.getBoundingClientRect())}
                        onMouseLeave={() => handleHover(null, null)}
                    >
                        <div>
                            <p className="text-gray-400 text-xs font-mono uppercase flex items-center gap-1">Precipitation (24h) <Info size={10} /></p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{(climateData as any)?.daily?.rainSum} mm</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Droplets size={20} />
                        </div>
                    </div>
                </div>

                {/* 4. Planetary Disaster Monitor (NASA EONET) */}
                <div className="lg:col-span-2 mt-4">
                    <h3 className="text-xl font-bold font-orbitron text-red-500 mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                        <AlertTriangle className="animate-pulse" />
                        PLANETARY DISASTER WATCH (LIVE FEED)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {disasters.length === 0 ? (
                            <div className="text-gray-500 font-mono italic">No Active Planetary Alerts Detected via NASA EONET.</div>
                        ) : (
                            disasters.map((event: any) => (
                                <div key={event.id} className="glass-panel p-4 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all flex items-start gap-4">
                                    <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-400 font-mono">
                                            <span>DATE: {new Date(event.geometry[0].date).toLocaleDateString()}</span>
                                            <span>TYPE: {event.categories[0]?.title}</span>
                                        </div>
                                        <div className="mt-1 text-xs text-neon-cyan/60 flex items-center gap-1">
                                            <Globe size={10} />
                                            COORDS: {event.geometry[0].coordinates.join(', ')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 5. Daily Earth Scan (NASA EPIC) */}
                <div className="lg:col-span-2 mt-4 mb-20">
                    <h3 className="text-xl font-bold font-orbitron text-blue-400 mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Satellite className="animate-pulse" />
                        {epicImages.length > 0 && (new Date().getTime() - epicImages[0].date.getTime() < 24 * 60 * 60 * 1000)
                            ? "GLOBAL SURVEILLANCE: LAST 24 HOURS"
                            : `GLOBAL SURVEILLANCE: LATEST DOWNLINK (${epicImages[0]?.date.toLocaleDateString() || 'SEARCHING...'})`}
                    </h3>

                    {/* Scrolling Container */}
                    <div className="w-full overflow-hidden pb-4 relative mask-linear-fade">
                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                        {epicImages.length === 0 ? (
                            <div className="w-full flex flex-col items-center justify-center py-12 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden">
                                {/* Holographic Earth Fallback */}
                                <div className="relative w-48 h-48 mb-6">
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-[spin_10s_linear_infinite]"></div>
                                    <div className="absolute inset-2 rounded-full border border-dashed border-neon-cyan/50 animate-[spin_20s_linear_infinite_reverse]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Globe className="w-32 h-32 text-blue-500/80 animate-pulse" strokeWidth={0.5} />
                                    </div>
                                    {/* Scan Line */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent h-full w-full animate-[ping_3s_ease-in-out_infinite] opacity-30"></div>
                                </div>
                                <h3 className="text-xl font-orbitron text-neon-cyan tracking-widest mb-2">VISUAL UPLINK OFFLINE</h3>
                                <p className="text-xs font-mono text-gray-500">SWITCHING TO HOLOGRAPHIC REPRESENTATION</p>
                            </div>
                        ) : (
                            <motion.div
                                className="flex space-x-6 w-max"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 40,
                                    repeatType: "loop"
                                }}
                            >
                                {/* Duplicate list for seamless loop */}
                                {[...epicImages, ...epicImages].map((img, idx) => (
                                    <div key={`${img.id}-${idx}`} className="relative group shrink-0 w-64 h-64 bg-black rounded-full overflow-hidden border-2 border-white/10 hover:border-blue-500 transition-all duration-300 hover:scale-105 shadow-2xl">
                                        <img
                                            src={img.imageUrl}
                                            alt="Earth Scan"
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end items-center pb-6">
                                            <div className="text-blue-300 text-xs font-mono font-bold flex items-center gap-1">
                                                <Clock size={10} />
                                                {img.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono">
                                                {img.date.toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
