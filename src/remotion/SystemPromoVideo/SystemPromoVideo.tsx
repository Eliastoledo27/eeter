import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Img,
    Sequence,
    Audio
} from 'remotion';

export interface SystemPromoProps {
    brandName: string;
    brandAccent: string; // e.g. '#00E5FF'
    showScanlines?: boolean;
    glowIntensity?: number; // 1 to 5
}

export const SystemPromoVideo: React.FC<SystemPromoProps> = ({
    brandName = "ÉTER",
    brandAccent = "#00E5FF",
    showScanlines = true,
    glowIntensity = 3,
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Springs for different elements to stagger animations
    const entrySpring = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 100 },
    });

    // Subtly animate background glow pulse
    const pulseGlow = Math.sin(frame / 8) * 15 * (glowIntensity / 3) + 40 * (glowIntensity / 3);

    // Style variables for convenience
    const themeColor = brandAccent || "#00E5FF";

    return (
        <AbsoluteFill style={{
            backgroundColor: '#030308',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '80px 60px',
        }}>
            {/* Background cyber grid and glow */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(2,2,8,0) 0%, #010103 80%)',
                zIndex: 0,
            }} />

            {/* Glowing orb behind image */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '1000px',
                height: '1000px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor}1a 0%, ${themeColor}00 70%)`,
                transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame / 12) * 0.05})`,
                filter: `blur(${pulseGlow}px)`,
                zIndex: 1,
            }} />

            {/* Futuristic Tech HUD corner lines */}
            <div style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '100px',
                height: '100px',
                borderTop: `2px solid ${themeColor}44`,
                borderLeft: `2px solid ${themeColor}44`,
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                top: '40px',
                right: '40px',
                width: '100px',
                height: '100px',
                borderTop: `2px solid ${themeColor}44`,
                borderRight: `2px solid ${themeColor}44`,
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                width: '100px',
                height: '100px',
                borderBottom: `2px solid ${themeColor}44`,
                borderLeft: `2px solid ${themeColor}44`,
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                width: '100px',
                height: '100px',
                borderBottom: `2px solid ${themeColor}44`,
                borderRight: `2px solid ${themeColor}44`,
                zIndex: 1,
            }} />

            {/* Optional Cyber Scanlines overlay */}
            {showScanlines && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                    backgroundSize: '100% 8px',
                    pointerEvents: 'none',
                    zIndex: 10,
                }} />
            )}

            <Sequence from={0} durationInFrames={fps * 5}>
                {/* Scene 1: Intro */}
                <div style={{
                    zIndex: 2,
                    transform: `translateY(${(1 - entrySpring) * -50}px)`,
                    opacity: entrySpring,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}>
                    <h1 style={{
                        fontSize: '120px',
                        fontWeight: 900,
                        letterSpacing: '24px',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        textShadow: `0 0 20px ${themeColor}88, 0 0 40px ${themeColor}33`,
                        marginBottom: '20px',
                    }}>
                        {brandName}
                    </h1>
                    <div style={{
                        fontSize: '48px',
                        letterSpacing: '8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                    }}>
                        SISTEMA PARA REVENDEDORES
                    </div>
                    <div style={{
                        fontSize: '24px',
                        letterSpacing: '4px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 400,
                        textTransform: 'uppercase',
                        marginTop: '20px'
                    }}>
                        CALZADO URBANO PREMIUM • MAR DEL PLATA
                    </div>
                </div>
            </Sequence>
        </AbsoluteFill>
    );
};
