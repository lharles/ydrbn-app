/**
 * Dynamic Procedural Generator
 * Generates infinite new original bands and visual gags matching the classic
 * surreal deadpan cartoon style entirely client-side (<50ms).
 */

import {
  CUSTOM_ADJECTIVES,
  CUSTOM_NOUNS,
  CUSTOM_ENSEMBLES,
  CUSTOM_IMAGE_SUBJECTS,
  CUSTOM_IMAGE_BACKDROPS,
} from '../data/customWords';
import { getAllInstalledPacks } from './packStorage';
import { getPreferences } from './preferencesService';
import {
  AlbumEntry,
  BackdropType,
  CanvasRecipe,
  CustomDropInput,
  GagArchetype,
  GagModifierType,
  HypeSticker,
  SubjectVectorType,
  TitleFontFamily,
  TitleShadowStyle,
  TitleComposition,
  VintagePaletteName,
} from '../types';
import { gagCanvasEngine } from './gagCanvasEngine';
import { loadRecipeAssets } from './assetManager';
// 1. Add this import at the top of src/services/proceduralGenerator.ts (right below `./assetManager`):
import { harvestCustomDropToPack } from './contentPackService';

// ---------------------------------------------------------
// LINGUISTIC & GRAMMAR INFLECTION HELPERS
// ---------------------------------------------------------

const TRUE_LY_ADJECTIVES = new Set([
  'lonely', 'portly', 'friendly', 'lovely', 'silly', 'ugly', 'deadly',
  'likely', 'unlikely', 'costly', 'ghastly', 'oily', 'holy', 'chilly',
  'curly', 'burly', 'surly', 'orderly', 'disorderly', 'timely', 'untimely',
  'elderly', 'cowardly', 'miserly', 'heavenly', 'earthly', 'bodily',
  'comely', 'homely', 'prickly', 'sparkly', 'crumbly', 'bubbly', 'wobbly',
  'wiggly', 'squiggly', 'snuggly', 'cuddly', 'drooly', 'cranky', 'fussy',
  'wibbly', 'drangly', 'zibbly', 'whiffly', 'snorfy', 'yowly', 'smelly',
]);

const NON_LY_ADVERBS = new Set([
  'just', 'together', 'hardly', 'almost', 'quite', 'very', 'too-much',
]);

export function isAdverbWord(word: string): boolean {
  const clean = word.trim().toLowerCase();
  if (!clean || clean.includes('/') || clean.includes(' ')) return false;
  if (NON_LY_ADVERBS.has(clean)) return true;
  if (clean.endsWith('ly') && clean.length > 4 && !TRUE_LY_ADJECTIVES.has(clean)) {
    return true;
  }
  return false;
}

const UNCOUNTABLE_NOUNS = new Set([
  'soap', 'cheese', 'cheddar', 'gouda', 'hummus', 'soup', 'gravy', 'jello',
  'custard', 'yogurt', 'pate', 'marmalade', 'gelatin', 'aspic', 'butter',
  'margarine', 'mayonnaise', 'vinegar', 'mustard', 'ketchup', 'relish',
  'seltzer', 'lard', 'curd', 'sucrose', 'sarsaparilla', 'creamer', 'succotash',
  'headcheese', 'meatcake', 'cream', 'milk', 'coffee', 'tea', 'water', 'ice',
  'bread', 'toast', 'pizza', 'pasta', 'rice', 'cereal', 'oatmeal', 'pudding',
  'fudge', 'candy', 'chocolate', 'licorice', 'gum', 'garlic', 'kale',
  'spinach', 'broccoli', 'celery', 'corn', 'cabbage', 'beef', 'pork', 'meat',
  'bacon', 'ham', 'poultry', 'fish', 'barf', 'sludge', 'muck', 'dung',
  'effluent', 'flatulence', 'dander', 'lint', 'dust', 'dirt', 'mud', 'sand',
  'gravel', 'cement', 'concrete', 'asphalt', 'plaster', 'spackle', 'grout',
  'drywall', 'terrazzo', 'burlap', 'weatherstripping', 'flannel', 'velvet',
  'corduroy', 'denim', 'linen', 'wool', 'cotton', 'nylon', 'polyester',
  'vinyl', 'plastic', 'rubber', 'latex', 'cellophane', 'foil', 'tape',
  'glue', 'paste', 'paint', 'ink', 'grease', 'oil', 'gas', 'steam', 'smoke',
  'fog', 'weather', 'thunder', 'lightning', 'rain', 'snow', 'sunlight',
  'moonlight', 'space', 'gravity', 'antimatter', 'barium', 'aluminum',
  'iron', 'steel', 'brass', 'copper', 'zinc', 'tin', 'lead', 'gold', 'silver',
  'rust', 'mold', 'mildew', 'lichen', 'moss', 'grass', 'hay', 'straw',
  'timber', 'lumber', 'wood', 'cardboard', 'paper', 'paperwork', 'postage',
  'trash', 'garbage', 'rubbish', 'debris', 'wreckage', 'waste', 'loot',
  'cash', 'money', 'change', 'currency', 'credit', 'debt', 'inflation',
  'insurance', 'interest', 'profit', 'revenue', 'surplus', 'deficit',
  'budget', 'commerce', 'trade', 'traffic', 'gridlock', 'transit',
  'luggage', 'baggage', 'furniture', 'equipment', 'machinery', 'hardware',
  'software', 'data', 'code', 'music', 'jazz', 'funk', 'soul', 'rock',
  'punk', 'disco', 'techno', 'static', 'noise', 'silence', 'applause',
  'feedback', 'reverb', 'treble', 'bass', 'harmony', 'rhythm', 'tempo',
  'folklore', 'mythology', 'history', 'science', 'physics', 'chemistry',
  'biology', 'anatomy', 'geometry', 'calculus', 'algebra', 'arithmetic',
  'math', 'mathematics', 'logic', 'reason', 'philosophy', 'politics',
  'economics', 'law', 'justice', 'compliance', 'protocol', 'bureaucracy',
  'administration', 'management', 'supervision', 'oversight', 'logistics',
  'procurement', 'maintenance', 'construction', 'demolition', 'horticulture',
  'agriculture', 'taxidermy', 'dentistry', 'surgery', 'therapy', 'medicine',
  'first-aid', 'hygiene', 'sanitation', 'plumbing', 'wiring', 'heating',
  'traction', 'friction', 'tension', 'compression', 'torsion', 'velocity',
  'momentum', 'inertia', 'entropy', 'chaos', 'anarchy', 'order', 'peace',
  'war', 'doom', 'death', 'life', 'fate', 'destiny', 'luck', 'fortune',
  'fame', 'glory', 'victory', 'defeat', 'triumph', 'disaster', 'catastrophe',
  'havoc', 'mayhem', 'bedlam', 'pandemonium', 'confusion', 'hysteria',
  'panic', 'terror', 'dread', 'fear', 'angst', 'grief', 'sorrow', 'misery',
  'woe', 'pain', 'agony', 'despair', 'regret', 'remorse', 'guilt', 'shame',
  'blame', 'spite', 'malice', 'venom', 'wrath', 'rage', 'fury', 'anger',
  'ire', 'envy', 'jealousy', 'greed', 'sloth', 'laziness', 'apathy',
  'indifference', 'boredom', 'ennui', 'insomnia', 'fatigue', 'exhaustion',
  'nausea', 'vertigo', 'amnesia', 'paranoia', 'delusion', 'illusion',
  'hallucination', 'fantasy', 'imagination', 'memory', 'nostalgia',
  'longing', 'yearning', 'desire', 'passion', 'love', 'joy', 'bliss',
  'mirth', 'glee', 'euphoria', 'optimism', 'pessimism', 'cynicism',
  'irony', 'sarcasm', 'satire', 'wit', 'humor', 'nonsense', 'absurdity',
  'folly', 'idiocy', 'stupidity', 'madness', 'insanity', 'sanity',
  'wisdom', 'knowledge', 'genius', 'talent', 'skill', 'craft', 'art',
  'poetry', 'prose', 'fiction', 'truth', 'honesty', 'integrity', 'honor',
  'dignity', 'pride', 'vanity', 'ego', 'hubris', 'modesty', 'humility',
  'grace', 'charm', 'style', 'fashion', 'taste', 'class', 'luxury',
  'opulence', 'wealth', 'poverty', 'thrift', 'efficiency', 'patience',
  'courage', 'valor', 'grit', 'gumption', 'moxie', 'chutzpah', 'nerve',
  'pluck', 'spit', 'sweat', 'blood', 'bile', 'phlegm', 'mucus', 'saliva',
  'earwax', 'dandruff', 'scurf', 'plaque', 'tartar', 'cartilage', 'bone',
  'flesh', 'skin', 'hair', 'fur', 'stubble', 'perspiration',
  'condensation', 'evaporation', 'precipitation', 'humidity', 'moisture',
  'vapor', 'ozone', 'oxygen', 'helium', 'neon', 'argon', 'radon',
  'carbon', 'nitrogen', 'hydrogen', 'uranium', 'plutonium', 'arsenic',
  'cyanide', 'asbestos', 'fiberglass', 'styrofoam', 'celluloid', 'bakelite',
  'formica', 'linoleum', 'astroturf', 'velcro', 'teflon', 'kevlar',
  'toothpaste', 'mouthwash', 'shampoo', 'lotion', 'ointment', 'liniment',
  'salve', 'balm', 'aspirin', 'insulin', 'cortisone', 'penicillin',
  'caffeine', 'nicotine', 'alcohol', 'ether', 'chloroform', 'formaldehyde',
  'ammonia', 'bleach', 'detergent', 'starch', 'wax', 'polish', 'varnish',
  'lacquer', 'shellac', 'enamel', 'glaze', 'frosting', 'icing', 'syrup',
  'molasses', 'honey', 'jam', 'jelly', 'chutney',
  'salsa', 'guacamole', 'pesto', 'tahini', 'tofu', 'tempeh',
  'seitan', 'quinoa', 'couscous', 'polenta', 'grits', 'porridge',
  'gruel', 'broth', 'bouillon', 'consomme', 'chowder', 'gumbo', 'chili',
  'stew', 'goulash', 'hash', 'scrapple', 'haggis', 'lutefisk', 'kimchi',
  'sauerkraut', 'coleslaw', 'macaroni', 'spaghetti', 'lasagna', 'ravioli',
  'gnocchi', 'sushi', 'sashimi', 'tempura', 'ramen', 'udon', 'pho',
  'worcestershire', 'kombucha', 'buttermilk', 'eggnog',
  'lemonade', 'cider', 'punch', 'grog', 'mead', 'ale', 'beer', 'stout',
  'wine', 'champagne', 'vermouth', 'sherry', 'port', 'brandy', 'cognac',
  'whiskey', 'bourbon', 'scotch', 'rye', 'gin', 'vodka', 'rum', 'tequila',
  'absinthe', 'moonshine', 'turpentine', 'kerosene', 'gasoline', 'diesel',
  'propane', 'butane', 'methane', 'freon', 'napalm', 'gunpowder', 'dynamite',
  'tnt', 'nitroglycerin', 'confetti', 'glitter', 'tinsel', 'bunting',
  'lace', 'ribbon', 'twine', 'string', 'yarn', 'thread', 'floss', 'rope',
  'wire', 'cable', 'chain', 'mesh', 'netting', 'chicken-wire', 'barbed-wire',
  'duct-tape', 'masking-tape', 'scotch-tape', 'sandpaper', 'steel-wool',
  'charcoal', 'chalk', 'crayon', 'pastel', 'watercolor', 'gouache', 'acrylic',
  'tempera', 'fresco', 'mosaic', 'origami', 'macrame',
  'pottery', 'ceramics', 'porcelain', 'china', 'glassware', 'silverware',
  'flatware', 'cutlery', 'crockery', 'tupperware', 'lupperware', 'cookware',
  'ironware', 'tinware', 'stoneware', 'earthenware', 'footwear',
  'headwear', 'eyewear', 'underwear', 'outerwear', 'nightwear', 'swimwear',
  'menswear', 'womenswear', 'sportswear', 'workwear', 'knitwear', 'neckwear',
  'hosiery', 'lingerie', 'haberdashery', 'millinery', 'upholstery', 'drapery',
  'bedding', 'laundry', 'washing', 'ironing', 'cleaning', 'dusting',
  'sweeping', 'mopping', 'vacuuming', 'gardening', 'weeding', 'mowing',
  'pruning', 'mulching', 'composting', 'recycling', 'packaging', 'shipping',
  'handling', 'receiving', 'billing', 'invoicing', 'accounting', 'auditing',
  'bookkeeping', 'filing', 'typing', 'shorthand', 'stenography', 'telegraphy',
  'telephony', 'broadcasting', 'publishing', 'printing', 'binding', 'lithography',
  'photography', 'cinematography', 'choreography', 'calligraphy', 'cartography',
  'topography', 'geography', 'geology', 'meteorology', 'astronomy', 'astrology',
  'cosmology', 'theology', 'sociology', 'psychology', 'psychiatry',
  'neurology', 'cardiology', 'dermatology', 'urology', 'proctology', 'podiatry',
  'optometry', 'orthodontics', 'prosthetics', 'ergonomics', 'cybernetics',
  'robotics', 'bionics', 'genetics', 'eugenics', 'cryogenics', 'pyrotechnics',
  'acoustics', 'optics', 'thermodynamics', 'aerodynamics', 'hydrodynamics',
  'electrodynamics', 'quantum-mechanics', 'astrophysics', 'geophysics',
  'biophysics', 'biochemistry', 'microbiology', 'virology', 'bacteriology',
  'parasitology', 'entomology', 'ornithology', 'ichthyology', 'herpetology',
  'mammalogy', 'primatology', 'anthropology', 'archaeology', 'paleontology',
  'etymology', 'philology', 'linguistics', 'semantics', 'pragmatics', 'phonetics',
  'stylistics', 'rhetoric', 'dialectics', 'hermeneutics', 'epistemology',
  'ontology', 'metaphysics', 'ethics', 'aesthetics', 'poetics', 'homiletics',
  'apologetics', 'eschatology', 'demonology', 'ufology', 'cryptozoology',
  'phrenology', 'graphology', 'numerology', 'almanac', 'solitude', 'trepidation',
  'tendonitis', 'sciatica', 'arthritis', 'bronchitis', 'tonsillitis', 'appendicitis',
  'gingivitis', 'halitosis', 'psoriasis', 'eczema', 'scurvy', 'rickets', 'gout',
  'lumbago', 'lockjaw', 'tetanus', 'rabies', 'mumps', 'measles', 'shingles',
  'hives', 'itch', 'rash', 'croup', 'colic', 'dyspepsia', 'indigestion',
  'heartburn', 'constipation', 'diarrhea', 'dysentery', 'cholera',
  'typhoid', 'malaria', 'leprosy', 'plague', 'pestilence', 'famine',
  'drought', 'blight', 'rot', 'decay', 'corrosion', 'erosion', 'attrition',
  'sedition', 'treason', 'mutiny', 'rebellion', 'revolution', 'insurrection',
  'upheaval', 'turmoil', 'strife', 'discord', 'dissent', 'faction',
  'paradise', 'south', 'whether', 'inquiry', 'enquiry', 'honking', 'zipping',
]);

const IRREGULAR_PLURALS: Record<string, string> = {
  tooth: 'teeth',
  foot: 'feet',
  goose: 'geese',
  mouse: 'mice',
  louse: 'lice',
  man: 'men',
  woman: 'women',
  child: 'children',
  person: 'people',
  ox: 'oxen',
  cactus: 'cacti',
  fungus: 'fungi',
  nucleus: 'nuclei',
  radius: 'radii',
  stimulus: 'stimuli',
  alumnus: 'alumni',
  octopus: 'octopuses',
  hippopotamus: 'hippos',
  appendix: 'appendices',
  index: 'indices',
  matrix: 'matrices',
  vortex: 'vortices',
  vertex: 'vertices',
  crisis: 'crises',
  thesis: 'theses',
  hypothesis: 'hypotheses',
  oasis: 'oases',
  parenthesis: 'parentheses',
  synopsis: 'synopses',
  analysis: 'analyses',
  diagnosis: 'diagnoses',
  ellipsis: 'ellipses',
  phenomenon: 'phenomena',
  criterion: 'criteria',
  automaton: 'automata',
  bacterium: 'bacteria',
  datum: 'data',
  erratum: 'errata',
  stratum: 'strata',
  memorandum: 'memoranda',
  curriculum: 'curricula',
  amoeba: 'amoebas',
  nebula: 'nebulae',
  vertebra: 'vertebrae',
  larva: 'larvae',
  pupa: 'pupae',
  antenna: 'antennae',
  formula: 'formulas',
  loaf: 'loaves',
  leaf: 'leaves',
  thief: 'thieves',
  sheaf: 'sheaves',
  half: 'halves',
  calf: 'calves',
  elf: 'elves',
  shelf: 'shelves',
  wolf: 'wolves',
  knife: 'knives',
  wife: 'wives',
  life: 'lives',
  scarf: 'scarves',
  wharf: 'wharves',
  hoof: 'hooves',
  potato: 'potatoes',
  tomato: 'tomatoes',
  torpedo: 'torpedoes',
  veto: 'vetoes',
  embargo: 'embargoes',
  hero: 'heroes',
  echo: 'echoes',
  volcano: 'volcanoes',
  tornado: 'tornadoes',
  mosquito: 'mosquitoes',
  buffalo: 'buffaloes',
  cargo: 'cargoes',
  motto: 'mottoes',
  grotto: 'grottoes',
};

