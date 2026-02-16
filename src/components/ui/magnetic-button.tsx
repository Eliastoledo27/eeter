'use client'

import React, { useRef, useState } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { type VariantProps } from 'class-variance-authority'

export interface MagneticButtonProps extends HTMLMotionProps<"button">, VariantProps<typeof buttonVariants> {
    strength?: number
    scale?: number
    children: React.ReactNode
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ className, variant, size, children, strength = 0.5, scale = 1.05, ...props }, _ref) => {
        const internalRef = useRef<HTMLButtonElement>(null)
        const [position, setPosition] = useState({ x: 0, y: 0 })

        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            const { clientX, clientY } = e
            const target = internalRef.current
            if (!target) return

            const { width, height, left, top } = target.getBoundingClientRect()
            const x = (clientX - (left + width / 2)) * strength
            const y = (clientY - (top + height / 2)) * strength
            setPosition({ x, y })
        }

        const handleMouseLeave = () => {
            setPosition({ x: 0, y: 0 })
        }

        return (
            <motion.button
                ref={internalRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{ x: position.x, y: position.y }}
                whileHover={{ scale }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
                className={cn(buttonVariants({ variant, size, className }), "relative")}
                {...props}
            >
                <span className="relative z-10 flex items-center justify-center">
                    {children}
                </span>
            </motion.button>
        )
    }
)

MagneticButton.displayName = 'MagneticButton'

export { MagneticButton }
