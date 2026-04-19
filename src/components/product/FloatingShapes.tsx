'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

interface Shape {
    type: 'triangle' | 'rectangle' | 'circle' | 'ring'
    color: string
    size: number
    x: string
    y: string
    speed: number       // parallax multiplier
    rotation?: number   // initial rotation
    rotationSpeed?: number
    opacity?: number
    blur?: number
}

const shapes: Shape[] = [
    // Large triangle top-right
    { type: 'triangle', color: '#00E5FF', size: 220, x: '75%', y: '5%', speed: -180, rotation: 15, rotationSpeed: 25, opacity: 0.3, blur: 10 },
    // Cyan circle mid-left  
    { type: 'circle', color: '#00B3FF', size: 140, x: '5%', y: '30%', speed: -100, opacity: 0.2, blur: 40 },
    // Orange diagonal slash -> Cyan
    { type: 'rectangle', color: '#00E5FF', size: 300, x: '60%', y: '15%', speed: -250, rotation: -35, opacity: 0.1, blur: 5 },
    // Small triangle left
    { type: 'triangle', color: '#50EFFF', size: 80, x: '15%', y: '60%', speed: -120, rotation: 45, rotationSpeed: -15, opacity: 0.4 },
    // Ring mid-right
    { type: 'ring', color: '#00E5FF', size: 200, x: '80%', y: '50%', speed: -200, rotationSpeed: 30, opacity: 0.15 },
    // Big cyan triangle bottom
    { type: 'triangle', color: '#0088FF', size: 180, x: '30%', y: '75%', speed: -300, rotation: -20, rotationSpeed: 20, opacity: 0.2 },
    // Large orange circle glow bottom-right -> Cyan Glow
    { type: 'circle', color: '#00E5FF', size: 250, x: '85%', y: '85%', speed: -150, opacity: 0.1, blur: 60 },
    // Small cyan rectangle
    { type: 'rectangle', color: '#00E5FF', size: 100, x: '10%', y: '90%', speed: -350, rotation: 20, opacity: 0.15 },
]

function ShapeRenderer({ shape, scrollYProgress }: { shape: Shape; scrollYProgress: any }) {
    const y = useTransform(scrollYProgress, [0, 1], [0, shape.speed])
    const rotate = useTransform(
        scrollYProgress, 
        [0, 1], 
        [shape.rotation || 0, (shape.rotation || 0) + (shape.rotationSpeed || 0)]
    )

    const style = {
        position: 'absolute' as const,
        left: shape.x,
        top: shape.y,
        width: shape.size,
        height: shape.size,
        opacity: shape.opacity ?? 0.5,
        filter: shape.blur ? `blur(${shape.blur}px)` : undefined,
        pointerEvents: 'none' as const,
        willChange: 'transform' as const,
    }

    if (shape.type === 'triangle') {
        return (
            <motion.div style={{ ...style, y, rotate }}>
                <svg viewBox="0 0 100 100" fill={shape.color} className="w-full h-full">
                    <polygon points="50,5 95,95 5,95" />
                </svg>
            </motion.div>
        )
    }

    if (shape.type === 'circle') {
        return (
            <motion.div
                style={{ ...style, y, rotate, borderRadius: '50%', background: shape.color }}
            />
        )
    }

    if (shape.type === 'ring') {
        return (
            <motion.div style={{ ...style, y, rotate }}>
                <svg viewBox="0 0 100 100" fill="none" stroke={shape.color} strokeWidth="3" className="w-full h-full">
                    <polygon points="50,5 95,95 5,95" />
                </svg>
            </motion.div>
        )
    }

    // rectangle / diagonal slash
    return (
        <motion.div
            style={{
                ...style,
                y,
                rotate,
                background: shape.color,
                height: shape.size * 0.25,
            }}
        />
    )
}

export function FloatingShapes() {
    const { scrollYProgress } = useScroll()

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {shapes.map((shape, i) => (
                <ShapeRenderer key={i} shape={shape} scrollYProgress={scrollYProgress} />
            ))}
        </div>
    )
}
