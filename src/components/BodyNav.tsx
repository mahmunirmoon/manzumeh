import { BODIES } from "../data/bodies";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BodyNav({ selectedId, onSelect }: Props) {
  return (
    <nav
      aria-label="انتخاب سریع سیاره"
      className="flex items-center gap-1.5 overflow-x-auto thin-scroll px-3 py-1 max-w-full"
    >
      {BODIES.map((b) => {
        const active = selectedId === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-extrabold transition-all duration-200
              ${
                active
                  ? "border-transparent bg-space-700/95 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                  : "text-ink/80 border-space-600/60 hover:text-ink hover:border-neon-400/50 bg-space-900/60"
              }`}
            style={active ? { boxShadow: `0 0 0 1.5px ${b.color}aa, 0 4px 18px ${b.color}44`, color: b.color } : undefined}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                background: b.kind === "star"
                  ? "radial-gradient(circle at 35% 35%, #fff3d0, #ff9d2e)"
                  : `radial-gradient(circle at 35% 35%, ${b.color}, ${b.colorDeep})`,
                boxShadow: b.kind === "star" ? "0 0 8px rgba(255,170,60,0.8)" : `0 0 6px ${b.color}66`,
              }}
            />
            {b.name}
          </button>
        );
      })}
    </nav>
  );
}
