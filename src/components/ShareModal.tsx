import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Copy, Download, Check, Image as ImageIcon, FileText, Disc, Dna } from 'lucide-react';
import { AlbumEntry } from '../types';
import { compositeFrontSleeve, compositeBackSleeve } from '../services/shareImageService';
import { encodePressingDna } from '../services/proceduralGenerator';

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

  const [isPreparing, setIsPreparing] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDna, setCopiedDna] = useState(false);

  const [cachedFrontBlob, setCachedFrontBlob] = useState<Blob | null>(null);
  const [cachedBackBlob, setCachedBackBlob] = useState<Blob | null>(null);

  const isSharingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !album) {
      setCachedFrontBlob(null);
      setCachedBackBlob(null);
      setIsPreparing(false);
      isSharingRef.current = false;
      return;
    }

    setIsPreparing(true);
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
          setIsPreparing(false);
        }
      } catch {
        if (isMounted) {
          setIsPreparing(false);
        }
      }
    };

    prepareBlobs();

    return () => {
      isMounted = false;
      isSharingRef.current = false;
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
      if (album.conditionGrade) {
        parts.push(`Condition: ${album.conditionGrade}`);
      }
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

  const handleCopyDna = async () => {
    try {
      const dna = encodePressingDna(album);
      await navigator.clipboard.writeText(dna);
      setCopiedDna(true);
      onNotify('success', 'Pressing DNA code copied! Paste in Custom Drop Studio to clone.');
      setTimeout(() => setCopiedDna(false), 2500);
    } catch (err: any) {
      onNotify('error', `DNA encode error: ${err?.message || err}`);
    }
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
    if (isSharingRef.current || processing || isPreparing) return;
    isSharingRef.current = true;
    setProcessing(true);

    try {
      const text = compileShareText();
      const files: File[] = [];

      if (includeFront) {
        const frontBlob = cachedFrontBlob || (await compositeFrontSleeve(album));
        if (frontBlob) {
          files.push(new File([frontBlob], getSafeFileSlug('front'), { type: 'image/jpeg' }));
        }
      }
      if (includeBack) {
        const backBlob = cachedBackBlob || (await compositeBackSleeve(album));
        if (backBlob) {
          files.push(new File([backBlob], getSafeFileSlug('back'), { type: 'image/jpeg' }));
        }
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
        onClose();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onNotify('error', `Share failed: ${err?.message || err}`);
      }
    } finally {
      isSharingRef.current = false;
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
              Export &amp; Share Pressing
            </h3>
          </div>
          <button
            type="button"
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
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white block truncate text-xs">{album.bandName}</span>
              <span className="text-[11px] text-slate-400 truncate block">
                &ldquo;{album.albumTitle}&rdquo; ({album.year})
              </span>
            </div>
          </div>

          {/* Pressing DNA Offline Share Code */}
          <div className="p-2.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold flex items-center gap-1">
                <Dna className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Pressing DNA Code</span>
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Share exact recipe, tracks &amp; lore offline
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyDna}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-mono font-bold text-[10px] flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              {copiedDna ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied DNA</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-cyan-300" />
                  <span>Copy DNA</span>
                </>
              )}
            </button>
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
              Text &amp; Metadata
            </span>
            <div className="space-y-1">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 cursor-pointer">
                <span className="text-[11px] text-slate-300">Band, Title, Catalog &amp; Condition</span>
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
            type="button"
            onClick={handleNativeShare}
            disabled={
              isPreparing ||
              processing ||
              (!includeFront && !includeBack && !includeInfo && !includeTracks && !includeBio && !includeReviews)
            }
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPreparing ? (
              <>
                <Disc className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                <span>Preparing Artwork...</span>
              </>
            ) : processing ? (
              <>
                <Share2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Launching Share...</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Selected Payload</span>
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              disabled={processing}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImages}
              disabled={isPreparing || processing || (!includeFront && !includeBack)}
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