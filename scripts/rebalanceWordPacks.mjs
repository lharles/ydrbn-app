import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const CONTENT_DIR = path.join(ROOT, 'public/content');
const INDEX_JSON_PATH = path.join(CONTENT_DIR, 'index.json');
const HARDWARE_DIR = path.join(CONTENT_DIR, 'word-domestic-hardware');

if (!fs.existsSync(HARDWARE_DIR)) {
  console.error(`Could not locate: ${HARDWARE_DIR}`);
  process.exit(1);
}

// 1. Load the bloated domestic hardware pool
const hardwareData = JSON.parse(fs.readFileSync(path.join(HARDWARE_DIR, 'words.json'), 'utf-8'));
const { nouns = [], adjectives = [], ensembles = [] } = hardwareData;

console.log(`Analyzing ${nouns.length} raw nouns in domestic hardware...`);

// 2. Thematic classification filters
const ANATOMY_REGEX = /ear|earlobe|elbow|face|finger|claw|ganglia|knuckle|tooth|teeth|molar|jaw|spine|cartilage|bone|skull|duodenum|appendix|coccyx|ventricle|stomach|organ|gut|throat|neck|shoulder|torso|ankle|toe|belly|eardrum|earwax|fart|barf|booger|turd|hemorrhoid|sneeze|spasm|headache|blister|swelling|bruise|dander|hairball|liver|kidney/i;

const SCIENCE_REGEX = /abacus|calculator|calculus|logarithm|algorithm|laserdisc|neutron|molecule|atom|isotope|quasar|antimatter|antigravity|equation|coefficient|entropy|thermodynamic|formula|geometry|trapezoid|dodecahedron|triangle|cylinder|radius|circumference|wireframe|circuit|transistor|volts|joules|barium|helium|arsenic|caliper|compass|protractor|microscope|spectrometer|centrifuge|telescope|radar|satellite|terminal|vector/i;

const domesticNouns = [];
const anatomicalNouns = [];
const scienceNouns = [];

nouns.forEach((noun) => {
  if (ANATOMY_REGEX.test(noun)) {
    anatomicalNouns.push(noun);
  } else if (SCIENCE_REGEX.test(noun)) {
    scienceNouns.push(noun);
  } else {
    domesticNouns.push(noun);
  }
});

// 3. Define the three resulting packs
const refinedPacks = [
  {
    folder: 'word-domestic-hardware',
    id: 'ydrbn-word-domestic-hardware',
    name: 'Basement Hardware & Domestic Curios',
    description: `${domesticNouns.length} everyday fixtures, tools, furniture oddities, and household maintenance relics.`,
    nouns: domesticNouns,
    adjectives: [],
    ensembles: []
  },
  {
    folder: 'word-anatomical',
    id: 'ydrbn-word-anatomical',
    name: 'Clinical Anomalies & Bodily Woes',
    description: `${anatomicalNouns.length} awkward anatomy, clinical ailments, and minor physiological inconveniences.`,
    nouns: anatomicalNouns,
    adjectives: [],
    ensembles: []
  },
  {
    folder: 'word-science',
    id: 'ydrbn-word-science',
    name: 'Obsolete Science & Abstract Nonsense',
    description: `${scienceNouns.length} antiquated laboratory gear, drafting formulas, and speculative calculations.`,
    nouns: scienceNouns,
    adjectives: [],
    ensembles: []
  }
];

// Distribute adjectives & ensembles round-robin so all 3 packs run smoothly on their own
adjectives.forEach((adj, idx) => {
  refinedPacks[idx % refinedPacks.length].adjectives.push(adj);
});

ensembles.forEach((ens, idx) => {
  refinedPacks[idx % refinedPacks.length].ensembles.push(ens);
});

// 4. Write pack directories, manifests, and word dictionaries
refinedPacks.forEach((p) => {
  const targetDir = path.join(CONTENT_DIR, p.folder);
  fs.mkdirSync(targetDir, { recursive: true });

  const manifest = {
    id: p.id,
    name: p.name,
    version: '1.0.0',
    description: p.description,
    words: 'words.json'
  };

  const wordsPayload = {
    nouns: p.nouns,
    adjectives: p.adjectives,
    ensembles: p.ensembles
  };

  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(targetDir, 'words.json'), JSON.stringify(wordsPayload, null, 2));
  console.log(`Configured [${p.name}]: ${p.nouns.length} nouns, ${p.adjectives.length} adjs, ${p.ensembles.length} ensembles.`);
});

// 5. Update public/content/index.json registry
let indexData = { availablePacks: [] };
if (fs.existsSync(INDEX_JSON_PATH)) {
  indexData = JSON.parse(fs.readFileSync(INDEX_JSON_PATH, 'utf-8'));
}

refinedPacks.forEach((p) => {
  const entry = {
    id: p.id,
    name: p.name,
    manifestUrl: `${p.folder}/manifest.json`,
    description: p.description,
    words: true
  };

  const existingIdx = indexData.availablePacks.findIndex((item) => item.id === p.id);
  if (existingIdx !== -1) {
    indexData.availablePacks[existingIdx] = entry;
  } else {
    indexData.availablePacks.push(entry);
  }
});

fs.writeFileSync(INDEX_JSON_PATH, JSON.stringify(indexData, null, 2));
console.log(`\nRegistry updated successfully at: ${INDEX_JSON_PATH}`);