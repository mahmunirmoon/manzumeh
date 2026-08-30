/**
 * Procedural space music engine (Web Audio API — no audio files needed).
 * Every planet has its own looping melody: scale, tempo, timbre and echo.
 * When the user selects a planet the current tune fades out and the
 * planet's tune starts looping until another planet is chosen.
 */

interface TrackDef {
  id: string;
  title: string;
  bpm: number;
  /** midi note of the scale root */
  root: number;
  /** scale intervals (semitones) */
  scale: number[];
  /** 16-step lead pattern; -1 = rest, values are scale degrees */
  lead: number[];
  /** 16-step bass pattern; -1 = rest */
  bass: number[];
  /** 4 chords (scale degrees) — one per bar of 16 steps */
  chords: number[][];
  leadType: OscillatorType;
  bassType: OscillatorType;
  /** low-pass brightness in Hz */
  bright: number;
  /** echo delay in seconds */
  echo: number;
  leadVol: number;
  pad: boolean;
}

export const TRACKS: Record<string, TrackDef> = {
  space: {
    id: "space", title: "نوای کهکشان", bpm: 72, root: 57,
    scale: [0, 3, 5, 7, 10],
    lead: [0, -1, 2, -1, 4, -1, 2, -1, 3, -1, 1, -1, 2, -1, -1, -1],
    bass: [0, -1, -1, -1, 3, -1, -1, -1, 0, -1, -1, -1, 4, -1, -1, -1],
    chords: [[0, 2, 4], [0, 2, 4], [3, 0, 2], [3, 0, 2]],
    leadType: "triangle", bassType: "sine", bright: 2400, echo: 0.42, leadVol: 0.5, pad: true,
  },
  sun: {
    id: "sun", title: "درخشش خورشید", bpm: 122, root: 60,
    scale: [0, 2, 4, 7, 9],
    lead: [0, 2, 4, 2, 5, 4, 2, 0, 1, 2, 4, 2, 7, 5, 4, 2],
    bass: [0, -1, 0, -1, 3, -1, 3, -1, 4, -1, 4, -1, 3, -1, 2, -1],
    chords: [[0, 2, 4], [0, 2, 4], [3, 0, 2], [4, 1, 3]],
    leadType: "square", bassType: "triangle", bright: 3400, echo: 0.24, leadVol: 0.26, pad: false,
  },
  mercury: {
    id: "mercury", title: "جهش‌های عطارد", bpm: 152, root: 72,
    scale: [0, 2, 4, 7, 9],
    lead: [0, 2, 4, 7, 4, 2, 0, 2, 4, 9, 7, 4, 2, 4, 2, 0],
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 3, -1, -1, -1, 3, -1, -1, -1],
    chords: [[0, 2, 4], [0, 2, 4], [3, 0, 2], [4, 1, 3]],
    leadType: "square", bassType: "sine", bright: 5200, echo: 0.18, leadVol: 0.2, pad: false,
  },
  venus: {
    id: "venus", title: "والس زهره", bpm: 92, root: 62,
    scale: [0, 2, 4, 5, 7, 9, 11],
    lead: [0, -1, 2, 4, -1, 4, 2, -1, 5, -1, 4, 2, -1, 1, -1, -1],
    bass: [0, -1, -1, 4, -1, -1, 3, -1, 0, -1, -1, 4, -1, -1, 2, -1],
    chords: [[0, 2, 4], [3, 0, 2], [4, 1, 3], [0, 2, 4]],
    leadType: "sine", bassType: "triangle", bright: 2600, echo: 0.36, leadVol: 0.55, pad: true,
  },
  earth: {
    id: "earth", title: "لالایی زمین", bpm: 100, root: 60,
    scale: [0, 2, 4, 7, 9],
    lead: [4, -1, 2, -1, 0, 2, 4, -1, 5, -1, 4, -1, 2, -1, 0, -1],
    bass: [0, -1, -1, -1, -1, -1, 3, -1, 4, -1, -1, -1, 3, -1, 2, -1],
    chords: [[0, 2, 4], [3, 0, 2], [1, 3, 5], [0, 2, 4]],
    leadType: "triangle", bassType: "sine", bright: 2800, echo: 0.3, leadVol: 0.5, pad: true,
  },
  mars: {
    id: "mars", title: "راهپیمایی مریخ", bpm: 116, root: 55,
    scale: [0, 2, 3, 5, 7, 8, 10],
    lead: [0, 0, 3, 0, 5, 3, 2, 1, 0, 0, 3, 0, 7, 5, 3, 2],
    bass: [0, -1, 0, -1, 0, -1, 0, -1, 3, -1, 3, -1, 4, -1, 4, -1],
    chords: [[0, 2, 4], [0, 2, 4], [5, 2, 4], [6, 3, 5]],
    leadType: "sawtooth", bassType: "sawtooth", bright: 1800, echo: 0.2, leadVol: 0.22, pad: false,
  },
  jupiter: {
    id: "jupiter", title: "شکوه مشتری", bpm: 96, root: 55,
    scale: [0, 2, 4, 5, 7, 9, 11],
    lead: [0, -1, 4, -1, 7, -1, 4, -1, 5, -1, 9, -1, 7, 4, 2, -1],
    bass: [0, -1, -1, 0, -1, -1, 4, -1, 5, -1, -1, 5, -1, -1, 2, -1],
    chords: [[0, 2, 4], [5, 2, 4], [3, 0, 2], [4, 1, 3]],
    leadType: "sawtooth", bassType: "triangle", bright: 2100, echo: 0.32, leadVol: 0.2, pad: true,
  },
  saturn: {
    id: "saturn", title: "رویای حلقه‌ها", bpm: 84, root: 62,
    scale: [0, 2, 4, 6, 7, 9, 11],
    lead: [0, -1, -1, 2, -1, -1, 4, -1, 6, -1, -1, 4, -1, 2, -1, -1],
    bass: [0, -1, -1, -1, -1, -1, -1, -1, 4, -1, -1, -1, -1, -1, -1, -1],
    chords: [[0, 2, 4, 6], [0, 2, 4, 6], [1, 3, 5, 0], [1, 3, 5, 0]],
    leadType: "triangle", bassType: "sine", bright: 3000, echo: 0.5, leadVol: 0.5, pad: true,
  },
  uranus: {
    id: "uranus", title: "بازیِ کج‌وکوله", bpm: 110, root: 64,
    scale: [0, 2, 4, 6, 8, 10],
    lead: [0, 3, 1, 4, 2, 5, 3, 0, 5, 2, 4, 1, 3, 0, 2, -1],
    bass: [0, -1, 2, -1, 4, -1, 2, -1, 3, -1, 1, -1, 5, -1, 3, -1],
    chords: [[0, 2, 4], [1, 3, 5], [2, 4, 0], [3, 5, 1]],
    leadType: "square", bassType: "triangle", bright: 2700, echo: 0.28, leadVol: 0.22, pad: false,
  },
  neptune: {
    id: "neptune", title: "ژرفای نپتون", bpm: 66, root: 52,
    scale: [0, 3, 5, 7, 10],
    lead: [0, -1, -1, -1, 2, -1, -1, 4, -1, -1, 3, -1, 2, -1, -1, -1],
    bass: [0, -1, -1, -1, -1, -1, -1, -1, 3, -1, -1, -1, -1, -1, -1, -1],
    chords: [[0, 2, 4], [0, 2, 4], [1, 3, 0], [1, 3, 0]],
    leadType: "sine", bassType: "sine", bright: 1500, echo: 0.6, leadVol: 0.6, pad: true,
  },
};

