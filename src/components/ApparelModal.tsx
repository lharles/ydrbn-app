import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Shirt,
  Download,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Upload,
  ZoomIn,
  Minus,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { AlbumEntry } from '../types';
import {
  renderTourBackGraphic,
  CANONICAL_TOUR_ROSTER,
  localizeTourStops,
  generateProceduralTourRoster,
  generateMixedTourRoster,
  injectCustomTourStop,
  CustomStopPlacement,
} from '../services/tourCanvasEngine';
import { resolveActiveLocale, SupportedLocale } from '../services/i18nService';
import { renderHighResFrontGraphic } from '../services/apparelCanvasEngine';

interface ApparelModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: AlbumEntry | null;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

type TourScheduleMode = 'canonical' | 'procedural' | 'mixed';

const INK_PALETTES = [
  { label: 'Crimson Red', hex: '#8b1410' },
  { label: 'Amber Gold', hex: '#d97706' },
  { label: 'Warm Eggshell', hex: '#f3ede4' },
];

const FABRICATORS: {
  name: string;
  url: string;
  labels: Partial<Record<SupportedLocale, string>>;
}[] = [
  {
    name: 'CustomInk',
    url: 'https://www.customink.com/lab',
    labels: {
      en: 'CustomInk', fr: 'CustomInk (Boutique)', de: 'CustomInk (Shop)', id: 'CustomInk (Toko)', bn: 'কাস্টমইঙ্ক', ur: 'کسٹم انک', ar: 'كاستم إنك', tlh: 'CustomInk (ngevwI’)', pig: 'UstomInkCay',
      es: 'CustomInk (Tienda)',
      pt: 'CustomInk (Loja)',
      ja: 'カスタムインク',
      zh: 'CustomInk 定制',
      hi: 'कस्टमइंक',
      ru: 'CustomInk (Печать)',
    },
  },
  {
    name: 'Zazzle',
    url: 'https://www.zazzle.com/custom/tshirts',
    labels: {
      en: 'Zazzle', fr: 'Zazzle (Boutique)', de: 'Zazzle (Shop)', id: 'Zazzle (Toko)', bn: 'জাজল (Zazzle)', ur: 'زازل (Zazzle)', ar: 'زازل (Zazzle)', tlh: 'Zazzle (ngevwI’)', pig: 'AzzleZay',
      es: 'Zazzle (Tienda)',
      pt: 'Zazzle (Loja)',
      ja: 'ザズル (Zazzle)',
      zh: 'Zazzle 定制',
      hi: 'ज़ाज़ल (Zazzle)',
      ru: 'Zazzle (Печать)',
    },
  },
  {
    name: 'Spreadshirt',
    url: 'https://www.spreadshirt.com/create-your-own',
    labels: {
      en: 'Spreadshirt', fr: 'Spreadshirt (Boutique)', de: 'Spreadshirt (Shop)', id: 'Spreadshirt (Toko)', bn: 'স্প্রেডশার্ট', ur: 'اسپریڈ شرٹ', ar: 'سبريد شيرت', tlh: 'Spreadshirt (ngevwI’)', pig: 'EadshirtSpray',
      es: 'Spreadshirt (Tienda)',
      pt: 'Spreadshirt (Loja)',
      ja: 'スプレッドシャツ',
      zh: 'Spreadshirt 定制',
      hi: 'स्प्रेडशर्ट',
      ru: 'Spreadshirt (Печать)',
    },
  },
];

