// Frame-exact capture through headless Chrome. No npm packages (Node 22+). Run from the project folder.
//   node tools/capture.mjs check                         boot, list shots + captions, report errors
//   node tools/capture.mjs cues                          write data/cues.json (the sound cues, for tools/mix.py)
//   node tools/capture.mjs sheet review/all.jpg [step=0.5] [cols=9]   contact sheet, a frame every `step` s, time-stamped
//   node tools/capture.mjs frames review/full "1.2,8.4"  full-size JPEGs of those times
//   node tools/capture.mjs video renders/out.mp4 [start end] [--draft]   the film (30 fps) with data/mix.wav if it exists
//   node tools/capture.mjs preview                       serve the project and print a URL to watch it in a browser
//   node tools/capture.mjs audit [review/audit] [a b]   EVERY frame (30 fps): pages of 100 thumbnails + report.txt
//        (cut-off characters, caption over a face, static stretches > 0.7 s, the 3 s hook, a visual event every 5 s).
//        Read every page and the report, fix, run it again; loop until the report is clean and every page passes.
// CHROME=/path/to/chrome overrides the browser.
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = +(process.env.FPS || 30);
const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
  '/usr/bin/chromium-browser', '/snap/bin/chromium', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => p && fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const args = process.argv.slice(2), flags = new Set(args.filter((a) => a.startsWith('--')));
