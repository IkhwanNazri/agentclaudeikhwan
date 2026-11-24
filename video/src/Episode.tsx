// Episod penuh: podcast (RefPodcast) → cerita (StoryScene), dengan muzik suspense & ambience berterusan dalam cerita.
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { RefPodcast, type RefPodcastProps } from './RefPodcast';
import { StoryScene, storyDuration, type StoryProps } from './StoryScene';

export type EpisodeProps = { podcast: RefPodcastProps; story: StoryProps; music?: { src: string; volume: number }[] };

export const episodeDuration = (p: EpisodeProps, fps: number) => Math.round(p.podcast.duration * fps) + storyDuration(p.story, fps);

const Bed = ({ src, volume, len }: { src: string; volume: number; len: number }) => {
  const { fps } = useVideoConfig();
  const f2 = 2 * fps;
  return <Audio src={staticFile(src)} loop volume={(f) => volume * Math.min(1, f / f2, (len - f) / f2)} />;
};

export const Episode = (p: EpisodeProps) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const pod = Math.round(p.podcast.duration * fps);
  const story = storyDuration(p.story, fps);
  const dip = interpolate(frame, [pod - 10, pod, pod + 12], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence durationInFrames={pod}><RefPodcast {...p.podcast} /></Sequence>
      <Sequence from={pod} durationInFrames={story}>
        <StoryScene {...p.story} />
        {(p.music ?? []).map((m, i) => <Bed key={i} src={m.src} volume={m.volume} len={story} />)}
      </Sequence>
      <Sequence from={pod - 6} durationInFrames={Math.round(1.3 * fps)}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: dip }} />
    </AbsoluteFill>
  );
};
