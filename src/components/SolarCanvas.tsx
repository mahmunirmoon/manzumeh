import { memo, useEffect, useRef } from "react";
import { BODIES, PLANETS } from "../data/bodies";

export interface SolarCanvasProps {
  playing: boolean;
  /** simulated days per real second */
  speed: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showOrbits: boolean;
  showLabels: boolean;
  showTrails: boolean;
  resetToken: number;
  onElapsed: (days: number) => void;
}

interface Star {
  x: number; y: number; r: number;
  baseA: number; twA: number; twS: number; ph: number; c: string;
}
interface Meteor { x: number; y: number; vx: number; vy: number; life: number; max: number; }
interface Hit { id: string; x: number; y: number; r: number; }
interface Asteroid {
  x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number;
  verts: number[]; craters: { dx: number; dy: number; r: number }[];
}
interface Rocket { x: number; y: number; vx: number; vy: number; ang: number; }
interface BigComet { x: number; y: number; vx: number; vy: number; life: number; max: number; }
interface Sparkle { x: number; y: number; life: number; max: number; r: number; c: string; }

interface Sim {
  elapsed: number;
  last: number;
  lastSent: number;
  cx: number; cy: number; scale: number;
  stars: Star[];
  meteors: Meteor[];
  nextMeteor: number;
  hoverId: string | null;
  hits: Hit[];
  w: number; h: number;
  alien: { x: number; y: number; vx: number; baseY: number };
  asteroids: Asteroid[];
  rockets: Rocket[];
  nextRocket: number;
  comets: BigComet[];
  nextComet: number;
  sparkles: Sparkle[];
  nextSparkle: number;
}

function makeAsteroids(w: number, h: number): Asteroid[] {
  return Array.from({ length: 4 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 22,
    vy: (Math.random() - 0.5) * 14,
    r: 6 + Math.random() * 9,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 1.6,
    verts: Array.from({ length: 8 }, () => 0.68 + Math.random() * 0.5),
    craters: Array.from({ length: 3 }, () => ({
      dx: (Math.random() - 0.5) * 0.9,
      dy: (Math.random() - 0.5) * 0.9,
      r: 0.14 + Math.random() * 0.16,
    })),
  }));
}

