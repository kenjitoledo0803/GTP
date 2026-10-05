#!/usr/bin/env node
/* Render del promo de CREAX.INK: Chromium (Playwright) -> frames -> ffmpeg.
 *
 *   node tools/render.cjs                      # video completo (output/CREAX-INK_promo_9x16.mp4)
 *   node tools/render.cjs --stills 0.5,9,20    # PNGs sueltos en output/stills/
 *   node tools/render.cjs --range 8-13         # sólo un tramo (segundos), sin audio
 *
 * Requiere: playwright (npm i -D playwright) y ffmpeg en el PATH.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function requirePlaywright() {
  try { return require('playwright'); } catch (e) { /* global */ }
  for (const p of ['/opt/node-tools/node_modules/playwright', '/usr/local/lib/node_modules/playwright']) {
    try { return require(p); } catch (e) { /* siguiente */ }
  }
  throw new Error('No se encontró playwright. Ejecuta: npm i -D playwright');
}

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'output');
const FPS = 30, DURATION = 40, FRAMES = FPS * DURATION;
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.css': 'text/css' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const { chromium } = requirePlaywright();
  const srv = await serve();
  const url = `http://127.0.0.1:${srv.address().port}/src/index.html?render=1`;
  const launch = { args: ['--disable-web-security', '--font-render-hinting=none'] };
  if (fs.existsSync('/opt/pw-browsers/chromium')) launch.executablePath = '/opt/pw-browsers/chromium';
  let browser;
  try { browser = await chromium.launch(launch); } catch (e) { delete launch.executablePath; browser = await chromium.launch(launch); }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.READY !== undefined);
  await page.evaluate(() => window.READY);

  const grab = (f, type = 'image/png') =>
    page.evaluate(([f, type]) => { window.renderFrame(f); return document.getElementById('c').toDataURL(type, 0.96); }, [f, type])
      .then((d) => Buffer.from(d.split(',')[1], 'base64'));

  const stills = opt('--stills');
  if (stills) {
    const dir = path.join(OUT, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const s of stills.split(',')) {
      const f = Math.min(FRAMES - 1, Math.round(parseFloat(s) * FPS));
      fs.writeFileSync(path.join(dir, `t${parseFloat(s).toFixed(2).padStart(6, '0')}.png`), await grab(f));
      process.stdout.write('.');
    }
    console.log(`\n${stills.split(',').length} stills -> ${dir}`);
    await browser.close(); srv.close(); return;
  }

  const range = opt('--range');
  let f0 = 0, f1 = FRAMES;
  if (range) { const [a, b] = range.split('-').map(parseFloat); f0 = Math.round(a * FPS); f1 = Math.round(b * FPS); }
  const audio = path.join(OUT, 'creax-ink-music.wav');
  const withAudio = !range && fs.existsSync(audio);
  const outFile = opt('--out') || path.join(OUT, range ? `preview_${range}.mp4` : 'CREAX-INK_promo_9x16.mp4');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    ...(withAudio ? ['-i', audio] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-tune', 'animation', '-g', '30', '-bf', '2',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    ...(withAudio ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
    '-movflags', '+faststart', outFile,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const buf = await grab(f);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 30 === 0) process.stdout.write(`\r frame ${f}/${f1} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`\nListo -> ${outFile}`);
  await browser.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
