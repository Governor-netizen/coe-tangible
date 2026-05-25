import { NodeIO } from '@gltf-transform/core';
import { 
  draco, 
  simplify, 
  weld, 
  prune, 
  dedup, 
  instance,
  resample
} from '@gltf-transform/functions';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'fs';
import path from 'path';

/**
 * Compresses a GLB file using Draco and Meshopt simplification.
 * 
 * Usage: node scripts/compress-model.js path/to/model.glb
 */

async function compressModel(inputPath) {
  if (!inputPath) {
    console.error('Please provide a path to a GLB file.');
    process.exit(1);
  }

  const absolutePath = path.resolve(inputPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const outputDir = path.dirname(absolutePath);
  const ext = path.extname(absolutePath);
  const baseName = path.basename(absolutePath, ext);
  const outputPath = path.join(outputDir, `${baseName}-optimized${ext}`);

  console.log(`🚀 Compressing: ${absolutePath}`);
  
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const document = await io.read(absolutePath);

  // Apply optimizations
  await document.transform(
    // Remove duplicate vertices
    weld(),
    // Simplify meshes
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.75, error: 0.001 }),
    // Remove unused data
    prune(),
    // Deduplicate data
    dedup(),
    // Use instancing for identical meshes
    instance(),
    // Re-sample animations
    resample(),
    // Apply Draco mesh compression
    draco()
  );

  await io.write(outputPath, document);

  const stats = fs.statSync(absolutePath);
  const newStats = fs.statSync(outputPath);
  
  console.log(`✅ Success!`);
  console.log(`Original: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized: ${(newStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved to: ${outputPath}`);
}

const fileArg = process.argv[2];
compressModel(fileArg).catch((err) => {
  console.error('Compression failed:', err);
  process.exit(1);
});
