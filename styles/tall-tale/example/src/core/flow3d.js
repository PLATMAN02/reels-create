// FLOW MOTION, 3D side (Deep Dive, Night File, Tall Tale): camera paths that never stop and a camera that follows an
// object from one place into the next. Pair with the hand-offs in flow.js (shot.trans). Pure functions of k / t.
import * as THREE from 'three';

const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const V = (p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2]));
const curves = new WeakMap();
const curveOf = (pts) => { let c = curves.get(pts); if (!c) { c = new THREE.CatmullRomCurve3(pts.map(V), false, 'centripetal'); curves.set(pts, c); } return c; };

/** move cam along a smooth spline through pts, looking along a spline through looks (or at one point), k = 0..1 through
 *  the shot. ease: true (default) eases in and out; pass a number 0..1 to keep some speed at both ends (for hand-offs). */
export function pathCam(cam, pts, looks, k, o = {}) {
  const e = o.ease === false ? k : typeof o.ease === 'number' ? k * o.ease + eio(k) * (1 - o.ease) : eio(k);
  cam.position.copy(curveOf(pts).getPoint(Math.min(1, Math.max(0, e))));
  const target = Array.isArray(looks) && looks.length && (looks[0].isVector3 || Array.isArray(looks[0])) ? curveOf(looks).getPoint(Math.min(1, Math.max(0, e))) : V(looks);
  if (o.roll) cam.up.set(Math.sin(o.roll * k), Math.cos(o.roll * k), 0); else cam.up.set(0, 1, 0);
  cam.lookAt(target);
  return target;
}

/** chase-cam: sit behind and above an object moving along velocity vel, looking a little ahead of it.
 *  o = { back (m), up (m), side (m), ahead (m) } */
export function followCam(cam, pos, vel, o = {}) {
  const p = V(pos), v = V(vel).clone().normalize(), side = new THREE.Vector3().crossVectors(v, new THREE.Vector3(0, 1, 0)).normalize();
  cam.position.copy(p).addScaledVector(v, -(o.back ?? 3)).addScaledVector(side, o.side ?? 0).add(new THREE.Vector3(0, o.up ?? 0.8, 0));
  cam.up.set(0, 1, 0); cam.lookAt(p.clone().addScaledVector(v, o.ahead ?? 4));
}

/** a thrown or fired object's arc from a to b with apex height h, k = 0..1 → Vector3 (objects fly in arcs) */
export function ballistic(a, b, h, k) { const A = V(a), B = V(b); return A.clone().lerp(B, k).add(new THREE.Vector3(0, Math.sin(Math.PI * k) * h, 0)); }
