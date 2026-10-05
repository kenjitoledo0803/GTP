/* CREAX.INK promo — carga y pre-proceso de assets de marca */
(function (G) {
  'use strict';
  const L = G.L;
  const A = {};

  function load(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('No se pudo cargar ' + src));
      im.src = src;
    });
  }

  // Corta una imagen en glifos buscando columnas vacías (alpha = 0)
  function sliceGlyphs(img, minGap = 3) {
    const c = L.makeCanvas(img.width, img.height);
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, img.width, img.height).data;
    const col = new Array(img.width).fill(0);
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) if (d[(j * img.width + i) * 4 + 3] > 20) { col[i] = 1; break; }
    }
    const runs = [];
    let s = -1, gap = 0;
    for (let i = 0; i < img.width; i++) {
      if (col[i]) {
        if (s < 0) s = i;
        gap = 0;
      } else if (s >= 0) {
        gap++;
        if (gap >= minGap) { runs.push([s, i - gap + 1]); s = -1; gap = 0; }
      }
    }
    if (s >= 0) runs.push([s, img.width]);
    return runs;
  }

  // Bordes del isotipo (para el "boceto" y el "vector")
  function edgeMaps(img) {
    const w = img.width, h = img.height;
    const c = L.makeCanvas(w, h);
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.fillRect(0, 0, w, h);
    x.drawImage(img, 0, 0);
    const src = x.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      lum[i * 3] = src[i * 4];
      lum[i * 3 + 1] = src[i * 4 + 1];
      lum[i * 3 + 2] = src[i * 4 + 2];
    }
    const mag = new Float32Array(w * h);
    for (let j = 1; j < h - 1; j++) {
      for (let i = 1; i < w - 1; i++) {
        let m = 0;
        for (let ch = 0; ch < 3; ch++) {
          const p = (a, b) => lum[((j + b) * w + (i + a)) * 3 + ch];
          const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
          const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
          m = Math.max(m, Math.hypot(gx, gy));
        }
        mag[j * w + i] = m;
      }
    }
    const make = (rgb, thr, soft) => {
      const o = L.makeCanvas(w, h);
      const ox = o.getContext('2d');
      const id = ox.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const a = L.clamp((mag[i] - thr) / soft);
        id.data[i * 4] = rgb[0];
        id.data[i * 4 + 1] = rgb[1];
        id.data[i * 4 + 2] = rgb[2];
        id.data[i * 4 + 3] = Math.round(a * 255);
      }
      ox.putImageData(id, 0, 0);
      return o;
    };
    return {
      graphite: make([52, 50, 58], 90, 260),
      blue: make([37, 111, 251], 110, 200),
    };
  }

  // Silueta del isotipo en un color sólido
  function silhouette(img, color) {
    const c = L.makeCanvas(img.width, img.height);
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // Boceto a lápiz: bordes con trazos duplicados ligeramente desplazados
  function sketch(edge) {
    const w = edge.width, h = edge.height;
    const c = L.makeCanvas(w, h);
    const x = c.getContext('2d');
    const R = L.rng(9);
    for (let k = 0; k < 4; k++) {
      x.save();
      x.globalAlpha = k === 0 ? 0.95 : 0.32;
      x.translate(w / 2 + (R() - 0.5) * 6, h / 2 + (R() - 0.5) * 6);
      x.rotate((R() - 0.5) * 0.012);
      x.scale(1 + (R() - 0.5) * 0.01, 1 + (R() - 0.5) * 0.01);
      x.drawImage(edge, -w / 2, -h / 2);
      x.restore();
    }
    // sombreado suave dentro de las cintas
    return c;
  }

  A.init = async function (base = '../assets/') {
    const [iso, wordDark, wordWhite, tagDark, tagWhite, full] = await Promise.all([
      load(base + 'brand/isotipo.png'),
      load(base + 'brand/wordmark-dark.png'),
      load(base + 'brand/wordmark-white.png'),
      load(base + 'brand/tagline-dark.png'),
      load(base + 'brand/tagline-white.png'),
      load(base + 'brand/creax-logo-original.png'),
    ]);
    Object.assign(A, { iso, wordDark, wordWhite, tagDark, tagWhite, full });
    A.wordGlyphs = sliceGlyphs(wordWhite, 4);
    A.tagGlyphs = sliceGlyphs(tagWhite, 4);
    const e = edgeMaps(iso);
    A.edgeGraphite = e.graphite;
    A.edgeBlue = e.blue;
    A.sketch = sketch(e.graphite);
    A.isoWhite = silhouette(iso, '#ffffff');
    A.isoBlack = silhouette(iso, '#0B0B0F');
    return A;
  };

  G.A = A;
})(window);
