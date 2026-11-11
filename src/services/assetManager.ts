import { getStamp, hasStampKey } from './packStorage';

export const imageCache: Record<string, HTMLImageElement> = {};

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
  if (imageCache[cleanName]?.complete && imageCache[cleanName].naturalWidth > 0) return imageCache[cleanName];

  if (!isFetchableImage(cleanName)) {
    return null;
  }

  // 1. Check in-memory IndexedDB key index first (0ms for core /assets/ files)
  if (await hasStampKey(cleanName)) {
    try {
      const blob = await getStamp(cleanName);
      if (blob) {
        return await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          const objUrl = URL.createObjectURL(blob);
          img.onload = () => {
            URL.revokeObjectURL(objUrl);
            if (img.naturalWidth === 0) {
              resolve(null);
              return;
            }
            imageCache[cleanName] = img;
            resolve(img);
          };
          img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            resolve(null);
          };
          img.src = objUrl;
        });
      }
    } catch {
      // fall through
    }
  }

  // 2. Static image file in /assets/ (with 1.5s timeout guard so slow mount I/O never stalls a drop)
  return new Promise<HTMLImageElement | null>((resolve) => {
    let settled = false;
    const finish = (val: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const timer = setTimeout(() => finish(null), 1500);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      if (img.naturalWidth === 0) {
        finish(null);
        return;
      }
      imageCache[cleanName] = img;
      finish(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(null);
    };
    img.src = `${import.meta.env.BASE_URL}assets/${cleanName}`;
  });
}

export async function loadRecipeAssets(
  backdrop?: string,
  subject?: string
): Promise<void> {
  const tasks: Promise<HTMLImageElement | null>[] = [];
  if (backdrop && isFetchableImage(backdrop)) tasks.push(loadAsset(backdrop));
  if (subject && isFetchableImage(subject)) tasks.push(loadAsset(subject));
  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
}

export async function preloadCustomAssets(): Promise<void[]> {
  return Promise.resolve([]);
}

export function getOrLoadImage(filename: string): HTMLImageElement | undefined {
  if (!filename) return undefined;
  const cleanName = filename.split('/').pop() || filename;
  if (imageCache[cleanName]) return imageCache[cleanName];
  if (!isFetchableImage(cleanName)) return undefined;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `${import.meta.env.BASE_URL}assets/${cleanName}`;
  img.onload = () => {
    if (img.naturalWidth > 0) imageCache[cleanName] = img;
  };
  img.onerror = () => {
    delete imageCache[cleanName];
  };
  return img;
}
