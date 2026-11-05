// Boot: fonts → script + timing → 3D engine + sets → captions → shots. draw(t) renders film time t (pure function of t):
// the shot renders its 3D frame into the hidden WebGL canvas, which is copied onto the 2D canvas, then the 2D layer
// (labels, counters) and the captions go on top. window.OP is the API tools/capture.mjs drives.
import { W, H, setCtx, ctx, clamp } from './core/lib.js';
import { T, loadTiming } from './core/timing.js';
import { buildCaptions, drawCaption, captionList, captionBox } from './core/captions.js';
import * as THREE from 'three';
import { makeEngine, RES, AA } from './core/engine.js';
import * as FLOW from './core/flow.js';
import { buildShots } from './shots.js';

const cv = document.getElementById('cv'), GL = document.getElementById('gl');
const MAIN = cv.getContext('2d'); setCtx(MAIN);
const OP = (window.OP = { ready: false });

/** paint shot i at film time t into context c (the shot renders its 3D frame, blits it, adds its 2D layer). Pure. */
function paint(i, t, c) {
  const S = OP._shots, sh = S[i], end = i < S.length - 1 ? S[i + 1].at : T.dur, d = end - sh.at, lt = t - sh.at;
  setCtx(c); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.letterSpacing = '0px'; c.filter = 'none'; c.globalCompositeOperation = 'source-over';
  if (c !== MAIN) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); }
  const blit = () => ctx.drawImage(GL, 0, 0, W, H);
  c.save(); sh.draw(lt, d, t, blit); c.restore();
  if (sh.tod != null) FLOW.grade(c, typeof sh.tod === 'function' ? sh.tod(lt, d) : sh.tod);   // day → sunset → night
  setCtx(MAIN);
}
/** which flow hand-off is running at t: a shot's `trans` is centred on its cut (half before, half after) */
function transAt(t, i) {
  const S = OP._shots, nx = S[i + 1], cur = S[i];
  if (nx?.trans) { const d = FLOW.dur(nx.trans); if (t >= nx.at - d / 2) return { a: i, b: i + 1, tr: nx.trans, u: (t - (nx.at - d / 2)) / d }; }
  if (i > 0 && cur.trans) { const d = FLOW.dur(cur.trans); if (t < cur.at + d / 2) return { a: i - 1, b: i, tr: cur.trans, u: (t - (cur.at - d / 2)) / d }; }
  return null;
}

