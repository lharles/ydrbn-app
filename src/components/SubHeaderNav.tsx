import React from 'react';
import { ChevronLeft, ChevronRight, Disc3 } from 'lucide-react';
import { AlbumEntry } from '../types';
import { resolveActiveLocale, SupportedLocale, toPigLatinText } from '../services/i18nService';

interface SubHeaderNavProps {
  entries: AlbumEntry[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const LOCALE_BCP47: Record<SupportedLocale, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  id: 'id-ID',
  ja: 'ja-JP',
  zh: 'zh-CN',
  hi: 'hi-IN',
  bn: 'bn-BD',
  ur: 'ur-PK',
  ar: 'ar-SA',
  ru: 'ru-RU',
  tlh: 'en-US',
  pig: 'en-US',
};

function formatPressingYearLabel(year: string, lang: SupportedLocale): string {
  switch (lang) {
    case 'es':
      return `Edición ${year}`;
    case 'pt':
      return `Prensagem ${year}`;
    case 'fr':
      return `Pressage ${year}`;
    case 'de':
      return `Pressung ${year}`;
    case 'id':
      return `Cetakan ${year}`;
    case 'ja':
      return `${year}年プレス`;
    case 'zh':
      return `${year}年压制`;
    case 'hi':
      return `${year} प्रेसिंग`;
    case 'bn':
      return `${year} প্রেস`;
    case 'ur':
      return `${year} پریسنگ`;
    case 'ar':
      return `طبعة ${year}`;
    case 'ru':
      return `Выпуск ${year}`;
    case 'tlh':
      return `DIS ${year} QoQ`;
    case 'pig':
      return `${year} Essingpray`;
    default:
      return `${year} Pressing`;
  }
}

export const SubHeaderNav: React.FC<SubHeaderNavProps> = ({
  entries,
  currentIndex,
  onPrev,
  onNext,
}) => {
  const current = entries[currentIndex];
  const activeLang = resolveActiveLocale();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Today's Selection";
    const d = new Date(timestamp);
    const formatted = d.toLocaleDateString(LOCALE_BCP47[activeLang] || undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (activeLang === 'pig') return toPigLatinText(formatted);
    return formatted;
  };

  return (
    <nav className="w-full flex items-center justify-between px-3 py-1 bg-slate-900/60 border-b border-slate-800/60 select-none">
      <button
        onClick={onPrev}
        disabled={entries.length <= 1 || currentIndex <= 0}
        aria-label="Previous record"
        className="p-1 rounded-md text-slate-400 hover:text-orange-400 disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90 cursor-pointer"
        title="Previous Album"
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2">
        {current ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium truncate max-w-full">
            <Disc3 className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate text-amber-200/90 font-mono tracking-tight text-[11px]">
              {formatDate(current.timestamp)} • {formatPressingYearLabel(current.year, activeLang)}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono tracking-tight">
            Ready for your daily drop
          </div>
        )}

        {entries.length > 1 && (
          <div className="flex items-center gap-1 mt-0.5 max-w-[120px] overflow-hidden justify-center">
            {entries.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((_, idx) => {
              const actualIdx = Math.max(0, currentIndex - 3) + idx;
              const isActive = actualIdx === currentIndex;
              return (
                <div
                  key={actualIdx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isActive ? 'w-3.5 bg-orange-400' : 'w-1 bg-slate-600/70'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={entries.length <= 1 || currentIndex >= entries.length - 1}
        aria-label="Next record"
        className="p-1 rounded-md text-slate-400 hover:text-orange-400 disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90 cursor-pointer"
        title="Next Album"
      >
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </nav>
  );
};
