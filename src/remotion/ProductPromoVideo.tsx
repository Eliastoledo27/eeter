import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Img,
} from 'remotion';

export interface ProductPromoProps {
    productName: string;
    productPrice: string;
    productImage: string;
    brandAccent: string; // e.g. '#00E5FF'
    resellerName: string;
    slogan?: string;
    showScanlines?: boolean;
    glowIntensity?: number; // 1 to 5
}

export const ProductPromoVideo: React.FC<ProductPromoProps> = ({
    productName = "ÉTER CYBER OVERSIZED T-SHIRT",
    productPrice = "$28,500",
    productImage = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    brandAccent = "#00E5FF",
    resellerName = "ÉTER STORE",
    slogan = "EXCLUSIVE RESELLER COLLECTION",
    showScanlines = true,
    glowIntensity = 3,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Springs for different elements to stagger animations
    const entrySpring = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 100 },
    });

    const imageSpring = spring({
        frame: Math.max(0, frame - 15),
        fps,
        config: { damping: 12, stiffness: 85 },
    });

    const textSpring = spring({
        frame: Math.max(0, frame - 30),
        fps,
        config: { damping: 15, stiffness: 95 },
    });

    const footerSpring = spring({
        frame: Math.max(0, frame - 45),
        fps,
        config: { damping: 16, stiffness: 80 },
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
            justifyContent: 'space-between',
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
                width: '600px',
                height: '600px',
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

            {/* TOP BAR: Reseller/Brand Info */}
            <div style={{
                zIndex: 2,
                transform: `translateY(${(1 - entrySpring) * -50}px)`,
                opacity: entrySpring,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
            }}>
                <div style={{
                    fontSize: '36px',
                    fontWeight: 900,
                    letterSpacing: '12px',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    textShadow: `0 0 10px ${themeColor}88, 0 0 20px ${themeColor}33`,
                    marginBottom: '10px',
                }}>
                    {resellerName}
                </div>
                <div style={{
                    fontSize: '18px',
                    letterSpacing: '6px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                }}>
                    {slogan}
                </div>
                <div style={{
                    height: '2px',
                    width: '120px',
                    backgroundColor: themeColor,
                    marginTop: '20px',
                    boxShadow: `0 0 8px ${themeColor}`,
                }} />
            </div>

            {/* CENTER COMPONENT: Image Frame with Glassmorphism and Neon Borders */}
            <div style={{
                zIndex: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                flex: 1,
                padding: '40px 0',
            }}>
                <div style={{
                    position: 'relative',
                    width: '800px',
                    height: '800px',
                    borderRadius: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.02), 0 0 30px ${themeColor}15`,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: `scale(${imageSpring}) rotate(${interpolate(imageSpring, [0, 1], [-5, 0])}deg)`,
                    opacity: imageSpring,
                }}>
                    {/* Glowing decorative box frame inside */}
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        right: '15px',
                        bottom: '15px',
                        border: `1px solid ${themeColor}22`,
                        borderRadius: '16px',
                        pointerEvents: 'none',
                    }} />

                    {/* Main Image */}
                    <Img 
                        src={productImage} 
                        style={{
                            width: '88%',
                            height: '88%',
                            objectFit: 'cover',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                        }} 
                    />

                    {/* Badge Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        right: '40px',
                        background: 'rgba(3, 3, 8, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${themeColor}aa`,
                        borderRadius: '30px',
                        padding: '12px 28px',
                        boxShadow: `0 10px 25px rgba(0,0,0,0.6), 0 0 15px ${themeColor}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{
                            fontSize: '32px',
                            fontWeight: 900,
                            color: '#ffffff',
                            letterSpacing: '1px',
                        }}>
                            {productPrice}
                        </span>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR: Product details and action button */}
            <div style={{
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                transform: `translateY(${(1 - textSpring) * 60}px)`,
                opacity: textSpring,
            }}>
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    letterSpacing: '4px',
                    textAlign: 'center',
                    marginBottom: '15px',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.7))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    padding: '0 20px',
                    lineHeight: 1.2,
                }}>
                    {productName}
                </h1>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '40px',
                }}>
                    {['S', 'M', 'L', 'XL'].map((size, idx) => (
                        <div 
                            key={size}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.6)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                transform: `scale(${Math.min(1, Math.max(0, textSpring * 1.2 - idx * 0.15))})`,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {size}
                        </div>
                    ))}
                </div>

                {/* Simulated Swipe-up or Order Badge */}
                <div style={{
                    transform: `scale(${footerSpring})`,
                    opacity: footerSpring,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${themeColor} 0%, #0055ff 100%)`,
                        borderRadius: '40px',
                        padding: '16px 48px',
                        fontSize: '22px',
                        fontWeight: 800,
                        letterSpacing: '4px',
                        color: '#000000',
                        boxShadow: `0 10px 30px ${themeColor}55, 0 0 15px ${themeColor}33`,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        Consultar Stock
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '-2px' }}>
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>

                    <div style={{
                        marginTop: '25px',
                        fontSize: '14px',
                        letterSpacing: '4px',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}>
                        ÉTER PLATFORM • 2026
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
