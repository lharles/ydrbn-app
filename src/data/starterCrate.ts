/**
 * Pre-Seeded Starter Crate
 * 16 classic original entries curated directly from "Random Band Names Volume One"
 *
 * Every single entry has an entirely unique combination of [Backdrop, Subject, Modifier, Palette]
 * to ensure zero visual duplication across the starter crate.
 */

import {
  AlbumEntry,
  CanvasRecipe,
  HypeSticker,
  TitleFontFamily,
  TitleShadowStyle,
  TitleComposition,
} from '../types';
import { gagCanvasEngine } from '../services/gagCanvasEngine';

export interface StarterCrateDefinition {
  id: string;
  bandName: string;
  albumTitle: string;
  year: string;
  catalogNumber: string;
  skewDeg: number;
  tracks: string[];
  fauxReviews: string[];
  bandBio: string;
  recipe: CanvasRecipe;
  stickers: HypeSticker[];
  audioPreset: 'psych-rock' | 'analog-synth' | 'krautrock' | 'ambient-drone' | 'post-punk';
  fontFamily: TitleFontFamily;
  textColor: string;
  shadowStyle: TitleShadowStyle;
  titleLayout: TitleComposition;
}

export const STARTER_CRATE_DEFINITIONS: StarterCrateDefinition[] = [
  // 1. Quantum Pastries | Roll
  // (Layer 1: minimal_box | Layer 2: atomic_orbits | Layer 3: celestial_glow)
  {
    id: 'starter-01-quantum-pastries',
    bandName: 'Quantum Pastries',
    albumTitle: 'Roll',
    year: '1974',
    catalogNumber: 'YDR-1974-STEREO',
    skewDeg: -8,
    fontFamily: 'bubble',
    textColor: '#fde047',
    shadowStyle: 'harsh-black',
    titleLayout: 'top-arc',
    tracks: [
      'Subatomic Cinnamon',
      'The Glaze Uncertainty Principle',
      'Wave-Particle Brioche',
      'Pastry Half-Life',
      'Thermodynamic Yeast',
      'Electron Orbital Danish',
      'Planck Length Croissant',
    ],
    fauxReviews: [
      '"Deliciously confusing; a milestone in theoretical bakery rock." — Melody Maker',
      '"They played a 17-minute solo using a powdered sugar sifter." — Sounds',
    ],
    bandBio:
      'Formed in the physics faculty kitchen at Cambridge in 1972, Quantum Pastries pioneered the collision of thermal dough dynamics with fuzz guitar. Their legendary second tour ended when their amplifier blew up after being stuffed with puff pastry.',
    recipe: {
      backdrop: 'minimal_box',
      subject: 'atomic_orbits',
      modifier: 'celestial_glow',
      palette: 'Mint & Lavender',
      focalItem: 'Cinnamon Roll',
    },
    stickers: [
      {
        id: 'stk-1',
        text: 'FEATURING HIT SINGLE "ROLL"',
        type: 'rect',
        bg: '#ef4444',
        color: '#ffffff',
        border: '#ffffff',
        rotation: 4,
        position: 'bottom-right',
      },
    ],
    audioPreset: 'psych-rock',
  },

  // 2. Pantaloons on the Porch | Trousers in the Wind
  // (Layer 1: split_horizon | Layer 2: clothesline_pants | Layer 3: none)
  {
    id: 'starter-02-pantaloons-on-the-porch',
    bandName: 'Pantaloons on the Porch',
    albumTitle: 'Trousers in the Wind',
    year: '1972',
    catalogNumber: 'YDR-1972-STEREO',
    skewDeg: -12,
    fontFamily: 'medieval',
    textColor: '#ffedd5',
    shadowStyle: 'retro-bevel',
    titleLayout: 'diagonal-cross',
    tracks: [
      'Gale Force Corduroy',
      'Flapping in G Minor',
      'The Wooden Clothespin Dirge',
      'Starching the Atmosphere',
      'Hemline Vertigo',
      'Creased in the Tempest',
      'Airing the Linen',
    ],
    fauxReviews: [
      '"A windy, fluttering masterpiece of rustic English eccentricity." — NME',
      '"Sounds like four pairs of wet trousers slapping against a microphone." — Melody Maker',
    ],
    bandBio:
      'Pantaloons on the Porch rehearsed exclusively in the back garden of an abandoned vicarage in Sussex. They refused to play indoors, claiming that the lack of crosswinds dampened their vocal resonance.',
    recipe: {
      backdrop: 'split_horizon',
      subject: 'clothesline_pants',
      modifier: 'none',
      palette: '70s Earth',
      focalItem: 'Pantaloons on Clothesline',
    },
    stickers: [
      {
        id: 'stk-2',
        text: 'AUTHENTIC SUSSEX PRESSING',
        type: 'circle',
        bg: '#f59e0b',
        color: '#000000',
        border: '#ffffff',
        rotation: -8,
        position: 'top-left',
      },
    ],
    audioPreset: 'psych-rock',
  },

  // 3. Owie Elbow | Tendonitis
  // (Layer 1: vintage_parchment | Layer 2: anatomical_part | Layer 3: adhesive_bandage)
  {
    id: 'starter-03-owie-elbow',
    bandName: 'Owie Elbow',
    albumTitle: 'Tendonitis',
    year: '1977',
    catalogNumber: 'YDR-1977-STEREO',
    skewDeg: 4,
    fontFamily: 'comic',
    textColor: '#fecdd3',
    shadowStyle: 'chromatic-3d',
    titleLayout: 'split-corners',
    tracks: [
      'Acute Inflammation',
      'The Tennis Arm Blues',
      'Cortisone Shuffle',
      'Ice Pack Serenade',
      'The Clicking Joint',
      'Elastic Bandage Boogie',
      'Rest and Elevate',
    ],
    fauxReviews: [
      '"Pungent with the smell of horse liniment and feedback." — Sounds',
      '"A sprained, painful tour-de-force of pub-rock injury." — Trouser Press',
    ],
    bandBio:
      'Formed by three retired darts champions and a physiotherapist in Newcastle. Every song was written in the waiting room of the Royal Victoria Infirmary orthopedic ward.',
    recipe: {
      backdrop: 'vintage_parchment',
      subject: 'anatomical_part',
      modifier: 'adhesive_bandage',
      palette: 'Vintage Studio',
      focalItem: 'Elbow Joint',
      subLabel: 'OWIE',
    },
    stickers: [
      {
        id: 'stk-4',
        text: 'INCLUDES FREE FIRST AID PAMPHLET',
        type: 'rect',
        bg: '#10b981',
        color: '#ffffff',
        border: '#000000',
        rotation: -6,
        position: 'top-right',
      },
    ],
    audioPreset: 'post-punk',
  },

  // 4. Trumped By Cheese | Full House
  // (Layer 1: minimal_box | Layer 2: playing_cards + cheese_wedge | Layer 3: none)
  {
    id: 'starter-04-trumped-by-cheese',
    bandName: 'Trumped By Cheese',
    albumTitle: 'Full House',
    year: '1975',
    catalogNumber: 'YDR-1975-STEREO',
    skewDeg: -6,
    fontFamily: 'chrome',
    textColor: '#fef08a',
    shadowStyle: 'harsh-black',
    titleLayout: 'top-arc',
    tracks: [
      'The Royal Flush of Cheddar',
      'Pocket Aces, Gouda River',
      'Ante Up (Swiss Cut)',
      'Gambling With Lactose',
      'Bluffing The Fromagerie',
      'Fold On The Roquefort',
      'Casino Fondue',
    ],
    fauxReviews: [
      '"A high-stakes gamble where dairy always triumphs over cards." — Melody Maker',
      '"A pungent, greasy masterpiece of pub-rock absurdity." — NME',
    ],
    bandBio:
      'Legend has it the quartet was formed after an all-night poker tournament in Leeds was violently interrupted when a 12-pound wheel of mature Lancashire rolled onto the table and ruined three straights. They played exclusively in dairy aprons.',
    recipe: {
      backdrop: 'minimal_box',
      subject: 'playing_cards',
      modifier: 'none',
      palette: '70s Earth',
      focalItem: 'cheese on cards',
    },
    stickers: [
      {
        id: 'stk-5',
        text: 'HIGH STAKES DAIRY EDITION',
        type: 'square',
        bg: '#f59e0b',
        color: '#000000',
        border: '#000000',
        rotation: 4,
        position: 'bottom-left',
      },
    ],
    audioPreset: 'psych-rock',
  },

  // 5. Frankfurter Denial | Not A Frankfurter
  // (Layer 1: split_horizon | Layer 2: soup_bowl | Layer 3: speech_bubble)
  {
    id: 'starter-05-frankfurter-denial',
    bandName: 'Frankfurter Denial',
    albumTitle: 'Not A Frankfurter',
    year: '1981',
    catalogNumber: 'YDR-1981-STEREO',
    skewDeg: -14,
    fontFamily: 'comic',
    textColor: '#fef08a',
    shadowStyle: 'neon-glow',
    titleLayout: 'diagonal-cross',
    tracks: [
      "It's NOT a Frankfurter",
      'Cylindrical Misconception',
      'Mustard Is Optional',
      'Grill Surface Delusion',
      'The Cured Meat Myth',
      'Do Not Eat That',
      'Definitely A Sock',
    ],
    fauxReviews: [
      '"An acoustic existential crisis dressed in a bun." — Rolling Stone',
      '"They insisted their guitars were actually cucumbers throughout the interview." — Sounds',
    ],
    bandBio:
      'Formed by disillusioned art students in Hamburg, Frankfurter Denial built an entire career on steadfastly refusing to acknowledge the presence of processed meats in their songs or stage setup. Their debut single sold out in twenty-four minutes.',
    recipe: {
      backdrop: 'split_horizon',
      subject: 'soup_bowl',
      modifier: 'speech_bubble',
      speechText: "IT'S NOT A FRANKFURTER!",
      palette: 'Vintage Studio',
    },
    stickers: [
      {
        id: 'stk-6',
        text: 'BANNED IN MUNICH BUTCHERS',
        type: 'rect',
        bg: '#ef4444',
        color: '#ffffff',
        border: '#ffffff',
        rotation: -5,
        position: 'top-left',
      },
    ],
    audioPreset: 'post-punk',
  },

  // 6. Intergalactic Toilet | The Cosmic Bowels
  // (Layer 1: deep_space | Layer 2: porcelain_fixture | Layer 3: celestial_glow)
  {
    id: 'starter-06-intergalactic-toilet',
    bandName: 'Intergalactic Toilet',
    albumTitle: 'The Cosmic Bowels',
    year: '1973',
    catalogNumber: 'YDR-1973-STEREO',
    skewDeg: 0,
    fontFamily: 'bubble',
    textColor: '#67e8f9',
    shadowStyle: 'neon-glow',
    titleLayout: 'bottom-banner',
    tracks: [
      'Zero Gravity Flush',
      'Orbital Cistern Sonata',
      'The Black Hole Siphon',
      'Event Horizon Plumbing',
      'Porcelain Nebula',
      'Cosmic Plunger Theme',
      'Drifting Past Neptune',
    ],
    fauxReviews: [
      '"Pink Floyd would weep at the sheer cosmic reverb of this cistern." — NME',
      '"Space rock taken to its most literal, echoing domestic conclusion." — Melody Maker',
    ],
    bandBio:
      'Originally conceived inside a mobile recording truck outside Dartmoor, Intergalactic Toilet wired a contact microphone inside an operational ceramic water closet to produce the heavy subterranean rumble that defined space-rock in 1973.',
    recipe: {
      backdrop: 'deep_space',
      subject: 'porcelain_fixture',
      modifier: 'celestial_glow',
      palette: 'Psych Glow',
    },
    stickers: [
      {
        id: 'stk-7',
        text: 'FEATURING REVERSE GUITAR',
        type: 'circle',
        bg: '#06b6d4',
        color: '#000000',
        border: '#ffffff',
        rotation: 12,
        position: 'top-right',
      },
    ],
    audioPreset: 'krautrock',
  },

  // 7. Rust Flavored Soup | Plastic Spoons
  // (Layer 1: split_horizon | Layer 2: soup_bowl | Layer 3: none)
  {
    id: 'starter-07-rust-flavored-soup',
    bandName: 'Rust Flavored Soup',
    albumTitle: 'Plastic Spoons',
    year: '1978',
    catalogNumber: 'YDR-1978-STEREO',
    skewDeg: -5,
    fontFamily: 'marker',
    textColor: '#fed7aa',
    shadowStyle: 'harsh-black',
    titleLayout: 'split-corners',
    tracks: [
      'Iron Oxide Broth',
      'Stirring With White Plastic',
      'Corrosion Chowder',
      'Tetanus Bouillon',
      'Scraping The Bottom Of The Tin',
      'Metallic Aftertaste',
    ],
    fauxReviews: [
      '"Tastes like an old radiator; sounds like pure industrial brilliance." — Trouser Press',
      '"The rhythm section sounds like dropped cutlery in a scrapyard." — Sounds',
    ],
    bandBio:
      'Hailing from Birmingham metalworks, the band used rusted industrial iron girders and disposable picnic utensils as primary percussion. Their lead singer drank Lukewarm tomato soup from a rusted hubcap on stage every Friday night.',
    recipe: {
      backdrop: 'split_horizon',
      subject: 'soup_bowl',
      modifier: 'none',
      palette: '70s Earth',
    },
    stickers: [
      {
        id: 'stk-8',
        text: 'LIMITED EDITION STEREO',
        type: 'rect',
        bg: '#f97316',
        color: '#ffffff',
        border: '#000000',
        rotation: 5,
        position: 'bottom-right',
      },
    ],
    audioPreset: 'post-punk',
  },

  // 8. The Dog Will Eat It | Meatcake
  // (Layer 1: split_horizon | Layer 2: soup_bowl with meatcake plate | Layer 3: caution_stamp)
  // MUST NOT use the Sound Trebuchet monolith! Renders lawn horizon with meatcake mound on a plate.
  {
    id: 'starter-08-the-dog-will-eat-it',
    bandName: 'The Dog Will Eat It',
    albumTitle: 'Meatcake',
    year: '1976',
    catalogNumber: 'YDR-1976-STEREO',
    skewDeg: 14,
    fontFamily: 'marker',
    textColor: '#bef264',
    shadowStyle: 'retro-bevel',
    titleLayout: 'diagonal-cross',
    tracks: [
      'Fallen From The Counter',
      'Sniff Once, Ingest Whole',
      'The Mystery Gravy',
      'Lawn Foraging Blues',
      'Bone Meal Frosting',
      'Under The Table Vigil',
      'No Regrets (Gulp)',
    ],
    fauxReviews: [
      '"A coarse, unforgiving record that leaves hair on the living room rug." — Creem',
      '"Gloriously primitive garage punk dedicated to undiscriminating canine appetites." — NME',
    ],
    bandBio:
      'The band took their name from a Thanksgiving disaster in 1974 when a three-tier liver pate confection collapsed onto a shag carpet and was consumed in fourteen seconds by an English bulldog named Arthur. Arthur was subsequently credited as executive producer.',
    recipe: {
      backdrop: 'split_horizon',
      subject: 'soup_bowl',
      modifier: 'caution_stamp',
      focalItem: 'dog meatcake on plate',
      stampText: 'CANINE CERTIFIED',
      palette: '70s Earth',
    },
    stickers: [
      {
        id: 'stk-9',
        text: 'GUARANTEED UNREFINED',
        type: 'square',
        bg: '#84cc16',
        color: '#000000',
        border: '#000000',
        rotation: -8,
        position: 'top-left',
      },
    ],
    audioPreset: 'psych-rock',
  },

  // 9. Abrasive Abacus | Rub Vigorously
  // (Layer 1: drafting_grid | Layer 2: geometric_cube | Layer 3: caution_stamp)
  {
    id: 'starter-09-abrasive-abacus',
    bandName: 'Abrasive Abacus',
    albumTitle: 'Rub Vigorously',
    year: '1980',
    catalogNumber: 'YDR-1980-STEREO',
    skewDeg: 0,
    fontFamily: 'monospace',
    textColor: '#ffffff',
    shadowStyle: 'harsh-black',
    titleLayout: 'bottom-banner',
    tracks: [
      'Beads on Fire',
      'Frictional Arithmetic',
      'Sandpaper Sums',
      'Splinters in the Calculation',
      'Rapid Slide (Modulo 12)',
      'Erasing With Steel Wool',
    ],
    fauxReviews: [
      '"Mathematics has never caused so much second-degree friction." — Melody Maker',
      '"A synthesizer album driven strictly by wooden click-clack velocity." — Sounds',
    ],
    bandBio:
      'Formed by two disgruntled school bursars and a modular synthesizer technician, Abrasive Abacus built custom piezo-electric pickups into wooden counting frames. Live shows featured frenetic computational solos that left visible clouds of sawdust above the stage.',
    recipe: {
      backdrop: 'drafting_grid',
      subject: 'geometric_cube',
      modifier: 'caution_stamp',
      stampText: 'MEASURED IN CARROTS',
      palette: 'Psych Glow',
    },
    stickers: [
      {
        id: 'stk-10',
        text: 'ORIGINAL MASTER RECORDING',
        type: 'rect',
        bg: '#eab308',
        color: '#000000',
        border: '#ffffff',
        rotation: 3,
        position: 'top-right',
      },
    ],
    audioPreset: 'analog-synth',
  },

  // 10. Immediate Delay | Hurry Up And Wait
  // (Layer 1: radial_sunburst | Layer 2: clock_face | Layer 3: caution_stamp)
  {
    id: 'starter-10-immediate-delay',
    bandName: 'Immediate Delay',
    albumTitle: 'Hurry Up And Wait',
    year: '1975',
    catalogNumber: 'YDR-1975-STEREO',
    skewDeg: -10,
    fontFamily: 'chrome',
    textColor: '#fde047',
    shadowStyle: 'chromatic-3d',
    titleLayout: 'top-arc',
    tracks: [
      'Right Now (In Ten Minutes)',
      'The Waiting Room Echo',
      'Queue Here For The Queue',
      'Bureaucratic Cadenza',
      'Delayed Promptness',
      'Static Clockwork',
      'Cancel The Urgent Memo',
    ],
    fauxReviews: [
      '"The music starts precisely four beats after you expect it to, every single bar." — NME',
      '"A triumphant monument to missed connections and British railway scheduling." — Sounds',
    ],
    bandBio:
      'Known for scheduling soundchecks at noon and beginning their sets at 3:14 AM the next morning, Immediate Delay made tape loop delay units their central compositional device. Tape loops were strung around microphone stands stretching out into the venue parking lot.',
    recipe: {
      backdrop: 'radial_sunburst',
      subject: 'clock_face',
      modifier: 'caution_stamp',
      stampText: 'DELAYED',
      palette: '70s Earth',
    },
    stickers: [
      {
        id: 'stk-11',
        text: 'RECORDED IN REAL DELAY',
        type: 'circle',
        bg: '#a855f7',
        color: '#ffffff',
        border: '#000000',
        rotation: -10,
        position: 'bottom-left',
      },
    ],
    audioPreset: 'ambient-drone',
  },

  // 11. Former Clones | Ditto
  // (Layer 1: minimal_box | Layer 2: office_door | Layer 3: none)
  {
    id: 'starter-11-former-clones',
    bandName: 'Former Clones',
    albumTitle: 'Ditto',
    year: '1982',
    catalogNumber: 'YDR-1982-STEREO',
    skewDeg: 3,
    fontFamily: 'monospace',
    textColor: '#e0f2fe',
    shadowStyle: 'harsh-black',
    titleLayout: 'split-corners',
    tracks: [
      'Carbon Copy Shuffle',
      'Slight Variations in Genetic Drift',
      'The Original Was Better',
      'Mirror Phase Breakdown',
      'Photocopier Jam',
      'Who Is Who Tonight?',
    ],
    fauxReviews: [
      '"Four men who look completely identical playing four identical bass guitars." — Melody Maker',
      '"Deeply eerie new wave pop that gives the impression of playing itself." — Smash Hits',
    ],
    bandBio:
      'Former Clones dressed in identical grey flannel leisure suits and combed their side-partings at identical 38-degree angles. During television appearances, they frequently swapped instruments without anyone in the crew noticing.',
    recipe: {
      backdrop: 'minimal_box',
      subject: 'office_door',
      modifier: 'none',
      palette: 'Mint & Lavender',
    },
    stickers: [
      {
        id: 'stk-12',
        text: 'DUPLICATE COPY #0042',
        type: 'rect',
        bg: '#3b82f6',
        color: '#ffffff',
        border: '#000000',
        rotation: 4,
        position: 'top-left',
      },
    ],
    audioPreset: 'analog-synth',
  },

  // 12. Antidimensional Powder | Extraterrestrius
  // (Layer 1: drafting_grid | Layer 2: geometric_cube mosaic | Layer 3: celestial_glow)
  // MUST NOT use the concentric spiral! Renders a multi-colored geometric mosaic tile grid.
  {
    id: 'starter-12-antidimensional-powder',
    bandName: 'Antidimensional Powder',
    albumTitle: 'Extraterrestrius',
    year: '1971',
    catalogNumber: 'YDR-1971-STEREO',
    skewDeg: -15,
    fontFamily: 'bubble',
    textColor: '#f472b6',
    shadowStyle: 'neon-glow',
    titleLayout: 'diagonal-cross',
    tracks: [
      'Dissolving Into The 5th Wall',
      'Cosmic Talcum',
      'Inhaling Stardust',
      'The Geometry Inversion',
      'Blowing Away The Horizon',
      'Folded Space Mirage',
    ],
    fauxReviews: [
      '"A bewildering psychedelic haze that smells faintly of lavender and antimatter." — NME',
      '"A classic of Canterbury prog rock that refuses to occupy three dimensions." — Sounds',
    ],
    bandBio:
      'Formed during a 48-hour jam session in a converted windmill in Sussex, Antidimensional Powder claimed to have discovered an acoustic chord that could temporarily flatten three-dimensional objects into blueprints. Their bass player was never quite the same.',
    recipe: {
      backdrop: 'drafting_grid',
      subject: 'geometric_cube',
      modifier: 'celestial_glow',
      palette: 'Psych Glow',
    },
    stickers: [
      {
        id: 'stk-13',
        text: 'SURREALIST GOLD CERTIFIED',
        type: 'rect',
        bg: '#ec4899',
        color: '#ffffff',
        border: '#ffffff',
        rotation: -4,
        position: 'top-right',
      },
    ],
    audioPreset: 'krautrock',
  },

  // 13. Head Bored Foot Board | Insomnia
  // (Layer 1: deep_space | Layer 2: bed_insomnia | Layer 3: none)
  {
    id: 'starter-13-head-bored-foot-board',
    bandName: 'Head Bored Foot Board',
    albumTitle: 'Insomnia',
    year: '1979',
    catalogNumber: 'YDR-1979-STEREO',
    skewDeg: -7,
    fontFamily: 'medieval',
    textColor: '#f1f5f9',
    shadowStyle: 'harsh-black',
    titleLayout: 'top-arc',
    tracks: [
      '3:47 AM Staring Contest',
      'Creaking Bedsprings in E',
      'The Ceiling Pattern Monster',
      'Cold Side of The Pillow',
      'Wooden Slats Fracture',
      'Mattress Tag Paranoia',
    ],
    fauxReviews: [
      '"Tense, skeletal, and incapable of relaxing for even half a bar." — Trouser Press',
      '"Recorded directly on a four-track recorder resting on a rickety wooden headboard." — Sounds',
    ],
    bandBio:
      'Recorded entirely during severe sleep-deprivation experiments in an attic apartment above a nocturnal bakery. The band percussionist used an old pine footboard struck with rubber mallets to simulate the dull thud of an exhausted skull.',
    recipe: {
      backdrop: 'deep_space',
      subject: 'bed_insomnia',
      modifier: 'none',
      palette: 'Vintage Studio',
      focalItem: 'Bed Frame at 3:47',
    },
    stickers: [
      {
        id: 'stk-14',
        text: 'SLEEPLESS EDITION',
        type: 'square',
        bg: '#64748b',
        color: '#ffffff',
        border: '#ffffff',
        rotation: 6,
        position: 'bottom-left',
      },
    ],
    audioPreset: 'post-punk',
  },

  // 14. Canine Revolution | Blue Shock Collar
  // (Layer 1: diagonal_duotone | Layer 2: antique_tv | Layer 3: hazard_triangle)
  {
    id: 'starter-14-canine-revolution',
    bandName: 'Canine Revolution',
    albumTitle: 'Blue Shock Collar',
    year: '1980',
    catalogNumber: 'YDR-1980-STEREO',
    skewDeg: 16,
    fontFamily: 'chrome',
    textColor: '#93c5fd',
    shadowStyle: 'neon-glow',
    titleLayout: 'diagonal-cross',
    tracks: [
      'Barking At The Mailman (Reprise)',
      'Chewed Leash Freedom',
      'The Electronic Zap',
      'Suburban Dogpack Manifesto',
      'Snarl Frequency',
      'Running Past The Perimeter Wire',
      'Victory Howl',
    ],
    fauxReviews: [
      '"Raw, snapping punk energy with genuine rabid enthusiasm." — NME',
      '"A blistering assault on suburban leash laws and invisible electric fences." — Melody Maker',
    ],
    bandBio:
      'Canine Revolution rehearsed in a barn surrounded by six stray terriers who actively barked in time with the kick drum. Their live gigs were infamous for dog whistles wired into the PA system to confuse neighborhood pets within a three-mile radius.',
    recipe: {
      backdrop: 'diagonal_duotone',
      subject: 'antique_tv',
      modifier: 'hazard_triangle',
      palette: 'Psych Glow',
      focalItem: 'Shock Monitor',
    },
    stickers: [
      {
        id: 'stk-15',
        text: 'ELECTRIC CHARGE: 50,000V',
        type: 'rect',
        bg: '#3b82f6',
        color: '#ffffff',
        border: '#ffffff',
        rotation: -7,
        position: 'top-left',
      },
    ],
    audioPreset: 'post-punk',
  },

  // 15. Sound Trebuchet | Acoustic Siege
  // (Layer 1: split_horizon | Layer 2: classical_monolith | Layer 3: hazard_triangle)
  // Keeps the desert horizon and acoustic siege monolith!
  {
    id: 'starter-15-sound-trebuchet',
    bandName: 'Sound Trebuchet',
    albumTitle: 'Acoustic Siege',
    year: '1974',
    catalogNumber: 'YDR-1974-STEREO',
    skewDeg: -4,
    fontFamily: 'medieval',
    textColor: '#fef08a',
    shadowStyle: 'retro-bevel',
    titleLayout: 'split-corners',
    tracks: [
      'The Counterweight Drops',
      'Hurl The Minor Chord',
      'Crumbling Castles of Harmony',
      'Catapulted Crotchets',
      'Medieval Ballistics in Quad',
      'Breaching The Citadel Wall',
    ],
    fauxReviews: [
      '"A 100-ton siege weapon launching orchestral chords directly into the crowd." — Melody Maker',
      '"Heavy, pompous, and delightfully terrifying in its sheer mechanical velocity." — Sounds',
    ],
    bandBio:
      'Formed by historical reenactment enthusiasts who believed modern amplification was a poor substitute for medieval siege mechanics. Their stage shows featured a scale replica trebuchet that launched damp cabbage heads into the rear balcony.',
    recipe: {
      backdrop: 'split_horizon',
      subject: 'classical_monolith',
      modifier: 'hazard_triangle',
      palette: '70s Earth',
      focalItem: 'Acoustic Siege Monolith',
    },
    stickers: [
      {
        id: 'stk-16',
        text: 'AUDIOPHILE SIEGE PRESSING',
        type: 'rect',
        bg: '#78350f',
        color: '#ffffff',
        border: '#fde047',
        rotation: 4,
        position: 'bottom-right',
      },
    ],
    audioPreset: 'psych-rock',
  },

  // 16. Laminated Cheese | Sharp
  // (Layer 1: minimal_box | Layer 2: stack_slices | Layer 3: none)
  // Reserved for the cheese slices only.
  {
    id: 'starter-16-laminated-cheese',
    bandName: 'Laminated Cheese',
    albumTitle: 'Sharp',
    year: '1983',
    catalogNumber: 'YDR-1983-STEREO',
    skewDeg: 0,
    fontFamily: 'chrome',
    textColor: '#fde047',
    shadowStyle: 'harsh-black',
    titleLayout: 'bottom-banner',
    tracks: [
      'Individually Wrapped Singles',
      'Yellow Plastic Sheen',
      'Unpeeling The Cellophane',
      'Melted on Microwave 4',
      'The Sharpness Delusion',
      'Processed Precision',
      'Never Spoils in the Dark',
    ],
    fauxReviews: [
      '"Synthetic, glossy, and chemically preserved for the next thousand years." — Smash Hits',
      '"The tightest post-disco basslines ever committed to processed cheddar." — NME',
    ],
    bandBio:
      'Laminated Cheese wore airtight yellow latex jumpsuits to protect their skin from atmospheric oxidation. Their minimalist synth-funk was recorded using exclusively American plastic cheese slice packaging crinkled into dynamic microphones.',
    recipe: {
      backdrop: 'minimal_box',
      subject: 'stack_slices',
      modifier: 'none',
      palette: '70s Earth',
      focalItem: 'cheese slices',
    },
    stickers: [
      {
        id: 'stk-17',
        text: 'INDIVIDUALLY WRAPPED',
        type: 'square',
        bg: '#facc15',
        color: '#000000',
        border: '#000000',
        rotation: -4,
        position: 'top-right',
      },
    ],
    audioPreset: 'analog-synth',
  },
];

/**
 * Initializes and returns the full starter crate with rendered canvas covers
 */
export function getStarterCrateAlbums(): AlbumEntry[] {
  return STARTER_CRATE_DEFINITIONS.map((item, idx) => {
    // Render the procedural gag cover
    const coverImageUrl = gagCanvasEngine.renderCover(
      item.bandName,
      item.albumTitle,
      item.recipe
    );

    return {
      id: item.id,
      bandName: item.bandName,
      albumTitle: item.albumTitle,
      year: item.year,
      catalogNumber: item.catalogNumber,
      artDirectorPrompt: `Visual gag cover in Volume One aesthetic: ${item.bandName} - ${item.albumTitle}`,
      tracks: item.tracks,
      fauxReviews: item.fauxReviews,
      bandBio: item.bandBio,
      coverImageUrl,
      timestamp: Date.now() - (STARTER_CRATE_DEFINITIONS.length - idx) * 86400000,
      isFavorite: false,
      skewDeg: item.skewDeg,
      stickers: item.stickers,
      recipe: item.recipe,
      audioPreset: item.audioPreset,
      fontFamily: item.fontFamily,
      textColor: item.textColor,
      shadowStyle: item.shadowStyle,
      titleLayout: item.titleLayout,
    };
  });
}
