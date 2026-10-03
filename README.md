# Y.D.R.B.N. — Your Daily Random Band Name

A procedural 1970s vinyl album generator and audio synthesizer built as an offline-first Progressive Web App (PWA).

Inspired by the classic aesthetic of *"Random Band Names, Volume One"*.

---

## Features

- **Procedural Canvas Compositor**: Generates multi-layered vintage album art using dynamic 2D canvas routines, retro color palettes, and randomized gag modifiers.
- **Synthesized Audio Drops**: Web Audio API engine creates era-accurate retro synthesizer audio clips for each generated record.
- **Custom Darkroom Processing**: Upload custom artwork or photos with simulated analog darkroom filters and effects.
- **Offline PWA Architecture**: Fully client-side execution with zero external API dependencies, cloud databases, or runtime hosting costs.
- **Vinyl Archive & Lore Vault**: Keeps track of daily pressings, album lore, reviews, and tracklists locally in your browser.

---

## Live App & Installation

Access the live app: **[https://lharles.github.io/ydrbn-app/](https://lharles.github.io/ydrbn-app/)**

### Installing as a PWA
- **Android / Desktop (Chrome/Edge)**: Click the **Install** button inside the System Settings menu or use the install prompt in your browser's address bar.
- **iOS (Safari)**: Tap the **Share** button in Safari, scroll down, and select **Add to Home Screen**.

---

## Local Development

### Prerequisites
- Node.js (v18+)
- npm

### Setup
```bash
# Clone the repository
git clone [https://github.com/lharles/ydrbn-app.git](https://github.com/lharles/ydrbn-app.git)
cd ydrbn-app

# Install dependencies
npm install --legacy-peer-deps

# Start local development server
npm run dev