import React, { useState, useContext, useEffect, useRef } from 'react';
import { Search, Rocket, Telescope, X, ArrowRight } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const SearchModule: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { events, launches, loading } = useContext(DataContext);
    const navigate = useNavigate();

    // Toggle Search Bar
    const toggleSearch = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery(''); // Clear on close
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (query === '') setIsOpen(false); // Only auto-close if empty
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [query]);

    // Search Logic
    useEffect(() => {
        if (query.trim() === '' || loading) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // 1. Filter Events (Star Gazer)
        const matchedEvents = events.filter(e =>
            e.title.toLowerCase().includes(lowerQuery) ||
            e.description.toLowerCase().includes(lowerQuery)
        ).map(e => ({ type: 'event', data: e }));

        // 2. Filter Launches (Mission Control)
        const matchedLaunches = launches.filter(l =>
            l.name.toLowerCase().includes(lowerQuery) ||
            l.mission?.description?.toLowerCase().includes(lowerQuery) ||
            l.launch_service_provider?.name.toLowerCase().includes(lowerQuery)
        ).map(l => ({ type: 'launch', data: l }));

        setResults([...matchedEvents, ...matchedLaunches].slice(0, 5)); // Limit to 5
    }, [query, events, launches, loading]);

    const handleResultClick = (result: any) => {
        if (result.type === 'event') {
            navigate('/star-gazer', { state: { eventId: result.data.id } });
        } else {
            navigate('/mission-control', { state: { launchId: result.data.id } });
        }
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={containerRef} className="absolute top-6 right-24 z-50 pointer-events-auto flex items-center font-sans space-x-2">
            {/* NASA Solar System Button */}
            {!isOpen && (
                <button
                    onClick={() => navigate('/solar-system')}
                    className="w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-md border border-neon-cyan/30 rounded-full hover:bg-neon-cyan/10 hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
                    title="NASA Solar System Eyes"
                >
                    <img src="/nasa.svg" alt="NASA" className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                </button>
            )}

            {/* Search Bar Container */}
            <div className={clsx(
                "flex items-center bg-black/60 backdrop-blur-md border border-neon-cyan/30 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(0,243,255,0.1)]",
                isOpen ? "w-80 px-4 py-2" : "w-12 h-12 justify-center cursor-pointer hover:bg-neon-cyan/10"
            )}>
                {isOpen ? (
                    <>
                        <Search size={18} className="text-neon-cyan/70 min-w-[18px]" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search Cosmos..."
                            className="bg-transparent border-none outline-none text-white text-sm ml-3 w-full font-orbitron tracking-wide placeholder-white/30"
                        />
                        <button onClick={() => { setQuery(''); setIsOpen(false); }} className="ml-2 text-white/50 hover:text-white">
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <button onClick={toggleSearch} className="text-neon-cyan transition-transform duration-300 hover:scale-110">
                        <Search size={20} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="mt-2 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/40 tracking-widest border-b border-white/5">
                        System Search Results
                    </div>
                    <div>
                        {results.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleResultClick(item)}
                                className="w-full text-left px-4 py-3 hover:bg-neon-cyan/20 border-b border-white/5 last:border-0 transition-colors group flex items-start"
                            >
                                <div className="mt-1 mr-3 text-neon-cyan/70 group-hover:text-neon-cyan">
                                    {item.type === 'event' ? <Telescope size={16} /> : <Rocket size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                                        {item.type === 'event' ? item.data.title : item.data.name}
                                    </div>
                                    <div className="text-[10px] text-gray-500 group-hover:text-gray-400 truncate">
                                        {item.type === 'event' ? item.data.date : item.data.launch_service_provider?.name}
                                    </div>
                                </div>
                                <ArrowRight size={14} className="ml-2 text-transparent group-hover:text-neon-cyan transition-colors self-center" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results State */}
            {isOpen && query.length > 1 && results.length === 0 && (
                <div className="mt-2 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center text-gray-400 text-sm animate-in fade-in slide-in-from-top-2">
                    No signals found.
                </div>
            )}
        </div>
    );
};
