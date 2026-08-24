import { useCallback, useEffect, useMemo, useState } from "react";
import { SolarCanvas } from "./components/SolarCanvas";
import { InfoPanel } from "./components/InfoPanel";
import { ControlDock } from "./components/ControlDock";
import { BodyNav } from "./components/BodyNav";
import { getBody } from "./data/bodies";
import { IconCursor, IconSparkle, IconSunMini } from "./components/Icons";
import { fmt1, toFa } from "./lib/format";

export default function App() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [resetToken, setResetToken] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hintSeen, setHintSeen] = useState(false);

  const selectedBody = useMemo(() => getBody(selectedId), [selectedId]);

  const handleElapsed = useCallback((days: number) => setElapsed(days), []);
  const handleSelect = useCallback((id: string | null) => {
    setSelectedId((prev) => (id && prev === id ? prev : id));
    if (id) setHintSeen(true);
  }, []);

  const togglePlay = useCallback(() => setPlaying((v) => !v), []);
  const reset = useCallback(() => {
    setResetToken((t) => t + 1);
  }, []);
  const onToggle = useCallback((key: "orbits" | "labels" | "trails") => {
    if (key === "orbits") setShowOrbits((v) => !v);
    if (key === "labels") setShowLabels((v) => !v);
    if (key === "trails") setShowTrails((v) => !v);
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyR") {
        reset();
      } else if (e.code === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, reset]);

  return (
    <div dir="rtl" className="relative h-dvh w-full overflow-hidden flex flex-col space-bg text-ink font-body">
      {/* ambient nebulae */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="nebula nebula-a" />
        <div className="nebula nebula-b" />
        <div className="nebula nebula-c" />
      </div>

      {/* header */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-6 pt-3 pb-1 shrink-0">
        <div className="rise-in flex items-center gap-3">
          <span className="text-solar-400">
            <IconSunMini className="w-9 h-9 spin-slow" />
          </span>
          <div>
            <h1 className="font-display text-2xl md:text-3xl leading-none text-ink">
              منظومهٔ شمسی
            </h1>
            <p className="text-[11px] text-ink-dim mt-1">
              آزمایشگاه تعاملی مدارها · خورشید و هشت سیاره
            </p>
          </div>
        </div>
        <div className="rise-in flex items-center gap-2" style={{ animationDelay: "0.1s" }}>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-ink-dim border border-space-600/60 rounded-full px-3 py-1.5 bg-space-900/60">
            سرعت:
            <b className="text-solar-300">{speed < 10 ? fmt1(speed) : toFa(Math.round(speed))}</b>
            روز/ثانیه
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-3 py-1.5 border
              ${playing
                ? "text-solar-300 border-solar-400/50 bg-solar-400/10"
                : "text-ink-dim border-space-600/60 bg-space-900/60"}`}
          >
            <span className={`w-2 h-2 rounded-full ${playing ? "bg-solar-400 pulse-dot" : "bg-ink-faint"}`} />
            {playing ? "در حال گردش" : "متوقف"}
          </span>
          <span className="neon-breathe inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3.5 py-1.5 border border-neon-400/70 text-neon-300 bg-neon-500/15">
            <IconSparkle className="w-4 h-4" />
            طراحی شده توسط ماه منیر.
          </span>
        </div>
      </header>

      {/* simulation stage */}
      <main className="relative z-10 flex-1 min-h-0">
        <SolarCanvas
          playing={playing}
          speed={speed}
          selectedId={selectedId}
          onSelect={handleSelect}
          showOrbits={showOrbits}
          showLabels={showLabels}
          showTrails={showTrails}
          resetToken={resetToken}
          onElapsed={handleElapsed}
        />

        {/* first-run hint */}
        {!hintSeen && !selectedId && (
          <button
            onClick={() => setHintSeen(true)}
            className="float-hint absolute z-20 top-5 left-1/2 flex items-center gap-2 text-[12px] text-ink-dim
              border border-space-600/70 bg-space-900/75 backdrop-blur-sm rounded-full px-4 py-2
              hover:text-ink hover:border-solar-400/50 transition-colors"
          >
            <IconCursor className="w-4 h-4 text-solar-400" />
            روی خورشید یا هر سیاره کلیک کنید تا مشخصاتش را ببینید
          </button>
        )}

        <InfoPanel key={selectedId ?? "none"} body={selectedBody} onClose={() => setSelectedId(null)} />
      </main>

      {/* footer: quick-nav + control dock */}
      <footer className="relative z-20 shrink-0 pb-2.5 pt-1 flex flex-col items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto max-w-full rise-in" style={{ animationDelay: "0.15s" }}>
          <BodyNav selectedId={selectedId} onSelect={(id) => handleSelect(id)} />
        </div>
        <div className="pointer-events-auto max-w-full px-2 rise-in" style={{ animationDelay: "0.22s" }}>
          <ControlDock
            playing={playing}
            onTogglePlay={togglePlay}
            onReset={reset}
            speed={speed}
            onSpeedChange={setSpeed}
            elapsed={elapsed}
            showOrbits={showOrbits}
            showLabels={showLabels}
            showTrails={showTrails}
            onToggle={onToggle}
          />
        </div>
        <p className="pointer-events-none text-[10px] text-ink-faint hidden md:block">
          کلید Space: پخش/توقف · R: شروع دوباره · Esc: بستن پنل · اندازه‌ها و فاصله‌ها برای نمایش بهتر مقیاس‌بندی شده‌اند
        </p>
      </footer>
    </div>
  );
}
