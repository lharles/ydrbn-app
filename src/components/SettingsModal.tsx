import React, { useState, useEffect, useRef } from 'react';
import { X, Cpu, Wifi, Download, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey?: string;
  onSaveApiKey?: (key: string) => void;
  isDevMode: boolean;
  onToggleDevMode: (unlocked: boolean) => void;
  hasServerKey?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDevMode,
  onToggleDevMode,
}) => {
  // Secret 4x4 matrix state: each row (0..3) has selected column (0..3)
  const [matrix, setMatrix] = useState<number[]>([0, 0, 0, 0]);
  
  // Only reveals the trap slider after 10 silent seconds
  const [sliderRevealed, setSliderRevealed] = useState(false);
  
// Check if the global prompt was already intercepted before this modal mounted
  const [isInstallable, setIsInstallable] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as any).deferredPrompt);
  });

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to global PWA events dispatched from index.html
  useEffect(() => {
    if ((window as any).deferredPrompt) {
      setIsInstallable(true);
    }

    const handlePromptReady = () => setIsInstallable(true);
    const handleInstalled = () => setIsInstallable(false);

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      (window as any).deferredPrompt = null;
      setIsInstallable(false);
    }
  };

  // Matrix combination check:
  // Expected sequence mapping: Row 1 = Col 2 (index 1), Row 2 = Col 2 (index 1), Row 3 = Col 3 (index 2), Row 4 = Col 3 (index 2)
  const isComboActive =
    matrix[0] === 1 &&
    matrix[1] === 1 &&
    matrix[2] === 2 &&
    matrix[3] === 2;

  // The Silent 10-Second Timer & Slider Spawn
  useEffect(() => {
    // If combo is broken, instantly kill the timer and hide the slider
    if (!isComboActive) {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      setSliderRevealed(false);
      return;
    }

    // If combo is active, start a silent 10-second countdown
    holdTimeoutRef.current = setTimeout(() => {
      // Spawn the decoy slider
      setSliderRevealed(true);
    }, 10000);

    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, [isComboActive]);

  const handleRadioClick = (rowIdx: number, colIdx: number) => {
    // Final Trigger Check:
    // If the slider has been spawned AND user clicks bottom-right button (R4, C4)
    if (sliderRevealed && rowIdx === 3 && colIdx === 3) {
      onToggleDevMode(!isDevMode);
      setMatrix([0, 0, 0, 0]); // Reset matrix (which hides slider via useEffect)
      return;
    }


    setMatrix((prev) => {
      const next = [...prev];
      next[rowIdx] = colIdx;

      // Penalize deviation: If the user is currently building the combo but enters a wrong value,
      // reset the entire board instantly.
      const expected = [1, 1, 2, 2];
      
      // We only punish if they have entered values. 0 means unselected in our system.
      if (next[rowIdx] !== expected[rowIdx] && next[rowIdx] !== 0) {
        return [0, 0, 0, 0];
      }

      return next;
    });
  };

  // The Decoy Slider Handler
  const handleDecoySliderClick = () => {
    // Punish curiosity: wipe the matrix. 
    // This immediately breaks `isComboActive`, which triggers the useEffect to hide the slider.
    setMatrix([0, 0, 0, 0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm tracking-wide text-white">
              Y.D.R.B.N. System Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body - TIGHTENED PADDING AND SPACING */}
        <div className="p-3 space-y-2.5 overflow-y-auto text-xs text-slate-300">
          
          {/* Architecture Status */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Engine Status</span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <Wifi className="w-3 h-3" />
                100% Client-Side
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Self-contained HTML5 Canvas generator & Web Audio synthesizer. Zero cloud servers,
              zero stock photo APIs, zero external costs. Instant offline rendering (&lt;50ms).
            </p>
          </div>

          {/* Custom Photo Infos */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Custom Photo Covers</span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                Selecting Photos
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Note: The analog custom photos engine utilizes persistent memory buffers. Processing
              custom photos may result in electronic bleed-through or double-exposures on sub-
              sequent pressings until the tray is flushed.
            </p>
          </div>

          {/* PWA Offline / Install Flow */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-200">App Installation</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Offline Ready
              </span>
            </div>
            
            {isInstallable ? (
              <>
                <p className="text-[11px] text-slate-400 leading-tight mb-2">
                  Install Y.D.R.B.N. directly to your device for instant offline access without an App Store.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App (Android / Desktop)
                </button>
              </>
            ) : (
              <div className="bg-black/40 p-2 rounded-lg border border-slate-800 text-[10.5px] text-slate-400 leading-tight">
                <span className="text-amber-300 font-bold block mb-1">Apple iOS / Safari Installation:</span>
                Tap the <strong className="text-slate-200">Share</strong> icon at the bottom of your Safari menu, scroll down, and tap <strong className="text-slate-200">Add to Home Screen</strong> to install.
              </div>
            )}
          </div>

          {/* Secret Developer Mode Matrix */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-200">Dev Mode</span>
              </div>
              {/* Covert UI: Never shows "UNLOCKED" in settings, always appears locked */}
              <span className="text-[10px] font-mono text-slate-500">LOCKED</span>
            </div>

            <p className="text-[10px] text-slate-400">
              Lock and Unlock Here.
            </p>

            {/* Matrix Radio Grid */}
            <div className="bg-black/40 p-2 rounded-lg border border-slate-800 space-y-1.5">
              <div className="grid grid-cols-5 gap-1 text-[10px] text-slate-500 font-mono text-center">
                <span>1701</span>
                <span>R2</span>
                <span>C3</span>
                <span>K2</span>
                <span>BB</span>
              </div>
              {[0, 1, 2, 3].map((rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-5 gap-1 items-center">
                  <span className="text-[10px] font-mono text-slate-400 text-center">
                    Q{rowIdx + 1}
                  </span>
                  {[0, 1, 2, 3].map((colIdx) => {
                    const isSelected = matrix[rowIdx] === colIdx;
                    return (
                      <button
                        key={colIdx}
                        type="button"
                        onClick={() => handleRadioClick(rowIdx, colIdx)}
                        aria-label={`Row ${rowIdx + 1} Column ${colIdx + 1}`}
                        className={`h-6 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300 shadow-sm shadow-amber-500/50'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono">{colIdx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* The Decoy Slider - ONLY mounts after 10 silent seconds of correct combo */}
            {sliderRevealed && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-300 block text-xs">
                    Dev Mode (Unlimited Drops)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Bypasses the 24-hour drop countdown
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDecoySliderClick}
                  className="relative w-12 h-6 rounded-full transition-colors p-1 bg-slate-700 hover:bg-slate-600"
                  aria-label="Toggle developer mode"
                >
                  <div className="w-4 h-4 rounded-full bg-slate-400 transition-transform translate-x-0" />
                </button>
              </div>
            )}
          </div>

          {/* Aesthetic Credit */}
          <div className="text-[10px] text-slate-500 text-center pt-0.5 font-mono">
            <a 
              href="https://www.google.com/search?q=Random+Band+Names+Charles+Key" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline transition-colors hover:text-slate-300"
            >
              Inspired by Charles Key&apos;s &ldquo;Random Band Names, Volume One&rdquo; aesthetic
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0c101d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};