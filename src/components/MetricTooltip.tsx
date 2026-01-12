import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
    const triggerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [arrowLeft, setArrowLeft] = useState(50); // Percent
    const definition = SPACE_METRICS[termKey];

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const tooltipWidth = 192; // w-48 = 12rem = 192px
            const margin = 10; // Screen edge margin

            // 1. Ideal Center Position
            let idealLeft = rect.left + rect.width / 2;

            // 2. Clamp to Screen Edges
            // Min Left (Left Edge + half width + margin) -> Actually, we are positioning center, so let's think in terms of Box Left Edge.
            // Let's position based on the Tooltip's Left Edge instead of Center for easier clamping.

            let boxLeft = idealLeft - tooltipWidth / 2;

            // Clamp Limit: 
            // Min: margin
            // Max: window.width - width - margin
            const maxLeft = window.innerWidth - tooltipWidth - margin;
            const minLeft = margin;

            // Apply Clamp
            if (boxLeft < minLeft) boxLeft = minLeft;
            if (boxLeft > maxLeft) boxLeft = maxLeft;

            setCoords({
                top: rect.top - 10, // 10px spacing above
                left: boxLeft
            });

            // 3. Calculate Arrow Position (Relative to Box)
            // Arrow needs to point to 'idealLeft'.
            // Arrow is absolute inside box. Box starts at 'boxLeft'.
            // Arrow Offset = idealLeft - boxLeft.
            // Convert to percentage for robustness or pixels? Pixels is fine.
            setArrowLeft(idealLeft - boxLeft);
        }
    };

    useEffect(() => {
        if (isHovered) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true); // true for capture
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isHovered]);

    if (!definition) return <div className={className}>{children}</div>;

    const tooltip = (
        <AnimatePresence>
            {isHovered && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="fixed z-[9999] w-48 pointer-events-none"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: 'translateY(-100%)' // Just shift up
                    }}
                >
                    <div className="bg-[#0b0c10]/95 backdrop-blur-md border border-neon-cyan/30 rounded-lg p-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] text-left relative">
                        <div className="text-neon-cyan text-[10px] font-bold uppercase tracking-widest mb-1 border-b border-white/10 pb-1">
                            {definition.label}
                        </div>
                        <div className="text-gray-300 text-[11px] leading-relaxed font-sans">
                            {definition.simple}
                        </div>
                        {/* Dynamic Arrow */}
                        <div
                            className="absolute top-full -mt-[1px] border-4 border-transparent border-t-neon-cyan/30"
                            style={{ left: arrowLeft, transform: 'translateX(-50%)' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div
            ref={triggerRef}
            className={clsx("relative inline-flex items-center group cursor-help select-none", className)}
            onMouseEnter={() => { setIsHovered(true); updatePosition(); }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered(!isHovered)} // Mobile tap support
        >
            {/* Original Content (Preserved Design) */}
            {children}

            {/* Optional Indicator */}
            {showIcon && (
                <Info size={10} className="ml-1 text-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Portal Tooltip to Body to escape overflow:hidden */}
            {ReactDOM.createPortal(tooltip, document.body)}
        </div>
    );
};
