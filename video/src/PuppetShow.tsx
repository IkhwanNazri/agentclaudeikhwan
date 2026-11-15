// Video penuh gaya teater boneka kertas 3D. Dipacu oleh scenes.json (composition: "PuppetShow").
import { useEffect, useState, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import {
  AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/800.css';
import {
  AINA, Banner, C, Calendar, Clock, Paper, Puppet, Puppeteer, Stage, TextPlane, circle, ellipse, pie, poly, rect, type Look,
} from './puppet/kit';

export type ShowSet = 'intro' | 'curtain' | 'routine' | 'study' | 'road' | 'janet' | 'memory' | 'scroll' | 'balcony' | 'cta';
export type ShowScene = {
  set: ShowSet;
  duration: number;
  say?: string;
  voice?: string;
  voiceName?: string;
  speaker?: 'host1' | 'host2';
  title?: boolean;
  banner?: string;
  text?: string;
};
export type ShowProps = { title?: string; scenes: ShowScene[] };

const STEP = 2; // 15fps rasa stop-motion
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const HOST1: Look = { hair: 'bun', hairColor: '#3a2418', dress: true, shirt: '#e8b33c', bow: C.red, skin: '#e9b48a' };
const HOST2: Look = { hair: 'short', hairColor: '#1f1a18', shirt: '#e07a3f', pants: '#2f3a52', glasses: true, bow: '#2a6f8f', skin: '#c98d62' };

// ---------------------------------------------------------------- utiliti

type Ctx = { lf: number; dur: number; fps: number; scene: ShowScene };

const rise = (lf: number, fps: number, delay = 3) => interpolate(spring({ frame: lf - delay, fps, config: { damping: 13 } }), [0, 1], [-6.5, 0]);
const talk = (lf: number, voiceFrames: number) => (lf < voiceFrames ? (Math.sin(lf * 1.25) > -0.2 ? 0.9 : 0.25) : 0);

// Set "diterbangkan" turun dari atas pentas bila babak bermula
const Fly = ({ lf, fps, children }: { lf: number; fps: number; children: ReactNode }) => {
  const y = interpolate(spring({ frame: lf, fps, config: { damping: 15, mass: 0.9 } }), [0, 1], [7.5, 0]);
  return <group position={[0, y, 0]}>{children}</group>;
};

const Wall = ({ color }: { color: string }) => (
  <Paper shape={rect(6.2, 7.6, 0)} color={color} depth={0.05} position={[0, 1.4, -2.2]} cast={false} />
);

const HangBanner = ({ text, lf, fps, y = 3.3, z = -0.9 }: { text: string; lf: number; fps: number; y?: number; z?: number }) => {
  const drop = interpolate(spring({ frame: lf - 10, fps, config: { damping: 11 } }), [0, 1], [4, 0]);
  return (
    <group position={[0, y + drop, z]} rotation={[0, 0, Math.sin(lf * 0.12) * 0.025]}>
      <Banner text={text} w={4.2} />
    </group>
  );
};

// ---------------------------------------------------------------- babak

const Routine = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const stripX = interpolate(t, [0, 1], [2.2, -9.8]);
  const pages = ['FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL'];
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#ead7b4" />
        <group position={[-1.6, 3.0, -2.1]} rotation={[0, 0, -0.06]}>
          <Calendar month={1 + t * 9.5} />
        </group>
        <group position={[stripX, 0, -1.5]}>
          {/* katil */}
          <group position={[0, 0, 0]}>
            <Paper shape={rect(2.4, 0.5, 0.1)} color="#8a5a3b" position={[0, -1.2, 0]} />
            <Paper shape={rect(2.2, 0.35, 0.12)} color="#7fa7c9" position={[0.1, -0.85, 0.03]} />
            <Paper shape={ellipse(0.4, 0.2)} color={C.cream} position={[-0.75, -0.62, 0.04]} />
            <Paper shape={rect(0.25, 1.3, 0.05)} color="#6e4630" position={[-1.15, -0.8, -0.02]} />
          </group>
          {/* meja kerja */}
          <group position={[4, 0, 0]}>
            <Paper shape={rect(2.2, 0.16, 0.02)} color={C.wood} position={[0, -0.75, 0]} />
            <Paper shape={rect(0.12, 1.1, 0)} color={C.woodDark} position={[-0.95, -1.35, -0.02]} />
            <Paper shape={rect(0.12, 1.1, 0)} color={C.woodDark} position={[0.95, -1.35, -0.02]} />
            <Paper shape={poly([[-0.45, 0], [0.45, 0], [0.38, 0.62], [-0.38, 0.62]])} color="#5d6670" position={[0.2, -0.66, 0.03]} />
          </group>
          {/* tren */}
          <group position={[8, 0, 0]}>
            <Paper shape={rect(3.4, 2.4, 0.12)} color="#c9d3db" position={[0, 0.6, -0.05]} />
            <Paper shape={rect(1.2, 0.9, 0.08)} color="#9cc8e8" position={[-0.8, 1.0, 0]} />
            <Paper shape={rect(1.2, 0.9, 0.08)} color="#9cc8e8" position={[0.8, 1.0, 0]} />
            <Paper shape={rect(3.4, 0.25, 0)} color="#c23a3a" position={[0, 0.25, 0]} />
            <Paper shape={rect(0.06, 2.2, 0)} color="#888" position={[0, 0.3, 0.05]} />
          </group>
          <group position={[12, 0, 0]}>
            <Paper shape={rect(2.4, 0.5, 0.1)} color="#8a5a3b" position={[0, -1.2, 0]} />
            <Paper shape={rect(2.2, 0.35, 0.12)} color="#7fa7c9" position={[0.1, -0.85, 0.03]} />
          </group>
        </group>
        {/* helaian kalendar berterbangan */}
        {pages.map((m, i) => {
          const p = lf - 8 - i * 9;
          if (p < 0 || p > 60) return null;
          return (
            <group key={m} position={[-1.4 + p * 0.06 + i * 0.3, 2.6 - p * 0.09, -0.6 + i * 0.05]} rotation={[0, 0, p * (i % 2 ? 0.12 : -0.1)]}>
              <Paper shape={rect(0.8, 0.55, 0.03)} color={C.cream} />
              <TextPlane lines={[{ text: m, color: C.red, size: 200 }]} w={0.7} h={0.4} position={[0, 0, 0.03]} pxW={700} pxH={400} />
            </group>
          );
        })}
      </Fly>
      <Puppeteer rod={1.75} x={0.2} y={-0.1 + rise(lf, fps) + Math.abs(Math.sin(lf * 0.3)) * 0.14} z={-0.4} tilt={Math.sin(lf * 0.3) * 0.05}>
        <Puppet look={AINA} pose={{ armF: Math.sin(lf * 0.6) * 0.4, armB: -Math.sin(lf * 0.6) * 0.4, leg: Math.sin(lf * 0.6) * 0.3, eyes: 'closed', hold: 'coffee' }} />
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const CROWD: { look: Look; x: number }[] = [
  { look: { hair: 'short', shirt: '#d9534f', skin: '#d79a70' }, x: -1.9 },
  { look: { hair: 'bob', shirt: '#8e7cc3', hairColor: '#4a2c1a' }, x: -0.95 },
  { look: { hair: 'short', shirt: '#4f9d8a', glasses: true, skin: '#c98d62' }, x: 0 },
  { look: { hair: 'grey', shirt: '#a0784e', beard: true, skin: '#e2b38f' }, x: 0.95 },
  { look: { hair: 'bun', hairColor: '#cfc8bf', dress: true, shirt: '#b06a9a', skin: '#e8b996' }, x: 1.9 },
];

const Study = ({ lf, dur, fps, scene }: Ctx) => {
  const nod = Math.sin(lf * 0.35) * 0.12;
  const y = rise(lf, fps, 6);
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#cfdcc4" />
        <Paper shape={rect(2.6, 1.6, 0.04)} color="#f4f1e6" position={[0, 1.7, -2.1]} />
        <group position={[2.1, 2.4, -2.05]}>
          <Clock spin={lf * 0.12} r={0.5} />
        </group>
      </Fly>
      {/* bangku penuh boneka pelbagai umur, dipegang dua tangan */}
      <group position={[0, -0.2 + y, -0.5]}>
        {CROWD.map(({ look, x }, i) => (
          <group key={i} position={[x, 0.1, -0.05]} scale={0.52}>
            <Puppet look={look} pose={{ head: nod * (i % 2 ? 1 : -1), hold: 'clock', armF: 0.9, mouth: 0 }} />
          </group>
        ))}
        <Paper shape={rect(5.0, 0.55, 0.06)} color="#8a5a3b" position={[0, -0.45, 0.1]} />
        <Paper shape={rect(5.0, 0.12, 0.02)} color={C.gold} position={[0, -0.2, 0.14]} />
        <Puppeteer rod={1.2} x={-1.7} y={-0.5} z={0.05}><group /></Puppeteer>
        <Puppeteer rod={1.2} x={1.7} y={-0.5} z={0.05}><group /></Puppeteer>
      </group>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
      {lf > dur * 0.55 ? (
        <group position={[0, 1.45, -0.7]}>
          <Paper shape={rect(3.6, 0.6, 0.08)} color={C.cream} />
          <TextPlane lines={[{ text: 'jam · minggu · bulan = SAMA', color: C.ink, size: 110 }]} w={3.4} h={0.55} position={[0, 0, 0.03]} pxW={1400} pxH={230} />
        </group>
      ) : null}
    </>
  );
};

const Road = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const look = t > 0.25 && t < 0.55; // berpaling ke belakang
  const shrug = interpolate(t, [0.6, 0.7], [0, 1], clamp);
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#f2b07e" />
        <Paper shape={rect(6.2, 3.0, 0)} color="#f6c995" position={[0, 3.8, -2.18]} cast={false} />
        <Paper shape={circle(0.45)} color="#fff1c9" position={[1.6, 2.4, -2.15]} />
        <Paper shape={poly([[-3.1, -2.2], [-3.1, 0.6], [-1.5, 1.1], [0, 0.7], [1.6, 1.25], [3.1, 0.7], [3.1, -2.2]])} color="#8fb37a" position={[0, 0, -2.12]} />
        {/* jalan menirus ke kejauhan */}
        <Paper shape={poly([[-1.6, -2.2], [1.6, -2.2], [0.18, 1.0], [-0.18, 1.0]])} color="#d8c3a0" position={[0, 0, -2.08]} />
        {Array.from({ length: 10 }, (_, i) => {
          const k = i / 9;
          const yy = interpolate(k, [0, 1], [-1.6, 0.9]);
          const half = interpolate(k, [0, 1], [1.75, 0.3]);
          const s = interpolate(k, [0, 1], [1, 0.22]);
          return (
            <group key={i}>
              {[-1, 1].map((sd) => (
                <group key={sd} position={[sd * half, yy, -2.0 + k * -0.05]} scale={s}>
                  <Paper shape={rect(0.16, 0.7, 0.04)} color="#efe6d6" />
                  <Paper shape={rect(0.18, 0.12, 0.02)} color={C.red} position={[0, 0.3, 0.02]} />
                </group>
              ))}
              <group position={[0, yy - 0.05, -1.95]} scale={s * 0.9}>
                <TextPlane lines={[{ text: String(10 - i), color: '#6b4a2b', size: 260 }]} w={0.5} h={0.4} pxW={400} pxH={320} />
              </group>
            </group>
          );
        })}
        {/* Aina remaja kecil di hujung jalan */}
        <group position={[0, 1.05, -1.9]} scale={0.28}>
          <Puppet look={{ ...AINA, shirt: '#e58fb0', lanyard: false }} pose={{ armF: Math.sin(lf * 0.3) * 0.8 + 0.8 }} />
        </group>
      </Fly>
      <Puppeteer rod={1.75} x={1.1} y={-0.1 + rise(lf, fps)} z={-0.3}>
        <group scale={[look ? -1 : 1, 1, 1]}>
          <Puppet look={AINA} pose={{ armF: shrug * 1.3, armB: shrug * 1.3, head: shrug * 0.15, eyes: shrug > 0.5 ? 'open' : look ? 'wide' : 'open' }} />
        </group>
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const Janet = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const step = Math.min(4, Math.floor(t * 5));
  const frac = [1, 0.5, 0.25, 0.125, 0.0625][step];
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#5e4231" />
        {/* rak buku */}
        {[0, 1, 2].map((row) => (
          <group key={row} position={[0, 3.6 - row * 1.25, -2.12]}>
            <Paper shape={rect(6.0, 0.12, 0)} color="#3c271b" position={[0, -0.5, 0.02]} />
            {Array.from({ length: 16 }, (_, i) => (
              <Paper key={i} shape={rect(0.26, 0.8 - ((i * 7 + row * 3) % 4) * 0.08, 0.02)}
                color={['#a33b3b', '#3b6aa3', '#c9a24a', '#4f7d4a', '#7a4a8a'][(i + row) % 5]}
                position={[-2.8 + i * 0.37, -0.08 - ((i * 7 + row * 3) % 4) * 0.04, 0.04]} />
            ))}
          </group>
        ))}
        {/* easel + pai mengecil */}
        <group position={[0.35, 0.55, -1.2]}>
          <Paper shape={poly([[-0.05, 1.2], [0.05, 1.2], [0.7, -1.6], [0.6, -1.6]])} color="#7a5236" />
          <Paper shape={poly([[-0.05, 1.2], [0.05, 1.2], [-0.6, -1.6], [-0.7, -1.6]])} color="#7a5236" />
          <Paper shape={rect(1.9, 1.9, 0.06)} color="#f4ead2" position={[0, 0.25, 0.06]} />
          <Paper shape={circle(0.75)} color="#e3d2b0" position={[0, 0.25, 0.1]} depth={0.02} />
          <Paper shape={pie(0.75, frac)} color={C.red} position={[0, 0.25, 0.13]} depth={0.03} />
          <group position={[0, -0.85, 0.12]}>
            <TextPlane lines={[{ text: `umur ${Math.round(1 / frac)} → 1/${Math.round(1 / frac)}`, color: C.ink, size: 140 }]} w={1.6} h={0.4} pxW={900} pxH={230} />
          </group>
        </group>
      </Fly>
      <Puppeteer rod={1.75} x={-1.75} y={-0.1 + rise(lf, fps)} z={-0.3}>
        <Puppet look={{ hair: 'grey', beard: true, glasses: true, shirt: '#7a5236', pants: '#3a2a20', skin: '#edc4a1' }}
          pose={{ armF: 0.9 + Math.sin(lf * 0.2) * 0.15, hold: 'book', mouth: talk(lf, dur * 0.6) * 0.6 }} />
      </Puppeteer>
      <Puppeteer rod={1.75} x={1.85} y={-0.1 + rise(lf, fps, 12)} z={-0.25} scale={0.9}>
        <group scale={[-1, 1, 1]}>
          <Puppet look={AINA} pose={{ armF: t > 0.6 ? 2.7 + Math.sin(lf * 0.9) * 0.2 : 0.2, head: t > 0.6 ? -0.12 : 0 }} />
        </group>
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const Memory = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const x = interpolate(t, [0, 0.45], [-1.9, 0.6], clamp);
  const walking = t < 0.45 ? 1 : 0;
  const unsure = t > 0.6 ? Math.sin(lf * 0.8) * 0.5 : 0;
  const glow = 0.6 + Math.sin(lf * 0.25) * 0.4;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#b4bfca" />
        <group position={[0, 1.9, -1.9]}>
          {[0, 1, 2].map((row) => (
            <group key={row}>
              <Paper shape={rect(5.2, 0.1, 0)} color="#6e5a46" position={[0, 1.15 - row * 1.15, 0]} />
              {Array.from({ length: 5 }, (_, i) => {
                const special = row === 1 && i === 3;
                return (
                  <Paper key={i} shape={rect(0.8, 0.75, 0.04)} color={special ? '#ffd866' : '#9aa1a8'}
                    glow={special ? '#ffb83a' : undefined}
                    position={[-2.0 + i * 1.0, 0.6 - row * 1.15, 0.05]} />
                );
              })}
            </group>
          ))}
        </group>
      </Fly>
      <pointLight position={[1.0, 1.55, -1.2]} intensity={2.5 * glow} distance={3} color="#ffc35a" />
      <Puppeteer rod={1.75} x={x} y={-0.1 + rise(lf, fps) + Math.abs(Math.sin(lf * 0.3)) * 0.12 * walking} z={-0.3}>
        <Puppet look={AINA} pose={{ leg: Math.sin(lf * 0.6) * 0.3 * walking, armB: Math.sin(lf * 0.6) * 0.3 * walking, armF: t > 0.6 ? 1.6 + unsure : Math.sin(lf * 0.6) * -0.3 * walking }} />
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} y={3.55} /> : null}
    </>
  );
};

