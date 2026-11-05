// Medieval kit for the Tall Tale world (bow vs crossbow).
//   battlefield(E) -> { scene, sun, weather(k), rain, ... }   a wide field; weather(0..1) turns sunny → storm
//   crossbow3D() .set({ pull, crank, sag, loaded })   ·  arrow3D(col) · bolt3D()  ·  target()  ·  tallyBoard(label, col) .show(n)
//   wagon()  ·  pavise()  ·  flag(col) .update(t, up)  ·  stakes(n)  ·  rain(scene) .update(t, amount, around)
//   longbow3D()  ·  rack()  ·  noticePost(lines)  ·  parchment() .write(k, seal)  ·  quill()  ·  puffs(scene) .update(t, list)
//   Crow: 2D cut-out bird ( .set({ mood, tilt, flap, nod }) , .face(cam) )
//   HP: hand props for Toons: longbow({ strung, pull, arrow }), crossbow({ spanned, crank }), gun, coil
import * as THREE from 'three';
import { T, mat, canvasTex, sky, sunlight, clouds, hills, tree, fence } from './world.js';
import { Toon, INK, shadeOf } from './toon.js';

const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const box = (w, h, d, m, x = 0, y = 0, z = 0, parent) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; if (parent) parent.add(b); return b; };
const cyl = (r1, r2, h, m, x, y, z, parent, seg = 14) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; if (parent) parent.add(c); return c; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const WOOD = '#9A6337', DARKWOOD = '#6B4226', STEEL = '#AEB6C2';
export const RED = '#C8343F', BLUE = '#3C6FB6';

// ───────── hand props (2D, drawn into a Toon's canvas at the hand) ─────────
export const HP = {
  /** a longbow held upright in the hand. strung: string on; pull 0..1 draws the string back (toward +x); arrow: nocked */
  longbow: ({ strung = true, pull = 0, arrow = false } = {}) => (g, x, y) => {
    const top = y - 330, bot = y + 330, bend = strung ? 46 + pull * 40 : 14;
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x - bend * 2, y, x, bot); g.stroke();
    g.strokeStyle = '#C08A4E'; g.lineWidth = 13; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x - bend * 2, y, x, bot); g.stroke();
    g.fillStyle = '#5A3A26'; g.fillRect(x - bend - 14, y - 26, 28, 52);
    const sx = x + pull * 120;
    if (strung) { g.strokeStyle = '#F2E6C8'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, top); g.lineTo(sx, y); g.lineTo(x, bot); g.stroke(); }
    else { g.strokeStyle = '#F2E6C8'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x + 40, y - 120, x + 20, y + 10); g.stroke(); }
    if (arrow) { g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(sx, y); g.lineTo(x - bend - 120, y); g.stroke(); g.strokeStyle = '#D9C49A'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#7C8590'; g.beginPath(); g.moveTo(x - bend - 150, y); g.lineTo(x - bend - 115, y - 14); g.lineTo(x - bend - 115, y + 14); g.closePath(); g.fill();
      g.fillStyle = '#F4EFE4'; g.beginPath(); g.moveTo(sx - 6, y); g.lineTo(sx + 34, y - 20); g.lineTo(sx + 44, y); g.lineTo(sx + 34, y + 20); g.closePath(); g.fill(); }
  },
  /** a crossbow held across the chest; spanned: string back; crank 0..1 shows the windlass handle turning */
  crossbow: ({ spanned = true, crank = -1, wet = 0 } = {}) => (g, x, y) => {
    g.lineCap = 'round';
    g.fillStyle = '#8A5A34'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(x - 150, y - 16, 230, 32, 10); g.fill(); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 18; g.beginPath(); g.moveTo(x - 140, y - 120); g.quadraticCurveTo(x - 196, y, x - 140, y + 120); g.stroke();
    g.strokeStyle = STEEL; g.lineWidth = 10; g.stroke();
    const nx = spanned ? x - 40 : x - 150;
    g.strokeStyle = '#F2E6C8'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 140, y - 120);
    if (wet > 0) g.quadraticCurveTo(nx + 30, y - 40 + wet * 40, nx, y + wet * 30); else g.lineTo(nx, y);
    if (wet > 0) g.quadraticCurveTo(nx + 30, y + 40 + wet * 40, x - 140, y + 120); else g.lineTo(x - 140, y + 120); g.stroke();
    if (crank >= 0) { const a = crank * Math.PI * 2; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(x + 80, y); g.lineTo(x + 80 + Math.cos(a) * 46, y + Math.sin(a) * 46); g.stroke();
      g.fillStyle = '#C08A4E'; g.beginPath(); g.arc(x + 80 + Math.cos(a) * 46, y + Math.sin(a) * 46, 11, 0, 7); g.fill(); g.stroke(); }
  },
  gun: (g, x, y) => {
    g.save(); g.translate(x, y); g.rotate(-0.12); g.strokeStyle = INK; g.lineWidth = 6;
    g.fillStyle = '#7A4A2A'; g.beginPath(); g.moveTo(40, -18); g.lineTo(150, -24); g.lineTo(170, 30); g.lineTo(110, 14); g.lineTo(30, 18); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#4A4E58'; g.beginPath(); g.roundRect(-280, -14, 330, 20, 6); g.fill(); g.stroke(); g.fillStyle = '#C9A13B'; g.fillRect(-10, -20, 24, 30); g.strokeRect(-10, -20, 24, 30); g.restore();
  },
  coil: (g, x, y) => { g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.ellipse(x, y - 30, 40, 26, 0, 0, 7); g.stroke(); g.strokeStyle = '#EBDDB4'; g.lineWidth = 5; g.stroke(); g.beginPath(); g.ellipse(x + 4, y - 32, 28, 17, 0.2, 0, 7); g.stroke(); },
};

