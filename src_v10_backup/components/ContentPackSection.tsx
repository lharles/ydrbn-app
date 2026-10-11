/* import React, { useState, useEffect } from 'react';
import { Package, Download, Trash2, CheckCircle2, RefreshCw, WifiOff } from 'lucide-react';
import { getPackRegistry, checkPackStatus, installPack, uninstallPack } from '../services/contentPackService';

export const ContentPackSection: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [registry, setRegistry] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [loadingPacks, setLoadingPacks] = useState<Record<string, boolean>>({});
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    loadData();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    setGlobalLoading(true);
    const data = await getPackRegistry();
    setRegistry(data.availablePacks || []);
    
    const newStatuses: Record<string, any> = {};
    for (const pack of (data.availablePacks || [])) {
       newStatuses[pack.id] = await checkPackStatus(pack.id, pack.manifestUrl);
    }
    setStatuses(newStatuses);
    setGlobalLoading(false);
  };

  const handleInstall = async (packId: string, manifestUrl: string) => {
    setLoadingPacks(prev => ({ ...prev, [packId]: true }));
    await installPack(packId, manifestUrl);
    const newStatus = await checkPackStatus(packId, manifestUrl);
    setStatuses(prev => ({ ...prev, [packId]: newStatus }));
    setLoadingPacks(prev => ({ ...prev, [packId]: false }));
  };

  const handleUninstall = async (packId: string, manifestUrl: string) => {
    setLoadingPacks(prev => ({ ...prev, [packId]: true }));
    await uninstallPack(packId);
    const newStatus = await checkPackStatus(packId, manifestUrl);
    setStatuses(prev => ({ ...prev, [packId]: newStatus }));
    setLoadingPacks(prev => ({ ...prev, [packId]: false }));
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-200 mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm tracking-wide">Content Platform</span>
        </div>
        {isOnline && (
          <button onClick={loadData} disabled={globalLoading} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <RefreshCw className={`w-4 h-4 ${globalLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!isOnline && (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 flex gap-2 items-start">
          <WifiOff className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-tight">
            Internet access is required to browse or download new content packs. Installed packs remain available offline.
          </p>
        </div>
      )}

      <div className="pt-3 text-xs space-y-4">
        {registry.map(pack => {
          const status = statuses[pack.id];
          const isPackLoading = loadingPacks[pack.id] || globalLoading;
          
          return (
            <div key={pack.id} className="space-y-2 pb-3 border-b border-slate-800/50 last:border-0 last:pb-0">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">{pack.name}</span>
                  {status?.isInstalled ? (
                    <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Installed (v{status.installedVersion})</span>
                  ) : <span className="text-slate-500 italic">Not installed</span>}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{pack.description}</span>
              </div>

              <div className="pt-1 flex items-center gap-2">
                {(!status?.isInstalled || status?.hasUpdate) && (
                  <button onClick={() => handleInstall(pack.id, pack.manifestUrl)} disabled={isPackLoading || !isOnline} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 font-semibold rounded-lg transition-colors ${!isOnline ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-slate-900'}`}>
                    <Download className="w-3.5 h-3.5" /> 
                    {isPackLoading ? 'Processing...' : (status?.isInstalled ? 'Update Pack' : 'Install Pack')}
                  </button>
                )}
                {status?.isInstalled && (
                  <button onClick={() => handleUninstall(pack.id, pack.manifestUrl)} disabled={isPackLoading} className="flex items-center justify-center py-1.5 px-3 bg-rose-950/40 text-rose-300 border border-rose-800/40 rounded-lg hover:bg-rose-900/50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
 */
import React, { useState, useEffect } from 'react';
import { Package, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { getAvailablePacks, checkPackStatus, installCurrentPack, uninstallCurrentPack } from '../services/contentPackService';

export const ContentPackSection: React.FC = () => {
  const [packs, setPacks] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const available = await getAvailablePacks();
      setPacks(available);
      const statusMap: Record<string, any> = {};
      for (const p of available) {
        statusMap[p.id] = await checkPackStatus(p.id, p.manifestUrl);
      }
      setStatuses(statusMap);
    } finally {
      setLoading(false);
    }
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
      <div className="pt-3 space-y-3 max-h-64 overflow-y-auto pr-1">
        {packs.map((pack) => {
          const status = statuses[pack.id];
          return (
            <div key={pack.id} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-bold text-slate-300">{pack.name}</span>
                {status?.isInstalled ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> v{status.installedVersion}
                  </span>
                ) : (
                  <span className="text-slate-500 italic text-[10px]">Not installed</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mb-2">{pack.description}</p>
              <div className="flex items-center gap-2 text-xs">
                {(!status?.isInstalled || status?.hasUpdate) && (
                  <button
                    onClick={async () => { setLoading(true); await installCurrentPack(pack.manifestUrl); await refreshStatus(); }}
                    disabled={loading}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg"
                  >
                    {status?.isInstalled ? 'Update Pack' : 'Install Pack'}
                  </button>
                )}
                {status?.isInstalled && (
                  <button
                    onClick={async () => { setLoading(true); await uninstallCurrentPack(pack.id); await refreshStatus(); }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-rose-950/40 text-rose-300 border border-rose-800/40 rounded-lg hover:bg-rose-900/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};