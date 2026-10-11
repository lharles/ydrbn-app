import React, { useState } from 'react';
import { X, Radio, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { transmitDispatch, getAnonymousDeviceId } from '../services/feedbackService';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

const CATEGORIES = [
  'Expansion Pack Theme',
  'Vocabulary / Word Submissions',
  'Visual Gag / Cutout Idea',
  'System Anomaly / Bug',
] as const;

export const DispatchModal: React.FC<DispatchModalProps> = ({ isOpen, onClose, onNotify }) => {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deviceId = getAnonymousDeviceId();
  const shortId = deviceId.substring(0, 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await transmitDispatch(category, content);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      if (onNotify) onNotify('success', result.message);
      setTimeout(() => {
        setIsSuccess(false);
        setContent('');
        onClose();
      }, 1600);
    } else {
      setErrorMsg(result.message);
      if (onNotify) onNotify('error', result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111625] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c101d] shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-xs sm:text-sm tracking-wide text-white uppercase font-mono">
              Archival Dispatch
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dispatch modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs text-slate-300 flex-1">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <span className="font-bold text-slate-100 text-sm">Transmission Received</span>
              <p className="text-[11px] text-slate-400 max-w-[240px]">
                Your submission has logged to the private archival queue for daily ingestion.
              </p>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300 block text-xs">
                  Anonymous Feedback & Content
                </span>
                <p className="text-[10.5px] text-slate-400 leading-tight">
                  Propose new vocabulary pools, suggest visual cutouts, or report generator quirks. Zero personal identity or emails are collected.
                </p>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-semibold text-slate-300 uppercase tracking-wide block">
                  Transmission Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-semibold text-slate-300 uppercase tracking-wide">
                    Suggestion / Content
                  </label>
                  <span className={`text-[10px] font-mono ${content.length > 450 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {content.length}/500
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 500))}
                  placeholder="e.g. Word suggestions: 'Recursive', 'Bureaucracy', 'Spork'. Or a pack idea..."
                  rows={4}
                  required
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 resize-none leading-relaxed placeholder:text-slate-600"
                />
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/60 text-rose-300 text-[10.5px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Device ID / Privacy Indicator */}
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>IDENTITY: ANONYMOUS</span>
                <span>INSTALL #{shortId}</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                {isSubmitting ? (
                  <span>Transmitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Dispatch</span>
                  </>
                )}
              </button>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#0c101d] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};