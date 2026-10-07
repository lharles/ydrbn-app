export interface StoredPack {
  id: string;
  manifest: any;
  words: {
    nouns?: string[];
    adjectives?: string[];
    ensembles?: string[];
  };
  installedVersion: string;
  installedAt: number;
}

const DB_NAME = 'ydrbn_packs_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('packs')) {
        db.createObjectStore('packs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stamps')) {
        db.createObjectStore('stamps', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePack(manifest: any, words: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packs', 'readwrite');
    const packRecord: StoredPack = {
      id: manifest.id,
      manifest,
      words: words || {},
      installedVersion: manifest.version,
      installedAt: Date.now(),
    };
    tx.objectStore('packs').put(packRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getInstalledPack(id: string): Promise<StoredPack | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('packs', 'readonly');
      const req = tx.objectStore('packs').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removePack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packs', 'readwrite');
    tx.objectStore('packs').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
