import { AlbumEntry } from '../types';

function drawProceduralTextAndStickers(ctx: CanvasRenderingContext2D, album: AlbumEntry) {
  // Map procedural CSS tags to real fonts
  const fontMap: Record<string, string> = {
    medieval: 'MedievalSharp',
    bubble: 'Righteous',
    comic: 'Bangers',
    marker: 'Permanent Marker',
    monospace: 'Space Mono',
    chrome: 'Russo One',
    'vintage-title': 'Russo One',
    'liner-notes': 'Courier Prime'
  };
  const rawFont = fontMap[album.fontFamily] || 'Space Grotesk';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Heavy Text Drop Shadow for Vintage Feel
  if (album.shadowStyle !== 'none') {
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 12;
  }

  // Handle rotational skew
  ctx.translate(1800, 1800);
  if (album.skewDeg) {
    ctx.rotate((album.skewDeg * Math.PI) / 180);
  }
  ctx.translate(-1800, -1800);

  // Position based on layout type
  let yBand = 1500;
  let yAlbum = 1950;
  const layout = album.titleLayout || '';

  if (layout.includes('top')) {
    yBand = 500; yAlbum = 850;
  } else if (layout.includes('bottom')) {
    yBand = 2750; yAlbum = 3100;
  } else if (layout.includes('split')) {
    yBand = 500; yAlbum = 3100;
  }

  // Draw Band Name
  ctx.fillStyle = album.textColor || '#ffffff';
  ctx.font = `900 340px "${rawFont}", sans-serif`;
  ctx.fillText(album.bandName.toUpperCase(), 1800, yBand, 3200);

  // Draw Album Title
  ctx.font = `bold italic 220px "${rawFont}", sans-serif`;
  ctx.fillText(`"${album.albumTitle}"`, 1800, yAlbum, 3200);

  // Draw Procedural Hype Stickers
  if (album.stickers && album.stickers.length > 0) {
    album.stickers.forEach((sticker, idx) => {
      ctx.save();
      const sx = 2900 - (idx * 200);
      const sy = 600 + (idx * 500);
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
      ctx.shadowColor = 'transparent'; // Remove shadow for crisp sticker text
      ctx.fillText(sticker.text, 0, 0, 680);
      ctx.restore();
    });
  }

  ctx.restore();

  // Draw Tiny Manufacturer Mark at the Extreme Bottom
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = album.textColor || '#ffffff'; // Dynamically matches the album's text color
  ctx.globalAlpha = 0.85; // Slight transparency to mimic a subtle fabric stamp
  ctx.font = 'bold 60px "Space Mono", monospace';
  ctx.shadowColor = 'transparent'; 
  ctx.fillText('Y.D.R.B.N.', 1800, 3560); // Centered, sitting right on the bottom edge
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

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Draw the base image
      ctx.drawImage(img, 0, 0, 3600, 3600);

      // 2. Strip background for transparent mode BEFORE painting text
      if (mode === 'cutout') {
        const imgData = ctx.getImageData(0, 0, 3600, 3600);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r < 25 && g < 25 && b < 25) {
            data[i + 3] = 0; // Set alpha to transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // 3. Burn Typography, Stickers, and Watermark on top
      drawProceduralTextAndStickers(ctx, album);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(album.coverImageUrl);
    img.src = album.coverImageUrl;
  });
}