// Cricket components for Inside Out (flat fills, one darker shade, one light highlight, ink outlines on graphics only).
// Two generic teams: blue (India) and green (Pakistan). No logos, no real players.
import { ctx, C, W, H, TAU, lerp, clamp, rnd, rr, circle, ell, line, fillAll } from './lib.js';

export const IND = ['#3A7BD5', '#2F67BE'];
export const PAK = ['#1F8A4C', '#17703D'];
export const GRASS = '#7CC36E', GRASS2 = '#6BB25E', PITCH = '#E3CF9A', STEEL = '#AEB7C2', STEEL2 = '#8E99A6', GOLD = '#F2B632', GOLD2 = '#D69A1C';

/** stadium: sky, stands with a bobbing crowd (blue + green dots), outfield, pitch strip. night 0..1 darkens the sky */
export function stadium(t, o = {}) {
  const night = o.night || 0, horizon = o.horizon ?? 760;
  fillAll(night > 0.5 ? '#1B2440' : C.sky);
  if (night > 0 && night <= 0.5) { ctx.globalAlpha = night * 2; fillAll('#1B2440'); ctx.globalAlpha = 1; }
  // floodlight towers
  for (const x of [120, 960]) {
    ctx.fillStyle = '#5B6475'; ctx.fillRect(x - 10, 120, 20, horizon - 200);
    rr(x - 70, 80, 140, 70, 10); ctx.fillStyle = '#3C4352'; ctx.fill();
    for (let i = 0; i < 4; i++) circle(x - 48 + i * 32, 115, 11, o.lights ? '#FFF6C8' : '#CCD3DD');
    if (o.lights) { ctx.save(); ctx.globalAlpha = 0.18 * o.lights; ctx.beginPath(); ctx.moveTo(x - 60, 130); ctx.lineTo(x + 60, 130); ctx.lineTo(540 + (x < 540 ? 200 : -200), horizon + 300); ctx.lineTo(540 + (x < 540 ? -100 : 100), horizon + 300); ctx.closePath(); ctx.fillStyle = '#FFF6C8'; ctx.fill(); ctx.restore(); }
  }
  // stands: three tiers with crowd heads
  const tiers = [[horizon - 330, '#C9CFDA'], [horizon - 220, '#B7BECB'], [horizon - 110, '#A6AEBD']];
  tiers.forEach(([y, col], k) => {
    ctx.fillStyle = col; ctx.fillRect(-300, y, W + 600, 112);
    for (let i = 0; i < 30; i++) {
      const x = -60 + i * 41 + (k % 2) * 20, wave = o.wave ? Math.max(0, Math.sin(t * 6 - i * 0.35 + k)) * 26 * o.wave : 0;
      const bob = Math.sin(t * 5 + i * 1.7 + k) * 4 + wave, team = o.crowd === 'blue' ? 0 : (rnd(i * 3 + k) < 0.5 ? 0 : 1);
      const c = team ? PAK[0] : IND[0];
      circle(x, y + 40 - bob, 15, C.skin); rr(x - 17, y + 54 - bob, 34, 50, 12); ctx.fillStyle = c; ctx.fill();
    }
  });
  // outfield + pitch
  ctx.fillStyle = GRASS; ctx.fillRect(-300, horizon, W + 600, H + 300 - horizon);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? GRASS : GRASS2; ctx.fillRect(-300, horizon + i * 150, W + 600, 75); }
  ctx.beginPath(); ctx.moveTo(470, horizon + 20); ctx.lineTo(610, horizon + 20); ctx.lineTo(760, H + 300); ctx.lineTo(320, H + 300); ctx.closePath(); ctx.fillStyle = PITCH; ctx.fill();
}