function dataUrlToBlobUrl(dataUrl: string): string {
  try {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(parts[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return dataUrl;
  }
}

export const ApparelModal: React.FC<ApparelModalProps> = ({
  isOpen,
  onClose,
  album,
  onNotify,
}) => {
  const [frontMode, setFrontMode] = useState<'cutout' | 'plaque'>('cutout');
  const [includeBack, setIncludeBack] = useState(true);
  const [tourMode, setTourMode] = useState<TourScheduleMode>('canonical');
  const [mixSeed, setMixSeed] = useState(0);
  const [customStop, setCustomStop] = useState('');
  const [customStopPlacement, setCustomStopPlacement] = useState<CustomStopPlacement>('mid-tour');
  const [customStopMeta, setCustomStopMeta] = useState<{ dates: string[]; column: 1 | 2 } | null>(null);
  const [inkColor, setInkColor] = useState('#8b1410');
  const [frontDataUrl, setFrontDataUrl] = useState<string>('');
  const [backDataUrl, setBackDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  // Download handoff state
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [pendingVendor, setPendingVendor] = useState<{ name: string; url: string } | null>(null);

  // Back Tour Graphic Zoom/Pan Inspector State (mirrors SleeveZoomModal UX)
  const [isBackZoomOpen, setIsBackZoomOpen] = useState(false);
  const [backZoom, setBackZoom] = useState(1.0);
  const [backPan, setBackPan] = useState({ x: 0, y: 0 });
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const backDragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Render high-res front graphic whenever album or frontMode changes
  useEffect(() => {
    if (!isOpen || !album) {
      setHasDownloaded(false);
      setPendingVendor(null);
      setIsBackZoomOpen(false);
      setCustomStop('');
      setCustomStopPlacement('mid-tour');
      setCustomStopMeta(null);
      return;
    }

    let cancelled = false;
    setIsRendering(true);
    setHasDownloaded(false);
    setPendingVendor(null);

    renderHighResFrontGraphic(album, frontMode).then((fUrl) => {
      if (cancelled) return;
      setFrontDataUrl(fUrl);
      setIsRendering(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, album, frontMode]);

  const activeLang = resolveActiveLocale();

  // Render back tour schedule graphic whenever tourMode, mixSeed, customStop, inkColor, activeLang, or album changes
  useEffect(() => {
    if (!isOpen || !album) return;
    setHasDownloaded(false);
    setPendingVendor(null);
    const baseStops =
      tourMode === 'procedural'
        ? generateProceduralTourRoster(album, activeLang)
        : tourMode === 'mixed'
        ? generateMixedTourRoster(album, mixSeed, activeLang)
        : localizeTourStops(CANONICAL_TOUR_ROSTER, activeLang);

    let stops = baseStops;
    if (customStop.trim()) {
      const injected = injectCustomTourStop(
        baseStops,
        customStop,
        customStopPlacement,
        `${album.id}|${tourMode}|${mixSeed}`
      );
      stops = injected.stops;
      setCustomStopMeta({ dates: injected.injectedDates, column: injected.column });
    } else {
      setCustomStopMeta(null);
    }

    const bUrl = renderTourBackGraphic({ accentColor: inkColor, stops });
    setBackDataUrl(bUrl);
  }, [isOpen, album, tourMode, mixSeed, customStop, customStopPlacement, inkColor, activeLang]);

  useEffect(() => {
    setHasDownloaded(false);
    setPendingVendor(null);
    if (!includeBack) {
      setIsBackZoomOpen(false);
    }
  }, [includeBack]);

  // Reset Back Zoom viewport when opened & bind Escape key
  useEffect(() => {
    if (!isBackZoomOpen) return;
    setBackZoom(1.5);
    setBackPan({ x: 0, y: 0 });
    setIsDraggingBack(false);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsBackZoomOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBackZoomOpen]);

  if (!isOpen || !album) return null;

  const isFuturePressing = parseInt(album.year, 10) > new Date().getFullYear();
  const slug = album.bandName.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '') || 'ydrbn';
  const frontFilename = `${slug}_front_300dpi.png`;
  const backFilename = `${slug}_back_tour_300dpi.png`;

  const getMaxBackPan = (z: number) => {
    if (z <= 1.0) return 0;
    return (360 * z) / 2 + 110;
  };

  const handleBackZoomChange = (newZoom: number) => {
    const clamped = Math.max(1.0, Math.min(2.5, parseFloat(newZoom.toFixed(2))));
    setBackZoom(clamped);
    if (clamped <= 1.0) {
      setBackPan({ x: 0, y: 0 });
    } else {
      const maxP = getMaxBackPan(clamped);
      setBackPan((prev) => ({
        x: Math.max(-maxP, Math.min(maxP, prev.x)),
        y: Math.max(-maxP, Math.min(maxP, prev.y)),
      }));
    }
  };

  const handleBackMouseDown = (e: React.MouseEvent) => {
    if (backZoom <= 1.0) return;
    setIsDraggingBack(true);
    backDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: backPan.x,
      panY: backPan.y,
    };
  };

  const handleBackMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBack) return;
    e.preventDefault();
    const dx = e.clientX - backDragStartRef.current.x;
    const dy = e.clientY - backDragStartRef.current.y;
    const maxP = getMaxBackPan(backZoom);
    setBackPan({
      x: Math.max(-maxP, Math.min(maxP, backDragStartRef.current.panX + dx)),
      y: Math.max(-maxP, Math.min(maxP, backDragStartRef.current.panY + dy)),
    });
  };

  const handleBackMouseUp = () => setIsDraggingBack(false);

  const handleBackTouchStart = (e: React.TouchEvent) => {
    if (backZoom <= 1.0 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDraggingBack(true);
    backDragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      panX: backPan.x,
      panY: backPan.y,
    };
  };

  const handleBackTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingBack || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - backDragStartRef.current.x;
    const dy = touch.clientY - backDragStartRef.current.y;
    const maxP = getMaxBackPan(backZoom);
    setBackPan({
      x: Math.max(-maxP, Math.min(maxP, backDragStartRef.current.panX + dx)),
      y: Math.max(-maxP, Math.min(maxP, backDragStartRef.current.panY + dy)),
    });
  };

  const handleBackWheel = (e: React.WheelEvent) => {
    if (backZoom <= 1.0) return;
    e.preventDefault();
    const maxP = getMaxBackPan(backZoom);
    setBackPan((prev) => ({
      x: Math.max(-maxP, Math.min(maxP, prev.x - e.deltaX)),
      y: Math.max(-maxP, Math.min(maxP, prev.y - e.deltaY)),
    }));
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const blobUrl = dataUrlToBlobUrl(dataUrl);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (blobUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    }
  };

  const handleDownloadAll = () => {
    if (!frontDataUrl || isRendering) return;

    triggerDownload(frontDataUrl, frontFilename);

    if (includeBack && backDataUrl) {
      setTimeout(() => {
        triggerDownload(backDataUrl, backFilename);
      }, 400);
    }

    setHasDownloaded(true);
    if (onNotify) {
      onNotify(
        'success',
        includeBack
          ? `Saved ${frontFilename} & ${backFilename} to Downloads.`
          : `Saved ${frontFilename} to Downloads.`
      );
    }
  };

  const handleVendorClick = (fab: { name: string; url: string }) => {
    if (!hasDownloaded) {
      handleDownloadAll();
      setPendingVendor(fab);
      return;
    }
    window.open(fab.url, '_blank', 'noopener,noreferrer');
  };

  const backZoomPercent = Math.round(backZoom * 100);

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
        <div className="w-full max-w-lg bg-[#161310] border border-amber-800/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#12100e] shrink-0">
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="font-display tracking-wider text-base text-[#f3ede4] uppercase">
                  Apparel Fabrication Terminal
                </h3>
                <span className="text-[10px] text-amber-400/80 font-mono block -mt-0.5">
                  300 DPI Print PNGs • Save Locally &amp; Self-Upload
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Configuration Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto text-xs text-slate-300 flex-1">
            {/* Side-by-Side Previews: Static Front (Left) & Click-to-Zoom Back Tour (Right) */}
            <div className="grid grid-cols-2 gap-3">
              {/* LEFT: Front Chest Preview (Static — matches main deck sleeve 100%) */}
              <div className="space-y-1.5 text-center">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Front: Chest
                  </span>
                  <button
                    type="button"
                    disabled={isRendering || !frontDataUrl}
                    onClick={() => {
                      triggerDownload(frontDataUrl, frontFilename);
                      onNotify?.('success', `Saved ${frontFilename}`);
                    }}
                    className="text-[9.5px] font-mono text-amber-400 hover:text-amber-200 disabled:opacity-40 inline-flex items-center gap-0.5 cursor-pointer"
                    title="Download front PNG individually"
                  >
                    <Download className="w-2.5 h-2.5" />
                    <span>Save Front</span>
                  </button>
                </div>
                <div className="aspect-square rounded-xl border border-slate-800 bg-black/70 p-2 flex items-center justify-center overflow-hidden cursor-default">
                  {isRendering || !frontDataUrl ? (
                    <span className="font-mono text-[10px] text-amber-500 animate-pulse">
                      Rendering...
                    </span>
                  ) : (
                    <img
                      src={frontDataUrl}
                      alt="Front print"
                      className="max-h-full max-w-full object-contain pointer-events-none"
                    />
                  )}
                </div>
              </div>

              {/* RIGHT: Back Tour Preview (Clickable to inspect at 100%–250% scale) */}
              <div className="space-y-1.5 text-center">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Back: Tour
                  </span>
                  {includeBack && (
                    <button
                      type="button"
                      disabled={!backDataUrl}
                      onClick={() => {
                        triggerDownload(backDataUrl, backFilename);
                        onNotify?.('success', `Saved ${backFilename}`);
                      }}
                      className="text-[9.5px] font-mono text-amber-400 hover:text-amber-200 disabled:opacity-40 inline-flex items-center gap-0.5 cursor-pointer"
                      title="Download back tour PNG individually"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Save Back</span>
                    </button>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (includeBack && backDataUrl) {
                      setIsBackZoomOpen(true);
                    }
                  }}
                  title={
                    includeBack && backDataUrl
                      ? 'Click to zoom and inspect tour dates'
                      : undefined
                  }
                  className={`relative aspect-square rounded-xl border border-slate-800 bg-black/70 p-2 flex items-center justify-center overflow-hidden transition-colors ${
                    !includeBack
                      ? 'opacity-30 cursor-default'
                      : backDataUrl
                      ? 'cursor-zoom-in hover:border-amber-500/60 group'
                      : 'cursor-default'
                  }`}
                >
                  {!includeBack ? (
                    <span className="font-mono text-[10px] text-slate-500">Back Disabled</span>
                  ) : !backDataUrl ? (
                    <span className="font-mono text-[10px] text-amber-500 animate-pulse">
                      Rendering...
                    </span>
                  ) : (
                    <>
                      <img
                        src={backDataUrl}
                        alt="Back tour print"
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-black/85 group-hover:bg-black text-amber-200 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-amber-400/40 flex items-center gap-1 shadow-md">
                        <ZoomIn className="w-2.5 h-2.5 text-amber-400" />
                        <span>Zoom</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Front Mode Toggles */}
            <div className="space-y-1.5 bg-[#100e0c] p-3 rounded-xl border border-slate-800">
              <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Front Print Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFrontMode('cutout')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    frontMode === 'cutout'
                      ? 'border-amber-500/60 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-xs block">Isolated Cutout</span>
                  <span className="text-[9.5px] leading-tight block text-slate-400 mt-0.5">
                    Transparent alpha; fabric shows through (ideal for black shirts).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFrontMode('plaque')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    frontMode === 'plaque'
                      ? 'border-amber-500/60 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-xs block">Full Sleeve Plaque</span>
                  <span className="text-[9.5px] leading-tight block text-slate-400 mt-0.5">
                    Exact 1:1 square sleeve cover from the main deck.
                  </span>
                </button>
              </div>
            </div>

            {/* Back Tour Dates, 3 Roster Modes & Color Toggles */}
            <div className="space-y-2.5 bg-[#100e0c] p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tour Schedule (Back Print)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeBack(!includeBack)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all border cursor-pointer ${
                    includeBack
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {includeBack ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {includeBack && (
                <>
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTourMode('canonical')}
                      className={`p-1.5 rounded-lg border text-left transition-all font-mono cursor-pointer ${
                        tourMode === 'canonical'
                          ? 'border-amber-500/60 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-[10.5px] block">
                        Canonical &apos;77 Circuit
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Twin Peaks, Bikini Bottom, Mordor...
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTourMode('procedural')}
                      className={`p-1.5 rounded-lg border text-left transition-all font-mono cursor-pointer ${
                        tourMode === 'procedural'
                          ? 'border-amber-500/60 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-[10.5px] block">
                        {isFuturePressing ? 'Chrono-Orbital Circuit' : 'Municipal Lore Circuit'}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        {isFuturePressing
                          ? 'Luna, Mars, Orbital Cistern #4...'
                          : 'Flumptown Annex, Zoning Board...'}
                      </span>
                    </button>

                    {/* Option 3: Randomized Mashup of Canonical + Municipal/Orbital in Chronological Order */}
                    <button
                      type="button"
                      onClick={() => {
                        if (tourMode === 'mixed') {
                          setMixSeed((s) => s + 1);
                        } else {
                          setTourMode('mixed');
                        }
                      }}
                      className={`col-span-2 p-2 rounded-lg border text-left transition-all font-mono flex items-center justify-between gap-2 cursor-pointer ${
                        tourMode === 'mixed'
                          ? 'border-amber-500/60 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[10.5px] block">
                          Mixed Mashup Circuit (Randomized)
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          Shuffles Canonical &amp; {isFuturePressing ? 'Orbital/Municipal' : 'Municipal'} stops in chronological date order
                        </span>
                      </div>
                      <span className="px-2 py-1 rounded bg-black/50 border border-amber-500/30 text-[9px] text-amber-300 font-bold inline-flex items-center gap-1 shrink-0">
                        <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
                        <span>{tourMode === 'mixed' ? 'Reshuffle' : 'Mix'}</span>
                      </span>
                    </button>
                  </div>

                  {/* Non-Persistent Single Custom Tour Stop Input */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-300 font-mono font-bold">
                        Custom Tour Stop (One-Off / Non-Persistent):
                      </label>
                      {customStop.trim() && (
                        <div className="flex items-center gap-1 font-mono text-[9px]">
                          {(
                            [
                              { id: 'mid-tour', label: '1 Night' },
                              { id: 'two-night', label: '2 Nights' },
                              { id: 'finale', label: 'Finale' },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCustomStopPlacement(opt.id)}
                              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                customStopPlacement === opt.id
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={28}
                        value={customStop}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.trim() && !customStop.trim() && tourMode !== 'mixed') {
                            setTourMode('mixed');
                          }
                          setCustomStop(val);
                        }}
                        placeholder="e.g., Longview, WA or Budokan, JP (this export only)"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-700 text-[11px] text-slate-200 placeholder-slate-600 focus:border-amber-500 outline-none font-mono"
                      />
                      {customStop && (
                        <button
                          type="button"
                          onClick={() => setCustomStop('')}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                          title="Clear custom tour location"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {customStop.trim() && customStopMeta && customStopMeta.dates.length > 0 && (
                      <div className="px-2 py-1 rounded bg-emerald-950/45 border border-emerald-500/40 text-[9.5px] font-mono text-emerald-200 flex items-center justify-between gap-2">
                        <span className="truncate">
                          ✓ Combined into{' '}
                          <strong>
                            {tourMode === 'mixed'
                              ? 'Mixed Mashup'
                              : tourMode === 'procedural'
                              ? isFuturePressing
                                ? 'Chrono-Orbital'
                                : 'Municipal Lore'
                              : "Canonical '77"}
                          </strong>
                        </span>
                        <span className="text-amber-300 font-bold shrink-0">
                          {`Col ${customStopMeta.column} • ${customStopMeta.dates.join(' & ')}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Back Ink Pigment:</span>
                    <div className="flex gap-2">
                      {INK_PALETTES.map((pal) => (
                        <button
                          key={pal.hex}
                          type="button"
                          onClick={() => setInkColor(pal.hex)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                            inkColor === pal.hex
                              ? 'border-amber-400 bg-slate-800 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-400'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: pal.hex }}
                          />
                          <span>{pal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Explicit Manual Upload Instructions */}
            <div className="p-3 rounded-xl bg-sky-950/25 border border-sky-500/35 space-y-1.5 font-mono">
              <div className="flex items-center gap-1.5 text-sky-300 font-bold text-[10px] uppercase tracking-wide">
                <Upload className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                <span>Manual Upload Required (Images Do Not Auto-Fill)</span>
              </div>
              <p className="text-[9.5px] leading-relaxed text-slate-300">
                Web browsers block apps from pre-loading files onto external store pages—the links below open a <strong>blank t-shirt designer</strong>. Save your 300 DPI PNG(s) in <strong>Step 1</strong> first, then use the vendor&apos;s <strong>&ldquo;Upload / Add Image&rdquo;</strong> button to select the saved file(s) from your device&apos;s Downloads folder.
              </p>
            </div>

            {/* Institutional Separation Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5 text-amber-200/90 font-mono">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wide">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Notice: No Affiliation With Vendors</span>
              </div>
              <p className="text-[9.5px] leading-relaxed text-slate-400">
                Once you are redirected to the vendor&apos;s site, you are on your own! All sizing and color choices happen independently, as Y.D.R.B.N. has no commercial ties and assumes zero liability for clothing items, orders, or deliveries. Y.D.R.B.N. does not recommend any particular vendors, these were just handy options. DO NOT FOLD, SPINDLE, OR MUTILATE Y.D.R.B.N.
              </p>
            </div>
          </div>

          {/* Two-Step Footer: Step 1 (Download Locally) -> Step 2 (Open Blank Vendor Customizer) */}
          <div className="p-3 border-t border-slate-800 bg-[#12100e] space-y-2.5 shrink-0">
            <div className="space-y-1">
              <button
                type="button"
                disabled={isRendering || !frontDataUrl}
                onClick={handleDownloadAll}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40 ${
                  hasDownloaded
                    ? 'bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-500/60'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                }`}
              >
                {hasDownloaded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      ✓ Saved to Downloads (Tap to Save {includeBack ? 'Both ' : ''}Again)
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Step 1: Save 300 DPI {includeBack ? 'Front & Back PNGs' : 'Front PNG'}
                    </span>
                  </>
                )}
              </button>

              {hasDownloaded && (
                <p className="text-[9px] font-mono text-emerald-300/90 text-center truncate px-1">
                  {`Saved: ${frontFilename}${includeBack ? ` + ${backFilename}` : ''}`}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block text-center">
                Step 2: Open Blank Shirt Designer (Upload Your Saved PNGs There)
              </span>

              {pendingVendor ? (
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="text-[10px] font-mono text-emerald-200 leading-tight">
                    {(() => {
                      const lang = resolveActiveLocale();
                      const vLabel =
                        FABRICATORS.find((f) => f.name === pendingVendor.name)?.labels[lang] ||
                        pendingVendor.name;
                      const map: Partial<Record<SupportedLocale, string>> = {
                        en: `PNG${includeBack ? 's' : ''} saved! Upload on ${vLabel}:`,
                        es: `¡PNG${includeBack ? 's' : ''} guardado${includeBack ? 's' : ''}! Súbelo en ${vLabel}:`,
                        pt: `PNG${includeBack ? 's' : ''} salvo${includeBack ? 's' : ''}! Envie em ${vLabel}:`,
                        fr: `PNG enregistré${includeBack ? 's' : ''} ! Téléversez sur ${vLabel} :`,
                        de: `PNG${includeBack ? 's' : ''} gespeichert! Hochladen auf ${vLabel}:`,
                        id: `PNG disimpan! Unggah di ${vLabel}:`,
                        ja: `PNGを保存しました！${vLabel}でアップロード:`,
                        zh: `PNG已保存！请在 ${vLabel} 上传:`,
                        hi: `PNG सेव हो गया! ${vLabel} पर अपलोड करें:`,
                        bn: `PNG সেভ হয়েছে! ${vLabel}-এ আপলোড করুন:`,
                        ur: `PNG محفوظ ہو گئی! ${vLabel} پر اپ لوڈ کریں:`,
                        ar: `تم حفظ PNG! ارفعه على ${vLabel}:`,
                        ru: `PNG сохранён! Загрузите на ${vLabel}:`,
                        tlh: `PNG polta'! ${vLabel}Daq ngeH:`,
                        pig: `PNG avedsay! Uploadway onway ${vLabel}:`,
                      };
                      return map[lang] || `PNG saved! Upload on ${vLabel}:`;
                    })()}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={pendingVendor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setPendingVendor(null)}
                      className="py-1.5 px-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[10.5px] inline-flex items-center gap-1 shadow active:scale-95"
                    >
                      <span>
                        {(() => {
                          const lang = resolveActiveLocale();
                          const vLabel =
                            FABRICATORS.find((f) => f.name === pendingVendor.name)?.labels[lang] ||
                            pendingVendor.name;
                          const openMap: Partial<Record<SupportedLocale, string>> = {
                            en: `Open ${vLabel}`,
                            es: `Abrir ${vLabel}`,
                            pt: `Abrir ${vLabel}`,
                            fr: `Ouvrir ${vLabel}`,
                            de: `${vLabel} öffnen`,
                            id: `Buka ${vLabel}`,
                            ja: `${vLabel}を開く`,
                            zh: `打开 ${vLabel}`,
                            hi: `${vLabel} खोलें`,
                            bn: `${vLabel} খুলুন`,
                            ur: `${vLabel} کھولیں`,
                            ar: `افتح ${vLabel}`,
                            ru: `Открыть ${vLabel}`,
                            tlh: `${vLabel} poSmoH`,
                            pig: `Openway ${vLabel}`,
                          };
                          return openMap[lang] || `Open ${vLabel}`;
                        })()}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setPendingVendor(null)}
                      className="p-1 text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                      aria-label="Cancel redirect"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {FABRICATORS.map((fab) =>
                    hasDownloaded ? (
                      <a
                        key={fab.name}
                        href={fab.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-[#f3ede4] text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                      >
                        <span>{fab.labels[resolveActiveLocale()] || fab.name}</span>
                        <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                      </a>
                    ) : (
                      <button
                        key={fab.name}
                        type="button"
                        disabled={isRendering || !frontDataUrl}
                        onClick={() => handleVendorClick(fab)}
                        className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-[#f3ede4] text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-40"
                      >
                        <span>{fab.labels[resolveActiveLocale()] || fab.name}</span>
                        <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Back Tour Roster Zoom & Pan Inspector */}
      {isBackZoomOpen && backDataUrl && (
        <div className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 select-none animate-in fade-in">
          {/* Top Zoom Controls Bar */}
          <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 py-1.5 z-20 shrink-0 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 px-2">
                Back Tour Roster
              </span>

              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-md border border-slate-700/80 text-[10px] font-mono">
                {[100, 150, 200, 250].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleBackZoomChange(pct / 100)}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      backZoomPercent === pct
                        ? 'bg-orange-500 text-slate-950 font-bold'
                        : 'text-stone-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-md h-8 px-1">
                <button
                  type="button"
                  onClick={() => handleBackZoomChange(backZoom - 0.1)}
                  disabled={backZoom <= 1.0}
                  className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 active:scale-90 cursor-pointer"
                  aria-label="Zoom Out"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center px-1">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    step="5"
                    value={backZoomPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) handleBackZoomChange(val / 100);
                    }}
                    className="w-12 bg-transparent text-center font-mono text-xs font-bold text-amber-300 focus:outline-none"
                  />
                  <span className="font-mono text-xs text-stone-400 select-none">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBackZoomChange(backZoom + 0.1)}
                  disabled={backZoom >= 2.5}
                  className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 active:scale-90 cursor-pointer"
                  aria-label="Zoom In"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsBackZoomOpen(false)}
                aria-label="Close Back Tour Zoom"
                className="h-8 w-8 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Pan / Zoom Stage */}
          <div
            onMouseDown={handleBackMouseDown}
            onMouseMove={handleBackMouseMove}
            onMouseUp={handleBackMouseUp}
            onMouseLeave={handleBackMouseUp}
            onTouchStart={handleBackTouchStart}
            onTouchMove={handleBackTouchMove}
            onTouchEnd={handleBackMouseUp}
            onWheel={handleBackWheel}
            className={`flex-1 w-full overflow-hidden flex items-center justify-center relative ${
              backZoom > 1.0
                ? isDraggingBack
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-default'
            }`}
          >
            <div
              style={{
                transform: `translate3d(${backPan.x}px, ${backPan.y}px, 0px) scale(${backZoom})`,
                transformOrigin: 'center center',
                transition: isDraggingBack ? 'none' : 'transform 0.12s ease-out',
              }}
              className="w-[315px] sm:w-[360px] aspect-[3/4] rounded-xl bg-[#0b0a09] border border-slate-800 shadow-2xl p-3 flex items-center justify-center shrink-0 select-none"
            >
              <img
                src={backDataUrl}
                alt="Zoomed back tour schedule"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
          </div>

          {/* Bottom Hint */}
          <p className="text-[10px] text-stone-400 font-mono py-1 pointer-events-none text-center shrink-0">
            {backZoom > 1.0
              ? 'Drag to pan • Use presets (100%–250%) or +/- above to adjust scale'
              : 'Tap preset (150%, 200%, 250%) or + to inspect tour stops'}
          </p>
        </div>
      )}
    </>
  );
};
