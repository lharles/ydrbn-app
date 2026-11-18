import React, { useState, useEffect, useRef } from 'react';
import { LOCALE_REGISTRY, SUPPORTED_LOCALES, resolveActiveLocale } from '../services/i18nService';
import {
  X,
  HelpCircle,
  Disc,
  Layers,
  Sliders,
  Sparkles,
  Archive,
  Wrench,
  ArrowRight,
  Download,
  Heart,
  Share2,
  Shirt,
  Cpu,
  Camera,
  ExternalLink,
  Coffee,
  BookOpen,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInteractiveKey?: boolean;
  isFavorite?: boolean;
  onOpenArchive?: () => void;
  onOpenInstall?: () => void;
  onGoToToday?: () => void;
  onToggleFavorite?: () => void;
  onOpenShare?: () => void;
  onOpenApparel?: () => void;
  onOpenResetInSettings?: () => void;
  initialTab?: 'guide' | 'datasheet';
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  isInteractiveKey = false,
  isFavorite = false,
  onOpenArchive,
  onOpenInstall,
  onGoToToday,
  onToggleFavorite,
  onOpenShare,
  onOpenApparel,
  onOpenResetInSettings,
  initialTab = 'guide',
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'datasheet'>(initialTab);
  const [isPlayingGuideVideo, setIsPlayingGuideVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeLocale = resolveActiveLocale();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsPlayingGuideVideo(false);
    } else {
      setIsPlayingGuideVideo(false);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isPlayingGuideVideo) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsPlayingGuideVideo(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isPlayingGuideVideo]);

  if (!isOpen) return null;

  const searchParams = new URLSearchParams({
    q: 'site:www.amazon.com "Random Band Names" "Charles Key" B0D2R15LF4',
    gl: 'us',
    hl: 'en',
  });
  const googleSearchUrl = `https://www.google.com/search?${searchParams.toString()}`;

  const faceplateItems = [
    {
      id: 'archive',
      label: 'Archive',
      desc: '14-slot record crate & Auto-Spin radio',
      badgeClass: 'bg-slate-800 border-amber-500/30',
      icon: <Archive className="w-3 h-3 text-amber-400" />,
      action: onOpenArchive,
    },
    {
      id: 'install',
      label: 'Install',
      desc: 'Mount app to home screen for offline use',
      badgeClass: 'bg-amber-500/20 border-amber-500/40',
      icon: <Download className="w-3 h-3 text-amber-400" />,
      action: onOpenInstall,
    },
    {
      id: 'today',
      label: 'Today',
      desc: 'Jump straight to your latest pressing',
      badgeClass: 'bg-orange-500/20 border-orange-500/40',
      icon: <span className="text-[7px] font-bold text-orange-300">TDY</span>,
      action: onGoToToday,
    },
    {
      id: 'favorite',
      label: 'Favorite',
      desc: 'Protect a pressing from crate rotation',
      badgeClass: isFavorite
        ? 'bg-rose-500/20 border-rose-500/40'
        : 'bg-slate-800 border-slate-700',
      icon: (
        <Heart
          className={`w-3 h-3 ${
            isFavorite ? 'fill-rose-500 text-rose-500' : 'text-rose-400'
          }`}
        />
      ),
      action: onToggleFavorite,
    },
    {
      id: 'share',
      label: 'Share',
      desc: 'Export JPEGs, text, or a 1-tap DNA clone link',
      badgeClass: 'bg-slate-800 border-slate-700',
      icon: <Share2 className="w-3 h-3 text-amber-300" />,
      action: onOpenShare,
    },
    {
      id: 'apparel',
      label: 'Apparel',
      desc: '300 DPI t-shirt chest & tour-back PNGs',
      badgeClass: 'bg-slate-800 border-slate-700',
      icon: <Shirt className="w-3 h-3 text-amber-400" />,
      action: onOpenApparel,
    },
  ];

  const handleKeyItemClick = (action?: () => void) => {
    if (!isInteractiveKey || !action) return;
    onClose();
    action();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
        <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[84dvh] sm:max-h-[88vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d] shrink-0">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h3 className="font-display tracking-wider text-base text-white uppercase">
                Operator&apos;s Guide &amp; Data Sheet
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close field guide"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2-Tab Navigation Bar */}
          <div className="flex border-b border-slate-800 bg-[#0e1320] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Field Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('datasheet')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 cursor-pointer ${
                activeTab === 'datasheet'
                  ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Data Sheet &amp; Credits</span>
            </button>
          </div>

          {/* Scrollable Tab Body */}
          <div className="p-3.5 space-y-2.5 overflow-y-auto text-xs text-slate-300 pr-2 flex-1">
            {activeTab === 'guide' ? (
              <>
                {/* Welcome & Walkthrough Video Box */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-300 block text-xs">
                    Welcome to Y.D.R.B.N.
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your Daily Random Band Name is a 100% offline-capable band name, vinyl sleeve, and synth audio generator. When online, you can optionally check Settings for new app builds or Cargo Bay content packs.
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-amber-900/30 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsPlayingGuideVideo(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors active:scale-95 cursor-pointer"
                    >
                      <span className="text-amber-400">▶</span>
                      <span>Watch Functionality Walkthrough</span>
                    </button>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">MP4 // ~2 min</span>
                  </div>
                </div>

                {/* Choice A: Compact Top-Bar Controls Reference Key (Interactive after initial Understood) */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Top Bar Faceplate Key
                    </span>
                    {isInteractiveKey && (
                      <span className="text-[9px] font-mono text-amber-400/80 uppercase">
                        Tap to Open
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-[10.5px]">
                    {faceplateItems.map((item) =>
                      isInteractiveKey && item.action ? (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleKeyItemClick(item.action)}
                          className="w-full flex items-center justify-between gap-2 py-1 px-1.5 -mx-1 rounded-lg hover:bg-slate-800/90 border border-transparent hover:border-amber-500/35 text-left transition-all active:scale-[0.99] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-6 h-5 rounded border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.badgeClass}`}
                            >
                              {item.icon}
                            </span>
                            <span className="text-slate-300 truncate">
                              <strong className="text-slate-100 group-hover:text-amber-200 transition-colors">
                                {`${item.label}:`}
                              </strong>{' '}
                              {item.desc}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 transition-colors" />
                        </button>
                      ) : (
                        <div key={item.id} className="flex items-center gap-2 py-0.5">
                          <span
                            className={`w-6 h-5 rounded border flex items-center justify-center shrink-0 ${item.badgeClass}`}
                          >
                            {item.icon}
                          </span>
                          <span className="text-slate-300">
                            <strong className="text-slate-100">{`${item.label}:`}</strong> {item.desc}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Deck Gestures & Daily Drop */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Disc className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">⚡ Daily Drop &amp; Sleeve Gestures</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-tight">
                    Press once every 24 hours to mint today&apos;s album. <strong className="text-slate-200">Swipe left or right</strong> on the sleeve to browse your crate, tap <strong className="text-slate-200">Zoom</strong> or <strong className="text-slate-200">↺ Flip</strong> in the corner, and tap <strong className="text-slate-200">Read ↗</strong> on the back for full Liner Notes.
                  </p>
                </div>

                {/* Customize A Drop */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-sky-400">
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">Swap Cover Art &amp; Custom Drops</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-tight">
                    Open <strong className="text-slate-200">Customize A Drop</strong> to retouch the current sleeve with 1970s darkroom filters, or open <strong className="text-slate-200">Custom Drop Studio</strong> to press a brand-new record anytime.
                  </p>
                </div>

                {/* Cargo Bay & Director's Chair */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">Cargo Bay &amp; Director&apos;s Chair</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-tight">
                    Tap the footer gear icon to install expansion packs, author custom crates in The Crate Forge, or isolate custom pools.
                  </p>
                </div>

                {/* Consolidated Troubleshooting Shortcut -> Settings */}
                {onOpenResetInSettings && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Cache Refresh &amp; Reset</span>
                      </span>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Refresh app code safely (keeping your crate) or run a factory wipe in Settings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenResetInSettings();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-mono font-bold text-[10px] uppercase shrink-0 transition-all active:scale-95 cursor-pointer"
                    >
                      Open &rarr;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* TAB 2: DATA SHEET & CREDITS */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-300">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="font-bold text-xs">100% Client-Side Synthesis Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Self-contained HTML5 2D Canvas compositor and Web Audio API synthesizer. Zero cloud servers, accounts, or tracking. Internet connectivity is never required—and is only used if you opt in to check for app or Cargo Bay pack updates in Settings.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Camera className="w-3.5 h-3.5" />
                    <span className="font-bold text-xs">On-Device Darkroom &amp; 14-Slot Crate</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uploaded cover photos are processed locally in IndexedDB with 1970s Kodachrome, Cyanotype, Noir, and X-Ray darkroom wear. Your crate preserves up to 14 pressings at a time—tap the Heart icon on any standout record so it never rotates out.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">Temporal Anomalies &amp; Radiator Warp</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-tight">
                    Future-dated pressings trigger a holographic security sash, while bargain-bin G+ and FAIR copies exhibit authentic 0.55 Hz radiator-warp pitch wow on the turntable.
                  </p>
                </div>

                {/* Aesthetic Credit Link */}
                <div className="pt-1 px-1 text-center">
                  <a
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 underline font-mono transition-colors"
                  >
                    <span>
                      Inspired by the aesthetic of &ldquo;Random Band Names, Volume One&rdquo; by Charles Key
                    </span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Ko-fi Voluntary Maintenance Fund */}
                <div className="pt-1 text-center">
                  <a
                    href="https://ko-fi.com/therandoms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 text-[10px] font-mono text-slate-400 hover:text-amber-300 transition-all shadow-xs active:scale-95"
                    title="Voluntary tip to support development"
                  >
                    <Coffee className="w-3 h-3 text-amber-400/80 shrink-0" />
                    <span>Subsidize Virtual Turntable Maintenance [donate]</span>
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0c101d] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono text-slate-500">
              {activeTab === 'guide' ? 'FIELD GUIDE v1.2' : 'DATA SHEET v1.2'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Understood</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* In-App Walkthrough Video Player Overlay */}
      {isPlayingGuideVideo && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black animate-in fade-in select-none">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-black/90 border-b border-amber-900/50 shrink-0 z-10 pt-[calc(0.75rem+env(safe-area-inset-top))]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-200">
                Walkthrough // Functionality Guide
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPlayingGuideVideo(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono flex items-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Close walkthrough"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden p-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <video
              ref={videoRef}
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/video/guide.mp4`}
              controls
              autoPlay
              playsInline
              crossOrigin="anonymous"
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget;
                const tracks = vid.textTracks;
                for (let i = 0; i < tracks.length; i++) {
                  const trk = tracks[i];
                  if (activeLocale !== 'en' && trk.language === activeLocale) {
                    trk.mode = 'showing';
                  } else {
                    trk.mode = 'disabled';
                  }
                }
              }}
              onEnded={() => setIsPlayingGuideVideo(false)}
              className="max-w-full max-h-full rounded-lg object-contain shadow-2xl"
            >
              {SUPPORTED_LOCALES.map((code) => {
                const pack = LOCALE_REGISTRY[code];
                const isDefaultSub = activeLocale !== 'en' && code === activeLocale;
                return (
                  <track
                    key={code}
                    kind="subtitles"
                    src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/video/subtitles/guide_${code}.vtt`}
                    srcLang={code}
                    label={`${pack.nativeName} (${pack.shortBadge})`}
                    default={isDefaultSub}
                  />
                );
              })}
            </video>
          </div>
        </div>
      )}
    </>
  );
};