const Scroll = ({ lf, dur, fps }: Ctx) => {
  const t = lf / dur;
  const woke = t > 0.75;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#2d3754" />
        <Paper shape={rect(1.8, 2.0, 0.04)} color="#121a33" position={[1.6, 2.6, -2.1]} />
        <Paper shape={circle(0.28)} color="#f3eccc" glow="#c9c29a" position={[2.0, 3.1, -2.05]} />
        {[[1.1, 3.3], [1.3, 2.2], [2.2, 2.0], [1.0, 2.7]].map(([sx, sy], i) => (
          <Paper key={i} shape={circle(0.04)} color="#fff" glow="#ffffff" position={[sx, sy, -2.05]} />
        ))}
        <group position={[-1.4, 2.9, -2.05]}>
          <Clock spin={lf * 0.9} r={0.6} />
        </group>
      </Fly>
      <Puppeteer rod={1.6} x={0} y={-0.55 + rise(lf, fps)} z={-0.6}>
        <Puppet look={AINA} pose={{ armF: woke ? 0.4 : 1.25, hold: 'phone', phoneGlow: woke ? 0 : 1, eyes: woke ? 'wide' : 'open', head: woke ? Math.sin(lf * 0.4) * 0.2 : 0.08 }} />
      </Puppeteer>
      <pointLight position={[0.5, 0.6, 0.3]} intensity={woke ? 0 : 4} distance={3} color="#7fdcff" />
      {/* sofa di depan (tutup kaki) */}
      <group position={[0, -1.3, -0.1]} >
        <Paper shape={rect(3.8, 1.0, 0.25)} color="#8b4a5c" />
        <Paper shape={rect(0.6, 1.4, 0.25)} color="#7a3d4f" position={[-1.9, 0.2, 0.05]} />
        <Paper shape={rect(0.6, 1.4, 0.25)} color="#7a3d4f" position={[1.9, 0.2, 0.05]} />
      </group>
    </>
  );
};

