import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Download, Check, Image as ImageIcon, FileText, Disc } from 'lucide-react';
import { AlbumEntry } from '../types';
import { compositeFrontSleeve, compositeBackSleeve } from '../services/shareImageService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: AlbumEntry | null;
  onNotify: (type: 'success' | 'info' | 'error', text: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, album, onNotify }) => {
  const [includeFront, setIncludeFront] = useState(true);
  const [includeBack, setIncludeBack] = useState(true);
  const [includeInfo, setIncludeInfo] = useState(true);
  const [includeTracks, setIncludeTracks] = useState(true);
  const [includeBio, setIncludeBio] = useState(true);
  const [includeReviews, setIncludeReviews] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cached pre-rendered blobs to guarantee instant navigator.share() gesture execution
  const [cachedFrontBlob, setCachedFrontBlob] = useState<Blob | null>(null);
  const [cachedBackBlob, setCachedBackBlob] = useState<Blob | null>(null);

  // Pre-composite artwork in the background when the modal opens
  useEffect(() => {
    if (!isOpen || !album) {
      setCachedFrontBlob(null);
      setCachedBackBlob(null);
      return;
    }

    let isMounted = true;
    const prepareBlobs = async () => {
      try {
        const [front, back] = await Promise.all([
          compositeFrontSleeve(album).catch(() => null),
          compositeBackSleeve(album).catch(() => null),
        ]);
        if (isMounted) {
          setCachedFrontBlob(front);
          setCachedBackBlob(back);
        }
      } catch (err) {
        console.warn('[ShareModal] Pre-compositing error:', err);
      }
    };

    prepareBlobs();
    return () => {
      isMounted = false;
    };
  }, [isOpen, album]);

  if (!isOpen || !album) return null;

  const getSafeFileSlug = (suffix: string): string => {
    const cleanBand = (album.bandName || 'album').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `${cleanBand}_${suffix}.jpg`;
  };

  const compileShareText = (): string => {
    const parts: string[] = [];

    if (includeInfo) {
      parts.push(`📀 ${album.bandName.toUpperCase()} — "${album.albumTitle}" (${album.year})`);
      parts.push(`Catalog: ${album.catalogNumber}`);
    }

    if (includeTracks && album.tracks && album.tracks.length > 0) {
      parts.push('\nTracklist:');
      album.tracks.forEach((t, i) => parts.push(`${i + 1}. ${t}`));
    }

    if (includeBio && album.bandBio) {
      parts.push(`\nArchival Notes:\n${album.bandBio}`);
    }

    if (includeReviews && album.fauxReviews && album.fauxReviews.length > 0) {
      parts.push('\nPress Quotes:');
      album.fauxReviews.forEach((r) => parts.push(r));
    }

    parts.push('\nSynthesized offline via Y.D.R.B.N.');
    return parts.join('\n');
  };

  const handleCopyText = async () => {
    const text = compileShareText();
    if (!text.trim()) {
      onNotify('info', 'Enable at least one text option to copy.');
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onNotify('success', 'Album details copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImages = async () => {
    if (!includeFront && !includeBack) {
      onNotify('info', 'Select at least one cover image to download.');
      return;
    }

    setProcessing(true);
    try {
      if (includeFront) {
        const frontBlob = cachedFrontBlob || (await compositeFrontSleeve(album));
        triggerDownload(frontBlob, getSafeFileSlug('front'));
      }
      if (includeBack) {
        const backBlob = cachedBackBlob || (await compositeBackSleeve(album));
        triggerDownload(backBlob, getSafeFileSlug('back'));
      }
      onNotify('success', 'Sleeve graphics saved.');
    } catch (err: any) {
      onNotify('error', `Download error: ${err?.message || err}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleNativeShare = async () => {
    setProcessing(true);
    try {
      const text = compileShareText();
      const files: File[] = [];

      // Use pre-composited blobs immediately to preserve user activation
      if (includeFront) {
        const frontBlob = cachedFrontBlob || (await compositeFrontSleeve(album));
        files.push(new File([frontBlob], getSafeFileSlug('front'), { type: 'image/jpeg' }));
      }
      if (includeBack) {
        const backBlob = cachedBackBlob || (await compositeBackSleeve(album));
        files.push(new File([backBlob], getSafeFileSlug('back'), { type: 'image/jpeg' }));
      }

      if (navigator.share) {
        const shareData: ShareData = {};
        if (text) shareData.text = text;
        shareData.title = `${album.bandName} - ${album.albumTitle}`;

        if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
          shareData.files = files;
        }

        await navigator.share(shareData);
        onNotify('success', 'Pressing shared successfully.');
        onClose();
      } else {
        if (text) await navigator.clipboard.writeText(text);
        if (files.length > 0) await handleDownloadImages();
        onNotify('info', 'Text copied and images saved (system share unavailable).');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onNotify('error', `Share failed: ${err?.message || err}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs sm:text-sm tracking-wide text-white uppercase font-mono">
              Export & Share Pressing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Body */}
        <div className="p-3.5 space-y-3.5 overflow-y-auto text-xs pr-2">
          {/* Target Pressing Header */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <Disc className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-white block truncate text-xs">{album.bandName}</span>
              <span className="text-[11px] text-slate-400 truncate block">
                "{album.albumTitle}" ({album.year})
              </span>
            </div>
          </div>

          {/* Artwork Toggles */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              Sleeve Artwork
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  includeFront
                    ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeFront}
                  onChange={(e) => setIncludeFront(e.target.checked)}
                  className="rounded accent-sky-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Front Cover</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  includeBack
                    ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeBack}
                  onChange={(e) => setIncludeBack(e.target.checked)}
                  className="rounded accent-sky-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Back Liner</span>
              </label>
            </div>
          </div>

          {/* Text & Metadata Toggles */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Text & Metadata
            </span>
            <div className="space-y-1">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 cursor-pointer">
                <span className="text-[11px] text-slate-300">Band, Title & Catalog ID</span>
                <input
                  type="checkbox"
                  checked={includeInfo}
                  onChange={(e) => setIncludeInfo(e.target.checked)}
                  className="rounded accent-amber-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 cursor-pointer">
                <span className="text-[11px] text-slate-300">Numbered Tracklist (1-8)</span>
                <input
                  type="checkbox"
                  checked={includeTracks}
                  onChange={(e) => setIncludeTracks(e.target.checked)}
                  className="rounded accent-amber-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 cursor-pointer">
                <span className="text-[11px] text-slate-300">Archival Recording Notes (Bio)</span>
                <input
                  type="checkbox"
                  checked={includeBio}
                  onChange={(e) => setIncludeBio(e.target.checked)}
                  className="rounded accent-amber-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 cursor-pointer">
                <span className="text-[11px] text-slate-300">Satirical Critic Quotes</span>
                <input
                  type="checkbox"
                  checked={includeReviews}
                  onChange={(e) => setIncludeReviews(e.target.checked)}
                  className="rounded accent-amber-500 w-3.5 h-3.5"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3 border-t border-slate-800 bg-[#0c101d] space-y-2">
          <button
            onClick={handleNativeShare}
            disabled={processing}
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{processing ? 'Compositing...' : 'Share Selected Payload'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              disabled={processing}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownloadImages}
              disabled={processing || (!includeFront && !includeBack)}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Save Images</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};