import React from 'react';
import {
  AlbumEntry,
  HypeSticker,
  TitleFontFamily,
  TitleShadowStyle,
  TitleComposition,
} from '../types';
import { Disc, Sparkles, ZoomIn, Play, Volume2 } from 'lucide-react';
import { TurntableRpm } from '../services/audioSynthesizer';

interface VinylSleeveProps {
  album: AlbumEntry | null;
  isFlipped: boolean;
  isLoading: boolean;
  isPlayingAudio?: boolean;
  rpm?: TurntableRpm;
  activeTrackIndex?: number | null;
  onPlayTrack?: (trackTitle: string, index: number) => void;
  loadingStepText?: string;
  onToggleFlip: () => void;
  onOpenZoom?: () => void;
  hideZoomButton?: boolean;
}

const FAUX_RECORD_LABELS = [
  'FLUMPTOWN MUNICIPAL AUDIO',
  'SUBCOMMITTEE DISQUES',
  'FORM 1040-B RECORDINGS',
  'UNCALIBRATED RECORDS',
  'SPINDLED & MUTILATED LTD.',
  'BARGAIN BIN PRESSINGS',
  'OBSOLETE FIDELITY CORP.',
  'ZONING BOARD SOUNDWERKS',
  'INCONCLUSIVE WAX',
  'AMALGAMATED HUBCAP RECORDS',
];

function getRecordLabelName(id?: string): string {
  if (!id) return 'RECORD CORP';
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 10000;
  }
  return FAUX_RECORD_LABELS[h % FAUX_RECORD_LABELS.length];
}

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