// ───────── the crow witness (2D cut-out) ─────────
function drawCrow(g, s) {
  const { mood = 'neutral', tilt = 0, flap = 0, nod = 0, blink = 0 } = s;
  g.save(); g.translate(256, 300); g.rotate(tilt);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 8;
  // feet
  g.strokeStyle = '#E2A43A'; g.lineWidth = 9; [-28, 28].forEach((dx) => { g.beginPath(); g.moveTo(dx, 150); g.lineTo(dx, 200); g.moveTo(dx - 20, 204); g.lineTo(dx + 22, 204); g.stroke(); });
  // tail
  g.strokeStyle = INK; g.lineWidth = 8; g.fillStyle = '#2A2638'; g.beginPath(); g.moveTo(-30, 120); g.lineTo(-120, 190); g.lineTo(-70, 200); g.lineTo(-20, 150); g.closePath(); g.fill(); g.stroke();
  // body
  g.fillStyle = '#34304A'; g.beginPath(); g.ellipse(0, 70, 100, 110, 0, 0, 7); g.fill(); g.stroke();
  // wings (flap lifts them)
  [-1, 1].forEach((sd) => { g.save(); g.translate(sd * 70, 40); g.rotate(sd * (0.25 + flap * 1.2)); g.fillStyle = '#2A2638'; g.beginPath(); g.ellipse(sd * 20, 50, 40, 90, sd * 0.2, 0, 7); g.fill(); g.stroke(); g.restore(); });
  // head
  g.translate(0, -60 + nod * 22);
  g.fillStyle = '#34304A'; g.beginPath(); g.arc(0, 0, 86, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#E2A43A'; g.beginPath(); g.moveTo(-6, 16); g.lineTo(118, 34); g.lineTo(-6, 58); g.closePath(); g.fill(); g.stroke();
  const eyeR = mood === 'shock' ? 26 : 18;
  [-30, 34].forEach((ex) => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(ex, -12, eyeR + 8, 0, 7); g.fill(); g.lineWidth = 6; g.stroke();
    if (blink > 0.5 || mood === 'happy') { g.lineWidth = 7; g.beginPath(); g.arc(ex, -6, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else { g.fillStyle = INK; g.beginPath(); g.arc(ex + 4, -12, mood === 'shock' ? 8 : 11, 0, 7); g.fill(); }
    if (mood === 'meh') { g.fillStyle = '#34304A'; g.fillRect(ex - eyeR - 10, -48, eyeR * 2 + 20, 30); g.lineWidth = 6; g.beginPath(); g.moveTo(ex - eyeR - 4, -18); g.lineTo(ex + eyeR + 4, -18); g.stroke(); }
  });
  g.lineWidth = 9; g.beginPath();
  if (mood === 'shock') { g.moveTo(-58, -70); g.lineTo(-10, -84); g.moveTo(14, -84); g.lineTo(62, -70); }
  else if (mood === 'meh') { g.moveTo(-56, -52); g.lineTo(-6, -50); g.moveTo(12, -50); g.lineTo(64, -52); }
  else { g.moveTo(-56, -56); g.lineTo(-8, -64); g.moveTo(16, -64); g.lineTo(64, -56); }
  g.stroke();
  g.restore();
}
export class Crow {
  constructor(size = 0.5) {
    this.canvas = document.createElement('canvas'); this.canvas.width = this.canvas.height = 512; this.g = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(size, size); geo.translate(0, size / 2 - size * 0.02, 0);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, toneMapped: false }));
    this.mesh.castShadow = true; this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    this.group = new THREE.Group(); this.pivot = new THREE.Group(); this.pivot.add(this.mesh); this.group.add(this.pivot); this.key = ''; this.set({});
  }
  set(s) { const k = JSON.stringify(s, (a, v) => (typeof v === 'number' ? Math.round(v * 50) / 50 : v)); if (k === this.key) return this; this.key = k;
    this.g.clearRect(0, 0, 512, 512); this.g.save(); this.g.translate(0, 40); drawCrow(this.g, s); this.g.restore(); this.tex.needsUpdate = true; return this; }
  face(cam) { const p = new THREE.Vector3(); this.group.getWorldPosition(p); this.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - this.group.rotation.y; return this; }
  at(x, y, z) { this.group.position.set(x, y, z); return this; }
}
/** the crow drawn flat in screen space (2D shots) */
export function crow2D(g, x, y, s, st) { g.save(); g.translate(x - 256 * s, y - 300 * s); g.scale(s, s); drawCrow(g, st); g.restore(); }

