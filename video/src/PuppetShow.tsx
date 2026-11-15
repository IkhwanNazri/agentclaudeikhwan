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

export type ShowSet = 'intro' | 'curtain' | 'routine' | 'study' | 'road' | 'janet' | 'memory' | 'scroll' | 'balcony' | 'cta'
  | 'school' | 'move' | 'hours' | 'three' | 'chat' | 'meetup'
  | 'versus' | 'brain' | 'fatigue' | 'bike' | 'sleep' | 'rest';
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

type Ctx = { lf: number; dur: number; fps: number; scene: ShowScene; prev?: ShowSet };

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

const Cta = ({ lf, dur, fps, prev }: Ctx) => {
  const wave = Math.sin(lf * 0.7) * 0.35;
  const hostsUp = rise(lf, fps, 10);
  const mamak = prev === 'meetup';
  if (prev === 'rest') {
    return (
      <>
        <RestSet lf={dur} fps={fps} />
        <Puppeteer rod={1.4} x={-0.75} y={-0.45} z={-0.45} scale={0.85}>
          <Puppet look={ALI} pose={{ armF: 2.5 + wave, mouth: 0.6 }} />
        </Puppeteer>
        <Puppeteer rod={1.4} x={0.75} y={-0.45} z={-0.45} scale={0.85}>
          <group scale={[-1, 1, 1]}>
            <Puppet look={AINA} pose={{ armF: 2.5 - wave, mouth: 0.6 }} />
          </group>
        </Puppeteer>
        <ParkBench />
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
  }
  return (
    <>
      {mamak ? <MeetupSet lf={dur} fps={fps} ticks={4} /> : <BalconySet lf={dur} fps={fps} />}
      {mamak ? (
        <>
          <Puppeteer rod={1.45} x={-0.65} y={-0.4} z={-0.45}>
            <Puppet look={AINA} pose={{ armF: 2.5 + wave, mouth: 0.6 }} />
          </Puppeteer>
          <Puppeteer rod={1.45} x={0.65} y={-0.4} z={-0.45}>
            <group scale={[-1, 1, 1]}>
              <Puppet look={FRIEND} pose={{ armF: 2.5 - wave, mouth: 0.6 }} />
            </group>
          </Puppeteer>
          <MamakTable />
        </>
      ) : (
        <Puppeteer rod={1.75} x={0} y={-0.1} z={-0.3}>
          <Puppet look={AINA} pose={{ armF: 2.5 + wave, mouth: 0 }} />
        </Puppeteer>
      )}
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


// ---------------------------------------------------------------- babak: kawan (dewasa makin kurang kawan)

const FRIEND: Look = { hair: 'hijab', hairColor: '#5b8db8', shirt: '#f0c75e', pants: '#4a4f6a', skin: '#e2ab84' };
const KIDS: { look: Look; x: number }[] = [
  { look: { hair: 'short', shirt: '#f5f5f2', pants: '#24476b', skin: '#d79a70' }, x: -1.9 },
  { look: { hair: 'hijab', hairColor: '#f5f5f2', shirt: '#2f6f8e', dress: true, skin: '#e8b996' }, x: -1.0 },
  { look: { hair: 'cap', hairColor: '#d9534f', shirt: '#f5f5f2', pants: '#24476b', skin: '#c98d62' }, x: 1.0 },
  { look: { hair: 'bun', shirt: '#2f6f8e', dress: true, skin: '#f0c19a' }, x: 1.9 },
];

const School = ({ lf, fps }: Ctx) => {
  const hop = (k: number) => Math.abs(Math.sin(lf * 0.32 + k)) * 0.15;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#bfe2f2" />
        <Paper shape={circle(0.42)} color="#fff1b0" position={[2.0, 4.0, -2.15]} />
        {/* bangunan sekolah */}
        <Paper shape={rect(4.6, 2.2, 0)} color="#f3e7cf" position={[-0.3, 2.0, -2.12]} />
        <Paper shape={poly([[-2.8, 0], [2.2, 0], [1.6, 0.7], [-2.2, 0.7]])} color="#c2453c" position={[-0.3, 3.08, -2.1]} />
        {Array.from({ length: 6 }, (_, i) => (
          <Paper key={i} shape={rect(0.48, 0.5, 0.02)} color="#8cc6e0" position={[-2.1 + (i % 3) * 0.9 + (i > 2 ? 1.95 : 0) * 0, 2.45 - Math.floor(i / 3) * 0.85, -2.06]} />
        ))}
        <Paper shape={rect(0.6, 0.9, 0.03)} color="#7a4a2b" position={[1.3, 1.35, -2.06]} />
        <Paper shape={poly([[-3.1, -2.2], [-3.1, 0.95], [3.1, 0.95], [3.1, -2.2]])} color="#8fc46f" position={[0, 0, -2.08]} />
        <Paper shape={rect(0.25, 1.4, 0)} color="#7a5236" position={[2.3, 1.3, -2.0]} />
        <Paper shape={circle(0.7)} color="#5fa05a" position={[2.3, 2.3, -1.98]} />
      </Fly>
      {/* kawan-kawan sekolah atas satu papan, dipegang dua tangan */}
      <group position={[0, -0.25 + rise(lf, fps, 5), -0.7]}>
        {KIDS.map(({ look, x }, i) => (
          <group key={i} position={[x, 0.15 + hop(i), 0]} scale={0.55}>
            <Puppet look={look} pose={{ armF: 2.2 + Math.sin(lf * 0.5 + i) * 0.4, armB: 0.4, mouth: Math.sin(lf * 0.6 + i) > 0.3 ? 0.7 : 0 }} />
          </group>
        ))}
        <Paper shape={rect(5.2, 0.3, 0.06)} color="#c99a5b" position={[0, -0.72, 0.1]} />
        <Puppeteer rod={1.0} x={-1.5} y={-0.75} z={0.05}><group /></Puppeteer>
        <Puppeteer rod={1.0} x={1.5} y={-0.75} z={0.05}><group /></Puppeteer>
      </group>
      {/* Aina kecil di tengah */}
      <Puppeteer rod={1.75} x={0} y={-0.25 + rise(lf, fps) + hop(9)} z={-0.3} scale={0.72}>
        <Puppet look={{ ...AINA, lanyard: false, shirt: '#f5f5f2', pants: '#24476b' }} pose={{ armF: 2.4 + Math.sin(lf * 0.5) * 0.3, armB: 2.4 - Math.sin(lf * 0.5) * 0.3, mouth: 0.8 }} />
      </Puppeteer>
    </>
  );
};

const Move = ({ lf, dur, fps }: Ctx) => {
  const t = lf / dur;
  const far = interpolate(t, [0, 1], [0, 1], clamp);
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#e9d6b8" />
        <Paper shape={rect(6.2, 3.0, 0)} color="#f6dcae" position={[0, 3.9, -2.18]} cast={false} />
        {/* jalan & bangunan */}
        <Paper shape={poly([[-3.1, -2.2], [-3.1, -0.2], [3.1, -0.2], [3.1, -2.2]])} color="#9a8f86" position={[0, 0, -2.1]} />
        {[-2.3, -1.2, 1.0, 2.2].map((x, i) => (
          <Paper key={i} shape={rect(0.95, 1.6 + (i % 2) * 0.8, 0)} color={['#d98c6b', '#8da3c4', '#c7a5d6', '#9fc49a'][i]} position={[x, 0.7 + (i % 2) * 0.4, -2.12]} />
        ))}
        {/* papan tanda pindah */}
        <group position={[1.9, 1.7, -1.6]}>
          <Paper shape={rect(0.08, 1.6, 0)} color="#6e5a46" position={[0, -0.6, 0]} />
          <Paper shape={poly([[-0.7, 0.2], [0.55, 0.2], [0.8, 0], [0.55, -0.2], [-0.7, -0.2]])} color={C.cream} position={[0, 0.2, 0.03]} />
          <TextPlane lines={[{ text: 'KERJA BARU', color: C.red, size: 120 }]} w={1.3} h={0.35} position={[0.03, 0.2, 0.06]} pxW={900} pxH={240} />
        </group>
      </Fly>
      {/* kawan lama makin jauh dan kecil */}
      <group position={[-1.6 - far * 0.9, 0.2 + far * 0.4, -1.6]} scale={0.42 - far * 0.18}>
        <group position={[-0.7, 0, 0]}>
          <Puppet look={{ hair: 'short', shirt: '#d9534f', skin: '#c98d62' }} pose={{ armF: 2.4 + Math.sin(lf * 0.6) * 0.4 }} />
        </group>
        <group position={[0.7, 0, 0]}>
          <Puppet look={FRIEND} pose={{ armF: 2.4 + Math.sin(lf * 0.6 + 1) * 0.4 }} />
        </group>
      </group>
      {/* Aina berjalan bawa kotak */}
      <Puppeteer rod={1.75} x={interpolate(t, [0, 1], [-0.6, 0.9])} y={-0.1 + rise(lf, fps) + Math.abs(Math.sin(lf * 0.3)) * 0.1} z={-0.3}>
        <Puppet look={AINA} pose={{ armF: 1.2, armB: 0.9, hold: 'box', leg: Math.sin(lf * 0.6) * 0.3, head: t > 0.55 ? 0.15 : 0 }} />
      </Puppeteer>
    </>
  );
};

const Hours = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const fill = interpolate(t, [0.1, 0.9], [0, 1], clamp);
  const tubeH = 3.2;
  const marks = [
    { v: 50, label: '50 jam', sub: 'kawan biasa' },
    { v: 90, label: '90 jam', sub: 'kawan' },
    { v: 200, label: '200+ jam', sub: 'kawan rapat' },
  ];
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#f2e2c3" />
        {/* meter jam */}
        <group position={[0.4, 0.5, -1.5]}>
          <Paper shape={rect(0.7, tubeH + 0.3, 0.3)} color={C.cream} depth={0.05} />
          <Paper shape={rect(0.46, Math.max(0.02, fill * tubeH), 0.12)} color={C.red} depth={0.03}
            position={[0, -tubeH / 2 + (fill * tubeH) / 2, 0.04]} />
          <Paper shape={circle(0.5)} color={C.red} depth={0.05} position={[0, -tubeH / 2 - 0.35, 0.01]} />
          {marks.map(({ v, label, sub }) => {
            const yy = -tubeH / 2 + (v / 200) * tubeH;
            const lit = fill >= v / 200 - 0.01;
            return (
              <group key={v} position={[0, yy, 0.05]}>
                <Paper shape={rect(0.85, 0.05, 0)} color={C.ink} depth={0.01} />
                <group position={[1.2, 0, 0]}>
                  <Paper shape={rect(1.45, 0.6, 0.08)} color={lit ? '#ffd866' : C.card} depth={0.03} />
                  <TextPlane lines={[{ text: label, color: C.ink, size: 130 }, { text: sub, color: '#6b4a2b', size: 90 }]} w={1.38} h={0.56} position={[0, 0, 0.025]} pxW={800} pxH={330} />
                </group>
              </group>
            );
          })}
        </group>
      </Fly>
      <group position={[-1.6, 2.6, -1.4]}>
        <Clock spin={lf * 0.5} r={0.45} />
      </group>
      <Puppeteer rod={1.75} x={-1.9} y={-0.1 + rise(lf, fps) + Math.abs(Math.sin(lf * 0.25)) * 0.08} z={-0.3} scale={0.85}>
        <Puppet look={AINA} pose={{ armF: 1.4 + Math.sin(lf * 0.3) * 0.3, mouth: Math.sin(lf * 0.5) > 0.2 ? 0.6 : 0 }} />
      </Puppeteer>
      <Puppeteer rod={1.75} x={-0.75} y={-0.1 + rise(lf, fps, 8) + Math.abs(Math.sin(lf * 0.25 + 1)) * 0.08} z={-0.35} scale={0.85}>
        <group scale={[-1, 1, 1]}>
          <Puppet look={FRIEND} pose={{ armF: 1.2 + Math.sin(lf * 0.3 + 1) * 0.3, mouth: Math.sin(lf * 0.5 + 2) > 0.2 ? 0.6 : 0 }} />
        </group>
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const Three = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const signs = [
    { text: 'DEKAT', color: '#5b8db8', at: 0.18, x: -1.75 },
    { text: 'BERULANG', color: '#d9534f', at: 0.33, x: 0 },
    { text: 'SELESA', color: '#4f9d6a', at: 0.48, x: 1.75 },
  ];
  const wobble = t > 0.7 ? Math.sin(lf * 0.6) * 0.12 : 0;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#ddd0ea" />
      </Fly>
      {signs.map(({ text, color, at, x }, i) => {
        const up = spring({ frame: lf - at * dur, fps, config: { damping: 10 } });
        return (
          <group key={text} position={[x, interpolate(up, [0, 1], [-5, 1.8]), -1.0]} rotation={[0, 0, (i - 1) * 0.04 + wobble * (i % 2 ? 1 : -1)]}>
            <Paper shape={rect(0.06, 1.6, 0)} color="#8a6a4a" position={[0, -1.0, -0.03]} />
            <Paper shape={rect(1.6, 1.2, 0.12)} color={color} depth={0.05} />
            <Paper shape={circle(0.2)} color={C.cream} depth={0.02} position={[0, 0.33, 0.04]} />
            <TextPlane lines={[{ text: String(i + 1), color, size: 200 }]} w={0.35} h={0.35} position={[0, 0.33, 0.06]} pxW={300} pxH={300} />
            <TextPlane lines={[{ text, color: '#fff8ea', size: 150 }]} w={1.5} h={0.45} position={[0, -0.18, 0.04]} pxW={1000} pxH={300} />
          </group>
        );
      })}
      <Puppeteer rod={1.6} x={0} y={-0.55 + rise(lf, fps)} z={-0.3} scale={0.72}>
        <Puppet look={AINA} pose={{ armF: t > 0.7 ? 1.2 + wobble * 3 : 2.3, head: t > 0.7 ? -0.12 : 0.05, eyes: t > 0.7 ? 'open' : 'wide' }} />
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const Chat = ({ lf, dur, fps }: Ctx) => {
  const t = lf / dur;
  const msgs = [
    { text: 'Jom lepak!', mine: true, at: 0.08 },
    { text: 'Next time la', mine: false, at: 0.38 },
    { text: 'Busy minggu ni', mine: false, at: 0.52 },
    { text: 'Next time!', mine: false, at: 0.66 },
  ];
  const sad = t > 0.72;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#2b3452" />
        <Paper shape={circle(0.25)} color="#f3eccc" glow="#c9c29a" position={[-2.2, 3.8, -2.05]} />
        {/* skrin telefon besar */}
        <group position={[0.9, 1.4, -1.6]}>
          <Paper shape={rect(2.6, 4.2, 0.25)} color="#1b1b22" depth={0.06} />
          <Paper shape={rect(2.35, 3.8, 0.15)} color="#e8f1e9" depth={0.02} position={[0, 0, 0.04]} />
          <Paper shape={rect(2.35, 0.45, 0.1)} color="#3d8b6a" depth={0.02} position={[0, 1.67, 0.05]} />
          <TextPlane lines={[{ text: 'Geng Sekolah', color: '#fff', size: 110 }]} w={2.0} h={0.36} position={[0, 1.67, 0.07]} pxW={1000} pxH={180} />
          {msgs.map(({ text, mine, at }, i) => {
            const pop = spring({ frame: lf - at * dur, fps, config: { damping: 12 } });
            if (pop <= 0.01) return null;
            return (
              <group key={i} position={[mine ? 0.32 : -0.32, 1.05 - i * 0.68, 0.07]} scale={pop}>
                <Paper shape={rect(1.55, 0.5, 0.18)} color={mine ? '#c8f0b4' : '#ffffff'} depth={0.02} />
                <TextPlane lines={[{ text, color: '#222', size: 110 }]} w={1.45} h={0.42} position={[0, 0, 0.02]} pxW={1000} pxH={290} />
              </group>
            );
          })}
        </group>
      </Fly>
      <Puppeteer rod={1.75} x={-1.55} y={-0.1 + rise(lf, fps)} z={-0.3} scale={0.9}>
        <Puppet look={AINA} pose={{ armF: 1.25, hold: 'phone', head: sad ? -0.18 : 0.05, eyes: sad ? 'closed' : 'open' }} />
      </Puppeteer>
      <pointLight position={[-1.0, 0.6, 0.3]} intensity={3.5} distance={3} color="#7fdcff" />
    </>
  );
};

