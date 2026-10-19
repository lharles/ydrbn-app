import React, { useEffect, useState } from 'react';
import { RotateCw, Music2, Square } from 'lucide-react';
import { audioSynthesizer } from '../services/audioSynthesizer';

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
  const [levels, setLevels] = useState<{ left: number; right: number }>({ left: 0, right: 0 });

  useEffect(() => {
    if (!isPlayingAudio) {
      setLevels({ left: 0, right: 0 });
      return;
    }

    let rafId: number;
    const updateMeter = () => {
      setLevels(audioSynthesizer.getAudioLevels());
      rafId = requestAnimationFrame(updateMeter);
    };
    rafId = requestAnimationFrame(updateMeter);

    return () => cancelAnimationFrame(rafId);
  }, [isPlayingAudio]);

  const renderLedChannel = (label: string, level: number) => {
    const activeCount = Math.round(level * 10);
    return (
      <div className="flex items-center gap-1">
        <span className="text-[8px] font-mono font-bold text-amber-500/80 w-2">{label}</span>
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 10 }).map((_, i) => {
            const isLit = i < activeCount;
            const colorClass =
              i >= 8
                ? isLit
                  ? 'bg-rose-500 shadow-[0_0_5px_#f43f5e]'
                  : 'bg-rose-950/40'
                : i >= 6
                ? isLit
                  ? 'bg-amber-400 shadow-[0_0_5px_#f59e0b]'
                  : 'bg-amber-950/40'
                : isLit
                ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]'
                : 'bg-emerald-950/30';
            return <span key={i} className={`w-1.5 h-2 rounded-[1px] transition-colors duration-75 ${colorClass}`} />;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-3 py-1 space-y-1.5 z-20">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Button 1: [↺ Back Sleeve & Tracks / Front Cover] */}
        <button
          onClick={onToggleFlip}
          disabled={disabled}
          className={`btn-chassis flex-1 h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-md text-[11px] tracking-wider border cursor-pointer ${
            isFlipped
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <RotateCw
            className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
              isFlipped ? 'rotate-180 text-amber-400' : 'text-amber-500/80'
            }`}
          />
          <span className="truncate">{isFlipped ? 'Front Cover' : 'Flip Sleeve'}</span>
        </button>

        {/* Button 2: [♫ Create Audio Clip From Album] */}
        <button
          onClick={onPlayAudio}
          disabled={disabled}
          className={`btn-chassis flex-1 h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-md text-[11px] tracking-wider border cursor-pointer ${
            isPlayingAudio
              ? 'bg-orange-500 text-slate-950 font-black border-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
              : 'bg-gradient-to-b from-amber-600 to-orange-700 text-slate-950 font-black border-amber-400/50 hover:from-amber-500 hover:to-orange-600'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Square className="w-3 h-3 fill-current animate-pulse shrink-0" />
              <span className="truncate">Stop Turntable</span>
            </>
          ) : (
            <>
              <Music2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="truncate">Spin Audio Clip</span>
            </>
          )}
        </button>
      </div>

      {/* Live Recessed Stereo VU Peak Meter Bar (Reveals smoothly when audio plays) */}
      {isPlayingAudio && (
        <div className="well-inset w-full px-2.5 py-1 rounded-md flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300/90 font-bold">
              33⅓ RPM // OUTPUT LEVEL
            </span>
          </div>
          <div className="flex items-center gap-3">
            {renderLedChannel('L', levels.left)}
            {renderLedChannel('R', levels.right)}
          </div>
        </div>
      )}
    </div>
  );
};