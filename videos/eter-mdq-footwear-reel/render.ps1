$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ProjectDir "..\..")
$ExportDir = Join-Path $RepoRoot "exports"
$SilentVideo = Join-Path $ExportDir "eter-mdq-footwear-reel-1080x1920.silent.mp4"
$FinalVideo = Join-Path $ExportDir "eter-mdq-footwear-reel-1080x1920.mp4"
$FinalTemp = Join-Path $ExportDir "eter-mdq-footwear-reel-1080x1920.tmp.mp4"
$Music = Join-Path $ProjectDir "assets\hiphop.mp3"
$Voice = Join-Path $ProjectDir "assets\voiceover.wav"

New-Item -ItemType Directory -Force $ExportDir | Out-Null

if (-not (Test-Path $Voice)) {
  Write-Host "No voiceover found. Generating with Gemini TTS..." -ForegroundColor Yellow
  node (Join-Path $ProjectDir "generate-voiceover.mjs")
  if ($LASTEXITCODE -ne 0) { throw "Voiceover generation failed with exit code $LASTEXITCODE." }
}

Push-Location $RepoRoot
try {
  npx hyperframes render "videos\eter-mdq-footwear-reel" `
    --output $SilentVideo `
    --fps 30 `
    --quality draft `
    --workers 1 `
    --resolution portrait `
    --strict `
    --no-browser-gpu
  if ($LASTEXITCODE -ne 0) { throw "HyperFrames render failed with exit code $LASTEXITCODE." }

  if (Test-Path $FinalTemp) { Remove-Item -Force $FinalTemp }
  ffmpeg -y `
    -i $SilentVideo `
    -stream_loop -1 -i $Music `
    -i $Voice `
    -filter_complex "[1:a]atrim=0:36,asetpts=PTS-STARTPTS,volume=0.24[music];[2:a]atrim=0:36,asetpts=PTS-STARTPTS,volume=1.0,asplit=2[voice_sc][voice_mix];[music][voice_sc]sidechaincompress=threshold=0.035:ratio=8:attack=25:release=350[ducked];[ducked][voice_mix]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.94[aout]" `
    -map 0:v:0 `
    -map "[aout]" `
    -t 36 `
    -c:v copy `
    -c:a aac `
    -b:a 192k `
    -movflags +faststart `
    $FinalTemp
  if ($LASTEXITCODE -ne 0) { throw "FFmpeg audio mix failed with exit code $LASTEXITCODE." }

  Move-Item -Force $FinalTemp $FinalVideo
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $FinalVideo
  ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels -of default=nw=1 $FinalVideo
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $FinalVideo
  Write-Host "Final video: $FinalVideo" -ForegroundColor Green
}
finally {
  Pop-Location
}
