import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const assets = {
  logo: "/assets/eter/logo.png",
  hero: "/assets/eter/hero.png",
  shoe: "/assets/eter/zapa_cat.png",
  title: "/assets/eter/titulo_cat.png",
  copy: "/assets/eter/texto.png",
  grafitiCyan: "/assets/eter/grafiti cian.png",
  grafitiGreen: "/assets/eter/grafiti verde.png",
  grafitiViolet: "/assets/eter/grafiti violeta.png",
  lines: "/assets/eter/lineas grafiti tricolor.png",
  stainCyan: "/assets/eter/mancha cian.png",
  stainGreen: "/assets/eter/mancha verde.png",
  stainViolet: "/assets/eter/mancha violeta.png",
  beat: "/assets/eter/hiphop.mp3",
};

const scenes = [
  {
    eyebrow: "ÉTER",
    title: "commerce con pulso urbano",
    body: "Marca, catálogo, música y sistema trabajando en una misma frecuencia.",
    accent: "#00e5ff",
  },
  {
    eyebrow: "CATÁLOGO",
    title: "stock real conectado",
    body: "Productos, talles, imágenes y apartados sincronizados con Supabase.",
    accent: "#00e676",
  },
  {
    eyebrow: "FÉTER STOCK",
    title: "control total desde la app",
    body: "Inventario, pedidos, cupones, anuncios y análisis para operar rápido.",
    accent: "#ff2d6f",
  },
  {
    eyebrow: "REVENDEDORES",
    title: "links exclusivos activos",
    body: "Catálogos verificados, comunidad y flujo comercial preparado para escalar.",
    accent: "#ffe45e",
  },
  {
    eyebrow: "@ÉTER",
    title: "conocimiento convertido en herramienta",
    body: "Un plugin propio puede recordar reglas, assets, tono, datos y decisiones.",
    accent: "#8b5cf6",
  },
];

export const EterEcosystemReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = Math.sin(frame / 8) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={styles.root}>
      <Audio src={staticFile(assets.beat)} volume={0.42} />
      <Backdrop beat={beat} />

      <Sequence from={0} durationInFrames={fps * 5}>
        <Opening />
      </Sequence>

      {scenes.slice(1).map((scene, index) => (
        <Sequence key={scene.eyebrow} from={fps * (5 + index * 5)} durationInFrames={fps * 5}>
          <FeatureScene scene={scene} index={index} />
        </Sequence>
      ))}

      <Sequence from={fps * 25} durationInFrames={fps * 5}>
        <Closing />
      </Sequence>

      <div style={{ ...styles.scanline, opacity: 0.04 + beat * 0.03 }} />
    </AbsoluteFill>
  );
};

const Backdrop: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 900], [-80, 80]);

  return (
    <AbsoluteFill style={styles.backdrop}>
      <Img src={staticFile(assets.hero)} style={{ ...styles.hero, transform: `translateX(${drift}px) scale(1.08)` }} />
      <Img src={staticFile(assets.stainCyan)} style={{ ...styles.stain, top: 80, left: -170, opacity: 0.32 + beat * 0.13 }} />
      <Img src={staticFile(assets.stainViolet)} style={{ ...styles.stain, right: -190, top: 520, opacity: 0.22 }} />
      <Img src={staticFile(assets.stainGreen)} style={{ ...styles.stain, left: -140, bottom: 120, opacity: 0.18 }} />
      <Img src={staticFile(assets.lines)} style={{ ...styles.lines, transform: `rotate(-8deg) translateY(${beat * 18}px)` }} />
      <div style={styles.vignette} />
    </AbsoluteFill>
  );
};

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const slide = interpolate(frame, [0, 80], [70, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={styles.scene}>
      <Img src={staticFile(assets.logo)} style={{ ...styles.logo, transform: `scale(${0.82 + appear * 0.18})` }} />
      <div style={{ ...styles.kicker, opacity: appear }}>ÉTER ECOSYSTEM</div>
      <h1 style={{ ...styles.heroTitle, transform: `translateY(${slide}px)`, opacity: appear }}>
        todos los recursos de Éter en una sola máquina visual
      </h1>
      <p style={{ ...styles.heroBody, opacity: interpolate(frame, [35, 85], [0, 1], { extrapolateRight: "clamp" }) }}>
        web, catálogo, app móvil, música, revendedores, Supabase y contenido.
      </p>
      <Img src={staticFile(assets.shoe)} style={styles.openingShoe} />
    </AbsoluteFill>
  );
};

