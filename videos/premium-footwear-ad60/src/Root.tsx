import React from "react";
import { Composition, registerRoot } from "remotion";
import { EterEcosystemReel } from "./compositions/EterEcosystemReel";
import { PremiumFootwearAd60 } from "./compositions/PremiumFootwearAd60";
import { renderSettings } from "./config/renderSettings";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={renderSettings.compositionId}
      component={PremiumFootwearAd60}
      durationInFrames={renderSettings.durationSeconds * renderSettings.fps}
      fps={renderSettings.fps}
      width={renderSettings.width}
      height={renderSettings.height}
    />
    <Composition
      id="EterEcosystemReel"
      component={EterEcosystemReel}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(RemotionRoot);
