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

    // Aseguramos que solo mostramos imágenes únicas y evitamos duplicados innecesarios
    const displayImages = Array.from(new Set(images))

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-8">
            {/* Thumbnails Sidebar */}
            {displayImages.length > 1 && (
                <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar">
                    {displayImages.slice(0, 4).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`w-24 h-24 shrink-0 rounded-3xl overflow-hidden backdrop-blur-3xl bg-white/[0.03] border-2 transition-all duration-700 relative group ${selectedImage === idx
                                ? 'border-[#CA8A04] scale-105 shadow-[0_0_20px_rgba(202,138,4,0.2)]'
                                : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <Image
                                src={img}
                                fill
                                className="object-contain p-3 group-hover:scale-110 transition-transform duration-700"
                                alt={`Thumbnail ${idx + 1}`}
                            />
                            {/* Selected Indicator Dot */}
                            {selectedImage === idx && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-[#CA8A04] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Stage */}
            <div className="flex-1">
                <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="relative aspect-square lg:rounded-[4rem] overflow-hidden bg-gradient-to-br from-[#111] to-[#050505] lg:border border-white/5 shadow-2xl group"
                >
                    {/* Visual Grid for Main Stage */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40 pointer-events-none" />

                    <Image
                        src={displayImages[selectedImage]}
                        fill
                        className="object-contain p-6 sm:p-12 transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                        alt={`${productName} - Vista ${selectedImage + 1}`}
                        priority
                        sizes="(max-width: 768px) 100vw, 60vw"
                    />

                    {/* Stage Lighting */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#CA8A04]/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
                </motion.div>
            </div>
        </div>
    );
}
