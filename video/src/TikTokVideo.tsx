import type { CSSProperties } from 'react';
import {
  AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/800.css';
import spec from '../../config/spec.json';
import { LowPoly3D, type Bg3d } from './LowPoly3D';
import { World3D, type Scene3d } from './World3D';

const fontFamily = 'Poppins, sans-serif';

type Animation = 'pop' | 'slideUp' | 'slideLeft' | 'fadeIn' | 'zoom' | 'bounce' | 'shake' | 'typewriter';
type Style = 'hook' | 'body' | 'caption' | 'emoji';

export type SceneElement = {
  text: string;
  style?: Style;
  animation?: Animation;
  delay?: number;
  animDuration?: number;
  color?: string;
  bg?: string;
  size?: number;
  highlight?: boolean;
  highlightWords?: string[];
};

export type Scene = {
  duration: number;
  bg?: string;
  bg3d?: Bg3d;
  scene3d?: Scene3d;
  image?: string;
  imagePrompt?: string;
  motion?: Motion;
  shots?: { image?: string; imagePrompt?: string; motion?: Motion }[];
  say?: string;
  voice?: string;
  align?: CSSProperties['justifyContent'];
  elements?: SceneElement[];
};

export type VideoProps = {
  title?: string;
  theme?: Partial<typeof spec.theme>;
  music?: string | null;
  bg3d?: Bg3d;
  scenes: Scene[];
};

type Theme = typeof spec.theme;

type Motion = 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown' | 'shake' | 'punch';

const sizeFor = (theme: Theme, style: Style = 'body') =>
  ({ hook: theme.hookSize, body: theme.bodySize, caption: theme.captionSize, emoji: 220 })[style];

const useEntrance = (animation: Animation, delaySec: number, durationSec: number): CSSProperties => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delaySec * fps;
  const progress = interpolate(local, [0, durationSec * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const springy = spring({ frame: local, fps, config: { damping: 10, stiffness: 120 } });
  const opacity = local < 0 ? 0 : 1;

  switch (animation) {
    case 'pop':
      return { opacity, transform: `scale(${springy})` };
    case 'slideUp':
      return { opacity: progress, transform: `translateY(${(1 - springy) * 160}px)` };
    case 'slideLeft':
      return { opacity: progress, transform: `translateX(${(1 - springy) * 300}px)` };
    case 'zoom':
      return { opacity: progress, transform: `scale(${interpolate(springy, [0, 1], [2.2, 1])})` };
    case 'bounce':
      return { opacity, transform: `translateY(${(1 - spring({ frame: local, fps, config: { damping: 6 } })) * -400}px)` };
    case 'shake': {
      const shakeOffset = local < durationSec * fps ? Math.sin(local * 1.6) * 25 * (1 - progress) : 0;
      return { opacity, transform: `translateX(${shakeOffset}px) rotate(${shakeOffset / 8}deg)` };
    }
    case 'typewriter':
      return { opacity, clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` };
    case 'fadeIn':
    default:
      return { opacity: progress };
  }
};

const renderText = (element: SceneElement, theme: Theme) => {
  if (!element.highlightWords?.length) return element.text;
  const pattern = new RegExp(`(${element.highlightWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
  return element.text.split(pattern).map((part, i) =>
    element.highlightWords?.includes(part) ? <span key={i} style={{ color: theme.accent2 }}>{part}</span> : part,
  );
};

const Element = ({ element, theme }: { element: SceneElement; theme: Theme }) => {
  const animation = element.animation ?? 'fadeIn';
  const entrance = useEntrance(animation, element.delay ?? 0, element.animDuration ?? (animation === 'typewriter' ? 1.2 : 0.6));
  const style: CSSProperties = {
    fontFamily,
    fontWeight: 800,
    lineHeight: 1.15,
    textAlign: 'center',
    fontSize: element.size ?? sizeFor(theme, element.style),
    color: element.color ?? (element.highlight ? theme.accent : theme.primary),
    position: 'relative',
    textShadow: element.style === 'hook' ? `0 0 40px ${theme.accent}88, 0 6px 0 #000` : '0 5px 0 #000, 0 0 18px #000a',
    ...(element.bg ? { background: element.bg, padding: '16px 32px', borderRadius: 24 } : {}),
    ...entrance,
  };
  return <div style={style}>{renderText(element, theme)}</div>;
};

// Gambar babak dengan pergerakan kamera (Ken Burns + goyang + punch-in)
const StoryImage = ({ src, motion }: { src: string; motion: Motion }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });
  const punchIn = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  let scale = 1.15, x = 0, y = 0;
  switch (motion) {
    case 'zoomIn': scale = 1.1 + p * 0.25; break;
    case 'zoomOut': scale = 1.35 - p * 0.25; break;
    case 'panLeft': x = interpolate(p, [0, 1], [60, -60]); scale = 1.25; break;
    case 'panRight': x = interpolate(p, [0, 1], [-60, 60]); scale = 1.25; break;
    case 'panUp': y = interpolate(p, [0, 1], [80, -80]); scale = 1.25; break;
    case 'panDown': y = interpolate(p, [0, 1], [-80, 80]); scale = 1.25; break;
    case 'shake': scale = 1.2 + p * 0.08; x = Math.sin(frame * 2.1) * 10; y = Math.cos(frame * 1.7) * 8; break;
    case 'punch': scale = 1.6 - punchIn * 0.4 + p * 0.06; break;
  }
  // goyang kamera tangan halus untuk semua babak
  x += Math.sin(frame / 13) * 4; y += Math.cos(frame / 17) * 4;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated',
        transform: `translate(${x}px, ${y}px) scale(${scale})` }} />
    </AbsoluteFill>
  );
};

// Beberapa shot dalam satu babak, masa dibahagi sama rata
const Shots = ({ shots }: { shots: NonNullable<Scene['shots']> }) => {
  const { durationInFrames } = useVideoConfig();
  const each = Math.ceil(durationInFrames / shots.length);
  return (
    <>
      {shots.map((shot, k) => shot.image ? (
        <Sequence key={k} from={k * each} durationInFrames={each}>
          <StoryImage src={shot.image} motion={shot.motion ?? 'zoomIn'} />
        </Sequence>
      ) : null)}
    </>
  );
};

// Caption satu perkataan (gaya storytelling)
const WordCaption = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);
  const idx = Math.min(words.length - 1, Math.floor(interpolate(frame, [0, durationInFrames * 0.94], [0, words.length], { extrapolateRight: 'clamp' })));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: '62%', textAlign: 'center', fontFamily, fontWeight: 800,
      fontStyle: 'italic', fontSize: 64, color: '#ffe94d', textTransform: 'uppercase', letterSpacing: 1,
      WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 4px 0 #000' }}>
      {words[idx]?.replace(/[.,!?]+$/, '')}
    </div>
  );
};

