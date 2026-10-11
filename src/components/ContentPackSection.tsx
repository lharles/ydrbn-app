import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Power, 
  BookOpen, 
  Image as ImageIcon, 
  Shapes,
  ChevronDown,
  ChevronRight,
  Hammer,
  Edit3,
  Download,
  Plus
} from 'lucide-react';
import { 
  getAvailablePacks, 
  checkPackStatus, 
  installCurrentPack, 
  uninstallCurrentPack,
  getCustomPacks,
  saveCustomPack,
  deleteCustomPack,
  exportCustomPackAsJson
} from '../services/contentPackService';
import { StoredPack } from '../services/packStorage';
import { getPreferences, togglePackStatus } from '../services/preferencesService';
import { hydrateContentPools } from '../services/proceduralGenerator';
import { CrateForgeModal, CustomPackBundle } from './CrateForgeModal';

export const ContentPackSection: React.FC = () => {
  const [packs, setPacks] = useState<any[]>([]);
  const [customPacks, setCustomPacks] = useState<StoredPack[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [installingSection, setInstallingSection] = useState<string | null>(null);
  const [prefs, setPrefs] = useState(getPreferences());

  // Crate Forge Modal state
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [editingPackBundle, setEditingPackBundle] = useState<CustomPackBundle | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    custom: true,
    words: false,
    subjects: false,
    backgrounds: false,
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const [available, localCustom] = await Promise.all([
        getAvailablePacks().catch(() => []),
        getCustomPacks(),
      ]);

      setPacks(available);
      setCustomPacks(localCustom);

      const statusMap: Record<string, any> = {};
      for (const p of available) {
        statusMap[p.id] = await checkPackStatus(p.id, p.manifestUrl);
      }
      setStatuses(statusMap);
      setPrefs(getPreferences());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleTogglePack = async (packId: string, currentlyEnabled: boolean) => {
    togglePackStatus(packId, !currentlyEnabled);
    setPrefs(getPreferences());
    await hydrateContentPools();
  };

  const handleOpenForgeNew = () => {
    setEditingPackBundle(null);
    setIsForgeOpen(true);
  };

  const handleOpenForgeEdit = (pack: StoredPack) => {
    if (pack.customBundle) {
      setEditingPackBundle(pack.customBundle);
    } else {
      // Reconstruct bundle if needed
      setEditingPackBundle({
        manifest: {
          id: pack.id,
          name: pack.manifest.name,
          description: pack.manifest.description || '',
          version: pack.installedVersion || '1.0.0',
          author: pack.manifest.author || 'Archivist',
          isCustom: true,
          createdAt: pack.installedAt,
        },
        words: {
          nouns: pack.words?.nouns || [],
          adjectives: pack.words?.adjectives || [],
          ensembles: pack.words?.ensembles || [],
        },
        stamps: [],
      });
    }
    setIsForgeOpen(true);
  };

  const handleDeleteCustomPack = async (packId: string) => {
    setLoading(true);
    try {
      await deleteCustomPack(packId);
      await refreshStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomBundle = async (bundle: CustomPackBundle) => {
    await saveCustomPack(bundle);
    await refreshStatus();
  };

  const handleToggleInstallAll = async (sectionKey: string, sectionPacks: any[], allInstalled: boolean) => {
    if (loading || installingSection) return;
    setInstallingSection(sectionKey);
    setLoading(true);
    try {
      if (allInstalled) {
        for (const p of sectionPacks) {
          if (statuses[p.id]?.isInstalled) {
            await uninstallCurrentPack(p.id);
          }
        }
      } else {
        for (const p of sectionPacks) {
          if (!statuses[p.id]?.isInstalled || statuses[p.id]?.hasUpdate) {
            await installCurrentPack(p.manifestUrl);
          }
        }
      }
      await refreshStatus();
      await hydrateContentPools();
    } finally {
      setLoading(false);
      setInstallingSection(null);
    }
  };

  const wordPacks = packs.filter((p) => p.id.includes('word') || p.words);
  const subjectPacks = packs.filter((p) => p.id.includes('subject') || p.subjects);
  const bgPacks = packs.filter(
    (p) => !wordPacks.some((wp) => wp.id === p.id) && !subjectPacks.some((sp) => sp.id === p.id)
  );

  const renderPackCard = (pack: any) => {
    const status = statuses[pack.id];
    const isInstalled = status?.isInstalled;
    const isEnabled = !prefs.disabledPacks.includes(pack.id);

    const descMatch = (pack.description || '').match(/^(\d+)(.*)/);
    const formattedDescription = descMatch ? (
      <>
        <span className="font-bold text-slate-100">{descMatch[1]}</span>
        {descMatch[2]}
      </>
    ) : (
      pack.description
    );

    return (
      <div 
        key={pack.id} 
        className={`p-3 rounded-xl border overflow-hidden transition-all ${
          isInstalled && isEnabled 
            ? 'bg-slate-900/90 border-slate-700/80 shadow-sm' 
            : 'bg-slate-950/60 border-slate-800/70'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2 text-xs">
          <p className="text-[11px] text-slate-400 leading-snug flex-1">
            {formattedDescription}
          </p>
          <div className="shrink-0 text-right pt-0.5">
            {isInstalled ? (
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> v{status.installedVersion}
              </span>
            ) : (
              <span className="text-slate-500 italic text-[11px]">Not installed</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          {!isInstalled && (
            <button
              onClick={async () => {
                setLoading(true);
                await installCurrentPack(pack.manifestUrl);
                await refreshStatus();
              }}
              disabled={loading}
              className="w-full py-2 px-3 bg-[#d97706] hover:bg-[#b45309] text-slate-950 font-bold rounded-lg transition-all text-xs sm:text-sm text-center shadow-md active:scale-[0.99] leading-tight truncate"
            >
              {pack.name}
            </button>
          )}

          {isInstalled && status?.hasUpdate && (
            <button
              onClick={async () => {
                setLoading(true);
                await installCurrentPack(pack.manifestUrl);
                await refreshStatus();
              }}
              disabled={loading}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all text-xs sm:text-sm text-center shadow-md active:scale-[0.99] leading-tight truncate"
            >
              Update: {pack.name}
            </button>
          )}

          {isInstalled && !status?.hasUpdate && (
            <>
              <button
                onClick={() => handleTogglePack(pack.id, isEnabled)}
                className={`flex-1 min-w-0 py-2 px-2.5 flex items-center justify-center gap-2 rounded-lg font-bold text-xs sm:text-sm transition-all leading-tight ${
                  isEnabled
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900/70 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700/80'
                }`}
                title={isEnabled ? `Click to disable ${pack.name}` : `Click to enable ${pack.name}`}
              >
                <Power className={`w-3.5 h-3.5 shrink-0 ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="truncate">{pack.name}</span>
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  await uninstallCurrentPack(pack.id);
                  await refreshStatus();
                }}
                disabled={loading}
                className="w-8 h-8 flex items-center justify-center bg-rose-950/30 text-rose-400 border border-rose-900/40 rounded-lg hover:bg-rose-900/50 transition-colors shrink-0"
                title={`Uninstall ${pack.name} from storage`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCustomPackCard = (pack: StoredPack) => {
    const isEnabled = !prefs.disabledPacks.includes(pack.id);
    const nounCount = pack.words?.nouns?.length || 0;
    const adjCount = pack.words?.adjectives?.length || 0;
    const stampCount = pack.manifest?.subjects?.length || 0;

    return (
      <div
        key={pack.id}
        className={`p-2.5 rounded-xl border overflow-hidden transition-all ${
          isEnabled
            ? 'bg-slate-900/90 border-amber-500/40 shadow-sm'
            : 'bg-slate-950/60 border-slate-800/70'
        }`}
      >
        {/* Row 1: Name on left, inline count badges + version on right */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <span className="font-bold text-amber-300 text-xs truncate flex-1">
            {pack.manifest.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              {nounCount}N · {adjCount}A{stampCount > 0 ? ` · ${stampCount}C` : ''}
            </span>
            <span className="text-amber-400/90">v{pack.installedVersion}</span>
          </div>
        </div>

        {/* Row 2: Compact Action Controls */}
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => handleTogglePack(pack.id, isEnabled)}
            className={`flex-1 min-w-0 py-1 px-2.5 h-7 flex items-center justify-center gap-1.5 rounded-lg font-bold text-[11px] transition-all leading-tight ${
              isEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            <Power className={`w-3 h-3 shrink-0 ${isEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{isEnabled ? 'MOUNTED' : 'OFFLINE'}</span>
          </button>

          <button
            onClick={() => handleOpenForgeEdit(pack)}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors shrink-0"
            title="Edit crate in the Forge"
            aria-label="Edit pack"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (pack.customBundle) {
                exportCustomPackAsJson(pack.customBundle);
              }
            }}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors shrink-0"
            title="Download crate bundle JSON"
            aria-label="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleDeleteCustomPack(pack.id)}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 transition-colors shrink-0"
            title="Delete custom crate"
            aria-label="Delete pack"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (
    key: string,
    title: string,
    sectionPacks: any[],
    Icon: any,
    accentColor: string,
    textColor: string
  ) => {
    if (sectionPacks.length === 0) return null;

    const installedCount = sectionPacks.filter((p) => statuses[p.id]?.isInstalled).length;
    const allInstalled = sectionPacks.length > 0 && installedCount === sectionPacks.length;
    const someInstalled = installedCount > 0;
    const isExpanded = expandedSections[key];
    const isThisSectionProcessing = installingSection === key;

    return (
      <div className="border border-slate-800/90 rounded-xl overflow-hidden bg-slate-950/40 transition-colors">
        <div 
          onClick={() => toggleSection(key)}
          className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800/60 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <Icon className={`w-3.5 h-3.5 ${accentColor} shrink-0`} />
            <span className={`text-[11px] font-bold ${textColor} tracking-wider uppercase truncate`}>
              {title}
            </span>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              ({installedCount}/{sectionPacks.length})
            </span>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            {isThisSectionProcessing ? (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 px-2 py-1 rounded select-none">
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="font-mono text-[9px] text-amber-300 uppercase tracking-wider font-bold">
                  {allInstalled ? 'Removing...' : 'Installing...'}
                </span>
              </div>
            ) : (
              <label 
                className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-colors select-none ${
                  loading 
                    ? 'opacity-40 pointer-events-none bg-slate-900 border-slate-800 text-slate-600' 
                    : 'text-slate-400 hover:text-slate-200 cursor-pointer bg-slate-800/70 hover:bg-slate-800 border-slate-700/60'
                }`}
                title={allInstalled ? `Uninstall all ${title}` : `Install all ${title}`}
              >
                <input
                  type="checkbox"
                  checked={allInstalled}
                  ref={(el) => {
                    if (el) el.indeterminate = someInstalled && !allInstalled;
                  }}
                  onChange={() => handleToggleInstallAll(key, sectionPacks, allInstalled)}
                  disabled={loading}
                  className="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer disabled:opacity-50"
                />
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">
                  {allInstalled ? 'All In' : someInstalled ? 'Install Rest' : 'Install All'}
                </span>
              </label>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-2 space-y-2 border-t border-slate-800/60 bg-black/20 animate-in fade-in duration-150">
            {sectionPacks.map(renderPackCard)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Top Action Card: Launch The Crate Forge */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <Hammer className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-100 text-xs">The Crate Forge</span>
          </div>
          <p className="text-[10.5px] text-slate-400 leading-tight">
            Author custom word lists and transparent cutout stamps directly on your device.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenForgeNew}
          className="py-2 px-3 rounded-lg font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 transition-all shadow active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Crate</span>
        </button>
      </div>

      {/* Main Manifest Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-slate-200">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs sm:text-sm tracking-wide">Installed Content Manifest</span>
          </div>
          <button 
            onClick={refreshStatus} 
            disabled={loading} 
            aria-label="Refresh content list"
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="pt-3 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* User-Forged Crates Collapsible Section */}
          {customPacks.length > 0 && (
            <div className="border border-amber-500/30 rounded-xl overflow-hidden bg-slate-950/40 transition-colors">
              <div
                onClick={() => toggleSection('custom')}
                className="flex items-center justify-between p-2.5 bg-amber-500/10 hover:bg-amber-500/15 cursor-pointer select-none transition-colors border-b border-amber-500/20"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {expandedSections.custom ? (
                    <ChevronDown className="w-4 h-4 text-amber-300 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <Hammer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase truncate">
                    User-Forged Crates
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 shrink-0">
                    ({customPacks.length})
                  </span>
                </div>
              </div>

              {expandedSections.custom && (
                <div className="p-2 space-y-2 bg-black/20 animate-in fade-in duration-150">
                  {customPacks.map(renderCustomPackCard)}
                </div>
              )}
            </div>
          )}

          {renderSection(
            'words',
            'Word Expansion Packs',
            wordPacks,
            BookOpen,
            'text-amber-400',
            'text-amber-300'
          )}

          {renderSection(
            'subjects',
            'Subject Cutout Packs',
            subjectPacks,
            Shapes,
            'text-emerald-400',
            'text-emerald-300'
          )}

          {renderSection(
            'backgrounds',
            'Background Texture Packs',
            bgPacks,
            ImageIcon,
            'text-sky-400',
            'text-sky-300'
          )}

          {packs.length === 0 && customPacks.length === 0 && !loading && (
            <p className="text-xs text-slate-500 italic text-center py-4">
              No remote or local content packs detected.
            </p>
          )}
        </div>
      </div>

      {/* The Crate Forge Modal */}
      <CrateForgeModal
        isOpen={isForgeOpen}
        onClose={() => setIsForgeOpen(false)}
        onSavePack={handleSaveCustomBundle}
        initialPack={editingPackBundle}
      />
    </div>
  );
};