// ───────── weapons ─────────
const bowCurve = (half, bend) => new THREE.QuadraticBezierCurve3(V3(0, half, 0), V3(-bend, 0, 0), V3(0, -half, 0));
/** a crossbow on its own, pointing along -x. Stock from x 0.35 (butt) to x -0.45 (front); the prod crosses at the front. */
export function crossbow3D() {
  const g = new THREE.Group(), wood = mat({ map: T.planks('#8A5A34', [0.3, 1]), color: '#C89A6A' }), steel = mat({ color: STEEL, metalness: 0.7, roughness: 0.3 });
  box(0.9, 0.07, 0.07, wood, -0.05, 0, 0, g);                                    // stock (tiller)
  box(0.22, 0.12, 0.06, wood, 0.34, -0.04, 0, g).rotation.z = 0.25;              // butt
  const prodPts = new THREE.QuadraticBezierCurve3(V3(-0.42, 0, 0.36), V3(-0.56, 0, 0), V3(-0.42, 0, -0.36));
  const prod = new THREE.Mesh(new THREE.TubeGeometry(prodPts, 24, 0.018, 8), steel); prod.castShadow = true; g.add(prod);
  cyl(0.03, 0.03, 0.1, steel, -0.47, 0, 0, g, 8).rotation.z = Math.PI / 2;
  // windlass crank at the butt
  const crank = new THREE.Group(); crank.position.set(0.42, 0.02, 0); g.add(crank);
  cyl(0.035, 0.035, 0.22, steel, 0, 0, 0, crank, 10).rotation.x = Math.PI / 2;
  [-1, 1].forEach((s) => { const arm = box(0.02, 0.16, 0.02, steel, 0, 0.08 * s, 0.12 * s, crank); const knob = cyl(0.022, 0.022, 0.07, wood, 0, 0.16 * s, 0.12 * s + 0.03 * s, crank, 8); knob.rotation.x = Math.PI / 2; });
  // the string: two thin cylinders from the prod tips to the nock point
  const sm = new THREE.MeshStandardMaterial({ color: '#F2E6C8', roughness: 0.9 });
  const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 5), sm), s2 = s1.clone(); g.add(s1, s2);
  const bolt = bolt3D(); bolt.scale.setScalar(0.85); g.add(bolt);
  const tipA = V3(-0.42, 0, 0.36), tipB = V3(-0.42, 0, -0.36), seg = (m, a, b) => { const mid = a.clone().add(b).multiplyScalar(0.5); m.position.copy(mid); m.scale.set(1, a.distanceTo(b), 1); m.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize()); };
  g.set = ({ pull = 1, crank: c = 0, sag = 0, loaded = true } = {}) => {
    const nx = lerp(-0.42, 0.06, pull), nock = V3(nx - sag * 0.08, -sag * 0.22, 0);
    if (sag > 0) { const mA = V3(lerp(-0.42, nx, 0.5) + 0.02, -sag * 0.12, 0.18), mB = mA.clone().setZ(-0.18); seg(s1, tipA, nock); seg(s2, tipB, nock); s1.position.y -= sag * 0.05; s2.position.y -= sag * 0.05; }
    else { seg(s1, tipA, nock); seg(s2, tipB, nock); }
    crank.rotation.z = c * Math.PI * 2; bolt.visible = loaded; bolt.position.set(nx - 0.2, 0.05, 0); bolt.rotation.set(0, 0, 0);
    return g;
  };
  g.set({}); g.boltAt = () => bolt.getWorldPosition(new THREE.Vector3()); return g;
}
/** a crossbow bolt pointing along -x, ~0.4 m */
export function bolt3D() {
  const g = new THREE.Group();
  cyl(0.012, 0.012, 0.4, mat({ color: '#B98A55' }), 0, 0, 0, g, 6).rotation.z = Math.PI / 2;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), mat({ color: '#6E7680', metalness: 0.6, roughness: 0.4 })); head.rotation.z = Math.PI / 2; head.position.x = -0.24; head.castShadow = true; g.add(head);
  [0, 1].forEach((i) => { const f = box(0.08, 0.004, 0.04, mat({ color: '#2E2A3A' }), 0.17, 0, 0, g); f.rotation.x = i * Math.PI / 2; });
  return g;
}
/** a longbow arrow pointing along -z, ~0.8 m, red or white fletching */
export function arrow3D(col = '#F4EFE4') {
  const g = new THREE.Group();
  const s = cyl(0.01, 0.01, 0.8, mat({ color: '#D9C49A' }), 0, 0, 0, g, 5); s.rotation.x = Math.PI / 2;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.09, 4), mat({ color: '#6E7680', metalness: 0.6, roughness: 0.4 })); head.rotation.x = -Math.PI / 2; head.position.z = -0.44; g.add(head);
  [0, 1, 2].forEach((i) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.12), new THREE.MeshStandardMaterial({ color: i === 0 ? RED : col, side: THREE.DoubleSide })); f.position.set(Math.cos(i * 2.1) * 0.02, Math.sin(i * 2.1) * 0.02, 0.33); f.rotation.set(Math.PI / 2, 0, i * 2.1); g.add(f); });
  return g;
}
/** a longbow as a 3D object (for racks), standing along y, ~1.8 m */
export function longbow3D(strung = false) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.TubeGeometry(bowCurve(0.9, strung ? 0.22 : 0.08), 24, 0.022, 8), mat({ color: '#C08A4E' })); m.castShadow = true; g.add(m);
  box(0.06, 0.16, 0.06, mat({ color: '#5A3A26' }), -(strung ? 0.11 : 0.04), 0, 0, g);
  if (strung) { const s = cyl(0.004, 0.004, 1.8, new THREE.MeshStandardMaterial({ color: '#F2E6C8' }), 0.0, 0, 0, g, 4); }
  return g;
}

