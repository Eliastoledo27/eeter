'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [label, setLabel] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 500, damping: 40 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 40 });
    const isMounted = useRef(false);

    useEffect(() => {
        // Only enable on desktop
        if (window.matchMedia('(hover: none)').matches) return;
        isMounted.current = true;
        document.body.classList.add('custom-cursor-active');

        const onMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const onEnterImage = (e: Event) => {
            const el = e.currentTarget as HTMLElement;
            setLabel(el.dataset.cursorLabel || 'VER');
            setIsExpanded(true);
        };

        const onLeaveImage = () => {
            setLabel('');
            setIsExpanded(false);
        };

        const onEnterCta = () => {
            setLabel('');
            setIsExpanded(true);
        };

        window.addEventListener('mousemove', onMove);

        // Attach to product images and CTA buttons
        const images = document.querySelectorAll<HTMLElement>('[data-cursor="view"]');
        const ctas = document.querySelectorAll<HTMLElement>('[data-cursor="cta"]');
        images.forEach(el => {
            el.addEventListener('mouseenter', onEnterImage);
            el.addEventListener('mouseleave', onLeaveImage);
        });
        ctas.forEach(el => {
            el.addEventListener('mouseenter', onEnterCta);
            el.addEventListener('mouseleave', onLeaveImage);
        });

        return () => {
            if (isMounted.current) {
                document.body.classList.remove('custom-cursor-active');
            }
            window.removeEventListener('mousemove', onMove);
            images.forEach(el => {
                el.removeEventListener('mouseenter', onEnterImage);
                el.removeEventListener('mouseleave', onLeaveImage);
            });
            ctas.forEach(el => {
                el.removeEventListener('mouseenter', onEnterCta);
                el.removeEventListener('mouseleave', onLeaveImage);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Outer ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-white/40 flex items-center justify-center"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: isExpanded ? 72 : 32,
                    height: isExpanded ? 72 : 32,
                    borderColor: isExpanded ? '#00E5FF' : 'rgba(255,255,255,0.4)',
                    transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
                }}
            >
                {label && (
                    <span className="text-[8px] font-black tracking-[0.15em] uppercase text-[#00E5FF]">
                        {label}
                    </span>
                )}
            </motion.div>

            {/* Dot center */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-white"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: isExpanded ? 6 : 4,
                    height: isExpanded ? 6 : 4,
                    backgroundColor: isExpanded ? '#00E5FF' : 'white',
                    transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease',
                }}
            />
        </>
    );
}