const [mode, ...rest] = args.filter((a) => !a.startsWith('--'));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.otf': 'font/otf',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg' };
function serve(port = 0) {
  return new Promise((res) => {
    const srv = http.createServer((req, r) => {
      const u = decodeURIComponent(req.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(r);
    });
    srv.listen(port, '127.0.0.1', () => res(srv));
  });
}

async function openPage(port) {
  if (!CHROME) throw new Error('Chrome not found: install Google Chrome or set CHROME=/path/to/chrome');
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-chrome-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--window-size=1080,1920', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', ...(process.env.SOFTWARE_GL ? ['--use-angle=swiftshader'] : []), ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' });
  let dbg;
  for (let i = 0; i < 200 && !dbg; i++) { try { dbg = fs.readFileSync(path.join(prof, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim(); } catch { await sleep(100); } }
  if (!dbg) throw new Error('Chrome did not start');
  const r = await fetch(`http://127.0.0.1:${dbg}/json/new?${encodeURIComponent(`http://127.0.0.1:${port}/index.html?capture=1${process.env.QS || ''}`)}`, { method: 'PUT' });
  const target = await r.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map(), logs = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') logs.push('EXCEPTION ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('ERROR ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => { const x = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (x.exceptionDetails) throw new Error(x.exceptionDetails.exception?.description || x.exceptionDetails.text); return x.result.value; };
  await send('Runtime.enable');
  for (let i = 0; ; i++) {
    const st = await ev('window.OP ? (OP.bootError ? "ERR:" + OP.bootError : OP.ready) : false').catch(() => false);
    if (st === true) break;
    if (typeof st === 'string') throw new Error('boot failed: ' + st + '\n' + logs.join('\n'));
    if (i > 1200) throw new Error('boot timeout\n' + logs.join('\n'));
    await sleep(100);
  }
  const close = () => { try { ws.close(); } catch {} chrome.kill('SIGKILL'); setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} }, 300); };
  return { ev, logs, close };
}
const jpg = (d) => Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
const FRAME = (t, q, label) => `(() => { const d = OP.frame(${t}, ${q}); ${label ? `const cv = document.getElementById('cv'), c = cv.getContext('2d'); c.setTransform(1,0,0,1,0,0); c.fillStyle = '#000'; c.fillRect(0, 0, 250, 86); c.fillStyle = '#fff'; c.font = '700 60px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('${(+t).toFixed(2)}', 14, 64); return cv.toDataURL('image/jpeg', ${q});` : 'return d;'} })()`;

const srv = await serve(mode === 'preview' ? 8765 : 0), port = srv.address().port;
if (mode === 'preview') { console.log(`open http://127.0.0.1:${port}/  (Ctrl+C to stop)`); }
else {
  const P = await openPage(port);
  try {
    const dur = await P.ev('OP.duration()');
    if (mode === 'check') {
      console.log(`duration ${dur.toFixed(2)} s`);
      for (const s of await P.ev('OP.shots()')) console.log(`${s.id.padEnd(5)} ${s.at.toFixed(2).padStart(6)} → ${s.end.toFixed(2).padStart(6)}  (${(s.end - s.at).toFixed(2)} s)  ${s.note}`);
      console.log('captions:'); for (const c of await P.ev('OP.captions()')) console.log(`  ${c.s.toFixed(2).padStart(6)}–${c.e.toFixed(2).padEnd(6)} ${c.text}`);
      const flow = await P.ev('OP.flow ? OP.flow() : []'); console.log(flow.length ? 'flow motion:\n' + flow.map((x) => '  ' + x).join('\n') : 'flow motion: every cut is a designed hand-off');
      let bad = 0; for (let t = 0; t < dur; t += 0.25) { try { await P.ev(`OP.draw(${t})`); } catch (e) { bad++; console.log(`ERROR at ${t.toFixed(2)}: ${e.message.split('\n')[0]}`); } }
      if (P.logs.length) console.log(P.logs.join('\n'));
      console.log(bad || P.logs.length ? 'CHECK FAILED' : 'CHECK OK');
    } else if (mode === 'cues') {
      const cues = await P.ev('OP.cues()');
      fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
      fs.writeFileSync(path.join(ROOT, 'data/cues.json'), JSON.stringify({ duration: dur, cues }, null, 1));
      console.log(`data/cues.json: ${cues.length} cues, ${dur.toFixed(2)} s`);
    } else if (mode === 'frames') {
      const dir = path.resolve(ROOT, rest[0] || 'review/frames'); fs.mkdirSync(dir, { recursive: true });
      for (const t of (rest[1] || '0').split(',').map(Number)) { fs.writeFileSync(path.join(dir, `t${t.toFixed(2)}.jpg`), jpg(await P.ev(FRAME(t, 0.92)))); }
      console.log(dir);
    } else if (mode === 'sheet') {
      const out = path.resolve(ROOT, rest[0] || 'review/all.jpg'), step = +(rest[1] || 0.5), cols = +(rest[2] || 9);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-sheet-')); let n = 0;
      for (let t = step / 2; t < dur; t += step) fs.writeFileSync(path.join(tmp, `f${String(n++).padStart(4, '0')}.jpg`), jpg(await P.ev(FRAME(t, 0.8, true))));
      const rows = Math.ceil(n / cols); fs.mkdirSync(path.dirname(out), { recursive: true });
      const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, 'f%04d.jpg'), '-vf', `scale=216:384,tile=${cols}x${rows}:padding=4:color=black`, '-frames:v', '1', '-q:v', '3', out]);
      fs.rmSync(tmp, { recursive: true, force: true });
      if (r.status) throw new Error('ffmpeg: ' + r.stderr); console.log(`${out} (${n} frames, every ${step} s)`);
    } else if (mode === 'video') {
      const out = path.resolve(ROOT, rest[0] || 'renders/video.mp4'); fs.mkdirSync(path.dirname(out), { recursive: true });
      const mix = path.join(ROOT, 'data/mix.wav'), hasMix = fs.existsSync(mix), a0 = rest[1] ? +rest[1] : 0, a1 = rest[2] ? Math.min(+rest[2], dur) : dur, n = Math.round((a1 - a0) * FPS);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
        ...(hasMix ? ['-ss', String(a0), '-t', String(a1 - a0), '-i', mix] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']), '-map', '0:v', '-map', '1:a',
        '-c:v', 'libx264', '-preset', flags.has('--draft') ? 'ultrafast' : 'veryfast', '-crf', flags.has('--draft') ? '28' : '18', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k', '-af', 'apad', '-t', String(n / FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
      const t0 = Date.now();
      for (let i = 0; i < n; i++) {
        const b = jpg(await P.ev(FRAME(a0 + i / FPS, flags.has('--draft') ? 0.8 : 0.93)));
        if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once('drain', r));
        if (i % 150 === 0) process.stdout.write(`\r${i}/${n} frames`);
      }
      ff.stdin.end(); await new Promise((r) => ff.on('close', r));
      console.log(`\r${out} (${n} frames, ${hasMix ? 'with data/mix.wav' : 'SILENT: no data/mix.wav'}, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    } else if (mode === 'audit') {
      const dir = path.resolve(ROOT, rest[0] || 'review/audit'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      const a0 = rest[1] ? +rest[1] : 0, a1 = rest[2] ? Math.min(+rest[2], dur) : dur, n = Math.round((a1 - a0) * FPS);
      const has = await P.ev('typeof OP.auditFrame === "function"');
      const GEN = (t) => `(() => { OP.draw(${t}); const cv = document.getElementById('cv'); const A = (window.__GA ||= { s: Object.assign(document.createElement('canvas'), { width: 64, height: 114 }), th: Object.assign(document.createElement('canvas'), { width: 216, height: 384 }), prev: null });
        const sc = A.s.getContext('2d', { willReadFrequently: true }); sc.drawImage(cv, 0, 0, 64, 114); const px = sc.getImageData(0, 0, 64, 114).data, g = new Float32Array(64 * 114); let lum = 0;
        for (let i = 0; i < g.length; i++) { g[i] = px[i*4]*0.299 + px[i*4+1]*0.587 + px[i*4+2]*0.114; lum += g[i]; } let diff = 0; if (A.prev) { for (let i = 0; i < g.length; i++) diff += Math.abs(g[i] - A.prev[i]); diff /= g.length; } A.prev = g;
        const tc = A.th.getContext('2d'); tc.drawImage(cv, 0, 0, 216, 384); tc.fillStyle = 'rgba(0,0,0,0.65)'; tc.fillRect(0, 0, 92, 30); tc.fillStyle = '#fff'; tc.font = '700 22px sans-serif'; tc.fillText((${t}).toFixed(2), 6, 23);
        return { t: ${t}, diff, lum: lum / g.length, issues: [], trans: false, shot: '', thumb: A.th.toDataURL('image/jpeg', 0.7) }; })()`;
      const R = [], tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-audit-')), t0 = Date.now();
      for (let i = 0; i < n; i++) {
        const t = +(a0 + (i + 0.5) / FPS).toFixed(4), r = await P.ev(has ? `OP.auditFrame(${t})` : GEN(t));
        fs.writeFileSync(path.join(tmp, `f${String(i).padStart(5, '0')}.jpg`), jpg(r.thumb)); delete r.thumb; R.push(r);
        if (i % 150 === 0) process.stdout.write(`\r${i}/${n} frames`);
      }
      // pages of 100 frames (10 x 10, 3.3 s each)
      const pages = Math.ceil(n / 100);
      for (let k = 0; k < pages; k++) {
        const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-start_number', String(k * 100), '-i', path.join(tmp, 'f%05d.jpg'), '-frames:v', '1',
          '-vf', `tile=10x10:padding=3:color=black`, '-q:v', '4', path.join(dir, `page-${String(k + 1).padStart(2, '0')}.jpg`)]);
        if (r.status) throw new Error('ffmpeg: ' + r.stderr);
      }
      fs.rmSync(tmp, { recursive: true, force: true });
      // the report: runs of the same issue, static stretches, hook, 5 s windows
      const runs = (pred, label) => { const out = []; let st = null; R.forEach((r, i) => { const on = pred(r); if (on && st == null) st = i; if ((!on || i === R.length - 1) && st != null) { const e = on ? i : i - 1; out.push([R[st].t, R[e].t, e - st + 1, R[st].shot, label]); st = null; } }); return out; };
      const norm = (x) => x.replace(/ \(\d+% visible\)/, ''), pct = (x) => +((x.match(/\((\d+)% visible\)/) || [])[1] ?? 100);
      const lines = [], kinds = new Set(R.flatMap((r) => r.issues.map(norm)));
      for (const k of kinds) runs((r) => r.issues.some((x) => norm(x) === k), k).forEach(([a, b, c, sh]) => { const w = Math.min(...R.filter((r) => r.t >= a && r.t <= b).flatMap((r) => r.issues.filter((x) => norm(x) === k).map(pct)));
        const passing = (/^background/.test(k) && c <= 10) || (/sliced/.test(k) && c <= 5) || (/head cut|caption covers|cut by the/.test(k) && c <= 2);                         // crossing the edge during a fast move (≤ 5 frames) is allowed
        lines.push(`${passing ? 'NOTE ' : 'FRAME'}  ${a.toFixed(2)}–${b.toFixed(2)} s  (${c} frames, ${sh})  ${k}${w < 100 ? ` (worst: ${w}% visible)` : ''}${passing ? ' — passing the edge in a fast move: allowed' : ''}`); });
      lines.sort((x, y) => parseFloat(x.slice(7)) - parseFloat(y.slice(7)));
      const STATIC = 0.45, SPIKE = 9;
      runs((r) => r.diff < STATIC && !r.trans, 'static').filter((x) => x[2] >= Math.round(0.7 * FPS)).forEach(([a, b, c, sh]) => lines.push(`STATIC ${a.toFixed(2)}–${b.toFixed(2)} s  (${c} frames, ${sh})  less than ${STATIC} change per frame: nothing moves`));
      // a still stretch (≥ 0.8 s): in a 3D shot the view changes < 8°/s (turning + moving relative to the nearest character) and no
      // character moves > 120 px/s on screen; in a 2D shot (no camera) the picture changes < 1.2 per frame.
      const parked = (r) => !r.trans && (r.cam != null ? (r.cam + r.rot) * FPS < 8 && r.subj * FPS < 120 : r.diff < 1.2);
      runs(parked, 'parked').filter((x) => x[2] >= Math.round(0.8 * FPS)).forEach(([a, b, c, sh]) => lines.push(`STILL  ${a.toFixed(2)}–${b.toFixed(2)} s  (${c} frames, ${sh})  a still stretch: keep the camera travelling or give the shot a visual event`));
      // shot sizes: each shot's size at its start and end (from the biggest person in frame). The zoom must follow who is
      // involved: a group or two people → wide/full, one person's reaction → medium/close, a prop → insert. Three shots in a row
      // with the same size at both ends, or a whole video stuck on one size, is a fault.
      const shots = []; R.forEach((r) => { if (r.trans) return; let sh = shots[shots.length - 1]; if (!sh || sh.id !== r.shot) shots.push(sh = { id: r.shot, sizes: [] }); sh.sizes.push(r.size); });
      shots.forEach((sh) => { const c = {}; sh.sizes.forEach((z) => (c[z] = (c[z] || 0) + 1)); sh.main = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; sh.range = [...new Set(sh.sizes)]; });
      lines.push('SIZES  ' + shots.map((sh) => `${sh.id}:${sh.range.join('→')}`).join('  '));
      for (let i = 0; i + 2 < shots.length; i++) { const a = shots[i], b = shots[i + 1], c = shots[i + 2];
        if (a.range.length === 1 && b.range.length === 1 && c.range.length === 1 && a.main === b.main && b.main === c.main && a.main !== 'insert')
          lines.push(`SIZE   ${a.id}, ${b.id}, ${c.id} are all "${a.main}" with no zoom: frame by who is involved (zoom out for a group, in for a reaction)`); }
      runs((r) => r.lum < 6, 'black').filter((x) => x[2] >= 2).forEach(([a, b, c]) => lines.push(`BLACK  ${a.toFixed(2)}–${b.toFixed(2)} s  (${c} frames)`));
      const ev = R.filter((r, i) => r.trans || r.diff > SPIKE || (i > 0 && r.shot !== R[i - 1].shot)).map((r) => r.t);
      const hook = R.filter((r) => r.t < a0 + 3), hm = hook.reduce((s, r) => s + r.diff, 0) / Math.max(1, hook.length), he = ev.filter((t) => t < a0 + 3).length;
      const hookOK = a0 > 0 || (hm >= 1.2 && he >= 1 && R[0].lum >= 6);
      lines.push(`HOOK   first 3 s: mean change ${hm.toFixed(2)}/frame, ${he} visual events, frame 0 brightness ${R[0].lum.toFixed(0)}  →  ${hookOK ? 'ok' : 'WEAK: open on motion + a creative visual event in the first 3 s'}`);
      let gaps = []; for (let w = a0; w + 5 <= a1 + 1e-6; w += 1) if (!ev.some((t) => t >= w && t < w + 5)) gaps.push(w);
      lines.push(gaps.length ? `REHOOK no visual event in the 5 s windows starting at ${gaps.map((g) => g.toFixed(0) + ' s').join(', ')}` : 'REHOOK every 5 s window has a visual event');
      const bad = lines.filter((l) => /^(FRAME|STATIC|STILL|BLACK|SIZE )/.test(l)).length + (hookOK ? 0 : 1) + (gaps.length ? 1 : 0);
      const txt = `audit of ${n} frames (${a0.toFixed(2)}–${a1.toFixed(2)} s, ${FPS} fps), ${pages} pages in ${path.relative(ROOT, dir)}/\n` + lines.join('\n') + `\n${bad ? `${bad} PROBLEMS: fix them, then run audit again` : 'AUDIT CLEAN: now read every page and critique each frame'}\n`;
      fs.writeFileSync(path.join(dir, 'report.txt'), txt); fs.writeFileSync(path.join(dir, 'frames.json'), JSON.stringify(R));
      console.log(`\r${txt}(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    } else console.log('modes: check · cues · sheet · frames · video · preview · audit');
  } finally { P.close(); srv.close(); }
}
