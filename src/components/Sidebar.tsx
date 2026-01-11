import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Globe, Telescope, Sun, Rocket, Satellite, GraduationCap, Menu } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { path: '/', label: 'Home', icon: Globe },
    { path: '/star-gazer', label: 'Star Gazer', icon: Telescope },
    { path: '/cosmic-weather', label: 'Cosmic Weather', icon: Sun },
    { path: '/mission-control', label: 'Mission Control', icon: Rocket },
    { path: '/satellite-savior', label: 'Satellite Savior', icon: Satellite },
    { path: '/academy', label: 'The Academy', icon: GraduationCap },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    return (
        <>
            {/* Closed State Toggle: Minimalist Floating Icon */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-6 left-6 z-50 sidebar-interactive text-neon-cyan/70 hover:text-neon-cyan transition-colors duration-300"
                    aria-label="Open Sidebar"
                >
                    <Menu size={20} />
                </button>
            )}

            <div className={clsx(
                "fixed inset-y-0 left-0 z-40 w-64 glass-sidebar transform transition-transform duration-300 ease-in-out sidebar-interactive",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header with Integrated Toggle */}
                <div className="flex items-center h-20 border-b border-white/10 px-6 justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="mr-4 text-neon-cyan/70 hover:text-white transition-colors duration-300 focus:outline-none"
                            aria-label="Close Sidebar"
                        >
                            <Menu size={20} />
                        </button>

                        <h1 className="text-xl font-bold text-neon-cyan font-orbitron tracking-widest cursor-pointer" onClick={() => { setIsOpen(false); }}>
                            SPACESCOPE
                        </h1>
                    </div>
                </div>

                <nav className="mt-8 space-y-2 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)} // FORCE AUTO-CLOSE
                                className={({ isActive }) => clsx(
                                    "flex items-center px-6 py-4 text-sm font-medium transition-all duration-300 rounded-r-full",
                                    isActive
                                        ? "nav-item-active"
                                        : "text-muted-gray nav-item-hover"
                                )}
                            >
                                <Icon size={20} className={clsx("mr-4", isActive ? "text-neon-cyan" : "text-muted-gray group-hover:text-white")} />
                                <span className="font-orbitron tracking-wide">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="absolute bottom-8 w-full px-6">
                    <div className="glass-panel p-4 rounded-xl text-xs text-muted-gray text-center">
                        <p>System Status: <span className="text-teal-400">ONLINE</span></p>
                        <p className="mt-1">V 1.0.0 Alpha</p>
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
