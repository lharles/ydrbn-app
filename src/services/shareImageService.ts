import { AlbumEntry, HypeSticker, TitleFontFamily, TitleShadowStyle, TitleComposition } from '../types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function getCanvasFontFamily(fontFamily?: TitleFontFamily): string {
  switch (fontFamily) {
    case 'medieval':
      return '"MedievalSharp", serif';
    case 'bubble':
      return '"Righteous", cursive, sans-serif';
    case 'comic':
      return '"Bangers", cursive, sans-serif';
    case 'marker':
      return '"Permanent Marker", cursive, sans-serif';
    case 'monospace':
    case 'typewriter':
    case 'arcade':
      return '"Space Mono", monospace';
    case 'chrome':
    case 'space':
    case 'futuristic':
      return '"Russo One", "Orbitron", sans-serif';
    case 'western':
    case 'newspaper':
    case 'serif':
    case 'ornamental':
      return '"Rye", "Roboto Slab", "Cinzel Decorative", serif';
    case 'graffiti':
    case 'stencil':
    case 'circus':
      return '"Bowlby One SC", "Black Ops One", sans-serif';
    case 'handwritten':
    case 'schoolbook':
      return '"Patrick Hand", "Schoolbell", cursive';
    default:
      return '"Space Mono", monospace, sans-serif';
  }
}

function applyCanvasShadow(ctx: CanvasRenderingContext2D, style?: TitleShadowStyle) {
  switch (style) {
    case 'neon-glow':
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      break;
    case 'harsh-black':
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;
      break;
    case 'chromatic-3d':
      ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = -6;
      ctx.shadowOffsetY = 4;
      break;
    case 'electric-outline':
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      break;
    case 'retro-bevel':
    default:
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 6;
      break;
  }
}

function getAdjustedStickerPosition(
  pos: HypeSticker['position'],
  layout?: TitleComposition,
  index: number = 0
): HypeSticker['position'] {
  switch (layout) {
    case 'top-arc':
      return index === 0 ? 'bottom-left' : 'bottom-right';
    case 'split-corners':
      return 'bottom-left';
    case 'diagonal-cross':
      return index === 0 ? 'top-right' : 'bottom-left';
    case 'bottom-banner':
    default:
      return index === 0 ? 'top-left' : 'top-right';
  }
}

function drawHypeSticker(
  ctx: CanvasRenderingContext2D,
  sticker: HypeSticker,
  pos: HypeSticker['position'],
  index: number
) {
  let cx = 150;
  let cy = 870;

  switch (pos) {
    case 'top-left':
      cx = 150;
      cy = index === 0 ? 110 : 220;
      break;
    case 'top-right':
      cx = 874;
      cy = index === 0 ? 110 : 220;
      break;
    case 'bottom-left':
      cx = 150;
      cy = index === 0 ? 890 : 780;
      break;
    case 'bottom-right':
      cx = 874;
      cy = index === 0 ? 890 : 780;
      break;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((sticker.rotation * Math.PI) / 180);

  ctx.font = '900 18px monospace';
  const words = sticker.text.toUpperCase().split(' ');
  const lines: string[] = [];
  let cur = '';

  words.forEach((w) => {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > 160) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  });
  if (cur) lines.push(cur);

  let maxW = 0;
  lines.forEach((l) => {
    const w = ctx.measureText(l).width;
    if (w > maxW) maxW = w;
  });

  const boxW = Math.max(maxW + 28, 110);
  const boxH = lines.length * 22 + 20;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = sticker.bg || '#ffffff';
  ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

  ctx.strokeStyle = sticker.border || '#000000';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = sticker.color || '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const startY = -((lines.length - 1) * 22) / 2;
  lines.forEach((line, idx) => {
    ctx.fillText(line, 0, startY + idx * 22);
  });

  ctx.restore();
}

