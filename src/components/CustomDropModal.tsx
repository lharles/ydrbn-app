import React, { useState, useMemo } from 'react';
import { Disc, Sparkles, Upload, Music, RefreshCw, Dna, Check, Layers } from 'lucide-react';
import { CustomDropInput, AlbumEntry } from '../types';
import {
  analyzeCustomDropWords,
  HarvestWordCategory,
  decodePressingDna,
} from '../services/proceduralGenerator';

interface CustomDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForge: (input: CustomDropInput) => Promise<void>;
  isLoading: boolean;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

const CATEGORY_ORDER: HarvestWordCategory[] = ['noun', 'adjective', 'ensemble', 'skip'];

export const CustomDropModal: React.FC<CustomDropModalProps> = ({
  isOpen,
  onClose,
  onForge,
  isLoading,
  onNotify,
}) => {
  const [bandName, setBandName] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [year, setYear] = useState('');
  const [tracksRaw, setTracksRaw] = useState('');
  const [lore, setLore] = useState('');
  const [review, setReview] = useState('');
  const [audioPreset, setAudioPreset] = useState<AlbumEntry['audioPreset']>('analog-synth');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  // Rotation Harvester State
  const [harvestToRotation, setHarvestToRotation] = useState(false);
  const [allowBandRecurrence, setAllowBandRecurrence] = useState(false);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, HarvestWordCategory>>({});
  const [harvestImageMode, setHarvestImageMode] = useState<'subject' | 'backdrop' | 'none'>('backdrop');
  const [detectedTransparency, setDetectedTransparency] = useState(false);

  // Pressing DNA Clone State
  const [dnaInput, setDnaInput] = useState('');
  const [dnaError, setDnaError] = useState<string | null>(null);

  // Live deduplication & POS classification against active app & expansion pack pools
  const analysis = useMemo(() => {
    if (!harvestToRotation) return { novelWords: [], skippedExistingCount: 0 };
    return analyzeCustomDropWords(bandName, albumTitle, tracksRaw);
  }, [bandName, albumTitle, tracksRaw, harvestToRotation]);

  if (!isOpen) return null;

  // Inspect uploaded image on a 32x32 offscreen canvas to detect transparent cutout alpha
  const detectImageAlpha = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 32).data;
      let hasTransparentPixels = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 240) {
          hasTransparentPixels = true;
          break;
        }
      }
      setDetectedTransparency(hasTransparentPixels);
      setHarvestImageMode(hasTransparentPixels ? 'subject' : 'backdrop');
    };
    img.src = dataUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        setCoverPhoto(res);
        detectImageAlpha(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCycleWordCategory = (word: string, defaultCat: HarvestWordCategory) => {
    const current = categoryOverrides[word] || defaultCat;
    const nextIdx = (CATEGORY_ORDER.indexOf(current) + 1) % CATEGORY_ORDER.length;
    setCategoryOverrides((prev) => ({
      ...prev,
      [word]: CATEGORY_ORDER[nextIdx],
    }));
  };

  const handleCloneDna = async () => {
    if (!dnaInput.trim()) return;
    setDnaError(null);
    try {
      const clonedAlbum = await decodePressingDna(dnaInput);
      await onForge({ dnaClonedAlbum: clonedAlbum });
      setDnaInput('');
      if (onNotify) {
        onNotify('success', `🧬 Cloned DNA Pressing: ${clonedAlbum.bandName} — "${clonedAlbum.albumTitle}"`);
      }
      onClose();
    } catch (err: any) {
      setDnaError(err?.message || 'Invalid Pressing DNA code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tracks = tracksRaw
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const harvestedWords = {
      nouns: [] as string[],
      adjectives: [] as string[],
      ensembles: [] as string[],
    };

    if (harvestToRotation) {
      for (const item of analysis.novelWords) {
        const finalCat = categoryOverrides[item.word] || item.category;
        if (finalCat === 'noun') harvestedWords.nouns.push(item.word);
        else if (finalCat === 'adjective') harvestedWords.adjectives.push(item.word);
        else if (finalCat === 'ensemble') harvestedWords.ensembles.push(item.word);
      }
    }

    await onForge({
      bandName: bandName || undefined,
      albumTitle: albumTitle || undefined,
      year: year || undefined,
      tracks: tracks.length > 0 ? tracks : undefined,
      lore: lore || undefined,
      review: review || undefined,
      coverImageBase64: coverPhoto || undefined,
      audioPreset,
      harvestToRotation,
      harvestedWords: harvestToRotation ? harvestedWords : undefined,
      harvestImageMode: harvestToRotation && coverPhoto ? harvestImageMode : 'none',
      allowBandNameRecurrence: harvestToRotation && allowBandRecurrence,
    });

    onClose();
  };

  const getBadgeStyle = (cat: HarvestWordCategory) => {
    switch (cat) {
      case 'noun':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'adjective':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'ensemble':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      case 'skip':
        return 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60';
    }
  };

  const getShortTag = (cat: HarvestWordCategory) => {
    if (cat === 'noun') return 'N';
    if (cat === 'adjective') return 'A';
    if (cat === 'ensemble') return 'E';
    return 'SKIP';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#12100e] border border-amber-800/40 rounded-2xl shadow-2xl flex flex-col max-h-[86dvh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/40 bg-[#0c0a09] shrink-0">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-amber-200">
              Custom Drop Studio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close custom drop"
            className="text-slate-400 hover:text-white p-1 text-sm font-mono leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs text-slate-300">
          {/* Pressing DNA Offline Importer Bar */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clone from Pressing DNA Code</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={dnaInput}
                onChange={(e) => setDnaInput(e.target.value)}
                placeholder="Paste YDRBN-DNA:... string here"
                className="flex-1 px-2.5 py-1 rounded-lg bg-black/70 border border-slate-700 text-[11px] text-cyan-200 placeholder-slate-600 focus:border-cyan-400 outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleCloneDna}
                disabled={!dnaInput.trim() || isLoading}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-[10px] uppercase tracking-wider shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                Clone
              </button>
            </div>
            {dnaError && <p className="text-[10px] text-rose-400 font-mono">{dnaError}</p>}
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-300/90 font-mono leading-relaxed">
            ✦ <strong>Custom Drop:</strong> Enter any fields you choose. Anything left blank will be generated automatically. Custom drops do not consume your 24h Daily Drop timer.
          </div>

          {/* Band Name */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Band / Artist Name
            </label>
            <input
              type="text"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="e.g., Unreasonable Elbow (or leave blank)"
              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono"
            />
          </div>

          {/* Album Title & Year */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Album Title
              </label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g., Plastic Spoons"
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Pressing Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 1978"
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Audio Preset */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Music className="w-3 h-3 text-amber-400" />
              <span>Audio Soundscape Flavor</span>
            </label>
            <select
              value={audioPreset}
              onChange={(e) => setAudioPreset(e.target.value as AlbumEntry['audioPreset'])}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono text-xs"
            >
              <option value="analog-synth">1980s Analog Synth & Arpeggio</option>
              <option value="psych-rock">1970s Psychedelic Rock & Phasers</option>
              <option value="krautrock">1970s Krautrock & Motorik Beat</option>
              <option value="post-punk">1980s Angular Post-Punk Riff</option>
              <option value="ambient-drone">Deep Atmospheric Tape Drone</option>
            </select>
          </div>

          {/* Custom Artwork */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Upload className="w-3 h-3 text-amber-400" />
              <span>Custom Photo Cover (Optional Image Upload)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-mono file:bg-amber-950/60 file:text-amber-300 hover:file:bg-amber-900 cursor-pointer"
            />
            {coverPhoto && (
              <div className="mt-1.5 flex items-center gap-2">
                <img
                  src={coverPhoto}
                  alt="Preview"
                  className="w-8 h-8 rounded border border-amber-600 object-cover"
                />
                <span className="text-[10px] text-emerald-400 font-mono">
                  Custom image loaded {detectedTransparency ? '(Cutout alpha detected)' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setCoverPhoto(null)}
                  className="text-[10px] text-rose-400 hover:underline font-mono ml-auto"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Tracklist */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Tracklist (One track per line)
            </label>
            <textarea
              rows={3}
              value={tracksRaw}
              onChange={(e) => setTracksRaw(e.target.value)}
              placeholder="Side A - First Track&#10;Side A - Second Track&#10;Side B - Finale"
              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono"
            />
          </div>

          {/* Liner Notes / Band Lore */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Liner Notes / Band Bio
            </label>
            <textarea
              rows={2}
              value={lore}
              onChange={(e) => setLore(e.target.value)}
              placeholder="Recorded in an abandoned cinema using surplus telephone wire..."
              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono"
            />
          </div>

          {/* Critical Review */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Faux Review / Critical Quote
            </label>
            <textarea
              rows={2}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="An acoustic triumph that defies all conventional protocol."
              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-200 focus:border-amber-500 outline-none font-mono"
            />
          </div>

          {/* NEW: HARVEST INTO GENERATOR ROTATION PANEL */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={harvestToRotation}
                onChange={(e) => setHarvestToRotation(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
              />
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>Add new words &amp; artwork into generator rotation</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Saves novel words and uploaded art into your local &ldquo;Custom Drop Additions&rdquo; crate, automatically ignoring words already in the app or active expansion packs.
                </p>
              </div>
            </label>

            {harvestToRotation && (
              <div className="pt-2 border-t border-slate-800 space-y-2.5 animate-in fade-in">
                {/* Novel Word Pills */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 font-bold">
                      Novel Words Detected ({analysis.novelWords.length}):
                    </span>
                    {analysis.skippedExistingCount > 0 && (
                      <span className="text-slate-500">
                        {analysis.skippedExistingCount} existing skipped
                      </span>
                    )}
                  </div>

                  {analysis.novelWords.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {analysis.novelWords.map((item) => {
                          const activeCat = categoryOverrides[item.word] || item.category;
                          return (
                            <button
                              key={item.word}
                              type="button"
                              onClick={() => handleCycleWordCategory(item.word, item.category)}
                              title="Click to cycle: Noun [N] → Adjective [A] → Ensemble [E] → Skip"
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${getBadgeStyle(
                                activeCat
                              )}`}
                            >
                              <span>{item.word}</span>
                              <span className="text-[8.5px] px-1 rounded bg-black/40">
                                {getShortTag(activeCat)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[9.5px] text-slate-500 font-mono">
                        Tap any word pill to switch between <strong>[N]</strong>oun, <strong>[A]</strong>djective, <strong>[E]</strong>nsemble, or <strong>[SKIP]</strong>.
                      </p>
                    </>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic font-mono">
                      Type a custom band name, title, or tracks above to extract novel words.
                    </p>
                  )}
                </div>

                {/* Image Rotation Layer Selector (if custom photo is attached) */}
                {coverPhoto && (
                  <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>Rotate Uploaded Image As:</span>
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                      <button
                        type="button"
                        onClick={() => setHarvestImageMode('backdrop')}
                        className={`py-1 px-2 rounded border transition-all cursor-pointer ${
                          harvestImageMode === 'backdrop'
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Backdrop
                      </button>
                      <button
                        type="button"
                        onClick={() => setHarvestImageMode('subject')}
                        className={`py-1 px-2 rounded border transition-all cursor-pointer ${
                          harvestImageMode === 'subject'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Subject Stamp
                      </button>
                      <button
                        type="button"
                        onClick={() => setHarvestImageMode('none')}
                        className={`py-1 px-2 rounded border transition-all cursor-pointer ${
                          harvestImageMode === 'none'
                            ? 'bg-rose-500/20 border-rose-400 text-rose-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Skip Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Recurring Band Option */}
                {bandName.trim() && (
                  <label className="flex items-center gap-2 pt-1 border-t border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowBandRecurrence}
                      onChange={(e) => setAllowBandRecurrence(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-slate-300">
                      Allow &ldquo;{bandName.trim()}&rdquo; to drop follow-up albums in future rolls
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Pressing Custom Drop...' : 'Create Custom Drop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};