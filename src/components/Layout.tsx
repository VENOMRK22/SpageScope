import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { StarBackground } from './StarBackground';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const isFullScreenPage = location.pathname === '/star-gazer';

    // Trigger Resize Event on Toggle to update Globe/Canvas widths
    useEffect(() => {
        // Short delay to allow CSS transition to start/finish
        const trigger = () => window.dispatchEvent(new Event('resize'));
        const t1 = setTimeout(trigger, 50);
        const t2 = setTimeout(trigger, 305); // After 300ms transition
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [isSidebarOpen]);

    return (
        <div className="flex min-h-screen bg-transparent text-starlight-white font-sans overflow-hidden">
            <StarBackground />
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

            <main className={clsx(
                "flex-1 relative overflow-y-auto min-h-screen z-10 transition-all duration-300",
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