export const VinylSleeve: React.FC<VinylSleeveProps> = ({
  album,
  isFlipped,
  isLoading,
  isPlayingAudio = false,
  rpm = 33,
  activeTrackIndex = null,
  onPlayTrack,
  loadingStepText = 'Pressing Vinyl...',
  onToggleFlip,
  onOpenZoom,
  hideZoomButton = false,
}) => {
  const isFuturePressing = album ? parseInt(album.year, 10) > new Date().getFullYear() : false;

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

  const getTrackDuration = (trackName: string, idx: number): string => {
    let h = idx * 17;
    for (let i = 0; i < trackName.length; i++) {
      h = (h * 31 + trackName.charCodeAt(i)) % 997;
    }
    if (h % 29 === 0) return `14:${String(10 + (h % 49)).padStart(2, '0')}`;
    if (h % 37 === 0) return `0:${String(12 + (h % 35)).padStart(2, '0')}`;
    const mins = 2 + (h % 4);
    const secs = String(h % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getBarcodeNumber = (id?: string, year?: string): string => {
    if (!id) return '029778-005';
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum = (sum * 13 + id.charCodeAt(i)) % 900000;
    return `${String(100000 + sum).slice(0, 6)}-${(year || '1977').slice(-3)}`;
  };

  const getPositionClasses = (pos: HypeSticker['position'], index: number = 0) => {
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

  const getFontFamilyClass = (fontFamily?: TitleFontFamily): string => {
    switch (fontFamily) {
      case 'medieval':
      case 'ornamental':
        return 'font-medieval';
      case 'bubble':
      case 'circus':
        return 'font-bubble tracking-wider';
      case 'comic':
      case 'graffiti':
        return 'font-comic tracking-widest';
      case 'marker':
      case 'handwritten':
      case 'schoolbook':
        return 'font-marker tracking-wide';
      case 'monospace':
      case 'typewriter':
      case 'arcade':
        return 'font-monospace tracking-normal';
      case 'chrome':
      case 'space':
      case 'futuristic':
        return 'font-chrome tracking-wider';
      case 'stencil':
      case 'industrial':
        return 'font-display tracking-widest';
      case 'western':
      case 'serif':
      case 'newspaper':
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
        return 'drop-shadow(4px 4px 0px rgba(0,0,0,0.95)) drop-shadow(8px 8px 0px rgba(0,0,0,0.8)) drop-shadow(12px 12px 0px rgba(0,0,0,0.65))';
      case 'double-outline':
        return 'drop-shadow(2px 0px 0px #000) drop-shadow(-2px 0px 0px #000) drop-shadow(0px 2px 0px #000) drop-shadow(0px -2px 0px #000) drop-shadow(4px 4px 0px rgba(255,255,255,0.95))';
      case 'offset-print':
        return 'drop-shadow(3px 0px 0px rgba(220,38,38,0.75)) drop-shadow(-3px 0px 0px rgba(6,182,212,0.75))';
      case 'inner-glow':
        return 'drop-shadow(0px 0px 2px #fff) drop-shadow(0px 0px 14px rgba(56,189,248,0.65)) drop-shadow(0px 4px 8px rgba(0,0,0,0.85))';
      case 'embossed':
        return 'drop-shadow(-2px -2px 0px rgba(255,255,255,0.75)) drop-shadow(2px 2px 0px rgba(0,0,0,0.85))';
      case 'sticker-outline':
        return 'drop-shadow(2px 0px 0px #fff) drop-shadow(-2px 0px 0px #fff) drop-shadow(0px 2px 0px #fff) drop-shadow(0px -2px 0px #fff) drop-shadow(3px 3px 5px rgba(0,0,0,0.75))';
      case 'electric-outline':
        return 'drop-shadow(0px 0px 2px #fff) drop-shadow(0px 0px 8px rgba(34,211,238,0.95))';
      case 'rubber-stamp':
        return 'drop-shadow(2px 1px 0px rgba(127,29,29,0.85)) drop-shadow(0px 3px 5px rgba(0,0,0,0.45))';
      case 'none':
        return 'drop-shadow(0 2px 4px rgba(0,0,0,0.65))';
      case 'retro-bevel':
      default:
        return 'drop-shadow(3px 3px 0px #000000) drop-shadow(-1px -1px 0px rgba(255,255,255,0.35)) drop-shadow(0 4px 10px rgba(0,0,0,0.9))';
    }
  };

  const normalizedLayout = normalizeCoverLayout(album?.titleLayout);

  const getAdjustedStickerPosition = (
    layout: 'top-arc' | 'diagonal-cross' | 'split-corners' | 'bottom-banner',
    index: number = 0
  ): HypeSticker['position'] => {
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
  };

  const renderTitleComposition = () => {
    if (!album) return null;

    const fontClass = getFontFamilyClass(album.fontFamily);
    const shadowFilter = getShadowFilter(album.shadowStyle);
    const textColor = album.textColor || '#fef3c7';
    const skew = album.skewDeg || 0;

    const getBandNameSize = (name: string) => {
      if (name.length > 22) return 'text-base sm:text-lg';
      if (name.length > 14) return 'text-lg sm:text-xl';
      return 'text-xl sm:text-2xl';
    };

    switch (normalizedLayout) {
      case 'top-arc': {
        const safeSkew = Math.max(-4, Math.min(4, skew * 0.3));
        const fontSizeClass = getBandNameSize(album.bandName);

        return (
          <div className="absolute top-5 inset-x-4 pointer-events-none flex flex-col items-center justify-start text-center z-10">
            <div
              style={{
                transform: `rotate(${safeSkew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[90%] transition-transform duration-500 flex flex-col items-center"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} ${fontSizeClass} font-black uppercase leading-tight pb-0.5 border-b-2 border-amber-400/70 mb-1 text-center break-words`}
              >
                {album.bandName}
              </h1>
              <div className="inline-block bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded border border-amber-400/50 shadow-md mt-0.5">
                <h2 className="font-liner-notes text-[10px] sm:text-xs font-bold text-amber-200 uppercase tracking-widest italic leading-none">
                  {album.albumTitle}
                </h2>
              </div>
            </div>
          </div>
        );
      }

      case 'diagonal-cross': {
        const clampedSkew = Math.max(-12, Math.min(12, skew));
        return (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center p-6 text-center z-10">
            <div
              style={{
                transform: `rotate(${clampedSkew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[78%] transition-transform duration-500 space-y-1.5"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} text-xl sm:text-2xl font-black uppercase leading-none text-center break-words`}
              >
                {album.bandName}
              </h1>
              <div className="inline-block bg-black/65 backdrop-blur-xs px-2.5 py-0.5 rounded border border-amber-400/50">
                <h2 className="font-liner-notes text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest italic">
                  &ldquo;{album.albumTitle}&rdquo;
                </h2>
              </div>
            </div>
          </div>
        );
      }

      case 'split-corners': {
        const safeCornerSkew = Math.max(-3, Math.min(3, skew));
        return (
          <div className="absolute inset-0 pointer-events-none p-4 z-10 flex flex-col justify-between">
            <div
              style={{
                transform: `rotate(${safeCornerSkew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[72%] text-left transition-transform duration-500"
            >
              <h1
                style={{ color: textColor }}
                className={`${fontClass} text-lg sm:text-xl font-black uppercase leading-tight border-l-4 border-amber-400 pl-2 break-words`}
              >
                {album.bandName}
              </h1>
            </div>

            <div
              style={{
                transform: `rotate(${-safeCornerSkew}deg)`,
                filter: shadowFilter,
              }}
              className="max-w-[70%] text-right ml-auto mb-4 transition-transform duration-500"
            >
              <div className="inline-block bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded border border-amber-400/60">
                <h2 className="font-liner-notes text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-widest italic">
                  {album.albumTitle}
                </h2>
              </div>
            </div>
          </div>
        );
      }

      case 'bottom-banner':
      default: {
        const safeBannerSkew = Math.max(-2, Math.min(2, skew));
        return (
          <div className="absolute bottom-3 inset-x-3 pointer-events-none z-10">
            <div
              style={{
                transform: `rotate(${safeBannerSkew}deg)`,
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
    }
  };

  const visibleStickers = album?.stickers
    ? album.stickers.slice(0, normalizedLayout === 'split-corners' ? 1 : 2)
    : [];

  const spinAnimationClass =
    rpm === 45
      ? 'animate-[spin_1.15s_linear_infinite]'
      : rpm === 16
      ? 'animate-[spin_3.4s_linear_infinite]'
      : 'animate-[spin_1.8s_linear_infinite]';

  return (
    <div
      className="relative w-full max-w-[345px] aspect-square mx-auto select-none perspective-1000"
      style={{
        perspective: '1000px',
        WebkitPerspective: '1000px',
      }}
    >
      {/* SLIDING 33⅓ / 45 / 16⅔ RPM SPINNING VINYL DISC */}
      {album && (
        <div
          aria-hidden="true"
          className={`export-exclude absolute inset-y-2 right-2 aspect-square rounded-full pointer-events-none transition-all duration-700 ease-out z-0 flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.95)] ${
            isPlayingAudio
              ? 'translate-x-[26%] sm:translate-x-[32%] opacity-100'
              : 'translate-x-0 opacity-0'
          }`}
          style={{
            background: isFuturePressing
              ? 'radial-gradient(circle, #06b6d4 0%, #0e7490 35%, #164e63 68%, #083344 100%)'
              : 'radial-gradient(circle, #18181b 0%, #09090b 55%, #18181b 58%, #09090b 75%, #27272a 78%, #09090b 100%)',
          }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center relative ${
              isPlayingAudio ? spinAnimationClass : ''
            }`}
          >
            <div className="absolute inset-3 rounded-full border border-white/10" />
            <div className="absolute inset-7 rounded-full border border-white/5" />
            <div className="absolute inset-11 rounded-full border border-white/10" />
            <div className="absolute inset-16 rounded-full border border-white/5" />
            <div className="absolute inset-20 rounded-full border border-white/10" />

            <div
              className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-between p-2.5 text-center shadow-inner ${
                album.isCustomPressing
                  ? 'bg-[#f8fafc] border-stone-400 text-stone-950'
                  : isFuturePressing
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                  : 'bg-gradient-to-b from-amber-500 via-amber-600 to-orange-700 border-amber-200/60 text-stone-950'
              }`}
            >
              <span className="font-mono text-[6.5px] font-black tracking-widest uppercase truncate max-w-[75px]">
                {album.isCustomPressing ? 'CUSTOM DROP' : `${rpm} RPM HI-FI`}
              </span>
              <div className="w-3.5 h-3.5 rounded-full bg-[#12100e] border border-white/30 shadow-inner my-auto" />
              <span className="font-mono text-[6px] font-bold truncate max-w-[82px]">
                {album.bandName.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Flip Card Container */}
      <div
        className={`w-full h-full relative transition-transform duration-700 shadow-2xl rounded-md transform-style-3d z-10 ${
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
        <div
          id="sleeve-front"
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
                  Hit <span className="text-orange-400 font-bold">⚡ Daily Drop</span> to forge today&apos;s surreal fictional band and vinyl artwork!
                </p>
              </div>
            </div>
          )}

          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/65 via-white/15 to-black/35 pointer-events-none z-20" />
          <div className="absolute inset-0 vinyl-ring-wear pointer-events-none opacity-20" />
          <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.85)] pointer-events-none border border-white/5" />

          {isFuturePressing && (
            <>
              <div className="absolute inset-0 holographic-foil pointer-events-none z-20" />
              <div className="absolute inset-0 lenticular-ridges pointer-events-none z-20 opacity-80" />

              <div className="absolute top-2 right-2 z-30 pointer-events-none flex items-center gap-1.5 bg-black/75 border border-cyan-400/60 rounded px-2 py-0.5 shadow-[0_0_12px_rgba(6,182,212,0.45)] backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
                <span className="font-mono text-[9px] font-black tracking-wider text-cyan-200 uppercase">
                  {album?.year} FUTURE PRESSING
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-20">
                <div className="w-[140%] py-1.5 bg-gradient-to-r from-transparent via-cyan-950/85 to-transparent border-y border-cyan-400/40 backdrop-blur-[1px] rotate-[-22deg] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  <span className="font-mono text-[10px] sm:text-xs font-black tracking-[0.35em] uppercase text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] whitespace-nowrap">
                    ✦ TEMPORAL ANOMALY • FROM THE FUTURE ✦
                  </span>
                  <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-cyan-300/80 font-semibold">
                    AUTHENTIC {album?.year} MASTER TAPE
                  </span>
                </div>
              </div>
            </>
          )}

          {renderTitleComposition()}

          {visibleStickers.map((st, idx) => {
            const isFailsafeSticker = st.id.startsWith('stk-elbow-failsafe');
            const adjustedPos = getAdjustedStickerPosition(normalizedLayout, idx);
            return (
              <div
                key={st.id}
                className={`absolute ${getPositionClasses(adjustedPos, idx)} ${
                  isFailsafeSticker ? 'z-30' : 'z-20'
                } pointer-events-none transition-transform group-hover:scale-105`}
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
                    padding: isFailsafeSticker ? '6px 10px' : '3px 7px',
                  }}
                  className={
                    isFailsafeSticker
                      ? 'text-[10px] sm:text-[11px] font-mono font-black tracking-wider uppercase shadow-[0_10px_25px_rgba(0,0,0,0.95)] border-[3px] ring-2 ring-black max-w-[165px] sm:max-w-[185px] text-center leading-snug rounded-md'
                      : 'text-[8px] font-black tracking-tight uppercase shadow-md border-2 max-w-[76px] text-center leading-tight rounded-sm'
                  }
                >
                  {st.text}
                </div>
              </div>
            );
          })}

          {album && (
            <div className="export-exclude absolute bottom-1 right-1 z-30 flex items-center gap-1 opacity-25 hover:opacity-100 active:opacity-100 transition-opacity duration-300">
              {onOpenZoom && !hideZoomButton && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
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
        <div
          id="sleeve-back"
          onClick={() => {
            if (!isLoading) onToggleFlip();
          }}
          className="sleeve-back absolute inset-0 w-full h-full rounded-md overflow-hidden bg-stone-900 border-2 border-stone-300/40 ring-1 ring-black/90 shadow-2xl p-2.5 sm:p-3 flex flex-col justify-between text-stone-200 cursor-pointer select-none backface-hidden rotate-y-180"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            WebkitTransform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
          }}
        >
          {album?.coverImageUrl && (
            <img
              src={album.coverImageUrl}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-x-[-1] brightness-[0.65]"
              alt="Back Cover Texture"
            />
          )}

          <div className="absolute inset-0 bg-black/25 backdrop-blur-[12px] pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/65 via-white/15 to-black/35 pointer-events-none z-20" />
          <div className="absolute inset-0 vinyl-ring-wear pointer-events-none opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] pointer-events-none mix-blend-multiply" />

          {/* 1. Header: Band name, album title, release year, catalog number */}
          <div className="relative z-10 shrink-0 border-b border-amber-500/30 pb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="font-vintage-title text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300 leading-tight truncate">
                {album?.bandName || 'THE SURREAL APOSTLES'}
              </h2>
              <h3 className="font-liner-notes text-[10px] sm:text-[11px] font-bold text-stone-300 uppercase tracking-tight italic leading-tight truncate">
                {album?.albumTitle || 'Acoustic Aberrations'}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-[8.5px] sm:text-[9px] font-bold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-500/30">
                {album?.catalogNumber || 'YDR-1977-STEREO'}
              </span>
              <p className="font-mono text-[7px] sm:text-[7.5px] text-stone-400 mt-0.5 truncate max-w-[135px]">
                © {album?.year || '1977'} {getRecordLabelName(album?.id)}
              </p>
            </div>
          </div>

          {/* 2. Interactive Tracklist (Click any song to audition it!) */}
          <div className="relative z-10 shrink-0 bg-black/45 rounded p-1.5 sm:p-2 border border-stone-800/90 my-1 text-[8.5px] sm:text-[9px] font-liner-notes">
            <div className="font-bold text-[8.5px] sm:text-[9px] text-amber-400/90 border-b border-stone-700/80 pb-0.5 mb-1 uppercase tracking-wider flex justify-between items-center">
              <span>Program Tracklist {onPlayTrack ? '(Tap Track To Spin)' : ''}</span>
              <span className="text-stone-500 text-[7.5px] sm:text-[8px] font-mono">
                {rpm === 33 ? '33⅓' : rpm === 16 ? '16⅔' : '45'} RPM • STEREO
              </span>
            </div>
            <ul className="space-y-[1px] text-stone-300">
              {tracks.map((track, i) => {
                const isThisTrackPlaying = isPlayingAudio && activeTrackIndex === i;
                return (
                  <li
                    key={i}
                    onClick={(e) => {
                      if (onPlayTrack) {
                        e.stopPropagation();
                        onPlayTrack(track, i);
                      }
                    }}
                    className={`flex items-center justify-between gap-2 leading-none py-0.5 px-1 -mx-1 rounded transition-colors ${
                      onPlayTrack ? 'hover:bg-amber-500/20 cursor-pointer' : ''
                    } ${isThisTrackPlaying ? 'bg-amber-500/25 text-amber-200 font-bold' : ''}`}
                    title={onPlayTrack ? `Spin Track ${i + 1}: ${track}` : undefined}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {isThisTrackPlaying ? (
                        <Volume2 className="w-2.5 h-2.5 text-amber-400 animate-pulse shrink-0" />
                      ) : onPlayTrack ? (
                        <Play className="w-2 h-2 text-orange-400/80 shrink-0" />
                      ) : null}
                      <span className="text-orange-400/90 font-mono text-[8px] sm:text-[8.5px] font-bold shrink-0">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="truncate leading-tight text-stone-200">{track}</span>
                    </div>
                    <span className="text-[7.5px] sm:text-[8px] text-stone-500 font-mono shrink-0 pl-1">
                      {getTrackDuration(track, i)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 3. Faux Reviews & Band Lore */}
          <div className="relative z-10 flex-1 min-h-0 bg-black/45 rounded p-1.5 sm:p-2 border border-stone-800/80 my-0.5 flex flex-col justify-between overflow-hidden">
            {album?.fauxReviews && album.fauxReviews.length > 0 && (
              <div className="text-[8px] sm:text-[8.5px] font-liner-notes italic text-amber-200/90 shrink-0 line-clamp-2 leading-tight">
                • {album.fauxReviews[0]}
              </div>
            )}

            {album?.bandBio && (
              <p className="text-[7.5px] sm:text-[8px] text-stone-400 leading-tight font-liner-notes border-t border-stone-800/80 pt-1 overflow-hidden line-clamp-3 sm:line-clamp-4">
                {album.bandBio}
              </p>
            )}
          </div>

          {/* 4. Barcode & Hi-Fi Footer */}
          <div className="relative z-10 shrink-0 pt-1 border-t border-stone-800 flex items-center justify-between text-[8px] font-mono text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 border border-stone-600 text-stone-300 font-black tracking-widest text-[7px] rounded-xs">
                HI-FI
              </span>
              <span className="px-1 py-0.2 border border-amber-600/60 text-amber-400 font-bold text-[7px] rounded-xs">
                FULL STEREO
              </span>
            </div>

            <div className="text-[7px] text-stone-500 text-center truncate max-w-[140px]">
              Y.D.R.B.N. MASTER SOUND LABS • ALL RIGHTS RESERVED
            </div>

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
                {getBarcodeNumber(album?.id, album?.year)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner Overlay */}
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