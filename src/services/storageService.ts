import { AlbumEntry } from '../types';
import { getStarterCrateAlbums } from '../data/starterCrate';
import { gagCanvasEngine } from './gagCanvasEngine';

const STORAGE_KEY_ALBUMS = 'ydrbn_albums_v6';
const STORAGE_KEY_DEV_MODE = 'ydrbn_dev_mode_unlocked';
const STORAGE_KEY_LAST_DROP = 'ydrbn_last_drop_time';
const STORAGE_KEY_CUSTOM_PHOTOS_FLAG = 'ydrbn_use_custom_photos';
export const STORAGE_KEY_RECENT_ALBUMS = 'ydrbn_recent_albums';
export const MAX_RECENT_ALBUMS = 28;

/**
 * Loads the rolling recentAlbums list from localStorage (capped at 28)
 */
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

/**
 * Saves recentAlbums array to localStorage, enforcing the 28-item cap
 */
export function saveRecentAlbums(recentAlbums: string[]): void {
  try {
    const capped = recentAlbums.slice(0, MAX_RECENT_ALBUMS);
    localStorage.setItem(STORAGE_KEY_RECENT_ALBUMS, JSON.stringify(capped));
  } catch (e) {
    console.error('Failed to save recent albums:', e);
  }
}

/**
 * Adds an album title to recentAlbums with rolling FIFO memory capped at 28 items
 */
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

/**
 * Remove obsolete large localStorage keys to reclaim browser quota
 */
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

export const MAX_ARCHIVE_LIMIT = 14;

/**
 * Loads albums from localStorage and generates in-memory cover data URLs
 * dynamically from lightweight JSON recipes (<2ms execution).
 */
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

    // Enforce 14-record archive rollover limit on loaded data
    if (parsed.length > MAX_ARCHIVE_LIMIT) {
      parsed = parsed.slice(parsed.length - MAX_ARCHIVE_LIMIT);
      saveAlbums(parsed);
    }

    // Reconstruct in-memory cover image URLs for any album with a recipe
    const verified = parsed.map((album) => {
      if (!album.coverImageUrl && album.recipe) {
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
    const fallback = getStarterCrateAlbums().slice(0, MAX_ARCHIVE_LIMIT);
    return fallback;
  }
}

/**
 * Saves albums to localStorage without bloating quota.
 * CRITICAL: Strips heavy base64 coverImageUrl strings for all procedural albums
 * since their artwork is instantly rendered from the JSON recipe.
 * Strict 14-record FIFO queue: permanently drops oldest records when length > 14.
 */
export function saveAlbums(albums: AlbumEntry[]): void {
  cleanupLegacyStorage();
  try {
    // Enforce strict 14-record archive rollover limit (FIFO queue)
    const capped = albums.length > MAX_ARCHIVE_LIMIT 
      ? albums.slice(albums.length - MAX_ARCHIVE_LIMIT) 
      : albums;

    const serializable = capped.map((album) => {
      if (album.recipe) {
        // Keep recipe, strip multi-megabyte base64 data URL
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
      cleanupLegacyStorage();
      const capped = albums.length > MAX_ARCHIVE_LIMIT 
        ? albums.slice(albums.length - MAX_ARCHIVE_LIMIT) 
        : albums;
      // Emergency stripped schema
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

export function recordDropTimestamp(): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_DROP, Date.now().toString());
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
