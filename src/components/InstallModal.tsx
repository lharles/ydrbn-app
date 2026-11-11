import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Share,
  MoreVertical,
  Monitor,
  ShieldCheck,
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone: boolean;
  onInstalled?: () => void;
}

function detectPlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  return 'desktop';
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  isStandalone,
  onInstalled,
}) => {
  const [hasNativePrompt, setHasNativePrompt] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as any).deferredPrompt);
  });
  const platform = detectPlatform();

  useEffect(() => {
    if (!isOpen) return;
    setHasNativePrompt(Boolean((window as any).deferredPrompt));

    const onReady = () => setHasNativePrompt(true);
    const onDone = () => {
      setHasNativePrompt(false);
      onInstalled?.();
    };

    window.addEventListener('pwa-prompt-ready', onReady);
    window.addEventListener('pwa-installed', onDone);
    return () => {
      window.removeEventListener('pwa-prompt-ready', onReady);
      window.removeEventListener('pwa-installed', onDone);
    };
  }, [isOpen, onInstalled]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      (window as any).deferredPrompt = null;
      setHasNativePrompt(false);
      onInstalled?.();
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[65] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111625] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="font-display tracking-wider text-base text-white uppercase">
              Install Offline Deck
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Y.D.R.B.N. runs <strong className="text-white">100% offline</strong> on your device. Installing mounts it to your home screen or desktop without browser bars, app stores, or accounts.
            </p>
          </div>

          {isStandalone ? (
            <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-600/50 text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-[11px] leading-snug">
                Deck is mounted and operating in standalone offline mode.
              </span>
            </div>
          ) : hasNativePrompt ? (
            <button
              type="button"
              onClick={handleNativeInstall}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider font-mono bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install Y.D.R.B.N. Now ({platform === 'android' ? 'Android' : 'Desktop'})</span>
            </button>
          ) : platform === 'ios' ? (
            <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Share className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>iPhone / iPad (Safari):</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1.5 font-mono leading-snug">
                <li>
                  Tap the <strong>Share</strong> button in Safari&apos;s toolbar.
                </li>
                <li>
                  Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </li>
              </ol>
            </div>
          ) : platform === 'android' ? (
            <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <MoreVertical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Android (Chrome):</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1.5 font-mono leading-snug">
                <li>
                  Tap Chrome&apos;s menu (<strong>⋮</strong>) in the top-right corner.
                </li>
                <li>
                  Tap <strong>&ldquo;Install app&rdquo;</strong> (or <strong>&ldquo;Add to Home screen&rdquo;</strong>).
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Monitor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Desktop Browser (Chrome / Edge):</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                Click the <strong>Install</strong> icon on the right side of your address bar, or open the browser menu (<strong>⋮</strong>) and choose <strong>&ldquo;Install Y.D.R.B.N.&rdquo;</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0c101d] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
