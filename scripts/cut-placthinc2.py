# Potong atlas "Exact Position" PLACTHINC jadi PNG telus (guna alpha atlas + buang halo latar sehingga garis putih).
# python3 scripts/cut-placthinc2.py <MASTER_ATLAS_UNCHANGED.png> video/public/placthinc2
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
im = Image.open(src).convert('RGBA'); A = np.array(im).astype(int)
alpha = A[..., 3] > 100
lab, n = nd.label(alpha)
boxes = nd.find_objects(lab)
def comps_in(x0, y0, x1, y1, minarea=300):
    r = []
    for i, sl in enumerate(boxes):
        cy = (sl[0].start + sl[0].stop) / 2; cx = (sl[1].start + sl[1].stop) / 2
        if x0 <= cx <= x1 and y0 <= cy <= y1 and (sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start) >= minarea:
            r.append((i + 1, sl))
    return sorted(r, key=lambda c: (round(c[1][0].start / 60), c[1][1].start))
def cut(name, comp, scale=3, keep_dark=False):
    i, sl = comp
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    rgb = A[y0:y1, x0:x1, :3]; m = lab[y0:y1, x0:x1] == i
    bright = rgb.min(axis=2) > 215  # garis putih
    cand = m & ~bright
    if not keep_dark:
        # halo latar: bahagian dalam topeng yang bersambung dgn luar topeng tanpa melintasi garis putih
        seed = ~m
        reach = nd.binary_propagation(seed, mask=seed | cand)
        fg = m & ~(reach & ~seed)
        fg = nd.binary_fill_holes(nd.binary_opening(fg, iterations=1))
    else:
        fg = m
    if fg.sum() < 0.3 * m.sum(): fg = m
    ys, xs = np.where(fg)
    b = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    crop = Image.fromarray(rgb[b[1]:b[3], b[0]:b[2]].astype('uint8'))
    a = Image.fromarray((fg[b[1]:b[3], b[0]:b[2]] * 255).astype('uint8'))
    w, h = crop.size
    crop = crop.resize((w * scale, h * scale), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
    crop.putalpha(a.resize((w * scale, h * scale), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.1)))
    crop.save(f'{out}/{name}.png'); return crop.size
R = {
 'male_body': (545, 30, 650, 230), 'female_body': (10, 400, 110, 610),
 'mexpr': (1040, 255, 1535, 360), 'fexpr': (940, 400, 1170, 610), 'hand': (965, 645, 1530, 710),
 'desk': (600, 850, 775, 925), 'mic': (600, 925, 705, 1010), 'lantern': (705, 920, 770, 1010),
 'books': (770, 940, 865, 1010), 'logo': (965, 850, 1220, 1010),
}
def boxcomp(x0, y0, x1, y1):
    # komponen buatan: alpha dalam kotak (untuk item yang topengnya bercantum)
    global lab
    sub = alpha[y0:y1, x0:x1]
    l2, k = nd.label(sub)
    big = 1 + int(np.argmax(nd.sum(sub, l2, range(1, k + 1))))
    tag = lab.max() + 1
    region = np.zeros_like(alpha); region[y0:y1, x0:x1] = l2 == big
    lab = np.where(region, tag, lab)
    ys, xs = np.where(region)
    return tag, (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
MCOL = [1043, 1124, 1205, 1286, 1367, 1448, 1532]
for j in range(6): print(f'mexpr{j}', cut(f'mexpr{j}', boxcomp(MCOL[j], 268, MCOL[j + 1], 350)))
FCOL = [945, 1020, 1093, 1168]
for r, (y0, y1) in enumerate([(408, 505), (508, 605)]):
    for j in range(3): print(f'fexpr{r*3+j}', cut(f'fexpr{r*3+j}', boxcomp(FCOL[j], y0, FCOL[j + 1], y1)))
print('skull', cut('skull', boxcomp(872, 932, 958, 1010)))
for key in ('mexpr', 'fexpr'): R.pop(key)
for key, box in R.items():
    cs = comps_in(*box)
    if key in ('male_body', 'female_body', 'desk', 'lantern', 'books', 'skull', 'logo'):
        cs = sorted(cs, key=lambda c: -((c[1][0].stop - c[1][0].start) * (c[1][1].stop - c[1][1].start)))[:1]
    for j, c in enumerate(cs):
        nm = key if len(cs) == 1 else f'{key}{j}'
        print(nm, cut(nm, c))
