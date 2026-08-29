import type { Body } from "../data/bodies";
import { EARTH_DIAMETER } from "../data/bodies";
import { fmt1, fmtInt, fmtPeriod, lightMinutes, toFa } from "../lib/format";
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
        <div className="text-[11px] text-ink-dim mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-ink leading-snug">{value}</div>
        {sub && <div className="text-[11px] text-ink-faint mt-0.5 leading-relaxed">{sub}</div>}
      </div>
    </div>
  );
}

export function InfoPanel({ body, onClose, musicPlaying, musicTitle }: Props) {
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
      className="panel-in absolute z-30 inset-x-2 top-14 max-h-[58%] md:inset-x-auto md:left-4 md:top-16 md:bottom-2 md:max-h-none md:w-[354px]
        flex flex-col rounded-xl border border-space-600/70 bg-space-900/88 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
      role="dialog"
      aria-label={`مشخصات ${body.name}`}
    >
      {/* header */}
      <div className="relative p-5 pb-4 flex items-center gap-4" style={{ background: `linear-gradient(180deg, ${body.color}1f, transparent)` }}>
        <div className="relative w-16 h-16 shrink-0">
          <div className="w-16 h-16 rounded-full" style={discStyle} />
          {body.ring && (
            <div
              className="absolute inset-0 m-auto w-[104px] h-[104px] rounded-[50%] border-2 pointer-events-none"
              style={{ borderColor: `${body.color}aa`, transform: "rotate(-24deg) scaleY(0.42)" }}
            />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-4xl leading-none text-ink">{body.name}</h2>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] tracking-wide text-ink-faint font-body" dir="ltr">
              {body.nameEn}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
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
          className="absolute top-3 left-3 w-8 h-8 grid place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-space-600/60 transition-colors"
        >
          <IconClose className="w-4 h-4" />
        </button>
      </div>

      {/* stats */}
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll px-5 pb-4">
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
          <div className="text-[11px] text-ink-dim mb-2">مقایسهٔ قطر با زمین</div>
          <CompareBar label={body.name} value={Math.min(ratio, 12)} color={body.color} text={ratio >= 1 ? `${fmt1(ratio)}×` : `${fmt1(ratio)}×`} />
          <CompareBar label="زمین" value={Math.min(1, 12)} color="#5aa2f0" text={toFa(1) + "×"} />
          <div className="mt-2 text-[11px] text-ink-faint leading-relaxed">
            {body.id === "earth"
              ? "مبنای مقایسه، خود زمین است!"
              : ratio >= 1
                ? `قطر ${body.name} حدود ${fmt1(ratio)} برابر زمین است.`
                : `قطر ${body.name} حدود ${fmt1(ratio)} برابرِ قطر زمین است.`}
          </div>
        </div>

        {/* fun fact */}
        <div
          className="mt-4 mb-2 p-3 rounded-lg border-s-2 bg-space-800/40"
          style={{ borderColor: body.color }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: body.color }}>
            <IconSparkle className="w-4 h-4" />
            <span className="text-xs font-bold">دانستنی</span>
          </div>
          <p className="text-[12.5px] leading-6 text-ink/90">{body.fact}</p>
        </div>
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
      <span className="w-12 text-[10.5px] text-ink-dim shrink-0">{label}</span>
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
