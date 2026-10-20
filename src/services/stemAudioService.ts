import { IS_ELBOW_FAILSAFE_MODE } from './proceduralGenerator';

// Probability (0.0 to 1.0) that spinning an album in Elbow Failsafe Mode immediately triggers ATJ.mp3
const ELBOW_ATJ_DIRECT_CHANCE = 0.20; // 20% direct chance per Elbow album

export interface StemManifest {
  [decade: string]: {
    [category: string]: string[];
  };
}

export const STEM_MANIFEST: StemManifest = {
  '70s': {
    acoustic: [
      '70s_Acoustic_01.mp3', '70s_Acoustic_02.mp3', '70s_Acoustic_03.mp3', '70s_Acoustic_04.mp3',
      '70s_Acoustic_05.mp3', '70s_Acoustic_06.mp3', '70s_Acoustic_07.mp3', '70s_Acoustic_08.mp3',
      '70s_Acoustic_09.mp3', '70s_Acoustic_10.mp3', '70s_Acoustic_11.mp3', '70s_Acoustic_12.mp3',
      '70s_Acoustic_13.mp3', '70s_Acoustic_14.mp3',
    ],
    bass: [
      '70s_Bass_01.mp3', '70s_Bass_02.mp3', '70s_Bass_03.mp3', '70s_Bass_04.mp3',
      '70s_Bass_05.mp3', '70s_Bass_06.mp3', '70s_Bass_07.mp3', '70s_Bass_08.mp3',
      '70s_Bass_09.mp3', '70s_Bass_10.mp3', '70s_Bass_11.mp3', '70s_Bass_12.mp3',
      '70s_Bass_13.mp3', '70s_Bass_14.mp3', '70s_Bass_15.mp3', '70s_Bass_16.mp3',
      '70s_Bass_17.mp3', '70s_Bass_18.mp3',
    ],
    drums: [
      '70s_Drums_01.mp3', '70s_Drums_02.mp3', '70s_Drums_03.mp3', '70s_Drums_04.mp3',
      '70s_Drums_05.mp3', '70s_Drums_06.mp3', '70s_Drums_07.mp3', '70s_Drums_08.mp3',
      '70s_Drums_09.mp3', '70s_Drums_10.mp3', '70s_Drums_11.mp3', '70s_Drums_12.mp3',
      '70s_Drums_13.mp3', '70s_Drums_14.mp3',
    ],
    harmonica: [
      '70s_Harmonica_01.mp3', '70s_Harmonica_02.mp3', '70s_Harmonica_03.mp3', '70s_Harmonica_04.mp3',
      '70s_Harmonica_05.mp3', '70s_Harmonica_06.mp3', '70s_Harmonica_07.mp3', '70s_Harmonica_08.mp3',
      '70s_Harmonica_09.mp3', '70s_Harmonica_10.mp3',
    ],
    humming: [
      '70s_Humming_01.mp3', '70s_Humming_02.mp3', '70s_Humming_03.mp3', '70s_Humming_04.mp3',
      '70s_Humming_05.mp3',
    ],
    whistling: [
      '70s_Whistling_01.mp3', '70s_Whistling_02.mp3',
    ],
    woodwind: [
      '70s_Woodwind.01.mp3', '70s_Woodwind_02.mp3', '70s_Woodwind_03.mp3', '70s_Woodwind_04.mp3',
      '70s_Woodwind_05.mp3',
    ],
    vocal: [
      '70s_Vocal_01.mp3', '70s_Vocal_02.mp3', '70s_Vocal_03.mp3', '70s_Vocal_04.mp3',
      '70s_Vocal_05.mp3', '70s_Vocal_06.mp3', '70s_Vocal_07.mp3', '70s_Vocal_08.mp3',
      '70s_Vocal_09.mp3', '70s_Vocal_10.mp3', '70s_Vocal_11.mp3', '70s_Vocal_12.mp3',
      '70s_Vocal_13.mp3', '70s_Vocal_14.mp3',
    ],
  },
  '80s': {
    bass: [
      '80s_Bass_01.mp3', '80s_Bass_02.mp3', '80s_Bass_03.mp3', '80s_Bass_04.mp3',
      '80s_Bass_05.mp3', '80s_Bass_06.mp3', '80s_Bass_07.mp3', '80s_Bass_08.mp3',
      '80s_Bass_09.mp3',
    ],
    drums: [
      '80s_Drums_01.mp3', '80s_Drums_02.mp3', '80s_Drums_03.mp3', '80s_Drums_04.mp3',
      '80s_Drums_05.mp3', '80s_Drums_06.mp3', '80s_Drums_07.mp3', '80s_Drums_08.mp3',
      '80s_Drums_09.mp3', '80s_Drums_10.mp3', '80s_Drums_11.mp3', '80s_Drums_12.mp3',
      '80s_Drums_13.mp3', '80s_Drums_14.mp3',
    ],
    humming: [
      '80s_Humming_01.mp3', '80s_Humming_02.mp3', '80s_Humming_03.mp3', '80s_Humming_04.mp3',
      '80s_Humming_05.mp3',
    ],
    vocal: [
      '80s_Vocal_01.mp3', '80s_Vocal_02.mp3', '80s_Vocal_03.mp3', '80s_Vocal_04.mp3',
      '80s_Vocal_05.mp3', '80s_Vocal_06.mp3', '80s_Vocal_07.mp3', '80s_Vocal_08.mp3',
      '80s_Vocal_09.mp3', '80s_Vocal_10.mp3', '80s_Vocal_11.mp3', '80s_Vocal_12.mp3',
      '80s_Vocal_13.mp3', '80s_Vocal_14.mp3',
    ],
  },
  '90s': {
    drums: [
      '90s_Drums_01.mp3', '90s_Drums_02.mp3', '90s_Drums_03.mp3', '90s_Drums_04.mp3',
      '90s_Drums_05.mp3', '90s_Drums_06.mp3', '90s_Drums_07.mp3', '90s_Drums_08.mp3',
      '90s_Drums_09.mp3', '90s_Drums_10.mp3', '90s_Drums_11.mp3', '90s_Drums_12.mp3',
      '90s_Drums_13.mp3', '90s_Drums_14.mp3',
    ],
    vocal: [
      '90s_Vocal_01.mp3', '90s_Vocal_02.mp3', '90s_Vocal_03.mp3', '90s_Vocal_04.mp3',
      '90s_Vocal_05.mp3', '90s_Vocal_06.mp3', '90s_Vocal_07.mp3', '90s_Vocal_08.mp3',
      '90s_Vocal_09.mp3', '90s_Vocal_10.mp3', '90s_Vocal_11.mp3', '90s_Vocal_12.mp3',
      '90s_Vocal_13.mp3', '90s_Vocal_14.mp3',
    ],
  },
};

