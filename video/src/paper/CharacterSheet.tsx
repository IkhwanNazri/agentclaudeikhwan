// Character sheet 2 watak utama (still 1920x1080)
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { FemaleCohost, MaleHost, type Pose } from './characters';

const HEAD = '60 60 280 330';
const EXPR: { label: string; pose: Pose }[] = [
  { label: 'Senyum', pose: { mouth: 'smile' } },
  { label: 'Bercakap', pose: { mouth: 'open', brows: 'up' } },
  { label: 'Terkejut', pose: { mouth: 'o', eyes: 'wide', brows: 'up' } },
  { label: 'Takut', pose: { mouth: 'worried', brows: 'worried' } },
  { label: 'Gembira', pose: { mouth: 'grin', eyes: 'happy' } },
  { label: 'Kelip', pose: { mouth: 'smile', eyes: 'blink' } },
];
const Box = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>{children}</div>
);
const Label = ({ x, y, w, text, size = 26 }: { x: number; y: number; w: number; text: string; size?: number }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: size, color: '#f6ecd8' }}>{text}</div>
);
const Panel = ({ x, y, w, h, title }: { x: number; y: number; w: number; h: number; title: string }) => (
  <>
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, background: '#231d1f', boxShadow: 'inset 0 0 0 3px #3a3034' }} />
    <div style={{ position: 'absolute', left: x + 18, top: y - 18, padding: '4px 16px', borderRadius: 10, background: '#ffd64a', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 22, color: '#141012' }}>{title}</div>
  </>
);

export const CharacterSheet = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 30%, #2c2426, #120d0e)' }}>
    <Label x={0} y={18} w={1920} text="PLACTHINC — WATAK UTAMA (BONEKA KERTAS 2D)" size={40} />
    {/* badan penuh + pose */}
    <Panel x={30} y={100} w={900} h={600} title="HOST LELAKI" />
    <Box x={40} y={120} w={260} h={585}><MaleHost id="m1" /></Box>
    <Box x={330} y={120} w={260} h={585}><MaleHost id="m2" pose={{ mouth: 'open', brows: 'up', armR: 120, foreR: 40, head: -6 }} /></Box>
    <Box x={630} y={120} w={260} h={585}><MaleHost id="m3" pose={{ mouth: 'o', eyes: 'wide', brows: 'up', armL: 150, foreL: 30, armR: 150, foreR: 30 }} /></Box>
    <Panel x={990} y={100} w={900} h={600} title="CO-HOST PEREMPUAN (TUDUNG PINK)" />
    <Box x={1000} y={120} w={260} h={585}><FemaleCohost id="f1" /></Box>
    <Box x={1290} y={120} w={260} h={585}><FemaleCohost id="f2" pose={{ mouth: 'open', brows: 'up', armL: 120, foreL: 40, head: 6 }} /></Box>
    <Box x={1590} y={120} w={260} h={585}><FemaleCohost id="f3" pose={{ mouth: 'worried', brows: 'worried', eyes: 'wide', armL: 60, foreL: 110, armR: 60, foreR: 110 }} /></Box>
    {['Depan', 'Bercakap', 'Terkejut'].map((t, i) => <Label key={t} x={40 + i * 295} y={660} w={260} text={t} size={22} />)}
    {['Depan', 'Bercakap', 'Takut'].map((t, i) => <Label key={t} x={1000 + i * 295} y={660} w={260} text={t} size={22} />)}
    {/* ekspresi */}
    <Panel x={30} y={750} w={1860} h={300} title="EKSPRESI" />
    {EXPR.map((e, i) => (
      <div key={e.label}>
        <Box x={50 + i * 152} y={770} w={140} h={165}><MaleHost id={`mh${i}`} pose={e.pose} view={HEAD} /></Box>
        <Box x={980 + i * 152} y={770} w={140} h={165}><FemaleCohost id={`fh${i}`} pose={e.pose} view={HEAD} /></Box>
        <Label x={50 + i * 152} y={945} w={140} text={e.label} size={20} />
        <Label x={980 + i * 152} y={945} w={140} text={e.label} size={20} />
      </div>
    ))}
    <Label x={0} y={1000} w={1920} text="Kepala · badan · lengan atas · lengan bawah · tangan · kaki · mata · kening · mulut — semua lapisan berasingan (sedia untuk animasi)" size={20} />
  </AbsoluteFill>
);
