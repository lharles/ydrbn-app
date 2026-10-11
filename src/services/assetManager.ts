import { getStamp } from './packStorage';
import { getImageBlob } from './packStorage';
export const imageCache: Record<string, HTMLImageElement> = {};
const loadedKeys: string[] = [];
const MAX_CACHED_IMAGES = 24;

export async function loadAsset(filename: string): Promise<HTMLImageElement | null> {
  const cleanName = filename.split('/').pop() || filename;
  if (imageCache[cleanName]) return imageCache[cleanName];

  return new Promise(async (resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // 1. Try to fetch the Blob from IndexedDB (The Cargo Ship)
    try {
      const blob = await getStamp(cleanName);
      if (blob) {
        img.src = URL.createObjectURL(blob);
      } else {
        // 2. Fallback to local /assets/ folder (Core Assets)
        img.src = `${import.meta.env.BASE_URL}assets/${cleanName}`;
      }
    } catch (err) {
      img.src = `${import.meta.env.BASE_URL}assets/${cleanName}`;
    }

    img.onload = () => {
      if (img.naturalWidth === 0) { resolve(null); return; }
      imageCache[cleanName] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
  });
}

export async function loadRecipeAssets(
  backdrop: string,
  subject: string
): Promise<void> {
  await Promise.all([loadAsset(backdrop), loadAsset(subject)]);
}

export async function preloadCustomAssets(): Promise<void[]> {
  return Promise.resolve([]);
}

export function getOrLoadImage(filename: string): HTMLImageElement | undefined {
  if (imageCache[filename]) return imageCache[filename];
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `${import.meta.env.BASE_URL}assets/${filename}`;
  img.onload = () => { imageCache[filename] = img; };
  imageCache[filename] = img;
  return img;
}