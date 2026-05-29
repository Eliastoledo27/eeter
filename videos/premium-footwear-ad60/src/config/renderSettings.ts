export const renderSettings = {
  compositionId: "PremiumFootwearAd60",
  durationSeconds: 60,
  fps: 60,
  width: 2160,
  height: 3840,
  master: {
    codec: "h265",
    crf: 16,
    audioCodec: "aac",
    output: "renders/premium-footwear-ad60-master-hevc.mp4",
  },
  social: {
    codec: "h264",
    crf: 19,
    audioCodec: "aac",
    output: "renders/premium-footwear-ad60-social-h264.mp4",
  },
  proxy: {
    codec: "h264",
    crf: 23,
    scale: 0.5,
    output: "renders/premium-footwear-ad60-proxy-1080p.mp4",
  },
} as const;