const BalconySet = ({ lf, fps }: { lf: number; fps: number }) => (
  <Fly lf={lf} fps={fps}>
    <Wall color="#f4a07a" />
    <Paper shape={rect(6.2, 3.4, 0)} color="#f7c08a" position={[0, 3.6, -2.18]} cast={false} />
    <Paper shape={rect(6.2, 1.4, 0)} color="#e48aa0" position={[0, 0.6, -2.17]} cast={false} />
    <Paper shape={circle(0.5)} color="#ffe2a8" position={[-1.2, 1.6, -2.15]} />
    <Paper shape={poly([[-3.1, -0.2], [-3.1, 0.8], [-2.4, 0.8], [-2.4, 1.4], [-1.8, 1.4], [-1.8, 0.5], [-0.9, 0.5], [-0.9, 1.9], [-0.75, 2.3], [-0.6, 1.9], [-0.6, 0.6], [0.4, 0.6], [0.4, 1.2], [1.4, 1.2], [1.4, 0.4], [2.2, 0.4], [2.2, 1.0], [3.1, 1.0], [3.1, -0.2]])}
      color="#6b4f7a" position={[0, 0, -2.12]} />
    {/* pagar balkoni */}
    <group position={[0, -0.6, -1.4]}>
      <Paper shape={rect(6.0, 0.14, 0.02)} color="#f1ead8" position={[0, 0.7, 0]} />
      {Array.from({ length: 13 }, (_, i) => (
        <Paper key={i} shape={rect(0.08, 1.4, 0)} color="#f1ead8" position={[-2.85 + i * 0.475, 0, 0]} />
      ))}
      <Paper shape={poly([[-0.22, 0], [0.22, 0], [0.18, 0.4], [-0.18, 0.4]])} color="#c0643a" position={[-2.2, 0.77, 0.05]} />
      <Paper shape={ellipse(0.16, 0.4)} color={C.green} position={[-2.2, 1.45, 0.03]} />
      <Paper shape={poly([[-0.2, 0], [0.2, 0], [0.16, 0.36], [-0.16, 0.36]])} color="#3f7fa8" position={[2.3, 0.77, 0.05]} />
      <Paper shape={ellipse(0.22, 0.3)} color="#e86f8f" position={[2.3, 1.35, 0.03]} />
    </group>
  </Fly>
);

