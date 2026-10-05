/* CREAX.INK promo — arranque, render por frame y reproductor de vista previa */
(function (G) {
  'use strict';
  const L = G.L;
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(location.search);
  const RENDER = params.has('render');
  if (RENDER) document.body.classList.add('render');
  const FRAMES = L.FPS * L.DURATION;

  // Lienzos auxiliares para motion blur (submuestreo temporal)
  const sub = L.makeCanvas(L.W, L.H);
  const subCtx = sub.getContext('2d');

  function renderFrame(f) {
    const t = f / L.FPS;
    const n = G.SCENES.blurSamples(t);
    if (n <= 1) {
      G.SCENES.draw(ctx, t, f);
    } else {
      // Obturador de 180°: n muestras repartidas en medio frame
      const shutter = 0.5 / L.FPS;
      for (let k = 0; k < n; k++) {
        const tk = t + (k / (n - 1) - 0.5) * shutter;
        G.SCENES.draw(subCtx, tk, f);
        ctx.globalAlpha = 1 / (k + 1);
        ctx.drawImage(sub, 0, 0);
      }
      ctx.globalAlpha = 1;
    }
    G.SCENES.post(ctx, t, f);
  }

  G.READY = (async () => {
    await Promise.all([
      document.fonts.load('900 100px Montserrat'),
      document.fonts.load('200 100px Montserrat'),
      document.fonts.load('italic 900 100px Montserrat'),
      document.fonts.load('700 100px Caveat'),
    ]);
    await document.fonts.ready;
    await G.A.init('../assets/');
    await G.WORKS.buildWorks((G.CONFIG && G.CONFIG.WORK_OVERRIDES) || {});
    G.SCENES.init();
    G.renderFrame = renderFrame;
    const f0 = params.has('t') ? Math.round(parseFloat(params.get('t')) * L.FPS) : 0;
    renderFrame(Math.min(FRAMES - 1, f0));
    return true;
  })();

  if (RENDER) return;

  // ---------- Reproductor ----------
  const btn = document.getElementById('play');
  const scrub = document.getElementById('scrub');
  const tc = document.getElementById('tc');
  const audio = document.getElementById('music');
  let playing = false, startWall = 0, startFrame = 0, cur = 0;
  const fmt = (f) => {
    const s = Math.floor(f / L.FPS), fr = f % L.FPS;
    return `00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  };
  const show = (f) => { cur = f; scrub.value = f; tc.textContent = fmt(f); renderFrame(f); };
  function loop(now) {
    if (!playing) return;
    const f = Math.floor(startFrame + ((now - startWall) / 1000) * L.FPS);
    if (f >= FRAMES) { playing = false; btn.textContent = '▶︎ Play'; audio.pause(); return; }
    if (f !== cur) show(f);
    requestAnimationFrame(loop);
  }
  btn.onclick = async () => {
    await G.READY;
    playing = !playing;
    btn.textContent = playing ? '❚❚ Pausa' : '▶︎ Play';
    if (playing) {
      if (cur >= FRAMES - 1) cur = 0;
      startFrame = cur; startWall = performance.now();
      audio.currentTime = cur / L.FPS; audio.play().catch(() => {});
      requestAnimationFrame(loop);
    } else audio.pause();
  };
  scrub.oninput = async () => { await G.READY; playing = false; audio.pause(); btn.textContent = '▶︎ Play'; show(+scrub.value); };
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); btn.click(); }
    if (e.code === 'ArrowRight') show(Math.min(FRAMES - 1, cur + 1));
    if (e.code === 'ArrowLeft') show(Math.max(0, cur - 1));
  });
})(window);
