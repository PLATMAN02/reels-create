// FLOW MOTION: the camera never cuts. Shared by all six styles (identical file in each style's src/core/).
// Every scene change is a hand-off inside the world: smoke fills the lens, something passes close to the lens, the camera
// flies through a hole or door, dives forward through the shot, or rides along with a carried object. main.js composites
// the two shots with wipe() during the hand-off; shots can also move the camera on a path (camAt) and grade the light
// from day to sunset to night (grade). Pure functions of time: no Math.random, no state between frames.
// Reference and rules: references/flow-motion.md.

export const W = 1080, H = 1920;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
export const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eo = (t) => 1 - Math.pow(1 - t, 3);
export const outExpo = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u));
export const inExpo = (u) => (u <= 0 ? 0 : Math.pow(2, 10 * u - 10));
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ───────── hand-off types ─────────
export const FLOW_TYPES = ['smoke', 'pass', 'portal', 'dive', 'carry'];
export const OVERLAY_TYPES = ['glitch', 'flash', 'iris'];          // graphic overlays: classic mode only
export const isFlow = (tr) => !!tr && FLOW_TYPES.includes(tr.type);
const DUR = { smoke: 0.5, pass: 0.36, portal: 0.44, dive: 0.34, carry: 0.42 };
export const dur = (tr) => tr.d ?? DUR[tr.type] ?? 0.28;

const layers = {};
export function layer(name) { if (!layers[name]) { const c = document.createElement('canvas'); c.width = W; c.height = H; layers[name] = c; } return layers[name]; }

/** composite outgoing shot A into incoming shot B on canvas context m, u = 0..1 through the hand-off */
export function wipe(m, A, B, tr, u) {
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.filter = 'none';
  const f = { smoke, pass, portal, dive, carry }[tr.type] || ((m, A, B) => m.drawImage(B, 0, 0));
  f(m, A, B, tr, clamp(u));
  m.restore();
}

// smoke / dust / steam / cloud fills the lens, then drifts apart on the new place.
// tr = { type:'smoke', x, y (where it billows from), col, shade, d }
function smoke(m, A, B, tr, u) {
  const ox = tr.x ?? W / 2, oy = tr.y ?? H * 0.52, col = tr.col || '#F2EEE6', sh = tr.shade || '#CFC7BA';
  const g = eo(clamp(u / 0.5)), drift = u > 0.5 ? eio((u - 0.5) / 0.5) : 0;
  m.drawImage(u < 0.5 ? A : B, 0, 0);
  const base = clamp((0.27 - Math.abs(u - 0.5)) / 0.15);                          // solid cover only around the swap
  if (base > 0) { m.globalAlpha = base; m.fillStyle = col; m.fillRect(0, 0, W, H); m.globalAlpha = 1; }
  for (let i = 0; i < 30; i++) {
    const a = rnd(i) * Math.PI * 2, D = 200 + rnd(i + 40) * 900, R = 220 + rnd(i + 80) * 420;
    const dist = D * g * 0.7 + drift * (900 + rnd(i + 7) * 700), r = R * g * (1 + drift * 0.35);
    const x = ox + Math.cos(a) * dist, y = oy + Math.sin(a) * dist * 1.25 - drift * 260;
    const al = 1 - clamp((drift - 0.35) / 0.65);
    if (r < 2 || al <= 0) continue;
    m.globalAlpha = al; m.fillStyle = sh; m.beginPath(); m.arc(x + r * 0.07, y + r * 0.1, r, 0, Math.PI * 2); m.fill();
    m.fillStyle = col; m.beginPath(); m.arc(x, y, r * 0.96, 0, Math.PI * 2); m.fill();
  }
  m.globalAlpha = 1;
}

