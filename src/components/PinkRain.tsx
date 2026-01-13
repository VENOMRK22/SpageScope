import React, { useEffect, useRef } from 'react';

export const PinkRain = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const globeImg = new Image();
        globeImg.src = '/login.gif';

        const particles: Particle[] = [];
        const particleCount = 150;

        class Particle {
            x: number;
            y: number;
            speed: number;
            opacity: number;
            color: string;
            size: number;
            isGlobe: boolean;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.speed = Math.random() * 2 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;

                // 10% chance to be a globe
                this.isGlobe = Math.random() < 0.1;

                if (this.isGlobe) {
                    this.size = Math.random() * 20 + 10; // Larger for globes
                    this.color = ''; // Not used for globes
                } else {
                    this.size = Math.random() * 2 + 1; // Small for dots
                    const colors = ['#ec4899', '#d946ef', '#f472b6', '#c026d3'];
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                }
            }

            update() {
                this.y += this.speed;
                if (this.y > height) {
                    this.y = -50; // Start slightly above for globes
                    this.x = Math.random() * width;
                }
            }

            draw() {
                if (!ctx) return;

                ctx.globalAlpha = this.opacity;

                if (this.isGlobe && globeImg.complete) {
                    ctx.drawImage(globeImg, this.x, this.y, this.size, this.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
        />
    );
};