const MeetupSet = ({ lf, fps, ticks }: { lf: number; fps: number; ticks: number }) => (
  <Fly lf={lf} fps={fps}>
    <Wall color="#f1c76d" />
    <Paper shape={rect(6.2, 2.2, 0)} color="#e9e2d2" position={[0, -1.0, -2.15]} cast={false} />
    {Array.from({ length: 12 }, (_, i) => (
      <Paper key={i} shape={rect(0.03, 2.2, 0)} color="#cfc6b3" depth={0.01} position={[-2.75 + i * 0.5, -1.0, -2.12]} cast={false} />
    ))}
    {/* papan tanda kedai */}
    <group position={[-0.9, 3.7, -2.05]}>
      <Paper shape={rect(2.8, 0.8, 0.08)} color="#2f6f5e" depth={0.05} />
      <TextPlane lines={[{ text: 'RESTORAN MAMAK', color: '#ffe9a8', size: 110 }]} w={2.6} h={0.6} position={[0, 0, 0.035]} pxW={1300} pxH={300} />
    </group>
    {/* lampu tali */}
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[-2.6 + i * 0.65, 2.85 + Math.sin(i * 1.3) * 0.08, -1.9]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#fff2c4" emissive="#ffcf6a" emissiveIntensity={2} />
      </mesh>
    ))}
    {/* kalendar: tanda setiap minggu */}
    <group position={[1.9, 1.9, -2.05]} scale={0.75}>
      <Paper shape={rect(1.7, 1.7, 0.04)} color={C.cream} />
      <Paper shape={rect(1.7, 0.4, 0.04)} color={C.red} position={[0, 0.65, 0.03]} />
      <TextPlane lines={[{ text: 'KHAMIS', color: '#fff8ea', size: 200 }]} w={1.5} h={0.36} position={[0, 0.65, 0.06]} pxW={900} pxH={220} />
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i} position={[0, 0.25 - i * 0.3, 0.03]}>
          <Paper shape={rect(1.3, 0.22, 0.02)} color="#e8dcc2" depth={0.01} />
          {i < ticks ? <Paper shape={circle(0.09)} color="#4f9d6a" depth={0.01} position={[0.5, 0, 0.015]} /> : null}
        </group>
      ))}
    </group>
  </Fly>
);

