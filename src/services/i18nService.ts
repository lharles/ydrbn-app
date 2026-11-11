import { getPreferences } from './preferencesService';

export type SupportedLocale =
  | 'en'
  | 'es'
  | 'pt'
  | 'fr'
  | 'de'
  | 'id'
  | 'ja'
  | 'zh'
  | 'hi'
  | 'bn'
  | 'ur'
  | 'ar'
  | 'ru'
  | 'tlh'
  | 'pig';

export type LocalePreference = 'auto' | SupportedLocale;

export type GrammarFamily =
  | 'english'
  | 'romance'
  | 'germanic'
  | 'austronesian'
  | 'east-asian'
  | 'indic'
  | 'semitic'
  | 'slavic'
  | 'klingon'
  | 'pig-latin';

export interface LocalizedAlbumOverride {
  bandName: string;
  albumTitle: string;
  tracks: string[];
  fauxReviews: string[];
  bandBio: string;
  stickerText: string;
}

export interface LocalePack {
  code: SupportedLocale;
  shortBadge: string;
  nativeName: string;
  englishName: string;
  grammar: GrammarFamily;
  ui: {
    subtitle: string;
    today: string;
    flipToBack: string;
    flipToFront: string;
    spinAudio: string;
    stopAudio: string;
    customizeDrop: string;
    swapCoverArt: string;
    activeRecord: string;
    createNewCustomDrop: string;
    customDropDesc: string;
    newDropBtn: string;
    dailyDrop: string;
    dailyDropIn: string;
    pressingVinyl: string;
    devUnlocked: string;
    languageLabel: string;
    autoDevice: string;
  };
  canineRevolution: LocalizedAlbumOverride;
  words: {
    nouns: string[];
    adjectives: string[];
    adverbs: string[];
    ensembles: string[];
    singleWordTracks: string[];
    closers: string[];
    stickers: string[];
  };
  templates: {
    band: ((n1: string, n2: string, a1: string, a2: string, adv: string, ens: string) => string)[];
    album: ((n1: string, n2: string, a1: string, adv: string, ens: string, num: number) => string)[];
    tracks: ((n1: string, n2: string, a1: string, num: number) => string)[];
    reviews: ((a1: string, pub: string) => string)[];
    publications: string[];
    bio: (band: string, album: string, year: string, n1: string) => string;
  };
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  'en',
  'es',
  'pt',
  'fr',
  'de',
  'id',
  'ja',
  'zh',
  'hi',
  'bn',
  'ur',
  'ar',
  'ru',
  'tlh',
  'pig',
];

// Natural OS device locales eligible for automatic detection
const AUTO_DETECTABLE_LOCALES = new Set<SupportedLocale>([
  'en', 'es', 'pt', 'fr', 'de', 'id', 'ja', 'zh', 'hi', 'bn', 'ur', 'ar', 'ru',
]);

export function detectDeviceLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';
  const candidates =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || 'en'];

  for (const raw of candidates) {
    const prefix = (raw || '').toLowerCase().split(/[-_]/)[0];
    if (AUTO_DETECTABLE_LOCALES.has(prefix as SupportedLocale)) {
      return prefix as SupportedLocale;
    }
  }
  return 'en';
}

export function resolveActiveLocale(pref?: LocalePreference): SupportedLocale {
  const effective = pref || getPreferences().language || 'auto';
  if (effective === 'auto') {
    return detectDeviceLocale();
  }
  return SUPPORTED_LOCALES.includes(effective as SupportedLocale)
    ? (effective as SupportedLocale)
    : 'en';
}

// ============================================================================
// DETERMINISTIC PIG-LATIN CONVERTER (Preserves case, punctuation & acronyms)
// ============================================================================
const PRESERVE_TOKENS = new Set([
  'PWA', 'DPI', 'PNG', 'PNGs', 'JPEG', 'JPEGs', 'MP4', 'RPM', 'DNA', 'VIP',
  'ATJ', 'HI-FI', 'DEV', 'SKIP', 'OR', 'WA', 'HI', 'CO', 'CA', 'AZ', 'KS',
  'IL', 'IN', 'RI', 'NY', 'ME', 'UK', 'IE', 'OH', 'NJ', 'AK', 'VT', 'PA',
  'MA', 'WI', 'MI', 'TX', 'NV', 'NC', 'VA', 'MN', 'FL', 'IA', 'MO',
]);

function pigLatinSingleWord(word: string): string {
  if (word.length <= 1 || PRESERVE_TOKENS.has(word) || /\d/.test(word)) {
    return word;
  }
  const isAllCaps = word === word.toUpperCase() && word !== word.toLowerCase();
  const isTitleCase =
    word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();

  const lower = word.toLowerCase();
  let converted: string;

  if (/^[aeiou]/.test(lower)) {
    converted = `${lower}way`;
  } else {
    const m = lower.match(/^([^aeiou]+)(.*)$/);
    if (!m) return word;
    converted = `${m[2]}${m[1]}ay`;
  }

  if (isAllCaps) return converted.toUpperCase();
  if (isTitleCase) return converted.charAt(0).toUpperCase() + converted.slice(1);
  return converted;
}

export function toPigLatinText(input: string): string {
  if (!input || input.includes('Y.D.R.B.N.') && input.trim() === 'Y.D.R.B.N.') {
    return input;
  }
  // Protect Y.D.R.B.N. and YDRBN-DNA tokens
  const saved: string[] = [];
  const masked = input.replace(/Y\.D\.R\.B\.N\.|YDRBN-DNA:[A-Za-z0-9+/=%_-]+/g, (m) => {
    saved.push(m);
    return `__PIG_TOK_${saved.length - 1}__`;
  });

  const transformed = masked.replace(/[A-Za-z]+/g, (match) => pigLatinSingleWord(match));
  return transformed.replace(/__PIG_TOK_(\d+)__/g, (_, idx) => saved[Number(idx)] || '');
}

export function toPigLatinHtml(html: string): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((chunk) => (chunk.startsWith('<') ? chunk : toPigLatinText(chunk)))
    .join('');
}

// Romance gender agreement helpers ("noun:m" or "noun:f")
function splitGender(tagged: string): { word: string; gender: 'm' | 'f' } {
  const parts = tagged.split(':');
  return {
    word: parts[0],
    gender: parts[1] === 'f' ? 'f' : 'm',
  };
}

function agreeRomanceAdj(adj: string, gender: 'm' | 'f'): string {
  if (gender === 'f' && adj.endsWith('o')) {
    return `${adj.slice(0, -1)}a`;
  }
  return adj;
}

function agreeFrenchAdj(adj: string, gender: 'm' | 'f'): string {
  if (gender !== 'f') return adj;
  if (adj.endsWith('e') || adj.endsWith('x')) return adj;
  if (adj.endsWith('if')) return `${adj.slice(0, -2)}ive`;
  if (adj.endsWith('el')) return `${adj}le`;
  return `${adj}e`;
}