export function isMassOrAbstractNoun(word: string): boolean {
  const lower = word.trim().toLowerCase();
  if (!lower) return true;
  if (UNCOUNTABLE_NOUNS.has(lower)) return true;

  if (
    lower.endsWith('s') &&
    !lower.endsWith('ss') &&
    !lower.endsWith('us') &&
    !lower.endsWith('is') &&
    !lower.endsWith('as') &&
    !lower.endsWith('os')
  ) {
    return true;
  }

  if (
    lower.endsWith('ness') ||
    lower.endsWith('tion') ||
    lower.endsWith('sion') ||
    lower.endsWith('ity') ||
    lower.endsWith('ism') ||
    lower.endsWith('ance') ||
    lower.endsWith('ence') ||
    lower.endsWith('hood') ||
    lower.endsWith('ship') ||
    lower.endsWith('ment') ||
    lower.endsWith('ware') ||
    lower.endsWith('work') ||
    lower.endsWith('ing') ||
    lower.endsWith('ology') ||
    (lower.endsWith('ry') && (lower.endsWith('try') || lower.endsWith('ery') || lower.endsWith('ary')))
  ) {
    return true;
  }

  return false;
}

export function pluralizeWord(word: string): string {
  const clean = word.trim();
  if (!clean) return '';
  const lower = clean.toLowerCase();

  if (IRREGULAR_PLURALS[lower]) {
    const irr = IRREGULAR_PLURALS[lower];
    return clean[0] === clean[0].toUpperCase() ? capitalizeWord(irr) : irr;
  }

  if (
    lower.endsWith('s') &&
    !lower.endsWith('ss') &&
    !lower.endsWith('us') &&
    !lower.endsWith('is')
  ) {
    return clean;
  }

  if (lower.endsWith('y') && lower.length > 2 && !/[aeiou]y$/i.test(lower)) {
    return `${clean.slice(0, -1)}ies`;
  }

  if (/(?:s|ss|sh|ch|x|z)$/i.test(lower)) {
    return `${clean}es`;
  }

  return `${clean}s`;
}

export function toPluralOrMass(word: string): string {
  const clean = word.trim();
  if (!clean) return '';
  if (isMassOrAbstractNoun(clean)) return clean;
  return pluralizeWord(clean);
}

export function toSingularModifier(word: string): string {
  const clean = word.trim();
  const lower = clean.toLowerCase();
  if (
    lower.endsWith('ies') &&
    lower.length > 4 &&
    !['series', 'species', 'rabies'].includes(lower)
  ) {
    return `${clean.slice(0, -3)}y`;
  }
  if (
    lower.endsWith('s') &&
    !lower.endsWith('ss') &&
    !lower.endsWith('us') &&
    !lower.endsWith('is') &&
    !lower.endsWith('ics') &&
    !['pants', 'longjohns', 'scissors', 'pliers', 'tongs', 'goggles', 'goods', 'news', 'amigos', 'pastries', 'llamas'].includes(lower)
  ) {
    return clean.slice(0, -1);
  }
  return clean;
}

export function capitalizeWord(w: string): string {
  if (!w) return '';
  const cleaned = w.trim().replace(/\//g, ' ');
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function withAOrAn(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? `An ${word}` : `A ${word}`;
}

// ---------------------------------------------------------
// DYNAMIC CONTENT POOLS (The New Engine Fuel)
// ---------------------------------------------------------
export let ACTIVE_PACK_NOUNS: string[] = [];
export let ACTIVE_PACK_ADJECTIVES: string[] = [];
export let ACTIVE_PACK_ADVERBS: string[] = [];
export let ACTIVE_PACK_ENSEMBLES: string[] = [];

export let ACTIVE_ADJECTIVES: string[] = [];
export let ACTIVE_ADVERBS: string[] = [];
export let ACTIVE_NOUNS = [...CUSTOM_NOUNS];
export let ACTIVE_ENSEMBLES = [...CUSTOM_ENSEMBLES];
export let ACTIVE_BACKDROPS = [...CUSTOM_IMAGE_BACKDROPS];
export let ACTIVE_SUBJECTS: string[] = [...CUSTOM_IMAGE_SUBJECTS];

const BASE_ADJECTIVES = [
  'mathematical',
  'lofty',
  'disingenuous',
  'folded',
  'spindled',
  'mutilated',
  'abrasive',
  'antidimensional',
  'backordered',
  'redundant',
  'obsolete',
  'functional',
  'malicious',
  'fashionable',
  'superficial',
  'unreasonable',
  'collapsible',
  'refillable',
  'incoherent',
  'preferential',
  'equitable',
  'sanitary',
  'dastardly',
  'inaudible',
];

const BASE_ADVERBS = [
  'Terminally',
  'Fundamentally',
  'Mathematically',
  'Occasionally',
  'Altruistically',
  'Fashionably',
  'Maliciously',
  'Functionally',
  'Relatively',
  'Situationally',
  'Topically',
  'Intentionally',
  'Conspicuously',
  'Theoretically',
  'Begrudgingly',
  'Suspiciously',
  'Technologically',
  'Administratively',
];

export let EXPANDED_ADJECTIVES: string[] = [...BASE_ADJECTIVES];
export let EXPANDED_ADVERBS: string[] = [...BASE_ADVERBS];
export let EXPANDED_NOUNS: string[] = [...CUSTOM_NOUNS];
export let EXPANDED_ENSEMBLES: string[] = [...CUSTOM_ENSEMBLES];

export let IS_ELBOW_FAILSAFE_MODE = false;

const ELBOW_FAILSAFE_NOUNS = [
  'Elbow',
  'Elbows',
  'Funny-Bone',
  'Olecranon',
  'Ulna',
  'Radius',
  'Humerus',
  'Wenis',
  'Cubital-Tunnel',
  'Hinge-Joint',
  'Bursa',
  'Bursitis',
  'Tendonitis',
  'Tennis-Elbow',
  'Golfer-Elbow',
  'Elbow-Grease',
  'Elbow-Room',
  'Elbow-Patch',
  'Elbow-Macaroni',
  'Elbow-Pipe',
  'Arm-Bend',
  'Forearm',
  'Cartilage',
  'Ligament',
  'Synovial-Fluid',
  'Bionic-Arm',
  'Selfie-Arm',
];

const ELBOW_FAILSAFE_ADJECTIVES = [
  'Elbowed',
  'Bony',
  'Double-Jointed',
  'Hyper-Extended',
  'Cubital',
  'Ulnar',
  'Olecranal',
  'Articular',
  'Synovial',
  'Bursitic',
  'Tendinous',
  'Orthopedic',
  'Flexed',
  'Sharp-Elbowed',
  'Elbow-Deep',
  'Tweed-Patched',
  'Sore-Jointed',
  'Clicking',
  'Popping',
  'Unbent',
  'Dislocated',
  'Splinted',
  'Sling-Bound',
  'Bionic-Armed',
  'Ninety-Degree',
];

const ELBOW_FAILSAFE_ADVERBS = [
  'Articularly',
  'Orthopedically',
  'Ulnarly',
  'Synovially',
  'Flexibly',
  'Jointedly',
  'Angularly',
  'Bursitically',
  'Tendinously',
  'Anatomically',
  'Mechanically',
  'Bionically',
  'Reflexively',
];

const ELBOW_FAILSAFE_ENSEMBLES = [
  'Joint',
  'Hinge',
  'Socket',
  'Sling',
  'Splint',
  'Flexion',
  'Extension',
  'Articulation',
  'Cartilage Guild',
  'Bursa Brigade',
  'Ulnar Syndicate',
  'Funny-Bone Trio',
  'Elbow-Room Assembly',
  'Cubital Coalition',
  'Macaroni Bend',
  'Orthopedic Ward',
];

const ELBOW_FAILSAFE_PARTICIPLES = [
  'Hyper-Extended',
  'Dislocated',
  'Splinted',
  'Flexed',
  'Nudged',
  'Jostled',
  'Bent-Double',
  'Tweed-Patched',
  'Ice-Packed',
  'Sling-Wrapped',
];

const ELBOW_FAILSAFE_STICKER_TEXTS = [
  '⚠️ ALL CONTENT OFF // EMERGENCY ELBOW FAILSAFE MODE 🦾',
  '🚨 VAULT EMPTY // 100% PURE ELBOW PROTOCOL ACTIVE 🤳',
  '⚠️ ZERO PACKS ENABLED // OPERATING ON SPARE ELBOWS 🦾',
  '🚨 DIRECTOR’S CHAIR OFF // MAXIMUM ELBOW OVERRIDE 🤳',
];

function splitAdjectivesAndAdverbs(rawWords: string[]): { adjectives: string[]; adverbs: string[] } {
  const adjectives: string[] = [];
  const adverbs: string[] = [];

  for (const w of rawWords) {
    const clean = w.trim();
    if (!clean || clean.startsWith('//')) continue;
    if (isAdverbWord(clean)) {
      adverbs.push(clean);
    } else {
      adjectives.push(clean);
    }
  }
  return { adjectives, adverbs };
}

const defaultSplit = splitAdjectivesAndAdverbs(Array.from(new Set([...BASE_ADJECTIVES, ...CUSTOM_ADJECTIVES])));
ACTIVE_ADJECTIVES = defaultSplit.adjectives;
ACTIVE_ADVERBS = Array.from(new Set([...BASE_ADVERBS, ...defaultSplit.adverbs]));
EXPANDED_ADJECTIVES = [...ACTIVE_ADJECTIVES];
EXPANDED_ADVERBS = [...ACTIVE_ADVERBS];
EXPANDED_NOUNS = Array.from(new Set(CUSTOM_NOUNS.filter((n) => n && !n.startsWith('//'))));
EXPANDED_ENSEMBLES = Array.from(new Set(CUSTOM_ENSEMBLES.filter((e) => e && !e.startsWith('//'))));

export async function hydrateContentPools() {
  const prefs = getPreferences();
  const packs = await getAllInstalledPacks();

  ACTIVE_PACK_NOUNS = [];
  ACTIVE_PACK_ADJECTIVES = [];
  ACTIVE_PACK_ADVERBS = [];
  ACTIVE_PACK_ENSEMBLES = [];

  ACTIVE_BACKDROPS = prefs.disableDefaultBackgrounds ? [] : [...CUSTOM_IMAGE_BACKDROPS];
  ACTIVE_SUBJECTS = prefs.disableDefaultSubjects ? [] : [...CUSTOM_IMAGE_SUBJECTS];

  for (const pack of packs) {
    if (prefs.disabledPacks.includes(pack.id)) continue;

    if (pack.words) {
      if (Array.isArray(pack.words.adjectives)) {
        const packSplit = splitAdjectivesAndAdverbs(pack.words.adjectives);
        ACTIVE_PACK_ADJECTIVES.push(...packSplit.adjectives);
        ACTIVE_PACK_ADVERBS.push(...packSplit.adverbs);
      }
      if (Array.isArray(pack.words.nouns)) {
        ACTIVE_PACK_NOUNS.push(...pack.words.nouns.filter((n: string) => n && !n.startsWith('//')));
      }
      if (Array.isArray(pack.words.ensembles)) {
        ACTIVE_PACK_ENSEMBLES.push(...pack.words.ensembles.filter((e: string) => e && !e.startsWith('//')));
      }
    }
    if (pack.manifest && pack.manifest.stamps) {
      ACTIVE_BACKDROPS.push(...pack.manifest.stamps);
    }
    if (pack.manifest && pack.manifest.subjects) {
      ACTIVE_SUBJECTS.push(...pack.manifest.subjects);
    }
  }

  ACTIVE_PACK_NOUNS = Array.from(new Set(ACTIVE_PACK_NOUNS));
  ACTIVE_PACK_ADJECTIVES = Array.from(new Set(ACTIVE_PACK_ADJECTIVES));
  ACTIVE_PACK_ADVERBS = Array.from(new Set(ACTIVE_PACK_ADVERBS));
  ACTIVE_PACK_ENSEMBLES = Array.from(new Set(ACTIVE_PACK_ENSEMBLES));

  const coreSplit = splitAdjectivesAndAdverbs(Array.from(new Set([...BASE_ADJECTIVES, ...CUSTOM_ADJECTIVES])));

  ACTIVE_ADJECTIVES = prefs.disableDefaultWords
    ? [...ACTIVE_PACK_ADJECTIVES]
    : Array.from(new Set([...coreSplit.adjectives, ...ACTIVE_PACK_ADJECTIVES]));

  ACTIVE_ADVERBS = prefs.disableDefaultWords
    ? [...ACTIVE_PACK_ADVERBS]
    : Array.from(new Set([...BASE_ADVERBS, ...coreSplit.adverbs, ...ACTIVE_PACK_ADVERBS]));

  ACTIVE_NOUNS = prefs.disableDefaultWords
    ? [...ACTIVE_PACK_NOUNS]
    : Array.from(new Set([...CUSTOM_NOUNS.filter((n) => !n.startsWith('//')), ...ACTIVE_PACK_NOUNS]));

  ACTIVE_ENSEMBLES = prefs.disableDefaultWords
    ? [...ACTIVE_PACK_ENSEMBLES]
    : Array.from(new Set([...CUSTOM_ENSEMBLES, ...ACTIVE_PACK_ENSEMBLES]));

  // Failsafes: Triggered when Core Pools are disabled and no expansion packs supply words/backdrops
  const noWordsAvailable = ACTIVE_NOUNS.length === 0 && ACTIVE_ADJECTIVES.length === 0;
  const noVisualsAvailable =
    prefs.disableDefaultSubjects &&
    ACTIVE_SUBJECTS.length === 0 &&
    prefs.disableDefaultBackgrounds &&
    ACTIVE_BACKDROPS.length === 0;

  IS_ELBOW_FAILSAFE_MODE = noWordsAvailable || noVisualsAvailable;

  if (ACTIVE_NOUNS.length === 0 || IS_ELBOW_FAILSAFE_MODE) {
    ACTIVE_NOUNS = [...ELBOW_FAILSAFE_NOUNS];
  }
  if (ACTIVE_ADJECTIVES.length === 0 || IS_ELBOW_FAILSAFE_MODE) {
    ACTIVE_ADJECTIVES = [...ELBOW_FAILSAFE_ADJECTIVES];
  }
  if (ACTIVE_ADVERBS.length === 0 || IS_ELBOW_FAILSAFE_MODE) {
    ACTIVE_ADVERBS = [...ELBOW_FAILSAFE_ADVERBS];
  }
  if (ACTIVE_ENSEMBLES.length === 0 || IS_ELBOW_FAILSAFE_MODE) {
    ACTIVE_ENSEMBLES = [...ELBOW_FAILSAFE_ENSEMBLES];
  }
  if (ACTIVE_BACKDROPS.length === 0 || IS_ELBOW_FAILSAFE_MODE) {
    ACTIVE_BACKDROPS = ['elbow_selfie_backdrop' as any, 'elbow_mech_backdrop' as any];
  }

  EXPANDED_ADJECTIVES = [...ACTIVE_ADJECTIVES];
  EXPANDED_ADVERBS = [...ACTIVE_ADVERBS];
  EXPANDED_NOUNS = [...ACTIVE_NOUNS];
  EXPANDED_ENSEMBLES = [...ACTIVE_ENSEMBLES];

  if (typeof subjectShuffleBag !== 'undefined') subjectShuffleBag.refill();
  if (typeof backdropShuffleBag !== 'undefined') backdropShuffleBag.refill();
}

export const BACKDROPS: BackdropType[] = [
  'split_horizon',
  'drafting_grid',
  'radial_sunburst',
  'hypnotic_rings',
  'deep_space',
  'diagonal_duotone',
  'vintage_parchment',
  'minimal_box',
  'desert_horizon',
  'dark_forest',
  'urban_skyline',
  'traffic_jam',
  'checkerboard',
  'weather_map',
  'legal_document',
];

export const SUBJECT_VECTORS: SubjectVectorType[] = [
  'pants',
  'bed',
  'cheese',
  'ear',
  'tooth',
  'anvil',
  'ufo',
  'cactus',
  'magnet',
  'key',
  'anchor',
  'lightbulb',
  'skull',
  'crown',
  'bomb',
  'angry_person',
  'sneaky_person',
  'confused_person',
  'atomic_orbits',
  'playing_cards',
  'soup_bowl',
  'clock_face',
  'antique_tv',
  'rotary_phone',
  'porcelain_fixture',
  'classical_monolith',
  'laboratory_flask',
  'office_door',
  'stack_slices',
  'geometric_cube',
];

export const GAG_MODIFIERS: any[] = [
  'hazard_triangle',
  'adhesive_bandage',
  'speech_bubble',
  'caution_stamp',
  'celestial_glow',
  'redaction_bars',
  'price_tag',
  'target_reticle',
  'measurement_arrows',
  'evidence_tag',
  'halftone_dots',
  'spotlight',
  'rubber_stamp',
  'sticky_notes',
  'official_seal',
  'tiny_hazard_tape',
  'electric_arcs',
  'dotted_outline',
  'none',
  'emoji_🥩', 'emoji_👁️', 'emoji_🦷', 'emoji_💾', 'emoji_💊',
  'emoji_🛒', 'emoji_🧲', 'emoji_📎', 'emoji_🪤', 'emoji_📞',
  'emoji_✂️', 'emoji_📌', 'emoji_🗝️', 'emoji_🧅', 'emoji_🩹',
  'emoji_🔋', 'emoji_🪓', 'emoji_🏷️', 'emoji_🧱', 'emoji_🗑️',
  'emoji_🛏️', 'emoji_🪑', 'emoji_🚪', 'emoji_🪟', 'emoji_🧹',
  'emoji_🧽', 'emoji_🧼', 'emoji_🪣', 'emoji_🧺', 'emoji_🧻',
  'emoji_🛋️', 'emoji_🚽', 'emoji_🪠', 'emoji_🛁', 'emoji_🕯️',
  'emoji_💡', 'emoji_🔦', 'emoji_🪞', 'emoji_🧯', 'emoji_🧰',
  'emoji_🧴', 'emoji_🧷', 'emoji_🪡', 'emoji_🧶', 'emoji_🧵',
  'emoji_📄', 'emoji_📃', 'emoji_📑', 'emoji_📋', 'emoji_📁',
  'emoji_📂', 'emoji_🗂️', 'emoji_🗃️', 'emoji_🗄️', 'emoji_📝',
  'emoji_✏️', 'emoji_🖊️', 'emoji_🖇️', 'emoji_📐', 'emoji_📏',
  'emoji_🗒️', 'emoji_📆', 'emoji_📅', 'emoji_🔖', 'emoji_🔏',
  'emoji_🔐', 'emoji_🔒', 'emoji_📮', 'emoji_📬', 'emoji_✉️',
  'emoji_🍞', 'emoji_🥚', 'emoji_🧀', 'emoji_🥔', 'emoji_🥕',
  'emoji_🌽', 'emoji_🥒', 'emoji_🍌', 'emoji_🍎', 'emoji_🍐',
  'emoji_🍋', 'emoji_🍊', 'emoji_🍅', 'emoji_🍆', 'emoji_🥬',
  'emoji_🍄', 'emoji_🥜', 'emoji_🍚', 'emoji_🍜', 'emoji_🍝',
  'emoji_🍕', 'emoji_🌭', 'emoji_🌮', 'emoji_🥪', 'emoji_🍔',
  'emoji_🥞', 'emoji_🧇', 'emoji_🍩', 'emoji_🧁', 'emoji_🍪',
  'emoji_🥨', 'emoji_🍿', 'emoji_🍬', 'emoji_🍭', 'emoji_🥫',
  'emoji_🫀', 'emoji_🫁', 'emoji_🧠', 'emoji_🦴', 'emoji_🩻',
  'emoji_🩺', 'emoji_💉', 'emoji_🩸', 'emoji_🧬',
  'emoji_🦠', 'emoji_🧫', 'emoji_🧪', 'emoji_🩼', 'emoji_🦽',
  'emoji_🦿', 'emoji_🦾', 'emoji_😷', 'emoji_🤒', 'emoji_🤕',
  'emoji_🔨', 'emoji_🪚', 'emoji_🔧', 'emoji_🔩', 'emoji_⚙️',
  'emoji_⛓️', 'emoji_🪛', 'emoji_🔗', 'emoji_🪜',
  'emoji_🪨', 'emoji_🔌', 'emoji_⚒️', 'emoji_🛠️',
  'emoji_🚦', 'emoji_🚧', 'emoji_🛑', 'emoji_🚥', 'emoji_🪧',
  'emoji_🛞', 'emoji_⛽', 'emoji_🚲', 'emoji_🛴', 'emoji_🚗',
  'emoji_🚕', 'emoji_🚌', 'emoji_🚛', 'emoji_🚜', 'emoji_🚂',
  'emoji_🚇', 'emoji_🛤️', 'emoji_🛣️', 'emoji_⚓', 'emoji_🗼',
  'emoji_🔬', 'emoji_🔭', 'emoji_🧭', 'emoji_📡', 'emoji_🛰️',
  'emoji_⚗️', 'emoji_⚛️', 'emoji_☢️',
  'emoji_☣️', 'emoji_🌡️', 'emoji_💿', 'emoji_📀',
  'emoji_💽', 'emoji_🖥️', 'emoji_⌨️', 'emoji_🖱️', 'emoji_🖨️',
  'emoji_🐀', 'emoji_🐁', 'emoji_🐹', 'emoji_🐰', 'emoji_🦊',
  'emoji_🐻', 'emoji_🐼', 'emoji_🐨', 'emoji_🐯', 'emoji_🦁',
  'emoji_🐮', 'emoji_🐷', 'emoji_🐸', 'emoji_🐵', 'emoji_🐔',
  'emoji_🦆', 'emoji_🦅', 'emoji_🦉', 'emoji_🐍', 'emoji_🦎',
  'emoji_🐢', 'emoji_🐙', 'emoji_🦑', 'emoji_🦀', 'emoji_🦐',
  'emoji_🐌', 'emoji_🪲', 'emoji_🪳', 'emoji_🦟', 'emoji_🪰',
  'emoji_👖', 'emoji_👕', 'emoji_👔', 'emoji_🧥', 'emoji_🧤',
  'emoji_🧦', 'emoji_🧢', 'emoji_🎩', 'emoji_👒', 'emoji_👞',
  'emoji_👟', 'emoji_🥾', 'emoji_🩴', 'emoji_👜', 'emoji_💼',
  'emoji_🎒', 'emoji_👓', 'emoji_🕶️', 'emoji_⌚', 'emoji_💍',
  'emoji_⚠️', 'emoji_🚫', 'emoji_❌', 'emoji_⭕', 'emoji_❗',
  'emoji_❓', 'emoji_‼️', 'emoji_⁉️', 'emoji_🔴', 'emoji_🟡',
  'emoji_🟢', 'emoji_🔵', 'emoji_⚫', 'emoji_⚪', 'emoji_🔺',
  'emoji_🔻', 'emoji_⭐', 'emoji_💥', 'emoji_💢', 'emoji_☑️',
  'emoji_📦', 'emoji_🗳️', 'emoji_🛍️', 'emoji_🧳',
  'emoji_🪵', 'emoji_🫙', 'emoji_🥣', 'emoji_🍵', 'emoji_🥤',
  'emoji_🪥',
  'emoji_🌵', 'emoji_🌲', 'emoji_🌳', 'emoji_🌴', 'emoji_🌱',
  'emoji_🍂', 'emoji_🍁', 'emoji_🌿', 'emoji_🌻', 'emoji_🌹',
  'emoji_🌙', 'emoji_☀️', 'emoji_🌧️', 'emoji_☁️', 'emoji_❄️',
  'emoji_🌪️', 'emoji_🌋', 'emoji_🏔️', 'emoji_🌊',
  'emoji_🦤', 'emoji_🪿', 'emoji_🦩', 'emoji_🦥',
  'emoji_🦫', 'emoji_🦨', 'emoji_🦡', 'emoji_🦘', 'emoji_🦒',
  'emoji_🦣', 'emoji_🐘', 'emoji_🦏', 'emoji_🦛', 'emoji_🦖',
  'emoji_🦕', 'emoji_🐊', 'emoji_🦈', 'emoji_🐳', 'emoji_🐡',
  'emoji_🗿', 'emoji_🏺', 'emoji_⚱️', 'emoji_🪦', 'emoji_🛎️',
  'emoji_🔔', 'emoji_🎚️', 'emoji_🎛️', 'emoji_📯', 'emoji_📣',
  'emoji_📢', 'emoji_🎙️', 'emoji_📻', 'emoji_📺', 'emoji_📠',
  'emoji_🕰️', 'emoji_⏰', 'emoji_⌛', 'emoji_⏳', 'emoji_🧮',
];

export const VINTAGE_PALETTES_LIST: VintagePaletteName[] = [
  '70s Earth',
  'Psych Glow',
  'Vintage Studio',
  'Mint & Lavender',
  'Acid Sunset',
  'Diner Neon',
  'Poolside Retro',
  'Harvest Faded',
  'Tropical Pulp',
  'Electric Pastel',
  'Space Age',
  'County Fair',
  'Cheap Print',
  'Arcade Carpet',
  'Institutional',
  'Carnival',
  'Desert Motel',
  'Medical Vintage',
  'Safety Orange',
  'Blueprint Ink',
];

// =========================================================================
// ABSOLUTE BAND NAME UNIQUENESS REGISTRY (localStorage: ydrbn_name_history)
// =========================================================================

const HISTORY_REGISTRY_KEY = 'ydrbn_name_history';

export class HistoryRegistry {
  private names: Set<string> = new Set();

  constructor() {
    this.load();
    this.seedDefaults();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(HISTORY_REGISTRY_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            if (typeof item === 'string' && item.trim()) {
              this.names.add(item.trim().toLowerCase());
            }
          });
        }
      }
    } catch {
      // ignore
    }
  }

  private seedDefaults(): void {
    const defaults = [
      'Quantum Pastries',
      'The Dog Will Eat It',
      'Sound Trebuchet',
      'Antidimensional Powder',
      'Laminated Cheese',
      'Orbital Oscillators',
      'Dubious Regret',
      'Sprained Earlobe',
      'Office Door Recovery',
      'Bureaucracy Delay',
      'Suburban Plumbing',
      'Deep Space Bidet',
      'Boiled Biscuits',
      'Hyper-Extended Molar',
      'Doctor Blunder',
      'Intergalactic Toaster',
    ];
    defaults.forEach((name) => this.names.add(name.toLowerCase()));
  }

  public has(bandName: string): boolean {
    return this.names.has(bandName.trim().toLowerCase());
  }

  public add(bandName: string): void {
    const clean = bandName.trim();
    if (!clean) return;
    this.names.add(clean.toLowerCase());
    this.save();
  }

  private save(): void {
    try {
      const arr = Array.from(this.names);
      localStorage.setItem(HISTORY_REGISTRY_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
  }

  public size(): number {
    return this.names.size;
  }
}

export const historyRegistry = new HistoryRegistry();

class SubjectShuffleBag {
  private bag: SubjectVectorType[] = [];
  private lastDrawn: SubjectVectorType | null = null;

  constructor() {
    this.refill();
  }

  public refill(): void {
    const prefs = getPreferences();
    const baseSubjects = prefs.disableDefaultSubjects ? ['none'] : SUBJECT_VECTORS;

    this.bag = [...(baseSubjects as any), ...(ACTIVE_SUBJECTS as any)];

    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }

    if (this.lastDrawn && this.bag.length > 1 && this.bag[this.bag.length - 1] === this.lastDrawn) {
      [this.bag[this.bag.length - 1], this.bag[0]] = [this.bag[0], this.bag[this.bag.length - 1]];
    }
  }

  public drawNext(): SubjectVectorType {
    if (this.bag.length === 0) {
      this.refill();
    }
    const subject = this.bag.pop()!;
    this.lastDrawn = subject;
    return subject;
  }

  public consumeSubject(subject: SubjectVectorType): void {
    const idx = this.bag.indexOf(subject);
    if (idx !== -1) {
      this.bag.splice(idx, 1);
    }
    this.lastDrawn = subject;
  }

  public getRemainingCount(): number {
    return this.bag.length;
  }
}

