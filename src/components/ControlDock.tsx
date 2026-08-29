import { fmt1, fmtInt, toFa } from "../lib/format";
import {
  IconOrbit,
  IconPause,
  IconPlay,
  IconReset,
  IconTag,
  IconTrail,
} from "./Icons";

const SPEED_MIN = 0.5;
const SPEED_MAX = 730;
const SPEED_RATIO = SPEED_MAX / SPEED_MIN;

export function speedToSlider(speed: number): number {
  return (Math.log(speed / SPEED_MIN) / Math.log(SPEED_RATIO)) * 1000;
}
export function sliderToSpeed(pos: number): number {
  return SPEED_MIN * Math.pow(SPEED_RATIO, pos / 1000);
}

const PRESETS = [1, 5, 20, 100, 365];

interface Props {
  playing: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  elapsed: number;
  showOrbits: boolean;
  showLabels: boolean;
  showTrails: boolean;
  onToggle: (key: "orbits" | "labels" | "trails") => void;
}

function Toggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13px] font-bold transition-all duration-200
        ${
          active
            ? "border-solar-400/70 text-solar-300 bg-solar-400/10 shadow-[0_0_14px_rgba(255,194,75,0.15)]"
            : "border-space-600/70 text-ink-dim hover:text-ink hover:border-space-600"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function ControlDock(p: Props) {
  const sliderPos = speedToSlider(p.speed);
  const yearsPerMinute = (p.speed * 60) / 365.25;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 px-4 md:px-6 py-3 rounded-2xl border border-space-600/70 bg-space-900/82 backdrop-blur-md shadow-[0_14px_50px_rgba(0,0,0,0.5)]">
      {/* transport */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={p.onTogglePlay}
          aria-label={p.playing ? "توقف" : "پخش"}
          className="w-12 h-12 grid place-items-center rounded-full text-space-950 transition-transform duration-150 hover:scale-105 active:scale-95
            bg-gradient-to-b from-solar-300 to-solar-500 shadow-[0_0_22px_rgba(255,170,50,0.45)]"
        >
          {p.playing ? (
            <IconPause className="w-5 h-5" />
          ) : (
            <IconPlay className="w-5 h-5 -ml-0.5" />
          )}
        </button>
        <button
          onClick={p.onReset}
          aria-label="شروع دوباره"
          title="شروع دوبارهٔ زمان"
          className="w-10 h-10 grid place-items-center rounded-full border border-space-600/80 text-ink-dim hover:text-solar-300 hover:border-solar-400/60 hover:rotate-[-40deg] transition-all duration-300"
        >
          <IconReset className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* elapsed */}
      <div className="text-center min-w-[140px]">
        <div className="font-display text-[32px] leading-none text-solar-300 tabular-nums drop-shadow-[0_0_12px_rgba(255,170,60,0.45)]">
          {fmtInt(p.elapsed)}
          <span className="text-sm font-bold text-ink font-body mr-2">روز گذشته</span>
        </div>
        <div className="text-xs font-bold text-neon-300 mt-1">
          ≈ {fmt1(p.elapsed / 365.25)} سال زمینی
        </div>
      </div>

      <div className="hidden md:block w-px h-10 bg-space-600/60" />

      {/* speed */}
      <div className="flex flex-col gap-1.5 w-56">
        <div className="flex items-center justify-between text-[13px] font-bold">
          <span className="text-ink">سرعت شبیه‌سازی</span>
          <span className="text-solar-300 font-extrabold text-[14px]">
            {p.speed < 10 ? fmt1(p.speed) : fmtInt(p.speed)} روز / ثانیه
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={sliderPos}
          onChange={(e) => p.onSpeedChange(sliderToSpeed(Number(e.target.value)))}
          className="speed-slider w-full"
          style={{ "--fill": `${sliderPos / 10}%` } as React.CSSProperties}
          aria-label="سرعت شبیه‌سازی"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => p.onSpeedChange(v)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                  Math.abs(p.speed - v) < 0.01
                    ? "border-solar-400/70 text-solar-300 bg-solar-400/10"
                    : "border-space-600/60 text-ink-faint hover:text-ink"
                }`}
              >
                {toFa(v)}×
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-neon-300">≈ {fmt1(yearsPerMinute)} سال در دقیقه</span>
        </div>
      </div>

      <div className="hidden md:block w-px h-10 bg-space-600/60" />

      {/* view toggles */}
      <div className="flex items-center gap-1.5">
        <Toggle
          active={p.showOrbits}
          onClick={() => p.onToggle("orbits")}
          icon={<IconOrbit className="w-4 h-4" />}
          label="مدارها"
        />
        <Toggle
          active={p.showLabels}
          onClick={() => p.onToggle("labels")}
          icon={<IconTag className="w-4 h-4" />}
          label="برچسب‌ها"
        />
        <Toggle
          active={p.showTrails}
          onClick={() => p.onToggle("trails")}
          icon={<IconTrail className="w-4 h-4" />}
          label="دنباله‌ها"
        />
      </div>
    </div>
  );
}
