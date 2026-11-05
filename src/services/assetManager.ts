import { getStamp } from './packStorage';

export const imageCache: Record<string, HTMLImageElement> = {};

// Helper: True only if the identifier is a real file resource, not a procedural canvas routine
function isFetchableImage(filename: string): boolean {
  return (
    /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(filename) ||
    filename.startsWith('data:') ||
    filename.startsWith('blob:')
  );
}

export async function loadAsset(filename?: string): Promise<HTMLImageElement | null> {
  if (!filename) return null;

  const cleanName = filename.split('/').pop() || filename;
  if (imageCache[cleanName]) return imageCache[cleanName];

  return new Promise(async (resolve) => {
    // 1. Check IndexedDB first (stamps from installed cargo packs)
    try {
      const blob = await getStamp(cleanName);
      if (blob) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          if (img.naturalWidth === 0) { resolve(null); return; }
          imageCache[cleanName] = img;
          resolve(img);
        };
        img.onerror = () => resolve(null);
        return;
      }
    } catch {
      // Proceed to fallback
    }

    // 2. If it is a procedural canvas routine (no image file extension), do not fire a network request
    if (!isFetchableImage(cleanName)) {
      resolve(null);
      return;
    }

    // 3. Static image file fallback (/assets/)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `${import.meta.env.BASE_URL}assets/${cleanName}`;

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
  backdrop?: string,
  subject?: string
): Promise<void> {
  const tasks: Promise<HTMLImageElement | null>[] = [];
  if (backdrop) tasks.push(loadAsset(backdrop));
  if (subject) tasks.push(loadAsset(subject));
  await Promise.all(tasks);
}

export async function preloadCustomAssets(): Promise<void[]> {
  return Promise.resolve([]);
}

export function getOrLoadImage(filename: string): HTMLImageElement | undefined {
  if (!filename) return undefined;
  const cleanName = filename.split('/').pop() || filename;
  if (imageCache[cleanName]) return imageCache[cleanName];

  // Skip procedural names without image extensions
  if (!isFetchableImage(cleanName)) {
    return undefined;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `${import.meta.env.BASE_URL}assets/${cleanName}`;
  img.onload = () => { imageCache[cleanName] = img; };
  imageCache[cleanName] = img;
  return img;
}