import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const CONTENT_DIR = path.join(ROOT, 'public/content');
const ABSURDITY_DIR = path.join(CONTENT_DIR, 'word-absurdity');
const WORDS_JSON_PATH = path.join(ABSURDITY_DIR, 'words.json');
const INDEX_JSON_PATH = path.join(CONTENT_DIR, 'index.json');

if (!fs.existsSync(WORDS_JSON_PATH)) {
  console.error(`Could not find source file: ${WORDS_JSON_PATH}`);
  process.exit(1);
}

// 1. Load the 865-item absurdity payload
const sourceWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf-8'));
const { adjectives = [], nouns = [], ensembles = [] } = sourceWords;

console.log(`Loaded ${nouns.length} nouns, ${adjectives.length} adjectives, ${ensembles.length} ensembles.`);

// 2. Thematic classification patterns
const CULINARY_REGEX = /biscuit|bagel|pancake|waffle|pastr|pie|cake|crumpet|muffin|bread|toast|croissant|dumpling|cabbage|pickle|garbanzo|bean|hummus|cheese|cheddar|brie|gouda|curd|soup|stew|broth|gravy|meat|sausage|frankfurter|hotdog|sardine|anchovy|eggplant|zucchini|tomato|celery|broccoli|turnip|fennel|garlic|onion|kumquat|apple|banana|fruit|yam|potato|custard|pudding|yogurt|cream|mayo|mustard|relish|tamale|quiche|enchilada|snack|cookie|candy|jello|whisk|spoon|fork|knife|blender|grater|peeler|skillet|mortar|pestle|apron|tablecloth|napkin|breakfast|lunch|dinner|feast|leftover|culinary|edible/i;

const WILDLIFE_REGEX = /badger|wombat|lemur|sloth|hamster|gerbil|rat|mouse|rodent|squirrel|chipmunk|beaver|dog|canine|cat|feline|leopard|puma|koala|capybara|dolphin|manatee|whale|shark|goldfish|fish|trout|sardine|salmon|turtle|toad|frog|salamander|newt|alligator|crocodile|dinosaur|reptile|lizard|snake|pigeon|seagull|duck|chicken|rooster|turkey|ostrich|flamingo|penguin|bird|crow|raven|owl|falcon|beetle|locust|spider|wasp|bee|hornet|ant|caterpillar|butterfly|moth|larva|bug|insect|cricket|flea|tick|barnacle|crab|lobster|shrimp|squid|octopus|jellyfish|hydra|dragon|goblin|creature|critter|beast|ferocious|predat/i;

const culinaryNouns = [];
const wildlifeNouns = [];
const domesticNouns = [];

nouns.forEach((noun) => {
  if (CULINARY_REGEX.test(noun)) {
    culinaryNouns.push(noun);
  } else if (WILDLIFE_REGEX.test(noun)) {
    wildlifeNouns.push(noun);
  } else {
    domesticNouns.push(noun);
  }
});

// 3. Round-robin distribution of adjectives and ensembles so all 3 packs are self-sufficient
const packs = [
  {
    folder: 'word-culinary',
    id: 'ydrbn-word-culinary',
    name: 'Culinary Oddities & Kitchen Crimes',
    description: `${culinaryNouns.length} gastronomy-adjacent nouns, cooking tools, and expired pantry staples.`,
    nouns: culinaryNouns,
    adjectives: [],
    ensembles: []
  },
  {
    folder: 'word-wildlife',
    id: 'ydrbn-word-wildlife',
    name: 'Suspicious Wildlife & Bog Critters',
    description: `${wildlifeNouns.length} stubborn fauna, backyard pests, and uncooperative creatures.`,
    nouns: wildlifeNouns,
    adjectives: [],
    ensembles: []
  },
  {
    folder: 'word-domestic-hardware',
    id: 'ydrbn-word-domestic-hardware',
    name: 'Basement Hardware & Domestic Curios',
    description: `${domesticNouns.length} mundane household tools, furniture oddities, and domestic relics.`,
    nouns: domesticNouns,
    adjectives: [],
    ensembles: []
  }
];

adjectives.forEach((adj, idx) => {
  packs[idx % packs.length].adjectives.push(adj);
});

ensembles.forEach((ens, idx) => {
  packs[idx % packs.length].ensembles.push(ens);
});

// 4. Write new pack directories and manifests
packs.forEach((p) => {
  const targetDir = path.join(CONTENT_DIR, p.folder);
  fs.mkdirSync(targetDir, { recursive: true });

  const manifest = {
    id: p.id,
    name: p.name,
    version: '1.0.0',
    description: p.description,
    words: 'words.json'
  };

  const wordsData = {
    nouns: p.nouns,
    adjectives: p.adjectives,
    ensembles: p.ensembles
  };

  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(targetDir, 'words.json'), JSON.stringify(wordsData, null, 2));
  console.log(`Created [${p.name}]: ${p.nouns.length} nouns, ${p.adjectives.length} adjs, ${p.ensembles.length} ensembles.`);
});

// 5. Update index.json (remove monolithic absurdity pack, register the 3 new packs)
let indexData = { availablePacks: [] };
if (fs.existsSync(INDEX_JSON_PATH)) {
  indexData = JSON.parse(fs.readFileSync(INDEX_JSON_PATH, 'utf-8'));
}

// Prune old word-absurdity entry
indexData.availablePacks = indexData.availablePacks.filter((p) => p.id !== 'ydrbn-word-absurdity');

// Register the three new packs
packs.forEach((p) => {
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

// 6. Delete old monolithic word-absurdity folder
fs.rmSync(ABSURDITY_DIR, { recursive: true, force: true });
console.log(`\nRemoved old monolithic pack: ${ABSURDITY_DIR}`);
console.log(`Updated ${INDEX_JSON_PATH} with 3 focused packs.`);