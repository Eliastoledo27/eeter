# ÉTER MDQ Footwear Reel

Reel vertical 9:16 para Instagram, orientado a calzado urbano premium en Mar del Plata.

## Render

```powershell
powershell -ExecutionPolicy Bypass -File videos\eter-mdq-footwear-reel\render.ps1
```

Salida:

```text
exports/eter-mdq-footwear-reel-1080x1920.mp4
```

## Validación

```powershell
npx hyperframes lint videos\eter-mdq-footwear-reel
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate -of default=nw=1 exports\eter-mdq-footwear-reel-1080x1920.mp4
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels -of default=nw=1 exports\eter-mdq-footwear-reel-1080x1920.mp4
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 exports\eter-mdq-footwear-reel-1080x1920.mp4
```