const MamakTable = () => (
  <group position={[0, -1.25, -0.05]}>
    <Paper shape={rect(3.4, 0.18, 0.05)} color="#d9d4c8" position={[0, 0.35, 0]} />
    <Paper shape={rect(0.16, 1.0, 0)} color="#8a8a8a" position={[-1.3, -0.25, -0.02]} />
    <Paper shape={rect(0.16, 1.0, 0)} color="#8a8a8a" position={[1.3, -0.25, -0.02]} />
    <Paper shape={rect(3.0, 0.7, 0.05)} color="#c23a3a" position={[0, -0.05, -0.04]} />
  </group>
);

const Meetup = ({ lf, dur, fps }: Ctx) => {
  const t = lf / dur;
  const ticks = Math.min(4, Math.floor(interpolate(t, [0.2, 0.85], [0, 4.99], clamp)));
  const laugh = (k: number) => (Math.sin(lf * 0.5 + k) > 0.1 ? 0.8 : 0);
  return (
    <>
      <MeetupSet lf={lf} fps={fps} ticks={ticks} />
      <Puppeteer rod={1.45} x={-1.05} y={-0.4 + rise(lf, fps) + Math.abs(Math.sin(lf * 0.3)) * 0.06} z={-0.45}>
        <Puppet look={AINA} pose={{ armF: 1.0 + Math.sin(lf * 0.2) * 0.2, hold: 'teh', mouth: laugh(0) }} />
      </Puppeteer>
      <Puppeteer rod={1.45} x={1.05} y={-0.4 + rise(lf, fps, 8) + Math.abs(Math.sin(lf * 0.3 + 1)) * 0.06} z={-0.45}>
        <group scale={[-1, 1, 1]}>
          <Puppet look={FRIEND} pose={{ armF: 1.0 + Math.sin(lf * 0.2 + 1) * 0.2, hold: 'teh', mouth: laugh(2) }} />
        </group>
      </Puppeteer>
      <MamakTable />
    </>
  );
};


