window.__timelines = window.__timelines || {};

const tl = gsap.timeline({ paused: true });
const enter = (selector, vars, at) =>
  tl.from(selector, { duration: 0.72, ease: "expo.out", ...vars }, at);

tl.to(".rim-left", { x: 210, duration: 60, ease: "none" }, 0);
tl.to(".rim-right", { x: -190, duration: 60, ease: "none" }, 0);

enter("#opening-brand", { opacity: 0, y: -32, scale: 0.94 }, 0.14);
enter("#opening-macro-a", { opacity: 0, x: -180, y: 120, scale: 1.18, rotation: -8 }, 0.2);
tl.to("#opening-macro-a", { opacity: 0, duration: 0.38, ease: "power2.in" }, 1.8);
enter("#opening-macro-b", { opacity: 0, x: 180, y: 80, scale: 1.15, rotation: 6 }, 1.58);
tl.to("#opening-macro-b", { opacity: 0, duration: 0.38, ease: "power2.in" }, 3.05);
enter("#opening-eyebrow", { opacity: 0, y: 42 }, 2.6);
enter("#opening-title", { opacity: 0, y: 82, scale: 0.96 }, 2.8);

[
  ["#scene-urban", 5],
  ["#scene-formal", 15],
  ["#scene-casual", 25],
  ["#scene-boots", 35],
].forEach(([scene, start], index) => {
  enter(`${scene} .detail`, { opacity: 0, x: 180, scale: 1.42, rotation: index % 2 ? 5 : -5 }, start + 0.14);
  tl.to(`${scene} .detail`, { opacity: 0, duration: 0.38, ease: "power2.in" }, start + 3.15);
  enter(`${scene} .hero`, { opacity: 0, y: 130, scale: 0.9, rotation: index % 2 ? 4 : -4 }, start + 3.0);
  enter(`${scene} .eyebrow`, { opacity: 0, x: -70 }, start + 4.4);
  enter(`${scene} h2`, { opacity: 0, y: 80, scale: 0.96 }, start + 4.58);
  enter(`${scene} .copy p:last-child`, { opacity: 0, y: 48 }, start + 4.86);
});

enter("#scene-cta .catalog-grid img", { opacity: 0, y: 90, scale: 0.88, stagger: 0.11 }, 45.18);
enter("#scene-cta .eyebrow", { opacity: 0, y: 34 }, 46.0);
enter("#scene-cta h2", { opacity: 0, y: 78, scale: 0.96 }, 46.2);
enter("#scene-cta p", { opacity: 0, y: 44 }, 46.52);
enter("#scene-cta strong", { opacity: 0, y: 54, scale: 0.94 }, 46.86);

enter("#scene-closing .closing-lineup img", { opacity: 0, y: 76, scale: 0.86, stagger: 0.08 }, 55.1);
enter("#scene-closing .logo", { opacity: 0, scale: 0.78, rotation: -4 }, 55.45);
enter("#scene-closing h2", { opacity: 0, y: 66 }, 55.76);
enter("#scene-closing p", { opacity: 0, y: 42 }, 56.04);
tl.to("#scene-closing .scene-content", { opacity: 0, scale: 0.985, duration: 0.72, ease: "power2.in" }, 59.16);

[4.6, 14.6, 24.6, 34.6, 44.6, 54.6].forEach((at, index) => {
  const selector = `#wipe-0${index + 1}`;
  tl.fromTo(selector, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.25, ease: "power4.in" }, at);
  tl.to(selector, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.27, ease: "power4.out" }, at + 0.27);
});

window.__timelines["eter-premium-footwear-ad60"] = tl;
