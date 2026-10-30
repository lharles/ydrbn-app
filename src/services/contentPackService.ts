import { hydrateContentPools } from './proceduralGenerator';
import {
  savePack,
  getInstalledPack,
  removePack,
  StoredPack,
  saveStamp,
  removeStamp,
  savePackRecord,
  getAllInstalledPacks,
} from './packStorage';
import type { CustomPackBundle, CustomStamp } from '../components/CrateForgeModal';
import type { HarvestedWordsPayload } from '../types';

export const HARVEST_PACK_ID = 'pack-user-custom-drops';

export async function getAvailablePacks() {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const res = await fetch(`${base}content/index.json`, { cache: 'no-store' });
  const data = await res.json();
  return data.availablePacks;
}

export async function checkPackStatus(packId: string, manifestUrl: string) {
  const local = await getInstalledPack(packId);
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  try {
    const res = await fetch(`${base}content/${manifestUrl}`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const remoteManifest = await res.json();
    return {
      isInstalled: !!local,
      installedVersion: local ? local.installedVersion : null,
      remoteVersion: remoteManifest.version,
      hasUpdate: !local || local.installedVersion !== remoteManifest.version,
    };
  } catch {
    return { isInstalled: !!local, installedVersion: local?.installedVersion || null, hasUpdate: false };
  }
}

export async function installCurrentPack(manifestUrl: string): Promise<StoredPack> {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const folderPath = manifestUrl.substring(0, manifestUrl.lastIndexOf('/'));

  const manifestRes = await fetch(`${base}content/${manifestUrl}`, { cache: 'no-store' });
  const manifest = await manifestRes.json();

  let words = {};
  if (manifest.words) {
    const wordsRes = await fetch(`${base}content/${folderPath}/${manifest.words}`, { cache: 'no-store' });
    words = await wordsRes.json();
  }

  if (manifest.stamps && Array.isArray(manifest.stamps)) {
    for (const filename of manifest.stamps) {
      const imgRes = await fetch(`${base}content/${folderPath}/stamps/${filename}`, { cache: 'no-store' });
      const blob = await imgRes.blob();
      await saveStamp(filename, blob);
    }
  }

  if (manifest.subjects && Array.isArray(manifest.subjects)) {
    for (const filename of manifest.subjects) {
      const imgRes = await fetch(`${base}content/${folderPath}/subjects/${filename}`, { cache: 'no-store' });
      const blob = await imgRes.blob();
      await saveStamp(filename, blob);
    }
  }

  await savePack(manifest, words);
  await hydrateContentPools();
  return { id: manifest.id, manifest, words, installedVersion: manifest.version, installedAt: Date.now() };
}

export async function uninstallCurrentPack(packId: string): Promise<void> {
  await removePack(packId);
  await hydrateContentPools();
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  if (dataUrl.startsWith('data:')) {
    try {
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      // Fallback below
    }
  }
  const parts = dataUrl.split(',');
  const byteString = atob(parts[1] || parts[0]);
  const mimeString = parts[0].split(':')[1]?.split(';')[0] || 'image/png';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export async function saveCustomPack(bundle: CustomPackBundle): Promise<StoredPack> {
  const stampKeys: string[] = [];

  if (bundle.stamps && Array.isArray(bundle.stamps)) {
    for (const stamp of bundle.stamps) {
      const stampKey = `custom_${stamp.id}.png`;
      stampKeys.push(stampKey);
      const blob = await dataUrlToBlob(stamp.dataUrl);
      await saveStamp(stampKey, blob);
    }
  }

  const manifest = {
    id: bundle.manifest.id,
    name: bundle.manifest.name,
    description: bundle.manifest.description,
    version: bundle.manifest.version,
    author: bundle.manifest.author,
    isCustom: true,
    createdAt: bundle.manifest.createdAt || Date.now(),
    subjects: stampKeys,
    words: 'custom',
  };

  const storedPack: StoredPack = {
    id: bundle.manifest.id,
    manifest,
    words: {
      nouns: bundle.words.nouns || [],
      adjectives: bundle.words.adjectives || [],
      ensembles: bundle.words.ensembles || [],
    },
    installedVersion: bundle.manifest.version,
    installedAt: Date.now(),
    isCustom: true,
    customBundle: bundle,
  };

  await savePackRecord(storedPack);
  await hydrateContentPools();
  return storedPack;
}

/**
 * Appends novel words and optional artwork from a Custom Drop into the persistent
 * 'Custom Drop Additions' user crate in IndexedDB and re-hydrates active generator pools.
 */
export async function harvestCustomDropToPack(
  harvestedWords: HarvestedWordsPayload,
  imageBase64?: string,
  imageMode: 'subject' | 'backdrop' | 'none' = 'none',
  labelHint: string = 'drop'
): Promise<{ addedWordsCount: number; addedImage: boolean }> {
  const existing = await getInstalledPack(HARVEST_PACK_ID);

  const prevNouns: string[] = existing?.words?.nouns || [];
  const prevAdjectives: string[] = existing?.words?.adjectives || [];
  const prevEnsembles: string[] = existing?.words?.ensembles || [];
  const prevSubjects: string[] = existing?.manifest?.subjects || [];
  const prevStamps: string[] = existing?.manifest?.stamps || [];
  const prevBundleStamps: CustomStamp[] = existing?.customBundle?.stamps || [];

  const mergeUnique = (oldList: string[], newList: string[]) => {
    const seen = new Set(oldList.map((w) => w.toLowerCase()));
    const combined = [...oldList];
    let added = 0;
    for (const item of newList) {
      const clean = item.trim();
      if (clean && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        combined.push(clean);
        added++;
      }
    }
    return { combined, added };
  };

  const mergedNouns = mergeUnique(prevNouns, harvestedWords.nouns);
  const mergedAdjs = mergeUnique(prevAdjectives, harvestedWords.adjectives);
  const mergedEns = mergeUnique(prevEnsembles, harvestedWords.ensembles);

  const addedWordsCount = mergedNouns.added + mergedAdjs.added + mergedEns.added;
  let addedImage = false;

  const nextSubjects = [...prevSubjects];
  const nextStamps = [...prevStamps];
  const nextBundleStamps = [...prevBundleStamps];

  if (imageBase64 && imageMode !== 'none') {
    const cleanSlug = labelHint.toLowerCase().replace(/[^a-z0-9]/gi, '_').slice(0, 18) || 'drop';
    const stampId = `harvest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ext = imageMode === 'subject' ? 'png' : 'jpg';
    const assetKey = `custom_${stampId}_${cleanSlug}.${ext}`;

    const blob = await dataUrlToBlob(imageBase64);
    await saveStamp(assetKey, blob);

    if (imageMode === 'subject') {
      nextSubjects.push(assetKey);
      nextBundleStamps.push({
        id: `${stampId}_${cleanSlug}`,
        name: `${labelHint} (Subject)`,
        dataUrl: imageBase64,
      });
    } else if (imageMode === 'backdrop') {
      nextStamps.push(assetKey);
    }
    addedImage = true;
  }

  if (addedWordsCount === 0 && !addedImage) {
    return { addedWordsCount: 0, addedImage: false };
  }

  const createdAt = existing?.manifest?.createdAt || Date.now();
  const nextVersionNum = existing
    ? (parseFloat(existing.installedVersion || '1.0') + 0.1).toFixed(1)
    : '1.0.0';

  const manifest = {
    id: HARVEST_PACK_ID,
    name: 'Custom Drop Additions',
    description: 'Words and artwork harvested from your Custom Drops.',
    version: String(nextVersionNum),
    author: 'Custom Drop Studio',
    isCustom: true,
    createdAt,
    subjects: nextSubjects,
    stamps: nextStamps,
    words: 'custom',
  };

  const words = {
    nouns: mergedNouns.combined,
    adjectives: mergedAdjs.combined,
    ensembles: mergedEns.combined,
  };

  const customBundle: CustomPackBundle = {
    manifest: {
      id: HARVEST_PACK_ID,
      name: manifest.name,
      description: manifest.description,
      version: manifest.version,
      author: manifest.author,
      isCustom: true,
      createdAt,
    },
    words,
    stamps: nextBundleStamps,
  };

  const storedPack: StoredPack = {
    id: HARVEST_PACK_ID,
    manifest,
    words,
    installedVersion: manifest.version,
    installedAt: Date.now(),
    isCustom: true,
    customBundle,
  };

  await savePackRecord(storedPack);
  await hydrateContentPools();

  return { addedWordsCount, addedImage };
}

export async function getCustomPacks(): Promise<StoredPack[]> {
  const all = await getAllInstalledPacks();
  return all.filter((p) => p.isCustom || p.manifest?.isCustom);
}

export async function deleteCustomPack(packId: string): Promise<void> {
  const pack = await getInstalledPack(packId);
  if (pack && pack.manifest?.subjects && Array.isArray(pack.manifest.subjects)) {
    for (const key of pack.manifest.subjects) {
      await removeStamp(key);
    }
  }
  if (pack && pack.manifest?.stamps && Array.isArray(pack.manifest.stamps)) {
    for (const key of pack.manifest.stamps) {
      await removeStamp(key);
    }
  }
  await removePack(packId);
  await hydrateContentPools();
}

export function exportCustomPackAsJson(bundle: CustomPackBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bundle.manifest.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}-crate.json`;
  a.click();
  URL.revokeObjectURL(url);
}