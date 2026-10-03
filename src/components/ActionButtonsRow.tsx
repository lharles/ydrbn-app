import React from 'react';
import { RotateCw, Music2, Square } from 'lucide-react';

interface ActionButtonsRowProps {
  isFlipped: boolean;
  onToggleFlip: () => void;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  disabled?: boolean;
}

export const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  isFlipped,
  onToggleFlip,
  isPlayingAudio,
  onPlayAudio,
  disabled = false,
}) => {
  return (
    <div className="w-full px-3 py-1 flex items-center justify-between gap-2 z-20">
      {/* Button 1: [↺ Back Sleeve & Tracks / Front Cover] */}
      <button
        onClick={onToggleFlip}
        disabled={disabled}
        className={`flex-1 h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-md text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 border ${
          isFlipped
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10'
            : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700/90 hover:text-white'
        }`}
      >
        <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${isFlipped ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
        <span className="truncate">{isFlipped ? 'Front Cover' : 'Back Sleeve & Tracks'}</span>
      </button>

      {/* Button 2: [♫ Create Audio Clip From Album] */}
      <button
        onClick={onPlayAudio}
        disabled={disabled}
        className={`flex-1 h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-md text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 border ${
          isPlayingAudio
            ? 'bg-orange-500 text-slate-950 font-bold border-orange-400 shadow-orange-500/30'
            : 'bg-gradient-to-r from-orange-600/80 to-amber-600/80 text-orange-100 border-orange-500/40 hover:from-orange-500 hover:to-amber-500 hover:text-white'
        }`}
      >
        {isPlayingAudio ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current animate-pulse shrink-0" />
            <span className="truncate">Playing Synth Clip...</span>
          </>
        ) : (
          <>
            <Music2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">Create Audio Clip</span>
          </>
        )}
      </button>
    </div>
  );
};