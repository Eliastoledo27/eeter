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
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C88A04] to-[#ECA413] origin-left z-[100]"
            style={{ scaleX }}
        />
    );
};

export function GeneralPageLayout({ children, title, subtitle, description, breadcrumb }: GeneralPageLayoutProps) {
    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden pt-32">
            <ScrollProgress />
            <Navbar />

            <div className="container mx-auto px-6 relative z-10">
                {/* Back Button / Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-[#C88A04] hover:text-white transition-colors text-sm font-mono uppercase tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        VOLVER AL INICIO {breadcrumb && ` / ${breadcrumb}`}
                    </Link>
                </motion.div>

                {/* Header Section */}
                <div className="mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {subtitle && (
                            <span className="text-[#C88A04] font-mono text-sm tracking-[0.4em] uppercase mb-4 block">
                                {subtitle}
                            </span>
                        )}
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase">
                            {title}
                        </h1>
                        {description && (
                            <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                                {description}
                            </p>
                        )}
                    </motion.div>

                    {/* Aesthetic Background Element */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#C88A04]/10 blur-[100px] rounded-full -z-10" />
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="pb-32"
                >
                    {children}
                </motion.div>
            </div>

            {/* Decorative Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(200,138,4,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none -z-10" />

            <Footer />
        </main>
    );
}
