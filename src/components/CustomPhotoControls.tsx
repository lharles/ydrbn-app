import React, { useRef } from 'react';
import { ImagePlus, Sliders, Check, X } from 'lucide-react';

interface CustomPhotoControlsProps {
  useCustomPhotos: boolean;
  onToggleUseCustomPhotos: (val: boolean) => void;
  selectedPhoto: string | null;
  onSelectPhoto: (base64: string | null) => void;
  onModifyPhoto: () => void;
  onUsePhotoAsIs: () => void;
  isLoading: boolean;
}

export const CustomPhotoControls: React.FC<CustomPhotoControlsProps> = ({
  useCustomPhotos,
  onToggleUseCustomPhotos,
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
      onToggleUseCustomPhotos(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full px-3 py-1 space-y-1.5 z-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Row 1: [ ] "Use custom photos for cover generation" checkbox aligned horizontally next to a [Select Photos] button */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/70 border border-slate-800/80 rounded-lg px-2.5 py-1.5 shadow-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none min-w-0">
          <input
            type="checkbox"
            checked={useCustomPhotos}
            onChange={(e) => onToggleUseCustomPhotos(e.target.checked)}
            className="w-4 h-4 rounded text-orange-500 bg-slate-800 border-slate-700 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer accent-orange-500"
          />
          <span className="text-[11px] font-medium text-slate-300 truncate">
            Use custom photos for cover generation
          </span>
        </label>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedPhoto && (
            <div className="relative w-6 h-6 rounded overflow-hidden border border-orange-400">
              <img src={selectedPhoto} alt="Selected" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onSelectPhoto(null)}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
          >
            <ImagePlus className="w-3 h-3 text-orange-400" />
            <span>Select Photos</span>
          </button>
        </div>
      </div>

      {/* Row 2: Two centered action buttons: [Modify Your Photos] and [Use Your Photos (as is)] */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onModifyPhoto}
          disabled={!selectedPhoto || isLoading}
          title="Applies authentic 1970s Kodachrome film grain & ring-wear sheen directly on canvas"
          className="flex-1 max-w-[170px] flex items-center justify-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-full bg-slate-800/90 text-amber-300 border border-amber-500/40 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
        >
          <Sliders className="w-3 h-3 text-amber-400" />
          <span className="truncate">Modify Your Photos</span>
        </button>

        <button
          type="button"
          onClick={onUsePhotoAsIs}
          disabled={!selectedPhoto || isLoading}
          className="flex-1 max-w-[170px] flex items-center justify-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
        >
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="truncate">Use Your Photos (as is)</span>
        </button>
      </div>
    </div>
  );
};
