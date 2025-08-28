/* Copies the correct pdf.js worker (matching react-pdf's bundled pdfjs-dist) into public/ */
const fs = require('fs');
const path = require('path');

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

(function main() {
  try {
    const reactPdfPkgDir = path.dirname(require.resolve('react-pdf/package.json'));

    // Prefer the nested pdfjs-dist used by react-pdf to avoid version mismatch
    const candidates = [
      path.join(reactPdfPkgDir, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
      path.join(reactPdfPkgDir, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
      // Fallbacks (not preferred): top-level installs
      path.join(process.cwd(), 'node_modules', 'react-pdf', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
    ];

    const src = candidates.find(fileExists);
    if (!src) {
      console.warn('[copy-pdf-worker] Could not locate pdf.worker(.min).mjs. Is react-pdf installed?');
      process.exit(0);
    }

    const publicDir = path.join(process.cwd(), 'public');
    ensureDir(publicDir);
    const dest = path.join(publicDir, 'pdf.worker.min.mjs');

    fs.copyFileSync(src, dest);
    console.log(`[copy-pdf-worker] Copied worker from: ${src} -> ${dest}`);
  } catch (err) {
    console.error('[copy-pdf-worker] Failed to copy PDF.js worker:', err?.message || err);
    process.exit(1);
  }
})();