// 1. Composite High-Res Front Cover (1024x1024)
export async function compositeFrontSleeve(album: AlbumEntry): Promise<Blob> {
  // Ensure custom web fonts are loaded into the browser font engine
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Fallback to standard system fonts if font API fails
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Layer 1: Base artwork graphic
  if (album.coverImageUrl) {
    const img = await loadImage(album.coverImageUrl);
    ctx.drawImage(img, 0, 0, 1024, 1024);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 1024, 1024);
  }

  const isFuturePressing = parseInt(album.year, 10) > new Date().getFullYear();

  // Layer 2: Temporal Anomaly holographic sash (if applicable)
  if (isFuturePressing) {
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate((-22 * Math.PI) / 180);

    const ribbonGrad = ctx.createLinearGradient(-750, 0, 750, 0);
    ribbonGrad.addColorStop(0, 'rgba(8, 51, 68, 0)');
    ribbonGrad.addColorStop(0.25, 'rgba(8, 51, 68, 0.9)');
    ribbonGrad.addColorStop(0.75, 'rgba(8, 51, 68, 0.9)');
    ribbonGrad.addColorStop(1, 'rgba(8, 51, 68, 0)');

    ctx.fillStyle = ribbonGrad;
    ctx.fillRect(-750, -32, 1500, 64);

    ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-750, -32);
    ctx.lineTo(750, -32);
    ctx.moveTo(-750, 32);
    ctx.lineTo(750, 32);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ecfeff';
    ctx.font = '900 21px monospace';
    ctx.fillText('✦ TEMPORAL ANOMALY • FROM THE FUTURE ✦', 0, -4);

    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`AUTHENTIC ${album.year} MASTER TAPE`, 0, 18);
    ctx.restore();
  }

  // Layer 3: Title Composition Overlay
  const fontFam = getCanvasFontFamily(album.fontFamily);
  const textColor = album.textColor || '#fef3c7';
  const layout = album.titleLayout || 'top-arc';
  const skew = album.skewDeg || 0;

  ctx.save();

  if (layout === 'bottom-banner') {
    const bannerY = 880;
    ctx.translate(512, bannerY);
    ctx.rotate((skew * Math.PI) / 180);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(-480, -70, 960, 140);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-480, -70);
    ctx.lineTo(480, -70);
    ctx.moveTo(-480, 70);
    ctx.lineTo(480, 70);
    ctx.stroke();

    applyCanvasShadow(ctx, album.shadowStyle);

    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.font = `900 50px ${fontFam}`;
    ctx.fillText(album.bandName.toUpperCase(), 0, -8);

    ctx.fillStyle = '#fcd34d';
    ctx.font = 'italic bold 28px serif';
    ctx.fillText(`★ ${album.albumTitle} ★`, 0, 42);
  } else if (layout === 'top-arc') {
    const safeSkew = Math.max(-4, Math.min(4, skew * 0.3));
    ctx.translate(512, 145);
    ctx.rotate((safeSkew * Math.PI) / 180);

    applyCanvasShadow(ctx, album.shadowStyle);

    const nameLen = album.bandName.length;
    const bandSize = nameLen > 20 ? 46 : nameLen > 14 ? 54 : 64;

    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.font = `900 ${bandSize}px ${fontFam}`;
    ctx.fillText(album.bandName.toUpperCase(), 0, 0);

    // Decorative underline bar
    const titleWidth = ctx.measureText(album.bandName.toUpperCase()).width;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-titleWidth * 0.48, 14);
    ctx.lineTo(titleWidth * 0.48, 14);
    ctx.stroke();

    // Subtitle Badge
    ctx.font = 'italic bold 26px serif';
    const subWidth = ctx.measureText(album.albumTitle.toUpperCase()).width + 48;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(-subWidth / 2, 34, subWidth, 44);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-subWidth / 2, 34, subWidth, 44);

    ctx.fillStyle = '#fde68a';
    ctx.fillText(album.albumTitle.toUpperCase(), 0, 65);
  } else if (layout === 'diagonal-cross') {
    ctx.translate(512, 512);
    ctx.rotate((skew * Math.PI) / 180);

    applyCanvasShadow(ctx, album.shadowStyle);

    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.font = `900 70px ${fontFam}`;
    ctx.fillText(album.bandName.toUpperCase(), 0, -25);

    ctx.font = 'italic bold 32px serif';
    const subWidth = ctx.measureText(`“${album.albumTitle}”`).width + 44;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(-subWidth / 2, 10, subWidth, 50);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-subWidth / 2, 10, subWidth, 50);

    ctx.fillStyle = '#fcd34d';
    ctx.fillText(`“${album.albumTitle}”`, 0, 46);
  } else {
    // split-corners layout
    ctx.translate(100, 140);
    ctx.rotate((skew * Math.PI) / 180);

    applyCanvasShadow(ctx, album.shadowStyle);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(0, 20);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = textColor;
    ctx.font = `900 50px ${fontFam}`;
    ctx.fillText(album.bandName.toUpperCase(), 24, 0);

    ctx.restore();
    ctx.save();

    ctx.translate(924, 880);
    ctx.rotate((-skew * Math.PI) / 180);

    ctx.font = 'italic bold 30px serif';
    const subWidth = ctx.measureText(album.albumTitle).width + 44;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(-subWidth, -30, subWidth, 48);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-subWidth, -30, subWidth, 48);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(album.albumTitle, -22, 4);
  }

  ctx.restore();

  // Layer 4: Hype Stickers
  if (album.stickers && album.stickers.length > 0) {
    album.stickers.forEach((sticker, idx) => {
      const adjustedPos = getAdjustedStickerPosition(sticker.position, album.titleLayout, idx);
      drawHypeSticker(ctx, sticker, adjustedPos, idx);
    });
  }

  // Layer 5: Vinyl groove imprint & outer seam wear border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 44;
  ctx.beginPath();
  ctx.arc(512, 512, 380, 0, Math.PI * 2);
  ctx.stroke();

  const vignette = ctx.createRadialGradient(512, 512, 350, 512, 512, 720);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 1016, 1016);

  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej('Blob creation failed')), 'image/jpeg', 0.92)
  );
}

