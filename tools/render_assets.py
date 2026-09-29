"""Offline 'photoshop' for Reefq envelope: renders grayscale shading/texture layers with alpha.
Colors are applied in the browser (multiply), so one set of assets serves every envelope color."""
import numpy as np, base64, io, os
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, distance_transform_edt, zoom

rs = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'env'); os.makedirs(OUT, exist_ok=True)
W, H = 720, 936            # envelope box (ratio 1.3)
FL = 0.46                  # flap depth
PV = 0.40                  # pocket V apex (side folds top edge)
BF = 0.535                 # bottom fold apex

def fbm(h, w, scales=(64, 24, 8, 3), amps=(1, .6, .35, .2), seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w))
    for s, a in zip(scales, amps):
        n = r.standard_normal((h // s + 3, w // s + 3))
        n = zoom(n, s, order=3)[:h, :w]
        out += a * n
    out -= out.mean(); out /= (out.std() + 1e-6)
    return out

def lambert(height, strength, light=(-.55, -.7, 1.0)):
    gy, gx = np.gradient(height)
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(height)
    l = np.array(light); l = l / np.linalg.norm(l)
    d = (nx * l[0] + ny * l[1] + nz * l[2]) / np.sqrt(nx**2 + ny**2 + nz**2)
    return d / l[2]

def fibers(h, w, n, seed, lw=1):
    r = np.random.default_rng(seed)
    im = Image.new('L', (w, h), 128); d = ImageDraw.Draw(im)
    for _ in range(n):
        x, y = r.uniform(0, w), r.uniform(0, h); a = r.uniform(0, np.pi); L = r.uniform(6, 26)
        pts = []
        for k in range(6):
            a += r.normal(0, .25); x += np.cos(a) * L / 6; y += np.sin(a) * L / 6; pts.append((x, y))
        d.line(pts, fill=int(r.choice([100, 150, 160])), width=lw)
    return (np.asarray(im.filter(ImageFilter.GaussianBlur(.6)), float) - 128) / 128

def paper(h, w, seed):
    mott = fbm(h, w, (90, 40, 16), (1, .5, .3), seed)
    grain = fbm(h, w, (4, 2), (1, .6), seed + 1)
    relief = gaussian_filter(np.random.default_rng(seed + 2).standard_normal((h, w)), 1.4)
    shade = lambert(relief, 9.0)
    t = 1 - .009 * mott + .012 * grain * 0 + .05 * (shade - shade.mean()) + .035 * fibers(h, w, int(h * w / 900), seed + 3)
    return t

def poly_mask(pts, h, w, ss=4):
    im = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(im).polygon([(x * ss, y * ss) for x, y in pts], fill=255)
    return np.asarray(im.resize((w, h), Image.LANCZOS), float) / 255

def chaikin(pts, it=3):
    for _ in range(it):
        new = [pts[0]]
        for a, b in zip(pts[:-1], pts[1:]):
            new += [(a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25), (a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75)]
        new.append(pts[-1]); pts = new
    return pts

def save_la(gray, alpha, name, q=86):
    g = np.clip(gray * 255, 0, 255).astype(np.uint8); a = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([g, g, g, a]), 'RGBA')
    im.save(f'{OUT}/{name}.webp', 'WEBP', quality=q, method=6)
    return f'{OUT}/{name}.webp'

def line_dist(h, w, p0, p1):
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(xx - (x0 + t * dx), yy - (y0 + t * dy))

yy, xx = np.mgrid[0:H, 0:W].astype(float)
light = 1.03 - .05 * (xx / W) - .05 * (yy / H)

# ---------- pocket ----------
P = paper(H, W, 11)
pocket_shape = poly_mask([(0, 0), (W / 2, PV * H), (W, 0), (W, H), (0, H)], H, W)
bottom = poly_mask([(0, H), (W / 2, BF * H), (W, H)], H, W)
left = poly_mask([(0, 0), (W / 2, PV * H), (W / 2, H), (0, H)], H, W)
g = P * light
g = g * (1 - .025 * (1 - left))            # right fold a touch darker (light from left)
# cast shadow of the bottom fold onto the side folds
d1 = np.minimum(line_dist(H, W, (0, H), (W / 2, BF * H)), line_dist(H, W, (W / 2, BF * H), (W, H)))
above = 1 - bottom
g *= 1 - .16 * np.exp(-d1 / 7) * above - .05 * np.exp(-d1 / 26) * above
g += .07 * np.exp(-d1 / 1.2) * bottom       # paper edge catches light
# seam where side folds meet (under the bottom fold, short)
seam = np.exp(-np.abs(xx - W / 2) / 2.5) * ((yy > PV * H) & (yy < BF * H))
g *= 1 - .08 * seam
# top V edge of the pocket: bright paper edge
dv = np.minimum(line_dist(H, W, (0, 0), (W / 2, PV * H)), line_dist(H, W, (W / 2, PV * H), (W, 0)))
g += .06 * np.exp(-dv / 1.3)
# outer edge definition
de = np.minimum.reduce([xx, W - 1 - xx, yy, H - 1 - yy])
g *= 1 - .07 * np.exp(-de / 1.5)
save_la(g, pocket_shape, 'pocket')

# ---------- flap ----------
tip = [(W / 2 - 34, FL * H - 30), (W / 2, FL * H), (W / 2 + 34, FL * H - 30)]
flap_pts = [(0, 0)] + chaikin(tip, 4) + [(W, 0)]
flap_shape = poly_mask(flap_pts, H, W)
F = paper(H, W, 21)
fg = F * (1.035 - .04 * (xx / W) - .02 * (yy / (FL * H)))
fg *= 1 - .10 * np.exp(-yy / 9)            # crease shadow at the fold line
fd = distance_transform_edt(flap_shape > .5)
fg += .05 * np.exp(-fd / 2.2) * (yy > 3)    # thickness highlight along cut edges
fg *= 1 - .12 * np.exp(-fd / .8) * (yy > 3)
save_la(fg, flap_shape, 'flap')
# flap cast shadow onto the pocket (shown under the flap, fades as it opens)
sh = gaussian_filter(np.roll(flap_shape, 9, axis=0), 11)
sh[:9] = 0
save_la(np.zeros_like(sh), np.clip(sh * .42, 0, 1), 'flapshadow')

# ---------- interior (seen once the flap opens) ----------
interior_region = 1 - pocket_shape
ig = .48 + .52 * np.clip(yy / (PV * H), 0, 1) ** 0.7
ig *= 1 - .22 * np.exp(-dv / 10) * interior_region   # pocket edge casts into the envelope
ig = gaussian_filter(ig, 1)
save_la(ig, np.ones_like(ig), 'interior', q=80)

# ---------- card (deckled cotton card) ----------
CW, CH = int(W * .84), int(H * .66)
C = paper(CH, CW, 31)
cy, cx = np.mgrid[0:CH, 0:CW].astype(float)
edge_noise = gaussian_filter(np.random.default_rng(5).standard_normal((CH, CW)), 2.2) * 5
cd = np.minimum.reduce([cx, CW - 1 - cx, cy, CH - 1 - cy]) + edge_noise
card_a = np.clip((cd - 1.5) / 2.2, 0, 1)
cg = C * (1.02 - .03 * cy / CH) * (1 - .06 * np.exp(-np.clip(cd, 0, None) / 3))
save_la(cg, card_a, 'card')

# ---------- linen table ----------
BW, BH = 750, 1334
by, bx = np.mgrid[0:BH, 0:BW].astype(float)
per = 3.4
wx = np.sin(bx * 2 * np.pi / per + fbm(BH, BW, (40, 12), (1, .5), 3) * .8)
wy = np.sin(by * 2 * np.pi / per + fbm(BH, BW, (40, 12), (1, .5), 4) * .8)
weave = .5 * (np.where(((bx // per + by // per) % 2) == 0, wx, wy))
slub = gaussian_filter(np.random.default_rng(9).standard_normal((BH, BW)), (0.6, 7)) * 1.6 + gaussian_filter(np.random.default_rng(10).standard_normal((BH, BW)), (7, 0.6)) * 1.6
folds_h = fbm(BH, BW, (260, 140, 70), (1, .6, .3), 12) * 26
fold_l = lambert(folds_h, 1.0, (-.6, -.8, 1.2))
base = .9 + .07 * (fold_l - fold_l.mean())
lin = base * (1 + .045 * weave + .03 * slub)
vign = 1 - .22 * (((bx / BW - .45) ** 2) * 1.3 + ((by / BH - .42) ** 2)) ** 1.1 * 2.2
win = 1 + .07 * np.exp(-(((bx / BW) ** 2 + (by / BH) ** 2)) * 2.2)
bg = lin * vign * win
Image.fromarray(np.clip(bg * 255, 0, 255).astype(np.uint8), 'L').convert('RGB').save(f'{OUT}/linen.webp', 'WEBP', quality=78, method=6)

for f in sorted(os.listdir(OUT)):
    if f.endswith('.webp'): print(f, os.path.getsize(f'{OUT}/{f}'))
