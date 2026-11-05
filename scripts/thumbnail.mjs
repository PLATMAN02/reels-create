// Thumbnail compositor: a background image + a bold title in the caption look (Inter Black, white, ink outline,
// starred words yellow) → a 1080x1920 JPG. The title is always drawn here, never by an image model, so spelling is exact.
// No npm packages: headless Chrome takes a screenshot of a generated page (Node 22+).
//
//   node scripts/thumbnail.mjs --bg art.png --title "WHY INDIA|*NEVER LOSES|TO PAKISTAN" --out output/thumbnail.jpg
//        [--font fonts/Inter-Black.otf] [--y 0.2] [--scrim]   (y = where the title starts, as a fraction of the height;
//        --scrim darkens the top behind the title, for busy art such as a video frame)
//
// --bg may be any size or aspect. It is scaled to the full width and anchored to the bottom; any empty band above it
// is filled with the colour of the image's top edge (so leave plain sky at the top of generated art).
// "|" starts a new line; "*WORD" makes that word yellow. Each line is fitted to the phone-safe width (≤ 900 px).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const bg = opt('--bg'), title = opt('--title'), out = opt('--out', 'output/thumbnail.jpg'), y0 = +opt('--y', '0.2'), scrim = a.includes('--scrim');
const font = opt('--font', [path.join(process.cwd(), 'fonts/Inter-Black.otf'), path.join(SKILL, 'styles/inside-out/example/fonts/Inter-Black.otf')].find((f) => fs.existsSync(f)));
if (!bg || !title) { console.error('usage: thumbnail.mjs --bg <image> --title "LINE|*YELLOW LINE" [--out file.jpg] [--font f.otf] [--y 0.2]'); process.exit(2); }
const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => p && fs.existsSync(p));
if (!CHROME) { console.error('Chrome not found (set CHROME=/path/to/chrome)'); process.exit(1); }

const mime = (f) => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[path.extname(f).toLowerCase()] || 'image/png');
const img = `data:${mime(bg)};base64,${fs.readFileSync(bg).toString('base64')}`;
const fnt = `data:font/otf;base64,${fs.readFileSync(font).toString('base64')}`;
const lines = title.split('|').map((l) => l.trim()).filter(Boolean);

const html = `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:T;src:url(${fnt})}html,body{margin:0;background:#000}canvas{display:block}</style>
<canvas id="c" width="1080" height="1920"></canvas><script>
(async () => {
  await document.fonts.load('900 100px T');
  const c = document.getElementById('c'), x = c.getContext('2d'), im = new Image(); im.src = ${JSON.stringify(img)}; await im.decode();
  const h = im.height * 1080 / im.width, top = 1920 - h;
  const s = document.createElement('canvas'); s.width = im.width; s.height = 4; s.getContext('2d').drawImage(im, 0, 0);
  const p = s.getContext('2d').getImageData(Math.floor(im.width / 2), 1, 1, 1).data;
  x.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'; x.fillRect(0, 0, 1080, 1920);
  x.drawImage(im, 0, top, 1080, h);
  if (${scrim}) { const g = x.createLinearGradient(0, 0, 0, 1920 * ${y0} + 900); g.addColorStop(0, 'rgba(10,12,20,0.78)'); g.addColorStop(0.7, 'rgba(10,12,20,0.55)'); g.addColorStop(1, 'rgba(10,12,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920); }
  const L = ${JSON.stringify(lines)}; let y = 1920 * ${y0};
  for (const ln of L) {
    const words = ln.split(/\\s+/).map((w) => ({ t: w.replace(/^\\*/, ''), hi: w.startsWith('*') }));
    let size = 190; x.font = '900 ' + size + 'px T'; const sp = () => size * 0.24;
    const width = () => words.reduce((a, w) => a + x.measureText(w.t).width, 0) + sp() * (words.length - 1);
    while (width() > 900 && size > 60) { size -= 4; x.font = '900 ' + size + 'px T'; }
    y += size * 0.5; let cx = 540 - width() / 2;
    x.textBaseline = 'middle'; x.lineJoin = 'round';
    for (const w of words) {
      x.lineWidth = size * 0.22; x.strokeStyle = '#1A1A1E'; x.strokeText(w.t, cx, y + size * 0.07); x.strokeText(w.t, cx, y);
      x.fillStyle = w.hi ? '#FFD43B' : '#FFFFFF'; x.fillText(w.t, cx, y); cx += x.measureText(w.t).width + sp();
    }
    y += size * 0.62;
  }
  document.title = 'done';
})();
</script>`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thumb-')), page = path.join(tmp, 'thumb.html'), png = path.join(tmp, 'thumb.png');
fs.writeFileSync(page, html);
// Chrome can screenshot before a large image has decoded: allow time, check the result isn't blank, retry if it is.
const blank = (f) => { const px = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 64 }).stdout;
  return !px || px.length < 3 || px[0] + px[1] + px[2] < 12; };
let ok = false, r;
for (let k = 0; k < 4 && !ok; k++) {
  fs.rmSync(png, { force: true });
  r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
    `--virtual-time-budget=${10000 + k * 10000}`, `--user-data-dir=${path.join(tmp, 'profile' + k)}`, `--screenshot=${png}`, 'file://' + page], { encoding: 'utf8' });
  ok = fs.existsSync(png) && !blank(png);
}
if (!ok) { console.error('screenshot failed or blank after retries', r?.stderr?.slice(-800)); process.exit(1); }
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const ff = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-q:v', '2', out], { encoding: 'utf8' });
if (ff.status !== 0) { console.error(ff.stderr); process.exit(1); }
fs.rmSync(tmp, { recursive: true, force: true });
console.log(path.resolve(out));
