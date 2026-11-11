import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Cpu,
  Download,
  Lock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  Sliders,
  Power,
  BookOpen,
  Shapes,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Radio,
  Send,
  CheckCircle2,
  Wrench,
  Palette,
  RotateCcw,
  WifiOff,
} from 'lucide-react';
import {
  getAutoCheckUpdatesPref,
  setAutoCheckUpdatesPref,
  performFactoryReset,
  performAppCacheRefresh,
} from '../services/storageService';
import { ContentPackSection } from './ContentPackSection';
import * as prefService from '../services/preferencesService';
import type { ColorMode } from '../services/preferencesService';
import { hydrateContentPools } from '../services/proceduralGenerator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey?: string;
  onSaveApiKey?: (key: string) => void;
  isDevMode: boolean;
  onToggleDevMode: (unlocked: boolean) => void;
  hasServerKey?: boolean;
  onOpenDispatch?: () => void;
  onOpenTechnician?: () => void;
  onOpenInstallModal?: () => void;
  onManualCheckUpdates?: () => Promise<void>;
  isCheckingUpdates?: boolean;
  isAppUpdateAvailable?: boolean;
  initialExpandMaintenance?: boolean;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

type SettingsView = 'main' | 'cargo-bay' | 'directors-chair';

const COLOR_MODE_OPTIONS: { id: ColorMode; label: string; desc: string; swatch: string }[] = [
  { id: 'default', label: 'Walnut', desc: '70s Brown/Gold', swatch: '#35261b' },
  { id: 'dark', label: 'Dark', desc: 'Obsidian Slate', swatch: '#0a0d14' },
  { id: 'light', label: 'Light', desc: 'Daylight Paper', swatch: '#f4efe6' },
  { id: 'contrast', label: 'Contrast', desc: 'Hi-Vis Black', swatch: '#000000' },
];

