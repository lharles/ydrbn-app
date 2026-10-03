import React from 'react';
import { Zap, Clock, Disc } from 'lucide-react';
import { formatCooldown } from '../services/storageService';

interface DailyDropButtonProps {
  onDailyDrop: () => void;
  isLoading: boolean;
  cooldownMs: number;
  isDevMode: boolean;
}

export const DailyDropButton: React.FC<DailyDropButtonProps> = ({
  onDailyDrop,
  isLoading,
  cooldownMs,
  isDevMode,
}) => {
  const isCooldownActive = cooldownMs > 0 && !isDevMode;

  return (
    <div className="w-full px-3 py-1">
      <button
        onClick={onDailyDrop}
        disabled={isLoading || isCooldownActive}
        className={`w-full h-9 px-3 rounded-lg font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5 border ${
          isLoading
            ? 'bg-orange-700/60 text-orange-200 border-orange-500/50 cursor-wait'
            : isCooldownActive
            ? 'bg-slate-800/80 text-slate-400 border-slate-700/80 cursor-not-allowed opacity-80'
            : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 text-slate-950 border-amber-300/40 shadow-orange-500/25 animate-pulse'
        }`}
      >
        {isLoading ? (
          <>
            <Disc className="w-3.5 h-3.5 animate-spin text-orange-200 shrink-0" />
            <span>PRESSING VINYL...</span>
          </>
        ) : isCooldownActive ? (
          <>
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>DAILY DROP IN {formatCooldown(cooldownMs)}</span>
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5 fill-current text-slate-950 shrink-0" />
            <span>
              ⚡ DAILY DROP {isDevMode ? '(DEV UNLOCKED)' : ''}
            </span>
          </>
        )}
      </button>
    </div>
  );
};