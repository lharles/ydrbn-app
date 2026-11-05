import { AlbumEntry } from '../types';

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

const MUNICIPAL_LORE_VENUES = [
  'Flumptown Annex, OH',
  'Zoning Board Rm B, NJ',
  'Abandoned Vicarage, UK',
  'Sub-Basement #4, AK',
  'Bursar Waiting Rm, VT',
  'Rotating Restaurant, WA',
  'Cul-De-Sac #7, IN',
  'Unfinished Bridge, OR',
  'Municipal Sump Pit, PA',
  'Appliance Depot, IL',
  'Patent Annex C, MA',
  'Bowling Rec Hall, WI',
  'Decommissioned Silo, KS',
  'Boiler Room 2B, MI',
  'Drainage District, TX',
  'Surplus Warehouse, NV',
  'Civic Boiler Annex, NY',
  'Orthopedic Ward, NC',
  'Records Vault #9, VA',
  'Parking Lot 14-B, MN',
  'Thermostat Lobby, CO',
  'Laminated Lounge, FL',
  'Clerical Elks #8, IA',
  'Tupperware Hall, MO',
  'Scone Conservatory, UK',
  'Cabbage Pavilion, ME',
];

const TEMPORAL_FUTURE_VENUES = [
  'Sea of Tranquility, LUNA',
  'Olympus Mons Annex, MARS',
  'Orbital Cistern #4, LEO',
  'Neo-Flumptown Dome, OH',
  'Io Sulfur Refinery, JUP',
  'Titan Methane Bowl, SAT',
  'Lagrange Point L2, ORB',
  'Crater Tycho Civic, LUNA',
  'Sub-Level 99, CERES',
  'Ganymede Ice Rink, JUP',
  'Centauri Tollbooth, SEC-4',
  'Europa Hydro-Deck, JUP',
  'Phobos Parking Lot, MARS',
  'Deimos Youth Hostel, MARS',
  'Oort Cloud VFW #12, DEEP',
  'Venus Cloud Annex, VEN',
  'Mercury Sun-Shield, MER',
  'Callisto Bowling, JUP',
  'Asteroid 433 Rec, BELT',
  'Pluto Kiosk #2, KUI',
];

export function generateProceduralTourRoster(album: AlbumEntry): TourStop[] {
  const seedStr = `${album.id}|${album.bandName}|${album.year}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  const nextRand = () => {
    let t = (h += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const isFuture = parseInt(album.year, 10) > new Date().getFullYear();
  const pool = isFuture ? [...TEMPORAL_FUTURE_VENUES] : [...MUNICIPAL_LORE_VENUES];

  // Shuffle deterministically
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Generate 18 two-night stands (36 dates total, matching the 2-column geometry)
  const stops: TourStop[] = [];
  let month = 6;
  let day = 4 + Math.floor(nextRand() * 5);

  for (let s = 0; s < 18; s++) {
    const venue = pool[s % pool.length];
    for (let night = 0; night < 2; night++) {
      stops.push({
        date: `${month}/${String(day).padStart(2, '0')}`,
        city: venue,
      });
      day += 1;
      if (day > 28) {
        day = 2;
        month += 1;
      }
    }
    day += 3 + Math.floor(nextRand() * 3);
    if (day > 28) {
      day -= 27;
      month += 1;
    }
  }

  return stops;
}

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
    ctx.fillText(item.city, 550, y, 1150);
  });

  // Right Column (Max width stops before 3600)
  rightCol.forEach((item, i) => {
    const y = startY + i * lineHeight;
    ctx.textAlign = 'left';
    ctx.fillText(item.date, 1950, y);
    ctx.fillText(item.city, 2350, y, 1150);
  });

  // 3. Tiny Manufacturer Mark at the Bottom
  ctx.textAlign = 'center';
  ctx.font = 'bold 60px "Space Mono", monospace';
  ctx.fillText('Y.D.R.B.N.', 1800, 4650);

  return canvas.toDataURL('image/png');
}