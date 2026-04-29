'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface GeneralPageLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    description?: string;
    breadcrumb?: string;
}

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00E5FF] to-[#AEE600] origin-left z-[100]"
            style={{ scaleX }}
        />
    );
};

export function GeneralPageLayout({ children, title, subtitle, description, breadcrumb }: GeneralPageLayoutProps) {
    return (
        <main className="relative min-h-screen overflow-x-hidden bg-[#050505] pt-32 text-white selection:bg-[#00E5FF] selection:text-black">
            <ScrollProgress />
            <Navbar />
            <div className="grunge-overlay fixed" />
            <motion.div
                animate={{ x: [0, 10, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                className="paint-splatter -left-16 top-36 hidden md:block"
            />
            <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                className="paint-splatter -right-20 top-[38rem] hidden opacity-20 md:block"
            />

            <div className="container relative z-10 mx-auto px-6">
                {/* Back Button / Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link href="/" className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#00E5FF] transition-colors hover:text-white">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        VOLVER AL INICIO {breadcrumb && ` / ${breadcrumb}`}
                    </Link>
                </motion.div>

                {/* Header Section */}
                <div className="relative mb-20 overflow-hidden rounded-lg border border-[#252525] bg-[#0B0B0B] p-7 md:p-10">
                    <span className="brush-green -left-6 top-10 hidden opacity-50 md:block" />
                    <span className="brush-purple right-10 bottom-8 hidden opacity-35 md:block" />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {subtitle && (
                            <span className="mb-4 block text-sm font-black uppercase tracking-[0.24em] text-[#00E5FF]">
                                {subtitle}
                            </span>
                        )}
                        <h1 className="mb-8 max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-white md:text-8xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="max-w-2xl text-lg font-medium leading-relaxed text-[#B8B8B8] md:text-xl">
                                {description}
                            </p>
                        )}
                    </motion.div>

                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="pb-32 [&_.bg-white\\/5]:border-[#252525] [&_.bg-white\\/5]:bg-[#111111] [&_.border-white\\/10]:border-[#252525] [&_h2]:tracking-[-0.03em]"
                >
                    {children}
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
