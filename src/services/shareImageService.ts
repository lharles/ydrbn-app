import { AlbumEntry } from '../types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// 1. Composite High-Res Front Cover (1024x1024)
export async function compositeFrontSleeve(album: AlbumEntry): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  if (album.coverImageUrl) {
    const img = await loadImage(album.coverImageUrl);
    ctx.drawImage(img, 0, 0, 1024, 1024);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 1024, 1024);
  }

  // Outer radial vignette
  const vignette = ctx.createRadialGradient(512, 512, 350, 512, 512, 720);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1024, 1024);

  // Cardboard seam wear border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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

  // Procedural barcode pattern
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

  // Outer border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 1016, 1016);

  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej('Blob creation failed')), 'image/jpeg', 0.92)
  );
}