export const subjectShuffleBag = new SubjectShuffleBag();

class BackdropShuffleBag {
  private bag: BackdropType[] = [];
  private lastDrawn: BackdropType | null = null;

  constructor() {
    this.refill();
  }

  public refill(): void {
    const prefs = getPreferences();
    const baseBackdrops = prefs.disableDefaultBackgrounds ? [] : BACKDROPS;

    this.bag = [...baseBackdrops, ...(ACTIVE_BACKDROPS as any)];
    if (this.bag.length === 0) {
      this.bag = ['split_horizon'];
    }

    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
    if (this.lastDrawn && this.bag.length > 1 && this.bag[this.bag.length - 1] === this.lastDrawn) {
      [this.bag[this.bag.length - 1], this.bag[0]] = [this.bag[0], this.bag[this.bag.length - 1]];
    }
  }

  public drawNext(): BackdropType {
    if (this.bag.length === 0) {
      this.refill();
    }
    const backdrop = this.bag.pop()!;
    this.lastDrawn = backdrop;
    return backdrop;
  }

  public consumeBackdrop(backdrop: BackdropType): void {
    const idx = this.bag.indexOf(backdrop);
    if (idx !== -1) {
      this.bag.splice(idx, 1);
    }
    this.lastDrawn = backdrop;
  }
}

export const backdropShuffleBag = new BackdropShuffleBag();

export function detectContextualSubject(
  bandName: string,
  albumTitle: string
): SubjectVectorType | null {
  const combined = `${bandName} ${albumTitle}`.toLowerCase();

  if (/\b(molar|tooth|teeth|dentist|dental|enamel|incisor|bicuspid|cavity|fangs?)\b/i.test(combined)) return 'tooth';
  if (/\b(magnet|magnets|magnetic|magnetism|polar|polarity|horseshoe|gauss|repulsion|attraction)\b/i.test(combined)) return 'magnet';
  if (/\b(pantaloons?|pants?|trousers?|slacks|dungarees|breeches|jeans|overalls?)\b/i.test(combined)) return 'pants';
  if (/\b(bed|insomnia|mattress|headboard|footboard|pillow|slumber|sleep|bedtime|snooze)\b/i.test(combined)) return 'bed';
  if (/\b(cheese|cheddar|swiss|gouda|curds?|parmesan|dairy|laminated|brie|fondue)\b/i.test(combined)) return 'cheese';
  if (/\b(ear|ears|earlobe|earlobes|tympanic|auditory|hearing|sprained)\b/i.test(combined)) return 'ear';
  if (/\b(anvil|anvils|blacksmith|forge|blacksmithing|foundry|smelt|hammer|ironworks)\b/i.test(combined)) return 'anvil';
  if (/\b(ufo|ufos|saucer|flying saucer|extraterrestrial|extraterrestrius|aliens?|martian|spaceship|starship)\b/i.test(combined)) return 'ufo';
  if (/\b(cactus|cacti|saguaro|succulent|prickly|spines?|desert|arid|needles?)\b/i.test(combined)) return 'cactus';
  if (/\b(keys?|skeleton key|padlock|deadbolt|vault|door key|keyhole|lockbox|locksmith)\b/i.test(combined)) return 'key';
  if (/\b(anchor|anchors|nautical|maritime|shipwreck|harbor|sailors?|anchorage|navy)\b/i.test(combined)) return 'anchor';
  if (/\b(lightbulb|light bulb|bulb|bulbs|incandescent|filament|lumens?|watts?|tungsten)\b/i.test(combined)) return 'lightbulb';
  if (/\b(skull|skulls|skeleton|skeletons|skeletal|cranium|calavera|ossuary|bones?|calcified)\b/i.test(combined)) return 'skull';
  if (/\b(crown|crowns|coronation|royalty|monarch|majesty|king|queen|emperor|regal|tiara)\b/i.test(combined)) return 'crown';
  if (/\b(bomb|bombs|dynamite|tnt|explosives?|blast|detonation|cannonball|ignite|fuse)\b/i.test(combined)) return 'bomb';
  if (/\b(angry|furious|wrath|rage|fury|temper|tantrums?|mad|irritated|hostile|shouting|yelling)\b/i.test(combined)) return 'angry_person';
  if (/\b(sneaky|sneak|bandit|thief|burglars?|tiptoe|stealth|prowler|crook|heist|disguise|undercover)\b/i.test(combined)) return 'sneaky_person';
  if (/\b(confused|confusion|puzzled|baffled|bewildered|enigma|riddles?|clueless|shrug|shrugging|doubt|uncertain)\b/i.test(combined)) return 'confused_person';

  return null;
}

