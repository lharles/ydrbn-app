export type ColorMode = 'default' | 'dark' | 'light' | 'contrast';
export type VipEdition =
  | 'none'
  | 'founder'
  | 'splatter'
  | 'radioactive'
  | 'srhserv'
  | 'fandamnly';

export interface VipEditionMetadata {
  id: VipEdition;
  primaryUrlParam: string;
  urlTriggers: string[];
  techMenuLabel: string;
  toastTitle: string;
  plaqueText: string | null;
   plaqueClass: string;
  serialBadgeText: string;
  serialBadgeClass: string;
  discLabelText: string;
}

/**
 * MASTER VIP EDITION CONFIGURATION TABLE
 * Edit urlTriggers, primaryUrlParam, or plaqueText here to customize any VIP link or banner in one place!
 */
export const VIP_EDITION_CONFIG: Record<VipEdition, VipEditionMetadata> = {
  none: {
    id: 'none',
    primaryUrlParam: 'standard',
    urlTriggers: ['none', 'standard', 'default', 'off'],
    techMenuLabel: 'Standard Deck',
    toastTitle: 'STANDARD FACTORY EDITION',
    plaqueText: null,
    plaqueClass: '',
    serialBadgeText: 'SN: CRK3',
    serialBadgeClass: 'text-amber-400/90 bg-black/50 border-amber-700/30',
    discLabelText: 'HI-FI',
  },
  founder: {
    id: 'founder',
    primaryUrlParam: 'founder',
    urlTriggers: ['founder', 'gold', 'vip', '1977'],
    techMenuLabel: 'Founder 24K Gold',
    toastTitle: "FOUNDER'S 24K GOLD EDITION",
    plaqueText: '★ FOUNDER’S 24K GOLD EDITION ★',
    plaqueClass:
      'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 text-yellow-200 border-yellow-400/80 shadow-[0_0_12px_rgba(234,179,8,0.35)]',
    serialBadgeText: 'SN: CRK3 ★ GOLD',
    serialBadgeClass:
      'text-amber-200 bg-gradient-to-r from-amber-950 via-yellow-900/80 to-amber-950 border-yellow-400/70 shadow-[0_0_8px_rgba(250,204,21,0.35)]',
    discLabelText: '24K MASTER',
  },
  splatter: {
    id: 'splatter',
    primaryUrlParam: 'barf',
    urlTriggers: ['barf', 'blech', 'splatter'],
    techMenuLabel: 'Barf / Blech Wax',
    toastTitle: 'CERTIFIED BARF / BLECH EDITION',
    plaqueText: '🤮 CERTIFIED BARF // BLECH EDITION 🤮',
    plaqueClass:
      'bg-gradient-to-r from-lime-950 via-amber-900 to-fuchsia-950 text-lime-200 border-lime-400/80 shadow-[0_0_12px_rgba(163,230,53,0.35)]',
    serialBadgeText: 'SN: CRK3 ★ BLECH',
    serialBadgeClass:
      'text-lime-200 bg-gradient-to-r from-lime-950 via-amber-950 to-fuchsia-950 border-lime-400/70 shadow-[0_0_8px_rgba(163,230,53,0.35)]',
    discLabelText: 'BLECH WAX',
  },
  radioactive: {
    id: 'radioactive',
    primaryUrlParam: 'joestoxicwasteemporium',
    urlTriggers: ['joestoxicwasteemporium', 'toxic', 'radioactive', '235'],
    techMenuLabel: "Joe's Toxic Waste",
    toastTitle: "JOE'S TOXIC WASTE EMPORIUM",
    plaqueText: '☢ JOE’S TOXIC WASTE EMPORIUM ☢',
    plaqueClass:
      'bg-gradient-to-r from-lime-950 via-emerald-950 to-lime-950 text-lime-300 border-lime-400/80 shadow-[0_0_12px_rgba(163,230,53,0.4)]',
    serialBadgeText: 'SN: CRK3 ★ TOXIC',
    serialBadgeClass:
      'text-lime-200 bg-lime-950/90 border-lime-400/70 shadow-[0_0_8px_rgba(163,230,53,0.4)]',
    discLabelText: 'TOXIC-235',
  },
  srhserv: {
    id: 'srhserv',
    primaryUrlParam: 'srhserv',
    urlTriggers: ['srhserv'],
    techMenuLabel: 'SRHSERV Mainframe',
    toastTitle: 'SRHSERV MAINFRAME TERMINAL EDITION',
    plaqueText: '💻 SRHSERV // MAINFRAME ARCHIVE EDITION 🖥️',
    plaqueClass:
      'bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 text-cyan-200 border-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.35)]',
    serialBadgeText: 'SN: SRHSERV',
    serialBadgeClass:
      'text-cyan-200 bg-cyan-950/90 border-cyan-400/70 shadow-[0_0_8px_rgba(34,211,238,0.4)]',
    discLabelText: 'SRHSERV OS',
  },
  fandamnly: {
    id: 'fandamnly',
    primaryUrlParam: 'fandamnly',
    urlTriggers: ['fandamnly'],
    techMenuLabel: 'Fandamnly Hearts',
    toastTitle: 'FANDAMNLY TECHNICOLOR HEART EDITION',
    plaqueText: '❤️ FANDAMNLY // TECHNICOLOR HEART EDITION 💜',
    plaqueClass:
      'bg-gradient-to-r from-rose-950 via-pink-900 to-purple-950 text-pink-100 border-pink-400/80 shadow-[0_0_12px_rgba(244,114,182,0.4)]',
    serialBadgeText: 'SN: FANDAMNLY',
    serialBadgeClass:
      'text-pink-200 bg-rose-950/90 border-pink-400/70 shadow-[0_0_8px_rgba(244,114,182,0.4)]',
    discLabelText: 'FANDAMNLY',
  },
};