// ---------------------------------------------------------------- babak: penat fizikal vs mental

const ALI: Look = { hair: 'cap', hairColor: '#f2c230', shirt: '#f07f2a', pants: '#3d4a63', skin: '#b97a58' };

const Brain = ({ glow = 0 }: { glow?: number }) => (
  <group>
    {[[-0.55, 0.15, 0.62], [0.05, 0.42, 0.7], [0.62, 0.12, 0.6], [-0.1, -0.2, 0.62], [0.55, -0.3, 0.45], [-0.6, -0.32, 0.42]].map(([x, y, r], i) => (
      <Paper key={i} shape={circle(r)} color="#f2a7b5" depth={0.05} position={[x, y, i * 0.004]} />
    ))}
    <Paper shape={rect(0.28, 0.55, 0.1)} color="#e48d9e" position={[0.35, -0.85, -0.02]} rotation={[0, 0, 0.3]} />
    {[[-0.6, 0.3, 0.6], [0.0, 0.55, -0.3], [0.5, 0.25, 0.9], [-0.2, -0.15, -0.6], [0.45, -0.3, 0.2], [-0.75, -0.2, 1.2], [0.15, 0.05, 1.5]].map(([x, y, r], i) => (
      <Paper key={i} shape={rect(0.42, 0.035, 0.015)} color="#c96a7e" depth={0.01} position={[x, y, 0.04]} rotation={[0, 0, r]} />
    ))}
    {glow > 0 ? <Paper shape={ellipse(0.5, 0.45)} color="#ffe28a" glow="#ffcf4a" depth={0.01} position={[-0.6, 0.15, 0.05]} /> : null}
  </group>
);