export function detectContextualBackdrop(
  bandName: string,
  albumTitle: string
): BackdropType | null {
  const combined = `${bandName} ${albumTitle}`.toLowerCase();
  if (/\b(desert|dunes?|sunset|sand|arid|sahara|mesa|cactus|saguaro)\b/i.test(combined)) return 'desert_horizon';
  if (/\b(forest|woods?|pine|trees?|twilight|grove|timber|wilderness)\b/i.test(combined)) return 'dark_forest';
  if (/\b(city|urban|skyline|skyscraper|metropolis|downtown|alley|buildings?)\b/i.test(combined)) return 'urban_skyline';
  if (/\b(traffic|jam|cars?|highway|freeway|asphalt|gridlock|taillight)\b/i.test(combined)) return 'traffic_jam';
  if (/\b(space|cosmic|nebula|star|astral|orbit|galaxy|intergalactic)\b/i.test(combined)) return 'deep_space';
  if (/\b(blueprint|schematic|technical|caliper|drafting|grid|formula)\b/i.test(combined)) return 'drafting_grid';
  if (/\b(weather|storm|barometric|barometer|forecast|rain|cloud|wind|tornado)\b/i.test(combined)) return 'weather_map';
  if (/\b(legal|attorney|subpoena|judicial|tribunal|verdict|litigious|invoice|patent|contract)\b/i.test(combined)) return 'legal_document';
  if (/\b(checker|chess|square|tile|boardroom)\b/i.test(combined)) return 'checkerboard';
  return null;
}

export function selectModularCombination(
  bandName?: string,
  albumTitle?: string
): {
  backdrop: BackdropType;
  subject: SubjectVectorType;
  modifier: GagModifierType;
  palette: VintagePaletteName;
  spiralStyle: 'archimedean' | 'sunburst' | 'square_rings' | 'concentric';
} {
  const prefs = getPreferences();

  // 1. SUBJECT SELECTION
  let subject: SubjectVectorType = 'none';
  if (prefs.disableDefaultSubjects) {
    if (ACTIVE_SUBJECTS.length > 0) {
      subject = subjectShuffleBag.drawNext();
    } else {
      subject = 'none';
    }
  } else {
    let chosen: SubjectVectorType | null = null;
    if (bandName && albumTitle) {
      chosen = detectContextualSubject(bandName, albumTitle);
      if (chosen) {
        subjectShuffleBag.consumeSubject(chosen);
      }
    }
    if (!chosen) {
      chosen = subjectShuffleBag.drawNext();
    }
    subject = chosen;
  }

  // 2. BACKDROP SELECTION
  let backdrop: BackdropType;
  if (prefs.disableDefaultBackgrounds && ACTIVE_BACKDROPS.length > 0) {
    backdrop = backdropShuffleBag.drawNext();
  } else {
    if (bandName && albumTitle) {
      const contextualBd = detectContextualBackdrop(bandName, albumTitle);
      if (contextualBd) {
        backdrop = contextualBd;
        backdropShuffleBag.consumeBackdrop(contextualBd);
      } else {
        backdrop = backdropShuffleBag.drawNext();
      }
    } else {
      backdrop = backdropShuffleBag.drawNext();
    }
  }

  // 3. GAG MODIFIER SELECTION
  let availableModifiers = GAG_MODIFIERS;
  if (prefs.disableEmojis) {
    availableModifiers = GAG_MODIFIERS.filter((m) => !String(m).startsWith('emoji_'));
  }
  const modifier = availableModifiers[Math.floor(Math.random() * availableModifiers.length)];

  // 4. PALETTE & SPIRAL
  const palette = VINTAGE_PALETTES_LIST[Math.floor(Math.random() * VINTAGE_PALETTES_LIST.length)];
  const spiralStyles: Array<'archimedean' | 'sunburst' | 'square_rings' | 'concentric'> = [
    'archimedean',
    'sunburst',
    'square_rings',
    'concentric',
  ];
  const spiralStyle = spiralStyles[Math.floor(Math.random() * spiralStyles.length)];

  return { backdrop, subject, modifier, palette, spiralStyle };
}

type SemanticTag =
  | 'scientific'
  | 'culinary'
  | 'anatomical'
  | 'bureaucracy'
  | 'misfortune'
  | 'domestic';

interface SemanticWordPool {
  tag: SemanticTag;
  prefixes: string[];
  nouns: string[];
  albumPhrases: string[];
  trackThemes: string[];
  denialPhrases: string[];
  stampLabels: string[];
  archetypes: GagArchetype[];
}

const SEMANTIC_POOLS: Record<SemanticTag, SemanticWordPool> = {
  scientific: {
    tag: 'scientific',
    prefixes: [
      'Quantum', 'Atomic', 'Sub-Zero', 'Electromagnetic', 'Kinetic',
      'Radioactive', 'Antimatter', 'Orbital', 'Thermodynamic', 'Centrifugal',
      'Molecular', 'Galvanic', 'Mathematical', 'Antidimensional', 'Functional', 'Barometric',
    ],
    nouns: [
      'Pastries', 'Bismuth', 'Isotopes', 'Condensers', 'Spectrometer',
      'Oscillators', 'Cations', 'Centrifuge', 'Decay', 'Turbines',
      'Electrons', 'Particles', 'Abacus', 'Laserdisc', 'Ganglia',
      'Equation', 'Anomalies', 'Trebuchet', 'Powder',
    ],
    albumPhrases: [
      'Roll', 'Half-Life In Seconds', 'Thermal Inversion', 'Absolute Zero',
      'Centrifugal Bliss', 'The Decay Paradox', 'Spontaneous Reaction',
      'Periodic Table Blues', 'In Original Packaging', 'Measured In Carrots',
    ],
    trackThemes: [
      'Beta Radiation Blues', 'Friction In A Vacuum', 'The Kelvin Scale Sonata',
      'Subatomic Crumb Dispersion', 'Orbital Velocity Jam', 'Bunsen Burner Flameout',
      'Uncertainty Principle Shuffle', 'Theoretical Collision',
    ],
    denialPhrases: [
      'NOT RADIOACTIVE!', 'PURE THEORY ONLY!', 'DO NOT INHALE ISOTOPE!',
    ],
    stampLabels: [
      'CALIBRATED TO 0.001g', 'LABORATORY APPROVED', 'HIGH VOLTAGE FIELD',
    ],
    archetypes: ['atomic_orbit', 'hypnotic_swirl', 'absurd_blueprint'],
  },

  culinary: {
    tag: 'culinary',
    prefixes: [
      'Laminated', 'Pickled', 'Deep Fried', 'Caramelized', 'Dehydrated',
      'Boiled', 'Smoked', 'Fermented', 'Steamed', 'Whipped',
      'Glazed', 'Artisanal', 'Folded', 'Secondhand', 'Practical',
    ],
    nouns: [
      'Cheese', 'Scones', 'Frankfurters', 'Aspic', 'Cabbage',
      'Pate', 'Turnips', 'Gravy', 'Gouda', 'Gelatin',
      'Biscuits', 'Marmalade', 'Meatcake', 'Hummus', 'Pie', 'Spork',
    ],
    albumPhrases: [
      'Sharp', 'Not A Frankfurter', 'Under The Broiler', 'Room Temperature',
      'Extra Crumbly', 'Served Cold', 'Double Portion', 'Individually Sealed',
      'This Is Too Salty', 'Try Our Soup',
    ],
    trackThemes: [
      'The Cheese Cave Acoustic', 'Boiling Point In C Minor', 'Mustard Dispersion Theory',
      'Cellophane Peeling Etude', 'Lukewarm Stew Reflections', 'Gravy Boat Navigation',
      'Crust Formation Velocity', 'Dinner Bell Cacophony',
    ],
    denialPhrases: [
      "IT'S NOT A FRANKFURTER!", '100% ARTIFICIAL DAIRY!', 'DO NOT MICROWAVE!',
    ],
    stampLabels: [
      'INSPECTED & SEALED', 'GRADE B MARMALADE', 'BEST BEFORE YESTERDAY',
    ],
    archetypes: ['literal_denial', 'atomic_orbit', 'absurd_blueprint'],
  },

  anatomical: {
    tag: 'anatomical',
    prefixes: [
      'Sprained', 'Dislocated', 'Calcified', 'Punctured', 'Inflamed',
      'Swollen', 'Bandaged', 'Numb', 'Hyper-Extended', 'Bruised',
      'Skeletal', 'Itchy', 'Unreasonable', 'Mutilated', 'Abrasive',
    ],
    nouns: [
      'Earlobe', 'Ulna', 'Cartilage', 'Ligament', 'Clavicle',
      'Kneecap', 'Jawline', 'Metatarsal', 'Phalange', 'Collarbone',
      'Vertebra', 'Molars', 'Elbow', 'Coccyx', 'Finger', 'Claw', 'Ganglia',
    ],
    albumPhrases: [
      'Tendonitis', 'Bent Double', 'Ice Packs Required', 'Clicking Sounds',
      'Splinted', 'Tender To Touch', 'Mild Discomfort', 'Slight Limp',
      'Side Effects Include', 'Stop Picking It',
    ],
    trackThemes: [
      'Pinching The Nerve', 'Cracking Cartilage Rumba', 'The Elastic Bandage Blues',
      'Ibuprofen Morning', 'Sudden Twitched Reflex', 'Consulting The Orthopedic',
      'X-Ray Exposure Suite', 'Limpid Recovery',
    ],
    denialPhrases: [
      'DOES NOT HURT AT ALL!', 'COMPLETELY NORMAL BONE!', 'NOT A FRACTURE!',
    ],
    stampLabels: [
      'OWIE APPROVED', 'CLINICAL ADHESIVE APPLIED', 'FIG. 7 — TRAUMA',
    ],
    archetypes: ['anatomical_woodcut', 'classical_hazard'],
  },

  bureaucracy: {
    tag: 'bureaucracy',
    prefixes: [
      'Immediate', 'Former', 'Duplicate', 'Notarized', 'Disapproved',
      'Postponed', 'Abrasive', 'Counter-Signed', 'Triplicate', 'Audited',
      'Stamped', 'Clerical', 'Backordered', 'Redundant', 'Obsolete',
      'Disingenuous', 'Preferential',
    ],
    nouns: [
      'Delay', 'Clones', 'Abacus', 'Memos', 'Invoices',
      'Folders', 'Signatures', 'Bursars', 'Committees', 'Requisitions',
      'Stamps', 'Ledgers', 'Insurance', 'Board', 'Opinion',
      'Requirements', 'Truth',
    ],
    albumPhrases: [
      'Hurry Up And Wait', 'Ditto', 'Form 1040-B', 'Rub Vigorously',
      'Void On Arrival', 'Pending Review', 'Carbon Copied', 'Closed On Fridays',
      'For Your Approval', 'Optional Requirements',
    ],
    trackThemes: [
      'Waiting Room Muzak', 'The 4-Part Carbon Slip', 'Stapler Malfunction Jam',
      'Filing Under Misc', 'Lunch Break From 11 to 3', 'Photocopier Paper Jam',
      'The Urgent Inter-Office Memo', 'Lost In Transit',
    ],
    denialPhrases: [
      'FILE HAS BEEN DESTROYED!', 'NO ACCESS PERMITTED!', 'UNKNOWN BUREAUCRAT!',
    ],
    stampLabels: [
      'MEASURED IN CARROTS', 'UNKNOWN ENDORSER', 'DO NOT FOLD OR MUTILATE',
    ],
    archetypes: ['absurd_blueprint', 'hypnotic_swirl'],
  },

  misfortune: {
    tag: 'misfortune',
    prefixes: [
      'Sudden', 'Unfortunate', 'Severe', 'Permanent',
      'Unscheduled', 'Accidental', 'Premature', 'Dubious', 'Trembling',
      'Clumsy', 'Anxious', 'Spindled', 'Malicious', 'Deflected',
    ],
    nouns: [
      'Trepidation', 'Collapse', 'Mishap', 'Catastrophe', 'Regret',
      'Flinch', 'Blunder', 'Hazard', 'Tremors', 'Panic',
      'Defeat', 'Hesitation', 'Bunglers', 'Snails', 'Tortoise',
      'Traffic', 'Paradox', 'Incident', 'Conscience',
    ],
    albumPhrases: [
      'Unsure', 'Bad Idea', 'Second Guessing', 'Look Out Below',
      'Broken Handle', 'No Return Policy', 'Total Spill', 'Slippery Floor',
      'Everything Sounds Terrible', 'May Contain Music',
    ],
    trackThemes: [
      'The Looming Caution Sign', 'Tripping Over The Cord', 'Broken Spectacles Overture',
      'Spilled Ink On White Denim', 'Cold Sweat In The Elevator', 'The Squeaking Brakes',
      'Emergency Meeting Called', 'Wrong Direction Entirely',
    ],
    denialPhrases: [
      'EVERYTHING IS FINE!', 'PROCEED WITH CAUTION!', 'IT WAS NOT MY FAULT!',
    ],
    stampLabels: [
      'DANGER: HAZARD ZONE', 'DISAPPROVED AT ONCE', 'NO LIABILITY ACCEPTED',
    ],
    archetypes: ['classical_hazard', 'literal_denial'],
  },

  domestic: {
    tag: 'domestic',
    prefixes: [
      'Intergalactic', 'Suburban', 'Cosmic', 'Basement', 'Electric',
      'Domestic', 'Nocturnal', 'Collapsible', 'Ceiling', 'Refillable',
      'Plumbing', 'Radiator', 'Lofty', 'Fashionable',
    ],
    nouns: [
      'Toilet', 'Toaster', 'Radiator', 'Drainpipe', 'Boiler',
      'Faucet', 'Thermostat', 'Sponge', 'Puddle', 'Curtain',
      'Doorknob', 'Linoleum', 'Shoes', 'Soap', 'Socks',
      'Hamster', 'Yurts', 'Weather', 'Tuba', 'Gumption',
      'Dreams', 'Closet',
    ],
    albumPhrases: [
      'The Cosmic Bowels', 'Zero Gravity Plumbing', 'Dripping Through The Floor',
      'Leaky Gasket Suite', 'Pilot Light Extinguished', 'Echoes In The Cistern',
      'Rusting In Orbit', 'Trousers In The Wind', 'Insomnia',
    ],
    trackThemes: [
      'Orbital Flushing Velocity', 'The Clogged Drain Meditation', 'Cold Water Shock Blues',
      'Hissing Radiator Symphony', 'Porcelain Resonance', 'Plunger Technique in 3/4 Time',
      'Subterranean Pipe Rumble', 'Midnight Leak Panic',
    ],
    denialPhrases: [
      'IT IS NOT A TOILET!', 'DRAIN IS UNPLUGGED!', 'NO WATER DETECTED!',
    ],
    stampLabels: [
      'INSPECTED BY PLUMBER #4', 'HI-PRESSURE DOMESTIC', 'COSMIC SEWER APPROVED',
    ],
    archetypes: ['cosmic_domestic', 'hypnotic_swirl'],
  },
};

const CRITIC_PUBLICATIONS = [
  'The Vinyl Tribune',
  'Acoustic Monthly',
  'The Flumptown Gazette',
  'Obscure Fidelity',
  'Audio Aberration Magazine',
  'The Daily Turntable',
  'Static & Hiss',
  'The Regional Arts Courier',
  'Modern Metronome',
  'The Syncopation Ledger',
];

const STICKER_STYLES = [
  { bg: '#ef4444', color: '#ffffff', border: '#ffffff', type: 'rect' as const },
  { bg: '#f59e0b', color: '#000000', border: '#000000', type: 'circle' as const },
  { bg: '#10b981', color: '#ffffff', border: '#000000', type: 'rect' as const },
  { bg: '#3b82f6', color: '#ffffff', border: '#ffffff', type: 'square' as const },
  { bg: '#a855f7', color: '#ffffff', border: '#fde047', type: 'circle' as const },
  { bg: '#e11d48', color: '#ffffff', border: '#ffffff', type: 'rect' as const },
];

