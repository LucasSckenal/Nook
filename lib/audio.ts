"use client";

import type { StationId } from "./types";

/**
 * Motor de áudio do Nook — 100% procedural via Web Audio API.
 * Nenhum arquivo de áudio: as cinco estações são sintetizadas
 * (ruído filtrado, pads de acordes, crackle de vinil), o que mantém
 * o protótipo leve e offline. Em produção, loops licenciados com
 * crossfade substituem ou somam-se a estas camadas.
 */

type LayerNodes = { gain: GainNode; stop: () => void };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let stationLayer: LayerNodes | null = null;
let rainLayer: LayerNodes | null = null;
let currentStation: StationId | null = null;

function ensureCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, type: "white" | "pink" | "brown"): AudioBuffer {
  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (type === "white") data[i] = w * 0.4;
    else if (type === "brown") {
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    } else {
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      data[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }
  }
  return buf;
}

function noiseSource(ac: AudioContext, type: "white" | "pink" | "brown"): AudioBufferSourceNode {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, type);
  src.loop = true;
  return src;
}

/* ── camadas por estação ───────────────────────────────────────────── */

function makeRain(ac: AudioContext): LayerNodes {
  const gain = ac.createGain();
  const src = noiseSource(ac, "pink");
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1400;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 250;
  // ondulação lenta, como rajadas
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain).connect(lp.frequency);
  src.connect(hp).connect(lp).connect(gain);
  src.start();
  lfo.start();
  return { gain, stop: () => { src.stop(); lfo.stop(); } };
}

function makeWhite(ac: AudioContext): LayerNodes {
  // ventilador no canto do quarto: sopro grave + giro das pás + zumbido do motor
  const gain = ac.createGain();

  // sopro: ruído filtrado bem para baixo
  const src = noiseSource(ac, "white");
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 520;
  const breath = ac.createGain();
  breath.gain.value = 1.6;

  // giro das pás: o sopro pulsa devagar (wobble de amplitude)
  const spin = ac.createOscillator();
  spin.frequency.value = 0.9;
  const spinDepth = ac.createGain();
  spinDepth.gain.value = 0.18;
  spin.connect(spinDepth).connect(breath.gain);
  spin.start();

  // zumbido do motor, quase imperceptível
  const hum = ac.createOscillator();
  hum.type = "triangle";
  hum.frequency.value = 84;
  const humGain = ac.createGain();
  humGain.gain.value = 0.012;
  hum.connect(humGain).connect(gain);
  hum.start();

  src.connect(lp).connect(breath).connect(gain);
  src.start();
  return {
    gain,
    stop: () => {
      src.stop();
      spin.stop();
      hum.stop();
    },
  };
}

function makeLibrary(ac: AudioContext): LayerNodes {
  // quase-silêncio acolhedor: ruído marrom bem grave (ventilação distante)
  const gain = ac.createGain();
  const src = noiseSource(ac, "brown");
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 320;
  const inner = ac.createGain();
  inner.gain.value = 0.5;
  src.connect(lp).connect(inner).connect(gain);
  src.start();
  return { gain, stop: () => src.stop() };
}

function makeCafe(ac: AudioContext): LayerNodes {
  // burburinho: ruído rosa em banda de voz com amplitude flutuante
  const gain = ac.createGain();
  const src = noiseSource(ac, "pink");
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 800;
  bp.Q.value = 0.6;
  const amp = ac.createGain();
  amp.gain.value = 0.7;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.23;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.22;
  lfo.connect(lfoGain).connect(amp.gain);
  const low = noiseSource(ac, "brown");
  const lowLp = ac.createBiquadFilter();
  lowLp.type = "lowpass";
  lowLp.frequency.value = 250;
  const lowGain = ac.createGain();
  lowGain.gain.value = 0.35;
  src.connect(bp).connect(amp).connect(gain);
  low.connect(lowLp).connect(lowGain).connect(gain);
  src.start();
  low.start();
  lfo.start();
  return { gain, stop: () => { src.stop(); low.stop(); lfo.stop(); } };
}

