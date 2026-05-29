import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedText } from "./AnimatedText";
import { PremiumGradient } from "./PremiumGradient";
import { ProductShot } from "./ProductShot";
import { colors } from "../config/colors";
import { ctaCopy } from "../config/copy";
import { categories } from "../config/products";
import { typography } from "../config/typography";

export const CTASection: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame % 180, [0, 90, 180], [0, -18, 0]);

  return (
    <AbsoluteFill style={styles.root}>
      <PremiumGradient accent={colors.champagne} secondary={colors.deepGreen} surface="cement" />
      <div style={{ ...styles.grid, transform: `translateY(${lift}px)` }}>
        {categories.map((category, index) => (
          <div key={category.key} style={styles.card}>
            <ProductShot
              product={category.products[0]}
              accent={category.accent}
              variant="grid"
              index={index}
            />
            <span>{category.label}</span>
          </div>
        ))}
      </div>
      <div style={styles.copy}>
        <AnimatedText
          eyebrow="ÉTER"
          title={ctaCopy.headline}
          subtitle={ctaCopy.secondary}
          align="center"
          size="cta"
          delay={18}
        />
        <div style={styles.cta}>{ctaCopy.primary}</div>
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
  grid: {
    position: "absolute",
    top: 360,
    left: 135,
    right: 135,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 30,
  },
  card: {
    height: 675,
    borderRadius: 10,
    border: `1px solid ${colors.line}`,
    background:
      "linear-gradient(180deg, rgba(246,239,226,0.1), rgba(246,239,226,0.025))",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 40px 120px rgba(0,0,0,0.34) inset",
  },
  copy: {
    position: "absolute",
    left: 140,
    right: 140,
    bottom: 310,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 54,
    textAlign: "center",
  },
  cta: {
    minWidth: 780,
    padding: "38px 78px",
    borderRadius: 8,
    background: colors.warmWhite,
    color: colors.black,
    fontFamily: typography.mono,
    fontSize: 38,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    boxShadow: "0 26px 70px rgba(216,190,123,0.18)",
  },
};
