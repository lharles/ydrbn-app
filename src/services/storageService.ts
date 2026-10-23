import { AlbumEntry } from '../types';
import { getStarterCrateAlbums } from '../data/starterCrate';
import { gagCanvasEngine } from './gagCanvasEngine';
import { saveImageBlob, getImageBlob } from './packStorage';

const STORAGE_KEY_ALBUMS = 'ydrbn_albums_v6';
const STORAGE_KEY_DEV_MODE = 'ydrbn_dev_mode_unlocked';
const STORAGE_KEY_LAST_DROP = 'ydrbn_last_drop_time';
const STORAGE_KEY_CUSTOM_PHOTOS_FLAG = 'ydrbn_use_custom_photos';
const STORAGE_KEY_AUTO_CHECK_UPDATES = 'ydrbn_auto_check_updates';
export const STORAGE_KEY_RECENT_ALBUMS = 'ydrbn_recent_albums';
export const MAX_RECENT_ALBUMS = 28;
export const MAX_ARCHIVE_LIMIT = 14;

export function getRecentAlbums(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_ALBUMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentAlbums(recentAlbums: string[]): void {
  try {
    const capped = recentAlbums.slice(0, MAX_RECENT_ALBUMS);
    localStorage.setItem(STORAGE_KEY_RECENT_ALBUMS, JSON.stringify(capped));
  } catch (e) {
    console.error('Failed to save recent albums:', e);
  }
}

export function recordRecentAlbum(title: string): void {
  try {
    const clean = title.trim();
    if (!clean) return;
    const list = getRecentAlbums();
    list.unshift(clean);
    while (list.length > MAX_RECENT_ALBUMS) {
      list.pop();
    }
    saveRecentAlbums(list);
  } catch (e) {
    console.error('Failed to record recent album:', e);
  }
}

function cleanupLegacyStorage(): void {
  try {
    const legacyKeys = [
      'ydrbn_albums',
      'ydrbn_albums_v1',
      'ydrbn_albums_v2',
      'ydrbn_albums_v3',
      'ydrbn_albums_v4',
      'ydrbn_albums_v5',
      'ydrbn_cached_photos',
    ];
    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

/**
 * Evicts oldest non-favorite albums first when enforcing MAX_ARCHIVE_LIMIT
 */
export function enforceArchiveLimit(albums: AlbumEntry[]): AlbumEntry[] {
  if (albums.length <= MAX_ARCHIVE_LIMIT) return albums;
  const result = [...albums];
  while (result.length > MAX_ARCHIVE_LIMIT) {
    const oldestNonFavIdx = result.findIndex((a) => !a.isFavorite);
    if (oldestNonFavIdx !== -1) {
      result.splice(oldestNonFavIdx, 1);
    } else {
      result.shift();
    }
  }
  return result;
}

/**
 * Restores a custom photo DataURL from IndexedDB if stripped from localStorage
 */
export async function restoreCustomPhotoFromIdb(albumId: string): Promise<string | null> {
  try {
    const blob = await getImageBlob(`custom_cover_${albumId}`);
    if (blob) {
      return await blob.text();
    }
  } catch {
    // ignore
  }
  return null;
}

export function loadAlbums(): AlbumEntry[] {
  cleanupLegacyStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALBUMS);
    if (!raw) {
      const initial = getStarterCrateAlbums().slice(0, MAX_ARCHIVE_LIMIT);
      saveAlbums(initial);
      return initial;
    }

    let parsed: AlbumEntry[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getStarterCrateAlbums().slice(0, MAX_ARCHIVE_LIMIT);
      saveAlbums(initial);
      return initial;
    }

    if (parsed.length > MAX_ARCHIVE_LIMIT) {
      parsed = enforceArchiveLimit(parsed);
      saveAlbums(parsed);
    }

    const verified = parsed.map((album) => {
      if (!album.coverImageUrl && album.recipe && !album.recipe.customPhotoUrl) {
        album.coverImageUrl = gagCanvasEngine.renderCover(
          album.bandName,
          album.albumTitle,
          album.recipe
        );
      }
      return album;
    });

    return verified;
  } catch (e) {
    console.error('Failed to load albums from localStorage:', e);
    return getStarterCrateAlbums().slice(0, MAX_ARCHIVE_LIMIT);
  }
}

export function saveAlbums(albums: AlbumEntry[]): void {
  cleanupLegacyStorage();
  const capped = enforceArchiveLimit(albums);

  try {
    const serializable = capped.map((album) => {
      // Offload custom photo base64 strings into IndexedDB so localStorage stays tiny
      if (album.recipe?.customPhotoUrl && album.coverImageUrl?.startsWith('data:')) {
        const blob = new Blob([album.coverImageUrl], { type: 'text/plain' });
        saveImageBlob(`custom_cover_${album.id}`, blob).catch(() => {});
        const { coverImageUrl, ...rest } = album;
        return {
          ...rest,
          coverImageUrl: '',
        };
      }

      // Strip procedural coverImageUrl (re-rendered deterministically from recipe)
      if (album.recipe && !album.recipe.customPhotoUrl) {
        const { coverImageUrl, ...rest } = album;
        return {
          ...rest,
          coverImageUrl: '',
        };
      }
      return album;
    });

    localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(serializable));
  } catch (e) {
    console.warn('Quota warning; attempting emergency minimal compression:', e);
    try {
      const minimal = capped.map((a) => ({
        id: a.id,
        bandName: a.bandName,
        albumTitle: a.albumTitle,
        year: a.year,
        catalogNumber: a.catalogNumber,
        tracks: a.tracks,
        fauxReviews: a.fauxReviews,
        bandBio: a.bandBio,
        isFavorite: a.isFavorite,
        skewDeg: a.skewDeg,
        stickers: a.stickers,
        recipe: a.recipe,
        audioPreset: a.audioPreset,
        fontFamily: a.fontFamily,
        textColor: a.textColor,
        shadowStyle: a.shadowStyle,
        titleLayout: a.titleLayout,
        timestamp: a.timestamp,
        coverImageUrl: '',
      }));
      localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(minimal));
    } catch (inner) {
      console.error('Failed to save albums even with minimal schema:', inner);
    }
  }
}