const BASE_STEM_PATH = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/audio/stems/`;
const bufferCache: Map<string, AudioBuffer> = new Map();

const HARMONICA_STORAGE_KEY = 'ydrbn_played_harmonicas';
const ATJ_PLAYED_KEY = 'ydrbn_atj_played';
const ALBUM_PLANS_KEY = 'ydrbn_album_audio_plans';

export interface SelectedStemPlan {
  stems: string[];
  isSoloHarmonica: boolean;
  isAtjFanfare: boolean;
  enableSynthBacking: boolean;
}

export function getStoredAudioPlans(): Record<string, SelectedStemPlan> {
  try {
    const raw = localStorage.getItem(ALBUM_PLANS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredAudioPlan(albumId: string, plan: SelectedStemPlan): void {
  try {
    const plans = getStoredAudioPlans();
    plans[albumId] = plan;
    localStorage.setItem(ALBUM_PLANS_KEY, JSON.stringify(plans));
  } catch (err) {
    console.warn('[StemService] Failed saving album audio plan:', err);
  }
}

export function getPlayedHarmonicas(): string[] {
  try {
    const raw = localStorage.getItem(HARMONICA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPlayedHarmonica(filename: string): void {
  const current = getPlayedHarmonicas();
  if (!current.includes(filename)) {
    const updated = [...current, filename];
    localStorage.setItem(HARMONICA_STORAGE_KEY, JSON.stringify(updated));
  }
}

export function isAtjEligible(): boolean {
  if (localStorage.getItem(ATJ_PLAYED_KEY) === 'true') return false;
  return getPlayedHarmonicas().length >= 10;
}

export function markAtjPlayed(): void {
  localStorage.setItem(ATJ_PLAYED_KEY, 'true');
}

export async function loadStemBuffer(filename: string, ctx: AudioContext): Promise<AudioBuffer | null> {
  if (bufferCache.has(filename)) {
    return bufferCache.get(filename)!;
  }

  try {
    const res = await fetch(`${BASE_STEM_PATH}${filename}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(filename, audioBuffer);
    return audioBuffer;
    } catch (err) {
    console.warn(`[StemService] Failed loading ${filename}:`, err);
    return null;
  }
}

export function resolveDecade(yearStr: string): '70s' | '80s' | '90s' {
  const num = parseInt(yearStr.replace(/\D/g, ''), 10);
  if (!isNaN(num)) {
    if (num < 1980) return '70s';
    if (num < 1990) return '80s';
    return '90s';
  }
  return '70s';
}

interface WeightedStem {
  category: string;
  file: string;
  weight: number;
}

function isVocalOrHumming(decade: string, category: string, filename: string): boolean {
  const lowerCat = category.toLowerCase();
  const lowerFile = filename.toLowerCase();
  return (
    lowerCat.includes('vocal') ||
    lowerCat.includes('hum') ||
    lowerCat.includes('whistl') ||
    lowerFile.includes('vocal') ||
    lowerFile.includes('hum') ||
    lowerFile.includes('whistl')
  );
}

