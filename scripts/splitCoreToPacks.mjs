import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const DATA_FILE = path.join(ROOT, 'src/data/customWords.ts');
const PUBLIC_CONTENT = path.join(ROOT, 'public/content');
const ASSETS_DIR = path.join(ROOT, 'public/assets');
const INDEX_JSON = path.join(PUBLIC_CONTENT, 'index.json');

// 1. Semantic override anchors that must NEVER be stripped from core
const PROTECTED_TERMS = new Set([
  'molar', 'tooth', 'teeth', 'dentist', 'dental', 'enamel', 'incisor', 'bicuspid', 'cavity', 'fangs',
  'magnet', 'magnets', 'magnetic', 'magnetism', 'polar', 'polarity', 'horseshoe', 'repulsion',
  'pants', 'trousers', 'slacks', 'dungarees', 'jeans', 'overalls',
  'bed', 'insomnia', 'mattress', 'pillow', 'slumber', 'sleep', 'bedtime',
  'cheese', 'cheddar', 'swiss', 'gouda', 'curds', 'parmesan', 'dairy', 'brie',
  'ear', 'ears', 'earlobe', 'auditory', 'hearing', 'sprained',
  'anvil', 'blacksmith', 'forge', 'hammer',
  'skull', 'skeleton', 'bones', 'cranium', 'death',
  'crown', 'coronation', 'royalty', 'monarch', 'king', 'queen',
  'bomb', 'dynamite', 'explosive', 'blast',
  'angry', 'furious', 'rage', 'hostile',
  'sneaky', 'thief', 'stealth', 'crook',
  'confused', 'puzzled', 'baffled', 'enigma',
  'desert', 'dunes', 'sand', 'cactus',
  'forest', 'woods', 'pine', 'trees',
  'city', 'urban', 'skyline', 'metropolis',
  'traffic', 'gridlock', 'freeway',
  'space', 'cosmic', 'orbit', 'astral',
  'blueprint', 'schematic', 'technical', 'drafting'
]);

function isProtected(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return PROTECTED_TERMS.has(clean);
}

// 2. Load arrays from customWords.ts
const fileText = fs.readFileSync(DATA_FILE, 'utf-8');

function extractArray(name) {
  const match = fileText.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!match) return [];
  return match[1]
    .split(',')
    .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

const allAdjectives = extractArray('CUSTOM_ADJECTIVES');
const allNouns = extractArray('CUSTOM_NOUNS');
const allEnsembles = extractArray('CUSTOM_ENSEMBLES');
const allSubjects = extractArray('CUSTOM_IMAGE_SUBJECTS');
const allBackdrops = extractArray('CUSTOM_IMAGE_BACKDROPS');

// 3. Classify vocabulary into Core vs. Packs
const adminAdj = [], absurdityAdj = [], coreAdj = [];
const adminNouns = [], absurdityNouns = [], coreNouns = [];
const adminEnsembles = [], absurdityEnsembles = [], coreEnsembles = [];

const adminRegex = /bureau|admin|litig|complian|notar|procedur|offic|record|statut|mandat|subcommit|jurisdict|contract|nonbind/i;

allAdjectives.forEach((adj, idx) => {
  if (isProtected(adj)) {
    coreAdj.push(adj);
  } else if (adminRegex.test(adj)) {
    adminAdj.push(adj);
  } else if (idx % 2 === 0) {
    absurdityAdj.push(adj);
  } else {
    coreAdj.push(adj);
  }
});

allNouns.forEach((noun, idx) => {
  if (isProtected(noun)) {
    coreNouns.push(noun);
  } else if (adminRegex.test(noun)) {
    adminNouns.push(noun);
  } else if (idx % 2 === 0) {
    absurdityNouns.push(noun);
  } else {
    coreNouns.push(noun);
  }
});

allEnsembles.forEach((ens, idx) => {
  if (isProtected(ens)) {
    coreEnsembles.push(ens);
  } else if (adminRegex.test(ens)) {
    adminEnsembles.push(ens);
  } else if (idx % 2 === 0) {
    absurdityEnsembles.push(ens);
  } else {
    coreEnsembles.push(ens);
  }
});

// 4. Split Subjects: move custom_subject_01..50 to pack
const packSubjects = allSubjects.filter(s => s.startsWith('custom_subject_'));
const coreSubjects = allSubjects.filter(s => !s.startsWith('custom_subject_'));

// 5. Create Directory & Manifest Helpers
function writePack(folder, manifest, wordsData, subjectFiles = []) {
  const dir = path.join(PUBLIC_CONTENT, folder);
  fs.mkdirSync(dir, { recursive: true });

  if (wordsData) {
    fs.writeFileSync(path.join(dir, 'words.json'), JSON.stringify(wordsData, null, 2));
    manifest.words = 'words.json';
  }

  if (subjectFiles.length > 0) {
    const subjDir = path.join(dir, 'subjects');
    fs.mkdirSync(subjDir, { recursive: true });
    subjectFiles.forEach(file => {
      const src = path.join(ASSETS_DIR, file);
      const dest = path.join(subjDir, file);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
      }
    });
    manifest.subjects = subjectFiles;
  }

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

