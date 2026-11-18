export interface StoredPack {
  id: string;
  manifest: any;
  words: any;
  installedVersion: string;
  installedAt: number;
  isCustom?: boolean;
  customBundle?: any;
}

const DB_NAME = 'ydrbn_packs_db';
const DB_VERSION = 2;

let dbInstancePromise: Promise<IDBDatabase> | null = null;
let stampKeySetCache: Set<string> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstancePromise) return dbInstancePromise;

  dbInstancePromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('packs')) db.createObjectStore('packs', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('stamps')) db.createObjectStore('stamps', { keyPath: 'id' });
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        dbInstancePromise = null;
        stampKeySetCache = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbInstancePromise = null;
      reject(req.error);
    };
  });

  return dbInstancePromise;
}

export async function hasStampKey(id: string): Promise<boolean> {
  try {
    if (!stampKeySetCache) {
      const db = await openDB();
      stampKeySetCache = await new Promise<Set<string>>((resolve) => {
        const tx = db.transaction('stamps', 'readonly');
        const req = tx.objectStore('stamps').getAllKeys();
        req.onsuccess = () => resolve(new Set((req.result || []).map(String)));
        req.onerror = () => resolve(new Set());
      });
    }
    return stampKeySetCache.has(id);
  } catch {
    return false;
  }
}

export async function savePack(manifest: any, words: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packs', 'readwrite');
    tx.objectStore('packs').put({
      id: manifest.id,
      manifest,
      words: words || {},
      installedVersion: manifest.version,
      installedAt: Date.now(),
      isCustom: manifest.isCustom || false,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePackRecord(record: StoredPack): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packs', 'readwrite');
    tx.objectStore('packs').put(record);
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

export async function saveImageBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite');
    tx.objectStore('stamps').put({ id, blob });
    tx.oncomplete = () => {
      stampKeySetCache?.add(id);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImageBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('stamps', 'readonly');
      const req = tx.objectStore('stamps').get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllInstalledPacks(): Promise<StoredPack[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packs', 'readonly');
    const req = tx.objectStore('packs').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(tx.error);
  });
}

export async function saveStamp(id: string, blob: Blob): Promise<void> {
  return saveImageBlob(id, blob);
}

export async function getStamp(id: string): Promise<Blob | null> {
  return getImageBlob(id);
}

export async function removeStamp(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite');
    tx.objectStore('stamps').delete(id);
    tx.oncomplete = () => {
      stampKeySetCache?.delete(id);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
