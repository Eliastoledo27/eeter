import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors } from "../config/colors";

type Props = {
  accent?: string;
  secondary?: string;
  surface?: "cement" | "wood" | "marble" | "leather";
};

export const PremiumGradient: React.FC<Props> = ({
  accent = colors.champagne,
  secondary = colors.petrol,
  surface = "cement",
}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 360, [0, 180, 360], [-4, 5, -4]);
  const surfaceColor =
    surface === "wood"
      ? "rgba(120,70,36,0.15)"
      : surface === "marble"
        ? "rgba(246,239,226,0.1)"
        : surface === "leather"
          ? "rgba(92,45,26,0.15)"
          : "rgba(60,64,66,0.13)";

  return (
    <div style={styles.root}>
      <div
        style={{
          ...styles.auraLeft,
          background: `radial-gradient(circle, ${accent}47 0%, transparent 64%)`,
          transform: `translate3d(${drift}%, -4%, 0)`,
        }}
      />
      <div
        style={{
          ...styles.auraRight,
          background: `radial-gradient(circle, ${secondary}66 0%, transparent 68%)`,
          transform: `translate3d(${-drift}%, 5%, 0)`,
        }}
      />
      <div style={{ ...styles.surface, backgroundColor: surfaceColor }} />
      <Img src={staticFile("/assets/textures/cinematic-grain.png")} style={styles.grainImage} />
      <div style={styles.vignette} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #020203 0%, #0A0B0D 42%, #020203 100%)",
  },
  auraLeft: {
    position: "absolute",
    width: 1800,
    height: 1800,
    left: -780,
    top: -340,
    filter: "blur(58px)",
    opacity: 0.7,
  },
  auraRight: {
    position: "absolute",
    width: 1750,
    height: 1750,
    right: -820,
    bottom: -260,
    filter: "blur(64px)",
    opacity: 0.54,
  },
  surface: {
    position: "absolute",
    left: -260,
    right: -260,
    bottom: 0,
    height: 1320,
    transform: "skewY(-5deg)",
    transformOrigin: "50% 100%",
    borderTop: "1px solid rgba(246,239,226,0.12)",
    boxShadow: "0 -70px 160px rgba(0,0,0,0.38) inset",
  },
  grainImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.34,
    mixBlendMode: "soft-light",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 40%, transparent 0%, rgba(0,0,0,0.2) 46%, rgba(0,0,0,0.9) 100%)",
  },
};
