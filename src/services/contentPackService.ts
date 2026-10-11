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
import type { CustomPackBundle } from '../components/CrateForgeModal';

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

  // Download background stamps into IndexedDB Blobs
  if (manifest.stamps && Array.isArray(manifest.stamps)) {
    for (const filename of manifest.stamps) {
      const imgRes = await fetch(`${base}content/${folderPath}/stamps/${filename}`, { cache: 'no-store' });
      const blob = await imgRes.blob();
      await saveStamp(filename, blob);
    }
  }

  // Download subject illustrations into IndexedDB Blobs
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

// =========================================================================
// CUSTOM CRATE FORGE SERVICE METHODS
// =========================================================================

/**
 * Converts a data URL to an IndexedDB Blob safely
 */
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

/**
 * Saves a user-authored custom pack bundle into IndexedDB and immediately re-hydrates the randomizer
 */
export async function saveCustomPack(bundle: CustomPackBundle): Promise<StoredPack> {
  const stampKeys: string[] = [];

  // Convert each staged cutout to an IndexedDB Blob
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
 * Returns all custom packs created on this device
 */
export async function getCustomPacks(): Promise<StoredPack[]> {
  const all = await getAllInstalledPacks();
  return all.filter((p) => p.isCustom || p.manifest?.isCustom);
}

/**
 * Uninstalls a custom pack and purges its stored subject stamps from IndexedDB
 */
export async function deleteCustomPack(packId: string): Promise<void> {
  const pack = await getInstalledPack(packId);
  if (pack && pack.manifest?.subjects && Array.isArray(pack.manifest.subjects)) {
    for (const key of pack.manifest.subjects) {
      await removeStamp(key);
    }
  }
  await removePack(packId);
  await hydrateContentPools();
}

/**
 * Downloads a custom pack bundle directly as a standalone .json file
 */
export function exportCustomPackAsJson(bundle: CustomPackBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bundle.manifest.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}-crate.json`;
  a.click();
  URL.revokeObjectURL(url);
}