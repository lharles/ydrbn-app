import React from 'react';
import { Archive, Heart, Share2, Shirt, Download } from 'lucide-react';

interface TopBarProps {
  onOpenArchive: () => void;
  isToday: boolean;
  onGoToToday: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onOpenApparel?: () => void;
  hasEntries: boolean;
  hasAtjBadge?: boolean;
  onOpenAtjVideo?: () => void;
  isStandalone?: boolean;
  onInstall?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenArchive,
  isToday,
  onGoToToday,
  isFavorite,
  onToggleFavorite,
  onShare,
  onOpenApparel,
  hasEntries,
  hasAtjBadge,
  onOpenAtjVideo,
  isStandalone = false,
  onInstall,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 border-b border-slate-800/80 bg-[#0c101d]/90 backdrop-blur-md z-30 select-none">
      {/* Left: Archive Button */}
      <button
        type="button"
        onClick={onOpenArchive}
        aria-label="Archive"
        title="View Record Archive"
        className="h-8 flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] font-semibold px-2 sm:px-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/30 transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
      >
        <Archive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="tracking-wide hidden sm:inline">Archive</span>
      </button>

      {/* Center: 1970s Receiver Chassis Nameplate */}
      <div className="h-8 flex items-center justify-center px-2 sm:px-2.5 rounded bg-gradient-to-b from-[#221c16] via-[#1a1511] to-[#120f0d] border border-amber-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.7)] shrink-0">
        {/* Incandescent Dial Lamp Jewel: Green when mounted standalone, amber in-browser */}
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 sm:mr-2 shrink-0 border transition-colors ${
            isStandalone
              ? 'bg-emerald-400 shadow-[0_0_6px_#10b981] border-emerald-200/40'
              : 'bg-amber-400 shadow-[0_0_6px_#f59e0b] border-amber-200/40 animate-pulse'
          }`}
          title={isStandalone ? 'Deck Mounted (Standalone PWA)' : 'Unmounted Deck (Browser Mode)'}
        />

        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-xs tracking-[0.14em] sm:tracking-[0.18em] text-[#f3ede4] uppercase drop-shadow">
            Y.D.R.B.N.
          </span>

          {/* DYNAMIC TRANSFORM: SN: CRK3 morphs into lit ATJ trigger badge */}
          {hasAtjBadge ? (
            <button
              type="button"
              onClick={onOpenAtjVideo}
              aria-label="Play Archival Transmission"
              title="Archival Vault // ATJ-01 (Tap to play)"
              className="cursor-pointer text-[8px] font-mono font-bold tracking-widest text-emerald-300 uppercase px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.4)] hover:bg-emerald-900 active:scale-90 transition-all animate-in fade-in"
            >
              ATJ
            </button>
          ) : (
            <span className="text-[8px] font-mono font-bold tracking-widest text-amber-400/90 uppercase px-1 py-0.5 rounded bg-black/50 border border-amber-700/30">
              SN: CRK3
            </span>
          )}
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Hardware Install Icon (Option 2): Only renders if running unmounted in browser */}
        {!isStandalone && onInstall && (
          <button
            type="button"
            onClick={onInstall}
            className="h-8 flex items-center justify-center gap-1 text-[10px] font-mono font-bold px-2 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] transition-all active:scale-95 cursor-pointer animate-pulse"
            title="Install Y.D.R.B.N. to Device"
            aria-label="Install app"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">INSTALL</span>
          </button>
        )}

        <button
          type="button"
          onClick={onGoToToday}
          disabled={isToday || !hasEntries}
          className={`h-8 flex items-center justify-center text-[11px] font-bold px-2 sm:px-2.5 rounded-md transition-all border cursor-pointer ${
            isToday
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
          title="Jump to Today's Record"
        >
          Today
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          disabled={!hasEntries}
          aria-label="Favorite"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`h-8 w-7.5 sm:w-8 flex items-center justify-center rounded-md transition-all border cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 active:scale-90'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-rose-400 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onShare}
          disabled={!hasEntries}
          aria-label="Share"
          title="Share Album Card"
          className="h-8 w-7.5 sm:w-8 flex items-center justify-center rounded-md bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-amber-300 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Apparel / Merch Button */}
        {onOpenApparel && (
          <button
            type="button"
            onClick={onOpenApparel}
            disabled={!hasEntries}
            aria-label="Apparel Fabrication"
            title="Open Apparel Fabrication Terminal"
            className="h-8 w-7.5 sm:w-8 flex items-center justify-center rounded-md bg-slate-800/60 text-amber-400/90 border border-slate-700 hover:text-amber-300 hover:border-amber-500/40 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Shirt className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};