const Balcony = ({ lf, dur, fps }: Ctx) => {
  const t = lf / dur;
  const boxUp = interpolate(t, [0.45, 0.7], [0, 1], clamp);
  return (
    <>
      <BalconySet lf={lf} fps={fps} />
      <Puppeteer rod={1.75} x={-0.3} y={-0.1 + rise(lf, fps)} z={-0.3}>
        <Puppet look={AINA} pose={{ armF: 1.1, hold: 'pot', head: Math.sin(lf * 0.2) * 0.06 }} />
      </Puppeteer>
      {boxUp > 0 ? (
        <group position={[1.5, -0.2 + boxUp * 1.6, -0.6]} rotation={[0, lf * 0.05, 0.1]} scale={boxUp}>
          <Paper shape={rect(0.6, 0.55, 0.05)} color="#ffd866" glow="#ffb83a" depth={0.3} />
        </group>
      ) : null}
      {boxUp > 0 ? <pointLight position={[1.5, 1.4, -0.2]} intensity={3 * boxUp} distance={3} color="#ffc35a" /> : null}
    </>
  );
};

const Cta = ({ lf, dur, fps }: Ctx) => {
  const wave = Math.sin(lf * 0.7) * 0.35;
  const hostsUp = rise(lf, fps, 10);
  return (
    <>
      <BalconySet lf={dur} fps={fps} />
      <Puppeteer rod={1.75} x={0} y={-0.1} z={-0.3}>
        <Puppet look={AINA} pose={{ armF: 2.5 + wave, mouth: 0 }} />
      </Puppeteer>
      <Puppeteer rod={1.75} x={-1.95} y={-0.25 + hostsUp} z={0.2} scale={0.8}>
        <Puppet look={HOST1} pose={{ armF: 2.4 - wave }} />
      </Puppeteer>
      <Puppeteer rod={1.75} x={1.95} y={-0.25 + hostsUp} z={0.2} scale={0.8}>
        <group scale={[-1, 1, 1]}>
          <Puppet look={HOST2} pose={{ armF: 2.4 + wave }} />
        </group>
      </Puppeteer>
    </>
  );
};

