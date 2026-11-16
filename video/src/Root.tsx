import { Composition } from 'remotion';
import spec from '../../config/spec.json';
import { TikTokVideo, type VideoProps } from './TikTokVideo';
import { PuppetShow, showDurationFrames, type ShowProps } from './PuppetShow';
import showDemo from '../../content/contoh-puppet/scenes.json';
import demo from '../../content/contoh-demo/scenes.json';
import { ImageScene, type ImageSceneProps } from './ImageScene';
import scene1 from '../../content/2026-11-15-bilik-378/scene1.json';
import { CharacterSheet } from './paper/CharacterSheet';
import { PodcastOpening, type PodcastOpeningProps } from './PodcastOpening';
import opening from '../../content/2026-11-15-bilik-378/scene1-puppet.json';

const totalSeconds = (props: VideoProps) => props.scenes.reduce((sum, s) => sum + s.duration, 0);

export const RemotionRoot = () => (
  <>
  <Composition id="PuppetShow" component={PuppetShow} width={spec.width} height={spec.height} fps={spec.fps}
    durationInFrames={showDurationFrames(showDemo as ShowProps, spec.fps)} defaultProps={showDemo as ShowProps}
    calculateMetadata={({ props }) => ({ durationInFrames: showDurationFrames(props, spec.fps) })} />
  <Composition id="ImageScene" component={ImageScene} width={spec.width} height={spec.height} fps={spec.fps}
    durationInFrames={Math.round((scene1 as ImageSceneProps).duration * spec.fps)} defaultProps={scene1 as ImageSceneProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duration * spec.fps) })} />
  <Composition id="PodcastOpening" component={PodcastOpening} width={spec.width} height={spec.height} fps={spec.fps}
    durationInFrames={Math.round((opening as PodcastOpeningProps).duration * spec.fps)} defaultProps={opening as PodcastOpeningProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duration * spec.fps) })} />
  <Composition id="CharacterSheet" component={CharacterSheet} width={1920} height={1080} fps={30} durationInFrames={1} />
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
  </>
);
