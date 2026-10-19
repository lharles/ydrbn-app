import { AlbumEntry } from '../types';
import { gagCanvasEngine } from './gagCanvasEngine';

function drawProceduralTextAndStickers(ctx: CanvasRenderingContext2D, album: AlbumEntry) {
  const fontMap: Record<string, string> = {
    medieval: 'MedievalSharp',
    bubble: 'Righteous',
    comic: 'Bangers',
    marker: 'Permanent Marker',
    monospace: 'Space Mono',
    chrome: 'Russo One',
    'vintage-title': 'Russo One',
    'liner-notes': 'Courier Prime',
  };
  const rawFont = fontMap[album.fontFamily || ''] || 'Space Grotesk';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (album.shadowStyle !== 'none') {
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 12;
  }

  ctx.translate(1800, 1800);
  if (album.skewDeg) {
    ctx.rotate((album.skewDeg * Math.PI) / 180);
  }
  ctx.translate(-1800, -1800);

  let yBand = 1500;
  let yAlbum = 1950;
  const layout = album.titleLayout || '';

  if (layout.includes('top')) {
    yBand = 500;
    yAlbum = 850;
  } else if (layout.includes('bottom')) {
    yBand = 2750;
    yAlbum = 3100;
  } else if (layout.includes('split')) {
    yBand = 500;
    yAlbum = 3100;
  }

  ctx.fillStyle = album.textColor || '#ffffff';
  ctx.font = `900 340px "${rawFont}", sans-serif`;
  ctx.fillText(album.bandName.toUpperCase(), 1800, yBand, 3200);

  ctx.font = `bold italic 220px "${rawFont}", sans-serif`;
  ctx.fillText(`"${album.albumTitle}"`, 1800, yAlbum, 3200);

  if (album.stickers && album.stickers.length > 0) {
    album.stickers.forEach((sticker, idx) => {
      ctx.save();
      const sx = 2900 - idx * 200;
      const sy = 600 + idx * 500;
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);

      ctx.fillStyle = sticker.bg || '#ef4444';
      ctx.strokeStyle = sticker.border || '#ffffff';
      ctx.lineWidth = 14;

      if (sticker.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, 320, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-380, -160, 760, 320);
        ctx.strokeRect(-380, -160, 760, 320);
      }

      ctx.fillStyle = sticker.color || '#ffffff';
      ctx.font = '900 65px "Space Grotesk", sans-serif';
      ctx.shadowColor = 'transparent';
      ctx.fillText(sticker.text, 0, 0, 680);
      ctx.restore();
    });
  }

  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = album.textColor || '#ffffff';
  ctx.globalAlpha = 0.85;
  ctx.font = 'bold 60px "Space Mono", monospace';
  ctx.shadowColor = 'transparent';
  ctx.fillText('Y.D.R.B.N.', 1800, 3560);
  ctx.restore();
}

export function renderHighResFrontGraphic(
  album: AlbumEntry,
  mode: 'cutout' | 'plaque' = 'cutout'
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 3600;
    canvas.height = 3600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(album.coverImageUrl);

    // Use native transparent layer rendering when a procedural recipe exists without a custom photo override
    const sourceUrl =
      mode === 'cutout' && album.recipe && !album.recipe.customPhotoUrl
        ? gagCanvasEngine.renderCover(album.bandName, album.albumTitle, album.recipe, {
            transparentBackdrop: true,
          })
        : album.coverImageUrl;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 3600, 3600);
      drawProceduralTextAndStickers(ctx, album);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(album.coverImageUrl);
    img.src = sourceUrl;
  });
}