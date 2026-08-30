import { useCallback, useEffect, useState } from "react";
import type { Mode } from "../data/bodies";
import { buildQuiz, QUIZ_SIZE, scoreMessage, type QuizQuestion } from "../data/quiz";
import { toFa } from "../lib/format";
import { IconCheck, IconClose, IconGamepad } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: Mode;
}

/** «حدس بزن کدام سیاره است» — a light 5-question guessing game. */
export function QuizModal({ open, onClose, mode }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const start = useCallback(() => {
    setQuestions(buildQuiz(mode));
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }, [mode]);

  /* fresh quiz every time the modal opens (or the mode changes while open) */
  useEffect(() => {
    if (open) start();
  }, [open, start]);

  /* Esc closes the game */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || questions.length === 0) return null;

  const q = questions[qIndex];
  const answered = selected !== null;

  const choose = (id: string) => {
    if (answered) return;
    setSelected(id);
    if (id === q.planet.id) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="بازی حدس بزن کدام سیاره است">
      <div className="absolute inset-0 bg-[#07021a]/78 backdrop-blur-sm" onClick={onClose} />

      <div
        className="panel-in absolute inset-x-3 bottom-3 sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md
          max-h-[88dvh] overflow-y-auto thin-scroll rounded-2xl border border-neon-400/40 bg-space-900/96 backdrop-blur-md
          shadow-[0_20px_70px_rgba(0,0,0,0.65)]"
      >
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4 pb-3 border-b border-space-600/50 bg-space-900/96 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <IconGamepad className="w-6 h-6 text-solar-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-display text-xl leading-none text-ink">حدس بزن کدام سیاره است</div>
              <div className="text-[11px] font-bold text-ink-dim mt-1">
                {finished ? "نتیجهٔ بازی" : `سؤال ${toFa(qIndex + 1)} از ${toFa(QUIZ_SIZE)}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11.5px] font-extrabold text-neon-300 border border-neon-400/50 bg-neon-500/10 rounded-full px-2.5 py-1">
              امتیاز: {toFa(score)}
            </span>
            <button
              onClick={onClose}
              aria-label="خروج از بازی"
              className="w-10 h-10 grid place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-space-600/60 transition-colors"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {finished ? (
          /* ---------- final score ---------- */
          <div className="p-5 text-center rise-in">
            <div className="font-display text-[54px] leading-none glow-amber">
              {toFa(score)}
              <span className="text-[24px] text-ink-dim"> از {toFa(QUIZ_SIZE)}</span>
            </div>
            <p className="mt-3 text-sm font-extrabold text-ink leading-7">{scoreMessage(score, mode)}</p>
            <p className="mt-1 text-xs font-bold text-ink-dim">
              از {toFa(QUIZ_SIZE)} سؤال، {toFa(score)} پاسخ درست دادی.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                onClick={start}
                className="rounded-full px-6 py-2.5 min-h-[44px] text-[13.5px] font-extrabold bg-gradient-to-b from-solar-300 to-solar-500 text-space-950 shadow-[0_0_18px_rgba(255,170,50,0.4)] hover:scale-[1.04] active:scale-95 transition-transform"
              >
                شروع دوباره
              </button>
              <button
                onClick={onClose}
                className="rounded-full px-6 py-2.5 min-h-[44px] text-[13.5px] font-extrabold border border-space-600/70 text-ink-dim hover:text-ink hover:border-space-600 transition-colors"
              >
                خروج
              </button>
            </div>
          </div>
        ) : (
          /* ---------- question ---------- */
          <div className="p-4">
            {/* progress */}
            <div className="flex gap-1.5 mb-4" aria-hidden="true">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i < qIndex ? "bg-solar-400" : i === qIndex ? "bg-neon-400" : "bg-space-600/60"
                  }`}
                />
              ))}
            </div>

            {/* hints */}
            <div className="text-xs font-extrabold text-neon-300 mb-2">سرنخ‌ها:</div>
            <ul className="space-y-1.5 mb-4">
              {q.hints.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-[13.5px] font-bold text-ink leading-6">
                  <span className="shrink-0 w-5 h-5 grid place-items-center rounded-full bg-neon-500/25 text-neon-300 text-[11px] font-extrabold mt-0.5">
                    {toFa(i + 1)}
                  </span>
                  {h}
                </li>
              ))}
            </ul>

            {/* options */}
            <div className="text-xs font-extrabold text-ink-dim mb-2">کدام سیاره است؟</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt) => {
                const isCorrect = answered && opt.id === q.planet.id;
                const isWrongPick = answered && selected === opt.id && opt.id !== q.planet.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => choose(opt.id)}
                    disabled={answered}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 min-h-[52px] text-sm font-extrabold text-start transition-all duration-200
                      ${
                        isCorrect
                          ? "border-emerald-400/80 bg-emerald-400/15 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.25)]"
                          : isWrongPick
                            ? "border-rose-400/80 bg-rose-400/10 text-rose-300"
                            : answered
                              ? "border-space-600/40 text-ink-faint"
                              : "border-space-600/70 bg-space-800/60 text-ink hover:border-neon-400/70 hover:bg-neon-500/10 active:scale-[0.98]"
                      }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ background: `radial-gradient(circle at 35% 35%, ${opt.color}, ${opt.colorDeep})` }}
                    />
                    {opt.name}
                    {isCorrect && <IconCheck className="w-[18px] h-[18px] ms-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* feedback */}
            {answered && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rise-in">
                <p className={`text-[13px] font-extrabold leading-6 ${selected === q.planet.id ? "text-emerald-300" : "text-rose-300"}`}>
                  {selected === q.planet.id
                    ? "آفرین! درست حدس زدی."
                    : `اشتباه بود؛ جواب درست «${q.planet.name}» بود.`}
                </p>
                <button
                  onClick={next}
                  className="shrink-0 rounded-full px-5 py-2.5 min-h-[44px] text-[13px] font-extrabold bg-gradient-to-b from-solar-300 to-solar-500 text-space-950 hover:scale-[1.03] active:scale-95 transition-transform"
                >
                  {qIndex + 1 >= questions.length ? "دیدن نتیجه" : "سؤال بعدی"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
