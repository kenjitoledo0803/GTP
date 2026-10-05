/* CREAX.INK promo — motor de animación (utilidades)
 * Todo es determinista: el mismo frame siempre produce la misma imagen.
 */
(function (G) {
  'use strict';

  const W = 1080, H = 1920, FPS = 30, DURATION = 40;
  const BPM = 120, BEAT = 60 / BPM;

  // ---------- Paleta de marca (muestreada del logo) ----------
  const C = {
    ink: '#0B0B0F',
    ink2: '#141419',
    paper: '#F7F5F0',
    black: '#111111',
    plum: '#A92987',
    pink: '#DA387B',
    red: '#FB254E',
    orange: '#FF7510',
    orange2: '#F16326',
    amber: '#FFAD06',
    sky: '#5890FC',
    blue: '#256FFB',
    navy: '#0554C8',
    teal: '#2DC3CF',
    mint: '#60DDC5',
    tealDark: '#159FA3',
    knot: '#1C2421',
  };
  const WARM = [C.plum, C.pink, C.red, C.orange, C.amber];
  const COOL = [C.blue, C.teal, C.mint];
  const SPECTRUM = [C.plum, C.pink, C.red, C.orange, C.amber, C.blue, C.teal, C.mint];

  // ---------- Matemáticas ----------
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
  const mix = (a, b, t) => Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], t)) : lerp(a, b, t);
  const TAU = Math.PI * 2;
  const deg = (d) => (d * Math.PI) / 180;

  // Easing (curvas al estilo del Graph Editor de AE)
  const E = {
    linear: (x) => x,
    inQuad: (x) => x * x,
    outQuad: (x) => 1 - (1 - x) * (1 - x),
    inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    inQuart: (x) => x * x * x * x,
    outQuart: (x) => 1 - Math.pow(1 - x, 4),
    inOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
    inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
    outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutExpo: (x) =>
      x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
    outBack: (x) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    outBackSoft: (x) => {
      const c1 = 1.1, c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    inBack: (x) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return c3 * x * x * x - c1 * x * x;
    },
    outElastic: (x) => {
      const c4 = TAU / 3;
      return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    // "Speed graph" típico de motion design: arranque rápido, llegada muy suave
    snap: (x) => 1 - Math.pow(1 - x, 5),
  };

  // Interpolación por keyframes: keys = [[t, valor, ease?], ...]
  // ease del keyframe i se aplica al tramo (i-1 -> i)
  function kf(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k1 = keys[i];
      if (t <= k1[0]) {
        const k0 = keys[i - 1];
        const e = k1[2] || E.inOutCubic;
        return mix(k0[1], k1[1], e((t - k0[0]) / (k1[0] - k0[0])));
      }
    }
    return keys[keys.length - 1][1];
  }

  // ---------- RNG determinista ----------
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Ruido 1D suave (para wiggle)
  function noise1(x, seed = 0) {
    const i = Math.floor(x), f = x - i;
    const h = (n) => {
      const s = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };
    const u = f * f * (3 - 2 * f);
    return lerp(h(i), h(i + 1), u) * 2 - 1;
  }
  // wiggle(freq, amp) como la expresión de AE
  const wiggle = (t, freq, amp, seed = 0) => noise1(t * freq, seed) * amp;

  // ---------- Color ----------
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a = 1) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  function mixHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    const r = A.map((v, i) => Math.round(lerp(v, B[i], t)));
    return '#' + r.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // ---------- Canvas helpers ----------
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function linGrad(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s, i) => {
      if (Array.isArray(s)) g.addColorStop(s[0], s[1]);
      else g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), s);
    });
    return g;
  }

  // Gradiente de marca que "fluye" (shift 0..1)
  // El gradiente cubre 2x el ancho en ida y vuelta (c0..cn..c0): shift=0
  // muestra c0..cn y shift=1 muestra cn..c0, con desplazamiento continuo.
  function brandGrad(ctx, x0, y0, x1, y1, shift = 0, colors = WARM) {
    const dx = x1 - x0, dy = y1 - y0;
    const s = clamp(shift);
    const g = ctx.createLinearGradient(x0 - dx * s, y0 - dy * s, x0 + dx * (2 - s), y0 + dy * (2 - s));
    const seq = colors.concat(colors.slice(0, -1).reverse());
    seq.forEach((c, i) => g.addColorStop(i / (seq.length - 1), c));
    return g;
  }

  // Dibuja una imagen con transformaciones (centro, escala, rotación)
  function drawImg(ctx, img, cx, cy, w, h, o = {}) {
    if (!img) return;
    ctx.save();
    ctx.translate(cx, cy);
    if (o.rot) ctx.rotate(o.rot);
    const s = o.scale == null ? 1 : o.scale;
    ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Imagen tipo "cover" dentro de un rectángulo
  function drawCover(ctx, img, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5) {
    const iw = img.width, ih = img.height;
    const s = Math.max(w / iw, h / ih) * zoom;
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
  }

  // ---------- Tipografía ----------
  const FONT = 'Montserrat';
  function setFont(ctx, size, weight = 800, family = FONT, italic = false) {
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${family}"`;
  }
  function measure(ctx, str, size, weight = 800, tracking = 0, family = FONT) {
    setFont(ctx, size, weight, family);
    ctx.letterSpacing = '0px';
    const w = ctx.measureText(str).width;
    return w + tracking * Math.max(0, [...str].length - 1);
  }
  // Tamaño máximo para que el texto quepa en maxW
  function fitSize(ctx, str, weight, maxW, maxSize, tracking = 0, family = FONT) {
    const w = measure(ctx, str, 100, weight, (tracking * 100) / maxSize, family);
    return Math.min(maxSize, (100 * maxW) / w);
  }

  // Texto simple con tracking (px)
  function text(ctx, str, x, y, o = {}) {
    const size = o.size || 80, weight = o.weight || 800, family = o.family || FONT;
    const tracking = o.tracking || 0;
    setFont(ctx, size, weight, family, o.italic);
    ctx.textBaseline = o.baseline || 'alphabetic';
    const w = measure(ctx, str, size, weight, tracking, family);
    setFont(ctx, size, weight, family, o.italic);
    let sx = x;
    if (o.align === 'center' || o.align == null) sx = x - w / 2;
    else if (o.align === 'right') sx = x - w;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = typeof o.fill === 'function' ? o.fill(ctx, sx, sx + w, y, size) : o.fill || '#fff';
    ctx.textAlign = 'left';
    ctx.letterSpacing = tracking + 'px';
    if (o.stroke) {
      ctx.lineWidth = o.stroke;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineJoin = 'round';
      ctx.strokeText(str, sx, y);
    } else ctx.fillText(str, sx, y);
    ctx.letterSpacing = '0px';
    ctx.restore();
    return w;
  }

  /* Revelado palabra por palabra con máscara (slide up), como un
   * Text Animator de AE con "Range Selector" por palabras.
   * mode: 'up' | 'down' | 'fade' | 'scale' | 'blur'
   * out: { t0, dur, mode } animación de salida opcional
   */
  function revealLine(ctx, str, cx, y, t, t0, o = {}) {
    const size = o.size || 90, weight = o.weight || 800, family = o.family || FONT;
    const tracking = o.tracking || 0;
    const stagger = o.stagger == null ? 0.06 : o.stagger;
    const dur = o.dur || 0.55;
    const ease = o.ease || E.outExpo;
    const mode = o.mode || 'up';
    const words = o.byChar ? [...str] : str.split(' ');
    const space = o.byChar ? 0 : measure(ctx, ' ', size, weight, 0, family) + tracking;
    const widths = words.map((w) => measure(ctx, w, size, weight, tracking, family));
    const gap = o.byChar ? tracking : space;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let x = o.align === 'left' ? cx : o.align === 'right' ? cx - total : cx - total / 2;
    const x0 = x;
    const fill = o.fill || '#fff';
    const out = o.out;
    const n = words.length;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (mode === 'up' || mode === 'down') {
      ctx.beginPath();
      ctx.rect(x0 - 40, y - size * 1.05, total + 80, size * 1.38);
      ctx.clip();
    }
    for (let i = 0; i < n; i++) {
      const order = o.reverse ? n - 1 - i : i;
      const p = ease(prog(t, t0 + order * stagger, t0 + order * stagger + dur));
      let q = 0;
      if (out) {
        const oo = out.reverse ? n - 1 - i : i;
        q = (out.ease || E.inExpo)(prog(t, out.t0 + oo * (out.stagger || 0.03), out.t0 + oo * (out.stagger || 0.03) + (out.dur || 0.35)));
      }
      if (p <= 0 || q >= 1) {
        x += widths[i] + gap;
        continue;
      }
      ctx.save();
      let dy = 0, a = 1, sc = 1;
      if (mode === 'up') dy = (1 - p) * size * 1.25;
      else if (mode === 'down') dy = -(1 - p) * size * 1.25;
      else if (mode === 'fade') { a = p; dy = (1 - p) * size * 0.35; }
      else if (mode === 'scale') { a = clamp(p * 2); sc = lerp(1.8, 1, p); }
      if (out) {
        const om = out.mode || 'up';
        if (om === 'up') dy -= q * size * 1.25;
        else if (om === 'fade') a *= 1 - q;
        else if (om === 'left') { ctx.translate(-q * 1300, 0); }
        else if (om === 'right') { ctx.translate(q * 1300, 0); }
      }
      ctx.globalAlpha *= a;
      const wx = x + widths[i] / 2;
      ctx.translate(wx, y + dy);
      ctx.scale(sc, sc);
      ctx.translate(-wx, -y);
      setFont(ctx, size, weight, family, o.italic);
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.letterSpacing = tracking + 'px';
      let fs = Array.isArray(fill) ? fill[i % fill.length] : fill;
      if (typeof fs === 'function') fs = fs(ctx, x0, x0 + total, y, size, i);
      ctx.fillStyle = fs;
      ctx.fillText(words[i], x, y);
      ctx.letterSpacing = '0px';
      ctx.restore();
      x += widths[i] + gap;
    }
    ctx.restore();
    return { x0, w: total };
  }

  // ---------- Formas ----------
  // Mancha de tinta: radio con ruido polar
  function inkBlobPath(ctx, cx, cy, r, seed, rough = 0.18, lobes = 7, phase = 0) {
    const R = rng(seed);
    const k = [];
    for (let i = 0; i < 5; i++) k.push({ f: Math.floor(2 + R() * lobes), a: (R() * rough) / (i + 1), p: R() * TAU });
    ctx.beginPath();
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU;
      let m = 1;
      for (const q of k) m += q.a * Math.sin(a * q.f + q.p + phase);
      const x = cx + Math.cos(a) * r * m, y = cy + Math.sin(a) * r * m;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, r), 0, TAU);
  }

  // ---------- Post-proceso ----------
  let grains = null;
  function initGrain() {
    grains = [];
    const R = rng(77);
    for (let k = 0; k < 6; k++) {
      const c = makeCanvas(540, 960);
      const x = c.getContext('2d');
      const id = x.createImageData(540, 960);
      for (let i = 0; i < id.data.length; i += 4) {
        const v = Math.floor(R() * 255);
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
        id.data[i + 3] = 255;
      }
      x.putImageData(id, 0, 0);
      grains.push(c);
    }
  }
  function grain(ctx, frame, amount = 0.05) {
    if (!grains) initGrain();
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = amount;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(grains[frame % grains.length], 0, 0, W, H);
    ctx.restore();
  }
  function vignette(ctx, amount = 0.45, color = '0,0,0') {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, `rgba(${color},0)`);
    g.addColorStop(1, `rgba(${color},${amount})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  function glow(ctx, x, y, r, color, a = 0.5) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, a));
    g.addColorStop(0.45, rgba(color, a * 0.35));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Sombra suave para mockups
  function softShadow(ctx, blur = 40, y = 20, a = 0.35, color = '0,0,0') {
    ctx.shadowColor = `rgba(${color},${a})`;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = y;
  }
  function noShadow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  G.L = {
    W, H, FPS, DURATION, BPM, BEAT, C, WARM, COOL, SPECTRUM, TAU,
    clamp, lerp, prog, mix, deg, E, kf, rng, noise1, wiggle,
    hexToRgb, rgba, mixHex, makeCanvas, rrect, linGrad, brandGrad, drawImg, drawCover,
    FONT, setFont, measure, fitSize, text, revealLine, inkBlobPath, circle,
    grain, vignette, glow, softShadow, noShadow,
  };
})(window);