const Versus = ({ lf, dur, fps }: Ctx) => {
  const t = lf / dur;
  const tired = interpolate(t, [0.55, 0.8], [0, 1], clamp);
  const lift = Math.sin(lf * 0.35);
  return (
    <>
      <Fly lf={lf} fps={fps}>
        {/* kiri: tapak binaan */}
        <Paper shape={rect(3.1, 7.6, 0)} color="#a9d3ee" depth={0.05} position={[-1.55, 1.4, -2.2]} cast={false} />
        <Paper shape={rect(0.12, 3.6, 0)} color="#e8b33c" position={[-2.4, 2.6, -2.12]} />
        <Paper shape={rect(2.0, 0.12, 0)} color="#e8b33c" position={[-1.5, 4.35, -2.12]} />
        <Paper shape={rect(0.03, 1.2, 0)} color="#555" position={[-0.7, 3.75, -2.1]} />
        {Array.from({ length: 6 }, (_, i) => (
          <Paper key={i} shape={rect(0.55, 0.28, 0.02)} color="#c2654a" position={[-2.6 + (i % 3) * 0.6 + (Math.floor(i / 3) % 2) * 0.3, -1.0 + Math.floor(i / 3) * 0.3, -2.0]} />
        ))}
        {/* kanan: office */}
        <Paper shape={rect(3.1, 7.6, 0)} color="#efe3cc" depth={0.05} position={[1.55, 1.4, -2.2]} cast={false} />
        <Paper shape={rect(1.3, 1.4, 0.03)} color="#9fc9e6" position={[1.6, 2.6, -2.12]} />
        <Paper shape={rect(0.08, 7.6, 0)} color={C.ink} position={[0, 1.4, -2.1]} />
      </Fly>
      <Puppeteer rod={1.75} x={-1.4} y={-0.1 + rise(lf, fps) - tired * 0.15 + lift * 0.06} z={-0.3} scale={0.85} tilt={tired * 0.08}>
        <Puppet look={ALI} pose={{ armF: 1.6 + lift * 0.35, armB: 1.4 + lift * 0.35, hold: 'box', eyes: tired > 0.5 ? 'closed' : 'open', head: tired * 0.15 }} />
      </Puppeteer>
      <Puppeteer rod={1.6} x={1.35} y={-0.35 + rise(lf, fps, 6) - tired * 0.12} z={-0.4} scale={0.85} tilt={-tired * 0.08}>
        <Puppet look={AINA} pose={{ armF: 1.2 + Math.sin(lf * 1.3) * 0.12, armB: 1.0 + Math.sin(lf * 1.3 + 1) * 0.12, eyes: tired > 0.5 ? 'closed' : 'open', head: -tired * 0.15 }} />
      </Puppeteer>
      {/* meja office di depan Aina */}
      <group position={[1.4, -1.15, -0.1]}>
        <Paper shape={rect(2.2, 0.14, 0.02)} color={C.wood} position={[0, 0.25, 0]} />
        <Paper shape={rect(2.0, 0.8, 0.02)} color="#7a4a2b" position={[0, -0.25, -0.03]} />
        <Paper shape={poly([[-0.4, 0], [0.4, 0], [0.33, 0.55], [-0.33, 0.55]])} color="#5d6670" position={[0.55, 0.32, 0.02]} />
      </group>
    </>
  );
};