const FeatureScene: React.FC<{ scene: (typeof scenes)[number]; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const shoeX = interpolate(frame, [0, 150], [index % 2 === 0 ? -80 : 80, index % 2 === 0 ? 25 : -25]);
  const grafiti = [assets.grafitiGreen, assets.grafitiCyan, assets.grafitiViolet, assets.lines][index];

  return (
    <AbsoluteFill style={styles.scene}>
      <div style={{ ...styles.accentBar, background: scene.accent, transform: `scaleX(${enter})` }} />
      <Img src={staticFile(grafiti)} style={{ ...styles.grafiti, opacity: 0.18 + enter * 0.25 }} />
      <Img src={staticFile(index === 0 ? assets.title : index === 1 ? assets.copy : assets.shoe)} style={{ ...styles.featureImage, transform: `translateX(${shoeX}px) rotate(${index % 2 === 0 ? -4 : 4}deg)` }} />
      <div style={{ ...styles.copyBlock, opacity: enter, transform: `translateY(${(1 - enter) * 70}px)` }}>
        <div style={{ ...styles.eyebrow, color: scene.accent }}>{scene.eyebrow}</div>
        <h2 style={styles.title}>{scene.title}</h2>
        <p style={styles.body}>{scene.body}</p>
        <div style={styles.metaRow}>
          {["Supabase", "Web", "App", "Contenido"].map((item) => (
            <span key={item} style={{ ...styles.chip, borderColor: scene.accent }}>{item}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });

  return (
    <AbsoluteFill style={styles.scene}>
      <Img src={staticFile(assets.logo)} style={{ ...styles.logoLarge, transform: `scale(${0.9 + pulse * 0.1})` }} />
      <h2 style={styles.closingTitle}>crear `@éter` tiene sentido</h2>
      <p style={styles.closingBody}>
        No sería solo un nombre: sería memoria operativa, identidad, reglas del negocio, assets,
        prompts y decisiones técnicas reutilizables.
      </p>
      <div style={styles.finalCta}>ÉTER / FÉTER STOCK / CATÁLOGO / IA</div>
    </AbsoluteFill>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: "#020204",
    color: "#f7f7f2",
    fontFamily: "Inter, Arial, sans-serif",
    overflow: "hidden",
  },
  backdrop: {
    background: "radial-gradient(circle at 50% 15%, #15151c 0%, #020204 58%, #000 100%)",
  },
  hero: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.16,
    filter: "contrast(1.2) saturate(0.9)",
  },
  stain: {
    position: "absolute",
    width: 540,
  },
  lines: {
    position: "absolute",
    left: -260,
    bottom: 190,
    width: 1500,
    opacity: 0.24,
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))",
  },
  scene: {
    padding: "120px 78px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logo: {
    width: 210,
    height: 210,
    objectFit: "contain",
    marginBottom: 48,
  },
  kicker: {
    color: "#00e5ff",
    fontSize: 28,
    letterSpacing: "0.32em",
    fontWeight: 900,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 106,
    lineHeight: 0.92,
    letterSpacing: 0,
    textTransform: "uppercase",
    margin: 0,
    maxWidth: 930,
  },
  heroBody: {
    fontSize: 36,
    lineHeight: 1.24,
    color: "#cfd3d5",
    maxWidth: 780,
  },
  openingShoe: {
    position: "absolute",
    right: -160,
    bottom: 70,
    width: 760,
    transform: "rotate(-10deg)",
    filter: "drop-shadow(0 45px 70px rgba(0,229,255,0.25))",
  },
  accentBar: {
    position: "absolute",
    top: 96,
    left: 78,
    width: 720,
    height: 8,
    transformOrigin: "0% 50%",
  },
  grafiti: {
    position: "absolute",
    top: 70,
    right: -220,
    width: 840,
  },
  featureImage: {
    position: "absolute",
    right: -90,
    bottom: 120,
    width: 700,
    maxHeight: 760,
    objectFit: "contain",
    filter: "drop-shadow(0 40px 70px rgba(0,0,0,0.55))",
  },
  copyBlock: {
    maxWidth: 760,
  },
  eyebrow: {
    fontSize: 30,
    letterSpacing: "0.3em",
    fontWeight: 900,
    marginBottom: 20,
  },
  title: {
    fontSize: 92,
    lineHeight: 0.94,
    margin: 0,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 34,
    lineHeight: 1.22,
    color: "#d8d8d0",
    marginTop: 30,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 34,
  },
  chip: {
    border: "2px solid #00e5ff",
    borderRadius: 999,
    padding: "12px 18px",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#f7f7f2",
  },
  logoLarge: {
    width: 300,
    height: 300,
    objectFit: "contain",
    alignSelf: "center",
    marginBottom: 54,
  },
  closingTitle: {
    fontSize: 86,
    lineHeight: 0.96,
    textAlign: "center",
    textTransform: "uppercase",
    margin: 0,
  },
  closingBody: {
    fontSize: 32,
    lineHeight: 1.28,
    color: "#d9dddf",
    textAlign: "center",
    maxWidth: 840,
    alignSelf: "center",
  },
  finalCta: {
    alignSelf: "center",
    marginTop: 36,
    padding: "18px 26px",
    border: "1px solid rgba(0,229,255,0.55)",
    color: "#00e5ff",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "0.18em",
  },
  scanline: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(180deg, transparent 0px, transparent 7px, rgba(255,255,255,0.9) 8px)",
    pointerEvents: "none",
  },
};
