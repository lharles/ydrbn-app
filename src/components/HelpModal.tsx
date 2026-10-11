import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  Disc,
  Layers,
  Sliders,
  Sparkles,
  Archive,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [isTroubleshootingCollapsed, setIsTroubleshootingCollapsed] = useState(true);

  // Reset to collapsed whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsTroubleshootingCollapsed(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d] shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-display tracking-wider text-base text-white uppercase">
              User Functionality Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close field guide"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-2.5 overflow-y-auto text-xs text-slate-300 pr-2 flex-1">
          {/* Welcome Box */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-300 block text-xs">
              Welcome to Y.D.R.B.N.
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your Daily Random Band Name is a novelty band name/album cover generator. It can function entirely offline, (but when online can retrieve optional/updated content, if desired). Every day a new band/album drop can be created. There are many tweaks available for you to customize your experience. Enjoy!
            </p>

          {/* Direct Video Link */}
          <div className="mt-2.5 pt-2 border-t border-amber-900/30 flex items-center justify-between">
              <a
                href={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/video/guide.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
              >
                <span>▶ Watch Functionality Walkthrough</span>
                <span className="text-[10px] text-amber-500/70">↗</span>
              </a>
              <span className="text-[9px] font-mono text-slate-500 uppercase">MP4 // ~2.5 min</span>
            </div>
          </div>

          {/* Daily Drop */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Disc className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold text-xs text-slate-100">⚡ Daily Drop</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-tight">
              Press once every 24 hours to mint today&apos;s album.
            </p>
          </div>

          {/* Cargo Bay & Director's Chair */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold text-xs text-slate-100">The Cargo Bay &amp; Director&apos;s Chair</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-tight">
              Click the gear icon to manage modular expansion packs for vocabulary, subjects, and backdrops—or disable default assets entirely to isolate custom packs.
            </p>
          </div>

          {/* Custom Cover Photos */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <div className="flex items-center gap-1.5 text-sky-400">
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold text-xs text-slate-100">Custom Cover Photos</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-tight">
              Toggle custom photos to run your own snapshots through the 1970s Kodachrome wear and halftone aging engine.
            </p>
          </div>

          {/* Temporal Pressings */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold text-xs text-slate-100">Temporal Pressings</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-tight">
              Any record pressed in a year beyond your device&apos;s present calendar triggers an iridescent lenticular holographic security sash from the future.
            </p>
          </div>

          {/* The Crate Archive */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Archive className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold text-xs text-slate-100">The Crate Archive</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-tight">
              Tap <strong className="text-slate-200">Archive</strong> in the top header to browse your back-catalog, favorite standout pressings, or export sleeve cards.
            </p>
          </div>

          {/* Collapsible: Troubleshooting & Manual Reset */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all">
            <div
              onClick={() => setIsTroubleshootingCollapsed(!isTroubleshootingCollapsed)}
              className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 select-none transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isTroubleshootingCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <div className="flex items-center gap-1.5 text-amber-400 min-w-0">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold text-xs tracking-wide uppercase truncate">
                    Troubleshooting &amp; Manual Reset
                  </span>
                </div>
              </div>
            </div>

            {!isTroubleshootingCollapsed && (
              <div className="p-2.5 pt-1 space-y-2 border-t border-slate-800/60 bg-black/20 animate-in fade-in duration-150">
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  If the app fails to load an update or remains stuck on old assets, your browser or OS may be holding a stale service worker cache. Clear it manually:
                </p>
                <div className="space-y-1 text-[10px] text-slate-400 font-mono leading-relaxed">
                  <div>
                    <strong className="text-slate-200">iOS Safari:</strong> Settings → Safari → Advanced → Website Data → Search domain → Delete.
                  </div>
                  <div>
                    <strong className="text-slate-200">Android Chrome:</strong> Settings → Apps → Chrome (or YDRBN) → Storage → Clear Storage.
                  </div>
                  <div>
                    <strong className="text-slate-200">Desktop:</strong> Press <strong className="text-slate-200">Ctrl + Shift + R</strong> or <strong className="text-slate-200">Cmd + Shift + R</strong> to force-reload.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0c101d] flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-500">INFO DOC v1.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Understood</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};