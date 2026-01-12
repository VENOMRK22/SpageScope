import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Satellite, Radio, Newspaper } from 'lucide-react';

// --- MOCK DATA FALLBACKS ---
// --- MOCK DATA FALLBACKS (GOLDEN SET - LOCAL ASSETS) ---
const MOCK_GALLERY: ApodItem[] = [
    {
        date: "2024-01-10",
        title: "The Great Nebula in Orion",
        url: "/images/deep-field/orion.png",
        media_type: "image",
        explanation: "The Great Nebula in Orion is a colorful place.",
        service_version: "v1"
    },
    {
        date: "2024-01-09",
        title: "Spiral Galaxy M101",
        url: "/images/deep-field/m101.png",
        media_type: "image",
        explanation: "A distinct spiral galaxy.",
        service_version: "v1"
    },
    {
        date: "2024-01-08",
        title: "Carina Nebula",
        url: "/images/deep-field/carina.png",
        media_type: "image",
        explanation: "Star birth in the Carina Nebula.",
        service_version: "v1"
    },
    {
        date: "2024-01-07",
        title: "The Milky Way Core",
        url: "/images/deep-field/milkyway.png",
        media_type: "image",
        explanation: "Our home galaxy's dense center.",
        service_version: "v1"
    },
    {
        date: "2024-01-06",
        title: "Saturn's Rings",
        url: "/images/deep-field/saturn.png",
        media_type: "image",
        explanation: "The majestic ring system of Saturn.",
        service_version: "v1"
    },
    {
        date: "2024-01-05",
        title: "Martian Surface",
        url: "/images/deep-field/mars.png",
        media_type: "image",
        explanation: "The dusty red surface of Mars.",
        service_version: "v1"
    },
    {
        date: "2024-01-04",
        title: "Pillars of Creation",
        url: "/images/deep-field/pillars.png",
        media_type: "image",
        explanation: "A dense cluster of distant galaxies.",
        service_version: "v1"
    },
    {
        date: "2024-01-03",
        title: "Hubble Deep Field",
        url: "/images/deep-field/hubble.png",
        media_type: "image",
        explanation: "Interstellar dust illuminated by starlight.",
        service_version: "v1"
    },
    {
        date: "2024-01-02",
        title: "Jupiter's Storms",
        url: "/images/deep-field/jupiter.png",
        media_type: "image",
        explanation: "Turbulent storms in Jupiter's atmosphere.",
        service_version: "v1"
    },
    {
        date: "2024-01-01",
        title: "Andromeda Galaxy",
        url: "/images/deep-field/andromeda.png",
        media_type: "image",
        explanation: "Our nearest galactic neighbor.",
        service_version: "v1"
    }
];

const MOCK_NEWS: NewsItem[] = [
    {
        id: 1,
        title: "NASA's Artemis II Mission Updates",
        url: "https://www.nasa.gov/artemis",
        image_url: "https://images-assets.nasa.gov/image/artemisII_crew/artemisII_crew~orig.jpg",
        news_site: "NASA",
        summary: "Latest updates on the crewed mission around the Moon.",
        published_at: new Date().toISOString()
    },
    {
        id: 2,
        title: "SpaceX Starship Flight Test Verification",
        url: "https://www.spacex.com",
        image_url: "https://sx-content-9478.kxcdn.com/uploads/2023/04/Starship_Flight_Test_Descent.jpg",
        news_site: "SpaceX",
        summary: "Engineers preparing for the next major orbital flight test.",
        published_at: new Date().toISOString()
    },
    {
        id: 3,
        title: "James Webb Telescope Finds Water Signs",
        url: "https://webbtelescope.org",
        image_url: "https://stsci-opo.org/STScI-01H8QZ27C9F3G8X2W5S5.jpg",
        news_site: "STScI",
        summary: "New spectral analysis reveals potential water vapor on exoplanet K2-18 b.",
        published_at: new Date().toISOString()
    },
    {
        id: 4,
        title: "ESA Juice Mission Enters Crucial Phase",
        url: "https://www.esa.int",
        image_url: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2023/04/juice_deployment_monitoring_camera_2/24855474-1-eng-GB/Juice_deployment_monitoring_camera_2_pillars.jpg",
        news_site: "ESA",
        summary: "Jupiter Icy Moons Explorer successfully deploys solar arrays.",
        published_at: new Date().toISOString()
    }
];

