const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Latin digits of any string/number to Persian digits. */
export function toFa(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

const nfInt = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const nfOne = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});
const nfTwo = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** 12345 -> «۱۲٬۳۴۵» */
export function fmtInt(n: number): string {
  return nfInt.format(Math.round(n));
}

/** one decimal, Persian digits + separator */
export function fmt1(n: number): string {
  return nfOne.format(n);
}

export function fmt2(n: number): string {
  return nfTwo.format(n);
}

/** Format an orbital period nicely (days, and years when long). */
export function fmtPeriod(days: number): { main: string; sub?: string } {
  if (days < 1000) {
    return { main: `${fmt1(days)} روز زمینی` };
  }
  const years = days / 365.25;
  return {
    main: `${fmtInt(days)} روز زمینی`,
    sub: `≈ ${fmt1(years)} سال`,
  };
}

/** Minutes light needs to travel a distance given in million km. */
export function lightMinutes(millionKm: number): number {
  return (millionKm * 1e6) / 299792.458 / 60;
}
