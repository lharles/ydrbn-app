import React from 'react';
import { Settings, ShieldAlert, Wifi } from 'lucide-react';

interface FooterInfoProps {
  onOpenSettings: () => void;
  isDevMode: boolean;
}

export const FooterInfo: React.FC<FooterInfoProps> = ({
  onOpenSettings,
  isDevMode,
}) => {
  return (
    <footer className="w-full px-3 py-1.5 flex items-center justify-between border-t border-slate-800/80 bg-[#0c101d]/90 text-[10px] text-slate-400 select-none">
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-200 tracking-tight">
            Y.D.R.B.N. &mdash; Your Daily Random Band Name
          </span>
          {isDevMode && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 inline-flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" />
              DEV
            </span>
          )}
        </div>
        <span className="text-slate-500 truncate">
          New random band daily &bull; 100% Offline PWA
        </span>
      </div>

      <button
        onClick={onOpenSettings}
        aria-label="Settings and Developer Mode"
        title="Settings & Dev Mode"
        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 border border-slate-700/80 transition-all active:scale-95 shrink-0 shadow-sm"
      >
        <Settings className="w-4 h-4" />
      </button>
    </footer>
  );
};
