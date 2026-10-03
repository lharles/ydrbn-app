import React from 'react';
import { Archive, Heart, Share2, Disc } from 'lucide-react';

interface TopBarProps {
  onOpenArchive: () => void;
  isToday: boolean;
  onGoToToday: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  hasEntries: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenArchive,
  isToday,
  onGoToToday,
  isFavorite,
  onToggleFavorite,
  onShare,
  hasEntries,
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

      {/* Center: "Y.D.R.B.N. PRO" pill badge (div) */}
      <div className="h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-full bg-gradient-to-r from-orange-950/70 via-amber-950/50 to-orange-950/70 border border-orange-500/40 shadow-inner">
        <Disc className="w-3.5 h-3.5 text-orange-500 animate-[spin_6s_linear_infinite] shrink-0" />
        <span className="font-extrabold tracking-wider text-[11px] bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent font-mono drop-shadow">
          Y.D.R.B.N. PRO
        </span>
      </div>

      {/* Right: "Today" button, favorite (heart) icon, and share icon */}
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
      </div>
    </header>
  );
};