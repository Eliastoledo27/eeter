import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ProductShot } from "./ProductShot";
import { brand } from "../config/brand";
import { closingCopy } from "../config/copy";
import { colors } from "../config/colors";
import { categories } from "../config/products";
import { typography } from "../config/typography";

export const BrandClosing: React.FC = () => (
  <AbsoluteFill style={styles.root}>
    <div style={styles.lineup}>
      {categories.map((category, index) => (
        <div key={category.key} style={{ transform: `translateY(${index % 2 ? 42 : 0}px)` }}>
          <ProductShot
            product={category.products[0]}
            accent={category.accent}
            variant="lineup"
            index={index}
          />
        </div>
      ))}
    </div>
    <div style={styles.brand}>
      <Img src={staticFile(brand.logo)} style={styles.logo} />
      <h2>{closingCopy.brand}</h2>
      <p>{closingCopy.line}</p>
    </div>
    <div style={styles.fade} />
  </AbsoluteFill>
);

const styles: Record<string, React.CSSProperties> = {
  root: {
    background:
      "radial-gradient(circle at 50% 40%, rgba(216,190,123,0.18), transparent 38%), #020203",
    color: colors.warmWhite,
    overflow: "hidden",
  },
  lineup: {
    position: "absolute",
    top: 640,
    left: -45,
    right: -45,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    opacity: 0.82,
  },
  brand: {
    position: "absolute",
    left: 130,
    right: 130,
    bottom: 560,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 28,
    textAlign: "center",
  },
  logo: {
    width: 190,
    height: 190,
    objectFit: "contain",
  },
  h2: {
    margin: 0,
    fontFamily: typography.display,
    fontSize: 156,
    lineHeight: 0.9,
    fontWeight: 900,
    letterSpacing: "0.08em",
  },
  p: {
    margin: 0,
    fontFamily: typography.mono,
    fontSize: 38,
    letterSpacing: "0.12em",
    color: colors.champagne,
    textTransform: "uppercase",
  },
  fade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, transparent 0%, transparent 76%, rgba(0,0,0,0.76) 100%)",
    pointerEvents: "none",
  },
};
