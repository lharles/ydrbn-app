import React, { useRef } from 'react';
import { ImagePlus, Sliders, Check, X } from 'lucide-react';

interface CustomPhotoControlsProps {
  selectedPhoto: string | null;
  onSelectPhoto: (base64: string | null) => void;
  onModifyPhoto: () => void;
  onUsePhotoAsIs: () => void;
  isLoading: boolean;
}

export const CustomPhotoControls: React.FC<CustomPhotoControlsProps> = ({
  selectedPhoto,
  onSelectPhoto,
  onModifyPhoto,
  onUsePhotoAsIs,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onSelectPhoto(result);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="w-full px-2 py-1 space-y-1.5 z-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-2 bg-slate-900/70 border border-slate-800/80 rounded-lg px-2.5 py-1.5 shadow-sm">
        <span className="text-[10.5px] text-slate-300 leading-tight min-w-0 truncate">
          {selectedPhoto
            ? 'Click Darkroom Filter repeatedly to cycle styles:'
            : 'Select a photo to retouch the active sleeve:'}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedPhoto && (
            <div className="relative w-6 h-6 rounded overflow-hidden border border-orange-400">
              <img src={selectedPhoto} alt="Selected" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onSelectPhoto(null)}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                title="Clear staged photo"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <ImagePlus className="w-3 h-3 text-orange-400" />
            <span>{selectedPhoto ? 'Change' : 'Select Photo'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onModifyPhoto}
          disabled={!selectedPhoto || isLoading}
          title="Click repeatedly to cycle Kodachrome, Cyanotype, Noir & X-Ray darkroom variations"
          className="flex-1 flex items-center justify-center gap-1 text-[10.5px] font-semibold py-1 px-2 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/50 hover:bg-amber-500/30 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Sliders className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">Darkroom Filter</span>
        </button>

        <button
          type="button"
          onClick={onUsePhotoAsIs}
          disabled={!selectedPhoto || isLoading}
          className="flex-1 flex items-center justify-center gap-1 text-[10.5px] font-semibold py-1 px-2 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">Use Photo (As-Is)</span>
        </button>
      </div>
    </div>
  );
};
