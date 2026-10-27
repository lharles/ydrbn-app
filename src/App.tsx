/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Disc, ExternalLink, Sliders, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { CustomDropModal } from './components/CustomDropModal';
import { ApparelModal } from './components/ApparelModal';
import { DispatchModal } from './components/DispatchModal';
import { InfoModal } from './components/InfoModal';
import { ShareModal } from './components/ShareModal';
import { HelpModal } from './components/HelpModal';
import { SleeveZoomModal } from './components/SleeveZoomModal';
import { TechnicianModal } from './components/TechnicianModal';
import { AlbumEntry, ToastMessage, CustomDropInput } from './types';
import { TopBar } from './components/TopBar';
import { SubHeaderNav } from './components/SubHeaderNav';
import { ActionButtonsRow } from './components/ActionButtonsRow';
import { VinylSleeve } from './components/VinylSleeve';
import { CustomPhotoControls } from './components/CustomPhotoControls';
import { DailyDropButton } from './components/DailyDropButton';
import { FooterInfo } from './components/FooterInfo';
import { SettingsModal } from './components/SettingsModal';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { Toast } from './components/Toast';
import { loadRecipeAssets } from './services/assetManager';
import {
  loadAlbums,
  saveAlbums,
  enforceArchiveLimit,
  getDevModeUnlocked,
  setDevModeUnlocked,
  getLastDropTimestamp,
  recordDropTimestamp,
  getUseCustomPhotosPref,
  setUseCustomPhotosPref,
  getAutoCheckUpdatesPref,
  restoreCustomPhotoFromIdb,
} from './services/storageService';
import {
  generateDailyDrop,
  forgeCustomDrop,
  hydrateContentPools,
} from './services/proceduralGenerator';
import { gagCanvasEngine } from './services/gagCanvasEngine';
import { audioSynthesizer, TurntableRpm } from './services/audioSynthesizer';
import { getAvailablePacks, checkPackStatus } from './services/contentPackService';
import { getPreferences, applyColorMode } from './services/preferencesService';

function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function triggerConfettiBurst() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f59e0b', '#dc2626', '#10b981', '#38bdf8', '#f3ede4'];
  const particles = Array.from({ length: 90 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 18,
    vy: (Math.random() - 0.7) * 16,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    rot: Math.random() * 360,
    vRot: (Math.random() - 0.5) * 12,
  }));

  let frame = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rot += p.vRot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    frame++;
    if (frame < 130) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

