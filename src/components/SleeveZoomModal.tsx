import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCw, Minus, Plus } from 'lucide-react';
import { AlbumEntry } from '../types';
import { VinylSleeve } from './VinylSleeve';

interface SleeveZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: AlbumEntry | null;
  initialFlipped?: boolean;
}

export const SleeveZoomModal: React.FC<SleeveZoomModalProps> = ({
  isOpen,
  onClose,
  album,
  initialFlipped = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  // Reset viewport state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(initialFlipped);
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, initialFlipped]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Maximum allowed panning distance computed dynamically from zoom level
  const getMaxPan = (z: number) => {
    if (z <= 1.0) return 0;
    return (340 * z) / 2 + 80;
  };

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1.0, Math.min(2.5, parseFloat(newZoom.toFixed(2))));
    setZoom(clampedZoom);

    if (clampedZoom <= 1.0) {
      setPan({ x: 0, y: 0 });
    } else {
      const maxP = getMaxPan(clampedZoom);
      setPan((prev) => ({
        x: Math.max(-maxP, Math.min(maxP, prev.x)),
        y: Math.max(-maxP, Math.min(maxP, prev.y)),
      }));
    }
  };

  // --- MOUSE DRAG PANNING ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1.0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const maxPan = getMaxPan(zoom);
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panX + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panY + dy)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- TOUCH PANNING (Mobile Simulation) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1.0 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;

    const maxPan = getMaxPan(zoom);
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panX + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panY + dy)),
    });
  };

  // --- MOUSE WHEEL PANNING ---
  const handleWheel = (e: React.WheelEvent) => {
    if (zoom <= 1.0) return;
    e.preventDefault();
    const maxPan = getMaxPan(zoom);
    setPan((prev) => ({
      x: Math.max(-maxPan, Math.min(maxPan, prev.x - e.deltaX)),
      y: Math.max(-maxPan, Math.min(maxPan, prev.y - e.deltaY)),
    }));
  };

  if (!isOpen || !album) return null;

  const isZoomed = zoom > 1.0;
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 select-none">
      {/* Top Header Controls Bar */}
      <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 py-1.5 z-20 shrink-0 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          {/* Flip Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="h-8 px-2.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFlipped ? 'Front View' : 'Back Notes'}</span>
          </button>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-md border border-slate-700/80 text-[10px] font-mono">
            {[100, 150, 200, 250].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleZoomChange(pct / 100)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  zoomPercent === pct
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Stepper with Numeric Input */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-md h-8 px-1">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.1)}
              disabled={zoom <= 1.0}
              className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 active:scale-90"
              aria-label="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center px-1">
              <input
                type="number"
                min="100"
                max="250"
                step="5"
                value={zoomPercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) handleZoomChange(val / 100);
                }}
                className="w-12 bg-transparent text-center font-mono text-xs font-bold text-amber-300 focus:outline-none"
              />
              <span className="font-mono text-xs text-stone-400 select-none">%</span>
            </div>

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.1)}
              disabled={zoom >= 2.5}
              className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 active:scale-90"
              aria-label="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Zoom View"
            className="h-8 w-8 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Pan / Canvas Stage */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 w-full overflow-hidden flex items-center justify-center relative ${
          isZoomed
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
          className="w-[340px] h-[340px] shrink-0 pointer-events-auto select-none"
        >
          {/* Passing a no-op to onToggleFlip prevents sleeve clicks from triggering flips while panning */}
          <VinylSleeve
            album={album}
            isFlipped={isFlipped}
            isLoading={false}
            onToggleFlip={() => {}}
            hideZoomButton
          />
        </div>
      </div>

      {/* Bottom Status / Navigation Hint */}
      <p className="text-[10px] text-stone-400 font-mono py-1 pointer-events-none text-center shrink-0">
        {isZoomed
          ? 'Drag to pan • Use Front View / Back Notes button above to flip'
          : 'Tap preset (150%, 200%) or +/- to inspect artwork and liner notes'}
      </p>
    </div>
  );
};