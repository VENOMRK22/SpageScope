import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CustomStarField = () => {
    const groupRef = useRef<THREE.Group>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Global mouse listener + Iframe Bridge
    useEffect(() => {
        const updateMouse = (clientX: number, clientY: number) => {
            mouseRef.current = {
                x: (clientX / window.innerWidth) * 2 - 1,
                y: -(clientY / window.innerHeight) * 2 + 1
            };
        };

        const handleMouseMove = (event: MouseEvent) => {
            // ISOLATION: Ignore events from Sidebar (User Request)
            if ((event.target as HTMLElement).closest('.sidebar-interactive')) return;

            updateMouse(event.clientX, event.clientY);
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'MOUSE_MOVE_FORWARD') {
                updateMouse(event.data.clientX, event.data.clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { capture: true });
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove, { capture: true });
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Generate 5000 random static positions
    // This runs ONCE. unique positions, never changing = NO TWINKLING.
    const [positions] = useMemo(() => {
        const positions = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            const r = 300; // Radius
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return [positions];
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;

        // 1. Constant cosmic drift
        groupRef.current.rotation.z += 0.0001;

        // 2. Mouse Parallax
        const { x, y } = mouseRef.current;
        const targetX = y * 0.3;
        const targetY = x * 0.3;
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.7} // Small, sharp stars
                    color="white"
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.8}
                    fog={false}
                />
            </points>
        </group>
    );
};

export const StarBackground: React.FC<{ className?: string }> = ({ className = "fixed inset-0 z-0 bg-void-black" }) => {
    return (
        <div className={className}>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-void-black via-transparent to-hologram-blue/20 opacity-80 z-0 pointer-events-none" />

            <Canvas
                camera={{ position: [0, 0, 1] }}
                gl={{ antialias: true, alpha: true }}
                className="w-full h-full pointer-events-none"
            >
                <CustomStarField />
            </Canvas>
        </div>
    );
};