// something close to the lens sweeps across (a post, a hull, a wall edge, leaves, a passer-by); the new place is behind it.
// tr = { type:'pass', dir: ±1 (screen direction it moves), axis: 'x'|'y', shape: 'post'|'hull'|'foliage'|'wall', col, w, d }
function pass(m, A, B, tr, u) {
  const dir = tr.dir || 1, vert = tr.axis === 'y', L = vert ? H : W, w = tr.w ?? (vert ? 900 : 640), e = eio(u);
  const s = lerp(-w / 2, L + w / 2, e), sc = dir > 0 ? s : L - s;                 // centre of the passing shape
  const par = 170, oa = dir * par * e, ob = -dir * par * (1 - e);                  // background parallax (slower than the shape)
  const draw = (img, off) => (vert ? m.drawImage(img, 0, off) : m.drawImage(img, off, 0));
  // behind the shape (already passed) = B, ahead of it = A
  m.save(); m.beginPath(); if (vert) (dir > 0 ? m.rect(0, 0, W, sc) : m.rect(0, sc, W, H)); else (dir > 0 ? m.rect(0, 0, sc, H) : m.rect(sc, 0, W, H)); m.clip(); draw(B, ob); m.restore();
  m.save(); m.beginPath(); if (vert) (dir > 0 ? m.rect(0, sc, W, H) : m.rect(0, 0, W, sc)); else (dir > 0 ? m.rect(sc, 0, W, H) : m.rect(0, 0, sc, H)); m.clip(); draw(A, oa); m.restore();
  const blur = Math.sin(Math.PI * u) * 60, N = 5;
  for (let k = 0; k < N; k++) { m.globalAlpha = k === N - 1 ? 1 : 0.22; occluder(m, sc - dir * blur * (1 - k / (N - 1)), w, vert, tr); }
  m.globalAlpha = 1;
}
function occluder(m, c, w, vert, tr) {
  const shape = tr.shape || 'post', col = tr.col || (shape === 'hull' ? '#5C3B26' : shape === 'foliage' ? '#3F6B3A' : '#1C1C22');
  const x0 = c - w / 2, len = vert ? W : H;                                         // bar across the frame, thickness w
  const bar = (o, th, style) => { m.fillStyle = style; vert ? m.fillRect(-40, x0 + o, W + 80, th) : m.fillRect(x0 + o, -40, th, H + 80); };
  if (shape === 'foliage') { m.fillStyle = col; for (let i = 0; i < 14; i++) { const along = (i / 13) * len, r = w * (0.38 + rnd(i) * 0.25), off = c + (rnd(i + 3) - 0.5) * w * 0.5;
    m.beginPath(); vert ? m.arc(along, off, r, 0, Math.PI * 2) : m.arc(off, along, r, 0, Math.PI * 2); m.fill(); } return; }
  bar(0, w, col); bar(w * 0.12, w * 0.08, 'rgba(255,255,255,0.10)'); bar(w * 0.82, w * 0.18, 'rgba(0,0,0,0.25)');
  if (shape === 'hull' || shape === 'wall') { m.strokeStyle = 'rgba(0,0,0,0.28)'; m.lineWidth = 6; const step = shape === 'hull' ? 130 : 90;
    for (let q = 60; q < len; q += step) { m.beginPath(); if (vert) { m.moveTo(q, x0); m.lineTo(q, x0 + w); } else { m.moveTo(x0, q); m.lineTo(x0 + w, q); } m.stroke(); } }
}

// fly through a hole, door, window, porthole, mouth, barrel: the hole grows to fill the lens with the new place inside.
// tr = { type:'portal', x, y, r (start radius), hole: 'circle'|'rect', aspect (w/h for rect), edge: 'splinter'|'frame'|'none', col, d }
function portal(m, A, B, tr, u) {
  const x = tr.x ?? W / 2, y = tr.y ?? H * 0.45, r0 = tr.r ?? 110, e = inExpo(u) * 0.85 + u * 0.15;
  const sA = 1 + e * 9, r = r0 * sA;
  m.save(); m.translate(x, y); m.scale(sA, sA); m.translate(-x, -y); m.drawImage(A, 0, 0); m.restore();
  const asp = tr.aspect ?? 0.62, rect = tr.hole === 'rect';
  const path = () => { m.beginPath(); if (rect) { const hw = r * asp, hh = r; m.rect(x - hw, y - hh, hw * 2, hh * 2); } else if (tr.edge === 'splinter') { for (let k = 0; k <= 18; k++) { const a = k / 18 * Math.PI * 2, rr = r * (0.82 + rnd(k) * 0.3); k ? m.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : m.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } m.closePath(); } else m.arc(x, y, r, 0, Math.PI * 2); };
  const sB = lerp(0.6, 1, eio(u)), bx = lerp(x, W / 2, eio(u)), by = lerp(y, H / 2, eio(u));
  m.save(); path(); m.clip(); m.translate(bx, by); m.scale(sB, sB); m.translate(-W / 2, -H / 2); m.drawImage(B, 0, 0); m.restore();
  if (tr.edge !== 'none') { path(); m.lineWidth = Math.max(6, r * 0.08); m.strokeStyle = tr.col || (tr.edge === 'splinter' ? '#6B4A34' : '#1C1C22'); m.stroke(); }
}