// ---------------------------------------------------------------- pembukaan: dua pengacara

const TitleCard = ({ title }: { title: string }) => {
  const words = title.toUpperCase().split(' ');
  const mid = Math.ceil(words.length / 2);
  return (
    <group>
      <mesh position={[-1.4, 1.6, -0.02]}><cylinderGeometry args={[0.012, 0.012, 3, 6]} /><meshStandardMaterial color="#d8c8a8" /></mesh>
      <mesh position={[1.4, 1.6, -0.02]}><cylinderGeometry args={[0.012, 0.012, 3, 6]} /><meshStandardMaterial color="#d8c8a8" /></mesh>
      <Paper shape={rect(3.9, 2.0, 0.16)} color={C.card} depth={0.06} />
      <Paper shape={rect(3.65, 1.75, 0.12)} color="#fbf4e4" depth={0.02} position={[0, 0, 0.04]} />
      <TextPlane lines={[
        { text: words.slice(0, mid).join(' '), color: C.ink, size: 130 },
        { text: words.slice(mid).join(' '), color: C.red, size: 130 },
      ]} w={3.6} h={1.7} position={[0, 0, 0.06]} pxW={1100} pxH={520} />
      <group position={[1.75, 0.95, 0.08]} rotation={[0, 0, 0.2]} scale={0.6}>
        <Clock spin={0} r={0.62} />
      </group>
    </group>
  );
};

