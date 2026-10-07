import React, { useState, useEffect } from 'react';
import { Package, Download, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { checkPackStatus, installCurrentPack, uninstallCurrentPack, PackStatus } from '../services/contentPackService';

export const ContentPackSection: React.FC = () => {
  const [status, setStatus] = useState<PackStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const refreshStatus = async () => {
    setLoading(true);
    setMessage('');
    try {
      const s = await checkPackStatus();
      setStatus(s);
    } catch {
      setMessage('Failed to inspect content packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleInstall = async () => {
    setLoading(true);
    setMessage('');
    try {
      await installCurrentPack();
      await refreshStatus();
      setMessage('Pack installed successfully!');
    } catch (e: any) {
      setMessage(e.message || 'Installation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    setLoading(true);
    setMessage('');
    try {
      await uninstallCurrentPack();
      await refreshStatus();
      setMessage('Pack uninstalled.');
    } catch (e: any) {
      setMessage(e.message || 'Uninstall failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-200 mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm tracking-wide">Extended Content Packs</span>
        </div>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
          title="Check for updates"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="pt-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Absurdity Pack (Core)</span>
          {status?.isInstalled ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Installed (v{status.installedVersion})
            </span>
          ) : (
            <span className="text-slate-500 italic">Not installed</span>
          )}
        </div>

        {status?.hasUpdate && (
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300">
            Version {status.remoteVersion} is available!
          </div>
        )}

        {message && (
          <div className="text-slate-400 italic text-[11px]">{message}</div>
        )}

        <div className="pt-2 flex items-center gap-2">
          {(!status?.isInstalled || status?.hasUpdate) && (
            <button
              onClick={handleInstall}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {status?.isInstalled ? 'Update Pack' : 'Install Pack'}
            </button>
          )}

          {status?.isInstalled && (
            <button
              onClick={handleUninstall}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg transition disabled:opacity-50"
              title="Remove pack"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
