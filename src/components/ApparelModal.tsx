import React, { useState, useEffect } from 'react';
import { X, Shirt, Download, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { AlbumEntry } from '../types';
import {
  renderTourBackGraphic,
  CANONICAL_TOUR_ROSTER,
  generateProceduralTourRoster,
} from '../services/tourCanvasEngine';
import { renderHighResFrontGraphic } from '../services/apparelCanvasEngine';

interface ApparelModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: AlbumEntry | null;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

const INK_PALETTES = [
  { label: 'Crimson Red', hex: '#8b1410' },
  { label: 'Amber Gold', hex: '#d97706' },
  { label: 'Warm Eggshell', hex: '#f3ede4' },
];

const FABRICATORS = [
  { name: 'CustomInk', url: 'https://www.customink.com/lab' },
  { name: 'Zazzle', url: 'https://www.zazzle.com/custom/tshirts' },
  { name: 'Spreadshirt', url: 'https://www.spreadshirt.com/create-your-own' },
];

export const ApparelModal: React.FC<ApparelModalProps> = ({
  isOpen,
  onClose,
  album,
  onNotify,
}) => {
  const [frontMode, setFrontMode] = useState<'cutout' | 'plaque'>('cutout');
  const [includeBack, setIncludeBack] = useState(true);
  const [tourMode, setTourMode] = useState<'canonical' | 'procedural'>('canonical');
  const [inkColor, setInkColor] = useState('#8b1410');
  const [frontDataUrl, setFrontDataUrl] = useState<string>('');
  const [backDataUrl, setBackDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  // Render high-res previews whenever options change
  useEffect(() => {
    if (!isOpen || !album) return;
    setIsRendering(true);

    renderHighResFrontGraphic(album, frontMode).then((fUrl) => {
      setFrontDataUrl(fUrl);
      const stops =
        tourMode === 'procedural' ? generateProceduralTourRoster(album) : CANONICAL_TOUR_ROSTER;
      const bUrl = renderTourBackGraphic({ accentColor: inkColor, stops });
      setBackDataUrl(bUrl);
      setIsRendering(false);
    });
  }, [isOpen, album, frontMode, inkColor, tourMode]);

  if (!isOpen || !album) return null;

  const isFuturePressing = parseInt(album.year, 10) > new Date().getFullYear();

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExport = (destinationUrl?: string) => {
    const slug = album.bandName.toLowerCase().replace(/[^a-z0-9]/gi, '_');

    triggerDownload(frontDataUrl, `${slug}_front_300dpi.png`);

    if (includeBack) {
      setTimeout(() => {
        triggerDownload(backDataUrl, `${slug}_back_tour_300dpi.png`);
      }, 350);
    }

    if (onNotify) {
      onNotify('success', 'Master 300 DPI production files dispatched to downloads.');
    }

    if (destinationUrl) {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#161310] border border-amber-800/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#12100e] shrink-0">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="font-display tracking-wider text-base text-[#f3ede4] uppercase">
                Apparel Fabrication Terminal
              </h3>
              <span className="text-[10px] text-amber-400/80 font-mono block -mt-0.5">
                300 DPI Direct-To-Garment Production Handoff
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-300 flex-1">
          {/* Side-by-Side Dual Previews */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Front: Chest Plate
              </span>
              <div className="aspect-square rounded-xl border border-slate-800 bg-black/70 p-2 flex items-center justify-center overflow-hidden">
                {isRendering || !frontDataUrl ? (
                  <span className="font-mono text-[10px] text-amber-500 animate-pulse">
                    Rendering...
                  </span>
                ) : (
                  <img
                    src={frontDataUrl}
                    alt="Front print"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Back: Tour Roster
              </span>
              <div
                className={`aspect-square rounded-xl border border-slate-800 bg-black/70 p-2 flex items-center justify-center overflow-hidden ${
                  !includeBack ? 'opacity-30' : ''
                }`}
              >
                {!includeBack ? (
                  <span className="font-mono text-[10px] text-slate-500">Back Disabled</span>
                ) : isRendering || !backDataUrl ? (
                  <span className="font-mono text-[10px] text-amber-500 animate-pulse">
                    Rendering...
                  </span>
                ) : (
                  <img
                    src={backDataUrl}
                    alt="Back tour print"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Front Mode Toggles */}
          <div className="space-y-1.5 bg-[#100e0c] p-3 rounded-xl border border-slate-800">
            <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Front Print Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrontMode('cutout')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  frontMode === 'cutout'
                    ? 'border-amber-500/60 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs block">Isolated Cutout</span>
                <span className="text-[9.5px] leading-tight block text-slate-400 mt-0.5">
                  Transparent alpha; fabric shows through (ideal for black shirts).
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFrontMode('plaque')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  frontMode === 'plaque'
                    ? 'border-amber-500/60 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs block">Full Sleeve Plaque</span>
                <span className="text-[9.5px] leading-tight block text-slate-400 mt-0.5">
                  Solid 1:1 square sleeve art with paper distress &amp; backdrop.
                </span>
              </button>
            </div>
          </div>

          {/* Back Tour Dates, Roster Mode & Color Toggles */}
          <div className="space-y-2.5 bg-[#100e0c] p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tour Schedule (Back Print)</span>
              </label>
              <button
                type="button"
                onClick={() => setIncludeBack(!includeBack)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all border ${
                  includeBack
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {includeBack ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {includeBack && (
              <>
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTourMode('canonical')}
                    className={`p-1.5 rounded-lg border text-left transition-all font-mono ${
                      tourMode === 'canonical'
                        ? 'border-amber-500/60 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-[10.5px] block">Canonical &apos;77 Circuit</span>
                    <span className="text-[9px] text-slate-400 block">
                      Twin Peaks, Bikini Bottom, Mordor...
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTourMode('procedural')}
                    className={`p-1.5 rounded-lg border text-left transition-all font-mono ${
                      tourMode === 'procedural'
                        ? 'border-amber-500/60 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-[10.5px] block">
                      {isFuturePressing ? 'Chrono-Orbital Circuit' : 'Municipal Lore Circuit'}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      {isFuturePressing
                        ? 'Luna, Mars, Orbital Cistern #4...'
                        : 'Flumptown Annex, Zoning Board...'}
                    </span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Back Ink Pigment:</span>
                  <div className="flex gap-2">
                    {INK_PALETTES.map((pal) => (
                      <button
                        key={pal.hex}
                        type="button"
                        onClick={() => setInkColor(pal.hex)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                          inkColor === pal.hex
                            ? 'border-amber-400 bg-slate-800 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: pal.hex }}
                        />
                        <span>{pal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Institutional Separation Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5 text-amber-200/90 font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Notice: No Affiliation With Vendors</span>
            </div>
            <p className="text-[9.5px] leading-relaxed text-slate-400">
              Once you are redirected to the vendor&apos;s site, you are on your own! All sizing and color choices happen independently, as Y.D.R.B.N. has no commercial ties and assumes zero liability for clothing items, orders, or deliveries. Y.D.R.B.N. does not recommend any particular vendors, these were just handy options. DO NOT FOLD, SPINDLE, OR MUTILATE Y.D.R.B.N.
            </p>
          </div>
        </div>

        {/* Footer Dispatch Actions */}
        <div className="p-3 border-t border-slate-800 bg-[#12100e] space-y-2 shrink-0">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block text-center">
            Dispatch Master 300 DPI Assets To Fabricator:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {FABRICATORS.map((fab) => (
              <button
                key={fab.name}
                type="button"
                onClick={() => handleExport(fab.url)}
                className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-[#f3ede4] text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
              >
                <span>{fab.name}</span>
                <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleExport()}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Master 300 DPI PNGs Only</span>
          </button>
        </div>
      </div>
    </div>
  );
};