const STAR_COLORS = ["#e9dcff", "#e9dcff", "#f3edff", "#ffe9c4", "#c9b2ff", "#dfe8ff"];
const MAX_ORBIT = 372;

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function SolarCanvasInner(props: SolarCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipTitleRef = useRef<HTMLDivElement>(null);
  const tipSubRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const simRef = useRef<Sim>({
    elapsed: 0, last: 0, lastSent: 0,
    cx: 0, cy: 0, scale: 0.8,
    stars: [], meteors: [], nextMeteor: 6,
    hoverId: null, hits: [], w: 0, h: 0,
    alien: { x: -150, y: 110, vx: 38, baseY: 110 },
    asteroids: [],
    rockets: [], nextRocket: 7,
    comets: [], nextComet: 4,
    sparkles: [], nextSparkle: 1.5,
  });

  /* reset simulation clock */
  useEffect(() => {
    simRef.current.elapsed = 0;
    propsRef.current.onElapsed(0);
  }, [props.resetToken]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const sim = simRef.current;
    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const makeStars = () => {
      const n = clamp(Math.round((sim.w * sim.h) / 4200), 90, 320);
      sim.stars = Array.from({ length: n }, () => ({
        x: Math.random() * sim.w,
        y: Math.random() * sim.h,
        r: 0.4 + Math.random() * 1.1,
        baseA: 0.22 + Math.random() * 0.55,
        twA: 0.08 + Math.random() * 0.38,
        twS: 0.5 + Math.random() * 2,
        ph: Math.random() * Math.PI * 2,
        c: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      }));
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sim.w = rect.width;
      sim.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (sim.cx === 0) {
        sim.cx = rect.width / 2;
        sim.cy = rect.height / 2;
        sim.alien.baseY = 60 + Math.random() * Math.max(60, rect.height * 0.28);
        sim.alien.y = sim.alien.baseY;
      }
      if (sim.asteroids.length === 0 && rect.width > 0) {
        sim.asteroids = makeAsteroids(rect.width, rect.height);
      }
      makeStars();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    /* ---------- geometry helpers ---------- */
    const panelOpen = () => propsRef.current.selectedId !== null;
    const targetCenter = () => {
      const shift = panelOpen() && sim.w >= 1024 ? Math.min(sim.w * 0.19, 185) : 0;
      return { x: sim.w / 2 + shift, y: sim.h * 0.5 };
    };
    const targetScale = () => {
      const availW = sim.w - (panelOpen() && sim.w >= 1024 ? 360 : 0);
      return clamp((Math.min(availW, sim.h) / 2 - 32) / MAX_ORBIT, 0.26, 1.15);
    };

    const bodyAngle = (periodDays: number, phase: number) =>
      phase - (Math.PI * 2 * sim.elapsed) / periodDays;

    /* ---------- drawing ---------- */
    const drawSun = (t: number) => {
      const s = sim.scale;
      const pr = Math.max(26 * s * 1.1, 16) * (1 + 0.025 * Math.sin(t * 1.7) + 0.014 * Math.sin(t * 3.3));
      const { cx, cy } = sim;

      const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 4.6);
      outer.addColorStop(0, "rgba(255,160,50,0.22)");
      outer.addColorStop(0.4, "rgba(255,140,40,0.08)");
      outer.addColorStop(1, "rgba(255,130,30,0)");
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(cx, cy, pr * 4.6, 0, Math.PI * 2);
      ctx.fill();

      /* faint rotating corona rays */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.03);
      ctx.strokeStyle = "rgba(255,190,90,0.07)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const len = pr * (2.4 + 0.5 * Math.sin(t * 1.3 + i * 1.7));
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * pr * 1.15, Math.sin(a) * pr * 1.15);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();

      const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 2.1);
      mid.addColorStop(0, "rgba(255,200,110,0.5)");
      mid.addColorStop(1, "rgba(255,160,60,0)");
      ctx.fillStyle = mid;
      ctx.beginPath();
      ctx.arc(cx, cy, pr * 2.1, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(cx - pr * 0.3, cy - pr * 0.3, pr * 0.1, cx, cy, pr);
      core.addColorStop(0, "#fff8e2");
      core.addColorStop(0.45, "#ffd166");
      core.addColorStop(0.82, "#ff9d2e");
      core.addColorStop(1, "#f07c1a");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.fill();

      return pr;
    };

    const drawLabel = (text: string, x: number, y: number, color: string, strong: boolean) => {
      ctx.font = `${strong ? 600 : 500} 11px Vazirmatn, sans-serif`;
      const w = ctx.measureText(text).width + 16;
      const h = 20;
      const rx = x - w / 2;
      const ry = y;
      roundRectPath(ctx, rx, ry, w, h, 10);
      ctx.fillStyle = strong ? "rgba(22,8,48,0.9)" : "rgba(22,8,48,0.68)";
      ctx.fill();
      ctx.strokeStyle = strong ? color : "rgba(168,140,255,0.32)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = strong ? "#f4f7ff" : "#c3d0ee";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, ry + h / 2 + 0.5);
    };

    /* ---- cute little rocket ---- */
    const drawRocket = (x: number, y: number, ang: number, tt: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      const fl = 16 + Math.sin(tt * 42) * 6 + Math.random() * 3;
      const fg = ctx.createLinearGradient(-12, 0, -12 - fl, 0);
      fg.addColorStop(0, "rgba(255,230,150,0.95)");
      fg.addColorStop(0.4, "rgba(255,150,60,0.8)");
      fg.addColorStop(1, "rgba(255,90,40,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-11, -3.4);
      ctx.lineTo(-11 - fl, 0);
      ctx.lineTo(-11, 3.4);
      ctx.closePath();
      ctx.fill();
      const bg = ctx.createLinearGradient(0, -5, 0, 5);
      bg.addColorStop(0, "#f4f0ff");
      bg.addColorStop(1, "#b9a8d8");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.quadraticCurveTo(8, -6.5, -6, -5);
      ctx.lineTo(-11, -3.4);
      ctx.lineTo(-11, 3.4);
      ctx.lineTo(-6, 5);
      ctx.quadraticCurveTo(8, 6.5, 16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff5d8f";
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.quadraticCurveTo(11, -4.6, 7, -5.4);
      ctx.lineTo(7, 5.4);
      ctx.quadraticCurveTo(11, 4.6, 16, 0);
      ctx.fill();
      ctx.fillStyle = "#7ee8fa";
      ctx.strokeStyle = "#4a3a6e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(1, 0, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ff5d8f";
      ctx.beginPath();
      ctx.moveTo(-6, -5); ctx.lineTo(-13, -10); ctx.lineTo(-11, -3.4); ctx.closePath();
      ctx.moveTo(-6, 5); ctx.lineTo(-13, 10); ctx.lineTo(-11, 3.4); ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    /* ---- friendly alien in a UFO ---- */
    const drawAlien = (x: number, y: number, t: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 1.7) * 0.07);

      /* abduction beam, every now and then */
      const beamPhase = t % 11;
      if (beamPhase < 3) {
        const bk = Math.sin((beamPhase / 3) * Math.PI);
        const bg = ctx.createLinearGradient(0, 8, 0, 92);
        bg.addColorStop(0, `rgba(140,255,230,${0.3 * bk})`);
        bg.addColorStop(1, "rgba(140,255,230,0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(-30, 92);
        ctx.lineTo(30, 92);
        ctx.lineTo(10, 8);
        ctx.closePath();
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const py = 84 - ((t * 30 + i * 26) % 74);
          ctx.fillStyle = `rgba(200,255,240,${0.5 * bk})`;
          ctx.beginPath();
          ctx.arc(Math.sin(t * 3 + i) * 8, py, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* saucer body */
      const sg = ctx.createLinearGradient(0, -4, 0, 12);
      sg.addColorStop(0, "#cfc3ec");
      sg.addColorStop(0.5, "#8d7fb5");
      sg.addColorStop(1, "#4e4370");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(0, 4, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(30,20,50,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* blinking rim lights */
      const lightColors = ["#ff5d8f", "#7ee8fa", "#ffd166"];
      for (let i = 0; i < 5; i++) {
        const lx = -24 + i * 12;
        const on = Math.sin(t * 6 + i * 1.7) > -0.2;
        ctx.fillStyle = on ? lightColors[i % 3] : "rgba(60,50,90,0.8)";
        ctx.beginPath();
        ctx.arc(lx, 8.5, 2.1, 0, Math.PI * 2);
        ctx.fill();
        if (on) {
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.arc(lx, 8.5, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      /* glass dome */
      ctx.fillStyle = "rgba(170,220,255,0.22)";
      ctx.strokeStyle = "rgba(200,235,255,0.65)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 2, 15, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      /* alien head */
      ctx.fillStyle = "#7ee08a";
      ctx.beginPath();
      ctx.ellipse(0, -5, 7.5, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5cbf6b";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-3, -12); ctx.quadraticCurveTo(-6, -18, -7, -20);
      ctx.moveTo(3, -12); ctx.quadraticCurveTo(6, -18, 7, -20);
      ctx.stroke();
      ctx.fillStyle = "#ff5d8f";
      ctx.beginPath(); ctx.arc(-7, -20.5, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7ee8fa";
      ctx.beginPath(); ctx.arc(7, -20.5, 1.8, 0, Math.PI * 2); ctx.fill();

      /* big curious eyes looking around */
      const look = Math.sin(t * 0.9) * 1.6;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.ellipse(-3, -6, 2.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3, -6, 2.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1c1030";
      ctx.beginPath(); ctx.arc(-3 + look, -5.6, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3 + look, -5.6, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#2e7d43";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(0, -2.4, 2.6, 0.25, Math.PI - 0.25);
      ctx.stroke();

      ctx.restore();
    };

    const draw = (t: number) => {
      const p = propsRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, sim.w, sim.h);

      /* stars */
      for (const st of sim.stars) {
        const a = clamp(st.baseA + st.twA * Math.sin(t * st.twS + st.ph), 0.04, 1);
        ctx.globalAlpha = a;
        ctx.fillStyle = st.c;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* meteors */
      if (t > sim.nextMeteor) {
        sim.nextMeteor = t + 6 + Math.random() * 9;
        sim.meteors.push({
          x: sim.w * (0.15 + Math.random() * 0.75),
          y: sim.h * Math.random() * 0.3,
          vx: -(280 + Math.random() * 260),
          vy: 130 + Math.random() * 150,
          life: 0, max: 0.85 + Math.random() * 0.5,
        });
      }
      sim.meteors = sim.meteors.filter((m) => m.life < m.max);
      for (const m of sim.meteors) {
        const k = 1 - m.life / m.max;
        const tailX = m.x - m.vx * 0.16;
        const tailY = m.y - m.vy * 0.16;
        const g = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        g.addColorStop(0, `rgba(235,242,255,${0.85 * k})`);
        g.addColorStop(1, "rgba(235,242,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      /* big comets (background) */
      for (const c of sim.comets) {
        const k = 1 - c.life / c.max;
        const tx = c.x - c.vx * 0.5;
        const ty = c.y - c.vy * 0.5;
        const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
        g.addColorStop(0, `rgba(150,240,255,${0.8 * k})`);
        g.addColorStop(0.45, `rgba(190,140,255,${0.4 * k})`);
        g.addColorStop(1, "rgba(190,140,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        const halo = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 9);
        halo.addColorStop(0, `rgba(230,250,255,${0.9 * k})`);
        halo.addColorStop(1, "rgba(230,250,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      /* twinkling star sparkles */
      for (const spk of sim.sparkles) {
        const k = Math.sin((spk.life / spk.max) * Math.PI);
        ctx.save();
        ctx.translate(spk.x, spk.y);
        ctx.rotate(spk.life * 2);
        ctx.strokeStyle = spk.c;
        ctx.globalAlpha = 0.85 * k;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-spk.r, 0); ctx.lineTo(spk.r, 0);
        ctx.moveTo(0, -spk.r); ctx.lineTo(0, spk.r);
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      const { cx, cy } = sim;
      const s = sim.scale;

      /* orbit paths */
      if (p.showOrbits) {
        for (const b of PLANETS) {
          const sel = p.selectedId === b.id;
          ctx.beginPath();
          ctx.arc(cx, cy, b.orbitR * s, 0, Math.PI * 2);
          ctx.strokeStyle = sel ? b.color : "rgba(178,150,255,0.2)";
          ctx.globalAlpha = sel ? 0.6 : 1;
          ctx.lineWidth = sel ? 1.5 : 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } else if (p.selectedId) {
        const b = BODIES.find((x) => x.id === p.selectedId);
        if (b && b.orbitR) {
          ctx.beginPath();
          ctx.arc(cx, cy, b.orbitR * s, 0, Math.PI * 2);
          ctx.strokeStyle = b.color;
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      sim.hits = [];

      /* Sun */
      const sunPx = drawSun(t);
      sim.hits.push({ id: "sun", x: cx, y: cy, r: sunPx + 8 });

      /* planets */
      for (const b of PLANETS) {
        const ang = bodyAngle(b.periodDays!, b.phase);
        const R = b.orbitR * s;
        const x = cx + Math.cos(ang) * R;
        const y = cy + Math.sin(ang) * R;
        const rPx = Math.max(b.sizeR * s * 1.15, 2.6);
        const sel = p.selectedId === b.id;
        const hov = sim.hoverId === b.id;

        /* motion trail */
        if (p.showTrails && b.periodDays) {
          const omega = ((Math.PI * 2) / b.periodDays) * p.speed;
          const len = clamp(omega * 0.5, 0.15, 1.6);
          const N = 10;
          ctx.lineWidth = Math.max(2, rPx * 0.55);
          ctx.lineCap = "round";
          for (let k = 0; k < N; k++) {
            ctx.beginPath();
            ctx.arc(cx, cy, R, ang + (len * k) / N, ang + (len * (k + 1)) / N);
            ctx.strokeStyle = b.color;
            ctx.globalAlpha = ((k + 1) / N) * 0.34;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        /* saturn rings (back half) */
        if (b.ring) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.42);
          ctx.scale(1, 0.36);
          ctx.strokeStyle = "#cdb488";
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = Math.max(1.6, rPx * 0.28);
          ctx.beginPath();
          ctx.arc(0, 0, rPx * 1.75, Math.PI, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = Math.max(1, rPx * 0.14);
          ctx.beginPath();
          ctx.arc(0, 0, rPx * 2.1, Math.PI, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        /* shaded sphere, lit toward the Sun */
        const lx = x - Math.cos(ang) * rPx * 0.45;
        const ly = y - Math.sin(ang) * rPx * 0.45;
        const g = ctx.createRadialGradient(lx, ly, rPx * 0.1, x, y, rPx);
        g.addColorStop(0, lighten(b.color));
        g.addColorStop(0.55, b.color);
        g.addColorStop(1, b.colorDeep);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rPx, 0, Math.PI * 2);
        ctx.fill();

        /* jupiter bands */
        if (b.id === "jupiter" && rPx > 8) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, rPx, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = "rgba(112,66,30,0.3)";
          ctx.fillRect(x - rPx, y - rPx * 0.42, rPx * 2, rPx * 0.22);
          ctx.fillRect(x - rPx, y + rPx * 0.12, rPx * 2, rPx * 0.26);
          ctx.fillStyle = "rgba(255,225,180,0.22)";
          ctx.fillRect(x - rPx, y - rPx * 0.12, rPx * 2, rPx * 0.16);
          ctx.restore();
        }

        /* earth's moon */
        if (b.id === "earth") {
          const mAng = b.phase - (Math.PI * 2 * sim.elapsed) / 27.3;
          const mDist = rPx + Math.max(5, 9 * s);
          const mx = x + Math.cos(mAng) * mDist;
          const my = y + Math.sin(mAng) * mDist;
          ctx.fillStyle = "#c9d4e8";
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(1.5, 2.3 * s), 0, Math.PI * 2);
          ctx.fill();
        }

        /* saturn rings (front half) */
        if (b.ring) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.42);
          ctx.scale(1, 0.36);
          ctx.strokeStyle = "#e0c896";
          ctx.globalAlpha = 0.8;
          ctx.lineWidth = Math.max(1.6, rPx * 0.28);
          ctx.beginPath();
          ctx.arc(0, 0, rPx * 1.75, 0, Math.PI);
          ctx.stroke();
          ctx.globalAlpha = 0.42;
          ctx.lineWidth = Math.max(1, rPx * 0.14);
          ctx.beginPath();
          ctx.arc(0, 0, rPx * 2.1, 0, Math.PI);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        /* hover / selection rings */
        if (sel) {
          const rr = rPx + 6.5 + Math.sin(t * 2.6) * 1.3;
          ctx.save();
          ctx.setLineDash([5, 6]);
          ctx.lineDashOffset = -t * 16;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(x, y, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          const glow = ctx.createRadialGradient(x, y, rPx, x, y, rPx + 16);
          glow.addColorStop(0, hexA(b.color, 0.35));
          glow.addColorStop(1, hexA(b.color, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, rPx + 16, 0, Math.PI * 2);
          ctx.fill();
        } else if (hov) {
          ctx.strokeStyle = hexA(b.color, 0.75);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(x, y, rPx + 5.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        sim.hits.push({ id: b.id, x, y, r: Math.max(rPx + 9, 15) });

        /* label */
        if (p.showLabels || sel || hov) {
          drawLabel(
            b.name,
            x,
            y + rPx + (b.ring ? rPx * 0.55 : 0) + 8,
            b.color,
            sel
          );
        }
      }

      /* sun label */
      if (p.showLabels || p.selectedId === "sun" || sim.hoverId === "sun") {
        drawLabel("خورشید", cx, cy + sunPx + 10, "#ffc24b", p.selectedId === "sun");
      }

      /* ---- playful foreground: tumbling asteroids ---- */
      for (const ast of sim.asteroids) {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rot);
        const ag = ctx.createRadialGradient(-ast.r * 0.35, -ast.r * 0.35, ast.r * 0.1, 0, 0, ast.r);
        ag.addColorStop(0, "#a89a8c");
        ag.addColorStop(1, "#5c534c");
        ctx.fillStyle = ag;
        ctx.beginPath();
        ast.verts.forEach((vr, i) => {
          const ang = (i / ast.verts.length) * Math.PI * 2;
          const px = Math.cos(ang) * vr * ast.r;
          const py = Math.sin(ang) * vr * ast.r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(50,42,38,0.5)";
        for (const cr of ast.craters) {
          ctx.beginPath();
          ctx.arc(cr.dx * ast.r, cr.dy * ast.r, cr.r * ast.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      /* rockets flying by */
      for (let i = 0; i < sim.rockets.length; i++) {
        const r = sim.rockets[i];
        drawRocket(r.x, r.y, r.ang, t + i * 3);
      }

      /* the friendly alien, always patrolling */
      drawAlien(sim.alien.x, sim.alien.y, t);
    };

    /* ---------- animation loop ---------- */
    const step = (nowMs: number) => {
      const t = nowMs / 1000;
      const p = propsRef.current;
      const sim = simRef.current;
      if (!sim.last) sim.last = t;
      const dt = clamp(t - sim.last, 0, 0.05);
      sim.last = t;

      if (p.playing) sim.elapsed += p.speed * dt;
      for (const m of sim.meteors) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.life += dt;
      }

      /* ---- playful entities ---- */
      const al = sim.alien;
      al.x += al.vx * dt;
      if (al.x > sim.w + 160) {
        al.x = -160;
        al.baseY = 50 + Math.random() * Math.max(70, sim.h * 0.3);
        al.vx = 26 + Math.random() * 34;
      }
      al.y = al.baseY + Math.sin(t * 1.1) * 22;

      for (const ast of sim.asteroids) {
        ast.x += ast.vx * dt;
        ast.y += ast.vy * dt;
        ast.rot += ast.vr * dt;
        if (ast.x < -60) ast.x = sim.w + 55;
        if (ast.x > sim.w + 60) ast.x = -55;
        if (ast.y < -60) ast.y = sim.h + 55;
        if (ast.y > sim.h + 60) ast.y = -55;
      }

      if (t > sim.nextRocket) {
        sim.nextRocket = t + 14 + Math.random() * 12;
        const fromLeft = Math.random() > 0.5;
        const sp = 130 + Math.random() * 80;
        const vy = (Math.random() - 0.6) * 60;
        const vx = fromLeft ? sp : -sp;
        sim.rockets.push({
          x: fromLeft ? -40 : sim.w + 40,
          y: sim.h * (0.12 + Math.random() * 0.5),
          vx, vy,
          ang: Math.atan2(vy, vx),
        });
      }
      for (const r of sim.rockets) {
        r.x += r.vx * dt;
        r.y += r.vy * dt;
      }
      sim.rockets = sim.rockets.filter((r) => r.x > -90 && r.x < sim.w + 90);

      if (t > sim.nextComet) {
        sim.nextComet = t + 9 + Math.random() * 8;
        sim.comets.push({
          x: sim.w * (0.2 + Math.random() * 0.7),
          y: -20,
          vx: -(120 + Math.random() * 120),
          vy: 90 + Math.random() * 90,
          life: 0,
          max: 2.2 + Math.random() * 1.2,
        });
      }
      for (const c of sim.comets) {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.life += dt;
      }
      sim.comets = sim.comets.filter((c) => c.life < c.max && c.y < sim.h + 40);

      if (t > sim.nextSparkle && sim.stars.length > 0) {
        sim.nextSparkle = t + 1.6 + Math.random() * 2;
        const st = sim.stars[Math.floor(Math.random() * sim.stars.length)];
        sim.sparkles.push({
          x: st.x, y: st.y, life: 0, max: 0.9,
          r: 4 + Math.random() * 5,
          c: Math.random() > 0.5 ? "#e9dcff" : "#ffe9c4",
        });
      }
      for (const spk of sim.sparkles) spk.life += dt;
      sim.sparkles = sim.sparkles.filter((spk) => spk.life < spk.max);

      const tc = targetCenter();
      const ts = targetScale();
      const k = 1 - Math.exp(-dt * 3.2);
      sim.cx += (tc.x - sim.cx) * k;
      sim.cy += (tc.y - sim.cy) * k;
      sim.scale += (ts - sim.scale) * k;

      draw(t);

      if (nowMs - sim.lastSent > 160) {
        sim.lastSent = nowMs;
        p.onElapsed(sim.elapsed);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    /* ---------- pointer interaction ---------- */
    const pick = (mx: number, my: number): Hit | null => {
      let best: Hit | null = null;
      let bestD = Infinity;
      for (const h of sim.hits) {
        const d = Math.hypot(mx - h.x, my - h.y);
        if (d < h.r && d < bestD) {
          best = h;
          bestD = d;
        }
      }
      return best;
    };

    const toLocal = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { mx: e.clientX - rect.left, my: e.clientY - rect.top };
    };

    const onMove = (e: MouseEvent) => {
      const { mx, my } = toLocal(e);
      const hit = pick(mx, my);
      sim.hoverId = hit ? hit.id : null;
      canvas.style.cursor = hit ? "pointer" : "default";

      const tip = tipRef.current;
      if (tip) {
        if (hit) {
          const b = BODIES.find((x) => x.id === hit.id)!;
          if (tipTitleRef.current) tipTitleRef.current.textContent = b.name;
          if (tipSubRef.current)
            tipSubRef.current.textContent =
              propsRef.current.selectedId === hit.id ? b.typeLabel : "برای مشاهدهٔ مشخصات کلیک کنید";
          tip.style.left = `${hit.x}px`;
          tip.style.top = `${hit.y - hit.r - 6}px`;
          tip.style.opacity = "1";
        } else {
          tip.style.opacity = "0";
        }
      }
    };

    const onLeave = () => {
      sim.hoverId = null;
      if (tipRef.current) tipRef.current.style.opacity = "0";
    };

    const onClick = (e: MouseEvent) => {
      const { mx, my } = toLocal(e);
      const hit = pick(mx, my);
      propsRef.current.onSelect(hit ? hit.id : null);
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div ref={tipRef} className="canvas-tip">
        <div
          ref={tipTitleRef}
          className="font-display text-lg leading-tight text-ink drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        />
        <div ref={tipSubRef} className="text-[11px] text-ink-dim" />
      </div>
    </div>
  );
}

/* ---------- color helpers ---------- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function hexA(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function lighten(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => Math.round(v + (255 - v) * 0.55);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

export const SolarCanvas = memo(SolarCanvasInner);
