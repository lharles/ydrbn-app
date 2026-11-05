import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Download,
  Clock,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { performFactoryReset } from '../services/storageService';
import {
  VipEdition,
  VIP_EDITION_CONFIG,
  VipEditionMetadata,
} from '../services/preferencesService';

interface TechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone: boolean;
  onTriggerInstall: () => void;
  onResetCooldown: () => void;
  onNotify: (type: 'success' | 'info' | 'error', text: string) => void;
  vipEdition?: VipEdition;
  onSelectVipEdition?: (edition: VipEdition) => void;
}

const VIP_LIST: VipEditionMetadata[] = Object.values(VIP_EDITION_CONFIG);

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  isOpen,
  onClose,
  isStandalone,
  onTriggerInstall,
  onResetCooldown,
  onNotify,
  vipEdition = 'none',
  onSelectVipEdition,
}) => {
  const [swCount, setSwCount] = useState<number>(0);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [hasPrompt, setHasPrompt] = useState<boolean>(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmWipe(false);
      setCopiedLink(false);
      return;
    }

    setHasPrompt(Boolean((window as any).deferredPrompt));

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        setSwCount(regs.length);
      });
    }

    if ('caches' in window) {
      caches.keys().then((keys) => {
        setCacheKeys(keys);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeOption = VIP_EDITION_CONFIG[vipEdition] || VIP_EDITION_CONFIG.none;
  const shareUrl = `https://lharles.github.io/ydrbn-app/?edition=${activeOption.primaryUrlParam}`;

  const handleCopyVipUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    onNotify('success', `Copied VIP unlock URL: ?edition=${activeOption.primaryUrlParam}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#161310] border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/40 bg-[#0e0c0a] shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-amber-200">
                Technician Service Deck
              </h3>
              <span className="text-[9px] font-mono text-amber-500/70 block -mt-0.5">
                PWA Lifecycle &amp; QA Diagnostics
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Close technician panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostics & Operations Body */}
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs font-mono text-slate-300 flex-1">
          {/* Live Device / PWA Telemetry */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 block uppercase">
              System Telemetry:
            </span>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Display Mode:</span>
                <span className={isStandalone ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {isStandalone ? 'STANDALONE (INSTALLED)' : 'BROWSER (TAB)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Install Prompt:</span>
                <span className={hasPrompt ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {hasPrompt ? 'READY (UNCACHED)' : 'SUPPRESSED / UNAVAILABLE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Service Workers:</span>
                <span className="text-slate-200">{swCount} active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CacheStorage Buckets:</span>
                <span className="text-slate-200">{cacheKeys.length} keys</span>
              </div>
            </div>
          </div>

          {/* Special URL / VIP Edition Hardware Selector */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>VIP Edition / Bezel &amp; Wax:</span>
              </span>
              <span className="text-[9px] text-amber-400 uppercase">{activeOption.primaryUrlParam}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {VIP_LIST.map((opt) => {
                const isSelected = vipEdition === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectVipEdition?.(opt.id)}
                    className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold block truncate">{opt.techMenuLabel}</span>
                    <span className="text-[8px] text-slate-500 block truncate">
                      ?edition={opt.primaryUrlParam}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopyVipUrl}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Copied ?edition={activeOption.primaryUrlParam}!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Copy ?edition={activeOption.primaryUrlParam} Link</span>
                </>
              )}
            </button>
          </div>

          {/* QA Actions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Test Operations:
            </span>

            {/* Trigger Install Prompt */}
            <button
              type="button"
              onClick={() => {
                if ((window as any).deferredPrompt) {
                  onTriggerInstall();
                } else {
                  onNotify('info', 'Chrome is suppressing automated prompt. Test menu install via three dots (⋮).');
                }
              }}
              className="w-full py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/60 text-emerald-300 font-bold text-[11px] flex items-center justify-between transition-all active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                <span>Fire Install Prompt</span>
              </div>
              <span className="text-[9px] opacity-75">{hasPrompt ? 'ARMED' : 'SUPPRESSED'}</span>
            </button>

            {/* Reset 24-Hour Cooldown */}
            <button
              type="button"
              onClick={() => {
                onResetCooldown();
                onNotify('success', 'Daily Drop cooldown reset to 0:00.');
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-between transition-all active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero Daily Drop Cooldown</span>
              </div>
              <span className="text-[9px] text-amber-400">INSTANT MINT</span>
            </button>

            {/* Nuclear Wipe */}
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase">
                <RotateCcw className="w-3 h-3" />
                <span>Nuclear Purge &amp; Reset</span>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-tight">
                Deletes all IndexedDB, CacheStorage, localStorage, unregisters workers, and force-reloads.
              </p>
              {!confirmWipe ? (
                <button
                  type="button"
                  onClick={() => setConfirmWipe(true)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 font-bold text-[10px] uppercase transition-all active:scale-95"
                >
                  Execute Nuclear Purge
                </button>
              ) : (
                <div className="flex gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="flex-1 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => performFactoryReset()}
                    className="flex-1 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                  >
                    Confirm Wipe
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#0e0c0a] flex items-center justify-between shrink-0">
          <span className="text-[9px] font-mono text-slate-500">DEV TOOL v1.1</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-slate-700"
          >
            Exit Deck
          </button>
        </div>
      </div>
    </div>
  );
};
