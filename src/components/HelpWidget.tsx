import { useEffect, useState } from "react";

const HelpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.8 9.3a2.5 2.5 0 0 1 4.8.9c0 2-2.6 2.2-2.6 4" />
    <circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M14.5 4.5c2.4-2.4 4.8-2 5-1.8.2.2.6 2.6-1.8 5l-5.8 5.8-4.4-4.4 7-4.6Z" />
    <path d="M9 11 5.2 12.2 3 15l5-.2M13 15l-1.2 3.8L9 21l.2-5" />
    <circle cx="15.8" cy="6.6" r="1.2" />
  </svg>
);

const PlanetIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="5.5" />
    <path d="M3.8 15.6c2.1 2.3 7.3 1.6 11.6-.8s7.1-5.7 5.8-7.7c-.8-1.1-2.5-1.2-4.6-.6" />
    <path d="M7.5 7.8C4.4 9.3 2.2 11.4 2.8 13" />
  </svg>
);

const SourceIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5Z" />
    <path d="M7 20c0-1.7 1-2.8 3-2.8h8M9 8h5M9 11h6" />
  </svg>
);

const Step = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-solar-400/50 bg-solar-400/10 text-xs font-extrabold text-solar-300">
      {n}
    </span>
    <span className="pt-0.5 text-sm font-semibold leading-7 text-ink/90">{children}</span>
  </li>
);

export function HelpWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="manzumeh-help-trigger fixed left-3 top-3 z-[80] grid h-11 w-11 place-items-center rounded-full border border-neon-400/70 bg-space-900/90 text-neon-300 shadow-[0_8px_28px_rgba(154,69,245,0.35)] backdrop-blur-md transition-transform hover:scale-105 active:scale-95 md:left-4 md:top-4"
        aria-label="راهنمای برنامه"
        title="راهنمای برنامه"
      >
        <HelpIcon className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="manzumeh-help-overlay fixed inset-0 z-[100] overflow-y-auto bg-space-950/88 p-3 backdrop-blur-md sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manzumeh-help-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <section className="manzumeh-help-card mx-auto my-2 w-full max-w-3xl overflow-hidden rounded-3xl border border-space-600/70 bg-space-900/95 shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:my-6">
            <header className="relative border-b border-space-600/50 bg-gradient-to-l from-neon-500/15 via-space-900 to-solar-500/10 p-5 sm:p-7">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute left-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-space-600/60 bg-space-950/55 text-ink-dim transition-colors hover:text-ink"
                aria-label="بستن راهنما"
              >
                <CloseIcon />
              </button>

              <div className="pe-12">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-neon-400/40 bg-neon-500/10 px-3 py-1.5 text-xs font-extrabold text-neon-300">
                  <HelpIcon />
                  HELP · راهنمای کاربر
                </div>
                <h2 id="manzumeh-help-title" className="font-display text-3xl leading-tight text-ink sm:text-4xl">
                  راهنمای منظومهٔ شمسی
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-ink-dim">
                  یک راهنمای کوتاه برای شناخت برنامه، روش استفاده، اطلاعاتی که نمایش می‌دهد و مبنای داده‌ها.
                </p>
              </div>
            </header>

            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
              <article className="rounded-2xl border border-solar-400/25 bg-space-800/55 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-solar-300">
                  <PlanetIcon />
                  <h3 className="text-base font-extrabold">این برنامه چه کار می‌کند؟</h3>
                </div>
                <p className="text-sm font-semibold leading-7 text-ink/90">
                  این وب‌اپ یک آزمایشگاه آموزشی تعاملی برای منظومهٔ شمسی است. خورشید و هشت سیاره را در حال گردش
                  نمایش می‌دهد و با انتخاب هر جرم، مشخصات، دانستنی، مقایسه با زمین و آزمایش وزن روی آن جرم را نشان می‌دهد.
                </p>
              </article>

              <article className="rounded-2xl border border-neon-400/25 bg-space-800/55 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-neon-300">
                  <RocketIcon />
                  <h3 className="text-base font-extrabold">روش استفاده</h3>
                </div>
                <ol className="space-y-2">
                  <Step n="۱">روی خورشید یا یکی از سیاره‌ها کلیک یا لمس کنید.</Step>
                  <Step n="۲">کارت اطلاعات جرم انتخابی را بخوانید و آزمایش وزن را امتحان کنید.</Step>
                  <Step n="۳">با کنترل‌های پایین، پخش، سرعت، مدارها، برچسب‌ها و دنباله‌ها را تغییر دهید.</Step>
                  <Step n="۴">حالت «کودک» را برای توضیح ساده‌تر فعال کنید یا بازی «حدس سیاره» را اجرا کنید.</Step>
                </ol>
              </article>

              <article className="rounded-2xl border border-comet/25 bg-space-800/55 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-comet">
                  <HelpIcon />
                  <h3 className="text-base font-extrabold">چه اطلاعاتی می‌بینید؟</h3>
                </div>
                <ul className="grid gap-2 text-sm font-semibold leading-7 text-ink/90">
                  <li>• قطر و فاصلهٔ میانگین از خورشید</li>
                  <li>• دوره و سرعت مداری و مدت چرخش به دور خود</li>
                  <li>• تعداد قمرها و دانستنی آموزشی</li>
                  <li>• مقایسهٔ اندازه با زمین</li>
                  <li>• وزن تقریبی شما با توجه به گرانش نسبی هر جرم</li>
                  <li>• موسیقی متفاوت برای فضای کلی و سیاره‌های مختلف</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-space-600/70 bg-space-800/55 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-solar-300">
                  <SourceIcon />
                  <h3 className="text-base font-extrabold">منابع و دقت نمایش</h3>
                </div>
                <p className="text-sm font-semibold leading-7 text-ink/90">
                  داده‌های عددی برنامه داخل فایل داده‌های پروژه نگهداری می‌شوند؛ از جمله قطر، فاصله، دوره و سرعت مداری،
                  تعداد قمرها و گرانش نسبی. برای راستی‌آزمایی علمی می‌توانید به منابع رسمی
                  NASA Solar System Exploration و NASA/JPL مراجعه کنید.
                </p>
                <p className="mt-3 rounded-xl border border-solar-400/20 bg-solar-400/5 p-3 text-xs font-semibold leading-6 text-ink-dim">
                  توجه: اندازهٔ سیاره‌ها و فاصلهٔ مدارها در تصویر برای آموزش و خوانایی به‌صورت نمایشی مقیاس‌بندی شده‌اند؛
                  تصویر، مدلِ دقیقِ مقیاس واقعی نیست.
                </p>
              </article>
            </div>

            <footer className="border-t border-space-600/50 px-4 py-4 text-center text-xs font-semibold leading-6 text-ink-dim sm:px-6">
              در موبایل صفحه عمودی اسکرول می‌شود. انتخابگر سیاره‌ها نیز با لمس به‌صورت افقی قابل پیمایش است.
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