const BrainScene = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const share = interpolate(t, [0.35, 0.75], [0.001, 0.2], clamp);
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#f3e2cf" />
        <group position={[-1.05, 1.95, -1.5]} scale={0.9}>
          <Brain />
          <group position={[0, -1.35, 0]}>
            <Paper shape={rect(1.5, 0.45, 0.08)} color={C.cream} />
            <TextPlane lines={[{ text: '2% berat', color: C.ink, size: 130 }]} w={1.4} h={0.4} position={[0, 0, 0.03]} pxW={800} pxH={230} />
          </group>
        </group>
        <group position={[1.3, 1.95, -1.5]}>
          <Paper shape={circle(0.7)} color="#e3d2b0" depth={0.04} />
          <Paper shape={pie(0.7, share)} color={C.red} depth={0.06} position={[0, 0, 0.02]} />
          <group position={[0, -1.05, 0]}>
            <Paper shape={rect(1.5, 0.45, 0.08)} color={C.cream} />
            <TextPlane lines={[{ text: '20% tenaga', color: C.red, size: 130 }]} w={1.4} h={0.4} position={[0, 0, 0.03]} pxW={800} pxH={230} />
          </group>
        </group>
      </Fly>
      <Puppeteer rod={1.45} x={0.1} y={-0.75 + rise(lf, fps)} z={-0.3} scale={0.62}>
        <Puppet look={AINA} pose={{ armF: 2.3 + Math.sin(lf * 0.3) * 0.15, eyes: t > 0.5 ? 'wide' : 'open' }} />
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const Fatigue = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  const n = Math.floor(interpolate(t, [0.1, 0.8], [0, 18], clamp));
  const sleepy = t > 0.6;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#e6dcef" />
        <group position={[0, 1.6, -1.5]} scale={1.35}>
          <Brain />
          {Array.from({ length: n }, (_, i) => (
            <Paper key={i} shape={circle(0.07 + (i % 3) * 0.02)} color="#5fb83a" depth={0.03}
              position={[-0.95 + ((i * 37) % 70) / 100, -0.25 + ((i * 53) % 80) / 100 + Math.sin(lf * 0.2 + i) * 0.03, 0.09]} />
          ))}
          <group position={[-0.75, -0.95, 0.05]}>
            <Paper shape={rect(0.9, 0.3, 0.06)} color={C.cream} />
            <TextPlane lines={[{ text: 'depan otak', color: C.ink, size: 110 }]} w={0.85} h={0.26} position={[0, 0, 0.03]} pxW={700} pxH={210} />
          </group>
        </group>
      </Fly>
      <Puppeteer rod={1.6} x={1.4} y={-0.5 + rise(lf, fps) - (sleepy ? 0.12 : 0)} z={-0.3} scale={0.8} tilt={sleepy ? -0.1 : 0}>
        <Puppet look={AINA} pose={{ armF: sleepy ? 0.1 : 1.0 + Math.sin(lf * 1.2) * 0.1, eyes: sleepy && Math.sin(lf * 0.3) > -0.4 ? 'closed' : 'open', head: sleepy ? -0.2 : 0 }} />
      </Puppeteer>
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const Wheel = ({ spin }: { spin: number }) => (
  <group rotation={[0, 0, -spin]}>
    <Paper shape={circle(0.42)} color="#2a2a30" depth={0.04} />
    <Paper shape={circle(0.33)} color="#d8d0c0" depth={0.045} />
    {[0, 1, 2].map((k) => (
      <Paper key={k} shape={rect(0.66, 0.03, 0)} color="#555" depth={0.05} rotation={[0, 0, (k * Math.PI) / 3]} />
    ))}
  </group>
);

