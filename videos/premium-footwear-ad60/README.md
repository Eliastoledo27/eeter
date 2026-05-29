# ÉTER Premium Footwear Ad 60 - HyperFrames

Pieza publicitaria vertical de 60 segundos para ÉTER, reconstruida como proyecto HyperFrames-only. La composicion activa esta optimizada para salida social 1080x1920 y se conserva una fuente 4K editable en `src/hyperframes-4k`.

## Concepto creativo

**Un par para cada momento.** ÉTER se presenta como una marca urbana premium, moderna, confiable y comercial: variedad de calzado para distintas ocasiones, producto con presencia visual y CTA directo a consulta.

La pieza evita marcas de terceros, replicas, G5, "original", "inspirado en" y cualquier referencia a productos no autorizados.

## Guion por segundos

- `0s-5s`: opening cinematico, macro de materiales, suela, reflejos y reveal de ÉTER. Texto: "Calzado para cada estilo".
- `5s-15s`: Urbanas, textura grafito, rotacion suave y close-ups. Texto: "Diseno con presencia / Comodidad diaria".
- `15s-25s`: Formal, luz champagne y superficie calida. Texto: "Detalles premium / Elegancia sin esfuerzo".
- `25s-35s`: Casual, catalogo limpio y movimiento premium. Texto: "Versatilidad real / Para todos los dias".
- `35s-45s`: Botas, camara baja, cuero, cordones, suela y presencia. Texto: "Caracter y resistencia / Preparadas para destacar".
- `45s-55s`: CTA con grid de categorias. Texto: "Elegi tu proximo par / Consulta disponibilidad / Modelos para cada ocasion".
- `55s-60s`: cierre de marca con lineup, logo y texto "Calidad, estilo y variedad".

## Estructura HyperFrames

- `src/hyperframes/index.html`: composicion activa renderable 1080x1920.
- `src/hyperframes/layers.css`: capas, fondos, producto, textos, luces y overlays.
- `src/hyperframes/motion.js`: timeline GSAP, entradas, wipes y movimiento de camara.
- `src/hyperframes/assets/`: productos, texturas, logo y audio usados por el render.
- `src/hyperframes-4k/`: copia editable 2160x3840 para master 4K cuando el entorno soporte el render completo.

## Comandos

```bash
cd videos/premium-footwear-ad60
npm install
npm run check:hyperframes
npm run preview:hyperframes
npm run render:social:draft
npm run render:social
npm run render:master
```

## Render

- Social inmediato: `renders/eter-premium-footwear-hyperframes-social.mp4`, HyperFrames, MP4 H.264, 1080x1920, 30fps.
- Revision rapida: `renders/eter-premium-footwear-hyperframes-review.mp4`, HyperFrames, MP4 H.264, 1080x1920, 30fps draft.
- Master preferido: `renders/eter-premium-footwear-hyperframes-master-4k.mp4`, HyperFrames, 2160x3840, 60fps. Este render es pesado y puede requerir Docker/GPU o una maquina con mas memoria.

HyperFrames 0.6.6 exporta MP4 directamente. Si se necesita HEVC/H.265 final, generar primero el master MP4 de HyperFrames y transcodificar con FFmpeg:

```bash
ffmpeg -i renders/eter-premium-footwear-hyperframes-master-4k.mp4 -c:v libx265 -crf 18 -tag:v hvc1 -c:a aac -b:a 192k renders/eter-premium-footwear-master-hevc.mp4
```

## Modificar

- Productos: reemplazar PNG en `src/hyperframes/assets/products/`.
- Logo: reemplazar `src/hyperframes/assets/logos/eter-logo-premium.png`.
- Copy: editar textos en `src/hyperframes/index.html`.
- Colores, fondos y layout: editar `src/hyperframes/layers.css`.
- Ritmo y animacion: editar `src/hyperframes/motion.js`.
- Audio: reemplazar WAV en `src/hyperframes/assets/audio/`.

## Checklist de calidad

- Sin marcas de terceros ni siluetas iconicas copiadas.
- Sin replicas, G5, "original", "inspirado en" ni promesas dudosas.
- Productos rasterizados con textura, sombra, profundidad y highlights.
- Textos legibles en vertical mobile.
- CTA principal visible: "Consulta disponibilidad".
- Ritmo completo: impacto, categorias, CTA y cierre.
- Proyecto editable y renderizable solo con HyperFrames.