// ───────── field pieces ─────────
const ringsTex = () => canvasTex('rings', 256, 256, (g, w) => {
  const c = w / 2; [['#F4EFE4', 124], [INK, 104], ['#3C6FB6', 92], ['#D8343F', 66], ['#F2C230', 38]].forEach(([col, r]) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); });
  g.strokeStyle = 'rgba(120,80,30,0.35)'; g.lineWidth = 2; for (let i = 0; i < 160; i++) { const a = rnd(i) * 6.28, r = rnd(i + 9) * 122; g.beginPath(); g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); g.lineTo(c + Math.cos(a + 0.2) * (r + 8), c + Math.sin(a + 0.2) * (r + 8)); g.stroke(); }
});
/** a straw archery butt on a stand, face toward +z (or rotate). Face centre at y 1.25. g.stuck(list) shows arrows in it */
export function target() {
  const g = new THREE.Group(), straw = mat({ color: '#D9B65A', map: T.dirt('#D9B65A', [1, 1], false) });
  const disc = cyl(0.62, 0.62, 0.32, [straw, mat({ map: ringsTex() }), straw], 0, 1.25, 0, g, 28); disc.rotation.x = Math.PI / 2; disc.material[1].map.center.set(0.5, 0.5);
  [[-0.4, 0.25], [0.4, 0.25], [0, -0.45]].forEach(([x, z]) => { const l = box(0.08, 1.4, 0.08, mat({ color: DARKWOOD }), x * 0.9, 0.62, z, g); l.rotation.x = z > 0 ? 0.25 : -0.4; });
  const stuck = []; for (let i = 0; i < 6; i++) { const a = arrow3D(); a.visible = false; g.add(a); stuck.push(a); }
  g.stuck = (list) => stuck.forEach((a, i) => { const s = list[i]; a.visible = !!s; if (s) { a.position.set(s[0], 1.25 + s[1], 0.55); a.rotation.set(s[2] || 0.05, s[3] || 0.04, 0); } });
  g.face = V3(0, 1.25, 0.17);
  return g;
}
/** a wooden tally board on two posts. g.show(n, flip) redraws the number (flip 0..1 flips the card) */
export function tallyBoard(label, col) {
  const g = new THREE.Group(), w = 1.3, h = 1.05;
  [-0.55, 0.55].forEach((x) => box(0.1, 2.6, 0.1, mat({ map: T.planks(DARKWOOD, [0.2, 1]) }), x, 1.3, -0.05, g));
  const c = document.createElement('canvas'); c.width = 520; c.height = 420; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); face.position.set(0, 1.95, 0.01); face.castShadow = true; g.add(face);
  box(w + 0.12, h + 0.12, 0.06, mat({ map: T.planks(WOOD, [0.5, 0.5]) }), 0, 1.95, -0.03, g);
  const plank = T.planks('#B07A48').image;
  let last = '';
  g.show = (n, flip = 0) => {
    const key = n + ':' + Math.round(flip * 20); if (key === last) return; last = key;
    const x = c.getContext('2d'); x.drawImage(plank, 0, 0, 520, 420);
    x.fillStyle = col; x.fillRect(0, 0, 520, 112); x.fillStyle = '#FFFFFF'; x.font = '900 54px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 260, 60);
    x.fillStyle = '#F4EBD6'; x.strokeStyle = INK; x.lineWidth = 8; x.beginPath(); x.roundRect(110, 140, 300, 250, 18); x.fill(); x.stroke();
    x.save(); x.translate(260, 265); x.scale(1, Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)))); x.fillStyle = INK; x.font = '900 210px Inter'; x.fillText(String(n), 0, 10); x.restore();
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(110, 262, 300, 6);
    x.fillStyle = INK; x.font = '800 34px Inter'; x.fillText('PER MINUTE', 260, 405 - 2);
    tex.needsUpdate = true;
  };
  g.show('?'); return g;
}
/** a tall standing pavise shield (blue, white chevron) */
export function pavise() {
  const tx = canvasTex('pavise', 200, 360, (g) => { g.fillStyle = BLUE; g.fillRect(0, 0, 200, 360); g.fillStyle = '#F4EFE4'; g.beginPath(); g.moveTo(0, 220); g.lineTo(100, 120); g.lineTo(200, 220); g.lineTo(200, 270); g.lineTo(100, 170); g.lineTo(0, 270); g.fill(); g.strokeStyle = shadeOf(BLUE, 0.6); g.lineWidth = 14; g.strokeRect(7, 7, 186, 346); });
  const g = new THREE.Group(); const m = mat({ color: shadeOf(BLUE, 0.7) });
  box(0.62, 1.15, 0.06, [m, m, m, m, mat({ map: tx }), m], 0, 0.58, 0, g); return g;
}
/** a supply wagon with pavises stacked in the back, facing +x */
export function wagon() {
  const g = new THREE.Group(), w = mat({ map: T.planks(WOOD, [1, 0.5]) }), dark = mat({ color: DARKWOOD });
  box(3.0, 0.12, 1.5, w, 0, 0.9, 0, g); box(3.0, 0.5, 0.08, w, 0, 1.2, 0.72, g); box(3.0, 0.5, 0.08, w, 0, 1.2, -0.72, g); box(0.08, 0.5, 1.5, w, -1.48, 1.2, 0, g);
  [[-1.0, 0.82], [1.0, 0.82], [-1.0, -0.82], [1.0, -0.82]].forEach(([x, z]) => { const wh = cyl(0.5, 0.5, 0.1, dark, x, 0.5, z, g, 18); wh.rotation.x = Math.PI / 2; for (let k = 0; k < 4; k++) { const sp = box(0.06, 0.9, 0.04, mat({ color: '#B98A55' }), x, 0.5, z + Math.sign(z) * 0.06, g); sp.rotation.z = k * Math.PI / 4; } });
  box(1.8, 0.08, 0.08, dark, 2.2, 0.75, 0.3, g); box(1.8, 0.08, 0.08, dark, 2.2, 0.75, -0.3, g);
  for (let i = 0; i < 7; i++) { const p = pavise(); p.position.set(-1.1 + i * 0.36, 0.96, 0.15 - (i % 2) * 0.2); p.rotation.set(-0.35 - (i % 3) * 0.06, Math.PI / 2 + (rnd(i) - 0.5) * 0.3, 0); g.add(p); }
  return g;
}
/** a row of sharpened stakes leaning toward -z */
export function stakes(n = 10, gap = 0.9) {
  const g = new THREE.Group(), m = mat({ map: T.planks('#8A6A44', [0.2, 1]) });
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.07, 1.5, 6), m); s.castShadow = true; s.position.set(i * gap + (rnd(i) - 0.5) * 0.3, 0.6, (rnd(i + 3) - 0.5) * 0.4); s.rotation.x = -0.75; g.add(s); }
  return g;
}
/** a flag on a pole; g.update(t, up 0..1 hoist, wind) */
export function flag(col = RED, emblem = '#F4EFE4') {
  const g = new THREE.Group(); cyl(0.04, 0.05, 4.2, mat({ color: DARKWOOD }), 0, 2.1, 0, g, 8);
  const tx = canvasTex('flag' + col, 256, 160, (c) => { c.fillStyle = col; c.fillRect(0, 0, 256, 160); c.fillStyle = emblem; c.fillRect(110, 0, 36, 160); c.fillRect(0, 62, 256, 36); });
  const geo = new THREE.PlaneGeometry(1.5, 0.95, 16, 4); geo.translate(0.75, 0, 0); const base = geo.attributes.position.array.slice();
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.9 })); cloth.castShadow = true; g.add(cloth);
  g.update = (t, up = 1, wind = 1) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(x * 4 - t * 9) * 0.12 * x * wind); } p.needsUpdate = true; geo.computeVertexNormals(); cloth.position.y = lerp(0.6, 3.65, up); };
  g.update(0); return g;
}
/** a wooden rack with pegs; bows can hang on it */
export function rack() {
  const g = new THREE.Group(), m = mat({ map: T.planks(DARKWOOD, [0.5, 1]) });
  [-0.9, 0.9].forEach((x) => box(0.12, 2.2, 0.12, m, x, 1.1, 0, g)); box(2.0, 0.12, 0.14, m, 0, 2.05, 0, g); box(2.0, 0.1, 0.12, m, 0, 0.5, 0, g);
  g.pegs = [-0.55, 0, 0.55].map((x) => { cyl(0.02, 0.02, 0.18, mat({ color: '#4A4E58', metalness: 0.6 }), x, 1.85, 0.1, g, 6).rotation.x = Math.PI / 2; return V3(x, 1.85, 0.16); });
  return g;
}
/** a notice board on a post with a parchment poster */
export function noticePost(lines) {
  const g = new THREE.Group(); box(0.12, 2.6, 0.12, mat({ color: DARKWOOD }), 0, 1.3, -0.06, g); box(1.3, 0.9, 0.06, mat({ map: T.planks(WOOD, [0.5, 0.5]) }), 0, 2.05, 0, g);
  const tx = canvasTex('notice' + lines.join(), 300, 220, (c) => { c.fillStyle = '#F1E2BC'; c.fillRect(0, 0, 300, 220); c.fillStyle = INK; c.textAlign = 'center'; c.font = '900 34px Caladea, Georgia, serif'; lines.forEach((l, i) => c.fillText(l, 150, 50 + i * 46)); c.fillStyle = '#B5372E'; c.beginPath(); c.arc(240, 182, 20, 0, 7); c.fill(); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), mat({ map: tx })); p.position.set(0, 2.05, 0.04); g.add(p); g.paper = p; return g;
}
/** the parchment on a desk: g.write(k 0..1, seal 0..1) writes the order line by line */
export function parchment(lines, { w = 1.5, h = 1.0, cw = 900, ch = 600, seal: SP = [735, 470] } = {}) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  const total = lines.reduce((a, l) => a + l.text.length, 0); let last = '';
  m.write = (k, seal = 0) => {
    const key = Math.round(k * 300) + ':' + Math.round(seal * 30); if (key === last) return m.pen; last = key;
    const gr = x.createRadialGradient(cw / 2, ch / 2, 100, cw / 2, ch / 2, Math.max(cw, ch) * 0.7); gr.addColorStop(0, '#F6E9C6'); gr.addColorStop(1, '#D9BE86'); x.fillStyle = gr; x.fillRect(0, 0, cw, ch);
    x.strokeStyle = 'rgba(120,80,30,0.25)'; x.lineWidth = 3; x.strokeRect(30, 30, cw - 60, ch - 60);
    let n = Math.floor(k * total), pen = null;
    lines.forEach((l) => { const s = l.text.slice(0, Math.max(0, n)); n -= l.text.length; x.fillStyle = l.col || '#2A1E14'; x.font = l.font; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      const full = x.measureText(l.text).width; x.textAlign = 'left'; const x0 = cw / 2 - full / 2; x.fillText(s, x0, l.y); if (s.length && s.length < l.text.length) pen = [x0 + x.measureText(s).width, l.y]; if (s.length === l.text.length && n <= 0 && !pen) pen = [x0 + full, l.y]; });
    if (seal > 0) { const sc = lerp(1.8, 1, Math.min(1, seal * 1.6)); x.save(); x.translate(SP[0], SP[1]); x.scale(sc, sc); x.globalAlpha = Math.min(1, seal * 2);
      x.fillStyle = '#A3242F'; x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = 70 + (i % 2) * 8; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill();
      x.strokeStyle = '#7A1820'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 50, 0, 7); x.stroke(); x.fillStyle = '#7A1820'; x.font = '900 44px Caladea, Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('E III', 0, 2); x.restore(); }
    tex.needsUpdate = true; m.pen = pen; return pen;
  };
  m.write(0); return m;
}
/** a feather quill, nib at the origin, pointing down */
export function quill() {
  const g = new THREE.Group();
  const sh = cyl(0.006, 0.012, 0.5, mat({ color: '#EDE4D0' }), 0, 0.25, 0, g, 6);
  const vane = new THREE.Shape(); vane.moveTo(0, 0.12); vane.quadraticCurveTo(0.07, 0.3, 0.02, 0.56); vane.quadraticCurveTo(-0.04, 0.32, 0, 0.12);
  const f = new THREE.Mesh(new THREE.ShapeGeometry(vane), new THREE.MeshStandardMaterial({ color: '#F7F2E6', side: THREE.DoubleSide })); f.castShadow = true; g.add(f);
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.04, 6), mat({ color: '#2A1E14' })); nib.rotation.x = Math.PI; nib.position.y = 0.0; g.add(nib);
  return g;
}

