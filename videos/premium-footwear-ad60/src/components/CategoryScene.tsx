import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "./AnimatedText";
import { LightingLayer } from "./LightingLayer";
import { PremiumGradient } from "./PremiumGradient";
import { ProductShot } from "./ProductShot";
import { colors } from "../config/colors";
import { typography } from "../config/typography";
import type { Category } from "../config/products";

type Props = {
  category: Category;
  startSecond: number;
  index: number;
};

export const CategoryScene: React.FC<Props> = ({ category, startSecond, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const textOpacity = interpolate(t, [7, 8.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const macroOpacity = interpolate(t, [0, 1.17, 3.17, 4.25], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heroOpacity = interpolate(t, [3, 4.33], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(t, [0, 10], [0, -36], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={styles.root}>
      <PremiumGradient
        accent={category.accent}
        secondary={category.secondary}
        surface={category.surface}
      />
      <LightingLayer
        accent={category.accent}
        side={index % 2 === 0 ? "left" : "right"}
        intensity={1.05}
      />

      <div style={{ ...styles.macroLayer, opacity: macroOpacity }}>
        <ProductShot
          product={category.products[1]}
          accent={category.accent}
          variant="macro"
          index={index}
        />
        <div style={styles.macroLabel}>DETALLE / MATERIAL / TERMINACIÓN</div>
      </div>

      <div style={{ ...styles.heroLayer, opacity: heroOpacity }}>
        <ProductShot
          product={category.products[0]}
          accent={category.accent}
          variant="hero"
          index={index}
        />
      </div>

      <div style={{ ...styles.copy, transform: `translateY(${textY}px)` }}>
        <AnimatedText
          eyebrow={category.label}
          title={category.title}
          subtitle={category.subtitle}
          delay={Math.round(4.5 * fps)}
          size="scene"
        />
        <p style={{ ...styles.detail, opacity: textOpacity }}>{category.detail}</p>
      </div>
    </AbsoluteFill>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: colors.black,
    color: colors.warmWhite,
    overflow: "hidden",
  },
  macroLayer: {
    position: "absolute",
    top: 480,
    right: -270,
    transform: "rotate(-2deg)",
  },
  macroLabel: {
    position: "absolute",
    right: 410,
    bottom: 52,
    fontFamily: typography.mono,
    fontSize: 24,
    letterSpacing: "0.16em",
    color: "rgba(246,239,226,0.42)",
  },
  heroLayer: {
    position: "absolute",
    left: "50%",
    bottom: 700,
    transform: "translateX(-50%)",
  },
  copy: {
    position: "absolute",
    left: 150,
    right: 150,
    bottom: 360,
    display: "flex",
    flexDirection: "column",
    gap: 28,
    zIndex: 6,
  },
  detail: {
    margin: 0,
    maxWidth: 1130,
    fontFamily: typography.mono,
    fontSize: 32,
    lineHeight: 1.35,
    color: colors.smoke,
  },
};
