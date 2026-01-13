import React, { useContext } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Globe, Telescope, Sun, Rocket, Satellite, GraduationCap, Menu, LogOut, User, Radio } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { path: '/', label: 'Home', icon: Globe },
    { path: '/star-gazer', label: 'Star Gazer', icon: Telescope },
    { path: '/cosmic-weather', label: 'Cosmic Weather', icon: Sun },
    { path: '/mission-control', label: 'Mission Control', icon: Rocket },
    { path: '/satellite-savior', label: 'Satellite Savior', icon: Satellite },
    { path: '/deep-field', label: 'Deep Field', icon: Radio },
    { path: '/academy', label: 'The Academy', icon: GraduationCap },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { loading } = useContext(DataContext); // Access loading state

    return (
        <>
            {/* System Status - Sliding Text - HOME ONLY */}
            {!loading && location.pathname === '/' && (
                <div className={clsx(
                    "fixed top-7 z-50 transition-all duration-300 ease-in-out text-[10px] text-neon-cyan/50 font-orbitron tracking-widest pointer-events-none whitespace-nowrap",
                    isOpen ? "left-[17rem]" : "left-16"
                )}>
                    SYSTEM STATUS: ONLINE
                </div>
            )}
            {/* Closed State Toggle: Minimalist Floating Icon */}
            {/* Closed State Toggle: Minimalist Floating Icon */}
            {!isOpen && !['/mission-control', '/star-gazer', '/cosmic-weather', '/solar-system'].includes(location.pathname) && (
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

                {/* User Profile & Logout (Replaces Static Status) */}
                {/* User Profile & Logout - Redesigned */}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-cyan to-purple-500 p-[1px] shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <User size={14} className="text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-white tracking-wide truncate">{user?.email?.split('@')[0] || "OPERATOR"}</span>
                                <span className="text-[10px] text-neon-cyan/70 font-orbitron tracking-wider flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green mr-1.5 animate-pulse" />
                                    ONLINE
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-full transition-all duration-300"
                            title="Disconnect"
                        >
                            <LogOut size={16} />
                        </button>
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