// dolly forward THROUGH the shot into the next one (keeps forward speed: no fade-to-black, no flash).
// tr = { type:'dive', x, y (vanishing point), d }
function dive(m, A, B, tr, u) {
  const x = tr.x ?? W / 2, y = tr.y ?? H * 0.45;
  const sA = 1 + 3.2 * inExpo(clamp(u * 1.25)), sB = lerp(1.5, 1, outExpo(clamp((u - 0.3) / 0.7)));
  m.save(); m.translate(x, y); m.scale(sB, sB); m.translate(-x, -y); m.drawImage(B, 0, 0); m.restore();
  const aA = 1 - eo(clamp((u - 0.2) / 0.3));            // the old shot blows past the lens fast: no lingering double image
  for (let k = 0; k < 2; k++) { m.save(); m.globalAlpha = aA * (k ? 0.25 : 1); const s = sA * (1 + k * 0.05 * Math.sin(Math.PI * u)); m.translate(x, y); m.scale(s, s); m.translate(-x, -y); m.drawImage(A, 0, 0); m.restore(); }
  streaks(m, Math.sin(Math.PI * u), { mode: 'radial', x, y, t: u * 3 });
}

// the camera rides along with a carried object (coin, ball, letter, bird) from one place to the next.
// tr = { type:'carry', dir: ±1, axis:'x'|'y', carry(ctx, u): draws the object in SCREEN space, d }
function carry(m, A, B, tr, u) {
  const dir = tr.dir || 1, vert = tr.axis === 'y', L = vert ? H : W, e = eio(u), blur = Math.sin(Math.PI * u) * (vert ? 50 : 80), N = 5;
  m.fillStyle = '#000'; m.fillRect(0, 0, W, H); m.globalCompositeOperation = 'lighter'; m.globalAlpha = 1 / N;
  for (let k = 0; k < N; k++) { const o = (k / (N - 1) - 0.5) * blur, oa = -e * L * dir + o, ob = (1 - e) * L * dir + o;
    if (vert) { m.drawImage(A, 0, oa); m.drawImage(B, 0, ob); } else { m.drawImage(A, oa, 0); m.drawImage(B, ob, 0); } }
  m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
  streaks(m, Math.sin(Math.PI * u) * 0.8, { mode: vert ? 'y' : 'x', t: u * 4 });
  if (tr.carry) { m.save(); tr.carry(m, u); m.restore(); }
}