export const LOCALE_REGISTRY: Record<SupportedLocale, LocalePack> = {
  en: {
    code: 'en',
    shortBadge: 'EN',
    nativeName: 'English',
    englishName: 'English',
    grammar: 'english',
    ui: {
      subtitle: 'New random band daily • 100% Offline PWA',
      today: 'Today',
      flipToBack: 'Flip Sleeve',
      flipToFront: 'Front Cover',
      spinAudio: 'Spin Audio Clip',
      stopAudio: 'Stop Turntable',
      customizeDrop: 'Customize A Drop',
      swapCoverArt: '1. Swap Current Cover Art',
      activeRecord: 'Active Record',
      createNewCustomDrop: '2. Create New Custom Drop',
      customDropDesc: 'Mint a new standalone record or paste DNA.',
      newDropBtn: 'New Drop',
      dailyDrop: '⚡ DAILY DROP',
      dailyDropIn: 'DAILY DROP IN',
      pressingVinyl: 'PRESSING VINYL...',
      devUnlocked: '(DEV UNLOCKED)',
      languageLabel: 'Deck Language',
      autoDevice: 'Auto (Device)',
    },
    canineRevolution: {
      bandName: 'Canine Revolution',
      albumTitle: 'Blue Shock Collar',
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
      stickerText: 'ELECTRIC CHARGE: 50,000V',
    },
    words: { nouns: [], adjectives: [], adverbs: [], ensembles: [], singleWordTracks: [], closers: [], stickers: [] },
    templates: { band: [], album: [], tracks: [], reviews: [], publications: [], bio: () => '' },
  },

  es: {
    code: 'es',
    shortBadge: 'ES',
    nativeName: 'Español',
    englishName: 'Spanish',
    grammar: 'romance',
    ui: {
      subtitle: 'Banda aleatoria diaria • 100% sin conexión',
      today: 'Hoy',
      flipToBack: 'Voltear Funda',
      flipToFront: 'Portada',
      spinAudio: 'Girar Audio',
      stopAudio: 'Detener Plato',
      customizeDrop: 'Personalizar Lanzamiento',
      swapCoverArt: '1. Cambiar Arte Actual',
      activeRecord: 'Disco Activo',
      createNewCustomDrop: '2. Crear Disco Personalizado',
      customDropDesc: 'Prensa un disco nuevo o pega código ADN.',
      newDropBtn: 'Crear',
      dailyDrop: '⚡ DISCO DEL DÍA',
      dailyDropIn: 'PRÓXIMO EN',
      pressingVinyl: 'PRENSANDO VINILO...',
      devUnlocked: '(MODO DEV)',
      languageLabel: 'Idioma del Receptor',
      autoDevice: 'Auto (Dispositivo)',
    },
    canineRevolution: {
      bandName: 'Revolución Canina',
      albumTitle: 'Collar Eléctrico Azul',
      tracks: [
        'Ladrando al Cartero',
        'Correa Mordida',
        'Corrientazo',
        'Manifiesto de la Jauría',
        'Frecuencia de Gruñido',
        'Más Allá del Cerco',
        'Aullido Final',
      ],
      fauxReviews: [
        '"Energía punk cruda y mordaz con auténtico entusiasmo rabioso." — El Diario del Vinilo',
        '"Un asalto directo contra las leyes municipales de correas y cercas invisibles." — Gaceta Acústica',
      ],
      bandBio:
        'Revolución Canina ensayaba en un granero rodeado de seis terriers callejeros que ladraban al compás del bombo. Sus conciertos eran famosos por conectar silbatos ultrasónicos al sistema de sonido.',
      stickerText: 'CARGA ELÉCTRICA: 50.000V',
    },
    words: {
      nouns: [
        'Codo:m', 'Tostadora:f', 'Queso:m', 'Pantalón:m', 'Ábaco:m', 'Alcachofa:f',
        'Subcomité:m', 'Radiador:m', 'Cuchara:f', 'Tapacubos:m', 'Gnomo:m', 'Muela:f',
        'Yunque:m', 'Cactus:m', 'Imán:m', 'Ancla:f', 'Bombilla:f', 'Cráneo:m',
        'Corona:f', 'Sopa:f', 'Trámite:m', 'Engranaje:m', 'Termostato:m', 'Paraguas:m',
      ],
      adjectives: [
        'Irrazonable', 'Laminado', 'Abrasivo', 'Obsoleto', 'Redundante', 'Cuántico',
        'Subterráneo', 'Inconcluso', 'Descalibrado', 'Oxidado', 'Eléctrico', 'Provisional',
      ],
      adverbs: ['Terminalmente', 'Fundamentalmente', 'Ocasionalmente', 'Sospechosamente'],
      ensembles: ['Sindicato', 'Brigada', 'Orquesta', 'Comité', 'Trío', 'Consorcio'],
      singleWordTracks: ['Salto', 'Rebote', 'Estática', 'Vértigo', 'Fricción', 'Cortocircuito', 'Fuga', 'Pánico'],
      closers: ['Coda', 'Desvanecimiento', 'Salida', 'Telón', 'Epílogo'],
      stickers: ['¡INCLUYE ÉXITO MUNDIAL!', 'VINILO VIRGEN DE 180G', 'APROBADO POR EL SUBCOMITÉ'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
        (n1, _n2, a1) => {
          const g = splitGender(n1);
          return `${g.gender === 'f' ? 'La' : 'El'} ${g.word} ${agreeRomanceAdj(a1, g.gender)}`;
        },
        (n1, n2, _a1, _a2, _adv, ens) => `${ens} de ${splitGender(n1).word} y ${splitGender(n2).word}`,
        (n1, _n2, a1, _a2, adv) => `${adv} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
      ],
      album: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
        (n1, n2) => `${splitGender(n1).word} en el ${splitGender(n2).word}`,
        (n1, _n2, _a1, _adv, _ens, num) => `Formulario ${num}-B: ${splitGender(n1).word}`,
        (n1) => `El Problema del ${splitGender(n1).word}`,
      ],
      tracks: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
        (n1, _n2, _a1, num) => `${splitGender(n1).word} #${num}`,
        (n1) => `Blues del ${splitGender(n1).word}`,
        (n1, n2) => `${splitGender(n1).word} y ${splitGender(n2).word}`,
      ],
      reviews: [
        (a1, pub) => `"${a1}; una afrenta absoluta a la etiqueta de grabación convencional." — ${pub}`,
        (a1, pub) => `"${a1}; la sección rítmica parece estar apelando una multa municipal." — ${pub}`,
      ],
      publications: ['La Tribuna del Vinilo', 'Gaceta de Flumptown', 'Fidelidad Oscura'],
      bio: (band, album, year) =>
        `Formados en ${year} tras una disputa municipal de zonificación, ${band} grabaron todas las tomas en una sola noche, dejando "${album}" como su único prensado oficial.`,
    },
  },

  pt: {
    code: 'pt',
    shortBadge: 'PT',
    nativeName: 'Português',
    englishName: 'Portuguese',
    grammar: 'romance',
    ui: {
      subtitle: 'Banda aleatória diária • 100% Offline PWA',
      today: 'Hoje',
      flipToBack: 'Virar Capa',
      flipToFront: 'Capa Frontal',
      spinAudio: 'Tocar Faixa',
      stopAudio: 'Parar Vitrola',
      customizeDrop: 'Personalizar Disco',
      swapCoverArt: '1. Trocar Arte da Capa',
      activeRecord: 'Disco Ativo',
      createNewCustomDrop: '2. Criar Novo Disco',
      customDropDesc: 'Prense um novo vinil ou cole código DNA.',
      newDropBtn: 'Novo Disco',
      dailyDrop: '⚡ DISCO DO DIA',
      dailyDropIn: 'PRÓXIMO EM',
      pressingVinyl: 'PRENSANDO VINIL...',
      devUnlocked: '(MODO DEV)',
      languageLabel: 'Idioma do Aparelho',
      autoDevice: 'Auto (Dispositivo)',
    },
    canineRevolution: {
      bandName: 'Revolução Canina',
      albumTitle: 'Coleira de Choque Azul',
      tracks: [
        'Latindo para o Carteiro',
        'Guia Mastigada',
        'Curto-Circuito',
        'Manifesto da Matilha',
        'Frequência do Rosnado',
        'Além da Cerca Elétrica',
        'Uivo da Vitória',
      ],
      fauxReviews: [
        '"Energia punk crua com entusiasmo verdadeiramente indomável." — Tribuna do Vinil',
        '"Um ataque sonoro às leis suburbanas de coleiras e cercas invisíveis." — Gazeta Acústica',
      ],
      bandBio:
        'Revolução Canina ensaiava num celeiro cercado por seis terriers vira-latas que latiam no compasso do bumbo. Seus shows ficaram famosos pelos apitos de cachorro ligados à mesa de som.',
      stickerText: 'CARGA ELÉTRICA: 50.000V',
    },
    words: {
      nouns: [
        'Cotovelo:m', 'Torradeira:f', 'Queijo:m', 'Calça:f', 'Ábaco:m', 'Subcomitê:m',
        'Radiador:m', 'Colher:f', 'Calota:f', 'Molar:m', 'Bigorna:f', 'Cacto:m',
        'Ímã:m', 'Âncora:f', 'Lâmpada:f', 'Crânio:m', 'Coroa:f', 'Sopa:f', 'Termostato:m',
      ],
      adjectives: [
        'Irrazoável', 'Laminado', 'Abrasivo', 'Obsoleto', 'Redundante', 'Quântico',
        'Subterrâneo', 'Inconclusivo', 'Descalibrado', 'Enferrujado', 'Elétrico', 'Provisório',
      ],
      adverbs: ['Terminalmente', 'Fundamentalmente', 'Ocasionalmente', 'Suspeitamente'],
      ensembles: ['Sindicato', 'Brigada', 'Orquestra', 'Comitê', 'Trio', 'Consórcio'],
      singleWordTracks: ['Salto', 'Recuo', 'Estática', 'Vertigem', 'Atrito', 'Curto', 'Fuga', 'Pânico'],
      closers: ['Coda', 'Saída', 'Final', 'Epílogo'],
      stickers: ['INCLUI SUCESSO MUNDIAL!', 'VINIL VIRGEM 180G', 'APROVADO PELO SUBCOMITÊ'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
        (n1, n2, _a1, _a2, _adv, ens) => `${ens} de ${splitGender(n1).word} e ${splitGender(n2).word}`,
        (n1, _n2, a1, _a2, adv) => `${adv} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
      ],
      album: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
        (n1, n2) => `${splitGender(n1).word} com ${splitGender(n2).word}`,
        (n1, _n2, _a1, _adv, _ens, num) => `Formulário ${num}-B: ${splitGender(n1).word}`,
      ],
      tracks: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeRomanceAdj(a1, splitGender(n1).gender)}`,
        (n1, _n2, _a1, num) => `${splitGender(n1).word} #${num}`,
        (n1) => `Blues de ${splitGender(n1).word}`,
        (n1, n2) => `${splitGender(n1).word} & ${splitGender(n2).word}`,
      ],
      reviews: [
        (a1, pub) => `"${a1}; uma afronta completa à etiqueta de gravação convencional." — ${pub}`,
        (a1, pub) => `"${a1}; a cozinha rítmica parece recorrer de uma multa de zoneamento." — ${pub}`,
      ],
      publications: ['A Tribuna do Vinil', 'Gazeta de Flumptown', 'Fidelidade Obscura'],
      bio: (band, album, year) =>
        `Formado em ${year} após uma disputa de zoneamento em Flumptown, ${band} gravou todas as faixas numa única madrugada, deixando "${album}" como seu único registro oficial.`,
    },
  },

  fr: {
    code: 'fr',
    shortBadge: 'FR',
    nativeName: 'Français',
    englishName: 'French',
    grammar: 'romance',
    ui: {
      subtitle: 'Nouveau groupe chaque jour • PWA 100% Hors-Ligne',
      today: "Aujourd'hui",
      flipToBack: 'Retourner Pochette',
      flipToFront: 'Recto Pochette',
      spinAudio: 'Écouter Extrait',
      stopAudio: 'Arrêter Platine',
      customizeDrop: 'Personnaliser un Disque',
      swapCoverArt: '1. Changer la Pochette Actuelle',
      activeRecord: 'Disque Actif',
      createNewCustomDrop: '2. Créer un Disque sur Mesure',
      customDropDesc: 'Pressez un nouveau vinyle ou collez un code ADN.',
      newDropBtn: 'Nouveau',
      dailyDrop: '⚡ TIRAGE DU JOUR',
      dailyDropIn: 'PROCHAIN DANS',
      pressingVinyl: 'PRESSAGE EN COURS...',
      devUnlocked: '(MODE DEV)',
      languageLabel: 'Langue de la Platine',
      autoDevice: 'Auto (Appareil)',
    },
    canineRevolution: {
      bandName: 'Révolution Canine',
      albumTitle: 'Collier Électrique Bleu',
      tracks: [
        'Aboyer sur le Facteur',
        'Laisse Mâchonnée',
        'Décharge Électronique',
        'Manifeste de la Meute',
        'Fréquence de Grognement',
        'Au-Delà du Grillage',
        'Hurlement de Victoire',
      ],
      fauxReviews: [
        '"Une énergie punk brute et mordante d\'un enthousiasme enragé." — La Tribune du Vinyle',
        '"Un assaut sonore contre les arrêtés municipaux sur les laisses." — Gazette Acoustique',
      ],
      bandBio:
        'Révolution Canine répétait dans une grange entourée de six terriers errants qui aboyaient en rythme avec la grosse caisse. Leurs concerts étaient célèbres pour les sifflets à ultrasons branchés sur la sono.',
      stickerText: 'CHARGE ÉLECTRIQUE : 50 000 V',
    },
    words: {
      nouns: [
        'Coude:m', 'Grille-Pain:m', 'Fromage:m', 'Pantalon:m', 'Boulier:m', 'Artichaut:m',
        'Sous-Comité:m', 'Radiateur:m', 'Cuillère:f', 'Enjoliveur:m', 'Molaire:f', 'Enclume:f',
        'Cactus:m', 'Aimant:m', 'Ancre:f', 'Ampoule:f', 'Crâne:m', 'Couronne:f', 'Soupe:f',
      ],
      adjectives: [
        'Déraisonnable', 'Plastifié', 'Abrasif', 'Obsolète', 'Redondant', 'Quantique',
        'Souterrain', 'Inconclusif', 'Décalibré', 'Rouillé', 'Électrique', 'Provisoire',
      ],
      adverbs: ['Mortellement', 'Fondamentalement', 'Occasionnellement', 'Curieusement'],
      ensembles: ['Syndicat', 'Brigade', 'Orchestre', 'Comité', 'Trio', 'Consortium'],
      singleWordTracks: ['Saut', 'Recul', 'Statique', 'Vertige', 'Friction', 'Court-Circuit', 'Fuite', 'Panique'],
      closers: ['Coda', 'Fondu', 'Sortie', 'Rideau', 'Épilogue'],
      stickers: ['INCLUT LE TUBE MONDIAL !', 'VINYLE VIERGE 180G', 'APPROUVÉ PAR LE SOUS-COMITÉ'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeFrenchAdj(a1, splitGender(n1).gender)}`,
        (n1, _n2, a1) => {
          const g = splitGender(n1);
          return `${g.gender === 'f' ? 'La' : 'Le'} ${g.word} ${agreeFrenchAdj(a1, g.gender)}`;
        },
        (n1, n2, _a1, _a2, _adv, ens) => `${ens} de ${splitGender(n1).word} et ${splitGender(n2).word}`,
        (n1, _n2, a1, _a2, adv) => `${adv} ${agreeFrenchAdj(a1, splitGender(n1).gender)}`,
      ],
      album: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeFrenchAdj(a1, splitGender(n1).gender)}`,
        (n1, n2) => `${splitGender(n1).word} sur ${splitGender(n2).word}`,
        (n1, _n2, _a1, _adv, _ens, num) => `Formulaire ${num}-B : ${splitGender(n1).word}`,
      ],
      tracks: [
        (n1, _n2, a1) => `${splitGender(n1).word} ${agreeFrenchAdj(a1, splitGender(n1).gender)}`,
        (n1, _n2, _a1, num) => `${splitGender(n1).word} n°${num}`,
        (n1) => `Blues du ${splitGender(n1).word}`,
        (n1, n2) => `${splitGender(n1).word} & ${splitGender(n2).word}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} ; un affront absolu aux règles élémentaires du studio." — ${pub}`,
        (a1, pub) => `"${a1} ; la section rythmique semble contester un arrêté d'urbanisme." — ${pub}`,
      ],
      publications: ['La Tribune du Vinyle', 'La Gazette de Flumptown', 'Fidélité Obscure'],
      bio: (band, album, year) =>
        `Formé en ${year} suite à un litige cadastral non résolu, ${band} a enregistré l'intégralité de ses bandes en une seule nuit, laissant « ${album} » comme unique pressage officiel.`,
    },
  },

  de: {
    code: 'de',
    shortBadge: 'DE',
    nativeName: 'Deutsch',
    englishName: 'German',
    grammar: 'germanic',
    ui: {
      subtitle: 'Täglich eine neue Band • 100% Offline-PWA',
      today: 'Heute',
      flipToBack: 'Hülle Wenden',
      flipToFront: 'Vorderseite',
      spinAudio: 'Platte Abspielen',
      stopAudio: 'Plattenspieler Stopp',
      customizeDrop: 'Platte Anpassen',
      swapCoverArt: '1. Aktuelles Cover Ändern',
      activeRecord: 'Aktive Platte',
      createNewCustomDrop: '2. Eigene Pressung Erstellen',
      customDropDesc: 'Neue Einzelplatte pressen oder DNA-Code einfügen.',
      newDropBtn: 'Neu Pressen',
      dailyDrop: '⚡ TAGES-PRESSUNG',
      dailyDropIn: 'NÄCHSTE IN',
      pressingVinyl: 'VINYL WIRD GEPRESST...',
      devUnlocked: '(DEV-MODUS)',
      languageLabel: 'Gerätesprache',
      autoDevice: 'Auto (Gerät)',
    },
    canineRevolution: {
      bandName: 'Hunde-Revolution',
      albumTitle: 'Blaues Stromhalsband',
      tracks: [
        'Den Briefträger Anbellen',
        'Zerkaute Leine',
        'Elektrischer Schlag',
        'Vorstadt-Rudel-Manifest',
        'Knurr-Frequenz',
        'Hinter dem Zaun',
        'Siegesgeheul',
      ],
      fauxReviews: [
        '"Rohe, bissige Punk-Energie mit echtem tollwütigem Enthusiasmus." — Vinyl-Tribüne',
        '"Ein Frontalangriff auf Vorstadt-Leinenzwang und unsichtbare Zäune." — Akustik-Monatsblatt',
      ],
      bandBio:
        'Hunde-Revolution probten in einer Scheune, umgeben von sechs streunenden Terriern, die exakt im Takt der Bassdrum bellten. Ihre Konzerte waren berüchtigt für Hundepfeifen am Mischpult.',
      stickerText: 'HOCHSPANNUNG: 50.000V',
    },
    words: {
      nouns: [
        'Ellbogen', 'Toaster', 'Käse', 'Hose', 'Abakus', 'Unterausschuss',
        'Heizkörper', 'Gabel-Löffel', 'Radkappe', 'Backenzahn', 'Amboss', 'Kaktus',
        'Hufeisenmagnet', 'Anker', 'Glühbirne', 'Schädel', 'Krone', 'Suppe', 'Thermostat',
      ],
      adjectives: [
        'Unvernünftiger', 'Laminierter', 'Abrasiver', 'Veralteter', 'Redundanter', 'Quantenmechanischer',
        'Unterirdischer', 'Unkalibrierter', 'Rostiger', 'Elektrischer', 'Provisorischer',
      ],
      adverbs: ['Endgültig', 'Grundsätzlich', 'Gelegentlich', 'Verdächtig'],
      ensembles: ['Syndikat', 'Brigade', 'Orchester', 'Ausschuss', 'Trio', 'Konsortium'],
      singleWordTracks: ['Sprung', 'Rückstoß', 'Statik', 'Schwindel', 'Reibung', 'Kurzschluss', 'Flucht', 'Panik'],
      closers: ['Koda', 'Ausblendung', 'Abgang', 'Vorhang'],
      stickers: ['INKLUSIVE WELTHIT!', '180G AUDIOPHILES VINYL', 'VOM AUSSCHUSS GENEHMIGT'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, n2, _a1, _a2, _adv, ens) => `${n1}-${n2}-${ens}`,
        (n1, n2) => `${n1} & ${n2}`,
        (n1, _n2, a1, _a2, adv) => `${adv} ${a1} ${n1}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, n2) => `${n1} im ${n2}`,
        (n1, _n2, _a1, _adv, _ens, num) => `Formular ${num}-B: ${n1}`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, _a1, num) => `${n1} Nr. ${num}`,
        (n1) => `${n1}-Blues`,
        (n1, n2) => `${n1} und ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} Klangversuch; ein direkter Affront gegen jede Studio-Etikette." — ${pub}`,
        (a1, pub) => `"${a1} Rhythmus; das Schlagzeug klingt wie ein Bauamts-Einspruch." — ${pub}`,
      ],
      publications: ['Die Vinyl-Tribüne', 'Flumptown-Anzeiger', 'Obskure Hi-Fi'],
      bio: (band, album, year) =>
        `Gegründet ${year} nach einem ungelösten Bebauungsplan-Streit, nahmen ${band} das gesamte Album in einer einzigen Nachtschicht auf und hinterließen „${album}“ als einzige offizielle Pressung.`,
    },
  },

  id: {
    code: 'id',
    shortBadge: 'ID',
    nativeName: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    grammar: 'austronesian',
    ui: {
      subtitle: 'Band acak baru setiap hari • 100% PWA Offline',
      today: 'Hari Ini',
      flipToBack: 'Balik Sampul',
      flipToFront: 'Sampul Depan',
      spinAudio: 'Putar Klip Audio',
      stopAudio: 'Hentikan Turntable',
      customizeDrop: 'Kustomisasi Rilisan',
      swapCoverArt: '1. Ganti Sampul Saat Ini',
      activeRecord: 'Piringan Aktif',
      createNewCustomDrop: '2. Buat Rilisan Kustom Baru',
      customDropDesc: 'Cetak piringan hitam baru atau tempel kode DNA.',
      newDropBtn: 'Buat Baru',
      dailyDrop: '⚡ RILISAN HARIAN',
      dailyDropIn: 'RILISAN BERIKUTNYA',
      pressingVinyl: 'MENCETAK VINIL...',
      devUnlocked: '(MODE DEV)',
      languageLabel: 'Bahasa Dek',
      autoDevice: 'Otomatis (Perangkat)',
    },
    canineRevolution: {
      bandName: 'Revolusi Anjing',
      albumTitle: 'Kalung Kejut Biru',
      tracks: [
        'Menggonggong pada Pak Pos',
        'Tali Kekang Terkoyak',
        'Sengatan Elektronik',
        'Manifesto Kawanan Pinggiran',
        'Frekuensi Geraman',
        'Melintasi Kawat Batas',
        'Lolongan Kemenangan',
      ],
      fauxReviews: [
        '"Energi punk mentah dan menggigit dengan antusiasme liar." — Tribun Vinil',
        '"Serangan sonik terhadap aturan tali kekang dan pagar listrik tak kasatmata." — Warta Akustik',
      ],
      bandBio:
        'Revolusi Anjing berlatih di sebuah gudang tua yang dikelilingi enam anjing terrier liar yang menggonggong mengikuti ketukan drum. Konser mereka terkenal karena peluit anjing yang disambungkan ke pengeras suara.',
      stickerText: 'MUATAN LISTRIK: 50.000V',
    },
    words: {
      nouns: [
        'Siku', 'Pemanggang Roti', 'Keju', 'Celana', 'Sempoa', 'Subkomite',
        'Radiator', 'Sendok Garpu', 'Tutup Velg', 'Gigi Geraham', 'Paron', 'Kaktus',
        'Magnet Tapal Kuda', 'Jangkar', 'Bohlam', 'Tengkorak', 'Mahkota', 'Sup', 'Termostat',
      ],
      adjectives: [
        'Tidak Masuk Akal', 'Berlaminasi', 'Kasar', 'Usang', 'Berlebihan', 'Kuantum',
        'Bawah Tanah', 'Belum Dikalibrasi', 'Berkarat', 'Elektrik', 'Sementara',
      ],
      adverbs: ['Secara Terminal', 'Secara Fundamental', 'Kadang-Kadang', 'Mencurigakan'],
      ensembles: ['Sindikat', 'Brigade', 'Orkestra', 'Komite', 'Trio', 'Konsorsium'],
      singleWordTracks: ['Lompat', 'Pantul', 'Statis', 'Vertigo', 'Gesekan', 'Korsleting', 'Kabur', 'Panik'],
      closers: ['Koda', 'Memudar', 'Keluar', 'Tirai Akhir'],
      stickers: ['TERMASUK LAGU HIT!', 'VINIL MURNI 180G', 'DISETUJUI SUBKOMITE'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, n2, _a1, _a2, _adv, ens) => `${ens} ${n1} & ${n2}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${ens} ${n1} ${a1}`,
      ],
      album: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, n2) => `${n1} di Atas ${n2}`,
        (n1, _n2, _a1, _adv, _ens, num) => `Formulir ${num}-B: ${n1}`,
      ],
      tracks: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, _n2, _a1, num) => `${n1} #${num}`,
        (n1) => `Blues ${n1}`,
        (n1, n2) => `${n1} dan ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1}; sebuah penghinaan mutlak terhadap etika rekaman konvensional." — ${pub}`,
        (a1, pub) => `"${a1}; seksi ritme terdengar seperti sedang mengajukan banding tata kota." — ${pub}`,
      ],
      publications: ['Tribun Vinil', 'Warta Flumptown', 'Fidelitas Samar'],
      bio: (band, album, year) =>
        `Dibentuk pada tahun ${year} setelah sengketa tata ruang kota yang tak kunjung usai, ${band} merekam seluruh materi dalam satu malam dan meninggalkan "${album}" sebagai satu-satunya rilisan fisik resmi mereka.`,
    },
  },

  ja: {
    code: 'ja',
    shortBadge: 'JA',
    nativeName: '日本語',
    englishName: 'Japanese',
    grammar: 'east-asian',
    ui: {
      subtitle: '毎日新しい架空バンド • 完全オフラインPWA',
      today: '今日',
      flipToBack: '裏面を見る',
      flipToFront: '表面を見る',
      spinAudio: 'レコード再生',
      stopAudio: '再生停止',
      customizeDrop: 'カスタム制作',
      swapCoverArt: '1. ジャケット写真を変更',
      activeRecord: '現在のレコード',
      createNewCustomDrop: '2. 新規カスタムレコード作成',
      customDropDesc: 'オリジナル盤のプレスまたはDNA復元',
      newDropBtn: '新規作成',
      dailyDrop: '⚡ 本日のドロップ',
      dailyDropIn: '次回ドロップまで',
      pressingVinyl: 'レコードをプレス中...',
      devUnlocked: '(開発モード)',
      languageLabel: '表示・生成言語',
      autoDevice: '自動 (端末設定)',
    },
    canineRevolution: {
      bandName: '犬の革命',
      albumTitle: '青い電気首輪',
      tracks: [
        '郵便配達員への咆哮',
        '噛み切られたリード',
        '電撃パルス',
        '郊外野良犬マニフェスト',
        '唸り声の周波数',
        '境界線を越えて',
        '勝利の遠吠え',
      ],
      fauxReviews: [
        '"本物の狂騒とパンクの衝動が詰まった怪作。" — ヴァイナル新報',
        '"郊外のリード条例と見えない電気柵への痛烈な音響攻撃。" — 月刊アコースティック',
      ],
      bandBio:
        '犬の革命は、バスドラムに合わせて吠える6匹の野良テリアに囲まれた納屋でリハーサルを行った。ライブではPAに犬笛を接続し、半径3マイルのペットを混乱させたことで知られる。',
      stickerText: '高電圧注意: 50,000V',
    },
    words: {
      nouns: [
        '肘', 'トースター', 'チーズ', 'ズボン', 'そろばん', 'ラジエーター',
        'スプーン', 'ホイールキャップ', '奥歯', '金床', 'サボテン', 'U字磁石',
        '錨', '電球', '頭蓋骨', '王冠', 'スープ', '書類棚', 'サーモスタット',
      ],
      adjectives: [
        '不合理な', 'ラミネート加工の', '摩耗した', '時代遅れの', '量子力学の',
        '地下室の', '未校正の', '錆びついた', '超次元の', '仮承認された',
      ],
      adverbs: ['致命的に', '根本的に', '理論上', '不審なほど'],
      ensembles: ['シンジケート', '旅団', '管弦楽団', '委員会', '三重奏団', '組合'],
      singleWordTracks: ['跳躍', '反動', '静電気', 'めまい', '摩擦', '短絡', '逃走', '閃光'],
      closers: ['コーダ', '終曲', 'フェードアウト', '閉幕'],
      stickers: ['大ヒット曲収録！', '180g重量盤ステレオ', '委員会承認済', '取扱注意：音楽収録'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1}${n1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${a1}${n1}${ens}`,
        (n1, n2) => `${n1}と${n2}`,
        (n1, _n2, _a1, _a2, _adv, ens) => `${n1}の${ens}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1}${n1}の研究`,
        (n1, n2) => `${n2}の上の${n1}`,
        (n1, _n2, _a1, _adv, _ens, num) => `様式${num}-B：${n1}`,
        (n1) => `${n1}に関する報告書`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1}${n1}`,
        (n1, _n2, _a1, num) => `${n1} 第${num}番`,
        (n1) => `真夜中の${n1}`,
        (n1, n2) => `${n1}・アンド・${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1}な音響実験。従来の録音マナーに対する完全な挑戦状である。" — ${pub}`,
        (a1, pub) => `"${a1}なグルーヴ。リズム隊が区画整理の異議申し立てをしているかのようだ。" — ${pub}`,
      ],
      publications: ['ヴァイナル新報', '月刊アコースティック', 'フランプタウン日報'],
      bio: (band, album, year) =>
        `${year}年、未解決の区画整理論争をきっかけに結成された「${band}」は、すべての録音をわずか一晩で強行し、唯一の公式プレス盤『${album}』を残して姿を消した。`,
    },
  },

  zh: {
    code: 'zh',
    shortBadge: 'ZH',
    nativeName: '中文',
    englishName: 'Mandarin',
    grammar: 'east-asian',
    ui: {
      subtitle: '每日随机乐队 • 100% 离线黑胶电台',
      today: '今日',
      flipToBack: '翻转封套',
      flipToFront: '正面封面',
      spinAudio: '播放黑胶片段',
      stopAudio: '停止唱机',
      customizeDrop: '自定义唱片',
      swapCoverArt: '1. 更换当前封面图片',
      activeRecord: '当前唱片',
      createNewCustomDrop: '2. 制作全新自定义唱片',
      customDropDesc: '压制独立新唱片或粘贴DNA代码',
      newDropBtn: '新建唱片',
      dailyDrop: '⚡ 今日唱片掉落',
      dailyDropIn: '距下次掉落',
      pressingVinyl: '正在压制黑胶...',
      devUnlocked: '(开发者模式)',
      languageLabel: '唱机界面语言',
      autoDevice: '自动 (跟随设备)',
    },
    canineRevolution: {
      bandName: '犬类革命',
      albumTitle: '蓝色电击项圈',
      tracks: [
        '向邮差狂吠',
        '咬断皮带',
        '高压电弧',
        '郊区野狗宣言',
        '咆哮频率',
        '冲破铁丝网',
        '胜利长嚎',
      ],
      fauxReviews: [
        '"原始而凌厉的朋克能量，充满真正狂热的律动。" — 黑胶论坛报',
        '"对郊区牵绳法规与隐形电子围栏的一次猛烈声学冲击。" — 月度声学',
      ],
      bandBio:
        '犬类革命在一个谷仓里排练，周围有六只流浪梗犬随着底鼓节奏狂吠。他们的现场演出因将高频狗哨接入扩音系统而声名远扬。',
      stickerText: '高压电击: 50,000V',
    },
    words: {
      nouns: [
        '手肘', '烤面包机', '奶酪', '长裤', '算盘', '散热器',
        '塑料勺', '轮毂盖', '臼齿', '铁砧', '仙人掌', '马蹄磁铁',
        '船锚', '白炽灯', '骷髅', '皇冠', '浓汤', '档案柜', '恒温器',
      ],
      adjectives: [
        '不合理的', '塑封的', '粗糙的', '过时的', '量子的',
        '地下室的', '未校准的', '生锈的', '跨维度的', '临时的',
      ],
      adverbs: ['极度', '从根本上', '理论上', '可疑地'],
      ensembles: ['辛迪加', '旅团', '管弦乐团', '委员会', '三重奏', '联合会'],
      singleWordTracks: ['跳跃', '回弹', '静电', '眩晕', '摩擦', '短路', '逃逸', '闪光'],
      closers: ['尾声', '谢幕', '渐弱', '终章'],
      stickers: ['收录冠军单曲！', '180克纯正黑胶', '委员会认证版', '注意：内含音乐'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1}${n1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${a1}${n1}${ens}`,
        (n1, n2) => `${n1}与${n2}`,
        (n1, _n2, _a1, _a2, _adv, ens) => `${n1}之${ens}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1}${n1}研究`,
        (n1, n2) => `${n2}上的${n1}`,
        (n1, _n2, _a1, _adv, _ens, num) => `第${num}-B号表格：${n1}`,
        (n1) => `关于${n1}的备忘录`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1}${n1}`,
        (n1, _n2, _a1, num) => `${n1} #${num}`,
        (n1) => `午夜${n1}`,
        (n1, n2) => `${n1}与${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1}声学实验；对传统录音礼仪的一次彻底颠覆。" — ${pub}`,
        (a1, pub) => `"${a1}律动；节奏组听起来像是在对市政规划提出上诉。" — ${pub}`,
      ],
      publications: ['黑胶论坛报', '月度声学', '弗兰普顿公报'],
      bio: (band, album, year) =>
        `成立于${year}年一次未解决的市政规划纠纷之后，${band}坚持在完全黑暗的地下室中完成了所有录音，仅留下《${album}》这张唯一获准发行的实体黑胶。`,
    },
  },

  hi: {
    code: 'hi',
    shortBadge: 'HI',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    grammar: 'indic',
    ui: {
      subtitle: 'रोज़ नया रैंडम बैंड • 100% ऑफ़लाइन PWA',
      today: 'आज',
      flipToBack: 'कवर पलटें',
      flipToFront: 'मुख्य कवर',
      spinAudio: 'ऑडियो चलाएँ',
      stopAudio: 'रिकॉर्ड रोकें',
      customizeDrop: 'कस्टम रिकॉर्ड बनाएँ',
      swapCoverArt: '1. वर्तमान कवर फोटो बदलें',
      activeRecord: 'सक्रिय रिकॉर्ड',
      createNewCustomDrop: '2. नया कस्टम ड्रॉप बनाएँ',
      customDropDesc: 'नया रिकॉर्ड बनाएँ या DNA कोड पेस्ट करें',
      newDropBtn: 'नया ड्रॉप',
      dailyDrop: '⚡ डेली ड्रॉप',
      dailyDropIn: 'अगला ड्रॉप',
      pressingVinyl: 'विनाइल प्रेस हो रहा है...',
      devUnlocked: '(डेव मोड)',
      languageLabel: 'भाषा (Language)',
      autoDevice: 'ऑटो (डिवाइस)',
    },
    canineRevolution: {
      bandName: 'श्वान क्रांति',
      albumTitle: 'नीला इलेक्ट्रिक कॉलर',
      tracks: [
        'डाकिया पर भौंकना',
        'चबाया हुआ पट्टा',
        'बिजली का झटका',
        'गली के कुत्तों का घोषणापत्र',
        'गुर्राहट की तरंग',
        'तार के पार दौड़',
        'विजय की पुकार',
      ],
      fauxReviews: [
        '"कच्ची पंक ऊर्जा और बेलगाम उत्साह का अद्भुत संगम।" — विनाइल ट्रिब्यून',
        '"उपनगरीय पट्टा कानूनों और अदृश्य बाड़ों पर एक तीखा प्रहार।" — मासिक ध्वनि',
      ],
      bandBio:
        'श्वान क्रांति ने एक ऐसे खलिहान में अभ्यास किया जहाँ छह आवारा कुत्ते ड्रम की थाप पर भौंकते थे। उनके लाइव शो साउंड सिस्टम से जुड़ी डॉग-व्हिसल के लिए मशहूर थे।',
      stickerText: 'विद्युत आवेश: 50,000V',
    },
    words: {
      nouns: [
        'कोहनी', 'टोस्टर', 'पनीर', 'पतलून', 'गिनतारा', 'रेडिएटर',
        'चम्मच', 'पहिया-ढक्कन', 'दाढ़', 'निहाई', 'कैक्टस', 'चुंबक',
        'लंगर', 'बल्ब', 'खोपड़ी', 'मुकुट', 'सूप', 'फ़ाइल-कैबिनेट', 'थर्मोस्टेट',
      ],
      adjectives: [
        'अतार्किक', 'लेमिनेटेड', 'खुरदरा', 'पुराना', 'क्वांटम',
        'भूमिगत', 'असंतुलित', 'जंग-लगा', 'अंतरिक्षीय', 'अस्थायी',
      ],
      adverbs: ['पूर्णतः', 'मौलिक रूप से', 'सैद्धांतिक रूप से'],
      ensembles: ['सिंडिकेट', 'ब्रिगेड', 'ऑर्केस्ट्रा', 'समिति', 'तिकड़ी', 'संघ'],
      singleWordTracks: ['छलांग', 'झटका', 'स्थैतिक', 'चक्कर', 'घर्षण', 'विस्फोट', 'पलायन'],
      closers: ['उपसंहार', 'समापन', 'अंतिम धुन', 'विदाई'],
      stickers: ['हिट सिंगल सहित!', '180 ग्राम शुद्ध विनाइल', 'समिति द्वारा प्रमाणित'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${a1} ${n1} ${ens}`,
        (n1, n2) => `${n1} और ${n2}`,
        (n1, _n2, _a1, _a2, _adv, ens) => `${n1} का ${ens}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1} ${n1} का अध्ययन`,
        (n1, n2) => `${n2} में ${n1}`,
        (n1, _n2, _a1, _adv, _ens, num) => `प्रपत्र ${num}-B: ${n1}`,
        (n1) => `${n1} की समस्या`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, _a1, num) => `${n1} #${num}`,
        (n1) => `आधी रात का ${n1}`,
        (n1, n2) => `${n1} और ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} प्रयोग; पारंपरिक रिकॉर्डिंग नियमों के विरुद्ध एक साहसी कदम।" — ${pub}`,
        (a1, pub) => `"${a1} लय; ऐसा लगता है जैसे वाद्ययंत्र किसी सरकारी नोटिस का जवाब दे रहे हों।" — ${pub}`,
      ],
      publications: ['विनाइल ट्रिब्यून', 'मासिक ध्वनि', 'फ़्लम्पटाउन गज़ट'],
      bio: (band, album, year) =>
        `${year} में एक अनसुलझे नगरपालिका विवाद के बाद गठित, ${band} ने एक ही रात में पूरा एल्बम रिकॉर्ड किया और "${album}" को अपनी एकमात्र आधिकारिक विनाइल कृति के रूप में छोड़ दिया।`,
    },
  },

  bn: {
    code: 'bn',
    shortBadge: 'BN',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    grammar: 'indic',
    ui: {
      subtitle: 'প্রতিদিন নতুন র‍্যান্ডম ব্যান্ড • ১০০% অফলাইন PWA',
      today: 'আজ',
      flipToBack: 'কভার উল্টান',
      flipToFront: 'সামনের কভার',
      spinAudio: 'অডিও চালান',
      stopAudio: 'টার্নটেবিল থামান',
      customizeDrop: 'কাস্টম রেকর্ড তৈরি',
      swapCoverArt: '১. বর্তমান কভার ছবি বদলান',
      activeRecord: 'সক্রিয় রেকর্ড',
      createNewCustomDrop: '২. নতুন কাস্টম ড্রপ তৈরি করুন',
      customDropDesc: 'নতুন রেকর্ড প্রেস করুন বা DNA কোড পেস্ট করুন।',
      newDropBtn: 'নতুন ড্রপ',
      dailyDrop: '⚡ ডেইলি ড্রপ',
      dailyDropIn: 'পরবর্তী ড্রপ',
      pressingVinyl: 'ভিনাইল প্রেস হচ্ছে...',
      devUnlocked: '(ডেভ মোড)',
      languageLabel: 'ডেকের ভাষা',
      autoDevice: 'অটো (ডিভাইস)',
    },
    canineRevolution: {
      bandName: 'সারমেয় বিপ্লব',
      albumTitle: 'নীল বৈদ্যুতিক কলার',
      tracks: [
        'ডাকহরকরার প্রতি ঘেউ',
        'ছেঁড়া বেল্টের স্বাধীনতা',
        'বৈদ্যুতিক ঝলক',
        'শহরতলির কুকুর দলের ইশতেহার',
        'গর্জনের কম্পাঙ্ক',
        'তারের বেড়া পেরিয়ে',
        'বিজয়ের গর্জন',
      ],
      fauxReviews: [
        '"কাঁচা পাঙ্ক শক্তি এবং অদম্য উদ্দীপনার এক অনন্য মিশ্রণ।" — ভিনাইল ট্রিবিউন',
        '"শহরতলির নিয়ম এবং অদৃশ্য বৈদ্যুতিক বেড়ার বিরুদ্ধে এক তীব্র আঘাত।" — মাসিক ধ্বনি',
      ],
      bandBio:
        'সারমেয় বিপ্লব একটি পুরনো খামারে মহড়া দিত যেখানে ছয়টি পথকুকুর ড্রামের তালে তালে ঘেউ ঘেউ করত। তাদের কনসার্টে সাউন্ড সিস্টেমের সাথে যুক্ত ডগ-হুইসেলের জন্য তারা বিখ্যাত ছিল।',
      stickerText: 'বৈদ্যুতিক চার্জ: ৫০,০০০ ভোল্ট',
    },
    words: {
      nouns: [
        'কনুই', 'টোস্টার', 'পনির', 'প্যান্টালুন', 'অ্যাবাকাস', 'উপকমিটি',
        'রেডিয়েটর', 'চামচ', 'হাবক্যাপ', 'মাড়ির দাঁত', 'নেহাই', 'ক্যাকটাস',
        'চুম্বক', 'নোঙর', 'বাল্ব', 'খুলি', 'মুকুট', 'স্যুপ', 'থার্মোস্ট্যাট',
      ],
      adjectives: [
        'অযৌক্তিক', 'ল্যামিনেটেড', 'খসখসে', 'সেকেলে', 'অতিরিক্ত', 'কোয়ান্টাম',
        'ভূগর্ভস্থ', 'অমীমাংসিত', 'মরিচা-ধরা', 'বৈদ্যুতিক', 'সাময়িক',
      ],
      adverbs: ['চূড়ান্তভাবে', 'মৌলিকভাবে', 'তাত্ত্বিকভাবে', 'সন্দেহজনকভাবে'],
      ensembles: ['সিন্ডিকেট', 'ব্রিগেড', 'অর্কেস্ট্রা', 'কমিটি', 'ত্রয়ী', 'সংঘ'],
      singleWordTracks: ['লাফ', 'প্রতিঘাত', 'স্থিরতা', 'ঘূর্ণি', 'ঘর্ষণ', 'বিস্ফোরণ', 'প্রস্থান'],
      closers: ['উপসংহার', 'সমাপ্তি', 'শেষ সুর', 'পর্দা নামা'],
      stickers: ['হিট সিঙ্গেল সহ!', '১৮০ গ্রাম অডিওফাইল ভিনাইল', 'কমিটি দ্বারা অনুমোদিত'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${a1} ${n1} ${ens}`,
        (n1, n2) => `${n1} ও ${n2}`,
        (n1, _n2, _a1, _a2, _adv, ens) => `${n1}-এর ${ens}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1} ${n1} গবেষণা`,
        (n1, n2) => `${n2}-এর ভেতর ${n1}`,
        (n1, _n2, _a1, _adv, _ens, num) => `ফর্ম ${num}-বি: ${n1}`,
        (n1) => `${n1} সংক্রান্ত জটিলতা`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, _a1, num) => `${n1} #${num}`,
        (n1) => `মধ্যরাতের ${n1}`,
        (n1, n2) => `${n1} এবং ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} শব্দ পরীক্ষা; প্রচলিত রেকর্ডিং নিয়মের বিরুদ্ধে এক সাহসী পদক্ষেপ।" — ${pub}`,
        (a1, pub) => `"${a1} ছন্দ; মনে হয় যন্ত্রগুলো কোনো পৌরসভার নোটিশের জবাব দিচ্ছে।" — ${pub}`,
      ],
      publications: ['ভিনাইল ট্রিবিউন', 'মাসিক অ্যাকোস্টিক', 'ফ্লাম্পটাউন গেজেট'],
      bio: (band, album, year) =>
        `${year} সালে একটি অমীমাংসিত পৌর বিরোধের পর গঠিত, ${band} এক রাতেই পুরো অ্যালবামটি রেকর্ড করে এবং "${album}"-কে তাদের একমাত্র আনুষ্ঠানিক ভিনাইল প্রকাশনা হিসেবে রেখে যায়।`,
    },
  },

  ur: {
    code: 'ur',
    shortBadge: 'UR',
    nativeName: 'اردو',
    englishName: 'Urdu',
    grammar: 'indic',
    ui: {
      subtitle: 'روزانہ نیا بے ترتیب بینڈ • 100% آف لائن PWA',
      today: 'آج',
      flipToBack: 'کور پلٹیں',
      flipToFront: 'سامنے والا کور',
      spinAudio: 'آڈیو چلائیں',
      stopAudio: 'ٹرن ٹیبل روکیں',
      customizeDrop: 'کسٹم ریکارڈ بنائیں',
      swapCoverArt: '1. موجودہ کور فوٹو بدلیں',
      activeRecord: 'فعال ریکارڈ',
      createNewCustomDrop: '2. نیا کسٹم ڈراپ بنائیں',
      customDropDesc: 'نیا ریکارڈ پریس کریں یا DNA کوڈ پیسٹ کریں۔',
      newDropBtn: 'نیا ڈراپ',
      dailyDrop: '⚡ ڈیلی ڈراپ',
      dailyDropIn: 'اگلا ڈراپ',
      pressingVinyl: 'وینائل پریس ہو رہا ہے...',
      devUnlocked: '(ڈیو موڈ)',
      languageLabel: 'ڈیک کی زبان',
      autoDevice: 'آٹو (ڈیوائس)',
    },
    canineRevolution: {
      bandName: 'سگ انقلاب',
      albumTitle: 'نیلا برقی پٹہ',
      tracks: [
        'ڈاکیے پر بھونکنا',
        'چبایا ہوا پٹہ',
        'برقی جھٹکا',
        'مضافاتی کتوں کا منشور',
        'غرانے کی لہر',
        'خاردار تار کے پار',
        'فتح کی پکار',
      ],
      fauxReviews: [
        '"خام پنک توانائی اور بے لگام جوش کا زبردست امتزاج۔" — وینائل ٹریبیون',
        '"مضافاتی پٹہ قوانین اور غیر مرئی برقی باڑوں پر ایک تیز حملہ۔" — ماہنامہ آہنگ',
      ],
      bandBio:
        'سگ انقلاب نے ایک ایسے گودام میں مشق کی جہاں چھ آوارہ کتے ڈرم کی تھاپ پر بھونکتے تھے۔ ان کے لائیو شوز ساؤنڈ سسٹم سے جڑی سیٹیوں کے لیے مشہور تھے۔',
      stickerText: 'برقی چارج: 50,000 وولٹ',
    },
    words: {
      nouns: [
        'کہنی', 'ٹوسٹر', 'پنیر', 'پتلون', 'گنتارا', 'ریڈی ایٹر',
        'چمچ', 'وہیل کیپ', 'داڑھ', 'سندان', 'کیکٹس', 'مقناطیس',
        'لنگر', 'بلب', 'کھوپڑی', 'تاج', 'سوپ', 'فائل کیبنٹ', 'تھرموسٹیٹ',
      ],
      adjectives: [
        'غیر معقول', 'پلاسٹک چڑھا', 'کھردرا', 'فرسودہ', 'اضافی', 'کوانٹم',
        'زیر زمین', 'غیر متوازن', 'زنگ آلود', 'برقی', 'عارضی',
      ],
      adverbs: ['مکمل طور پر', 'بنیادی طور پر', 'نظریاتی طور پر'],
      ensembles: ['سنڈیکیٹ', 'بریگیڈ', 'آرکسٹرا', 'کمیٹی', 'تکڑی', 'انجمن'],
      singleWordTracks: ['چھلانگ', 'جھٹکا', 'سکون', 'چکر', 'رگڑ', 'شرارہ', 'فرار'],
      closers: ['اختتامیہ', 'الوداع', 'آخری دھن', 'پردہ'],
      stickers: ['ہٹ سنگل شامل ہے!', '180 گرام خالص وینائل', 'کمیٹی سے منظور شدہ'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${a1} ${n1} ${ens}`,
        (n1, n2) => `${n1} اور ${n2}`,
        (n1, _n2, _a1, _a2, _adv, ens) => `${n1} کا ${ens}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1} ${n1} کا مطالعہ`,
        (n1, n2) => `${n2} میں ${n1}`,
        (n1, _n2, _a1, _adv, _ens, num) => `فارم ${num}-B: ${n1}`,
        (n1) => `${n1} کا مسئلہ`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, _a1, num) => `${n1} #${num}`,
        (n1) => `آدھی رات کا ${n1}`,
        (n1, n2) => `${n1} اور ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} تجربہ؛ روایتی ریکارڈنگ آداب کے خلاف ایک جرات مندانہ قدم۔" — ${pub}`,
        (a1, pub) => `"${a1} لے؛ ایسا لگتا ہے جیسے ساز کسی سرکاری نوٹس کا جواب دے رہے ہوں۔" — ${pub}`,
      ],
      publications: ['وینائل ٹریبیون', 'ماہنامہ آہنگ', 'فلمپ ٹاؤن گزٹ'],
      bio: (band, album, year) =>
        `${year} میں ایک حل طلب بلدیاتی تنازعے کے بعد قائم ہونے والے بینڈ ${band} نے ایک ہی رات میں پورا البم ریکارڈ کیا اور "${album}" کو اپنی واحد سرکاری وینائل اشاعت کے طور پر چھوڑ دیا۔`,
    },
  },

  ar: {
    code: 'ar',
    shortBadge: 'AR',
    nativeName: 'العربية',
    englishName: 'Arabic',
    grammar: 'semitic',
    ui: {
      subtitle: 'فرقة عشوائية جديدة يومياً • تطبيق يعمل 100% بدون إنترنت',
      today: 'اليوم',
      flipToBack: 'اقلب الغلاف',
      flipToFront: 'الغلاف الأمامي',
      spinAudio: 'تشغيل المقطع',
      stopAudio: 'إيقاف الاسطوانة',
      customizeDrop: 'تخصيص إصدار',
      swapCoverArt: '1. تغيير صورة الغلاف الحالي',
      activeRecord: 'الاسطوانة النشطة',
      createNewCustomDrop: '2. إنشاء اسطوانة مخصصة جديدة',
      customDropDesc: 'اصنع اسطوانة مستقلة أو الصق كود DNA.',
      newDropBtn: 'إصدار جديد',
      dailyDrop: '⚡ إصدار اليوم',
      dailyDropIn: 'الإصدار القادم خلال',
      pressingVinyl: 'جارٍ كبس الفينيل...',
      devUnlocked: '(وضع المطور)',
      languageLabel: 'لغة الجهاز',
      autoDevice: 'تلقائي (الجهاز)',
    },
    canineRevolution: {
      bandName: 'ثورة الكلاب',
      albumTitle: 'طوق الصدمات الأزرق',
      tracks: [
        'النباح على ساعي البريد',
        'حرية المقود الممضوغ',
        'الصعقة الإلكترونية',
        'بيان قطيع الضواحي',
        'تردد الزمجرة',
        'الركض خلف السياج السلكي',
        'عواء النصر',
      ],
      fauxReviews: [
        '"طاقة بانك خام وحماس جامح لا مثيل له." — منبر الفينيل',
        '"هجوم صوتي لاذع ضد قوانين الضواحي والأسوار الكهربائية غير المرئية." — المجلة الصوتية',
      ],
      bandBio:
        'تدربت فرقة ثورة الكلاب في حظيرة محاطة بستة كلاب شاردة كانت تنبح بدقة مع إيقاع الطبول. واشتهرت حفلاتهم بتوصيل صافرات الكلاب فوق الصوتية بمكبرات الصوت.',
      stickerText: 'شحنة كهربائية: 50,000 فولت',
    },
    words: {
      nouns: [
        'المرفق', 'المحمصة', 'الجبن', 'البنطلون', 'المعداد', 'اللجنة الفرعية',
        'المشعاع', 'الملعقة', 'غطاء العجلة', 'الضرس', 'السندان', 'الصبار',
        'المغناطيس', 'المرساة', 'المصباح', 'الجمجمة', 'التاج', 'الحساء', 'الثرموستات',
      ],
      adjectives: [
        'غير المعقول', 'المغلف', 'الكاشط', 'المتقادم', 'الفائض', 'الكمومي',
        'الجوفي', 'غير المعاير', 'الصدئ', 'الكهربائي', 'المؤقت',
      ],
      adverbs: ['بشكل قاطع', 'جوهرياً', 'نظرياً', 'بشكل مريب'],
      ensembles: ['نقابة', 'لواء', 'أوركسترا', 'لجنة', 'ثلاثي', 'اتحاد'],
      singleWordTracks: ['قفزة', 'ارتداد', 'تشويش', 'دوار', 'احتكاك', 'شرارة', 'هروب'],
      closers: ['خاتمة', 'تلاشي', 'خروج', 'الستار الأخير'],
      stickers: ['يتضمن الأغنية الشهيرة!', 'فينيل نقي 180 جرام', 'معتمد من اللجنة الفرعية'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${ens} ${n1} ${a1}`,
        (n1, n2) => `${n1} و${n2}`,
      ],
      album: [
        (n1, _n2, a1) => `دراسة في ${n1} ${a1}`,
        (n1, n2) => `${n1} فوق ${n2}`,
        (n1, _n2, _a1, _adv, _ens, num) => `نموذج ${num}-ب: ${n1}`,
        (n1) => `معضلة ${n1}`,
      ],
      tracks: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, _n2, _a1, num) => `${n1} رقم ${num}`,
        (n1) => `بلوز ${n1}`,
        (n1, n2) => `${n1} و${n2}`,
      ],
      reviews: [
        (a1, pub) => `"عمل ${a1}؛ تمرد صريح على كافة بروتوكولات التسجيل التقليدية." — ${pub}`,
        (a1, pub) => `"إيقاع ${a1}؛ يبدو قسم الإيقاع وكأنه يقدم اعتراضاً رسمياً للبلدية." — ${pub}`,
      ],
      publications: ['منبر الفينيل', 'المجلة الصوتية', 'جريدة فلامبتاون'],
      bio: (band, album, year) =>
        `تأسست فرقة «${band}» عام ${year} إثر نزاع بلدي حول التخطيط العمراني، وسجلت جميع مقاطعها في ليلة واحدة، تاركة ألبوم «${album}» كإصدار وحيد معتمد.`,
    },
  },

  ru: {
    code: 'ru',
    shortBadge: 'RU',
    nativeName: 'Русский',
    englishName: 'Russian',
    grammar: 'slavic',
    ui: {
      subtitle: 'Новая группа каждый день • 100% Офлайн PWA',
      today: 'Сегодня',
      flipToBack: 'Перевернуть',
      flipToFront: 'Обложка',
      spinAudio: 'Слушать Винил',
      stopAudio: 'Стоп',
      customizeDrop: 'Свой Выпуск',
      swapCoverArt: '1. Заменить Фото Обложки',
      activeRecord: 'Текущий Диск',
      createNewCustomDrop: '2. Создать Свою Пластинку',
      customDropDesc: 'Отштампуйте новый диск или вставьте ДНК-код',
      newDropBtn: 'Создать',
      dailyDrop: '⚡ ДИСК ДНЯ',
      dailyDropIn: 'СЛЕДУЮЩИЙ ЧЕРЕЗ',
      pressingVinyl: 'ПРЕССОВКА ВИНИЛА...',
      devUnlocked: '(DEV РЕЖИМ)',
      languageLabel: 'Язык Деки',
      autoDevice: 'Авто (Устройство)',
    },
    canineRevolution: {
      bandName: 'Собачья Революция',
      albumTitle: 'Синий Электроошейник',
      tracks: [
        'Лай на Почтальона',
        'Перегрызенный Поводок',
        'Электроразряд',
        'Манифест Дворовой Стаи',
        'Частота Рычания',
        'За Периметром Провода',
        'Победный Вой',
      ],
      fauxReviews: [
        '"Сырая панк-энергия с неподдельным бешеным энтузиазмом." — Виниловый Вестник',
        '"Сокрушительный удар по пригородным правилам поводков и невидимым заборам." — Акустика',
      ],
      bandBio:
        '«Собачья Революция» репетировала в амбаре в окружении шести бродячих терьеров, лаявших точно в такт бас-бочке. На концертах они подключали ультразвуковые свистки прямо к усилителю.',
      stickerText: 'РАЗРЯД ТОКА: 50 000 В',
    },
    words: {
      nouns: [
        'Локоть', 'Тостер', 'Сыр', 'Штаны', 'Счёты', 'Радиатор',
        'Дуршлаг', 'Колпак', 'Моляр', 'Наковальня', 'Кактус', 'Магнит',
        'Якорь', 'Лампочка', 'Череп', 'Корона', 'Суп', 'Протокол', 'Термостат',
      ],
      adjectives: [
        'Необоснованный', 'Ламинированный', 'Абразивный', 'Устаревший', 'Квантовый',
        'Подвальный', 'Некалиброванный', 'Ржавый', 'Межгалактический', 'Временный',
      ],
      adverbs: ['Безнадёжно', 'Фундаментально', 'Теоретически', 'Подозрительно'],
      ensembles: ['Синдикат', 'Бригада', 'Оркестр', 'Комитет', 'Трио', 'Консорциум', 'Ансамбль'],
      singleWordTracks: ['Прыжок', 'Отдача', 'Помехи', 'Головокружение', 'Трение', 'Разряд', 'Побег'],
      closers: ['Кода', 'Финал', 'Затухание', 'Выход'],
      stickers: ['ВКЛЮЧАЕТ ХИТ-СИНГЛ!', '180Г АУДИОФИЛЬСКИЙ ВИНИЛ', 'ОДОБРЕНО ПОДКОМИТЕТОМ'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${a1} ${ens} «${n1}»`,
        (n1, n2) => `${n1} и ${n2}`,
        (n1, _n2, a1, _a2, adv) => `${adv} ${a1} ${n1}`,
      ],
      album: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, n2) => `${n1} против «${n2}»`,
        (n1, _n2, _a1, _adv, _ens, num) => `Форма №${num}-Б: ${n1}`,
        (n1) => `Протокол «${n1}»`,
      ],
      tracks: [
        (n1, _n2, a1) => `${a1} ${n1}`,
        (n1, _n2, _a1, num) => `${n1} №${num}`,
        (n1) => `Полуночный ${n1}`,
        (n1, n2) => `${n1} и ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} звуковой эксперимент; дерзкий вызов студийному этикету." — ${pub}`,
        (a1, pub) => `"${a1} ритм; ударная секция звучит как жалоба в жилищный комитет." — ${pub}`,
      ],
      publications: ['Виниловый Вестник', 'Ежемесячная Акустика', 'Газета Фламптауна'],
      bio: (band, album, year) =>
        `Основанный в ${year} году после затяжного коммунального спора коллектив «${band}» записал весь материал за одну ночную смену, оставив альбом «${album}» единственным официальным тиражом.`,
    },
  },

  tlh: {
    code: 'tlh',
    shortBadge: 'TLH',
    nativeName: 'tlhIngan Hol',
    englishName: 'Klingon',
    grammar: 'klingon',
    ui: {
      subtitle: "Hoch jaj ghom chu' • 100% De'wI'Qo' PWA",
      today: 'DaHjaj',
      flipToBack: "De' jIH choH",
      flipToFront: "bI'reS jIH",
      spinAudio: 'QoQ chu’',
      stopAudio: 'QoQ mev',
      customizeDrop: "QoQ lIngmeH choH",
      swapCoverArt: "1. DaH mIllogh choH",
      activeRecord: "DaH QoQ",
      createNewCustomDrop: "2. QoQ chu' chenmoH",
      customDropDesc: "QoQ chu' chenmoH pagh DNA ngoq lan.",
      newDropBtn: "chenmoH",
      dailyDrop: "⚡ DAHJAJ QOQCHU'",
      dailyDropIn: "QOQCHU' QA'MEH",
      pressingVinyl: "QOQ CHENMOHLU'...",
      devUnlocked: "(DEV poS)",
      languageLabel: "Hol (Language)",
      autoDevice: "Auto (De'wI')",
    },
    canineRevolution: {
      bandName: 'targhDaw’',
      albumTitle: 'SuD ’ul mongDech',
      tracks: [
        "QIn HIjmeHwI' bey'",
        "tlhegh chopta'bogh tlhab",
        "'ul pe'bIl",
        "yoS targhmey maS",
        "ngagh wab",
        "veH tlhegh juS",
        "yay bey'",
      ],
      fauxReviews: [
        '"HoSghajchu\'bogh tlhIngan punk QoQ — quvchu\'!" — Qo\'noS QoQ De\'',
        '"yoS tlhegh chutmey \'ul veHmey je HIvchu\'bogh wab!" — Sto-Vo-Kor QIn',
      ],
      bandBio:
        "targhDaw' ghom cha'DIch 'IH Daq: jav targhmey tlhab 'ej bIng 'In bey'taH. 'ul wabmey lo'taHvIS yoS Hoch Ha'DIbaHmey mISmoH.",
      stickerText: "'UL HOS: 50,000V // QAP'LA!",
    },
    words: {
      nouns: [
        "DeS'a'", "Soj meQJan", "nIm tlhagh", "yopwaH", "mI' Jan", "yejHaD",
        "tujmoHwI'", "baghneQ", "rutlh Dech", "Ho' 'a'", "baS naH", "pe'bIl",
        "vergh", "wovmoHwI'", "dhIn", "ta' mIv", "tlhagh chatlh", "De'wI'echlet",
      ],
      adjectives: [
        'QIp', 'ghoD', 'habHa’', 'ngo’', 'lurDech', 'Qu’vatlh',
        'wov', 'HoSghaj', 'tlhIngan', 'quv', 'mIS', 'vaQ',
      ],
      adverbs: ['batlh', 'nom', 'pIj', 'tlhoy'],
      ensembles: ['yej', 'ghom', 'DIvI’', 'naw’', 'SuvwI’ ghom', 'Bo’Dagh'],
      singleWordTracks: ['Sup', 'HIv', 'pe’bIl', 'mIS', 'HoS', 'Hegh', 'yay', 'Qapla’'],
      closers: ['mev', 'pItlh', 'Qapla’', 'Dor'],
      stickers: ['QAP’LA! BOM DUN NGA’!', '180G QO’NOS VINYL', 'YEJHAD Qochbe’!'],
    },
    templates: {
      band: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, _n2, a1, _a2, _adv, ens) => `${n1} ${a1} ${ens}`,
        (n1, n2) => `${n1} ${n2} je`,
        (n1, _n2, a1, _a2, adv) => `${adv} ${n1} ${a1}`,
      ],
      album: [
        (n1, _n2, a1) => `${n1} ${a1} Qu'`,
        (n1, n2) => `${n2} DungDaq ${n1}`,
        (n1, _n2, _a1, _adv, _ens, num) => `chut #${num}-B: ${n1}`,
        (n1) => `${n1} may'`,
      ],
      tracks: [
        (n1, _n2, a1) => `${n1} ${a1}`,
        (n1, _n2, _a1, num) => `${n1} #${num}`,
        (n1) => `ram ${n1} bom`,
        (n1, n2) => `${n1} 'ej ${n2}`,
      ],
      reviews: [
        (a1, pub) => `"${a1} QoQ! pujwI'pu'vaD rolbe' — SuvwI' QoQ nIv!" — ${pub}`,
        (a1, pub) => `"${a1} wab! Qo'noS yejHaD chut!" — ${pub}`,
      ],
      publications: ["Qo'noS QoQ De'", 'Sto-Vo-Kor QIn', 'Khitomer Ledger'],
      bio: (band, album, year) =>
        `DIS ${year} Qo'noS yoS may' qaSpu'DI' chenmoHlu'pu' «${band}». wa' ramDaq Hoch QoQ qonta' 'ej «${album}» neH lIngta'. Qapla'!`,
    },
  },

  pig: {
    code: 'pig',
    shortBadge: 'PIG',
    nativeName: 'Igpay Atinlay',
    englishName: 'Pig-Latin',
    grammar: 'pig-latin',
    ui: {
      subtitle: 'Ewnay andomray andbay ailyday • 100% Offlineway PWA',
      today: 'Odaytay',
      flipToBack: 'Ipflay Eeveslay',
      flipToFront: 'Ontfray Overcay',
      spinAudio: 'Inspay Audioway Ipclay',
      stopAudio: 'Opstay Urntabletay',
      customizeDrop: 'Ustomizecay Away Opdray',
      swapCoverArt: '1. Apsway Urrentcay Overcay Artway',
      activeRecord: 'Activeway Ecordray',
      createNewCustomDrop: '2. Eatecray Ewnay Ustomcay Opdray',
      customDropDesc: 'Intmay away ewnay ecordray orway astepay DNA.',
      newDropBtn: 'Ewnay Opdray',
      dailyDrop: '⚡ AILYDAY OPDRAY',
      dailyDropIn: 'AILYDAY OPDRAY INWAY',
      pressingVinyl: 'ESSINGPRAY INYLVAY...',
      devUnlocked: '(EVDAY UNLOCKEDWAY)',
      languageLabel: 'Eckday Anguagelay',
      autoDevice: 'Autoway (Eviceday)',
    },
    canineRevolution: {
      bandName: 'Aninecay Evolutionray',
      albumTitle: 'Ueblay Ockshay Ollarcay',
      tracks: [
        'Arkingbay Atway Ethay Ailmanmay (Epriseray)',
        'Ewedchay Eashlay Eedomfray',
        'Ethay Electronicway Apzay',
        'Uburbansay Ogpackday Anifestomay',
        'Arlsnay Equencyfray',
        'Unningray Astpay Ethay Erimeterpay Ireway',
        'Ictoryvay Owlhay',
      ],
      fauxReviews: [
        '"Awray, appingsnay unkpay energyway ithway enuinegay abidray enthusiasmway." — NME',
        '"Away isteringblay assaultway onway uburbansay eashlay awslay." — Elodymay Akermay',
      ],
      bandBio:
        'Aninecay Evolutionray ehearsedray inway away arnbay urroundedsay ybay ixsay aystray errierstay owhay activelyway arkedbay inway imetay ithway ethay ickkay umdray.',
      stickerText: 'ELECTRICWAY ARGECHAY: 50,000V',
    },
    words: { nouns: [], adjectives: [], adverbs: [], ensembles: [], singleWordTracks: [], closers: [], stickers: [] },
    templates: { band: [], album: [], tracks: [], reviews: [], publications: [], bio: () => '' },
  },
};