function draw(t) {
  t = clamp(t, 0, T.dur - 1e-4); window.__AUD = []; window.__OVL = [];
  const S = OP._shots; let i = S.length - 1; while (i > 0 && S[i].at > t) i--;
  const X = transAt(t, i);
  OP._inTrans = !!X;
  if (X) { const A = FLOW.layer('_a'), B = FLOW.layer('_b'); paint(X.a, t, A.getContext('2d')); paint(X.b, t, B.getContext('2d')); FLOW.wipe(MAIN, A, B, X.tr, clamp(X.u)); }
  else paint(i, t, MAIN);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
  const fade = OP.script?.fade === false ? 1 : Math.min(clamp(t / 0.25), clamp((T.dur - t) / 0.4));
  if (fade < 1) { ctx.fillStyle = '#000'; ctx.globalAlpha = 1 - fade; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (OP.script?.captions !== false) drawCaption(t);
  if (DBG) { ctx.save(); ctx.lineWidth = 6; for (const b of subjectBoxes()) { ctx.strokeStyle = '#00FF66'; ctx.strokeRect(b.box[0], b.box[1], b.box[2] - b.box[0], b.box[3] - b.box[1]); if (b.head) { ctx.strokeStyle = '#FF00CC'; ctx.strokeRect(b.head[0], b.head[1], b.head[2] - b.head[0], b.head[3] - b.head[1]); } ctx.fillStyle = '#00FF66'; ctx.font = '700 40px sans-serif'; ctx.fillText(b.name, b.box[0] + 8, b.box[1] + 44); } ctx.restore(); }
}
const DBG = new URLSearchParams(location.search).has('dbg'); window.__FITLOG = new URLSearchParams(location.search).has('fitlog');

(async () => {
  try {
    await document.fonts.load('900 100px Inter'); await document.fonts.load('800 100px Inter');
    const script = await (await fetch('script.json', { cache: 'no-store' })).json();
    await loadTiming();
    if (script.captions !== false) buildCaptions(script);
    GL.width = Math.round(1080 * RES); GL.height = Math.round(1920 * RES);
    const E = makeEngine(GL, { w: GL.width, h: GL.height, samples: AA });
    const { shots, cues } = buildShots(E);
    shots.sort((a, b) => a.at - b.at);
    const flowReport = FLOW.enforce(shots, script);   // every cut becomes a world hand-off unless script.motion === 'classic'
    OP._shots = shots; OP.script = script;
    OP.flow = () => flowReport;
    OP.duration = () => T.dur;
    OP.draw = draw;
    OP.frame = (t, q = 0.92) => { draw(t); return cv.toDataURL('image/jpeg', q); };
    OP.shots = () => shots.map((s, i) => ({ id: s.id, at: +s.at.toFixed(3), end: +(i < shots.length - 1 ? shots[i + 1].at : T.dur).toFixed(3), note: s.note || '' }));
    OP.captions = () => captionList().map((c) => ({ s: +c.s.toFixed(3), e: +c.e.toFixed(3), text: c.words.map((w) => (w.hi ? '*' : '') + w.txt).join(' ') }));
    OP.cues = () => cues.slice().sort((a, b) => a.t - b.t);
    OP.auditFrame = auditFrame;
    OP.ready = true;
    const q = new URLSearchParams(location.search);
    if (!q.has('capture')) {
      if (q.has('t')) draw(+q.get('t'));
      else {
        const audio = new Audio('data/mix.wav'); let t0 = null; const btn = document.getElementById('play'); btn.hidden = false;
        btn.onclick = () => { btn.hidden = true; t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
        const loop = (now) => { const t = t0 == null ? 0 : (now - t0) / 1000; draw(t); if (t0 != null && t > T.dur) { t0 = null; btn.hidden = false; } requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
      }
    }
  } catch (e) { OP.bootError = String(e && e.stack || e); console.error(e); }
})();

// ───────── the every-frame audit (tools/capture.mjs audit) ─────────
// For one frame: a small thumbnail, how much the picture changed since the previous audited frame, and framing issues:
// a key character (Toon with key3d) cut by the frame edge, a head cut in a close-up, a caption over a face.
const AUD = { prev: null, small: null };
function subjectBoxes() {
  // EXACT screen boxes of everything that matters: every key Toon (body + head incl. hat, from its real cut-out plane) and
  // every object marked as a subject (obj.userData.subject = 'name': a prop, a sign, an animal, a scoreboard).
  const out = [], v = new THREE.Vector3(), seen = new Set();
  const visible = (o) => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
  for (const e of window.__AUD || []) {
    const proj = (pt) => { v.copy(pt).project(e.cam); return [(v.x + 1) / 2 * 1080, (1 - v.y) / 2 * 1920, v.z]; };
    const rect = (ps) => (ps.some((q) => q[2] > 1 || q[2] < -1) ? null : [Math.min(...ps.map((q) => q[0])), Math.min(...ps.map((q) => q[1])), Math.max(...ps.map((q) => q[0])), Math.max(...ps.map((q) => q[1]))]);
    for (const p of e.people) {
      if (!p.look || seen.has(p) || !visible(p.group)) continue; seen.add(p);
      p.mesh.updateWorldMatrix(true, false);
      const H = p.H, cw = 512 + 2 * (p.padX || 0), Wd = (H / 2) * (cw / 512), top = H - H * (24 / 1024), st = p.st || {};
      const hy = 178 + (p.look.kid ? 190 : 0) + (st.legs === 'sit' ? 210 : 0), hatH = p.look.hat === 'tophat' ? 150 : p.look.hat && p.look.hat !== 'none' ? 95 : 10;
      const px = (x, y) => proj(new THREE.Vector3(-Wd / 2 + (x / cw) * Wd, top - (y / 1024) * H, 0).applyMatrix4(p.mesh.matrixWorld));
      const box = (x0, y0, x1, y1) => rect([px(x0, y0), px(x1, y0), px(x0, y1), px(x1, y1)]);
      const cx = (p.padX || 0) + 256, b = box(cx - 130, Math.max(0, hy - 138 - hatH), cx + 130, 1000), h = box(cx - 145, Math.max(0, hy - 138 - hatH), cx + 145, hy + 138);
      if (b && (p.key3d || b[3] - b[1] > 1920 * 0.25)) out.push({ name: p.name || (p.key3d ? 'toon' : 'background person'), box: b, head: h, toon: true });
    }
    e.scene?.traverse((o) => {
      if (!o.userData?.subject || seen.has(o) || !visible(o)) return; seen.add(o);
      const bb = new THREE.Box3().setFromObject(o); if (bb.isEmpty()) return;
      const c = []; for (let i = 0; i < 8; i++) c.push(proj(new THREE.Vector3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z)));
      const r = rect(c); if (r) out.push({ name: o.userData.subject, box: r, head: null, toon: false });
    });
  }
  return out;
}
const inside = (b) => { const w = Math.max(0, Math.min(1080, b[2]) - Math.max(0, b[0])), h = Math.max(0, Math.min(1920, b[3]) - Math.max(0, b[1])); return (w * h) / Math.max(1, (b[2] - b[0]) * (b[3] - b[1])); };
const overlap = (a, b) => a && b && a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
function auditFrame(t) {
  draw(t);
  if (!AUD.small) { AUD.small = document.createElement('canvas'); AUD.small.width = 64; AUD.small.height = 114; AUD.thumb = document.createElement('canvas'); AUD.thumb.width = 216; AUD.thumb.height = 384; }
  const sc = AUD.small.getContext('2d', { willReadFrequently: true }); sc.drawImage(cv, 0, 0, 64, 114);
  const px = sc.getImageData(0, 0, 64, 114).data, g = new Float32Array(64 * 114); let lum = 0;
  for (let i = 0; i < g.length; i++) { g[i] = px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114; lum += g[i]; }
  let diff = 0; if (AUD.prev) { for (let i = 0; i < g.length; i++) diff += Math.abs(g[i] - AUD.prev[i]); diff /= g.length; } AUD.prev = g;
  const issues = [], cap = OP.script?.captions !== false ? captionBox(t) : null;
  if (!OP._inTrans) for (const s of subjectBoxes()) {
    // framing rule: a subject is fully in frame, or fully out. Only a person in a medium / close shot may be cropped at the
    // BOTTOM, and then the whole head (with the hat) must be inside. A prop is never cut by an edge.
    if (!s.toon && s.box[3] - s.box[1] < 1920 * 0.15 && s.box[2] - s.box[0] < 1080 * 0.2) continue;   // small, far props may sit at the edge
    const f = inside(s.box), fh = s.head ? inside(s.head) : 1, b = s.box, w = b[2] - b[0];
    const fx = Math.max(0, Math.min(1080, b[2]) - Math.max(0, b[0])) / Math.max(1, w);
    const cutTop = b[1] < -4, cutBottom = b[3] > 1924;
    if (f > 0.03) {
      if (fx < 0.95) issues.push(`${s.name}: sliced by the side of the frame (${Math.round(fx * 100)}% visible)`);
      else if (s.toon && fh < 0.98) issues.push(`${s.name}: head cut by the frame edge (${Math.round(fh * 100)}% visible)`);
      else if (!s.toon && (cutTop || cutBottom) && f < 0.95) issues.push(`${s.name}: cut by the ${cutTop ? 'top' : 'bottom'} of the frame (${Math.round(f * 100)}% visible)`);
      else if (s.toon && cutTop) issues.push(`${s.name}: head cut by the frame edge (top)`);
    }
    if (cap && s.head && fh > 0.5 && overlap(cap, s.head)) issues.push(`${s.name}: caption covers the face`);
    if (s.head && fh > 0.5) for (const o of window.__OVL || []) if (overlap(o.box, s.head)) issues.push(`${s.name}: ${o.name} covers the face`);
  }
  const tc = AUD.thumb.getContext('2d'); tc.drawImage(cv, 0, 0, 216, 384);
  if (issues.length) { tc.strokeStyle = '#FF2A2A'; tc.lineWidth = 8; tc.strokeRect(4, 4, 208, 376); }
  tc.fillStyle = 'rgba(0,0,0,0.65)'; tc.fillRect(0, 0, 92, 30); tc.fillStyle = '#fff'; tc.font = '700 22px sans-serif'; tc.fillText(t.toFixed(2), 6, 23);
  const S = OP._shots; let i = S.length - 1; while (i > 0 && S[i].at > t) i--;
  // how much the CAMERA and the CHARACTERS move (pixel change alone is fooled by rain, grain and flags)
  const e = (window.__AUD || []).slice(-1)[0], sb = subjectBoxes();
  let cam = null, rot = null, subj = 0;
  if (e) { const q = e.cam.quaternion.clone(), pp = e.cam.position.clone();
    if (AUD.cam && AUD.shot === S[i].id) {                       // view change in degrees: turning + moving relative to what it looks at
      const near = e.people.filter((p) => p.key3d && p.group.visible).map((p) => p.group.getWorldPosition(new THREE.Vector3()).distanceTo(pp)), dist = near.length ? Math.min(...near) : 6;
      cam = (Math.atan(pp.distanceTo(AUD.cam.p) / Math.max(0.5, dist)) * 180) / Math.PI; rot = (q.angleTo(AUD.cam.q) * 180) / Math.PI; }
    AUD.cam = { p: pp, q }; }
  else AUD.cam = null;
  for (const b of sb) { const c = [(b.box[0] + b.box[2]) / 2, (b.box[1] + b.box[3]) / 2, b.box[3] - b.box[1]], o = AUD.sub?.[b.name]; if (o && AUD.shot === S[i].id) subj = Math.max(subj, Math.hypot(c[0] - o[0], c[1] - o[1]) + Math.abs(c[2] - o[2])); }
  AUD.sub = Object.fromEntries(sb.map((b) => [b.name, [(b.box[0] + b.box[2]) / 2, (b.box[1] + b.box[3]) / 2, b.box[3] - b.box[1]]])); AUD.shot = S[i].id;
  const tall = Math.max(0, ...sb.filter((b) => b.toon && inside(b.box) > 0.3).map((b) => b.box[3] - b.box[1])) / 1920;
  const size = tall === 0 ? 'insert' : tall > 1.25 ? 'close' : tall > 0.8 ? 'medium' : tall > 0.4 ? 'full' : 'wide';
  return { t, diff, lum: lum / g.length, issues, trans: !!OP._inTrans, shot: S[i].id, cam, rot, subj, size, thumb: AUD.thumb.toDataURL('image/jpeg', 0.7) };
}
