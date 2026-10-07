import React, { useState, useEffect } from 'react';
import { Package, Download, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { checkPackStatus, installCurrentPack, uninstallCurrentPack } from '../services/contentPackService';

export const ContentPackSection: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try { setStatus(await checkPackStatus()); } finally { setLoading(false); }
  };
  useEffect(() => { refreshStatus(); }, []);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-200 mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm tracking-wide">Extended Content Packs</span>
        </div>
        <button onClick={refreshStatus} disabled={loading} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="pt-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Absurdity Pack (Core)</span>
          {status?.isInstalled ? (
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Installed (v{status.installedVersion})</span>
          ) : <span className="text-slate-500 italic">Not installed</span>}
        </div>
        <div className="pt-2 flex items-center gap-2">
          {(!status?.isInstalled || status?.hasUpdate) && (
            <button onClick={async () => { setLoading(true); await installCurrentPack(); await refreshStatus(); }} disabled={loading} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg">
              <Download className="w-3.5 h-3.5" /> {status?.isInstalled ? 'Update Pack' : 'Install Pack'}
            </button>
          )}
          {status?.isInstalled && (
            <button onClick={async () => { setLoading(true); await uninstallCurrentPack(); await refreshStatus(); }} disabled={loading} className="flex items-center justify-center py-1.5 px-3 bg-rose-950/40 text-rose-300 border border-rose-800/40 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
      </div>
    </div>
  );
};
