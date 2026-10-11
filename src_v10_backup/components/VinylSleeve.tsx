import React from 'react';
import {
  AlbumEntry,
  HypeSticker,
  TitleFontFamily,
  TitleShadowStyle,
  TitleComposition,
} from '../types';
import { Disc, Sparkles, ZoomIn } from 'lucide-react';

interface VinylSleeveProps {
  album: AlbumEntry | null;
  isFlipped: boolean;
  isLoading: boolean;
  loadingStepText?: string;
  onToggleFlip: () => void;
  onOpenZoom?: () => void;
  hideZoomButton?: boolean;
}

export const VinylSleeve: React.FC<VinylSleeveProps> = ({
  album,
  isFlipped,
  isLoading,
  loadingStepText = 'Pressing Vinyl...',
  onToggleFlip,
  onOpenZoom,
  hideZoomButton = false,
}) => {
  // Split tracks if needed, otherwise render all tracks
  const tracks = album?.tracks || [
    'Echoes of the Marmalade Sun',
    'Tweed & Turnips (Opus 4)',
    'The Mechanical Goose Walk',
    'Midnight Scone Conspiracy',
    'Biscuits in Minor',
    'Acoustic Affront',
    'The Brass Teapot Lament',
    'Echoes of the Marmalade Sun (Reprise)',
  ];

  const getPositionClasses = (pos: HypeSticker['position'], index: number = 0) => {
    // Pushed tight to the edges (1.5) to maximize clearance from titles
    switch (pos) {
      case 'top-right':
        return index === 1 ? 'top-10 right-1.5' : 'top-1.5 right-1.5';
      case 'bottom-left':
        return index === 1 ? 'bottom-10 left-1.5' : 'bottom-1.5 left-1.5';
      case 'bottom-right':
        return index === 1 ? 'bottom-10 right-1.5' : 'bottom-1.5 right-1.5';
      case 'top-left':
        return index === 1 ? 'top-10 left-1.5' : 'top-1.5 left-1.5';
      default:
        return 'bottom-1.5 left-1.5';
    }
  };

  const getStickerShape = (type: HypeSticker['type']) => {
    switch (type) {
      case 'circle':
        return 'rounded-full aspect-square text-center flex items-center justify-center';
      case 'square':
        return 'rounded-sm aspect-square text-center flex items-center justify-center';
      case 'rect':
      default:
        return 'rounded-sm';
    }
  };

  const getFontFamilyClass = (fontFamily?: TitleFontFamily): string => {
    switch (fontFamily) {
      case 'medieval':
        return 'font-medieval';
      case 'bubble':
        return 'font-bubble tracking-wider';
      case 'comic':
        return 'font-comic tracking-widest';
      case 'marker':
        return 'font-marker tracking-wide';
      case 'monospace':
        return 'font-monospace tracking-normal';
      case 'chrome':
        return 'font-chrome tracking-wider';
      case 'typewriter':
        return 'font-monospace tracking-normal';
      case 'western':
        return 'font-serif tracking-normal';
      case 'arcade':
        return 'font-monospace tracking-normal';
      case 'graffiti':
        return 'font-display tracking-normal';
      case 'serif':
        return 'font-serif tracking-normal';
      case 'handwritten':
        return 'font-cursive tracking-normal';
      case 'stencil':
        return 'font-display tracking-normal';
      case 'space':
        return 'font-sans-serif tracking-normal';
      case 'circus':
        return 'font-display tracking-normal';
      case 'newspaper':
        return 'font-serif tracking-normal';
      case 'industrial':
        return 'font-sans-serif tracking-normal';
      case 'schoolbook':
        return 'font-cursive tracking-normal';
      case 'futuristic':
        return 'font-sans-serif tracking-normal';
      case 'ornamental':
        return 'font-serif tracking-normal';
      default:
        return 'font-vintage-title tracking-wider';
    }
  };

  const getShadowFilter = (shadowStyle?: TitleShadowStyle): string => {
    switch (shadowStyle) {
      case 'harsh-black':
        return 'drop-shadow(4px 4px 0px #000000) drop-shadow(0 0 14px rgba(0,0,0,0.95))';
      case 'neon-glow':
        return 'drop-shadow(0 0 8px #f59e0b) drop-shadow(0 0 18px rgba(245,158,11,0.65)) drop-shadow(2px 2px 0px #000000)';
      case 'chromatic-3d':
        return 'drop-shadow(-3px 0 0 rgba(239,68,68,0.95)) drop-shadow(3px 0 0 rgba(6,182,212,0.95)) drop-shadow(0 4px 8px #000000)';
      case 'long-shadow':
        return 'drop-shadow(4px 4px 0px rgba(0,0,0,0.95)) drop-shadow(8px 8px 0px rgba(0,0,0,0.8)) drop-shadow(12px 12px 0px rgba(0,0,0,0.65)) drop-shadow(16px 16px 0px rgba(0,0,0,0.45)) drop-shadow(20px 20px 0px rgba(0,0,0,0.25))';
      case 'double-outline':
        return 'drop-shadow(2px 0px 0px rgba(0,0,0,1)) drop-shadow(-2px 0px 0px rgba(0,0,0,1)) drop-shadow(0px 2px 0px rgba(0,0,0,1)) drop-shadow(0px -2px 0px rgba(0,0,0,1)) drop-shadow(4px 4px 0px rgba(255,255,255,0.95)) drop-shadow(6px 6px 3px rgba(0,0,0,0.5))';      
      case 'offset-print':
        return 'drop-shadow(3px 0px 0px rgba(220,38,38,0.75)) drop-shadow(-3px 0px 0px rgba(6,182,212,0.75)) drop-shadow(0px 2px 0px rgba(234,179,8,0.5))';      
      case 'inner-glow':
        return 'drop-shadow(0px 0px 2px rgba(255,255,255,1)) drop-shadow(0px 0px 6px rgba(255,255,255,0.85)) drop-shadow(0px 0px 14px rgba(56,189,248,0.65)) drop-shadow(0px 4px 8px rgba(0,0,0,0.85))';      
      case 'embossed':
        return 'drop-shadow(-2px -2px 0px rgba(255,255,255,0.75)) drop-shadow(-1px -1px 2px rgba(255,255,255,0.5)) drop-shadow(2px 2px 0px rgba(0,0,0,0.75)) drop-shadow(3px 3px 5px rgba(0,0,0,0.45))';      
      case 'sticker-outline':
        return 'drop-shadow(2px 0px 0px rgba(255,255,255,1)) drop-shadow(-2px 0px 0px rgba(255,255,255,1)) drop-shadow(0px 2px 0px rgba(255,255,255,1)) drop-shadow(0px -2px 0px rgba(255,255,255,1)) drop-shadow(3px 3px 5px rgba(0,0,0,0.55))';      
      case 'halftone-shadow':
        return 'drop-shadow(3px 3px 0px rgba(0,0,0,0.65)) drop-shadow(6px 6px 2px rgba(0,0,0,0.4)) drop-shadow(9px 9px 5px rgba(0,0,0,0.2))';      
      case 'electric-outline':
        return 'drop-shadow(0px 0px 2px rgba(255,255,255,1)) drop-shadow(0px 0px 5px rgba(34,211,238,0.95)) drop-shadow(0px 0px 10px rgba(59,130,246,0.8)) drop-shadow(0px 0px 18px rgba(168,85,247,0.6))';      
      case 'ghosted':
        return 'drop-shadow(3px 0px 0px rgba(255,255,255,0.18)) drop-shadow(6px 1px 0px rgba(255,255,255,0.13)) drop-shadow(9px 2px 0px rgba(255,255,255,0.09)) drop-shadow(-3px 0px 0px rgba(0,0,0,0.12)) drop-shadow(-6px -1px 0px rgba(0,0,0,0.08))';      
      case 'rubber-stamp':
        return 'drop-shadow(2px 1px 0px rgba(127,29,29,0.85)) drop-shadow(-1px 2px 1px rgba(127,29,29,0.55)) drop-shadow(0px 3px 5px rgba(0,0,0,0.35))';
      case 'retro-bevel':
      default:
        return 'drop-shadow(3px 3px 0px #000000) drop-shadow(-1px -1px 0px rgba(255,255,255,0.35)) drop-shadow(0 4px 10px rgba(0,0,0,0.9))';
    }
  };

  // Adjust sticker position to strict peripheral safe zones to prevent colliding with title compositions
  const getAdjustedStickerPosition = (
    pos: HypeSticker['position'],
    layout?: TitleComposition,
    index: number = 0
  ): HypeSticker['position'] => {
    switch (layout) {
      case 'top-arc':
        // Top is occupied; use bottom corners
        return index === 0 ? 'bottom-left' : 'bottom-right';

      case 'split-corners':
        // Top-left and bottom-right are occupied; use bottom-left exclusively
        return 'bottom-left';

      case 'diagonal-cross':
        // Cuts through the middle; top-right and bottom-left are safest
        return index === 0 ? 'top-right' : 'bottom-left';

      case 'bottom-banner':
      default:
        // CRITICAL FIX: Because all newly added types.ts layouts (like 'poster-grid') 
        // fall back to rendering as a bottom-banner, we MUST force their stickers 
        // to the top corners to prevent overlaps.
        return index === 0 ? 'top-left' : 'top-right';
    }
  };

  // Render Title Overlay according to one of 4 composition archetypes
  const renderTitleComposition = () => {
    if (!album) return null;

    const fontClass = getFontFamilyClass(album.fontFamily);
    const shadowFilter = getShadowFilter(album.shadowStyle);
    const textColor = album.textColor || '#fef3c7';
    const layout = album.titleLayout || 'top-arc';
    const skew = album.skewDeg || 0;

    // Dynamically scale down font size for long band names to avoid boundary clipping
    const getBandNameSize = (name: string) => {
      if (name.length > 20) return 'text-base sm:text-lg';
      if (name.length > 14) return 'text-lg sm:text-xl';
      return 'text-xl sm:text-2xl';
    };

    switch (layout) {
      // 1. TOP-ARC: Centered along top third with clamped tilt and high-contrast subtitle pill
      case 'top-arc': {
        // Clamp rotation to +/- 4 degrees max near the top edge so long names never clip the ceiling
        const safeSkew = Math.max(-4, Math.min(4, skew * 0.3));
        const fontSizeClass = getBandNameSize(album.bandName);

        return (
          <div className="absolute top-5 inset-x-4 pointer-events-none flex flex-col items-center justify-start text-center z-10">
            <div
              style={{
                transform: `rotate(${safeSkew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[92%] transition-transform duration-500 flex flex-col items-center"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} ${fontSizeClass} font-black uppercase leading-tight pb-0.5 border-b-2 border-amber-400/70 mb-1 text-center break-words`}
              >
                {album.bandName}
              </h1>
              {/* High-contrast backing pill ensures readability over busy or bright backdrops */}
              <div className="inline-block bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded border border-amber-400/50 shadow-md mt-0.5">
                <h2 className="font-liner-notes text-[10px] sm:text-xs font-bold text-amber-200 uppercase tracking-widest italic leading-none">
                  {album.albumTitle}
                </h2>
              </div>
            </div>
          </div>
        );
      }

      // 2. DIAGONAL-CROSS: Staggered across middle with bold -18° to +18° slant
      case 'diagonal-cross':
        return (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center p-4 text-center z-10">
            <div
              style={{
                transform: `rotate(${skew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[85%] transition-transform duration-500 space-y-1"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} text-2xl sm:text-3xl font-black uppercase leading-none text-center`}
              >
                {album.bandName}
              </h1>
              <div className="inline-block bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded border border-amber-400/50">
                <h2 className="font-liner-notes text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest italic">
                  &ldquo;{album.albumTitle}&rdquo;
                </h2>
              </div>
            </div>
          </div>
        );

      // 3. SPLIT-CORNERS: Band name tucked top-left; album title tucked bottom-right
      case 'split-corners':
        return (
          <div className="absolute inset-0 pointer-events-none p-4 z-10 flex flex-col justify-between">
            {/* Top-left: Band Name */}
            <div
              style={{
                transform: `rotate(${skew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[75%] text-left transition-transform duration-500"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} text-lg sm:text-xl font-black uppercase leading-tight border-l-4 border-amber-400 pl-2`}
              >
                {album.bandName}
              </h1>
            </div>

            {/* Bottom-right: Album Title */}
            <div
              style={{
                transform: `rotate(${-skew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[75%] text-right ml-auto transition-transform duration-500"
            >
              <div className="inline-block bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded border border-amber-400/60">
                <h2 className="font-liner-notes text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-widest italic">
                  {album.albumTitle}
                </h2>
              </div>
            </div>
          </div>
        );

      // 4. BOTTOM-BANNER: Heavy horizontal banner locked along lower margin
      case 'bottom-banner':
      default:
        return (
          <div className="absolute bottom-3 inset-x-3 pointer-events-none z-10">
            <div
              style={{
                transform: `rotate(${skew}deg)`,
                filter: shadowFilter,
              }}
              className="w-full bg-black/85 backdrop-blur-xs border-y-2 border-amber-400 px-3 py-1.5 shadow-2xl transition-transform duration-500 flex flex-col items-center justify-center text-center"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} text-lg sm:text-xl font-black uppercase leading-tight`}
              >
                {album.bandName}
              </h1>
              <h2 className="font-liner-notes text-[11px] sm:text-xs font-bold text-amber-300 uppercase tracking-widest italic mt-0.5">
                ★ {album.albumTitle} ★
              </h2>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="relative w-full max-w-[340px] aspect-square mx-auto select-none perspective-1000"
      style={{
        perspective: '1000px',
        WebkitPerspective: '1000px',
      }}
    >
      {/* 3D Flip Card Container */}
      <div
        className={`w-full h-full relative transition-transform duration-700 shadow-2xl rounded-md transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ==================== FRONT SLEEVE ==================== */}
        {/* Note: sleeve-front has backface-visibility: hidden. All typography and stickers are inside sleeve-front */}
        <div
          onClick={() => {
            if (!isLoading && album) onToggleFlip();
          }}
          className="sleeve-front absolute inset-0 w-full h-full rounded-md overflow-hidden bg-stone-900 border-2 border-stone-300/40 ring-1 ring-black/90 shadow-[0_16px_36px_rgba(0,0,0,0.95)] cursor-pointer group backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            WebkitTransform: 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
          }}
        >
          {album?.coverImageUrl ? (
            <img
              src={album.coverImageUrl}
              alt={`${album.bandName} - ${album.albumTitle}`}
              className="w-full h-full object-cover select-none pointer-events-none filter contrast-[1.05] brightness-95"
            />
          ) : (
            /* Blank vintage sleeve placeholder before first drop */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#181a24] to-[#0f1118] relative">
              <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                <Disc className="w-72 h-72 text-orange-500 animate-[spin_40s_linear_infinite]" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="font-vintage-title text-base font-bold text-amber-200 uppercase tracking-widest">
                  Master Tape Ready
                </h3>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                  Hit <span className="text-orange-400 font-bold">⚡ Daily Drop</span> to forge today's surreal fictional band and vinyl artwork!
                </p>
              </div>
            </div>
          )}

          {/* Analog Vinyl Ring-Wear Overlay */}
          <div className="absolute inset-0 vinyl-ring-wear pointer-events-none opacity-20" />

          {/* Vintage Sleeve Edge Crease and Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.85)] pointer-events-none border border-white/5" />

          {/* DYNAMIC MULTI-FONT & DYNAMIC COMPOSITION OVERLAY (direct child of sleeve-front) */}
          {renderTitleComposition()}

          {/* 1-2 Authentic Hype Stickers (direct children of sleeve-front, rotated and hidden with front face) */}
          {album?.stickers?.map((st, idx) => {
            const adjustedPos = getAdjustedStickerPosition(st.position, album.titleLayout, idx);
            return (
              <div
                key={st.id}
                className={`absolute ${getPositionClasses(adjustedPos, idx)} z-20 pointer-events-none transition-transform group-hover:scale-105`}
                style={{
                  transform: `rotate(${st.rotation}deg)`,
                }}
              >
                <div
                  style={{
                    backgroundColor: st.bg,
                    color: st.color,
                    borderColor: st.border,
                    width: 'fit-content',
                    padding: '3px 7px',
                  }}
                  className={`text-[8px] font-black tracking-tight uppercase shadow-md border-2 max-w-[76px] text-center leading-tight rounded-sm`}
                >
                  {st.text}
                </div>
              </div>
            );
          })}

          {/* Subtle Zoom & Flip badges - Pushed to extreme corner & faded out until interaction */}
          {album && (
            <div className="absolute bottom-1 right-1 z-30 flex items-center gap-1 opacity-25 hover:opacity-100 active:opacity-100 transition-opacity duration-300">

              {onOpenZoom && !hideZoomButton && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents flipping when clicking zoom
                    onOpenZoom();
                  }}
                  className="bg-black/75 hover:bg-black/90 text-amber-200/90 hover:text-amber-100 text-[9px] font-mono px-2 py-0.5 rounded border border-white/15 flex items-center gap-1 shadow-md transition-all active:scale-90 pointer-events-auto"
                  title="Zoom Artwork"
                >
                  <ZoomIn className="w-2.5 h-2.5 text-amber-400" />
                  <span>Zoom</span>
                </button>
              )}
              <div className="bg-black/60 backdrop-blur-xs text-amber-200/70 text-[9px] px-1.5 py-0.5 rounded font-mono border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
                ↺ Flip
              </div>
            </div>
          )}
        </div>

        {/* ==================== FLIP VIEW: BACK SLEEVE & TRACKS ==================== */}
        {/* Note: sleeve-back has backface-visibility: hidden and rotateY(180deg) */}
        <div
          onClick={() => {
            if (!isLoading) onToggleFlip();
          }}
          className="sleeve-back absolute inset-0 w-full h-full rounded-md overflow-hidden bg-stone-900 border-2 border-stone-300/40 ring-1 ring-black/90 shadow-2xl p-3 flex flex-col justify-between text-stone-200 cursor-pointer select-none backface-hidden rotate-y-180"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            WebkitTransform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
          }}
        >
          {/* 1. Mirrored Background Image */}
          {album?.coverImageUrl && (
            <img
              src={album.coverImageUrl}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-x-[-1] brightness-[0.65]"
              alt="Back Cover Texture"
            />
          )}

          {/* 2. Heavy Blur & Light Wash (Guarantees text pops while keeping art visible) */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[12px] pointer-events-none" />
          
          {/* 3. Grunge & Ring Wear (Using blend modes so it doesn't darken the image) */}
          <div className="absolute inset-0 vinyl-ring-wear pointer-events-none opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] pointer-events-none mix-blend-multiply" />
          {/* 1. Header: Band name, album title, release year, catalog number */}
          <div className="relative z-10 border-b border-amber-500/30 pb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="font-vintage-title text-xs font-black uppercase tracking-wider text-amber-300 leading-tight whitespace-normal">
                {album?.bandName || 'THE SURREAL APOSTLES'}
              </h2>
              <h3 className="font-liner-notes text-[11px] font-bold text-stone-300 uppercase tracking-tight italic leading-tight whitespace-normal">
                {album?.albumTitle || 'Acoustic Aberrations'}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-[9px] font-bold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-500/30">
                {album?.catalogNumber || 'YDR-1977-STEREO'}
              </span>
              <p className="font-mono text-[8px] text-stone-400 mt-0.5">
                © {album?.year || '1977'} RECORD CORP
              </p>
            </div>
          </div>

          {/* 2. Full-Width Single-Column Tracklist (Tracks 1 through 8, zero truncation, complete wrapping) */}
          <div className="relative z-10 bg-black/40 rounded p-2 border border-stone-800/90 my-1 text-[9px] font-liner-notes">
            <div className="font-bold text-[9px] text-amber-400/90 border-b border-stone-700/80 pb-0.5 mb-1.5 uppercase tracking-wider flex justify-between items-center">
              <span>Program Tracklist</span>
              <span className="text-stone-500 text-[8px] font-mono">33⅓ RPM • FULL STEREO</span>
            </div>
            <ul className="space-y-0.5 text-stone-300">
              {tracks.map((track, i) => (
                <li key={i} className="flex items-start justify-between gap-2 leading-tight">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="text-orange-400/90 font-mono text-[8.5px] font-bold shrink-0">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="whitespace-normal leading-tight text-stone-200">
                      {track}
                    </span>
                  </div>
                  <span className="text-[8px] text-stone-500 font-mono shrink-0 pt-0.5">
                    {i % 2 === 0 ? `3:0${4 + (i % 5)}` : `2:5${8 - (i % 6)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Faux Reviews & Band Lore: natural wrapping without truncation */}
          <div className="relative z-10 bg-black/40 rounded p-2 border border-stone-800/80 my-0.5 space-y-1.5">
            {album?.fauxReviews && album.fauxReviews.length > 0 ? (
              <div className="space-y-1 text-[8.5px] font-liner-notes italic text-amber-200/90">
                {album.fauxReviews.slice(0, 1).map((rev, idx) => (
                  <p key={idx} className="leading-snug whitespace-normal break-words">
                    • {rev}
                  </p>
                ))}
              </div>
            ) : null}

            {album?.bandBio && (
              <p className="text-[8px] text-stone-400 leading-snug whitespace-normal break-words font-liner-notes border-t border-stone-800 pt-1">
                {album.bandBio}
              </p>
            )}
          </div>

          {/* 4. Barcode, copyright notice, and stereo/hi-fi logo accents along bottom margin */}
          <div className="relative z-10 pt-1 border-t border-stone-800 flex items-center justify-between text-[8px] font-mono text-stone-500">
            {/* Hi-Fi & Stereo badges */}
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 border border-stone-600 text-stone-300 font-black tracking-widest text-[7px] rounded-xs">
                HI-FI
              </span>
              <span className="px-1 py-0.2 border border-amber-600/60 text-amber-400 font-bold text-[7px] rounded-xs">
                FULL STEREO
              </span>
            </div>

            {/* Micro legal copy */}
            <div className="text-[7px] text-stone-500 text-center truncate max-w-[140px]">
              Y.D.R.B.N. MASTER SOUND LABS • ALL RIGHTS RESERVED
            </div>

            {/* Faux Barcode */}
            <div className="flex flex-col items-center bg-white px-1 py-0.5 rounded-xs">
              <div className="flex gap-[1px] h-3 items-end">
                <div className="w-[1.5px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
                <div className="w-[2px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
                <div className="w-[3px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
                <div className="w-[2px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
              </div>
              <span className="text-[6px] text-black font-mono leading-none tracking-tighter">
                029778-005
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner & Progress Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xs rounded-md flex flex-col items-center justify-center p-6 text-center shadow-2xl border border-orange-500/30">
          <div className="relative w-16 h-16 flex items-center justify-center mb-3">
            <Disc className="w-16 h-16 text-orange-500 animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-stone-900 border-2 border-orange-400" />
            </div>
          </div>
          <p className="font-vintage-title text-sm font-bold text-amber-200 uppercase tracking-widest">
            {loadingStepText}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono max-w-[200px] animate-pulse">
            Rendering Visual Gag on Canvas...
          </p>
        </div>
      )}
    </div>
  );
};
