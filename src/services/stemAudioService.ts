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
      '70s_Drums_05.mp3', '70s_Drums_06.mp3', '70s_Drums_07.mp3',
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
    vocal: [],
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
      '80s_Vocal_05.mp3',
    ],
  },
  '90s': {
    drums: [
      '90s_Drums_01.mp3', '90s_Drums_02.mp3', '90s_Drums_03.mp3', '90s_Drums_04.mp3',
    ],
    vocal: [
      '90s_Vocal_01.mp3', '90s_Vocal_02.mp3', '90s_Vocal_03.mp3', '90s_Vocal_04.mp3',
      '90s_Vocal_05.mp3', '90s_Vocal_06.mp3',
    ],
  },
};

const BASE_STEM_PATH = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/audio/stems/`;
const bufferCache: Map<string, AudioBuffer> = new Map();

// --- Storage Keys ---
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
  if (decade !== '70s' && decade !== '80s') return false;
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

function generateNewStemPlan(yearStr: string): SelectedStemPlan {
  // 1. ATJ Fanfare Check
  if (isAtjEligible()) {
    markAtjPlayed();
    return {
      stems: ['ATJ.mp3'],
      isSoloHarmonica: false,
      isAtjFanfare: true,
      enableSynthBacking: false,
    };
  }

  const decade = resolveDecade(yearStr);
  const decadeData = STEM_MANIFEST[decade];
  if (!decadeData) {
    return { stems: [], isSoloHarmonica: false, isAtjFanfare: false, enableSynthBacking: true };
  }

  // 2. Build weighted selection pool (70s/80s vocal/humming/whistling throttled to 0.15)
  const allClips: WeightedStem[] = [];
  Object.entries(decadeData).forEach(([cat, files]) => {
    files.forEach((file) => {
      const isThrottledVocal = isVocalOrHumming(decade, cat, file);
      allClips.push({
        category: cat,
        file,
        weight: isThrottledVocal ? 0.15 : 1.0,
      });
    });
  });

  if (allClips.length === 0) {
    return { stems: [], isSoloHarmonica: false, isAtjFanfare: false, enableSynthBacking: true };
  }

  // 3. Select primary stem
  const primary = pickWeightedClip(allClips);

  // Harmonica Rule: 100% Solo (No extra stems, no synth)
  if (primary.category === 'harmonica') {
    recordPlayedHarmonica(primary.file);
    return {
      stems: [primary.file],
      isSoloHarmonica: true,
      isAtjFanfare: false,
      enableSynthBacking: false,
    };
  }

  // 4. Strict 2-Layer Cap: At most 1 optional complementary stem
  const selectedStems: string[] = [primary.file];

  // 65% chance to add a 2nd stem; 35% chance to stay as a single stem
  const wantsSecondStem = Math.random() < 0.65;

  if (wantsSecondStem) {
    const candidateSecondaryClips = allClips.filter(
      (c) => c.category !== primary.category && c.category !== 'harmonica'
    );

    if (candidateSecondaryClips.length > 0) {
      const secondary = pickWeightedClip(candidateSecondaryClips);
      selectedStems.push(secondary.file);
    }
  }

  // 5. Coin Flip (50/50) to include the 25% synth backing
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