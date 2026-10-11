/* import { savePack, getInstalledPack, removePack, StoredPack, saveImageBlob } from './packStorage';

export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}content/`;
}

export async function getPackRegistry() {
  try {
    const res = await fetch(`${getBaseUrl()}index.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch { return { availablePacks: [] }; }
}

export async function checkPackStatus(packId: string, manifestUrl: string) {
  const local = await getInstalledPack(packId);
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const res = await fetch(`${getBaseUrl()}${manifestUrl}`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const remoteManifest = await res.json();
    return {
      isInstalled: !!local,
      installedVersion: local?.installedVersion || null,
      remoteVersion: remoteManifest.version,
      hasUpdate: !local || local?.installedVersion !== remoteManifest.version,
      manifest: remoteManifest,
    };
  } catch {
    return { isInstalled: !!local, installedVersion: local?.installedVersion || null, remoteVersion: null, hasUpdate: false, manifest: local?.manifest || null };
  }
}

export async function installPack(packId: string, manifestUrl: string): Promise<void> {
  const base = getBaseUrl();
  const manifestRes = await fetch(`${base}${manifestUrl}`, { cache: 'no-store' });
  const manifest = await manifestRes.json();
  
  let words = null;
  if (manifest.words) {
    const wordsPath = manifestUrl.replace('manifest.json', manifest.words);
    const wordsRes = await fetch(`${base}${wordsPath}`, { cache: 'no-store' });
    words = await wordsRes.json();
  }
  
  // Binary Image Downloader: Converts remote images to offline Blobs
  if (manifest.stamps && Array.isArray(manifest.stamps)) {
    for (const stampFile of manifest.stamps) {
      const stampPath = manifestUrl.replace('manifest.json', `stamps/${stampFile}`);
      const imgRes = await fetch(`${base}${stampPath}`);
      const blob = await imgRes.blob();
      const cleanName = stampFile.split('.')[0]; 
      await saveImageBlob(cleanName, blob);
    }
  }
  await savePack(manifest, words);
}

export async function uninstallPack(packId: string): Promise<void> {
  await removePack(packId);
}
 */
import { savePack, getInstalledPack, removePack, StoredPack, saveStamp } from './packStorage';

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

  // Actually download the images into IndexedDB Blobs!
  if (manifest.stamps && Array.isArray(manifest.stamps)) {
    for (const filename of manifest.stamps) {
      const imgRes = await fetch(`${base}content/${folderPath}/stamps/${filename}`, { cache: 'no-store' });
      const blob = await imgRes.blob();
      await saveStamp(filename, blob);
    }
  }

  await savePack(manifest, words);
  return { id: manifest.id, manifest, words, installedVersion: manifest.version, installedAt: Date.now() };
}

export async function uninstallCurrentPack(packId: string): Promise<void> {
  await removePack(packId);
}