import { downloadZip } from "client-zip";

/**
 * All project files are inlined into the bundle at build time by Vite,
 * so the downloaded ZIP always matches the deployed source exactly.
 */
const modules = import.meta.glob<string>(
  [
    "../../index.html",
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

const ZIP_ROOT = "manzumeh";

function toZipPath(rawPath: string): string {
  // paths are relative to src/lib/projectFiles.ts
  const clean = rawPath.startsWith("../../")
    ? rawPath.slice(6) // project-root files
    : "src/" + rawPath.slice(3); // everything else lives in src/
  return `${ZIP_ROOT}/${clean}`;
}

export function projectFileCount(): number {
  return Object.keys(modules).length;
}

export async function downloadProjectZip(): Promise<void> {
  const now = new Date();
  const files = Object.entries(modules).map(([path, content]) => ({
    name: toZipPath(path),
    lastModified: now,
    input: content,
  }));
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