export function getDevModeUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_DEV_MODE) === 'true';
  } catch {
    return false;
  }
}

export function setDevModeUnlocked(unlocked: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEV_MODE, unlocked ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set dev mode in localStorage:', e);
  }
}

export function getLastDropTimestamp(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_LAST_DROP);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function recordDropTimestamp(timestamp: number = Date.now()): void {
  try {
    if (timestamp <= 0) {
      localStorage.removeItem(STORAGE_KEY_LAST_DROP);
    } else {
      localStorage.setItem(STORAGE_KEY_LAST_DROP, timestamp.toString());
    }
  } catch (e) {
    console.error('Failed to record drop timestamp:', e);
  }
}

export function getUseCustomPhotosPref(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_PHOTOS_FLAG) === 'true';
  } catch {
    return false;
  }
}

export function getAutoCheckUpdatesPref(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTO_CHECK_UPDATES) === 'true';
  } catch {
    return false;
  }
}

export function setAutoCheckUpdatesPref(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_CHECK_UPDATES, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save auto check updates pref:', e);
  }
}

export function setUseCustomPhotosPref(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PHOTOS_FLAG, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save custom photos pref:', e);
  }
}

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function getCooldownRemaining(lastDrop: number, isDevMode: boolean): number {
  if (isDevMode) return 0;
  if (!lastDrop) return 0;
  const elapsed = Date.now() - lastDrop;
  const remaining = TWENTY_FOUR_HOURS_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

export function formatCooldown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export async function performFactoryReset(): Promise<void> {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error('Failed to clear web storage:', e);
  }

  try {
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('ydrbn_packs_db');
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name);
        }
      }
    }
  } catch (e) {
    console.error('Failed to drop IndexedDB:', e);
  }

  try {
    if (typeof caches !== 'undefined') {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  } catch (e) {
    console.error('Failed to purge CacheStorage:', e);
  }

  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
  } catch (e) {
    console.error('Failed to unregister service workers:', e);
  }

  window.location.href = `${window.location.origin}${window.location.pathname}?reset=${Date.now()}`;
}