export type Mode = "child" | "normal";

export type BodyKind = "star" | "rocky" | "gas" | "ice";

export interface Body {
  id: string;
  name: string;
  nameEn: string;
  kind: BodyKind;
  typeLabel: string;
  /** diameter in km */
  diameterKm: number;
  /** mean distance from the Sun in million km (null for the Sun itself) */
  distanceMkm: number | null;
  au: number | null;
  /** sidereal orbital period in Earth days (null for the Sun) */
  periodDays: number | null;
  rotationNote: string;
  /** mean orbital velocity km/s (null for the Sun) */
  velocityKmS: number | null;
  moons: number | null;
  fact: string;
  /** simplified, child-friendly version of the fact */
  factChild: string;
  /** surface gravity relative to Earth (Earth = 1) */
  gravity: number;
  /** short playful sentence shown under the weight result */
  weightNote: { child: string; normal: string };
  color: string;
  colorDeep: string;
  orbitR: number;
  sizeR: number;
  phase: number;
  ring?: boolean;
}

export const EARTH_DIAMETER = 12742;

export const BODIES: Body[] = [
  {
    id: "sun",
    name: "خورشید",
    nameEn: "Sun",
    kind: "star",
    typeLabel: "ستارهٔ کوتولهٔ زرد",
    diameterKm: 1392700,
    distanceMkm: null,
    au: null,
    periodDays: null,
    rotationNote: "چرخش به دور خود: ≈ ۲۷ روز",
    velocityKmS: null,
    moons: null,
    fact: "خورشید ۹۹٫۸۶ درصد از کل جرم منظومهٔ شمسی را در خود جای داده و هر ثانیه حدود ۶۰۰ میلیون تن هیدروژن را به هلیوم تبدیل می‌کند.",
    factChild: "خورشید یک ستارهٔ بزرگ و داغ است که به همهٔ سیاره‌ها نور و گرما می‌دهد.",
    gravity: 27.9,
    weightNote: {
      child: "خورشید آن‌قدر داغ است که اصلاً نمی‌شود رویش ایستاد!",
      normal: "جاذبهٔ سطح خورشید حدود ۲۸ برابر زمین است، اما چون سطح جامد ندارد، ایستادن روی آن ممکن نیست.",
    },
    color: "#ffc24b",
    colorDeep: "#ff7a1a",
    orbitR: 0,
    sizeR: 26,
    phase: 0,
  },
  {
    id: "mercury",
    name: "عطارد",
    nameEn: "Mercury",
    kind: "rocky",
    typeLabel: "سیارهٔ سنگی",
    diameterKm: 4879,
    distanceMkm: 57.9,
    au: 0.39,
    periodDays: 88,
    rotationNote: "چرخش به دور خود: ۵۹ روز",
    velocityKmS: 47.4,
    moons: 0,
    fact: "یک روز خورشیدی روی عطارد (از طلوع تا طلوع بعدی) ۱۷۶ روز زمینی طول می‌کشد؛ یعنی از یک سالِ آن هم طولانی‌تر است!",
    factChild: "عطارد کوچک‌ترین سیاره است و خیلی نزدیک به خورشید می‌چرخد.",
    gravity: 0.38,
    weightNote: {
      child: "اینجا خیلی سبکی! انگار یک پَر شده‌ای و می‌پری.",
      normal: "جاذبهٔ عطارد فقط ۳۸٪ زمین است؛ پرش‌هایت اینجا خیلی بلندتر می‌شود.",
    },
    color: "#c8a882",
    colorDeep: "#6e5a44",
    orbitR: 66,
    sizeR: 4.6,
    phase: 0.6,
  },
  {
    id: "venus",
    name: "زهره",
    nameEn: "Venus",
    kind: "rocky",
    typeLabel: "سیارهٔ سنگی",
    diameterKm: 12104,
    distanceMkm: 108.2,
    au: 0.72,
    periodDays: 224.7,
    rotationNote: "چرخش به دور خود: ۲۴۳ روز (وارونه)",
    velocityKmS: 35.0,
    moons: 0,
    fact: "زهره با دمایی نزدیک به ۴۶۵ درجهٔ سانتی‌گراد داغ‌ترین سیارهٔ منظومه است و برخلاف بیشتر سیاره‌ها، در جهت عکس می‌چرخد.",
    factChild: "زهره داغ‌ترین سیاره است و مثل یک چراغ درخشان در آسمان دیده می‌شود.",
    gravity: 0.91,
    weightNote: {
      child: "تقریباً همان وزن همیشگی‌ات را داری؛ فرقش خیلی کم است.",
      normal: "جاذبهٔ زهره ۹۱٪ زمین است؛ تفاوت وزن را به‌سختی حس می‌کنی.",
    },
    color: "#ecc873",
    colorDeep: "#9a7434",
    orbitR: 94,
    sizeR: 7,
    phase: 2.2,
  },
  {
    id: "earth",
    name: "زمین",
    nameEn: "Earth",
    kind: "rocky",
    typeLabel: "سیارهٔ سنگی",
    diameterKm: 12742,
    distanceMkm: 149.6,
    au: 1,
    periodDays: 365.25,
    rotationNote: "چرخش به دور خود: ۲۴ ساعت",
    velocityKmS: 29.8,
    moons: 1,
    fact: "زمین تنها جایی در جهان است که وجود حیات در آن قطعی است و تنها سیاره‌ای که آب مایع پایدار در سطحش دارد.",
    factChild: "زمین خانهٔ ماست؛ تنها جایی که دریا، جنگل و زندگی دارد!",
    gravity: 1,
    weightNote: {
      child: "اینجا خانهٔ توست؛ وزنت همیشه همین‌قدر است!",
      normal: "زمین معیار ماست؛ وزن اینجا دقیقاً همان عددی است که وارد کردی.",
    },
    color: "#5aa2f0",
    colorDeep: "#1d4e8f",
    orbitR: 124,
    sizeR: 7.6,
    phase: 3.7,
  },
  {
    id: "mars",
    name: "مریخ",
    nameEn: "Mars",
    kind: "rocky",
    typeLabel: "سیارهٔ سنگی",
    diameterKm: 6779,
    distanceMkm: 227.9,
    au: 1.52,
    periodDays: 687,
    rotationNote: "چرخش به دور خود: ۲۴٫۶ ساعت",
    velocityKmS: 24.1,
    moons: 2,
    fact: "بلندترین کوه منظومهٔ شمسی، «المپوس مونس» با ارتفاعی نزدیک به ۲۲ کیلومتر، روی مریخ قرار دارد؛ حدود سه برابر اورست!",
    factChild: "مریخ به سیارهٔ قرمز معروف است و بلندترین کوه منظومه را دارد.",
    gravity: 0.38,
    weightNote: {
      child: "روی مریخ سبک‌تری؛ پریدن اینجا خیلی کیف می‌دهد!",
      normal: "جاذبهٔ مریخ ۳۸٪ زمین است؛ فضانوردان آینده آنجا راحت‌تر می‌پرند.",
    },
    color: "#e0714f",
    colorDeep: "#8a3a24",
    orbitR: 156,
    sizeR: 5.6,
    phase: 5.3,
  },
  {
    id: "jupiter",
    name: "مشتری",
    nameEn: "Jupiter",
    kind: "gas",
    typeLabel: "غول گازی",
    diameterKm: 139820,
    distanceMkm: 778.5,
    au: 5.2,
    periodDays: 4333,
    rotationNote: "چرخش به دور خود: ۹٫۹ ساعت",
    velocityKmS: 13.1,
    moons: 95,
    fact: "«لکهٔ بزرگ قرمز» مشتری توفانی است که دست‌کم ۳۵۰ سال است می‌وزد و از کل سیارهٔ زمین بزرگ‌تر است.",
    factChild: "مشتری بزرگ‌ترین سیارهٔ منظومهٔ شمسی است؛ خیلی خیلی بزرگ!",
    gravity: 2.53,
    weightNote: {
      child: "روی مشتری حسابی سنگین می‌شوی؛ بلند شدن سخت است!",
      normal: "جاذبهٔ مشتری ۲٫۵ برابر زمین است؛ راه رفتن روی آن واقعاً سخت می‌شد.",
    },
    color: "#d9a066",
    colorDeep: "#8a5a30",
    orbitR: 214,
    sizeR: 17,
    phase: 1.2,
  },
  {
    id: "saturn",
    name: "زحل",
    nameEn: "Saturn",
    kind: "gas",
    typeLabel: "غول گازی",
    diameterKm: 116460,
    distanceMkm: 1434,
    au: 9.58,
    periodDays: 10759,
    rotationNote: "چرخش به دور خود: ۱۰٫۷ ساعت",
    velocityKmS: 9.7,
    moons: 146,
    fact: "چگالی زحل از آب کمتر است؛ اگر اقیانوسی به اندازهٔ کافی بزرگ وجود داشت، این سیاره روی آب شناور می‌ماند!",
    factChild: "زحل حلقه‌های زیبایی دارد که از یخ و سنگ ساخته شده‌اند.",
    gravity: 1.06,
    weightNote: {
      child: "با وجود عظمتش، فقط کمی از زمینی سنگین‌تری!",
      normal: "جاذبهٔ زحل ۱٫۰۶ برابر زمین است؛ با اینکه غول‌پیکر است، تقریباً هم‌وزن زمینی!",
    },
    color: "#e3c584",
    colorDeep: "#96742f",
    orbitR: 268,
    sizeR: 14,
    phase: 4.1,
    ring: true,
  },
  {
    id: "uranus",
    name: "اورانوس",
    nameEn: "Uranus",
    kind: "ice",
    typeLabel: "غول یخی",
    diameterKm: 50724,
    distanceMkm: 2871,
    au: 19.2,
    periodDays: 30687,
    rotationNote: "چرخش به دور خود: ۱۷٫۲ ساعت (خوابیده)",
    velocityKmS: 6.8,
    moons: 28,
    fact: "محور چرخش اورانوس حدود ۹۸ درجه کج شده؛ یعنی عملاً «به پهلو خوابیده» و خورشید را دور می‌زند.",
    factChild: "اورانوس آبی‌رنگ است و کج شده؛ انگار به پهلو خوابیده!",
    gravity: 0.89,
    weightNote: {
      child: "روی اورانوس کمی از زمینی سبک‌تری.",
      normal: "جاذبهٔ اورانوس ۸۹٪ زمین است؛ کمی سبک‌تر حس می‌شوی.",
    },
    color: "#8fd8dc",
    colorDeep: "#3d8a92",
    orbitR: 318,
    sizeR: 10.4,
    phase: 2.7,
  },
  {
    id: "neptune",
    name: "نپتون",
    nameEn: "Neptune",
    kind: "ice",
    typeLabel: "غول یخی",
    diameterKm: 49244,
    distanceMkm: 4495,
    au: 30.05,
    periodDays: 60190,
    rotationNote: "چرخش به دور خود: ۱۶٫۱ ساعت",
    velocityKmS: 5.4,
    moons: 16,
    fact: "سریع‌ترین بادهای منظومهٔ شمسی در جو نپتون می‌وزند؛ تا ۲٬۱۰۰ کیلومتر بر ساعت!",
    factChild: "نپتون خیلی دور و سرد است و بادهای خیلی تند دارد.",
    gravity: 1.14,
    weightNote: {
      child: "روی نپتون کمی از زمینی سنگین‌تری.",
      normal: "جاذبهٔ نپتون ۱٫۱۴ برابر زمین است؛ کمی سنگین‌تر از زمینی.",
    },
    color: "#5a7cf0",
    colorDeep: "#25358f",
    orbitR: 364,
    sizeR: 9.8,
    phase: 5.8,
  },
];

export const PLANETS = BODIES.filter((b) => b.kind !== "star");

export function getBody(id: string | null): Body | null {
  if (!id) return null;
  return BODIES.find((b) => b.id === id) ?? null;
}
