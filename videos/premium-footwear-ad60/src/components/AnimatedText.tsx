import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../config/colors";
import { typography } from "../config/typography";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  delay?: number;
  size?: "hero" | "scene" | "cta" | "small";
};

export const AnimatedText: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  delay = 0,
  size = "scene",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.92 },
  });
  const opacity = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleSize =
    size === "hero" ? 162 : size === "cta" ? 136 : size === "small" ? 88 : 118;

  return (
    <div
      style={{
        ...styles.wrap,
        alignItems:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        textAlign: align,
        opacity,
        transform: `translate3d(0, ${(1 - enter) * 76}px, 0)`,
      }}
    >
      {eyebrow ? <div style={styles.eyebrow}>{eyebrow}</div> : null}
      <h1 style={{ ...styles.title, fontSize: titleSize }}>{title}</h1>
      {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
    color: colors.warmWhite,
    maxWidth: 1540,
  },
  eyebrow: {
    fontFamily: typography.mono,
    fontSize: 34,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: colors.champagne,
  },
  title: {
    margin: 0,
    fontFamily: typography.display,
    fontWeight: 880,
    lineHeight: 0.94,
    letterSpacing: 0,
    textTransform: "uppercase",
    textWrap: "balance",
    textShadow: "0 18px 48px rgba(0,0,0,0.48)",
  },
  subtitle: {
    margin: 0,
    fontFamily: typography.display,
    fontSize: 48,
    lineHeight: 1.15,
    color: colors.smoke,
    textWrap: "balance",
  },
};