const Subtitle = ({ text, theme }: { text: string; theme: Theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);
  // tunjuk 4 perkataan sekali, perkataan semasa diwarnakan
  const progress = interpolate(frame, [0, durationInFrames * 0.92], [0, words.length], { extrapolateRight: 'clamp' });
  const current = Math.min(words.length - 1, Math.floor(progress));
  const start = Math.floor(current / 4) * 4;
  const chunk = words.slice(start, start + 4);
  return (
    <div style={{ position: 'absolute', left: spec.safeArea.left, right: spec.safeArea.right, bottom: spec.safeArea.bottom + 60,
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 30, rowGap: 4, fontFamily, fontWeight: 800, fontSize: theme.captionSize + 14, lineHeight: 1.2, color: '#fff',
      textShadow: '0 0 6px #000, 0 4px 0 #000, 0 -2px 0 #000, 3px 0 0 #000, -3px 0 0 #000', textTransform: 'uppercase' }}>
      {chunk.map((w, i) => (
        <span key={start + i} style={{ color: start + i === current ? '#ffe600' : '#fff',
          display: 'inline-block', transform: start + i === current ? 'scale(1.06)' : 'none' }}>{w}</span>
      ))}
    </div>
  );
};

const ProgressBar = ({ color }: { color: string }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <div style={{ position: 'absolute', left: 0, bottom: 0, height: 12, background: color, width: `${(frame / durationInFrames) * 100}%` }} />;
};

export const TikTokVideo = ({ scenes, theme: themeOverride, music, bg3d }: VideoProps) => {
  const { fps } = useVideoConfig();
  const theme: Theme = { ...spec.theme, ...themeOverride };
  const sa = spec.safeArea;
  let cursor = 0;

  return (
    <AbsoluteFill style={{ background: theme.background }}>
      {scenes.map((scene, i) => {
        const from = Math.round(cursor * fps);
        cursor += scene.duration;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.round(scene.duration * fps)}>
            <AbsoluteFill
              style={{
                background: scene.bg ?? (i % 2 ? theme.backgroundAlt : theme.background),
                justifyContent: scene.align ?? 'center',
                alignItems: 'center',
                gap: 48,
                padding: `${sa.top}px ${sa.right}px ${sa.bottom}px ${sa.left}px`,
              }}
            >
              {scene.image ? <StoryImage src={scene.image} motion={scene.motion ?? 'zoomIn'} /> : null}
              {!scene.image && scene.shots?.length ? <Shots shots={scene.shots} /> : null}
              {!scene.image && !scene.shots?.length && scene.scene3d ? <World3D scene={scene.scene3d} accent={theme.accent} /> : null}
              {!scene.image && !scene.scene3d && (scene.bg3d ?? bg3d) ? <LowPoly3D bg={{ ...bg3d, ...scene.bg3d }} accent={theme.accent} /> : null}
              {(scene.elements ?? []).map((element, j) => <Element key={j} element={element} theme={theme} />)}
              {scene.voice ? <Audio src={staticFile(scene.voice)} /> : null}
              {scene.say && (scene.image || scene.shots?.length) ? <WordCaption text={scene.say} /> : null}
              {scene.say && scene.scene3d && !scene.image && !scene.shots?.length ? <Subtitle text={scene.say} theme={theme} /> : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {music ? <Audio src={staticFile(music)} volume={0.15} /> : null}
      <ProgressBar color={theme.accent} />
    </AbsoluteFill>
  );
};
