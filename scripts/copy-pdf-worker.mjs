// pdfjs-dist requires its worker script to match the installed package's
// version exactly - a mismatch fails silently as "Error: Failed to convert
// PDF to image" in the browser console (the real error, "API version does
// not match Worker version", is swallowed by our try/catch in pdf2img.ts).
// Running this after every `npm install` keeps public/pdf.worker.min.mjs in
// sync automatically instead of relying on someone remembering to copy it.
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const src = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const dest = join(root, "public/pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.warn("[copy-pdf-worker] pdfjs-dist worker not found, skipping:", src);
  process.exit(0);
}

copyFileSync(src, dest);
console.log("[copy-pdf-worker] Synced public/pdf.worker.min.mjs from pdfjs-dist");
