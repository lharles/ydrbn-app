import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const BUILD_ID = String(Date.now());
const SYNC_CACHE_PATH = '/tmp/ydrbn_dist_sync_v2.json';

async function collectPublicFiles(dir: string, rootDir: string, acc: string[] = []): Promise<string[]> {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await collectPublicFiles(full, rootDir, acc);
      } else if (entry.isFile()) {
        acc.push(path.relative(rootDir, full));
      }
    })
  );
  return acc;
}

async function syncPublicIncrementalFast(pubDir: string, outDir: string) {
  if (!fs.existsSync(pubDir)) return;
  await fsp.mkdir(outDir, { recursive: true });

  let prevCache: Record<string, string> = {};
  try {
    if (fs.existsSync(SYNC_CACHE_PATH) && fs.existsSync(path.join(outDir, 'manifest.json'))) {
      prevCache = JSON.parse(await fsp.readFile(SYNC_CACHE_PATH, 'utf-8'));
    }
  } catch {
    prevCache = {};
  }

  const relFiles = await collectPublicFiles(pubDir, pubDir);
  const nextCache: Record<string, string> = {};
  const toCopy: string[] = [];

  const BATCH = 32;
  for (let i = 0; i < relFiles.length; i += BATCH) {
    const slice = relFiles.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (rel) => {
        const st = await fsp.stat(path.join(pubDir, rel));
        const sig = `${st.size}:${Math.floor(st.mtimeMs)}`;
        nextCache[rel] = sig;
        if (prevCache[rel] !== sig) {
          toCopy.push(rel);
        }
      })
    );
  }

  for (let i = 0; i < toCopy.length; i += 16) {
    const slice = toCopy.slice(i, i + 16);
    await Promise.all(
      slice.map(async (rel) => {
        const dest = path.join(outDir, rel);
        await fsp.mkdir(path.dirname(dest), { recursive: true });
        await fsp.copyFile(path.join(pubDir, rel), dest);
      })
    );
  }

  for (const oldRel of Object.keys(prevCache)) {
    if (!(oldRel in nextCache)) {
      await fsp.rm(path.join(outDir, oldRel), { force: true }).catch(() => {});
    }
  }

  await fsp.writeFile(SYNC_CACHE_PATH, JSON.stringify(nextCache), 'utf-8').catch(() => {});
}

function ydrbnFastBuildAndVersionPlugin(): Plugin {
  return {
    name: 'ydrbn-version-manifest',
    buildStart() {
      const distAssets = path.resolve(import.meta.dirname, 'dist/assets');
      if (fs.existsSync(distAssets)) {
        for (const f of fs.readdirSync(distAssets)) {
          if (/^index-[A-Za-z0-9_-]+\.(js|css)$/i.test(f)) {
            fs.rmSync(path.join(distAssets, f), { force: true });
          }
        }
      }
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(
          {
            version: '1.2.0',
            buildId: BUILD_ID,
            builtAt: new Date().toISOString(),
          },
          null,
          2
        ),
      });
    },
    async closeBundle() {
      const pubDir = path.resolve(import.meta.dirname, 'public');
      const outDir = path.resolve(import.meta.dirname, 'dist');
      await syncPublicIncrementalFast(pubDir, outDir);
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    base: '/ydrbn-app/',
    publicDir: command === 'build' ? false : 'public',
    define: {
      __YDRBN_BUILD_ID__: JSON.stringify(command === 'build' ? BUILD_ID : 'dev'),
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(command === 'build' ? [ydrbnFastBuildAndVersionPlugin()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              ignored: [
                '**/.venv/**',
                '**/node_modules/**',
                '**/dist/**',
                '**/public/audio/**',
                '**/public/content/**',
                '**/public/assets/**',
                '**/public/video/**',
                '**/video_build/**',
                '**/screenshots/**',
                '**/raw_audio_inbox/**',
              ],
            },
    },
    build: {
      emptyOutDir: false,
      copyPublicDir: false,
      chunkSizeWarningLimit: 1000,
    },
  };
});
