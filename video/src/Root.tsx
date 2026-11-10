import { Composition } from 'remotion';
import spec from '../../config/spec.json';
import { TikTokVideo, type VideoProps } from './TikTokVideo';
import demo from '../../content/contoh-demo/scenes.json';

const totalSeconds = (props: VideoProps) => props.scenes.reduce((sum, s) => sum + s.duration, 0);

export const RemotionRoot = () => (
  <Composition
    id="TikTok"
    component={TikTokVideo}
    width={spec.width}
    height={spec.height}
    fps={spec.fps}
    durationInFrames={Math.round(totalSeconds(demo as VideoProps) * spec.fps)}
    defaultProps={demo as VideoProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.round(totalSeconds(props) * spec.fps),
    })}
  />
);
