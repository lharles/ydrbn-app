import { savePack, getInstalledPack, removePack, StoredPack } from './packStorage';
const PACK_ID = 'ydrbn-extended-core';

export function getPackBaseUrl(): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}content/extended`;
}
export async function checkPackStatus() {
  const local = await getInstalledPack(PACK_ID);
  const baseUrl = getPackBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/manifest.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const remoteManifest = await res.json();
    return {
      isInstalled: !!local,
      installedVersion: local ? local.installedVersion : null,
      remoteVersion: remoteManifest.version,
      hasUpdate: !local || local.installedVersion !== remoteManifest.version,
      manifest: remoteManifest,
    };
  } catch {
    return { isInstalled: !!local, installedVersion: local?.installedVersion || null, remoteVersion: null, hasUpdate: false, manifest: local?.manifest || null };
  }
}
export async function installCurrentPack(): Promise<StoredPack> {
  const baseUrl = getPackBaseUrl();
  const manifestRes = await fetch(`${baseUrl}/manifest.json`, { cache: 'no-store' });
  const manifest = await manifestRes.json();
  const wordsRes = await fetch(`${baseUrl}/${manifest.words || 'words.json'}`, { cache: 'no-store' });
  const words = await wordsRes.json();
  await savePack(manifest, words);
  return { id: manifest.id, manifest, words, installedVersion: manifest.version, installedAt: Date.now() };
}
export async function uninstallCurrentPack(): Promise<void> {
  await removePack(PACK_ID);
}