// 2. Composite High-Res Back Sleeve with Liner Notes & Reviews (1024x1024)
export async function compositeBackSleeve(album: AlbumEntry): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Matte cardboard background
  ctx.fillStyle = '#14171d';
  ctx.fillRect(0, 0, 1024, 1024);

  // Faint circular record impression
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 48;
  ctx.beginPath();
  ctx.arc(512, 512, 380, 0, Math.PI * 2);
  ctx.stroke();

  // Header: Band & Album Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(album.bandName.toUpperCase(), 512, 100);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'italic 26px serif';
  ctx.fillText(`"${album.albumTitle}"`, 512, 142);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 170);
  ctx.lineTo(924, 170);
  ctx.stroke();

  // Tracklist Columns
  const tracks = album.tracks || [];
  const mid = Math.ceil(tracks.length / 2);
  const sideA = tracks.slice(0, mid);
  const sideB = tracks.slice(mid);

  ctx.textAlign = 'left';
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('SIDE ONE', 120, 215);
  ctx.fillText('SIDE TWO', 540, 215);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#e2e8f0';

  let yA = 250;
  sideA.forEach((trk, i) => {
    ctx.fillText(`${i + 1}. ${trk}`, 120, yA);
    yA += 34;
  });

  let yB = 250;
  sideB.forEach((trk, i) => {
    ctx.fillText(`${mid + i + 1}. ${trk}`, 540, yB);
    yB += 34;
  });

  // Liner Notes / Dynamic Bio
  const loreY = 480;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(100, loreY);
  ctx.lineTo(924, loreY);
  ctx.stroke();

  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('ARCHIVAL RECORDING NOTES:', 120, loreY + 32);

  ctx.font = '16px serif';
  ctx.fillStyle = '#cbd5e1';
  const bioWords = (album.bandBio || '').split(' ');
  let bioLine = '';
  let bioY = loreY + 65;
  const maxTextWidth = 780;

  for (let n = 0; n < bioWords.length; n++) {
    const testLine = bioLine + bioWords[n] + ' ';
    if (ctx.measureText(testLine).width > maxTextWidth && n > 0) {
      ctx.fillText(bioLine, 120, bioY);
      bioLine = bioWords[n] + ' ';
      bioY += 26;
    } else {
      bioLine = testLine;
    }
  }
  ctx.fillText(bioLine, 120, bioY);

  // Satirical Critic Reviews
  if (album.fauxReviews && album.fauxReviews.length > 0) {
    let revY = bioY + 45;
    ctx.font = 'italic 14px serif';
    ctx.fillStyle = '#94a3b8';
    album.fauxReviews.forEach((rev) => {
      ctx.fillText(rev, 120, revY);
      revY += 24;
    });
  }

  // Footer: Metadata & Barcode
  const footY = 910;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(100, footY);
  ctx.lineTo(924, footY);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  let barX = 120;
  for (let b = 0; b < 32; b++) {
    const w = b % 3 === 0 ? 4 : 2;
    ctx.fillRect(barX, footY + 20, w, 44);
    barX += w + (b % 2 === 0 ? 4 : 2);
  }

  ctx.textAlign = 'right';
  ctx.font = '12px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`RELEASE YEAR: ${album.year} // CATALOG: ${album.catalogNumber}`, 904, footY + 36);
  ctx.fillText('© YDRBN PHONOGRAPHIC ARCHIVE & SYNTHESIS CORP.', 904, footY + 56);

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 1016, 1016);

  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej('Blob creation failed')), 'image/jpeg', 0.92)
  );
}