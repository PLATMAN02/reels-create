// 3 EASY WAYS TO MAKE YOUR FIRST $100 : the shot list (Stick Story).
// A shot: { id, at, cam: [cx, cy], zoom, trans, note, draw(lt, d, t) }. cut(i) = just before line i,
// Wd('word', i) = when the word is said (film time). Sound: cue(t, type, { gain, dur }).
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line, TAU } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';
import * as FX from './core/motion.js';
const { P, GROUND, FLOOR } = K;

// ═════════ set pieces for this story ═════════
function txt(s, x, y, size, col, align = 'center', maxW = 0) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; if (maxW) { const w = ctx.measureText(s).width; if (w > maxW) ctx.font = `900 ${Math.floor(size * maxW / w)}px Inter`; }
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.restore();
}
function coin(x, y, s = 1, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * Math.max(0.18, Math.abs(Math.cos(spin))), s);
  circle(0, 0, 48, P.ink); circle(0, 0, 42, P.goldDark); circle(0, -3, 38, P.gold); txt('$', 0, -1, 50, P.goldDark); ctx.restore();
}
function bigPhone(x, y, s, rot, screen) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(-226, -426, 460, 860, 66); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fill();
  rr(-240, -440, 480, 880, 66); ctx.fillStyle = P.ink; ctx.fill();
  ctx.save(); rr(-210, -400, 420, 790, 38); ctx.clip(); screen(); ctx.restore();
  rr(-55, -424, 110, 14, 7); ctx.fillStyle = '#3B4152'; ctx.fill();
  ctx.restore();
}
function bike(x, y, s = 1, col = P.red) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const wx of [-110, 110]) { ctx.beginPath(); ctx.arc(wx, -70, 66, 0, TAU); ctx.strokeStyle = P.ink; ctx.lineWidth = 14; ctx.stroke(); circle(wx, -70, 10, P.ink); }
  line([[-110, -70], [-30, -160], [70, -160], [110, -70]], col, 14); line([[-30, -160], [0, -70], [70, -160]], col, 14); line([[-110, -70], [0, -70]], col, 14);
  line([[-30, -160], [-40, -190]], P.ink, 10); rr(-75, -204, 70, 20, 10); ctx.fillStyle = P.ink; ctx.fill();
  line([[70, -160], [80, -205], [110, -210]], P.ink, 10);
  ctx.restore();
}
function shirt(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath();
  ctx.moveTo(-50, -200); ctx.quadraticCurveTo(0, -165, 50, -200); ctx.lineTo(140, -160); ctx.lineTo(110, -80); ctx.lineTo(80, -95); ctx.lineTo(80, 0);
  ctx.lineTo(-80, 0); ctx.lineTo(-80, -95); ctx.lineTo(-110, -80); ctx.lineTo(-140, -160); ctx.closePath();
  ctx.fillStyle = P.sofa; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
function oldPhone(x, y, s = 1) { K.phone(x, y, s, false); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line([[-30, -80], [5, -30], [-10, 10], [25, 60]], '#DDEBF7', 5); ctx.restore(); }
function box(x, y, s = 1, tip = 0) {
  ctx.save(); ctx.translate(x + 150 * s, y); ctx.rotate(-tip * 0.5); ctx.translate(-150 * s, 0); ctx.scale(s, s);
  rr(-150, -240, 300, 240, 10); ctx.fillStyle = '#D69C5E'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.fillStyle = '#B97E44'; ctx.fillRect(-20, -240, 40, 240);
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * 150, -240); ctx.rotate(sd * (0.5 + tip * 0.8)); rr(sd > 0 ? -150 : 0, -26, 150, 26, 6); ctx.fillStyle = '#C48A4E'; ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function dog(x, y, s, ph) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const brown = '#8A5A3B', dark = '#6B4329';
  for (let k = 0; k < 4; k++) { const lx = [-80, -50, 60, 90][k], a = Math.sin(ph + (k % 2) * Math.PI + (k > 1 ? 1.2 : 0)) * 0.6; line([[lx, -110], [lx + Math.sin(a) * 70, -110 + Math.cos(a) * 100]], k % 2 ? dark : brown, 22); }
  line([[-120, -140], [-165, -190 + Math.sin(ph * 2) * 25]], brown, 18);
  ell(0, -135, 130, 58, brown);
  ell(130, -205, 62, 56, brown); ell(108, -248, 22, 44, dark, -0.5 + Math.sin(ph) * 0.3);
  ell(184, -196, 30, 22, brown); circle(206, -205, 10, P.ink);
  ell(136, -215, 13, 16, P.white); circle(142, -213, 7, P.ink);
  ctx.beginPath(); ctx.ellipse(180, -170, 11, 18, 0.3, 0, Math.PI); ctx.fillStyle = '#E57A8A'; ctx.fill();
  line([[80, -175], [110, -150]], P.red, 14);
  ctx.restore();
  return [x + 95 * s, y - 162 * s];
}
function car(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-300, -190, 600, 130, 40); ctx.fillStyle = '#4C7DB8'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-170, -190); ctx.lineTo(-110, -300); ctx.lineTo(120, -300); ctx.lineTo(200, -190); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-140, -195); ctx.lineTo(-95, -280); ctx.lineTo(0, -280); ctx.lineTo(0, -195); ctx.closePath(); ctx.fillStyle = P.sky; ctx.fill();
  ctx.beginPath(); ctx.moveTo(20, -195); ctx.lineTo(20, -280); ctx.lineTo(110, -280); ctx.lineTo(170, -195); ctx.closePath(); ctx.fill();
  for (const wx of [-180, 180]) { circle(wx, -60, 62, P.ink); circle(wx, -60, 26, '#B8BEC6'); }
  rr(270, -160, 30, 26, 8); ctx.fillStyle = P.lamp; ctx.fill();
  ctx.restore();
}
function laptop(x, y, s = 1, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-150, -200, 300, 190, 14); ctx.fillStyle = P.ink; ctx.fill(); rr(-136, -188, 272, 166, 8); ctx.fillStyle = glow ? '#BFE3F2' : '#3B4A63'; ctx.fill();
  if (glow) { for (let k = 0; k < 3; k++) { rr(-110, -150 + k * 40, 60 + k * 50, 22, 6); ctx.fillStyle = ['#E2574C', '#6DB36A', '#F2B23E'][k]; ctx.fill(); } }
  ctx.beginPath(); ctx.moveTo(-180, 0); ctx.lineTo(180, 0); ctx.lineTo(150, -14); ctx.lineTo(-150, -14); ctx.closePath(); ctx.fillStyle = '#B8BEC6'; ctx.fill();
  ctx.restore();
}
function bulb(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circle(0, -10, 46, P.gold); rr(-22, 30, 44, 34, 6); ctx.fillStyle = '#9AA6B2'; ctx.fill(); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.45; line([[Math.cos(a) * 64, -10 + Math.sin(a) * 64], [Math.cos(a) * 84, -10 + Math.sin(a) * 84]], P.goldDark, 8); } ctx.restore(); }
function jar(x, y, w, h, fill, label, lab) {
  ctx.save();
  rr(x - w / 2, y - h, w, h, 44); ctx.fillStyle = 'rgba(169,211,232,0.45)'; ctx.fill();
  ctx.save(); rr(x - w / 2, y - h, w, h, 44); ctx.clip();
  const top = y - 14 - (h - 40) * clamp(fill); ctx.fillStyle = P.goldDark; ctx.fillRect(x - w / 2, top, w, y - top);
  for (let r = 0; r * 34 < y - top; r++) for (let c = 0; c < 6; c++) ell(x - w / 2 + 22 + c * (w - 44) / 5 + (r % 2) * 14, y - 26 - r * 34, 30, 14, P.gold);
  ctx.restore();
  rr(x - w / 2, y - h, w, h, 44); ctx.lineWidth = 9; ctx.strokeStyle = P.ink; ctx.stroke();
  rr(x - w / 2 - 14, y - h - 40, w + 28, 52, 14); ctx.fillStyle = P.ink; ctx.fill();
  if (lab > 0) { ctx.save(); ctx.translate(x, y - h * 0.5); ctx.scale(lab, lab); rr(-120, -50, 240, 100, 18); ctx.fillStyle = P.white; ctx.fill(); ctx.lineWidth = 7; ctx.stroke(); txt(label, 0, 4, 64, P.navy); ctx.restore(); }
  ctx.restore();
}
function street(scroll) {
  ctx.fillStyle = P.sky; ctx.fillRect(-300, -300, W + 600, 1600); circle(860, 330, 80, '#FFE7A8');
  for (const [cx, cy, r] of [[200, 420, 50], [260, 400, 64], [330, 425, 46]]) circle((cx - scroll * 0.15) % 1400 + 0, cy, r, P.white);
  for (let k = -1; k < 6; k++) { const hx = ((k * 360 - scroll * 0.35) % 2160 + 2160) % 2160 - 360, c = ['#E2D5BE', '#D9826B', '#C9BFA9'][((k % 3) + 3) % 3];
    ctx.fillStyle = c; ctx.fillRect(hx, 900, 260, 360); ctx.beginPath(); ctx.moveTo(hx - 20, 900); ctx.lineTo(hx + 130, 790); ctx.lineTo(hx + 280, 900); ctx.closePath(); ctx.fillStyle = P.wood; ctx.fill();
    rr(hx + 40, 980, 70, 70, 6); ctx.fillStyle = P.sky; ctx.fill(); rr(hx + 150, 1100, 70, 160, 6); ctx.fillStyle = '#7A5236'; ctx.fill(); }
  ctx.fillStyle = P.plant; ctx.fillRect(-300, 1250, W + 600, 110);
  ctx.fillStyle = '#D9CDBA'; ctx.fillRect(-300, 1360, W + 600, 700);
  ctx.strokeStyle = '#C2B49C'; ctx.lineWidth = 6; for (let k = -1; k < 8; k++) { const sx = ((k * 220 - scroll) % 1760 + 1760) % 1760 - 220; ctx.beginPath(); ctx.moveTo(sx, 1360); ctx.lineTo(sx - 60, 1920); ctx.stroke(); }
  ctx.fillStyle = '#B8AC96'; ctx.fillRect(-300, 1360, W + 600, 14);
}
function speedLines(x, y, lt, n = 6) { for (let k = 0; k < n; k++) { const yy = y - 300 + k * 110 + Math.sin(k * 7) * 20, u = (lt * 2.6 + rnd(k)) % 1; line([[x - 120 - u * 260, yy], [x - 40 - u * 260, yy]], 'rgba(28,28,34,0.35)', 10); } }
function stamp(text, x, y, lt, t0, col = P.red, rot = -0.22) {
  if (lt < t0) return; const u = seg(lt, t0, t0 + 0.2), s = lerp(2.2, 1, FX.outExpo(u)) * (1 + FX.wobble(lt, t0 + 0.2, 0.06));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, u * 3);
  ctx.font = '900 120px Inter'; const w = ctx.measureText(text).width + 60;
  rr(-w / 2, -80, w, 160, 20); ctx.lineWidth = 14; ctx.strokeStyle = col; ctx.stroke(); txt(text, 0, 6, 120, col); ctx.restore();
}
function tile(n, x, y, lt, t0) {
  if (lt < t0) return; const u = seg(lt, t0, t0 + 0.24), [sx, sy] = FX.squash(lt, t0 + 0.24, 0.16), s = lerp(1.7, 1, FX.outExpo(u));
  ctx.save(); ctx.translate(x, y); ctx.rotate((1 - FX.outExpo(u)) * 0.4 * (n % 2 ? 1 : -1)); ctx.scale(s * sx, s * sy); ctx.globalAlpha = Math.min(1, u * 3);
  rr(-96, -88, 200, 200, 38); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(); rr(-100, -100, 200, 200, 38); ctx.fillStyle = P.gold; ctx.fill();
  txt(String(n), 0, 6, 140, P.navy); ctx.restore();
}
function moneyPill(text, x, y, sc, col = P.green) { if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.font = '900 76px Inter'; const w = ctx.measureText(text).width + 80; rr(-w / 2, -58, w, 116, 58); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.stroke(); txt(text, 0, 4, 76, P.white); ctx.restore(); }
const tint = (col) => { ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); };

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const KICKS = [], FLASHES = [], LEAKS = [];
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.08);
  const blink = (t, off = 0) => FX.blink(t, off, 3.1);

  // S01 · HOOK: hero stares as a gold $100 counter rolls up and coins rain (moving on frame 0)
  { const lock = Wd('hundred', 0), wk = Wd('this', 0);
    add({ id: 'S01', at: 0, cam: [540, 900], zoom: 0.08, note: 'hook: $100 counter rolls, coins rain, hero looks up', draw(lt, d, t) {
      K.livingRoom({});
      for (let i = 0; i < 9; i++) { const t0 = i * 0.2 - 0.55, u = lt - t0; if (u < 0) continue; const x0 = 180 + rnd(i + 3) * 720, land = 1440 + rnd(i) * 40;
        let y = -80 + 0.5 * 2600 * u * u, sp = u * 9 + i; if (y > land) { y = land; sp = 0; } coin(x0 + Math.sin(i) * 40 * Math.min(u, 1), y, 0.9, sp); }
      const happy = lt > lock;
      K.person({ x: 330, y: GROUND, h: 840, mood: happy ? 'happy' : 'calm', look: [0.7, -1], blink: blink(t), lean: happy ? -4 : 0, arms: { L: [-6, 14], R: [60, 60] }, hold: (x, y) => K.phone(x + 12, y - 40, 0.55, true) });
      FX.counter(620, 430, 230, lt, 0, lock, 0, 100, { pre: '$', color: P.gold });
      K.counterPill('THIS WEEK', 620, 620, lt > wk ? eob(seg(lt, wk, wk + 0.25)) * 1.25 : 0);
    } });
    KICKS.push({ t: lock, a: 0.06, shake: 8 }); cue(lock, 'thud', { gain: 0.8 }); cue(wk, 'pop'); cue(0.45, 'plop', { gain: 0.35 }); cue(1.05, 'plop', { gain: 0.35 }); cue(1.65, 'plop', { gain: 0.35 }); }

  // S02 · MYTH BUST: a flashing GET RICH QUICK ad gets struck out, red X on "scams"
  { const st = cut(1), us = Wd('usually', 1) - st, sc = Wd('scams', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 860], zoom: 0.07, trans: { type: 'portal', hole: 'rect', aspect: 0.55, x: 585, y: 890, r: 60, edge: 'frame' }, note: 'GET RICH QUICK ad flashing; strike + red X on "scams"', draw(lt, d, t) {
      K.livingRoom({}); tint(`rgba(226,87,76,${lt > sc ? 0.32 : 0.16})`);
      const fl = Math.floor(lt * 7) % 2;
      bigPhone(610, 760, 1.12, FX.nz(lt * 3, 2) * 0.04, () => {
        ctx.fillStyle = fl ? '#22304A' : '#3A2340'; ctx.fillRect(-210, -400, 420, 790);
        for (let k = 0; k < 7; k++) txt('$', -170 + rnd(k) * 340, -340 + ((rnd(k + 9) * 700 + lt * 260) % 720), 60, 'rgba(242,178,62,0.35)');
        txt('GET', 0, -230, 120, fl ? P.gold : P.white, 'center', 380); txt('RICH', 0, -90, 120, fl ? P.white : P.gold, 'center', 380); txt('QUICK!!!', 0, 50, 120, P.red, 'center', 380);
        rr(-150, 190, 300, 100, 50); ctx.fillStyle = P.red; ctx.fill(); txt('CLICK NOW', 0, 242, 50, P.white, 'center', 260);
      });
      FX.strike(380, 850, 700, seg(lt, us, us + 0.26), P.red, 26, -0.18);
      if (lt > sc) K.cross(610, 760, eob(seg(lt, sc, sc + 0.25)) * 2);
      K.bigHead(230, 1340, 140, { mood: lt > sc ? 'scared' : 'worried', look: [1, -0.7], blink: lt > sc ? 0 : blink(t) });
    } });
    cue(st - 0.1, 'zip', { gain: 0.6 }); cue(st + us, 'slide', { gain: 0.5, dur: 0.3 }); cue(st + sc, 'slam'); KICKS.push({ t: st + sc, a: 0.08, shake: 12 }); FLASHES.push({ t: st + sc, a: 0.3, col: '226,87,76' }); }

  // S03 · THE PROMISE: gold tiles 1, 2, 3 slam in one after another, hero turns determined
  { const st = cut(2), a = Wd('three', 2) - st, b = Wd('easy', 2) - st, c = Wd('ways', 2) - st, wk = Wd('work', 2) - st;
    add({ id: 'S03', at: st, cam: [540, 900], zoom: 0.06, trans: { type: 'pass', dir: -1, shape: 'post' }, note: 'tiles 1-2-3 slam in staggered; check on "work"', draw(lt, d, t) {
      K.livingRoom({});
      K.person({ x: 420, y: GROUND, h: 820, mood: lt > a ? 'determined' : 'calm', look: [0.4, -1], blink: blink(t, 1), arms: lt > wk ? { L: [150, 10], R: [150, 10] } : undefined });
      tile(1, 260, 440, lt, a); tile(2, 540, 440, lt, b); tile(3, 820, 440, lt, c);
      if (lt > wk) K.check(780, 900, eob(seg(lt, wk, wk + 0.25)) * 1.2);
    } });
    cue(st, 'thud', { gain: 0.6 }); cue(st + a, 'pop'); cue(st + b, 'pop'); cue(st + c, 'pop'); cue(st + wk, 'boing', { gain: 0.45 }); KICKS.push({ t: st + c, a: 0.04, shake: 5 }); }

  // S04 · STEP 1: hero tips a box, old stuff flies out on arcs and lands with a squash
  { const st = cut(3), sf = Wd('stuff', 3) - st;
    add({ id: 'S04', at: st, camPath: [{ t: 0, x: 600, y: 980, z: 1.1 }, { t: 0.9, x: 540, y: 1000, z: 1.0 }, { t: 2.2, x: 690, y: 1180, z: 1.14 }], trans: { type: 'dive', x: 260, y: 440 }, note: 'Step 1 card; box tips on "stuff", items arc out', draw(lt, d, t) {
      K.livingRoom({});
      const tip = eio(seg(lt, sf - 0.1, sf + 0.25));
      box(760, 1500, 1, tip);
      const items = [[(x, y) => oldPhone(x, y, 0.9), 470, 1450], [(x, y) => shirt(x, y, 0.75), 610, 1490], [(x, y) => bike(x, y, 0.6), 800, 1500]];
      items.forEach(([fn, tx, ty], k) => { const t0 = sf + 0.05 + k * 0.1, u = seg(lt, t0, t0 + 0.45); if (u <= 0) return; const e = eo(u);
        const x = lerp(820, tx, e), y = lerp(1300, ty, u) - Math.sin(Math.PI * u) * 330, [sx, sy] = FX.squash(lt, t0 + 0.45, 0.2);
        ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy); ctx.rotate((1 - u) * 1.4 * (k - 1)); fn(0, 0); ctx.restore(); });
      K.person({ x: 290, y: GROUND, h: 840, mood: lt > sf + 0.6 ? 'happy' : 'determined', look: [1, 0.5], blink: blink(t), lean: tip * 10, arms: { L: [-6, 14], R: [lerp(30, 85, tip), 10] } });
      K.stepCard(1, 'SELL OLD STUFF', 540, 300, eob(seg(lt, 0.05, 0.32)));
    } });
    cue(st - 0.14, 'whoosh'); cue(st + 0.06, 'pop'); cue(st + sf, 'thud', { gain: 0.6 }); for (let k = 0; k < 3; k++) cue(st + sf + 0.5 + k * 0.1, 'plop', { gain: 0.4 }); }

  // S05 · THE ITEMS: phone, bike, shirt drop in on their words, then get circled
  { const st = cut(4), w1 = Wd('phones', 4) - st, w2 = Wd('bikes', 4) - st, w3 = Wd('clothes', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 1000], zoom: 0.05, trans: { type: 'smoke', x: 760, y: 1380, col: '#EADFC9', shade: '#CDBE9F', d: 0.46 }, note: 'items drop in on their word; scribble circle', draw(lt, d, t) {
      ctx.fillStyle = P.wall; ctx.fillRect(-300, -300, W + 600, FLOOR + 300); ctx.fillStyle = P.floor; ctx.fillRect(-300, FLOOR, W + 600, 900);
      const drop = (fn, x, y, t0) => { if (lt < t0 - 0.25) return; const u = seg(lt, t0 - 0.25, t0), [sx, sy] = FX.squash(lt, t0, 0.24); ell(x, y + 6, 130 * u, 18 * u, 'rgba(0,0,0,0.15)');
        ctx.save(); ctx.translate(x, lerp(200, y, u * u)); ctx.scale(sx, sy); fn(); ctx.restore(); };
      drop(() => oldPhone(0, -170, 1.5), 225, 1330, w1); drop(() => bike(0, 0, 1.0), 505, 1330, w2); drop(() => shirt(0, 0, 1.0), 795, 1330, w3);
      for (const [px, t0] of [[225, w1], [505, w2], [795, w3]]) { const u = seg(lt, t0, t0 + 0.45); if (u <= 0 || u >= 1) continue; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) ell(px + sd * (90 + eo(u) * 90 + k * 34), 1318 - k * 14 - eo(u) * 30, 22 * (1 - u) + 6, 14 * (1 - u) + 4, `rgba(201,191,169,${0.9 * (1 - u)})`); }
      if (lt > w3 + 0.35) K.counterPill('= CASH', 540, 720, eob(seg(lt, w3 + 0.35, w3 + 0.6)) * 1.3);
      K.counterPill('NEVER USED', 540, 500, eob(seg(lt, 0.1, 0.35)) * 1.2);
    } });
    cue(st - 0.13, 'slide', { gain: 0.6, dur: 0.4 }); cue(st + 0.1, 'pop', { gain: 0.6 }); cue(st + w1, 'plop'); cue(st + w2, 'plop'); cue(st + w3, 'plop'); cue(st + w3 + 0.35, 'pop', { gain: 0.6 }); }

  // S06 · SNAP, POST, SOLD: zoom into the phone; shutter flash, listing slides up, SOLD stamp + coins burst
  { const st = cut(5), ph = Wd('photo', 5) - st, on = Wd('online', 5) - st, ca = Wd('cash', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 820], zoom: 0.06, trans: { type: 'portal', hole: 'rect', aspect: 0.55, x: 225, y: 1160, r: 95, edge: 'frame' }, note: 'phone: snap, listing, SOLD + $45 on "cash"', draw(lt, d, t) {
      ctx.fillStyle = P.wall; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.fillStyle = P.floor; ctx.fillRect(-300, FLOOR + 100, W + 600, 900);
      bigPhone(540, 820, 1.05, 0, () => {
        const up = eio(seg(lt, on, on + 0.4));
        ctx.fillStyle = '#2E3445'; ctx.fillRect(-210, -400, 420, 790); ctx.save(); ctx.translate(0, -up * 170); ctx.scale(1 - up * 0.2, 1 - up * 0.2); bike(0, 120, 1.1);
        ctx.strokeStyle = P.white; ctx.lineWidth = 8; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) line([[sx * 170, sy * 180 + 40 - sy * 50], [sx * 170, sy * 180 + 40], [sx * 120, sy * 180 + 40]], P.white, 8); ctx.restore();
        if (lt > ph && lt < ph + 0.25) { ctx.fillStyle = `rgba(255,255,255,${1 - seg(lt, ph, ph + 0.25)})`; ctx.fillRect(-210, -400, 420, 790); }
        if (up > 0) { const y0 = lerp(420, 0, up); rr(-190, y0 - 10, 380, 380, 26); ctx.fillStyle = P.white; ctx.fill(); txt('$45', -150, y0 + 80, 110, P.ink, 'left'); rr(-150, y0 + 170, 280, 26, 13); ctx.fillStyle = '#C9D2DA'; ctx.fill(); rr(-150, y0 + 220, 200, 26, 13); ctx.fill(); rr(-150, y0 + 280, 300, 60, 30); ctx.fillStyle = '#4A90E2'; ctx.fill(); txt('POSTED', 0, y0 + 312, 38, P.white); }
      });
      if (lt > ca) for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k - 3.5) * 0.36, u = seg(lt, ca, ca + 0.8), r = 230 + eo(u) * 190; coin(540 + Math.cos(a) * r, 820 + Math.sin(a) * r * 0.9 + u * u * 400, 0.85 * (1 - u * 0.3), u * 12 + k); }
      stamp('SOLD', 540, 640, lt, ca);
    } });
    cue(st - 0.15, 'whoosh'); cue(st + ph, 'tock', { gain: 0.8 }); cue(st + on, 'slide', { gain: 0.5, dur: 0.4 }); cue(st + ca, 'slam'); KICKS.push({ t: st + ca, a: 0.07, shake: 10 }); FLASHES.push({ t: st + ca, a: 0.25 }); }

  // S07 · STEP 2: hero walks to the neighbor's door, knocks, it swings open
  { const st = cut(6), nb = Wd('neighbors', 6) - st, kn = Wd('jobs', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 1000], zoom: 0.05, trans: { type: 'carry', dir: -1, carry: (m, u) => coin(540 + (0.5 - u) * 240, 900 - Math.sin(Math.PI * u) * 260, 1.7, u * 16) }, note: 'Step 2 card; walk, knock, door opens on "neighbors"', draw(lt, d, t) {
      const op = eo(seg(lt, nb - 0.1, nb + 0.35));
      K.hallway({ a: '4A', b: '4B', openB: op });
      if (op > 0.05) K.person({ x: 820, y: GROUND - 20, h: 760, dir: -1, mood: 'happy', look: [-1, 0], cap: P.red, arms: { L: [-6, 14], R: [lerp(0, 120, op), 20] } });
      const wu = eio(seg(lt, 0.0, kn)), x = lerp(140, 520, wu), walking = lt < kn, knock = lt > kn && lt < nb;
      K.person({ x, y: GROUND, h: 840, walk: walking ? lt * 11 : null, mood: lt > nb ? 'happy' : 'determined', look: [1, -0.2], blink: blink(t),
        arms: knock ? { L: [-6, 14], R: [95, -30 + Math.abs(Math.sin(lt * 18)) * 40] } : undefined });
      K.stepCard(2, 'HELP NEIGHBORS', 540, 300, eob(seg(lt, 0.05, 0.32)));
    } });
    cue(st - 0.14, 'whoosh'); cue(st + 0.06, 'pop'); cue(st + kn + 0.1, 'tock'); cue(st + kn + 0.28, 'tock'); cue(st + nb, 'slide', { gain: 0.45, dur: 0.4 }); }

  // S08 · DOG WALK: the dog drags the hero down the street (parallax houses, speed lines)
  { const st = cut(7), dg = Wd('dogs', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 1100], zoom: 0.04, trans: { type: 'portal', hole: 'rect', aspect: 0.54, x: 810, y: 1110, r: 280, edge: 'frame', col: '#7A5236' }, note: 'dog drags the hero; parallax street', draw(lt, d, t) {
      street(lt * 900);
      const pull = lt > dg ? 1 : 0.4, bob = Math.abs(Math.sin(lt * 14)) * 14;
      speedLines(360, 1200, lt);
      const collar = dog(620 + Math.sin(lt * 7) * 10, GROUND - bob, 1.2, lt * 22);
      let hand = [0, 0];
      K.person({ x: 360 + Math.sin(lt * 6) * 12, y: GROUND, h: 840, walk: lt * 20, lean: 14 + pull * 12, mood: lt > dg ? 'scared' : 'worried', look: [1, 0.3], arms: { L: [-40, 30], R: [80, 0] }, hold: (x, y) => { hand = [x, y]; } });
      line([hand, [lerp(hand[0], collar[0], 0.5), Math.max(hand[1], collar[1]) + 10], collar], P.red, 7);
    } });
    cue(st - 0.13, 'slide', { gain: 0.6, dur: 0.4 }); cue(st + dg, 'boing', { gain: 0.6 }); KICKS.push({ t: st + dg, a: 0.03, shake: 6 }); }

  // S08b · CAR WASH: hero scrubs a car, bubbles rise, +$20 pops on "cars"
  { const st = Wd('washing', 7) - 0.1, cr = Wd('cars', 7) - st;
    add({ id: 'S08b', at: st, cam: [540, 1150], zoom: 0.06, trans: { type: 'pass', dir: -1, shape: 'foliage' }, note: 'car wash, bubbles, +$20', draw(lt, d, t) {
      street(200 + lt * 40);
      car(600, GROUND - 10, 1.1);
      for (let k = 0; k < 10; k++) { const u = (lt * 0.9 + rnd(k)) % 1, bx = 420 + rnd(k + 5) * 420 + Math.sin(lt * 4 + k) * 20; ctx.beginPath(); ctx.arc(bx, 1350 - u * 380, 14 + rnd(k + 2) * 16, 0, TAU); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - u)})`; ctx.lineWidth = 5; ctx.stroke(); }
      K.person({ x: 250, y: GROUND, h: 840, mood: 'happy', look: [1, 0], blink: blink(t), arms: { L: [-6, 14], R: [80 + Math.sin(lt * 16) * 22, -20] }, hold: (x, y) => { rr(x - 30, y - 22, 64, 44, 16); ctx.fillStyle = P.gold; ctx.fill(); } });
      moneyPill('+$20', 620, 560, lt > cr ? eob(seg(lt, cr, cr + 0.28)) : 0);
    } });
    cue(st - 0.13, 'whoosh', { gain: 0.8 }); cue(st + 0.05, 'bubbles', { dur: 1.0, gain: 0.35 }); cue(st + cr, 'pop'); }

  // S09 · STEP 3: hero types at the kitchen counter; lightbulb thought on "skill"
  { const st = cut(8), sk = Wd('skill', 8) - st;
    add({ id: 'S09', at: st, cam: [540, 1000], zoom: 0.05, trans: { type: 'smoke', x: 600, y: 1380, col: '#FFFFFF', shade: '#D6E6F0', d: 0.4 }, note: 'Step 3 card; laptop, lightbulb on "skill"', draw(lt, d, t) {
      K.kitchen({});
      laptop(720, FLOOR - 270, 1.1, lt > sk);
      K.person({ x: 430, y: GROUND, h: 840, mood: lt > sk ? 'happy' : 'determined', look: [1, 0.4], blink: blink(t, 2), arms: { L: [70, 30 + Math.sin(lt * 20) * 10], R: [75, 35 + Math.cos(lt * 19) * 10] } });
      if (lt > sk) K.thought(740, 640, 0.85 * eob(seg(lt, sk, sk + 0.28)), (x, y) => bulb(x, y - 10, eob(seg(lt, sk + 0.1, sk + 0.38))), 520, 820);
      K.stepCard(3, 'SELL A SKILL', 540, 300, eob(seg(lt, 0.05, 0.32)));
    } });
    cue(st - 0.14, 'whoosh'); cue(st + 0.06, 'pop'); cue(st + sk, 'pop'); }

  // S10 · ON SCREEN: zoom into the laptop; edit timeline builds itself, then a tutoring call; +$35
  { const st = cut(9), ed = Wd('editing', 9) - st, tu = Wd('tutoring', 9) - st, onl = Wd('online', 9) - st;
    add({ id: 'S10', at: st, cam: [540, 860], zoom: 0.05, trans: { type: 'portal', hole: 'rect', aspect: 1.58, x: 720, y: 964, r: 105, edge: 'frame' }, note: 'video edit timeline, then tutoring call, +$35', draw(lt, d, t) {
      ctx.fillStyle = P.wallShade; ctx.fillRect(-300, -300, W + 600, H + 600);
      rr(140, 500, 800, 620, 34); ctx.fillStyle = P.ink; ctx.fill();
      ctx.beginPath(); ctx.moveTo(80, 1160); ctx.lineTo(1000, 1160); ctx.lineTo(950, 1120); ctx.lineTo(130, 1120); ctx.closePath(); ctx.fillStyle = '#B8BEC6'; ctx.fill();
      ctx.save(); rr(170, 530, 740, 560, 16); ctx.clip();
      if (lt < tu) {
        ctx.fillStyle = '#2E3445'; ctx.fillRect(170, 530, 740, 560);
        rr(200, 560, 680, 300, 10); ctx.fillStyle = P.sky; ctx.fill(); ctx.fillStyle = P.plant; ctx.fillRect(200, 800, 680, 60);
        K.person({ x: 540, y: 845, h: 250, mood: 'happy', walk: lt * 8 });
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const t0 = ed + (r * 3 + c) * 0.07, u = eob(seg(lt, t0, t0 + 0.25)); if (u <= 0) continue; rr(lerp(950, 200 + c * 230, u), 890 + r * 64, 210, 48, 10); ctx.fillStyle = ['#E2574C', '#6DB36A', '#F2B23E'][(r + c) % 3]; ctx.fill(); }
        const px = lerp(200, 880, seg(lt, ed + 0.3, tu)); line([[px, 880], [px, 1080]], P.white, 6);
      } else {
        const u = eob(seg(lt, tu, tu + 0.25));
        ctx.fillStyle = P.white; ctx.fillRect(170, 530, 740, 560);
        ctx.save(); ctx.translate(540, 810); ctx.scale(u, u); ctx.translate(-540, -810);
        rr(200, 560, 680, 250, 12); ctx.fillStyle = '#2E5A44'; ctx.fill(); txt('2 + 2 = 4', 540, 690, 110, P.white);
        rr(200, 840, 330, 220, 14); ctx.fillStyle = '#DDEBF7'; ctx.fill(); rr(550, 840, 330, 220, 14); ctx.fill();
        K.bigHead(365, 950, 80, { mood: 'happy' }); K.bigHead(715, 950, 70, { mood: 'happy', dir: -1 });
        ctx.restore();
      }
      ctx.restore();
      moneyPill('+$35', 540, 1340, lt > onl ? eob(seg(lt, onl, onl + 0.28)) : 0);
    } });
    cue(st - 0.15, 'whoosh'); cue(st + ed, 'tock', { gain: 0.5 }); cue(st + ed + 0.21, 'tock', { gain: 0.4 }); cue(st + tu, 'pop', { gain: 0.7 }); cue(st + onl, 'pop'); }

  // S11 · THE TWIST: near-silence, dark room, big surprised face; TWIST slams in
  { const st = cut(10), tw = Wd('twist', 10) - st;
    add({ id: 'S11', at: st, cam: [540, 900], zoom: 0.1, trans: { type: 'pass', axis: 'y', dir: 1, shape: 'wall', col: '#22304A' }, note: 'twist: big face, TWIST slam', draw(lt, d, t) {
      ctx.fillStyle = P.nWall; ctx.fillRect(-300, -300, W + 600, H + 600);
      const g = ctx.createRadialGradient(540, 1000, 50, 540, 1000, 700); g.addColorStop(0, 'rgba(255,217,138,0.35)'); g.addColorStop(1, 'rgba(255,217,138,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sq = FX.squash(lt, tw, 0.08);
      ctx.save(); ctx.filter = 'drop-shadow(0px 0px 14px rgba(255,226,170,0.9))'; ctx.translate(540, 1080); ctx.scale(sq[0], sq[1]); ctx.translate(-540, -1080);
      K.bigHead(540, 1080, 270, { mood: lt > tw ? 'scared' : 'worried', look: lt > tw ? [0, -0.6] : [Math.sin(lt * 5), 0] }); ctx.restore();
      FX.slamText('TWIST', 540, 520, 190, lt, tw, { color: P.gold });
      K.cinemaBars(eo(seg(lt, 0, 0.3)));
    } });
    cue(st - 0.1, 'zip', { gain: 0.35 }); cue(st + tw, 'slam'); KICKS.push({ t: st + tw, a: 0.09, shake: 14 }); FLASHES.push({ t: st + tw, a: 0.3 }); }

  // S12 · KEEP SOME: hero flicks coins on arcs into a SAVE jar that fills up
  { const st = Wd('money', 11) - 0.14, mo = Wd('money', 11) - st, kp = Wd('keep', 11) - st, sv = Wd('save', 11) - st, jb = Wd('job', 11) - st;
    const flips = []; for (let k = 0; k < 8; k++) flips.push(mo + k * 0.36);
    add({ id: 'S12', at: st, cam: [540, 1000], zoom: 0.05, tod: (lt, d) => 0.3 * eio(clamp(lt / d)), trans: { type: 'dive', x: 540, y: 1080 }, note: 'coins arc into SAVE jar; SAVE slams on "save"', draw(lt, d, t) {
      K.livingRoom({});
      let hand = [520, 1100];
      K.person({ x: 300, y: GROUND, h: 840, mood: 'happy', look: [1, 0], blink: blink(t), arms: { L: [-6, 14], R: [70 + Math.sin(lt * 9) * 12, -10] }, hold: (x, y) => { hand = [x, y]; coin(x + 10, y - 30, 0.7, lt * 3); } });
      const landed = flips.filter((f) => lt > f + 0.45).length, fill = 0.12 + landed * 0.08;
      const [jx, jy] = FX.squash(lt, jb, 0.12);
      ctx.save(); ctx.translate(720, 1470); ctx.scale(jx, jy); ctx.translate(-720, -1470);
      jar(720, 1470, 300, 400, fill, 'SAVE', lt > sv ? eob(seg(lt, sv, sv + 0.25)) : 0); ctx.restore();
      for (const f of flips) { const u = seg(lt, f, f + 0.45); if (u <= 0 || u >= 1) continue; coin(lerp(hand[0], 720, u), lerp(hand[1], 1080, u) - Math.sin(Math.PI * u) * 300, 0.75, u * 14); }
      K.counterPill('KEEP SOME', 540, 330, lt > kp ? eob(seg(lt, kp, kp + 0.25)) * 1.3 : 0);
      if (lt > jb) K.check(860, 990, eob(seg(lt, jb, jb + 0.25)));
    } });
    cue(st, 'thud', { gain: 0.5 }); flips.forEach((f) => cue(st + f + 0.45, 'plop', { gain: 0.28 })); cue(st + kp, 'pop', { gain: 0.7 }); cue(st + sv, 'thud', { gain: 0.8 }); cue(st + jb + 0.05, 'sparkle', { gain: 0.25, dur: 0.6 });
    KICKS.push({ t: st + sv, a: 0.05, shake: 6 }); }

  // S13 · PAYOFF: back home, the three earnings add up and the counter locks on $100
  { const st = cut(12), hu = Wd('hundred', 12) - st, cl = Wd('closer', 12) - st;
    add({ id: 'S13', at: st, tod: (lt) => 0.3 + 0.2 * eio(clamp(lt / 2)), camPath: [{ t: 0, x: 570, y: 640, z: 1.18 }, { t: 1.3, x: 540, y: 900, z: 1.0 }, { t: 3.4, x: 540, y: 900, z: 1.06 }], trans: { type: 'carry', axis: 'y', dir: -1, carry: (m, u) => coin(560, 960 + (0.5 - u) * 300, 1.8, u * 16) }, note: '+45 +20 +35 → $100 lock on "hundred"', draw(lt, d, t) {
      K.livingRoom({});
      const pills = ['+$45', '+$20', '+$35'];
      pills.forEach((p, k) => { const t0 = 0.1 + k * 0.18, fly = eio(seg(lt, hu - 0.55, hu - 0.1)); if (lt < t0 || fly >= 1) return;
        moneyPill(p, lerp(250 + k * 290, 600, fly), lerp(680, 440, fly), eob(seg(lt, t0, t0 + 0.25)) * 0.8 * (1 - fly * 0.6)); });
      if (lt > hu) for (let i = 0; i < 9; i++) { const u = lt - hu - i * 0.12; if (u < 0) continue; const land = 1440 + rnd(i) * 40; let y = -80 + 1300 * u * u, sp = u * 9 + i; if (y > land) { y = land; sp = 0; } coin(160 + rnd(i + 11) * 760, y, 0.9, sp); }
      if (lt > hu - 0.55) FX.counter(600, 440, 240, lt, hu - 0.55, hu, 0, 100, { pre: '$', color: P.gold });
      const jump = lt > hu ? Math.abs(Math.sin((lt - hu) * 7)) * 50 * Math.exp(-(lt - hu) * 1.5) : 0;
      K.person({ x: 330, y: GROUND - jump, h: 840, mood: lt > hu - 0.1 ? 'happy' : 'determined', look: [0.6, -1], blink: blink(t), arms: lt > hu ? { L: [160, 10], R: [160, 10] } : { L: [-6, 14], R: [40, 60] } });
      if (lt > cl) K.counterPill('CLOSER THAN YOU THINK', 600, 720, eob(seg(lt, cl, cl + 0.28)));
    } });
    cue(st - 0.14, 'whoosh'); cue(st + 0.1, 'pop', { gain: 0.5 }); cue(st + 0.28, 'pop', { gain: 0.5 }); cue(st + 0.46, 'pop', { gain: 0.5 });
    cue(st + hu - 0.5, 'slide', { gain: 0.35, dur: 0.35 }); cue(st + hu, 'slam'); cue(st + cl, 'pop', { gain: 0.6 });
    KICKS.push({ t: st + hu, a: 0.1, shake: 16 }); FLASHES.push({ t: st + hu, a: 0.35 }); LEAKS.push(st + hu); }

  // S14 · FOLLOW: iris opens on the follow card, button pulses, disclaimer below
  { const st = cut(13), fo = Wd('follow', 13) - st;
    add({ id: 'S14', at: st, cam: [540, 860], zoom: 0.04, tod: 0.5, trans: { type: 'portal', x: 600, y: 440, r: 130, edge: 'none' }, note: 'follow card with pulsing button + disclaimer', draw(lt, d, t) {
      K.livingRoom({}); tint('rgba(28,28,34,0.45)');
      const pop = eob(seg(lt, -0.22, 0.2));   // already open while the portal reveals it
      ctx.save(); ctx.translate(540, 780); ctx.scale(pop, pop); ctx.translate(-540, -780);
      rr(168, 448, 760, 680, 48); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); rr(160, 440, 760, 680, 48); ctx.fillStyle = P.navy; ctx.fill();
      coin(540, 560, 1.1, lt * 4);
      txt('FOLLOW', 540, 710, 130, P.gold, 'center', 660); txt('FOR MORE', 540, 830, 92, P.white, 'center', 660);
      const pulse = 1 + 0.04 * Math.sin(lt * TAU * 2);
      for (let k = 0; k < 2; k++) { const u = ((lt - 0.4) * 1.4 + k * 0.5) % 1; if (lt < 0.4) break; ctx.save(); ctx.translate(540, 950); ctx.scale(1 + u * 0.35, 1 + u * 0.6); rr(-230, -60, 460, 120, 60); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(242,178,62,${1 - u})`; ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.translate(540, 950); ctx.scale(pulse, pulse); rr(-230, -60, 460, 120, 60); ctx.fillStyle = P.red; ctx.fill(); txt('+ FOLLOW', 0, 4, 64, P.white); ctx.restore();
      txt('Not financial advice · amounts are examples', 540, 1072, 30, 'rgba(255,255,255,0.85)', 'center', 620);
      ctx.restore();
      K.person({ x: 230, y: 1510, h: 330, mood: 'happy', look: [1, -0.5], arms: { L: [-6, 14], R: [150 + Math.sin(lt * 10) * 20, 20] } });
    } });
    cue(st - 0.17, 'whoosh'); cue(st + 0.1, 'pop'); cue(st + fo + 0.3, 'pop', { gain: 0.5 }); }

  return { shots: S, cues: CUES, kicks: KICKS, flashes: FLASHES, leaks: LEAKS };
}
