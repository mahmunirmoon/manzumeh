import { downloadZip } from "client-zip";

/**
 * Project source files are inlined into the bundle at build time by Vite, so
 * the downloaded ZIP always matches the deployed source exactly.
 *
 * Note: index.html is deliberately NOT inlined — its dev entry tag would end
 * up as a literal string inside the bundle. A copy for the ZIP is rebuilt at
 * download time instead (see rebuildDevIndexHtml below).
 */
const modules = import.meta.glob<string>(
  [
    "../../package.json",
    "../../tsconfig.json",
    "../../vite.config.js",
    "../../README.md",
    "../../.gitignore",
    "../../.github/workflows/deploy.yml",
    "../../public/favicon.svg",
    "../**/*.{ts,tsx,css}",
  ],
  { eager: true, query: "?raw", import: "default" }
);

const ZIP_ROOT = "manzumeh-source";

function toZipPath(rawPath: string): string {
  // paths are relative to src/lib/projectFiles.ts
  const clean = rawPath.startsWith("../../")
    ? rawPath.slice(6) // project-root files
    : "src/" + rawPath.slice(3); // everything else lives in src/
  return `${ZIP_ROOT}/${clean}`;
}

const SOURCE_GUIDE = `سلام! 🌌

این بسته، فایل‌های «منبع» پروژهٔ منظومهٔ شمسی است (کد React + Vite + Tailwind).

⚠️ اگر index.html را مستقیم با دابل‌کلیک باز کردید و صفحه سیاه ماند، طبیعی است!
فایل‌های منبع فقط با سرور توسعهٔ Vite اجرا می‌شوند و مرورگر به‌تنهایی نمی‌تواند آن‌ها را باز کند.

برای اجرای محلی روی کامپیوتر:
  1) Node.js را نصب کنید (nodejs.org)
  2) در پوشهٔ پروژه:  npm install
  3) سپس:            npm run dev
  4) مرورگر را روی http://localhost:3000 باز کنید

برای ساخت نسخهٔ نهایی:
  npm run build  →  خروجی در پوشهٔ dist ساخته می‌شود و همان را روی هاست آپلود کنید.

💡 اگر نسخهٔ آمادهٔ هاست می‌خواهید: داخل خود وب‌سایت، دکمهٔ «نسخهٔ هاست» را بزنید؛
   خروجیِ آمادهٔ آپلود (بدون نیاز به npm) را به‌صورت ZIP دانلود می‌کند.

طراحی توسط امیرعلی — از شاگردان خانم دکتر آقایی ✨
`;

export function projectFileCount(): number {
  return Object.keys(modules).length + 2; // + rebuilt index.html + generated guide
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* Assembled at runtime so the dev entry path never exists as one literal in the bundle. */
const DEV_ENTRY_PATH = ["/src", "main.tsx"].join("/");

/** Rebuild the dev-time index.html (the one Vite serves) for the source ZIP. */
function rebuildDevIndexHtml(): string {
  return [
    "<!doctype html>",
    '<html lang="fa" dir="rtl">',
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '    <meta name="theme-color" content="#0b031d" />',
    '    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    `    <title>${document.title}</title>`,
    '    <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '    <link href="https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />',
    "    <style>html, body, #root { height: 100%; margin: 0; background: #0b031d; }</style>",
    "  </head>",
    "  <body>",
    '    <div id="root"></div>',
    `    <script type="module" src="${DEV_ENTRY_PATH}"></` + "script>",
    "  </body>",
    "</html>",
    "",
  ].join("\n");
}

/** ZIP of the raw source files (for GitHub / local development). */
export async function downloadProjectZip(): Promise<void> {
  const now = new Date();
  const files = Object.entries(modules).map(([path, content]) => ({
    name: toZipPath(path),
    lastModified: now,
    input: content,
  }));
  files.push({ name: `${ZIP_ROOT}/index.html`, lastModified: now, input: rebuildDevIndexHtml() });
  files.push({ name: `${ZIP_ROOT}/راهنمای-فایل‌ها.txt`, lastModified: now, input: SOURCE_GUIDE });
  const blob = await downloadZip(files).blob();
  triggerDownload(blob, "manzumeh-source.zip");
}

/**
 * ZIP of the *deployed production build* — the app packages itself at runtime:
 * fetches the served index.html and its hashed JS/CSS/favicon assets, rewrites
 * every asset URL to a relative one (./...), and zips the result.
 *
 * The output can be uploaded as-is to any host/domain (cPanel, Netlify, ...)
 * and works from the domain root or any sub-folder. No npm needed.
 */
export async function downloadHostReadyZip(): Promise<void> {
  const pageUrl = location.href;
  const res = await fetch(pageUrl);
  if (!res.ok) throw new Error("failed to fetch current page");
  let html = await res.text();

  // Normalize asset URLs so the site works from any host path.
  html = html
    .replace(/(src|href)="\/(assets\/)/g, '$1="./$2')
    .replace(/(src|href)="(assets\/)/g, '$1="./$2')
    .replace(/href="\/(favicon\.svg)"/g, 'href="./$1"')
    .replace(/href="(favicon\.svg)"/g, 'href="./$1"');

  const now = new Date();
  const files: { name: string; lastModified: Date; input: string | Blob }[] = [
    { name: "index.html", lastModified: now, input: html },
  ];

  const refs = [...new Set(
    [...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map((m) => m[1])
  )];

  await Promise.all(
    refs.map(async (rel) => {
      const assetRes = await fetch(new URL(rel, pageUrl));
      if (!assetRes.ok) throw new Error(`failed to fetch ${rel}`);
      files.push({
        name: rel.replace(/^\.\//, ""),
        lastModified: now,
        input: await assetRes.blob(),
      });
    })
  );

  const blob = await downloadZip(files).blob();
  triggerDownload(blob, "manzumeh-host.zip");
}
