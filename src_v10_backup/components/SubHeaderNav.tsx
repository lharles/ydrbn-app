import React from 'react';
import { ChevronLeft, ChevronRight, Disc3 } from 'lucide-react';
import { AlbumEntry } from '../types';

interface SubHeaderNavProps {
  entries: AlbumEntry[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export const SubHeaderNav: React.FC<SubHeaderNavProps> = ({
  entries,
  currentIndex,
  onPrev,
  onNext,
}) => {
  const current = entries[currentIndex];

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Today's Selection";
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <nav className="w-full flex items-center justify-between px-3 py-1 bg-slate-900/60 border-b border-slate-800/60 select-none">
      <button
        onClick={onPrev}
        disabled={entries.length <= 1 || currentIndex <= 0}
        aria-label="Previous record"
        className="p-1 rounded-md text-slate-400 hover:text-orange-400 disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90"
        title="Previous Album"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Dynamic Carousel representation without static counters like 'X of 28' */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2">
        {current ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium truncate max-w-full">
            <Disc3 className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate text-amber-200/90 font-mono tracking-tight text-[11px]">
              {formatDate(current.timestamp)} • {current.year} Pressing
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono tracking-tight">
            Ready for your daily drop
          </div>
        )}

        {/* Dynamic position dots */}
        {entries.length > 1 && (
          <div className="flex items-center gap-1 mt-0.5 max-w-[120px] overflow-hidden justify-center">
            {entries.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((_, idx) => {
              const actualIdx = Math.max(0, currentIndex - 3) + idx;
              const isActive = actualIdx === currentIndex;
              return (
                <div
                  key={actualIdx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isActive ? 'w-3.5 bg-orange-400' : 'w-1 bg-slate-600/70'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={entries.length <= 1 || currentIndex >= entries.length - 1}
        aria-label="Next record"
        className="p-1 rounded-md text-slate-400 hover:text-orange-400 disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90"
        title="Next Album"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
