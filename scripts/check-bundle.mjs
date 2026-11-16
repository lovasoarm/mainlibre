import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const manifestPath = join(dist, '.vite', 'manifest.json');
const limitBytes = 200 * 1024;

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const entry = manifest['index.html'] ?? Object.values(manifest).find((item) => item.isEntry);
if (!entry) throw new Error('Entrée Vite introuvable dans le manifeste.');

const files = collectInitialFiles(entry, manifest);
let totalBytes = 0;
for (const file of files) {
  const content = await readFile(join(dist, file));
  totalBytes += gzipSync(content, { level: 9 }).byteLength;
}

console.log(`Budget initial gzip : ${(totalBytes / 1024).toFixed(1)} / 200 Ko (${files.length} assets).`);
if (totalBytes > limitBytes) {
  throw new Error('Le budget initial gzip de 200 Ko est dépassé. Réduire les imports statiques ou différer une fonctionnalité.');
}

function collectInitialFiles(entryChunk, allChunks) {
  const visited = new Set();
  const filesToCheck = new Set();
  const visit = (chunk) => {
    if (visited.has(chunk.file)) return;
    visited.add(chunk.file);
    filesToCheck.add(chunk.file);
    for (const cssFile of chunk.css ?? []) filesToCheck.add(cssFile);
    for (const dependency of chunk.imports ?? []) {
      const imported = allChunks[dependency];
      if (imported) visit(imported);
    }
  };
  visit(entryChunk);
  return [...filesToCheck];
}