// ───────── rain + smoke puffs ─────────
export function rain(scene, n = 1600) {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.008, 0.45, 0.008), new THREE.MeshBasicMaterial({ color: '#CFE0F0', transparent: true, opacity: 0.55, depthWrite: false }), n);
  m.frustumCulled = false; scene.add(m); const M = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0, 0.06));
  m.update = (t, amount, c) => {
    m.visible = amount > 0.02; if (!m.visible) return; m.material.opacity = 0.55 * amount;
    for (let i = 0; i < n; i++) { const x = c.x + (rnd(i) - 0.5) * 24, z = c.z + (rnd(i + 1.3) - 0.5) * 24, y = 12 - ((rnd(i + 2.7) * 12 + t * 14) % 12);
      M.compose(V3(x, y, z), q, V3(1, 1, 1)); m.setMatrixAt(i, M); }
    m.instanceMatrix.needsUpdate = true;
  };
  return m;
}
let puffT = null;
const puffTex = () => { if (puffT) return puffT; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(240,236,228,0.6)'); gr.addColorStop(1, 'rgba(240,236,228,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); puffT = new THREE.CanvasTexture(c); return puffT; };
/** a pool of smoke / dust puff sprites; update(list of {p: Vector3, k: 0..1 age, s: size, col}) */
export function puffs(scene, n = 40) {
  const pool = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false })); s.visible = false; scene.add(s); pool.push(s); }
  return { update(list) { pool.forEach((s, i) => { const o = list[i]; s.visible = !!o && o.k > 0 && o.k < 1; if (!s.visible) return; s.position.copy(o.p); const sz = (o.s || 1) * (0.4 + o.k * 1.2); s.scale.set(sz, sz, 1); s.material.opacity = (1 - o.k) * 0.9; s.material.color.set(o.col || '#EDE6DA'); }); } };
}

