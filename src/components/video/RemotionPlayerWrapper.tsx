'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { ProductPromoVideo } from '@/remotion/ProductPromoVideo';

interface PlayerWrapperProps {
    productName: string;
    productPrice: string;
    productImage: string;
    brandAccent: string;
    resellerName: string;
    slogan: string;
    showScanlines: boolean;
    glowIntensity: number;
}

export default function RemotionPlayerWrapper({
    productName,
    productPrice,
    productImage,
    brandAccent,
    resellerName,
    slogan,
    showScanlines,
    glowIntensity,
}: PlayerWrapperProps) {
    return (
        <div className="relative aspect-[9/16] w-full max-w-[340px] md:max-w-[380px] mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-[0_0_50px_rgba(0,229,255,0.15)] group transition-all duration-500">
            {/* Top decorative glass notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-black border-b border-l border-r border-white/10 rounded-b-xl z-20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-500/80 animate-pulse" />
                <div className="w-10 h-1 bg-white/10 rounded-full ml-2" />
            </div>

            <Player
                component={ProductPromoVideo as any}
                inputProps={{
                    productName,
                    productPrice,
                    productImage,
                    brandAccent,
                    resellerName,
                    slogan,
                    showScanlines,
                    glowIntensity,
                }}
                durationInFrames={150}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                controls
                loop
                autoPlay
            />
        </div>
    );
}
