import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicModelsDestination = join(root, 'public', 'models');
const publicWasmDestination = join(publicModelsDestination, 'wasm');
const bundledWasmDestination = join(root, 'src', 'assets', 'mediapipe', 'wasm');
const wasmSource = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const modelPath = join(publicModelsDestination, 'face_landmarker.task');
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

await Promise.all([
  mkdir(publicWasmDestination, { recursive: true }),
  mkdir(bundledWasmDestination, { recursive: true }),
  mkdir(publicModelsDestination, { recursive: true }),
]);

try {
  const entries = await readdir(wasmSource);
  const files = await Promise.all(entries.map(async (name) => ({
    name,
    info: await stat(join(wasmSource, name)),
  })));

  const wasmFiles = files.filter((file) => file.info.isFile() && /\.(wasm|js|data)$/.test(file.name));
  for (const file of wasmFiles) {
    const sourcePath = join(wasmSource, file.name);
    await Promise.all([
      copyFile(sourcePath, join(publicWasmDestination, file.name)),
      copyFile(sourcePath, join(bundledWasmDestination, file.name)),
    ]);
  }

  const requiredFiles = ['vision_wasm_internal.js', 'vision_wasm_internal.wasm'];
  const missingFiles = requiredFiles.filter((name) => !wasmFiles.some((file) => file.name === name));
  if (missingFiles.length > 0) {
    throw new Error(`Fichiers MediaPipe manquants dans node_modules : ${missingFiles.join(', ')}`);
  }

  console.log(`${wasmFiles.length} fichier(s) WASM/loader copiés dans src/assets/mediapipe/wasm et public/models/wasm.`);
} catch (error) {
  console.error('Fichiers WASM introuvables ou incomplets. Vérifiez npm install et @mediapipe/tasks-vision.', error);
  process.exitCode = 1;
}

if (process.exitCode !== 1) {
  const existingModel = await stat(modelPath).catch(() => null);
  if (existingModel?.isFile() && existingModel.size > 0) {
    console.log(`Modèle FaceLandmarker déjà présent (${existingModel.size.toLocaleString('fr-FR')} octets), téléchargement ignoré.`);
  } else {
    const response = await fetch(modelUrl);
    if (!response.ok) throw new Error(`Téléchargement du modèle échoué : HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    await writeFile(modelPath, bytes);
    console.log(`Modèle FaceLandmarker installé (${bytes.byteLength.toLocaleString('fr-FR')} octets).`);
  }
}
