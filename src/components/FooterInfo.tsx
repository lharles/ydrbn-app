import React, { useState, useRef, useEffect } from 'react';
import { Settings, ShieldAlert, HelpCircle, Globe, Check } from 'lucide-react';
import {
  LOCALE_REGISTRY,
  SUPPORTED_LOCALES,
  LocalePreference,
  SupportedLocale,
  detectDeviceLocale,
  getActiveLocalePack,
  BRAND_EXPANSIONS,
} from '../services/i18nService';

interface FooterInfoProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  hasSeenHelp: boolean;
  isDevMode: boolean;
  languagePref?: LocalePreference;
  onChangeLanguage?: (pref: LocalePreference) => void;
}

export const FooterInfo: React.FC<FooterInfoProps> = ({
  onOpenSettings,
  onOpenHelp,
  hasSeenHelp,
  isDevMode,
  languagePref = 'auto',
  onChangeLanguage,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activePack = getActiveLocalePack(languagePref);
  const detectedCode = detectDeviceLocale();

  useEffect(() => {
    if (!isLangMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangMenuOpen]);

  const handleSelect = (pref: LocalePreference) => {
    onChangeLanguage?.(pref);
    setIsLangMenuOpen(false);
  };

  return (
    <footer className="relative w-full px-3 py-1.5 flex items-center justify-between border-t border-slate-800/80 bg-[#0c101d]/90 text-[10px] text-slate-400 select-none">
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-200 tracking-tight truncate">
            Y.D.R.B.N. &mdash; {BRAND_EXPANSIONS[activePack.code]}
          </span>
          {isDevMode && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 inline-flex items-center gap-0.5 shrink-0">
              <ShieldAlert className="w-2.5 h-2.5" />
              DEV
            </span>
          )}
        </div>
        <span className="text-slate-500 truncate">{activePack.ui.subtitle}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0" ref={menuRef}>
        {/* 1. Clickable Language Selector Pill (Left of Help ?) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangMenuOpen((prev) => !prev)}
            aria-label="Select Language"
            title={`${activePack.ui.languageLabel}: ${activePack.nativeName}`}
            className={`h-7 px-2 rounded-lg border font-mono font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer ${
              isLangMenuOpen
                ? 'bg-amber-500/25 text-amber-200 border-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-slate-700/80 hover:border-amber-500/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{activePack.shortBadge}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute bottom-9 right-0 rtl:right-auto rtl:left-0 z-50 w-64 sm:w-72 rounded-xl bg-[#111625] border border-amber-500/50 shadow-2xl p-2 space-y-1.5 animate-in fade-in duration-150">
              <div className="px-1.5 pb-1 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 flex items-center justify-between">
                <span>{activePack.ui.languageLabel}</span>
                <span className="text-slate-500">15 LOCALES</span>
              </div>

              <button
                type="button"
                onClick={() => handleSelect('auto')}
                className={`w-full px-2 py-1 rounded-lg text-left text-[10px] font-mono flex items-center justify-between transition-colors cursor-pointer border ${
                  languagePref === 'auto'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 font-bold'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate">
                  {activePack.ui.autoDevice} ({detectedCode.toUpperCase()})
                </span>
                {languagePref === 'auto' && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
              </button>

              <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto pr-0.5">
                {SUPPORTED_LOCALES.map((code: SupportedLocale) => {
                  const pack = LOCALE_REGISTRY[code];
                  const isSelected = languagePref === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSelect(code)}
                      className={`px-2 py-1 rounded-lg text-left text-[10px] font-mono flex items-center justify-between transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 font-bold'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">
                        <strong className="text-amber-400 mr-1">{pack.shortBadge}</strong>
                        {pack.nativeName}
                      </span>
                      {isSelected && <Check className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Help & Data Sheet Button (Circle ?) */}
        <button
          type="button"
          onClick={onOpenHelp}
          aria-label="Field Guide and Data Sheet"
          title="Field Guide & Data Sheet"
          className={`p-1.5 rounded-lg border transition-all active:scale-95 shadow-sm relative cursor-pointer ${
            !hasSeenHelp
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 animate-pulse hover:bg-amber-500/30'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 border-slate-700/80'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          {!hasSeenHelp && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        {/* 3. Settings Button (Gear) */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings and Developer Mode"
          title="Settings & Dev Mode"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 border border-slate-700/80 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
