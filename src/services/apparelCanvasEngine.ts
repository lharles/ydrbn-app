import { toCanvas } from 'html-to-image';
import { AlbumEntry } from '../types';
import { gagCanvasEngine } from './gagCanvasEngine';
import { loadRecipeAssets } from './assetManager';

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawManufacturerWatermark(ctx: CanvasRenderingContext2D, color: string) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = color || '#ffffff';
  ctx.globalAlpha = 0.72;
  ctx.font = 'bold 50px "Space Mono", monospace';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 6;
  ctx.fillText('Y.D.R.B.N.', 1800, 3582);
  ctx.restore();
}

async function captureSleeveDomCanvas(
  frontEl: HTMLElement,
  mode: 'cutout' | 'plaque'
): Promise<HTMLCanvasElement | null> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready.catch(() => {});
  }

  const width = frontEl.offsetWidth || 345;
  const height = frontEl.offsetHeight || 345;

  const filter = (node: Node): boolean => {
    if (node instanceof Element) {
      if (node.classList.contains('export-exclude')) return false;
      if (mode === 'cutout' && node.getAttribute('data-apparel-bg') === 'true') {
        return false;
      }
    }
    return true;
  };

  const styleOverride: Partial<CSSStyleDeclaration> =
    mode === 'cutout'
      ? {
          transform: 'none',
          webkitTransform: 'none',
          backfaceVisibility: 'visible',
          webkitBackfaceVisibility: 'visible',
          background: 'transparent',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          boxShadow: 'none',
          outline: 'none',
          borderRadius: '0px',
        }
      : {
          transform: 'none',
          webkitTransform: 'none',
          backfaceVisibility: 'visible',
          webkitBackfaceVisibility: 'visible',
          boxShadow: 'none',
          borderRadius: '0px',
        };

  try {
    return await toCanvas(frontEl, {
      width,
      height,
      pixelRatio: 6,
      filter,
      style: styleOverride,
    });
  } catch {
    try {
      return await toCanvas(frontEl, {
        width,
        height,
        pixelRatio: 3,
        filter,
        style: styleOverride,
      });
    } catch {
      return null;
    }
  }
}

export async function renderHighResFrontGraphic(
  album: AlbumEntry,
  mode: 'cutout' | 'plaque' = 'cutout'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 3600;
  canvas.height = 3600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return album.coverImageUrl;

  ctx.clearRect(0, 0, 3600, 3600);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const frontEl =
    typeof document !== 'undefined' ? document.getElementById('sleeve-front') : null;

  // MODE 1: FULL SLEEVE PLAQUE — Exact pixel-for-pixel WYSIWYG clone of #sleeve-front
  if (mode === 'plaque' && frontEl) {
    const plaqueCanvas = await captureSleeveDomCanvas(frontEl, 'plaque');
    if (plaqueCanvas) {
      ctx.drawImage(plaqueCanvas, 0, 0, 3600, 3600);
      drawManufacturerWatermark(ctx, album.textColor || '#ffffff');
      return canvas.toDataURL('image/png');
    }
  }

  // MODE 2: ISOLATED CUTOUT — Seeded transparent-backdrop subject + exact DOM typography & stickers
  if (mode === 'cutout') {
    let baseArtUrl = album.coverImageUrl;

    if (album.recipe && !album.recipe.customPhotoUrl) {
      await loadRecipeAssets(
        String(album.recipe.backdrop || ''),
        String(album.recipe.subject || '')
      ).catch(() => {});

      baseArtUrl = gagCanvasEngine.renderCover(album.bandName, album.albumTitle, album.recipe, {
        transparentBackdrop: true,
      });
    }

    const artImg = await loadImageElement(baseArtUrl);
    if (artImg) {
      ctx.drawImage(artImg, 0, 0, 3600, 3600);
    }

    if (frontEl) {
      const overlayCanvas = await captureSleeveDomCanvas(frontEl, 'cutout');
      if (overlayCanvas) {
        ctx.drawImage(overlayCanvas, 0, 0, 3600, 3600);
      }
    }

    drawManufacturerWatermark(ctx, album.textColor || '#ffffff');
    return canvas.toDataURL('image/png');
  }

  // Fallback if #sleeve-front was unavailable
  const fallbackImg = await loadImageElement(album.coverImageUrl);
  if (fallbackImg) {
    ctx.drawImage(fallbackImg, 0, 0, 3600, 3600);
  }
  drawManufacturerWatermark(ctx, album.textColor || '#ffffff');
  return canvas.toDataURL('image/png');
}
