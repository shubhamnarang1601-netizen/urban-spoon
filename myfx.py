"""Custom effects on top of the effects skill: claude-logo, fly-away, news-anchor, dizzy."""
import sys, math, random
sys.path.insert(0, '/root/.claude/skills/synced/200cdd23-266d-429f-b14b-ee600219abab_e04e632b-d193-413b-a806-0f352ac84a3d/effects/scripts')
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
import fx
from fx import effect, place, comp, cached, clamp, ease_out, ease_back, ease_inout, font, text_img, rrect, shadowed, fade, grid

TERRA = (217, 119, 87)


def spark(size):
    """Orange starburst mark (drawn here, tapered rays)."""
    S = size * 4; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    rnd = random.Random(7); cx = cy = S / 2; n = 12
    for i in range(n):
        th = i * 2 * math.pi / n + rnd.uniform(-0.08, 0.08)
        L = S * 0.5 * rnd.uniform(0.78, 0.98); w0 = S * 0.055; w1 = S * 0.022
        px, py = -math.sin(th), math.cos(th); ux, uy = math.cos(th), math.sin(th)
        r0 = S * 0.06
        pts = [(cx + ux * r0 + px * w0, cy + uy * r0 + py * w0), (cx + ux * L + px * w1, cy + uy * L + py * w1),
               (cx + ux * L - px * w1, cy + uy * L - py * w1), (cx + ux * r0 - px * w0, cy + uy * r0 - py * w0)]
        d.polygon(pts, fill=TERRA + (255,))
        d.ellipse([cx + ux * L - w1, cy + uy * L - w1, cx + ux * L + w1, cy + uy * L + w1], fill=TERRA + (255,))
    d.ellipse([cx - S * 0.1, cy - S * 0.1, cx + S * 0.1, cy + S * 0.1], fill=TERRA + (255,))
    return im.resize((size, size), Image.LANCZOS)


