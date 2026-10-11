/**
 * Dynamic Procedural Generator
 * Generates infinite new original bands and visual gags matching the classic
 * surreal deadpan cartoon style entirely client-side (<50ms).
 */

import { CUSTOM_ADJECTIVES, CUSTOM_NOUNS, CUSTOM_ENSEMBLES, CUSTOM_IMAGE_SUBJECTS, CUSTOM_IMAGE_BACKDROPS } from '../data/customWords';
import { getAllInstalledPacks } from './packStorage';
import { getPreferences } from './preferencesService';
import {
  AlbumEntry,
  BackdropType,
  CanvasRecipe,
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

// ---------------------------------------------------------
// DYNAMIC CONTENT POOLS (The New Engine Fuel)
// ---------------------------------------------------------
export let ACTIVE_PACK_NOUNS: string[] = [];
export let ACTIVE_PACK_ADJECTIVES: string[] = [];
export let ACTIVE_PACK_ENSEMBLES: string[] = [];

export let ACTIVE_ADJECTIVES = [...CUSTOM_ADJECTIVES];
export let ACTIVE_NOUNS = [...CUSTOM_NOUNS];
export let ACTIVE_ENSEMBLES = [...CUSTOM_ENSEMBLES];
export let ACTIVE_BACKDROPS = [...CUSTOM_IMAGE_BACKDROPS];
export let ACTIVE_SUBJECTS: string[] = [...CUSTOM_IMAGE_SUBJECTS];

export async function hydrateContentPools() {
  const prefs = getPreferences();
  const packs = await getAllInstalledPacks();

  // Reset user pack word pools
  ACTIVE_PACK_NOUNS = [];
  ACTIVE_PACK_ADJECTIVES = [];
  ACTIVE_PACK_ENSEMBLES = [];

  ACTIVE_BACKDROPS = prefs.disableDefaultBackgrounds ? [] : [...CUSTOM_IMAGE_BACKDROPS];
  ACTIVE_SUBJECTS = prefs.disableDefaultSubjects ? [] : [...CUSTOM_IMAGE_SUBJECTS];

  for (const pack of packs) {
    if (prefs.disabledPacks.includes(pack.id)) continue;

    if (pack.words) {
      if (Array.isArray(pack.words.adjectives)) ACTIVE_PACK_ADJECTIVES.push(...pack.words.adjectives);
      if (Array.isArray(pack.words.nouns)) ACTIVE_PACK_NOUNS.push(...pack.words.nouns);
      if (Array.isArray(pack.words.ensembles)) ACTIVE_PACK_ENSEMBLES.push(...pack.words.ensembles);
    }
    if (pack.manifest && pack.manifest.stamps) {
      ACTIVE_BACKDROPS.push(...pack.manifest.stamps);
    }
    if (pack.manifest && pack.manifest.subjects) {
      ACTIVE_SUBJECTS.push(...pack.manifest.subjects);
    }
  }

  // Deduplicate custom crate words
  ACTIVE_PACK_NOUNS = Array.from(new Set(ACTIVE_PACK_NOUNS));
  ACTIVE_PACK_ADJECTIVES = Array.from(new Set(ACTIVE_PACK_ADJECTIVES));
  ACTIVE_PACK_ENSEMBLES = Array.from(new Set(ACTIVE_PACK_ENSEMBLES));

  // Merge full pools
  ACTIVE_ADJECTIVES = prefs.disableDefaultWords ? [...ACTIVE_PACK_ADJECTIVES] : [...CUSTOM_ADJECTIVES, ...ACTIVE_PACK_ADJECTIVES];
  ACTIVE_NOUNS = prefs.disableDefaultWords ? [...ACTIVE_PACK_NOUNS] : [...CUSTOM_NOUNS, ...ACTIVE_PACK_NOUNS];
  ACTIVE_ENSEMBLES = prefs.disableDefaultWords ? [...ACTIVE_PACK_ENSEMBLES] : [...CUSTOM_ENSEMBLES, ...ACTIVE_PACK_ENSEMBLES];

  // Failsafes
  if (ACTIVE_NOUNS.length === 0) ACTIVE_NOUNS = ["Void"];
  if (ACTIVE_ADJECTIVES.length === 0) ACTIVE_ADJECTIVES = ["Empty"];
  if (ACTIVE_ENSEMBLES.length === 0) ACTIVE_ENSEMBLES = ["Nothingness"];
  if (ACTIVE_BACKDROPS.length === 0) ACTIVE_BACKDROPS = ["split_horizon"];

  if (ACTIVE_PACK_NOUNS.length > 0 || ACTIVE_PACK_ADJECTIVES.length > 0) {
    console.log(
      `[YDRBN Generator] Hydrated pools: ${ACTIVE_PACK_NOUNS.length} custom nouns, ${ACTIVE_PACK_ADJECTIVES.length} custom adjectives loaded.`
    );
  }
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
  'cheese_wedge',
  'soup_bowl',
  'clock_face',
  'antique_tv',
  'rotary_phone',
  'porcelain_fixture',
  'clothesline_pants',
  'classical_monolith',
  'anatomical_part',
  'laboratory_flask',
  'bed_insomnia',
  'office_door',
  'stack_slices',
  'geometric_cube',
  'toaster',
  'lawnmower',
  'vacuum',
  'recliner',
  'lamp',
  'telephone',
  'alarm_clock',
  'umbrella',
  'briefcase',
  'shopping_cart',
  'wheelbarrow',
  'mailbox',
  'vacuum_bag',
  'doorknob',
  'coat_hanger',
  'laundry_basket',
  'pillow',
  'mop',
  'bucket',
  'banana',
  'apple',
  'potato',
  'pancake',
  'waffle',
  'hotdog',
  'pizza',
  'burrito',
  'pickle',
  'meatball',
  'crumpet',
  'muffin',
  'marshmallow',
  'yogurt',
  'spork',
  'hummus',
  'cabbage',
  'corn',
  'custard',
  'hamster',
  'pigeon',
  'duck',
  'chicken',
  'squirrel',
  'wombat',
  'goat',
  'raccoon',
  'frog',
  'penguin',
  'flamingo',
  'giraffe',
  'abacus',
  'calculator',
  'microscope',
  'test_tube',
  'antenna',
  'gear',
  'sprocket',
  'thermometer',
  'barometer',
  'circuit_board',
  'caliper',
  'compass',
  'ruler',
  'protractor',
  'magnifying_glass',
  'business_person',
  'scientist',
  'detective',
  'astronaut',
  'cowboy',
  'royalty',
  'judge',
  'office_worker',
  'tourist',
  'mail_carrier',
  'floating_eyeball',
  'giant_hand',
  'question_mark',
  'exclamation_mark',
  'asterisk',
  'ampersand',
  'hourglass',
  'maze',
  'spiral_staircase',
  'floating_door',
  'rubber_duck',
  'traffic_cone',
  'warning_sign',
  'mysterious_box',
  'ordinary_rock',
];

export const GAG_MODIFIERS: any[] = [
  'hazard_triangle',
  'adhesive_bandage',
  'speech_bubble',
  'caution_stamp',
  'celestial_glow',
  'none',
  'rubber_stamp',
  'redaction_bars',
  'measurement_arrows',
  'dotted_outline',
  'target_reticle',
  'evidence_tag',
  'question_marks',
  'exclamation_burst',
  'motion_lines',
  'impact_star',
  'sparkles',
  'confetti',
  'steam',
  'smoke_puff',
  'electric_arcs',
  'orbit_rings',
  'halo',
  'spotlight',
  'torn_paper',
  'sticky_notes',
  'barcode',
  'price_tag',
  'official_seal',
  'arrow_cluster',
  'caption_plate',
  'weather_arrows',
  'halftone_dots',
  'star_field',
  'flames',
  'cloud_puffs',
  'rays',
  'speed_bursts',
  'tiny_crowd',
  'tiny_hazard_tape',
  'floating_labels',
  'technical_callouts',
  'dramatic_vignette',
  'paper_grain',
  'chrome_reflection',
  'gloss_highlight',
  'comic_ink',
  'offset_print',
  'shadow_duplicate',
  'tiny_asterisks',
  'legal_fine_print',
  'bureaucratic_tabs',
  'confetti_stars',
  'nothing',  
  // Emoji Canvas Stamps
  'emoji_🥩', 'emoji_👁️', 'emoji_🦷', 'emoji_💾', 'emoji_💊',
  'emoji_🛒', 'emoji_🧲', 'emoji_📎', 'emoji_🪤', 'emoji_📞',
  'emoji_✂️', 'emoji_📌', 'emoji_🗝️', 'emoji_🧅', 'emoji_🩹',
  'emoji_🔋', 'emoji_🪓', 'emoji_🏷️', 'emoji_🧱', 'emoji_🗑️',

  // Domestic / Mundane
  'emoji_🛏️', 'emoji_🪑', 'emoji_🚪', 'emoji_🪟', 'emoji_🧹',
  'emoji_🧽', 'emoji_🧼', 'emoji_🪣', 'emoji_🧺', 'emoji_🧻',
  'emoji_🛋️', 'emoji_🚽', 'emoji_🪠', 'emoji_🛁', 'emoji_🕯️',
  'emoji_💡', 'emoji_🔦', 'emoji_🪞', 'emoji_🧯', 'emoji_🧰',
  'emoji_🧴', 'emoji_🧷', 'emoji_🪡', 'emoji_🧶', 'emoji_🧵',

  // Office / Bureaucratic
  'emoji_📄', 'emoji_📃', 'emoji_📑', 'emoji_📋', 'emoji_📁',
  'emoji_📂', 'emoji_🗂️', 'emoji_🗃️', 'emoji_🗄️', 'emoji_📝',
  'emoji_✏️', 'emoji_🖊️', 'emoji_🖇️', 'emoji_📐', 'emoji_📏',
  'emoji_🗒️', 'emoji_📆', 'emoji_📅', 'emoji_🔖', 'emoji_🔏',
  'emoji_🔐', 'emoji_🔒', 'emoji_📮', 'emoji_📬', 'emoji_✉️',

  // Food / Groceries
  'emoji_🍞', 'emoji_🥚', 'emoji_🧀', 'emoji_🥔', 'emoji_🥕',
  'emoji_🌽', 'emoji_🥒', 'emoji_🍌', 'emoji_🍎', 'emoji_🍐',
  'emoji_🍋', 'emoji_🍊', 'emoji_🍅', 'emoji_🍆', 'emoji_🥬',
  'emoji_🍄', 'emoji_🥜', 'emoji_🍚', 'emoji_🍜', 'emoji_🍝',
  'emoji_🍕', 'emoji_🌭', 'emoji_🌮', 'emoji_🥪', 'emoji_🍔',
  'emoji_🥞', 'emoji_🧇', 'emoji_🍩', 'emoji_🧁', 'emoji_🍪',
  'emoji_🥨', 'emoji_🍿', 'emoji_🍬', 'emoji_🍭', 'emoji_🥫',

  // Medical / Anatomical
  'emoji_🫀', 'emoji_🫁', 'emoji_🧠', 'emoji_🦴', 'emoji_🩻',
  'emoji_🩺', 'emoji_💉', 'emoji_🩸', 'emoji_🩸', 'emoji_🧬',
  'emoji_🦠', 'emoji_🧫', 'emoji_🧪', 'emoji_🩼', 'emoji_🦽',
  'emoji_🦿', 'emoji_🦾', 'emoji_😷', 'emoji_🤒', 'emoji_🤕',

  // Tools / Hardware
  'emoji_🔨', 'emoji_🪚', 'emoji_🔧', 'emoji_🔩', 'emoji_⚙️',
  'emoji_⛓️', 'emoji_🪛', 'emoji_🔗', 'emoji_🧲', 'emoji_🪜',
  'emoji_🧱', 'emoji_🪨', 'emoji_🧱', 'emoji_🔌', 'emoji_🔌',
  'emoji_💡', 'emoji_🔌', 'emoji_🔧', 'emoji_⚒️', 'emoji_🛠️',

  // Transportation / Infrastructure
  'emoji_🚦', 'emoji_🚧', 'emoji_🛑', 'emoji_🚥', 'emoji_🪧',
  'emoji_🛞', 'emoji_⛽', 'emoji_🚲', 'emoji_🛴', 'emoji_🚗',
  'emoji_🚕', 'emoji_🚌', 'emoji_🚛', 'emoji_🚜', 'emoji_🚂',
  'emoji_🚇', 'emoji_🛤️', 'emoji_🛣️', 'emoji_⚓', 'emoji_🗼',

  // Scientific / Technical
  'emoji_🔬', 'emoji_🔭', 'emoji_🧭', 'emoji_📡', 'emoji_🛰️',
  'emoji_⚗️', 'emoji_🧪', 'emoji_🧬', 'emoji_⚛️', 'emoji_☢️',
  'emoji_☣️', 'emoji_🌡️', 'emoji_📡', 'emoji_💿', 'emoji_📀',
  'emoji_💽', 'emoji_🖥️', 'emoji_⌨️', 'emoji_🖱️', 'emoji_🖨️',

  // Animals — useful for completely inappropriate combinations
  'emoji_🐀', 'emoji_🐁', 'emoji_🐹', 'emoji_🐰', 'emoji_🦊',
  'emoji_🐻', 'emoji_🐼', 'emoji_🐨', 'emoji_🐯', 'emoji_🦁',
  'emoji_🐮', 'emoji_🐷', 'emoji_🐸', 'emoji_🐵', 'emoji_🐔',
  'emoji_🦆', 'emoji_🦅', 'emoji_🦉', 'emoji_🐍', 'emoji_🦎',
  'emoji_🐢', 'emoji_🐙', 'emoji_🦑', 'emoji_🦀', 'emoji_🦐',
  'emoji_🐌', 'emoji_🪲', 'emoji_🪳', 'emoji_🦟', 'emoji_🪰',

  // Clothing / Personal Effects
  'emoji_👖', 'emoji_👕', 'emoji_👔', 'emoji_🧥', 'emoji_🧤',
  'emoji_🧦', 'emoji_🧢', 'emoji_🎩', 'emoji_👒', 'emoji_👞',
  'emoji_👟', 'emoji_🥾', 'emoji_🩴', 'emoji_👜', 'emoji_💼',
  'emoji_🎒', 'emoji_👓', 'emoji_🕶️', 'emoji_⌚', 'emoji_💍',

  // Warning / Official / Symbolic
  'emoji_⚠️', 'emoji_🚫', 'emoji_❌', 'emoji_⭕', 'emoji_❗',
  'emoji_❓', 'emoji_‼️', 'emoji_⁉️', 'emoji_🔴', 'emoji_🟡',
  'emoji_🟢', 'emoji_🔵', 'emoji_⚫', 'emoji_⚪', 'emoji_🔺',
  'emoji_🔻', 'emoji_⭐', 'emoji_💥', 'emoji_💢', 'emoji_☑️',

  // Containers / Storage
  'emoji_📦', 'emoji_🗳️', 'emoji_🛍️', 'emoji_🧳', 'emoji_🧰',
  'emoji_🪵', 'emoji_🫙', 'emoji_🥣', 'emoji_🍵', 'emoji_🥤',
  'emoji_🪥', 'emoji_🧺', 'emoji_🛒', 'emoji_🪤', 'emoji_🗑️',

  // Nature / Things That Become Weird When Officialized
  'emoji_🌵', 'emoji_🌲', 'emoji_🌳', 'emoji_🌴', 'emoji_🌱',
  'emoji_🍂', 'emoji_🍁', 'emoji_🌿', 'emoji_🌻', 'emoji_🌹',
  'emoji_🌙', 'emoji_☀️', 'emoji_🌧️', 'emoji_☁️', 'emoji_❄️',
  'emoji_🌪️', 'emoji_🌋', 'emoji_🏔️', 'emoji_🌊', 'emoji_🪨',

  // Particularly stupid / high-value absurdity
  'emoji_🦆', 'emoji_🦤', 'emoji_🪿', 'emoji_🦩', 'emoji_🦥',
  'emoji_🦫', 'emoji_🦨', 'emoji_🦡', 'emoji_🦘', 'emoji_🦒',
  'emoji_🦣', 'emoji_🐘', 'emoji_🦏', 'emoji_🦛', 'emoji_🦖',
  'emoji_🦕', 'emoji_🐊', 'emoji_🦈', 'emoji_🐳', 'emoji_🐡',

  // Objects with excellent bureaucratic potential
  'emoji_🗿', 'emoji_🏺', 'emoji_⚱️', 'emoji_🪦', 'emoji_🛎️',
  'emoji_🔔', 'emoji_🎚️', 'emoji_🎛️', 'emoji_📯', 'emoji_📣',
  'emoji_📢', 'emoji_🎙️', 'emoji_📻', 'emoji_📺', 'emoji_📠',
  'emoji_🕰️', 'emoji_⏰', 'emoji_⌛', 'emoji_⏳', 'emoji_🧮'
];

export const VINTAGE_PALETTES_LIST: VintagePaletteName[] = [
  '70s Earth',
  'Psych Glow',
  'Vintage Studio',
  'Mint & Lavender',
];

// =========================================================================
// MASSIVE VOCABULARY EXPANSION ARRAYS
// =========================================================================

export const EXPANDED_ADJECTIVES = [
  'mathematical',
  'terminally',
  'lofty',
  'disingenuous',
  'folded',
  'spindled',
  'mutilated',
  'abrasive',
  'antidimensional',
  'backordered',
  'fundamentally',
  'redundant',
  'obsolete',
  'functional',
  'malicious',
  'fashionable',
  'superficial',
  'topically',
  'relatively',
  ...ACTIVE_ADJECTIVES
];

export const EXPANDED_NOUNS = [
  'elbow',
  'shoes',
  'face',
  'insurance',
  'soap',
  'socks',
  'sheeple',
  'trebuchet',
  'meatcake',
  'abacus',
  'earlobe',
  'hummus',
  'ganglia',
  'delay',
  'clones',
  'snails',
  'powder',
  'gift',
  'dreams',
  'conscience',
  'board',
  'finger',
  'claw',
  'hamster',
  'yurt',
  'laserdisc',
  'weather',
  'tortoise',
  'handling',
  'traffic',
  'opinion',
  'tuba',
  'gumption',
  'pie',
  'spork',
  ...ACTIVE_NOUNS
];

export const EXPANDED_ENSEMBLES = [
  'truth',
  'clones',
  'delay',
  'revolution',
  'anomalies',
  'insomniacs',
  'optimists',
  'paradox',
  'incident',
  'equation',
  ...ACTIVE_ENSEMBLES
];

export function capitalizeWord(w: string): string {
  if (!w) return '';
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

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

  private refill(): void {
    const prefs = getPreferences();
    const baseSubjects = prefs.disableDefaultSubjects ? ['none'] : SUBJECT_VECTORS;
    
    this.bag = [
      ...(baseSubjects as any),
      ...(CUSTOM_IMAGE_SUBJECTS as any)
    ];

    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }

    if (this.lastDrawn && this.bag.length > 1 && this.bag[this.bag.length - 1] === this.lastDrawn) {
      [this.bag[this.bag.length - 1], this.bag[0]] = [this.bag[0], this.bag[this.bag.length - 1]];
    }
  }

  public drawNext(): SubjectVectorType {
    if (CUSTOM_IMAGE_SUBJECTS.length > 0 && Math.random() < 0.75) {
      const pick = CUSTOM_IMAGE_SUBJECTS[Math.floor(Math.random() * CUSTOM_IMAGE_SUBJECTS.length)] as any;
      this.lastDrawn = pick;
      return pick;
    }

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

  private refill(): void {
    this.bag = [
      ...BACKDROPS,
      ...(ACTIVE_BACKDROPS as any)
    ];
    
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
    if (this.lastDrawn && this.bag.length > 1 && this.bag[this.bag.length - 1] === this.lastDrawn) {
      [this.bag[this.bag.length - 1], this.bag[0]] = [this.bag[0], this.bag[this.bag.length - 1]];
    }
  }

  public drawNext(): BackdropType {
    if (ACTIVE_BACKDROPS.length > 0 && Math.random() < 0.75) {
      const pick = ACTIVE_BACKDROPS[Math.floor(Math.random() * ACTIVE_BACKDROPS.length)] as any;
      this.lastDrawn = pick;
      return pick;
    }

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
      subject = ACTIVE_SUBJECTS[Math.floor(Math.random() * ACTIVE_SUBJECTS.length)] as any;
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
      if (ACTIVE_SUBJECTS.length > 0 && Math.random() < 0.70) {
        chosen = ACTIVE_SUBJECTS[Math.floor(Math.random() * ACTIVE_SUBJECTS.length)] as any;
      } else {
        chosen = subjectShuffleBag.drawNext();
      }
    }
    subject = chosen;
  }

  // 2. BACKDROP SELECTION
  let backdrop: BackdropType;
  if (prefs.disableDefaultBackgrounds && ACTIVE_BACKDROPS.length > 0) {
    backdrop = ACTIVE_BACKDROPS[Math.floor(Math.random() * ACTIVE_BACKDROPS.length)] as any;
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
    availableModifiers = GAG_MODIFIERS.filter(m => !m.startsWith('emoji_'));
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
      'Molecular', 'Galvanic', 'Mathematical', 'Antidimensional', 'Functional', 'Relatively',
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
      'Periodic Table Blues', 'The Mathematical Incident', 'Antidimensional Equation',
    ],
    trackThemes: [
      'Beta Radiation Blues', 'Friction In A Vacuum', 'The Kelvin Scale Sonata',
      'Subatomic Crumb Dispersion', 'Orbital Velocity Jam', 'Bunsen Burner Flameout',
      'Uncertainty Principle Shuffle', 'Theoretical Collision',
    ],
    denialPhrases: [
      "NOT RADIOACTIVE!", "PURE THEORY ONLY!", "DO NOT INHALE ISOTOPE!",
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
      'Glazed', 'Artisanal', 'Folded', 'Topically', 'Superficial',
    ],
    nouns: [
      'Cheese', 'Scones', 'Frankfurters', 'Aspic', 'Cabbage',
      'Pate', 'Turnips', 'Gravy', 'Gouda', 'Gelatin',
      'Biscuits', 'Marmalade', 'Meatcake', 'Hummus', 'Pie', 'Spork',
    ],
    albumPhrases: [
      'Sharp', 'Not A Frankfurter', 'Under The Broiler', 'Room Temperature',
      'Extra Crumbly', 'Served Cold', 'Double Portion', 'Individually Sealed',
    ],
    trackThemes: [
      'The Cheese Cave Acoustic', 'Boiling Point In C Minor', 'Mustard Dispersion Theory',
      'Cellophane Peeling Etude', 'Lukewarm Stew Reflections', 'Gravy Boat Navigation',
      'Crust Formation Velocity', 'Dinner Bell Cacophony',
    ],
    denialPhrases: [
      "IT'S NOT A FRANKFURTER!", "100% ARTIFICIAL DAIRY!", "DO NOT MICROWAVE!",
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
      'Skeletal', 'Tendon', 'Terminally', 'Mutilated', 'Abrasive',
    ],
    nouns: [
      'Earlobe', 'Ulna', 'Cartilage', 'Ligament', 'Clavicle',
      'Knee Cap', 'Jawline', 'Metatarsal', 'Phalange', 'Collarbone',
      'Vertebra', 'Molar', 'Elbow', 'Face', 'Finger', 'Claw', 'Ganglia',
    ],
    albumPhrases: [
      'Owie', 'Bent Double', 'Ice Packs Required', 'Clicking Sounds',
      'Splinted', 'Tender To Touch', 'Mild Discomfort', 'Slight Limp',
    ],
    trackThemes: [
      'Pinching The Nerve', 'Cracking Cartilage Rumba', 'The Elastic Bandage Blues',
      'Ibuprofen Morning', 'Sudden Twitched Reflex', 'Consulting The Orthopedic',
      'X-Ray Exposure Suite', 'Limpid Recovery',
    ],
    denialPhrases: [
      "DOES NOT HURT AT ALL!", "COMPLETELY NORMAL BONE!", "NOT A FRACTURE!",
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
      'Disingenuous', 'Fundamentally',
    ],
    nouns: [
      'Delay', 'Clones', 'Abacus', 'Memos', 'Invoices',
      'Folders', 'Signatures', 'Bursars', 'Committees', 'Requisitions',
      'Stamps', 'Ledgers', 'Insurance', 'Board', 'Opinion',
      'Handling', 'Truth',
    ],
    albumPhrases: [
      'Hurry Up And Wait', 'Ditto', 'Form 1040-B', 'Rub Vigorously',
      'Void On Arrival', 'Pending Review', 'Carbon Copied', 'Closed On Fridays',
    ],
    trackThemes: [
      'Waiting Room Muzak', 'The 4-Part Carbon Slip', 'Stapler Malfunction Jam',
      'Filing Under Misc', 'Lunch Break From 11 to 3', 'Photocopier Paper Jam',
      'The Urgent Inter-Office Memo', 'Lost In Transit',
    ],
    denialPhrases: [
      "FILE HAS BEEN DESTROYED!", "NO ACCESS PERMITTED!", "UNKNOWN BUREAUCRAT!",
    ],
    stampLabels: [
      'MEASURED IN CARROTS', 'UNKNOWN ENDORSER', 'DO NOT FOLD OR MUTILATE',
    ],
    archetypes: ['absurd_blueprint', 'hypnotic_swirl'],
  },

  misfortune: {
    tag: 'misfortune',
    prefixes: [
      'Doctor', 'Sudden', 'Unfortunate', 'Severe', 'Permanent',
      'Unscheduled', 'Accidental', 'Premature', 'Dubious', 'Trembling',
      'Clumsy', 'Anxious', 'Spindled', 'Malicious',
    ],
    nouns: [
      'Trepidation', 'Collapse', 'Mishap', 'Catastrophe', 'Regret',
      'Flinch', 'Blunder', 'Hazard', 'Tremors', 'Panic',
      'Defeat', 'Hesitation', 'Sheeple', 'Snails', 'Tortoise',
      'Traffic', 'Paradox', 'Incident', 'Conscience',
    ],
    albumPhrases: [
      'Unsure', 'Bad Idea', 'Second Guessing', 'Look Out Below',
      'Broken Handle', 'No Return Policy', 'Total Spill', 'Slippery Floor',
    ],
    trackThemes: [
      'The Looming Caution Sign', 'Tripping Over The Cord', 'Broken Spectacles Overture',
      'Spilled Ink On White Denim', 'Cold Sweat In The Elevator', 'The Squeaking Brakes',
      'Emergency Meeting Called', 'Wrong Direction Entirely',
    ],
    denialPhrases: [
      "EVERYTHING IS FINE!", "PROCEED WITH CAUTION!", "IT WAS NOT MY FAULT!",
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
      'Domestic', 'Nocturnal', 'Lawnmower', 'Ceiling', 'Kitchenette',
      'Plumbing', 'Radiator', 'Lofty', 'Fashionable',
    ],
    nouns: [
      'Toilet', 'Toaster', 'Radiator', 'Drainpipe', 'Boiler',
      'Faucet', 'Thermostat', 'Sponge', 'Puddle', 'Curtain',
      'Doorknob', 'Linoleum', 'Shoes', 'Soap', 'Socks',
      'Hamster', 'Yurt', 'Weather', 'Tuba', 'Gumption',
      'Dreams', 'Gift',
    ],
    albumPhrases: [
      'The Cosmic Bowels', 'Zero Gravity Plumbing', 'Dripping Through The Floor',
      'Leaky Gasket Suite', 'Pilot Light Extinguished', 'Echoes In The Cistern',
      'Rusting In Orbit', 'Water Pressure Blues',
    ],
    trackThemes: [
      'Orbital Flushing Velocity', 'The Clogged Drain Meditation', 'Cold Water Shock Blues',
      'Hissing Radiator Symphony', 'Porcelain Resonance', 'Plunger Technique in 3/4 Time',
      'Subterranean Pipe Rumble', 'Midnight Leak Panic',
    ],
    denialPhrases: [
      "IT IS NOT A TOILET!", "DRAIN IS UNPLUGGED!", "NO WATER DETECTED!",
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
  'The Syncopation Ledger'
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
  'COLLECTOR\'S PRESSING',
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

/**
 * Picks a word with heavy 75% bias toward installed/user-forged crate words.
 */
function pickWeightedWord(
  packList: string[],
  defaultList: string[],
  packBias = 0.75
): string {
  const prefs = getPreferences();

  if (prefs.disableDefaultWords && packList.length > 0) {
    return packList[Math.floor(Math.random() * packList.length)];
  }

  if (packList.length > 0 && Math.random() < packBias) {
    return packList[Math.floor(Math.random() * packList.length)];
  }

  if (defaultList.length > 0) {
    return defaultList[Math.floor(Math.random() * defaultList.length)];
  }

  return packList.length > 0 ? packList[0] : 'Void';
}

function generateCandidateBandName(pool: SemanticWordPool): string {
  const randAdj = capitalizeWord(pickWeightedWord(ACTIVE_PACK_ADJECTIVES, EXPANDED_ADJECTIVES, 0.75));
  const randNoun = capitalizeWord(pickWeightedWord(ACTIVE_PACK_NOUNS, EXPANDED_NOUNS, 0.75));
  const randEnsemble = capitalizeWord(pickWeightedWord(ACTIVE_PACK_ENSEMBLES, EXPANDED_ENSEMBLES, 0.75));

  const poolPrefix = pool.prefixes[Math.floor(Math.random() * pool.prefixes.length)];
  const poolNoun = pool.nouns[Math.floor(Math.random() * pool.nouns.length)];

  const effectiveNoun = ACTIVE_PACK_NOUNS.length > 0 && Math.random() < 0.75 ? randNoun : poolNoun;

  const pattern = Math.floor(Math.random() * 8);

  switch (pattern) {
    case 0:
      return `${randAdj} ${randNoun}`;
    case 1:
      return `The ${randAdj} ${randNoun}`;
    case 2:
      return `The ${randNoun} ${randEnsemble}`;
    case 3:
      return `${randNoun} ${randEnsemble}`;
    case 4:
      return `${randAdj} ${randEnsemble}`;
    case 5:
      return `${randNoun} & The ${randAdj} ${effectiveNoun}`;
    case 6:
      return `The ${randEnsemble} of ${randNoun}`;
    case 7:
    default:
      return `${poolPrefix} ${randNoun}`;
  }
}

/**
 * Dynamic Album Title Generator
 * Combines band-name seeds, user-forged crate vocabulary, and classic
 * 1970s satirical album titling archetypes with zero repetition.
 */
function generateDynamicAlbumTitle(bandName: string, pool: SemanticWordPool): string {
  const bandTokens = bandName
    .replace(/^(The|A|An)\s+/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'from'].includes(w.toLowerCase()));
  
  const seedWord = bandTokens.length > 0
    ? bandTokens[Math.floor(Math.random() * bandTokens.length)]
    : 'Echo';

  const customNoun = ACTIVE_PACK_NOUNS.length > 0
    ? capitalizeWord(ACTIVE_PACK_NOUNS[Math.floor(Math.random() * ACTIVE_PACK_NOUNS.length)])
    : capitalizeWord(pickWeightedWord(ACTIVE_NOUNS, EXPANDED_NOUNS));

  const customAdj = ACTIVE_PACK_ADJECTIVES.length > 0
    ? capitalizeWord(ACTIVE_PACK_ADJECTIVES[Math.floor(Math.random() * ACTIVE_PACK_ADJECTIVES.length)])
    : capitalizeWord(pickWeightedWord(ACTIVE_ADJECTIVES, EXPANDED_ADJECTIVES));

  const poolPhrase = pool.albumPhrases[Math.floor(Math.random() * pool.albumPhrases.length)];
  const keys = ['C Minor', 'B-Flat', 'D Major', 'F-Sharp', 'A Minor', 'E-Flat'];
  const key = keys[Math.floor(Math.random() * keys.length)];

  const titleTemplates = [
    () => (Math.random() < 0.5 ? bandName : `${bandName} Vol. II`),
    () => `The ${seedWord} Incident`,
    () => `Variations on ${seedWord}`,
    () => `Dispatches from ${seedWord}`,
    () => `Music for a Broken ${seedWord}`,
    () => `${customNoun} in ${key}`,
    () => `Twelve Studies for ${customNoun}`,
    () => `The ${customAdj} ${customNoun}`,
    () => `Strictly for Domestic ${customNoun}s`,
    () => `Do Not Fold the ${customNoun}`,
    () => `Certified ${customAdj}`,
    () => `Principles of ${customAdj} Acoustics`,
    () => `Beyond the ${customNoun}`,
    () => poolPhrase,
  ];

  const roll = Math.floor(Math.random() * titleTemplates.length);
  return titleTemplates[roll]();
}

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

  // 1. Dynamic Album Title with Rolling Memory (capped at 28 items)
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

// Release year generator (1960–2060)
  // 96% chance: Uniform distribution across historical/present releases (1960 through current year)
  // 4% Easter Egg chance: "Temporal Anomaly" future pressings (current year + 1 through 2060)
  const currentYear = new Date().getFullYear();
  const isTemporalEasterEgg = Math.random() < 0.04;

  let year: string;
  if (isTemporalEasterEgg && currentYear < 2060) {
    // Future temporal window: (currentYear + 1) to 2060 inclusive (e.g., 2027 to 2060)
    const futureYearsCount = 2060 - currentYear;
    year = String((currentYear + 1) + Math.floor(Math.random() * futureYearsCount));
  } else {
    // Standard window: 1960 to currentYear inclusive (e.g., 1960 to 2026)
    const standardYearsCount = currentYear - 1960 + 1;
    year = String(1960 + Math.floor(Math.random() * standardYearsCount));
  }

  const catalogNumber = `YDR-${year}-STEREO`;

  const combo = selectModularCombination(bandName, albumTitle);

  // Minimalist chance (20%)
  let forceNoStickers = false;
  if (Math.random() < 0.20) {
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
  };

  // Generate 8 tracks
  const tracks: string[] = [];
  const shuffledThemes = [...pool.trackThemes].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 7; i++) {
    tracks.push(shuffledThemes[i % shuffledThemes.length]);
  }
  tracks.push(`${albumTitle} (Reprise)`);

  const reviewAdjectives = [
    'Absurd',
    'Completely unhinged',
    'Perversely melodic',
    'A dry acoustic shock',
    'Alarmingly crunchy',
    'Bewildering yet irresistible',
    'An utter affront to standard recording protocol',
    'Deeply obstinate',
    'Audaciously quiet',
    'Rhythmically bewildered',
    'Spectacularly deadpan',
  ];

  const reviewTemplates = [
    (adj: string, pub: string) => `"${adj}; an utter affront to conventional recording etiquette." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; they played three whole songs without touching their instruments." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the vinyl itself seemed embarrassed to rotate." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; the central committee would nod with solemn approval." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; acoustic vibrations resembling a small tractor in a parlor." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; genuinely impossible to categorize, let alone endorse." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; recommended exclusively for domestic appliances." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; bewildering yet completely inevitable." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; sounds like an encyclopedia falling down a spiral staircase." — ${pub}`,
    (adj: string, pub: string) => `"${adj}; a monumental achievement in acoustic stubbornness." — ${pub}`,
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
    (band: string, yr: string) => `Originally operating as an unregistered civic improvement society in ${yr}, ${band}`,
    (band: string, yr: string) => `Formed after an administrative error at the regional patent office in ${yr}, ${band}`,
    (band: string, yr: string) => `Founded in ${yr} behind a shuttered appliance wholesaler, ${band}`,
    (band: string, yr: string) => `Established in ${yr} by individuals with conflicting recollections of having met previously, ${band}`,
    (band: string, yr: string) => `Brought together by an outbreak of administrative confusion in ${yr}, ${band}`
  ];

  const BEHAVIOR_CLAUSES = [
    "quickly gained a reputation for concluding performances several minutes before audiences realized",
    "insisted on recording every master take in a single uninterrupted burst of stubborn obstinacy",
    "conducted rehearsals in complete darkness to eliminate accidental commercial appeal",
    "became notorious for refusing to confirm whether their lineup was fixed or purely circumstantial",
    "engineered an abrasive signature tone by running rhythm tracks through defective voltage regulators",
    "treated studio time as an endurance trial between musicians, engineers, and local building inspectors",
    "developed an enduring interest in poorly grounded instruments and prolonged public pauses",
    "established a strict policy of appearing onstage approximately when expected and leaving immediately"
  ];

  const AFTERMATH_CLAUSES = [
    (album: string) => `leaving "${album}" as their sole officially acknowledged physical pressing.`,
    (album: string) => `resulting in "${album}", an effort critics classified as both an acoustic triumph and an environmental liability.`,
    (album: string) => `culminating in "${album}", despite persistent claims by the label that the session tapes were destroyed.`,
    (album: string) => `and "${album}" remains preserved here in its original unvarnished frequency spectrum.`,
    (album: string) => `with "${album}" standing as an accidental testament to mid-century mechanical persistence.`,
    (album: string) => `leaving behind "${album}" as an unclassified anomaly in the distributor's catalog.`,
    (album: string) => `leaving "${album}" to circulate exclusively among listeners who appreciated music that sounded assembled from spare parts.`
  ];

  const origin = ORIGIN_CLAUSES[Math.floor(Math.random() * ORIGIN_CLAUSES.length)](bandName, year);
  const behavior = BEHAVIOR_CLAUSES[Math.floor(Math.random() * BEHAVIOR_CLAUSES.length)];
  const aftermath = AFTERMATH_CLAUSES[Math.floor(Math.random() * AFTERMATH_CLAUSES.length)](albumTitle);

  // Balanced 2-sentence bio that fits reliably within vinyl back-cover margins
  const bandBio = `${origin}. The group ${behavior}, ${aftermath}`;

  const fontFamilies: TitleFontFamily[] = [
    'medieval',
    'bubble',
    'comic',
    'marker',
    'monospace',
    'chrome',
    'typewriter',
    'western',
    'arcade',
    'graffiti',
    'serif',
    'handwritten',
    'stencil',
    'space',
    'circus',
    'newspaper',
    'industrial',
    'schoolbook',
    'futuristic',
    'ornamental',
  ];
  const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];

  const textColors = [
    '#fef08a',
    '#fde047',
    '#fed7aa',
    '#ffedd5',
    '#fecdd3',
    '#e0f2fe',
    '#d1fae5',
    '#ffffff',
    '#fb923c',
    '#a7f3d0',
  ];
  const textColor = textColors[Math.floor(Math.random() * textColors.length)];

  const shadowStyles: TitleShadowStyle[] = [
    'harsh-black',
    'neon-glow',
    'chromatic-3d',
    'retro-bevel',
    'long-shadow',
    'double-outline',
    'offset-print',
    'inner-glow',
    'embossed',
    'sticker-outline',
    'halftone-shadow',
    'electric-outline',
    'ghosted',
    'rubber-stamp',
    'none',
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
      'center-stack',
      'vertical-edge',
      'corner-stamp',
      'offset-stack',
      'giant-background',
      'floating-label',
      'circular-seal',
      'split-horizontal',
      'overlap-subject',
      'poster-grid',
      'tiny-caption',
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

  const audioPresets: AlbumEntry['audioPreset'][] = [
    'psych-rock',
    'analog-synth',
    'krautrock',
    'ambient-drone',
    'post-punk',
  ];
  const audioPreset =
    audioPresets[Math.floor(Math.random() * audioPresets.length)];

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
  };
}

export const generateProceduralBand = generateDailyDrop;