export interface AppPreferences {
  disabledPacks: string[];
  disableDefaultWords: boolean;
  disableDefaultBackgrounds: boolean;
  disableDefaultSubjects: boolean;
  disableEmojis: boolean;
}

const PREF_KEY = 'ydrbn_preferences';

export function getPreferences(): AppPreferences {
  const stored = localStorage.getItem(PREF_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    disabledPacks: [],
    disableDefaultWords: false,
    disableDefaultBackgrounds: false,
    disableDefaultSubjects: false,
    disableEmojis: true,
  };
}

export function savePreferences(prefs: AppPreferences): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export function togglePackStatus(packId: string, isEnabled: boolean): void {
  const prefs = getPreferences();
  if (isEnabled) {
    prefs.disabledPacks = prefs.disabledPacks.filter(id => id !== packId);
  } else {
    if (!prefs.disabledPacks.includes(packId)) {
      prefs.disabledPacks.push(packId);
    }
  }
  savePreferences(prefs);
}