export function trackTitle(id: string | null): string {
  return TRACKS[id ?? "space"]?.title ?? TRACKS.space.title;
}
export function trackBpm(id: string | null): number {
  return TRACKS[id ?? "space"]?.bpm ?? TRACKS.space.bpm;
}

/* ---------------- engine ---------------- */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let echoIn: GainNode | null = null;
let timer: number | null = null;
let current: TrackDef | null = null;
let step = 0;
let bar = 0;
let nextTime = 0;
let enabled = false;

const LOOKAHEAD = 0.14;
const TICK = 32;

function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function degreeToMidi(tr: TrackDef, deg: number): number {
  const len = tr.scale.length;
  const oct = Math.floor(deg / len);
  const idx = ((deg % len) + len) % len;
  return tr.root + tr.scale[idx] + oct * 12;
}

/* ------------------------------------------------------------------ */
/* Audio unlock management (mobile browsers keep the context suspended */
/* until a real user gesture — one stable singleton, never duplicated) */
/* ------------------------------------------------------------------ */
let unlocked = false;
const readyListeners = new Set<(ready: boolean) => void>();

function markUnlocked(v: boolean) {
  if (unlocked === v) return;
  unlocked = v;
  readyListeners.forEach((l) => l(v));
  /* if music was requested while locked, start it now that we can play */
  if (v && enabled && timer === null && ctx && ctx.state === "running") {
    nextTime = ctx.currentTime + 0.08;
    timer = window.setInterval(tick, TICK);
  }
}