// Write Word Pack 1: Administrative
writePack('word-administrative', {
  id: 'ydrbn-word-administrative',
  name: 'Administrative & Regulatory Words',
  version: '1.0.0',
  description: `${adminAdj.length + adminNouns.length + adminEnsembles.length} procedural filings, mandates, and bureaucratic terminology.`
}, { adjectives: adminAdj, nouns: adminNouns, ensembles: adminEnsembles });

// Write Word Pack 2: Absurdity
writePack('word-absurdity', {
  id: 'ydrbn-word-absurdity',
  name: 'Domestic & Surreal Absurdities',
  version: '1.0.0',
  description: `${absurdityAdj.length + absurdityNouns.length + absurdityEnsembles.length} surreal domestic nouns, kitchen tools, and peculiar modifiers.`
}, { adjectives: absurdityAdj, nouns: absurdityNouns, ensembles: absurdityEnsembles });

// Write Subject Pack: Vault Curiosities
writePack('subject-vault-curiosities', {
  id: 'ydrbn-subject-vault-curiosities',
  name: 'Vault Curiosities (Vol. 01)',
  version: '1.0.0',
  description: `${packSubjects.length} classic auxiliary subject cutouts extracted from the core vault.`
}, null, packSubjects);

// 6. Register Packs in index.json
let indexData = { availablePacks: [] };
if (fs.existsSync(INDEX_JSON)) {
  indexData = JSON.parse(fs.readFileSync(INDEX_JSON, 'utf-8'));
}

const newEntries = [
  {
    id: 'ydrbn-word-administrative',
    name: 'Administrative & Regulatory Words',
    manifestUrl: 'word-administrative/manifest.json',
    description: `${adminAdj.length + adminNouns.length + adminEnsembles.length} procedural filings, mandates, and bureaucratic terminology.`
  },
  {
    id: 'ydrbn-word-absurdity',
    name: 'Domestic & Surreal Absurdities',
    manifestUrl: 'word-absurdity/manifest.json',
    description: `${absurdityAdj.length + absurdityNouns.length + absurdityEnsembles.length} surreal domestic nouns, kitchen tools, and peculiar modifiers.`
  },
  {
    id: 'ydrbn-subject-vault-curiosities',
    name: 'Vault Curiosities (Vol. 01)',
    manifestUrl: 'subject-vault-curiosities/manifest.json',
    description: `${packSubjects.length} classic auxiliary subject cutouts extracted from the core vault.`,
    subjects: packSubjects
  }
];

newEntries.forEach(entry => {
  const existingIdx = indexData.availablePacks.findIndex(p => p.id === entry.id);
  if (existingIdx !== -1) {
    indexData.availablePacks[existingIdx] = entry;
  } else {
    indexData.availablePacks.push(entry);
  }
});

fs.writeFileSync(INDEX_JSON, JSON.stringify(indexData, null, 2));

// 7. Write back trimmed src/data/customWords.ts
function formatArray(arr) {
  return '[\n  ' + arr.map(w => `'${w.replace(/'/g, "\\'")}'`).join(',\n  ') + '\n];';
}

const updatedSource = `// src/data/customWords.ts - Core Streamlined Dataset

export const CUSTOM_ADJECTIVES = ${formatArray(coreAdj)}

export const CUSTOM_NOUNS = ${formatArray(coreNouns)}

export const CUSTOM_ENSEMBLES = ${formatArray(coreEnsembles)}

export const CUSTOM_IMAGE_SUBJECTS = ${formatArray(coreSubjects)}

export const CUSTOM_IMAGE_BACKDROPS = ${formatArray(allBackdrops)}
`;

fs.writeFileSync(DATA_FILE, updatedSource, 'utf-8');

console.log('--- Migration Completed Successfully ---');
console.log(`Core Adjectives: ${allAdjectives.length} -> ${coreAdj.length} (Extracted: ${adminAdj.length + absurdityAdj.length})`);
console.log(`Core Nouns:      ${allNouns.length} -> ${coreNouns.length} (Extracted: ${adminNouns.length + absurdityNouns.length})`);
console.log(`Core Ensembles:  ${allEnsembles.length} -> ${coreEnsembles.length} (Extracted: ${adminEnsembles.length + absurdityEnsembles.length})`);
console.log(`Core Subjects:   ${allSubjects.length} -> ${coreSubjects.length} (Extracted: ${packSubjects.length})`);