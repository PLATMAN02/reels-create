// Motion graphics kit for the 2D styles (Inside Out, Stick Story, Paper Atlas). Opt-in: nothing here runs unless a shot
// or buildShots() asks for it. Every helper is a pure function of time (no Math.random, no state between frames).
// Distilled from the kinetic-type / data / illustrated motion libraries: word slams, highlighter swipes, strikes,
// hand-drawn circles and arrows, rolling counters, wobble and blink, plus the camera kicks and cut transitions that
// main.js applies (see TRANSITIONS below and references/motion-vocabulary.md).
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rnd, bigText } from './lib.js';

// ───────── easing extras ─────────
export const outExpo = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u));
export const inExpo = (u) => (u <= 0 ? 0 : Math.pow(2, 10 * u - 10));
/** smooth deterministic noise in about -1..1 (sum of sines), for shake and hand-drawn wobble */
export const nz = (x, s = 0) => Math.sin(x * 1.7 + s) * 0.5 + Math.sin(x * 2.9 + s * 1.3) * 0.3 + Math.sin(x * 5.3 + s * 2.1) * 0.2;

// ───────── camera kicks (applied by main.js from buildShots' `kicks`) ─────────
/** kicks: [{ t, a (zoom add, 0.03-0.12), shake (px, 0-20), k (decay) }] at FILM time. Returns { z, dx, dy, rot }. */
export function kickCam(t, kicks) {
  let z = 1, dx = 0, dy = 0, rot = 0;
  for (const k of kicks || []) {
    const d = t - k.t; if (d < 0 || d > 1.6) continue;
    const e = d < 0.06 ? eo(d / 0.06) : Math.exp(-(d - 0.06) * (k.k || 2.6));
    z += (k.a || 0) * e;
    if (k.shake) { const s = k.shake * Math.exp(-d * 8); dx += s * nz(t * 34, k.t * 5); dy += s * nz(t * 37, k.t * 3 + 1); rot += s * 0.0015 * nz(t * 26, k.t); }
  }
  return { z, dx, dy, rot };
}

// ───────── kinetic type ─────────
/** a word or phrase SLAMS in at lt = t0: big and blurred, settling with an expo ease. Outlined like captions. */
export function slamText(text, x, y, size, lt, t0, o = {}) {
  if (lt < t0) return;
  const u = seg(lt, t0, t0 + (o.dur || 0.22)), e = outExpo(u), s = lerp(o.from || 1.45, 1, e);
  ctx.save(); ctx.globalAlpha = (o.alpha ?? 1) * Math.min(1, u * 3.5);
  const b = (1 - e) * (o.blur ?? 10); if (u < 1 && b > 0.5) ctx.filter = `blur(${b.toFixed(1)}px)`;
  bigText(text, x, y, size, o.color || C.white, o.rot || 0, s);
  ctx.restore();
}
/** words of a line slam in one by one (stagger s apart), centred on x. Returns nothing. */
export function slamWords(words, x, y, size, lt, t0, stagger = 0.12, o = {}) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; const gap = size * 0.28;
  const ws = words.map((w) => ({ w, wd: ctx.measureText(w.replace('*', '')).width })); ctx.restore();
  let cx = x - (ws.reduce((a, b) => a + b.wd, 0) + gap * (ws.length - 1)) / 2;
  ws.forEach((it, i) => { const hi = it.w.startsWith('*'); slamText(it.w.replace('*', ''), cx + it.wd / 2, y, size, lt, t0 + i * stagger, { ...o, color: hi ? C.yellow : o.color }); cx += it.wd + gap; });
}
/** highlighter swipe behind a box (x, y, w, h) drawn on over [t0, t0 + dur]; rough hand-made edges */
export function swipe(x, y, w, h, lt, t0, dur = 0.3, color = C.yellow, seed = 1) {
  const p = eo(seg(lt, t0, t0 + dur)); if (p <= 0) return;
  const j = (k, a) => (rnd(seed * 7 + k) - 0.5) * a;
  ctx.beginPath(); ctx.moveTo(x + j(1, 8), y + j(2, 6)); ctx.lineTo(x + w * p, y + j(3, 6));
  ctx.lineTo(x + w * p + j(4, 6), y + h + j(5, 6)); ctx.lineTo(x + j(6, 8), y + h + j(7, 6)); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}