/** True when the AudioContext exists and is actually running. */
export function isAudioReady(): boolean {
  return !!ctx && ctx.state === "running";
}

/** Subscribe to unlock state changes (returns an unsubscribe function). */
export function onAudioReadyChange(cb: (ready: boolean) => void): () => void {
  readyListeners.add(cb);
  return () => {
    readyListeners.delete(cb);
  };
}

/**
 * Must be called from (or right after) a user gesture on mobile.
 * Creates the context, awaits resume(), catches rejections, and
 * restarts scheduling if the user already asked for music.
 */
export async function tryUnlockMusic(): Promise<boolean> {
  let c: AudioContext;
  try {
    c = ensureGraph();
  } catch {
    return false;
  }
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* autoplay policy — not allowed yet, stay quiet */
    }
  }
  const ok = c.state === "running";
  if (ok) markUnlocked(true);
  return ok;
}

function ensureGraph(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    /* track OS-level suspensions (iOS backgrounding, tab switch, …) */
    ctx.addEventListener("statechange", () => {
      if (!ctx) return;
      if (ctx.state === "running") {
        markUnlocked(true);
      } else if (ctx.state === "suspended") {
        markUnlocked(false);
      }
    });
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    master.connect(comp);
    comp.connect(ctx.destination);

    /* shared spacey echo */
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.34;
    const fb = ctx.createGain();
    fb.gain.value = 0.36;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    echoIn = ctx.createGain();
    echoIn.gain.value = 1;
    echoIn.connect(delay);
  }
  return ctx;
}

function note(
  tr: TrackDef,
  time: number,
  midi: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  bright: number,
  echoAmount: number
) {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = midiToFreq(midi);
  const filt = c.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = bright;
  filt.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(vol, time + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(filt);
  filt.connect(g);
  g.connect(master!);
  if (echoAmount > 0 && echoIn) {
    const send = c.createGain();
    send.gain.value = echoAmount;
    g.connect(send);
    send.connect(echoIn);
  }
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function padChord(tr: TrackDef, time: number, barDur: number, chord: number[]) {
  for (const deg of chord) {
    const midi = degreeToMidi(tr, deg) - 12;
    note(tr, time, midi, barDur * 1.05, "triangle", 0.055, tr.bright * 0.6, 0.5);
    note(tr, time, midi + 12, barDur * 1.05, "sine", 0.035, tr.bright * 0.5, 0.4);
  }
}

function scheduleStep(tr: TrackDef, i: number, time: number, spb: number) {
  const leadDeg = tr.lead[i];
  if (leadDeg >= 0) {
    const midi = degreeToMidi(tr, leadDeg) + 12;
    note(tr, time, midi, spb * 1.9, tr.leadType, tr.leadVol, tr.bright, 0.6);
  }
  const bassDeg = tr.bass[i];
  if (bassDeg >= 0) {
    const midi = degreeToMidi(tr, bassDeg) - 12;
    note(tr, time, midi, spb * 2.4, tr.bassType, 0.3, 900, 0.15);
  }
  if (i === 0 && tr.pad) {
    const chord = tr.chords[bar % tr.chords.length];
    padChord(tr, time, spb * 16, chord);
  }
  if (i === 15) bar += 1;
}

function tick() {
  if (!ctx || !current || ctx.state !== "running") return;
  const tr = current;
  const spb = 60 / tr.bpm / 4;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(tr, step, nextTime, spb);
    step = (step + 1) % 16;
    nextTime += spb;
  }
}

/** Start (or restart) the engine and switch to a planet's tune. */
export function setTrack(id: string | null): void {
  const tr = TRACKS[id ?? "space"] ?? TRACKS.space;
  if (current?.id === tr.id && timer !== null) return;
  current = tr;
  step = 0;
  bar = 0;
  if (ctx && enabled) {
    if (timer !== null) window.clearInterval(timer);
    nextTime = ctx.currentTime + 0.08;
    timer = window.setInterval(tick, TICK);
  }
}

/** Turn the music on (must be called from a user gesture the first time). */
export function enableMusic(id: string | null): void {
  const c = ensureGraph();
  if (c.state === "suspended") void c.resume().catch(() => {});
  enabled = true;
  current = null; /* force restart */
  setTrack(id);
  const now = c.currentTime;
  master!.gain.cancelScheduledValues(now);
  master!.gain.setValueAtTime(Math.max(master!.gain.value, 0.0001), now);
  master!.gain.exponentialRampToValueAtTime(0.16, now + 0.4);
}

/** Fade the music out (keeps the context alive for instant resume). */
export function disableMusic(): void {
  enabled = false;
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  if (ctx && master) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  }
}
