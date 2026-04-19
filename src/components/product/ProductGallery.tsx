'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0)

    const displayImages = Array.from(new Set(images))

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6">
            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar pb-4 lg:pb-0">
                    {displayImages.slice(0, 5).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`relative w-20 h-20 shrink-0 bg-[#111] overflow-hidden transition-all duration-300 border-2 rounded-lg ${selectedImage === idx
                                ? 'border-[#FF6B00] opacity-100 scale-105 shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                                : 'border-transparent opacity-50 hover:opacity-100 hover:border-white/20'
                                }`}
                        >
                            <Image
                                src={img}
                                fill
                                className="object-cover p-1.5"
                                alt={`Vista ${idx + 1}`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Stage - Flyer Style with Geometric Shapes */}
            <div className="flex-1 relative group w-full aspect-square overflow-hidden rounded-2xl">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#111] to-[#1a1005]" />
                
                {/* Geometric decorations BEHIND the product */}
                {/* Large triangle */}
                <div className="absolute top-[10%] right-[5%] w-[45%] h-[45%] opacity-20 pointer-events-none">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#FF6B00" strokeWidth="2" className="w-full h-full">
                        <polygon points="50,5 95,95 5,95" />
                    </svg>
                </div>
                {/* Small filled triangle */}
                <div className="absolute bottom-[15%] left-[8%] w-[15%] h-[15%] opacity-30 pointer-events-none">
                    <svg viewBox="0 0 100 100" fill="#FF6B00" className="w-full h-full">
                        <polygon points="50,5 95,95 5,95" />
                    </svg>
                </div>
                {/* Diagonal slash */}
                <div className="absolute top-0 right-[20%] w-3 h-[60%] bg-[#FF6B00]/20 -skew-x-12 pointer-events-none" />
                {/* Circle ring */}
                <div className="absolute bottom-[5%] right-[10%] w-[20%] h-[20%] border-2 border-[#00E5FF]/20 rounded-full pointer-events-none" />
                {/* Dot grid pattern */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
                     style={{
                         backgroundImage: 'radial-gradient(circle, #FF6B00 1px, transparent 1px)',
                         backgroundSize: '24px 24px'
                     }} 
                />

                {/* Product Image - floating above shapes */}
                <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full z-10"
                >
                    <Image
                        src={displayImages[selectedImage]}
                        fill
                        className="object-contain p-8 md:p-12 drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] group-hover:scale-105 group-hover:-rotate-2 transition-all duration-700"
                        alt={productName}
                        priority
                    />
                </motion.div>
                
                {/* Image counter badge */}
                <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-[#FF6B00] uppercase">
                    {String(selectedImage + 1).padStart(2, '0')} / {String(displayImages.length).padStart(2, '0')}
                </div>

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#FF6B00]/40 rounded-tl-lg z-20" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#FF6B00]/40 rounded-bl-lg z-20" />
            </div>
        </div>
    );
}
