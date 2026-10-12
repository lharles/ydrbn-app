import React, { useState } from 'react';
import { Disc, Sparkles, Upload, X, Music } from 'lucide-react';
import { CustomDropInput, AlbumEntry } from '../types';

interface CustomDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForge: (input: CustomDropInput) => Promise<void>;
  isLoading: boolean;
}

export const CustomDropModal: React.FC<CustomDropModalProps> = ({
  isOpen,
  onClose,
  onForge,
  isLoading,
}) => {
  const [bandName, setBandName] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [year, setYear] = useState('');
  const [tracksRaw, setTracksRaw] = useState('');
  const [lore, setLore] = useState('');
  const [review, setReview] = useState('');
  const [audioPreset, setAudioPreset] = useState<AlbumEntry['audioPreset']>('analog-synth');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCoverPhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tracks = tracksRaw
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    await onForge({
      bandName: bandName || undefined,
      albumTitle: albumTitle || undefined,
      year: year || undefined,
      tracks: tracks.length > 0 ? tracks : undefined,
      lore: lore || undefined,
      review: review || undefined,
      coverImageBase64: coverPhoto || undefined,
      audioPreset,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#12100e] border border-amber-800/40 rounded-2xl shadow-2xl flex flex-col max-h-[84dvh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/40 bg-[#0c0a09] shrink-0">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-amber-200">
              Custom Drop - White Label Pressing Studio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close studio"
            className="text-slate-400 hover:text-white p-1 text-sm font-mono leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs text-slate-300">
          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-300/90 font-mono leading-relaxed">
            ✦ <strong>Custom Drop - Private Pressing Mode:</strong> Enter any fields you choose. Anything left blank will be generated automatically. Custom drops do not consume your 24h Daily Drop timer.
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
              placeholder="e.g., The Velvet Transmission (or leave blank)"
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
                placeholder="e.g., Echoes in F# minor"
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
                placeholder="e.g., 1984"
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
              <span>Cover Artwork (Optional Image Upload)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-mono file:bg-amber-950/60 file:text-amber-300 hover:file:bg-amber-900 cursor-pointer"
            />
            {coverPhoto && (
              <div className="mt-1.5 flex items-center gap-2">
                <img src={coverPhoto} alt="Preview" className="w-8 h-8 rounded border border-amber-600 object-cover" />
                <span className="text-[10px] text-emerald-400 font-mono">Custom photo loaded</span>
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95"
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