import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { ProductAsset } from "../config/products";

type Props = {
  product: ProductAsset;
  accent: string;
  sceneStartFrame?: number;
  variant?: "hero" | "macro" | "grid" | "lineup";
  index?: number;
};

export const ProductShot: React.FC<Props> = ({
  product,
  accent,
  sceneStartFrame = 0,
  variant = "hero",
  index = 0,
}) => {
  const frame = useCurrentFrame() - sceneStartFrame;
  const drift = interpolate(frame % 240, [0, 120, 240], [0, -34, 0]);
  const rotate = interpolate(frame, [0, 600], [-2.8 + index, 3.8 - index * 0.4], {
    extrapolateRight: "clamp",
  });
  const push = interpolate(frame, [0, 600], [1, 1.075], {
    extrapolateRight: "clamp",
  });
  const macroScale = variant === "macro" ? 1.46 : variant === "grid" ? 0.78 : 1;
  const width =
    variant === "lineup" ? 670 : variant === "grid" ? 820 : variant === "macro" ? 1540 : 1450;

  return (
    <div style={{ ...styles.stage, width, height: width * 0.74 }}>
      <div
        style={{
          ...styles.glow,
          background: `radial-gradient(circle, ${accent}5c 0%, transparent 68%)`,
        }}
      />
      <Img
        src={staticFile(product.src)}
        style={{
          ...styles.image,
          transform: `translateY(${drift}px) rotate(${rotate}deg) scale(${push * macroScale})`,
        }}
      />
      <div style={styles.contactShadow} />
      <div style={styles.highlight} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  stage: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    overflow: "visible",
  },
  glow: {
    position: "absolute",
    width: "80%",
    height: "74%",
    borderRadius: "50%",
    filter: "blur(62px)",
    opacity: 0.68,
  },
  image: {
    position: "relative",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transformOrigin: "50% 64%",
    filter:
      "drop-shadow(0 64px 58px rgba(0,0,0,0.58)) drop-shadow(0 12px 18px rgba(0,0,0,0.36))",
    zIndex: 3,
  },
  contactShadow: {
    position: "absolute",
    bottom: "12%",
    width: "58%",
    height: "9%",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.58)",
    filter: "blur(30px)",
    zIndex: 1,
  },
  highlight: {
    position: "absolute",
    top: "20%",
    left: "18%",
    width: "54%",
    height: "18%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
    filter: "blur(24px)",
    transform: "rotate(-11deg)",
    mixBlendMode: "screen",
    zIndex: 4,
    pointerEvents: "none",
  },
};
