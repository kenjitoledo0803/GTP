/* CREAX.INK promo — escenas y línea de tiempo (40 s @ 30 fps, 120 BPM)
 *
 *  0.0 –  4.0  1. HOOK          gota de tinta -> isotipo -> "NO SOLO DISEÑAMOS. CREAMOS IDENTIDAD."
 *  4.0 –  8.0  2. PROBLEMA      diseño genérico y desordenado, la idea (foco) apagada
 *  8.0 – 13.0  3. PRESENTACIÓN  construcción del logo + brand board + claim
 * 13.0 – 24.0  4. SERVICIOS     4 servicios, cada uno con su pieza
 * 24.0 – 30.0  5. PROCESO       IDEA -> DISEÑO -> DETALLE -> RESULTADO
 * 30.0 – 35.0  6. RESULTADOS    montaje rápido al ritmo
 * 35.0 – 40.0  7. CIERRE / CTA
 *
 * Cada beat dura 0.5 s: los cortes y golpes caen en múltiplos de 0.25 s.
 */
(function (G) {
  'use strict';
  const L = G.L, A = G.A, WK = G.WORKS;
  const { W, H, C, E, clamp, lerp, prog, kf, deg, TAU, rgba, text, revealLine, fitSize, rrect, circle, glow,
    brandGrad, linGrad, wiggle, rng, drawImg, drawCover, measure } = L;

  const SZ = {}; // tamaños tipográficos calculados al iniciar
  const PAPER = '#F7F5F0';
  const INK = '#0B0B0F';

  // Degradados de texto reutilizables (shift anima el color)
  const gWarm = (shift = 0) => (c, x0, x1, y) => brandGrad(c, x0, y, x1, y, shift, [C.pink, C.red, C.orange, C.amber]);
  const gCool = (shift = 0) => (c, x0, x1, y) => brandGrad(c, x0, y, x1, y, shift, [C.blue, C.teal, C.mint]);
  const gFull = (shift = 0) => (c, x0, x1, y) => brandGrad(c, x0, y, x1, y, shift, [C.plum, C.pink, C.red, C.orange, C.amber]);
  const gCols = (cols, shift = 0) => (c, x0, x1, y) => brandGrad(c, x0, y, x1, y, shift, cols);

  // ---------------------------------------------------------------- helpers de marca
  function iso(c, x, y, size, o = {}) {
    drawImg(c, o.img || A.iso, x, y, size, size, o);
  }

  // Wordmark "CREAX.INK" letra por letra (máscara slide-up)
  function wordmark(c, cx, cy, width, t, t0, o = {}) {
    const img = o.white ? A.wordWhite : A.wordDark;
    const s = width / img.width, h = img.height * s;
    const glyphs = A.wordGlyphs;
    const stagger = o.stagger == null ? 0.035 : o.stagger, dur = o.dur || 0.5;
    c.save();
    if (o.alpha != null) c.globalAlpha *= o.alpha;
    c.beginPath();
    c.rect(cx - width / 2 - 20, cy - h / 2, width + 40, h);
    c.clip();
    glyphs.forEach(([g0, g1], i) => {
      const p = (o.ease || E.outExpo)(prog(t, t0 + i * stagger, t0 + i * stagger + dur));
      let q = 0;
      if (o.out != null) q = E.inExpo(prog(t, o.out + i * 0.02, o.out + i * 0.02 + 0.3));
      if (p <= 0 || q >= 1) return;
      const gx = cx - width / 2 + g0 * s, gw = (g1 - g0) * s;
      const dy = (1 - p) * h * 1.05 - q * h * 1.05;
      c.drawImage(img, g0, 0, g1 - g0, img.height, gx, cy - h / 2 + dy, gw, h);
    });
    c.restore();
    return h;
  }

  // "CREATIVE STUDIO" con tracking que se expande
  function tagline(c, cx, cy, width, t, t0, o = {}) {
    const img = o.white ? A.tagWhite : A.tagDark;
    const s = width / img.width, h = img.height * s;
    const p = E.outExpo(prog(t, t0, t0 + (o.dur || 1.0)));
    if (p <= 0) return;
    const glyphs = A.tagGlyphs;
    c.save();
    c.globalAlpha *= (o.alpha == null ? 1 : o.alpha) * clamp(p * 1.6);
    glyphs.forEach(([g0, g1]) => {
      const gc = (g0 + g1) / 2 - img.width / 2;
      const x = cx + gc * s * lerp(0.55, 1, p);
      const gw = (g1 - g0) * s;
      c.drawImage(img, g0, 0, g1 - g0, img.height, x - gw / 2, cy - h / 2, gw, h);
    });
    c.restore();
  }

  function heart(c, x, y, s, fill) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.beginPath();
    c.moveTo(0, 0.35);
    c.bezierCurveTo(-0.1, 0.25, -0.5, 0.0, -0.5, -0.25);
    c.bezierCurveTo(-0.5, -0.5, -0.15, -0.6, 0, -0.35);
    c.bezierCurveTo(0.15, -0.6, 0.5, -0.5, 0.5, -0.25);
    c.bezierCurveTo(0.5, 0.0, 0.1, 0.25, 0, 0.35);
    c.fillStyle = fill;
    c.fill();
    c.restore();
  }

  function arrowLine(c, x0, y0, x1, y1, color, lw = 3, head = 12) {
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = lw;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0);
    c.beginPath();
    c.moveTo(x1 + Math.cos(a) * 2, y1 + Math.sin(a) * 2);
    c.lineTo(x1 - Math.cos(a - 0.5) * head, y1 - Math.sin(a - 0.5) * head);
    c.lineTo(x1 - Math.cos(a + 0.5) * head, y1 - Math.sin(a + 0.5) * head);
    c.closePath();
    c.fill();
  }

  // Fondo "aurora" oscuro con glows de marca que derivan lentamente
  function aurora(c, t, tint, amt = 1) {
    c.fillStyle = INK;
    c.fillRect(0, 0, W, H);
    const cols = [C.pink, C.orange, C.blue, C.teal];
    cols.forEach((col, i) => {
      const x = 540 + Math.sin(t * 0.35 + i * 1.7) * 420;
      const y = 960 + Math.cos(t * 0.27 + i * 2.3) * 700;
      glow(c, x, y, 760, col, 0.11 * amt);
    });
    if (tint) glow(c, 540, 700, 1100, tint, 0.2 * amt);
  }

  // Mancha de tinta que cubre la pantalla (transición)
  function inkWipe(c, t, t0, t1, color, cx = 540, cy = 960, seed = 3) {
    const p = prog(t, t0, t1);
    if (p <= 0) return;
    const r = 1500 * E.inOutCubic(p);
    c.fillStyle = color;
    L.inkBlobPath(c, cx, cy, r, seed, 0.16, 7, p * 2);
    c.fill();
    // gotas satélite que llegan primero
    const R = rng(seed + 9);
    for (let i = 0; i < 9; i++) {
      const a = R() * TAU, d = r * (1.05 + R() * 0.25), rr = r * (0.06 + R() * 0.08);
      circle(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr);
      c.fill();
    }
  }

  // ======================================================== 1. HOOK 0–4 s
  const HOOK_WORKS = ['fresca', 'nomada', 'beats', 'kumo', 'forza', 'bloom'];

  function hook(c, t) {
    c.fillStyle = '#060608';
    c.fillRect(0, 0, W, H);
    const CX = 540, CY = 900;
    const isoY = kf(t, [[1.3, CY], [1.8, 640, E.outExpo]]);
    const isoScale = kf(t, [[0.6, 0.15], [1.05, 1.06, E.outExpo], [1.3, 1.0, E.inOutCubic], [1.8, 0.72, E.outExpo]]);
    const isoRot = kf(t, [[0.6, deg(-160)], [1.25, 0, E.outExpo]]) + deg(2.5) * Math.sin((t - 1.25) * 1.6);

    // glow ambiental
    if (t > 0.5 && t < 3.8) {
      const a = clamp((t - 0.5) / 0.3) * (1 - prog(t, 2.2, 2.6));
      glow(c, CX, isoY, 720, '#FFFFFF', 0.08 * a);
      glow(c, CX - 170, isoY - 130, 520, C.pink, 0.26 * a);
      glow(c, CX + 170, isoY + 150, 520, C.blue, 0.26 * a);
    }

    // gota de tinta que cae
    if (t < 0.52) {
      const p = E.inQuad(prog(t, 0, 0.5));
      const y = lerp(300, CY, p);
      const st = 1 + p * 1.8;
      c.save();
      c.translate(CX, y);
      c.scale(1 / Math.sqrt(st), st);
      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.arc(0, 0, 22, 0, Math.PI);
      c.quadraticCurveTo(-22, -26, 0, -52);
      c.quadraticCurveTo(22, -26, 22, 0);
      c.fill();
      c.restore();
      glow(c, CX, y, 120, '#FFFFFF', 0.25);
    }

    // ondas de choque
    for (let k = 0; k < 2; k++) {
      const p = prog(t, 0.5 + k * 0.09, 1.1 + k * 0.09);
      if (p <= 0 || p >= 1) continue;
      c.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.9})`;
      c.lineWidth = 26 * (1 - p) + 1;
      circle(c, CX, CY, 30 + 820 * E.outExpo(p));
      c.stroke();
    }

    // salpicadura de tinta de colores (mezcla "screen")
    if (t > 0.5 && t < 1.4) {
      const blobs = [[C.plum, C.pink], [C.red, C.amber], [C.navy, C.sky], [C.tealDark, C.mint]];
      c.save();
      c.globalCompositeOperation = 'screen';
      blobs.forEach(([a, b], i) => {
        const t0 = 0.5 + i * 0.035;
        const grow = E.outExpo(prog(t, t0, t0 + 0.45));
        const shrink = E.inCubic(prog(t, 0.82 + i * 0.03, 1.22 + i * 0.03));
        const r = 430 * grow * (1 - shrink);
        if (r < 1) return;
        const ang = -Math.PI / 2 + i * (TAU / 4) + 0.6;
        const ox = CX + Math.cos(ang) * 110 * grow, oy = CY + Math.sin(ang) * 110 * grow;
        const g = c.createRadialGradient(ox, oy, 0, ox, oy, r * 1.2);
        g.addColorStop(0, rgba(b, 0.95));
        g.addColorStop(1, rgba(a, 0.9));
        c.fillStyle = g;
        L.inkBlobPath(c, ox, oy, r, 11 + i * 7, 0.22, 6, t * 3);
        c.fill();
      });
      c.restore();
    }

    // gotitas
    if (t > 0.5 && t < 1.6) {
      const R = rng(3);
      const p = prog(t, 0.5, 1.6);
      for (let i = 0; i < 26; i++) {
        const a = R() * TAU, spd = 380 + R() * 820, sz = 4 + R() * 15;
        const d = spd * E.outCubic(p);
        c.fillStyle = rgba(L.SPECTRUM[i % 8], 1 - p);
        circle(c, CX + Math.cos(a) * d, CY + Math.sin(a) * d + p * p * 260, sz * (1 - p * 0.5));
        c.fill();
      }
    }

    // isotipo
    const isoOut = E.inExpo(prog(t, 2.15, 2.4));
    if (t >= 0.6 && isoOut < 1) {
      iso(c, CX, isoY, 620, { rot: isoRot, scale: isoScale * (1 - isoOut * 0.6), alpha: prog(t, 0.6, 0.7) * (1 - isoOut) });
    }

    // carrusel de trabajos dentro de un marco que se abre
    if (t >= 2.15) {
      const fp = E.outExpo(prog(t, 2.15, 2.6));
      const ex = E.inOutExpo(prog(t, 3.35, 3.75));
      const fw = lerp(lerp(160, 700, fp), W + 4, ex), fh = lerp(lerp(160, 820, fp), H + 4, ex);
      const fx = 540, fy = lerp(640, 960, ex), r = lerp(lerp(80, 36, fp), 0, ex);
      const k = Math.min(HOOK_WORKS.length - 1, Math.floor((t - 2.25) / 0.25 + 1e-6));
      const key = HOOK_WORKS[Math.max(0, k)];
      const local = t - (2.25 + Math.max(0, k) * 0.25);
      const desat = E.inOutCubic(prog(t, 3.55, 3.95));
      c.save();
      rrect(c, fx - fw / 2, fy - fh / 2, fw, fh, r);
      c.clip();
      if (desat > 0) c.filter = `grayscale(${desat}) brightness(${1 - 0.5 * desat}) contrast(${1 - 0.25 * desat})`;
      const zoom = lerp(1.14, 1.0, E.outExpo(clamp(local / 0.35))) * (1 - 0.06 * desat);
      drawCover(c, WK.BLUR[key], fx - fw / 2, fy - fh / 2, fw, fh, 1.1);
      drawCover(c, WK.IMG[key], fx - fw / 2, fy - fh / 2, fw, fh, zoom);
      c.filter = 'none';
      // destello en cada corte
      const fl = 1 - clamp(local / 0.1);
      if (t > 2.3 && k < HOOK_WORKS.length - 1 && fl > 0) {
        c.fillStyle = `rgba(255,255,255,${0.35 * fl})`;
        c.fillRect(0, 0, W, H);
      }
      c.restore();
      if (fp < 1) {
        c.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ex)})`;
        c.lineWidth = 2;
        rrect(c, fx - fw / 2, fy - fh / 2, fw, fh, r);
        c.stroke();
      }
      // "tape stop": cortes horizontales tipo glitch
      if (t > 3.62 && t < 3.95) {
        const R = rng(Math.floor(t * 30));
        for (let i = 0; i < 6; i++) {
          const sy = R() * H, sh = 20 + R() * 90, dx = (R() - 0.5) * 120;
          c.drawImage(c.canvas, 0, sy, W, sh, dx, sy, W, sh);
        }
      }
      // fundido al gris del problema
      const gz = prog(t, 3.8, 4.0);
      if (gz > 0) {
        c.fillStyle = `rgba(41,41,44,${gz * 0.85})`;
        c.fillRect(0, 0, W, H);
      }
    }

    // texto
    const sz = SZ.hook;
    const y1 = 1250, y2 = 1250 + sz * 1.08;
    revealLine(c, 'NO SOLO', 540, y1, t, 1.3, { size: sz, weight: 900, out: { t0: 2.2, mode: 'up' } });
    revealLine(c, 'DISEÑAMOS.', 540, y2, t, 1.45, { size: sz, weight: 900, out: { t0: 2.25, mode: 'up' } });
    revealLine(c, 'CREAMOS', 540, y1, t, 2.38, { size: sz, weight: 900, out: { t0: 3.18, mode: 'up', dur: 0.25 } });
    revealLine(c, 'IDENTIDAD.', 540, y2, t, 2.5, { size: sz, weight: 900, fill: gWarm(prog(t, 2.5, 3.5) * 0.6), out: { t0: 3.22, mode: 'up', dur: 0.25 } });
  }

  // ======================================================== 2. PROBLEMA 4–8 s
  function genericFlyer(c, w, h) {
    c.fillStyle = '#E4E4E2';
    c.fillRect(-w / 2, -h / 2, w, h);
    text(c, 'GRAN OFERTA!!!', 0, -h / 2 + 66, { size: 36, weight: 700, family: 'Liberation Serif', fill: '#8E5A55' });
    c.fillStyle = '#BDBDBA';
    c.fillRect(-w / 2 + 30, -h / 2 + 100, w - 60, 170);
    c.strokeStyle = '#9A9A97';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-w / 2 + 30, -h / 2 + 100);
    c.lineTo(w / 2 - 30, -h / 2 + 270);
    c.moveTo(w / 2 - 30, -h / 2 + 100);
    c.lineTo(-w / 2 + 30, -h / 2 + 270);
    c.stroke();
    WK.starburst(c, w / 2 - 60, -h / 2 + 110, 58, 12, '#B4A55E', 0.2);
    text(c, '50%', w / 2 - 60, -h / 2 + 122, { size: 30, weight: 700, family: 'DejaVu Sans', fill: '#6B5F3A' });
    c.fillStyle = '#B0B0AD';
    for (let i = 0; i < 5; i++) c.fillRect(-w / 2 + 30, -h / 2 + 300 + i * 26, (w - 60) * (i % 2 ? 0.7 : 0.92), 12);
    text(c, 'Llame ya!!', 0, h / 2 - 34, { size: 30, weight: 400, family: 'DejaVu Sans', fill: '#7A7A85', italic: true });
  }
  function genericLogoCard(c, w, h) {
    c.fillStyle = '#DCDCDA';
    c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = '#8D8D96';
    c.lineWidth = 3;
    circle(c, -w / 2 + 70, 0, 40);
    c.stroke();
    c.beginPath();
    c.ellipse(-w / 2 + 70, 0, 18, 40, 0, 0, TAU);
    c.moveTo(-w / 2 + 30, 0);
    c.lineTo(-w / 2 + 110, 0);
    c.stroke();
    text(c, 'Mi Negocio', -w / 2 + 130, 10, { size: 46, weight: 400, family: 'Liberation Serif', italic: true, fill: '#5E5E66', align: 'left' });
    text(c, 'S.A.C.', -w / 2 + 132, 46, { size: 20, weight: 400, family: 'DejaVu Sans', fill: '#83838C', align: 'left' });
  }
  function logoPlaceholder(c, s) {
    c.setLineDash([12, 10]);
    c.strokeStyle = '#7C7C84';
    c.lineWidth = 3;
    c.strokeRect(-s / 2, -s / 2, s, s);
    c.setLineDash([]);
    text(c, 'TU LOGO', 0, -4, { size: 30, weight: 700, family: 'DejaVu Sans', fill: '#7C7C84' });
    text(c, 'AQUÍ', 0, 32, { size: 30, weight: 700, family: 'DejaVu Sans', fill: '#7C7C84' });
  }
  function bulb(c, x, y, b, glowR) {
    if (b > 0.02) {
      glow(c, x, y, glowR, C.amber, 0.55 * b);
      glow(c, x, y, glowR * 0.4, '#FFF3C4', 0.8 * b);
    }
    c.save();
    c.translate(x, y);
    c.lineWidth = 5;
    c.strokeStyle = b > 0.5 ? '#FFE9A8' : '#77777E';
    c.fillStyle = b > 0.02 ? rgba('#FFD86B', b * 0.9) : 'rgba(255,255,255,0.04)';
    c.beginPath();
    c.arc(0, -10, 72, Math.PI * 0.78, Math.PI * 2.22);
    c.lineTo(28, 78);
    c.lineTo(-28, 78);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = '#77777E';
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(-26, 92 + i * 14);
      c.lineTo(26, 92 + i * 14);
      c.stroke();
    }
    c.strokeStyle = b > 0.3 ? '#FFFFFF' : '#8A8A90';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-14, 70);
    c.lineTo(-14, 10);
    c.lineTo(-4, 0);
    c.lineTo(4, 10);
    c.lineTo(14, 0);
    c.lineTo(14, 70);
    c.stroke();
    c.restore();
  }
  // trazo a mano (marcador rojo) con progreso
  function scribbleEllipse(c, x, y, rx, ry, p, rot = 0) {
    if (p <= 0) return;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.strokeStyle = '#FF4B4B';
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    const N = 80, turns = 1.15;
    for (let i = 0; i <= N * p; i++) {
      const a = -1.2 + (i / N) * TAU * turns;
      const k = 1 + 0.06 * Math.sin(i * 0.4);
      const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.stroke();
    c.restore();
  }
  function handNote(c, str, x, y, t, t0, rot = 0, size = 54) {
    const p = prog(t, t0, t0 + 0.3);
    if (p <= 0) return;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    const w = measure(c, str, size, 700, 0, 'Caveat');
    c.beginPath();
    c.rect(-w / 2 - 10, -size, (w + 20) * p, size * 1.4);
    c.clip();
    text(c, str, 0, 0, { size, weight: 700, family: 'Caveat', fill: '#FF4B4B' });
    c.restore();
  }

  function problem(c, t) {
    c.fillStyle = '#29292C';
    c.fillRect(0, 0, W, H);
    const tq = Math.floor(t * 8) / 8; // stop-motion a 8 fps: se siente "barato"
    const chaos = 1 + 3 * E.inQuad(prog(t, 6.9, 7.85));
    const jx = (seed, amp) => wiggle(tq, 2.5, amp * chaos, seed);
    const pop = (t0) => E.outBack(clamp((Math.floor(t * 12) / 12 - t0) / 0.25));

    // nombres de fuentes sueltos
    const names = [['Arial', 170, 250, -10, 'DejaVu Sans'], ['Times New Roman', 860, 230, 7, 'Liberation Serif'], ['Comic?', 560, 1150, -4, 'DejaVu Sans'], ['Impact', 930, 1140, 9, 'DejaVu Sans'], ['Papyrus', 150, 1210, 6, 'Liberation Serif']];
    names.forEach(([s, x, y, r, f], i) => {
      const p = pop(4.05 + i * 0.07);
      if (p <= 0) return;
      c.save();
      c.translate(x + jx(i + 20, 6), y + jx(i + 30, 6));
      c.rotate(deg(r + jx(i + 40, 2)));
      c.globalAlpha = 0.28 * clamp(p);
      text(c, s, 0, 0, { size: 38, weight: 400, family: f, fill: '#BDBDC4' });
      c.restore();
    });

    // flyer genérico
    let p = pop(4.0);
    if (p > 0) {
      c.save();
      c.translate(300 + jx(1, 8), 640 + jx(2, 8));
      c.rotate(deg(-7 + jx(3, 2)));
      c.scale(p, p);
      L.softShadow(c, 30, 14, 0.4);
      genericFlyer(c, 360, 480);
      L.noShadow(c);
      c.restore();
    }
    // logo genérico (arrastrado por el cursor)
    const cur = [800 + wiggle(t, 0.9, 120, 5), 720 + wiggle(t, 0.7, 90, 6)];
    p = pop(4.12);
    if (p > 0) {
      c.save();
      c.translate(800 + jx(4, 7) + (cur[0] - 800) * 0.25, 560 + jx(5, 7) + (cur[1] - 720) * 0.2);
      c.rotate(deg(6 + jx(6, 2)));
      c.scale(p, p);
      L.softShadow(c, 30, 14, 0.4);
      genericLogoCard(c, 380, 220);
      L.noShadow(c);
      c.restore();
    }
    p = pop(4.22);
    if (p > 0) {
      c.save();
      c.translate(790 + jx(7, 6), 920 + jx(8, 6));
      c.rotate(deg(-4 + jx(9, 2)));
      c.scale(p, p);
      logoPlaceholder(c, 230);
      c.restore();
    }
    // muestras de color que chocan
    p = pop(4.3);
    if (p > 0) {
      const sw = ['#8FA05A', '#7A5C8A', '#7D6450', '#5E9A9C'];
      c.save();
      c.translate(310 + jx(10, 6), 1060 + jx(11, 6));
      c.rotate(deg(8 + jx(12, 3)));
      c.scale(p, p);
      sw.forEach((col, i) => {
        c.fillStyle = col;
        c.fillRect(-170 + i * 88 + jx(13 + i, 5), -40 + jx(17 + i, 8), 80, 80);
      });
      c.restore();
    }
    // cursor
    if (t > 4.2) {
      c.save();
      c.translate(cur[0], cur[1]);
      c.fillStyle = '#FFFFFF';
      c.strokeStyle = '#111';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 44);
      c.lineTo(11, 33);
      c.lineTo(20, 52);
      c.lineTo(27, 49);
      c.lineTo(18, 30);
      c.lineTo(33, 30);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }

    // la idea: foco que parpadea y luego se enciende
    let b = 0.08;
    if (t > 4.75 && t < 5.7) b = Math.sin(t * 47) > 0.1 || Math.sin(t * 13) > 0.6 ? 0.75 : 0.12;
    if (t >= 5.7) b = 0.12;
    const fin = E.inQuad(prog(t, 7.3, 7.95));
    b = Math.max(b, fin);
    bulb(c, 540, 300, b, 260 + fin * 1500);

    // anotaciones con marcador rojo
    scribbleEllipse(c, 800, 570, 230, 150, E.outCubic(prog(t, 6.3, 6.6)), deg(6));
    handNote(c, '¿genérico?', 840, 420, t, 6.45, deg(-6));
    arrowLine(c, 240, 925, 270, 880, rgba('#FF4B4B', clamp((t - 6.75) / 0.1)), 4, 14);
    handNote(c, 'sin personalidad', 330, 980, t, 6.7, deg(-3), 50);
    if (t > 6.95) {
      const q = E.outCubic(prog(t, 6.95, 7.15));
      c.strokeStyle = '#FF4B4B';
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(690, 820);
      c.lineTo(690 + 200 * q, 820 + 200 * q);
      if (q > 0.5) {
        const q2 = (q - 0.5) * 2;
        c.moveTo(890, 820);
        c.lineTo(890 - 200 * q2, 820 + 200 * q2);
      }
      c.stroke();
    }

    // texto
    const s = SZ.prob;
    revealLine(c, '¿Tu negocio tiene', 540, 1335, t, 4.15, { size: s, weight: 700, mode: 'up', stagger: 0.05, out: { t0: 5.75 } });
    revealLine(c, 'una idea increíble…', 540, 1335 + s * 1.2, t, 4.3, { size: s, weight: 700, mode: 'up', stagger: 0.07, fill: ['#FFFFFF', C.amber, C.amber], out: { t0: 5.78 } });
    revealLine(c, 'pero no sabes cómo', 540, 1335, t, 5.95, { size: s, weight: 700, mode: 'up', stagger: 0.05, out: { t0: 7.5 } });
    const l2 = revealLine(c, 'hacerla realidad?', 540, 1335 + s * 1.2, t, 6.1, { size: s, weight: 700, mode: 'up', stagger: 0.07, fill: ['#FFFFFF', C.amber], out: { t0: 7.53 } });
    // subrayado a mano bajo "realidad?"
    const up = E.outCubic(prog(t, 6.55, 6.85)) * (1 - prog(t, 7.45, 7.6));
    if (up > 0) {
      const xw = measure(c, 'hacerla ', s, 700);
      const ww = measure(c, 'realidad?', s, 700);
      const x0 = l2.x0 + xw, y0 = 1335 + s * 1.2 + 22;
      c.strokeStyle = '#FF4B4B';
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.beginPath();
      for (let i = 0; i <= 30 * up; i++) {
        const x = x0 + (ww * i) / 30;
        const y = y0 + Math.sin(i * 0.9) * 4 + i * 0.25;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }

    L.vignette(c, 0.55);
    // destello blanco: la idea se enciende
    const fl = E.inExpo(prog(t, 7.6, 7.97));
    if (fl > 0) {
      c.fillStyle = `rgba(255,253,245,${fl})`;
      c.fillRect(0, 0, W, H);
    }
    // entrada desde el gris del hook
    const fi = 1 - prog(t, 4.0, 4.15);
    if (fi > 0) {
      c.fillStyle = `rgba(41,41,44,${fi * 0.85})`;
      c.fillRect(0, 0, W, H);
    }
  }

  // ======================================================== 3. PRESENTACIÓN 8–13 s
  function presentation(c, t) {
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);
    const gx = 540, gy = 760;

    // guías de construcción
    const gp = E.outCubic(prog(t, 8.05, 8.75)), ga = 1 - prog(t, 9.3, 9.75);
    if (gp > 0 && ga > 0) {
      c.save();
      c.strokeStyle = rgba('#111111', 0.13 * ga);
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(gx - 560 * gp, gy);
      c.lineTo(gx + 560 * gp, gy);
      c.moveTo(gx, gy - 720 * gp);
      c.lineTo(gx, gy + 720 * gp);
      c.moveTo(gx - 420 * gp, gy - 420 * gp);
      c.lineTo(gx + 420 * gp, gy + 420 * gp);
      c.moveTo(gx + 420 * gp, gy - 420 * gp);
      c.lineTo(gx - 420 * gp, gy + 420 * gp);
      c.stroke();
      [330, 230, 140].forEach((r, i) => {
        c.beginPath();
        c.arc(gx, gy, r, -Math.PI / 2, -Math.PI / 2 + TAU * E.outCubic(prog(t, 8.1 + i * 0.08, 8.8 + i * 0.08)));
        c.stroke();
      });
      c.setLineDash([8, 10]);
      c.lineDashOffset = -t * 40;
      circle(c, gx, gy, 380);
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = ga * clamp((t - 8.4) / 0.3);
      text(c, 'CONSTRUCCIÓN', 80, 380, { size: 20, weight: 700, tracking: 6, fill: '#8C8A85', align: 'left' });
      text(c, 'Ø 660 px', 1000, 1150, { size: 20, weight: 600, tracking: 3, fill: '#8C8A85', align: 'right' });
      c.restore();
    }

    // lockup: se construye y luego sube
    const m = E.inOutExpo(prog(t, 9.65, 10.15));
    const isoY = lerp(gy, 330, m), isoSize = lerp(600, 290, m);
    const sweep = TAU * E.outCubic(prog(t, 8.05, 8.75));
    const isoS = kf(t, [[8.05, 0.86], [8.9, 1, E.outExpo]]);
    const isoR = kf(t, [[8.05, deg(30)], [8.9, 0, E.outExpo]]);
    if (sweep > 0) {
      c.save();
      c.beginPath();
      c.moveTo(gx, isoY);
      c.arc(gx, isoY, 900, -Math.PI / 2, -Math.PI / 2 + sweep);
      c.closePath();
      c.clip();
      iso(c, gx, isoY, isoSize, { rot: isoR, scale: isoS });
      c.restore();
    }
    const wordY = lerp(1210, 540, m), wordW = lerp(860, 470, m);
    wordmark(c, gx, wordY, wordW, t, 8.55);
    tagline(c, gx, 1335, 600, t, 8.95, { alpha: 1 - prog(t, 9.55, 9.75) });

    // brand board (bento)
    const tiles = [
      { x: 60, y: 650, w: 960, h: 250, k: 'pal' },
      { x: 60, y: 920, w: 470, h: 320, k: 'type' },
      { x: 550, y: 920, w: 470, h: 320, k: 'mock' },
      { x: 60, y: 1260, w: 960, h: 220, k: 'pat' },
    ];
    tiles.forEach((tl, i) => {
      const t0 = 9.95 + i * 0.1;
      const pin = E.outBackSoft(prog(t, t0, t0 + 0.45));
      const pout = E.inCubic(prog(t, 10.95 + i * 0.06, 11.25 + i * 0.06));
      if (pin <= 0 || pout >= 1) return;
      const s = lerp(0.82, 1, pin) * lerp(1, 0.9, pout);
      c.save();
      c.globalAlpha = clamp(pin * 1.5) * (1 - pout);
      c.translate(tl.x + tl.w / 2, tl.y + tl.h / 2 + (1 - pin) * 60 + pout * 80);
      c.scale(s, s);
      c.translate(-tl.w / 2, -tl.h / 2);
      L.softShadow(c, 40, 16, 0.12);
      rrect(c, 0, 0, tl.w, tl.h, 28);
      c.fillStyle = tl.k === 'type' ? '#121216' : tl.k === 'pal' ? '#FFFFFF' : '#000';
      if (tl.k === 'mock') c.fillStyle = linGrad(c, 0, 0, tl.w, tl.h, [C.pink, C.orange]);
      if (tl.k === 'pat') c.fillStyle = linGrad(c, 0, 0, tl.w, 0, [C.navy, C.blue, C.teal]);
      c.fill();
      L.noShadow(c);
      c.save();
      rrect(c, 0, 0, tl.w, tl.h, 28);
      c.clip();
      tileContent(c, tl, t - t0);
      c.restore();
      c.restore();
    });

    // claim
    const s = SZ.claim;
    const ty = 1000;
    revealLine(c, 'Diseño que', 540, ty, t, 11.15, { size: s, weight: 800, fill: '#111', out: { t0: 12.45, mode: 'fade', dur: 0.2 } });
    revealLine(c, 'convierte ideas', 540, ty + s * 1.15, t, 11.27, { size: s, weight: 800, fill: ['#111', gWarm(prog(t, 11.3, 12.6) * 0.5)], out: { t0: 12.45, mode: 'fade', dur: 0.2 } });
    revealLine(c, 'en identidad.', 540, ty + s * 2.3, t, 11.4, { size: s, weight: 800, fill: ['#111', gCols([C.blue, C.teal, C.mint], prog(t, 11.4, 12.6) * 0.5)], out: { t0: 12.45, mode: 'fade', dur: 0.2 } });

    // flash de entrada (la idea se encendió)
    const fl = 1 - E.outCubic(prog(t, 8.0, 8.35));
    if (fl > 0) {
      c.fillStyle = `rgba(255,253,245,${fl})`;
      c.fillRect(0, 0, W, H);
    }
    // salida: mancha de tinta negra
    inkWipe(c, t, 12.55, 13.0, INK, 540, 1000, 21);
  }

  function tileContent(c, tl, u) {
    const lab = (s, col = '#8C8A85') => text(c, s, 28, 46, { size: 18, weight: 700, tracking: 5, fill: col, align: 'left' });
    if (tl.k === 'pal') {
      lab('PALETA');
      const cols = [C.plum, C.pink, C.red, C.orange, C.amber, C.blue, C.teal];
      const sw = (tl.w - 56 - 6 * 12) / cols.length;
      cols.forEach((col, i) => {
        const p = E.outExpo(prog(u, 0.1 + i * 0.045, 0.6 + i * 0.045));
        const hh = (tl.h - 90) * p;
        c.fillStyle = col;
        rrect(c, 28 + i * (sw + 12), tl.h - 24 - hh, sw, hh, 14);
        c.fill();
        if (p > 0.6) text(c, col.toUpperCase(), 28 + i * (sw + 12) + sw / 2, tl.h - 42, { size: 15, weight: 600, fill: 'rgba(255,255,255,0.9)', alpha: (p - 0.6) * 2.5 });
      });
    } else if (tl.k === 'type') {
      lab('TIPOGRAFÍA', '#77767C');
      const wgt = Math.round(lerp(100, 900, E.inOutCubic(prog(u, 0.1, 0.8))));
      text(c, 'Aa', 40, 245, { size: 170, weight: wgt, fill: '#FFFFFF', align: 'left' });
      ['ABCDEFGHIJ', 'abcdefghij', '0123456789'].forEach((s, i) => {
        text(c, s, 290, 150 + i * 40, { size: 22, weight: 500, fill: 'rgba(255,255,255,0.55)', align: 'left', alpha: clamp((u - 0.2 - i * 0.06) / 0.2) });
      });
      text(c, String(wgt), 290, 280, { size: 18, weight: 700, tracking: 4, fill: C.amber, align: 'left' });
    } else if (tl.k === 'mock') {
      lab('APLICACIONES', 'rgba(255,255,255,0.8)');
      const p1 = E.outExpo(prog(u, 0.1, 0.6)), p2 = E.outExpo(prog(u, 0.2, 0.7));
      WK.bizCard(c, 250 + (1 - p2) * 300, 205, 270, deg(8), 'back', A);
      WK.bizCard(c, 215 - (1 - p1) * 300, 175, 270, deg(-7), 'front', A);
    } else if (tl.k === 'pat') {
      lab('PATRÓN', 'rgba(255,255,255,0.75)');
      const off = (u * 60) % 150;
      for (let row = 0; row < 3; row++) {
        for (let k = -1; k < 9; k++) {
          const x = k * 150 + (row % 2) * 75 - off + 40, y = 40 + row * 78;
          const a = clamp((u - 0.1 - k * 0.03) / 0.3);
          drawImg(c, A.isoWhite, x, y + 30, 66, 66, { rot: deg(row % 2 ? 180 : 0), alpha: 0.85 * a });
        }
      }
    }
  }

  // ======================================================== 4. SERVICIOS 13–24 s
  const SERV = [
    { n: '01', l: ['IDENTIDAD', 'VISUAL'], sub: 'Logotipos • Isotipos • Branding', col: C.pink, grad: [C.plum, C.pink, C.red] },
    { n: '02', l: ['DISEÑO', 'PARA REDES'], sub: 'Posts • Historias • Campañas', col: C.orange, grad: [C.red, C.orange, C.amber] },
    { n: '03', l: ['PUBLICIDAD'], sub: 'Flyers • Banners • Material promocional', col: C.blue, grad: [C.navy, C.blue, C.sky] },
    { n: '04', l: ['DISEÑO', 'DIGITAL'], sub: 'Contenido • Presentaciones • Piezas digitales', col: C.teal, grad: [C.tealDark, C.teal, C.mint] },
  ];
  const SB = [14.0, 16.5, 19.0, 21.5, 24.0]; // inicio de cada servicio
  const CARD = { x: 60, y: 200, w: 960, h: 800 };

  function services(c, t) {
    const idx = t < SB[1] ? 0 : t < SB[2] ? 1 : t < SB[3] ? 2 : 3;
    aurora(c, t, t < 14 ? null : SERV[idx].col, 1);

    // intro "¿QUÉ HACEMOS?"
    if (t < 14.1) {
      const zp = E.inExpo(prog(t, 13.68, 14.02));
      c.save();
      c.translate(540, 990);
      c.scale(1 + zp * 6, 1 + zp * 6);
      c.translate(-540, -990);
      c.globalAlpha = 1 - zp;
      const s = SZ.que;
      revealLine(c, '¿QUÉ', 540, 940, t, 13.05, { size: s, weight: 900, mode: 'scale', dur: 0.35, ease: E.outExpo });
      revealLine(c, 'HACEMOS?', 540, 940 + s * 1.02, t, 13.2, { size: s, weight: 900, mode: 'scale', dur: 0.35, ease: E.outExpo, fill: gFull(prog(t, 13.2, 14) * 0.5) });
      c.restore();
      text(c, 'SERVICIOS', 540, 700, { size: 26, weight: 700, tracking: 14, fill: 'rgba(255,255,255,0.6)', alpha: prog(t, 13.3, 13.5) * (1 - prog(t, 13.65, 13.8)) });
    }

    // tarjetas (carrusel con whip-pan)
    for (let i = 0; i < 4; i++) {
      const b0 = SB[i], b1 = SB[i + 1];
      if (t < b0 - 0.25 || t > b1 + 0.25) continue;
      let off = 0, rot = 0, sc = 1, al = 1;
      if (i === 0) {
        const p = E.outExpo(prog(t, 13.92, 14.4));
        sc = lerp(0.6, 1, p);
        al = clamp(p * 2);
        off = 0;
      } else {
        const p = E.inOutCubic(prog(t, b0 - 0.2, b0 + 0.2));
        off = 1150 * (1 - p);
        rot = deg(4) * (1 - p);
      }
      if (i < 3) {
        const p = E.inOutCubic(prog(t, b1 - 0.2, b1 + 0.2));
        off -= 1150 * p;
        rot -= deg(4) * p;
      } else {
        const p = E.inCubic(prog(t, 23.6, 24.0));
        sc *= lerp(1, 0.92, p);
      }
      if (Math.abs(off) > 1300 || al <= 0) continue;
      const u = t - b0;
      c.save();
      c.globalAlpha = al;
      c.translate(CARD.x + CARD.w / 2 + off, CARD.y + CARD.h / 2);
      c.rotate(rot);
      c.scale(sc, sc);
      c.translate(-CARD.w / 2, -CARD.h / 2);
      glow(c, CARD.w / 2, CARD.h / 2, 760, SERV[i].col, 0.35);
      L.softShadow(c, 60, 30, 0.5);
      rrect(c, 0, 0, CARD.w, CARD.h, 44);
      c.fillStyle = cardBg(c, i);
      c.fill();
      L.noShadow(c);
      c.save();
      rrect(c, 0, 0, CARD.w, CARD.h, 44);
      c.clip();
      showcase[i](c, u, CARD.w, CARD.h);
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.lineWidth = 2;
      rrect(c, 1, 1, CARD.w - 2, CARD.h - 2, 44);
      c.stroke();
      c.restore();
    }

    // textos del servicio
    for (let i = 0; i < 4; i++) {
      const b0 = SB[i], b1 = SB[i + 1];
      if (t < b0 - 0.1 || t > b1 + 0.05) continue;
      const sv = SERV[i];
      const outT = i < 3 ? b1 - 0.28 : 23.55;
      const s = SZ.serv;
      const x = 90;
      // número
      revealLine(c, sv.n, x, 1095, t, b0 + 0.02, { size: 40, weight: 800, align: 'left', fill: sv.col, out: { t0: outT } });
      revealLine(c, '/ 04', x + 66, 1095, t, b0 + 0.06, { size: 40, weight: 300, align: 'left', fill: 'rgba(255,255,255,0.45)', out: { t0: outT } });
      const lp = E.outExpo(prog(t, b0 + 0.08, b0 + 0.6)) * (1 - E.inExpo(prog(t, outT, outT + 0.25)));
      c.fillStyle = rgba(sv.col, 0.9);
      c.fillRect(x + 190, 1081, 300 * lp, 3);
      // título
      const ys = sv.l.length === 2 ? [1210, 1210 + s * 1.02] : [1210 + s * 0.5];
      sv.l.forEach((ln, k) => {
        revealLine(c, ln, x - 4, ys[k], t, b0 + 0.08 + k * 0.07, {
          size: s, weight: 900, align: 'left', stagger: 0.05,
          fill: k === sv.l.length - 1 && sv.l.length > 1 ? gCols(sv.grad, prog(t, b0, b1) * 0.6) : sv.l.length === 1 ? gCols(sv.grad, prog(t, b0, b1) * 0.6) : '#FFFFFF',
          out: { t0: outT + k * 0.03, mode: 'up' },
        });
      });
      // sub-servicios
      const words = sv.sub.split(' ');
      const fills = words.map((w) => (w === '•' ? sv.col : 'rgba(255,255,255,0.88)'));
      revealLine(c, sv.sub, x, 1420, t, b0 + 0.3, { size: SZ.sub, weight: 500, align: 'left', mode: 'fade', stagger: 0.06, dur: 0.4, fill: fills, out: { t0: outT, mode: 'fade', dur: 0.2 } });
    }

    // barra de progreso de servicios
    const pa = prog(t, 14.0, 14.3) * (1 - prog(t, 23.55, 23.75));
    if (pa > 0) {
      const sw = (900 - 3 * 14) / 4;
      for (let i = 0; i < 4; i++) {
        const x = 90 + i * (sw + 14), y = 1500;
        c.fillStyle = `rgba(255,255,255,${0.15 * pa})`;
        rrect(c, x, y, sw, 6, 3);
        c.fill();
        const f = prog(t, SB[i], SB[i + 1]);
        if (f > 0) {
          c.fillStyle = rgba(SERV[i].col, pa);
          rrect(c, x, y, sw * f, 6, 3);
          c.fill();
        }
      }
    }

    // transición: hoja de papel que sube (hacia PROCESO)
    const pp = E.inOutExpo(prog(t, 23.62, 24.0));
    if (pp > 0) {
      const y = H * (1 - pp);
      c.save();
      L.softShadow(c, 60, -20, 0.5);
      c.fillStyle = '#F2EEE6';
      c.fillRect(-20, y, W + 40, H + 40);
      L.noShadow(c);
      c.restore();
    }
  }

  function cardBg(c, i) {
    if (i === 0) return linGrad(c, 0, 0, CARD.w, CARD.h, ['#F1E8DA', '#E3D3BC']);
    if (i === 1) return linGrad(c, 0, 0, CARD.w, CARD.h, [C.amber, C.orange, C.red]);
    if (i === 2) return linGrad(c, 0, 0, CARD.w, CARD.h, ['#071237', '#0A2A8C', C.blue]);
    return linGrad(c, 0, 0, CARD.w, CARD.h, ['#06333B', '#0B6B78', C.teal]);
  }

  // --- piezas animadas por servicio (coords locales de la tarjeta 960x800)
  function nomadaLogo(c, x, y, s, p, noText) {
    const brown = '#3A2A21', terra = '#E07A4F', sand = '#C9B79C', cream = '#EDE3D3';
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    const ring = E.outCubic(prog(p, 0, 0.4));
    c.strokeStyle = brown;
    c.lineWidth = 6;
    c.beginPath();
    c.arc(0, 0, 252, -Math.PI / 2, -Math.PI / 2 + TAU * ring);
    c.stroke();
    const d = E.outBack(prog(p, 0.08, 0.42));
    if (d > 0) {
      c.save();
      circle(c, 0, 0, 230 * d);
      c.fillStyle = brown;
      c.fill();
      c.clip();
      const sun = (1 - E.outCubic(prog(p, 0.35, 0.75))) * 160;
      c.fillStyle = terra;
      circle(c, 0, 40 + sun, 95);
      c.fill();
      const mt = (1 - E.outExpo(prog(p, 0.25, 0.62))) * 260;
      c.fillStyle = sand;
      c.beginPath();
      c.moveTo(-40, 150 + mt);
      c.lineTo(90, -10 + mt);
      c.lineTo(260, 150 + mt);
      c.fill();
      c.fillStyle = cream;
      c.beginPath();
      c.moveTo(-260, 160 + mt * 1.2);
      c.lineTo(-60, -70 + mt * 1.2);
      c.lineTo(130, 160 + mt * 1.2);
      c.fill();
      c.fillStyle = brown;
      c.fillRect(-240, 140, 480, 200);
      c.restore();
    }
    if (!noText) revealLine(c, 'NÓMADA', 0, 390, p, 0.5, { size: 112, weight: 800, tracking: 22, fill: brown, byChar: true, stagger: 0.03, dur: 0.3 });
    if (!noText) text(c, 'COFFEE ROASTERS', 6, 450, { size: 28, weight: 600, tracking: 13, fill: brown, alpha: prog(p, 0.75, 0.95) });
    c.restore();
  }
  function nomadaCard(c, x, y, w, rot, side) {
    const h = w * 0.58;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    L.softShadow(c, 40, 20, 0.3);
    rrect(c, -w / 2, -h / 2, w, h, 10);
    c.fillStyle = side ? '#3A2A21' : '#F7F1E7';
    c.fill();
    L.noShadow(c);
    if (side) {
      c.save();
      rrect(c, -w / 2, -h / 2, w, h, 10);
      c.clip();
      c.fillStyle = '#E07A4F';
      circle(c, 0, h * 0.12, h * 0.26);
      c.fill();
      c.fillStyle = '#EDE3D3';
      c.beginPath();
      c.moveTo(-w * 0.5, h * 0.5);
      c.lineTo(-w * 0.05, h * 0.02);
      c.lineTo(w * 0.35, h * 0.5);
      c.fill();
      c.restore();
    } else {
      nomadaLogo(c, -w * 0.27, 0, h * 0.0013, 1, true);
      text(c, 'NÓMADA', -w * 0.07, -h * 0.01, { size: h * 0.13, weight: 800, tracking: 5, fill: '#3A2A21', align: 'left' });
      text(c, 'Café de especialidad', -w * 0.07, h * 0.12, { size: h * 0.068, weight: 500, fill: 'rgba(58,42,33,0.7)', align: 'left' });
    }
    c.restore();
  }
  function cup(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    L.softShadow(c, 40, 24, 0.3);
    c.fillStyle = '#F7F1E7';
    c.beginPath();
    c.moveTo(-80, -110);
    c.lineTo(80, -110);
    c.lineTo(62, 120);
    c.lineTo(-62, 120);
    c.closePath();
    c.fill();
    L.noShadow(c);
    c.fillStyle = '#3A2A21';
    c.beginPath();
    c.moveTo(-74, -40);
    c.lineTo(74, -40);
    c.lineTo(68, 40);
    c.lineTo(-68, 40);
    c.closePath();
    c.fill();
    c.fillStyle = '#E07A4F';
    circle(c, 0, 0, 22);
    c.fill();
    c.fillStyle = '#2A1E18';
    rrect(c, -90, -140, 180, 34, 10);
    c.fill();
    c.restore();
  }

  const showcase = [
    // 01 IDENTIDAD VISUAL
    (c, u, w, h) => {
      const m = E.inOutExpo(prog(u, 1.05, 1.5));
      const push = 1 + u * 0.015;
      c.save();
      c.translate(w / 2, h / 2);
      c.scale(push, push);
      c.translate(-w / 2, -h / 2);
      nomadaLogo(c, lerp(480, 250, m), lerp(330, 250, m), lerp(1.0, 0.5, m), prog(u, 0.05, 1.05));
      const p1 = E.outExpo(prog(u, 1.2, 1.7)), p2 = E.outExpo(prog(u, 1.32, 1.82)), p3 = E.outExpo(prog(u, 1.42, 1.92));
      if (p3 > 0) cup(c, 210, 600 + (1 - p3) * 500, 1.0);
      if (p1 > 0) nomadaCard(c, 640 + (1 - p1) * 600, 330, 420, deg(-8), 1);
      if (p2 > 0) nomadaCard(c, 610 + (1 - p2) * 600, 560, 420, deg(5), 0);
      c.restore();
    },
    // 02 DISEÑO PARA REDES
    (c, u, w, h) => {
      const push = 1 + u * 0.02;
      c.save();
      c.translate(w / 2, h / 2);
      c.scale(push, push);
      c.translate(-w / 2, -h / 2);
      const ps = E.outBack(prog(u, 0.25, 0.65));
      if (ps > 0) WK.card(c, WK.IMG.vela, 150, 380, 230, deg(-12), { scale: ps, r: 16 });
      const py = (1 - E.outExpo(prog(u, 0, 0.6))) * 900;
      WK.phone(c, 480, 430 + py, 320, deg(-5), (x, sw, sh) => {
        x.fillStyle = '#FFFFFF';
        x.fillRect(0, 0, sw, sh);
        x.fillStyle = linGrad(x, 0, 0, sw, 0, ['#FF4F3A', '#FF8A3D']);
        circle(x, 48, 92, 28);
        x.fill();
        text(x, 'fresca.juicebar', 88, 88, { size: 17, weight: 700, fill: '#111', align: 'left' });
        text(x, '248 posts   12.4K seguidores', 88, 110, { size: 11, weight: 500, fill: '#777', align: 'left' });
        const ts = (sw - 4) / 3;
        const scroll = E.inOutCubic(prog(u, 0.7, 2.3)) * ts * 1.6;
        x.save();
        x.beginPath();
        x.rect(0, 140, sw, sh - 140);
        x.clip();
        for (let k = 0; k < 18; k++) {
          const col = k % 3, row = Math.floor(k / 3);
          const ty = 140 + row * (ts + 2) - scroll;
          const a = E.outBack(prog(u, 0.35 + k * 0.03, 0.6 + k * 0.03));
          if (a <= 0) continue;
          x.save();
          x.translate(col * (ts + 2) + ts / 2, ty + ts / 2);
          x.scale(a, a);
          x.drawImage(WK.FEED[k], -ts / 2, -ts / 2, ts, ts);
          x.restore();
        }
        x.restore();
      });
      const pp = E.outBack(prog(u, 0.4, 0.8));
      if (pp > 0) {
        WK.card(c, WK.IMG.fresca, 790, 480, 300, deg(8), { scale: pp, r: 16 });
        const hp = E.outBack(prog(u, 1.1, 1.4));
        if (hp > 0) {
          c.save();
          c.translate(790, 480);
          c.rotate(deg(8));
          c.translate(-150 + 20, 187 - 50);
          c.fillStyle = 'rgba(255,255,255,0.95)';
          rrect(c, 0, 0, 170 * hp, 64, 32);
          c.fill();
          heart(c, 38, 34, 44 * hp, C.red);
          if (hp > 0.6) text(c, '2.4K', 70, 44, { size: 28, weight: 800, fill: '#111', align: 'left', alpha: (hp - 0.6) * 2.5 });
          c.restore();
          // partículas
          const q = prog(u, 1.1, 1.6);
          if (q > 0 && q < 1) {
            const R = rng(8);
            for (let k = 0; k < 10; k++) {
              const a = R() * TAU, d = 30 + 90 * E.outCubic(q);
              heart(c, 700 + Math.cos(a) * d, 650 + Math.sin(a) * d, 18 * (1 - q), rgba(C.pink, 1 - q));
            }
          }
        }
      }
      c.restore();
    },
    // 03 PUBLICIDAD
    (c, u, w, h) => {
      const push = 1 + u * 0.02;
      c.save();
      c.translate(w / 2, h / 2);
      c.scale(push, push);
      c.translate(-w / 2, -h / 2);
      // focos
      glow(c, 480, 260, 520, '#FFFFFF', 0.12);
      const p0 = E.outExpo(prog(u, 0, 0.5));
      WK.card(c, WK.IMG.beats, 480, 380 + (1 - p0) * 900, 380, deg(-1), { r: 10 });
      const p1 = E.outBack(prog(u, 0.25, 0.7));
      if (p1 > 0) WK.card(c, WK.IMG.forza, 185, -500 + p1 * 970, 270, deg(-11), { r: 10 });
      const p2 = E.outBack(prog(u, 0.4, 0.85));
      if (p2 > 0) WK.card(c, WK.IMG.kumo, 775, -500 + p2 * 950, 270, deg(9), { r: 10 });
      const p3 = E.outExpo(prog(u, 0.7, 1.15));
      if (p3 > 0) WK.card(c, WK.IMG.pulso, 480 - (1 - p3) * 1200, 690, 780, deg(-2), { r: 12 });
      c.restore();
    },
    // 04 DISEÑO DIGITAL
    (c, u, w, h) => {
      const push = 1 + u * 0.02;
      c.save();
      c.translate(w / 2, h / 2);
      c.scale(push, push);
      c.translate(-w / 2, -h / 2);
      const pb = E.outBack(prog(u, 0.5, 0.9));
      if (pb > 0) WK.card(c, WK.IMG.pulso, 270, 150, 400, deg(-6), { scale: pb, r: 12 });
      const pl = E.outExpo(prog(u, 0, 0.55));
      WK.laptop(c, 450, 560 + (1 - pl) * 800, 640, (x, sw, sh) => {
        const sp = [0.95, 1.75];
        const a = E.inOutExpo(prog(u, sp[0], sp[0] + 0.25)), b = E.inOutExpo(prog(u, sp[1], sp[1] + 0.25));
        const draw = (idx, off, p) => {
          x.save();
          x.translate(off * sw, 0);
          x.scale(sw / 1600, sh / 900);
          WK.slide(x, 1600, 900, idx, p);
          x.restore();
        };
        if (a < 1) draw(0, -a, prog(u, 0.2, 0.8));
        if (a > 0 && b < 1) draw(1, 1 - a - b, prog(u, 1.0, 1.7));
        if (b > 0) draw(2, 1 - b, prog(u, 1.85, 2.4));
      });
      const pp = E.outBack(prog(u, 0.35, 0.75));
      if (pp > 0) {
        WK.phone(c, 820, 470, 180, deg(8), (x, sw, sh) => {
          x.fillStyle = '#F4F7FB';
          x.fillRect(0, 0, sw, sh);
          x.fillStyle = linGrad(x, 0, 0, sw, 0, [C.navy, C.blue, C.teal]);
          x.fillRect(0, 0, sw, sh * 0.42);
          text(x, 'PULSO', 18, 70, { size: 22, weight: 900, fill: '#fff', align: 'left' });
          text(x, '72', 18, 128, { size: 46, weight: 800, fill: '#fff', align: 'left' });
          text(x, 'bpm', 76, 128, { size: 14, weight: 600, fill: 'rgba(255,255,255,0.8)', align: 'left' });
          x.strokeStyle = '#fff';
          x.lineWidth = 3;
          x.beginPath();
          const q = prog(u, 0.6, 1.6);
          for (let k = 0; k <= 40 * q; k++) {
            const xx = 10 + k * ((sw - 20) / 40);
            const yy = sh * 0.33 - (k % 10 === 5 ? 26 : k % 10 === 6 ? -18 : 0);
            if (k === 0) x.moveTo(xx, yy);
            else x.lineTo(xx, yy);
          }
          x.stroke();
          [0, 1, 2].forEach((k) => {
            x.fillStyle = '#FFFFFF';
            rrect(x, 12, sh * 0.47 + k * 62, sw - 24, 50, 12);
            x.fill();
            x.fillStyle = [C.blue, C.teal, C.orange][k];
            circle(x, 36, sh * 0.47 + k * 62 + 25, 12);
            x.fill();
            x.fillStyle = '#D9DEE7';
            rrect(x, 58, sh * 0.47 + k * 62 + 18, (sw - 100) * (0.5 + 0.3 * ((k + 1) % 2)), 12, 6);
            x.fill();
          });
        }, { scale: pp });
      }
      c.restore();
    },
  ];

  // ======================================================== 5. PROCESO 24–30 s
  const STEPS = ['IDEA', 'DISEÑO', 'DETALLE', 'RESULTADO'];
  const STEP_T = [24.0, 25.5, 27.0, 28.5];
  const ART = { x: 540, y: 845, s: 600 };
  // anclas aproximadas sobre el isotipo (coordenadas de isotipo.png, 680x680)
  const ANCHORS = [[315, 23], [463, 44], [543, 92], [598, 172], [606, 232], [573, 302], [493, 197], [198, 157], [43, 217],
    [20, 302], [194, 257], [90, 349], [303, 437], [506, 364], [250, 264], [641, 412], [618, 482], [285, 640], [658, 322],
    [125, 572], [210, 632], [586, 482]];

  function dotsBg(c, a = 1) {
    c.fillStyle = '#F2EEE6';
    c.fillRect(0, 0, W, H);
    c.fillStyle = `rgba(120,110,95,${0.18 * a})`;
    for (let y = 20; y < H; y += 40) for (let x = 20; x < W; x += 40) c.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
  function pencil(c, x, y, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    L.softShadow(c, 18, 10, 0.25);
    c.fillStyle = '#F4C430';
    c.fillRect(46, -13, 230, 26);
    L.noShadow(c);
    c.fillStyle = '#D9A91F';
    c.fillRect(46, 3, 230, 10);
    c.fillStyle = '#E8C9A0';
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(46, -13);
    c.lineTo(46, 13);
    c.closePath();
    c.fill();
    c.fillStyle = '#3B3A40';
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(14, -4);
    c.lineTo(14, 4);
    c.closePath();
    c.fill();
    c.fillStyle = '#BFC3C8';
    c.fillRect(276, -13, 26, 26);
    c.fillStyle = '#E58F9B';
    rrect(c, 300, -13, 30, 26, 6);
    c.fill();
    c.restore();
  }
  function penCursor(c, x, y) {
    c.save();
    c.translate(x, y);
    c.fillStyle = '#111';
    c.strokeStyle = '#fff';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(10, 26);
    c.lineTo(4, 34);
    c.lineTo(-4, 34);
    c.lineTo(-10, 26);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = '#fff';
    circle(c, 0, 20, 3);
    c.fill();
    c.restore();
  }
  const isoPt = (p) => [ART.x + (p[0] - 340) * (ART.s / 680), ART.y + (p[1] - 340) * (ART.s / 680)];

  function processScene(c, t) {
    const winIn = E.outExpo(prog(t, 25.45, 25.9));
    const winOut = E.inOutCubic(prog(t, 28.5, 28.85));
    const win = winIn * (1 - winOut);
    dotsBg(c, 1);

    // ventana de "software" genérico
    if (win > 0) {
      c.save();
      c.globalAlpha = win;
      const s = lerp(1.06, 1, winIn) * lerp(1, 1.06, winOut);
      c.translate(540, 825);
      c.scale(s, s);
      c.translate(-540, -825);
      L.softShadow(c, 60, 30, 0.35);
      c.fillStyle = '#1E1F24';
      rrect(c, 50, 400, 980, 850, 26);
      c.fill();
      L.noShadow(c);
      c.fillStyle = '#2A2C33';
      rrect(c, 50, 400, 980, 50, 26);
      c.fill();
      c.fillRect(50, 430, 980, 20);
      ['#E5675F', '#E9B949', '#5CC08A'].forEach((col, i) => {
        c.fillStyle = col;
        circle(c, 84 + i * 26, 425, 8);
        c.fill();
      });
      text(c, 'isotipo_v3.svg', 540, 432, { size: 18, weight: 600, fill: '#9A9CA5' });
      text(c, '100%', 1000, 432, { size: 16, weight: 600, fill: '#7D808A', align: 'right' });
      c.fillStyle = '#2A2C33';
      rrect(c, 66, 470, 52, 330, 14);
      c.fill();
      for (let k = 0; k < 7; k++) {
        c.fillStyle = k === 1 && t < 27 ? C.blue : '#5B5E68';
        rrect(c, 80, 486 + k * 44, 24, 24, 6);
        c.fill();
      }
      c.restore();
    }
    // mesa de trabajo (artboard)
    if (win > 0) {
      c.save();
      c.globalAlpha = win;
      c.fillStyle = '#FFFFFF';
      c.fillRect(ART.x - 320, ART.y - 320, 640, 640);
      c.restore();
    }

    // 1) boceto a lápiz
    const sk = TAU * E.inOutQuad(prog(t, 24.1, 25.2));
    const skA = 1 - prog(t, 25.7, 26.1);
    if (sk > 0 && skA > 0) {
      c.save();
      c.globalAlpha = skA * 0.92;
      c.beginPath();
      c.moveTo(ART.x, ART.y);
      c.arc(ART.x, ART.y, 900, -Math.PI / 2, -Math.PI / 2 + sk);
      c.closePath();
      c.clip();
      c.drawImage(A.sketch, ART.x - ART.s / 2, ART.y - ART.s / 2, ART.s, ART.s);
      c.restore();
      // círculo de construcción a mano
      c.save();
      c.globalAlpha = skA * 0.35;
      c.strokeStyle = '#343238';
      c.lineWidth = 2;
      c.setLineDash([6, 8]);
      c.beginPath();
      c.arc(ART.x, ART.y, 335, -Math.PI / 2, -Math.PI / 2 + sk * 0.98);
      c.stroke();
      c.setLineDash([]);
      c.restore();
    }
    if (t > 24.05 && t < 25.4) {
      const a = -Math.PI / 2 + sk;
      const r = 210 + wiggle(t, 7, 70, 4);
      const pa = prog(t, 24.05, 24.2) * (1 - prog(t, 25.25, 25.4));
      c.save();
      c.globalAlpha = pa;
      pencil(c, ART.x + Math.cos(a) * r, ART.y + Math.sin(a) * r, deg(-50));
      c.restore();
    }
    if (t < 26.0) {
      c.save();
      c.globalAlpha = 1 - prog(t, 25.45, 25.7);
      handNote2(c, '¡idea!', 880, 520, t, 24.55, deg(-8));
      const ap = E.outCubic(prog(t, 24.75, 24.95));
      if (ap > 0) {
        c.strokeStyle = '#343238';
        c.lineWidth = 3;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(860, 545);
        c.quadraticCurveTo(840, 600, 760 + 20 * (1 - ap), 600 + 10 * (1 - ap));
        c.stroke();
      }
      c.restore();
    }

    // 2) vector: contornos azules + anclas
    const vA = prog(t, 25.6, 26.0) * (1 - prog(t, 27.35, 27.7));
    if (vA > 0) {
      c.save();
      c.globalAlpha = vA;
      c.drawImage(A.edgeBlue, ART.x - ART.s / 2, ART.y - ART.s / 2, ART.s, ART.s);
      c.restore();
      ANCHORS.forEach((p, i) => {
        const t0 = 25.7 + i * 0.035;
        const ap = E.outBack(prog(t, t0, t0 + 0.2)) * vA;
        if (ap <= 0) return;
        const [x, y] = isoPt(p);
        const nx = ANCHORS[(i + 1) % ANCHORS.length];
        const [x2, y2] = isoPt(nx);
        const a = Math.atan2(y2 - y, x2 - x);
        if (i % 3 === 0) {
          c.strokeStyle = rgba(C.blue, 0.8 * ap);
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(x - Math.cos(a) * 46, y - Math.sin(a) * 46);
          c.lineTo(x + Math.cos(a) * 46, y + Math.sin(a) * 46);
          c.stroke();
          c.fillStyle = C.blue;
          circle(c, x - Math.cos(a) * 46, y - Math.sin(a) * 46, 4 * ap);
          c.fill();
          circle(c, x + Math.cos(a) * 46, y + Math.sin(a) * 46, 4 * ap);
          c.fill();
        }
        c.fillStyle = '#FFFFFF';
        c.strokeStyle = C.blue;
        c.lineWidth = 2;
        const s = 11 * ap;
        c.fillRect(x - s / 2, y - s / 2, s, s);
        c.strokeRect(x - s / 2, y - s / 2, s, s);
      });
      // cursor pluma siguiendo las anclas
      const k = Math.floor(clamp((t - 25.7) / 0.035, 0, ANCHORS.length - 1));
      if (t > 25.7 && t < 27.3) {
        const [x, y] = isoPt(ANCHORS[k]);
        penCursor(c, x + 6, y + 4);
      }
      // caja de selección
      const bp = E.outExpo(prog(t, 26.45, 26.75)) * vA;
      if (bp > 0) {
        const s = ART.s * 0.97 * lerp(1.08, 1, bp);
        c.strokeStyle = rgba(C.blue, bp);
        c.lineWidth = 1.5;
        c.strokeRect(ART.x - s / 2, ART.y - s / 2, s, s);
        [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
          c.fillStyle = '#fff';
          c.fillRect(ART.x + (dx * s) / 2 - 6, ART.y + (dy * s) / 2 - 6, 12, 12);
          c.strokeRect(ART.x + (dx * s) / 2 - 6, ART.y + (dy * s) / 2 - 6, 12, 12);
        });
      }
    }

    // 3) detalle: color, degradado y lupa
    const fillP = E.inOutCubic(prog(t, 27.0, 27.6));
    const art = 1 - E.inOutCubic(prog(t, 28.5, 28.85));
    if (fillP > 0 && art > 0) {
      c.save();
      c.globalAlpha = art;
      const k = lerp(-700, 700, fillP);
      c.beginPath();
      c.moveTo(ART.x - 400, ART.y + 400);
      c.lineTo(ART.x - 400 + 0, ART.y + 400 - (k + 700) * 1.2);
      c.lineTo(ART.x - 400 + (k + 700) * 1.2, ART.y + 400);
      c.closePath();
      c.clip();
      const s = lerp(1, 0.6, E.inOutCubic(prog(t, 28.5, 28.85)));
      iso(c, ART.x, ART.y, ART.s * s);
      c.restore();
    }
    const gp = E.outExpo(prog(t, 27.25, 27.6)) * (1 - prog(t, 28.35, 28.55));
    if (gp > 0) {
      c.save();
      c.globalAlpha = gp;
      c.translate(0, (1 - gp) * 40);
      L.softShadow(c, 30, 12, 0.35);
      c.fillStyle = '#2A2C33';
      rrect(c, 600, 1040, 400, 150, 18);
      c.fill();
      L.noShadow(c);
      text(c, 'Degradado', 624, 1080, { size: 18, weight: 700, fill: '#C9CBD2', align: 'left' });
      c.fillStyle = linGrad(c, 624, 0, 976, 0, [C.plum, C.pink, C.red, C.orange, C.amber]);
      rrect(c, 624, 1100, 352, 26, 8);
      c.fill();
      [C.plum, C.pink, C.red, C.orange, C.amber].forEach((col, i) => {
        const sp = E.outBack(prog(t, 27.4 + i * 0.05, 27.6 + i * 0.05));
        c.fillStyle = col;
        c.strokeStyle = '#fff';
        c.lineWidth = 3;
        circle(c, 624 + i * 88, 1150, 11 * sp);
        c.fill();
        c.stroke();
      });
      c.restore();
    }
    const lp = E.outBack(prog(t, 27.65, 27.95)) * (1 - prog(t, 28.3, 28.5));
    if (lp > 0) {
      const lx = 800, ly = 640, lr = 120 * lp;
      const target = isoPt([476, 282]);
      c.save();
      L.softShadow(c, 30, 14, 0.35);
      circle(c, lx, ly, lr);
      c.fillStyle = '#fff';
      c.fill();
      L.noShadow(c);
      circle(c, lx, ly, lr);
      c.clip();
      const z = 2.4;
      c.translate(lx, ly);
      c.scale(z, z);
      c.translate(-target[0], -target[1]);
      iso(c, ART.x, ART.y, ART.s);
      c.restore();
      c.strokeStyle = '#1E1F24';
      c.lineWidth = 8;
      circle(c, lx, ly, lr);
      c.stroke();
      c.lineWidth = 14;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(lx + lr * 0.72, ly + lr * 0.72);
      c.lineTo(lx + lr * 1.15, ly + lr * 1.15);
      c.stroke();
    }

    // 4) resultado: mockup de tarjetas
    const rp = E.outExpo(prog(t, 28.55, 29.05));
    if (rp > 0) {
      const zoom = E.inExpo(prog(t, 29.55, 30.0));
      c.save();
      c.translate(600, 1000);
      c.scale(1 + zoom * 5, 1 + zoom * 5);
      c.translate(-600, -1000);
      glow(c, 540, 820, 700, '#FFFFFF', 0.5);
      const p2 = E.outExpo(prog(t, 28.75, 29.25));
      if (p2 > 0) WK.bizCard(c, 600 + (1 - p2) * 700, 1000, 600, deg(8), 'back', A);
      c.save();
      c.globalAlpha = clamp(rp * 2);
      WK.bizCard(c, 500, 780, lerp(560, 640, rp), deg(-6 * rp), 'front', A);
      c.restore();
      // brillo especular que cruza
      const sp = prog(t, 29.0, 29.6);
      if (sp > 0 && sp < 1) {
        c.save();
        c.globalCompositeOperation = 'soft-light';
        c.fillStyle = linGrad(c, -300 + sp * 1600, 0, 0 + sp * 1600, 300, ['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']);
        c.fillRect(0, 500, W, 800);
        c.restore();
      }
      c.restore();
    }

    // encabezado de pasos
    stepsHeader(c, t);

    // textos
    const s1 = SZ.proc1, s2 = SZ.proc2;
    revealLine(c, 'De una idea en papel…', 540, 1385, t, 24.3, { size: s1, weight: 600, fill: '#1B1B20', mode: 'up', stagger: 0.06, out: { t0: 26.65 } });
    revealLine(c, 'a una identidad', 540, 1365, t, 26.9, { size: s2, weight: 800, fill: '#1B1B20', mode: 'up', stagger: 0.06, out: { t0: 29.45, dur: 0.25 } });
    revealLine(c, 'que habla por ti.', 540, 1365 + s2 * 1.12, t, 27.05, { size: s2, weight: 800, fill: ['#1B1B20', gWarm(prog(t, 27, 29.5) * 0.6), gWarm(prog(t, 27, 29.5) * 0.6), gWarm(prog(t, 27, 29.5) * 0.6)], mode: 'up', stagger: 0.06, out: { t0: 29.48, dur: 0.25 } });
  }

  function handNote2(c, str, x, y, t, t0, rot) {
    const p = prog(t, t0, t0 + 0.3);
    if (p <= 0) return;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    const w = measure(c, str, 64, 700, 0, 'Caveat');
    c.beginPath();
    c.rect(-w / 2 - 10, -70, (w + 20) * p, 100);
    c.clip();
    text(c, str, 0, 0, { size: 64, weight: 700, family: 'Caveat', fill: '#343238' });
    c.restore();
  }

  function stepsHeader(c, t) {
    const a = E.outExpo(prog(t, 24.0, 24.4)) * (1 - prog(t, 29.5, 29.75));
    if (a <= 0) return;
    const size = 28, gap = 22, arrow = 40;
    const ws = STEPS.map((s) => measure(c, s, size, 800, 3));
    const total = ws.reduce((x, y) => x + y, 0) + 3 * (arrow + gap * 2);
    let x = 540 - total / 2;
    const y = 290 - (1 - a) * 30;
    const cur = t < STEP_T[1] ? 0 : t < STEP_T[2] ? 1 : t < STEP_T[3] ? 2 : 3;
    c.save();
    c.globalAlpha = a;
    STEPS.forEach((s, i) => {
      const col = i === cur ? '#111111' : i < cur ? 'rgba(17,17,17,0.55)' : '#B9B3A8';
      text(c, s, x, y, { size, weight: 800, tracking: 3, fill: col, align: 'left' });
      if (i === cur) {
        const up = E.outExpo(prog(t, STEP_T[i], STEP_T[i] + 0.35));
        c.fillStyle = linGrad(c, x, 0, x + ws[i], 0, [C.pink, C.orange, C.amber]);
        rrect(c, x, y + 14, ws[i] * up, 6, 3);
        c.fill();
      }
      x += ws[i];
      if (i < 3) {
        const done = i < cur;
        arrowLine(c, x + gap, y - 10, x + gap + arrow, y - 10, done ? 'rgba(17,17,17,0.55)' : '#C9C3B8', 3, 10);
        x += arrow + gap * 2;
      }
    });
    c.restore();
  }

  // ======================================================== 6. RESULTADOS 30–35 s
  function fitCard(img, maxW, maxH) {
    const s = Math.min(maxW / img.width, maxH / img.height);
    return img.width * s;
  }
  function heroCut(c, key, u, k, bgCol) {
    const img = WK.IMG[key];
    if (bgCol) {
      c.fillStyle = bgCol;
      c.fillRect(0, 0, W, H);
      glow(c, 540, 900, 900, '#FFFFFF', 0.18);
    } else {
      drawCover(c, WK.BLUR[key], 0, 0, W, H, 1.25);
      c.fillStyle = 'rgba(0,0,0,0.32)';
      c.fillRect(0, 0, W, H);
    }
    const p = E.outExpo(clamp(u / 0.3));
    const w = fitCard(img, 860, 1300) * lerp(1.14, 1, p);
    const rot = (k % 2 ? 1 : -1) * deg(bgCol ? 10 : 2.5) * (1 - E.outBack(clamp(u / 0.3)));
    WK.card(c, img, 540, 920, w, rot, { r: 24, blur: 80, sy: 40, shadowA: 0.5 });
    const fl = 1 - clamp(u / 0.1);
    if (fl > 0) {
      c.fillStyle = `rgba(255,255,255,${0.3 * fl})`;
      c.fillRect(0, 0, W, H);
    }
  }
  const WALL = ['nomada', 'fresca', 'beats', 'kumo', 'bloom', 'forza', 'vela', 'slide1', 'pulso', 'slide2', 'slide0'];
  function marquee(c, t) {
    c.fillStyle = INK;
    c.fillRect(0, 0, W, H);
    const ent = E.outExpo(prog(t, 31.0, 31.35));
    c.save();
    c.translate(540, 960);
    c.rotate(deg(-10));
    c.scale(lerp(1.35, 1, ent), lerp(1.35, 1, ent));
    for (let row = -2; row <= 2; row++) {
      const dir = row % 2 ? 1 : -1;
      const hgt = 470;
      let x = -2400 + dir * (t - 31) * 420 + row * 170;
      let k = row + 5;
      while (x < 1500) {
        const key = WALL[(k++ * 7) % WALL.length];
        const img = WK.IMG[key];
        const w = (hgt * img.width) / img.height;
        const ww = Math.min(w, 760);
        WK.card(c, img, x + ww / 2, row * (hgt + 36), ww, 0, { h: hgt, r: 20, shadow: false });
        x += ww + 36;
        if (k > 60) break;
      }
    }
    c.restore();
    // capa oscura para el texto
    const da = prog(t, 31.1, 31.3) * (1 - prog(t, 32.85, 33.0));
    c.fillStyle = `rgba(8,8,12,${0.62 * da})`;
    c.fillRect(0, 0, W, H);
    const s = SZ.merece;
    revealLine(c, 'TU MARCA MERECE', 540, 860, t, 31.2, { size: s, weight: 900, stagger: 0.06, out: { t0: 32.75 } });
    revealLine(c, 'VERSE COMO', 540, 860 + s * 1.1, t, 31.38, { size: s, weight: 900, stagger: 0.06, out: { t0: 32.78 } });
    revealLine(c, 'IMAGINAS.', 540, 860 + s * 2.2, t, 31.56, { size: s * 1.35, weight: 900, stagger: 0.06, fill: gFull(prog(t, 31.5, 33) * 0.8), out: { t0: 32.81 } });
  }
  function collapse(c, t) {
    c.fillStyle = INK;
    c.fillRect(0, 0, W, H);
    const zin = E.outExpo(prog(t, 34.5, 34.72));
    const cols = 3, rows = 4, tw = 300, th = 375, gap = 24;
    const gw = cols * tw + (cols - 1) * gap, gh = rows * th + (rows - 1) * gap;
    const sc = lerp(2.4, 1, zin);
    // fondo papel que se abre desde el centro
    const pr = E.inOutExpo(prog(t, 34.72, 35.0));
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const i = r * cols + k;
        const key = WALL[i % WALL.length];
        let x = -gw / 2 + k * (tw + gap) + tw / 2, y = -gh / 2 + r * (th + gap) + th / 2;
        const d = Math.hypot(x, y) / 900;
        const q = E.inBack(prog(t, 34.72 + d * 0.06, 34.95 + d * 0.04));
        x *= 1 - q;
        y *= 1 - q;
        const s = sc * (1 - q);
        if (s <= 0.01) continue;
        c.save();
        c.translate(540 + x * sc, 960 + y * sc);
        c.rotate(deg(90) * q * (i % 2 ? 1 : -1));
        c.scale(s, s);
        WK.card(c, WK.IMG[key], 0, 0, tw, 0, { h: th, r: 16, shadow: false });
        c.restore();
      }
    }
    if (pr > 0) {
      c.fillStyle = PAPER;
      circle(c, 540, 960, 1200 * pr);
      c.fill();
    }
  }
  function results(c, t) {
    if (t < 31.0) {
      const keys = ['beats', 'nomada', 'fresca', 'kumo'];
      const k = Math.min(3, Math.floor((t - 30) / 0.25));
      heroCut(c, keys[k], t - 30 - k * 0.25, k, null);
    } else if (t < 33.0) {
      marquee(c, t);
    } else if (t < 34.5) {
      const keys = ['bloom', 'forza', 'vela', 'slide1', 'kumo', 'fresca'];
      const bgs = [C.pink, null, C.orange, null, C.blue, null];
      const k = Math.min(5, Math.floor((t - 33) / 0.25));
      heroCut(c, keys[k], t - 33 - k * 0.25, k, bgs[k]);
    } else {
      collapse(c, t);
    }
  }

  // ======================================================== 7. CTA 35–40 s
  function cta(c, t) {
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);
    [C.pink, C.amber, C.blue, C.teal].forEach((col, i) => {
      glow(c, 540 + Math.sin(t * 0.5 + i * 1.6) * 380, 960 + Math.cos(t * 0.4 + i * 2.1) * 600, 700, col, 0.07);
    });
    const push = 1 + 0.025 * E.inOutCubic(prog(t, 37.9, 40));
    c.save();
    c.translate(540, 960);
    c.scale(push, push);
    c.translate(-540, -960);

    // isotipo: pequeño arriba -> grande al centro
    const m = E.inOutExpo(prog(t, 37.35, 37.95));
    const ip = E.outBack(prog(t, 35.05, 35.5));
    if (ip > 0) {
      const y = lerp(470, 720, m), size = lerp(260, 500, m);
      const rot = deg(-120) * (1 - E.outExpo(prog(t, 35.05, 35.6))) + deg(2) * Math.sin(t * 1.2);
      iso(c, 540, y, size, { rot, scale: ip });
    }

    const s1 = SZ.tuIdea, s3 = SZ.creat;
    const outT = 37.05;
    revealLine(c, 'TU IDEA.', 540, 820, t, 35.0, { size: s1, weight: 900, fill: '#111', mode: 'scale', dur: 0.3, out: { t0: outT } });
    revealLine(c, 'NUESTRA', 540, 940, t, 35.35, { size: SZ.nuestra, weight: 300, tracking: 18, fill: '#55555E', out: { t0: outT + 0.03 } });
    revealLine(c, 'CREATIVIDAD.', 540, 940 + s3 * 1.08, t, 35.5, { size: s3, weight: 900, fill: gFull(prog(t, 35.5, 37.3) * 0.8), byChar: true, stagger: 0.025, dur: 0.45, out: { t0: outT + 0.06, stagger: 0.012, dur: 0.3 } });
    revealLine(c, '¿Listo para darle identidad', 540, 1240, t, 36.15, { size: SZ.listo, weight: 500, fill: '#3A3A42', mode: 'fade', stagger: 0.04, out: { t0: outT + 0.08, mode: 'fade', dur: 0.2 } });
    revealLine(c, 'a tu proyecto?', 540, 1240 + SZ.listo * 1.3, t, 36.3, { size: SZ.listo, weight: 500, fill: '#3A3A42', mode: 'fade', stagger: 0.04, out: { t0: outT + 0.1, mode: 'fade', dur: 0.2 } });

    // lockup final
    wordmark(c, 540, 1140, 840, t, 37.7, { stagger: 0.04, dur: 0.55 });
    const lp = E.outExpo(prog(t, 38.1, 38.7));
    if (lp > 0) {
      c.fillStyle = linGrad(c, 540 - 170, 0, 540 + 170, 0, [C.pink, C.orange, C.amber, C.blue, C.teal]);
      rrect(c, 540 - 170 * lp, 1232, 340 * lp, 6, 3);
      c.fill();
    }
    const words = ['Diseño', '•', 'Branding', '•', 'Creatividad'];
    revealLine(c, words.join(' '), 540, 1325, t, 38.15, { size: SZ.final, weight: 600, tracking: 4, mode: 'fade', stagger: 0.07, dur: 0.5, fill: ['#2A2A31', C.pink, '#2A2A31', C.teal, '#2A2A31'] });
    c.restore();

    // entrada (golpe blanco)
    const fl = 1 - prog(t, 35.0, 35.2);
    if (fl > 0) {
      c.fillStyle = `rgba(255,255,255,${fl * 0.8})`;
      c.fillRect(0, 0, W, H);
    }
  }

  // ======================================================== orquestación
  const IMPACTS = [[0.5, 16], [8.0, 12], [14.0, 6], [30.0, 12], [35.0, 10], [37.7, 6]];
  // [inicio, fin, muestras] — motion blur sólo donde hay movimiento rápido
  const BLUR_WIN = [[0.5, 1.25, 8], [2.15, 2.45, 6], [3.35, 3.8, 8], [9.65, 10.15, 6], [13.68, 14.05, 10], [16.28, 16.72, 12],
    [18.78, 19.22, 12], [21.28, 21.72, 12], [23.62, 24.0, 8], [29.55, 30.0, 10], [34.5, 35.0, 8], [37.35, 37.95, 6]];

  function shake(t) {
    let x = 0, y = 0;
    for (const [t0, amp] of IMPACTS) {
      const d = t - t0;
      if (d < 0 || d > 0.45) continue;
      const k = amp * Math.pow(1 - d / 0.45, 2);
      x += wiggle(t, 24, k, t0 * 3);
      y += wiggle(t, 24, k, t0 * 7 + 1);
    }
    return [x, y];
  }

  function draw(c, t, f) {
    c.save();
    const [sx, sy] = shake(t);
    if (sx || sy) {
      c.translate(540 + sx, 960 + sy);
      c.scale(1.03, 1.03);
      c.translate(-540, -960);
    }
    if (t < 4.0) hook(c, t);
    else if (t < 8.0) problem(c, t);
    else if (t < 13.0) presentation(c, t);
    else if (t < 24.0) services(c, t);
    else if (t < 30.0) processScene(c, t);
    else if (t < 35.0) results(c, t);
    else cta(c, t);
    c.restore();
  }

  function post(c, t, f) {
    const dark = t < 8.0 || (t >= 13 && t < 23.9) || (t >= 30 && t < 34.85);
    if (dark) L.vignette(c, t >= 4 && t < 8 ? 0.2 : 0.45);
    L.grain(c, f, dark ? 0.07 : 0.045);
  }

  function blurSamples(t) {
    for (const [a, b, n] of BLUR_WIN) if (t >= a && t <= b) return n;
    return 1;
  }

  function init() {
    const c = document.createElement('canvas').getContext('2d');
    SZ.hook = fitSize(c, 'DISEÑAMOS.', 900, 900, 140);
    SZ.prob = fitSize(c, 'una idea increíble…', 700, 900, 80);
    SZ.claim = fitSize(c, 'convierte ideas', 800, 900, 100);
    SZ.que = fitSize(c, 'HACEMOS?', 900, 920, 200);
    SZ.serv = Math.min(fitSize(c, 'PARA REDES', 900, 900, 120), fitSize(c, 'IDENTIDAD', 900, 900, 120), fitSize(c, 'PUBLICIDAD', 900, 900, 120));
    SZ.sub = Math.min(40, fitSize(c, 'Contenido • Presentaciones • Piezas digitales', 500, 900, 40));
    SZ.proc1 = fitSize(c, 'De una idea en papel…', 600, 900, 72);
    SZ.proc2 = fitSize(c, 'que habla por ti.', 800, 900, 92);
    SZ.merece = fitSize(c, 'TU MARCA MERECE', 900, 920, 120);
    SZ.tuIdea = fitSize(c, 'TU IDEA.', 900, 900, 170);
    SZ.nuestra = 64;
    SZ.creat = fitSize(c, 'CREATIVIDAD.', 900, 940, 140);
    SZ.listo = fitSize(c, '¿Listo para darle identidad', 500, 880, 50);
    SZ.final = fitSize(c, 'Diseño • Branding • Creatividad', 600, 860, 46, 4);
  }

  G.SCENES = { init, draw, post, blurSamples };
})(window);
