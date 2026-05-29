# Video ÉTER Revendedores

Anuncio vertical para Instagram Reels / Stories / Ads.

## Producción

1. Generar locución con AI Studio o Gemini TTS:

```powershell
$env:GEMINI_API_KEY="TU_API_KEY"
node videos\eter-revendedores-ad\generate-voiceover.mjs
```

También podés exportar manualmente desde AI Studio y guardar el archivo como:

```text
videos/eter-revendedores-ad/assets/voiceover.wav
```

2. Renderizar:

```powershell
powershell -ExecutionPolicy Bypass -File videos\eter-revendedores-ad\render.ps1
```

3. Salida esperada:

```text
exports/eter-revendedores-instagram-1080x1920.mp4
```

## Control de calidad

- Resolución: 1080x1920.
- Duración: 42 segundos.
- Formato: MP4.
- Música: `assets/hiphop.mp3`.
- Voz: `assets/voiceover.wav` o `assets/voiceover.mp3`.
- No usar precios, porcentajes, teléfono, QR ni stock garantizado.
- Mantener la marca como `ÉTER`.
