import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../config/colors";

type Props = {
  accent?: string;
  side?: "left" | "right";
  intensity?: number;
};

export const LightingLayer: React.FC<Props> = ({
  accent = colors.champagne,
  side = "left",
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame % 300, [0, 150, 300], [-28, 38, -28]);

  return (
    <div style={styles.root}>
      <div
        style={{
          ...styles.key,
          left: side === "left" ? -560 : "auto",
          right: side === "right" ? -560 : "auto",
          background: `linear-gradient(90deg, transparent, ${accent}88, transparent)`,
          transform: `translateX(${sweep}px) rotate(${side === "left" ? -13 : 13}deg) scale(${intensity})`,
        }}
      />
      <div style={styles.softbox} />
      <div style={styles.floor} />
      <div style={styles.topFlag} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  key: {
    position: "absolute",
    top: -240,
    width: 1180,
    height: 4550,
    filter: "blur(46px)",
    opacity: 0.34,
    mixBlendMode: "screen",
  },
  softbox: {
    position: "absolute",
    top: 480,
    right: -220,
    width: 700,
    height: 2300,
    background:
      "linear-gradient(90deg, transparent, rgba(246,239,226,0.16), transparent)",
    filter: "blur(42px)",
    transform: "rotate(8deg)",
    opacity: 0.75,
  },
  floor: {
    position: "absolute",
    left: 190,
    right: 190,
    bottom: 620,
    height: 310,
    background:
      "radial-gradient(ellipse, rgba(246,239,226,0.24) 0%, rgba(216,190,123,0.08) 34%, transparent 72%)",
    filter: "blur(18px)",
  },
  topFlag: {
    position: "absolute",
    inset: "0 0 auto 0",
    height: 980,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.06), transparent)",
  },
};