// Type Definitions
interface ApodItem {
    date: string;
    explanation: string;
    hdurl?: string;
    url: string;
    media_type: string;
    service_version: string;
    title: string;
    copyright?: string;
}

interface NewsItem {
    id: number;
    title: string;
    url: string;
    image_url: string;
    news_site: string;
    summary: string;
    published_at: string;
}



export const Chronicles = () => {
    const [galleryItems, setGalleryItems] = useState<ApodItem[]>([]);
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSimulated, setIsSimulated] = useState(false);
    const [statusMessage, setStatusMessage] = useState("LIVE UPLINK ESTABLISHED");

    useEffect(() => {
        const fetchDeepFieldData = async () => {
            try {
                // 1. Calculate Dates for APOD
                const formatDate = (date: Date) => date.toISOString().split('T')[0];

                const today = new Date();
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - 10); // Standard 10 day lookback

                let startDate = formatDate(pastDate);
                let endDate = formatDate(today);

                // Use Env Key or Fallback to DEMO_KEY
                const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

                // Helper to fetch APOD with a specific date range
                const fetchApod = async (start: string, end: string) => {
                    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`);
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`NASA API Error ${res.status}: ${errorText}`); // Capture detailed error
                    }
                    return res.json();
                };

                // 2. Fetch APIs in Parallel with Retry Logic for APOD
                let apodData = null;
                try {
                    // Attempt 1: Try fetching up to "Today"
                    apodData = await fetchApod(startDate, endDate);
                } catch (e: any) {
                    console.warn(`Standard APOD fetch failed: ${e.message}, retrying with yesterday...`);

                    // Attempt 2: If "Today" fails matches (future date), try up to "Yesterday"
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    endDate = formatDate(yesterday);

                    const pastDateRetry = new Date(yesterday);
                    pastDateRetry.setDate(yesterday.getDate() - 10);
                    startDate = formatDate(pastDateRetry);

                    try {
                        apodData = await fetchApod(startDate, endDate);
                    } catch (retryErr: any) {
                        console.error("Retry APOD fetch failed:", retryErr);
                        // Store the specific error to show the user
                        if (retryErr.message.includes("429")) {
                            setStatusMessage("SIMULATION MODE (API RATE LIMIT REACHED)");
                        } else if (retryErr.message.includes("400")) {
                            setStatusMessage("SIMULATION MODE (DATE SYNC ERROR)");
                        } else {
                            setStatusMessage("SIMULATION MODE (CONNECTION FAILED)");
                        }
                        setIsSimulated(true);
                    }
                }

                const newsRes = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=16');

                // 3. Process APOD
                if (apodData && Array.isArray(apodData)) {
                    const images = apodData.filter((item: ApodItem) => item.media_type === 'image').reverse();
                    if (images.length > 0) {
                        setGalleryItems(images);
                        setIsSimulated(false);
                        setStatusMessage("LIVE UPLINK ESTABLISHED");
                    } else {
                        setStatusMessage("SIMULATION MODE (NO IMAGES FOUND)");
                        setIsSimulated(true);
                        setGalleryItems(MOCK_GALLERY);
                    }
                } else if (!isSimulated) {
                    // Only set mock gallery if we haven't already set it in the catch block
                    // Wait, if apodData is null/invalid but NO error was caught (weird edge case)
                    if (!apodData && !isSimulated) {
                        setStatusMessage("SIMULATION MODE (INVALID DATA)");
                        setIsSimulated(true);
                        setGalleryItems(MOCK_GALLERY);
                    }
                }

                // If fallback triggered, ensure we fill data
                if (isSimulated || !apodData) {
                    setGalleryItems(MOCK_GALLERY);
                }


                // 4. Process News
                if (newsRes.ok) {
                    const newsData = await newsRes.json();
                    setNewsItems(newsData.results.length > 0 ? newsData.results : MOCK_NEWS);
                } else {
                    console.warn("News API failed, using mock data.");
                    setNewsItems(MOCK_NEWS);
                }

            } catch (err: any) {
                console.error("Deep Field Uplink Failed (Using Simulation):", err);
                setGalleryItems(MOCK_GALLERY);
                setNewsItems(MOCK_NEWS);
                setIsSimulated(true);
                // Last ditch error message update if not already set
                if (statusMessage === "LIVE UPLINK ESTABLISHED") {
                    setStatusMessage("SIMULATION MODE (SYSTEM FAILURE)");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDeepFieldData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
                <Satellite className="w-12 h-12 animate-pulse text-purple-400 mb-4" />
                <h2 className="text-xl font-orbitron tracking-widest animate-pulse text-purple-300">
                    SENSORS CALIBRATING...
                </h2>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#050a14] text-white overflow-y-auto relative scroll-smooth selection:bg-purple-500/30">
            {/* Subtle Gradient Background (Consistent with System) */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-black to-black pointer-events-none z-0"></div>

            <div className="relative z-10 p-6 md:p-12 max-w-[1600px] mx-auto">

                {/* --- HEADER --- */}
                <header className="mb-16 border-b border-white/10 pb-8">
                    <h1 className="text-5xl md:text-7xl font-black font-orbitron tracking-tighter text-white mb-4">
                        CHRONICLES
                    </h1>
                    <div className="flex items-center gap-4 text-purple-300 font-mono text-sm tracking-widest uppercase">
                        <Radio size={16} className={isSimulated ? "text-orange-500" : "text-green-500 animate-pulse"} />
                        <span>Deep Field Transmissions</span>
                        <span className="text-gray-600">//</span>
                        <span className={isSimulated ? "text-orange-500" : "text-green-500"}>
                            {statusMessage}
                        </span>
                    </div>
                </header>

                {/* --- SECTION 1: VISUAL LOGS (GALLERY) --- */}
                <section className="mb-20">
                    {/* Increased Header Size as Requested */}
                    <div className="flex items-center gap-3 mb-8">
                        <Satellite className="text-purple-400 w-6 h-6" />
                        <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-white tracking-wide">
                            VISUAL LOGS <span className="text-gray-500 text-lg md:text-xl font-normal ml-2 list-none">/ RECENT CAPTURES</span>
                        </h2>
                    </div>

                    <div className="w-full overflow-hidden relative group rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">

                        {/* Gradient Masks for scrolling effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050a14] to-transparent z-20 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050a14] to-transparent z-20 pointer-events-none" />

                        {/* Scrolling Container */}
                        <div className="py-12"> {/* increased padding for pop-out effect */}
                            <motion.div
                                className="flex gap-8 px-6"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 60,
                                }}
                                style={{ width: "max-content" }}
                            >
                                {/* Double data for infinite loop */}
                                {[...galleryItems, ...galleryItems].map((item, idx) => (
                                    <div
                                        key={`${item.date}-${idx}`}
                                        className="relative w-[300px] md:w-[400px] aspect-[16/9] bg-gray-900 rounded-xl border border-white/10 group/card cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:border-purple-400 z-10 hover:z-30"
                                    >
                                        <div className="w-full h-full overflow-hidden rounded-xl">
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png';
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                            <p className="text-xs text-purple-300 font-mono mb-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">{item.date}</p>
                                            <h3 className="text-sm font-bold font-orbitron text-white line-clamp-1 group-hover/card:text-purple-200">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* --- SECTION 2: INTEL FEED (NEWS) --- */}
                <section className="relative rounded-3xl p-8 border border-white/5 bg-white/[0.02] overflow-hidden">
                    {/* Background Texture for News Section */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <img
                            src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop"
                            alt="Starfield Texture"
                            className="w-full h-full object-cover mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-[#050a14]"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Newspaper className="text-cyan-400 w-6 h-6" />
                            <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-white tracking-wide">
                                INTEL FEED <span className="text-gray-500 text-lg md:text-xl font-normal ml-2">/ GLOBAL UPDATES</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {newsItems.map((news) => (
                                <a
                                    key={news.id}
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col h-full bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                                >
                                    {/* Image */}
                                    <div className="aspect-video w-full overflow-hidden relative">
                                        <img
                                            src={news.image_url}
                                            alt={news.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                // Fallback if individual news image fails
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop';
                                            }}
                                            loading="lazy"
                                        />
                                        {/* Date Badge */}
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 text-[10px] font-mono text-gray-300 rounded border border-white/10">
                                            {new Date(news.published_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/30 px-2 py-1 rounded">
                                                {news.news_site}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-200 mb-3 leading-snug group-hover:text-white transition-colors">
                                            {news.title}
                                        </h3>

                                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                            {news.summary}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-cyan-300 transition-colors mt-auto">
                                            Read Full Report <ExternalLink size={12} />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-20 border-t border-white/10 pt-8 text-center text-gray-600 font-mono text-xs">
                    <p>ANTIGRAVITY SYSTEMS // DEEP FIELD MONITORING STATION</p>
                </footer>

            </div>
        </div>
    );
};