const HYPE_PHRASES = [
  'INCLUDES HIT SINGLE!',
  'AUDIOPHILE 180G VIRGIN VINYL',
  'LIMITED EDITION STEREO',
  'BANNED IN 14 COUNTRIES',
  'ORIGINAL MASTER RECORDING',
  'SPECIAL IMPORT CUT',
  'FEATURING REVERSE GUITAR',
  'SURREALIST GOLD CERTIFIED',
  "COLLECTOR'S PRESSING",
  'RECORDED IN REAL DELAY',
  'REMASTERED FROM MEMORY',
  'QUADRUPLE MONO EDITION',
  'EXCLUSIVE SILENCE INSIDE',
  'MASTERED BY A GENIUS',
  'PLATINUM IN FLUMPTOWN',
  'SIMULATED ANALOG AUDIO',
  'UNAUTHORIZED HARMONIES',
  'RESTORED BY GUESSWORK',
  'UNLIMITED LIMITED EDITION',
  'RECORDED IN A PARKED CAR',
  'INVISIBLE LINER NOTES',
  'ULTRA-RARE COMMON EDITION',
  'PLAY LOUD OR NOT AT ALL',
  'BANNED BY A COMMITTEE',
  'THE LEGENDARY FOURTH CHORD',
  '12% MORE TENSION',
  'MUSICIAN OPTIONAL',
  'THE LOST ALBUM NEVER FOUND',
  'RECORDED BEFORE FORMATION',
  'INCLUDES A DISCLAIMER',
  'GOLD-CERTIFIED BY NOBODY',
  'GUESTS INCLUDE NOBODY',
  'MASTERED FOR CONFUSION',
  'THE INDEFINITE EDITION',
  'IMPROVED GROOVE GEOMETRY',
  'GENUINE SYNTHETIC WARMTH',
  'BONUS UNBONUS TRACK',
  'AUTHENTIC FAKE STEREO',
  'AUDIOPHILE REGRET',
  'UNNECESSARY INSTRUMENTS',
  'DISCOVERED IN A DRAWER',
  'LIMITED EDITION, UNLIMITED',
  'AUTHENTIC SURFACE NOISE',
  'ADMINISTRATIVE RECORDING',
  'DEMO OF THE FINAL MIX',
  'THE ORIGINAL SUBSTITUTE',
  'AUDITORY UNCERTAINTY',
  'CERTIFIED BY NOBODY',
  'SONIC LANDMARK, UNMARKED',
  'LIVE, THEN RECONSIDERED',
  'BONUS MATERIAL: NO VALUE',
  'IMPROVISED PREMEDITATION',
  'UNAUTHORIZED AUTHORIZED',
  'RARE PRESSING, COMMON EVENT',
  'ACOUSTIC PAPERWORK',
  'GOLD STANDARD: MEDIOCRITY',
  'THE UNRELEASED RELEASE',
  'MINIMUM FIDELITY REMASTER',
  'ALL TRACKS ACCOUNTED FOR',
  'STEREO, MONO, OTHER MODES',
  'MUSIC OF UNKNOWN GENRE',
  'COLLECT ALL COPIES',
  'MASTERPIECE: STATUS PENDING',
  '100% MORE RECORD MATERIAL',
  'THE DEFINITIVE UNDEFINED',
  'MODERATE CONFIDENCE',
  'FREE UNCONFIRMED RUMOR',
  'TECHNICAL COMPLIANCE AUDIO',
  'THE REVISED ORIGINAL',
  'PLAYBACK MAY VARY',
  'AUDIOPHILE APPROVAL PENDING',
  'PARTIAL INSTRUCTIONS',
  'PRELIMINARY AUDIO SUPREME',
  'RECORDED IN A VANISHED ROOM',
  'EXCLUSIVE RELEASE FOR ALL',
  'CAUTION: MAY CONTAIN MUSIC',
  'PRESSED WITH INDIFFERENCE',
  'DEFINITE, SUBJECT TO CHANGE',
  'MUSICAL ELEMENTS INCLUDED',
  'IMPROVED LABEL ALIGNMENT',
  'INVISIBLE BONUS CONTENT',
  'REAL TIME, APPROXIMATELY',
  'OFFICIALLY UNOFFICIAL',
  'RECORDING ABOUT RECORDS',
  'PRE-OWNED BY THE FUTURE',
  'A TRIUMPH OF MEDIOCRITY',
  'ALTERNATE ORIGINAL MIX',
  'THE COPY YOU NEED TWICE',
  'REDUCED ENHANCEMENT',
  'LOST MASTER REPRODUCTION',
  'UNRELATED SOUNDTRACK',
  'RECOMMENDED BY NOBODY',
  'ASSIGNED TO YOUR COLLECTION',
  'AUTHENTICALLY INAUTHENTIC',
  'UNVERIFIED AUTHENTICITY',
  'TEMPORARY MUSIC ARRANGEMENT',
  'IMPORTANT MINOR RELEASE',
  'THE SOUND OF SOMETHING ELSE',
  'A DEFINITIVE NON-STATEMENT',
  'A MENTAL ALBUM IMAGE',
  'GUARANTEED ONE ROTATION',
  'ORIGINAL FUTURE COVER',
  'COLLECTIBLE NONCOLLECTIBLE',
  'NO KNOWN REMIXES',
  'HISTORIC, NO IMPORTANCE',
  'STEREOPHONIC UNCERTAINTY',
  'BONUS PACKAGING, NO MUSIC',
  'OUTSTANDING MEDIOCRITY',
  'THE OFFICIAL SOUND OF NOW',
  'NO TWO LISTENINGS WILL MATCH',
  'AVOIDED EXPECTATIONS',
  'ROTATIONAL AUDIO INSPECTION',
  'THE ALBUM FOR NOBODY',
  'FINAL WORD IN MUSIC',
];

// Rolling ring buffer of recently used words so words don't repeat across consecutive drops
const recentWordsRing: string[] = [];
const MAX_RECENT_WORDS = 45;

function recordUsedWord(word: string): void {
  const clean = toSingularModifier(word).toLowerCase();
  if (!clean || clean.length < 3) return;
  if (!recentWordsRing.includes(clean)) {
    recentWordsRing.unshift(clean);
    if (recentWordsRing.length > MAX_RECENT_WORDS) {
      recentWordsRing.pop();
    }
  }
}

/**
 * Picks a word from the active pools while actively avoiding recently drawn words
 * and any words in the `excludeSet` (e.g. words already used in the band name).
 */
function pickFreshWord(
  packList: string[],
  defaultList: string[],
  excludeSet?: Set<string>,
  packBias = 0.70
): string {
  const prefs = getPreferences();
  const usePack =
    (prefs.disableDefaultWords && packList.length > 0) ||
    (packList.length > 0 && Math.random() < packBias);

  const sourceList = usePack ? packList : defaultList.length > 0 ? defaultList : packList;
  if (sourceList.length === 0) return 'Elbow';

  let candidate = sourceList[Math.floor(Math.random() * sourceList.length)];
  for (let attempt = 0; attempt < 30; attempt++) {
    const raw = sourceList[Math.floor(Math.random() * sourceList.length)];
    const root = toSingularModifier(raw).toLowerCase();
    const inExclude = excludeSet && (excludeSet.has(raw.toLowerCase()) || excludeSet.has(root));
    const inRecent = recentWordsRing.includes(root);

    if (!inExclude && !inRecent) {
      candidate = raw;
      break;
    }
    if (!inExclude) {
      candidate = raw;
    }
  }

  recordUsedWord(candidate);
  return candidate;
}

const DEADPAN_PARTICIPLES = [
  'Folded', 'Spindled', 'Mutilated', 'Sprained', 'Laminated', 'Backordered',
  'Trampled', 'Stolen', 'Torn', 'Deflected', 'Muffled', 'Unmasked',
  'Crumpled', 'Sponsored', 'Mortified', 'Trumped', 'Equipped', 'Measured',
  'Shrink-Wrapped', 'Misfiled', 'Uncalibrated', 'Mothballed', 'Upholstered',
];

/**
 * VOLUME ONE BAND NAME GENERATOR
 * Draws directly from the 740+ noun, 310+ adjective, and 210+ ensemble pools
 * without over-relying on hardcoded template nouns.
 */
function generateCandidateBandName(pool: SemanticWordPool): string {
  const usedInBand = new Set<string>();

  const adj1 = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADJECTIVES, EXPANDED_ADJECTIVES, usedInBand));
  usedInBand.add(adj1.toLowerCase());

  const adj2 = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADJECTIVES, EXPANDED_ADJECTIVES, usedInBand));
  usedInBand.add(adj2.toLowerCase());

  const adv = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADVERBS, EXPANDED_ADVERBS, usedInBand));
  usedInBand.add(adv.toLowerCase());

  const rawNoun1 = capitalizeWord(pickFreshWord(ACTIVE_PACK_NOUNS, EXPANDED_NOUNS, usedInBand));
  usedInBand.add(rawNoun1.toLowerCase());
  usedInBand.add(toSingularModifier(rawNoun1).toLowerCase());

  const rawNoun2 = capitalizeWord(pickFreshWord(ACTIVE_PACK_NOUNS, EXPANDED_NOUNS, usedInBand));
  usedInBand.add(rawNoun2.toLowerCase());
  usedInBand.add(toSingularModifier(rawNoun2).toLowerCase());

  const modNoun1 = toSingularModifier(rawNoun1);
  const modNoun2 = toSingularModifier(rawNoun2);
  const massOrPlural1 = toPluralOrMass(rawNoun1);
  const massOrPlural2 = toPluralOrMass(rawNoun2);

  const ensemble = capitalizeWord(pickFreshWord(ACTIVE_PACK_ENSEMBLES, EXPANDED_ENSEMBLES, usedInBand));
  const participleSource = IS_ELBOW_FAILSAFE_MODE ? ELBOW_FAILSAFE_PARTICIPLES : DEADPAN_PARTICIPLES;
  const participle = participleSource[Math.floor(Math.random() * participleSource.length)];

  const roll = Math.random();

  // BUCKET 1 (42%): Pure 2-Word [Adjective] [Noun] or [The Adjective PluralNoun]
  // e.g., "Unreasonable Elbow", "Quantum Pastries", "Abrasive Abacus", "Itchy Molars", "Hallucinatory Chipmunks", "Supersonic Sloth"
  if (roll < 0.42) {
    const patterns = [
      () => `${adj1} ${rawNoun1}`,
      () => `${adj1} ${massOrPlural1}`,
      () => `${adj1} ${modNoun1}`,
      () => `The ${adj1} ${pluralizeWord(modNoun1)}`,
      () => `The ${adj1} ${modNoun1}`,
    ];
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }

  // BUCKET 2 (22%): Pure Open Compound Noun Collisions ([Noun 1] [Noun 2] / [Adj] [Noun 1] [Noun 2])
  // e.g., "Sound Trebuchet", "Condensation Finger", "Peanut Butter Coccyx", "Couch Cushion Lottery", "Aluminum Opinion"
  if (roll < 0.64) {
    const compoundPatterns = [
      () => `${modNoun1} ${rawNoun2}`,
      () => `${modNoun1} ${massOrPlural2}`,
      () => `${adj1} ${modNoun1} ${rawNoun2}`,
      () => `${modNoun1} ${modNoun2} ${ensemble}`,
      () => `${modNoun1} & ${modNoun2}`,
      () => `${pluralizeWord(modNoun1)} & ${pluralizeWord(modNoun2)}`,
      () => `${modNoun1} Flavored ${massOrPlural2}`,
    ];
    return compoundPatterns[Math.floor(Math.random() * compoundPatterns.length)]();
  }

  // BUCKET 3 (14%): Adverbial Oxymorons & Modified Participles
  // e.g., "Terminally Optimistic", "Fundamentally Truculent", "Maliciously Litigious", "Happily Torn Pants", "Freshly Stolen Gift"
  if (roll < 0.78) {
    const adverbPatterns = [
      () => `${adv} ${adj1}`,
      () => `${adv} ${participle}`,
      () => `${adv} ${participle} ${massOrPlural1}`,
      () => `${adv} ${adj1} ${massOrPlural1}`,
    ];
    return adverbPatterns[Math.floor(Math.random() * adverbPatterns.length)]();
  }

  // BUCKET 4 (12%): Prepositional & Relational Gags Using Open Nouns
  // e.g., "Tortoise Of Destiny", "Orchestra Of Pants", "Tape On Face", "Pantaloons On The Porch", "Trumped By Cheese"
  if (roll < 0.90) {
    const prepPatterns = [
      () => `${rawNoun1} of ${massOrPlural2}`,
      () => `${pluralizeWord(modNoun1)} of ${massOrPlural2}`,
      () => `${ensemble} of ${massOrPlural1}`,
      () => `${massOrPlural1} on the ${modNoun2}`,
      () => `${modNoun1} on ${modNoun2}`,
      () => `Longing for ${massOrPlural1}`,
      () => `Unaware of ${massOrPlural1}`,
      () => `Fear of ${massOrPlural1}`,
      () => `${participle} by ${massOrPlural1}`,
      () => `Death by ${modNoun1}`,
    ];
    return prepPatterns[Math.floor(Math.random() * prepPatterns.length)]();
  }

  // BUCKET 5 (10%): Ensemble / Character / Deadpan Format
  // e.g., "Canine Revolution", "Corn Chip Club", "Doctor Trepidation", "Captain Horticulture", "Lieut. Grump & The Fedoras"
  const titles = ['Doctor', 'Captain', 'Inspector', 'Professor', 'Lieut.'];
  const rank = titles[Math.floor(Math.random() * titles.length)];
  const ensemblePatterns = [
    () => `${adj1} ${ensemble}`,
    () => `${modNoun1} ${ensemble}`,
    () => `${rank} ${rawNoun1}`,
    () => `${rank} ${adj1} & The ${pluralizeWord(modNoun1)}`,
    () => `${adj1} and ${adj2}`,
  ];
  return ensemblePatterns[Math.floor(Math.random() * ensemblePatterns.length)]();
}

const FAKE_KEY_LETTERS = [
  'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z',
];

const STATIC_SURREAL_KEYS = [
  'Q Muffler',
  'H-Flat',
  'W-Sharp',
  'Z Minor',
  'Q-Neutral',
  'B-Sideways',
  'F-Lukewarm',
  'Room Temperature',
  'Reverse Stereo',
  'Quadraphonic Mono',
  'Metric',
  'Sub-Basement E',
  'Tax-Exempt Minor',
  'D-Flat Drywall',
  'Uncalibrated G',
  'C-Sharpish',
  'A-Oblique',
  'P-Diminished',
];

function generateSurrealKey(excludeSet?: Set<string>): string {
  const roll = Math.random();

  // 45% chance: Dynamic "[Fake Letter] [Noun]" or "[Fake Letter]-Flat [Noun]" (e.g., "Q Muffler", "H-Flat Spork")
  if (roll < 0.45) {
    const letter = FAKE_KEY_LETTERS[Math.floor(Math.random() * FAKE_KEY_LETTERS.length)];
    const rawNoun = capitalizeWord(pickFreshWord(ACTIVE_PACK_NOUNS, EXPANDED_NOUNS, excludeSet));
    const singularNoun = toSingularModifier(rawNoun);
    const accidentals = ['', '', '-Flat', '-Sharp', ' Minor', ' Major'];
    const acc = accidentals[Math.floor(Math.random() * accidentals.length)];
    return `${letter}${acc} ${singularNoun}`;
  }

  // 40% chance: Curated surreal key/mode ("Q Muffler", "H-Flat", "Reverse Stereo", etc.)
  if (roll < 0.85) {
    return STATIC_SURREAL_KEYS[Math.floor(Math.random() * STATIC_SURREAL_KEYS.length)];
  }

  // 15% chance: Classic deadpan key
  const classicKeys = ['C Minor', 'B-Flat', 'D Major', 'F-Sharp', 'G Minor'];
  return classicKeys[Math.floor(Math.random() * classicKeys.length)];
}

/**
 * VOLUME ONE ALBUM TITLE GENERATOR
 * Strictly excludes words already present in `bandName` so you never get
 * repetitive echoes like "Antimacassar Flavored Shortages — The Shortage Shortage".
 */
