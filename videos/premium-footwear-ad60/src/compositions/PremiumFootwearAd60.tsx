import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BrandClosing } from "../components/BrandClosing";
import { CTASection } from "../components/CTASection";
import { CategoryScene } from "../components/CategoryScene";
import { LightingLayer } from "../components/LightingLayer";
import { PremiumGradient } from "../components/PremiumGradient";
import { ProductShot } from "../components/ProductShot";
import { brand } from "../config/brand";
import { colors } from "../config/colors";
import { openingCopy } from "../config/copy";
import { categories } from "../config/products";
import { timeline, transitions } from "../config/timing";
import { typography } from "../config/typography";

export const PremiumFootwearAd60: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill style={styles.root}>
      <Audio src={staticFile("/assets/audio/premium-bed.wav")} volume={0.48} />
      <Audio src={staticFile("/assets/audio/transition-hits.wav")} volume={0.38} />

      <Sequence from={0} durationInFrames={s(timeline.opening.duration)}>
        <Opening />
      </Sequence>

      {categories.map((category, index) => (
        <Sequence
          key={category.key}
          from={s(5 + index * 10)}
          durationInFrames={s(10)}
        >
          <CategoryScene category={category} startSecond={5 + index * 10} index={index} />
        </Sequence>
      ))}

      <Sequence
        from={s(timeline.cta.start)}
        durationInFrames={s(timeline.cta.duration)}
      >
        <CTASection />
      </Sequence>

      <Sequence
        from={s(timeline.closing.start)}
        durationInFrames={s(timeline.closing.duration)}
      >
        <BrandClosing />
      </Sequence>

      <TransitionWipes frame={frame} />
    </AbsoluteFill>
  );
};

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const firstCut = interpolate(t, [0, 1, 1.73, 2.1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondCut = interpolate(t, [1.57, 2.3, 3.3, 3.87], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heroText = interpolate(t, [2.5, 3.42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={styles.opening}>
      <PremiumGradient accent={colors.champagne} secondary={colors.petrol} surface="cement" />
      <LightingLayer accent={colors.champagne} intensity={1.14} />
      <div style={styles.openingLogo}>
        <Img src={staticFile(brand.logo)} style={styles.logoSmall} />
        <span>{brand.name}</span>
      </div>
      <div style={{ ...styles.openingProductA, opacity: firstCut }}>
        <ProductShot product={categories[0].products[1]} accent={categories[0].accent} variant="macro" />
      </div>
      <div style={{ ...styles.openingProductB, opacity: secondCut }}>
        <ProductShot
          product={categories[3].products[1]}
          accent={categories[3].accent}
          variant="macro"
          index={2}
        />
      </div>
      <div style={{ ...styles.openingCopy, opacity: heroText }}>
        <AnimatedText
          eyebrow={openingCopy.eyebrow}
          title={openingCopy.headline}
          align="center"
          size="hero"
          delay={Math.round(2.58 * fps)}
        />
      </div>
    </AbsoluteFill>
  );
};

const TransitionWipes: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {transitions.map((second, index) => {
      const local = frame / fps - second;
      const opacity = interpolate(local, [0, 0.15, 0.5, 0.7], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const scaleY = interpolate(local, [0, 0.27, 0.7], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      return (
        <div
          key={second}
          style={{
            ...styles.wipe,
            opacity,
            transform: `scaleY(${scaleY})`,
            background:
              index % 2 === 0
                ? `linear-gradient(90deg, transparent, ${colors.champagne}, transparent)`
                : `linear-gradient(90deg, transparent, ${colors.petrol}, transparent)`,
          }}
        />
      );
    })}
  </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: colors.black,
    color: colors.warmWhite,
    fontFamily: typography.display,
    overflow: "hidden",
  },
  opening: {
    background: colors.black,
    overflow: "hidden",
  },
  openingLogo: {
    position: "absolute",
    top: 190,
    left: 150,
    display: "flex",
    alignItems: "center",
    gap: 28,
    padding: "18px 32px 18px 20px",
    border: `1px solid ${colors.line}`,
    borderRadius: 8,
    color: colors.champagne,
    fontFamily: typography.mono,
    fontSize: 34,
    letterSpacing: "0.16em",
    zIndex: 10,
  },
  logoSmall: {
    width: 76,
    height: 76,
  },
  openingProductA: {
    position: "absolute",
    left: -330,
    bottom: 720,
    transform: "rotate(-3deg)",
  },
  openingProductB: {
    position: "absolute",
    right: -420,
    bottom: 620,
    transform: "rotate(2deg)",
  },
  openingCopy: {
    position: "absolute",
    left: 135,
    right: 135,
    bottom: 470,
    display: "grid",
    placeItems: "center",
  },
  wipe: {
    position: "absolute",
    inset: 0,
    zIndex: 100,
    transformOrigin: "50% 0%",
    mixBlendMode: "screen",
  },
};
