# Potong master asset sheet PLACTHINC jadi PNG telus: python3 scripts/cut-placthinc.py <sheet.png> video/public/placthinc  (perlu numpy, pillow, scipy)
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
base = Image.open(src).convert('RGB'); im = np.array(base).astype(int)
def cells(prefix, xs, y0, y1):
    return {f'{prefix}{i}': (xs[i], y0, xs[i+1], y1) for i in range(len(xs)-1)}
SPR = {
 'host_body': (775,33,892,246), 'cohost_body': (775,411,888,622),
 'logo': (222,12,562,172), 'desk': (811,810,1017,900),
 'mic': (788,893,842,1012), 'lantern': (893,893,965,1012),
 'books': (965,893,1040,1012), 'skull': (1046,893,1108,1012), 'bell': (1127,893,1194,1012),
 'key': (1210,848,1303,970), 'mirror': (1299,826,1402,992), 'photos': (1400,812,1526,1006),
}
SPR.update(cells('hexpr', [30,129,230,330,429,527,622,720], 494, 572))
for i in range(2,7): b=SPR[f'hexpr{i}']; SPR[f'hexpr{i}']=(b[0],478,b[2],b[3])
SPR.update(cells('cexpr', [45,145,255,365,478,588,700], 603, 682))
for i in range(2,6): b=SPR[f'cexpr{i}']; SPR[f'cexpr{i}']=(b[0],586,b[2],b[3])
SPR.update(cells('hand', [38,130,212,285,357,432,500,566,645,742], 710, 778))
RECT = {'stage_bg': (22,824,336,1002), 'house': (354,820,541,1003)}
SCALE = 3
for name,(x0,y0,x1,y1) in SPR.items():
    c = im[y0:y1, x0:x1]
    dark = c.max(axis=2) < 80
    lab0, _ = nd.label(dark)
    border = set(np.unique(np.concatenate([lab0[-1],lab0[:,0],lab0[:,-1]]))) - {0}
    bg = np.isin(lab0, list(border))
    fg = nd.binary_opening(~bg, iterations=1)
    lab, n = nd.label(fg)
    if n == 0: print('empty', name); continue
    sizes = nd.sum(fg, lab, range(1, n+1))
    keep = np.zeros_like(fg)
    big = sizes.max()
    for i,s in enumerate(sizes):  # keep main + sizable parts (eg. separated stick)
        if s >= big*0.08: keep |= lab == i+1
    keep = nd.binary_fill_holes(keep)
    ys, xs = np.where(keep)
    b = (xs.min(), ys.min(), xs.max()+1, ys.max()+1)
    rgb = base.crop((x0+b[0], y0+b[1], x0+b[2], y0+b[3]))
    a = Image.fromarray((keep[b[1]:b[3], b[0]:b[2]]*255).astype('uint8'))
    w,h = rgb.size
    rgb = rgb.resize((w*SCALE,h*SCALE), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
    a = a.resize((w*SCALE,h*SCALE), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    rgb.putalpha(a); rgb.save(f'{out}/{name}.png')
    print(name, rgb.size)
for name,box in RECT.items():
    r = base.crop(box); w,h = r.size
    r.resize((w*SCALE,h*SCALE), Image.LANCZOS).save(f'{out}/{name}.png'); print(name, (w*SCALE,h*SCALE))