const Hosts = ({ frame, fps, intro, title }: { frame: number; fps: number; intro: { start: number; dur: number; scene: ShowScene; voiceFrames: number }[]; title: string }) => {
  const cur = intro.find((s) => frame >= s.start && frame < s.start + s.dur);
  const last = intro[intro.length - 1];
  const introEnd = last.start + last.dur;
  const titleScene = intro.find((s) => s.scene.title);
  const exit = interpolate(frame, [introEnd, introEnd + fps * 0.6], [0, 1], clamp);
  if (exit >= 1) return null;
  const enter = interpolate(spring({ frame, fps, config: { damping: 12 } }), [0, 1], [-2.5, 0]);
  const y = -0.12 + enter - exit * 7;
  const mouthOf = (who: 'host1' | 'host2') => (cur && cur.scene.speaker === who ? talk(frame - cur.start, cur.voiceFrames) : 0);
  const bounce = (who: 'host1' | 'host2') => (cur && cur.scene.speaker === who ? Math.abs(Math.sin((frame - cur.start) * 0.3)) * 0.12 : 0);
  const gesture = (who: 'host1' | 'host2') => (cur && cur.scene.speaker === who ? 1.3 + Math.sin((frame - cur.start) * 0.25) * 0.4 : 0.3);
  const titleIn = titleScene ? spring({ frame: frame - titleScene.start - 4, fps, config: { damping: 10 } }) : 0;
  const titleY = interpolate(titleIn, [0, 1], [7, 2.55]) + exit * 7;
  return (
    <>
      {titleScene ? (
        <group position={[0, titleY, 0.85]} rotation={[0, 0, Math.sin(frame * 0.12) * 0.03]} scale={0.88}>
          <TitleCard title={title} />
        </group>
      ) : null}
      <Puppeteer rod={1.75} x={-1.5} y={y + bounce('host1')} z={0.95} scale={0.9} tilt={bounce('host1') * 0.3}>
        <Puppet look={HOST1} pose={{ armF: gesture('host1'), mouth: mouthOf('host1'), hold: 'mic' }} />
      </Puppeteer>
      <Puppeteer rod={1.75} x={1.5} y={y + bounce('host2')} z={0.95} scale={0.9} tilt={-bounce('host2') * 0.3}>
        <group scale={[-1, 1, 1]}>
          <Puppet look={HOST2} pose={{ armF: gesture('host2'), mouth: mouthOf('host2') }} />
        </group>
      </Puppeteer>
    </>
  );
};

