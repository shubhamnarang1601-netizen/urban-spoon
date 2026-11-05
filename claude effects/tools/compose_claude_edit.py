"""Compositor: recreates the 'Claude edits my video by voice' reference look on the raw clip."""
import sys, subprocess, math, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

B = sys.argv[1]                     # build dir
SRC = os.path.join(B, 'trimmed.mp4')
OUT = sys.argv[2]
STILLS = [float(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else None
W, H, FPS = 1080, 1920, 30
SW, SH = 478, 850
FX = '/root/.claude/skills/synced/200cdd23-266d-429f-b14b-ee600219abab_e04e632b-d193-413b-a806-0f352ac84a3d/effects/fonts/'
IN = '/usr/share/fonts/opentype/inter/'
_fc = {}
def F(path, size):
    k = (path, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(path, size)
    return _fc[k]
INTER = IN + 'Inter-Regular.otf'; INTER_M = IN + 'Inter-Medium.otf'; INTER_SB = IN + 'Inter-SemiBold.otf'
MONO = subprocess.run(['fc-match', '-f', '%{file}', 'JetBrains Mono:style=Regular'], capture_output=True, text=True).stdout
ARCH = FX + 'ArchivoBlack-Regular.ttf'; ANTON = FX + 'Anton-Regular.ttf'; SERIF_I = FX + 'InstrumentSerif-Italic.ttf'

# ---------- timing helpers (output timeline) ----------
def m(t):  # original raw time -> output time
    if t < 5.2: return t
    if t < 37.4: return t - 2.4
    return t - 6.3
def clamp(x, a=0., b=1.): return max(a, min(b, x))
def ease(x):
    x = clamp(x); return 4*x*x*x if x < .5 else 1 - (-2*x+2)**3/2
def back(x):
    x = clamp(x); c1 = 1.70158; c3 = c1+1; return 1 + c3*(x-1)**3 + c1*(x-1)**2
def prog(t, a, b): return ease((t-a)/(b-a))
def lerp(a, b, k): return a + (b-a)*k
def lerpc(a, b, k): return tuple(int(round(lerp(x, y, k))) for x, y in zip(a, b))

# ---------- script ----------
def W_(lst):  # [(word, orig_start)] -> output times
    return [(w, m(s)) for w, s in lst]
HOOK = W_([('Video', 0.0), ('edit', .42), ('karna', .5), ('chahte', .8), ('ho?', 1.1), ('Toh', 1.52), ('der', 1.98), ('kis', 2.16),
           ('baat', 2.36), ('ki?', 2.6), ('Jao', 2.76), ('Claude', 3.72), ('pe', 3.98), ('aur', 4.34), ('video', 4.38), ('daalo', 4.64)])
HOOK_END = 5.2
BCAP = W_([('chaar', 18.94), ('Nahi,', 20.62), ('nahi,', 21.14), ('nahi,', 21.52), ('nahi.', 22.12), ('Ye', 22.74), ('wala,', 22.88),
           ('accha', 23.86), ('hai.', 24.08), ('Background', 26.64), ('change', 27.16), ('kar', 27.68), ('do', 27.86), ('thoda,', 27.98),
           ('accha', 28.56), ('nahi', 28.72), ('lag', 28.88), ('raha', 29.04), ('hai', 29.12), ('bilkul.', 29.22), ('Thoda', 30.48),
           ('wide', 30.98), ('nahi', 31.28), ('lag', 31.46), ('raha', 31.6), ('hai.', 31.7), ('Ek', 32.82), ('kaam', 33.06), ('karo,', 33.22),
           ('blue', 33.56), ('background', 33.76), ('kar', 34.12), ('do,', 34.34), ('ya', 34.48), ('kuch', 34.54), ('classy', 35.94),
           ('sa', 36.28), ('background', 36.44), ('kar', 36.74), ('do.', 36.94)])
BCAP_END = m(37.35)
CTA = W_([('Toh', 41.66), ('aisi', 41.8), ('video', 42.18), ('banani', 42.54), ('hai?', 42.9), ('Subscribe!', 43.56)])

def chunks(words, end_t, n=2):
    out, cur = [], []
    for i, (w, s) in enumerate(words):
        cur.append((w, s))
        if len(cur) == n or w[-1] in ',.?!' or (i+1 < len(words) and words[i+1][1]-s > .7):
            out.append(cur); cur = []
    if cur: out.append(cur)
    res = []
    for i, c in enumerate(out):
        nxt = out[i+1][0][1] if i+1 < len(out) else end_t
        last = c[-1][1]
        e = min(nxt, last + .75)
        res.append((c[0][1], e, c))
    return res
HOOK_CH = chunks(HOOK, HOOK_END)
B_CH = chunks(BCAP, BCAP_END)
CTA_CH = chunks(CTA, 99)

# Terminal prompts: (appear, type_start, type_end, text, [(t, kind, status)])
PROMPTS = [
    (m(3.55), m(3.72), m(4.95), 'Claude, ye video edit kar do', [(m(4.95), 'w', 'Importing talkinghead.mp4'), (5.65, 'd', 'Opened talkinghead.mp4 in the editor')]),
    (m(8.6), m(8.74), m(10.0), 'Left mein shift kar do Claude mujhe', [(m(10.0), 'w', 'Moving you left · resizing to a card'), (m(10.7), 'd', 'Moved left · adding timeline')]),
    (m(12.4), m(12.46), m(12.75), 'Right', [(m(12.8), 'w', 'Moving you right')]),
    (m(13.7), m(13.8), m(14.82), 'Nahi nahi, left theek tha', [(m(14.85), 'w', 'Reverting · moving back left'), (m(15.5), 'd', 'Back to left · layers panel')]),
    (m(16.9), m(17.0), m(19.1), 'Okay, captions dikhao mujhe, chaar', [(m(19.15), 'w', 'Loading 4 caption styles'), (m(19.8), 'd', '4 caption styles ready')]),
    (m(20.5), m(20.62), m(22.4), 'Nahi, nahi, nahi, nahi', [(m(20.9), 'w', 'Next style · 2 / 4'), (m(21.35), 'w', 'Next style · 3 / 4'), (m(21.8), 'w', 'Next style · 4 / 4')]),
    (m(22.6), m(22.74), m(24.3), 'Ye wala, accha hai', [(m(24.3), 'd', 'Style 4/4 · Bold Pop locked')]),
    (m(26.5), m(26.64), m(29.5), 'Background change kar do thoda, accha nahi lag raha bilkul', [(m(29.55), 'w', 'Replacing background · edit_suite'), (m(30.25), 'd', 'Background replaced')]),
    (m(30.4), m(30.48), m(31.95), 'Thoda wide nahi lag raha hai', [(m(32.0), 'w', 'Widening the frame'), (m(32.65), 'd', 'Wider frame · timeline hidden')]),
    (m(32.75), m(32.82), m(37.0), 'Ek kaam karo, blue background kar do, ya kuch classy sa background kar do',
     [(m(34.4), 'w', 'Painting the background blue'), (m(36.3), 'w', 'Making it classy · midnight + gold'), (m(37.05), 'd', 'Classy background applied')]),
]
TERM_IN, TERM_OUT = m(3.55), 35.0

# key times
T_SHRINK = (5.2, 5.85)
T_LEFT1 = (m(10.1), m(10.6)); T_TL = (m(10.7), m(11.2))
T_RIGHT = (m(12.8), m(13.3)); T_LEFT2 = (m(14.9), m(15.4)); T_LAYERS = (m(15.5), m(16.0))
T_CAPPANEL = m(19.2); STYLE_T = [m(19.25), m(20.9), m(21.35), m(21.8)]; T_LOCK = m(24.3)
T_PANEL_BACK = m(26.6)
T_DARK = (m(29.6), m(30.2)); T_WIDE = (m(32.0), m(32.6))
T_BLUE = (m(34.4), m(34.9)); T_CLASSY = (m(36.3), m(36.9))
T_END = (35.0, 35.55); T_PILL = m(43.45)

# ---------- static assets ----------
thumbs = [Image.open(os.path.join(B, f'th{i}.png')).convert('RGB') for i in range(10)]
raw_a = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 's16le', '-ac', '1', '-ar', '8000', '-'], capture_output=True).stdout
aud = np.abs(np.frombuffer(raw_a, np.int16).astype(np.float32))
NB = 120
env = np.array([aud[i*len(aud)//NB:(i+1)*len(aud)//NB].mean() for i in range(NB)]); env = (env/env.max())**.7
nfr = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames',
                          '-of', 'csv=p=0', SRC], capture_output=True, text=True).stdout.strip())
DUR = nfr / FPS

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def radial(cx, cy, rx, ry):
    return np.clip(1 - np.sqrt(((xx-cx)/rx)**2 + ((yy-cy)/ry)**2), 0, 1)
BG_LIGHT = np.zeros((H, W, 3), np.float32) + np.array([236, 236, 239], np.float32)
BG_LIGHT += (radial(540, 700, 900, 1100)[..., None] * np.array([8, 8, 8]))
g = (yy / H)[..., None]
BG_BLUE = (np.array([8, 26, 84]) * (1-g) + np.array([20, 70, 200]) * g).astype(np.float32)
BG_BLUE += radial(540, 900, 700, 900)[..., None]**2 * np.array([40, 80, 140])
BG_CLASSY = (np.array([10, 10, 16]) * (1-g) + np.array([22, 20, 30]) * g).astype(np.float32)
BG_CLASSY += radial(540, 1000, 620, 820)[..., None]**2.2 * np.array([120, 88, 40])   # warm gold glow behind window
BG_CLASSY += radial(540, -200, 900, 700)[..., None]**2 * np.array([30, 30, 50])
rng = np.random.default_rng(3)
GRAIN = rng.normal(0, 5, (H, W, 1)).astype(np.float32)
VIGN = (1 - .55*np.clip(np.sqrt(((xx-540)/760)**2 + ((yy-960)/1250)**2), 0, 1)**2.2)[..., None]

def blurred_bg(fr):
    s = cv2.resize(fr, (54, 96), interpolation=cv2.INTER_AREA)
    s = cv2.GaussianBlur(s, (0, 0), 3)
    b = cv2.resize(s, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    b = b * .42 + np.array([18, 8, 30]) * .6
    return b * VIGN

def background(t, fr):
    k_dark = prog(t, *T_DARK); k_blue = prog(t, *T_BLUE); k_cl = prog(t, *T_CLASSY)
    bg = BG_LIGHT
    if k_dark > 0: bg = bg*(1-k_dark) + blurred_bg(fr)*k_dark
    if k_blue > 0: bg = bg*(1-k_blue) + BG_BLUE*k_blue
    if k_cl > 0: bg = bg*(1-k_cl) + (BG_CLASSY + GRAIN*.6)*k_cl
    return bg
def darkness(t): return prog(t, *T_DARK)

# ---------- window geometry ----------
TB = 52
FULL = (0, 0, 1080, 1920, 0.)
CENTER = (196, 330, 688, 1170, 1.)
LEFT = (64, 330, 688, 1170, 1.)
RIGHT = (328, 330, 688, 1170, 1.)
BIG = (120, 330, 840, 1490, 1.)
END = (120, 150, 840, 1498, 1.)
def mix(a, b, k): return tuple(lerp(x, y, k) for x, y in zip(a, b))
def win(t):
    r = mix(FULL, CENTER, prog(t, *T_SHRINK))
    for (a, b), tgt in [(T_LEFT1, LEFT), (T_RIGHT, RIGHT), (T_LEFT2, LEFT), (T_WIDE, BIG), (T_END, END)]:
        if t > a: r = mix(r, tgt, prog(t, a, b))
    return r

def rr_mask(w, h, rad, ss=2):
    im = Image.new('L', (w*ss, h*ss), 0)
    ImageDraw.Draw(im).rounded_rectangle((0, 0, w*ss-1, h*ss-1), rad*ss, fill=255)
    return im.resize((w, h), Image.LANCZOS)

def video_crop(fr, vw, vh):
    s = max(vw/SW, vh/SH)
    nw, nh = max(vw, round(SW*s)), max(vh, round(SH*s))
    big = cv2.resize(fr, (nw, nh), interpolation=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA)
    if s > 1.3:
        bl = cv2.GaussianBlur(big, (0, 0), 1.2); big = cv2.addWeighted(big, 1.45, bl, -.45, 0)
    ox = (nw - vw)//2; oy = int((nh - vh) * .3)
    return big[oy:oy+vh, ox:ox+vw]

# ---------- drawing helpers ----------
def text_w(font, s): return font.getlength(s)
def claude_star(d, cx, cy, r, col=(217, 119, 87)):
    for i in range(12):
        a = i*math.pi/6 + .13*(i % 2)
        rr = r if i % 2 == 0 else r*.82
        d.line((cx, cy, cx+math.cos(a)*rr, cy+math.sin(a)*rr), fill=col, width=max(3, int(r*.22)))
    d.ellipse((cx-r*.22, cy-r*.22, cx+r*.22, cy+r*.22), fill=col)

def wrap(font, s, maxw):
    words, lines, cur = s.split(' '), [], ''
    for w in words:
        c = (cur + ' ' + w).strip()
        if text_w(font, c) > maxw and cur: lines.append(cur); cur = w
        else: cur = c
    lines.append(cur); return lines

# ---------- caption styles ----------
ORANGE = (214, 112, 70)
def cap_draw(d, words, active, cx, cy, wwid, style, alpha=255, scale=1.):
    if style == 4:   # Bold Pop
        sz = int(wwid*.088*scale); f = F(ARCH, sz)
        toks = [w.upper().strip(',.') if w not in ('ho?', 'hai?', 'ki?') else w.upper() for w in words]
        toks = [x.rstrip('.,') for x in toks]
        gap = sz*.28; ws = [text_w(f, x) for x in toks]; tot = sum(ws) + gap*(len(ws)-1)
        if tot > wwid*.8:
            sz = int(sz*wwid*.8/tot); f = F(ARCH, sz); gap = sz*.28; ws = [text_w(f, x) for x in toks]; tot = sum(ws) + gap*(len(ws)-1)
        x = cx - tot/2
        for i, (tk, w) in enumerate(zip(toks, ws)):
            if i == active:
                pad = sz*.16
                d.rounded_rectangle((x-pad, cy-sz*.62, x+w+pad, cy+sz*.62), int(sz*.18), fill=ORANGE+(alpha,), outline=(255, 255, 255, alpha), width=max(2, sz//22))
                d.text((x, cy), tk, font=f, anchor='lm', fill=(255, 255, 255, alpha))
            else:
                d.text((x, cy), tk, font=f, anchor='lm', fill=(255, 255, 255, alpha), stroke_width=max(3, sz//14), stroke_fill=(20, 20, 20, alpha))
            x += w + gap
    elif style == 1:  # Plain
        sz = int(wwid*.072*scale); f = F(INTER_M, sz)
        s = ' '.join(w.lower() for w in words)
        d.text((cx, cy), s, font=f, anchor='mm', fill=(255, 255, 255, int(alpha*.92)), stroke_width=2, stroke_fill=(0, 0, 0, int(alpha*.35)))
    elif style == 2:  # Meme
        sz = int(wwid*.105*scale); f = F(ANTON, sz)
        s = ' '.join(w.upper().rstrip(',.') for w in words)
        d.text((cx, cy), s, font=f, anchor='mm', fill=(255, 214, 0, alpha), stroke_width=max(4, sz//11), stroke_fill=(0, 0, 0, alpha))
    elif style == 3:  # Editorial
        sz = int(wwid*.115*scale); f = F(SERIF_I, sz)
        s = ' '.join(w.lower().rstrip(',.') for w in words)
        d.text((cx, cy), s, font=f, anchor='mm', fill=(255, 255, 255, alpha), stroke_width=1, stroke_fill=(0, 0, 0, alpha//3))

def current_chunk(chs, t):
    for s, e, c in chs:
        if s <= t < e:
            act = 0
            for i, (w, ws) in enumerate(c):
                if t >= ws: act = i
            return [w for w, _ in c], act, s
    return None

def caption_style(t):
    if t < T_CAPPANEL: return None
    st = 1
    for i, s in enumerate(STYLE_T):
        if t >= s: st = i+1
    return st

# ---------- UI blocks ----------
def draw_terminal(ov, t):
    if t < TERM_IN or t > TERM_OUT + .5: return
    k = back((t - TERM_IN)/.45) if t < TERM_OUT else 1 - ease((t - TERM_OUT)/.4)
    a = int(255*clamp(k)); dy = (1-clamp(k))*-60
    pr = None
    for p in PROMPTS:
        if t >= p[0]: pr = p
    if pr is None: return
    d = ImageDraw.Draw(ov)
    x0, y0, x1, y1 = 48, 84+dy, 1032, 296+dy
    d.rounded_rectangle((x0, y0, x1, y1), 34, fill=(34, 33, 32, int(a*.94)), outline=(70, 68, 66, a), width=2)
    claude_star(d, x0+48, y0+50, 22, (217, 119, 87, a))
    d.text((x0+82, y0+50), 'Claude', font=F(INTER_M, 36), anchor='lm', fill=(245, 244, 240, a))
    d.text((x0+82+text_w(F(INTER_M, 36), 'Claude')+10, y0+52), '· editing talkinghead.mp4', font=F(INTER, 26), anchor='lm', fill=(150, 148, 144, a))
    ap, ts, te, txt, sts = pr
    n = int(len(txt) * clamp((t-ts)/max(.01, te-ts)))
    shown = txt[:n]
    fm = F(MONO, 33)
    lines = wrap(fm, shown, 860) if shown else ['']
    for i, ln in enumerate(lines[:2]):
        d.text((x0+40, y0+100+i*40), ('> ' if i == 0 else '  ') + ln, font=fm, anchor='lm', fill=(236, 234, 228, a))
    cur_line = min(len(lines), 2)-1
    cx = x0+40+text_w(fm, ('> ' if cur_line == 0 else '  ') + lines[cur_line]) + 4
    typing = t < te + .15
    if typing or int(t*2.2) % 2 == 0:
        if not any(t >= s[0] for s in sts) or typing:
            d.rectangle((cx, y0+100+cur_line*40-17, cx+18, y0+100+cur_line*40+17), fill=(220, 218, 212, a))
    st = None
    for s in sts:
        if t >= s[0]: st = s
    if st:
        sk = clamp((t-st[0])/.2)
        fs = F(MONO, 22); sy = y1 - 24
        if st[1] == 'w':
            pulse = .55 + .45*math.sin(t*9)
            d.text((x0+40, sy), '● ' + st[2] + ' ' + '.'*(1+int(t*4) % 3), font=fs, anchor='lm', fill=(217, 119, 87, int(a*sk*(.7+.3*pulse))))
        else:
            d.text((x0+40, sy), '✓ Done · ' + st[2], font=fs, anchor='lm', fill=(98, 190, 120, int(a*sk)))

def panel_theme(t):
    k = darkness(t)
    return dict(bg=lerpc((250, 250, 252), (18, 18, 22), k), bd=lerpc((222, 222, 228), (58, 58, 66), k),
                tx=lerpc((40, 40, 46), (236, 236, 240), k), sub=lerpc((140, 140, 150), (130, 130, 140), k),
                row=lerpc((238, 240, 246), (30, 32, 42), k), k=k)

LAYER_COL = {'Background': (60, 120, 245), 'Timeline': (40, 160, 120), 'talkinghead': (110, 90, 240), 'Captions': (232, 150, 60)}
def layers_list(t):
    L = ['Timeline', 'talkinghead']
    if t >= T_LOCK: L = ['Captions'] + L
    if t >= T_DARK[1]: L = ['Background'] + L
    return L

def draw_panel(ov, t, wr):
    # visible between layers-in and widen
    if t < T_LAYERS[0] or t > T_WIDE[1]: return
    kin = ease((t - T_LAYERS[0])/.5)
    kout = 1 - ease((t - T_WIDE[0])/.45) if t > T_WIDE[0] else 1
    k = min(kin, kout); a = int(255*k)
    th = panel_theme(t)
    x0 = 778 + (1-k)*120; y0 = 330; x1 = x0 + 254
    d = ImageDraw.Draw(ov)
    cap_mode = T_CAPPANEL <= t < T_PANEL_BACK
    if cap_mode:
        y1 = y0 + 80 + 4*190
        d.rounded_rectangle((x0, y0, x1, y1), 30, fill=th['bg']+(int(a*.96),), outline=th['bd']+(a,), width=2)
        d.text((x0+22, y0+44), 'Caption style', font=F(INTER_M, 28), anchor='lm', fill=th['tx']+(a,))
        st = caption_style(t)
        names = ['Plain', 'Meme', 'Editorial', 'Bold Pop']
        for i in range(4):
            ap = clamp((t - T_CAPPANEL - i*.08)/.25)
            if ap <= 0: continue
            bx0, by0 = x0+20, y0+84+i*190; bx1, by1 = x1-20, by0+130
            sel = (st == i+1)
            d.rounded_rectangle((bx0, by0, bx1, by1), 18, fill=(28, 28, 34, int(a*ap)),
                                outline=((92, 110, 255) if sel else th['bd'])+(int(a*ap),), width=4 if sel else 2)
            cap_draw(d, ['Aa', 'next'], 1, (bx0+bx1)/2, (by0+by1)/2, 300, i+1, int(a*ap), scale=.95)
            d.text((bx0+4, by1+22), names[i], font=F(INTER, 20), anchor='lm', fill=th['sub']+(int(a*ap),))
            if t >= T_LOCK and i == 3:
                ck = back((t-T_LOCK)/.35)
                r = 18*ck
                d.ellipse((bx1-14-r, by1-14-r, bx1-14+r, by1-14+r), fill=(70, 190, 100, a))
                if ck > .5: d.line((bx1-24, by1-14, bx1-17, by1-7, bx1-5, by1-22), fill=(255, 255, 255, a), width=4)
    else:
        L = layers_list(t)
        y1 = y0 + 84 + len(L)*76
        d.rounded_rectangle((x0, y0, x1, y1), 30, fill=th['bg']+(int(a*.96),), outline=th['bd']+(a,), width=2)
        d.text((x0+22, y0+44), 'Layers', font=F(INTER_M, 28), anchor='lm', fill=th['tx']+(a,))
        for i, name in enumerate(L):
            ry = y0 + 84 + i*76
            d.rounded_rectangle((x0+14, ry, x1-14, ry+62), 16, fill=th['row']+(a,))
            c = LAYER_COL[name]
            d.rounded_rectangle((x0+28, ry+19, x0+52, ry+43), 6, fill=c+(a,))
            d.text((x0+66, ry+31), name, font=F(INTER, 25), anchor='lm', fill=th['tx']+(a,))

def draw_timeline(ov, t):
    if t < T_TL[0] or t > T_WIDE[1]: return
    kin = back((t - T_TL[0])/.5); kout = 1 - ease((t - T_WIDE[0])/.5) if t > T_WIDE[0] else 1
    k = min(clamp(kin, 0, 1.2), kout); a = int(255*clamp(k))
    dy = (1-k)*340
    th = panel_theme(t)
    x0, y0, x1, y1 = 48, 1590+dy, 1032, 1878+dy
    d = ImageDraw.Draw(ov)
    d.rounded_rectangle((x0, y0, x1, y1), 30, fill=th['bg']+(int(a*.96),), outline=th['bd']+(a,), width=2)
    tx0, tx1 = x0+130, x1-34
    fm = F(MONO, 20)
    for i in range(5):
        xx_ = tx0 + i*(tx1-tx0)/5
        d.text((xx_, y0+24), f'|00:{int(i*DUR/5):02d}', font=fm, anchor='lm', fill=th['sub']+(a,))
    for lab, yy_ in (('V1', 82), ('A1', 172), ('T1', 250)):
        d.text((x0+26, y0+yy_), lab, font=F(INTER, 24), anchor='lm', fill=th['sub']+(a,))
    # thumbs
    tw = (tx1-tx0)/10
    for i, im in enumerate(thumbs):
        tile = im.resize((int(tw)-3, 78)).convert('RGBA'); tile.putalpha(a)
        ov.alpha_composite(tile, (int(tx0+i*tw), int(y0+44)))
    # waveform
    bw = (tx1-tx0)/NB
    for i, v in enumerate(env):
        h_ = 4 + v*44; cx_ = tx0 + i*bw + bw/2
        d.line((cx_, y0+172-h_/2, cx_, y0+172+h_/2), fill=(44, 168, 138, a), width=max(2, int(bw*.5)))
    # caption blocks (all caption chunks)
    for s, e, c in HOOK_CH + B_CH + CTA_CH:
        bx0 = tx0 + s/DUR*(tx1-tx0); bx1 = tx0 + min(e, DUR)/DUR*(tx1-tx0)
        if bx1 - bx0 > 6: d.rounded_rectangle((bx0, y0+232, bx1-3, y0+268), 8, fill=(200, 112, 74, a))
    ph = tx0 + t/DUR*(tx1-tx0)
    d.line((ph, y0+12, ph, y1-14), fill=(232, 64, 52, a), width=3)

def draw_pill(ov, t):
    if t < T_PILL: return
    k = back((t-T_PILL)/.4); a = int(255*clamp((t-T_PILL)/.15))
    d = ImageDraw.Draw(ov)
    f1, f2 = F(INTER_M, int(44*k)+1), F(ARCH, int(44*k)+1)
    w1, w2 = text_w(f1, 'Hit'), text_w(f2, 'SUBSCRIBE')
    tot = w1 + 20 + w2 + 36
    cx, cy = 540, 1712
    x0 = cx - tot/2 - 30
    d.rounded_rectangle((x0, cy-48*k, cx+tot/2+30, cy+48*k), int(48*k), fill=(255, 255, 255, a))
    d.text((x0+30, cy), 'Hit', font=f1, anchor='lm', fill=(30, 30, 30, a))
    bx = x0+30+w1+20
    d.rounded_rectangle((bx, cy-34*k, bx+w2+36, cy+34*k), int(14*k), fill=ORANGE+(a,))
    d.text((bx+18, cy+2), 'SUBSCRIBE', font=f2, anchor='lm', fill=(255, 255, 255, a))

# ---------- frame render ----------
def render(t, fr):
    bg = background(t, fr)
    x, y, w, vh, chrome = win(t)
    x, y, w, vh = int(round(x)), int(round(y)), int(round(w)), int(round(vh))
    tb = int(round(TB*chrome)); hh = tb + vh
    rad = int(36*chrome)
    canvas = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).convert('RGBA')
    if chrome > 0.02:   # drop shadow
        sm = Image.new('L', (W//4, H//4), 0)
        ImageDraw.Draw(sm).rounded_rectangle((x//4, (y+18)//4, (x+w)//4, (y+hh+18)//4), rad//4, fill=int(150*chrome))
        sm = sm.filter(ImageFilter.GaussianBlur(10)).resize((W, H), Image.BILINEAR)
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(sm)
        canvas.alpha_composite(sh)
    win_im = Image.new('RGBA', (w, hh), (24, 22, 26, 255))
    vid = Image.fromarray(video_crop(fr, w, vh)).convert('RGBA')
    win_im.paste(vid, (0, tb))
    wd = ImageDraw.Draw(win_im)
    if tb > 2:
        a = int(255*chrome)
        wd.rectangle((0, 0, w, tb), fill=(30, 28, 32, 255))
        for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
            wd.ellipse((26+i*30-9, tb/2-9, 26+i*30+9, tb/2+9), fill=c+(a,))
        wd.text((w/2, tb/2), 'talkinghead.mp4', font=F(INTER, 24), anchor='mm', fill=(235, 235, 235, a))
    # captions inside window
    vcx, vcy = w/2, tb + vh*.76
    ch = None
    if t < HOOK_END:
        ch = current_chunk(HOOK_CH, t); style = 4
    elif t < T_END[0]:
        style = caption_style(t)
        if style: ch = current_chunk(B_CH, t)
    else:
        ch = current_chunk(CTA_CH, t); style = 4; vcy = tb + vh*.74
    if ch:
        words, act, s0 = ch
        pop = back((t-s0)/.18)
        ov_w = Image.new('RGBA', (w, hh), (0, 0, 0, 0))
        cap_draw(ImageDraw.Draw(ov_w), words, act, vcx, vcy, w, style, 255, scale=.86+.14*pop)
        win_im.alpha_composite(ov_w)
    mask = rr_mask(w, hh, rad) if rad > 0 else Image.new('L', (w, hh), 255)
    if rad > 0:
        bd = ImageDraw.Draw(win_im)
        bd.rounded_rectangle((0, 0, w-1, hh-1), rad, outline=(214, 214, 220, int(255*chrome)), width=3)
    canvas.paste(win_im, (x, y), mask)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw_timeline(ov, t); draw_panel(ov, t, (x, y, w, hh)); draw_terminal(ov, t); draw_pill(ov, t)
    canvas.alpha_composite(ov)
    return canvas.convert('RGB')

def frames():
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = SW*SH*3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(SH, SW, 3)

if STILLS:
    want = {int(round(s*FPS)): s for s in STILLS}
    for i, fr in enumerate(frames()):
        if i in want:
            render(i/FPS, fr).save(os.path.join(B, f'still_{want[i]:05.2f}.png'))
        if i > max(want): break
    sys.exit()

enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-i', SRC, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
for i, fr in enumerate(frames()):
    enc.stdin.write(render(i/FPS, fr).tobytes())
    if i % 150 == 0: print('frame', i, '/', nfr, flush=True)
enc.stdin.close(); enc.wait()
print('done', OUT)