function generateDynamicAlbumTitle(bandName: string, pool: SemanticWordPool): string {
  // Build an exclusion set of every word and root in the band name
  const bandWordsExclusion = new Set<string>();
  bandName
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z-]/g, '').toLowerCase())
    .filter(Boolean)
    .forEach((w) => {
      bandWordsExclusion.add(w);
      bandWordsExclusion.add(toSingularModifier(w).toLowerCase());
      bandWordsExclusion.add(pluralizeWord(w).toLowerCase());
    });

  // Pick 2 fresh nouns, 2 fresh adjectives, 1 adverb, and 1 ensemble that do NOT appear in bandName
  const rawNoun1 = capitalizeWord(pickFreshWord(ACTIVE_PACK_NOUNS, EXPANDED_NOUNS, bandWordsExclusion));
  bandWordsExclusion.add(rawNoun1.toLowerCase());
  bandWordsExclusion.add(toSingularModifier(rawNoun1).toLowerCase());

  const rawNoun2 = capitalizeWord(pickFreshWord(ACTIVE_PACK_NOUNS, EXPANDED_NOUNS, bandWordsExclusion));
  bandWordsExclusion.add(rawNoun2.toLowerCase());

  const adj1 = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADJECTIVES, EXPANDED_ADJECTIVES, bandWordsExclusion));
  bandWordsExclusion.add(adj1.toLowerCase());

  const adj2 = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADJECTIVES, EXPANDED_ADJECTIVES, bandWordsExclusion));
  const adv = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADVERBS, EXPANDED_ADVERBS, bandWordsExclusion));
  const ensemble = capitalizeWord(pickFreshWord(ACTIVE_PACK_ENSEMBLES, EXPANDED_ENSEMBLES, bandWordsExclusion));

  const singular1 = toSingularModifier(rawNoun1);
  const pluralOrMass1 = toPluralOrMass(rawNoun1);
  const singular2 = toSingularModifier(rawNoun2);
  const pluralOrMass2 = toPluralOrMass(rawNoun2);

  const key = generateSurrealKey(bandWordsExclusion);
  const studyNum = Math.floor(Math.random() * 99) + 1;
  const studyFormats = [
    studyNum === 1 ? 'Study' : 'Studies',
    studyNum === 1 ? 'Variation' : 'Variations',
    studyNum === 1 ? 'Exercise' : 'Exercises',
    studyNum === 1 ? 'Experiment' : 'Experiments',
    studyNum === 1 ? 'Observation' : 'Observations',
    studyNum === 1 ? 'Theorem' : 'Theorems',
  ];
  const studyWord = studyFormats[Math.floor(Math.random() * studyFormats.length)];

  const titleTemplates = [
    // --- 1. Crisp 1-to-2 Word Deadpan Titles ---
    () => `${adj1} ${pluralOrMass1}`,
    () => `${adj1} ${singular1}`,
    () => `The ${adj1} ${singular1}`,
    () => `The ${adj1} ${pluralizeWord(singular1)}`,
    () => `${singular1} ${rawNoun2}`,
    () => `${singular1} ${pluralOrMass2}`,
    () => `${adv} ${adj1}`,
    () => `${adj1} & ${adj2}`,
    () => `${pluralOrMass1} & ${pluralOrMass2}`,
    () => `Not ${withAOrAn(singular1)}`,
    () => `Strictly ${adj1}`,
    () => `Certified ${adj1}`,
    () => `Mildly ${adj1}`,
    () => ` Zero ${pluralOrMass1}`,
    () => `Emergency ${singular1}`,
    () => `Counterfeit ${pluralOrMass1}`,
    () => `Unlicensed ${pluralOrMass1}`,
    () => `Standard ${singular1}`,
    () => `Provisional ${pluralOrMass1}`,
    () => ` Obsolete ${pluralOrMass1}`,

    // --- 2. Prepositional, Institutional & Situational Titles ---
    () => `${pluralOrMass1} in the ${singular2}`,
    () => `${pluralOrMass1} on the ${singular2}`,
    () => `${pluralOrMass1} Under the ${singular2}`,
    () => `${singular1} Behind the ${singular2}`,
    () => `${singular1} Across the ${singular2}`,
    () => (Math.random() < 0.30 ? `${pluralOrMass1} in ${key}` : `The ${adj1} ${singular1}`),
    () => `${singular1} of ${pluralOrMass2}`,
    () => `${pluralizeWord(singular1)} of ${pluralOrMass2}`,
    () => `The ${singular1} ${ensemble}`,
    () => `The ${adj1} ${ensemble}`,
    () => `The ${singular1} Department`,
    () => `The ${singular1} Protocol`,
    () => `The ${singular1} Incident`,
    () => `The ${singular1} Dilemma`,
    () => `The ${singular1} Hypothesis`,
    () => `The ${adj1} Method`,
    () => `The ${singular1} Directive`,
    () => `The ${singular1} Shortage`,
    () => `Beware of ${pluralOrMass1}`,
    () => `Equipped with ${pluralOrMass1}`,
    () => `Measured in ${pluralizeWord(singular1)}`,
    () => `Longing for ${pluralOrMass1}`,
    () => `Unaware of ${pluralOrMass1}`,
    () => `Facts About ${pluralizeWord(singular1)}`,
    () => `Too Much ${pluralOrMass1}`,
    () => `Not Enough ${pluralOrMass1}`,
    () => `Secondhand ${pluralOrMass1}`,
    () => `Optional ${pluralizeWord(singular1)}`,
    () => `Guilty of ${pluralOrMass1}`,
    () => `Music for ${adj1} ${pluralizeWord(singular1)}`,
    () => `Notes on ${pluralOrMass1}`,
    () => `A Brief History of ${pluralOrMass1}`,
    () => `Songs About ${pluralOrMass1}`,
    () => `The Trouble with ${pluralOrMass1}`,
    () => `The Shape of ${pluralOrMass1}`,
    () => `The Sound of ${pluralOrMass1}`,
    () => `The Weight of ${pluralOrMass1}`,
    () => `Waiting for ${pluralOrMass1}`,
    () => `Please Hold the ${pluralOrMass1}`,
    () => `Leave the ${pluralOrMass1} Behind`,
    () => `Bring Your Own ${singular1}`,
    () => `Nobody Asked for ${pluralOrMass1}`,
    () => `Who Ordered the ${singular1}?`,
    () => `How to Avoid ${pluralOrMass1}`,
    () => `When the ${singular1} Stops`,
    () => `After the ${singular1} Ends`,
    () => `Before the ${singular1} Begins`,
    () => `Both Sides of the ${singular1}`,
    () => `A Study in ${adj1} ${pluralOrMass1}`,
    () => `Principles of ${adj1} ${pluralOrMass1}`,
    () => `Do Not Fold the ${singular1}`,
    () => `Strictly for ${adj1} ${pluralizeWord(singular1)}`,

    // --- 3. Dynamic 1-99 Numbered Archetypes ---
    () => `${studyNum} ${studyWord} for ${pluralOrMass1}`,
    () => `${studyNum} Ways to Avoid ${pluralOrMass1}`,
    () => `${studyNum}% ${adj1}`,
    () => `Form ${studyNum}-B: ${pluralOrMass1}`,
    () => `Rule #${studyNum}: No ${pluralizeWord(singular1)}`,
  ];

  // Rolling Template-Structure Cooldown: prevents the same template index from firing twice within 22 drops
  let recentIdx: number[] = [];
  try {
    const rawIdx = localStorage.getItem('ydrbn_recent_title_tpl_idx');
    if (rawIdx) recentIdx = JSON.parse(rawIdx);
  } catch {}

  let roll = Math.floor(Math.random() * titleTemplates.length);
  for (let attempt = 0; attempt < 25; attempt++) {
    if (!recentIdx.includes(roll)) break;
    roll = Math.floor(Math.random() * titleTemplates.length);
  }

  recentIdx.unshift(roll);
  if (recentIdx.length > 22) recentIdx = recentIdx.slice(0, 22);
  try {
    localStorage.setItem('ydrbn_recent_title_tpl_idx', JSON.stringify(recentIdx));
  } catch {}

  return titleTemplates[roll]().trim();
}

// =========================================================================
// BARGAIN-BIN CONDITION GRADING & ANALOG WARP ENGINE
// =========================================================================

export interface ConditionGradeSpec {
  grade: string;
  isWarped: boolean;
}

export const BARGAIN_BIN_GRADES: ConditionGradeSpec[] = [
  { grade: 'MINT (SEALED ARCHIVAL STOCK)', isWarped: false },
  { grade: 'NM- (FAINT MUSTARD RING ON SLEEVE)', isWarped: false },
  { grade: 'VG+ (LIGHT BASEMENT HUMIDITY)', isWarped: false },
  { grade: 'VG+ (PREVIOUS OWNER TRACED LETTERS)', isWarped: false },
  { grade: 'VG (PRICE STICKER TORN OFF CORNER)', isWarped: false },
  { grade: 'VG (SMELLS FAINTLY OF CELERY)', isWarped: false },
  { grade: 'G+ (RADIATOR WARP // PITCH WOW)', isWarped: true },
  { grade: 'FAIR (USED AS COASTER // WARPED)', isWarped: true },
];

export function resolveConditionGrade(seedStr?: string): ConditionGradeSpec {
  if (!seedStr) {
    return BARGAIN_BIN_GRADES[Math.floor(Math.random() * BARGAIN_BIN_GRADES.length)];
  }
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h * 31 + seedStr.charCodeAt(i)) % 100000;
  }
  return BARGAIN_BIN_GRADES[h % BARGAIN_BIN_GRADES.length];
}

// =========================================================================
// CUSTOM DROP WORD DEDUPLICATION & PART-OF-SPEECH HARVESTER
// =========================================================================

const HARVEST_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'onto', 'upon', 'under', 'over',
  'between', 'through', 'during', 'before', 'after', 'above', 'below', 'about',
  'against', 'among', 'around', 'behind', 'beside', 'beyond', 'inside', 'outside',
  'within', 'without', 'across', 'along', 'amid', 'via', 'despite', 'towards',
  'not', 'but', 'nor', 'yet', 'so', 'or', 'as', 'if', 'when', 'while', 'where',
  'who', 'whom', 'whose', 'which', 'what', 'that', 'this', 'these', 'those',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'side', 'part', 'track', 'song', 'opus', 'reprise', 'dub', 'mix', 'edit',
  'version', 'intro', 'outro', 'interlude', 'vol', 'volume', 'act', 'scene',
  'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'having', 'does',
  'did', 'doing', 'will', 'would', 'shall', 'should', 'can', 'could', 'may',
  'might', 'must', 'ought', 'your', 'our', 'their', 'his', 'her', 'its', 'my',
  'you', 'they', 'them', 'him', 'she', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too',
  'very', 'just', 'now', 'then', 'here', 'there', 'how', 'why',
]);

const ENSEMBLE_HINT_WORDS = new Set([
  'trio', 'quartet', 'quintet', 'sextet', 'septet', 'octet', 'orchestra',
  'syndicate', 'brigade', 'assembly', 'committee', 'coalition', 'consortium',
  'council', 'collective', 'society', 'club', 'guild', 'union', 'league',
  'band', 'group', 'ensemble', 'project', 'experience', 'department', 'bureau',
  'ministry', 'authority', 'foundation', 'institute', 'academy', 'chorus',
  'choir', 'legion', 'squadron', 'platoon', 'regiment', 'corps', 'posse',
  'crew', 'gang', 'mob', 'caucus', 'tribunal', 'panel', 'board', 'dynasty',
]);

export type HarvestWordCategory = 'noun' | 'adjective' | 'ensemble' | 'skip';

export interface AnalyzedHarvestWord {
  word: string;
  category: HarvestWordCategory;
}

/**
 * Builds a complete lowercase Set of all words (plus singular and plural forms)
 * currently present in ACTIVE_NOUNS, ACTIVE_ADJECTIVES, ACTIVE_ADVERBS, and ACTIVE_ENSEMBLES.
 */
export function buildActiveVocabularyLookup(): Set<string> {
  const lookup = new Set<string>();
  const allActive = [
    ...ACTIVE_NOUNS,
    ...ACTIVE_ADJECTIVES,
    ...ACTIVE_ADVERBS,
    ...ACTIVE_ENSEMBLES,
  ];

  for (const raw of allActive) {
    const clean = raw.trim().toLowerCase();
    if (!clean) continue;
    lookup.add(clean);
    lookup.add(toSingularModifier(clean).toLowerCase());
    lookup.add(pluralizeWord(clean).toLowerCase());
  }
  return lookup;
}

/**
 * Extracts tokens from user-supplied Custom Drop fields, filters out stop words
 * and words already in active rotation, and classifies novel words.
 */