// ---------------------------------------------------------------- lampu & kamera

const Lights = ({ mode }: { mode: 'warm' | 'night' | 'dusk' }) => {
  const key = mode === 'night' ? '#9fb4ff' : mode === 'dusk' ? '#ffc79a' : '#ffd6a8';
  return (
    <>
      <ambientLight intensity={mode === 'night' ? 0.18 : 0.35} color="#ffe2c4" />
      <hemisphereLight args={['#ffe8cc', '#2a1214', mode === 'night' ? 0.25 : 0.5]} />
      <directionalLight position={[0.8, 3.5, 12]} intensity={mode === 'night' ? 0.6 : 1.5} color={key} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={7} shadow-camera-bottom={-6} shadow-bias={-0.0005} />
      <spotLight position={[0, 7, 10]} angle={0.4} penumbra={0.6} intensity={mode === 'night' ? 110 : 250} decay={2} color={mode === 'night' ? '#b8c6ff' : '#fff0d6'} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[0, -1.6, 2.2]} intensity={6} distance={6} color="#ffc070" />
    </>
  );
};

const Rig = ({ z }: { z: number }) => {
  const { camera } = useThree();
  const frame = useCurrentFrame();
  camera.position.set(Math.sin(frame * 0.01) * 0.12, -0.2, z);
  camera.lookAt(0, -0.4, 0);
  return null;
};

// ---------------------------------------------------------------- komposisi

const SETS: Partial<Record<ShowSet, (c: Ctx) => ReactNode>> = {
  routine: Routine, study: Study, road: Road, janet: Janet, memory: Memory, scroll: Scroll, balcony: Balcony, cta: Cta,
};

