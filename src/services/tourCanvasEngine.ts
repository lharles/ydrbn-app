export interface TourStop {
  date: string;
  city: string;
}

export const CANONICAL_TOUR_ROSTER: TourStop[] = [
  // Column 1 (West & Desert Circuit)
  { date: '6/09', city: 'Portland, OR' },
  { date: '6/10', city: 'Portland, OR' },
  { date: '6/11', city: 'Springfield, OR' },
  { date: '6/16', city: 'Springfield, OR' },
  { date: '6/17', city: 'Bikini Bottom, HI' },
  { date: '6/18', city: 'Bikini Bottom, HI' },
  { date: '6/23', city: 'Twin Peaks, WA' },
  { date: '6/24', city: 'Twin Peaks, WA' },
  { date: '6/25', city: 'Radiator Springs, CO' },
  { date: '6/30', city: 'Radiator Springs, CO' },
  { date: '7/01', city: 'South Park, CO' },
  { date: '7/02', city: 'South Park, CO' },
  { date: '7/07', city: 'Zion, CA' },
  { date: '7/08', city: 'Zion, CA' },
  { date: '7/09', city: 'Mordor, AZ' },
  { date: '7/14', city: 'Mordor, AZ' },
  { date: '7/15', city: 'Metropolis, KS' },
  { date: '7/16', city: 'Metropolis, KS' },

  // Column 2 (Midwest, Atlantic & Overseas Circuit)
  { date: '7/21', city: 'Gotham, IL' },
  { date: '7/22', city: 'Gotham, IL' },
  { date: '7/23', city: 'Shermer, IL' },
  { date: '7/28', city: 'Shermer, IL' },
  { date: '7/29', city: 'Pawnee, IN' },
  { date: '7/30', city: 'Pawnee, IN' },
  { date: '8/04', city: 'Amity Island, RI' },
  { date: '8/05', city: 'Amity Island, RI' },
  { date: '8/06', city: 'Bedford Falls, NY' },
  { date: '8/11', city: 'Bedford Falls, NY' },
  { date: '8/12', city: 'Castle Rock, ME' },
  { date: '8/13', city: 'Castle Rock, ME' },
  { date: '8/18', city: 'Derry, ME' },
  { date: '8/19', city: 'Derry, ME' },
  { date: '8/20', city: 'Hogsmeade, UK' },
  { date: '8/25', city: 'Hogsmeade, UK' },
  { date: '8/26', city: 'Bedrock, IE' },
  { date: '8/27', city: 'Bedrock, IE' },
];

export interface TourRenderOptions {
  stops?: TourStop[];
  accentColor?: string;
  showDividingLine?: boolean;
}

export function renderTourBackGraphic(options: TourRenderOptions = {}): string {
  const canvas = document.createElement('canvas');
  canvas.width = 3600;
  canvas.height = 4800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ink = options.accentColor || '#8b1410';
  const stops = options.stops && options.stops.length > 0 ? options.stops : CANONICAL_TOUR_ROSTER;
  const half = Math.ceil(stops.length / 2);
  const leftCol = stops.slice(0, half);
  const rightCol = stops.slice(half);

  // 1. Center Vertical Rule (Center is X = 1800)
  if (options.showDividingLine !== false) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(1800, 360);
    ctx.lineTo(1800, 4440);
    ctx.stroke();
  }

  // 2. Typography Geometry
  const startY = 490;
  const rowCount = Math.max(leftCol.length, rightCol.length);
  const availableHeight = 3900;
  const lineHeight = availableHeight / rowCount;

  ctx.fillStyle = ink;
  ctx.font = 'bold italic 120px "Playfair Display", Georgia, "Times New Roman", serif';
  ctx.textBaseline = 'middle';

  // Left Column (Max width stops before 1800)
  leftCol.forEach((item, i) => {
    const y = startY + i * lineHeight;
    ctx.textAlign = 'left';
    ctx.fillText(item.date, 150, y);
    ctx.fillText(item.city, 550, y, 1150); // Hard boundary at 1700
  });

  // Right Column (Max width stops before 3600)
  rightCol.forEach((item, i) => {
    const y = startY + i * lineHeight;
    ctx.textAlign = 'left';
    ctx.fillText(item.date, 1950, y);
    ctx.fillText(item.city, 2350, y, 1150); // Hard boundary at 3500
  });

  // 3. Tiny Manufacturer Mark at the Bottom
  ctx.textAlign = 'center';
  ctx.font = 'bold 60px "Space Mono", monospace';
  ctx.fillText('Y.D.R.B.N.', 1800, 4650);

  return canvas.toDataURL('image/png');
}