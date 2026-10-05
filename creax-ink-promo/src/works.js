/* CREAX.INK promo — piezas de portafolio de EJEMPLO + mockups.
 *
 * IMPORTANTE: estas marcas (NÓMADA, FRESCA, URBAN BEATS, FORZA, BLOOM, KUMO,
 * VELA, PULSO) son ficticias y sirven de placeholder. Para usar trabajos
 * reales de CREAX.INK, coloca las imágenes en assets/works/ y declara la ruta
 * en src/config.js (WORK_OVERRIDES). El motor usará tu imagen en lugar de la
 * pieza generada.
 */
(function (G) {
  'use strict';
  const L = G.L;
  const { makeCanvas, rrect, linGrad, text, circle, TAU, rng, clamp, lerp, deg } = L;

  // ---------------- Piezas (estáticas, se pre-renderizan una vez) ----------------
  const P = {};

  P.nomada = function (c, w, h) {
    c.fillStyle = '#EDE3D3';
    c.fillRect(0, 0, w, h);
    const brown = '#3A2A21', terra = '#E07A4F', sand = '#C9B79C';
    // marco fino
    c.strokeStyle = 'rgba(58,42,33,0.25)';
    c.lineWidth = 2;
    c.strokeRect(40, 40, w - 80, h - 80);
    const cx = w / 2, cy = 500, r = 230;
    c.save();
    circle(c, cx, cy, r);
    c.fillStyle = brown;
    c.fill();
    c.clip();
    c.fillStyle = terra;
    circle(c, cx, cy + 40, 95);
    c.fill();
    c.fillStyle = sand;
    c.beginPath();
    c.moveTo(cx - 40, cy + 150);
    c.lineTo(cx + 90, cy - 10);
    c.lineTo(cx + 260, cy + 150);
    c.fill();
    c.fillStyle = '#EDE3D3';
    c.beginPath();
    c.moveTo(cx - 260, cy + 160);
    c.lineTo(cx - 60, cy - 70);
    c.lineTo(cx + 130, cy + 160);
    c.fill();
    c.fillStyle = brown;
    c.fillRect(cx - r, cy + 140, r * 2, 200);
    c.restore();
    c.strokeStyle = brown;
    c.lineWidth = 5;
    circle(c, cx, cy, r + 22);
    c.stroke();
    text(c, 'NÓMADA', cx + 12, 890, { size: 122, weight: 800, tracking: 24, fill: brown });
    text(c, 'COFFEE ROASTERS', cx + 7, 955, { size: 30, weight: 600, tracking: 14, fill: brown });
    const pal = [brown, terra, sand, '#6B8F71', '#F6F0E6'];
    pal.forEach((col, i) => {
      c.fillStyle = col;
      circle(c, cx + (i - 2) * 110, 1140, 38);
      c.fill();
      if (i === 4) {
        c.strokeStyle = 'rgba(58,42,33,0.35)';
        c.lineWidth = 2;
        c.stroke();
      }
    });
    text(c, 'EST. 2024', cx, 1245, { size: 22, weight: 600, tracking: 10, fill: 'rgba(58,42,33,0.6)' });
  };

  function orangeSlice(c, x, y, r, rind = '#FFB000', flesh = '#FFD45C', seg = '#FFE79A') {
    c.fillStyle = rind;
    circle(c, x, y, r);
    c.fill();
    c.fillStyle = '#FFF4E0';
    circle(c, x, y, r * 0.9);
    c.fill();
    c.fillStyle = flesh;
    circle(c, x, y, r * 0.86);
    c.fill();
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU + 0.04, a1 = ((i + 1) / n) * TAU - 0.04;
      c.beginPath();
      c.moveTo(x + Math.cos((a0 + a1) / 2) * r * 0.1, y + Math.sin((a0 + a1) / 2) * r * 0.1);
      c.arc(x, y, r * 0.8, a0, a1);
      c.closePath();
      c.fillStyle = seg;
      c.fill();
    }
    c.fillStyle = '#FFF4E0';
    circle(c, x, y, r * 0.08);
    c.fill();
  }

  function starburst(c, x, y, r, n, fill, rot = 0) {
    c.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (i / (n * 2)) * TAU;
      const rr = i % 2 ? r * 0.82 : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }

  P.fresca = function (c, w, h) {
    c.fillStyle = linGrad(c, 0, 0, w, h, ['#FF4F3A', '#FF8A3D']);
    c.fillRect(0, 0, w, h);
    orangeSlice(c, 820, 330, 270);
    const cream = '#FFF4E0';
    text(c, 'FRESCO', 70, 820, { size: 205, weight: 900, fill: cream, align: 'left', tracking: -4 });
    text(c, 'CADA', 70, 1010, { size: 205, weight: 900, fill: cream, align: 'left', tracking: -4 });
    text(c, 'DÍA.', 70, 1200, { size: 205, weight: 900, fill: '#3B0D0C', align: 'left', tracking: -4 });
    c.save();
    c.translate(270, 360);
    c.rotate(deg(-12));
    starburst(c, 0, 0, 135, 14, '#FFE14D');
    text(c, 'NUEVO', 0, 16, { size: 46, weight: 900, fill: '#E2362A' });
    c.restore();
    text(c, 'fresca · juice bar', w - 70, 1270, { size: 30, weight: 600, fill: cream, align: 'right' });
  };

  P.beats = function (c, w, h) {
    c.fillStyle = '#120A24';
    c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 560;
    for (let r = 80; r < 760; r += 38) {
      c.strokeStyle = `rgba(255,80,140,${0.45 - r / 2000})`;
      c.lineWidth = 2;
      circle(c, cx, cy, r);
      c.stroke();
    }
    c.save();
    circle(c, cx, cy, 300);
    c.clip();
    c.fillStyle = linGrad(c, 0, cy - 300, 0, cy + 300, ['#FF2E7E', '#FF6A3D', '#FFB21C']);
    c.fillRect(cx - 300, cy - 300, 600, 600);
    c.fillStyle = '#120A24';
    for (let i = 0; i < 7; i++) {
      const y = cy + 40 + i * 40;
      c.fillRect(cx - 300, y, 600, 6 + i * 3.2);
    }
    c.restore();
    text(c, 'LIVE MUSIC FESTIVAL', cx, 150, { size: 30, weight: 600, tracking: 12, fill: 'rgba(255,255,255,0.8)' });
    text(c, 'URBAN', cx, 1010, { size: 190, weight: 900, tracking: 6, fill: (x, a, b) => linGrad(x, a, 0, b, 0, ['#FF2E7E', '#FFB21C']) });
    text(c, 'BEATS', cx, 1190, { size: 210, weight: 900, fill: '#FFFFFF', tracking: 6 });
    text(c, '15 · NOV · 2026', cx, 1285, { size: 38, weight: 700, tracking: 10, fill: '#FFB21C' });
  };

  P.forza = function (c, w, h) {
    c.fillStyle = '#0E0E0E';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#FFD400';
    c.beginPath();
    c.moveTo(0, 560);
    c.lineTo(w, 380);
    c.lineTo(w, 640);
    c.lineTo(0, 820);
    c.fill();
    // franjas
    c.save();
    c.beginPath();
    c.rect(0, h - 90, w, 90);
    c.clip();
    for (let x = -100; x < w + 100; x += 70) {
      c.fillStyle = '#FFD400';
      c.beginPath();
      c.moveTo(x, h);
      c.lineTo(x + 35, h);
      c.lineTo(x + 125, h - 90);
      c.lineTo(x + 90, h - 90);
      c.fill();
    }
    c.restore();
    // logo
    c.fillStyle = '#FFD400';
    c.fillRect(380, 128, 320, 12);
    c.fillRect(395, 96, 24, 76);
    c.fillRect(661, 96, 24, 76);
    text(c, 'FORZA GYM', w / 2, 240, { size: 44, weight: 800, tracking: 16, fill: '#fff' });
    c.save();
    c.translate(w / 2, 690);
    c.rotate(deg(-9.5));
    text(c, 'ENTRENA', 0, -175, { size: 178, weight: 900, italic: true, fill: '#fff' });
    text(c, 'SIN', 0, 20, { size: 178, weight: 900, italic: true, fill: '#0E0E0E' });
    text(c, 'LÍMITES', 0, 215, { size: 178, weight: 900, italic: true, fill: '#fff' });
    c.restore();
    c.fillStyle = '#FFD400';
    circle(c, 820, 1080, 135);
    c.fill();
    text(c, '-30%', 820, 1100, { size: 82, weight: 900, fill: '#0E0E0E' });
    text(c, 'PRIMER MES', 820, 1145, { size: 24, weight: 800, tracking: 4, fill: '#0E0E0E' });
    text(c, 'INSCRÍBETE HOY', 90, 1130, { size: 40, weight: 800, tracking: 4, fill: '#fff', align: 'left' });
  };

  function flower(c, x, y, r, petal, center, n = 5, rot = 0) {
    c.fillStyle = petal;
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * TAU;
      circle(c, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5);
      c.fill();
    }
    c.fillStyle = center;
    circle(c, x, y, r * 0.36);
    c.fill();
  }

  P.bloom = function (c, w, h) {
    c.fillStyle = '#F9D7DC';
    c.fillRect(0, 0, w, h);
    const R = rng(5);
    for (let y = 40; y < h; y += 130) {
      for (let x = ((y / 130) % 2) * 65 + 20; x < w; x += 130) {
        flower(c, x, y, 24, '#F3B6C1', '#F9D7DC', 5, R() * TAU);
      }
    }
    c.save();
    L.softShadow(c, 60, 24, 0.18, '140,28,69');
    c.fillStyle = '#FFFDFB';
    rrect(c, 200, 300, w - 400, 760, 40);
    c.fill();
    c.restore();
    flower(c, w / 2, 560, 150, '#D6336C', '#FFC94D', 5, -Math.PI / 2);
    text(c, 'bloom', w / 2, 870, { size: 170, weight: 700, family: 'Caveat', fill: '#8C1C45' });
    text(c, 'FLORERÍA · DESDE 2019', w / 2, 950, { size: 26, weight: 700, tracking: 9, fill: '#8C1C45' });
  };

  P.kumo = function (c, w, h) {
    c.fillStyle = '#0F1C2E';
    c.fillRect(0, 0, w, h);
    // seigaiha
    c.save();
    c.beginPath();
    c.rect(0, 760, w, h - 760);
    c.clip();
    for (let row = 0; row < 12; row++) {
      const y = 760 + row * 50;
      for (let x = -100 + (row % 2) * 50; x < w + 100; x += 100) {
        for (let k = 0; k < 4; k++) {
          c.beginPath();
          c.arc(x, y + 50, 50 - k * 12, Math.PI, 0);
          c.fillStyle = k % 2 ? '#0F1C2E' : '#18324F';
          c.fill();
        }
      }
    }
    c.restore();
    c.fillStyle = '#E63946';
    circle(c, w / 2, 430, 210);
    c.fill();
    c.fillStyle = 'rgba(15,28,46,0.9)';
    c.fillRect(0, 700, w, 400);
    text(c, 'KUMO', w / 2 + 16, 890, { size: 210, weight: 900, tracking: 34, fill: '#F5EFE6' });
    text(c, 'SUSHI · BAR', w / 2 + 9, 975, { size: 36, weight: 600, tracking: 18, fill: '#E63946' });
    c.strokeStyle = 'rgba(245,239,230,0.5)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(250, 1030);
    c.lineTo(w - 250, 1030);
    c.stroke();
    text(c, 'OMAKASE · NIGIRI · ROLLS', w / 2 + 4, 1080, { size: 24, weight: 500, tracking: 8, fill: 'rgba(245,239,230,0.75)' });
  };

  P.vela = function (c, w, h) {
    c.fillStyle = '#E9DFD0';
    c.fillRect(0, 0, w, h);
    const ax = 190, aw = w - 380, ay = 330, ah = 1000;
    c.fillStyle = '#C8673E';
    c.beginPath();
    c.moveTo(ax, ay + ah);
    c.lineTo(ax, ay + aw / 2);
    c.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0);
    c.lineTo(ax + aw, ay + ah);
    c.closePath();
    c.fill();
    c.fillStyle = '#F2B880';
    circle(c, w / 2, ay + 420, 150);
    c.fill();
    // jarrón minimal
    c.fillStyle = '#2B2420';
    c.beginPath();
    c.ellipse(w / 2, ay + 860, 140, 160, 0, 0, TAU);
    c.fill();
    c.fillRect(w / 2 - 50, ay + 640, 100, 120);
    c.strokeStyle = '#2B2420';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(w / 2 - 10, ay + 640);
    c.quadraticCurveTo(w / 2 - 80, ay + 520, w / 2 - 150, ay + 470);
    c.moveTo(w / 2 + 10, ay + 640);
    c.quadraticCurveTo(w / 2 + 60, ay + 500, w / 2 + 120, ay + 430);
    c.stroke();
    text(c, 'VELA', w / 2 + 30, 1560, { size: 230, weight: 200, tracking: 60, fill: '#2B2420' });
    text(c, 'NUEVA COLECCIÓN', w / 2 + 8, 1650, { size: 36, weight: 600, tracking: 16, fill: '#2B2420' });
    text(c, 'PRIMAVERA — VERANO', w / 2 + 6, 1710, { size: 28, weight: 400, tracking: 10, fill: 'rgba(43,36,32,0.7)' });
  };

  P.pulso = function (c, w, h) {
    c.fillStyle = linGrad(c, 0, 0, w, h, ['#0B3A8C', '#256FFB', '#2DC3CF']);
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      circle(c, w * 0.78, h * 0.5, 120 + i * 70);
      c.stroke();
    }
    text(c, 'PULSO', 90, 210, { size: 110, weight: 900, fill: '#fff', align: 'left', tracking: 4 });
    text(c, 'Tu salud, en tiempo real.', 92, 290, { size: 44, weight: 500, fill: 'rgba(255,255,255,0.9)', align: 'left' });
    c.fillStyle = '#fff';
    rrect(c, 92, 360, 300, 84, 42);
    c.fill();
    text(c, 'DESCARGAR', 242, 414, { size: 30, weight: 800, tracking: 4, fill: '#0B3A8C' });
    // línea de pulso
    c.strokeStyle = '#fff';
    c.lineWidth = 8;
    c.lineJoin = 'round';
    c.beginPath();
    const y0 = h * 0.5, x0 = w * 0.55;
    const pts = [[0, 0], [80, 0], [110, -60], [150, 110], [190, -170], [230, 60], [260, 0], [420, 0]];
    pts.forEach(([x, y], i) => (i ? c.lineTo(x0 + x, y0 + y) : c.moveTo(x0 + x, y0 + y)));
    c.stroke();
  };

  // Slides de presentación (1600x900), animables con p (0..1)
  function slide(c, w, h, idx, p = 1) {
    c.fillStyle = '#FFFFFF';
    c.fillRect(0, 0, w, h);
    const blue = L.C.blue, teal = L.C.teal;
    if (idx === 0) {
      c.fillStyle = linGrad(c, 0, 0, w, h, [L.C.navy, blue, teal]);
      c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,0.1)';
      circle(c, w * 0.85, h * 0.2, 380);
      c.fill();
      text(c, 'PLAN DE MARCA', 110, 400, { size: 110, weight: 900, fill: '#fff', align: 'left' });
      text(c, '2027', 110, 520, { size: 110, weight: 200, fill: '#fff', align: 'left' });
      c.fillStyle = L.C.amber;
      c.fillRect(114, 590, 160 * p, 10);
      text(c, 'Estrategia · Identidad · Contenido', 112, 680, { size: 40, weight: 500, fill: 'rgba(255,255,255,0.85)', align: 'left' });
    } else if (idx === 1) {
      c.fillStyle = blue;
      c.fillRect(0, 0, 24, h);
      text(c, 'Crecimiento en redes', 110, 170, { size: 66, weight: 800, fill: '#141419', align: 'left' });
      text(c, 'Alcance mensual (miles)', 112, 230, { size: 30, weight: 500, fill: '#8A8A96', align: 'left' });
      const vals = [0.28, 0.4, 0.36, 0.55, 0.68, 0.86];
      const bw = 150, base = 780;
      vals.forEach((v, i) => {
        const e = L.E.outCubic(clamp(p * 1.6 - i * 0.12));
        const bh = 460 * v * e;
        c.fillStyle = i === vals.length - 1 ? L.C.orange : i % 2 ? teal : blue;
        rrect(c, 140 + i * (bw + 60), base - bh, bw, bh, 14);
        c.fill();
      });
      c.fillStyle = '#E4E4EA';
      c.fillRect(110, base + 4, w - 220, 4);
      text(c, '+48%', w - 140, 300, { size: 96, weight: 900, fill: L.C.orange, align: 'right' });
    } else {
      text(c, 'Resultados', 110, 180, { size: 72, weight: 800, fill: '#141419', align: 'left' });
      const k = [['+120%', 'interacción', blue], ['3.4x', 'conversiones', teal], ['98%', 'clientes felices', L.C.pink]];
      k.forEach(([n, l, col], i) => {
        const x = 110 + i * 470;
        const e = L.E.outBack(clamp(p * 1.5 - i * 0.15));
        c.save();
        c.globalAlpha = clamp(e);
        c.fillStyle = '#F3F5FA';
        rrect(c, x, 300, 420, 420, 30);
        c.fill();
        c.fillStyle = col;
        c.fillRect(x, 300, 420, 12);
        text(c, n, x + 210, 520, { size: 120 * (0.7 + 0.3 * e), weight: 900, fill: col });
        text(c, l, x + 210, 600, { size: 34, weight: 600, fill: '#55556A' });
        c.restore();
      });
    }
  }

  // Posts para el feed (cuadrados)
  function feedTile(c, s, i) {
    const pals = [
      ['#FF4F3A', '#FFB000'], ['#FFE14D', '#E2362A'], ['#2DC3CF', '#FFF4E0'],
      ['#3B0D0C', '#FF8A3D'], ['#FF8A3D', '#FFF4E0'], ['#A6E05A', '#1F4D1A'],
      ['#FFF4E0', '#FF4F3A'], ['#E2362A', '#FFE14D'], ['#5890FC', '#FFF4E0'],
    ];
    const [bg, fg] = pals[i % pals.length];
    c.fillStyle = bg;
    c.fillRect(0, 0, s, s);
    const v = i % 6;
    if (v === 0) orangeSlice(c, s * 0.5, s * 0.5, s * 0.36);
    else if (v === 1) text(c, '-20%', s / 2, s * 0.6, { size: s * 0.3, weight: 900, fill: fg });
    else if (v === 2) {
      text(c, 'HOLA', s / 2, s * 0.47, { size: s * 0.2, weight: 900, fill: fg });
      text(c, 'VERANO', s / 2, s * 0.68, { size: s * 0.17, weight: 900, fill: fg });
    } else if (v === 3) {
      c.fillStyle = fg;
      for (let k = 0; k < 3; k++) {
        circle(c, s * (0.3 + k * 0.2), s * (0.35 + (k % 2) * 0.3), s * 0.12);
        c.fill();
      }
    } else if (v === 4) {
      text(c, 'NUEVO', s / 2, s * 0.45, { size: s * 0.18, weight: 900, fill: fg });
      text(c, 'SABOR', s / 2, s * 0.65, { size: s * 0.18, weight: 300, fill: fg });
    } else {
      orangeSlice(c, s * 0.5, s * 0.5, s * 0.3, '#7CC23A', '#B7E36A', '#DDF5A5');
    }
  }

  // ---------------- Registro de piezas ----------------
  const WORKS = {
    nomada: { w: 1080, h: 1350, draw: P.nomada, label: 'Identidad — NÓMADA' },
    fresca: { w: 1080, h: 1350, draw: P.fresca, label: 'Redes — FRESCA' },
    beats: { w: 1080, h: 1350, draw: P.beats, label: 'Publicidad — URBAN BEATS' },
    forza: { w: 1080, h: 1350, draw: P.forza, label: 'Publicidad — FORZA' },
    bloom: { w: 1080, h: 1350, draw: P.bloom, label: 'Identidad — BLOOM' },
    kumo: { w: 1080, h: 1350, draw: P.kumo, label: 'Identidad — KUMO' },
    vela: { w: 1080, h: 1920, draw: P.vela, label: 'Historia — VELA' },
    pulso: { w: 1600, h: 600, draw: P.pulso, label: 'Digital — PULSO' },
    slide0: { w: 1600, h: 900, draw: (c, w, h) => slide(c, w, h, 0), label: 'Presentación' },
    slide1: { w: 1600, h: 900, draw: (c, w, h) => slide(c, w, h, 1), label: 'Presentación' },
    slide2: { w: 1600, h: 900, draw: (c, w, h) => slide(c, w, h, 2), label: 'Presentación' },
  };
  const IMG = {}; // canvases/imágenes listas
  const BLUR = {}; // versiones desenfocadas para fondos
  let FEED = null;

  async function buildWorks(overrides = {}) {
    const load = (src) =>
      new Promise((res) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => res(null);
        im.src = src;
      });
    for (const [k, def] of Object.entries(WORKS)) {
      let img = null;
      if (overrides[k]) img = await load(overrides[k]);
      if (!img) {
        img = makeCanvas(def.w, def.h);
        def.draw(img.getContext('2d'), def.w, def.h);
      }
      IMG[k] = img;
      const b = makeCanvas(img.width / 8, img.height / 8);
      const bc = b.getContext('2d');
      bc.filter = 'blur(6px) saturate(1.3)';
      bc.drawImage(img, -10, -10, b.width + 20, b.height + 20);
      BLUR[k] = b;
    }
    FEED = [];
    for (let i = 0; i < 18; i++) {
      const s = 360, cv = makeCanvas(s, s);
      feedTile(cv.getContext('2d'), s, i);
      FEED.push(cv);
    }
  }

  // ---------------- Mockups ----------------
  // Teléfono: draw(ctx, sw, sh) pinta la pantalla en coords locales
  function phone(ctx, cx, cy, w, rot, drawScreen, o = {}) {
    const h = w * 2.05, r = w * 0.15;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    if (o.scale) ctx.scale(o.scale, o.scale);
    if (o.shadow !== false) L.softShadow(ctx, 70, 40, o.shadowA || 0.45);
    ctx.fillStyle = '#0D0D10';
    rrect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fill();
    L.noShadow(ctx);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    rrect(ctx, -w / 2 + 1, -h / 2 + 1, w - 2, h - 2, r);
    ctx.stroke();
    const b = w * 0.035;
    const sw = w - b * 2, sh = h - b * 2;
    ctx.save();
    rrect(ctx, -sw / 2, -sh / 2, sw, sh, r * 0.82);
    ctx.clip();
    ctx.translate(-sw / 2, -sh / 2);
    drawScreen(ctx, sw, sh);
    ctx.restore();
    ctx.fillStyle = '#0D0D10';
    rrect(ctx, -w * 0.16, -sh / 2 + w * 0.035, w * 0.32, w * 0.085, w * 0.05);
    ctx.fill();
    // brillo
    ctx.save();
    rrect(ctx, -sw / 2, -sh / 2, sw, sh, r * 0.82);
    ctx.clip();
    ctx.fillStyle = linGrad(ctx, -w / 2, -h / 2, w / 2, h / 4, ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']);
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w * 0.2, -h / 2);
    ctx.lineTo(-w / 2, h * 0.1);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  function laptop(ctx, cx, cy, w, drawScreen, o = {}) {
    const b0 = w * 0.025, sh = (w - b0 * 2) * 0.5625 + b0 * 2.6, r = w * 0.03;
    ctx.save();
    ctx.translate(cx, cy);
    if (o.rot) ctx.rotate(o.rot);
    L.softShadow(ctx, 80, 40, 0.45);
    ctx.fillStyle = '#16161B';
    rrect(ctx, -w / 2, -sh, w, sh, r);
    ctx.fill();
    L.noShadow(ctx);
    const b = w * 0.025;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w / 2 + b, -sh + b, w - b * 2, sh - b * 2.6);
    ctx.clip();
    ctx.translate(-w / 2 + b, -sh + b);
    drawScreen(ctx, w - b * 2, sh - b * 2.6);
    ctx.restore();
    // base
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, w * 0.04, ['#D9DAE0', '#9EA0AA']);
    ctx.beginPath();
    ctx.moveTo(-w * 0.56, 0);
    ctx.lineTo(w * 0.56, 0);
    ctx.lineTo(w * 0.53, w * 0.035);
    ctx.lineTo(-w * 0.53, w * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#80828C';
    rrect(ctx, -w * 0.08, 0, w * 0.16, w * 0.012, w * 0.006);
    ctx.fill();
    ctx.restore();
  }

  // Imagen como "tarjeta" con sombra (póster, post, flyer)
  function card(ctx, img, cx, cy, w, rot = 0, o = {}) {
    if (!img) return;
    const h = o.h || (w * img.height) / img.width;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    if (o.scale != null) ctx.scale(o.scale, o.scale);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.shadow !== false) L.softShadow(ctx, o.blur || 50, o.sy || 26, o.shadowA || 0.4);
    const r = o.r == null ? 18 : o.r;
    rrect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fillStyle = '#000';
    ctx.fill();
    L.noShadow(ctx);
    ctx.save();
    rrect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.clip();
    if (o.h) L.drawCover(ctx, img, -w / 2, -h / 2, w, h, o.zoom || 1);
    else ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.restore();
  }

  // Tarjeta de presentación de CREAX (frente / dorso)
  function bizCard(ctx, cx, cy, w, rot, side, A) {
    const h = w * 0.58, r = w * 0.03;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    L.softShadow(ctx, 40, 22, 0.35);
    ctx.fillStyle = side === 'front' ? '#FBFAF7' : '#101014';
    rrect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fill();
    L.noShadow(ctx);
    if (side === 'front') {
      const s = h * 0.5;
      ctx.drawImage(A.iso, -w * 0.33 - s / 2, -s / 2 - h * 0.02, s, s);
      const ww = w * 0.46, wh = (ww * A.wordWhite.height) / A.wordWhite.width;
      ctx.drawImage(A.wordDark, -w * 0.07, -wh * 0.75, ww, wh);
      const tw = ww * 0.62, th = (tw * A.tagDark.height) / A.tagDark.width;
      ctx.drawImage(A.tagDark, -w * 0.07, wh * 0.45, tw, th);
    } else {
      ctx.save();
      rrect(ctx, -w / 2, -h / 2, w, h, r);
      ctx.clip();
      const s = h * 1.5;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(A.iso, w * 0.12 - s / 2, -s / 2, s, s);
      ctx.restore();
    }
    ctx.restore();
  }

  G.WORKS = { WORKS, IMG, BLUR, buildWorks, get FEED() { return FEED; }, phone, laptop, card, bizCard, slide, feedTile, orangeSlice, starburst, flower };
})(window);