function pickWeightedClip(clips: WeightedStem[]): WeightedStem {
  const totalWeight = clips.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;
  for (const clip of clips) {
    if (random < clip.weight) return clip;
    random -= clip.weight;
  }
  return clips[clips.length - 1];
}

function buildClipsForDecade(decade: '70s' | '80s' | '90s'): WeightedStem[] {
  const data = STEM_MANIFEST[decade] || {};
  const clips: WeightedStem[] = [];
  Object.entries(data).forEach(([cat, files]) => {
    files.forEach((file) => {
      const isThrottled = isVocalOrHumming(decade, cat, file);
      clips.push({
        category: cat,
        file,
        weight: isThrottled ? 0.25 : 1.0,
      });
    });
  });
  return clips;
}

function generateNewStemPlan(yearStr: string): SelectedStemPlan {
  // 1. Standard ATJ Fanfare Check (10/10 harmonicas collected)
  if (isAtjEligible()) {
    markAtjPlayed();
    return {
      stems: ['ATJ.mp3'],
      isSoloHarmonica: false,
      isAtjFanfare: true,
      enableSynthBacking: false,
    };
  }

  // 1B. EMERGENCY ELBOW PROTOCOL OVERDRIVE:
  // If all content pools are disabled (Elbow Mode) and ATJ hasn't played yet:
  // - 35% chance to fire ATJ.mp3 immediately
  // - Otherwise, force an unplayed 70s_Harmonica solo (ignoring album decade) to rapidly complete the 10/10 list
  const atjAlreadyPlayed = localStorage.getItem(ATJ_PLAYED_KEY) === 'true';
  if (IS_ELBOW_FAILSAFE_MODE && !atjAlreadyPlayed) {
    if (Math.random() < ELBOW_ATJ_DIRECT_CHANCE) {
      markAtjPlayed();
      return {
        stems: ['ATJ.mp3'],
        isSoloHarmonica: false,
        isAtjFanfare: true,
        enableSynthBacking: false,
      };
    }

    const allHarmonicas = STEM_MANIFEST['70s']?.harmonica || [];
    const playedHarmonicas = getPlayedHarmonicas();
    const unplayedHarmonicas = allHarmonicas.filter((h) => !playedHarmonicas.includes(h));
    const targetPool = unplayedHarmonicas.length > 0 ? unplayedHarmonicas : allHarmonicas;

    if (targetPool.length > 0) {
      const chosenHarmonica = targetPool[Math.floor(Math.random() * targetPool.length)];
      recordPlayedHarmonica(chosenHarmonica);
      return {
        stems: [chosenHarmonica],
        isSoloHarmonica: true,
        isAtjFanfare: false,
        enableSynthBacking: false,
      };
    }
  }

  const decade = resolveDecade(yearStr);
  const primaryPool = buildClipsForDecade(decade);

  if (primaryPool.length === 0) {
    return { stems: [], isSoloHarmonica: false, isAtjFanfare: false, enableSynthBacking: true };
  }

  // 2. Select primary stem
  const primary = pickWeightedClip(primaryPool);

  // Harmonica Rule: 100% Solo
  if (primary.category === 'harmonica') {
    recordPlayedHarmonica(primary.file);
    return {
      stems: [primary.file],
      isSoloHarmonica: true,
      isAtjFanfare: false,
      enableSynthBacking: false,
    };
  }

  const selectedStems: string[] = [primary.file];

  // 3. Select secondary stem (70% probability)
  const wantsSecondStem = Math.random() < 0.70;
  if (wantsSecondStem) {
    // Exclude same category & harmonica
    let secondaryPool = primaryPool.filter(
      (c) => c.category !== primary.category && c.category !== 'harmonica'
    );

    // If 90s (or category depleted), pool bass and acoustic stems from 80s & 70s
    if (secondaryPool.length === 0 || decade === '90s') {
      const crossEraPool = [
        ...buildClipsForDecade('80s'),
        ...buildClipsForDecade('70s'),
      ].filter((c) => c.category !== 'harmonica' && c.category !== primary.category);
      secondaryPool = [...secondaryPool, ...crossEraPool];
    }

    if (secondaryPool.length > 0) {
      const secondary = pickWeightedClip(secondaryPool);
      selectedStems.push(secondary.file);
    }
  }

  // 4. Synth Backing Coin Flip (50/50)
  const enableSynth = Math.random() < 0.5;

  return {
    stems: selectedStems,
    isSoloHarmonica: false,
    isAtjFanfare: false,
    enableSynthBacking: enableSynth,
  };
}

export function getOrSelectStemsForAlbum(albumId: string, yearStr: string): SelectedStemPlan {
  const existingPlans = getStoredAudioPlans();
  if (existingPlans[albumId]) {
    return existingPlans[albumId];
  }

  const newPlan = generateNewStemPlan(yearStr);
  saveStoredAudioPlan(albumId, newPlan);
  return newPlan;
}