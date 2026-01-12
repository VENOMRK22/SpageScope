import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { StarBackground } from './StarBackground';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const isFullScreenPage = location.pathname === '/star-gazer' || location.pathname === '/cosmic-weather' || location.pathname === '/mission-control';

    // Trigger Resize Event on Toggle to update Globe/Canvas widths
    useEffect(() => {
        // Short delay to allow CSS transition to start/finish
        const trigger = () => window.dispatchEvent(new Event('resize'));
        const t1 = setTimeout(trigger, 50);
        const t2 = setTimeout(trigger, 305); // After 300ms transition
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [isSidebarOpen]);

    const isWeatherPage = location.pathname === '/cosmic-weather';

    return (
        <div className="flex min-h-screen bg-transparent text-starlight-white font-sans overflow-hidden">
            {!isWeatherPage && location.pathname !== '/mission-control' && <StarBackground />}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

            <main className={clsx(
                "flex-1 relative z-10 transition-all duration-300 flex flex-col", // Added flex-col to support h-full children
                // Conditional Scroll: HIDDEN for full-screen apps (let inner components scroll), AUTO for normal pages
                isFullScreenPage ? "h-screen overflow-hidden" : "min-h-screen overflow-y-auto",
                isSidebarOpen ? "lg:ml-64" : "lg:ml-0",
                // Conditional Padding: Remove padding for full-screen pages
                isFullScreenPage ? "p-0" : "p-8"
            )}>
                <div className={clsx(
                    "relative mx-auto mt-16 lg:mt-0",
                    // Conditional Max Width: Full width for star-gazer
                    isFullScreenPage ? "w-full h-full max-w-none" : "max-w-7xl"
                )}>
                    <Outlet context={{ isSidebarOpen, setSidebarOpen }} />
                </div>
            </main>
        </div>
    );
};