const World = ({ props }: { props: ShowProps }) => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = Math.floor(raw / STEP) * STEP;
  const timeline = timelineOf(props.scenes, fps);
  const cur = timeline.find((s) => frame >= s.start && frame < s.start + s.dur) ?? timeline[timeline.length - 1];
  const intro = timeline.filter((s) => s.scene.set === 'intro');
  const curtainScene = timeline.find((s) => s.scene.set === 'curtain');
  const ctaScene = timeline.find((s) => s.scene.set === 'cta');
  const total = timeline.reduce((a, s) => a + s.dur, 0);
  const openT = curtainScene ? interpolate(frame, [curtainScene.start + fps * 0.3, curtainScene.start + curtainScene.dur], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }) : 1;
  const closeT = ctaScene ? interpolate(frame, [total - fps * 1.2, total - fps * 0.2], [0, 1], clamp) : 0;
  const open = Math.max(0, openT - closeT);
  const lf = frame - cur.start;
  const Set = SETS[cur.scene.set];
  const mode = cur.scene.set === 'scroll' ? 'night' : cur.scene.set === 'balcony' || cur.scene.set === 'cta' || cur.scene.set === 'road' ? 'dusk' : 'warm';
  const storyZ = interpolate(lf, [0, cur.dur], [13.9, 13.2], clamp);
  const camZ = cur.scene.set === 'intro' || cur.scene.set === 'curtain' ? 14.3 : storyZ;
  return (
    <>
      <Rig z={camZ} />
      <color attach="background" args={['#120a0c']} />
      <Lights mode={mode} />
      <Stage open={open} />
      {(() => {
        // Set babak pertama turun semasa tirai dibuka dan bersambung tanpa lompat
        const first = timeline.find((s) => SETS[s.scene.set]);
        const F = first ? SETS[first.scene.set] : undefined;
        const inFirst = first && (cur === first || cur === curtainScene);
        if (F && first && curtainScene && inFirst) {
          return <F lf={frame - curtainScene.start} dur={first.dur + curtainScene.dur} fps={fps} scene={first.scene} />;
        }
        return Set ? <Set lf={lf} dur={cur.dur} fps={fps} scene={cur.scene} /> : null;
      })()}
      {intro.length ? <Hosts frame={frame} fps={fps} intro={intro} title={props.title ?? ''} /> : null}
    </>
  );
};

type Timed = { start: number; dur: number; scene: ShowScene; voiceFrames: number };
const timelineOf = (scenes: ShowScene[], fps: number): Timed[] => {
  let t = 0;
  return scenes.map((scene) => {
    const dur = Math.round(scene.duration * fps);
    const item = { start: t, dur, scene, voiceFrames: Math.max(0, dur - Math.round(0.45 * fps)) };
    t += dur;
    return item;
  });
};

const Subtitle = ({ text, dur }: { text: string; dur: number }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  const progress = interpolate(frame, [0, dur * 0.9], [0, words.length], clamp);
  const current = Math.min(words.length - 1, Math.floor(progress));
  const start = Math.floor(current / 4) * 4;
  const chunk = words.slice(start, start + 4);
  return (
    <div style={{ position: 'absolute', left: 70, right: 170, bottom: 440, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, rowGap: 2,
      fontFamily: 'Poppins', fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: '#fff', textTransform: 'uppercase',
      WebkitTextStroke: '10px #1a0d0f', paintOrder: 'stroke fill' }}>
      {chunk.map((w, i) => (
        <span key={start + i} style={{ color: start + i === current ? '#ffd64a' : '#fff8ea' }}>{w}</span>
      ))}
    </div>
  );
};

export const PuppetShow = (props: ShowProps) => {
  const { width, height, fps } = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load('800 100px Poppins'), document.fonts.load('600 100px Poppins')])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  const timeline = timelineOf(props.scenes, fps);
  const cta = props.scenes.find((s) => s.set === 'cta');
  const ctaT = timeline.find((s) => s.scene.set === 'cta');
  return (
    <AbsoluteFill style={{ backgroundColor: '#120a0c' }}>
      {ready ? (
        <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 40, near: 0.1, far: 60 }} style={{ position: 'absolute', inset: 0 }}>
          <World props={props} />
        </ThreeCanvas>
      ) : null}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 50%, rgba(10,4,4,0.6) 100%)', pointerEvents: 'none' }} />
      {timeline.map((s, i) => (
        <Sequence key={i} from={s.start} durationInFrames={s.dur}>
          {s.scene.voice ? <Audio src={staticFile(s.scene.voice)} /> : null}
          {s.scene.say ? <Subtitle text={s.scene.say} dur={s.dur} /> : null}
        </Sequence>
      ))}
      {cta?.text && ctaT ? (
        <Sequence from={ctaT.start} durationInFrames={ctaT.dur}>
          <CtaText text={cta.text} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const CtaText = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 6, fps, config: { damping: 10 } });
  return (
    <div style={{ position: 'absolute', top: 200, left: 70, right: 170, textAlign: 'center', transform: `scale(${s})`,
      fontFamily: 'Poppins', fontWeight: 800, fontSize: 70, lineHeight: 1.15, color: '#ffd64a', textTransform: 'uppercase',
      WebkitTextStroke: '12px #1a0d0f', paintOrder: 'stroke fill' }}>
      {text}
    </div>
  );
};

export const showDurationFrames = (props: ShowProps, fps: number) => props.scenes.reduce((a, s) => a + Math.round(s.duration * fps), 0);