def logo_card(W):
    s = int(W * 0.3); mark = spark(s)
    word = text_img('Claude', int(W * 0.075), 'serif', (255, 255, 255), shadow=6)
    glow = Image.new('RGBA', (int(s * 1.7), int(s * 1.7)), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse([s * 0.25, s * 0.25, s * 1.45, s * 1.45], fill=TERRA + (150,)); glow = glow.filter(ImageFilter.GaussianBlur(s * 0.18))
    out = Image.new('RGBA', (glow.width, glow.height + word.height), (0, 0, 0, 0))
    out.alpha_composite(glow, (0, 0)); out.alpha_composite(mark, ((glow.width - s) // 2, (glow.height - s) // 2))
    out.alpha_composite(word, ((out.width - word.width) // 2, glow.height - int(s * 0.12)))
    return out


def hover_pos(c, e):
    return c.W * float(e.o.get('x', 0.72)), c.H * float(e.o.get('y', 0.40))


def sparkles(c, cx, cy, r, t, n=10, alpha=1.0, seed=3):
    rnd = random.Random(seed); lay = Image.new('RGBA', (int(r * 2.4), int(r * 2.4)), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(n):
        a = rnd.uniform(0, 2 * math.pi); rr = r * rnd.uniform(0.5, 1.1); ph = rnd.uniform(0, 6)
        k = 0.5 + 0.5 * math.sin(t * 7 + ph); s = r * 0.07 * (0.4 + k)
        x, y = lay.width / 2 + rr * math.cos(a + t * 0.6), lay.height / 2 + rr * math.sin(a + t * 0.6)
        d.polygon([(x, y - s * 2), (x + s * 0.4, y), (x, y + s * 2), (x - s * 0.4, y)], fill=(255, 236, 200, int(255 * k)))
        d.polygon([(x - s * 2, y), (x, y + s * 0.4), (x + s * 2, y), (x, y - s * 0.4)], fill=(255, 236, 200, int(255 * k)))
    comp(c, lay, cx - lay.width / 2, cy - lay.height / 2, alpha, guard=True)


@effect('claude-logo', 'the Claude mark pops in and floats above your hand')
def fx_logo(c, e):
    im = cached(e, 'logo', lambda: logo_card(c.W))
    x, y = hover_pos(c, e)
    k = ease_back(c.lt / 0.45); bob = math.sin(c.lt * 3.2) * c.H * 0.008
    place(c, im, x, y + bob, 0.2 + 0.8 * k, 4 * math.sin(c.lt * 2), clamp(c.lt / 0.12), guard=True)
    sparkles(c, x, y + bob - im.height * 0.1, im.width * 0.55, c.lt, alpha=clamp(c.lt / 0.3))


@effect('fly-away', 'the Claude mark spins and flies off the top of the frame')
def fx_fly(c, e):
    im = cached(e, 'logo', lambda: logo_card(c.W))
    x0, y0 = hover_pos(c, e)
    p = clamp(c.lt / e.d); q = p ** 1.8
    # wind-up dip, then launch up and to the right in a curve
    dip = math.sin(clamp(p / 0.18) * math.pi) * c.H * 0.03 if p < 0.18 else 0
    x = x0 + c.W * 0.35 * q + math.sin(q * 9) * c.W * 0.03 * (1 - q)
    y = y0 + dip - (y0 + im.height) * q * 1.15
    # motion trail
    for j in range(6, 0, -1):
        qj = clamp(p - j * 0.025) ** 1.8
        xj = x0 + c.W * 0.35 * qj; yj = y0 - (y0 + im.height) * qj * 1.15
        place(c, im, xj, yj, 1 - 0.4 * qj, -540 * qj, 0.12 * (1 - j / 7) * clamp(p / 0.2), guard=True)
    place(c, im, x, y, 1 - 0.4 * q, -540 * q, 1.0, guard=True)
    # little puff of particles at the launch point
    if p < 0.6:
        rnd = random.Random(11); lay = Image.new('RGBA', (int(c.W * 0.6), int(c.W * 0.6)), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
        for i in range(26):
            a = rnd.uniform(0, 2 * math.pi); sp = rnd.uniform(0.3, 1.0); r = lay.width / 2 * sp * ease_out(p / 0.6)
            s = c.W * 0.012 * (1 - p / 0.6) * rnd.uniform(0.5, 1.3)
            px, py = lay.width / 2 + r * math.cos(a), lay.height / 2 + r * math.sin(a)
            d.ellipse([px - s, py - s, px + s, py + s], fill=(255, 190, 150, 230))
        comp(c, lay, x0 - lay.width / 2, y0 - lay.height / 2, 1.0, guard=True)


def studio(W, H):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    g = np.clip(yy / H, 0, 1)[..., None]
    top, bot = np.array([10, 32, 82]), np.array([4, 10, 34])
    img = top * (1 - g) + bot * g
    r = np.sqrt(((xx - W * 0.5) / W) ** 2 + ((yy - H * 0.3) / H) ** 2)[..., None]
    img = img + np.array([40, 90, 200]) * np.clip(0.45 - r, 0, 1) * 1.2
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(im)
    # globe-ish grid lines
    cx, cy, R = W * 0.5, H * 0.3, W * 0.62
    for k in range(-6, 7):
        rx = abs(R * math.cos(k * math.pi / 14)); d.ellipse([cx - rx, cy - R, cx + rx, cy + R], outline=(80, 150, 255, 70), width=2)
    for k in range(-5, 6):
        y = cy + R * math.sin(k * math.pi / 12); rx = R * math.cos(k * math.pi / 12)
        d.line([cx - rx, y, cx + rx, y], fill=(80, 150, 255, 60), width=2)
    # light bars / screens
    for i, x in enumerate([0.06, 0.82]):
        d.rounded_rectangle([W * x, H * 0.12, W * (x + 0.12), H * 0.55], 10, fill=(30, 70, 160, 120), outline=(120, 180, 255, 140), width=3)
    big = fx.fit_text('NEWS', W * 0.92, 'anton', int(W * 0.4), fill=(255, 255, 255))
    a = np.asarray(big).copy(); a[..., 3] = (a[..., 3] * 0.16).astype(np.uint8)
    im.alpha_composite(Image.fromarray(a, 'RGBA'), (int((W - big.width) / 2), int(H * 0.08)))
    return im


@effect('news-anchor', 'turns your room into a TV news studio with a desk, LIVE bug, lower third and ticker')
def fx_news(c, e):
    W, H = c.W, c.H
    k = clamp(c.lt / 0.3); out = fade(c, e, 0.25); al = k * out
    st = cached(e, 'studio', lambda: fx.to_np(studio(W, H)))
    # wipe in from the left
    wipe = ease_out(c.lt / 0.35); xcut = int(W * wipe)
    if xcut > 0:
        sub = st[:, :xcut]; comp(c, sub, 0, 0, out, behind=True)
    # news desk in front of the lap
    def desk():
        dh = int(H * 0.36); im = Image.new('RGBA', (W, dh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.polygon([(0, dh * 0.1), (W, dh * 0.1), (W, dh), (0, dh)], fill=(14, 22, 52, 255))
        d.rectangle([0, 0, W, dh * 0.1], fill=(200, 210, 230, 255))
        d.rectangle([0, dh * 0.1, W, dh * 0.125], fill=(210, 20, 40, 255))
        lab = text_img('AI NEWS 24', int(W * 0.06), 'anton', (255, 255, 255))
        im.alpha_composite(lab, ((W - lab.width) // 2, int(dh * 0.22)))
        return im
    dk = cached(e, 'desk', desk)
    dy = H * 0.66 + (1 - ease_out((c.lt - 0.1) / 0.35)) * H * 0.4
    comp(c, dk, 0, dy, out * clamp((c.lt - 0.1) / 0.1))
    # lower third
    def lower():
        w = int(W * 0.94); h = int(H * 0.115); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        th = int(h * 0.36)
        d.rectangle([0, 0, int(w * 0.5), th], fill=(210, 20, 40, 255))
        t = text_img('BREAKING NEWS', int(th * 0.62), 'anton', (255, 255, 255)); im.alpha_composite(t, (int(w * 0.03), (th - t.height) // 2))
        d.rectangle([0, th, w, h], fill=(250, 250, 252, 255))
        d.rectangle([0, th, int(w * 0.018), h], fill=(210, 20, 40, 255))
        t2 = fx.fit_text(e.o.get('text', 'CREATOR TURNS INTO NEWS ANCHOR WITH AI'), w * 0.9, 'anton', int((h - th) * 0.5), fill=(15, 20, 45))
        im.alpha_composite(t2, (int(w * 0.04), th + (h - th - t2.height) // 2))
        return shadowed(im, 14, 6, 140)
    lw = cached(e, 'lower', lower)
    lx = -lw.width + (lw.width + W * 0.03) * ease_out((c.lt - 0.35) / 0.4)
    comp(c, lw, lx, H * 0.535, out)
    # ticker
    th = int(H * 0.045)
    def tick():
        msg = '   •   '.join(['AI EDITS VIDEO IN SECONDS', 'CLAUDE LOGO SPOTTED FLYING OVER LIVING ROOM', 'MORE AT 9', 'MARKETS: REELS UP 200%']) + '   •   '
        t = text_img(msg * 2, int(th * 0.55), 'anton', (255, 255, 255)); return t
    tk = cached(e, 'tick', tick)
    bar = np.zeros((th, W, 4), np.float32); bar[..., 0] = 0.05; bar[..., 1] = 0.08; bar[..., 2] = 0.2; bar[..., 3] = 1
    comp(c, bar, 0, H - th, al)
    off = (c.lt * W * 0.32) % (tk.width / 2)
    comp(c, tk, W * 0.2 - off, H - th + (th - tk.height) / 2, al)
    lab = cached(e, 'tlab', lambda: rrect(int(W * 0.18), th, 0, (210, 20, 40, 255)))
    comp(c, lab, 0, H - th, al)
    ttl = cached(e, 'ttl', lambda: text_img('LATEST', int(th * 0.55), 'anton', (255, 255, 255)))
    comp(c, ttl, (W * 0.18 - ttl.width) / 2, H - th + (th - ttl.height) / 2, al)
    # LIVE bug
    def live():
        im = rrect(int(W * 0.2), int(W * 0.075), W * 0.012, (210, 20, 40, 255)); d = ImageDraw.Draw(im)
        r = im.height * 0.16; d.ellipse([im.height * 0.35 - r, im.height / 2 - r, im.height * 0.35 + r, im.height / 2 + r], fill=(255, 255, 255, 255))
        t = text_img('LIVE', int(im.height * 0.55), 'anton', (255, 255, 255)); im.alpha_composite(t, (int(im.height * 0.62), (im.height - t.height) // 2))
        return im
    lv = cached(e, 'live', live)
    comp(c, lv, W * 0.05, H * 0.04, al * (0.75 + 0.25 * (math.sin(c.lt * 6) > 0)))
    clk = cached(e, 'clk', lambda: text_img('10:08 AM', int(W * 0.045), 'anton', (255, 255, 255), shadow=4))
    comp(c, clk, W * 0.95 - clk.width, H * 0.045, al)


@effect('dizzy', 'the frame wobbles and doubles like your head is spinning, with little stars')
def fx_dizzy(c, e):
    k = clamp(c.lt / 0.25) * fade(c, e, 0.25)
    ang = math.sin(c.lt * 7) * 5 * k; sc = 1.06 + 0.03 * math.sin(c.lt * 5) * k
    M = cv2.getRotationMatrix2D((c.W / 2, c.H * 0.45), ang, 1 + (sc - 1) * k)
    img = cv2.warpAffine(c.img, M, (c.W, c.H), borderMode=cv2.BORDER_REFLECT)
    sh = int(c.W * 0.025 * k * (0.6 + 0.4 * math.sin(c.lt * 11)))
    ghost = np.roll(img, sh, axis=1)
    c.img = img * (1 - 0.35 * k) + ghost * 0.35 * k
    c.m = cv2.warpAffine(c.m, M, (c.W, c.H))
    # stars circling the head
    fx_, fy_ = M @ np.array([c.fx, c.fy, 1.0])
    for i in range(5):
        th = c.lt * 5 + i * 2 * math.pi / 5
        x = fx_ + math.cos(th) * c.fw * 1.3; y = fy_ - c.fw * 1.05 + math.sin(th) * c.fw * 0.28
        s = int(c.W * 0.05); st = Image.new('RGBA', (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(st)
        pts = [(s / 2 + s / 2 * (1 if j % 2 == 0 else 0.42) * math.cos(-math.pi / 2 + j * math.pi / 5),
                s / 2 + s / 2 * (1 if j % 2 == 0 else 0.42) * math.sin(-math.pi / 2 + j * math.pi / 5)) for j in range(10)]
        d.polygon(pts, fill=(255, 214, 10, 255), outline=(120, 80, 0, 255))
        place(c, st, x, y, 1, 0, k, behind=math.sin(th) < 0)


if __name__ == '__main__':
    fx.main()
