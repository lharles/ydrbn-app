import React, { useState, useRef } from 'react';
import {
  X,
  Hammer,
  Upload,
  Download,
  BookOpen,
  Image as ImageIcon,
  Trash2,
  Check,
  AlertCircle,
  FileJson,
  Sparkles,
} from 'lucide-react';

export interface CustomPackManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isCustom: true;
  createdAt: number;
}

export interface CustomPackWords {
  nouns: string[];
  adjectives: string[];
  ensembles: string[];
}

export interface CustomStamp {
  id: string;
  name: string;
  dataUrl: string;
}

export interface CustomPackBundle {
  manifest: CustomPackManifest;
  words: CustomPackWords;
  stamps?: CustomStamp[];
}

interface CrateForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePack: (bundle: CustomPackBundle) => Promise<void> | void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
  initialPack?: CustomPackBundle | null;
}

type ForgeTab = 'vocabulary' | 'cutouts';

export const CrateForgeModal: React.FC<CrateForgeModalProps> = ({
  isOpen,
  onClose,
  onSavePack,
  onNotify,
  initialPack,
}) => {
  const [activeTab, setActiveTab] = useState<ForgeTab>('vocabulary');

  // Metadata State
  const [packName, setPackName] = useState(initialPack?.manifest.name || '');
  const [description, setDescription] = useState(initialPack?.manifest.description || '');
  const [author, setAuthor] = useState(initialPack?.manifest.author || 'Anonymous Archivist');
  const [version, setVersion] = useState(initialPack?.manifest.version || '1.0.0');

  // Raw Word Textarea Inputs
  const [rawNouns, setRawNouns] = useState(initialPack?.words.nouns.join('\n') || '');
  const [rawAdjectives, setRawAdjectives] = useState(initialPack?.words.adjectives.join('\n') || '');
  const [rawEnsembles, setRawEnsembles] = useState(initialPack?.words.ensembles.join('\n') || '');

  // Subject Cutout Stamps
  const [stamps, setStamps] = useState<CustomStamp[]>(initialPack?.stamps || []);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);

  // Helper: Parses comma- or newline-delimited strings into clean deduplicated lists
  const parseWordString = (raw: string): string[] => {
    return Array.from(
      new Set(
        raw
          .split(/[\n,]/)
          .map((w) => w.trim())
          .filter((w) => w.length > 0)
      )
    );
  };

  const parsedNouns = parseWordString(rawNouns);
  const parsedAdjectives = parseWordString(rawAdjectives);
  const parsedEnsembles = parseWordString(rawEnsembles);

  // Helper: Generates a contextual name if the user leaves the input blank
  const resolveCrateName = (): string => {
    if (packName.trim()) return packName.trim();

    if (stamps.length > 0) {
      const cleanStem = stamps[0].name.replace(/[-_]+/g, ' ').trim();
      if (cleanStem) {
        return `${cleanStem.charAt(0).toUpperCase() + cleanStem.slice(1)} Crate`;
      }
      return `Visual Stamp Crate #${Math.floor(100 + Math.random() * 900)}`;
    }

    if (parsedNouns.length > 0) {
      return `${parsedNouns[0]} Crate`;
    }

    if (parsedAdjectives.length > 0) {
      return `${parsedAdjectives[0]} Crate`;
    }

    return `Custom Crate #${Math.floor(100 + Math.random() * 900)}`;
  };

  // Handle Image Cutout Uploads (PNG / WebP transparent subjects)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        if (onNotify) onNotify('error', `${file.name} is not an image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newStamp: CustomStamp = {
          id: `stamp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl,
        };
        setStamps((prev) => [...prev, newStamp]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveStamp = (id: string) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
  };

  // Export current pack directly as a portable .json bundle
  const handleExportJson = () => {
    const finalName = resolveCrateName();

    const bundle: CustomPackBundle = {
      manifest: {
        id: initialPack?.manifest.id || `pack-user-${Date.now()}`,
        name: finalName,
        description: description.trim() || 'A custom YDRBN crate.',
        version: version.trim() || '1.0.0',
        author: author.trim() || 'Archivist',
        isCustom: true,
        createdAt: initialPack?.manifest.createdAt || Date.now(),
      },
      words: {
        nouns: parsedNouns,
        adjectives: parsedAdjectives,
        ensembles: parsedEnsembles,
      },
      stamps,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${finalName.toLowerCase().replace(/[^a-z0-9]/gi, '_')}-crate.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onNotify) onNotify('success', `Pack "${finalName}" exported to JSON bundle.`);
  };

  // Import an external .json pack file directly into the forge
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bundle = JSON.parse(event.target?.result as string) as CustomPackBundle;
        if (!bundle.manifest?.name || !bundle.words) {
          throw new Error('Invalid pack schema. Missing manifest or words.');
        }

        setPackName(bundle.manifest.name);
        setDescription(bundle.manifest.description || '');
        setAuthor(bundle.manifest.author || 'Archivist');
        setVersion(bundle.manifest.version || '1.0.0');

        setRawNouns((bundle.words.nouns || []).join('\n'));
        setRawAdjectives((bundle.words.adjectives || []).join('\n'));
        setRawEnsembles((bundle.words.ensembles || []).join('\n'));
        setStamps(bundle.stamps || []);

        setValidationError(null);
        if (onNotify) onNotify('success', `Imported "${bundle.manifest.name}" crate!`);
      } catch (err: any) {
        setValidationError(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Assemble and save the pack into the app
  const handleSave = async () => {
    setValidationError(null);

    if (parsedNouns.length === 0 && parsedAdjectives.length === 0 && stamps.length === 0) {
      setValidationError('Provide at least one noun, adjective, or cutout stamp.');
      return;
    }

    const finalName = resolveCrateName();

    setIsSaving(true);
    try {
      const bundle: CustomPackBundle = {
        manifest: {
          id: initialPack?.manifest.id || `pack-user-${Date.now()}`,
          name: finalName,
          description: description.trim() || 'Custom user crate.',
          version: version.trim() || '1.0.0',
          author: author.trim() || 'Archivist',
          isCustom: true,
          createdAt: initialPack?.manifest.createdAt || Date.now(),
        },
        words: {
          nouns: parsedNouns,
          adjectives: parsedAdjectives,
          ensembles: parsedEnsembles,
        },
        stamps,
      };

      await onSavePack(bundle);
      if (onNotify) onNotify('success', `Mounted "${finalName}" into Cargo Bay!`);
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to assemble custom pack.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#111625] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d] shrink-0">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="font-display tracking-wider text-base text-white uppercase">
                The Crate Forge
              </h3>
              <span className="text-[10px] text-amber-400/80 font-mono block -mt-0.5">
                Offline Modular Content Studio
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Crate Forge"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persistent Crate Identity Header (Always visible across all tabs) */}
        <div className="px-4 py-2.5 bg-[#161310] border-b border-slate-800/80 flex items-center gap-2.5 shrink-0">
          <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold shrink-0">
            Crate Name:
          </label>
          <input
            type="text"
            value={packName}
            onChange={(e) => setPackName(e.target.value)}
            placeholder="e.g. Victorian Eccentrics, Basement Tools (optional)..."
            className="flex-1 bg-black/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-800 bg-[#0e1320] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('vocabulary')}
            className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'vocabulary'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Words &amp; Metadata</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {parsedNouns.length + parsedAdjectives.length + parsedEnsembles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cutouts')}
            className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'cutouts'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Subject Stamps</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {stamps.length}
            </span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs text-slate-300 flex-1">
          {validationError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <>
              {/* Secondary Pack Metadata */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Archivist / Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Version
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Description / Lore
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief note on the aesthetic of this pack..."
                    className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/80 my-1" />

              {/* Nouns Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-semibold text-amber-300 uppercase tracking-wide">
                    Nouns (One per line or comma-separated)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {parsedNouns.length} loaded
                  </span>
                </div>
                <textarea
                  value={rawNouns}
                  onChange={(e) => setRawNouns(e.target.value)}
                  placeholder="Spork, Radiator, Bureaucrat, Flannel, Lawn Chair..."
                  rows={3}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 leading-relaxed font-mono resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Adjectives Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-semibold text-emerald-300 uppercase tracking-wide">
                    Adjectives (One per line or comma-separated)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {parsedAdjectives.length} loaded
                  </span>
                </div>
                <textarea
                  value={rawAdjectives}
                  onChange={(e) => setRawAdjectives(e.target.value)}
                  placeholder="Overpriced, Melancholic, Resonant, Beige, Unironic..."
                  rows={3}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-mono resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Ensembles / Formats Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-semibold text-sky-300 uppercase tracking-wide">
                    Ensembles / Group Formats (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {parsedEnsembles.length} loaded
                  </span>
                </div>
                <textarea
                  value={rawEnsembles}
                  onChange={(e) => setRawEnsembles(e.target.value)}
                  placeholder="Quartet, Collective, Society, Department, Experience..."
                  rows={2}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 leading-relaxed font-mono resize-none placeholder:text-slate-600"
                />
              </div>
            </>
          )}

          {activeTab === 'cutouts' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">Transparent PNG Subject Stamps</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  Upload cutouts (transparent PNG or WebP) to appear as surreal album centerpieces. Images are converted and stored locally in your browser&apos;s IndexedDB.
                </p>
              </div>

              {/* Dropzone / Upload Action */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl bg-slate-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
              >
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                <div className="text-center">
                  <span className="font-bold text-slate-300 block text-xs group-hover:text-white">
                    Select PNG / WebP Cutouts
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Transparent backgrounds recommended
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Gallery of Added Stamps */}
              {stamps.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {stamps.map((stamp) => (
                    <div
                      key={stamp.id}
                      className="group relative rounded-lg border border-slate-800 bg-slate-950 p-1 flex flex-col items-center justify-between overflow-hidden"
                    >
                      <div className="w-full h-16 flex items-center justify-center bg-black/40 rounded p-1">
                        <img
                          src={stamp.dataUrl}
                          alt={stamp.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center mt-1 px-1">
                        {stamp.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStamp(stamp.id)}
                        className="absolute top-1 right-1 p-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove stamp"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs italic">
                  No cutout stamps added to this crate yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-[#0c101d] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Import JSON */}
            <button
              type="button"
              onClick={() => jsonImportRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
              title="Import pack from JSON file"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>Import</span>
            </button>
            <input
              ref={jsonImportRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJson}
              className="hidden"
            />

            {/* Export JSON */}
            <button
              type="button"
              onClick={handleExportJson}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
              title="Download pack as JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Assembling...' : 'Assemble Crate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};