/** cricket bat: handle at (x, y), blade pointing along rot (0 = straight down). s = scale (1 ≈ 520 px long) */
export function bat(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(-14, -40, 28, 170, 12); ctx.fillStyle = C.ink; ctx.fill();
  for (let k = -30; k < 120; k += 22) { ctx.fillStyle = '#3B3B45'; ctx.fillRect(-14, k, 28, 8); }
  rr(-46, 120, 92, 360, [10, 10, 40, 40]); ctx.fillStyle = '#E9C98E'; ctx.fill();
  rr(-46, 120, 30, 360, [10, 0, 0, 40]); ctx.fillStyle = '#D6B172'; ctx.fill();
  rr(14, 150, 14, 300, 7); ctx.fillStyle = '#F6DFB0'; ctx.fill();
  ctx.restore();
}
/** cricket ball (red leather, cream seam). s = 1 ≈ 64 px */
export function ball(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circle(0, 0, 32, '#B3202E'); ell(-10, -11, 11, 7, '#E0505C', -0.6);
  ctx.strokeStyle = '#F7E6C8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(46, 0, 40, 2.5, 3.8); ctx.stroke();
  ctx.lineWidth = 2.5; for (let k = -2; k <= 2; k++) { const a = 3.15 + k * 0.22; ctx.beginPath(); ctx.moveTo(46 + Math.cos(a) * 34, Math.sin(a) * 34); ctx.lineTo(46 + Math.cos(a) * 46, Math.sin(a) * 46); ctx.stroke(); }
  ctx.restore();
}
/** stumps with bails. hit 0..1: the stumps splay and bails fly off (deterministic, seed) */
export function stumps(x, y, s = 1, hit = 0, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, 6, 90, 16, 'rgba(0,0,0,0.15)');
  const h = clamp(hit);
  [-44, 0, 44].forEach((sx, i) => {
    const a = h * (i - 1 + (rnd(seed + i) - 0.5)) * 0.55;
    ctx.save(); ctx.translate(sx, 0); ctx.rotate(a); rr(-9, -280, 18, 280, 9); ctx.fillStyle = '#F4E3BC'; ctx.fill(); rr(-9, -280, 7, 280, 4); ctx.fillStyle = '#FFF4DA'; ctx.fill(); ctx.restore();
  });
  for (let k = 0; k < 2; k++) {
    const fly = h, bx = (k ? 22 : -22) + fly * (k ? 1 : -1) * (160 + rnd(seed + 7 + k) * 120), by = -288 - Math.sin(Math.PI * Math.min(1, fly * 1.3)) * 260 + fly * 120;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(fly * (k ? 6 : -5)); rr(-26, -7, 52, 14, 7); ctx.fillStyle = '#E8C77E'; ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
/** dark scoreboard panel, w x h centred at (x, y); rows = [{ text, size, col, y }] in panel coords (y from the top) */
export function board(x, y, w, h, rows = []) {
  ctx.save(); ctx.translate(x, y);
  rr(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 34); ctx.fillStyle = '#5B6475'; ctx.fill();
  rr(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = C.navy; ctx.fill();
  ctx.globalAlpha = 0.07; for (let yy = -h / 2 + 12; yy < h / 2; yy += 14) { ctx.fillStyle = C.white; ctx.fillRect(-w / 2 + 10, yy, w - 20, 3); } ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const r of rows) { if (r.sc === 0) continue; ctx.save(); ctx.translate(0, -h / 2 + r.y); ctx.scale(r.sc ?? 1, r.sc ?? 1); ctx.font = `900 ${r.size}px Inter`; ctx.fillStyle = r.col || C.white; ctx.fillText(r.text, 0, 0); ctx.restore(); }
  ctx.restore();
}
/** a flip tile (trophy-wall card). flip 0..1 turns it from blank to its face (col, top text, big text). */
export function tile(x, y, w, h, flip, col, top, big, bigSize = 74) {
  const f = clamp(flip), sx = Math.abs(Math.cos(f * Math.PI)) || 0.02, face = f >= 0.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1 + Math.sin(f * Math.PI) * 0.06);
  rr(-w / 2, -h / 2 + 10, w, h, 22); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
  rr(-w / 2, -h / 2, w, h, 22); ctx.fillStyle = face ? col : '#D9D3C6'; ctx.fill();
  if (face) {
    rr(-w / 2, -h / 2, w, h * 0.3, [22, 22, 0, 0]); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
    ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(h * 0.17)}px Inter`; ctx.fillText(top, 0, -h / 2 + h * 0.15);
    ctx.font = `900 ${bigSize}px Inter`; ctx.fillText(big, 0, h * 0.14);
  } else { ctx.fillStyle = '#BDB5A6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.round(h * 0.4)}px Inter`; ctx.fillText(top === '?' ? '?' : '', 0, 6); }
  ctx.restore();
}
/** round rubber stamp with a word (e.g. WIN), ink ring. sc animates the slam */
export function stamp(text, x, y, r, col, rot = 0, sc = 1, a = 1) {
  if (sc <= 0 || a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  circle(0, 0, r + 10, C.ink); circle(0, 0, r, col); ctx.lineWidth = 7; ctx.strokeStyle = C.white; ctx.beginPath(); ctx.arc(0, 0, r - 16, 0, TAU); ctx.stroke();
  ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.round(r * 0.62)}px Inter`; ctx.fillText(text, 0, 4);
  ctx.restore();
}
/** numbered "REASON n" badge: yellow disc with the number, label to its right */
export function reason(n, x, y, sc = 1) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = '900 96px Inter'; const w = ctx.measureText('REASON').width;
  const tw = w + 30 + 200; ctx.translate(-tw / 2, 0);   // "REASON" then the numbered disc
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '900 96px Inter'; ctx.lineJoin = 'round'; ctx.lineWidth = 20; ctx.strokeStyle = C.ink; ctx.strokeText('REASON', 0, 6); ctx.fillStyle = C.white; ctx.fillText('REASON', 0, 6);
  const cx = w + 30 + 100; circle(cx, 0, 110, C.ink); circle(cx, 0, 98, C.yellow);
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.font = '900 150px Inter'; ctx.fillText(String(n), cx, 8);
  ctx.restore();
}
/** steel heart (grey, rivets, a moving shine). beat 0..1 */
export function steelHeart(x, y, s, beat, shine) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + beat * 0.06), s * (1 + beat * 0.06));
  const p = () => { ctx.beginPath(); ctx.moveTo(0, 70); ctx.bezierCurveTo(-150, -20, -90, -130, 0, -60); ctx.bezierCurveTo(90, -130, 150, -20, 0, 70); };
  p(); ctx.fillStyle = STEEL2; ctx.fill(); ctx.save(); ctx.translate(-5, -5); ctx.scale(0.93, 0.93); p(); ctx.fillStyle = STEEL; ctx.fill(); ctx.restore();
  ctx.save(); p(); ctx.clip(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.white; ctx.translate(lerp(-200, 200, shine), 0); ctx.rotate(0.5); ctx.fillRect(-14, -200, 28, 400); ctx.fillRect(22, -200, 10, 400); ctx.restore();
  for (const [rx, ry] of [[-70, -40], [70, -40], [-40, 20], [40, 20], [0, -20]]) circle(rx, ry, 6, STEEL2);
  ctx.restore();
}
/** heart-rate monitor line (white on navy panel), drawn on to p, steady beats */
export function monitor(x, y, w, h, p, t) {
  ctx.save(); ctx.translate(x, y);
  rr(-w / 2, -h / 2, w, h, 26); ctx.fillStyle = C.navy; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#5B6475'; ctx.stroke();
  ctx.beginPath(); const x0 = -w / 2 + 30, x1 = lerp(x0, w / 2 - 30, clamp(p));
  for (let xx = x0; xx <= x1; xx += 6) { const u = ((xx - x0) / 160) % 1; let yy = 0; if (u > 0.45 && u < 0.5) yy = -(u - 0.45) * 1400; else if (u >= 0.5 && u < 0.56) yy = -70 + (u - 0.5) * 2600; else if (u >= 0.56 && u < 0.6) yy = 86 - (u - 0.56) * 2150; xx === x0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); }
  ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.stroke();
  if (p > 0 && p < 1) circle(x1, 0, 12, C.yellow);
  ctx.restore();
}
/** glass cracks spreading from (x, y), p 0..1 */
export function cracks(x, y, p, seed = 3) {
  if (p <= 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + rnd(seed + i) * 0.5, L = (240 + rnd(seed + i + 20) * 200) * clamp(p * 1.4 - rnd(i + 3) * 0.3);
    const pts = [[x, y]]; let px = x, py = y;
    for (let k = 1; k <= 5; k++) { const d = L / 5, aa = a + (rnd(seed + i * 7 + k) - 0.5) * 0.7; px += Math.cos(aa) * d; py += Math.sin(aa) * d; pts.push([px, py]); }
    line(pts, C.white, 9); line(pts, C.ink, 4);
  }
  ctx.globalAlpha = 0.9; circle(x, y, 40 * clamp(p * 3), C.white); ctx.restore();
}
/** gold medal on a ribbon hanging from (x, y0) to the disc at (x, y); swing = angle */
export function medal(x, y0, len, swing, s = 1, text = '1') {
  ctx.save(); ctx.translate(x, y0); ctx.rotate(swing);
  ctx.beginPath(); ctx.moveTo(-60, -40); ctx.lineTo(-24, len - 80); ctx.lineTo(24, len - 80); ctx.lineTo(60, -40); ctx.closePath(); ctx.fillStyle = IND[0]; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -40); ctx.lineTo(-6, len - 80); ctx.lineTo(6, len - 80); ctx.lineTo(20, -40); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
  ctx.translate(0, len); ctx.scale(s, s);
  circle(0, 0, 150, GOLD2); circle(0, 0, 132, GOLD); circle(0, 0, 100, GOLD2); circle(0, 0, 92, GOLD);
  ell(-60, -70, 34, 16, '#FFE08A', -0.7);
  ctx.fillStyle = '#B07A10'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 120px Inter'; ctx.fillText(text, 0, 8);
  ctx.restore();
}
/** firework bursts: deterministic, born at times in `at` (film-local seconds) */
export function fireworks(lt, at, cols = [C.yellow, IND[0], C.white]) {
  ctx.save(); ctx.lineCap = 'round';
  at.forEach(([t0, x, y], k) => {
    const u = (lt - t0) / 1.3; if (u <= 0 || u >= 1) return;
    const r = 60 + 260 * (1 - Math.pow(1 - u, 3)); ctx.globalAlpha = 1 - u; ctx.strokeStyle = cols[k % cols.length]; ctx.lineWidth = 12 * (1 - u) + 3;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + k; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7 + u * 40); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r + u * 60); ctx.stroke(); }
  });
  ctx.restore();
}
/** confetti rain (flat rects), from lt0, team colours */
export function confetti(lt, lt0, cols) {
  if (lt < lt0) return;
  for (let i = 0; i < 46; i++) {
    const u = lt - lt0 - rnd(i) * 0.4; if (u < 0) continue;
    const x = rnd(i + 3) * 1080 + Math.sin(u * 3 + i) * 40, y = -60 + u * (420 + rnd(i + 9) * 260);
    if (y > 1250) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(u * 5 + i); ctx.scale(1, Math.cos(u * 8 + i)); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-14, -8, 28, 16); ctx.restore();
  }
}
/** "?" mark that bounces in at lt0 */
export function qmark(x, y, size, sc, rot = 0) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.18; ctx.strokeStyle = C.ink; ctx.strokeText('?', 0, 0); ctx.fillStyle = C.yellow; ctx.fillText('?', 0, 0); ctx.restore();
}
