export type ColorMode = 'default' | 'dark' | 'light' | 'contrast';

export interface AppPreferences {
  disabledPacks: string[];
  disableDefaultWords: boolean;
  disableDefaultBackgrounds: boolean;
  disableDefaultSubjects: boolean;
  disableEmojis: boolean;
  colorMode: ColorMode;
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