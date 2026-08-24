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
