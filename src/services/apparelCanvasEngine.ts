import { AlbumEntry, TitleComposition } from '../types';
import { gagCanvasEngine } from './gagCanvasEngine';

function normalizeCoverLayout(
  layout?: TitleComposition
): 'top-arc' | 'diagonal-cross' | 'split-corners' | 'bottom-banner' {
  switch (layout) {
    case 'top-arc':
    case 'split-horizontal':
    case 'poster-grid':
      return 'top-arc';
    case 'diagonal-cross':
    case 'center-stack':
    case 'offset-stack':
    case 'overlap-subject':
    case 'giant-background':
      return 'diagonal-cross';
    case 'split-corners':
    case 'corner-stamp':
    case 'floating-label':
    case 'vertical-edge':
      return 'split-corners';
    case 'bottom-banner':
    case 'tiny-caption':
    case 'circular-seal':
    default:
      return 'bottom-banner';
  }
}

function drawProceduralTextAndStickers(ctx: CanvasRenderingContext2D, album: AlbumEntry) {
  const fontMap: Record<string, string> = {
    medieval: 'MedievalSharp',
    ornamental: 'MedievalSharp',
    bubble: 'Righteous',
    circus: 'Righteous',
    comic: 'Bangers',
    graffiti: 'Bangers',
    marker: 'Permanent Marker',
    handwritten: 'Permanent Marker',
    schoolbook: 'Permanent Marker',
    monospace: 'Space Mono',
    arcade: 'Space Mono',
    typewriter: 'Special Elite',
    chrome: 'Russo One',
    space: 'Russo One',
    futuristic: 'Russo One',
    'vintage-title': 'Russo One',
    stencil: 'Oswald',
    industrial: 'Oswald',
    western: 'Russo One',
    serif: 'Russo One',
    newspaper: 'Courier Prime',
    'liner-notes': 'Courier Prime',
  };
  const rawFont = fontMap[album.fontFamily || ''] || 'Russo One';
  const normalizedLayout = normalizeCoverLayout(album.titleLayout);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (album.shadowStyle !== 'none') {
    ctx.shadowColor = 'rgba(0,0,0,0.88)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetX = 14;
    ctx.shadowOffsetY = 14;
  }

  ctx.save();
  ctx.translate(1800, 1800);
  if (album.skewDeg) {
    const safeSkew =
      normalizedLayout === 'bottom-banner'
        ? Math.max(-2, Math.min(2, album.skewDeg))
        : Math.max(-12, Math.min(12, album.skewDeg));
    ctx.rotate((safeSkew * Math.PI) / 180);
  }
  ctx.translate(-1800, -1800);

  let yBand = 1620;
  let yAlbum = 2020;

  if (normalizedLayout === 'top-arc') {
    yBand = 520;
    yAlbum = 880;
  } else if (normalizedLayout === 'bottom-banner') {
    yBand = 2820;
    yAlbum = 3180;
  } else if (normalizedLayout === 'split-corners') {
    yBand = 520;
    yAlbum = 3120;
  }

  ctx.fillStyle = album.textColor || '#ffffff';
  ctx.font = `900 320px "${rawFont}", sans-serif`;
  ctx.fillText(album.bandName.toUpperCase(), 1800, yBand, 3200);

  ctx.fillStyle = '#fde68a';
  ctx.font = `bold italic 210px "Courier Prime", "${rawFont}", monospace`;
  ctx.fillText(`"${album.albumTitle}"`, 1800, yAlbum, 3200);
  ctx.restore();

  // Render Hype Stickers in their layout-aware corners
  const visibleStickers = album.stickers
    ? album.stickers.slice(0, normalizedLayout === 'split-corners' ? 1 : 2)
    : [];

  visibleStickers.forEach((sticker, idx) => {
    ctx.save();
    let sx = 620;
    let sy = 3050;

    if (normalizedLayout === 'top-arc') {
      sx = idx === 0 ? 620 : 2980;
      sy = 3050;
    } else if (normalizedLayout === 'split-corners') {
      sx = 620;
      sy = 3050;
    } else if (normalizedLayout === 'diagonal-cross') {
      sx = idx === 0 ? 2980 : 620;
      sy = idx === 0 ? 550 : 3050;
    } else {
      sx = idx === 0 ? 620 : 2980;
      sy = 550;
    }

    ctx.translate(sx, sy);
    ctx.rotate((sticker.rotation * Math.PI) / 180);

    ctx.fillStyle = sticker.bg || '#ef4444';
    ctx.strokeStyle = sticker.border || '#ffffff';
    ctx.lineWidth = 14;

    if (sticker.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, 310, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(-380, -160, 760, 320);
      ctx.strokeRect(-380, -160, 760, 320);
    }

    ctx.fillStyle = sticker.color || '#ffffff';
    ctx.font = '900 62px "Oswald", sans-serif';
    ctx.shadowColor = 'transparent';
    ctx.fillText(sticker.text, 0, 0, 680);
    ctx.restore();
  });

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

    const sourceUrl =
      mode === 'cutout' && album.recipe && !album.recipe.customPhotoUrl
        ? gagCanvasEngine.renderCover(album.bandName, album.albumTitle, album.recipe, {
            transparentBackdrop: true,
          })
        : album.coverImageUrl;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 3600, 3600);
      drawProceduralTextAndStickers(ctx, album);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(album.coverImageUrl);
    img.src = sourceUrl;
  });
}