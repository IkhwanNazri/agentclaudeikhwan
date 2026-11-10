# Pelan: animasi 3D sebenar (gaya VoxelVerse / PaperWorld)

Masalah: mod gambar (PS2 story) tiada pergerakan watak; watak kod sendiri (World3D) nampak kasar.
Penyelesaian: guna **watak 3D rigged percuma (CC0) yang dah siap ada animasi** dan mainkan dalam Remotion + Three.js.

## Aset percuma (CC0, boleh guna komersial)
- `NoLimitNexus/game-models` — watak Quaternius + KayKit dalam GLB sedia untuk web, dengan klip animasi (idle, walk, run, sit, interact, dll).
- `KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0` — watak low-poly + animasi (semak LICENSE dalam repo; KayKit = CC0).
- Gaya **voxel**: watak/prop kotak (macam MagicaVoxel) — boleh bina terus dalam Three.js (InstancedMesh voxel).
- Gaya **paper**: plane + tekstur kertas/kadbod, outline, bayang lembut — Three.js biasa.

## Langkah (sesi baru)
1. Clone/salin GLB yang perlu ke `video/public/models/` (simpan LICENSE). Jangan commit fail besar >10MB.
2. `npm i @react-three/drei@9` dalam `video/` (useGLTF, useAnimations).
3. Komponen `video/src/Rigged.tsx`: muat GLB, mainkan klip ikut nama, **seek ikut frame Remotion** (`mixer.setTime(frame / fps)`) supaya render deterministik.
4. Scene schema: `scene3d.actors[].model` + `clip` (cth `"Walk"`), `path` (gerak dari A ke B), kamera bergerak (dolly/orbit).
5. Set voxel/paper ringkas (bilik, pejabat, jalan) guna InstancedMesh.
6. Uji 1 babak (still + 3s render) SEBELUM buat video penuh.
7. Kemas kini `maker.md` (senarai model & klip) — kemudian baru jalankan `/buat-konten`.

## Jimat token
- Mula sesi baru (konteks sesi lama terlalu panjang).
- Uji dengan still kecil, bukan render penuh berulang kali.
- Jangan jalankan semula researcher/writer kalau skrip dah ada — guna semula `content/<slug>/script.md` dan suara dalam `video/public/`.
