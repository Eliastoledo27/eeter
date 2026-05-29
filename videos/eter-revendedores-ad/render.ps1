$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ProjectDir "..\..")
$ExportDir = Join-Path $RepoRoot "exports"
$SilentVideo = Join-Path $ExportDir "eter-revendedores-instagram-1080x1920.silent.mp4"
$FinalVideo = Join-Path $ExportDir "eter-revendedores-instagram-1080x1920.mp4"
$FinalTemp = Join-Path $ExportDir "eter-revendedores-instagram-1080x1920.tmp.mp4"
$Music = Join-Path $ProjectDir "assets\hiphop.mp3"
$VoiceWav = Join-Path $ProjectDir "assets\voiceover.wav"
$VoiceMp3 = Join-Path $ProjectDir "assets\voiceover.mp3"

New-Item -ItemType Directory -Force $ExportDir | Out-Null

if (-not (Test-Path $VoiceWav) -and -not (Test-Path $VoiceMp3)) {
  Write-Host "No voiceover found." -ForegroundColor Yellow
  Write-Host "Option A: set GEMINI_API_KEY and run: node videos\eter-revendedores-ad\generate-voiceover.mjs"
  Write-Host "Option B: export AI Studio audio to: videos\eter-revendedores-ad\assets\voiceover.wav"
  throw "Render blocked until voiceover.wav or voiceover.mp3 exists."
}

$Voice = if (Test-Path $VoiceWav) { $VoiceWav } else { $VoiceMp3 }

Push-Location $RepoRoot
try {
  npx hyperframes render "videos\eter-revendedores-ad" `
    --output $SilentVideo `
    --fps 30 `
    --quality high `
    --workers 1 `
    --resolution portrait `
    --strict
  if ($LASTEXITCODE -ne 0) { throw "HyperFrames render failed with exit code $LASTEXITCODE." }

  if (Test-Path $FinalTemp) { Remove-Item -Force $FinalTemp }
  ffmpeg -y `
    -i $SilentVideo `
    -stream_loop -1 -i $Music `
    -i $Voice `
    -filter_complex "[1:a]atrim=0:42,asetpts=PTS-STARTPTS,volume=0.22[music];[2:a]atrim=0:42,asetpts=PTS-STARTPTS,volume=1.0,asplit=2[voice_sc][voice_mix];[music][voice_sc]sidechaincompress=threshold=0.035:ratio=8:attack=25:release=350[ducked];[ducked][voice_mix]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.94[aout]" `
    -map 0:v:0 `
    -map "[aout]" `
    -t 42 `
    -c:v copy `
    -c:a aac `
    -b:a 192k `
    -movflags +faststart `
    $FinalTemp
  if ($LASTEXITCODE -ne 0) { throw "FFmpeg audio mix failed with exit code $LASTEXITCODE." }

  Move-Item -Force $FinalTemp $FinalVideo

  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $FinalVideo
  if ($LASTEXITCODE -ne 0) { throw "Video probe failed." }
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $FinalVideo
  if ($LASTEXITCODE -ne 0) { throw "Duration probe failed." }
  Write-Host "Final video: $FinalVideo" -ForegroundColor Green
}
finally {
  Pop-Location
}
