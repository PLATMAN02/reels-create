// WHY INDIA NEVER LOSES TO PAKISTAN: the shot list. Flow motion: every cut is a world hand-off (trans).
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rnd, bigText, rr, circle, fillAll } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';
import * as CK from './core/cricket.js';
import * as FX from './core/motion.js';
import { arc } from './core/flow.js';

const { IND, PAK } = CK;
const BAT_UP = { e: [236, -150], h: [170, -330] }, BAT_THRU = { e: [210, 10], h: [250, -40] };
const SCRATCH = { e: [250, -220], h: [96, -470] }, CHEER = K.ARM.wave, HIP = K.ARM.hip;
const sourceLine = (txt, y) => { ctx.save(); ctx.font = '700 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.globalAlpha = 0.6; ctx.fillText(txt, 540, y); ctx.restore(); };
const bg = (col) => fillAll(col);

export function buildShots() {
  const S = [], CUES = [], kicks = [], flashes = [], leaks = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.08);

  // ── S01 · HOOK: blue batter smashes it, WIN stamps slam in a row ─────────────
  {
    const st = 0, hit = 0.38, slams = [-0.06, Wd('doesn', 0) - 0.02, Wd('lose', 0) - 0.02, Wd('pakistan', 0) - 0.02];
    add({ id: 'S01', at: st, note: 'stadium, batter smashes the ball, WIN stamps slam on the beats',
      camPath: [{ t: 0, x: 540, y: 900, z: 1.12 }, { t: 1.2, x: 560, y: 860, z: 1.04 }, { t: 3.1, x: 540, y: 820, z: 1.1 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 760 });
        // bowler (green) at the far end: follow-through, then slumps on "Pakistan"
        const slump = lt > slams[3] ? eo(seg(lt, slams[3], slams[3] + 0.3)) : 0;
        K.man({ x: 250, y: 930 + slump * 20, s: 0.42, shirt: PAK, cap: true, arm: K.armPose(K.ARM.point, K.ARM.down, eo(seg(lt, 0, 0.5))), armL: K.ARM.down, eyes: slump > 0.3 ? 'wide' : 'n', mouth: slump > 0.3 ? 'o' : 'flat', brow: slump });
        // batter (blue): backswing → hit → follow-through, a grin after
        const sw = eio(seg(lt, hit - 0.22, hit + 0.12)), after = lt > hit;
        const pose = K.armPose(BAT_UP, BAT_THRU, sw), rot = lerp(-2.7, 1.7, sw);
        const [sqx, sqy] = FX.squash(lt, hit, 0.06);
        ctx.save(); ctx.translate(620, 1020); ctx.scale(sqx, sqy); ctx.translate(-620, -1020);
        K.man({ x: 620, y: 1020, s: 0.85, shirt: IND, cap: true, arm: pose, armL: K.armPose({ e: [-120, -60], h: [-40, -160] }, K.ARM.hip, sw), holding: (x, y) => CK.bat(x, y, 0.9, rot),
          mouth: after ? 'grin' : 'flat', eyes: 'n', brow: after ? 0.6 : 0.2 });
        ctx.restore();
        // ball: comes in, then rockets out on an arc
        if (lt < hit) { const k = seg(lt, -0.5, hit); CK.ball(lerp(-40, 470, k), lerp(780, 905, k), 0.8, lt * 12); }
        else { const k = eo(seg(lt, hit, hit + 0.9)); const [bx, by] = arc([470, 900], [1250, 180], 380, k); if (k < 1) { CK.ball(bx, by, lerp(0.8, 0.5, k), lt * 20); K.burst(470, 900, 1.4, 1 - seg(lt, hit, hit + 0.25)); } }
        // WIN stamps (frame 0 is already mid-slam)
        slams.forEach((s0, i) => { if (lt < s0) return; const p = seg(lt, s0, s0 + 0.2); CK.stamp('WIN', 210 + i * 210, 330, 82, IND[0], (rnd(i + 2) - 0.5) * 0.4, lerp(1.9, 1, FX.outExpo(p)), clamp(p * 4)); });
      } });
    cue(hit, 'crack'); cue(0, 'crowd', { dur: 3.2 }); slams.slice(1).forEach((s0) => cue(s0 + 0.12, 'thud', { gain: 0.8 }));
    kicks.push({ t: Wd('lose', 0) + 0.1, a: 0.06, shake: 10 });
  }

  // ── S02 · ODI World Cups: 8 tiles flip blue, 8–0 slams ─────────────────────
  {
    const st = cut(1), f0 = Wd('world', 1) - st, slam = Wd('eight', 1) - st - 0.02;
    const YRS = ['1992', '1996', '1999', '2003', '2011', '2015', '2019', '2023'];
    add({ id: 'S02', at: st, trans: { type: 'pass', dir: 1, shape: 'post', col: '#5B6475' }, note: 'trophy wall, 8 tiles flip blue, 8–0 slams',
      camPath: [{ t: 0, x: 560, y: 760, z: 1.08 }, { t: 2.2, x: 540, y: 820, z: 1.0 }, { t: 3.4, x: 540, y: 900, z: 1.06 }],
      draw(lt) {
        bg(C.bg);
        FX.slamText('ODI WORLD CUPS', 540, 330, 92, lt, 0.05, { color: C.white });
        YRS.forEach((y, i) => { const fl = eio(seg(lt, f0 + i * 0.16, f0 + i * 0.16 + 0.3)); CK.tile(165 + (i % 4) * 250, 560 + Math.floor(i / 4) * 250, 200, 220, fl, IND[0], y, 'WIN', 60); });
        if (lt > slam) { const p = seg(lt, slam, slam + 0.22); bigText('8 – 0', 540, 1060, 180, C.yellow, -0.03, lerp(1.6, 1, FX.outExpo(p)) * (1 + FX.wobble(lt, slam + 0.22, 0.05))); }
        sourceLine('India vs Pakistan, men’s ODI World Cups 1992–2023', 1200);
      } });
    cue(st - 0.18, 'whoosh'); YRS.forEach((_, i) => cue(st + f0 + i * 0.16 + 0.15, 'pop', { gain: 0.45 })); cue(st + slam + 0.05, 'slam');
    kicks.push({ t: st + slam + 0.05, a: 0.07, shake: 12 });
  }

  // ── S03 · four years: calendar flips 2022 → 2026, PAKISTAN WINS: 0 ─────────
  {
    const st = cut(2), once = Wd('once', 2) - st - 0.04, pk = Wd('pakistan', 2) - st;
    const YRS = ['2022', '2023', '2024', '2025', '2026'];
    add({ id: 'S03', at: st, trans: { type: 'dive', x: 540, y: 1060 }, note: 'calendar years flip, PAKISTAN WINS pill, red 0 slams on "once"',
      camPath: [{ t: 0, x: 540, y: 820, z: 1.12 }, { t: 1.2, x: 540, y: 820, z: 1.02 }, { t: 3.3, x: 540, y: 900, z: 1.08 }],
      draw(lt) {
        bg(C.bg);
        const k = Math.min(YRS.length - 1, Math.floor(clamp((lt - 0.1) / 0.85) * (YRS.length - 1) + 0.0001 + (lt > 0.95 ? 1 : 0)));
        const fl = (lt - 0.1) / 0.85 * (YRS.length - 1), fr = lt > 0.95 ? 1 : fl - Math.floor(fl), flipSc = lt > 0.95 ? 1 : Math.abs(Math.cos(Math.min(1, fr * 2.2) * Math.PI));
        ctx.save(); ctx.translate(540, 560); ctx.scale(1, Math.max(0.05, lt < 0.1 ? 1 : flipSc));
        rr(-280, -230, 560, 470, 40); ctx.fillStyle = C.white; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = C.ink; ctx.stroke();
        rr(-280, -230, 560, 130, [40, 40, 0, 0]); ctx.fillStyle = C.red; ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.white; ctx.font = '900 70px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('YEAR', 0, -164);
        ctx.fillStyle = C.ink; ctx.font = '900 200px Inter'; ctx.fillText(YRS[Math.max(0, k)], 0, 90);
        ctx.restore();
        for (const bx of [-150, 150]) { rr(540 + bx - 18, 300, 36, 70, 18); ctx.fillStyle = C.ink; ctx.fill(); }
        K.pill('PAKISTAN WINS', 540, 875, 60, PAK[0], C.white, lt > pk ? eob(seg(lt, pk, pk + 0.3)) : 0);
        if (lt > once) { const p = seg(lt, once, once + 0.2); bigText('0', 540, 1050, 200, C.red, 0, lerp(2.2, 1, FX.outExpo(p)) * (1 + FX.wobble(lt, once + 0.2, 0.08))); }
      } });
    cue(st - 0.15, 'whoosh'); for (let i = 1; i < 5; i++) cue(st + 0.1 + i * 0.85 / 4 - 0.05, 'tock', { gain: 0.7 }); cue(st + pk, 'pop'); cue(st + once + 0.06, 'slam');
    kicks.push({ t: st + once + 0.06, a: 0.09, shake: 14 }); flashes.push({ t: st + once + 0.06, a: 0.25, col: '214,40,57' });
  }

  // ── S04 · so how? green player scratches his head, blue smirks ─────────────
  {
    const st = cut(3), how = Wd('how', 3) - st, india = Wd('india', 3) - st;
    add({ id: 'S04', at: st, note: 'confused green player with bouncing ?s, smirking blue player',
      trans: { type: 'carry', dir: 1, carry: (m, u) => { const x = lerp(-80, 1160, u), y = 760 - Math.sin(Math.PI * u) * 260; m.save(); m.translate(x, y); m.rotate(u * 12); m.beginPath(); m.arc(0, 0, 46, 0, Math.PI * 2); m.fillStyle = '#B3202E'; m.fill(); m.strokeStyle = '#F7E6C8'; m.lineWidth = 6; m.beginPath(); m.arc(30, 0, 40, 2.4, 3.9); m.stroke(); m.restore(); } },
      camPath: [{ t: 0, x: 600, y: 860, z: 1.1 }, { t: 2.1, x: 500, y: 880, z: 1.02 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 700 });
        const sc = Math.sin(lt * 16) * 0.12;
        K.man({ x: 320, y: 1010, s: 0.8, shirt: PAK, cap: true, arm: K.armPose(K.ARM.down, { e: SCRATCH.e, h: [SCRATCH.h[0] + sc * 40, SCRATCH.h[1]] }, eo(seg(lt, 0, 0.35))), eyes: 'wide', mouth: 'flat', brow: 0.9, look: 0.6 });
        [[200, 450, 0], [330, 380, 0.12], [460, 450, 0.24]].forEach(([x, y, dl], i) => CK.qmark(x, y + Math.sin(lt * 5 + i) * 10, 120, eob(seg(lt, how + dl, how + dl + 0.3)), (i - 1) * 0.2));
        const sm = lt > india;
        K.man({ x: 770, y: 1010, s: 0.8, shirt: IND, cap: true, arm: HIP, armL: HIP, eyes: 'n', mouth: sm ? 'smirk' : 'smile', smirk: sm, brow: sm ? 0.4 : 0, look: -0.6 });
      } });
    cue(st - 0.2, 'whoosh'); [0, 0.12, 0.24].forEach((dl) => cue(st + how + dl, 'pop', { gain: 0.5 })); cue(st + india + 0.1, 'boing', { gain: 0.5 });
  }

  // ── S05 · reason one: nerves of steel (steel heart steady while alarms flash) ─
  {
    const st = cut(4), rs = Wd('reason', 4) - st - 0.05, steel = Wd('steel', 4) - st;
    add({ id: 'S05', at: st, trans: { type: 'smoke', x: 540, y: 900, col: '#E9E4DA', shade: '#CFC7BA' }, note: 'REASON 1, steel heart, steady monitor line, red alarms',
      camPath: [{ t: 0, x: 540, y: 800, z: 1.0 }, { t: 2.1, x: 540, y: 780, z: 1.1 }],
      draw(lt, d, t) {
        bg('#22293A');
        const al = 0.5 + 0.5 * Math.sin(lt * 9);
        ctx.save(); ctx.globalAlpha = 0.35 * al; ctx.fillStyle = C.red; ctx.fillRect(-300, -300, 340, H + 600); ctx.fillRect(1040, -300, 340, H + 600); ctx.restore();
        for (const x of [130, 950]) { circle(x, 600, 40, C.red); ctx.save(); ctx.globalAlpha = al; circle(x, 600, 60, 'rgba(214,40,57,0.5)'); ctx.restore(); }
        CK.reason(1, 540, 320, lt > rs ? eob(seg(lt, rs, rs + 0.3)) : 0);
        const beat = Math.max(0, Math.sin(lt * Math.PI * 2 * 0.9)) ** 8;
        CK.steelHeart(540, 700, 2.2 * (lt > steel ? 1 + 0.12 * Math.exp(-(lt - steel) * 6) : 1), beat, lt > steel ? eio(seg(lt, steel, steel + 0.5)) : 0);
        CK.monitor(540, 1080, 760, 190, seg(lt, 0.1, d), t);
        ctx.save(); ctx.font = '900 54px Inter'; ctx.textAlign = 'right'; ctx.fillStyle = C.white; ctx.fillText('60 BPM', 890, 960); ctx.restore();
      } });
    cue(st - 0.2, 'whoosh'); cue(st + rs + 0.1, 'thud'); cue(st, 'alarm', { dur: 1.9, gain: 0.6 }); cue(st + 0.45, 'heartbeat', { gain: 0.6 }); cue(st + 1.55, 'heartbeat', { gain: 0.6 });
    kicks.push({ t: st + steel, a: 0.05, shake: 6 });
  }

  // ── S06 · 2024: India bowled out for 119 ──────────────────────────────────
  {
    const st = cut(5), r0 = Wd('india', 5) - st, r1 = Wd('nineteen', 5) - st + 0.05, ao = Wd('nineteen', 5) - st + 0.15;
    add({ id: 'S06', at: st, trans: { type: 'portal', x: 540, y: 700, r: 120, edge: 'none' }, note: 'scoreboard 2024 New York, India runs roll to 119, ALL OUT slams; worried blue player',
      camPath: [{ t: 0, x: 540, y: 760, z: 1.0 }, { t: 2.0, x: 540, y: 720, z: 1.06 }, { t: 4.8, x: 540, y: 760, z: 1.12 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 900 });
        const runs = FX.countAt(lt, r0, r1, 0, 119), wk = Math.min(10, Math.floor(clamp((lt - r0) / (r1 - r0)) * 10));
        const out = lt > ao, outP = seg(lt, ao, ao + 0.22);
        CK.board(540, 560, 760, 520, [
          { text: '2024 · NEW YORK', size: 52, y: 70, col: '#AEB7C2' },
          { text: 'INDIA', size: 86, y: 170, col: IND[0] === '#3A7BD5' ? '#7FB0F0' : C.white },
          { text: `${runs}/${out ? 10 : wk}`, size: 190, y: 340, col: out ? C.red : C.white },
        ]);
        if (out) K.pill('ALL OUT', 540, 840, 72, C.red, C.white, lerp(1.8, 1, FX.outExpo(outP)));
        K.man({ x: 540, y: 1320, s: 0.66, shirt: IND, cap: true, arm: K.ARM.down, eyes: out ? 'wide' : 'n', mouth: out ? 'o' : 'flat', brow: out ? 1 : 0.4, sweat: out ? lt : 0, frown: !out });
      } });
    cue(st - 0.22, 'whoosh'); cue(st + r0, 'slide', { dur: r1 - r0, gain: 0.7 }); cue(st + ao + 0.04, 'slam');
    kicks.push({ t: st + ao + 0.04, a: 0.06, shake: 10 }); flashes.push({ t: st + ao + 0.04, a: 0.2, col: '214,40,57' });
  }

  // ── S07 · and still won by six ────────────────────────────────────────────
  {
    const st = cut(6), c1 = Wd('won', 6) - st, six = Wd('six', 6) - st;
    add({ id: 'S07', at: st, trans: { type: 'pass', dir: -1, shape: 'wall', col: '#5B6475' }, note: 'Pakistan chase stalls at 113/7, INDIA WON BY 6, blue player jumps',
      camPath: [{ t: 0, x: 540, y: 800, z: 1.1 }, { t: 2.2, x: 540, y: 760, z: 1.02 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 900, wave: lt > six ? 1 : 0 });
        if (lt > six) CK.confetti(lt, six, [IND[0], C.yellow, C.white]);   // behind the board: never over text
        const runs = FX.countAt(lt, 0.05, c1, 60, 113), wk = Math.round(lerp(4, 7, clamp(lt / c1)));
        CK.board(540, 560, 760, 480, [
          { text: 'PAKISTAN CHASE 120', size: 52, y: 70, col: '#AEB7C2' },
          { text: `${runs}/${wk}`, size: 190, y: 250, col: C.white },
          { text: 'SHORT BY 6', size: 64, y: 410, col: C.red, sc: lt > c1 ? eob(seg(lt, c1, c1 + 0.25)) : 0 },
        ]);
        const won = lt > six;
        if (won) K.pill('INDIA WON BY 6', 540, 900, 70, IND[0], C.white, lerp(1.8, 1, FX.outExpo(seg(lt, six, six + 0.22))));
        const jump = won ? Math.abs(Math.sin((lt - six) * 7)) * 70 : 0;
        K.man({ x: 540, y: 1420 - jump, s: 0.7, shirt: IND, cap: true, arm: won ? CHEER : K.ARM.down, armL: won ? CHEER : K.ARM.down, eyes: won ? 'closed' : 'wide', mouth: won ? 'grin' : 'o', brow: 0.8 });
      } });
    cue(st - 0.2, 'whoosh'); cue(st + 0.05, 'slide', { dur: c1 - 0.1, gain: 0.6 }); cue(st + c1 + 0.05, 'pop'); cue(st + six + 0.03, 'slam'); cue(st + six, 'crowd', { dur: 1.6, gain: 1.2 });
    kicks.push({ t: st + six + 0.03, a: 0.06, shake: 8 });
  }

  // ── S08 · reason two: Pakistan cracks ──────────────────────────────────────
  {
    const st = cut(7), rs = Wd('reason', 7) - st - 0.05, ck = Wd('cracks', 7) - st;
    add({ id: 'S08', at: st, note: 'REASON 2, nervous green player, glass wall behind him cracks on "cracks"',
      trans: { type: 'carry', dir: -1, carry: (m, u) => { const x = lerp(1140, -60, u), y = 700 - Math.sin(Math.PI * u) * 320; m.save(); m.translate(x, y); m.rotate(-u * 14); m.fillStyle = '#E8C77E'; m.beginPath(); m.roundRect(-60, -16, 120, 32, 16); m.fill(); m.restore(); } },
      camPath: [{ t: 0, x: 540, y: 820, z: 1.02 }, { t: 2.2, x: 540, y: 860, z: 1.12 }],
      draw(lt) {
        bg('#DCE7EE');
        for (let i = 0; i < 4; i++) { rr(80 + i * 240, 520, 200, 620, 14); ctx.fillStyle = '#C3D6E2'; ctx.fill(); ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = C.white; ctx.fillRect(110 + i * 240, 540, 26, 580); ctx.restore(); }
        CK.cracks(760, 760, lt > ck ? eo(seg(lt, ck, ck + 0.35)) : 0);
        CK.reason(2, 540, 320, lt > rs ? eob(seg(lt, rs, rs + 0.3)) : 0);
        const shake = Math.sin(lt * 50) * (lt > ck ? 9 : 4);
        K.man({ x: 540 + shake, y: 1130, s: 0.9, shirt: PAK, cap: true, arm: K.ARM.down, eyes: 'wide', mouth: lt > ck ? 'o' : 'flat', brow: 1, sweat: lt, frown: lt < ck });
      } });
    cue(st - 0.2, 'whoosh'); cue(st + rs + 0.1, 'thud'); cue(st + ck, 'zip', { gain: 0.7 }); cue(st + ck + 0.05, 'slam', { gain: 0.6 });
    kicks.push({ t: st + ck + 0.05, a: 0.05, shake: 12 });
  }

  // ── S09 · 2023: cruising at 155/2 (sunny, confident) ──────────────────────
  {
    const st = cut(8), r0 = Wd('cruising', 8) - st, r1 = Wd('two', 8) - st;
    add({ id: 'S09', at: st, trans: { type: 'dive', x: 540, y: 760 }, note: 'sunny scoreboard 2023 Ahmedabad, Pakistan rolls to 155/2, confident green batter',
      camPath: [{ t: 0, x: 540, y: 860, z: 1.08 }, { t: 2.4, x: 520, y: 840, z: 1.0 }, { t: 4.4, x: 540, y: 820, z: 1.05 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 860 });
        const runs = FX.countAt(lt, r0, r1, 0, 155), wk = lt < r0 ? 0 : lt < r0 + (r1 - r0) * 0.4 ? 1 : 2;
        CK.board(540, 500, 760, 420, [
          { text: '2023 · AHMEDABAD', size: 52, y: 70, col: '#AEB7C2' },
          { text: 'PAKISTAN', size: 80, y: 160, col: '#7FD6A0' },
          { text: `${runs}/${wk}`, size: 170, y: 300, col: C.white },
        ]);
        const bob = Math.sin(lt * 3) * 6;
        K.man({ x: 540, y: 1230 + bob, s: 0.72, shirt: PAK, cap: true, arm: { e: [230, -120], h: [120, -230] }, armL: HIP, holding: (x, y) => CK.bat(x, y, 0.85, -2.6 + Math.sin(lt * 3) * 0.05),
          eyes: 'n', mouth: 'grin', brow: 0.3, smirk: true });
      } });
    cue(st - 0.15, 'whoosh'); cue(st + r0, 'slide', { dur: r1 - r0, gain: 0.6 }); cue(st + r0, 'crowd', { dur: 2.2, gain: 0.8 });
  }

  // ── S10 · then lost 8 wickets for 36 (stumps explode, sunset) ──────────────
  {
    const st = cut(9), l0 = Wd('lost', 9) - st, l1 = Wd('thirty', 9) - st - 0.1, hit = Wd('thirty', 9) - st;
    add({ id: 'S10', at: st, trans: { type: 'pass', dir: 1, shape: 'post', col: IND[1], w: 520 }, note: 'stumps explode one by one, 155→191, 8 FOR 36 slams red, day → sunset', tod: (lt, d) => 0.55 * eio(clamp(lt / d)),
      camPath: [{ t: 0, x: 540, y: 820, z: 1.0 }, { t: 2.8, x: 540, y: 860, z: 1.1 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 860 });
        const n = Math.max(0, Math.min(8, Math.floor((lt - l0) / ((l1 - l0) / 8)) + 1));
        const runs = lt < l0 ? 155 : FX.countAt(lt, l0, l1, 155, 191);
        CK.board(540, 420, 760, 330, [
          { text: 'PAKISTAN', size: 76, y: 70, col: '#7FD6A0' },
          { text: `${runs}/${2 + (lt < l0 ? 0 : n)}`, size: 160, y: 215, col: n >= 8 ? C.red : C.white },
        ]);
        for (let i = 0; i < 8; i++) {
          const ti = l0 + i * (l1 - l0) / 8, h = lt > ti ? eo(seg(lt, ti, ti + 0.35)) : 0;
          CK.stumps(210 + (i % 4) * 220, 1010 + Math.floor(i / 4) * 165, 0.45, h, i * 3);
          if (h > 0 && h < 1) K.burst(210 + (i % 4) * 220, 960 + Math.floor(i / 4) * 165, 0.9, 1 - h);
        }
        if (lt > hit) { const p = seg(lt, hit, hit + 0.2); bigText('8 FOR 36', 540, 735, 120, C.red, -0.03, lerp(2, 1, FX.outExpo(p)) * (1 + FX.wobble(lt, hit + 0.2, 0.05))); }
      } });
    cue(st - 0.2, 'whoosh');
    for (let i = 0; i < 8; i++) { const ti = st + l0 + i * (l1 - l0) / 8; if (ti < st + hit - 0.3) cue(ti + 0.02, 'thud', { gain: 0.55 }); }
    cue(st + hit + 0.02, 'slam'); // ~0.3 s of near-silence before it (the last thuds are skipped)
    kicks.push({ t: st + hit + 0.02, a: 0.11, shake: 18 }); flashes.push({ t: st + hit + 0.02, a: 0.3, col: '214,40,57' });
  }

  // ── S11 · the latest: last month, Asian Games final (night, medal, fireworks) ─
  {
    const st = cut(10), q = Wd('latest', 10) - st, mo = Wd('month', 10) - st, ind = Wd('india', 11) - st - 0.1, ag = Wd('asian', 11) - st, fin = Wd('games', 11) - st + 0.1;
    const FW = [[0.2, 220, 330], [0.9, 860, 260], [mo, 300, 420], [ind + 0.2, 820, 380], [fin, 230, 300], [fin + 0.3, 880, 330], [fin + 0.8, 540, 240], [fin + 1.4, 300, 380]];
    add({ id: 'S11', at: st, trans: { type: 'smoke', x: 540, y: 600, col: '#8A90A0', shade: '#6E7486' }, note: 'night stadium, OCT 2026 card, then gold medal swings down, ASIAN GAMES FINAL, WON BY 19',
      camPath: [{ t: 0, x: 540, y: 820, z: 1.1 }, { t: ind, x: 540, y: 800, z: 1.0 }, { t: 5.3, x: 540, y: 760, z: 1.08 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 900, night: 1, lights: 1, crowd: 'blue', wave: lt > fin ? 1 : 0.3 });
        CK.fireworks(lt, FW);
        if (lt < ind + 0.5) { // calendar card for "last month"
          const away = eio(seg(lt, ind, ind + 0.45)), drop = eob(seg(lt, mo - 0.15, mo + 0.3));
          if (lt > q) CK.qmark(540, 560, 260, eob(seg(lt, q, q + 0.3)) * (1 - seg(lt, mo - 0.2, mo)), Math.sin(lt * 4) * 0.08);
          if (lt > mo - 0.15) K.calendar(540, lerp(-300, 640, drop) - away * 1300, 0.8, '3', 'OCT 2026', lerp(-0.2, -0.04, drop));
        }
        if (lt > ind) { const k = eob(seg(lt, ind, ind + 0.5)), sw = Math.sin((lt - ind) * 3.2) * 0.18 * Math.exp(-(lt - ind) * 1.2);
          ctx.save(); ctx.translate(0, lerp(-900, 0, k)); CK.medal(540, 120, 440, sw, 1, '1'); ctx.restore(); }
        const outro = 1 - eio(seg(lt, d - 0.24, d - 0.06));   // labels tuck away before the portal so nothing balloons over the caption
        K.pill('ASIAN GAMES FINAL', 540, 1000, 58, IND[0], C.white, (lt > ag ? eob(seg(lt, ag, ag + 0.3)) : 0) * outro);
        if (lt > fin && outro > 0) { const p = seg(lt, fin, fin + 0.22); bigText('WON BY 19', 540, 1130, 110, C.yellow, -0.02, lerp(1.8, 1, FX.outExpo(p)) * outro); }
      } });
    cue(st - 0.22, 'whoosh'); cue(st + q, 'pop'); cue(st + mo + 0.2, 'thud'); cue(st + ind + 0.4, 'thud', { gain: 0.6 }); cue(st + ag, 'pop'); cue(st + fin + 0.05, 'slam');
    cue(st + ind, 'crowd', { dur: d11(st), gain: 1.1 }); cue(st + fin + 0.2, 'sparkle', { dur: 0.8, gain: 0.35 });
    kicks.push({ t: st + fin + 0.05, a: 0.06, shake: 8 }); leaks.push(st + fin + 0.05);
    function d11(s) { return cut(12) - s - ind; }
  }

  // ── S12 · will Pakistan ever break the streak? (streak wall + ? tile) ──────
  {
    const st = cut(12), ev = Wd('ever', 12) - st, sk = Wd('streak', 12) - st;
    add({ id: 'S12', at: st, trans: { type: 'portal', x: 540, y: 560, r: 130, edge: 'frame', col: CK.GOLD2 }, note: 'streak wall of 7 blue T20I wins + pulsing ? tile, green player looks at camera',
      camPath: [{ t: 0, x: 540, y: 760, z: 1.08 }, { t: 2.5, x: 540, y: 800, z: 1.0 }],
      draw(lt) {
        bg(C.bg);
        FX.slamText('T20Is IN A ROW', 540, 290, 80, lt, 0.1, { color: C.white });
        for (let i = 0; i < 8; i++) {
          const x = 165 + (i % 4) * 250, y = 520 + Math.floor(i / 4) * 270, last = i === 7;
          if (!last) CK.tile(x, y, 200, 230, eio(seg(lt, 0.05 + i * 0.06, 0.35 + i * 0.06)), IND[0], 'IND', 'W', 96);
          else { const pulse = 1 + 0.06 * Math.sin(lt * 9) + (lt > sk ? 0.12 * Math.exp(-(lt - sk) * 5) : 0); ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse); ctx.rotate(FX.wobble(lt, sk, 0.12)); CK.tile(0, 0, 200, 230, 0, C.ink, '?', '?'); CK.qmark(0, 6, 130, 1); ctx.restore(); }
        }
        sourceLine('India’s last 7 T20Is vs Pakistan · ESPNcricinfo', 965);
        K.man({ x: 540, y: 1380, s: 0.68, shirt: PAK, cap: true, arm: K.armPose(K.ARM.down, { e: [240, -60], h: [300, -150] }, eo(seg(lt, ev, ev + 0.3))), armL: K.armPose(K.ARM.down, { e: [240, -60], h: [300, -150] }, eo(seg(lt, ev, ev + 0.3))), eyes: 'n', mouth: 'flat', brow: lt > ev ? 0.8 : 0.3, look: 0 });
      } });
    cue(st - 0.22, 'whoosh'); for (let i = 0; i < 7; i += 2) cue(st + 0.2 + i * 0.06, 'pop', { gain: 0.35 }); cue(st + sk, 'boing', { gain: 0.6 });
  }

  // ── S13 · follow card ────────────────────────────────────────────────────
  {
    const st = cut(13);
    add({ id: 'S13', at: st, note: 'follow card pops, button pulses, ball bounces onto it',
      trans: { type: 'carry', dir: 1, axis: 'y', carry: (m, u) => { const y = lerp(-80, 2000, u); m.save(); m.translate(540 + Math.sin(u * 6) * 60, y); m.rotate(u * 10); m.beginPath(); m.arc(0, 0, 50, 0, Math.PI * 2); m.fillStyle = '#B3202E'; m.fill(); m.restore(); } },
      camPath: [{ t: 0, x: 540, y: 800, z: 1.06 }, { t: 3, x: 540, y: 780, z: 1.0 }],
      draw(lt, d, t) {
        CK.stadium(t, { horizon: 980, night: 1, lights: 1, crowd: 'blue', wave: 0.5 });
        const p = eob(seg(lt, 0.1, 0.45));
        ctx.save(); ctx.translate(540, 640); ctx.scale(p, p);
        rr(-400, -260, 800, 520, 50); ctx.fillStyle = C.ink; ctx.fill(); rr(-390, -250, 780, 500, 44); ctx.fillStyle = C.white; ctx.fill();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink; ctx.font = '900 110px Inter'; ctx.fillText('FOLLOW', 0, -120); ctx.fillText('FOR MORE', 0, 0);
        const pulse = 1 + 0.05 * Math.sin(lt * Math.PI * 4);
        ctx.save(); ctx.translate(0, 150); ctx.scale(pulse, pulse); rr(-210, -60, 420, 120, 60); ctx.fillStyle = C.red; ctx.fill(); ctx.fillStyle = C.white; ctx.font = '900 64px Inter'; ctx.fillText('+ FOLLOW', 0, 4); ctx.restore();
        ctx.restore();
        const b = Math.abs(Math.sin(lt * 4.5)) * 160 * Math.exp(-lt * 0.4), [sx, sy] = FX.squash(lt % (Math.PI / 4.5), 0, 0.15);
        CK.ball(820, 1060 - b, 1.3, lt * 3);
        if (lt > 0.6) FX.handArrow([800, 990], [700, 900], [700, 830], eo(seg(lt, 0.6, 1.0)), C.yellow, 14);
      } });
    cue(st + 0.1, 'pop'); for (let k = 0; k < 4; k++) cue(st + k * (Math.PI / 4.5), 'thud', { gain: 0.3 * Math.exp(-k * 0.4) });
  }

  return { shots: S, cues: CUES, kicks, flashes, leaks };
}
