/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { loadRecipeAssets } from './services/assetManager';
import { SleeveZoomModal } from './components/SleeveZoomModal';
import { AlbumEntry, ToastMessage } from './types';
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
import {
  loadAlbums,
  saveAlbums,
  getDevModeUnlocked,
  setDevModeUnlocked,
  getLastDropTimestamp,
  recordDropTimestamp,
  getUseCustomPhotosPref,
  setUseCustomPhotosPref,
} from './services/storageService';
import { generateDailyDrop } from './services/proceduralGenerator';
import { gagCanvasEngine } from './services/gagCanvasEngine';
import { audioSynthesizer } from './services/audioSynthesizer';

// --- COMPOSITE SHARE IMAGE GENERATOR ---
const compositeShareImage = async (album: AlbumEntry): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('Canvas error');

    const finalizeCanvas = () => {
      const topGrad = ctx.createLinearGradient(0, 0, 0, 300);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1024, 300);

      const botGrad = ctx.createLinearGradient(0, 724, 0, 1024);
      botGrad.addColorStop(0, 'rgba(0,0,0,0)');
      botGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 724, 1024, 1024);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '900 85px "Impact", "Arial Black", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
      ctx.fillText(album.bandName.toUpperCase(), 512, 60, 960);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 65px "Georgia", serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(album.albumTitle.toUpperCase(), 512, 960, 960);
      
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject('Blob failed')),
        'image/jpeg',
        0.92
      );
    };

    const coverArt = album.coverImageUrl || (album.recipe ? gagCanvasEngine.renderCover(album.recipe) : null);

    if (coverArt) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1024, 1024);
        finalizeCanvas();
      };
      img.onerror = finalizeCanvas; 
      img.src = coverArt;
    } else {
      finalizeCanvas();
    }
  });
};