// ───────── helpers for shots ─────────
/** speed streaks. o = { mode: 'radial'|'x'|'y', x, y, t, col, n } (amt 0..1) */
export function streaks(m, amt, o = {}) {
  if (amt <= 0.02) return; const n = o.n || 26, col = o.col || '255,255,255';
  m.save(); m.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const p = (rnd(i) + (o.t || 0) * (0.6 + rnd(i + 9))) % 1, w = 3 + rnd(i + 3) * 6; m.strokeStyle = `rgba(${col},${(0.15 + 0.35 * rnd(i + 5)) * amt})`; m.lineWidth = w; m.beginPath();
    if (o.mode === 'x' || o.mode === 'y') { const a = rnd(i + 11) * (o.mode === 'x' ? H : W), b = p * (o.mode === 'x' ? W : H), len = 120 + 260 * amt;
      if (o.mode === 'x') { m.moveTo(b, a); m.lineTo(b - len, a); } else { m.moveTo(a, b); m.lineTo(a, b - len); } }
    else { const ang = rnd(i + 21) * Math.PI * 2, r1 = 260 + p * 900, r2 = r1 + 140 + 320 * amt, x = o.x ?? W / 2, y = o.y ?? H * 0.45; m.moveTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1); m.lineTo(x + Math.cos(ang) * r2, y + Math.sin(ang) * r2); }
    m.stroke();
  }
  m.restore();
}
/** 2D camera path: keys [{ t (s into the shot), x, y, z }] → { x, y, z } with eased travel between keys (no linear moves) */
export function camAt(keys, lt) {
  if (typeof keys === 'function') return keys(lt);
  if (lt <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (lt <= b.t) { const k = eio((lt - a.t) / ((b.t - a.t) || 1e-6)); return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z ?? 1, b.z ?? 1, k) }; } }
  return keys[keys.length - 1];
}
/** an arc between two screen points (thrown or fired objects follow arcs, never straight lines) */
export function arc(p0, p1, h, k) { return [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - Math.sin(Math.PI * k) * h]; }
/** time of day over the whole frame: 0 = midday, 0.5 = sunset, 1 = night. Let it progress with the story. */
export function grade(m, k) {
  if (!k || k <= 0) return; m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'multiply';
  const sun = clamp(k / 0.5), night = clamp((k - 0.5) / 0.5);
  m.fillStyle = `rgba(255,${Math.round(lerp(255, 178, sun))},${Math.round(lerp(255, 122, sun))},1)`; m.globalAlpha = 0.55 * sun * (1 - night * 0.6); m.fillRect(0, 0, W, H);
  if (night > 0) { m.fillStyle = '#3B4A8C'; m.globalAlpha = 0.6 * night; m.fillRect(0, 0, W, H); }
  m.globalCompositeOperation = 'screen'; if (sun > 0 && night < 1) { const gg = m.createLinearGradient(0, 0, 0, H * 0.6); gg.addColorStop(0, `rgba(255,150,80,${0.22 * sun * (1 - night)})`); gg.addColorStop(1, 'rgba(0,0,0,0)'); m.globalAlpha = 1; m.fillStyle = gg; m.fillRect(0, 0, W, H); }
  m.restore();
}

// ───────── enforcing flow on every cut ─────────
const AUTO = [
  { type: 'dive' },
  { type: 'pass', dir: 1, shape: 'post' },
  { type: 'smoke' },
  { type: 'pass', dir: -1, shape: 'wall' },
];
/** script.motion !== 'classic': every cut gets a flow hand-off. Missing or overlay transitions are replaced by an
 *  automatic world wipe (rotating, never the same twice) and reported, so the plan can design a real hand-off. */
export function enforce(shots, script, look = {}) {   // look = the style's defaults, e.g. { smoke: { col, shade } }
  const report = [];
  if (script?.motion === 'classic') return report;
  let k = 0, prev = null;
  shots.forEach((s, i) => {
    if (i === 0) return;
    const tr = s.trans;
    if (isFlow(tr)) { if (prev && prev.type === tr.type && prev.dir === tr.dir && prev.shape === tr.shape) report.push(`${s.id}: same hand-off as the cut before (${tr.type}); vary it`); prev = tr; return; }
    const why = !tr ? 'hard cut' : OVERLAY_TYPES.includes(tr.type) ? `overlay "${tr.type}"` : null;
    if (!why) { report.push(`${s.id}: camera move "${tr.type}" kept; prefer a world hand-off (carry/pass/portal)`); prev = tr; return; }
    let a = AUTO[k++ % AUTO.length]; if (prev && a.type === prev.type) a = AUTO[k++ % AUTO.length];
    s.trans = { ...a, ...(look[a.type] || {}), auto: true }; prev = s.trans;
    report.push(`${s.id}: ${why} → auto ${a.type}${a.shape ? ' (' + a.shape + ')' : ''}; design a real hand-off`);
  });
  return report;
}
