# Jana SFX seram secara sintetik (percuma, tiada muat turun): python3 scripts/gen-sfx.py video/public/sfx
import sys, os, wave, numpy as np
from scipy.signal import butter, lfilter
SR = 44100
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(378)
t_ = lambda d: np.arange(int(SR * d)) / SR
def lp(x, f, o=2): b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(f'{out}/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())
def fade(x, a=0.05, b=0.05):
    n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia)
    if ib: e[-ib:] = np.linspace(1, 0, ib)
    return x * e
# ambience hotel: angin/dengung rendah + hum
t = t_(30); n = rng.standard_normal(len(t))
amb = lp(np.cumsum(n) * 0.02, 300) + 0.15 * np.sin(2 * np.pi * 50 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
amb = amb - lp(amb, 20)
save('ambience', fade(amb, 1, 1), 0.6)
# muzik suspense: drone rendah berdenyut + nada tinggi seram
t = t_(40)
drone = sum(np.sin(2 * np.pi * f * t + p) for f, p in [(55, 0), (55.7, 1), (82.4, 2), (110.3, 0.5)])
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.12 * t)
eerie = 0.25 * np.sin(2 * np.pi * (880 + 6 * np.sin(2 * np.pi * 0.3 * t)) * t) * np.clip(np.sin(2 * np.pi * t / 20), 0, 1) ** 3
pulse = 0.5 * np.sin(2 * np.pi * 41 * t) * np.exp(-((t % 2.4) * 6))
save('suspense', fade(drone + eerie + pulse, 2, 2), 0.7)
# ketukan pintu: hentakan kayu rendah
t = t_(0.35)
k = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 28) + 0.6 * bp(rng.standard_normal(len(t)), 150, 900) * np.exp(-t * 45)
save('knock', k, 0.95)
# jam berdetik 4s
t = t_(4); tick = np.zeros(len(t))
for i in range(4):
    s = int(i * SR); m = min(len(t) - s, int(0.04 * SR)); tt = np.arange(m) / SR
    tick[s:s + m] += bp(rng.standard_normal(m), 2500, 6000) * np.exp(-tt * 120) * (1 if i % 2 == 0 else 0.7)
save('clock', tick, 0.8)
# pintu berkeriut
t = t_(1.8)
f = 180 + 120 * np.sin(2 * np.pi * 0.7 * t) + 40 * rng.standard_normal(len(t)).cumsum() / SR
ph = 2 * np.pi * np.cumsum(f) / SR
cr = (np.sign(np.sin(ph)) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t))) 
cr = bp(cr, 400, 3000) * np.sin(np.pi * t / 1.8)
save('creak', cr, 0.7)
# pintu tertutup
t = t_(0.8)
dc = np.sin(2 * np.pi * 60 * t) * np.exp(-t * 9) + 0.5 * lp(rng.standard_normal(len(t)), 600) * np.exp(-t * 20)
save('door_close', dc, 0.9)
# whoosh
t = t_(1.1); env = np.sin(np.pi * t / 1.1) ** 2
w = np.zeros(len(t)); nz = rng.standard_normal(len(t))
for i in range(0, len(t), 512):
    c = 300 + 2500 * (i / len(t)); seg = nz[max(0, i - 2048):i + 512]
    w[i:i + 512] = bp(seg, c * 0.6, c * 1.4)[-len(w[i:i + 512]):]
save('whoosh', w * env, 0.8)
# impak sinematik rendah
t = t_(3)
im = np.sin(2 * np.pi * (60 * np.exp(-t * 0.8) + 28) * t) * np.exp(-t * 1.4) + 0.4 * lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 3)
save('impact', im, 0.95)
print(sorted(os.listdir(out)))