function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDevMode,
  onToggleDevMode,
  onOpenDispatch,
  onOpenTechnician,
  onOpenInstallModal,
  onManualCheckUpdates,
  isCheckingUpdates = false,
  isAppUpdateAvailable = false,
  initialExpandMaintenance = false,
  onNotify,
}) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [prefs, setPrefs] = useState(() => prefService.getPreferences());
  const [autoCheckUpdates, setAutoCheckUpdates] = useState<boolean>(() => getAutoCheckUpdatesPref());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [isDevCollapsed, setIsDevCollapsed] = useState(true);
  const [isMaintenanceCollapsed, setIsMaintenanceCollapsed] = useState(!initialExpandMaintenance);
  const [confirmReset, setConfirmReset] = useState(false);

  const [matrix, setMatrix] = useState<number[]>([0, 0, 0, 0]);
  const [sliderRevealed, setSliderRevealed] = useState(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => getIsStandalone());

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maintenanceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentView('main');
      setConfirmReset(false);
      setIsMaintenanceCollapsed(!initialExpandMaintenance);
      setIsStandalone(getIsStandalone());
      setPrefs(prefService.getPreferences());
      setAutoCheckUpdates(getAutoCheckUpdatesPref());
      if (initialExpandMaintenance) {
        setTimeout(() => {
          maintenanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
    }
  }, [isOpen, initialExpandMaintenance]);

  useEffect(() => {
    const onNet = () => setIsOnline(true);
    const offNet = () => setIsOnline(false);
    const onInstalled = () => setIsStandalone(true);

    window.addEventListener('online', onNet);
    window.addEventListener('offline', offNet);
    window.addEventListener('pwa-installed', onInstalled);
    return () => {
      window.removeEventListener('online', onNet);
      window.removeEventListener('offline', offNet);
      window.removeEventListener('pwa-installed', onInstalled);
    };
  }, []);

  const handleToggleAutoCheck = (checked: boolean) => {
    setAutoCheckUpdates(checked);
    setAutoCheckUpdatesPref(checked);
    if (checked && isOnline && onManualCheckUpdates) {
      onManualCheckUpdates();
    }
  };

  const handleSelectColorMode = (mode: ColorMode) => {
    const updated = prefService.setColorModePref(mode);
    setPrefs({ ...updated });
  };

  const handleTogglePreference = async (key: string) => {
    const currentVal = !!(prefs as any)[key];
    const nextVal = !currentVal;
    const nextPrefs = { ...prefs, [key]: nextVal };
    setPrefs(nextPrefs);
    prefService.savePreferences(nextPrefs);
    await hydrateContentPools();
  };

  const isComboActive =
    matrix[0] === 1 && matrix[1] === 1 && matrix[2] === 2 && matrix[3] === 2;

  useEffect(() => {
    if (!isComboActive) {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      setSliderRevealed(false);
      return;
    }

    holdTimeoutRef.current = setTimeout(() => {
      setSliderRevealed(true);
    }, 10000);

    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, [isComboActive]);

  const handleRadioClick = (rowIdx: number, colIdx: number) => {
    if (sliderRevealed && rowIdx === 3 && colIdx === 3) {
      onToggleDevMode(!isDevMode);
      setMatrix([0, 0, 0, 0]);
      return;
    }

    setMatrix((prev) => {
      const next = [...prev];
      next[rowIdx] = colIdx;
      const expected = [1, 1, 2, 2];
      if (next[rowIdx] !== expected[rowIdx] && next[rowIdx] !== 0) {
        return [0, 0, 0, 0];
      }
      return next;
    });
  };

  const handleDecoySliderClick = () => {
    setMatrix([0, 0, 0, 0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Dynamic Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {currentView !== 'main' && (
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 shrink-0 cursor-pointer"
                aria-label="Back to main settings"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {currentView === 'cargo-bay' ? (
              <div className="flex items-center gap-2 truncate">
                <Package className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="font-display tracking-wider text-base text-slate-100 truncate">
                  The Cargo Bay
                </h3>
              </div>
            ) : currentView === 'directors-chair' ? (
              <div className="flex items-center gap-2 truncate">
                <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-sm tracking-wide text-slate-100 truncate">
                  The Director&apos;s Chair
                </h3>
              </div>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <Cpu className="w-4 h-4 text-orange-400 shrink-0" />
                <h3 className="font-bold text-sm tracking-wide text-slate-100 truncate">
                  Y.D.R.B.N. System Settings
                </h3>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VIEW 1: THE CARGO BAY SUBMENU */}
        {currentView === 'cargo-bay' && (
          <div className="p-3 overflow-y-auto text-xs text-slate-300 flex-1">
            <ContentPackSection onNotify={onNotify} />
          </div>
        )}

        {/* VIEW 2: THE DIRECTOR'S CHAIR SUBMENU */}
        {currentView === 'directors-chair' && (
          <div className="p-4 space-y-3 overflow-y-auto text-xs text-slate-300 flex-1">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block text-xs">
                Asset &amp; Generator Overrides
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fine-tune synthesis pools. Disable default built-in vectors, backgrounds, or stock words to generate albums exclusively from your installed expansion packs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-200 text-xs">Core Word Pools</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  Disable default vocabulary to draw names exclusively from installed word packs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('disableDefaultWords')}
                className={`py-1.5 px-2.5 rounded-lg font-mono font-bold text-[10px] shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  prefs.disableDefaultWords
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/60 shadow-sm'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{prefs.disableDefaultWords ? 'DISABLED' : 'ENABLED'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <Shapes className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-200 text-xs">Core Subjects (3D Shapes)</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  Disable procedural vector drawings to pull exclusively from installed subject cutout packs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('disableDefaultSubjects')}
                className={`py-1.5 px-2.5 rounded-lg font-mono font-bold text-[10px] shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  prefs.disableDefaultSubjects
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/60 shadow-sm'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{prefs.disableDefaultSubjects ? 'DISABLED' : 'ENABLED'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-bold text-slate-200 text-xs">Core Backdrops &amp; Scenes</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  Disable default canvas scenes to use only installed background texture packs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('disableDefaultBackgrounds')}
                className={`py-1.5 px-2.5 rounded-lg font-mono font-bold text-[10px] shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  prefs.disableDefaultBackgrounds
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/60 shadow-sm'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{prefs.disableDefaultBackgrounds ? 'DISABLED' : 'ENABLED'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="font-bold text-slate-200 text-xs">Emoji Modifier Stamps</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  Exclude emoji modifier stamps and sticker layers from generated sleeve artwork.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('disableEmojis')}
                className={`py-1.5 px-2.5 rounded-lg font-mono font-bold text-[10px] shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  prefs.disableEmojis
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/60 shadow-sm'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{prefs.disableEmojis ? 'DISABLED' : 'ENABLED'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: MAIN SETTINGS MENU */}
        {currentView === 'main' && (
          <div className="p-3.5 space-y-2.5 overflow-y-auto text-xs pr-2 flex-1">
            {/* Submenu Navigation Hub */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('cargo-bay')}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/40 hover:border-amber-400 flex items-center justify-between transition-all group shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <Package className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="font-bold text-xs text-slate-100 block leading-tight truncate">
                      The Cargo Bay
                    </span>
                    <span className="text-[9.5px] text-slate-400 leading-tight block truncate mt-0.5">
                      Manage packs
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('directors-chair')}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between transition-all group shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="font-bold text-xs text-slate-100 block leading-tight truncate">
                      Director&apos;s Chair
                    </span>
                    <span className="text-[9.5px] text-slate-400 leading-tight block truncate mt-0.5">
                      Pool overrides
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300 transition-colors shrink-0" />
              </button>
            </div>

            {/* Interface Color Mode Selector */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200">Interface Color Mode</span>
                </div>
                <span className="text-[9px] font-mono uppercase text-amber-400/90">
                  {prefs.colorMode || 'default'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_MODE_OPTIONS.map((mode) => {
                  const isActive = (prefs.colorMode || 'default') === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleSelectColorMode(mode.id)}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400 text-slate-100 shadow-sm'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/30 shadow-inner"
                        style={{ backgroundColor: mode.swatch }}
                      />
                      <span className="font-mono font-bold text-[10px] leading-none">
                        {mode.label}
                      </span>
                      <span className="text-[8px] text-slate-400 leading-none truncate max-w-full">
                        {mode.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Combined App & Content Pack Updates (Strictly Optional / Online-Only) */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                  <span className="font-bold text-slate-200">App &amp; Content Updates</span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                    isOnline
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Y.D.R.B.N. never requires internet access to run. Enable this option if you want the deck to check for new app versions and Cargo Bay packs when online.
              </p>
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-950/90 transition-colors">
                <span className="text-[11px] text-slate-300">
                  Check for app &amp; pack updates when online
                </span>
                <input
                  type="checkbox"
                  checked={autoCheckUpdates}
                  onChange={(e) => handleToggleAutoCheck(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>

              {isAppUpdateAvailable ? (
                <button
                  type="button"
                  onClick={() => performAppCacheRefresh()}
                  className="w-full py-1.5 px-3 rounded-lg font-mono font-bold text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Apply Ready App Update &amp; Reload</span>
                </button>
              ) : (
                onManualCheckUpdates && (
                  <button
                    type="button"
                    disabled={!isOnline || isCheckingUpdates}
                    onClick={() => onManualCheckUpdates()}
                    className="w-full py-1.5 px-3 rounded-lg font-mono font-semibold text-[11px] bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {!isOnline ? (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Offline — Internet Required to Check</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                        <span>{isCheckingUpdates ? 'Checking...' : 'Check for Updates Now'}</span>
                      </>
                    )}
                  </button>
                )
              )}
            </div>

            {/* Streamlined Single-Row Offline Installation Card */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-bold text-slate-200 block text-xs">Offline App Mount</span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {isStandalone
                    ? 'Mounted in standalone offline mode'
                    : 'Install to your home screen or desktop'}
                </span>
              </div>
              {isStandalone ? (
                <span className="px-2 py-1 rounded-md bg-emerald-950/50 border border-emerald-600/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>MOUNTED</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal?.();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10.5px] flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>

            {/* Archival Dispatch / Feedback */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-bold text-slate-200 text-xs">Archival Dispatch</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  Anonymous word, cutout &amp; bug submissions
                </span>
              </div>
              {onOpenDispatch && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDispatch();
                  }}
                  className="px-2.5 py-1.5 rounded-lg font-bold text-[10.5px] font-mono bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Open</span>
                </button>
              )}
            </div>

            {/* Consolidated Two-Tier Maintenance, Cache & Reset Section */}
            <div
              ref={maintenanceRef}
              className="rounded-xl bg-slate-900/90 border border-amber-800/40 overflow-hidden transition-all"
            >
              <div
                onClick={() => setIsMaintenanceCollapsed(!isMaintenanceCollapsed)}
                className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 select-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isMaintenanceCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400/70" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-xs">Maintenance, Cache &amp; Reset</span>
                  </div>
                </div>
              </div>

              {!isMaintenanceCollapsed && (
                <div className="p-2.5 pt-1.5 space-y-2.5 border-t border-slate-800 bg-black/25 animate-in fade-in duration-150">
                  {/* Tier 1: Safe App Cache Refresh */}
                  <div className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-700/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10.5px] text-amber-300 uppercase">
                        1. Refresh App Cache (Safe)
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
                        Keeps Crate &amp; Packs
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Reloads fresh app code and resets offline worker caches while keeping all saved records, favorites, and Cargo Bay packs intact.
                    </p>
                    <button
                      type="button"
                      onClick={() => performAppCacheRefresh()}
                      className="w-full py-1.5 px-3 rounded-lg text-[11px] font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh App Cache &amp; Reload</span>
                    </button>
                  </div>

                  {/* Tier 2: Destructive Factory Wipe */}
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono font-bold text-[10.5px] uppercase">
                        2. Factory Wipe (Erase All Data)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Deletes all saved records, favorites, downloaded packs, preferences, and offline caches.
                    </p>
                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="w-full py-1.5 px-3 rounded-lg text-[11px] font-mono font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 transition-all active:scale-95 cursor-pointer"
                      >
                        Factory Wipe App Data
                      </button>
                    ) : (
                      <div className="space-y-1.5 bg-black/40 p-2 rounded-lg border border-rose-900/60">
                        <span className="text-[10.5px] text-rose-200 font-semibold block text-center">
                          Erase crate, favorites &amp; packs? Cannot be undone.
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="flex-1 py-1 px-2 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => performFactoryReset()}
                            className="flex-1 py-1 px-2 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                          >
                            Confirm Wipe
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Developer Controls Block */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all">
              <div
                onClick={() => setIsDevCollapsed(!isDevCollapsed)}
                className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 select-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isDevCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-slate-200 text-xs">Developer Controls</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {isDevMode ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>

              {!isDevCollapsed && (
                <div className="p-2.5 pt-1 space-y-2 border-t border-slate-800/60 bg-black/20">
                  <p className="text-[10px] text-slate-400">
                    Lock and unlock bypass controls here.
                  </p>

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
                          R{rowIdx + 1}
                        </span>
                        {[0, 1, 2, 3].map((colIdx) => (
                          <button
                            key={colIdx}
                            type="button"
                            onClick={() => handleRadioClick(rowIdx, colIdx)}
                            className={`h-5 rounded border text-[9px] font-mono transition-all cursor-pointer ${
                              matrix[rowIdx] === colIdx
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                : 'bg-slate-900 border-slate-700 text-slate-600 hover:border-slate-500'
                            }`}
                          >
                            {colIdx}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  {sliderRevealed && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-300 block text-xs">
                          Dev Mode (Unlimited Drops)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Bypasses 24-hour drop countdown.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDecoySliderClick}
                        className="relative w-12 h-6 rounded-full transition-colors p-1 bg-slate-700 hover:bg-slate-600 cursor-pointer"
                        aria-label="Toggle developer mode"
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>
                  )}

                  {isDevMode && onOpenTechnician && (
                    <div className="pt-2 border-t border-amber-900/40">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenTechnician();
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open Technician Service Deck</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0c101d] flex items-center justify-between shrink-0">
          {currentView !== 'main' ? (
            <button
              type="button"
              onClick={() => setCurrentView('main')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-slate-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