export default function App() {
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [useCustomPhotos, setUseCustomPhotos] = useState(false);
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Forging Vinyl Artwork...');

  const [isDevMode, setIsDevMode] = useState<boolean>(() => getDevModeUnlocked());
  const [lastDropTime, setLastDropTime] = useState<number>(() => getLastDropTimestamp());
  const [cooldownMs, setCooldownMs] = useState<number>(() => {
    const dropTime = getLastDropTimestamp();
    const dev = getDevModeUnlocked();
    if (dev || dropTime === 0) return 0;
    const remaining = (24 * 60 * 60 * 1000) - (Date.now() - dropTime);
    return remaining > 0 ? remaining : 0;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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

  // Initial load & Silent Cache Warmer
  useEffect(() => {
    try {
      const loaded = loadAlbums();
      setAlbums(loaded);
      if (loaded.length > 0) {
        setCurrentIndex(loaded.length - 1);
      }

      const devUnlocked = getDevModeUnlocked();
      setIsDevMode(devUnlocked);

      const dropTime = getLastDropTimestamp();
      setLastDropTime(dropTime);

      setUseCustomPhotos(getUseCustomPhotosPref());

      // Silently fetch assets into memory and RE-BAKE the images for the UI
      const warmAssets = async () => {
        const promises = loaded.map(async (a) => {
          if (a.recipe) {
            // Wait for background/subject to load into memory
            await loadRecipeAssets(a.recipe.backdrop || '', a.recipe.subject || '').catch(() => {});
            // Re-bake the beautiful canvas cover and attach it to a fresh object
            return { ...a, coverImageUrl: gagCanvasEngine.renderCover(a.recipe) };
          }
          return a;
        });
        
        const warmedAlbums = await Promise.all(promises);
        // Push the fully baked images directly into the UI state to replace primitives
        setAlbums(warmedAlbums);
      };
      
      warmAssets();
    } catch (err) {
      console.error("Storage load error:", err);
    }
  }, []);

  // Cooldown countdown timer (Bulletproof Math)
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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      audioSynthesizer.stopAll();
      setIsPlayingAudio(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < albums.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      audioSynthesizer.stopAll();
      setIsPlayingAudio(false);
    }
  };

  const handleGoToToday = () => {
    if (albums.length > 0) {
      setCurrentIndex(albums.length - 1);
      setIsFlipped(false);
      audioSynthesizer.stopAll();
      setIsPlayingAudio(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleShare = async () => {
    if (!currentAlbum) return;
    
    addToast('info', 'Compositing vinyl cover for sharing...');

    const shareText = `Check out today's random band: "${currentAlbum.bandName}" - "${currentAlbum.albumTitle}" (${currentAlbum.year}).\n\nBio: ${currentAlbum.bandBio}\n\nGenerated with Y.D.R.B.N.`;

    try {
      const blob = await compositeShareImage(currentAlbum);
      const fileName = `${currentAlbum.bandName.replace(/[^a-z0-9]/gi, '_')}_Cover.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${currentAlbum.bandName} - ${currentAlbum.albumTitle}`,
          text: shareText,
          files: [file],
        });
        addToast('success', 'Shared successfully!');
      } else {
        copyToClipboard(shareText);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        addToast('success', 'Cover downloaded & Lore copied to clipboard!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        copyToClipboard(shareText);
      }
    }
  };

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      audioSynthesizer.stopAll();
      setIsPlayingAudio(false);
      return;
    }

    if (!currentAlbum) {
      addToast('info', 'Press ⚡ Daily Drop to generate a record first!');
      return;
    }

    try {
      setIsPlayingAudio(true);
      await audioSynthesizer.playAlbumClip(currentAlbum.albumTitle, currentAlbum.year);
      setIsPlayingAudio(false);
    } catch (err: any) {
      setIsPlayingAudio(false);
      addToast('error', `Audio error: ${err.message || err}`);
    }
  };

  const handleToggleUseCustomPhotos = (enabled: boolean) => {
    setUseCustomPhotos(enabled);
    setUseCustomPhotosPref(enabled);
  };

  const handleSelectPhoto = (base64: string | null) => {
    setSelectedPhotoBase64(base64);
    if (base64) {
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

      // Wait for images to load into cache BEFORE baking
      await loadRecipeAssets(newEntry.recipe.backdrop, newEntry.recipe.subject);
      newEntry.coverImageUrl = gagCanvasEngine.renderCover(newEntry.recipe);

      if (applyCustom && appliedPhoto) {
        try {
          const { url } = await gagCanvasEngine.processCustomPhoto(appliedPhoto);
          newEntry.coverImageUrl = url;
        } catch {
          // fallback
        }
      }

      setAlbums((prev) => {
        const next = [...prev, newEntry];
        const capped = next.length > 8 ? next.slice(next.length - 8) : next;
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

  const handleToggleDevMode = (unlocked: boolean) => {
    setDevModeUnlocked(unlocked);
    setIsDevMode(unlocked);
    if (unlocked) {
      addToast('success', '✓ Dev Mode Unlocked: 24h countdown bypassed for instant drops!');
    } else {
      addToast('info', 'Dev Mode locked. Standard 24h cooldown restored.');
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#0c101d] text-slate-100 select-none font-sans">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="w-full max-w-md mx-auto min-h-full flex flex-col justify-between py-2 pb-14 relative">
        <div className="w-full shrink-0 flex flex-col">
          <TopBar
            onOpenArchive={() => setIsArchiveOpen(true)}
            isToday={isTodayActive}
            onGoToToday={handleGoToToday}
            isFavorite={currentAlbum?.isFavorite || false}
            onToggleFavorite={() => handleToggleFavorite()}
            onShare={handleShare}
            hasEntries={albums.length > 0}
          />
          <SubHeaderNav
            entries={albums}
            currentIndex={currentIndex}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>

        <div className="w-full flex-1 flex flex-col justify-center items-center px-3 py-1 gap-1.5">
          <ActionButtonsRow
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped(!isFlipped)}
            isPlayingAudio={isPlayingAudio}
            onPlayAudio={handleToggleAudio}
            disabled={isGenerating || !currentAlbum}
          />

          <div className="w-full flex items-center justify-center py-1">
            <VinylSleeve
              album={currentAlbum}
              isFlipped={isFlipped}
              isLoading={isGenerating}
              loadingStepText={loadingStepText}
              onToggleFlip={() => setIsFlipped(!isFlipped)}
              onOpenZoom={() => setIsZoomOpen(true)}
            />
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

        <div className="w-full shrink-0 flex flex-col">
          <DailyDropButton
            onDailyDrop={handleDailyDrop}
            isLoading={isGenerating}
            cooldownMs={cooldownMs}
            isDevMode={isDevMode}
          />
          <FooterInfo
            onOpenSettings={() => setIsSettingsOpen(true)}
            isDevMode={isDevMode}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customApiKey=""
        onSaveApiKey={() => {}}
        isDevMode={isDevMode}
        onToggleDevMode={handleToggleDevMode}
        hasServerKey={false}
      />

      <SleeveZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        album={currentAlbum}
        initialFlipped={isFlipped}
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
          }
        }}
        onToggleFavorite={handleToggleFavorite}
        onDeleteAlbum={handleDeleteAlbum}
      />
    </div>
  );
}