/** red strike-through drawn on from x0 to x1 at y (p = progress 0..1) */
export function strike(x0, x1, y, p, col = C.red, w = 18, tilt = -0.03) {
  if (p <= 0) return; const x = lerp(x0, x1, eo(clamp(p)));
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = w + 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x, y + (x - x0) * tilt); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
}
/** hand-drawn loop around a thing, drawn on to progress p */
export function scribble(cx, cy, rx, ry, p, col = C.red, w = 14, seed = 3) {
  if (p <= 0) return; const N = 96, m = Math.max(2, Math.ceil(N * clamp(p))), a0 = -2.4, turns = 1.1;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i <= m; i++) { const u = i / N, a = a0 + u * turns * Math.PI * 2, k = 1 + 0.07 * nz(u * 5, seed) + 0.05 * u;
    const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.restore();
}
/** hand-drawn curved arrow from p0 via control q to p1, drawn on to progress p; head appears at the end */
export function handArrow(p0, q, p1, p, col = C.ink, w = 12) {
  if (p <= 0) return; const N = 30, m = Math.max(2, Math.round(N * clamp(p))), pts = [];
  for (let i = 0; i <= m; i++) { const u = i / N, v = 1 - u; pts.push([v * v * p0[0] + 2 * v * u * q[0] + u * u * p1[0], v * v * p0[1] + 2 * v * u * q[1] + u * u * p1[1]]); }
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.stroke();
  if (p >= 0.92) { const a = pts[pts.length - 1], b = pts[Math.max(0, pts.length - 4)], an = Math.atan2(a[1] - b[1], a[0] - b[0]), hl = w * 2.2;
    ctx.beginPath(); ctx.moveTo(a[0] - Math.cos(an - 0.55) * hl, a[1] - Math.sin(an - 0.55) * hl); ctx.lineTo(a[0], a[1]); ctx.lineTo(a[0] - Math.cos(an + 0.55) * hl, a[1] - Math.sin(an + 0.55) * hl); ctx.stroke(); }
  ctx.restore();
}

// ───────── numbers ─────────
/** rolling counter value: from → to over [t0, t1] with an expo ease, rounded to step */
export const countAt = (lt, t0, t1, from, to, step = 1) => Math.round(lerp(from, to, outExpo(seg(lt, t0, t1))) / step) * step;
export const fmt = (n, pre = '', suf = '') => pre + Math.round(n).toLocaleString('en-US') + suf;
/** a counter that rolls then LOCKS with a scale bump at t1. Pair with a kick + flash + 'slam' cue at t1. */
export function counter(x, y, size, lt, t0, t1, from, to, o = {}) {
  if (lt < t0) return;
  const v = countAt(lt, t0, t1, from, to, o.step || 1), bump = lt > t1 ? 1 + 0.18 * Math.exp(-(lt - t1) * 9) * Math.cos((lt - t1) * 18) : 1;
  bigText(fmt(v, o.pre, o.suf), x, y, size, o.color || C.white, 0, bump);
}

// ───────── life ─────────
/** decaying jiggle after a landing at a (multiply into a scale or rotation) */
export const wobble = (lt, a, amp = 0.13) => (lt < a ? 0 : Math.exp(-(lt - a) * 6) * Math.sin((lt - a) * 20) * amp);
/** 0..1 eye-blink amount (pass to an eye's vertical scale as 1 - blink) */
export const blink = (lt, off = 0, period = 3.2) => { const p = (lt + off) % period; return p < 0.13 ? Math.sin(Math.PI * p / 0.13) : 0; };
/** squash and stretch on landing at a: returns [sx, sy] */
export const squash = (lt, a, amt = 0.22) => { if (lt < a) return [1, 1]; const e = Math.exp(-(lt - a) * 7) * Math.cos((lt - a) * 22) * amt; return [1 + e, 1 - e]; };

