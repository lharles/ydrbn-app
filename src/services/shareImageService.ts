import { toBlob } from 'html-to-image';
import { AlbumEntry } from '../types';

/**
 * Filter out in-app UI chrome (like "Zoom" and "↺ Flip" badges)
 * from being included in the exported share image.
 */
const filterUiChrome = (node: HTMLElement) => {
  if (node.classList && node.classList.contains('export-exclude')) {
    return false;
  }
  return true;
};

// 1. Capture WYSIWYG Front Cover (Rendered at 3x resolution ~1020x1020)
export async function compositeFrontSleeve(album: AlbumEntry): Promise<Blob> {
  const frontEl = document.getElementById('sleeve-front');
  if (!frontEl) {
    throw new Error('Front sleeve element not found in DOM');
  }

  // Ensure all Google fonts and web fonts are fully rendered
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready.catch(() => {});
  }

  const blob = await toBlob(frontEl, {
    quality: 0.95,
    pixelRatio: 3, // Scales 340px to ~1020px for crisp high-resolution output
    filter: filterUiChrome,
  });

  if (!blob) {
    throw new Error('Failed to generate front sleeve image blob');
  }

  return blob;
}

// 2. Capture WYSIWYG Back Sleeve (Un-rotates the 3D CSS flip for a flat image)
export async function compositeBackSleeve(album: AlbumEntry): Promise<Blob> {
  const backEl = document.getElementById('sleeve-back');
  if (!backEl) {
    throw new Error('Back sleeve element not found in DOM');
  }

  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready.catch(() => {});
  }

  const blob = await toBlob(backEl, {
    quality: 0.95,
    pixelRatio: 3,
    filter: filterUiChrome,
    // Temporarily un-rotate the 3D card flip so the export is upright
    style: {
      transform: 'none',
      WebkitTransform: 'none',
      backfaceVisibility: 'visible',
      WebkitBackfaceVisibility: 'visible',
    },
  });

  if (!blob) {
    throw new Error('Failed to generate back sleeve image blob');
  }

  return blob;
}