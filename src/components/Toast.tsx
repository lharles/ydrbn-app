import React, { useState } from 'react';
import { ToastMessage } from '../types';
import { AlertCircle, CheckCircle2, Info, X, Copy, Check } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (toasts.length === 0) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 w-full max-w-sm px-3 z-50 pointer-events-none space-y-2">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full p-2.5 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-2.5 transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
              isError
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-100 shadow-rose-950/50'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100 shadow-emerald-950/50'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-black/60'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {!isError && !isSuccess && <Info className="w-4 h-4 text-amber-400" />}
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0">
              {isError && (
                <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-0.5">
                  Inspection Error
                </div>
              )}
              <p className="text-xs break-words font-mono leading-relaxed select-text">
                {toast.text}
              </p>
            </div>

            {/* Actions: Copy for error, Dismiss for all */}
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {isError && (
                <button
                  onClick={() => handleCopy(toast.id, toast.text)}
                  className="p-1 rounded-md bg-rose-900/60 hover:bg-rose-800/80 text-rose-300 hover:text-white transition-all active:scale-90"
                  title="Copy error string"
                  aria-label="Copy error text"
                >
                  {copiedId === toast.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-all active:scale-90"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