const Bike = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  // masa disimulasi: kanan sampai 754s pada ~85% babak, kiri berhenti 640s
  const sim = interpolate(t, [0.12, 0.85], [0, 754], clamp);
  const left = Math.min(640, sim);
  const leftDone = sim >= 640;
  const riders = [
    { x: -1.4, time: left, done: leftDone, look: AINA, tag: 'lepas tugas mental' },
    { x: 1.4, time: sim, done: sim >= 754, look: { ...AINA, hair: 'short' as const, hairColor: '#1f1a18', lanyard: false, shirt: '#4f9d8a', skin: '#c98d62' }, tag: 'tonton dokumentari' },
  ];
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Wall color="#dfe8ee" />
        <Paper shape={rect(6.2, 0.9, 0)} color="#c9d4dc" position={[0, -1.6, -2.15]} cast={false} />
      </Fly>
      {riders.map(({ x, time, done, look, tag }, i) => {
        const ped = done ? 0 : lf * 0.5;
        const sec = Math.floor(time / 10) * 10;
        return (
          <group key={i}>
            {/* pemasa */}
            <group position={[x, 2.95, -1.0]}>
              <Paper shape={rect(1.8, 0.75, 0.12)} color={done ? (i === 0 ? '#f3b0a8' : '#bfe3c0') : '#222'} depth={0.05} />
              <TextPlane lines={[{ text: `${done ? (i === 0 ? 640 : 754) : sec}s`, color: done ? C.ink : '#7dff9a', size: 200 }]} w={1.7} h={0.7} position={[0, 0, 0.035]} pxW={800} pxH={330} />
              <group position={[0, -0.6, 0]}>
                <Paper shape={rect(1.8, 0.36, 0.06)} color={C.cream} />
                <TextPlane lines={[{ text: tag, color: '#6b4a2b', size: 100 }]} w={1.7} h={0.32} position={[0, 0, 0.03]} pxW={900} pxH={170} />
              </group>
            </group>
            <Puppeteer rod={1.45} x={x} y={-0.25 + rise(lf, fps, 4 + i * 4) - (done && i === 0 ? 0.15 : 0)} z={-0.55} scale={0.72} tilt={done && i === 0 ? 0.12 : 0}>
              <Puppet look={look} pose={{ armF: 1.4, armB: 1.3, leg: Math.sin(ped) * 0.45, eyes: done && i === 0 ? 'closed' : 'open', head: done && i === 0 ? 0.2 : 0 }} />
            </Puppeteer>
            {/* basikal statik di depan */}
            <group position={[x, -1.25, -0.25]}>
              <group position={[-0.55, 0, 0]}><Wheel spin={ped} /></group>
              <group position={[0.55, 0, 0]}><Wheel spin={ped} /></group>
              <Paper shape={poly([[-0.55, 0], [-0.05, 0.6], [0.55, 0], [0.45, 0], [-0.05, 0.45], [-0.45, 0]])} color={i === 0 ? '#c23a3a' : '#2f6f8e'} position={[0, 0, 0.06]} />
              <Paper shape={rect(0.4, 0.1, 0.04)} color="#222" position={[-0.15, 0.68, 0.07]} />
            </group>
          </group>
        );
      })}
      {scene.banner ? <HangBanner text={scene.banner} lf={lf} fps={fps} y={3.85} /> : null}
    </>
  );
};

const Bed = ({ x }: { x: number }) => (
  <group position={[x, -1.25, -0.2]}>
    <Paper shape={rect(2.5, 0.55, 0.08)} color="#7a4a2b" />
    <Paper shape={rect(2.3, 0.35, 0.12)} color="#8fa9d8" position={[0, 0.35, 0.03]} />
    <Paper shape={rect(0.2, 1.2, 0.05)} color="#6e4630" position={[-1.2, 0.35, -0.02]} />
  </group>
);

const Sleep = ({ lf, dur, fps, scene }: Ctx) => {
  const t = lf / dur;
  return (
    <>
      <Fly lf={lf} fps={fps}>
        <Paper shape={rect(3.1, 7.6, 0)} color="#273150" depth={0.05} position={[-1.55, 1.4, -2.2]} cast={false} />
        <Paper shape={rect(3.1, 7.6, 0)} color="#2f2a48" depth={0.05} position={[1.55, 1.4, -2.2]} cast={false} />
        <Paper shape={rect(0.08, 7.6, 0)} color={C.ink} position={[0, 1.4, -2.1]} />
        <Paper shape={circle(0.28)} color="#f3eccc" glow="#c9c29a" position={[-2.2, 3.4, -2.05]} />
        <group position={[1.6, 3.1, -2.05]}><Clock spin={lf * 0.15 + 6} r={0.45} /></group>
      </Fly>
      {/* Ali baring lena (tiada batang: dibaringkan atas katil) */}
      <group position={[-1.45, -0.62 + rise(lf, fps) * 0.3, -0.35]} rotation={[0, 0, Math.PI / 2]} scale={0.6}>
        <Puppet look={{ ...ALI, hair: 'short' }} pose={{ eyes: 'closed', armF: 0.3, mouth: 0 }} />
      </group>
      {Array.from({ length: 3 }, (_, i) => {
        const p = ((lf * 0.03 + i / 3) % 1);
        return (
          <group key={i} position={[-1.1 + p * 0.5, 0.0 + p * 1.4, -0.3]} scale={0.5 + p * 0.5}>
            <TextPlane lines={[{ text: 'Z', color: '#e8f0ff', size: 300 }]} w={0.35} h={0.35} pxW={300} pxH={300} />
          </group>
        );
      })}
      <Bed x={-1.45} />
      {/* Aina duduk scroll telefon */}
      <Puppeteer rod={1.45} x={1.35} y={-0.45 + rise(lf, fps, 6)} z={-0.45} scale={0.78}>
        <Puppet look={AINA} pose={{ armF: 1.25, hold: 'phone', eyes: 'wide', head: Math.sin(lf * 0.15) * 0.05 }} />
      </Puppeteer>
      <pointLight position={[1.7, 0.4, 0.2]} intensity={3.5} distance={3} color="#7fdcff" />
      <Bed x={1.45} />
      {scene.banner && t > 0 ? <HangBanner text={scene.banner} lf={lf} fps={fps} /> : null}
    </>
  );
};

