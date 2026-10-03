export const imageCache: Record<string, HTMLImageElement> = {};
const loadedKeys: string[] = [];
const MAX_CACHED_IMAGES = 24;

export function loadAsset(filename: string): Promise<HTMLImageElement | null> {
  const cleanName = filename.trim();
  if (!cleanName || !cleanName.match(/\.(png|jpg|jpeg|webp)$/i)) {
    return Promise.resolve(null);
  }

  if (imageCache[cleanName]?.complete && imageCache[cleanName].naturalWidth > 0) {
    return Promise.resolve(imageCache[cleanName]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `/assets/${cleanName}`;

    img.onload = () => {
      if (loadedKeys.length >= MAX_CACHED_IMAGES) {
        const oldest = loadedKeys.shift();
        if (oldest && imageCache[oldest]) {
          imageCache[oldest].src = '';
          delete imageCache[oldest];
        }
      }
      imageCache[cleanName] = img;
      loadedKeys.push(cleanName);
      resolve(img);
    };

    img.onerror = () => {
      console.warn(`[AssetManager] Could not load /assets/${cleanName}`);
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
  img.src = `/assets/${filename}`;
  img.onload = () => { imageCache[filename] = img; };
  imageCache[filename] = img;
  return img;
}