// ───────── the battlefield ─────────
/** wide open field along -z. English (red) near z 0, Genoese (blue) far at z -28, wagons z -52. weather(0..1): sun → storm */
export function battlefield(E) {
  const scene = new THREE.Scene();
  const SKY = sky(scene, { top: '#4F8FD6', horizon: '#D9ECF2' });
  const sun = sunlight(scene, E, { pos: [10, 14, 8], box: 22, target: [0, 0, -10] });
  const hemi = sun.group.children.find((o) => o.isHemisphereLight);
  const cl = clouds(scene, [[-40, 26, -120, 18], [10, 32, -130, 24], [60, 24, -110, 16], [-80, 30, -100, 16], [30, 20, -90, 12], [-15, 22, -80, 10]]);
  const storm = clouds(scene, [[-30, 22, -70, 30], [20, 26, -80, 34], [60, 20, -60, 26], [-70, 24, -60, 26], [0, 30, -40, 30], [40, 32, -20, 30], [-40, 34, -20, 30]], '#5E6474');
  hills(scene, { z: -110, col: '#7DB85A' });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat({ map: T.grass('#74B84E', [80, 80]) })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3, 80), mat({ map: T.dirt('#B98A52', [1, 20], false) })); path.rotation.x = -Math.PI / 2; path.position.set(-14, 0.01, -30); path.receiveShadow = true; scene.add(path);
  [[-22, -8], [20, -14], [-26, -30], [24, -36], [-18, -60], [16, -64], [-30, -46], [28, -50]].forEach(([x, z], i) => { const t = tree(1.2 + rnd(i) * 0.5, '#4E9A3C', i % 3 ? 'round' : 'cypress'); t.position.set(x, 0, z); scene.add(t); });
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.03, 0.2, 3), mat({ color: '#5DA83E' }), 5000), M = new THREE.Matrix4();
  for (let i = 0; i < 5000; i++) { M.makeTranslation((rnd(i) - 0.5) * 60, 0.08, 6 - rnd(i * 2.3) * 70); tufts.setMatrixAt(i, M); } scene.add(tufts);
  const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 900);
  for (let i = 0; i < 900; i++) { M.makeTranslation((rnd(i * 5) - 0.5) * 50, 0.1, 6 - rnd(i * 7.1) * 60); fl.setMatrixAt(i, M); fl.setColorAt(i, new THREE.Color(['#F2D23A', '#FFFFFF', '#F29BB5'][i % 3])); } scene.add(fl);
  { const f = fence(14); f.position.set(-20, 0, 6); scene.add(f); }
  const st = stakes(26, 1.0); st.position.set(-13, 0, -2.2); scene.add(st);
  const R = rain(scene);
  scene.fog = new THREE.Fog('#8A93A6', 60, 400);
  const C = { top: new THREE.Color('#4F8FD6'), hor: new THREE.Color('#D9ECF2'), stop: new THREE.Color('#3E4658'), shor: new THREE.Color('#8A93A6') };
  const weather = (k) => {
    SKY.material.uniforms.top.value.copy(C.top).lerp(C.stop, k); SKY.material.uniforms.hor.value.copy(C.hor).lerp(C.shor, k);
    sun.key.intensity = lerp(2.6, 0.9, k); if (hemi) hemi.intensity = lerp(1.25, 0.95, k); sun.key.color.set('#FFF0D6').lerp(new THREE.Color('#C9D2E2'), k);
    scene.fog.near = lerp(60, 14, k); scene.fog.far = lerp(400, 90, k);
    storm.forEach((s, i) => { s.material.opacity = clamp(k * 1.6 - rnd(i) * 0.4); s.position.y = lerp(40, 22 + rnd(i) * 6, k); });
    cl.forEach((s) => (s.material.color.set('#FFFFFF').lerp(new THREE.Color('#9AA1B2'), k)));
  };
  storm.forEach((s) => (s.material.transparent = true)); weather(0);
  return { scene, sun, weather, rain: R };
}
