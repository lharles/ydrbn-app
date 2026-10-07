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

// Preload custom assets into memory
preloadCustomAssets();

// Register service worker if supported
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('ServiceWorker registration error:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);