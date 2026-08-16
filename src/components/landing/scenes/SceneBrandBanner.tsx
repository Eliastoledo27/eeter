'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import Image from 'next/image';

interface SceneBrandBannerProps {
    className?: string;
}

/**
 * SceneBrandBanner
 * Sección con la imagen oficial "banner éter.png" montada en alta resolución
 * con una sutil y natural bruma atmosférica realista (sin brillos artificiales ni neón falso).
 */
export function SceneBrandBanner({ className }: SceneBrandBannerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = canvas.offsetWidth || 1400);
        let height = (canvas.height = canvas.offsetHeight || 600);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth || 1400;
            height = canvas.height = canvas.offsetHeight || 600;
        };
        window.addEventListener('resize', handleResize);

        // Natural, subtle, organic mist puff
        class NaturalMist {
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
            alpha: number;
            maxAlpha: number;
            rotation: number;
            vRot: number;

            constructor(initialX?: number) {
                this.x = initialX !== undefined ? initialX : Math.random() * width;
                this.y = height * 0.45 + Math.random() * (height * 0.45);
                this.radius = 120 + Math.random() * 180;
                this.vx = 0.2 + Math.random() * 0.4; // Very slow, gentle drift
                this.vy = (Math.random() - 0.5) * 0.15; // Barely rising/falling
                this.maxAlpha = 0.06 + Math.random() * 0.08; // Subtle (6% - 14% max)
                this.alpha = 0.01;
                this.rotation = Math.random() * Math.PI * 2;
                this.vRot = (Math.random() - 0.5) * 0.003;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.vRot;

                // Gentle fadeIn and fadeOut
                if (this.x < width * 0.3) {
                    if (this.alpha < this.maxAlpha) this.alpha += 0.001;
                } else if (this.x > width * 0.75) {
                    this.alpha -= 0.0012;
                }

                // Seamless loop
                if (this.x - this.radius > width || this.alpha <= 0) {
                    this.x = -this.radius;
                    this.y = height * 0.45 + Math.random() * (height * 0.45);
                    this.radius = 110 + Math.random() * 190;
                    this.alpha = 0.01;
                    this.maxAlpha = 0.06 + Math.random() * 0.08;
                }
            }

            draw(context: CanvasRenderingContext2D) {
                context.save();
                context.translate(this.x, this.y);
                context.rotate(this.rotation);

                // Very soft organic radial feathering (natural monochrome studio steam)
                const grad = context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
                const currentAlpha = Math.max(0, this.alpha);

                grad.addColorStop(0, `rgba(230, 235, 240, ${currentAlpha})`);
                grad.addColorStop(0.3, `rgba(210, 218, 225, ${currentAlpha * 0.65})`);
                grad.addColorStop(0.65, `rgba(180, 190, 200, ${currentAlpha * 0.25})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                context.fillStyle = grad;
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2);
                context.fill();
                context.restore();
            }
        }

        // Initialize soft mist layers
        const mistCount = 20;
        const mistClouds: NaturalMist[] = [];
        for (let i = 0; i < mistCount; i++) {
            mistClouds.push(new NaturalMist(Math.random() * width));
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            mistClouds.forEach((cloud) => {
                cloud.update();
                cloud.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <section
            id="brand-banner"
            className={`relative w-full overflow-hidden bg-[#050505] flex items-center justify-center select-none border-b border-white/5 ${className || ''}`}
        >
            {/* Banner Container with proportional responsive aspect ratio */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[640px] min-h-[320px]">
                <Image
                    src="/images/eter-laboratorio-banner.png"
                    alt="ÉTER Studio Laboratorio"
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-cover object-center filter contrast-[1.05] brightness-[0.98]"
                />

                {/* SUBTLE, ORGANIC NATURAL MIST CANVAS (NO FAKE NEON OR BRIGHTNESS) */}
                <canvas
                    ref={canvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen opacity-70 z-10"
                />

                {/* Smooth top and bottom gradient fades to melt with adjacent scenes */}
                <div className="absolute inset-x-0 top-0 h-20 sm:h-32 bg-gradient-to-b from-[#050505] via-[#050505]/50 to-transparent z-20" />
                <div className="absolute inset-x-0 bottom-0 h-20 sm:h-32 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent z-20" />
                
                {/* Subtle side vignette */}
                <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#050505]/70 to-transparent z-20" />
                <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#050505]/70 to-transparent z-20" />
            </div>
        </section>
    );
}