export interface AppPreferences {
  disabledPacks: string[];
  disableDefaultWords: boolean;
  disableDefaultBackgrounds: boolean;
  disableDefaultSubjects: boolean;
  disableEmojis: boolean;
  colorMode: ColorMode;
  vipEdition: VipEdition;
}

const PREF_KEY = 'ydrbn_preferences';

export function getPreferences(): AppPreferences {
  try {
    const stored = localStorage.getItem(PREF_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        disabledPacks: parsed.disabledPacks || [],
        disableDefaultWords: Boolean(parsed.disableDefaultWords),
        disableDefaultBackgrounds: Boolean(parsed.disableDefaultBackgrounds),
        disableDefaultSubjects: Boolean(parsed.disableDefaultSubjects),
        disableEmojis: parsed.disableEmojis !== undefined ? Boolean(parsed.disableEmojis) : true,
        colorMode: parsed.colorMode || 'default',
        vipEdition:
          parsed.vipEdition && VIP_EDITION_CONFIG[parsed.vipEdition as VipEdition]
            ? (parsed.vipEdition as VipEdition)
            : 'none',
      };
    }
  } catch {
    // fallback below
  }
  return {
    disabledPacks: [],
    disableDefaultWords: false,
    disableDefaultBackgrounds: false,
    disableDefaultSubjects: false,
    disableEmojis: true,
    colorMode: 'default',
    vipEdition: 'none',
  };
}

export function applyColorMode(mode: ColorMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

export function savePreferences(prefs: AppPreferences): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  if (prefs.colorMode) {
    applyColorMode(prefs.colorMode);
  }
}

export function setColorModePref(mode: ColorMode): AppPreferences {
  const prefs = getPreferences();
  prefs.colorMode = mode;
  savePreferences(prefs);
  return prefs;
}

export function setVipEditionPref(edition: VipEdition): AppPreferences {
  const prefs = getPreferences();
  prefs.vipEdition = edition;
  savePreferences(prefs);
  return prefs;
}

/**
 * Checks URL query parameters (?edition=...) against VIP_EDITION_CONFIG.
 * Persists the unlock to localStorage and cleans the URL bar.
 */
export function checkUrlEditionUnlock(): { unlocked: VipEdition | null; label: string } {
  if (typeof window === 'undefined') return { unlocked: null, label: '' };

  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('edition') || params.get('vip') || '').trim().toLowerCase();
    if (!raw) return { unlocked: null, label: '' };

    const matched = (Object.values(VIP_EDITION_CONFIG) as VipEditionMetadata[]).find((cfg) =>
      cfg.urlTriggers.includes(raw)
    );

    if (matched) {
      setVipEditionPref(matched.id);
      params.delete('edition');
      params.delete('vip');
      const cleanQuery = params.toString();
      const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', cleanUrl);
      return { unlocked: matched.id, label: matched.toastTitle };
    }
  } catch {
    // ignore URL parse errors
  }

  return { unlocked: null, label: '' };
}

export function togglePackStatus(packId: string, isEnabled: boolean): void {
  const prefs = getPreferences();
  if (isEnabled) {
    prefs.disabledPacks = prefs.disabledPacks.filter((id) => id !== packId);
  } else {
    if (!prefs.disabledPacks.includes(packId)) {
      prefs.disabledPacks.push(packId);
    }
  }
  savePreferences(prefs);
}
