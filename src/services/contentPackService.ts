import { savePack, getInstalledPack, removePack, StoredPack } from './packStorage';

const PACK_ID = 'ydrbn-extended-core';

export function getPackBaseUrl(): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}content/extended`;
}

export interface PackStatus {
  isInstalled: boolean;
  installedVersion: string | null;
  remoteVersion: string | null;
  hasUpdate: boolean;
  manifest: any | null;
}

export async function checkPackStatus(): Promise<PackStatus> {
  const local = await getInstalledPack(PACK_ID);
  const baseUrl = getPackBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/manifest.json`, { cache: 'no-store' });
    if (!res.ok) {
      return {
        isInstalled: !!local,
        installedVersion: local ? local.installedVersion : null,
        remoteVersion: null,
        hasUpdate: false,
        manifest: local ? local.manifest : null,
      };
    }
    const remoteManifest = await res.json();
    return {
      isInstalled: !!local,
      installedVersion: local ? local.installedVersion : null,
      remoteVersion: remoteManifest.version,
      hasUpdate: !local || local.installedVersion !== remoteManifest.version,
      manifest: remoteManifest,
    };
  } catch {
    return {
      isInstalled: !!local,
      installedVersion: local ? local.installedVersion : null,
      remoteVersion: null,
      hasUpdate: false,
      manifest: local ? local.manifest : null,
    };
  }
}

export async function installCurrentPack(): Promise<StoredPack> {
  const baseUrl = getPackBaseUrl();
  const manifestRes = await fetch(`${baseUrl}/manifest.json`, { cache: 'no-store' });
  if (!manifestRes.ok) throw new Error('Failed to download manifest.json');
  const manifest = await manifestRes.json();

  const wordsUrl = `${baseUrl}/${manifest.words || 'words.json'}`;
  const wordsRes = await fetch(wordsUrl, { cache: 'no-store' });
  if (!wordsRes.ok) throw new Error('Failed to download words.json');
  const words = await wordsRes.json();

  await savePack(manifest, words);
  return {
    id: manifest.id,
    manifest,
    words,
    installedVersion: manifest.version,
    installedAt: Date.now(),
  };
}

export async function uninstallCurrentPack(): Promise<void> {
  await removePack(PACK_ID);
}