export function getActiveLocalePack(pref?: LocalePreference): LocalePack {
  const code = resolveActiveLocale(pref);
  return LOCALE_REGISTRY[code] || LOCALE_REGISTRY.en;
}

export const BRAND_EXPANSIONS: Record<SupportedLocale, string> = {
  en: 'Your Daily Random Band Name',
  es: 'Tu Banda Aleatoria Diaria',
  pt: 'Sua Banda Aleatória Diária',
  fr: 'Votre Groupe Aléatoire du Jour',
  de: 'Dein Täglicher Zufalls-Bandname',
  id: 'Nama Band Acak Harian Anda',
  ja: '日替わりランダムバンド名',
  zh: '你的每日随机乐队名',
  hi: 'आपका दैनिक रैंडम बैंड नाम',
  bn: 'আপনার প্রতিদিনের র‍্যান্ডম ব্যান্ড',
  ur: 'آپ کا روزانہ بے ترتیب بینڈ نام',
  ar: 'اسم فرقتك العشوائي اليومي',
  ru: 'Твоя Случайная Группа Дня',
  tlh: 'DaHjaj ghom ponglIj',
  pig: 'Ouryay Ailyday Andomray Andbay Amenay',
};

export const PRESSED_PREFIXES: Record<SupportedLocale, string> = {
  en: 'Pressed',
  es: 'Prensado',
  pt: 'Prensado',
  fr: 'Pressé',
  de: 'Gepresst',
  id: 'Dicetak',
  ja: 'プレス完了',
  zh: '已压制',
  hi: 'प्रेस किया गया',
  bn: 'প্রেস করা হয়েছে',
  ur: 'پریس شدہ',
  ar: 'تم كبس',
  ru: 'Отштамповано',
  tlh: "chenmoHlu'pu'",
  pig: 'Essedpray',
};
