// FRAMING BY INVOLVEMENT (3D styles): the zoom follows who is in the beat. Never park every shot at one zoom.
//   const F = makeFraming(Toon)
//   F.fit(on, { size, yaw, pitch, fov, flex, down, lift }) -> { p, l, fov }   frames the people / objects in `on`
//      size: 'wide' (a group in its world) · 'full' (whole bodies) · 'medium' (waist up) · 'close' (head + shoulders) · 'insert'
//      yaw: camera direction around them (0 = camera on +z) · pitch: height angle · flex: how far it may turn so side-by-side
//      subjects line up in the narrow 9:16 frame · down: push the subject lower (room for a card above) · lift: raise the camera
//   F.camFit(keys, lt, lin) eases between framings [{ t, on, size, yaw, … } | { t, p, l, fov }], recomputed every frame,
//      so the camera keeps following people who move. Faces sit above the caption line with ~8% headroom.
import * as THREE from 'three';
const V3 = (x, y, z) => new THREE.Vector3(x, y, z), A3 = (a) => (a.isVector3 ? a : V3(a[0], a[1], a[2]));
const lerp = (a, b, k) => a + (b - a) * k, eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export function makeFraming(Toon) {
  const PX = (q, py) => q.H * (1000 - py) / 1024;
  const fit = (on, o = {}) => {
    const size = o.size || 'full', yaw0 = o.yaw ?? 0, flex = o.flex ?? 0.3, pitch = o.pitch ?? 0.08, fov = o.fov || 44;
    const B = new THREE.Box3(), tmp = new THREE.Box3();
    on.forEach((q) => {
      if (q instanceof Toon) { const f = q.group.getWorldPosition(new THREE.Vector3()), hy = 178 + (q.look.kid ? 190 : 0) + (q.st?.legs === 'sit' ? 210 : 0), top = PX(q, hy - 138 - 95);
        const y0 = size === 'close' ? PX(q, hy + 250) : size === 'medium' ? PX(q, hy + 470) : 0;
        tmp.min.set(f.x - 0.32, f.y + y0, f.z - 0.32); tmp.max.set(f.x + 0.32, f.y + top, f.z + 0.32); B.union(tmp); }
      else B.union(new THREE.Box3().setFromObject(q.group || q));
    });
    const c = B.getCenter(new THREE.Vector3()), vf = (fov * Math.PI) / 360, hf = Math.atan(Math.tan(vf) * 1080 / 1920);
    const fill = { wide: 0.42, full: 0.8, medium: 0.8, close: 0.78, insert: 0.8 }[size], hh = (B.max.y - B.min.y) / 2;
    const distAt = (yw) => { const R = V3(Math.cos(yw), 0, -Math.sin(yw)), F = V3(Math.sin(yw), 0, Math.cos(yw)); let w0 = 1e9, w1 = -1e9, d1 = -1e9;
      for (let i = 0; i < 8; i++) { const v = V3(i & 1 ? B.max.x : B.min.x, 0, i & 4 ? B.max.z : B.min.z).sub(c); w0 = Math.min(w0, v.dot(R)); w1 = Math.max(w1, v.dot(R)); d1 = Math.max(d1, v.dot(F)); }
      return Math.max(hh / Math.tan(vf), (w1 - w0) / 2 / Math.tan(hf)) / fill + d1; };
    let yaw = yaw0, dist = distAt(yaw0);
    for (let dy = -flex; dy <= flex + 1e-6; dy += 0.05) { const dd = distAt(yaw0 + dy); if (dd + Math.abs(dy) * 1.2 < dist + Math.abs(yaw - yaw0) * 1.2) { dist = dd; yaw = yaw0 + dy; } }
    const dir = V3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    const l = c.clone(); if (size === 'medium' || size === 'close') l.y -= hh * (0.92 / fill - 1); else if (size === 'full') l.y -= hh * 0.06;
    if (o.down) l.y += hh * o.down / fill;
    return { p: c.clone().addScaledVector(dir, dist).add(V3(0, o.lift || 0, 0)), l, fov };
  };
  const camFit = (keys, lt, lin = 0) => {
    const at = (k) => (k.p ? { p: A3(k.p), l: A3(k.l), fov: k.fov || 44 } : fit(k.on, k));
    if (lt <= keys[0].t) return at(keys[0]);
    for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (lt <= b.t) { const x = (lt - a.t) / (b.t - a.t), k = lerp(eio(x), x, lin), A = at(a), Bk = at(b);
      return { p: A.p.lerp(Bk.p, k), l: A.l.lerp(Bk.l, k), fov: lerp(A.fov, Bk.fov, k) }; } }
    return at(keys[keys.length - 1]);
  };
  return { fit, camFit };
}
