// Boot: fonts → script + timing → captions → shots. Then draw(t) renders film time t (pure function of t).
// window.OP is the API tools/capture.mjs drives: ready, bootError, duration(), draw(t), frame(t, q), cues(), shots().
import { W, H, setCtx, ctx, clamp, eo, eio } from './core/lib.js';
import { T, loadTiming } from './core/timing.js';
import { buildCaptions, drawCaption, captionList } from './core/captions.js';
import { kickCam, finishing, composite, layer } from './core/motion.js';
import { buildShots } from './shots.js';

const cv = document.getElementById('cv');
const MAIN = cv.getContext('2d');
setCtx(MAIN);
const OP = (window.OP = { ready: false });

// Style constants: the automatic cut (used when a shot has no `trans`).
const PUNCH = 0.06, PUNCH_T = 0.25, CUT_FLASH = 0;

/** paint shot i at film time t into context c (camera drift + punch + kicks). Pure function of t. */
function paintShot(i, t, c) {
  const S = OP._shots, sh = S[i], end = i < S.length - 1 ? S[i + 1].at : T.dur, d = end - sh.at, lt = t - sh.at;
  setCtx(c);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.letterSpacing = '0px'; c.filter = 'none'; c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  // camera: punch-in on a plain cut + a slow push across the shot ("camera always moving") + kicks (punch zoom / shake)
  const punch = sh.trans ? 1 : 1 + PUNCH * (1 - eo(clamp(lt / PUNCH_T)));
  const drift = 1 + (sh.zoom ?? 0.06) * eio(clamp(lt / d)), k = kickCam(t, OP._kicks), z = punch * drift * k.z;
  const [cx, cy] = sh.cam || [540, 900];
  c.save(); c.translate(cx + k.dx, cy + k.dy); c.rotate(k.rot); c.scale(z, z); c.translate(-cx, -cy);
  sh.draw(lt, d, t);
  c.restore();
  setCtx(MAIN);
}

/** which transition is running at t: a shot's `trans` is centred on its cut (half before, half after) */
function transAt(t, i) {
  const S = OP._shots, nx = S[i + 1], cur = S[i];
  if (nx?.trans) { const d = nx.trans.d ?? 0.28; if (t >= nx.at - d / 2) return { a: i, b: i + 1, tr: nx.trans, u: (t - (nx.at - d / 2)) / d }; }
  if (i > 0 && cur.trans) { const d = cur.trans.d ?? 0.28; if (t < cur.at + d / 2) return { a: i - 1, b: i, tr: cur.trans, u: (t - (cur.at - d / 2)) / d }; }
  return null;
}

function draw(t) {
  t = clamp(t, 0, T.dur - 1e-4);
  const S = OP._shots; let i = S.length - 1; while (i > 0 && S[i].at > t) i--;
  const sh = S[i], lt = t - sh.at, X = transAt(t, i);
  if (X) { const A = layer('_a'), B = layer('_b'); paintShot(X.a, t, A.getContext('2d')); paintShot(X.b, t, B.getContext('2d')); composite(MAIN, A, B, X.tr, clamp(X.u)); }
  else paintShot(i, t, MAIN);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px'; ctx.filter = 'none';
  if (i > 0 && !sh.trans && CUT_FLASH && lt < 0.12) { ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = CUT_FLASH * (1 - lt / 0.12); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  finishing(t, OP._flashes, OP._leaks);
  // fade from / to black on the first and last 0.25 s
  const fade = OP.script?.fade === false ? 1 : Math.min(clamp(t / 0.25), clamp((T.dur - t) / 0.35));
  if (fade < 1) { ctx.fillStyle = '#000'; ctx.globalAlpha = 1 - fade; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (OP.script?.captions !== false) drawCaption(t);
}

(async () => {
  try {
    await document.fonts.load('900 100px Inter');
    const script = await (await fetch('script.json', { cache: 'no-store' })).json();
    await loadTiming();
    if (script.captions !== false) buildCaptions(script);
    const { shots, cues, kicks = [], flashes = [], leaks = [] } = buildShots();
    shots.sort((a, b) => a.at - b.at);
    OP._shots = shots; OP.script = script; OP._kicks = kicks; OP._flashes = flashes; OP._leaks = leaks;
    OP.duration = () => T.dur;
    OP.draw = draw;
    OP.frame = (t, q = 0.92) => { draw(t); return cv.toDataURL('image/jpeg', q); };
    OP.shots = () => shots.map((s, i) => ({ id: s.id, at: +s.at.toFixed(3), end: +(i < shots.length - 1 ? shots[i + 1].at : T.dur).toFixed(3), note: s.note || '' }));
    OP.captions = () => captionList().map((c) => ({ s: +c.s.toFixed(3), e: +c.e.toFixed(3), text: c.words.map((w) => (w.hi ? '*' : '') + w.txt).join(' ') }));
    OP.cues = () => cues.slice().sort((a, b) => a.t - b.t);
    OP.ready = true;
    // preview mode (not capture): play in real time, ?t=12.3 to hold a frame
    const q = new URLSearchParams(location.search);
    if (!q.has('capture')) {
      if (q.has('t')) draw(+q.get('t'));
      else {
        const audio = new Audio('data/mix.wav'); let t0 = null;
        const btn = document.getElementById('play'); btn.hidden = false;
        btn.onclick = () => { btn.hidden = true; t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
        const loop = (now) => { const t = t0 == null ? 0 : (now - t0) / 1000; draw(t0 == null ? 0 : t); if (t0 != null && t > T.dur) { t0 = null; btn.hidden = false; } requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
      }
    }
  } catch (e) { OP.bootError = String(e && e.stack || e); console.error(e); }
})();
