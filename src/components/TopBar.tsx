import React from 'react';
import { Archive, Heart, Share2, Shirt } from 'lucide-react';

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
}) => {
  return (
    <header className="w-full flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 bg-[#0c101d]/90 backdrop-blur-md z-30 select-none">
      {/* Left: [Archive] button */}
      <button
        onClick={onOpenArchive}
        aria-label="Archive"
        title="View Record Archive"
        className="h-8 flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/30 transition-all active:scale-95 shadow-sm"
      >
        <Archive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="tracking-wide">Archive</span>
      </button>

      {/* Center: 1970s Receiver Chassis Nameplate (Static Equipment Marque) */}
      <div className="h-8 flex items-center justify-center px-2.5 rounded bg-gradient-to-b from-[#221c16] via-[#1a1511] to-[#120f0d] border border-amber-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.7)] pointer-events-none">
        {/* Incandescent Dial Lamp Jewel */}
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] mr-2 shrink-0 border border-amber-200/40" />

        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-xs tracking-[0.18em] text-[#f3ede4] uppercase drop-shadow">
            Y.D.R.B.N.
          </span>
          <span className="text-[8px] font-mono font-bold tracking-widest text-amber-400/90 uppercase px-1 py-0.2 rounded bg-black/50 border border-amber-700/30">
            SN: CRK3
          </span>

          {/* Lit ATJ Indicator Stamp (Secret Trigger) */}
          {hasAtjBadge && (
            <button
              type="button"
              onClick={onOpenAtjVideo}
              tabIndex={-1}
              className="pointer-events-auto cursor-default focus:outline-none text-[8px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.35)] animate-in fade-in"
            >
              ATJ
            </button>
          )}
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onGoToToday}
          disabled={isToday || !hasEntries}
          className={`h-8 flex items-center justify-center text-[11px] font-bold px-2.5 rounded-md transition-all border ${
            isToday
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white active:scale-95'
          }`}
          title="Jump to Today's Record"
        >
          Today
        </button>

        <button
          onClick={onToggleFavorite}
          disabled={!hasEntries}
          aria-label="Favorite"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`h-8 w-8 flex items-center justify-center rounded-md transition-all border ${
            isFavorite
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 active:scale-90'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-rose-400 active:scale-90'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <button
          onClick={onShare}
          disabled={!hasEntries}
          aria-label="Share"
          title="Share Album Card"
          className="h-8 w-8 flex items-center justify-center rounded-md bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-amber-300 transition-all active:scale-90"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Apparel / Merch Fabrication Terminal Button */}
        {onOpenApparel && (
          <button
            onClick={onOpenApparel}
            disabled={!hasEntries}
            aria-label="Apparel Fabrication"
            title="Open Apparel Fabrication Terminal"
            className="h-8 w-8 flex items-center justify-center rounded-md bg-slate-800/60 text-amber-400/90 border border-slate-700 hover:text-amber-300 hover:border-amber-500/40 transition-all active:scale-90"
          >
            <Shirt className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};