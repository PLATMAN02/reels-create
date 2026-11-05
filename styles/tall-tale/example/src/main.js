// Boot: fonts → script + timing → 3D engine + sets → captions → shots. draw(t) renders film time t (pure function of t):
// the shot renders its 3D frame into the hidden WebGL canvas, which is copied onto the 2D canvas, then the 2D layer
// (labels, counters) and the captions go on top. window.OP is the API tools/capture.mjs drives.
import { W, H, setCtx, ctx, clamp } from './core/lib.js';
import { T, loadTiming } from './core/timing.js';
import { buildCaptions, drawCaption, captionList } from './core/captions.js';
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
  t = clamp(t, 0, T.dur - 1e-4);
  const S = OP._shots; let i = S.length - 1; while (i > 0 && S[i].at > t) i--;
  const X = transAt(t, i);
  if (X) { const A = FLOW.layer('_a'), B = FLOW.layer('_b'); paint(X.a, t, A.getContext('2d')); paint(X.b, t, B.getContext('2d')); FLOW.wipe(MAIN, A, B, X.tr, clamp(X.u)); }
  else paint(i, t, MAIN);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
  const fade = OP.script?.fade === false ? 1 : Math.min(clamp(t / 0.25), clamp((T.dur - t) / 0.4));
  if (fade < 1) { ctx.fillStyle = '#000'; ctx.globalAlpha = 1 - fade; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (OP.script?.captions !== false) drawCaption(t);
}

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
