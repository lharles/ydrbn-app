import { getInstalledPack } from './packStorage';
/**
 * Dynamic Procedural Generator
 * Generates infinite new original bands and visual gags matching the classic
 * surreal deadpan cartoon style entirely client-side (<50ms).
 */

import { CUSTOM_ADJECTIVES, CUSTOM_NOUNS, CUSTOM_ENSEMBLES, CUSTOM_IMAGE_SUBJECTS, CUSTOM_IMAGE_BACKDROPS } from '../data/customWords';
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
//import { getRecentAlbums, saveRecentAlbums, MAX_RECENT_ALBUMS } from './storageService';
import { loadRecipeAssets } from './assetManager';

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
  ...CUSTOM_ADJECTIVES // Merges your custom file here
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
  ...CUSTOM_NOUNS // Merges your custom file here
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
  ...CUSTOM_ENSEMBLES // Merges your custom file here
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
    // Seed classic starter crate names so they never collide with newly pressed daily drops
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

/**
 * True Fisher-Yates Shuffle Bag for Subject Vectors
 * Mathematically guarantees that a user must click "Daily Drop" 15 times
 * before they ever see the same central subject repeat.
 */
class SubjectShuffleBag {
  private bag: SubjectVectorType[] = [];
  private lastDrawn: SubjectVectorType | null = null;

  constructor() {
    this.refill();
  }

  private refill(): void {
    // Mix the original canvas drawings with your custom PNG file names
    this.bag = [
      ...SUBJECT_VECTORS,
      ...(CUSTOM_IMAGE_SUBJECTS as any)
    ];
    // Fisher-Yates shuffle

    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }

    // Ensure the first item drawn from the refilled bag does not equal the last drawn item
    if (this.lastDrawn && this.bag.length > 1 && this.bag[this.bag.length - 1] === this.lastDrawn) {
      [this.bag[this.bag.length - 1], this.bag[0]] = [this.bag[0], this.bag[this.bag.length - 1]];
    }
  }

  public drawNext(): SubjectVectorType {
    // 75% bias toward custom PNG/JPG subjects whenever they exist
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

  /**
   * If a subject was triggered by contextual keywords, consume it from the remaining
   * deck so it doesn't repeat in upcoming random draws.
   */
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

/**
 * True Fisher-Yates Shuffle Bag for Backdrops
 * Ensures all 8 background routines cycle smoothly without repeats.
 */
class BackdropShuffleBag {
  private bag: BackdropType[] = [];
  private lastDrawn: BackdropType | null = null;

  constructor() {
    this.refill();
  }

  private refill(): void {
    // Mix the original procedural backdrops with your custom JPG/PNG files
    this.bag = [
      ...BACKDROPS,
      ...(CUSTOM_IMAGE_BACKDROPS as any)
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
    // 75% bias toward custom backdrops whenever they exist
    if (CUSTOM_IMAGE_BACKDROPS.length > 0 && Math.random() < 0.75) {
      const pick = CUSTOM_IMAGE_BACKDROPS[Math.floor(Math.random() * CUSTOM_IMAGE_BACKDROPS.length)] as any;
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

/**
 * Contextual Overrides for Generated Bands
 * Checks the generated band name and album title for semantic clues to force
 * an appropriate subject rather than a random draw.
 */
export function detectContextualSubject(
  bandName: string,
  albumTitle: string
): SubjectVectorType | null {
  const combined = `${bandName} ${albumTitle}`.toLowerCase();

  // 1. Tooth / Dental
  if (/\b(molar|tooth|teeth|dentist|dental|enamel|incisor|bicuspid|cavity|fangs?)\b/i.test(combined)) {
    return 'tooth';
  }

  // 2. Magnet / Polar
  if (/\b(magnet|magnets|magnetic|magnetism|polar|polarity|horseshoe|gauss|repulsion|attraction)\b/i.test(combined)) {
    return 'magnet';
  }

  // 3. Pants / Pantaloons
  if (/\b(pantaloons?|pants?|trousers?|slacks|dungarees|breeches|jeans|overalls?)\b/i.test(combined)) {
    return 'pants';
  }

  // 4. Bed / Insomnia / Sleep
  if (/\b(bed|insomnia|mattress|headboard|footboard|pillow|slumber|sleep|bedtime|snooze)\b/i.test(combined)) {
    return 'bed';
  }

  // 5. Cheese / Dairy
  if (/\b(cheese|cheddar|swiss|gouda|curds?|parmesan|dairy|laminated|brie|fondue)\b/i.test(combined)) {
    return 'cheese';
  }

  // 6. Ear / Auditory / Hearing
  if (/\b(ear|ears|earlobe|earlobes|tympanic|auditory|hearing|sprained)\b/i.test(combined)) {
    return 'ear';
  }

  // 7. Anvil / Blacksmith / Forge
  if (/\b(anvil|anvils|blacksmith|forge|blacksmithing|foundry|smelt|hammer|ironworks)\b/i.test(combined)) {
    return 'anvil';
  }

  // 8. UFO / Alien / Saucer
  if (/\b(ufo|ufos|saucer|flying saucer|extraterrestrial|extraterrestrius|aliens?|martian|spaceship|starship)\b/i.test(combined)) {
    return 'ufo';
  }

  // 9. Cactus / Saguaro / Desert
  if (/\b(cactus|cacti|saguaro|succulent|prickly|spines?|desert|arid|needles?)\b/i.test(combined)) {
    return 'cactus';
  }

  // 10. Key / Lock / Vault
  if (/\b(keys?|skeleton key|padlock|deadbolt|vault|door key|keyhole|lockbox|locksmith)\b/i.test(combined)) {
    return 'key';
  }

  // 11. Anchor / Nautical
  if (/\b(anchor|anchors|nautical|maritime|shipwreck|harbor|sailors?|anchorage|navy)\b/i.test(combined)) {
    return 'anchor';
  }

  // 12. Lightbulb / Filament / Glow
  if (/\b(lightbulb|light bulb|bulb|bulbs|incandescent|filament|lumens?|watts?|tungsten)\b/i.test(combined)) {
    return 'lightbulb';
  }

  // 13. Skull / Skeleton / Bone
  if (/\b(skull|skulls|skeleton|skeletons|skeletal|cranium|calavera|ossuary|bones?|calcified)\b/i.test(combined)) {
    return 'skull';
  }

  // 14. Crown / Royalty / King
  if (/\b(crown|crowns|coronation|royalty|monarch|majesty|king|queen|emperor|regal|tiara)\b/i.test(combined)) {
    return 'crown';
  }

  // 15. Bomb / Blast / Fuse
  if (/\b(bomb|bombs|dynamite|tnt|explosives?|blast|detonation|cannonball|ignite|fuse)\b/i.test(combined)) {
    return 'bomb';
  }

  // 16. Angry Person / Rage / Wrath / Temper / Fury
  if (/\b(angry|furious|wrath|rage|fury|temper|tantrums?|mad|irritated|hostile|shouting|yelling)\b/i.test(combined)) {
    return 'angry_person';
  }

  // 17. Sneaky Person / Bandit / Thief / Stealth / Burglar
  if (/\b(sneaky|sneak|bandit|thief|burglars?|tiptoe|stealth|prowler|crook|heist|disguise|undercover)\b/i.test(combined)) {
    return 'sneaky_person';
  }

  // 18. Confused Person / Shrug / Puzzled / Enigma / Clueless
  if (/\b(confused|confusion|puzzled|baffled|bewildered|enigma|riddles?|clueless|shrug|shrugging|doubt|uncertain)\b/i.test(combined)) {
    return 'confused_person';
  }

  return null;
}

/**
 * Contextual Overrides for Backdrops
 * Checks the generated band name and album title for landscape cues
 */
export function detectContextualBackdrop(
  bandName: string,
  albumTitle: string
): BackdropType | null {
  const combined = `${bandName} ${albumTitle}`.toLowerCase();
  if (/\b(desert|dunes?|sunset|sand|arid|sahara|mesa|cactus|saguaro)\b/i.test(combined)) {
    return 'desert_horizon';
  }
  if (/\b(forest|woods?|pine|trees?|twilight|grove|timber|wilderness)\b/i.test(combined)) {
    return 'dark_forest';
  }
  if (/\b(city|urban|skyline|skyscraper|metropolis|downtown|alley|buildings?)\b/i.test(combined)) {
    return 'urban_skyline';
  }
  if (/\b(traffic|jam|cars?|highway|freeway|asphalt|gridlock|taillight)\b/i.test(combined)) {
    return 'traffic_jam';
  }
  if (/\b(space|cosmic|nebula|star|astral|orbit|galaxy|intergalactic)\b/i.test(combined)) {
    return 'deep_space';
  }
  if (/\b(blueprint|schematic|technical|caliper|drafting|grid|formula)\b/i.test(combined)) {
    return 'drafting_grid';
  }
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
  // Check contextual overrides for Subject first
  let subject: SubjectVectorType;
  if (bandName && albumTitle) {
    const contextual = detectContextualSubject(bandName, albumTitle);
    if (contextual) {
      subject = contextual;
      subjectShuffleBag.consumeSubject(contextual);
    } else {
      subject = subjectShuffleBag.drawNext();
    }
  } else {
    subject = subjectShuffleBag.drawNext();
  }

  // Check contextual overrides for Backdrop
  let backdrop: BackdropType;
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

  // Randomize modifier and palette
  const modifier = GAG_MODIFIERS[Math.floor(Math.random() * GAG_MODIFIERS.length)];
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
      'Quantum',
      'Atomic',
      'Sub-Zero',
      'Electromagnetic',
      'Kinetic',
      'Radioactive',
      'Antimatter',
      'Orbital',
      'Thermodynamic',
      'Centrifugal',
      'Molecular',
      'Galvanic',
      'Mathematical',
      'Antidimensional',
      'Functional',
      'Relatively',
    ],
    nouns: [
      'Pastries',
      'Bismuth',
      'Isotopes',
      'Condensers',
      'Spectrometer',
      'Oscillators',
      'Cations',
      'Centrifuge',
      'Decay',
      'Turbines',
      'Electrons',
      'Particles',
      'Abacus',
      'Laserdisc',
      'Ganglia',
      'Equation',
      'Anomalies',
      'Trebuchet',
      'Powder',
    ],
    albumPhrases: [
      'Roll',
      'Half-Life In Seconds',
      'Thermal Inversion',
      'Absolute Zero',
      'Centrifugal Bliss',
      'The Decay Paradox',
      'Spontaneous Reaction',
      'Periodic Table Blues',
      'The Mathematical Incident',
      'Antidimensional Equation',
    ],
    trackThemes: [
      'Beta Radiation Blues',
      'Friction In A Vacuum',
      'The Kelvin Scale Sonata',
      'Subatomic Crumb Dispersion',
      'Orbital Velocity Jam',
      'Bunsen Burner Flameout',
      'Uncertainty Principle Shuffle',
      'Theoretical Collision',
    ],
    denialPhrases: [
      "NOT RADIOACTIVE!",
      "PURE THEORY ONLY!",
      "DO NOT INHALE ISOTOPE!",
    ],
    stampLabels: [
      'CALIBRATED TO 0.001g',
      'LABORATORY APPROVED',
      'HIGH VOLTAGE FIELD',
    ],
    archetypes: ['atomic_orbit', 'hypnotic_swirl', 'absurd_blueprint'],
  },

  culinary: {
    tag: 'culinary',
    prefixes: [
      'Laminated',
      'Pickled',
      'Deep Fried',
      'Caramelized',
      'Dehydrated',
      'Boiled',
      'Smoked',
      'Fermented',
      'Steamed',
      'Whipped',
      'Glazed',
      'Artisanal',
      'Folded',
      'Topically',
      'Superficial',
    ],
    nouns: [
      'Cheese',
      'Scones',
      'Frankfurters',
      'Aspic',
      'Cabbage',
      'Pate',
      'Turnips',
      'Gravy',
      'Gouda',
      'Gelatin',
      'Biscuits',
      'Marmalade',
      'Meatcake',
      'Hummus',
      'Pie',
      'Spork',
    ],
    albumPhrases: [
      'Sharp',
      'Not A Frankfurter',
      'Under The Broiler',
      'Room Temperature',
      'Extra Crumbly',
      'Served Cold',
      'Double Portion',
      'Individually Sealed',
    ],
    trackThemes: [
      'The Cheese Cave Acoustic',
      'Boiling Point In C Minor',
      'Mustard Dispersion Theory',
      'Cellophane Peeling Etude',
      'Lukewarm Stew Reflections',
      'Gravy Boat Navigation',
      'Crust Formation Velocity',
      'Dinner Bell Cacophony',
    ],
    denialPhrases: [
      "IT'S NOT A FRANKFURTER!",
      "100% ARTIFICIAL DAIRY!",
      "DO NOT MICROWAVE!",
    ],
    stampLabels: [
      'INSPECTED & SEALED',
      'GRADE B MARMALADE',
      'BEST BEFORE YESTERDAY',
    ],
    archetypes: ['literal_denial', 'atomic_orbit', 'absurd_blueprint'],
  },

  anatomical: {
    tag: 'anatomical',
    prefixes: [
      'Sprained',
      'Dislocated',
      'Calcified',
      'Punctured',
      'Inflamed',
      'Swollen',
      'Bandaged',
      'Numb',
      'Hyper-Extended',
      'Bruised',
      'Skeletal',
      'Tendon',
      'Terminally',
      'Mutilated',
      'Abrasive',
    ],
    nouns: [
      'Earlobe',
      'Ulna',
      'Cartilage',
      'Ligament',
      'Clavicle',
      'Knee Cap',
      'Jawline',
      'Metatarsal',
      'Phalange',
      'Collarbone',
      'Vertebra',
      'Molar',
      'Elbow',
      'Face',
      'Finger',
      'Claw',
      'Ganglia',
    ],
    albumPhrases: [
      'Owie',
      'Bent Double',
      'Ice Packs Required',
      'Clicking Sounds',
      'Splinted',
      'Tender To Touch',
      'Mild Discomfort',
      'Slight Limp',
    ],
    trackThemes: [
      'Pinching The Nerve',
      'Cracking Cartilage Rumba',
      'The Elastic Bandage Blues',
      'Ibuprofen Morning',
      'Sudden Twitched Reflex',
      'Consulting The Orthopedic',
      'X-Ray Exposure Suite',
      'Limpid Recovery',
    ],
    denialPhrases: [
      "DOES NOT HURT AT ALL!",
      "COMPLETELY NORMAL BONE!",
      "NOT A FRACTURE!",
    ],
    stampLabels: [
      'OWIE APPROVED',
      'CLINICAL ADHESIVE APPLIED',
      'FIG. 7 — TRAUMA',
    ],
    archetypes: ['anatomical_woodcut', 'classical_hazard'],
  },

  bureaucracy: {
    tag: 'bureaucracy',
    prefixes: [
      'Immediate',
      'Former',
      'Duplicate',
      'Notarized',
      'Disapproved',
      'Postponed',
      'Abrasive',
      'Counter-Signed',
      'Triplicate',
      'Audited',
      'Stamped',
      'Clerical',
      'Backordered',
      'Redundant',
      'Obsolete',
      'Disingenuous',
      'Fundamentally',
    ],
    nouns: [
      'Delay',
      'Clones',
      'Abacus',
      'Memos',
      'Invoices',
      'Folders',
      'Signatures',
      'Bursars',
      'Committees',
      'Requisitions',
      'Stamps',
      'Ledgers',
      'Insurance',
      'Board',
      'Opinion',
      'Handling',
      'Truth',
    ],
    albumPhrases: [
      'Hurry Up And Wait',
      'Ditto',
      'Form 1040-B',
      'Rub Vigorously',
      'Void On Arrival',
      'Pending Review',
      'Carbon Copied',
      'Closed On Fridays',
    ],
    trackThemes: [
      'Waiting Room Muzak',
      'The 4-Part Carbon Slip',
      'Stapler Malfunction Jam',
      'Filing Under Misc',
      'Lunch Break From 11 to 3',
      'Photocopier Paper Jam',
      'The Urgent Inter-Office Memo',
      'Lost In Transit',
    ],
    denialPhrases: [
      "FILE HAS BEEN DESTROYED!",
      "NO ACCESS PERMITTED!",
      "UNKNOWN BUREAUCRAT!",
    ],
    stampLabels: [
      'MEASURED IN CARROTS',
      'UNKNOWN ENDORSER',
      'DO NOT FOLD OR MUTILATE',
    ],
    archetypes: ['absurd_blueprint', 'hypnotic_swirl'],
  },

  misfortune: {
    tag: 'misfortune',
    prefixes: [
      'Doctor',
      'Sudden',
      'Unfortunate',
      'Severe',
      'Permanent',
      'Unscheduled',
      'Accidental',
      'Premature',
      'Dubious',
      'Trembling',
      'Clumsy',
      'Anxious',
      'Spindled',
      'Malicious',
    ],
    nouns: [
      'Trepidation',
      'Collapse',
      'Mishap',
      'Catastrophe',
      'Regret',
      'Flinch',
      'Blunder',
      'Hazard',
      'Tremors',
      'Panic',
      'Defeat',
      'Hesitation',
      'Sheeple',
      'Snails',
      'Tortoise',
      'Traffic',
      'Paradox',
      'Incident',
      'Conscience',
    ],
    albumPhrases: [
      'Unsure',
      'Bad Idea',
      'Second Guessing',
      'Look Out Below',
      'Broken Handle',
      'No Return Policy',
      'Total Spill',
      'Slippery Floor',
    ],
    trackThemes: [
      'The Looming Caution Sign',
      'Tripping Over The Cord',
      'Broken Spectacles Overture',
      'Spilled Ink On White Denim',
      'Cold Sweat In The Elevator',
      'The Squeaking Brakes',
      'Emergency Meeting Called',
      'Wrong Direction Entirely',
    ],
    denialPhrases: [
      "EVERYTHING IS FINE!",
      "PROCEED WITH CAUTION!",
      "IT WAS NOT MY FAULT!",
    ],
    stampLabels: [
      'DANGER: HAZARD ZONE',
      'DISAPPROVED AT ONCE',
      'NO LIABILITY ACCEPTED',
    ],
    archetypes: ['classical_hazard', 'literal_denial'],
  },

  domestic: {
    tag: 'domestic',
    prefixes: [
      'Intergalactic',
      'Suburban',
      'Cosmic',
      'Basement',
      'Electric',
      'Domestic',
      'Nocturnal',
      'Lawnmower',
      'Ceiling',
      'Kitchenette',
      'Plumbing',
      'Radiator',
      'Lofty',
      'Fashionable',
    ],
    nouns: [
      'Toilet',
      'Toaster',
      'Radiator',
      'Drainpipe',
      'Boiler',
      'Faucet',
      'Thermostat',
      'Sponge',
      'Puddle',
      'Curtain',
      'Doorknob',
      'Linoleum',
      'Shoes',
      'Soap',
      'Socks',
      'Hamster',
      'Yurt',
      'Weather',
      'Tuba',
      'Gumption',
      'Dreams',
      'Gift',
    ],
    albumPhrases: [
      'The Cosmic Bowels',
      'Zero Gravity Plumbing',
      'Dripping Through The Floor',
      'Leaky Gasket Suite',
      'Pilot Light Extinguished',
      'Echoes In The Cistern',
      'Rusting In Orbit',
      'Water Pressure Blues',
    ],
    trackThemes: [
      'Orbital Flushing Velocity',
      'The Clogged Drain Meditation',
      'Cold Water Shock Blues',
      'Hissing Radiator Symphony',
      'Porcelain Resonance',
      'Plunger Technique in 3/4 Time',
      'Subterranean Pipe Rumble',
      'Midnight Leak Panic',
    ],
    denialPhrases: [
      "IT IS NOT A TOILET!",
      "DRAIN IS UNPLUGGED!",
      "NO WATER DETECTED!",
    ],
    stampLabels: [
      'INSPECTED BY PLUMBER #4',
      'HI-PRESSURE DOMESTIC',
      'COSMIC SEWER APPROVED',
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
];

/**
 * Dynamic Candidate Band Name Generator with authentic satirical grammar templates
 */
// 75% bias toward your custom words whenever they exist
function pickWeightedWord(customList: string[], stockList: string[], customWeight = 0.75): string {
  if (customList && customList.length > 0 && Math.random() < customWeight) {
    return customList[Math.floor(Math.random() * customList.length)];
  }
  return stockList[Math.floor(Math.random() * stockList.length)];
}

function generateCandidateBandName(
  pool: SemanticWordPool,
  dynamicPools?: { adjectives: string[]; nouns: string[]; ensembles: string[] }
): string {
  const adjs = dynamicPools ? dynamicPools.adjectives : CUSTOM_ADJECTIVES;
  const nouns = dynamicPools ? dynamicPools.nouns : CUSTOM_NOUNS;
  const ensembles = dynamicPools ? dynamicPools.ensembles : CUSTOM_ENSEMBLES;
  const pattern = Math.floor(Math.random() * 8);
  const randAdj = capitalizeWord(pickWeightedWord(adjs, EXPANDED_ADJECTIVES));
  const randNoun = capitalizeWord(pickWeightedWord(nouns, EXPANDED_NOUNS));
  const randEnsemble = capitalizeWord(pickWeightedWord(ensembles, EXPANDED_ENSEMBLES));
  const poolPrefix = pool.prefixes[Math.floor(Math.random() * pool.prefixes.length)];
  const poolNoun = pool.nouns[Math.floor(Math.random() * pool.nouns.length)];

  switch (pattern) {
    case 0:
      // [Adjective] [Noun] (e.g., "Mathematical Meatcake", "Antidimensional Trebuchet")
      return `${randAdj} ${randNoun}`;
    case 1:
      // The [Adjective] [Noun] (e.g., "The Terminally Obsolete", "The Lofty Hamster")
      return `The ${randAdj} ${randNoun}`;
    case 2:
      // The [Noun] [Ensemble] (e.g., "The Sheeple Revolution", "The Tortoise Equation")
      return `The ${randNoun} ${randEnsemble}`;
    case 3:
      // [Noun] [Ensemble] (e.g., "Hummus Incident", "Laserdisc Paradox")
      return `${randNoun} ${randEnsemble}`;
    case 4:
      // [Adjective] [Ensemble] (e.g., "Backordered Clones", "Disingenuous Optimists")
      return `${randAdj} ${randEnsemble}`;
    case 5:
      // [Noun] & The [Adjective] [Noun] (e.g., "Spork & The Folded Socks")
      return `${randNoun} & The ${randAdj} ${poolNoun}`;
    case 6:
      // The [Ensemble] of [Noun] (e.g., "The Paradox of Hummus", "The Incident of the Trebuchet")
      return `The ${randEnsemble} of ${randNoun}`;
    case 7:
    default:
      // [PoolPrefix] [Noun]
      return `${poolPrefix} ${Math.random() > 0.4 ? randNoun : poolNoun}`;
  }
}


async function getEffectiveWordPools() {
  try {
    const pack = await getInstalledPack('ydrbn-extended-core');
    if (pack && pack.words) {
      return {
        adjectives: [...CUSTOM_ADJECTIVES, ...(pack.words.adjectives || [])],
        nouns: [...CUSTOM_NOUNS, ...(pack.words.nouns || [])],
        ensembles: [...CUSTOM_ENSEMBLES, ...(pack.words.ensembles || [])],
      };
    }
  } catch (err) {}
  return { adjectives: CUSTOM_ADJECTIVES, nouns: CUSTOM_NOUNS, ensembles: CUSTOM_ENSEMBLES };
}

export async function generateDailyDrop(): Promise<AlbumEntry> {
  // Pick random semantic tag
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
  const dynamicPools = await getEffectiveWordPools();

  // Enforce Absolute Band Name Uniqueness:
  // Must regenerate until a name is found that has NEVER appeared in this installation
  let newBandName = generateCandidateBandName(pool, dynamicPools);
  let attempts = 0;
  while (historyRegistry.has(newBandName) && attempts < 1000) {
    newBandName = generateCandidateBandName(pool, dynamicPools);
    attempts++;
  }
  historyRegistry.add(newBandName);
  const bandName = newBandName;

// 1. IMPLEMENT ALBUM NAME ROLLING MEMORY (capped at 28 items in localStorage)
  let recentAlbums: string[] = [];
  try {
    const stored = localStorage.getItem('ydrbn_recent_albums');
    if (stored) {
      recentAlbums = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse recent albums from storage', e);
  }

  const allPoolAlbumPhrases = Object.values(SEMANTIC_POOLS).flatMap((p) => p.albumPhrases);
  const allAvailableTitles = Array.from(new Set([...pool.albumPhrases, ...allPoolAlbumPhrases]));
  
  let candidateTitle = pool.albumPhrases[Math.floor(Math.random() * pool.albumPhrases.length)];
  let titleAttempts = 0;
  
  while (recentAlbums.includes(candidateTitle) && titleAttempts < 500) {
    titleAttempts++;
    if (titleAttempts < pool.albumPhrases.length * 2) {
      candidateTitle = pool.albumPhrases[Math.floor(Math.random() * pool.albumPhrases.length)];
    } else if (titleAttempts < allAvailableTitles.length * 2) {
      candidateTitle = allAvailableTitles[Math.floor(Math.random() * allAvailableTitles.length)];
    } else {
      const baseTitle = allAvailableTitles[Math.floor(Math.random() * allAvailableTitles.length)];
      candidateTitle = `${baseTitle} Vol. ${Math.floor(Math.random() * 9) + 2}`;
    }
  }

  // Force the 28-item cap and save directly
  recentAlbums.unshift(candidateTitle);
  if (recentAlbums.length > 28) {
    recentAlbums = recentAlbums.slice(0, 28);
  }
  localStorage.setItem('ydrbn_recent_albums', JSON.stringify(recentAlbums));
  const albumTitle = candidateTitle;

  // Pick release year (1968-2024)
  const year = String(Math.floor(Math.random() * 17) + 1968);
  const catalogNumber = `YDR-${year}-STEREO`;

  // Select unique 3-layer combination [Backdrop + Subject + Modifier + Palette]
  // Checks for contextual overrides first, otherwise draws from the 15-subject Fisher-Yates shuffle bag
  const combo = selectModularCombination(bandName, albumTitle);

  // TEMPORARY TEST OVERRIDES:
  //combo.subject = 'toilet01.png' as any;
  //combo.backdrop = 'brick-wall01.png' as any;

  // --- THE MINIMALIST WRINKLE (20% Chance) ---
  let forceNoStickers = false;
  if (Math.random() < 0.20) {
    combo.subject = 'none' as any;
    combo.modifier = 'none';
    forceNoStickers = true;
    
    // Within this minimalist 20%, give it a 50% chance to also strip the 
    // background texture and use a pure 2-color procedural gradient instead.
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

  // Generate 2 distinct satirical reviews (no unwanted names or duplicate quotes)
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

  // Deadpan 2-sentence band biography
  const bioTemplates = [
    `Formed in an actual city in ${year}, ${bandName} built their reputation on relentless deadpan performances and refusal to admit their own physical existence.`,
    `Assembled following a clerical filing disaster in Flumptown in ${year}, ${bandName} specializes in stubborn acoustic resonance and prolonged public pauses.`,
    `Accidentally broadcast across pirate radio in Itchypantsville in ${year}, ${bandName} remains completely unclassifiable and legally disowned by their distributor.`,
    `Founded after an unscheduled laboratory evacuation in ${year}, ${bandName} records exclusively on decommissioned telecommunications equipment.`,
    `Emerging from a disputed patent tribunal in ${year}, ${bandName} performs minimal, abrasive compositions designed for domestic appliances.`,
    `Formed by disgruntled municipal archivists in ${year}, ${bandName} achieved instant notoriety when their debut master tape was filed under "Produce".`,
    `Formed during an administrative misunderstanding in ${year}, ${bandName} developed a reputation for unnecessarily elaborate stage entrances and immediate departures.`,
    `Assembled beneath an abandoned municipal overpass in ${year}, ${bandName} specializes in songs that conclude several minutes before the audience expects them to.`,
    `Established following an unresolved zoning dispute in ${year}, ${bandName} has remained committed to structurally inconvenient music ever since.`,
    `Founded by former employees of a regional appliance wholesaler in ${year}, ${bandName} performs exclusively at venues with inadequate electrical service.`,
    `Emerging from an unsuccessful team-building exercise in ${year}, ${bandName} quickly abandoned conventional songwriting in favor of prolonged tonal disagreements.`,
    `Formed after a routine inventory audit went catastrophically off schedule in ${year}, ${bandName} has never acknowledged the resulting paperwork.`,
    `Assembled from the surviving personnel of an experimental civic orchestra in ${year}, ${bandName} specializes in music of uncertain administrative status.`,
    `Founded in ${year} under circumstances described by witnesses as "mostly procedural," ${bandName} remains dedicated to unnecessary instrumental complexity.`,
    `Formed during a regional telecommunications outage in ${year}, ${bandName} continues to perform as though the interruption never ended.`,
    `Emerging from a failed educational television pilot in ${year}, ${bandName} became known for unusually formal stage banter and aggressive use of tambourine.`,
    `Established following a dispute over the ownership of several folding chairs in ${year}, ${bandName} has maintained a deliberately hostile relationship with seating.`,
    `Formed by three former municipal contractors in ${year}, ${bandName} achieved moderate recognition for their refusal to use conventional musical intervals.`,
    `Assembled in the basement of an improperly licensed community center in ${year}, ${bandName} performs music described by local authorities as "not technically prohibited."    `,
    `Founded after a routine software update produced unexpected acoustic phenomena in ${year}, ${bandName} has declined to reproduce the incident.`,
    `Emerging from an abandoned employee orientation program in ${year}, ${bandName} built a following through lengthy songs about equipment that no longer exists.`,
    `Formed when several unrelated musicians were mistakenly assigned the same rehearsal space in ${year}, ${bandName} eventually agreed to continue the arrangement.`,
    `Established in ${year} by individuals with conflicting recollections of having met previously, ${bandName} specializes in unresolved melodic structures.`,
    `Formed following the accidental duplication of a government procurement order in ${year}, ${bandName} received an unusually large shipment of percussion instruments.`,
    `Assembled during an overnight archival emergency in ${year}, ${bandName} remains committed to preserving sounds that were never considered worth preserving.`,
    `Founded after a minor accounting discrepancy became impossible to reverse in ${year}, ${bandName} financed their debut recordings entirely through unexplained reimbursements.`,
    `Emerging from a temporary workplace committee in ${year}, ${bandName} outlived the committee and eventually became substantially less productive.`,
    `Formed during the closing ceremony of an event nobody remembers attending in ${year}, ${bandName} has specialized in ceremonial music ever since.`,
    `Established in ${year} by a group of reluctant instrumentalists, ${bandName} initially intended to become a consulting firm.`,
    `Assembled after a shipment of musical equipment was delivered to the wrong address in ${year}, ${bandName} decided to keep everything.`,
    `Founded during a prolonged dispute over a photocopier in ${year}, ${bandName} incorporated the machine's warning tones into their earliest recordings.`,
    `Formed by former members of several unrelated bands in ${year}, ${bandName} immediately became the only group none of them could remember joining.`,
    `Emerging from an unauthorized basement performance in ${year}, ${bandName} developed a distinctive style based on repetition, inconvenience, and low-level confusion.`,
    `Founded following an inconclusive scientific demonstration in ${year}, ${bandName} has never successfully replicated its original sound.`,
    `Formed after a public library renovation in ${year}, ${bandName} became briefly notorious for recording entire albums between shelving units.`,
    `Assembled by accident during a regional transportation strike in ${year}, ${bandName} spent their first year performing exclusively at locations nobody could reach.`,
    `Established in ${year} by several people who believed they were attending different meetings, ${bandName} retained the resulting lineup indefinitely.`,
    `Formed after a clerical error assigned the same rehearsal permit to four unrelated musicians in ${year}, ${bandName} refused to resolve the matter.`,
    `Emerging from an experimental noise workshop in ${year}, ${bandName} distinguished themselves by being significantly quieter than everyone else.`,
    `Founded in ${year} following the unexplained disappearance of a municipal filing cabinet, ${bandName} has denied any connection to the incident.`,
    `Formed by former members of a discontinued workplace choir in ${year}, ${bandName} replaced traditional harmony with procedural disagreement.`,
    `Assembled during a poorly attended emergency meeting in ${year}, ${bandName} eventually became the meeting's only surviving agenda item.`,
    `Established after a regional arts grant was accidentally awarded to the wrong organization in ${year}, ${bandName} spent the money on increasingly specialized recording equipment.`,
    `Formed in ${year} after several musicians independently purchased the same obsolete synthesizer, ${bandName} has remained unusually committed to technological redundancy.`,
    `Emerging from an unsuccessful attempt to establish a neighborhood watch in ${year}, ${bandName} redirected its attention toward rhythm.`,
    `Founded following a prolonged dispute over the correct pronunciation of a venue name in ${year}, ${bandName} incorporated the disagreement into their stage routine.`,
    `Formed during a temporary shortage of qualified electricians in ${year}, ${bandName} developed an enduring interest in poorly grounded instruments.`,
    `Assembled in ${year} from musicians recruited through an incorrectly addressed circular, ${bandName} continues to receive correspondence intended for a plumbing company.`,
    `Established after a warehouse inventory system failed in ${year}, ${bandName} began recording with whatever equipment could not be accounted for.`,
    `Formed in ${year} by former members of a regional historical reenactment society, ${bandName} specializes in music that sounds approximately pre-industrial.`,
    `Emerging from a disputed acoustical experiment in ${year}, ${bandName} was briefly classified as a structural concern by the building inspector.`,
    `Founded after an unexplained power fluctuation during a rehearsal in ${year}, ${bandName} has treated electrical instability as an artistic principle.`,
    `Formed by several people who arrived early for a different concert in ${year}, ${bandName} performed anyway and subsequently declined to explain themselves.`,
    `Established in ${year} after a municipal arts committee accidentally approved the same proposal twice, ${bandName} considers duplication central to its creative process.`,
    `Assembled following the premature cancellation of an experimental theater production in ${year}, ${bandName} retained the lighting technician and discarded the script.`,
    `Formed during a prolonged dispute with a local recording studio in ${year}, ${bandName} eventually recorded their debut album in the studio's parking lot.`,
    `Founded in ${year} after an obsolete filing system was discovered to contain several years of musical notation, ${bandName} adapted the material without determining what it meant.`,
    `Emerging from an improperly supervised community workshop in ${year}, ${bandName} became known for performances that technically satisfied all posted requirements.`,
    `Formed after a regional archive accidentally classified several musicians as historical documents in ${year}, ${bandName} accepted the designation without comment.`,
    `Established in ${year} by individuals with no documented history of playing instruments, ${bandName} nevertheless released three albums before anyone investigated.`,
    `Assembled following a dispute between two unrelated scheduling departments in ${year}, ${bandName} has maintained a strict policy of appearing approximately when expected.`,
    `Founded during an extended telecommunications repair in ${year}, ${bandName} developed a distinctive style based on static, waiting, and unresolved tonal information.`,
    `Brought together by an outbreak of administrative confusion in Notarealtown in ${year}, ${bandName} enjoyed several weeks of unexpected success after their first album was mistaken for a release by an actually successful band.`,
    `After three municipal archivists accidentally booked the same rehearsal room in ${year}, ${bandName} decided to continue meeting there until someone noticed. Nobody did.`,
    `${bandName} appeared without warning in ${year}, playing a style of music later described by one reviewer as "probably music." Their hometown of Flumptown has since denied responsibility.`,
    `A clerical error in ${year} resulted in four unrelated musicians being issued identical identification cards. The resulting organization, ${bandName}, eventually began performing together.`,
    `When a regional laboratory in ${year} mistakenly classified several guitar amplifiers as biological samples, ${bandName} was formed to retrieve them. The recovery operation became their debut tour.`,
    `${bandName} spent most of ${year} performing to increasingly confused audiences in Itchypantsville, where their refusal to explain the songs was initially assumed to be part of the performance.`,
    `Nobody is entirely certain how ${bandName} came into existence in ${year}, although records indicate that someone ordered six microphones and received a band.`,
    `Following a dispute over whether a broken photocopier constituted an instrument, ${bandName} began rehearsing in the basement of a municipal office in ${year}. They have not returned the photocopier.`,
    `In ${year}, ${bandName} released an album consisting primarily of sounds recorded during an unsuccessful elevator inspection. Critics disagreed over whether this was intentional.`,
    `${bandName} achieved minor regional notoriety in ${year} after a local newspaper accidentally published their rehearsal schedule under the heading "Emergency Services..`,
    `The members of ${bandName} met in ${year} while waiting for a bus that had been cancelled several months earlier. They formed a band largely because there was nothing else to do.`,
    `A failed attempt to establish a community orchestra in ${year} resulted instead in ${bandName}, a group with no orchestral instruments and an unusually strong opinion about municipal carpeting.`,
    `${bandName} began their career in ${year} with a sold-out performance in a venue that had accidentally printed tickets for them instead of a plumbing seminar.`,
    `In ${year}, a warehouse inventory discrepancy led investigators to discover ${bandName} rehearsing behind approximately eleven tons of obsolete telecommunications equipment.`,
    `${bandName} was originally intended to be a temporary solution to a scheduling problem in ${year}. The scheduling problem was resolved. ${bandName} was not.`,
    `After being rejected by three separate talent competitions in ${year} for reasons nobody could agree upon, ${bandName} established their own competition and immediately disqualified themselves.`,
    `${bandName} entered the music scene in ${year} after a mislabeled cassette was played during a town council meeting. The council meeting was subsequently abandoned.`,
    `A brief period of regional prosperity in ${year} allowed ${bandName} to purchase their first amplifier. The amplifier has since been described as their most successful member.`,
    `In ${year}, ${bandName} became unexpectedly popular among people who had never heard them, largely because their name appeared repeatedly in a newspaper article about a completely unrelated band.`,
    `The first known performance by ${bandName} took place in ${year}, when they were asked to provide background music for an appliance warranty convention. Their contract has never been located.`,
    `${bandName} formed after a disagreement over the ownership of a tambourine in ${year}. The tambourine remains under dispute.`,
    `During the summer of ${year}, ${bandName} developed a distinctive sound by attempting to reproduce a malfunctioning vending machine. The vending machine was later repaired, but the band was not.`,
    `${bandName} recorded their debut album in ${year} using equipment borrowed from a defunct dental college. The college has since requested the equipment back.`,
    `In ${year}, ${bandName} accidentally became the house band at a hotel that had no house, no band policy, and only one functioning room.`,
    `The circumstances surrounding ${bandName}'s arrival in ${year} remain unclear. What is known is that they possessed three amplifiers, a broken accordion, and a document certifying them as a regional agricultural concern.`,
    `${bandName} spent their first year, ${year}, attempting to determine whether they were legally permitted to perform. By the time an answer arrived, they had released two albums.`,
    `After a misunderstanding involving a fire drill and a talent show in ${year}, ${bandName} found themselves onstage in front of several hundred people. They decided to stay there.`,
    `In ${year}, ${bandName} gained a loyal following among municipal employees who believed the band's concerts counted as mandatory training.`,
    `${bandName} recorded their first album in ${year} inside a decommissioned weather station. Nobody remembers why the weather station was selected.`,
    `A scheduling error placed ${bandName} on a festival lineup in ${year}. Rather than correct the mistake, organizers gave them forty minutes and a parking permit.`,
    `${bandName} became briefly famous in ${year} after a radio station accidentally played their entire rehearsal tape during a three-hour equipment failure.`,
    `The origins of ${bandName} can be traced to ${year}, when two competing amateur choirs discovered they had both been using the same rehearsal space and decided to merge. Neither choir contained a singer.`,
    `In ${year}, ${bandName} released a concept album about municipal drainage. It received considerably more attention than the drainage system itself.`,
    `${bandName} was nearly dissolved in ${year} after an internal disagreement over whether their third guitarist actually existed. The guitarist declined to comment.`,
    `Following an unexplained incident at a sporting-goods warehouse in ${year}, ${bandName} acquired their first touring vehicle, despite none of the members possessing a driver's license.`,
    `In ${year}, ${bandName} became the subject of a university study concerning whether a band could continue functioning after all of its members had forgotten the band's name.`,
    `${bandName} first attracted attention in ${year} by performing the same song continuously for nineteen hours. The song lasted four minutes.`,
    `An abandoned office complex in ${year} provided ${bandName} with rehearsal space, electricity, and a receptionist who continued answering their telephone for reasons nobody understood.`,
    `By the end of ${year}, ${bandName} had performed in seven cities, released one album, and been banned from a regional library for reasons unrelated to music.`,
    `${bandName} began as a demonstration of experimental audio equipment in ${year}. The equipment malfunctioned, but the demonstration continued for several years.`,
    `In ${year}, ${bandName} was invited to perform at an awards ceremony after someone confused their name with that of a distinguished local architect. They accepted the award anyway.`,
    `${bandName} achieved their first significant success in ${year}, when a poorly worded review described them as "essential listening." The reviewer later clarified that this was not a recommendation.`,
    `The members of ${bandName} reportedly met during an evacuation in ${year}. Nobody knows what they were being evacuated from, and nobody appears interested in finding out.`,
    `In ${year}, ${bandName} released an album containing twelve songs and one unexplained municipal permit. The permit became the most critically acclaimed part of the record.`,
    `${bandName} spent ${year} attempting to establish themselves as a serious musical organization, despite repeated evidence suggesting they were actually a minor accounting error.`,
    `A defective public-address system in ${year} transformed an ordinary rehearsal by ${bandName} into a citywide broadcast. The city has since installed better equipment.`,
    `${bandName} emerged from a dispute between two neighboring radio stations in ${year}. Neither station wanted them, so they became a band instead.`,
    `In ${year}, ${bandName} released their debut single on a record label that had ceased operations three years earlier. Sales were nevertheless reported as "encouraging..`,
    `The first album by ${bandName}, recorded in ${year}, was described by one magazine as "a bold new direction." The band subsequently admitted they had been facing the wrong direction.`,
    `${bandName} acquired their distinctive sound in ${year}, after accidentally purchasing a collection of obsolete industrial alarms at a government surplus auction.`,
    `In ${year}, ${bandName} was briefly considered a promising young act until it was discovered that most of their early press coverage referred to a completely different band.`,
    `${bandName} first performed publicly in ${year} after their private rehearsal was mistaken for an advertised concert. Rather than correct the misunderstanding, they sold refreshments.`,
    `During ${year}, ${bandName} became involved in an increasingly complicated dispute over a missing drum. The dispute eventually resulted in an album.`,
    `${bandName} released nothing during ${year} except a six-minute recording of someone explaining why they were unable to release anything. It remains their best-selling recording.`,
    `A combination of poor planning, unusual weather, and one misplaced trumpet led to the creation of ${bandName} in ${year}. Only the trumpet was ever recovered.`,
    `In ${year}, ${bandName} was selected to represent Flumptown at an international music festival, despite having never heard of Flumptown and having no international music festival.`,
    `${bandName} became briefly fashionable in ${year} after a prominent critic praised their "deliberate restraint." The band immediately began making considerably more noise.`,
    `The recording career of ${bandName} began in ${year}, when an engineer accidentally left the studio microphone on during a lunch break. The resulting forty-seven minutes became their debut album.`,
    `In ${year}, ${bandName} discovered that their rehearsal space had been scheduled for demolition. They responded by recording an album about it before the building was demolished.`,
    `${bandName} spent the better part of ${year} touring venues that believed they were booking a different band. Attendance was consistently described as "adequate..`,
    `A misunderstanding involving the words "experimental music" and "experimental medicine" brought ${bandName} to public attention in ${year}. No further clarification was provided.`,
    `In ${year}, ${bandName} achieved a modest degree of recognition after their album was mistakenly nominated for an award intended for a documentary about agricultural machinery.`,
    `${bandName} formed a working relationship with a local appliance manufacturer in ${year}, producing several songs specifically designed to test the durability of washing machines.`,
    `The brief but inexplicable success of ${bandName} began in ${year}, when a radio presenter announced them as "the future of music" and was unable to retract the statement.`,
    `In ${year}, ${bandName} discovered that their entire discography had been filed under "Office Supplies." They decided to leave it there.`,
    `${bandName} began recording in ${year} after acquiring a malfunctioning tape machine from an estate sale. Every subsequent album was made using progressively less appropriate equipment.`,
    `During a routine inspection in ${year}, officials discovered that ${bandName} had been rehearsing inside an unused municipal siren tower. They were asked to leave and instead recorded a live album.`,
    `${bandName} spent several months in ${year} attempting to write a song that would satisfy everyone involved. The project was abandoned after fourteen seconds.`,
    `In ${year}, ${bandName} became unexpectedly popular in one small region after a local television station repeatedly aired their music while attempting to repair its transmission system.`,
    `The members of ${bandName} claim they began playing together in ${year}. Available records suggest that they had been doing so for at least six years before anyone noticed.`,
    `In ${year}, ${bandName} released an album so quiet that several listeners assumed their speakers were broken. The band considered this a successful demonstration of artistic restraint.`,
    `${bandName} first gained national attention in ${year} after a journalist mistakenly described them as a "long-running institution." They have been unable to correct the record.`,
    `A dispute over rehearsal-room temperature in ${year} led to the departure of three members and the accidental creation of ${bandName}. The remaining members declined to adjust the thermostat.`,
    `${bandName} spent ${year} developing a sound based on obsolete telephone equipment, malfunctioning intercoms, and one unexplained foghorn.`,
    `In ${year}, ${bandName} were invited to open for a considerably more successful band. Unfortunately, they were invited to open the building rather than the concert.`,
    `The debut of ${bandName} in ${year} was delayed repeatedly by a missing extension cord. Once the cord was located, the band recorded three albums in rapid succession.`,
    `${bandName} first appeared on the local music scene in ${year}, although several witnesses maintain that they had already appeared on the scene approximately twenty minutes earlier.`,
    `In ${year}, ${bandName} discovered that their preferred genre did not technically exist. They continued performing it until someone added it to a database.`,
    `The history of ${bandName} becomes difficult to verify after ${year}, when their only surviving biographer accidentally replaced the band's records with those of a plumbing company.`,
    `${bandName} released their first album in ${year} after discovering that they had already released it the previous year under a slightly different name.`,
    `In ${year}, ${bandName} became the accidental subject of a government report on "unusual concentrations of amplified sound." The report remains classified, although the band has published excerpts.`,
    `${bandName} gained a reputation in ${year} for extremely long performances, largely because nobody could determine where one song ended and the next one began.`,
    `A poorly maintained elevator, a cancelled lecture, and three people carrying guitars converged in ${year}, producing what would eventually become ${bandName}.`,
    `In ${year}, ${bandName} were described as "an exciting new presence" by a magazine that had accidentally printed their name in place of a restaurant review.`,
    `${bandName} began their career by winning a competition they had not entered in ${year}. They were subsequently asked to return the trophy, which they still possess.`,
    `The first known recording of ${bandName} dates from ${year} and consists almost entirely of someone asking whether the recording equipment is switched on.`,
    `In ${year}, ${bandName} became embroiled in a licensing dispute with a company that claimed to own the word "band." The matter was eventually settled out of court.`,
    `${bandName} established their reputation in ${year} by refusing to perform encores. This proved especially effective because their audiences had not requested one.`,
    `After an unsuccessful attempt to organize a poetry reading in ${year}, the organizers accidentally booked ${bandName}. The resulting event lasted considerably longer than the poetry reading would have.`,
    `In ${year}, ${bandName} began experimenting with songs based on the sounds of office equipment. Their first hit, "Fax Machine at Midnight," was never officially released.`,
    `${bandName} appeared at a festival in ${year} after an organizer misread a handwritten note. They remained onstage until someone found the note.`,
    `The first major controversy involving ${bandName} occurred in ${year}, when critics disagreed over whether their music was intentionally strange or merely unfinished.`,
    `In ${year}, ${bandName} recorded an album in a building scheduled for conversion into a dental clinic. The building conversion was completed before the album was mixed.`,
    `${bandName} began as a temporary ensemble for a single performance in ${year}. The performance was cancelled, but the ensemble continued anyway.`,
    `By ${year}, ${bandName} had accumulated enough equipment to qualify as a small telecommunications company, although their music remained difficult to classify.`,
    `In ${year}, ${bandName} became famous for a song nobody could remember hearing, despite its having spent six consecutive weeks on the radio.`,
    `${bandName} first received serious critical attention in ${year}, after an influential reviewer described them as "surprisingly competent." They immediately released a less competent album.`,
    `A shortage of available musicians in ${year} forced a local theater to hire ${bandName}. The theater has since changed its definition of "available..`,
    `In ${year}, ${bandName} relocated to a town whose name has been withheld for administrative reasons. Their music became noticeably stranger within weeks.`,
    `${bandName} spent their first tour in ${year} visiting places where they were not booked. By the end of the tour, several of those places had become venues.`,
    `In ${year}, an unexplained deposit appeared in ${bandName}'s bank account. They used the money to record an album and have spent the intervening years trying to determine who sent it.`,
    `${bandName} became known in ${year} for performing songs that had not yet been written. The practice continues.`,
    `The circumstances of ${bandName}'s first rehearsal in ${year} remain disputed, but all surviving accounts agree that someone brought a surprisingly large quantity of mayonnaise.`,
    `In ${year}, ${bandName} released a record that was immediately withdrawn after the distributor discovered it had been pressing the wrong side of the tape.`,
    `${bandName} entered a period of sustained artistic activity in ${year}, despite having no identified artistic objective.`,
    `In ${year}, ${bandName} were briefly employed by the Department of Unnecessary Noise. Their contract was not renewed after the department was abolished.`,
    `${bandName} developed their signature style in ${year} by attempting to recreate a song they had heard only once, through a wall, during a thunderstorm.`,
    `After being repeatedly mistaken for a traveling theater company in ${year}, ${bandName} eventually incorporated theatrical elements into their performances, mostly because they already owned the curtains.`,
    `In ${year}, ${bandName} recorded a live album at a venue where the audience had been informed they were attending a tax seminar. Reviews were mixed.`,
    `${bandName} achieved a brief period of commercial viability in ${year}, which ended when their accountant discovered that the band's most profitable merchandise was an incorrectly printed parking permit.`,
    `In ${year}, ${bandName} were asked to provide music for a corporate retreat. They provided something else instead, but nobody complained.`,
    `The first documented appearance of ${bandName} in ${year} coincided with the disappearance of several folding chairs from a municipal auditorium. No connection has ever been established.`,
    `${bandName} released their second album in ${year} before releasing their first, citing "chronological inconvenience" as the reason.`,
    `In ${year}, ${bandName} became temporarily unavailable after being accidentally mailed to the wrong address.`,
    `${bandName} spent ${year} attempting to establish whether a recording made entirely from household appliances could legally be called an album. The matter remains unresolved.`,
    `A regional newspaper declared ${bandName} "the sound of tomorrow" in ${year}. Unfortunately, the newspaper was published in 1987.`,
    `In ${year}, ${bandName} acquired a devoted following among people who believed the band was a conceptual art project. The band has never corrected them.`,
    `${bandName} first encountered significant success in ${year}, when a bootleg recording of their soundcheck was mistakenly distributed as a live album by a major label.`,
    `In ${year}, ${bandName} were invited to perform at a conference concerning the future of transportation. Their equipment occupied the only available parking space.`,
    `${bandName} spent most of ${year} trying to replace their drummer, only to discover that the drummer had never officially been a member.`,
    `The unusual career of ${bandName} began in ${year} with an album recorded entirely during scheduled maintenance periods at a regional water-treatment facility.`,
    `In ${year}, ${bandName} were briefly declared missing after nobody could determine which of the four similarly named bands had actually performed the previous evening.`,
    `${bandName} became associated with the town of Notarealtown in ${year}, despite having never visited it and having publicly denied knowing where it was.`,
    `In ${year}, ${bandName} released what they described as their "definitive statement." It consisted of forty-three minutes of static followed by an apology.`,
    `${bandName} achieved local recognition in ${year} after their rehearsal space was accidentally listed as a historic landmark.`,
    `A malfunctioning ticket printer in ${year} gave ${bandName} an audience of several hundred people who believed they were attending a lecture on agricultural zoning.`,
    `In ${year}, ${bandName} were discovered playing inside a storage facility that had been closed since 1974. They claimed they had a reservation.`,
    `${bandName} first became commercially viable in ${year}, although nobody could determine what product they were actually selling.`,
    `In ${year}, ${bandName} began a brief but memorable association with experimental radio, during which their songs were broadcast at increasingly inappropriate times of day.`,
    `The members of ${bandName} reportedly selected their name in ${year} by pointing at a random object in a hardware store. The object has since been discontinued.`,
    `In ${year}, ${bandName} were awarded a regional music prize despite having submitted an application for a gardening grant.`,
    `${bandName} spent ${year} refining a musical technique based on the deliberate misuse of obsolete recording equipment. The equipment proved remarkably tolerant.`,
    `A minor dispute over volume in ${year} escalated into the creation of ${bandName}, three noise complaints, and an album later described as "surprisingly pastoral..`,
    `In ${year}, ${bandName} became the first band to perform inside a building that had not technically been constructed yet.`,
    `${bandName} recorded their breakthrough album in ${year}, primarily because the studio had mistakenly given them someone else's booking and nobody wanted to admit it.`,
    `In ${year}, ${bandName} developed a reputation for ending concerts before they began, a practice that was initially criticized but eventually became logistically convenient.`,
    `The career of ${bandName} took an unexpected turn in ${year}, when their manager accidentally submitted their tax documents to a music festival and their festival application to the tax office.`,
    `In ${year}, ${bandName} became briefly famous after an anonymous reviewer praised their "complete absence of commercial ambition." Their next release sold unexpectedly well.`,
    `${bandName} first appeared in public wearing matching uniforms in ${year}. None of the members admitted ordering them.`,
    `In ${year}, ${bandName} were asked to leave a recording studio because the staff believed they were conducting an electrical inspection. They returned the following week with clipboards.`,
    `The origins of ${bandName} are generally attributed to ${year}, although one surviving document suggests the band may have existed several decades earlier.`,
    `In ${year}, ${bandName} became involved in a failed attempt to establish a regional music archive. They succeeded in establishing a band instead.`,
    `${bandName} released an album in ${year} that was described as "genre-defying" because nobody could agree which genre to assign it to in the first place.`,
    `In ${year}, ${bandName} discovered that their entire touring schedule had been replaced by a list of plumbing appointments. They decided to honor both schedules.`,
    `${bandName} first achieved widespread recognition in ${year}, after a mistaken weather report described their sound as "heavy with occasional thunder..`,
    `In ${year}, ${bandName} began performing in increasingly unusual locations, eventually arriving at a venue that had been demolished six years earlier.`,
    `The members of ${bandName} claim their first album was recorded in ${year}. The surviving master tape is dated three years earlier and contains a different band.`,
    `In ${year}, ${bandName} were invited to perform at a museum because staff believed their equipment was an exhibit. They played quietly enough to avoid disturbing the visitors.`,
    `${bandName} entered the public consciousness in ${year} through an accidental radio broadcast that consisted of twelve minutes of silence and one member asking, "Are we on?.`,
    `In ${year}, ${bandName} established themselves as a serious musical organization by acquiring a filing cabinet and assigning it a permanent role in the band.`,
    `The brief history of ${bandName} prior to ${year} is largely undocumented, possibly because the relevant documents were stored in a building that no longer exists.`,
    `In ${year}, ${bandName} were invited to record a soundtrack for a documentary about industrial adhesives. The documentary was cancelled, but the soundtrack became their most ambitious work.`,
    `${bandName} began their career in ${year} with an unauthorized performance at a bus depot. Transit officials later described the incident as "mostly harmless..`,
    `In ${year}, ${bandName} achieved a modest following by performing songs that lasted exactly as long as the audience's patience.`,
    `${bandName} became briefly influential in ${year} after several younger musicians copied their style without realizing the original band had been making it up as they went along.`,
    `In ${year}, ${bandName} were declared "not currently active" by their record label. They were performing a sold-out show at the time.`,
    `The first press release issued by ${bandName} in ${year} contained no information about the band whatsoever, but did include detailed instructions for operating a photocopier.`,
    `In ${year}, ${bandName} were relocated to a larger rehearsal facility after officials determined that their previous location was "no longer acoustically defensible..`,
    `${bandName} spent ${year} attempting to record an album without using electricity. The project ended when someone discovered batteries.`,
    `In ${year}, ${bandName} became the accidental soundtrack to a municipal emergency drill. Nobody involved has admitted enjoying it.`,
    `${bandName} first appeared on a national chart in ${year}, although the chart was actually measuring agricultural equipment sales.`,
    `In ${year}, ${bandName} were briefly represented by an agent who believed they were a moderately successful folk trio from Belgium. The arrangement lasted until the first rehearsal.`,
    `The members of ${bandName} reportedly met in ${year} while attempting to return the same defective guitar to the same store. The store eventually closed.`,
    `In ${year}, ${bandName} released a collection of songs inspired by common office procedures. The record was particularly popular among people who had never heard of music.`,
    `${bandName} acquired their reputation for difficult performances in ${year}, after refusing to begin until everyone in the audience had completed a standardized questionnaire.`,
    `In ${year}, ${bandName} were accidentally booked for a children's birthday party. They have since described the experience as "formative..`,
    `${bandName} began experimenting with extremely slow music in ${year}, primarily because their drummer had forgotten to bring the correct tempo.`,
    `In ${year}, ${bandName} became the subject of a minor legal dispute concerning the unauthorized use of a photocopier sound on their second album.`,
    `The unlikely rise of ${bandName} began in ${year}, when a regional newspaper accidentally published their rehearsal notes instead of the weekly crossword.`,
    `In ${year}, ${bandName} performed their first international concert in a country that, according to their booking agent, was "somewhere nearby..`,
    `${bandName} spent ${year} developing a reputation for elaborate live performances involving cables, folding tables, and absolutely no stage lighting.`,
    `In ${year}, ${bandName} were offered a recording contract after a label executive heard them through a wall and assumed they were renovating the building.`,
    `The first documented controversy surrounding ${bandName} occurred in ${year}, when the band refused to identify which member was responsible for bringing the accordion.`,
    `In ${year}, ${bandName} released an album that contained no vocals because the vocalist had been accidentally scheduled for jury duty.`,
    `${bandName} became a recognized presence in ${year} after repeatedly appearing at venues on dates when they were not booked.`,
    `In ${year}, ${bandName} were praised for their innovative approach to rhythm, which consisted primarily of forgetting when to start.`,
    `The formation of ${bandName} in ${year} followed an unsuccessful attempt to establish a competitive lawn-care cooperative. The cooperative has since been dissolved.`,
    `In ${year}, ${bandName} began performing songs based on official municipal documents. Their most successful single was inspired by a parking citation.`,
    `${bandName} recorded their first live album in ${year}, although no audience can be heard because the audience had been instructed to remain in another building.`,
    `In ${year}, ${bandName} achieved brief international attention after a European newspaper translated their name as "The People Who Have Not Yet Left..`,
    `The members of ${bandName} have different accounts of what happened in ${year}, but all agree that there was a van, a trumpet, and a considerable amount of paperwork.`,
    `In ${year}, ${bandName} were described as "the next big thing" by a critic who later admitted he had been referring to a refrigerator.`,
    `${bandName} spent their early years attempting to produce a commercially successful album. They eventually produced an album about the attempt instead.`,
    `In ${year}, ${bandName} became the only band in regional history to have its equipment inspected by both the fire department and the Department of Agriculture.`,
    `The unexpected popularity of ${bandName} in ${year} was attributed by local observers to several factors, none of which involved the quality of the music.`,
    `In ${year}, ${bandName} began touring after a promoter accidentally booked them for thirty-seven consecutive dates. Nobody noticed the error until date thirty-eight.`,
    `${bandName} first received international distribution in ${year}, despite having no international distributor and, according to their accountant, no distributable material.`,
    `In ${year}, ${bandName} released a record described by its own liner notes as "an acceptable attempt." It remains their most accurate description of themselves.`,
    `The first major recording by ${bandName} was made in ${year} using a microphone that had previously been installed in a public-address system at a courthouse.`,
    `In ${year}, ${bandName} became temporarily famous after a supermarket began playing their music in the produce section. The supermarket has denied knowing why.`,
    `${bandName} were first recognized as a serious musical concern in ${year}, shortly before several members were asked to leave the country for unrelated reasons.`,
    `In ${year}, ${bandName} accidentally invented a new genre while attempting to repair their amplifier. The genre has never been successfully reproduced.`,
    `The career of ${bandName} began in ${year} when a local arts council mistakenly awarded them funding intended for a puppet theater.`,
    `In ${year}, ${bandName} performed at a conference attended by several experts in acoustics. None of the experts stayed for the second song.`,
    `${bandName} became notorious in ${year} for releasing an album before recording it. The recording was eventually made to satisfy distribution requirements.`,
    `In ${year}, ${bandName} established a temporary headquarters in an abandoned laundromat. The headquarters became permanent after the band discovered the building had excellent acoustics.`,
    `The first surviving photograph of ${bandName}, taken in ${year}, shows five people, two amplifiers, and what appears to be a municipal traffic cone. Nobody knows who the cone belonged to.`,
    `In ${year}, ${bandName} achieved their first chart position after a radio station accidentally entered their name into a database intended for weather observations.`,
    `${bandName} developed their distinctive performance style in ${year}, when their sound technician became trapped in a supply closet and they were forced to continue without him.`,
    `In ${year}, ${bandName} became associated with experimental music largely because nobody had thought to associate them with anything else.`,
    `${bandName} spent ${year} attempting to determine whether they were a band, a performance collective, or a prolonged misunderstanding. They eventually stopped checking.`,
    `In ${year}, ${bandName} recorded an album entirely in one take because the studio's second take button had been removed for safety reasons.`,
    `The first known mention of ${bandName} occurs in a ${year} invoice for "miscellaneous amplified activity." The invoice remains unpaid.`,
    `In ${year}, ${bandName} became unexpectedly successful after their record label accidentally marketed their album as a compilation of established artists.`,
    `${bandName} first attracted attention in ${year} by performing without announcing the names of their songs, their members, or the venue.`,
    `In ${year}, ${bandName} were asked to provide a short musical interlude. Their interpretation of "short" lasted approximately three hours.`,
    `The history of ${bandName} begins, for most practical purposes, in ${year}, although several earlier incidents have since been retroactively attributed to them.`,
    `In ${year}, ${bandName} became briefly famous in Notarealtown after their album was mistaken for a municipal planning document and circulated throughout city offices.`,
    `${bandName} first achieved critical recognition in ${year} after a reviewer praised their "economical use of silence." The band had simply forgotten to record the second half of the album.`,
    `In ${year}, ${bandName} were discovered to have been using a rehearsal room reserved for a tax-preparation seminar. The seminar had been cancelled. The band had not.`,
    `${bandName} began performing in ${year} after an experimental theater group ran out of actors and discovered that several of its lighting technicians owned guitars.`,
    `In ${year}, ${bandName} became known for their refusal to play requests, particularly requests from people who had not requested anything.`,
    `The unlikely commercial career of ${bandName} began in ${year}, when their distributor shipped their album to the wrong country and it became unexpectedly popular there.`,
    `In ${year}, ${bandName} recorded a single inspired by a malfunctioning pedestrian crossing. The crossing was repaired shortly afterward, ending the band's primary source of inspiration.`,
    `${bandName} emerged from an administrative dispute in ${year}, during which three departments independently attempted to register the same band under different names.`,
    `In ${year}, ${bandName} were briefly considered a major new act after an algorithm incorrectly identified them as the musical equivalent of a successful software company.`,
    `The members of ${bandName} first performed together in ${year}, although none of them remembers agreeing to do so.`,
    `In ${year}, ${bandName} released an album so poorly documented that historians have been unable to establish whether it was ever actually released.`,
    `${bandName} achieved a modest degree of fame in ${year} after appearing in a documentary about something else entirely.`,
    `In ${year}, ${bandName} became known throughout the region for their distinctive use of obsolete equipment, unnecessary paperwork, and an unusually formal approach to applause.`,
    `The band now known as ${bandName} was briefly known as something else in ${year}, although nobody can agree what that something was.`,
    `In ${year}, ${bandName} accidentally became the resident band at a venue that did not have a residency program.`,
    `${bandName} began their recording career in ${year} after a technician mistakenly connected the studio's emergency microphone to the recording console.`,
    `In ${year}, ${bandName} were awarded a certificate recognizing their contribution to local culture. The certificate was intended for a gardening club.`,
    `The public career of ${bandName} commenced in ${year} with a performance nobody had advertised and an audience nobody had invited.`,
    `In ${year}, ${bandName} became the subject of intense local speculation after several residents reported hearing music from a building that had been vacant for eleven years.`,
    `${bandName} first achieved notoriety in ${year} by releasing a record that their own distributor classified as "miscellaneous..`,
    `In ${year}, ${bandName} discovered that their preferred method of songwriting was technically prohibited by local noise ordinances. They continued anyway, quietly.`,
    `The formation of ${bandName} in ${year} was attributed to an outbreak of placebo syndrome, although no member has ever admitted to having symptoms.`,
    `In ${year}, ${bandName} became briefly successful after audiences repeatedly mistook their deliberately unfinished songs for avant-garde compositions.`,
    `${bandName} spent the remainder of ${year} recovering from the unexpected success of their debut single, which had been released accidentally.`,
    `In ${year}, ${bandName} were asked to leave a festival after performing for too long. They returned the following year with a shorter set that lasted even longer.`,
    `The first album by ${bandName} was released in ${year} after a manufacturing error produced 10,000 copies of a record nobody had intended to make.`,
    `In ${year}, ${bandName} became associated with a particular style of acoustic resonance that several engineers insisted was merely a plumbing problem.`,
    `${bandName} began as an experiment in collaborative songwriting in ${year}. The experiment was declared inconclusive after the participants formed a permanent band.`,
    `In ${year}, ${bandName} performed a concert entirely from behind a curtain after discovering that nobody had remembered to construct a stage.`,
    `The unusual circumstances surrounding ${bandName} in ${year} have been documented extensively, although none of the documentation explains what the band actually sounded like.`,
    `In ${year}, ${bandName} were mistakenly entered into a regional competition for marching bands. They placed surprisingly well.`,
    `${bandName} first entered a recording studio in ${year}, where they were immediately asked whether they were there to repair something.`,
    `In ${year}, ${bandName} became the accidental owners of a small recording studio after winning it in a dispute over an unpaid equipment rental.`,
    `The members of ${bandName} reportedly became a band in ${year} because they were the only four people available when the previous band failed to arrive.`,
    `In ${year}, ${bandName} released an album dedicated to the concept of administrative delay. It was delayed for fourteen months.`,
    `${bandName} became briefly notorious in ${year} after a critic described them as "impossible to categorize," which was subsequently adopted as their official genre.`,
    `In ${year}, ${bandName} developed a loyal following among people waiting for buses, although the band itself had no connection to public transportation.`,
    `The career of ${bandName} accelerated unexpectedly in ${year} when their rehearsal recording was mistaken for a leaked album by a famous artist.`,
    `In ${year}, ${bandName} became the subject of a local investigation after their stage equipment was discovered to include several items listed as missing from a government warehouse.`,
    `${bandName} began performing regularly in ${year}, despite having no regular venue, regular schedule, or regular understanding of what they were doing.`,
    `In ${year}, ${bandName} were described as "promising" by a reviewer who immediately added that he had not heard them.`,
    `The first tour by ${bandName} in ${year} was organized entirely through handwritten notes. Three venues received the wrong dates and one received a refrigerator.`,
    `In ${year}, ${bandName} became unexpectedly popular with audiences who believed their music contained hidden messages. The band denies hiding anything.`,
    `${bandName} recorded their most successful album in ${year} after discovering that the studio's usual recording equipment had been removed and replaced with laboratory instruments.`,
    `In ${year}, ${bandName} were briefly classified as a public nuisance, then reclassified as a cultural asset, then left unclassified.`,
    `The band's first major performance in ${year} ended when the venue's fire alarm interpreted the music as smoke.`,
    `In ${year}, ${bandName} released a collection of previously unreleased material, most of which had not previously been recorded.`,
    `${bandName} became established in ${year} through a combination of persistence, clerical error, and the repeated failure of other bands to show up.`,
    `In ${year}, ${bandName} acquired a recording contract, a tour van, and a moderately successful single without ever determining who their manager was.`,
    `The story of ${bandName} in ${year} begins with a missing suitcase and ends with an album that was recorded entirely on answering machines.`,
    `In ${year}, ${bandName} were invited to participate in a study of group decision-making. The study was discontinued after the band spent six hours deciding whether to have lunch.`,
    `${bandName} first attracted attention in ${year} for producing music that seemed to change depending on which direction the listener was facing.`,
    `In ${year}, ${bandName} were mistaken for a traveling choir, a software company, and a minor political subdivision, sometimes within the same afternoon.`,
    `The members of ${bandName} began working together in ${year} after a failed office relocation left them with several instruments and nowhere else to put them.`,
    `In ${year}, ${bandName} recorded a song specifically designed to test whether a recording could be both too long and too short. The results were inconclusive.`,
    `${bandName} became briefly successful in ${year} when their distributor accidentally printed the album cover upside down and reviewers assumed it was intentional.`,
    `In ${year}, ${bandName} were invited to perform at a university lecture on contemporary music. They spent most of the evening trying to locate the lecture.`,
    `The first known publicity photograph of ${bandName}, taken in ${year}, was rejected by the band because it contained too much evidence that they existed.`,
    `In ${year}, ${bandName} developed a reputation for extremely precise performances in which nothing happened at exactly the scheduled time.`,
    `${bandName} began their career in ${year} by recording an album in a building scheduled for demolition. The demolition was postponed repeatedly, but the album was not.`,
    `In ${year}, ${bandName} became the accidental recipients of a substantial arts grant intended for a more competent organization.`,
    `The unusual musical career of ${bandName} can be traced to ${year}, when a damaged radio transmitter began broadcasting their rehearsal sessions to several surrounding counties.`,
    `In ${year}, ${bandName} became briefly famous for a song that contained no instruments, no vocals, and approximately six seconds of music.`,
    `${bandName} first became commercially relevant in ${year}, after a major retailer mistakenly stocked their album in the home-improvement section.`,
    `In ${year}, ${bandName} were described by a critic as "a band ahead of its time." The band later discovered that the critic had simply misread the publication date.`,
    `The members of ${bandName} first assembled in ${year} to settle a dispute over a drum machine. The dispute remains unresolved, but the band continues.`,
    `In ${year}, ${bandName} established an unusually strict policy regarding audience participation: audiences were not permitted to participate.`,
    `${bandName} became associated with Notarealtown in ${year} after an erroneous census listed the band as a permanent population of six.`,
    `In ${year}, ${bandName} were invited to record in a historic studio. They discovered that the studio was historic primarily because its plumbing had not been updated.`,
    `The first major success of ${bandName} came in ${year}, when their album was mistaken for a soundtrack to a documentary that did not exist.`,
    `In ${year}, ${bandName} began experimenting with acoustic instruments after their electricity was disconnected. They have not yet restored it.`,
    `${bandName} first achieved recognition in ${year} by performing a set so quiet that venue staff repeatedly assumed the concert had been cancelled.`,
    `In ${year}, ${bandName} became briefly associated with a new musical movement that had been invented by a journalist while writing the article.`,
    `The career of ${bandName} entered an unusually productive phase in ${year}, when the band discovered that their recording studio had been double-booked and the other band never arrived.`,
    `In ${year}, ${bandName} released an album inspired by an unexplained stain on the wall of their rehearsal space. The stain remains visible.`,
    `${bandName} first toured internationally in ${year}, despite having only one passport between them and no confirmed destination.`,
    `In ${year}, ${bandName} were asked to leave a radio station after accidentally replacing the station's entire playlist with recordings of themselves.`,
    `The formation of ${bandName} in ${year} was neither planned nor particularly encouraged, but eventually became difficult to reverse.`,
    `In ${year}, ${bandName} began receiving fan mail from people who had never heard them but had mistaken the band's name for a customer-service department.`,
    `${bandName} achieved their greatest period of local recognition in ${year}, when the town council mistakenly declared one of their songs an official municipal anthem.`,
    `In ${year}, ${bandName} recorded an album specifically for listeners who disliked music. Sales exceeded expectations.`,
    `The members of ${bandName} have offered several explanations for their appearance in ${year}. All involve an incorrect train schedule.`,
    `In ${year}, ${bandName} were briefly considered for a prestigious music award, largely because the nomination form had been completed in pencil and could not be read.`,
    `${bandName} first became known for their unusual live shows in ${year}, during which the band would stop playing whenever anyone appeared to be enjoying themselves.`,
    `In ${year}, ${bandName} released an album containing several songs that were later determined to have been recorded by accident.`,
    `The history of ${bandName} in ${year} is complicated by the fact that the band was simultaneously listed as active, dissolved, and pending review.`,
    `In ${year}, ${bandName} became the subject of a minor academic controversy after scholars disagreed over whether their debut album constituted an album.`,
    `${bandName} entered the regional music market in ${year} with no label, no manager, and a surprisingly detailed inventory of extension cords.`,
    `In ${year}, ${bandName} were asked to provide a musical backdrop for an archaeological dig. They discovered several percussion instruments and one band member.`,
    `The first recorded performance of ${bandName} in ${year} was interrupted by a fire drill, which was later determined to have been the most organized part of the evening.`,
    `In ${year}, ${bandName} became unexpectedly successful after their distributor confused their album with a best-selling record and refused to correct the mistake.`,
    `${bandName} spent the latter half of ${year} attempting to recreate the sound of a malfunctioning public-address system. They eventually succeeded and immediately regretted it.`,
    `In ${year}, ${bandName} were officially described as "an emerging act," despite having been active for several decades.`,
    `The unlikely existence of ${bandName} was first acknowledged in ${year}, when someone finally answered the telephone in their rehearsal space.`,
    `In ${year}, ${bandName} became famous for refusing to explain their music. This was initially a philosophical position but later became necessary because they had forgotten.`,
    `${bandName} first appeared on a festival poster in ${year}, although the band name had been intended to identify a parking lot.`,
    `In ${year}, ${bandName} released their most ambitious work: a twelve-track album recorded entirely from the perspective of a malfunctioning office printer.`,
    `The creation of ${bandName} in ${year} followed a minor administrative error that gradually became too complicated to correct.`,
    `In ${year}, ${bandName} were invited to perform in a neighboring town after local officials mistakenly concluded that they were a public utility.`,
    `${bandName} became a fixture of the local music scene in ${year}, largely because nobody could figure out how to remove them from the calendar.`,
    `In ${year}, ${bandName} recorded what was intended to be a demo but was accidentally mastered, distributed, reviewed, and nominated for an award before anyone noticed.`,
    `The band's reputation for stubborn acoustic resonance began in ${year}, when ${bandName} refused to acknowledge that the rehearsal room had been designed for quiet activities.`,
    `In ${year}, ${bandName} became briefly notorious after their album was withdrawn for containing a sound that was technically classified as a municipal alarm.`,
    `${bandName} first attracted a following in ${year} among people who appreciated their commitment to never resolving a song.`,
    `In ${year}, ${bandName} were asked to perform a short set and interpreted the request as a request for a set of short performances.`,
    `The early history of ${bandName} is dominated by ${year}, a missing amplifier, and an invoice for seventeen thousand dollars worth of "musical consultation..`,
    `In ${year}, ${bandName} achieved an unusual degree of success after their record label accidentally described them as "established..`,
    `${bandName} began as a group of unrelated people waiting outside the same locked building in ${year}. They eventually decided they might as well rehearse.`,
    `In ${year}, ${bandName} released a debut album whose title was selected by an automatic filing system. They have retained it ever since.`,
    `The first significant event in the history of ${bandName} occurred in ${year}, when the band discovered they had been booked to play a venue that was located in another state.`,
    `In ${year}, ${bandName} became known for their unusually formal stage announcements, each of which began with the words "For administrative purposes....`,
    `${bandName} first appeared in the public record in ${year}, listed under a category normally reserved for minor infrastructure projects.`,
    `In ${year}, ${bandName} began a period of experimental recording using equipment recovered from a closed television station. The resulting album was described as "broadcast-adjacent..`,
    `The members of ${bandName} claim that ${year} was the year they became a band. Their landlord insists it was several years earlier.`,
    `In ${year}, ${bandName} were accidentally granted residency at a venue because the venue's booking system had no category for "temporary misunderstanding..`,
    `${bandName} developed a small but devoted audience in ${year} by performing exclusively in rooms where the acoustics made normal conversation impossible.`,
    `In ${year}, ${bandName} were invited to provide music for a scientific demonstration. The experiment failed, but attendance increased.`,
    `The career of ${bandName} took shape in ${year}, when an unrelated collection of musicians discovered that they had all been using the same fake booking agent.`,
    `In ${year}, ${bandName} released a record that was praised for its "raw honesty," despite having been assembled entirely from accidental recordings.`,
    `${bandName} became locally notorious in ${year} after their rehearsal sessions were mistaken for an ongoing construction project.`,
    `In ${year}, ${bandName} were asked to perform quietly. They complied so thoroughly that the venue refunded everyone's tickets.`,
    `The first commercial recording by ${bandName} in ${year} was produced by an engineer who believed he was recording a documentary about traffic noise.`,
    `In ${year}, ${bandName} were briefly regarded as a promising new act until it was discovered that their most enthusiastic reviewer was also their accountant.`,
    `${bandName} first gained attention in ${year} after an experimental radio station played one of their songs backwards and received several complaints about the forward version.`,
    `In ${year}, ${bandName} established a reputation for refusing conventional song structures, primarily because nobody had explained them.`,
    `The story of ${bandName} begins in ${year} with an empty theater, a functioning microphone, and several people who had apparently been expecting someone else.`,
    `In ${year}, ${bandName} became briefly famous after a television station used their rehearsal recording as background music for a weather forecast. The forecast was incorrect.`,
    `${bandName} first released music in ${year}, although their label insisted on calling it "documentation..`,
    `In ${year}, ${bandName} developed a distinctive approach to live performance involving deliberate pauses, unnecessary paperwork, and occasional references to municipal zoning.`,
    `The formation of ${bandName} was announced in ${year} by a press release that nobody remembers writing. The band nevertheless honored the announcement.`,
    `In ${year}, ${bandName} became associated with a musical style described as "administrative rock," a term they continue to deny having invented.`,
    `${bandName} spent ${year} performing in increasingly unsuitable venues until they eventually played inside a functioning elevator. The elevator continued operating throughout the concert.`,
    `In ${year}, ${bandName} released an album based entirely on sounds recorded from household appliances. The appliances have since formed a competing band.`,
    `The first appearance of ${bandName} at a major festival in ${year} was the result of a spreadsheet error. Their subsequent appearances were not.`,
    `In ${year}, ${bandName} acquired an unusual reputation for being simultaneously overproduced and underprepared.`,
    `${bandName} became briefly popular in ${year} after an influential blogger claimed to have discovered them. The band had been touring for twenty years.`,
    `In ${year}, ${bandName} were mistakenly identified as a folk ensemble and invited to perform at a historical reenactment. They performed a song about parking regulations instead.`,
    `The members of ${bandName} first began recording together in ${year}, although none of them owned a recording device.`,
    `In ${year}, ${bandName} became the subject of a documentary that ultimately contained more footage of their equipment than of the band itself.`,
    `${bandName} first achieved notoriety in ${year} after a local radio station banned them for being "too difficult to categorize." The station later hired them as consultants.`,
    `In ${year}, ${bandName} performed a concert specifically for people who had arrived at the wrong concert. Attendance was unusually high.`,
    `The history of ${bandName} contains very little reliable information about ${year}, except that something was recorded, someone was fined, and an album eventually appeared.`,
    `In ${year}, ${bandName} became briefly successful after their distributor accidentally marketed them as a nostalgia act despite the band having no nostalgic qualities whatsoever.`,
    `${bandName} began their most productive period in ${year}, when a power outage forced them to write songs without instruments.`,
    `In ${year}, ${bandName} were invited to play at a technology conference after an organizer confused their equipment list with a server specification.`,
    `The first album by ${bandName} was completed in ${year} after a recording session that lasted three days and contained only fourteen minutes of usable material.`,
    `In ${year}, ${bandName} developed a reputation for unusually literal song titles, including "Song About a Chair," "Another Song About a Chair," and "Chair..`,
    `${bandName} first achieved recognition in ${year} when a magazine mistakenly printed their name in a list of influential architects.`,
    `In ${year}, ${bandName} were hired to provide music for a corporate merger. The merger failed, but the band remained together.`,
    `The unlikely persistence of ${bandName} can be traced to ${year}, when repeated attempts to disband them were complicated by inadequate paperwork.`,
    `In ${year}, ${bandName} released a record that consisted entirely of alternate takes. The original takes have never been located.`,
    `${bandName} first became a recognizable musical entity in ${year}, when several unrelated recordings were accidentally filed under the same name.`,
    `In ${year}, ${bandName} achieved their first sold-out show after the venue accidentally sold twice as many tickets as it had seats.`,
    `The members of ${bandName} met in ${year} while waiting for an administrative hearing that had been postponed indefinitely. They began rehearsing during the postponement.`,
    `In ${year}, ${bandName} were described as "experimental" by a critic who had mistaken their soundcheck for the performance.`,
    `${bandName} began touring in ${year} with a single vehicle, two functioning instruments, and a complete set of municipal inspection forms.`,
    `In ${year}, ${bandName} became unexpectedly popular among people who believed their songs were encoded instructions. The band has never confirmed or denied this.`,
    `The first known review of ${bandName}, published in ${year}, consisted of the sentence "We are still looking into it..`,
    `In ${year}, ${bandName} became associated with a recording technique involving obsolete answering machines, malfunctioning telephones, and an unusually cooperative fax machine.`,
    `${bandName} were first recognized as a legitimate band in ${year}, approximately six months after their record label had already dissolved.`,
    `In ${year}, ${bandName} began a long-running dispute with a local venue over whether silence constituted a performance. Both sides eventually claimed victory.`,
    `The career of ${bandName} entered its experimental phase in ${year}, although witnesses maintain that the entire career had already been experimental.`,
    `In ${year}, ${bandName} accidentally became the opening act for a conference on municipal accounting. Their audience included several accountants who later became fans.`,
    `${bandName} first became internationally known in ${year}, when a mislabeled cassette was discovered in a secondhand shop approximately 4,000 miles from their hometown.`,
    `In ${year}, ${bandName} released their first album, despite having spent the previous year insisting that they were not a band.`,
    `The origin of ${bandName} is generally placed in ${year}, although competing accounts involve a train station, a dentist's office, and an improperly labeled shipping container.`,
    `In ${year}, ${bandName} achieved an unusual degree of critical attention after reviewers discovered that their entire press kit had been generated from an expired warranty document.`,
    `${bandName} first performed together in ${year} as part of an unrelated event and have been trying to determine what event it was ever since.`,
    `In ${year}, ${bandName} became briefly famous after a newspaper described their music as "unreasonably optimistic." The band immediately adopted the phrase.`,
    `The members of ${bandName} claim that their first rehearsal in ${year} lasted forty minutes. Surviving building records indicate that the rehearsal space was occupied for eleven days.`,
    `In ${year}, ${bandName} were accidentally awarded a recording contract after their application was submitted alongside a request for industrial cleaning supplies.`,
    `${bandName} first became known for their acoustic experiments in ${year}, when they discovered that the walls of their rehearsal room were significantly more musical than the band.`,
    `In ${year}, ${bandName} began a period of sustained public activity after someone mistakenly classified their music as essential infrastructure.`,
    `The first commercial success of ${bandName} occurred in ${year}, when their distributor sold several thousand copies of an album the band had not yet finished recording.`,
    `In ${year}, ${bandName} were described as "the future of independent music," a statement they later discovered had been copied from a brochure for independent plumbing.`,
    `${bandName} became a functioning organization in ${year}, although the organization's primary function remained unclear.`,
    `In ${year}, ${bandName} performed their first concert without amplification, largely because the amplifier had been repossessed.`,
    `The band now known as ${bandName} acquired its current name in ${year}, after three previous names were rejected by a government database.`,
    `In ${year}, ${bandName} released a critically acclaimed album recorded entirely during business hours because nobody had checked the studio's opening times.`,
    `${bandName} first attracted attention in ${year} by performing a song that gradually became longer until the venue closed.`,
    `In ${year}, ${bandName} became the accidental beneficiaries of a municipal arts initiative designed for a completely different type of organization.`,
    `The first public appearance of ${bandName} in ${year} was described by witnesses as "unexpected, somewhat loud, and apparently authorized..`,
    `In ${year}, ${bandName} developed a reputation for songs that appeared to end several minutes before the audience realized they had ended.`,
    `${bandName} began their career in ${year} with a performance in a room that had been reserved for a committee meeting. The committee was unable to regain possession.`,
    `In ${year}, ${bandName} were mistakenly booked as a solo act. They responded by performing collectively and refusing to discuss the discrepancy.`,
    `The band's unusual approach to composition began in ${year}, when ${bandName} discovered that none of their members could agree on how a normal song was supposed to work.`,
    `In ${year}, ${bandName} became briefly famous after a recording engineer described their rehearsal tape as "surprisingly expensive..`,
    `${bandName} first entered the public consciousness in ${year} through an advertisement that contained their name but no information about what they did.`,
    `In ${year}, ${bandName} began producing music from equipment that had previously been used to monitor airport luggage. The results were difficult to classify but easy to detect.`,
    `The first major period of activity for ${bandName} began in ${year}, when an abandoned community center unexpectedly regained electricity.`,
    `In ${year}, ${bandName} released an album inspired by the sound of an empty office. It was immediately followed by a second album inspired by a slightly less empty office.`,
    `${bandName} first achieved local fame in ${year} after their rehearsal was mistaken for an emergency broadcast.`,
    `In ${year}, ${bandName} were invited to perform at a charity event and accidentally became the charity.`,
    `The unusual career of ${bandName} began in ${year} with a broken tape recorder, a disputed parking space, and no clear understanding of what would happen next.`,
    `In ${year}, ${bandName} achieved brief success by performing exclusively in places where amplified music was not technically permitted.`,
    `${bandName} became increasingly difficult to classify after ${year}, when their music began incorporating household machinery, municipal announcements, and prolonged periods of administrative silence.`,
    `In ${year}, ${bandName} were recognized by a regional arts organization for "contributions to experimental culture," despite having submitted no application and attending the ceremony by mistake.`,
    `The first album by ${bandName} was recorded in ${year} under conditions the band later described as "adequate, except for the fire..`,
    `In ${year}, ${bandName} became the subject of a brief academic paper arguing that their music represented an entirely new category of administrative noise.`,
    `${bandName} first performed in ${year} after discovering that the venue had no cancellation policy and deciding to interpret this as encouragement.`,
    `In ${year}, ${bandName} acquired a reputation for refusing to repeat themselves, although several of their songs are identical.`,
    `The story of ${bandName} begins in ${year}, when an unexplained package containing several microphones was delivered to a group of people who did not know one another.`,
    `In ${year}, ${bandName} released a debut album that became unexpectedly popular after listeners mistook its deliberate imperfections for manufacturing defects.`,
    `${bandName} became a permanent feature of the local music scene in ${year}, largely because the person responsible for removing them from the booking system retired.`,
    `In ${year}, ${bandName} were described as "difficult but promising," although nobody could agree which half of the statement was intended as criticism.`,
    `The first documented success of ${bandName} occurred in ${year}, when their song was used as background music for a televised report about road construction.`,
    `In ${year}, ${bandName} began a period of intense recording activity after acquiring access to a studio whose previous owner had disappeared.`,
    `${bandName} first became commercially viable in ${year}, when their label accidentally shipped their album to a country where nobody spoke the language used on it.`,
    `In ${year}, ${bandName} developed a distinctive habit of announcing songs after playing them.`,
    `The members of ${bandName} first encountered one another in ${year} during an evacuation, a power failure, or possibly both. Their subsequent musical collaboration remains unexplained.`,
    `In ${year}, ${bandName} released a record that was immediately praised for its "refreshing lack of direction." The band considered this accurate.`,
    `${bandName} became briefly notorious in ${year} after a venue advertised them as "four local musicians" and received six people, none of whom admitted to being local.`,
    `In ${year}, ${bandName} were invited to participate in a recording session because the producer believed they were a different band. The mistake was never corrected.`,
    `The band's first international release in ${year} was distributed under the wrong name. The wrong name proved more popular.`,
    `In ${year}, ${bandName} became associated with a series of unexplained recordings discovered on obsolete office equipment.`,
    `${bandName} first achieved a degree of stability in ${year}, when they acquired a permanent rehearsal room and immediately lost the key.`,
    `In ${year}, ${bandName} were accidentally entered into a competition for amateur radio operators. Their performance was disqualified but their score remains under review.`,
    `The formation of ${bandName} in ${year} followed an administrative error so minor that nobody initially bothered correcting it.`,
    `In ${year}, ${bandName} began producing songs based on official forms, expired permits, and the sounds produced by filing cabinets when dropped from moderate heights.`,
    `${bandName} first became known in ${year} for their unusually elaborate album packaging, which consisted entirely of documents proving that the album existed.`,
    `In ${year}, ${bandName} released a record that was described as "difficult listening," primarily because the record was packaged without a record player.`,
    `The career of ${bandName} accelerated in ${year} after a clerical worker mistakenly entered the band's name into the city's emergency notification system.`,
    `In ${year}, ${bandName} became the subject of a minor cultural dispute after one newspaper classified them as rock, another classified them as folk, and the city classified them as a recurring noise complaint.`,
    `${bandName} first attracted a substantial audience in ${year} by playing the same venue on the same night as a much more successful band and benefiting from a ticketing error.`,
    `In ${year}, ${bandName} began using obsolete telecommunications equipment as instruments after discovering that their actual instruments had been sent to the wrong address.`,
    `The unlikely persistence of ${bandName} through ${year} was attributed to a combination of stubbornness, low overhead, and the repeated failure of local authorities to identify who was responsible for them.`,
    `In ${year}, ${bandName} released an album whose liner notes contained more information about the recording engineer's parking habits than about the music.`,
    `${bandName} first became a recognized name in ${year}, after their logo was accidentally printed on several thousand municipal envelopes.`,
    `In ${year}, ${bandName} were asked to stop performing because their audience had become too large for the room. They solved the problem by moving the audience outside.`,
    `The band's unusual recording practices began in ${year}, when ${bandName} discovered that the studio's most reliable microphone was actually a telephone.`,
    `In ${year}, ${bandName} were mistaken for an established touring act and given access to a much larger stage than they were prepared to use.`,
    `${bandName} became briefly famous in ${year} after an album review described them as "the musical equivalent of a filing cabinet." Sales increased immediately.`,
    `In ${year}, ${bandName} began a period of musical experimentation that included prepared instruments, accidental overdubs, and one prolonged dispute over a stapler.`,
    `The first known appearance of ${bandName} in Notarealtown occurred in ${year}, although local records classify the event as a minor electrical incident.`,
    `In ${year}, ${bandName} released their most commercially successful song after accidentally recording it while attempting to test a microphone.`,
    `${bandName} first developed their reputation for prolonged public pauses in ${year}, when the band stopped playing and neglected to resume for approximately eleven minutes.`,
    `In ${year}, ${bandName} became associated with a failed municipal arts project that produced no artwork, no funding report, and one surprisingly durable band.`,
    `The origins of ${bandName} in ${year} remain contested, but all available evidence points toward an unlocked door and an unnecessarily large amplifier.`,
    `In ${year}, ${bandName} began a brief collaboration with a group of experimental physicists. The physicists eventually returned to physics.`,
    `${bandName} first achieved commercial attention in ${year} after a retailer placed their album next to a highly successful record by mistake. Customers did not notice.`,
    `In ${year}, ${bandName} became known for songs that were allegedly based on real events, although none of the alleged events have been located.`,
    `The first major profile of ${bandName}, published in ${year}, concluded that the band was "either very important or improperly filed..`,
    `In ${year}, ${bandName} began recording exclusively on decommissioned telecommunications equipment after discovering that the newer equipment was "too cooperative..`,
    `${bandName} first became notorious in ${year} for performing an album in reverse order. The audience did not notice.`,
    `In ${year}, ${bandName} were asked to leave a rehearsal facility after refusing to acknowledge its posted closing time. They recorded their next album outside.`,
    `The members of ${bandName} first performed together in ${year} because the scheduled performers had been delayed by a misunderstanding involving livestock.`,
    `In ${year}, ${bandName} were briefly listed as one of the city's largest employers. They had six members.`,
    `${bandName} became a recognizable local institution in ${year}, although the institution in question had no building, no charter, and no apparent purpose.`,
    `In ${year}, ${bandName} released a record inspired by a broken office printer. The printer was repaired before the record was released.`,
    `The band's first period of widespread attention came in ${year}, when their music was accidentally transmitted through the public-address system of a regional courthouse.`,
    `In ${year}, ${bandName} began accepting bookings through a fax machine that had not been connected to anything since 1998.`,
    `${bandName} first achieved a measurable level of success in ${year}, when their album sold enough copies to qualify for a return policy.`,
    `In ${year}, ${bandName} became associated with a musical movement that ended approximately two weeks after it began.`,
    `The first significant recording by ${bandName} was made in ${year}, after the band discovered that the studio had accidentally recorded them while they were discussing lunch.`,
    `In ${year}, ${bandName} were mistaken for a successful band from another city and received several favorable reviews before anyone noticed the error.`,
    `${bandName} began their career in ${year} by performing at an event that had been organized to celebrate the opening of a new parking lot.`,
    `In ${year}, ${bandName} developed a reputation for refusing to play songs with conventional endings. Most of their songs therefore simply stop.`,
    `The unexpected success of ${bandName} in ${year} was followed by an equally unexpected period of administrative scrutiny.`,
    `In ${year}, ${bandName} became the first local band to have its rehearsal space designated as a temporary weather emergency shelter.`,
    `${bandName} first became known for their minimalist performances in ${year}, although the minimalism was primarily caused by a shortage of instruments.`,
    `In ${year}, ${bandName} released a debut album that was recorded, mixed, mastered, and accidentally mailed to the wrong address in a single afternoon.`,
    `The career of ${bandName} began in ${year} when a group of unrelated people discovered they had all been promised the same recording contract.`,
    `In ${year}, ${bandName} achieved a small degree of notoriety after their music was used to test the acoustic properties of a new municipal parking garage.`,
    `${bandName} first became associated with stubborn acoustic resonance in ${year}, after their rehearsal room continued producing sound several minutes after the band had left.`,
    `In ${year}, ${bandName} were briefly considered for a major festival before organizers discovered that their entire application had been submitted in the wrong language.`,
    `The formation of ${bandName} in ${year} was followed almost immediately by their first breakup, reunion, second breakup, and debut recording.`,
    `In ${year}, ${bandName} became unexpectedly popular after a listener called a radio station to complain about their music and accidentally requested another song.`,
    `${bandName} first appeared in a national publication in ${year}, although the article was actually about the town where they rehearsed.`,
    `In ${year}, ${bandName} released an album consisting of songs written during administrative waiting periods. The album runs for approximately nine hours.`,
    `The first successful performance by ${bandName} occurred in ${year}, when the band discovered that the audience had mistaken them for the entertainment scheduled for the following evening.`,
    `In ${year}, ${bandName} began an ill-advised experiment with conceptual music and accidentally produced several songs people wanted to hear.`,
    `${bandName} first achieved international attention in ${year}, when an obscure foreign magazine declared them "the future of something..`,
    `In ${year}, ${bandName} became briefly famous for their refusal to explain their name, their music, or why one member was carrying a traffic cone.`,
    `The history of ${bandName} prior to ${year} remains incomplete, largely because the band's early records were stored alphabetically under the word "produce..`,
    `In ${year}, ${bandName} became involved in a dispute over a missing master tape. The dispute ended when the tape was discovered inside a photocopier.`,
    `${bandName} first became a functioning touring unit in ${year}, after acquiring a van that had previously belonged to a regional tax office.`,
    `In ${year}, ${bandName} released a single so experimental that the record label initially classified it as a technical support recording.`,
    `The members of ${bandName} began collaborating in ${year} after an accidental power outage forced several unrelated rehearsal groups into the same room.`,
    `In ${year}, ${bandName} were briefly regarded as influential after three younger bands copied a style that ${bandName} themselves had copied from a malfunctioning elevator.`,
    `${bandName} first achieved a following in ${year} among people who attended their concerts by mistake and were too embarrassed to leave.`,
    `In ${year}, ${bandName} became the subject of a local rumor claiming that none of the members actually existed. The band declined to provide evidence to the contrary.`,
    `The first album by ${bandName}, released in ${year}, was initially rejected by the distributor for being "insufficiently album-shaped..`,
    `In ${year}, ${bandName} began performing in abandoned buildings after discovering that the acoustics improved dramatically when the buildings were not supposed to be occupied.`,
    `${bandName} became briefly successful in ${year} after their record was mistakenly advertised as a collection of archival recordings from a much older and more respected band.`,
    `In ${year}, ${bandName} established a reputation for performances that began with complete silence and ended with everyone agreeing that something had probably happened.`,
    `The unlikely story of ${bandName} continues from ${year}, when a routine clerical error resulted in their permanent inclusion on a municipal event calendar.`,
    `In ${year}, ${bandName} were invited to perform at a laboratory because researchers believed their music might be useful in testing structural vibrations.`,
    `${bandName} first entered the public record in ${year} after a city employee accidentally classified their debut album as a new form of infrastructure.`,
    `In ${year}, ${bandName} developed a sound based on obsolete machines, incorrect assumptions, and one unusually resonant bucket.`,
    `The first documented success of ${bandName} in ${year} came after their album was mistaken for a soundtrack to a successful film. There was no film.`,
    `In ${year}, ${bandName} became briefly fashionable among critics who enjoyed describing things they did not understand.`,
    `${bandName} first performed as a group in ${year}, although two members maintain that they were simply standing nearby when the performance began.`,
    `In ${year}, ${bandName} became the accidental beneficiaries of a recording contract that had been intended for a band with an almost identical name.`,
    `The band's reputation for refusing to admit their own physical existence began in ${year}, after a venue discovered that none of the performers had signed the guest book.`,
    `In ${year}, ${bandName} released an album that was praised for its "uncompromising vision," despite having been recorded entirely because the studio had already been paid for.`,
    `${bandName} began receiving serious attention in ${year}, when an academic journal published a paper arguing that their music might represent a previously undocumented category of noise.`,
    `In ${year}, ${bandName} were invited to perform at an event that had been cancelled two months earlier. They arrived anyway and found the venue empty.`,
    `The formation of ${bandName} in ${year} was followed by a period of intense rehearsal, limited public activity, and considerable disagreement about where the band had actually formed.`,
    `In ${year}, ${bandName} accidentally became the resident performers at a hotel after the management confused their booking with a plumbing inspection.`,
    `${bandName} first attracted attention in ${year} after a listener reported hearing their music from inside a locked municipal storage facility.`,
    `In ${year}, ${bandName} released a record dedicated to the memory of a rehearsal space that was still standing.`,
    `The first known commercial release by ${bandName} appeared in ${year}, although the band's members insist they were not informed about it until several months later.`,
    `In ${year}, ${bandName} achieved brief success after their debut album was mistaken for an unreleased record by a major artist and reviewed accordingly.`,
    `${bandName} became established in ${year} after surviving several attempts by local officials to determine whether they required a permit.`,
    `In ${year}, ${bandName} began using silence as an instrument, mostly because their other instruments had been confiscated.`,
    `The career of ${bandName} entered its most confusing period in ${year}, when the band simultaneously released two albums under three different names.`,
    `In ${year}, ${bandName} were invited to participate in a music festival, a technology demonstration, and a tax seminar on the same weekend. They attended all three.`,
    `${bandName} first achieved a degree of permanence in ${year}, when their landlord stopped asking when they intended to leave.`,
    `In ${year}, ${bandName} released an album so obscure that its first review was published before anyone had heard it.`,
    `The members of ${bandName} first became aware that they were a band in ${year}, when someone asked them what kind of band they were.`,
    `In ${year}, ${bandName} were briefly classified as "experimental infrastructure" by a regional planning authority.`,
    `${bandName} developed their signature sound in ${year} after an accidental feedback loop became impossible to eliminate and eventually impossible to live without.`,
    `In ${year}, ${bandName} became a minor cultural phenomenon after a local television station repeatedly used their music to fill unexpected periods of silence.`,
    `The first major event in the history of ${bandName} occurred in ${year}, when their rehearsal was interrupted by officials who had come to inspect the building for termites.`,
    `In ${year}, ${bandName} began recording exclusively after midnight because the studio offered a discount and because nobody had considered the consequences.`,
    `${bandName} first became known outside their hometown in ${year}, when a bootleg recording circulated among people who believed it was an experimental weather report.`,
    `In ${year}, ${bandName} were invited to provide music for an art installation consisting primarily of a chair. The chair received better reviews.`,
    `The unusual circumstances of ${bandName}'s debut in ${year} included a missing microphone, a mistaken address, and an audience that had come expecting a lecture on zoning.`,
    `In ${year}, ${bandName} became briefly successful after their distributor accidentally shipped their album to every location except the one where the band lived.`,
    `${bandName} first appeared to have a career in ${year}, although the appearance was later determined to have been caused by paperwork.`,
    `In ${year}, ${bandName} released a debut record that was described as "strangely familiar" by critics who could not identify the familiar part.`,
    `The band now known as ${bandName} spent ${year} operating under a provisional name, provisional management, provisional funding, and permanent confusion.`,
    `In ${year}, ${bandName} became associated with a peculiar form of acoustic minimalism in which the musicians attempted to use as few notes as administratively possible.`,
    `${bandName} first received public funding in ${year}, after an application intended for a community theater was filed under the wrong category.`,
    `In ${year}, ${bandName} achieved their first genuine success when a crowd gathered outside a venue simply because nobody had told them the concert had been cancelled.`,
    `The origins of ${bandName} can be traced to ${year}, a misplaced appointment, and a telephone number that belonged to nobody.`,
    `In ${year}, ${bandName} were briefly considered a serious threat to the established music industry, primarily because nobody at the industry had any idea what they were doing.`,
    `${bandName} first began attracting international listeners in ${year}, when an online translation incorrectly rendered their name as "A Very Serious Musical Organization..`,
    `In ${year}, ${bandName} recorded a song using only sounds produced by objects found in the rehearsal room. The rehearsal room has since been emptied.`,
    `The first surviving interview with ${bandName}, conducted in ${year}, consists largely of the band asking the interviewer questions.`,
    `In ${year}, ${bandName} became famous for their elaborate refusal to participate in interviews, including one instance in which they sent a photocopy of an empty chair.`,
    `${bandName} first achieved a modest degree of cultural significance in ${year}, when a local museum accidentally included their merchandise in an exhibition of industrial artifacts.`,
    `In ${year}, ${bandName} began a long-running experiment in which every album was recorded using equipment that had already been declared obsolete.`,
    `The band's first period of commercial success in ${year} ended abruptly when their distributor discovered that the successful record belonged to somebody else.`,
    `In ${year}, ${bandName} became associated with a style of performance involving prolonged pauses, unnecessary announcements, and occasional references to office furniture.`,
    `${bandName} first became difficult to ignore in ${year}, after their rehearsal recordings began appearing on unrelated radio stations throughout the region.`,
    `In ${year}, ${bandName} were invited to perform at a festival celebrating innovation. Their primary innovation was arriving without any instruments.`,
    `The first major recording by ${bandName} in ${year} was made entirely from sounds captured during a routine building inspection.`,
    `In ${year}, ${bandName} released a record that became unexpectedly popular after listeners assumed its poor sound quality was evidence of authenticity.`,
    `${bandName} first became known as a live act in ${year}, despite having performed only twice and neither performance having an audience.`,
    `In ${year}, ${bandName} developed an unusual reputation for appearing in places where no entertainment had been scheduled.`,
    `The story of ${bandName} begins in ${year}, when a group of musicians discovered that their rehearsal room had been accidentally listed as a public meeting place.`,
    `In ${year}, ${bandName} became the subject of a documentary whose narrator repeatedly referred to them as "the organization." The band did not object.`,
    `${bandName} first achieved critical attention in ${year}, when a reviewer praised their "impressive control over space." The band had simply forgotten to bring the drum kit.`,
    `In ${year}, ${bandName} released an album containing several songs that were subsequently removed from the album because nobody could determine who had written them.`,
    `The first commercial appearance of ${bandName} in ${year} was on a compilation that the band did not know existed until it appeared in a supermarket.`,
    `In ${year}, ${bandName} became briefly popular after a successful band denied being them, causing listeners to become curious about who they actually were.`,
    `${bandName} began performing regularly in ${year}, primarily because the local booking system automatically renewed their reservation every Tuesday.`,
    `In ${year}, ${bandName} acquired a reputation for refusing to perform in conventional venues. They eventually discovered that their definition of "conventional" included most buildings.`,
    `The unlikely rise of ${bandName} in ${year} was aided by a favorable review, an incorrect photograph, and an unusually forgiving record distributor.`,
    `In ${year}, ${bandName} became known for a song that was approximately seven minutes long but contained only one minute of actual music.`,
    `${bandName} first attracted serious attention in ${year} after an archivist discovered several decades-old recordings bearing their name.`,
    `In ${year}, ${bandName} denied having existed before ${year}, despite evidence suggesting otherwise.`,
    `The formation of ${bandName} in ${year} was officially attributed to three people, although records from the same period list seventeen.`,
    `In ${year}, ${bandName} became the subject of a regional dispute over whether their concerts constituted public gatherings, private gatherings, or avoidable gatherings.`,
    `${bandName} first achieved commercial success in ${year} after their record was distributed as a free sample with an unrelated office-supply catalogue.`,
    `In ${year}, ${bandName} began recording songs about things that had happened to them, but soon discovered that nothing had happened to them and began recording songs about things that might have.`,
    `The first known performance of ${bandName} in ${year} was described as "surprisingly organized," a comment that would not be repeated.`,
    `In ${year}, ${bandName} became briefly famous after their album was selected for a book club that had mistaken the album title for a novel.`,
    `${bandName} spent ${year} developing a method of songwriting based on randomly selecting words from municipal forms. The resulting songs were surprisingly coherent.`,
    `In ${year}, ${bandName} became associated with a particular brand of acoustic stubbornness that local engineers were unable to measure.`,
    `The members of ${bandName} reportedly decided to form a band in ${year} after realizing they had accidentally attended the same concert six times.`,
    `In ${year}, ${bandName} recorded their first album in a building that had previously housed a tax office, a dentist, and a small but unsuccessful aquarium.`,
    `${bandName} first became known for their elaborate stage setups in ${year}, which required more paperwork than equipment.`,
    `In ${year}, ${bandName} were briefly recognized as an important new musical force, largely because someone had mistakenly attached their photograph to another band's press release.`,
    `The career of ${bandName} began in ${year} with a performance at a venue that had forgotten to install doors.`,
    `In ${year}, ${bandName} achieved a small amount of notoriety after a local newspaper described their music as "unreasonably persistent..`,
    `${bandName} first became a touring act in ${year}, when a promoter mistakenly believed they already had a tour.`,
    `In ${year}, ${bandName} released an album inspired by the sounds of routine maintenance. It was their first record to receive a maintenance schedule.`,
    `The unusual history of ${bandName} includes ${year}, a broken synthesizer, a missing invoice, and one unidentified person who continues to receive royalties.`,
    `In ${year}, ${bandName} became unexpectedly popular after their record label accidentally promoted them as a reunion of a band that had never existed.`,
    `${bandName} first attracted a devoted audience in ${year}, largely because their concerts were free and nobody could determine how to leave.`,
    `In ${year}, ${bandName} were invited to perform at a civic ceremony and accidentally played the wrong anthem.`,
    `The first album by ${bandName} was completed in ${year}, although the band continued recording it for several years afterward.`,
    `In ${year}, ${bandName} became famous for their refusal to discuss their origins, despite having published a 42-page booklet about them.`,
    `${bandName} first entered the local charts in ${year}, although the chart was based on radio requests and one of those requests had been submitted by the band.`,
    `In ${year}, ${bandName} developed a distinctive sound by recording inside an empty municipal swimming pool. The pool has since been filled in.`,
    `The band's history becomes particularly unclear around ${year}, when ${bandName} apparently toured extensively without leaving their hometown.`,
    `In ${year}, ${bandName} achieved brief success after their first album was mistaken for a compilation of recordings from several unrelated artists.`,
    `${bandName} first received international press in ${year}, after an overseas journalist described them as "a mysterious American phenomenon." The band was from Canada.`,
    `In ${year}, ${bandName} became associated with a performance technique involving silence, repetition, and the occasional checking of a wall clock.`,
    `The first documented appearance of ${bandName} in ${year} took place at an event that was simultaneously described as a concert, a seminar, and a scheduling error.`,
    `In ${year}, ${bandName} began using deliberately obsolete equipment because newer equipment made it too easy to determine what they were doing.`,
    `${bandName} first achieved a measure of fame in ${year} after an anonymous reviewer claimed that nobody sounded like them. The band considered this an administrative success.`,
    `In ${year}, ${bandName} were invited to perform at an international conference and spent most of their appearance trying to locate the correct conference.`,
    `The unlikely formation of ${bandName} in ${year} was followed by an even less likely recording career involving decommissioned equipment, municipal grants, and a distributor who had apparently misplaced their glasses.`,
    `In ${year}, ${bandName} became a local institution after performing the same song at every civic event they were invited to attend, regardless of the event.`,
    `${bandName} first achieved notoriety in ${year} when a critic described their music as "a triumph of unnecessary complexity." The band adopted the phrase as a slogan.`,
    `In ${year}, ${bandName} began experimenting with acoustic resonance after discovering that the rehearsal room had been constructed entirely from materials that resonated.`,
    `The first major success of ${bandName} occurred in ${year}, when their album was accidentally played at a conference for three consecutive hours and nobody stopped it.`,
    `In ${year}, ${bandName} became known for releasing music at irregular intervals, including once during a power outage and once on a national holiday.`,
    `${bandName} first appeared to have a record deal in ${year}, although the contract was actually for pest control services.`,
    `In ${year}, ${bandName} became the accidental beneficiaries of a clerical error involving a local arts festival and a shipment of industrial adhesives.`,
    `The band's first appearance in a major publication in ${year} described ${bandName} as "a promising local concern," which was technically accurate but not especially flattering.`,
    `In ${year}, ${bandName} recorded a concept album about a fictional municipal department. The department later became real.`,
    `${bandName} first became known outside their immediate area in ${year}, after a mislabeled tape was discovered in an antique telephone exchange.`,
    `In ${year}, ${bandName} began performing with a deliberately incomplete set of instruments, explaining that "completion would compromise the process..`,
    `The formation of ${bandName} in ${year} was followed by a surprisingly successful debut, despite the band having no agreed-upon definition of success.`,
    `In ${year}, ${bandName} released an album that was almost entirely ignored until a much more successful band accidentally covered one of its songs.`,
    `${bandName} first attracted attention in ${year} after a radio station received complaints about a song nobody could prove it had played.`,
    `In ${year}, ${bandName} became involved in a local dispute over whether their rehearsal sessions qualified as construction activity. The city eventually classified them as both.`,
    `The first public statement from ${bandName}, issued in ${year}, consisted of a request for everyone to stop asking questions.`,
    `In ${year}, ${bandName} developed a following among people interested in obsolete technology, prolonged silence, and music that appeared to have been filed incorrectly.`,
    `${bandName} first became commercially successful in ${year}, when a distributor mistakenly shipped their album to every branch of a chain of stores that had never sold music.`,
    `In ${year}, ${bandName} released a record inspired by an office fire that had not actually happened.`,
    `The history of ${bandName} in ${year} is generally summarized as "something went wrong, and then there was a band..`,
    `In ${year}, ${bandName} were briefly mistaken for an album, an architectural firm, and a discontinued household appliance.`,
    `${bandName} first performed in ${year} after an event organizer discovered that the scheduled entertainment had been replaced by an empty stage.`,
    `In ${year}, ${bandName} became the subject of an investigation into unauthorized musical activity. The investigation produced three reports and no conclusions.`,
    `The first known recording of ${bandName} in ${year} was made accidentally during a test of a public-address system. The test was deemed successful.`,
    `In ${year}, ${bandName} became briefly fashionable after critics decided that their refusal to improve was an intentional artistic philosophy.`,
    `${bandName} first acquired a reputation for difficult music in ${year}, when their debut album was returned by several listeners with notes attached.`,
    `In ${year}, ${bandName} began a period of unusual productivity after someone accidentally paid their studio bill twice.`,
    `The members of ${bandName} first met in ${year} while attempting to resolve a dispute involving a damaged amplifier. The amplifier was eventually repaired; the dispute was not.`,
    `In ${year}, ${bandName} were invited to participate in a historical reenactment and were mistaken for historically accurate musicians.`,
    `${bandName} first entered the public imagination in ${year}, although nobody can establish whether the public actually wanted them there.`,
    `In ${year}, ${bandName} became known for their unusually literal interpretation of the phrase "experimental music..`,
    `The unlikely success of ${bandName} in ${year} was largely due to a mistaken identity, a mislabeled master tape, and an unusually forgiving audience.`,
    `In ${year}, ${bandName} released their first album after several months of insisting that albums were an outdated administrative concept.`,
    `${bandName} first became a recognized entity in ${year}, when a local government database finally stopped rejecting their registration.`,
    `In ${year}, ${bandName} began performing songs about everyday inconveniences, eventually becoming an inconvenience themselves.`,
    `The story of ${bandName} begins in ${year} with an incorrect address, a functioning amplifier, and several people who were waiting for someone else.`,
    `In ${year}, ${bandName} achieved minor notoriety after their music was used to test the emergency evacuation system of a large office building.`,
    `${bandName} first received a favorable review in ${year}, although the reviewer had intended to write about a restaurant.`,
    `In ${year}, ${bandName} became the accidental subject of a municipal art grant, a zoning dispute, and a moderately successful album.`,
    `The first significant chapter of ${bandName}'s career began in ${year}, when an administrative error became too expensive to correct.`,
    `In ${year}, ${bandName} began recording music exclusively on equipment that had previously been declared unsuitable for recording music.`,
    `${bandName} first achieved a degree of public recognition in ${year} after their name appeared repeatedly on documents nobody remembered producing.`,
    `In ${year}, ${bandName} were invited to perform at a festival celebrating local culture. They were the only local culture available that afternoon.`,
    `The members of ${bandName} claim they formed in ${year}. Their first manager claims they were already famous by then.`,
    `In ${year}, ${bandName} became briefly successful after their album was mistaken for an instructional recording and distributed to several thousand employees.`,
    `${bandName} first became associated with experimental recording in ${year}, when a malfunctioning machine refused to stop recording.`,
    `In ${year}, ${bandName} performed their first concert in a venue that had previously been used exclusively for storing filing cabinets.`,
    `The origins of ${bandName} in ${year} remain uncertain, although one surviving witness recalls a trumpet, a locked door, and someone shouting about insurance.`,
    `In ${year}, ${bandName} became famous for a song that was never officially released but was nevertheless played by three radio stations.`,
    `${bandName} first gained a reputation for persistence in ${year}, after continuing to perform despite repeated announcements that the venue had closed.`,
    `In ${year}, ${bandName} released an album that was described as "timeless," mostly because nobody could determine when it had been recorded.`,
    `The formation of ${bandName} in ${year} resulted from an unfortunate convergence of scheduling, geography, and inadequate supervision.`,
    `In ${year}, ${bandName} became unexpectedly popular after their record label advertised them as a completely different band and refused to correct the advertisement.`,
    `${bandName} first appeared in the records of the local arts council in ${year}, listed under "Other / Possibly Musical..`,
    `In ${year}, ${bandName} became the only known band to perform an entire concert using equipment borrowed from a municipal lost-and-found department.`,
    `The first commercial recording by ${bandName} in ${year} was intended as a demonstration tape. The demonstration lasted long enough to become an album.`,
    `In ${year}, ${bandName} began a period of increasingly strange experimentation that culminated in an album nobody could determine how to play.`,
    `${bandName} first became famous in ${year} after their debut album was mistaken for an archival release from a band that had dissolved decades earlier.`,
    `In ${year}, ${bandName} acquired a devoted following among listeners who appreciated the band's refusal to provide a consistent explanation for anything.`,
    `The unlikely history of ${bandName} in ${year} includes an abandoned laboratory, a misplaced microphone, and an album that was released before anyone approved it.`,
    `In ${year}, ${bandName} were briefly considered an important new act after a critic described them as "the logical conclusion of music." The band was unable to explain what this meant.`,
    `${bandName} first became a recognizable presence in ${year}, after several unrelated venues began reporting the same unexplained booking.`,
    `In ${year}, ${bandName} recorded a song based on the sound of a photocopier. The photocopier subsequently received a royalty payment.`,
    `The first known public statement from ${bandName} in ${year} was delivered through a malfunctioning intercom and remains partially unintelligible.`,
    `In ${year}, ${bandName} became associated with a genre that existed only in one magazine article and one band's press kit.`,
    `${bandName} first achieved modest commercial success in ${year}, when a supermarket accidentally included their album in a buy-one-get-one-free promotion for canned vegetables.`,
    `In ${year}, ${bandName} were briefly listed as a municipal contractor after someone confused their equipment invoice with a construction bid.`,
    `The career of ${bandName} took an unexpected turn in ${year}, when their rehearsal room was declared a historic site and could no longer legally be used for rehearsals.`,
    `In ${year}, ${bandName} began recording in abandoned public buildings because the acoustics were good and the paperwork was worse.`,
    `${bandName} first appeared at Notarealtown's annual music festival in ${year}, despite having been officially listed as "unavailable..`,
    `In ${year}, ${bandName} achieved their first major review after a critic mistook a prolonged equipment failure for an ambitious artistic statement.`,
    `The first album by ${bandName} was recorded in ${year} after a studio technician accidentally activated the backup recording system and then went home.`,
    `In ${year}, ${bandName} became briefly notorious for an album that contained several minutes of silence followed by an apology.`,
    `${bandName} first gained a serious following in ${year}, when their songs began circulating among people who believed they had been banned.`,
    `In ${year}, ${bandName} were invited to participate in a radio experiment involving unusual frequencies. They were later asked not to do that again.`,
    `The band's history from ${year} onward was shaped by a simple administrative error that nobody discovered until the band had already become moderately successful.`,
    `In ${year}, ${bandName} developed a reputation for performing music that sounded as though it had been assembled from spare parts.`,
    `${bandName} first became associated with the phrase "relentless deadpan" in ${year}, although nobody remembers who said it first.`,
    `In ${year}, ${bandName} released a debut album after being mistakenly informed that they had already released one.`,
    `The members of ${bandName} first played together in ${year} because the actual performers had been delayed by a paperwork issue.`,
    `In ${year}, ${bandName} became unexpectedly popular after their music was used as temporary background audio for a software demonstration.`,
    `${bandName} first entered the public record in ${year}, when a clerk created a file for them under the assumption that they were a minor infrastructure project.`,
    `In ${year}, ${bandName} developed a performance style based on silence, repetition, and the refusal to acknowledge that anyone was watching.`,
    `The first major success of ${bandName} in ${year} came after their album was mistaken for a collection of lost recordings by a much older band.`,
    `In ${year}, ${bandName} became briefly famous for their refusal to perform in places with functioning clocks.`,
    `${bandName} first attracted attention in ${year} after a local radio station received their demo, played it once, and spent several years attempting to determine who had sent it.`,
    `In ${year}, ${bandName} released an album inspired by an administrative error. The error was corrected before the album was released, but the album remained.`,
    `The unusual career of ${bandName} began in ${year}, when an empty rehearsal room was accidentally assigned to a group of musicians who had not yet formed a band.`,
    `In ${year}, ${bandName} became a minor cultural phenomenon after their name was printed on a series of municipal garbage-collection schedules.`,
    `${bandName} first became known for their refusal to repeat performances in ${year}, although their bookings were repeatedly renewed.`,
    `In ${year}, ${bandName} recorded a live album at a venue that had no live-audio recording equipment. The recording exists anyway.`,
    `The first public success of ${bandName} came in ${year}, when an audience applauded because they believed the performance had ended. The band took this as encouragement.`,
    `In ${year}, ${bandName} became associated with a particularly stubborn form of acoustic resonance that survived several attempts at soundproofing.`,
    `${bandName} first entered the national conversation in ${year}, when a columnist used them as an example of a band that could not be adequately explained.`,
    `In ${year}, ${bandName} were briefly hired to provide music for a corporate training program. The company later apologized to its employees.`,
    `The first surviving recording of ${bandName} dates to ${year}, although the recording itself claims to have been made in 1973.`,
    `In ${year}, ${bandName} became unexpectedly successful after a successful band's management accidentally mailed their own promotional materials using ${bandName}'s name.`,
    `${bandName} first gained attention in ${year} by producing music specifically designed to sound as though someone had forgotten to turn something off.`,
    `In ${year}, ${bandName} were mistaken for a conceptual art installation and left undisturbed in a museum for three weeks.`,
    `The formation of ${bandName} in ${year} was followed by a surprisingly efficient period of recording, touring, and paperwork that nobody has successfully repeated.`,
    `In ${year}, ${bandName} released a record that became a cult favorite among listeners who enjoyed music that seemed to have been approved by a committee.`,
    `${bandName} first achieved widespread recognition in ${year}, when their debut album was accidentally included in a shipment of educational materials.`,
    `In ${year}, ${bandName} developed a reputation for performing songs that were apparently about something, although nobody could identify what.`,
    `The first major profile of ${bandName}, published in ${year}, described them as "a stubborn acoustic phenomenon with management..`,
    `In ${year}, ${bandName} began performing at increasingly inappropriate events, including a retirement ceremony, a zoning hearing, and one very successful dog show.`,
    `${bandName} first became commercially viable in ${year}, after a record executive mistook their rehearsal for a demonstration of a new audio codec.`,
    `In ${year}, ${bandName} released a collection of recordings made before the band existed. The label considered this a marketing advantage.`,
    `The unlikely success of ${bandName} in ${year} was followed by an even more unlikely failure, after their distributor discovered that nobody had checked whether the album was actually playable.`,
    `In ${year}, ${bandName} became the subject of a local debate over whether they constituted a band, a nuisance, or an unusually persistent weather pattern.`,
    `${bandName} first appeared on a national radio program in ${year}, where they performed a song that the host introduced as "something we are legally required to play..`,
    `In ${year}, ${bandName} began using obsolete communications equipment as musical instruments, resulting in a sound that several telecommunications engineers found personally offensive.`,
    `The first album by ${bandName} was released in ${year} after a distributor accidentally received the band's rehearsal tapes instead of the intended product.`,
    `In ${year}, ${bandName} became briefly popular after their record was used as background music for a documentary about filing systems.`,
    `${bandName} first acquired a permanent following in ${year}, when a group of listeners began attending every performance solely to see whether the band would eventually explain itself.`,
    `In ${year}, ${bandName} were granted temporary residency at a venue that subsequently ceased to exist.`,
    `The story of ${bandName} in ${year} begins with a mistaken invoice and ends with a record contract that nobody can locate.`,
    `In ${year}, ${bandName} became known for their unusually long pauses between songs, during which several audience members completed unrelated errands.`,
    `${bandName} first achieved a degree of critical legitimacy in ${year}, when a respected journal published an article about them without realizing they were fictional.`,
    `In ${year}, ${bandName} recorded their first album using equipment borrowed from a laboratory that believed the band was conducting an acoustics experiment.`,
    `The members of ${bandName} reportedly became a functioning band in ${year}, although their drummer continued to describe the arrangement as temporary.`,
    `In ${year}, ${bandName} developed a reputation for songs that seemed unfinished until listeners realized they had been finished for several minutes.`,
    `${bandName} first became associated with the local music scene in ${year}, after their name appeared on a venue calendar beneath the heading "Miscellaneous..`,
    `In ${year}, ${bandName} were accidentally included in a citywide emergency notification and received their largest audience to date.`,
    `The first major recording session by ${bandName} in ${year} ended when the studio manager discovered that the musicians had been recording the wrong room.`,
    `In ${year}, ${bandName} released an album whose principal theme was administrative uncertainty. The album itself was distributed to the wrong addresses.`,
    `${bandName} first attracted a following in ${year} after a local journalist described their music as "difficult to classify but easy to locate..`,
    `In ${year}, ${bandName} became briefly famous after their music was used to test a newly installed municipal loudspeaker system.`,
    `The career of ${bandName} began in ${year} with a rehearsal that nobody attended and a performance that nobody had scheduled.`,
    `In ${year}, ${bandName} were mistakenly identified as a successful band from another decade. They have made no effort to correct the misconception.`,
    `${bandName} first achieved commercial success in ${year} after their distributor accidentally labeled their album "Previously Popular..`,
    `In ${year}, ${bandName} began a period of recording activity characterized by obsolete equipment, inadequate ventilation, and increasingly specific references to municipal procedure.`,
    `The first surviving press photograph of ${bandName}, taken in ${year}, contains no members of the band but does contain their equipment.`,
    `In ${year}, ${bandName} were asked to explain their artistic philosophy. They submitted a completed tax form instead.`,
    `${bandName} first gained attention in ${year} when a venue accidentally advertised their soundcheck as the main event.`,
    `In ${year}, ${bandName} became a minor local institution after nobody could determine how to formally dissolve them.`,
    `The origins of ${bandName} are generally associated with ${year}, although the band itself maintains that they simply "started happening..`,
    `In ${year}, ${bandName} released an album that was intended to be difficult. Unfortunately, the packaging was even more difficult.`,
    `${bandName} first became known for their stubborn refusal to explain themselves in ${year}, when a journalist asked a simple question and received a seven-minute silence.`,
    `In ${year}, ${bandName} became unexpectedly successful after a record store placed their album in the "Classics" section by mistake.`,
    `The first known appearance of ${bandName} in ${year} involved a stage, a microphone, and a sign reading "DO NOT OPERATE..`,
    `In ${year}, ${bandName} began experimenting with domestic appliances, eventually producing a song that caused three washing machines to enter diagnostic mode.`,
    `${bandName} first received significant press attention in ${year}, when an influential magazine described them as "a promising administrative anomaly..`,
    `In ${year}, ${bandName} became briefly famous after their album was mistaken for a soundtrack to a film about an unrelated band.`,
    `The first major success of ${bandName} in ${year} was attributed to word of mouth, although the words involved were reportedly "what was that?.`,
    `In ${year}, ${bandName} began performing at increasingly prestigious venues, despite continuing to describe themselves as "temporarily available..`,
    `${bandName} first became a recognized musical concern in ${year}, when their accountant registered them as a limited liability company by accident.`,
    `In ${year}, ${bandName} released a record containing several tracks that were simply labeled "Maybe..`,
    `The unusual development of ${bandName} in ${year} followed an incident involving an obsolete telephone exchange, a missing suitcase, and a suspiciously competent drummer.`,
    `In ${year}, ${bandName} were invited to perform at a civic event and became unexpectedly popular with the committee responsible for approving parking permits.`,
    `${bandName} first became difficult to classify in ${year}, after incorporating office equipment, acoustic feedback, and several forms of paperwork into their live performances.`,
    `In ${year}, ${bandName} released their most ambitious album to date, despite the album being their first.`,
    `The first documented appearance of ${bandName} occurred in ${year}, although the accompanying paperwork identifies them as "an unidentified acoustic gathering..`,
    `In ${year}, ${bandName} achieved brief success after a newspaper reviewer accidentally described them as "essential..`,
    `${bandName} first gained a reputation for relentless performances in ${year}, when a venue's closing staff repeatedly asked them to stop painting their elbows.`,
  ];
  const bandBio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];

  // Dynamic Typography & Composition Engine
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

  // Dynamically adapt React typography layout to the selected backdrop to avoid clashing
  let titleLayout: TitleComposition;
  if (combo.backdrop === 'split_horizon' || combo.backdrop === 'desert_horizon') {
    titleLayout = 'top-arc'; // Keep in sky above horizon
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

  // Randomize skew tailored to composition
  let skewDeg = 0;
  if (titleLayout === 'top-arc') {
    skewDeg = -Math.floor(Math.random() * 11) - 5; // -15° to -5°
  } else if (titleLayout === 'diagonal-cross') {
    const mag = Math.floor(Math.random() * 8) + 11; // 11° to 18°
    skewDeg = Math.random() > 0.5 ? mag : -mag; // -18° to +18°
  } else if (titleLayout === 'split-corners') {
    skewDeg = Math.floor(Math.random() * 9) - 4; // -4° to +4°
  } else {
    // bottom-banner: heavy horizontal banner along lower margin
    skewDeg = Math.floor(Math.random() * 5) - 2; // -2° to +2°
  }

  // Pre-fetch only the 2 assets chosen for this specific album
  await loadRecipeAssets(String(combo.backdrop), String(combo.subject));

  // Inject the chosen typography layout into the recipe so the canvas can dodge it
  recipe.titleLayout = titleLayout;

  // Render HTML5 Canvas Cover directly (<50ms)
  const coverImageUrl = gagCanvasEngine.renderCover(
    bandName,
    albumTitle,
    recipe
  );

  // In split-corners, 1 sticker is ideal so the title badges don't get crowded
  let stickerCount = titleLayout === 'split-corners' ? 1 : (Math.random() > 0.4 ? 2 : 1);
  if (forceNoStickers) stickerCount = 0; // Strip hype stickers for minimalist covers

  // Shuffle pools so sticker 0 and sticker 1 never share the same text or color
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
      position: 'bottom-left', // Dynamically routed by VinylSleeve layout router
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
