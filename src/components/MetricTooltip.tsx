import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPACE_METRICS } from '../data/spaceDefinitions';
import { Info } from 'lucide-react';
import clsx from 'clsx';

interface MetricTooltipProps {
    termKey: keyof typeof SPACE_METRICS;
    children: React.ReactNode;
    className?: string; // To allow existing classes to pass through
    showIcon?: boolean; // Option to show a tiny 'i' icon
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ termKey, children, className, showIcon = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const definition = SPACE_METRICS[termKey];

    if (!definition) return <div className={className}>{children}</div>;

    return (
        <div
            className={clsx("relative inline-flex items-center group cursor-help", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered(!isHovered)} // Mobile tap support
        >
            {/* Original Content (Preserved Design) */}
            {children}

            {/* Optional Indicator */}
            {showIcon && (
                <Info size={10} className="ml-1 text-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Floating Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-48 pointer-events-none"
                    >
                        <div className="bg-[#0b0c10]/95 backdrop-blur-md border border-neon-cyan/30 rounded-lg p-3 shadow-[0_0_15px_rgba(0,243,255,0.15)] text-left">
                            <div className="text-neon-cyan text-[10px] font-bold uppercase tracking-widest mb-1 border-b border-white/10 pb-1">
                                {definition.label}
                            </div>
                            <div className="text-gray-300 text-[11px] leading-relaxed font-sans">
                                {definition.simple}
                            </div>
                            {/* Tiny Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-neon-cyan/30" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
