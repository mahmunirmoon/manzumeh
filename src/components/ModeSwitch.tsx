import type { Mode } from "../data/bodies";
import { IconBook, IconStar } from "./Icons";

/** «حالت کودک | حالت عادی» — switches how all explanatory texts are presented. */
export function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const seg = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[38px] text-[12.5px] font-extrabold border transition-all duration-200 ${
      active
        ? "bg-neon-500/30 text-neon-300 border-neon-400/60 shadow-[0_0_12px_rgba(154,69,245,0.3)]"
        : "text-ink-dim border-transparent hover:text-ink"
    }`;

  return (
    <div
      role="group"
      aria-label="حالت نمایش محتوا"
      className="inline-flex items-center gap-1 rounded-full border border-space-600/70 bg-space-900/70 p-1"
    >
      <button onClick={() => onChange("child")} aria-pressed={mode === "child"} className={seg(mode === "child")}>
        <IconStar className="w-4 h-4" />
        کودک
      </button>
      <button onClick={() => onChange("normal")} aria-pressed={mode === "normal"} className={seg(mode === "normal")}>
        <IconBook className="w-4 h-4" />
        عادی
      </button>
    </div>
  );
}
