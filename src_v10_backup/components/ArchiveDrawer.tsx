import React, { useState } from 'react';
import { AlbumEntry } from '../types';
import { X, Heart, Trash2, Disc, Search, Music, Sparkles } from 'lucide-react';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  albums: AlbumEntry[];
  currentId?: string;
  onSelectAlbum: (album: AlbumEntry) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteAlbum: (id: string) => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  albums,
  currentId,
  onSelectAlbum,
  onToggleFavorite,
  onDeleteAlbum,
}) => {
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="w-full max-w-sm h-full bg-[#101422] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d]">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-orange-400" />
            <div>
              <h3 className="font-extrabold text-sm tracking-wide text-white">
                Vinyl Crate Archive
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {albums.length} Pressings Preserved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close archive"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 space-y-2">
          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search band, title, catalog..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterFavorites(false)}
              className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all border ${
                !filterFavorites
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              All Records ({albums.length})
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
              Favorites ({favoritesCount})
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
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{album.year}</span>
                      <span>&bull;</span>
                      <span className="truncate">{album.catalogNumber}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
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
                              `Discard "${album.bandName}" from your archive?`
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
      </div>
    </div>
  );
};
