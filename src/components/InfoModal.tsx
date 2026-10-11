import React from 'react';
import { X, Info, Cpu, Camera, ArrowRight, ExternalLink, Coffee } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const searchParams = new URLSearchParams({
    q: 'site:www.amazon.com "Random Band Names" "Charles Key" B0D2R15LF4',
    gl: 'us',
    hl: 'en',
  });
  const googleSearchUrl = `https://www.google.com/search?${searchParams.toString()}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-xs sm:text-sm tracking-wide text-white uppercase font-mono">
              Data Sheet
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close info modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs text-slate-300 pr-2">
          {/* Procedural Engine Architecture */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sky-300">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-bold text-xs">Procedural Synthesis Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fully self-contained HTML5 configurable band/album generator - with optional online components. No required cloud servers, etc. Everything assembled/generated entirely client-side.
            </p>
          </div>

          {/* Custom Photo Darkroom & Buffer Retention */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Camera className="w-3.5 h-3.5" />
              <span className="font-bold text-xs">Custom Photo Covers & Darkroom Bleed</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The analog custom photo pipeline applies 1970s print wear, halftone degradation, and grain overlays directly to imported images.
            </p>
            <p className="text-[10.5px] text-slate-500 font-mono leading-tight bg-black/40 p-2 rounded border border-slate-800/80">
              <strong className="text-amber-300/90 font-bold block mb-0.5">ARCHIVAL MEMORY NOTICE:</strong>
              The darkroom compositor utilizes persistent memory buffers. Like the aftertaste from a particularly spicy meal, custom photos may linger through the next cover generation - be sure "Use custom photos for cover generation" is unchecked - until your browser cache is cleared.
            </p>
          </div>

          {/* Aesthetic Credit Link (Preserved) */}
          <div className="pt-1 px-1 text-center">
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 underline font-mono transition-colors"
            >
              <span>Inspired by the aesthetic of &ldquo;Random Band Names, Volume One&rdquo; by Charles Key</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Added Ko-fi Voluntary Maintenance Fund */}
          <div className="pt-2 text-center">
            <a
              href="https://ko-fi.com/therandoms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 text-[10px] font-mono text-slate-400 hover:text-amber-300 transition-all shadow-xs active:scale-95"
              title="Voluntary tip to support development"
            >
              <Coffee className="w-3 h-3 text-amber-400/80 shrink-0" />
              <span>Subsidize Virtual Turntable Maintenance [donate] </span>
            </a>
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0c101d] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">DATA SHEET v1.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Understood</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};