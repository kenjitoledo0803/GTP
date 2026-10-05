#!/usr/bin/env node
/* CREAX.INK promo — música y diseño sonoro originales (síntesis en Node, sin samples).
 *
 *   node tools/music.cjs   ->  output/creax-ink-music.wav  (44.1 kHz, estéreo, 16 bit, 40 s)
 *
 * 120 BPM (1 beat = 0.5 s), La menor -> resuelve en Do mayor en el cierre.
 * Todos los golpes y efectos están sincronizados con la línea de tiempo de src/scenes.js.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SR = 44100, DUR = 40, N = SR * DUR;
const TAU = Math.PI * 2;

// ---------- utilidades ----------
let seed = 20261005;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const St = () => [new Float32Array(N), new Float32Array(N)];

class Biquad {
  constructor(type, f, q = 0.707) { this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(f, q); }
  set(f, q = this.q) {
    this.q = q;
    const w = (TAU * Math.min(Math.max(f, 10), SR * 0.45)) / SR, cs = Math.cos(w), sn = Math.sin(w), a = sn / (2 * q);
    let b0, b1, b2;
    const a0 = 1 + a, a1 = -2 * cs, a2 = 1 - a;
    if (this.type === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; }
    else if (this.type === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// ---------- buses ----------
const B = { drums: St(), bass: St(), music: St(), sfx: St(), verb: St(), dly: St() };
const KICKS = [];

function addMono(bus, t, buf, gain = 1, pan = 0, verb = 0, dly = 0) {
  const i0 = Math.round(t * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let i = 0; i < buf.length; i++) {
    const j = i0 + i;
    if (j < 0) continue;
    if (j >= N) break;
    const l = buf[i] * gl, r = buf[i] * gr;
    bus[0][j] += l; bus[1][j] += r;
    if (verb) { B.verb[0][j] += l * verb; B.verb[1][j] += r * verb; }
    if (dly) { B.dly[0][j] += l * dly; B.dly[1][j] += r * dly; }
  }
}
function addSt(bus, t, [L, R], gain = 1, verb = 0, dly = 0) {
  const i0 = Math.round(t * SR);
  for (let i = 0; i < L.length; i++) {
    const j = i0 + i;
    if (j < 0) continue;
    if (j >= N) break;
    bus[0][j] += L[i] * gain; bus[1][j] += R[i] * gain;
    if (verb) { B.verb[0][j] += L[i] * gain * verb; B.verb[1][j] += R[i] * gain * verb; }
    if (dly) { B.dly[0][j] += L[i] * gain * dly; B.dly[1][j] += R[i] * gain * dly; }
  }
}
const buf = (sec) => new Float32Array(Math.round(sec * SR));

// ---------- instrumentos ----------
function kick() {
  const o = buf(0.5);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * (44 + 120 * Math.exp(-t * 30))) / SR;
    let v = Math.sin(ph) * Math.exp(-t * 6.5);
    if (t < 0.004) v += noise() * 0.5 * (1 - t / 0.004);
    o[i] = Math.tanh(v * 1.7) * 0.92;
  }
  return o;
}
function clap() {
  const o = buf(0.35), bp = new Biquad('bp', 1350, 0.9), hp = new Biquad('hp', 700);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    let env = 0;
    for (let k = 0; k < 3; k++) { const d = t - k * 0.011; if (d >= 0 && d < 0.012) env += Math.exp(-d * 200); }
    if (t >= 0.022) env += 0.85 * Math.exp(-(t - 0.022) * 16);
    o[i] = bp.run(hp.run(noise())) * env * 3.2;
  }
  return o;
}
function hat(open = false) {
  const o = buf(open ? 0.45 : 0.09), hp = new Biquad('hp', 7200, 0.8), bp = new Biquad('bp', 10500, 0.7);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const n = noise();
    o[i] = (hp.run(n) * 0.7 + bp.run(n) * 0.6) * Math.exp(-t * (open ? 8 : 60));
  }
  return o;
}
function snare() {
  const o = buf(0.32), bp = new Biquad('bp', 2600, 0.6);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * (185 + 60 * Math.exp(-t * 40))) / SR;
    o[i] = Math.sin(ph) * Math.exp(-t * 26) * 0.55 + bp.run(noise()) * Math.exp(-t * 15) * 1.6;
  }
  return o;
}
function tom(f) {
  const o = buf(0.4);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * f * (0.6 + 0.4 * Math.exp(-t * 18))) / SR;
    o[i] = Math.sin(ph) * Math.exp(-t * 9);
  }
  return o;
}
function crash(len = 2.2) {
  const L = buf(len), R = buf(len);
  const f = [new Biquad('hp', 4200), new Biquad('hp', 4300)], g = [new Biquad('bp', 8800, 0.8), new Biquad('bp', 9400, 0.8)];
  const metal = [3130, 4270, 5390, 6710, 8150];
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.002) * Math.exp(-t * 2.1);
    let m = 0;
    for (const fr of metal) m += Math.sign(Math.sin(TAU * fr * t)) * 0.05;
    for (let c = 0; c < 2; c++) {
      const n = noise();
      const v = (f[c].run(n + m) * 0.7 + g[c].run(n) * 0.5) * env;
      (c ? R : L)[i] = v;
    }
  }
  return [L, R];
}
function impact(size = 1, len = 2.4) {
  const L = buf(len), R = buf(len), lp = new Biquad('lp', 380), lp2 = new Biquad('lp', 420);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    ph += (TAU * (30 + 52 * Math.exp(-t * 3.2))) / SR;
    const sub = Math.sin(ph) * Math.exp(-t * 2.1) * Math.min(1, t / 0.003);
    const body = Math.exp(-t * 7);
    const v = Math.tanh(sub * 1.4) * size;
    L[i] = v + lp.run(noise()) * body * 0.9 * size;
    R[i] = v + lp2.run(noise()) * body * 0.9 * size;
  }
  return [L, R];
}
function whoosh(dur, gain = 1, panFrom = -0.7, panTo = 0.7, fLo = 250, fHi = 5000) {
  const n = Math.round(dur * SR), L = new Float32Array(n), R = new Float32Array(n);
  const bp = new Biquad('bp', 500, 1.1), bp2 = new Biquad('bp', 700, 1.1);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const hump = Math.sin(Math.PI * x);
    if (i % 32 === 0) { const f = fLo * Math.pow(fHi / fLo, Math.pow(hump, 1.5)); bp.set(f, 1.1); bp2.set(f * 1.3, 1.1); }
    const amp = Math.pow(hump, 2.2) * gain * 2.2;
    const p = panFrom + (panTo - panFrom) * x;
    const nn = noise();
    const v = (bp.run(nn) + bp2.run(nn) * 0.6) * amp;
    L[i] = v * Math.cos(((p + 1) * Math.PI) / 4) * 1.4;
    R[i] = v * Math.sin(((p + 1) * Math.PI) / 4) * 1.4;
  }
  return [L, R];
}
function riser(dur, gain = 1) {
  const n = Math.round(dur * SR), L = new Float32Array(n), R = new Float32Array(n);
  const hp = [new Biquad('hp', 300), new Biquad('hp', 300)];
  let ph = 0, ph2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n, t = i / SR;
    if (i % 32 === 0) { const f = 250 * Math.pow(28, x * x); hp[0].set(f); hp[1].set(f * 1.1); }
    const amp = Math.pow(x, 2.2) * gain;
    const trem = 0.75 + 0.25 * Math.sin(TAU * t * (4 + 14 * x * x));
    const f0 = 180 * Math.pow(8, x * x);
    ph += (TAU * f0) / SR;
    ph2 += (TAU * f0 * 1.007) / SR;
    const tone = (Math.sin(ph) + Math.sin(ph2)) * 0.18;
    L[i] = (hp[0].run(noise()) * 0.8 + tone) * amp * trem;
    R[i] = (hp[1].run(noise()) * 0.8 + tone) * amp * trem;
  }
  return [L, R];
}
function revCymbal(dur) {
  const [cl, cr] = crash(dur + 0.05);
  const n = Math.round(dur * SR), L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const k = n - 1 - i;
    const env = Math.pow(i / n, 1.5);
    L[i] = cl[k] * env * 1.4;
    R[i] = cr[k] * env * 1.4;
  }
  return [L, R];
}
function shutter() {
  const o = buf(0.12), hp = new Biquad('hp', 2500);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    let v = 0;
    if (t < 0.006) v += hp.run(noise()) * (1 - t / 0.006);
    else if (t > 0.03 && t < 0.036) v += hp.run(noise()) * 0.6;
    else hp.run(0);
    v += Math.sin(TAU * 3300 * t) * Math.exp(-t * 90) * 0.35;
    o[i] = v;
  }
  return o;
}
function pop(f0 = 520, f1 = 1350) {
  const o = buf(0.14);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * (f0 + (f1 - f0) * Math.min(1, t / 0.045))) / SR;
    o[i] = Math.sin(ph) * Math.exp(-t * 32) * Math.min(1, t / 0.002);
  }
  return o;
}
function mouseClick() {
  const o = buf(0.03), hp = new Biquad('hp', 3200);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    o[i] = hp.run(noise()) * Math.exp(-t * 900) + Math.sin(TAU * 4100 * t) * Math.exp(-t * 400) * 0.3;
  }
  return o;
}
function tick() {
  const o = buf(0.09);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    o[i] = Math.sin(TAU * 2100 * t) * Math.exp(-t * 95) + Math.sin(TAU * 1050 * t) * Math.exp(-t * 70) * 0.5;
  }
  return o;
}
function thud() {
  const o = buf(0.3), lp = new Biquad('lp', 900);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * (55 + 70 * Math.exp(-t * 25))) / SR;
    o[i] = Math.sin(ph) * Math.exp(-t * 14) + lp.run(noise()) * Math.exp(-t * 40) * 0.6;
  }
  return o;
}
function pencil(dur) {
  const o = buf(dur), bp = new Biquad('bp', 3600, 1.4), bp2 = new Biquad('bp', 6200, 2);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * (6 + 3 * Math.sin(TAU * 0.9 * t))) / SR;
    const stroke = Math.pow(0.5 + 0.5 * Math.sin(ph), 0.6);
    const grain = 0.6 + 0.4 * noise();
    const env = Math.min(1, t / 0.05) * Math.min(1, (dur - t) / 0.1);
    const n = noise();
    o[i] = (bp.run(n) + bp2.run(n) * 0.5) * stroke * grain * env * 1.2;
  }
  return o;
}
function marker(dur) {
  const o = buf(dur), bp = new Biquad('bp', 2500, 3), bp2 = new Biquad('bp', 5300, 4);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const am = 0.55 + 0.45 * Math.sin(TAU * (22 + 6 * Math.sin(TAU * 3 * t)) * t);
    const env = Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.04);
    const n = noise();
    const sq = Math.sin(TAU * (1900 + 300 * Math.sin(TAU * 5 * t)) * t) * 0.08;
    o[i] = ((bp.run(n) + bp2.run(n) * 0.6) * 1.6 + sq) * am * env;
  }
  return o;
}
function bass(m, dur, bright = 1) {
  const o = buf(dur + 0.03), lp = new Biquad('lp', 400, 1.1), f = mtof(m);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    if (i % 16 === 0) lp.set((260 + 1500 * bright * Math.exp(-t * 14)), 1.1);
    ph = (ph + f / SR) % 1;
    const saw = 2 * ph - 1;
    const sub = Math.sin(TAU * ph);
    const env = Math.min(1, t / 0.004) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.03) : 1);
    o[i] = (lp.run(saw) * 0.7 + sub * 0.65) * env;
  }
  return o;
}
function pad(notes, dur, cutoff = 1800, attack = 0.35, release = 0.7) {
  const n = Math.round((dur + release) * SR), L = new Float32Array(n), R = new Float32Array(n);
  const voices = [];
  notes.forEach((m) => [-9, -3, 4, 10].forEach((ct, k) => voices.push({ f: mtof(m) * Math.pow(2, ct / 1200), ph: rnd(), side: k % 2 })));
  const lpl = new Biquad('lp', cutoff, 0.8), lpr = new Biquad('lp', cutoff, 0.8);
  const g = 0.16 / Math.sqrt(notes.length);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let l = 0, r = 0;
    for (const v of voices) {
      v.ph = (v.ph + v.f / SR) % 1;
      const s = 2 * v.ph - 1;
      if (v.side) r += s; else l += s;
    }
    const env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
    L[i] = lpl.run(l) * g * env;
    R[i] = lpr.run(r) * g * env;
  }
  return [L, R];
}
function detunedPad(notes, dur) {
  const n = Math.round((dur + 0.5) * SR), L = new Float32Array(n), R = new Float32Array(n);
  const lp = [new Biquad('lp', 900), new Biquad('lp', 900)];
  const vs = notes.map((m, k) => ({ f: mtof(m), ph: 0, k }));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let l = 0, r = 0;
    for (const v of vs) {
      const wob = Math.pow(2, (28 * Math.sin(TAU * (0.6 + v.k * 0.23) * t)) / 1200);
      v.ph = (v.ph + (v.f * wob) / SR) % 1;
      const s = Math.sin(TAU * v.ph) * 0.6 + (2 * v.ph - 1) * 0.25;
      if (v.k % 2) r += s; else l += s;
      if (v.k === 0) { r += s * 0.5; }
    }
    const env = Math.min(1, t / 0.6) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.5) : 1);
    L[i] = lp[0].run(l) * 0.12 * env;
    R[i] = lp[1].run(r) * 0.12 * env;
  }
  return [L, R];
}
function pluck(m, bright = 1, len = 0.55) {
  const o = buf(len), lp = new Biquad('lp', 3000, 1.3), f = mtof(m);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    if (i % 16 === 0) lp.set(380 + 5200 * bright * Math.exp(-t * 20), 1.3);
    ph = (ph + f / SR) % 1;
    const s = (2 * ph - 1) * 0.6 + (ph < 0.3 ? 0.5 : -0.5) * 0.5;
    o[i] = lp.run(s) * Math.exp(-t * 7.5) * Math.min(1, t / 0.002);
  }
  return o;
}
function stab(notes, len = 0.35) {
  const o = buf(len);
  notes.forEach((m) => {
    const p = pluck(m, 1.3, len);
    for (let i = 0; i < o.length; i++) o[i] += p[i] / notes.length * 1.6;
  });
  return o;
}
function bell(m, len = 2.6) {
  const o = buf(len), f = mtof(m);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const idx = 2.4 * Math.exp(-t * 3.5);
    o[i] = Math.sin(TAU * f * t + idx * Math.sin(TAU * f * 3.5 * t)) * Math.exp(-t * 2.0) * Math.min(1, t / 0.002) * 0.5;
  }
  return o;
}

// ---------- armonía ----------
// Am – F – C – G (un acorde por compás de 2 s)
const PROG = [
  { root: 45, pad: [57, 60, 64, 69] },
  { root: 41, pad: [53, 57, 60, 65] },
  { root: 48, pad: [55, 60, 64, 67] },
  { root: 43, pad: [55, 59, 62, 67] },
];
const chordAt = (t) => PROG[Math.floor(t / 2 + 1e-6) % 4];

// ---------- secuenciador ----------
const K = kick(), CL = clap(), HC = hat(false), HO = hat(true), SN = snare();
function drums(t0, t1, o = {}) {
  for (let t = Math.ceil(t0 * 4 - 1e-6) / 4; t < t1 - 1e-6; t += 0.25) {
    const sixteenth = Math.round(t * 4) % 4; // 0..3 dentro del beat... (beat = 0.5 s = 2 corcheas)
    const beatPos = Math.round(t * 4) % 2; // 0 = en el beat, 1 = a contratiempo (corchea)
    const inBar = Math.round(t * 2) % 4; // beat dentro del compás
    if (beatPos === 0) {
      if (o.kick !== false && (!o.half || inBar % 2 === 0)) { addMono(B.drums, t, K, o.kickGain || 1); KICKS.push(t); }
      if (o.clap !== false && (inBar === 1 || inBar === 3)) addMono(B.drums, t, CL, 0.55, 0.05, 0.25);
    } else if (o.hats !== false) {
      addMono(B.drums, t, o.openHats ? HO : HC, o.openHats ? 0.16 : 0.28, 0.25);
    }
    if (o.hats16 && beatPos === 0 && o.hats !== false) addMono(B.drums, t, HC, 0.12, -0.3);
    void sixteenth;
  }
  if (o.hats16) {
    for (let t = Math.ceil(t0 * 8 - 1e-6) / 8; t < t1 - 1e-6; t += 0.125) {
      if (Math.round(t * 8) % 2 === 1) addMono(B.drums, t, HC, 0.1, -0.35);
    }
  }
}
function bassline(t0, t1, octave = true, bright = 1) {
  for (let t = Math.ceil(t0 * 4 - 1e-6) / 4; t < t1 - 1e-6; t += 0.25) {
    const ch = chordAt(t);
    const off = Math.round(t * 4) % 2;
    addMono(B.bass, t, bass(ch.root + (octave && off ? 12 : 0), 0.2, bright), 0.55);
  }
}
function pads(t0, t1, cutoff = 1800, gain = 1) {
  let t = t0;
  while (t < t1 - 1e-6) {
    const next = Math.min(t1, (Math.floor(t / 2 + 1e-6) + 1) * 2);
    addSt(B.music, t, pad(chordAt(t).pad, next - t, cutoff), gain, 0.35);
    t = next;
  }
}
function arp(t0, t1, gain = 0.22, bright = 1, step = 0.125) {
  const pat = [0, 2, 3, 1, 2, 3, 1, 2];
  let k = 0;
  for (let t = Math.ceil(t0 / step - 1e-6) * step; t < t1 - 1e-6; t += step) {
    const ch = chordAt(t).pad;
    const m = ch[pat[k++ % pat.length] % ch.length] + 12;
    addMono(B.music, t, pluck(m, bright), gain, (k % 2 ? -0.35 : 0.35), 0.15, 0.35);
  }
}
function roll(t0, t1, gain = 0.5) {
  let t = t0;
  while (t < t1 - 1e-6) {
    const x = (t - t0) / (t1 - t0);
    addMono(B.drums, t, SN, gain * (0.25 + 0.75 * x * x), 0, 0.15);
    t += x < 0.5 ? 0.125 : x < 0.8 ? 0.0625 : 0.03125;
  }
}

// ======================= ARREGLO =======================
// 1. HOOK 0–4
addSt(B.sfx, 0.0, whoosh(0.5, 0.35, 0, 0, 2400, 700), 1); // la gota cae
addSt(B.sfx, 0.5, impact(1.0), 0.95, 0.2);
addSt(B.sfx, 0.5, crash(), 0.42, 0.3);
addMono(B.sfx, 0.5, pop(300, 1700), 0.35, 0, 0.4); // splash
drums(0.5, 3.55, { hats16: false });
bassline(0.5, 3.55);
pads(0.5, 3.55, 1500, 0.8);
[[1.3, 0], [1.45, 0], [2.38, 2], [2.5, 2]].forEach(([t, k]) => addMono(B.music, t, stab(PROG[k % 4].pad.map((m) => m + 12)), 0.42, 0, 0.3, 0.2));
for (let k = 0; k < 6; k++) addMono(B.sfx, 2.25 + k * 0.25, shutter(), 0.38, (k % 2 ? 0.4 : -0.4));
addSt(B.sfx, 2.12, whoosh(0.35, 0.5), 1);
addSt(B.sfx, 3.25, whoosh(0.55, 0.65, 0.6, -0.6), 1);

// 2. PROBLEMA 4–8  (apagado, desafinado, con reloj)
addMono(B.sfx, 4.0, thud(), 0.6);
drums(4.0, 7.0, { half: true, clap: false, hats: false, kickGain: 0.8 });
addSt(B.music, 4.0, detunedPad([50, 53, 57, 62], 3.7), 1.1, 0.4);
for (let t = 4.0; t < 7.5; t += 0.5) addMono(B.sfx, t, tick(), 0.16, (Math.round(t * 2) % 2 ? 0.3 : -0.3), 0.15);
// zumbido del foco que parpadea (mismo patrón que el visual)
(() => {
  const t0 = 4.75, t1 = 5.7, n = Math.round((t1 - t0) * SR), o = new Float32Array(n), lp = new Biquad('lp', 1400);
  let g = 0;
  for (let i = 0; i < n; i++) {
    const t = t0 + i / SR;
    const on = Math.sin(t * 47) > 0.1 || Math.sin(t * 13) > 0.6 ? 1 : 0;
    g += (on - g) * 0.004;
    const ph = (t * 100) % 1;
    o[i] = lp.run((2 * ph - 1) + 0.4 * Math.sin(TAU * 200 * t)) * g * 0.5;
  }
  addMono(B.sfx, t0, o, 0.32, 0, 0.1);
})();
addMono(B.sfx, 6.3, marker(0.32), 0.3, 0.3);
addMono(B.sfx, 6.46, marker(0.28), 0.22, 0.4);
addMono(B.sfx, 6.7, marker(0.3), 0.26, -0.35);
addMono(B.sfx, 6.95, marker(0.1), 0.3, 0.25);
addMono(B.sfx, 7.06, marker(0.1), 0.3, 0.3);
addSt(B.sfx, 6.4, riser(1.475, 0.55), 1);
roll(7.0, 7.875, 0.42);
addSt(B.sfx, 7.3, revCymbal(0.7), 0.55);

// 3. PRESENTACIÓN 8–13
addSt(B.sfx, 8.0, impact(1.0), 0.9, 0.2);
addSt(B.sfx, 8.0, crash(), 0.45, 0.3);
addMono(B.sfx, 8.0, bell(81), 0.25, 0, 0.5);
drums(8.0, 12.5, { hats16: true });
bassline(8.0, 12.5);
pads(8.0, 12.75, 2200, 0.9);
arp(8.0, 12.5, 0.2, 1);
for (let i = 0; i < 9; i++) addMono(B.sfx, 8.55 + i * 0.035, tick(), 0.07, -0.4 + i * 0.1); // letras del wordmark
for (let i = 0; i < 4; i++) addMono(B.sfx, 9.97 + i * 0.1, pop(480 + i * 90, 1200 + i * 120), 0.28, -0.3 + i * 0.2, 0.25);
addSt(B.sfx, 9.62, whoosh(0.5, 0.45, -0.3, 0.3), 1);
roll(12.5, 12.875, 0.35);
addSt(B.sfx, 12.5, whoosh(0.55, 0.7, -0.2, 0.6, 180, 3000), 1);

// 4. SERVICIOS 13–24
addSt(B.sfx, 13.05, impact(0.6, 1.2), 0.75, 0.2);
addMono(B.drums, 13.05, SN, 0.6, 0, 0.3);
addMono(B.drums, 13.2, tom(110), 0.8, 0, 0.2);
addMono(B.drums, 13.2, SN, 0.6, 0, 0.3);
addSt(B.music, 13.05, pad(PROG[2].pad, 0.9, 1400), 0.8, 0.4);
addSt(B.sfx, 13.35, riser(0.65, 0.45), 1);
roll(13.5, 14.0, 0.38);
addSt(B.sfx, 14.0, impact(0.9), 0.8, 0.2);
addSt(B.sfx, 14.0, crash(), 0.42, 0.3);
drums(14.0, 23.75, { hats16: true });
bassline(14.0, 23.75);
pads(14.0, 23.9, 2400, 0.85);
arp(14.0, 23.75, 0.18, 1.1);
[16.5, 19.0, 21.5].forEach((b) => {
  addSt(B.sfx, b - 0.27, whoosh(0.5, 0.75, 0.8, -0.8), 1);
  addSt(B.sfx, b, impact(0.45, 1.0), 0.7);
});
addSt(B.sfx, 19.0, crash(), 0.3, 0.3);
addMono(B.sfx, 14.1, pop(300, 700), 0.25, 0, 0.3); // anillo del logo
addMono(B.sfx, 17.6, pop(700, 1600), 0.4, 0.4, 0.3); // "like"
addMono(B.sfx, 19.5, thud(), 0.55, -0.4);
addMono(B.sfx, 19.66, thud(), 0.5, 0.4);
addSt(B.sfx, 19.65, whoosh(0.4, 0.4, -0.8, 0.2), 1);
addSt(B.sfx, 22.42, whoosh(0.3, 0.3, 0.6, -0.6, 800, 6000), 1);
addSt(B.sfx, 23.22, whoosh(0.3, 0.3, 0.6, -0.6, 800, 6000), 1);
addSt(B.sfx, 23.55, whoosh(0.5, 0.55, 0, 0, 200, 2500), 1); // hoja de papel

// 5. PROCESO 24–30 (break que se va abriendo)
pads(24.0, 29.6, 1600, 0.9);
addMono(B.sfx, 24.1, pencil(1.15), 0.35, 0.2, 0.08);
for (let t = 24.0; t < 25.5; t += 0.125) addMono(B.drums, t, HC, Math.round(t * 8) % 2 ? 0.08 : 0.13, 0.4);
[[24.0, 76], [24.5, 79], [25.0, 81], [25.25, 79]].forEach(([t, m]) => addMono(B.music, t, pluck(m, 0.6, 0.8), 0.26, 0, 0.3, 0.4));
addMono(B.sfx, 24.55, pencil(0.3), 0.25, 0.5);
drums(25.5, 27.0, { clap: false, hats: true, kickGain: 0.8 });
bassline(25.5, 27.0, false, 0.5);
for (let i = 0; i < 22; i++) addMono(B.sfx, 25.7 + i * 0.035, mouseClick(), 0.22, -0.3 + (i % 5) * 0.15);
addMono(B.sfx, 26.45, pop(900, 1300), 0.22, 0, 0.2);
drums(27.0, 28.5, { hats16: true });
bassline(27.0, 28.5, true, 0.8);
arp(27.0, 29.5, 0.14, 0.8);
addSt(B.sfx, 26.85, whoosh(0.5, 0.4, -0.5, 0.5, 400, 7000), 1);
for (let i = 0; i < 5; i++) addMono(B.sfx, 27.4 + i * 0.05, pop(600 + i * 120, 1300 + i * 150), 0.22, -0.4 + i * 0.2, 0.2);
addSt(B.sfx, 27.6, whoosh(0.3, 0.35, 0.3, 0.6, 1200, 6000), 1);
drums(28.5, 29.5, { hats16: true });
bassline(28.5, 29.5);
addSt(B.sfx, 28.5, whoosh(0.45, 0.5, 0.6, -0.2), 1);
addSt(B.sfx, 28.72, whoosh(0.4, 0.4, 0.8, 0), 1);
addSt(B.sfx, 28.9, riser(1.1, 0.55), 1);
roll(29.5, 30.0, 0.45);
addSt(B.sfx, 29.55, whoosh(0.45, 0.6, 0, 0, 300, 6000), 1);

// 6. RESULTADOS 30–35 (máxima energía)
addSt(B.sfx, 30.0, impact(1.0), 0.9, 0.2);
addSt(B.sfx, 30.0, crash(), 0.48, 0.3);
drums(30.0, 34.5, { hats16: true });
bassline(30.0, 34.5, true, 1.2);
pads(30.0, 34.75, 2800, 0.85);
arp(30.0, 34.5, 0.2, 1.2);
[30.25, 30.5, 30.75].forEach((t, k) => addMono(B.drums, t, SN, 0.32, k % 2 ? 0.3 : -0.3, 0.2));
addSt(B.sfx, 31.0, crash(1.6), 0.35, 0.3);
addSt(B.sfx, 30.9, whoosh(0.35, 0.5), 1);
[[31.2, 0], [31.38, 0], [31.56, 2]].forEach(([t, k]) => addMono(B.music, t, stab(PROG[k].pad.map((m) => m + 12)), 0.36, 0, 0.3, 0.2));
for (let k = 0; k < 6; k++) addMono(B.sfx, 33.0 + k * 0.25, shutter(), 0.32, (k % 2 ? 0.45 : -0.45));
addSt(B.sfx, 34.45, revCymbal(0.55), 0.6);
roll(34.5, 35.0, 0.42);

// 7. CIERRE 35–40 (F – G – C: resolución luminosa)
addSt(B.sfx, 35.0, impact(1.05), 0.95, 0.25);
addSt(B.sfx, 35.0, crash(2.6), 0.5, 0.35);
addSt(B.music, 35.0, pad([53, 57, 60, 65], 1.0, 2000), 0.95, 0.45);
addSt(B.music, 36.0, pad([55, 59, 62, 67], 1.7, 2000), 0.95, 0.45);
for (let t = 35.0; t < 37.5; t += 0.25) addMono(B.music, t, pluck((t < 36 ? [65, 69, 72, 77] : [67, 71, 74, 79])[Math.round(t * 4) % 4], 0.7), 0.15, Math.round(t * 4) % 2 ? 0.4 : -0.4, 0.3, 0.4);
addMono(B.bass, 35.0, bass(41, 0.95, 0.4), 0.6);
addMono(B.bass, 36.0, bass(43, 1.65, 0.4), 0.6);
addMono(B.drums, 35.35, SN, 0.3, 0, 0.3);
addMono(B.drums, 35.5, K, 0.7); KICKS.push(35.5);
addMono(B.drums, 36.15, HC, 0.15);
addSt(B.sfx, 37.0, whoosh(0.45, 0.5, -0.6, 0.6), 1);
addSt(B.sfx, 37.25, revCymbal(0.45), 0.4);
addSt(B.sfx, 37.7, impact(0.9, 2.3), 0.85, 0.3);
addSt(B.sfx, 37.7, crash(2.3), 0.36, 0.4);
addSt(B.music, 37.7, pad([48, 55, 60, 64, 67, 74], 2.3, 2600, 0.05, 1.5), 1.0, 0.5);
addMono(B.bass, 37.7, bass(36, 2.2, 0.3), 0.55);
[72, 76, 79, 84, 88].forEach((m, k) => addMono(B.music, 37.7 + k * 0.07, bell(m), 0.32, -0.5 + k * 0.25, 0.5, 0.3));
for (let i = 0; i < 9; i++) addMono(B.sfx, 37.7 + i * 0.04, tick(), 0.05, -0.4 + i * 0.1); // letras del wordmark

// ======================= PROCESO DEL MIX =======================
function lowpassRegion(bus, t0, t1, fnCut, q = 0.8) {
  const i0 = Math.max(0, Math.round(t0 * SR)), i1 = Math.min(N, Math.round(t1 * SR));
  for (let c = 0; c < 2; c++) {
    const f = new Biquad('lp', 1000, q);
    const x = bus[c];
    for (let i = i0; i < i1; i++) {
      if ((i - i0) % 64 === 0) f.set(fnCut(i / SR), q);
      x[i] = f.run(x[i]);
    }
  }
}
// Sidechain: el bajo y los pads "respiran" con el kick
function sidechain(bus, depth) {
  const ks = KICKS.slice().sort((a, b) => a - b);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    while (k + 1 < ks.length && ks[k + 1] <= t) k++;
    let g = 1;
    if (ks.length && ks[k] <= t) { const d = t - ks[k]; if (d < 0.35) g = 1 - depth * Math.exp(-d * 11) * Math.min(1, d / 0.004 + 0.6); }
    bus[0][i] *= g; bus[1][i] *= g;
  }
}
sidechain(B.bass, 0.75);
sidechain(B.music, 0.4);

// Problema: todo apagado (filtro pasa-bajos)
[B.drums, B.bass, B.music].forEach((bus) => lowpassRegion(bus, 4.0, 7.95, () => 650));
// Proceso: el filtro se abre paso a paso
[B.drums, B.bass, B.music].forEach((bus) => lowpassRegion(bus, 24.0, 30.0, (t) => 450 * Math.pow(40, Math.pow((t - 24) / 6, 1.4))));

// Reverb (Schroeder/Freeverb simplificado)
function reverb([inL, inR], size = 1) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491], aps = [556, 441, 341];
  const out = St();
  for (let c = 0; c < 2; c++) {
    const x = c ? inR : inL, y = out[c];
    const cb = combs.map((d) => ({ b: new Float32Array(Math.round((d + c * 23) * size)), i: 0, f: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(d + c * 23), i: 0 }));
    for (let n = 0; n < N; n++) {
      const s = x[n] * 0.015;
      let acc = 0;
      for (const q of cb) {
        const o = q.b[q.i];
        q.f = o * 0.72 + q.f * 0.28;
        q.b[q.i] = s + q.f * 0.86;
        if (++q.i >= q.b.length) q.i = 0;
        acc += o;
      }
      for (const a of ab) {
        const bo = a.b[a.i];
        const v = -acc + bo;
        a.b[a.i] = acc + bo * 0.5;
        if (++a.i >= a.b.length) a.i = 0;
        acc = v;
      }
      y[n] = acc;
    }
  }
  return out;
}
// Delay ping-pong a 3/16
function pingpong([inL, inR], time = 0.375, fb = 0.38) {
  const d = Math.round(time * SR), out = St();
  const bl = new Float32Array(d), br = new Float32Array(d);
  const lp = [new Biquad('lp', 3500), new Biquad('lp', 3500)];
  let i = 0;
  for (let n = 0; n < N; n++) {
    const l = bl[i], r = br[i];
    out[0][n] = l; out[1][n] = r;
    bl[i] = lp[0].run((inL[n] + inR[n]) * 0.5 + r * fb);
    br[i] = lp[1].run(l * fb);
    if (++i >= d) i = 0;
  }
  return out;
}
const VERB = reverb(B.verb, 1.0);
const DLY = pingpong(B.dly);

// Tape-stop al final del hook (3.55 -> 4.0)
const MUS = St();
for (let c = 0; c < 2; c++) for (let n = 0; n < N; n++) MUS[c][n] = B.drums[c][n] * 0.95 + B.bass[c][n] * 0.7 + B.music[c][n] * 0.95 + DLY[c][n] * 0.4;
(() => {
  const s0 = Math.round(3.55 * SR), s1 = Math.round(4.0 * SR);
  const copy = [MUS[0].slice(s0, s1), MUS[1].slice(s0, s1)];
  let pos = 0;
  for (let n = s0; n < s1; n++) {
    const x = (n - s0) / (s1 - s0);
    const sp = Math.pow(1 - x, 1.6);
    const i = Math.floor(pos), fr = pos - i;
    for (let c = 0; c < 2; c++) {
      const a = copy[c][i] || 0, b = copy[c][i + 1] || 0;
      MUS[c][n] = (a + (b - a) * fr) * Math.min(1, (1 - x) * 4);
    }
    pos += sp;
  }
})();

// ---------- master ----------
const M = St();
const hp = [new Biquad('hp', 28), new Biquad('hp', 28)];
for (let c = 0; c < 2; c++) {
  for (let n = 0; n < N; n++) {
    const v = MUS[c][n] + B.sfx[c][n] * 0.9 + VERB[c][n] * 0.9;
    M[c][n] = hp[c].run(v);
  }
}
// Limitador con lookahead
(() => {
  const look = Math.round(0.005 * SR), rel = Math.exp(-1 / (0.09 * SR)), ceil = 0.89;
  const peak = new Float32Array(N);
  for (let n = 0; n < N; n++) peak[n] = Math.max(Math.abs(M[0][n]), Math.abs(M[1][n]));
  // máximo deslizante hacia adelante
  const need = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    let m = 0;
    for (let k = 0; k < look; k += 8) { const p = peak[n + k] || 0; if (p > m) m = p; }
    need[n] = m > ceil ? ceil / m : 1;
  }
  let g = 1;
  for (let n = 0; n < N; n++) {
    const target = need[n];
    g = target < g ? target : target + (g - target) * rel;
    M[0][n] *= g; M[1][n] *= g;
  }
})();
// Fades y normalización
let pk = 0;
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const f = Math.min(1, t / 0.005) * (t > 38.9 ? Math.pow(Math.max(0, (40 - t) / 1.1), 1.5) : 1);
  for (let c = 0; c < 2; c++) {
    M[c][n] = Math.tanh(M[c][n] * 1.05) * f;
    pk = Math.max(pk, Math.abs(M[c][n]));
  }
}
const norm = 0.89 / pk;

// ---------- WAV ----------
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8);
out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  out.writeInt16LE(Math.round(clamp(M[0][n] * norm, -1, 1) * 32767), 44 + n * 4);
  out.writeInt16LE(Math.round(clamp(M[1][n] * norm, -1, 1) * 32767), 46 + n * 4);
}
const file = path.join(__dirname, '..', 'output', 'creax-ink-music.wav');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out);
console.log('Audio ->', file, `(pico previo ${pk.toFixed(2)}, ${KICKS.length} kicks)`);
