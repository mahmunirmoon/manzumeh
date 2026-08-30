import { useCallback, useEffect, useState } from "react";
import { SolarCanvas } from "./components/SolarCanvas";
import { InfoPanel } from "./components/InfoPanel";
import { ControlDock } from "./components/ControlDock";
import { BodyNav } from "./components/BodyNav";
import { getBody, type Mode } from "./data/bodies";
import {
  IconCursor,
  IconGamepad,
  IconMusic,
  IconMute,
  IconSparkle,
  IconSpeaker,
  IconSunMini,
} from "./components/Icons";
import { ModeSwitch } from "./components/ModeSwitch";
import { QuizModal } from "./components/QuizModal";
import { fmt1, toFa } from "./lib/format";
import {
  disableMusic,
  enableMusic,
  isAudioReady,
  onAudioReadyChange,
  setTrack,
  trackBpm,
  trackTitle,
  tryUnlockMusic,
} from "./lib/music";

const UNLOCK_KEY = "manzumeh-audio-unlocked";
const MODE_KEY = "manzumeh:mode";

function loadMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === "child" ? "child" : "normal";
  } catch {
    return "normal";
  }
}

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
  const [musicOn, setMusicOn] = useState(false);
  const [mode, setMode] = useState<Mode>(loadMode);
  const [quizOpen, setQuizOpen] = useState(false);
  const [audioReady, setAudioReady] = useState<boolean>(() => isAudioReady());
  const [unlockedOnce, setUnlockedOnce] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });

  /* persist the content mode (child / normal) */
  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* private mode — ignore */
    }
  }, [mode]);

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
      /* the tap itself is the user gesture — unlock right away */
      void tryUnlockMusic();
      return true;
    });
  }, [selectedId]);

  /* switch the tune whenever another body is selected (or deselected) */
  useEffect(() => {
    if (musicOn) setTrack(trackId);
  }, [musicOn, trackId]);

  /* ---------- mobile audio unlock ---------- */
  useEffect(
    () =>
      onAudioReadyChange((ready) => {
        setAudioReady(ready);
        if (ready) {
          setUnlockedOnce(true);
          try {
            sessionStorage.setItem(UNLOCK_KEY, "1");
          } catch {
            /* private mode — ignore */
          }
        }
      }),
    []
  );

  /* first real gesture anywhere on the page unlocks the AudioContext */
  useEffect(() => {
    const unlock = () => {
      void tryUnlockMusic();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const showUnlockButton = musicOn && !audioReady && !unlockedOnce;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const reset = useCallback(() => {
    setResetToken((t) => t + 1);
    setElapsed(0);
  }, []);

  const selectedBody = getBody(selectedId);

  return (
    <div
      dir="rtl"
      className="relative flex min-h-dvh w-full flex-col overflow-x-clip space-bg font-body text-ink md:h-dvh md:overflow-hidden"
    >
      {/* ambient nebulae */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="nebula nebula-a" />
        <div className="nebula nebula-b" />
        <div className="nebula nebula-c" />
      </div>

      {/* ============ 1) header / title ============ */}
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
          <ModeSwitch mode={mode} onChange={setMode} />
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
        </div>

        {/* ============ 2) author & teacher contact ============ */}
        <span className="neon-breathe order-3 w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-2 rounded-full px-3.5 py-1.5 border border-neon-400/70 text-neon-300 bg-neon-500/15">
          <IconSparkle className="w-4 h-4 shrink-0" />
          <span className="flex flex-col items-center md:items-start leading-tight text-center md:text-start">
            <span className="text-[12px] font-bold">طراحی توسط امیرعلی</span>
            <span className="text-[10.5px] font-semibold text-neon-300/85">از شاگردان خانم دکتر آقایی.</span>
            <span className="text-[10px] font-semibold text-neon-300/80 mt-0.5">
              شماره تماس استاد:{" "}
              <a
                href="tel:00971551544988"
                dir="ltr"
                className="font-extrabold text-neon-300 underline decoration-neon-400/50 underline-offset-2 hover:text-ink transition-colors"
              >
                00971551544988
              </a>
            </span>
          </span>
        </span>
      </header>

      {/* ============ 3) solar system visualization ============ */}
      <main className="relative z-10 h-[58vh] w-full shrink-0 min-h-[400px] md:h-auto md:min-h-0 md:flex-1">
        <SolarCanvas
          playing={playing}
          speed={speed}
          selectedId={selectedId}
          showOrbits={showOrbits}
          showLabels={showLabels}
          showTrails={showTrails}
          resetToken={resetToken}
          onSelect={setSelectedId}
          onElapsed={setElapsed}
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

        {/* mobile audio unlock — shown until the first gesture unlocks the context */}
        {showUnlockButton && (
          <button
            onClick={() => void tryUnlockMusic()}
            className="absolute z-20 bottom-3 left-3 md:bottom-4 md:left-4 flex items-center gap-2 rounded-full border border-comet/70 bg-space-900/92 px-4 py-2.5 text-[13px] font-extrabold text-comet shadow-[0_0_18px_rgba(111,227,212,0.35)] backdrop-blur-sm transition-transform active:scale-95"
          >
            <IconSpeaker className="w-5 h-5" />
            فعال کردن صدا
          </button>
        )}

        {/* mini-game trigger — «حدس بزن کدام سیاره است» */}
        <button
          onClick={() => setQuizOpen(true)}
          title="بازی حدس بزن کدام سیاره است"
          className={`absolute z-20 ${showUnlockButton ? "bottom-[64px] md:bottom-[72px]" : "bottom-3 md:bottom-4"} left-3 md:left-4
            flex items-center gap-2 rounded-full border border-neon-400/60 bg-space-900/85 backdrop-blur-sm px-3 py-2.5
            text-[12.5px] font-extrabold text-neon-300 shadow-[0_8px_28px_rgba(154,69,245,0.28)]
            hover:border-neon-300 hover:text-ink hover:-translate-y-px active:translate-y-0 transition-all duration-200`}
        >
          <IconGamepad className="w-5 h-5 text-solar-400 shrink-0" />
          <span className="hidden min-[380px]:inline">بازی حدس سیاره</span>
        </button>

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
      </main>

      {/* ============ 5) selected planet info card
           (normal document-flow card on mobile, overlay sidebar on desktop) ============ */}
      <InfoPanel
        key={selectedId ?? "none"}
        body={selectedBody}
        onClose={() => setSelectedId(null)}
        mode={mode}
        musicPlaying={musicOn && !!selectedId}
        musicTitle={musicTitle}
      />

      {/* ============ mini-game: «حدس بزن کدام سیاره است» ============ */}
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} mode={mode} />

      {/* ============ 4/6/7/8) planet selector + simulation controls ============ */}
      <footer
        className="relative z-20 w-full shrink-0 flex flex-col items-center gap-2 px-2 sm:px-3 md:px-0 pt-1
          pb-[calc(0.625rem+env(safe-area-inset-bottom))] md:pb-2.5"
      >
        {/* 4) planet selector — touch-scrollable, never overlays anything */}
        <div className="pointer-events-auto w-full max-w-full rise-in" style={{ animationDelay: "0.15s" }}>
          <BodyNav selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* 6-8) transport / stats / speed / view toggles */}
        <div className="pointer-events-auto w-full max-w-[1100px] rise-in" style={{ animationDelay: "0.25s" }}>
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
            onToggle={(k) =>
              k === "orbits" ? setShowOrbits((v) => !v) : k === "labels" ? setShowLabels((v) => !v) : setShowTrails((v) => !v)
            }
          />
        </div>

        {/* keyboard hints — desktop only */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-ink-faint">
          <Kbd>Space</Kbd> پخش/توقف
          <Kbd>R</Kbd> شروع دوباره
          <Kbd>Esc</Kbd> بستن پنل
        </div>
      </footer>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border border-space-600/70 bg-space-900/70 text-ink-dim text-[10.5px]">
      {children}
    </kbd>
  );
}
