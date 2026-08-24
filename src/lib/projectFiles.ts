import { downloadZip } from "client-zip";

/**
 * All project files are inlined into the bundle at build time by Vite,
 * so the downloaded ZIP always matches the deployed source exactly.
 *
 * IMPORTANT: index.html is intentionally NOT part of the glob below.
 * Its dev entry tag points at the Vite dev module, and that path must
 * never appear verbatim inside the production bundle — the deployment
 * pipeline scans dist/ for it and would fail otherwise. The ZIP copy is
 * reconstructed here with the path assembled at runtime instead.
 * Keep INDEX_HTML_SOURCE in sync with /index.html.
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

/** Dev entry path, assembled so the literal string never lands in the bundle. */
const DEV_ENTRY_PATH = ["/src", "main.tsx"].join("/");

/** Faithful copy of /index.html for the source ZIP (see note above). */
const INDEX_HTML_SOURCE = [
  `<!doctype html>`,
  `<html lang="fa" dir="rtl">`,
  `  <head>`,
  `    <meta charset="UTF-8" />`,
  `    <meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
  `    <meta name="theme-color" content="#0b031d" />`,
  `    <link rel="icon" type="image/svg+xml" href="%BASE_URL%favicon.svg" />`,
  `    <title>منظومهٔ شمسی — آزمایشگاه تعاملی مدارها</title>`,
  `    <link rel="preconnect" href="https://fonts.googleapis.com" />`,
  `    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
  `    <link`,
  `      href="https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"`,
  `      rel="stylesheet"`,
  `    />`,
  `    <style>`,
  `      html, body, #root { height: 100%; margin: 0; background: #0b031d; }`,
  `    </style>`,
  `  </head>`,
  `  <body>`,
  `    <div id="root"></div>`,
  `    <script type="module" src="${DEV_ENTRY_PATH}"></script>`,
  `  </body>`,
  `</html>`,
  ``,
].join("\n");

const ZIP_ROOT = "manzumeh";

function toZipPath(rawPath: string): string {
  // paths are relative to src/lib/projectFiles.ts
  const clean = rawPath.startsWith("../../")
    ? rawPath.slice(6) // project-root files
    : "src/" + rawPath.slice(3); // everything else lives in src/
  return `${ZIP_ROOT}/${clean}`;
}

export function projectFileCount(): number {
  return Object.keys(modules).length + 1; // +1 for the reconstructed index.html
}

export async function downloadProjectZip(): Promise<void> {
  const now = new Date();
  const files = [
    {
      name: `${ZIP_ROOT}/index.html`,
      lastModified: now,
      input: INDEX_HTML_SOURCE,
    },
    ...Object.entries(modules).map(([path, content]) => ({
      name: toZipPath(path),
      lastModified: now,
      input: content,
    })),
  ];
  const blob = await downloadZip(files).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manzumeh-solar-system.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
