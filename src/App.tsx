import { useCallback, useEffect, useMemo, useState } from "react";
import { SolarCanvas } from "./components/SolarCanvas";
import { InfoPanel } from "./components/InfoPanel";
import { ControlDock } from "./components/ControlDock";
import { BodyNav } from "./components/BodyNav";
import { getBody } from "./data/bodies";
import {
  IconCheck,
  IconCode,
  IconCursor,
  IconMusic,
  IconMute,
  IconServer,
  IconSparkle,
  IconSunMini,
} from "./components/Icons";
import { fmt1, toFa } from "./lib/format";
import { downloadHostReadyZip, downloadProjectZip, projectFileCount } from "./lib/projectFiles";
import { disableMusic, enableMusic, setTrack, trackBpm, trackTitle } from "./lib/music";

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
  const [zipState, setZipState] = useState<"idle" | "busy" | "done">("idle");
  const [hostState, setHostState] = useState<"idle" | "busy" | "done">("idle");
  const [musicOn, setMusicOn] = useState(false);

  const trackId = selectedId ?? "space";
  const musicTitle = trackTitle(trackId);
  const musicBpm = trackBpm(trackId);

  const toggleMusic = useCallback(() => {
    setMusicOn((on) => {
      if (on) {
        disableMusic();
        return false;
      }
      enableMusic(selectedId);
      return true;
    });
  }, [selectedId]);

  /* switch the tune whenever another body is selected (or deselected) */
  useEffect(() => {
    if (musicOn) setTrack(trackId);
  }, [musicOn, trackId]);

  const handleDownloadHost = useCallback(async () => {
    if (hostState === "busy") return;
    setHostState("busy");
    try {
      await downloadHostReadyZip();
      setHostState("done");
      setTimeout(() => setHostState("idle"), 2400);
    } catch {
      setHostState("idle");
    }
  }, [hostState]);

  const handleDownloadZip = useCallback(async () => {
    if (zipState === "busy") return;
    setZipState("busy");
    try {
      await downloadProjectZip();
      setZipState("done");
      setTimeout(() => setZipState("idle"), 2400);
    } catch {
      setZipState("idle");
    }
  }, [zipState]);

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
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 sm:px-4 md:px-6 pt-2.5 md:pt-3 pb-1 shrink-0">
        <div className="rise-in flex items-center gap-2.5 md:gap-3 min-w-0">
          <span className="text-solar-400 shrink-0">
            <IconSunMini className="w-9 h-9 md:w-11 md:h-11 spin-slow drop-shadow-[0_0_14px_rgba(255,170,60,0.65)]" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(27px,7.5vw,48px)] leading-[1.08] glow-soft">
              منظومهٔ <span className="glow-amber">شمسی</span>
            </h1>
            <p className="text-[12.5px] sm:text-sm md:text-[15.5px] font-bold text-ink/95 mt-0.5 leading-5 break-words">
              آزمایشگاه تعاملی مدارها · <span className="glow-violet">روی هر سیاره کلیک کنید</span>
            </p>
          </div>
        </div>
        <div className="rise-in order-2 flex flex-wrap items-center justify-end gap-1.5 md:gap-2" style={{ animationDelay: "0.1s" }}>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink-dim border border-space-600/60 rounded-full px-3.5 py-2 bg-space-900/60">
            سرعت:
            <b className="text-solar-300 text-[13.5px]">{speed < 10 ? fmt1(speed) : toFa(Math.round(speed))}</b>
            روز/ثانیه
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold rounded-full px-3.5 py-2 border
              ${playing
                ? "text-solar-300 border-solar-400/50 bg-solar-400/10"
                : "text-ink-dim border-space-600/60 bg-space-900/60"}`}
          >
            <span className={`w-2 h-2 rounded-full ${playing ? "bg-solar-400 pulse-dot" : "bg-ink-faint"}`} />
            {playing ? "در حال گردش" : "متوقف"}
          </span>
          <button
            onClick={handleDownloadHost}
            disabled={hostState === "busy"}
            title="دانلود نسخهٔ نهاییِ آمادهٔ آپلود روی هاست و دامنه (بدون نیاز به npm)"
            aria-label="دانلود نسخهٔ هاست"
            className={`inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3.5 py-2 md:py-1.5 border transition-all duration-200
              ${
                hostState === "done"
                  ? "border-comet/70 text-comet bg-comet/10"
                  : "border-solar-400/70 text-solar-300 bg-solar-400/10 hover:bg-solar-400/25 hover:border-solar-400 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 shadow-[0_0_16px_rgba(255,170,50,0.18)]"
              }`}
          >
            {hostState === "done" ? (
              <IconCheck className="w-4 h-4" />
            ) : (
              <IconServer className={`w-4 h-4 ${hostState === "busy" ? "animate-pulse" : ""}`} />
            )}
            <span className="hidden md:inline">
              {hostState === "done" ? "دانلود شد" : hostState === "busy" ? "در حال بسته‌بندی…" : "نسخهٔ هاست"}
            </span>
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={zipState === "busy"}
            title={`دانلود ${toFa(projectFileCount())} فایلِ منبع پروژه برای GitHub یا توسعهٔ محلی`}
            aria-label="دانلود سورس پروژه"
            className={`inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3.5 py-2 md:py-1.5 border transition-all duration-200
              ${
                zipState === "done"
                  ? "border-comet/70 text-comet bg-comet/10"
                  : "border-neon-400/60 text-neon-300 bg-neon-500/10 hover:bg-neon-500/25 hover:border-neon-400 hover:-translate-y-px active:translate-y-0 disabled:opacity-60"
              }`}
          >
            {zipState === "done" ? (
              <IconCheck className="w-4 h-4" />
            ) : (
              <IconCode className={`w-4 h-4 ${zipState === "busy" ? "animate-pulse" : ""}`} />
            )}
            <span className="hidden md:inline">
              {zipState === "done" ? "دانلود شد" : zipState === "busy" ? "در حال آماده‌سازی…" : "سورس پروژه"}
            </span>
          </button>
        </div>
        <span className="neon-breathe order-3 w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-2 rounded-full px-3.5 py-1.5 border border-neon-400/70 text-neon-300 bg-neon-500/15">
          <IconSparkle className="w-4 h-4 shrink-0" />
          <span className="flex flex-col items-center md:items-start leading-tight text-center md:text-start">
            <span className="text-[12px] font-bold">طراحی توسط امیرعلی</span>
            <span className="text-[10.5px] font-semibold text-neon-300/80">از شاگردان خانم دکتر آقایی.</span>
          </span>
        </span>
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
            className="float-hint absolute z-20 top-4 left-1/2 max-w-[calc(100%-1.75rem)] flex items-center justify-center gap-2 text-[13px] md:text-sm font-bold text-ink text-center leading-6
              border border-neon-400/60 bg-space-900/88 backdrop-blur-sm rounded-2xl md:rounded-full px-4 md:px-5 py-2.5 shadow-[0_8px_30px_rgba(154,69,245,0.35)]
              hover:border-solar-400/70 transition-colors"
          >
            <IconCursor className="w-5 h-5 text-solar-400 shrink-0" />
            روی خورشید یا هر <span className="glow-amber">سیاره</span> کلیک کنید تا مشخصات و ملودی‌اش را ببینید
          </button>
        )}

        {/* music chip — each planet has its own tune */}
        <button
          onClick={toggleMusic}
          title={musicOn ? "قطع موسیقی" : "پخش موسیقی سیاره‌ها"}
          className={`absolute z-20 bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] font-bold transition-all duration-200 hover:-translate-y-px
            ${
              musicOn
                ? "chip-glow border-neon-400/70 text-neon-300 bg-space-900/85 backdrop-blur-sm"
                : "border-space-600/70 text-ink-dim bg-space-900/75 backdrop-blur-sm hover:text-ink hover:border-neon-400/50"
            }`}
        >
          {musicOn ? (
            <>
              <span className="eq" style={{ "--eq-dur": `${(60 / musicBpm) * 2}s` } as React.CSSProperties}>
                <span /><span /><span /><span />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[11px] font-semibold text-ink-dim">در حال پخش</span>
                <span className="text-[13.5px] font-extrabold text-ink">{musicTitle}</span>
              </span>
            </>
          ) : (
            <>
              <IconMute className="w-5 h-5" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[13.5px] font-extrabold text-ink">موسیقی سیاره‌ها</span>
                <span className="text-[11px] font-semibold text-ink-faint">برای پخش کلیک کنید</span>
              </span>
            </>
          )}
        </button>

        <InfoPanel
          key={selectedId ?? "none"}
          body={selectedBody}
          onClose={() => setSelectedId(null)}
          musicPlaying={musicOn && !!selectedId}
          musicTitle={musicTitle}
        />
      </main>

      {/* footer: quick-nav + control dock */}
      <footer className="relative z-20 shrink-0 w-full pb-[max(10px,env(safe-area-inset-bottom))] pt-1 flex flex-col items-center gap-1.5 md:gap-2 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-full rise-in" style={{ animationDelay: "0.15s" }}>
          <BodyNav selectedId={selectedId} onSelect={(id) => handleSelect(id)} />
        </div>
        <div className="pointer-events-auto w-full max-w-full px-1.5 md:px-2 rise-in" style={{ animationDelay: "0.22s" }}>
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