export function analyzeCustomDropWords(
  bandName: string,
  albumTitle: string,
  tracksRaw: string
): { novelWords: AnalyzedHarvestWord[]; skippedExistingCount: number } {
  const existingLookup = buildActiveVocabularyLookup();
  const seenInInput = new Set<string>();
  const novelWords: AnalyzedHarvestWord[] = [];
  let skippedExistingCount = 0;

  const bandTokens = bandName
    .split(/[\s,/"'()!?&.:;]+/)
    .map((t) => t.replace(/[^a-zA-Z-]/g, '').trim())
    .filter((t) => t.length >= 3);

  const allRawText = `${bandName} ${albumTitle} ${tracksRaw}`;
  const rawTokens = allRawText
    .split(/[\s,/"'()!?&.:;]+/)
    .map((t) => t.replace(/[^a-zA-Z-]/g, '').trim())
    .filter((t) => t.length >= 3);

  for (const token of rawTokens) {
    const lower = token.toLowerCase();
    if (HARVEST_STOP_WORDS.has(lower)) continue;

    const singular = toSingularModifier(lower).toLowerCase();
    const plural = pluralizeWord(singular).toLowerCase();

    if (seenInInput.has(lower) || seenInInput.has(singular)) {
      continue;
    }
    seenInInput.add(lower);
    seenInInput.add(singular);

    // Disregard if already present in active core or expansion pack pools
    if (
      existingLookup.has(lower) ||
      existingLookup.has(singular) ||
      existingLookup.has(plural)
    ) {
      skippedExistingCount++;
      continue;
    }

    const formatted = capitalizeWord(token);
    let category: HarvestWordCategory = 'noun';

    if (ENSEMBLE_HINT_WORDS.has(lower) || ENSEMBLE_HINT_WORDS.has(singular)) {
      category = 'ensemble';
    } else if (
      isAdverbWord(lower) ||
      /(?:ed|ing|ous|ic|ical|al|ful|less|ish|ive|able|ible|esque|ant|ent)$/i.test(lower) ||
      (bandTokens.length >= 2 && bandTokens[0].toLowerCase() === lower && !lower.endsWith('s'))
    ) {
      category = 'adjective';
    } else if (
      bandTokens.length >= 2 &&
      bandTokens[bandTokens.length - 1].toLowerCase() === lower &&
      bandName.toLowerCase().startsWith('the ') &&
      !lower.endsWith('s')
    ) {
      category = 'ensemble';
    }

    novelWords.push({ word: formatted, category });
  }

  return { novelWords, skippedExistingCount };
}

// =========================================================================
// OFFLINE "PRESSING DNA" SHARE & CLONE SERIALIZER
// =========================================================================

export function encodePressingDna(album: AlbumEntry): string {
  const safeRecipe: CanvasRecipe | undefined = album.recipe
    ? {
        ...album.recipe,
        customPhotoUrl: undefined,
      }
    : undefined;

  const payload = {
    v: 1,
    b: album.bandName,
    t: album.albumTitle,
    y: album.year,
    c: album.catalogNumber,
    tr: album.tracks,
    rv: album.fauxReviews,
    bio: album.bandBio,
    sk: album.skewDeg,
    st: album.stickers,
    rc: safeRecipe,
    ap: album.audioPreset,
    ff: album.fontFamily,
    tc: album.textColor,
    ss: album.shadowStyle,
    tl: album.titleLayout,
    cg: album.conditionGrade,
    w: album.isWarpedAudio,
  };

  const json = JSON.stringify(payload);
  const encoded = btoa(encodeURIComponent(json));
  return `YDRBN-DNA:${encoded}`;
}

export async function decodePressingDna(dnaString: string): Promise<AlbumEntry> {
  const clean = dnaString.trim();
  const rawBase64 = clean.startsWith('YDRBN-DNA:')
    ? clean.slice('YDRBN-DNA:'.length).trim()
    : clean;

  let parsed: any;
  try {
    const json = decodeURIComponent(atob(rawBase64));
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid or corrupted Pressing DNA code.');
  }

  if (!parsed || !parsed.b || !parsed.t) {
    throw new Error('DNA code is missing band or album title metadata.');
  }

  const recipe: CanvasRecipe = parsed.rc || {
    backdrop: 'radial_sunburst',
    subject: 'tooth',
    modifier: 'caution_stamp',
    palette: '70s Earth',
    seed: 1977,
  };

  await loadRecipeAssets(String(recipe.backdrop || ''), String(recipe.subject || ''));
  const coverImageUrl = gagCanvasEngine.renderCover(parsed.b, parsed.t, recipe);
  const fallbackCond = resolveConditionGrade(`${parsed.b}-${parsed.t}`);

  return {
    id: `dna-clone-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    bandName: parsed.b,
    albumTitle: parsed.t,
    year: parsed.y || '1977',
    catalogNumber: parsed.c || `DNA-${parsed.y || '1977'}-CLONE`,
    artDirectorPrompt: `Cloned via Pressing DNA: ${parsed.b} - ${parsed.t}`,
    tracks: Array.isArray(parsed.tr) && parsed.tr.length > 0 ? parsed.tr : ['Track 1'],
    fauxReviews: Array.isArray(parsed.rv) ? parsed.rv : ['"Cloned from archival DNA." — The Ledger'],
    bandBio: parsed.bio || 'Reconstructed directly from an offline Pressing DNA sequence.',
    coverImageUrl,
    timestamp: Date.now(),
    isFavorite: false,
    skewDeg: typeof parsed.sk === 'number' ? parsed.sk : 0,
    stickers: Array.isArray(parsed.st) ? parsed.st : [],
    recipe,
    audioPreset: parsed.ap || 'analog-synth',
    fontFamily: parsed.ff || 'chrome',
    textColor: parsed.tc || '#fef08a',
    shadowStyle: parsed.ss || 'harsh-black',
    titleLayout: parsed.tl || 'bottom-banner',
    conditionGrade: parsed.cg || fallbackCond.grade,
    isWarpedAudio: typeof parsed.w === 'boolean' ? parsed.w : fallbackCond.isWarped,
    isCustomPressing: true,
    customPressingTag: 'DNA CLONE',
  };
}

// =========================================================================
// MAIN DAILY DROP & CUSTOM DROP GENERATORS
// =========================================================================

export async function generateDailyDrop(): Promise<AlbumEntry> {
  await hydrateContentPools();

  const tags: SemanticTag[] = [
    'scientific',
    'culinary',
    'anatomical',
    'bureaucracy',
    'misfortune',
    'domestic',
  ];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  const pool = SEMANTIC_POOLS[tag];

  let newBandName = generateCandidateBandName(pool);
  let attempts = 0;
  while (historyRegistry.has(newBandName) && attempts < 1000) {
    newBandName = generateCandidateBandName(pool);
    attempts++;
  }

  historyRegistry.add(newBandName);
  const bandName = newBandName;

  let recentAlbums: string[] = [];
  try {
    const stored = localStorage.getItem('ydrbn_recent_albums');
    if (stored) {
      recentAlbums = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse recent albums from storage', e);
  }

  let candidateTitle = generateDynamicAlbumTitle(bandName, pool);
  let titleAttempts = 0;

  while (recentAlbums.includes(candidateTitle) && titleAttempts < 100) {
    candidateTitle = generateDynamicAlbumTitle(bandName, pool);
    titleAttempts++;
  }

  recentAlbums.unshift(candidateTitle);
  if (recentAlbums.length > 28) {
    recentAlbums = recentAlbums.slice(0, 28);
  }
  localStorage.setItem('ydrbn_recent_albums', JSON.stringify(recentAlbums));
  const albumTitle = candidateTitle;

  const currentYear = new Date().getFullYear();
  const isTemporalEasterEgg = Math.random() < 0.04;

  let year: string;
  if (isTemporalEasterEgg && currentYear < 2060) {
    const futureYearsCount = 2060 - currentYear;
    year = String(currentYear + 1 + Math.floor(Math.random() * futureYearsCount));
  } else {
    const standardYearsCount = currentYear - 1960 + 1;
    year = String(1960 + Math.floor(Math.random() * standardYearsCount));
  }

  const catalogNumber = IS_ELBOW_FAILSAFE_MODE
    ? `YDR-${year}-ELBOW-FAILSAFE`
    : `YDR-${year}-STEREO`;

  const combo = selectModularCombination(bandName, albumTitle);

  let forceNoStickers = false;
  if (IS_ELBOW_FAILSAFE_MODE) {
    combo.backdrop = (Math.random() < 0.5 ? 'elbow_selfie_backdrop' : 'elbow_mech_backdrop') as any;
    if (getPreferences().disableDefaultSubjects && ACTIVE_SUBJECTS.length === 0) {
      combo.subject = 'none' as any;
    }
  } else if (Math.random() < 0.20) {
    combo.subject = 'none' as any;
    combo.modifier = 'none';
    forceNoStickers = true;

    if (Math.random() < 0.50) {
      combo.backdrop = 'minimal_gradient' as any;
    }
  }

  const speechText =
    pool.denialPhrases[Math.floor(Math.random() * pool.denialPhrases.length)];
  const stampText =
    pool.stampLabels[Math.floor(Math.random() * pool.stampLabels.length)];

  const recipe: CanvasRecipe = {
    backdrop: combo.backdrop,
    subject: combo.subject,
    modifier: combo.modifier,
    palette: combo.palette,
    spiralStyle: combo.spiralStyle,
    speechText,
    stampText,
    focalItem: combo.subject,
    seed: Math.floor(Math.random() * 2147483647),
  };

  const tracks: string[] = [];
  const shuffledThemes = [...pool.trackThemes].sort(() => 0.5 - Math.random());
  const trackExclusions = new Set<string>();
  let usedKeyInTracklist = false;

  for (let i = 0; i < 7; i++) {
    if (i < 2) {
      tracks.push(shuffledThemes[i % shuffledThemes.length]);
    } else {
      const tAdj = capitalizeWord(pickFreshWord(ACTIVE_PACK_ADJECTIVES, ACTIVE_ADJECTIVES, trackExclusions));
      const tRawNoun = capitalizeWord(pickFreshWord(ACTIVE_PACK_NOUNS, ACTIVE_NOUNS, trackExclusions));
      trackExclusions.add(tRawNoun.toLowerCase());
      const tPluralOrMass = toPluralOrMass(tRawNoun);
      const tSingular = toSingularModifier(tRawNoun);

      const trackPatterns = [
        () => `Under the ${tPluralOrMass}`,
        () => `${tSingular} in the Attic`,
        () => `Beyond the World of ${tSingular}`,
        () => `March of the ${pluralizeWord(tSingular)}`,
        () => `${tPluralOrMass} on the Run`,
        () => `A Dance with ${tPluralOrMass}`,
        () => `The Secret of ${tSingular}`,
        () => `Long After ${tSingular}`,
        () => `${tPluralOrMass} After the Rain`,
        () => `The ${tSingular} Factory`,
        () => `The ${tAdj} ${tSingular} Waltz`,
        () => `The ${tSingular} Is Out`,
        () => `The Truth About ${tSingular}`,
        () => `The ${tSingular} Files`,
        () => `The Legend of ${tSingular}`,
        () => `Before the ${tSingular}`,
        () => `The ${tSingular} Rehearsal`,
        () => `${tPluralOrMass} for Nobody`,
        () => `The ${tSingular} Experiment`,
        () => `No More ${tPluralOrMass}`,
        () => `The ${tSingular} Dilemma`,
        () => `${tSingular} on Trial`,
        () => `A Room Full of ${tPluralOrMass}`,
        () => `${tSingular} in the Basement`,
        () => `${tSingular} for President`,
        () => `The ${tSingular} Nobody Saw`,
        () => `A Question of ${tPluralOrMass}`,
        () => `${tSingular} at the Gates`,
        () => `The ${tSingular} Orchestra`,
        () => `${tSingular} Without End`,
        () => `Waltz for ${withAOrAn(tAdj)} ${tSingular}`,
        () => `Nothing but ${tPluralOrMass}`,
        () => `Don't Touch the ${tPluralOrMass}`,
        () => `${tAdj} ${tPluralOrMass} (Part ${i - 1})`,
        () => `The ${tSingular} Equation`,
        () => `A World Without ${tPluralOrMass}`,
        () => `The ${tAdj} ${tSingular} Forecast`,
        () => `A Fine Mess of ${tPluralOrMass}`,
        () => `How to Lose a ${tSingular}`,
        () => `${tSingular} Across the Hall`,
        () => `The ${tAdj} ${tSingular} Method`,
        () => `An Inconvenient ${tSingular}`,
        () => `${tSingular} in the Wrong Place`,
        () => `The ${tSingular} Has Left the Building`,
        () => `What Have We Done with ${tPluralOrMass}`,
        () => `${tSingular} Under Investigation`,
        () => `The ${tSingular} Appreciation Society`,
        () => `Nobody Likes a ${tSingular}`,
        () => `The ${tSingular} Has Opinions`,
        () => `${tPluralOrMass} Under Pressure`,
        () => `Don't Wake the ${pluralizeWord(tSingular)}`,
        () => `Please Hold the ${tPluralOrMass}`,
        () => `${tSingular} Under New Management`,
        () => `Who Ordered the ${tSingular}`,
        () => `${tSingular} and Other Disasters`,
        () => `${tSingular} Without Permission`,
        () => `A Pocket Full of ${tPluralOrMass}`,
        // --- Additional Track Patterns ---
        () => `Where the ${tSingular} Sleeps`,
        () => `All the King's ${tPluralOrMass}`,
        () => `The Last ${tSingular} in Town`,
        () => `Somewhere Between ${tSingular} and ${tPluralOrMass}`,
        () => `${tSingular} of the Month`,
        () => `The ${tPluralOrMass} Convention`,
        () => `Ways to Misplace a ${tSingular}`,
        () => `An Open Letter to ${tPluralOrMass}`,
        () => `The ${tSingular} Situation`,
        () => `Nobody's ${tPluralOrMass}`,
        () => `${tPluralOrMass} at Midnight`,
        () => `The Trouble with ${tSingular}`,
        () => `A Brief History of ${tPluralOrMass}`,
        () => `${tSingular} by Committee`,
        () => `The ${tAdj} ${tPluralOrMass} Parade`,
        () => `Everything Must Go, Including the ${tSingular}`,
        () => `An Ode to ${tPluralOrMass}`,
        () => `The Day the ${tSingular} Arrived`,
        () => `${tSingular} in Disguise`,
        () => `Notes from the ${tSingular} Department`,
        () => `The ${tSingular} Next Door`,
        () => `Too Many ${tPluralOrMass}`,
        () => `${tPluralOrMass} of the Future`,
        () => `The Unfinished ${tSingular}`,
        () => `${tSingular} for the Recently Departed`,
        () => `Please Explain the ${tSingular}`,
        () => `A Thousand ${tPluralOrMass}`,
        () => `The ${tSingular} Problem`,
        () => `Last Call for ${tPluralOrMass}`,
        () => `${tSingular} in a Minor Key`,
        () => `The Curious Case of ${tSingular}`,
        () => `An Evening with ${tPluralOrMass}`,
        () => `Keep Your ${tPluralOrMass} Close`,
        () => `The ${tAdj} Art of ${tSingular}`,
        () => `Some Assembly Required for ${tSingular}`,
        () => `${tSingular} Has Entered the Chat`,
        () => `The ${tPluralOrMass} Must Be Stopped`,
        () => `Anatomy of a ${tSingular}`,
        () => `Everything's Fine, Except the ${tSingular}`,
        () => `${tSingular} from Another Room`,
        () => `The ${tPluralOrMass} Have It`,
        () => `One Last ${tSingular}`,
        () => `A Very ${tAdj} ${tSingular}`,
        () => `Return of the ${pluralizeWord(tSingular)}`,
        () => `Instructions for ${tPluralOrMass}`,
        () => `The ${tSingular} Beneath the Floor`,
        () => `An Appointment with ${tSingular}`,
        () => `${tPluralOrMass} Don't Grow on Trees`,
        () => `The ${tAdj} Side of ${tSingular}`,
        () => `Lost Among the ${tPluralOrMass}`,
        () => `${tSingular} Is a Serious Matter`,
        () => `The ${tSingular} Memorial`,
        () => `Please Remain Calm Around the ${tPluralOrMass}`,
        () => `${tSingular}, More or Less`,
        () => `The ${tPluralOrMass} Are Listening`,
        () => `An Unusual Amount of ${tPluralOrMass}`,
        () => `Tomorrow Belongs to ${tSingular}`,
        () => {
          if (!usedKeyInTracklist && Math.random() < 0.25) {
            usedKeyInTracklist = true;
            return `${tPluralOrMass} in ${generateSurrealKey(trackExclusions)}`;
          }
          return `${tAdj} ${tPluralOrMass}`;
        },
      ];
      tracks.push(trackPatterns[Math.floor(Math.random() * trackPatterns.length)]());
    }
  }
  tracks.push(`${albumTitle} (Reprise)`);

  const reviewAdjectives = [
    'Absurd',
    'Completely unhinged',
    'Perversely melodic',
    'A dry acoustic shock',
    'Alarmingly crunchy',
    'Bewildering yet irresistible',
    'Deeply obstinate',
    'Audaciously quiet',
    'Rhythmically bewildered',
    'Spectacularly deadpan',
    'Aggressively inconclusive',
    'Bureaucratically avant-garde',
    'Suspiciously tuneful',
    'Mechanically sentimental',
    'Historically unnecessary',
    'Unreasonably percussive',
    'Elegantly malfunctioning',
    'Sonically uncooperative',
    'Administratively magnificent',
    'Profoundly miscalibrated',
    'Uncomfortably harmonious',
    'Delightfully misinformed',
    'Relentlessly middle-of-the-road',
    'Ceremonially cacophonous',
    'Inexplicably sophisticated',
    'Stubbornly atmospheric',
    'Magnificently underprepared',
    'Excessively contemplative',
    'Unnecessarily orchestral',
    'Suspiciously well-organized',
    'Fiercely underwhelming',
    'Accidentally transcendent',
    'Remarkably ill-advised',
    'Quietly catastrophic',
    'Painstakingly unlistenable',
    'Unapologetically lopsided',
    'Strangely municipal',
    'Acoustically bewildering',
    'Impressively disorganized',
    'Melodically noncompliant',
  ];

  const reviewTemplates = [
    (adj: string, pub: string) => `"${adj}; an utter affront to conventional recording etiquette." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; they played three whole songs without touching their instruments." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the vinyl itself seemed embarrassed to rotate." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the rhythm section appears to be appealing a zoning decision." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a recording that treats silence as a hostile witness." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; every instrument sounds as though it arrived by separate courier." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the production budget was clearly spent on paperwork." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; sounds like a rehearsal interrupted by a very polite fire alarm." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the engineers deserve hazard pay and a written apology." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; future historians may classify this as a preventable incident." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a bold refusal to acknowledge the existence of conventional tempo." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; sounds like a filing cabinet attempting to remember its childhood." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the bass line has apparently been operating without a permit." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; an ambitious experiment in making every note seem slightly misplaced." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the melodies arrive late and leave before the refreshments." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; one suspects the drummer was given entirely different instructions." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; an extraordinary achievement in avoiding a recognizable chorus." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; sounds like an orchestra assembled from the contents of a municipal lost-property office." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the recording process appears to have involved several unnecessary committees." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a curious reminder that not every noise requires documentation." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the guitar tone suggests a dispute between two incompatible electrical outlets." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; even the reverb sounds as though it would rather be somewhere else." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; an album that repeatedly mistakes technical difficulty for artistic ambition." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the compositions possess all the structural confidence of a folding chair." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; listeners are advised to maintain a respectful distance from the speakers." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a remarkable collection of sounds that seem to have missed their scheduled appointments." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the arrangements suggest an unresolved disagreement with basic geometry." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the mastering engineer has reportedly requested reassignment." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; sounds like a particularly expensive mistake being made in slow motion." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a confident demonstration of what happens when nobody checks the instructions." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the final mix resembles a weather report delivered by malfunctioning machinery." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; its artistic intentions remain unclear, even to the people responsible." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the percussion seems to be negotiating independently with the melody." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a sonic document of events that nobody has agreed actually occurred." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the album's strongest feature is its apparent indifference to criticism." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a thoroughly convincing argument against unsupervised studio access." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the compositions display a curious hostility toward the concept of resolution." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; sounds like an emergency broadcast from a very unmusical civilization." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; an oddly moving tribute to the limitations of available equipment." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the result is less an album than a lengthy correspondence with a malfunctioning amplifier." — ${pub}`,
  ];

  const generateSingleReview = (): string => {
    const pub = CRITIC_PUBLICATIONS[Math.floor(Math.random() * CRITIC_PUBLICATIONS.length)];
    const adj = reviewAdjectives[Math.floor(Math.random() * reviewAdjectives.length)];
    const tpl = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
    return tpl(adj, pub);
  };

  const review1 = generateSingleReview();
  let review2 = generateSingleReview();
  let reviewRerollAttempts = 0;
  while (review2 === review1 && reviewRerollAttempts < 50) {
    review2 = generateSingleReview();
    reviewRerollAttempts++;
  }

  const fauxReviews = [review1, review2];

  const ORIGIN_CLAUSES = [
    (band: string, yr: string) => `Formed in ${yr} following an unresolved municipal zoning dispute, ${band}`,
    (band: string, yr: string) => `Assembled when three disgruntled archivists accidentally booked the same basement in ${yr}, ${band}`,
    (band: string, yr: string) => `Conceived during a widespread power fluctuation in late ${yr}, ${band}`,
    (band: string, yr: string) => `Emerging from the industrial periphery of Flumptown in ${yr}, ${band}`,
    (band: string, yr: string) => `Organized under emergency municipal bylaws in ${yr}, ${band}`,
    (band: string, yr: string) => `Founded in ${yr} behind a shuttered appliance wholesaler, ${band}`,
    (band: string, yr: string) => `First convened in ${yr} after a neighborhood committee mistook a noise complaint for an audition, ${band}`,
    (band: string, yr: string) => `Formed in ${yr} during an unauthorized after-hours equipment inventory, ${band}`,
    (band: string, yr: string) => `Established in ${yr} following a dispute over communal storage space, ${band}`,
    (band: string, yr: string) => `Gathered in ${yr} beneath the offices of a defunct insurance broker, ${band}`,
    (band: string, yr: string) => `Founded in ${yr} after an unsuccessful public address system demonstration, ${band}`,
    (band: string, yr: string) => `Assembled in ${yr} by a group of reluctant neighborhood volunteers, ${band}`,
    (band: string, yr: string) => `Originating in ${yr} from an abandoned municipal rehearsal room, ${band}`,
    (band: string, yr: string) => `Formed in ${yr} after a routine equipment inspection became contentious, ${band}`,
    (band: string, yr: string) => `Conceived in ${yr} during a prolonged regional telephone outage, ${band}`,
    (band: string, yr: string) => `Organized in ${yr} by former members of a dissolved gardening association, ${band}`,
    (band: string, yr: string) => `Emerging in ${yr} from a dispute over an incorrectly delivered piano, ${band}`,
    (band: string, yr: string) => `Founded in ${yr} following an incident at the local community hall, ${band}`,
    (band: string, yr: string) => `First assembled in ${yr} during an unusually lengthy lunch break, ${band}`,
    (band: string, yr: string) => `Formed in ${yr} after a faulty intercom attracted unexpected attention, ${band}`,
    (band: string, yr: string) => `Brought together in ${yr} by a shared interest in obsolete machinery, ${band}`,
    (band: string, yr: string) => `Established in ${yr} inside a disused regional printing office, ${band}`,
    (band: string, yr: string) => `Conceived in ${yr} during a particularly confusing residents' meeting, ${band}`,
    (band: string, yr: string) => `Assembled in ${yr} after an unclaimed instrument auction, ${band}`,
    (band: string, yr: string) => `Founded in ${yr} by individuals with no prior musical correspondence, ${band}`,
    (band: string, yr: string) => `Formed in ${yr} following a disagreement over rehearsal room heating, ${band}`,
    (band: string, yr: string) => `Emerging in ${yr} from the basement of a closed furniture showroom, ${band}`,
    (band: string, yr: string) => `Organized in ${yr} under the supervision of an absent committee chair, ${band}`,
    (band: string, yr: string) => `Founded in ${yr} after a warehouse inventory produced an unexplained amplifier, ${band}`,
    (band: string, yr: string) => `Assembled in ${yr} during a regional shortage of suitable meeting rooms, ${band}`,
    (band: string, yr: string) => `Formed in ${yr} following an accidental broadcast over the town intercom, ${band}`,
    (band: string, yr: string) => `Conceived in ${yr} behind the loading bay of a wholesale stationery supplier, ${band}`,
    (band: string, yr: string) => `Established in ${yr} after a misplaced council document brought them together, ${band}`,
  ];
  const BEHAVIOR_CLAUSES = [
    'quickly gained a reputation for concluding performances several minutes before audiences realized',
    'insisted on recording every master take in a single uninterrupted burst of stubborn obstinacy',
    'conducted rehearsals in complete darkness to eliminate accidental commercial appeal',
    'engineered an abrasive signature tone by running rhythm tracks through defective voltage regulators',
    'treated studio time as an endurance trial between musicians, engineers, and local building inspectors',
    'required all prospective members to submit a written explanation of their preferred silence',
    'used a filing cabinet as the official repository for all musical decisions',
    'treated the soundcheck as the main performance and the concert as an administrative formality',
    'refused to perform until all cables had been alphabetically arranged',
    'insisted that every rehearsal begin with a formal attendance review',
    'maintained a strict policy of avoiding recognizable musical structures',
    'replaced the traditional encore with a brief equipment inspection',
    'allowed the bass player to approve all matters of public correspondence',
    'conducted lengthy debates over the correct duration of a pause',
    'insisted that all recording sessions conclude with a written assessment',
    'developed a signature sound using poorly maintained domestic appliances',
    'refused to acknowledge the existence of standard tuning procedures',
    'required audiences to remain seated during all instrumental adjustments',
    'maintained an elaborate filing system for rejected melodies',
    'treated every missed note as an opportunity for further discussion',
    'scheduled performances according to the availability of nearby parking',
    'insisted that all song titles receive provisional committee approval',
    'conducted soundchecks at volumes considered excessive by local authorities',
    'used rehearsal time primarily to discuss the storage of unused equipment',
    'adopted an unusual policy of never repeating a successful arrangement',
    'required all members to sign off on the final silence of each song',
    'performed with the determined confidence of an underfunded research team',
    'frequently interrupted songs to verify the condition of the lighting',
    'maintained that mistakes were only valid when properly documented',
    'insisted on using instruments with unresolved maintenance histories',
    'treated audience applause as an optional administrative requirement',
    'developed a rehearsal schedule based entirely on disputed recollections',
    'refused to release any recording without a corresponding inventory number',
    'conducted lengthy improvisations around a single unresolved chord',
  ];
  const AFTERMATH_CLAUSES = [
    (album: string) => `leaving "${album}" as their sole officially acknowledged physical pressing.`,
    (album: string) => `resulting in "${album}", an effort critics classified as both an acoustic triumph and an environmental liability.`,
    (album: string) => `culminating in "${album}", despite persistent claims by the label that the session tapes were destroyed.`,
    (album: string) => `leaving behind "${album}" as an unclassified anomaly in the distributor's catalog.`,
    (album: string) => `producing "${album}", which the distributor listed under both music and miscellaneous office supplies.`,
    (album: string) => `leaving "${album}" to be rediscovered years later in a box marked "miscellaneous electrical parts."`,
    (album: string) => `resulting in "${album}", later withdrawn over a disagreement about its running order.`,
    (album: string) => `leaving "${album}" as the only surviving record of their activities.`,
    (album: string) => `producing "${album}", which received limited attention from regional appliance dealers.`,
    (album: string) => `leaving "${album}" in the care of an increasingly confused distributor.`,
    (album: string) => `resulting in "${album}", released without an agreed track listing.`,
    (album: string) => `leaving "${album}" as an enduring monument to poor scheduling.`,
    (album: string) => `producing "${album}", whose original master remains unaccounted for.`,
    (album: string) => `leaving "${album}" to circulate among a handful of municipal employees.`,
    (album: string) => `resulting in "${album}", briefly mistaken for an instructional recording.`,
    (album: string) => `leaving "${album}" as their final documented act of cooperation.`,
    (album: string) => `producing "${album}", later filed under an unrelated catalog number.`,
    (album: string) => `leaving "${album}" to acquire an unlikely reputation among collectors.`,
    (album: string) => `resulting in "${album}", which the label declined to explain publicly.`,
    (album: string) => `leaving "${album}" as evidence of their prolonged disagreement.`,
    (album: string) => `producing "${album}", a release that nobody officially remembers approving.`,
    (album: string) => `leaving "${album}" in a warehouse awaiting further instructions.`,
    (album: string) => `resulting in "${album}", later cited in an unrelated insurance claim.`,
    (album: string) => `leaving "${album}" as a curious footnote in local recording history.`,
    (album: string) => `producing "${album}", which the pressing plant refused to reproduce.`,
    (album: string) => `leaving "${album}" as the subject of several unresolved ownership claims.`,
    (album: string) => `resulting in "${album}", eventually discovered beneath a stack of invoices.`,
    (album: string) => `leaving "${album}" to survive long after the group ceased communicating.`,
    (album: string) => `producing "${album}", later described as an avoidable technical incident.`,
    (album: string) => `leaving "${album}" as their only known commercial achievement.`,
    (album: string) => `resulting in "${album}", which briefly appeared in a school equipment catalog.`,
    (album: string) => `leaving "${album}" to circulate without an identifiable publisher.`,
    (album: string) => `producing "${album}", whose liner notes contained several disputed facts.`,
    (album: string) => `leaving "${album}" as a permanent fixture of the label's back catalog.`,
    (album: string) => `resulting in "${album}", a recording that defied every available classification.`,
    (album: string) => `leaving "${album}" behind after an unexplained change of address.`,
    (album: string) => `producing "${album}", which was later returned to the sender.`,
    (album: string) => `leaving "${album}" as an unresolved matter of historical record.`,
    (album: string) => `resulting in "${album}", preserved despite repeated requests for its removal.`,
    (album: string) => `leaving "${album}" as the group's only undisputed accomplishment.`,
  ];

  const origin = ORIGIN_CLAUSES[Math.floor(Math.random() * ORIGIN_CLAUSES.length)](bandName, year);
  const behavior = BEHAVIOR_CLAUSES[Math.floor(Math.random() * BEHAVIOR_CLAUSES.length)];
  const aftermath = AFTERMATH_CLAUSES[Math.floor(Math.random() * AFTERMATH_CLAUSES.length)](albumTitle);

  const bandBio = `${origin}. The group ${behavior}, ${aftermath}`;

  const fontFamilies: TitleFontFamily[] = [
    'medieval', 'bubble', 'comic', 'marker', 'monospace',
    'chrome', 'typewriter', 'western', 'arcade', 'graffiti',
    'serif', 'handwritten', 'stencil', 'space', 'circus',
    'newspaper', 'industrial', 'schoolbook', 'futuristic', 'ornamental',
  ];
  const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];

  const textColors = [
    '#fef08a', '#fde047', '#fed7aa', '#ffedd5', '#fecdd3',
    '#e0f2fe', '#d1fae5', '#ffffff', '#fb923c', '#a7f3d0',
  ];
  const textColor = textColors[Math.floor(Math.random() * textColors.length)];

  const shadowStyles: TitleShadowStyle[] = [
    'harsh-black', 'neon-glow', 'chromatic-3d', 'retro-bevel', 'long-shadow',
    'double-outline', 'offset-print', 'inner-glow', 'embossed', 'sticker-outline',
    'halftone-shadow', 'electric-outline', 'ghosted', 'rubber-stamp', 'none',
  ];
  const shadowStyle = shadowStyles[Math.floor(Math.random() * shadowStyles.length)];

  let titleLayout: TitleComposition;
  if (combo.backdrop === 'split_horizon' || combo.backdrop === 'desert_horizon') {
    titleLayout = 'top-arc';
  } else if (combo.backdrop === 'deep_space' || combo.backdrop === 'dark_forest' || combo.backdrop === 'urban_skyline') {
    titleLayout = Math.random() > 0.5 ? 'bottom-banner' : 'top-arc';
  } else if (combo.backdrop === 'drafting_grid' || combo.backdrop === 'traffic_jam') {
    titleLayout = 'bottom-banner';
  } else if (combo.backdrop === 'radial_sunburst') {
    titleLayout = 'diagonal-cross';
  } else {
    const titleLayouts: TitleComposition[] = [
      'top-arc',
      'diagonal-cross',
      'split-corners',
      'bottom-banner',
    ];
    titleLayout = titleLayouts[Math.floor(Math.random() * titleLayouts.length)];
  }

  let skewDeg = 0;
  if (titleLayout === 'top-arc') {
    skewDeg = -Math.floor(Math.random() * 11) - 5;
  } else if (titleLayout === 'diagonal-cross') {
    const mag = Math.floor(Math.random() * 8) + 11;
    skewDeg = Math.random() > 0.5 ? mag : -mag;
  } else if (titleLayout === 'split-corners') {
    skewDeg = Math.floor(Math.random() * 9) - 4;
  } else {
    skewDeg = Math.floor(Math.random() * 5) - 2;
  }

  await loadRecipeAssets(String(combo.backdrop), String(combo.subject));

  recipe.titleLayout = titleLayout;

  const coverImageUrl = gagCanvasEngine.renderCover(
    bandName,
    albumTitle,
    recipe
  );

  let stickerCount = titleLayout === 'split-corners' ? 1 : (Math.random() > 0.4 ? 2 : 1);
  if (forceNoStickers) stickerCount = 0;

  const shuffledStyles = [...STICKER_STYLES].sort(() => 0.5 - Math.random());
  const shuffledPhrases = [...HYPE_PHRASES].sort(() => 0.5 - Math.random());
  const stickers: HypeSticker[] = [];

  if (IS_ELBOW_FAILSAFE_MODE) {
    const failsafeNotice =
      ELBOW_FAILSAFE_STICKER_TEXTS[
        Math.floor(Math.random() * ELBOW_FAILSAFE_STICKER_TEXTS.length)
      ];
    stickers.push({
      id: `stk-elbow-failsafe-${Date.now()}`,
      text: failsafeNotice,
      type: 'rect',
      bg: '#facc15',
      color: '#09090b',
      border: '#dc2626',
      rotation: Math.floor(Math.random() * 10) - 5,
      position: 'bottom-left',
    });
  } else {
    for (let s = 0; s < stickerCount; s++) {
      const style = shuffledStyles[s % shuffledStyles.length];
      const phrase = shuffledPhrases[s % shuffledPhrases.length];
      stickers.push({
        id: `stk-${Date.now()}-${s}`,
        text: phrase,
        type: style.type,
        bg: style.bg,
        color: style.color,
        border: style.border,
        rotation: Math.floor(Math.random() * 20) - 10,
        position: 'bottom-left',
      });
    }
  }

  const audioPresets: AlbumEntry['audioPreset'][] = [
    'psych-rock',
    'analog-synth',
    'krautrock',
    'ambient-drone',
    'post-punk',
  ];
  const audioPreset =
    audioPresets[Math.floor(Math.random() * audioPresets.length)];

  const cond = resolveConditionGrade();

  return {
    id: `ydrbn-drop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    bandName,
    albumTitle,
    year,
    catalogNumber,
    artDirectorPrompt: `Procedural gag cover: ${bandName} - ${albumTitle}`,
    tracks,
    fauxReviews,
    bandBio,
    coverImageUrl,
    timestamp: Date.now(),
    isFavorite: false,
    skewDeg,
    stickers,
    recipe,
    audioPreset,
    fontFamily,
    textColor,
    shadowStyle,
    titleLayout,
    conditionGrade: cond.grade,
    isWarpedAudio: cond.isWarped,
  };
}

export const generateProceduralBand = generateDailyDrop;

export async function forgeCustomDrop(input: CustomDropInput): Promise<AlbumEntry> {
  // 1. If cloned directly from a Pressing DNA string, return it immediately
  if (input.dnaClonedAlbum) {
    return input.dnaClonedAlbum;
  }

  // 2. If user checked "Add to Generator Rotation", harvest novel words & image into IndexedDB first
  if (input.harvestToRotation && input.harvestedWords) {
    await harvestCustomDropToPack(
      input.harvestedWords,
      input.coverImageBase64,
      input.harvestImageMode || 'none',
      input.bandName || input.albumTitle || 'custom'
    );
  }

  const base = await generateDailyDrop();

  const bandName = input.bandName?.trim() || base.bandName;
  const albumTitle = input.albumTitle?.trim() || base.albumTitle;

  // Only lock out bandName in historyRegistry if user did NOT allow recurrence
  if (input.bandName?.trim() && !input.allowBandNameRecurrence) {
    historyRegistry.add(bandName);
  }

  const year = input.year?.trim() || base.year;
  const catalogNumber = `CD-${year}-CUSTOM`;

  let tracks: string[] = base.tracks;
  if (input.tracks && input.tracks.length > 0) {
    tracks = input.tracks.map((t) => t.trim()).filter(Boolean);
    if (tracks.length === 1) {
      tracks.push(`${tracks[0]} (Instrumental Dub)`);
    }
  }

  const bandBio = input.lore?.trim() || base.bandBio;
  const fauxReviews = input.review?.trim()
    ? [`"${input.review.trim()}" — The Custom Ledger`, base.fauxReviews[0]]
    : base.fauxReviews;

  const audioPreset = input.audioPreset || base.audioPreset;

  let coverImageUrl = base.coverImageUrl;
  const matchedBackdrop = detectContextualBackdrop(bandName, albumTitle);
  const matchedSubject = detectContextualSubject(bandName, albumTitle);

  const recipe: CanvasRecipe = {
    ...base.recipe,
    backdrop: matchedBackdrop || base.recipe?.backdrop,
    subject: matchedSubject || base.recipe?.subject,
    focalItem: matchedSubject || base.recipe?.focalItem,
  };

  if (input.coverImageBase64) {
    try {
      const { url } = await gagCanvasEngine.processCustomPhoto(input.coverImageBase64);
      coverImageUrl = url;
    } catch {
      coverImageUrl = input.coverImageBase64;
    }
  } else {
    await loadRecipeAssets(String(recipe.backdrop), String(recipe.subject));
    coverImageUrl = gagCanvasEngine.renderCover(bandName, albumTitle, recipe);
  }

  const customDropSticker: HypeSticker = {
    id: `stk-customdrop-${Date.now()}`,
    text: 'CUSTOM DROP // PRIVATE PRESSING',
    type: 'rect',
    bg: '#ffffff',
    color: '#090d16',
    border: '#000000',
    rotation: Math.floor(Math.random() * 8) - 4,
    position: 'top-left',
  };

  const stickers: HypeSticker[] = [
    customDropSticker,
    ...base.stickers.filter((s) => s.position !== 'top-left'),
  ];

  return {
    ...base,
    id: `custom-drop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    bandName,
    albumTitle,
    year,
    catalogNumber,
    tracks,
    fauxReviews,
    bandBio,
    coverImageUrl,
    audioPreset,
    stickers,
    recipe,
    timestamp: Date.now(),
    isCustomPressing: true,
    customPressingTag: 'CUSTOM DROP',
  };
}