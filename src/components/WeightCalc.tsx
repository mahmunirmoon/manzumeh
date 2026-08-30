import { useEffect, useState } from "react";
import type { Body, Mode } from "../data/bodies";
import { fmt1 } from "../lib/format";
import { IconScale } from "./Icons";

const LS_KEY = "manzumeh:weight";

function loadWeightText(): string {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v && Number.isFinite(Number(v)) && Number(v) > 0) return v;
  } catch {
    /* private mode — fall back to the default */
  }
  return "60";
}

/** «اگر روی این سیاره بودی...» — a tiny interactive gravity experiment. */
export function WeightCalc({ body, mode }: { body: Body; mode: Mode }) {
  const [raw, setRaw] = useState<string>(loadWeightText);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, raw);
    } catch {
      /* ignore */
    }
  }, [raw]);

  const kg = Math.max(1, Math.min(Number(raw) || 60, 1000));
  const weight = kg * body.gravity;
  const isStar = body.kind === "star";

  return (
    <section className="mt-4 p-3 rounded-lg bg-space-800/70 border border-space-600/50">
      <div className="flex items-center gap-2 text-[13px] font-extrabold text-ink">
        <IconScale className="w-[18px] h-[18px] text-neon-300" />
        اگر روی این سیاره بودی...
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <label htmlFor="weight-kg" className="text-xs font-bold text-ink-dim">
          وزن شما روی زمین (کیلوگرم)
        </label>
        <input
          id="weight-kg"
          type="number"
          inputMode="decimal"
          min={1}
          max={1000}
          dir="ltr"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="w-24 h-11 rounded-lg border border-space-600/70 bg-space-900/80 px-3 text-center text-sm font-extrabold text-ink outline-none focus:border-neon-400 focus:shadow-[0_0_12px_rgba(154,69,245,0.25)] transition-all"
        />
      </div>

      {isStar ? (
        <p
          className="mt-3 rounded-lg p-2.5 text-sm font-bold leading-7 text-solar-300"
          style={{ background: "rgba(255,170,60,0.08)", border: "1px solid rgba(255,170,60,0.35)" }}
        >
          در خورشید امکان ایستادن وجود ندارد! این محاسبه برای خورشید کاربردی نیست.
        </p>
      ) : (
        <div
          className="mt-3 rounded-lg p-2.5 rise-in"
          key={body.id + weight.toFixed(1)}
          style={{ background: `${body.color}14`, border: `1px solid ${body.color}44` }}
        >
          <div className="text-xs font-bold text-ink-dim">وزن تقریبی شما روی {body.name}:</div>
          <div className="font-display text-[27px] leading-tight" style={{ color: body.color }}>
            {fmt1(weight)}
            <span className="font-body text-sm font-extrabold mr-1.5">کیلوگرم</span>
          </div>
        </div>
      )}

      <p className="mt-2 text-xs font-semibold leading-6 text-ink-dim">{body.weightNote[mode]}</p>
    </section>
  );
}