function makeLofi(ac: AudioContext): LayerNodes {
  const gain = ac.createGain();

  // crackle de vinil
  const crackle = noiseSource(ac, "white");
  const ckHp = ac.createBiquadFilter();
  ckHp.type = "highpass";
  ckHp.frequency.value = 3000;
  const ckGain = ac.createGain();
  ckGain.gain.value = 0.035;
  crackle.connect(ckHp).connect(ckGain).connect(gain);
  crackle.start();

  // pad de acordes quente (Fmaj7 → Am7 → Dm7 → Gm7), 8s por acorde
  const padOut = ac.createGain();
  padOut.gain.value = 0.16;
  const padLp = ac.createBiquadFilter();
  padLp.type = "lowpass";
  padLp.frequency.value = 900;
  padOut.connect(padLp).connect(gain);

  const chords = [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [164.81, 220.0, 261.63, 329.63], // Am7/E
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [98.0, 146.83, 174.61, 233.08], // Gm7
  ];
  const oscs: OscillatorNode[] = [];
  const oscGains: GainNode[] = [];
  for (let v = 0; v < 4; v++) {
    const o = ac.createOscillator();
    o.type = "triangle";
    // leve "tape wobble"
    const wob = ac.createOscillator();
    wob.frequency.value = 0.4 + v * 0.13;
    const wobGain = ac.createGain();
    wobGain.gain.value = 1.2;
    wob.connect(wobGain).connect(o.detune);
    wob.start();
    const g = ac.createGain();
    g.gain.value = 0;
    o.connect(g).connect(padOut);
    o.start();
    oscs.push(o);
    oscGains.push(g);
  }

  let step = 0;
  let alive = true;
  function nextChord() {
    if (!alive || !ctx) return;
    const t = ac.currentTime;
    const chord = chords[step % chords.length];
    for (let v = 0; v < 4; v++) {
      oscs[v].frequency.setTargetAtTime(chord[v], t, 0.4);
      oscGains[v].gain.cancelScheduledValues(t);
      oscGains[v].gain.setTargetAtTime(0.22, t, 1.2); // ataque lento
      oscGains[v].gain.setTargetAtTime(0.12, t + 5, 2.0); // respiração
    }
    step++;
    timer = window.setTimeout(nextChord, 8000);
  }
  let timer = window.setTimeout(nextChord, 50);

  return {
    gain,
    stop: () => {
      alive = false;
      window.clearTimeout(timer);
      crackle.stop();
      oscs.forEach((o) => o.stop());
    },
  };
}

const builders: Record<StationId, (ac: AudioContext) => LayerNodes> = {
  lofi: makeLofi,
  chuva: makeRain,
  biblioteca: makeLibrary,
  cafeteria: makeCafe,
  white: makeWhite,
};

/* ── API pública ───────────────────────────────────────────────────── */

const FADE = 0.8;

export function audioPlayStation(station: StationId) {
  const ac = ensureCtx();
  if (stationLayer && currentStation === station) return;
  audioStopStation();
  const layer = builders[station](ac);
  layer.gain.gain.value = 0;
  layer.gain.connect(master!);
  layer.gain.gain.setTargetAtTime(1, ac.currentTime, FADE);
  stationLayer = layer;
  currentStation = station;
}

export function audioStopStation() {
  if (!ctx || !stationLayer) return;
  const layer = stationLayer;
  layer.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  window.setTimeout(() => {
    layer.stop();
    layer.gain.disconnect();
  }, 900);
  stationLayer = null;
  currentStation = null;
}

export function audioSetRainLayer(on: boolean, volume: number) {
  const ac = ensureCtx();
  if (on) {
    if (!rainLayer) {
      rainLayer = makeRain(ac);
      rainLayer.gain.gain.value = 0;
      rainLayer.gain.connect(master!);
    }
    rainLayer.gain.gain.setTargetAtTime(volume, ac.currentTime, FADE);
  } else if (rainLayer) {
    const layer = rainLayer;
    layer.gain.gain.setTargetAtTime(0, ac.currentTime, 0.3);
    window.setTimeout(() => {
      layer.stop();
      layer.gain.disconnect();
    }, 900);
    rainLayer = null;
  }
}

export function audioSetVolume(v: number) {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
}

export function audioStopAll() {
  audioStopStation();
  audioSetRainLayer(false, 0);
}

/* ── o gato ronrona ────────────────────────────────────────────────── */

let purrStop: (() => void) | null = null;

/** começa o ronronar (enquanto a mão está no gato) */
export function audioPurrStart() {
  if (purrStop) return;
  const ac = ensureCtx();
  const t = ac.currentTime;

  // rumor grave + tremolo na frequência do ronron (~24Hz)
  const src = noiseSource(ac, "brown");
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 150;
  const trem = ac.createGain();
  trem.gain.value = 0.5;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 24;
  const lfoDepth = ac.createGain();
  lfoDepth.gain.value = 0.45;
  lfo.connect(lfoDepth).connect(trem.gain);

  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.22, t + 0.4);

  src.connect(lp).connect(trem).connect(out).connect(ac.destination);
  src.start(t);
  lfo.start(t);

  purrStop = () => {
    const now = ac.currentTime;
    out.gain.setTargetAtTime(0.0001, now, 0.12);
    window.setTimeout(() => {
      src.stop();
      lfo.stop();
    }, 500);
  };
}

/** a mão saiu — o gato volta a dormir */
export function audioPurrStop() {
  purrStop?.();
  purrStop = null;
}

/** som curtíssimo de UI: grafite riscando o papel ao concluir tarefa */
export function audioUiTick() {
  const ac = ensureCtx();
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, "white");
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2600;
  bp.Q.value = 0.7;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(t);
  src.stop(t + 0.14);
}
