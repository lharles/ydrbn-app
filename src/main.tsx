import '@fontsource/bangers';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/courier-prime/400-italic.css';
import '@fontsource/medievalsharp';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import '@fontsource/permanent-marker';
import '@fontsource/righteous';
import '@fontsource/russo-one';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/space-mono/400-italic.css';
import '@fontsource/special-elite';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCustomAssets } from './services/assetManager';

preloadCustomAssets();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    window.dispatchEvent(new Event('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    (window as any).deferredPrompt = null;
    window.dispatchEvent(new Event('pwa-installed'));
  });
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ydrbn-app/sw.js', {
        scope: '/ydrbn-app/',
        updateViaCache: 'none',
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
