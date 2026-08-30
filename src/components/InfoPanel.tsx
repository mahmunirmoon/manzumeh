import type { Body, Mode } from "../data/bodies";
import { EARTH_DIAMETER } from "../data/bodies";
import { fmt1, fmtInt, fmtPeriod, lightMinutes, toFa } from "../lib/format";
import { WeightCalc } from "./WeightCalc";
import {
  IconClock,
  IconClose,
  IconDistance,
  IconGauge,
  IconMoon,
  IconMusic,
  IconRuler,
  IconSparkle,
} from "./Icons";

interface Props {
  body: Body | null;
  onClose: () => void;
  mode: Mode;
  musicPlaying?: boolean;
  musicTitle?: string;
}

function StatRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-space-600/40 last:border-0">
      <span className="mt-0.5 text-solar-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-bold text-neon-300 mb-0.5">{label}</div>
        <div className="text-[15px] font-extrabold text-ink leading-snug">{value}</div>
        {sub && <div className="text-xs font-semibold text-ink-dim mt-0.5 leading-relaxed">{sub}</div>}
      </div>
    </div>
  );
}

export function InfoPanel({ body, onClose, mode, musicPlaying, musicTitle }: Props) {
  if (!body) return null;

  const ratio = body.diameterKm / EARTH_DIAMETER;
  const period = body.periodDays ? fmtPeriod(body.periodDays) : null;

  const discStyle: React.CSSProperties = {
    background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), ${body.color} 42%, ${body.colorDeep} 95%)`,
    boxShadow:
      body.kind === "star"
        ? `0 0 34px rgba(255,170,60,0.75), 0 0 90px rgba(255,140,40,0.4)`
        : `0 0 22px ${body.color}55, inset -6px -6px 14px rgba(0,0,0,0.45)`,
  };

  return (
    <aside
      className="panel-in relative z-30 mx-3 mt-3 md:m-0 md:absolute md:inset-x-auto md:left-4 md:top-16 md:bottom-2 md:w-[354px]
        flex flex-col rounded-2xl md:rounded-xl border border-space-600/70 bg-space-900/90 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
      role="dialog"
      aria-label={`مشخصات ${body.name}`}
    >
      {/* header */}
      <div className="relative p-4 md:p-5 pb-3 md:pb-4 flex items-center gap-3 md:gap-4" style={{ background: `linear-gradient(180deg, ${body.color}1f, transparent)` }}>
        <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full" style={discStyle} />
          {body.ring && (
            <div
              className="absolute inset-0 m-auto w-[90px] h-[90px] md:w-[104px] md:h-[104px] rounded-[50%] border-2 pointer-events-none"
              style={{ borderColor: `${body.color}aa`, transform: "rotate(-24deg) scaleY(0.42)" }}
            />
          )}
        </div>
        <div className="min-w-0 pe-9">
          <h2
            className="font-display text-[34px] md:text-[44px] leading-none"
            style={{ color: body.color, textShadow: `0 0 24px ${body.color}88, 0 2px 0 rgba(20,4,40,0.6)` }}
          >
            {body.name}
          </h2>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold tracking-wide text-ink-dim font-body" dir="ltr">
              {body.nameEn}
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border font-bold"
              style={{ color: body.color, borderColor: `${body.color}66`, background: `${body.color}14` }}
            >
              {body.typeLabel}
            </span>
          </div>
          {musicPlaying && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-neon-300">
              <IconMusic className="w-3.5 h-3.5" />
              <span>
                ملودی این سیاره در حال پخش
                {musicTitle ? `: ${musicTitle}` : ""}
              </span>
              <span className="eq eq-mini" style={{ "--eq-dur": "0.45s" } as React.CSSProperties}>
                <span /><span /><span />
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-2.5 left-2.5 w-10 h-10 grid place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-space-600/60 transition-colors"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {/* stats */}
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll px-4 md:px-5 pb-6 md:pb-4">
        <StatRow
          icon={<IconRuler />}
          label="قطر"
          value={`${fmtInt(body.diameterKm)} کیلومتر`}
        />
        <StatRow
          icon={<IconDistance />}
          label="فاصله از خورشید"
          value={
            body.distanceMkm === null
              ? "مرکز منظومهٔ شمسی"
              : `${fmt1(body.distanceMkm)} میلیون کیلومتر`
          }
          sub={
            body.distanceMkm === null
              ? "همهٔ سیاره‌ها به دور آن می‌گردند"
              : `≈ ${fmt1(body.au ?? 0)} واحد نجومی · نور در ${fmt1(lightMinutes(body.distanceMkm!))} دقیقه می‌رسد`
          }
        />
        <StatRow
          icon={<IconClock />}
          label="دورهٔ مداری (یک سالِ سیاره)"
          value={period ? period.main : "—"}
          sub={[period?.sub, body.rotationNote].filter(Boolean).join(" · ") || undefined}
        />
        <StatRow
          icon={<IconGauge />}
          label="سرعت مداری"
          value={body.velocityKmS === null ? "—" : `${fmt1(body.velocityKmS)} کیلومتر بر ثانیه`}
        />
        <StatRow
          icon={<IconMoon />}
          label="قمرها"
          value={body.moons === null ? "۸ سیاره در مدارش" : `${toFa(body.moons)} قمر`}
        />

        {/* earth comparison */}
        <div className="mt-4 p-3 rounded-lg bg-space-800/70 border border-space-600/50">
          <div className="text-[13px] font-bold text-ink mb-2">مقایسهٔ قطر با زمین</div>
          <CompareBar label={body.name} value={Math.min(ratio, 12)} color={body.color} text={ratio >= 1 ? `${fmt1(ratio)}×` : `${fmt1(ratio)}×`} />
          <CompareBar label="زمین" value={Math.min(1, 12)} color="#5aa2f0" text={toFa(1) + "×"} />
          <div className="mt-2 text-xs font-semibold text-ink-dim leading-relaxed">
            {body.id === "earth"
              ? "مبنای مقایسه، خود زمین است!"
              : ratio >= 1
                ? `قطر ${body.name} حدود ${fmt1(ratio)} برابر زمین است.`
                : `قطر ${body.name} حدود ${fmt1(ratio)} برابرِ قطر زمین است.`}
          </div>
        </div>

        {/* fun fact — two levels: child / normal */}
        <div
          className="mt-4 p-3 rounded-lg border-s-2 bg-space-800/40"
          style={{ borderColor: body.color }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: body.color }}>
            <IconSparkle className="w-4 h-4" />
            <span className="text-[13px] font-extrabold">
              {mode === "child" ? "دانستی؟" : "دانستنی"}
            </span>
          </div>
          <p className="text-sm font-semibold leading-7 text-ink/95">
            {mode === "child" ? body.factChild : body.fact}
          </p>
        </div>

        {/* «اگر روی این سیاره بودی...» weight experiment */}
        <WeightCalc body={body} mode={mode} />
        <div className="h-2" />
      </div>
    </aside>
  );
}

function CompareBar({
  label,
  value,
  color,
  text,
}: {
  label: string;
  value: number;
  color: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="w-12 text-xs font-bold text-ink shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-space-950/80 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / 12) * 100}%`, background: color }}
        />
      </div>
      <span className="w-10 text-[10.5px] text-ink-dim text-left shrink-0" dir="ltr">
        {text}
      </span>
    </div>
  );
}