export default function App() {
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [turntableRpm, setTurntableRpm] = useState<TurntableRpm>(33);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null);
  const [isPlayingAtj, setIsPlayingAtj] = useState(false);
  const [hasUnlockedAtj, setHasUnlockedAtj] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('ydrbn_atj_played') === 'true';
  });

  const [useCustomPhotos, setUseCustomPhotos] = useState(false);
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Forging Vinyl Artwork...');

  const [isDevMode, setIsDevMode] = useState<boolean>(() => getDevModeUnlocked());
  const [lastDropTime, setLastDropTime] = useState<number>(() => getLastDropTimestamp());
  const [cooldownMs, setCooldownMs] = useState<number>(() => {
    const dropTime = getLastDropTimestamp();
    const dev = getDevModeUnlocked();
    if (dev || dropTime === 0) return 0;
    const remaining = 24 * 60 * 60 * 1000 - (Date.now() - dropTime);
    return remaining > 0 ? remaining : 0;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isCustomDropOpen, setIsCustomDropOpen] = useState(false);
  const [isTechnicianOpen, setIsTechnicianOpen] = useState(false);

  const [isStandalone, setIsStandalone] = useState<boolean>(() => getIsStandalone());

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('ydrbn_has_seen_help') === 'true';
  });

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [hasSeenInfo, setHasSeenInfo] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('ydrbn_has_seen_info') === 'true';
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isApparelOpen, setIsApparelOpen] = useState(false);
  const [isAtjVideoOpen, setIsAtjVideoOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefs = getPreferences();
    applyColorMode(prefs.colorMode || 'default');

    const seenHelp = localStorage.getItem('ydrbn_has_seen_help') === 'true';
    const seenInfo = localStorage.getItem('ydrbn_has_seen_info') === 'true';

    if (!seenHelp) {
      setIsHelpOpen(true);
    } else if (!seenInfo) {
      setIsInfoOpen(true);
    }

    const handleInstalled = () => setIsStandalone(true);
    window.addEventListener('pwa-installed', handleInstalled);
    return () => window.removeEventListener('pwa-installed', handleInstalled);
  }, []);

  useEffect(() => {
    const handleFanfare = () => {
      triggerConfettiBurst();
      setHasUnlockedAtj(true);
      setIsPlayingAtj(true);
      addToast('success', '✦ ATJ ARCHIVE UNLOCKED: FREQUENCY CAPTURED ✦');
    };

    window.addEventListener('ydrbn-atj-fanfare', handleFanfare);
    return () => window.removeEventListener('ydrbn-atj-fanfare', handleFanfare);
  }, []);

  const handleOpenHelp = () => {
    setIsHelpOpen(true);
    if (!hasSeenHelp) {
      localStorage.setItem('ydrbn_has_seen_help', 'true');
      setHasSeenHelp(true);
    }
  };

  const handleCloseHelp = () => {
    setIsHelpOpen(false);
    if (!hasSeenHelp) {
      localStorage.setItem('ydrbn_has_seen_help', 'true');
      setHasSeenHelp(true);
    }
    if (!hasSeenInfo && localStorage.getItem('ydrbn_has_seen_info') !== 'true') {
      setIsInfoOpen(true);
    }
  };

  const handleOpenInfo = () => {
    setIsInfoOpen(true);
    if (!hasSeenInfo) {
      localStorage.setItem('ydrbn_has_seen_info', 'true');
      setHasSeenInfo(true);
    }
  };

  const handleCloseInfo = () => {
    setIsInfoOpen(false);
    if (!hasSeenInfo) {
      localStorage.setItem('ydrbn_has_seen_info', 'true');
      setHasSeenInfo(true);
    }
  };

  const addToast = (type: 'error' | 'success' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    if (type !== 'error') {
      setTimeout(() => dismissToast(id), 4000);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    try {
      hydrateContentPools();

      if (getAutoCheckUpdatesPref() && typeof navigator !== 'undefined' && navigator.onLine) {
        getAvailablePacks()
          .then(async (available) => {
            let updateCount = 0;
            for (const pack of available) {
              const status = await checkPackStatus(pack.id, pack.manifestUrl);
              if (status.isInstalled && status.hasUpdate) {
                updateCount++;
              }
            }
            if (updateCount > 0) {
              addToast(
                'info',
                `Cargo Bay: ${updateCount} content pack update${updateCount > 1 ? 's' : ''} available!`
              );
            }
          })
          .catch(() => {});
      }

      const loaded = loadAlbums();
      setAlbums(loaded);
      if (loaded.length > 0) {
        setCurrentIndex(loaded.length - 1);
      }

      setIsDevMode(getDevModeUnlocked());
      setLastDropTime(getLastDropTimestamp());
      setUseCustomPhotos(getUseCustomPhotosPref());

      const warmAssets = async () => {
        const promises = loaded.map(async (a) => {
          if (a.recipe?.customPhotoUrl) {
            if (a.coverImageUrl) {
              saveAlbums(loaded);
              return a;
            }
            const restored = await restoreCustomPhotoFromIdb(a.id);
            if (restored) {
              return { ...a, coverImageUrl: restored };
            }
          }
          if (a.recipe && !a.recipe.customPhotoUrl) {
            await loadRecipeAssets(a.recipe.backdrop || '', a.recipe.subject || '').catch(() => {});
            return { ...a, coverImageUrl: gagCanvasEngine.renderCover(a.recipe) };
          }
          return a;
        });

        const warmedAlbums = await Promise.all(promises);
        setAlbums(warmedAlbums);
      };

      warmAssets();
    } catch (err) {
      console.error('Storage load error:', err);
    }
  }, []);

  useEffect(() => {
    const calculateRemaining = () => {
      if (isDevMode || lastDropTime === 0) return 0;
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const timePassed = Date.now() - lastDropTime;
      const timeRemaining = ONE_DAY_MS - timePassed;
      return timeRemaining > 0 ? timeRemaining : 0;
    };

    setCooldownMs(calculateRemaining());

    const interval = setInterval(() => {
      setCooldownMs(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastDropTime, isDevMode]);

  const currentAlbum = albums[currentIndex] || null;

  const stopPlaybackState = () => {
    audioSynthesizer.stopAll();
    setIsPlayingAudio(false);
    setActiveTrackIndex(null);
    setIsPlayingAtj(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      stopPlaybackState();
    }
  };

  const handleNext = () => {
    if (currentIndex < albums.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      stopPlaybackState();
    }
  };

  const handleGoToToday = () => {
    if (albums.length > 0) {
      setCurrentIndex(albums.length - 1);
      setIsFlipped(false);
      stopPlaybackState();
    }
  };

  const isTodayActive = albums.length > 0 && currentIndex === albums.length - 1;

  const handleToggleFavorite = (albumId?: string) => {
    const targetId = albumId || currentAlbum?.id;
    if (!targetId) return;

    setAlbums((prev) => {
      const updated = prev.map((a) =>
        a.id === targetId ? { ...a, isFavorite: !a.isFavorite } : a
      );
      saveAlbums(updated);
      return updated;
    });
  };

  const handleDeleteAlbum = (id: string) => {
    setAlbums((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveAlbums(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
    addToast('info', 'Record removed from vault.');
  };

  const handleShare = () => {
    if (!currentAlbum) {
      addToast('info', 'Press ⚡ Daily Drop to generate a record first!');
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleStopAtj = () => {
    stopPlaybackState();
  };

  const handleCycleRpm = () => {
    const nextRpm: TurntableRpm = turntableRpm === 33 ? 45 : turntableRpm === 45 ? 16 : 33;
    setTurntableRpm(nextRpm);
    audioSynthesizer.setRpm(nextRpm);
  };

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      stopPlaybackState();
      return;
    }

    if (!currentAlbum) {
      addToast('info', 'Press ⚡ Daily Drop to generate a record first!');
      return;
    }

    try {
      setIsPlayingAudio(true);
      setActiveTrackIndex(null);
      await audioSynthesizer.playAlbumClip(
        currentAlbum.id,
        currentAlbum.albumTitle,
        currentAlbum.year,
        currentAlbum.audioPreset
      );
    } catch (err: any) {
      addToast('error', `Audio error: ${err.message || err}`);
    } finally {
      setIsPlayingAudio(false);
      setActiveTrackIndex(null);
      setIsPlayingAtj(false);
    }
  };

  const handlePlaySpecificTrack = async (trackTitle: string, index: number) => {
    if (!currentAlbum) return;

    if (isPlayingAudio && activeTrackIndex === index) {
      stopPlaybackState();
      return;
    }

    try {
      setIsPlayingAudio(true);
      setActiveTrackIndex(index);
      await audioSynthesizer.playAlbumClip(
        currentAlbum.id,
        `${currentAlbum.albumTitle} - ${trackTitle}`,
        currentAlbum.year,
        currentAlbum.audioPreset
      );
    } catch (err: any) {
      addToast('error', `Audio error: ${err.message || err}`);
    } finally {
      setIsPlayingAudio(false);
      setActiveTrackIndex(null);
      setIsPlayingAtj(false);
    }
  };

  const handleToggleUseCustomPhotos = (enabled: boolean) => {
    setUseCustomPhotos(enabled);
    setUseCustomPhotosPref(enabled);
  };

  const handleSelectPhoto = (base64: string | null) => {
    setSelectedPhotoBase64(base64);
    if (base64) {
      setIsCustomizeOpen(true);
      addToast('success', 'Photo loaded. Choose [Modify Your Photos] or [Use Your Photos (as is)].');
    }
  };

  const handleUsePhotoAsIs = () => {
    if (!selectedPhotoBase64) return;
    if (!currentAlbum) {
      addToast('info', 'Select or generate a band album first!');
      return;
    }

    const updatedAlbum: AlbumEntry = {
      ...currentAlbum,
      coverImageUrl: selectedPhotoBase64,
      recipe: currentAlbum.recipe
        ? { ...currentAlbum.recipe, customPhotoUrl: 'custom' }
        : undefined,
    };

    setAlbums((prev) => {
      const updated = prev.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a));
      saveAlbums(updated);
      return updated;
    });

    addToast('success', 'Custom photo applied to current vinyl sleeve.');
  };

  const handleModifyPhoto = async () => {
    if (!selectedPhotoBase64) return;
    if (!currentAlbum) {
      addToast('info', 'Select or generate a band album first!');
      return;
    }

    setIsGenerating(true);
    setLoadingStepText('Processing Custom Photo...');
    try {
      const { url, description } = await gagCanvasEngine.processCustomPhoto(selectedPhotoBase64);

      const updatedAlbum: AlbumEntry = {
        ...currentAlbum,
        coverImageUrl: url,
        recipe: currentAlbum.recipe
          ? { ...currentAlbum.recipe, customPhotoUrl: 'custom' }
          : undefined,
      };

      setAlbums((prev) => {
        const updated = prev.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a));
        saveAlbums(updated);
        return updated;
      });

      addToast('success', description);
    } catch (err: any) {
      const errStr = err?.message || String(err);
      addToast('error', errStr);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDailyDrop = async () => {
    if (isGenerating) return;

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const realLastDrop = getLastDropTimestamp();
    const timePassed = Date.now() - realLastDrop;

    if (!isDevMode && realLastDrop !== 0 && timePassed < ONE_DAY_MS) {
      addToast('error', 'You must wait 24 hours between drops!');
      return;
    }

    const appliedPhoto = selectedPhotoBase64;
    const applyCustom = useCustomPhotos;

    handleToggleUseCustomPhotos(false);
    setSelectedPhotoBase64(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    setIsGenerating(true);
    setLoadingStepText('Pressing Vinyl...');

    try {
      const generatedRecord = await generateDailyDrop();
      const newEntry = { ...generatedRecord };

      if (newEntry.recipe) {
        await loadRecipeAssets(newEntry.recipe.backdrop, newEntry.recipe.subject);
        newEntry.coverImageUrl = gagCanvasEngine.renderCover(newEntry.recipe);
      }

      if (applyCustom && appliedPhoto) {
        try {
          const { url } = await gagCanvasEngine.processCustomPhoto(appliedPhoto);
          newEntry.coverImageUrl = url;
          if (newEntry.recipe) newEntry.recipe.customPhotoUrl = 'custom';
        } catch {}
      }

      setAlbums((prev) => {
        const capped = enforceArchiveLimit([...prev, newEntry]);
        saveAlbums(capped);
        setCurrentIndex(capped.length - 1);
        return capped;
      });

      const now = Date.now();
      recordDropTimestamp(now);
      setLastDropTime(now);

      setIsGenerating(false);
      addToast('success', `Pressed: ${newEntry.bandName} — "${newEntry.albumTitle}"`);
    } catch (err: any) {
      const errStr = err?.message || String(err);
      addToast('error', errStr);
      setIsGenerating(false);
    }
  };

  const handleForgeCustomDrop = async (input: CustomDropInput) => {
    setIsGenerating(true);
    setLoadingStepText('Pressing Custom Drop...');

    try {
      const forgedRecord = await forgeCustomDrop(input);
      if (input.coverImageBase64 && forgedRecord.recipe) {
        forgedRecord.recipe.customPhotoUrl = 'custom';
      }

      setAlbums((prev) => {
        const capped = enforceArchiveLimit([...prev, forgedRecord]);
        saveAlbums(capped);
        setCurrentIndex(capped.length - 1);
        return capped;
      });

      setIsFlipped(false);
      setIsGenerating(false);
      addToast(
        'success',
        `✦ Custom Drop Minted: ${forgedRecord.bandName} — "${forgedRecord.albumTitle}"`
      );
    } catch (err: any) {
      addToast('error', `Failed to create custom drop: ${err?.message || err}`);
      setIsGenerating(false);
    }
  };

  const handleToggleDevMode = (unlocked: boolean) => {
    setDevModeUnlocked(unlocked);
    setIsDevMode(unlocked);
    if (unlocked) {
      addToast('success', '✓ Dev Mode Unlocked: 24h countdown bypassed for instant drops!');
    } else {
      addToast('info', 'Dev Mode locked. Standard 24h cooldown restored.');
    }
  };

  const handleTopBarInstall = () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then(({ outcome }: any) => {
        if (outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setIsStandalone(true);
          addToast('success', 'Installation accepted.');
        }
      });
    } else {
      setIsSettingsOpen(true);
    }
  };

  const activeTrackLabel =
    activeTrackIndex !== null && currentAlbum?.tracks?.[activeTrackIndex]
      ? `TRK ${String(activeTrackIndex + 1).padStart(2, '0')}: ${currentAlbum.tracks[activeTrackIndex]}`
      : null;

  return (
    <div className="app-viewport fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#12100e] text-slate-100 select-none font-sans">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* 1970s Stereo Receiver Chassis Frame */}
      <div className="app-chassis w-full max-w-md mx-auto min-h-full flex flex-col justify-between py-1.5 pb-3 sm:pb-5 sm:my-2 sm:rounded-2xl sm:border-x-8 sm:border-y-2 sm:border-x-[#35261b] sm:border-y-amber-900/40 sm:bg-[#161310] sm:shadow-[0_24px_60px_rgba(0,0,0,0.95)] relative">
        {/* Top Header Group */}
        <div className="w-full shrink-0 flex flex-col">
          <TopBar
            onOpenArchive={() => setIsArchiveOpen(true)}
            isToday={isTodayActive}
            onGoToToday={handleGoToToday}
            isFavorite={currentAlbum?.isFavorite || false}
            onToggleFavorite={() => handleToggleFavorite()}
            onOpenApparel={() => setIsApparelOpen(true)}
            onShare={handleShare}
            hasEntries={albums.length > 0}
            hasAtjBadge={hasUnlockedAtj}
            onOpenAtjVideo={() => setIsAtjVideoOpen(true)}
            isStandalone={isStandalone}
            onInstall={handleTopBarInstall}
          />
          <SubHeaderNav
            entries={albums}
            currentIndex={currentIndex}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>

        {/* Center Interactive Vinyl Deck */}
        <div className="w-full my-auto flex flex-col items-center px-3 py-1 gap-1.5 sm:gap-2">
          <ActionButtonsRow
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped(!isFlipped)}
            isPlayingAudio={isPlayingAudio}
            onPlayAudio={handleToggleAudio}
            rpm={turntableRpm}
            onCycleRpm={handleCycleRpm}
            activeTrackLabel={activeTrackLabel}
            disabled={isGenerating || !currentAlbum}
          />

          <div className="w-full flex items-center justify-center py-1">
            <VinylSleeve
              album={currentAlbum}
              isFlipped={isFlipped}
              isLoading={isGenerating}
              isPlayingAudio={isPlayingAudio}
              rpm={turntableRpm}
              activeTrackIndex={activeTrackIndex}
              onPlayTrack={handlePlaySpecificTrack}
              loadingStepText={loadingStepText}
              onToggleFlip={() => setIsFlipped(!isFlipped)}
              onOpenZoom={() => setIsZoomOpen(true)}
            />
          </div>

          {/* Unified "CUSTOMIZE A DROP" Hardware Drawer */}
          <div className="w-full px-3 pt-1">
            <div className="well-inset rounded-xl p-1.5 space-y-2">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                className={`btn-chassis w-full py-1.5 px-3 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-between border transition-all cursor-pointer ${
                  isCustomizeOpen || useCustomPhotos || selectedPhotoBase64
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-amber-200'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Customize A Drop</span>
                  {(useCustomPhotos || selectedPhotoBase64) && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-200 border border-amber-400/40">
                      PHOTO READY
                    </span>
                  )}
                </span>
                {isCustomizeOpen ? (
                  <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isCustomizeOpen && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                  <div className="rounded-lg bg-slate-900/50 border border-slate-800/90 p-1.5 space-y-1">
                    <div className="flex items-center gap-1.5 px-2 pt-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      <Camera className="w-3 h-3 shrink-0" />
                      <span>1. Custom Photo Cover</span>
                    </div>
                    <CustomPhotoControls
                      useCustomPhotos={useCustomPhotos}
                      onToggleUseCustomPhotos={handleToggleUseCustomPhotos}
                      selectedPhoto={selectedPhotoBase64}
                      onSelectPhoto={handleSelectPhoto}
                      onModifyPhoto={handleModifyPhoto}
                      onUsePhotoAsIs={handleUsePhotoAsIs}
                      isLoading={isGenerating}
                    />
                  </div>

                  <div className="rounded-lg bg-slate-900/50 border border-slate-800/90 p-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Disc className="w-3 h-3 shrink-0" />
                        <span>2. Custom Drop</span>
                      </span>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Enter custom band name, title, tracks, lore, or photo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomDropOpen(true)}
                      className="btn-chassis py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Open Custom Drop</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full pt-0.5">
            <DailyDropButton
              onDailyDrop={handleDailyDrop}
              isLoading={isGenerating}
              cooldownMs={cooldownMs}
              isDevMode={isDevMode}
            />
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="w-full shrink-0 flex flex-col pt-1">
          <FooterInfo
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHelp={handleOpenHelp}
            onOpenInfo={handleOpenInfo}
            hasSeenHelp={hasSeenHelp}
            hasSeenInfo={hasSeenInfo}
            isDevMode={isDevMode}
          />
        </div>
      </div>

      {/* Modals Stack */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customApiKey=""
        onSaveApiKey={() => {}}
        isDevMode={isDevMode}
        onToggleDevMode={handleToggleDevMode}
        hasServerKey={false}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenTechnician={() => setIsTechnicianOpen(true)}
        onNotify={addToast}
      />

      <TechnicianModal
        isOpen={isTechnicianOpen}
        onClose={() => setIsTechnicianOpen(false)}
        isStandalone={isStandalone}
        onTriggerInstall={handleTopBarInstall}
        onResetCooldown={() => {
          recordDropTimestamp(0);
          setLastDropTime(0);
          setCooldownMs(0);
        }}
        onNotify={addToast}
      />

      <CustomDropModal
        isOpen={isCustomDropOpen}
        onClose={() => setIsCustomDropOpen(false)}
        onForge={handleForgeCustomDrop}
        isLoading={isGenerating}
      />

      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} />

      <InfoModal isOpen={isInfoOpen} onClose={handleCloseInfo} />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        album={currentAlbum}
        onNotify={addToast}
      />

      <SleeveZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        album={currentAlbum}
        initialFlipped={isFlipped}
      />

      <DispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onNotify={addToast}
      />

      <ApparelModal
        isOpen={isApparelOpen}
        onClose={() => setIsApparelOpen(false)}
        album={currentAlbum}
        onNotify={addToast}
      />

      <ArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        albums={albums}
        currentId={currentAlbum?.id}
        onSelectAlbum={(alb) => {
          const idx = albums.findIndex((a) => a.id === alb.id);
          if (idx !== -1) {
            setCurrentIndex(idx);
            setIsFlipped(false);
            stopPlaybackState();
          }
        }}
        onToggleFavorite={handleToggleFavorite}
        onDeleteAlbum={handleDeleteAlbum}
      />

      {isAtjVideoOpen && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black animate-in fade-in select-none">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-black/80 border-b border-emerald-900/40 shrink-0 z-10">
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
              Archival Vault // ATJ-01
            </span>
            <button
              type="button"
              onClick={() => setIsAtjVideoOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-base font-mono leading-none"
              aria-label="Close video"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
            <video
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/video/atj.mp4`}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {isPlayingAtj && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-[#161310] border-2 border-rose-600/90 rounded-2xl p-5 shadow-[0_0_40px_rgba(225,29,72,0.4)] flex flex-col items-center text-center space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>&quot;Adjacent To Jim&quot; Transmission Active</span>
              </div>
              <h3 className="font-mono font-black text-lg text-[#f3ede4] tracking-wider uppercase mt-1">
                ATJ.MP3 IS PLAYING
              </h3>
              <p className="text-[11px] text-amber-300/80 font-mono leading-tight">
                Enjoy this limited time performance of the &quot;Adjacent To Jim&quot; theme song.
                This song will only be available as a clip for as long as the album drop
                that triggered it persists in your archive.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStopAtj}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-b from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 active:scale-95 text-white font-mono font-black tracking-wider uppercase border-2 border-rose-400/60 shadow-xl shadow-rose-950 transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <div className="flex items-center gap-2 text-base group-hover:scale-105 transition-transform">
                <span className="w-3.5 h-3.5 bg-white rounded-sm inline-block" />
                <span>STOP PLAYBACK</span>
              </div>
              <span className="text-[10px] font-normal normal-case text-rose-200/90 tracking-normal">
                (Caution: &quot;Adjacent To Jim&quot; will only play as
                long as the current drop is in your archive!)
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}