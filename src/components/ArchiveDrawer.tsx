import React, { useState } from 'react';
import { AlbumEntry } from '../types';
import { X, Heart, Trash2, Disc, Search, Radio, Globe } from 'lucide-react';
import { LOCALE_REGISTRY, SUPPORTED_LOCALES, SupportedLocale, resolveActiveLocale } from '../services/i18nService';
import { translateUiString } from '../services/i18nDomTranslator';
import { resolveConditionGrade } from '../services/proceduralGenerator';
import { MAX_ARCHIVE_LIMIT } from '../services/storageService';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  albums: AlbumEntry[];
  currentId?: string;
  onSelectAlbum: (album: AlbumEntry) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteAlbum: (id: string) => void;
  isCollegeRadioActive?: boolean;
  onToggleCollegeRadio?: () => void;
  onTranslateAlbum?: (album: AlbumEntry, targetLocale: SupportedLocale) => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  albums,
  currentId,
  onSelectAlbum,
  onToggleFavorite,
  onDeleteAlbum,
  isCollegeRadioActive = false,
  onToggleCollegeRadio,
  onTranslateAlbum,
}) => {
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [translatingAlbum, setTranslatingAlbum] = useState<AlbumEntry | null>(null);

  if (!isOpen) return null;

  const filteredAlbums = albums.filter((album) => {
    if (filterFavorites && !album.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBand = album.bandName.toLowerCase().includes(q);
      const matchTitle = album.albumTitle.toLowerCase().includes(q);
      const matchCatalog = album.catalogNumber.toLowerCase().includes(q);
      return matchBand || matchTitle || matchCatalog;
    }
    return true;
  });

  const favoritesCount = albums.filter((a) => a.isFavorite).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-sm h-full bg-[#101422] border-s border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d]">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-orange-400" />
            <div>
              <h3 className="font-extrabold text-sm tracking-wide text-white">
                Vinyl Crate Archive
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Crate Slots:{' '}
                <span className={albums.length >= MAX_ARCHIVE_LIMIT ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                  {albums.length} / {MAX_ARCHIVE_LIMIT}
                </span>
                {albums.length >= MAX_ARCHIVE_LIMIT ? ' (Full)' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleCollegeRadio && albums.length > 0 && (
              <button
                type="button"
                onClick={onToggleCollegeRadio}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                  isCollegeRadioActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                    : 'bg-slate-800/80 text-amber-300 border-amber-500/30 hover:bg-slate-700'
                }`}
                title="Hands-free sequential playback of your crate"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isCollegeRadioActive ? 'Radio ON' : 'Auto-Spin'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close archive"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {albums.length >= MAX_ARCHIVE_LIMIT && (
          <div className="px-3 py-1.5 bg-amber-950/35 border-b border-amber-800/40 text-[10px] font-mono text-amber-200/90 leading-tight">
            {favoritesCount >= MAX_ARCHIVE_LIMIT
              ? 'Crate full (all 14 hearted) — oldest pressing rotates out on next drop.'
              : 'Crate full (14/14) — oldest un-hearted record rotates out on next drop.'}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search band, title, catalog..."
              className="w-full ps-8 pe-7 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterFavorites(false)}
              className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all border ${
                !filterFavorites
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {`All Records (${albums.length})`}
            </button>
            <button
              onClick={() => setFilterFavorites(true)}
              className={`flex-1 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all border ${
                filterFavorites
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              {`Favorites (${favoritesCount})`}
            </button>
          </div>
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/40">
          {filteredAlbums.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs p-4">
              <Disc className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
              <p>No records found in this crate.</p>
              {filterFavorites && (
                <button
                  onClick={() => setFilterFavorites(false)}
                  className="mt-2 text-orange-400 hover:underline text-[11px]"
                >
                  View all records
                </button>
              )}
            </div>
          ) : (
            filteredAlbums.map((album) => {
              const isSelected = album.id === currentId;
              const cond = album.conditionGrade || resolveConditionGrade(album.id).grade;
              const shortGrade = cond.split('(')[0].trim();
              const isWarped =
                typeof album.isWarpedAudio === 'boolean'
                  ? album.isWarpedAudio
                  : resolveConditionGrade(album.id).isWarped;

              return (
                <div
                  key={album.id}
                  className={`pt-2 first:pt-0 flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-orange-500/10 border border-orange-500/30'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      onSelectAlbum(album);
                      onClose();
                    }}
                    className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-800 shrink-0 cursor-pointer shadow-md group"
                  >
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.albumTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <Disc className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-orange-500 rounded-md pointer-events-none" />
                    )}
                  </div>

                  {/* Album Info */}
                  <div
                    onClick={() => {
                      onSelectAlbum(album);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-slate-100 truncate hover:text-orange-400">
                      {album.bandName}
                    </h4>
                    <p className="text-[11px] text-amber-200/80 italic truncate">
                      {album.albumTitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-mono mt-0.5">
                      <span>{album.year}</span>
                      <span>&bull;</span>
                      <span
                        className={`px-1 rounded border text-[8.5px] ${
                          isWarped
                            ? 'text-rose-300 border-rose-500/40 bg-rose-950/40'
                            : 'text-amber-300/90 border-slate-700 bg-slate-900'
                        }`}
                        title={cond}
                      >
                        {shortGrade}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!album.isCustomPressing && onTranslateAlbum && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTranslatingAlbum((prev) => (prev?.id === album.id ? null : album));
                        }}
                        className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tracking-tight transition-all active:scale-90 cursor-pointer ${
                          translatingAlbum?.id === album.id
                            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                            : 'bg-emerald-950/35 hover:bg-emerald-900/50 text-emerald-400 border-emerald-500/40 hover:border-emerald-400/70'
                        }`}
                        title="Copy & Translate pressing"
                        aria-label="Copy and Translate record"
                      >
                        あ/A
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(album.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-all active:scale-90"
                      title={album.isFavorite ? 'Remove favorite' : 'Add favorite'}
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          album.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>

                    {albums.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              translateUiString(translateUiString(`Discard "${album.bandName}" from your archive?`, resolveActiveLocale()), resolveActiveLocale())
                            )
                          ) {
                            onDeleteAlbum(album.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-all active:scale-90"
                        title="Delete from archive"
                        aria-label="Delete album"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Deck-Matched 15-Locale "Copy & Translate" Selector Overlay */}
        {translatingAlbum && onTranslateAlbum && (
          <div
            onClick={() => setTranslatingAlbum(null)}
            className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[290px] rounded-xl bg-[#111625] border border-amber-500/50 shadow-2xl p-2.5 space-y-2"
            >
              <div className="px-1.5 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Copy &amp; Translate</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTranslatingAlbum(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close translate menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300 truncate">
                <span className="text-amber-300 font-bold">{translatingAlbum.bandName}</span>
                <span className="text-slate-500"> — </span>
                <span className="italic text-slate-400">&ldquo;{translatingAlbum.albumTitle}&rdquo;</span>
              </div>

              <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto pr-0.5">
                {SUPPORTED_LOCALES.map((code: SupportedLocale) => {
                  const pack = LOCALE_REGISTRY[code];
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        onTranslateAlbum(translatingAlbum, code);
                        setTranslatingAlbum(null);
                      }}
                      className="px-2 py-1.5 rounded-lg text-left text-[10px] font-mono flex items-center justify-between transition-colors cursor-pointer border bg-slate-950/60 text-slate-300 border-slate-800/80 hover:bg-emerald-950/50 hover:border-emerald-500/50 hover:text-white active:scale-95"
                    >
                      <span className="truncate">
                        <strong className="text-amber-400 mr-1">{pack.shortBadge}</strong>
                        {pack.nativeName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};