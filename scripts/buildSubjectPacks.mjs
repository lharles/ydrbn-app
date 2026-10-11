import fs from 'fs';
import path from 'path';

const SOURCE_DIR = '/mnt/g/creativesNbigstuff/YDRBN/Subjects';
const DEST_BASE = path.resolve('public/content');
const INDEX_PATH = path.join(DEST_BASE, 'index.json');

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source directory not found: ${SOURCE_DIR}`);
  process.exit(1);
}

const folders = fs.readdirSync(SOURCE_DIR).filter(item => {
  return fs.statSync(path.join(SOURCE_DIR, item)).isDirectory();
});

// Load existing index.json
let indexData = { availablePacks: [] };
if (fs.existsSync(INDEX_PATH)) {
  indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
}

// Preserve non-subject packs (words, backdrops)
const activeSubjectPackIds = new Set();

for (const folder of folders) {
  const srcFolderPath = path.join(SOURCE_DIR, folder);
  const files = fs.readdirSync(srcFolderPath).filter(f => f.toLowerCase().endsWith('.png'));

  // Skip folders with no valid PNG images
  if (files.length === 0) {
    console.log(`Skipping empty folder: ${folder}`);
    continue;
  }

  const folderSlug = folder.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const packId = `ydrbn-subject-${folderSlug}`;
  activeSubjectPackIds.add(packId);

  const packFolder = path.join(DEST_BASE, `subject-${folderSlug}`);
  const subjectsTargetDir = path.join(packFolder, 'subjects');

  fs.mkdirSync(subjectsTargetDir, { recursive: true });

  for (const file of files) {
    fs.copyFileSync(path.join(srcFolderPath, file), path.join(subjectsTargetDir, file));
  }

  const cleanTitle = folder.replace(/-ish-(\d+)/i, ' (Vol. $1)').replace(/-/g, ' ');

  const manifest = {
    id: packId,
    name: cleanTitle,
    version: '1.0.0',
    description: `${files.length} curated subject cutouts: ${cleanTitle}.`,
    subjects: files
  };

  fs.writeFileSync(path.join(packFolder, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const registryEntry = {
    id: packId,
    name: cleanTitle,
    manifestUrl: `subject-${folderSlug}/manifest.json`,
    description: `${files.length} curated subject cutouts: ${cleanTitle}.`,
    subjects: files
  };

  const existingIdx = indexData.availablePacks.findIndex(p => p.id === packId);
  if (existingIdx !== -1) {
    indexData.availablePacks[existingIdx] = registryEntry;
  } else {
    indexData.availablePacks.push(registryEntry);
  }

  console.log(`Processed: ${cleanTitle} (${files.length} images)`);
}

// Prune subject packs that no longer exist in the source directory
indexData.availablePacks = indexData.availablePacks.filter(p => {
  if (p.id.startsWith('ydrbn-subject-')) {
    return activeSubjectPackIds.has(p.id);
  }
  return true; // Keep words and backdrop packs
});

fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2));
console.log(`\nRegistry updated. Stale subject packs pruned successfully.`);