// ───────── finishing (applied by main.js from buildShots' `flashes` / `leaks`) ─────────
export function finishing(t, flashes, leaks) {
  for (const t0 of leaks || []) { const u = seg(t, t0, t0 + 0.95); if (u <= 0 || u >= 1) continue; const e = Math.sin(Math.PI * u);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const x = lerp(-200, W + 200, eo(u)), g = ctx.createRadialGradient(x, 260, 0, x, 260, 1100);
    g.addColorStop(0, `rgba(255,170,60,${0.38 * e})`); g.addColorStop(0.45, `rgba(255,90,50,${0.14 * e})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  for (const f of flashes || []) { const d = t - f.t; if (d < 0 || d > 0.4 || !f.a) continue; ctx.fillStyle = `rgba(${f.col || '255,255,255'},${f.a * Math.exp(-d * 11)})`; ctx.fillRect(0, 0, W, H); }
}

// ───────── cut transitions (main.js composites two shots with these) ─────────
// shot.trans = { type, d, dir }:  'whip' | 'whipV' (motion-blurred pan, dir ±1) · 'glitch' (RGB split + slices)
// · 'flash' (white flash swap) · 'iris' (the new shot opens in a circle with a yellow ring) · 'zoom' (push through
// the old shot into the new one) · 'slide' (new shot pushes the old one off, no blur). d = 0.2-0.35 s.
const layers = {};
export function layer(name) { if (!layers[name]) { const c = document.createElement('canvas'); c.width = W; c.height = H; layers[name] = c; } return layers[name]; }
export function composite(main, A, B, tr, u) {
  const type = tr.type, dir = tr.dir || 1;
  main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = 1; main.globalCompositeOperation = 'source-over';
  if (type === 'whip' || type === 'whipV' || type === 'slide') {
    const e = eio(u), vert = type === 'whipV', D = vert ? H : W, blur = type === 'slide' ? 0 : Math.sin(Math.PI * u) * 220, N = blur ? 8 : 1;
    main.fillStyle = '#000'; main.fillRect(0, 0, W, H); main.globalCompositeOperation = 'lighter'; main.globalAlpha = 1 / N;
    for (let k = 0; k < N; k++) { const o = N > 1 ? (k / (N - 1) - 0.5) * blur : 0, oa = -e * D * dir + o, ob = (1 - e) * D * dir + o;
      if (vert) { main.drawImage(A, 0, oa); main.drawImage(B, 0, ob); } else { main.drawImage(A, oa, 0); main.drawImage(B, ob, 0); } }
  } else if (type === 'glitch') {
    const src = u < 0.5 ? A : B, fi = Math.floor(u * 40), off = (14 + rnd(fi) * 26) * Math.sin(Math.PI * u) * 1.6;
    const tint = (name, col) => { const L = layer(name), x = L.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.drawImage(src, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; return L; };
    main.fillStyle = '#000'; main.fillRect(0, 0, W, H); main.globalCompositeOperation = 'lighter';
    const pd = 60; main.drawImage(tint('_r', '#ff0000'), off - pd, -pd, W + 2 * pd, H + 2 * pd); main.drawImage(tint('_g', '#00ffff'), -off - pd, -pd, W + 2 * pd, H + 2 * pd);
    main.globalCompositeOperation = 'source-over';   // channels drawn oversized so no single-channel strip shows at the edges
    for (let k = 0; k < 9; k++) { const y = rnd(fi * 13 + k) * H, h = 10 + rnd(fi * 17 + k) * 90, dx = (rnd(fi * 19 + k) - 0.5) * 200 * Math.sin(Math.PI * u); main.drawImage(src, 0, y, W, h, dx, y, W, h); if (dx > 0) main.drawImage(src, 0, y, 1, h, 0, y, dx, h); else main.drawImage(src, W - 1, y, 1, h, W + dx, y, -dx, h); }
  } else if (type === 'flash') {
    main.drawImage(u < 0.5 ? A : B, 0, 0); main.fillStyle = `rgba(255,255,255,${0.92 * (1 - Math.abs(u * 2 - 1))})`; main.fillRect(0, 0, W, H);
  } else if (type === 'iris') {
    const r = Math.max(1, eio(u) * Math.hypot(W, H) * 0.56), cx = tr.x ?? W / 2, cy = tr.y ?? H * 0.42;
    main.drawImage(A, 0, 0); main.save(); main.beginPath(); main.arc(cx, cy, r, 0, Math.PI * 2); main.clip(); main.drawImage(B, 0, 0); main.restore();
    main.strokeStyle = C.yellow; main.lineWidth = 18; main.beginPath(); main.arc(cx, cy, r, 0, Math.PI * 2); main.stroke();
  } else if (type === 'zoom') {
    const e = eio(u), cx = tr.x ?? W / 2, cy = tr.y ?? H * 0.42;
    main.save(); main.translate(cx, cy); main.scale(lerp(1.35, 1, e), lerp(1.35, 1, e)); main.translate(-cx, -cy); main.drawImage(B, 0, 0); main.restore();
    main.save(); main.globalAlpha = 1 - eo(u); main.translate(cx, cy); main.scale(1 + 2.4 * inExpo(u), 1 + 2.4 * inExpo(u)); main.translate(-cx, -cy); main.drawImage(A, 0, 0); main.restore();
  } else main.drawImage(B, 0, 0);
  main.restore();
}
