import React, { useEffect, useState } from 'react';
import { RotateCw, Music2, Square, Disc } from 'lucide-react';
import { audioSynthesizer, TurntableRpm } from '../services/audioSynthesizer';

interface ActionButtonsRowProps {
  isFlipped: boolean;
  onToggleFlip: () => void;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  rpm?: TurntableRpm;
  onCycleRpm?: () => void;
  activeTrackLabel?: string | null;
  disabled?: boolean;
}

export const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  isFlipped,
  onToggleFlip,
  isPlayingAudio,
  onPlayAudio,
  rpm = 33,
  onCycleRpm,
  activeTrackLabel,
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

  const getRpmLabel = (r: TurntableRpm) => {
    if (r === 45) return '45 RPM (HI-SPEED)';
    if (r === 16) return '16⅔ RPM (SLUDGE)';
    return '33⅓ RPM';
  };

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
            return (
              <span
                key={i}
                className={`w-1.5 h-2 rounded-[1px] transition-colors duration-75 ${colorClass}`}
              />
            );
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

      {/* Live Recessed Stereo VU Peak Meter Bar with Interactive RPM Toggle */}
      {isPlayingAudio && (
        <div className="well-inset w-full px-2 py-1 rounded-md flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <button
              type="button"
              onClick={onCycleRpm}
              title="Click to switch turntable RPM speed (33⅓ / 45 / 16⅔)"
              className="px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Disc className="w-2.5 h-2.5 text-amber-400 animate-spin" />
              <span>{getRpmLabel(rpm)}</span>
            </button>
            {activeTrackLabel && (
              <span className="text-[8.5px] font-mono text-slate-400 truncate hidden sm:inline">
                • {activeTrackLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {renderLedChannel('L', levels.left)}
            {renderLedChannel('R', levels.right)}
          </div>
        </div>
      )}
    </div>
  );
};