const RestSet = ({ lf, fps }: { lf: number; fps: number }) => (
  <Fly lf={lf} fps={fps}>
    <Wall color="#f5a77c" />
    <Paper shape={rect(6.2, 3.4, 0)} color="#f8c48f" position={[0, 3.6, -2.18]} cast={false} />
    <Paper shape={circle(0.55)} color="#ffe2a8" glow="#ffb36a" position={[0.9, 1.5, -2.15]} />
    <Paper shape={poly([[-3.1, -2.2], [-3.1, 0.7], [-1.6, 1.2], [0, 0.8], [1.5, 1.3], [3.1, 0.75], [3.1, -2.2]])} color="#7fae6b" position={[0, 0, -2.12]} />
    {[-2.3, 2.3].map((x, i) => (
      <group key={i} position={[x, 0.9, -1.95]}>
        <Paper shape={rect(0.22, 1.6, 0)} color="#7a5236" position={[0, -0.3, 0]} />
        <Paper shape={circle(0.75)} color={i ? '#5f9a58' : '#6aa862'} position={[0, 0.8, 0.02]} />
      </group>
    ))}
    {[[-1.2, 3.2], [-0.8, 3.4], [1.9, 3.0]].map(([bx, by], i) => (
      <Paper key={i} shape={poly([[-0.12, 0], [0, -0.05], [0.12, 0], [0, 0.03]])} color="#5a3d4a" position={[bx + Math.sin(lf * 0.05 + i) * 0.2, by, -1.9]} />
    ))}
  </Fly>
);

const ParkBench = () => (
  <group position={[0, -1.15, -0.1]}>
    <Paper shape={rect(3.6, 0.16, 0.04)} color="#8a5a3b" position={[0, 0.55, 0]} />
    <Paper shape={rect(3.6, 0.16, 0.04)} color="#8a5a3b" position={[0, 0.3, 0]} />
    <Paper shape={rect(3.6, 0.16, 0.04)} color="#8a5a3b" position={[0, 0.05, 0]} />
    <Paper shape={rect(0.14, 0.9, 0)} color="#333" position={[-1.5, -0.3, -0.02]} />
    <Paper shape={rect(0.14, 0.9, 0)} color="#333" position={[1.5, -0.3, -0.02]} />
  </group>
);

const Rest = ({ lf, fps }: Ctx) => {
  const breathe = Math.sin(lf * 0.12) * 0.03;
  return (
    <>
      <RestSet lf={lf} fps={fps} />
      <Puppeteer rod={1.4} x={-0.75} y={-0.45 + rise(lf, fps) + breathe} z={-0.45} scale={0.85} tilt={0.06}>
        <Puppet look={ALI} pose={{ armF: 0.1, armB: 0.1, eyes: 'closed', head: 0.12 }} />
      </Puppeteer>
      <Puppeteer rod={1.4} x={0.75} y={-0.45 + rise(lf, fps, 6) - breathe} z={-0.45} scale={0.85} tilt={-0.06}>
        <Puppet look={AINA} pose={{ armF: 0.1, armB: 0.1, eyes: 'closed', head: -0.12 }} />
      </Puppeteer>
      <ParkBench />
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
  const titleY = interpolate(titleIn, [0, 1], [7, 2.95]) + exit * 7;
  return (
    <>
      {titleScene ? (
        <group position={[0, titleY, 0.85]} rotation={[0, 0, Math.sin(frame * 0.12) * 0.03]} scale={0.82}>
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
  school: School, move: Move, hours: Hours, three: Three, chat: Chat, meetup: Meetup,
  versus: Versus, brain: BrainScene, fatigue: Fatigue, bike: Bike, sleep: Sleep, rest: Rest,
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
  const prev = timeline[timeline.indexOf(cur) - 1]?.scene.set;
  const ctaWarm = cur.scene.set === 'cta' && prev === 'meetup';
  const mode = cur.scene.set === 'scroll' || cur.scene.set === 'chat' || cur.scene.set === 'sleep' ? 'night' : ctaWarm ? 'warm' : cur.scene.set === 'rest' || (cur.scene.set === 'cta' && prev === 'rest') ? 'dusk' : cur.scene.set === 'balcony' || cur.scene.set === 'cta' || cur.scene.set === 'road' ? 'dusk' : 'warm';
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
        return Set ? <Set lf={lf} dur={cur.dur} fps={fps} scene={cur.scene} prev={prev} /> : null;
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
