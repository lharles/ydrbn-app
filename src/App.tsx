/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Disc,
  ExternalLink,
  Sliders,
  ChevronDown,
  ChevronUp,
  Camera,
  RefreshCw,
  X,
} from 'lucide-react';
import { CustomDropModal } from './components/CustomDropModal';
import { ApparelModal } from './components/ApparelModal';
import { DispatchModal } from './components/DispatchModal';
import { ShareModal } from './components/ShareModal';
import { HelpModal } from './components/HelpModal';
import { InstallModal } from './components/InstallModal';
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
  getAutoCheckUpdatesPref,
  restoreCustomPhotoFromIdb,
  performAppCacheRefresh,
} from './services/storageService';
import {
  generateDailyDrop,
  forgeCustomDrop,
  hydrateContentPools,
  resolveConditionGrade,
  decodePressingDna,
  translateAlgorithmicAlbum,
} from './services/proceduralGenerator';
import { gagCanvasEngine } from './services/gagCanvasEngine';
import { audioSynthesizer, TurntableRpm } from './services/audioSynthesizer';
import { getAvailablePacks, checkPackStatus } from './services/contentPackService';
import { checkForAppUpdate } from './services/updateService';
import {
  getPreferences,
  applyColorMode,
  VipEdition,
  setVipEditionPref,
  checkUrlEditionUnlock,
  LocalePreference,
  setLanguagePref,
} from './services/preferencesService';
import { getActiveLocalePack, LOCALE_REGISTRY, PRESSED_PREFIXES, resolveActiveLocale, SupportedLocale } from './services/i18nService';
import { initDomLocalizationObserver, applyDomLocalization } from './services/i18nDomTranslator';
import { localizeCanineRevolutionEntry } from './data/starterCrate';

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
  const [isCollegeRadioActive, setIsCollegeRadioActive] = useState(false);
  const [isPlayingAtj, setIsPlayingAtj] = useState(false);
  const [hasUnlockedAtj, setHasUnlockedAtj] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('ydrbn_atj_played') === 'true';
  });

  const [vipEdition, setVipEdition] = useState<VipEdition>(() => {
    return getPreferences().vipEdition || 'none';
  });
  const [languagePref, setLanguagePrefState] = useState<LocalePreference>(() => {
    return getPreferences().language || 'auto';
  });
  const localePack = getActiveLocalePack(languagePref);

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
  const [expandMaintenanceOnOpen, setExpandMaintenanceOnOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isApparelOpen, setIsApparelOpen] = useState(false);
  const [isAtjVideoOpen, setIsAtjVideoOpen] = useState(false);

  // Option 1 Update Banner State
  const [isAppUpdateAvailable, setIsAppUpdateAvailable] = useState(false);
  const [isUpdateBannerDismissed, setIsUpdateBannerDismissed] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const addToast = useCallback(
    (type: 'error' | 'success' | 'info', text: string, slotKey?: string) => {
      const id = slotKey
        ? `toast-${slotKey}-${Date.now()}-${Math.random()}`
        : `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => {
        const base = slotKey ? prev.filter((t) => !t.id.startsWith(`toast-${slotKey}-`)) : prev;
        return [...base, { id, type, text }];
      });
      if (type !== 'error') {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Combined App + Cargo Bay Pack Update Check (strictly online-only & user-controlled)
   */
  const runCombinedUpdateCheck = useCallback(
    async (isManual: boolean = false) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (isManual) {
          addToast('info', 'Offline — internet connection required to check for updates.');
        }
        return;
      }

      setIsCheckingUpdates(true);
      try {
        const [appResult, available] = await Promise.all([
          checkForAppUpdate(),
          getAvailablePacks().catch(() => []),
        ]);

        if (appResult.hasAppUpdate) {
          setIsAppUpdateAvailable(true);
          setIsUpdateBannerDismissed(false);
        }

        let updateCount = 0;
        let newPackCount = 0;
        const knownRaw = localStorage.getItem('ydrbn_known_pack_ids');
        const knownIds: string[] = knownRaw ? JSON.parse(knownRaw) : [];

        for (const pack of available) {
          const status = await checkPackStatus(pack.id, pack.manifestUrl);
          if (status.isInstalled && status.hasUpdate) {
            updateCount++;
          } else if (!status.isInstalled && !knownIds.includes(pack.id)) {
            newPackCount++;
          }
        }

        if (available.length > 0) {
          localStorage.setItem(
            'ydrbn_known_pack_ids',
            JSON.stringify(available.map((p: any) => p.id))
          );
        }

        if (updateCount > 0 || newPackCount > 0) {
          const parts: string[] = [];
          if (newPackCount > 0) {
            parts.push(`${newPackCount} new pack${newPackCount > 1 ? 's' : ''}`);
          }
          if (updateCount > 0) {
            parts.push(`${updateCount} pack update${updateCount > 1 ? 's' : ''}`);
          }
          addToast('info', `Cargo Bay: ${parts.join(' & ')} available!`);
        } else if (isManual) {
          if (appResult.hasAppUpdate) {
            addToast('info', '⚡ New app update detected! Tap the top banner or Settings button to reload.');
          } else {
            addToast('success', 'App and installed Cargo Bay packs are up to date.');
          }
        }
      } catch {
        if (isManual) {
          addToast('error', 'Could not reach update manifest.');
        }
      } finally {
        setIsCheckingUpdates(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefs = getPreferences();
    applyColorMode(prefs.colorMode || 'default');

    // Check VIP Edition URL (?edition=...)
    const { unlocked, label } = checkUrlEditionUnlock();
    if (unlocked !== null) {
      setVipEdition(unlocked);
      if (unlocked !== 'none') {
        triggerConfettiBurst();
        addToast('success', `✦ VIP DECK UNLOCKED: ${label} ✦`);
      } else {
        addToast('info', 'Restored standard factory deck finish.');
      }
    }

    // Single-modal onboarding (Help & Data Sheet combined)
    const seenHelp = localStorage.getItem('ydrbn_has_seen_help') === 'true';
    const hasDnaUrl = new URLSearchParams(window.location.search).has('dna');
    if (!seenHelp && !hasDnaUrl) {
      setIsHelpOpen(true);
    }

    const handleInstalled = () => setIsStandalone(true);
    window.addEventListener('pwa-installed', handleInstalled);
    return () => window.removeEventListener('pwa-installed', handleInstalled);
  }, [addToast]);

  //Foreground wake update check (strictly if opted-in AND online)
  useEffect(() => {
    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        getAutoCheckUpdatesPref() &&
        navigator.onLine
      ) {
        checkForAppUpdate().then((res) => {
          if (res.hasAppUpdate) {
            setIsAppUpdateAvailable(true);
          }
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
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
  }, [addToast]);

  useEffect(() => {
    initDomLocalizationObserver();
    applyDomLocalization();
  }, [languagePref, isArchiveOpen, isShareModalOpen, isApparelOpen, isCustomDropOpen, isSettingsOpen, isHelpOpen, isInstallModalOpen, isZoomOpen, isCustomizeOpen, isFlipped]);

  const handleChangeLanguage = (nextLang: LocalePreference) => {
    setLanguagePref(nextLang);
    setLanguagePrefState(nextLang);
    setTimeout(() => applyDomLocalization(), 0);
    const pack = getActiveLocalePack(nextLang);
    setAlbums((prev) => {
      const updated = prev.map((a) =>
        a.id === 'starter-14-canine-revolution' ? localizeCanineRevolutionEntry(a, nextLang) : a
      );
      saveAlbums(updated);
      return updated;
    });
    addToast('info', `${pack.ui.languageLabel}: ${pack.nativeName}`);
  };

  const handleSelectVipEdition = (edition: VipEdition) => {
    setVipEditionPref(edition);
    setVipEdition(edition);
    if (edition !== 'none') {
      triggerConfettiBurst();
      addToast('success', `✦ VIP Edition Active: ${edition.toUpperCase()} ✦`);
    } else {
      addToast('info', 'Standard factory deck restored.');
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isAtjVideoOpen) {
        setIsAtjVideoOpen(false);
      } else if (isTechnicianOpen) {
        setIsTechnicianOpen(false);
      } else if (isDispatchOpen) {
        setIsDispatchOpen(false);
      } else if (isInstallModalOpen) {
        setIsInstallModalOpen(false);
      } else if (isCustomDropOpen) {
        setIsCustomDropOpen(false);
      } else if (isShareModalOpen) {
        setIsShareModalOpen(false);
      } else if (isApparelOpen) {
        setIsApparelOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
        setExpandMaintenanceOnOpen(false);
      } else if (isArchiveOpen) {
        setIsArchiveOpen(false);
      } else if (isHelpOpen) {
        handleCloseHelp();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isAtjVideoOpen,
    isTechnicianOpen,
    isDispatchOpen,
    isInstallModalOpen,
    isCustomDropOpen,
    isShareModalOpen,
    isApparelOpen,
    isSettingsOpen,
    isArchiveOpen,
    isHelpOpen,
    hasSeenHelp,
  ]);

  const handleOpenHelp = () => {
    stopPlaybackState();
    setIsHelpOpen(true);
  };

  const handleCloseHelp = () => {
    setIsHelpOpen(false);
    if (!hasSeenHelp) {
      localStorage.setItem('ydrbn_has_seen_help', 'true');
      setHasSeenHelp(true);
    }
  };

  useEffect(() => {
    try {
      hydrateContentPools();

      if (getAutoCheckUpdatesPref() && typeof navigator !== 'undefined' && navigator.onLine) {
        runCombinedUpdateCheck(false);
      }

      // Extract optional ?dna=... share URL parameter before warming assets
      let sharedDnaParam: string | null = null;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        sharedDnaParam = params.get('dna');
        if (sharedDnaParam) {
          params.delete('dna');
          const cleanQuery = params.toString();
          const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', cleanUrl);
        }
      }

      const loaded = loadAlbums().map((a) =>
        a.id === 'starter-14-canine-revolution' ? localizeCanineRevolutionEntry(a) : a
      );
      setAlbums(loaded);
      if (loaded.length > 0) {
        setCurrentIndex(loaded.length - 1);
      }

      setIsDevMode(getDevModeUnlocked());
      setLastDropTime(getLastDropTimestamp());

      const warmAssets = async () => {
        const hydrateOne = async (a: AlbumEntry): Promise<AlbumEntry> => {
          if (a.recipe?.customPhotoUrl) {
            if (a.coverImageUrl) return a;
            const restored = await restoreCustomPhotoFromIdb(a.id);
            if (restored) return { ...a, coverImageUrl: restored };
          }
          if (a.recipe && !a.recipe.customPhotoUrl) {
            await loadRecipeAssets(a.recipe.backdrop || '', a.recipe.subject || '').catch(() => {});
            return { ...a, coverImageUrl: gagCanvasEngine.renderCover(a.recipe) };
          }
          return a;
        };

        // 1. Hydrate the active turntable album first so the deck is ready immediately
        const activeIdx = loaded.length - 1;
        const working = [...loaded];
        if (activeIdx >= 0) {
          working[activeIdx] = await hydrateOne(working[activeIdx]);
          setAlbums([...working]);
        }

        // 2. Hydrate older archive thumbnails in non-blocking idle slices
        for (let i = activeIdx - 1; i >= 0; i--) {
          await new Promise((r) => setTimeout(r, 12));
          working[i] = await hydrateOne(working[i]);
        }

        let finalAlbums = working;

        // If user opened a ?dna=... share link, decode and mount onto turntable
        if (sharedDnaParam) {
          try {
            const cloned = await decodePressingDna(sharedDnaParam);
            finalAlbums = enforceArchiveLimit([...finalAlbums, cloned]);
            saveAlbums(finalAlbums);
            setAlbums(finalAlbums);
            setCurrentIndex(finalAlbums.length - 1);
            setIsFlipped(false);
            triggerConfettiBurst();
            addToast(
              'success',
              `🧬 Cloned Shared Pressing: ${cloned.bandName} — "${cloned.albumTitle}"`
            );
            return;
          } catch (err: any) {
            addToast('error', `Invalid shared DNA link: ${err?.message || err}`);
          }
        }

        setAlbums(finalAlbums);
      };

      warmAssets();
    } catch (err) {
      console.error('Storage load error:', err);
    }
  }, [addToast, runCombinedUpdateCheck]);

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

  const stopPlaybackState = (keepRadio = false) => {
    audioSynthesizer.stopAll();
    setIsPlayingAudio(false);
    setActiveTrackIndex(null);
    setIsPlayingAtj(false);
    if (!keepRadio) {
      setIsCollegeRadioActive(false);
    }
  };

  // College Radio Hands-Free Sequential Playback Loop
  useEffect(() => {
    if (!isCollegeRadioActive || albums.length === 0 || isGenerating) return;

    let cancelled = false;
    let nextTimer: NodeJS.Timeout | null = null;

    const spinCurrentAndAdvance = async () => {
      const target = albums[currentIndex];
      if (!target) return;

      const isWarped =
        typeof target.isWarpedAudio === 'boolean'
          ? target.isWarpedAudio
          : resolveConditionGrade(target.id).isWarped;

      setIsPlayingAudio(true);
      setActiveTrackIndex(null);

      const completedNaturally = await audioSynthesizer.playAlbumClip(
        target.id,
        target.albumTitle,
        target.year,
        target.audioPreset,
        isWarped
      );

      if (cancelled || !completedNaturally) {
        setIsPlayingAudio(false);
        return;
      }

      setIsPlayingAudio(false);
      nextTimer = setTimeout(() => {
        if (!cancelled) {
          setIsFlipped(false);
          setCurrentIndex((prev) => (prev + 1) % albums.length);
        }
      }, 1100);
    };

    spinCurrentAndAdvance();

    return () => {
      cancelled = true;
      if (nextTimer) clearTimeout(nextTimer);
    };
  }, [isCollegeRadioActive, currentIndex, albums.length, isGenerating]);

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

  const handleTranslateAlbum = (sourceAlbum: AlbumEntry, targetLocale: SupportedLocale) => {
    if (sourceAlbum.isCustomPressing) return;
    stopPlaybackState();
    const translated = translateAlgorithmicAlbum(sourceAlbum, targetLocale);
    const pack = LOCALE_REGISTRY[targetLocale];

    setAlbums((prev) => {
      const capped = enforceArchiveLimit([...prev, translated]);
      saveAlbums(capped);
      setCurrentIndex(capped.length - 1);
      return capped;
    });
    setIsFlipped(false);
    addToast(
      'success',
      `🌐 Translated (${pack.shortBadge}): ${translated.bandName} — "${translated.albumTitle}"`
    );
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

      const isWarped =
        typeof currentAlbum.isWarpedAudio === 'boolean'
          ? currentAlbum.isWarpedAudio
          : resolveConditionGrade(currentAlbum.id).isWarped;

      await audioSynthesizer.playAlbumClip(
        currentAlbum.id,
        currentAlbum.albumTitle,
        currentAlbum.year,
        currentAlbum.audioPreset,
        isWarped
      );
    } catch (err: any) {
      addToast('error', `Audio error: ${err.message || err}`);
    } finally {
      if (!audioSynthesizer.getPlaybackStatus()) {
        setIsPlayingAudio(false);
        setActiveTrackIndex(null);
        setIsPlayingAtj(false);
      }
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

      const isWarped =
        typeof currentAlbum.isWarpedAudio === 'boolean'
          ? currentAlbum.isWarpedAudio
          : resolveConditionGrade(currentAlbum.id).isWarped;

      const trackPresets: AlbumEntry['audioPreset'][] = [
        'analog-synth',
        'psych-rock',
        'krautrock',
        'post-punk',
        'ambient-drone',
      ];
      const trackPreset = trackPresets[(index + currentAlbum.bandName.length) % trackPresets.length];

      await audioSynthesizer.playAlbumClip(
        `${currentAlbum.id}_trk_${index}`,
        `${currentAlbum.albumTitle} - ${trackTitle} (${index + 1})`,
        currentAlbum.year,
        trackPreset,
        isWarped
      );
    } catch (err: any) {
      addToast('error', `Audio error: ${err.message || err}`);
    } finally {
      if (!audioSynthesizer.getPlaybackStatus()) {
        setIsPlayingAudio(false);
        setActiveTrackIndex(null);
        setIsPlayingAtj(false);
      }
    }
  };

  const handleSelectPhoto = (base64: string | null) => {
    setSelectedPhotoBase64(base64);
    if (base64) {
      setIsCustomizeOpen(true);
      addToast(
        'info',
        'Photo loaded. Click [Darkroom Filter] repeatedly to cycle variations, or [Use Photo (As-Is)].',
        'darkroom'
      );
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
        : { customPhotoUrl: 'custom' },
    };

    setAlbums((prev) => {
      const updated = prev.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a));
      saveAlbums(updated);
      return updated;
    });

    addToast('success', 'Applied original photo (as-is) to current sleeve.', 'darkroom');
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
          : { customPhotoUrl: 'custom' },
      };

      setAlbums((prev) => {
        const updated = prev.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a));
        saveAlbums(updated);
        return updated;
      });

      addToast('success', description, 'darkroom');
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

    stopPlaybackState();
    setIsGenerating(true);
    setLoadingStepText('Pressing Vinyl...');

    try {
      const newEntry = await generateDailyDrop();

      setAlbums((prev) => {
        const capped = enforceArchiveLimit([...prev, newEntry]);
        setCurrentIndex(capped.length - 1);
        setTimeout(() => saveAlbums(capped), 0);
        return capped;
      });

      const now = Date.now();
      recordDropTimestamp(now);
      setLastDropTime(now);
      setIsFlipped(false);
      setSelectedPhotoBase64(null);

      setIsGenerating(false);
      addToast('success', `${PRESSED_PREFIXES[resolveActiveLocale()]}: ${newEntry.bandName} — "${newEntry.albumTitle}"`);
    } catch (err: any) {
      const errStr = err?.message || String(err);
      addToast('error', errStr);
      setIsGenerating(false);
    }
  };

  const handleForgeCustomDrop = async (input: CustomDropInput) => {
    stopPlaybackState();
    setIsGenerating(true);
    setLoadingStepText('Pressing Custom Drop...');

    const harvestedCount =
      (input.harvestedWords?.nouns.length || 0) +
      (input.harvestedWords?.adjectives.length || 0) +
      (input.harvestedWords?.ensembles.length || 0);
    const harvestedImg =
      input.harvestToRotation && input.coverImageBase64 && input.harvestImageMode !== 'none';

    if (input.harvestToRotation && (harvestedCount > 0 || harvestedImg)) {
      addToast(
        'info',
        `Harvested ${harvestedCount} novel word${harvestedCount === 1 ? '' : 's'}${
          harvestedImg ? ` + 1 ${input.harvestImageMode}` : ''
        } into generator rotation!`
      );
    }

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

  const activeTrackLabel =
    activeTrackIndex !== null && currentAlbum?.tracks?.[activeTrackIndex]
      ? `TRK ${String(activeTrackIndex + 1).padStart(2, '0')}: ${currentAlbum.tracks[activeTrackIndex]}`
      : null;

  return (
    <div className="app-viewport fixed inset-0 overflow-y-auto overflow-x-hidden overscroll-y-contain py-1.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-[#12100e] text-slate-100 select-none font-sans flex flex-col items-center justify-start">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* 1970s Stereo Receiver Chassis Frame */}
      <div className="app-chassis shrink-0 w-full max-w-[430px] sm:max-w-[450px] mx-auto my-auto flex flex-col justify-start py-1.5 pb-2.5 sm:pb-3 rounded-2xl border-x-4 sm:border-x-8 border-y-2 border-x-[#35261b] border-y-amber-900/40 bg-[#161310] shadow-[0_24px_60px_rgba(0,0,0,0.95)] relative overflow-hidden">
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
            onOpenAtjVideo={() => { stopPlaybackState(); setIsAtjVideoOpen(true); }}
            isStandalone={isStandalone}
            onInstall={() => setIsInstallModalOpen(true)}
            vipEdition={vipEdition}
            todayLabel={localePack.ui.today}
          />
          <SubHeaderNav
            entries={albums}
            currentIndex={currentIndex}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          {/* Option 1: Polite Firmware / App Update Banner */}
          {isAppUpdateAvailable && !isUpdateBannerDismissed && (
            <div className="w-full px-2.5 py-1.5 bg-amber-500/20 border-b border-amber-500/50 flex items-center justify-between gap-2 animate-in fade-in">
              <button
                type="button"
                onClick={() => performAppCacheRefresh()}
                className="flex-1 flex items-center gap-1.5 text-left text-[10.5px] font-mono font-bold text-amber-200 hover:text-white cursor-pointer min-w-0"
              >
                <RefreshCw className="w-3 h-3 text-amber-400 shrink-0 animate-spin" />
                <span className="truncate">⚡ NEW UPDATE READY — TAP TO RELOAD</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUpdateBannerDismissed(true)}
                aria-label="Dismiss update banner"
                className="p-0.5 rounded text-amber-300/70 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Center Interactive Vinyl Deck */}
        <div className="w-full shrink-0 flex flex-col items-center px-3 py-1 gap-1.5 sm:gap-2">
          <ActionButtonsRow
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped(!isFlipped)}
            isPlayingAudio={isPlayingAudio}
            onPlayAudio={handleToggleAudio}
            rpm={turntableRpm}
            onCycleRpm={handleCycleRpm}
            activeTrackLabel={activeTrackLabel}
            disabled={isGenerating || !currentAlbum}
            flipFrontLabel={localePack.ui.flipToFront}
            flipBackLabel={localePack.ui.flipToBack}
            spinAudioLabel={localePack.ui.spinAudio}
            stopAudioLabel={localePack.ui.stopAudio}
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
              vipEdition={vipEdition}
              onSwipePrev={handlePrev}
              onSwipeNext={handleNext}
            />
          </div>

          {/* Split "CUSTOMIZE A DROP" Hardware Drawer */}
          <div className="w-full px-3 pt-1">
            <div className="well-inset rounded-xl p-1.5 space-y-2">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                className={`btn-chassis w-full py-1.5 px-3 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-between border transition-all cursor-pointer ${
                  isCustomizeOpen || selectedPhotoBase64
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-amber-200'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{localePack.ui.customizeDrop}</span>
                  {selectedPhotoBase64 && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-200 border border-amber-400/40">
                      PHOTO STAGED
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
                <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  {/* Section 1: Retouch Current Sleeve Only */}
                  <div className="rounded-lg bg-slate-900/50 border border-slate-800/90 p-1.5 space-y-1">
                    <div className="flex items-center justify-between px-2 pt-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Camera className="w-3 h-3 shrink-0" />
                        <span>{localePack.ui.swapCoverArt}</span>
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase">
                        Active Record
                      </span>
                    </div>
                    <CustomPhotoControls
                      selectedPhoto={selectedPhotoBase64}
                      onSelectPhoto={handleSelectPhoto}
                      onModifyPhoto={handleModifyPhoto}
                      onUsePhotoAsIs={handleUsePhotoAsIs}
                      isLoading={isGenerating}
                    />
                  </div>

                  {/* Section 2: Mint Brand-New Custom Pressing */}
                  <div className="rounded-lg bg-slate-900/50 border border-slate-800/90 p-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Disc className="w-3 h-3 shrink-0" />
                        <span>{localePack.ui.createNewCustomDrop}</span>
                      </span>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {localePack.ui.customDropDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomDropOpen(true)}
                      className="btn-chassis py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>{localePack.ui.newDropBtn}</span>
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
              dailyDropLabel={localePack.ui.dailyDrop}
              dailyDropInLabel={localePack.ui.dailyDropIn}
              pressingLabel={localePack.ui.pressingVinyl}
              devUnlockedLabel={localePack.ui.devUnlocked}
            />
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="w-full shrink-0 flex flex-col pt-1">
          <FooterInfo
            onOpenSettings={() => {
              setExpandMaintenanceOnOpen(false);
              setIsSettingsOpen(true);
            }}
            onOpenHelp={handleOpenHelp}
            hasSeenHelp={hasSeenHelp}
            isDevMode={isDevMode}
            languagePref={languagePref}
            onChangeLanguage={handleChangeLanguage}
          />
        </div>
      </div>

      {/* Modals Stack */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setExpandMaintenanceOnOpen(false);
        }}
        customApiKey=""
        onSaveApiKey={() => {}}
        isDevMode={isDevMode}
        onToggleDevMode={handleToggleDevMode}
        hasServerKey={false}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenTechnician={() => setIsTechnicianOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onManualCheckUpdates={() => runCombinedUpdateCheck(true)}
        isCheckingUpdates={isCheckingUpdates}
        isAppUpdateAvailable={isAppUpdateAvailable}
        initialExpandMaintenance={expandMaintenanceOnOpen}
        onNotify={addToast}
      />

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isStandalone={isStandalone}
        onInstalled={() => {
          setIsStandalone(true);
          addToast('success', 'Deck mounted for offline standalone use!');
        }}
      />

      <TechnicianModal
        isOpen={isTechnicianOpen}
        onClose={() => setIsTechnicianOpen(false)}
        isStandalone={isStandalone}
        onTriggerInstall={() => {
          setIsTechnicianOpen(false);
          setIsInstallModalOpen(true);
        }}
        onResetCooldown={() => {
          recordDropTimestamp(0);
          setLastDropTime(0);
          setCooldownMs(0);
        }}
        onNotify={addToast}
        vipEdition={vipEdition}
        onSelectVipEdition={handleSelectVipEdition}
      />

      <CustomDropModal
        isOpen={isCustomDropOpen}
        onClose={() => setIsCustomDropOpen(false)}
        onForge={handleForgeCustomDrop}
        isLoading={isGenerating}
        selectedPhoto={selectedPhotoBase64}
        onSelectPhoto={(base64) => {
          setSelectedPhotoBase64(base64);
          if (base64) setIsCustomizeOpen(true);
        }}
        onNotify={addToast}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={handleCloseHelp}
        isInteractiveKey={hasSeenHelp}
        isFavorite={currentAlbum?.isFavorite || false}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onGoToToday={() => {
          handleGoToToday();
          addToast('info', "Viewing Today's latest pressing.");
        }}
        onToggleFavorite={() => handleToggleFavorite()}
        onOpenShare={handleShare}
        onOpenApparel={() => setIsApparelOpen(true)}
        onOpenResetInSettings={() => {
          setExpandMaintenanceOnOpen(true);
          setIsSettingsOpen(true);
        }}
      />

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
        onTranslateAlbum={handleTranslateAlbum}
        isCollegeRadioActive={isCollegeRadioActive}
        onToggleCollegeRadio={() => {
          if (isCollegeRadioActive) {
            stopPlaybackState(false);
            addToast('info', '📻 College Radio Auto-Spin stopped.');
          } else {
            setIsArchiveOpen(false);
            setIsCollegeRadioActive(true);
            addToast('success', '📻 College Radio ON: Auto-spinning your crate!');
          }
        }}
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
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-base font-mono leading-none cursor-pointer"
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
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-b from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 active:scale-95 text-white font-mono font-black tracking-wider uppercase border-2 border-rose-400/60 shadow-xl shadow-rose-950 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
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
