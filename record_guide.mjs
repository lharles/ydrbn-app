import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const APP_URL = process.env.APP_URL || 'http://localhost:3000/ydrbn-app/';
const OUTPUT_DIR = path.resolve('./video_build');
const SEGMENTS_JSON = path.join(OUTPUT_DIR, 'segments.json');
const TIMELINE_JSON = path.join(OUTPUT_DIR, 'timeline.json');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function setHudCaption(page, text) {
  try {
    await page.evaluate((t) => {
      window.__setDemoHud?.(t);
    }, text);
  } catch {}
}

async function moveCursorOnly(page, selector, pauseAfterMs = 600) {
  try {
    const loc = typeof selector === 'string' ? page.locator(selector).first() : selector.first();
    await loc.waitFor({ state: 'visible', timeout: 4000 });
    const box = await loc.boundingBox();
    if (box) {
      await page.evaluate(
        ({ x, y }) => window.__moveDemoCursor?.(x, y),
        { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      );
      await sleep(360);
      await page.evaluate(() => window.__pulseDemoCursor?.());
    }
    await sleep(pauseAfterMs);
  } catch {}
}

async function moveAndClick(page, selector, pauseAfterMs = 800) {
  try {
    const loc = typeof selector === 'string' ? page.locator(selector).first() : selector.first();
    await loc.waitFor({ state: 'visible', timeout: 4500 });
    const box = await loc.boundingBox();

    if (box) {
      await page.evaluate(
        ({ x, y }) => window.__moveDemoCursor?.(x, y),
        { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      );
      await sleep(340);
      await page.evaluate(() => window.__pulseDemoCursor?.());
    }

    await loc.click({ force: true, timeout: 3500 });
    await sleep(pauseAfterMs);
  } catch (err) {
    console.log(`⚠️  Skipped element (${typeof selector === 'string' ? selector : 'locator'})`);
  }
}

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let segments = [];
  if (fs.existsSync(SEGMENTS_JSON)) {
    segments = JSON.parse(fs.readFileSync(SEGMENTS_JSON, 'utf-8'));
  }

  const getMinSceneDuration = (idx, fallbackMs) => {
    const seg = segments[idx];
    return seg && seg.durationMs ? seg.durationMs + 450 : fallbackMs;
  };

  console.log('🎬 Launching headless studio camera (430x880)...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 430, height: 880 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 430, height: 880 },
    },
  });

  await context.addInitScript(() => {
    localStorage.removeItem('ydrbn_has_seen_help');
    localStorage.removeItem('ydrbn_has_seen_info');
    localStorage.setItem('ydrbn_dev_mode_unlocked', 'true');

    window.addEventListener('DOMContentLoaded', () => {
      // 1. Glowing Amber Touch Cursor
      const cursor = document.createElement('div');
      cursor.id = 'ydrbn-demo-cursor';
      Object.assign(cursor.style, {
        position: 'fixed',
        top: '440px',
        left: '215px',
        width: '24px',
        height: '24px',
        marginLeft: '-12px',
        marginTop: '-12px',
        borderRadius: '50%',
        background: 'rgba(245, 158, 11, 0.45)',
        border: '2.5px solid #fde047',
        boxShadow: '0 0 14px rgba(245, 158, 11, 0.95)',
        pointerEvents: 'none',
        zIndex: '999999',
        transition:
          'top 0.32s cubic-bezier(0.22, 1, 0.36, 1), left 0.32s cubic-bezier(0.22, 1, 0.36, 1), transform 0.14s ease',
      });
      document.body.appendChild(cursor);

      window.__moveDemoCursor = (x, y) => {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
      };
      window.__pulseDemoCursor = () => {
        cursor.style.transform = 'scale(0.68)';
        setTimeout(() => {
          cursor.style.transform = 'scale(1.25)';
          setTimeout(() => {
            cursor.style.transform = 'scale(1)';
          }, 120);
        }, 100);
      };

      // 2. Responsive In-DOM Caption Banner
      const hud = document.createElement('div');
      hud.id = 'ydrbn-demo-hud';
      Object.assign(hud.style, {
        position: 'fixed',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '396px',
        boxSizing: 'border-box',
        padding: '6px 10px',
        borderRadius: '8px',
        background: 'rgba(14, 12, 10, 0.94)',
        border: '1.5px solid rgba(245, 158, 11, 0.75)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.85)',
        color: '#fde047',
        fontFamily: '"Space Mono", monospace',
        fontSize: '10.5px',
        fontWeight: '700',
        letterSpacing: '0.04em',
        lineHeight: '1.3',
        textAlign: 'center',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        pointerEvents: 'none',
        zIndex: '999998',
      });
      hud.textContent = '01 // INITIAL LAUNCH: FUNCTIONALITY GUIDE';
      document.body.appendChild(hud);

      window.__setDemoHud = (text) => {
        hud.textContent = text;
      };
    });
  });

  const page = await context.newPage();
  const recordStartWall = Date.now();
  const timeline = [];

  async function runSyncedScene(idx, caption, actionFn) {
    const startMs = Date.now() - recordStartWall;
    const minDuration = getMinSceneDuration(idx, 10000);
    console.log(`▶ Scene ${idx + 1} (@${startMs}ms): ${caption}`);
    await setHudCaption(page, caption);
    timeline.push({ index: idx, caption, startMs });

    await actionFn();

    const elapsed = Date.now() - recordStartWall - startMs;
    if (elapsed < minDuration) {
      await sleep(minDuration - elapsed);
    }
  }

  console.log(`🔗 Connecting to ${APP_URL} ...`);
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await sleep(600);

  // =========================================================================
  // SCENE 1: INITIAL LAUNCH — USER FUNCTIONALITY GUIDE (HelpModal)
  // =========================================================================
  await runSyncedScene(0, '01 // FIRST LAUNCH: USER FUNCTIONALITY GUIDE', async () => {
    await moveCursorOnly(page, 'button:has-text("Watch Functionality Walkthrough")', 900);

    await page.evaluate(() => {
      const scrollBox = document.querySelector('div.fixed div.overflow-y-auto');
      if (scrollBox) scrollBox.scrollTo({ top: scrollBox.scrollHeight, behavior: 'smooth' });
    });
    await sleep(900);

    await moveAndClick(page, 'span:has-text("Troubleshooting")', 900);
    await page.evaluate(() => {
      const scrollBox = document.querySelector('div.fixed div.overflow-y-auto');
      if (scrollBox) scrollBox.scrollTo({ top: scrollBox.scrollHeight, behavior: 'smooth' });
    });
    await sleep(600);

    await moveCursorOnly(page, 'button:has-text("Purge Cache")', 900);
  });

  await moveAndClick(page, 'button:has-text("Understood")', 700);

  // =========================================================================
  // SCENE 2: INITIAL LAUNCH — DATA SHEET (InfoModal — Engine & Darkroom Only)
  // =========================================================================
  await runSyncedScene(1, '02 // DATA SHEET: ENGINE & DARKROOM SPECS', async () => {
    await moveCursorOnly(page, 'span:has-text("Procedural Synthesis Engine")', 1200);
    await moveCursorOnly(page, 'span:has-text("Custom Photo Covers & Darkroom Bleed")', 1200);
  });

  await moveAndClick(page, 'button:has-text("Understood")', 700);

  // =========================================================================
  // SCENE 3: TOP BAR (LEFT TO RIGHT) — ARCHIVE, FAVORITE, SHARE & APPAREL
  // =========================================================================
  await runSyncedScene(2, '03 // TOP BAR: ARCHIVE, FAVORITE, SHARE & APPAREL', async () => {
    await moveAndClick(page, 'button[aria-label="Archive"]', 900);
    await moveAndClick(page, 'button:has-text("Favorites")', 700);
    await moveAndClick(page, 'button:has-text("All Records")', 700);
    await moveAndClick(page, 'button[aria-label="Close archive"]', 700);

    await moveAndClick(page, 'button[aria-label="Favorite"]', 700);

    await moveAndClick(page, 'button[aria-label="Share"]', 1000);
    await moveAndClick(page, 'button:has-text("Copy Text")', 800);
    await moveAndClick(page, 'div.fixed button:has(svg.lucide-x)', 700);

    await moveAndClick(page, 'button[aria-label="Apparel Fabrication"]', 1400);
    await moveAndClick(page, 'button:has-text("Full Sleeve Plaque")', 900);
    const circuitBtn = page.locator('button:has-text("Circuit")').nth(1);
    if ((await circuitBtn.count()) > 0) {
      await moveAndClick(page, circuitBtn, 900);
    }
    await moveAndClick(page, 'button:has-text("Amber Gold")', 900);
    await moveAndClick(page, 'div.fixed button:has(svg.lucide-x)', 700);
  });

  // =========================================================================
  // SCENE 4: MAIN DECK — CAROUSEL, DAILY DROP, ZOOM, FLIP & RPM AUDIO
  // =========================================================================
  await runSyncedScene(3, '04 // TURNTABLE DECK: DROP, ZOOM, FLIP & RPM AUDIO', async () => {
    await moveAndClick(page, 'button[aria-label="Previous record"]', 700);
    await moveAndClick(page, 'button[aria-label="Next record"]', 700);

    await moveAndClick(page, 'button:has-text("DAILY DROP")', 1600);

    await moveAndClick(page, 'button[title="Zoom Artwork"]', 900);
    await moveAndClick(page, 'button:has-text("150%")', 800);
    await moveAndClick(page, 'button:has-text("Back Notes")', 1000);
    await moveAndClick(page, 'button[aria-label="Close Zoom View"]', 800);

    await moveAndClick(page, 'button:has-text("Flip Sleeve")', 1000);
    await moveAndClick(page, 'button:has-text("Spin Audio Clip")', 800);

    const rpmBtn = page.locator('button[title*="switch turntable RPM"]');
    if ((await rpmBtn.count()) > 0) {
      await moveAndClick(page, rpmBtn, 700);
      await moveAndClick(page, rpmBtn, 850);
    }

    const trackTwo = page.locator('#sleeve-back ul li').nth(1);
    if ((await trackTwo.count()) > 0) {
      await moveAndClick(page, trackTwo, 1400);
    }

    if ((await page.locator('button:has-text("Stop Turntable")').count()) > 0) {
      await moveAndClick(page, 'button:has-text("Stop Turntable")', 600);
    }
    await moveAndClick(page, 'button:has-text("Front Cover")', 800);
  });

  // =========================================================================
  // SCENE 5: SETTINGS (PART 1) — COLOR MODES, CARGO BAY & CRATE FORGE
  // =========================================================================
  await runSyncedScene(4, '05 // SETTINGS: COLOR MODES, CARGO BAY & CRATE FORGE', async () => {
    await moveAndClick(page, 'button[aria-label="Settings and Developer Mode"]', 900);

    await moveAndClick(page, 'button:has-text("Light")', 650);
    await moveAndClick(page, 'button:has-text("Dark")', 650);
    await moveAndClick(page, 'button:has-text("Contrast")', 650);
    await moveAndClick(page, 'button:has-text("Walnut")', 650);

    await moveAndClick(page, 'button:has-text("The Cargo Bay")', 1000);
    await moveAndClick(page, 'button:has-text("New Crate")', 1000);
    await moveAndClick(page, 'button:has-text("Subject Stamps")', 900);
    await moveAndClick(page, 'button[aria-label="Close Crate Forge"]', 800);

    await moveAndClick(page, 'span:has-text("Word Expansion Packs")', 900);
    await moveAndClick(page, 'button[aria-label="Back to main settings"]', 700);
  });

  // =========================================================================
  // SCENE 6: SETTINGS (PART 2) — DIRECTOR'S CHAIR, DISPATCH & RESET
  // =========================================================================
  await runSyncedScene(5, '06 // DIRECTOR’S CHAIR, DISPATCH & SYSTEM CONTROLS', async () => {
    await moveAndClick(page, 'button:has-text("Director\'s Chair")', 1000);
    const emojiToggle = page.locator('button:has-text("DISABLED"), button:has-text("ENABLED")').last();
    await moveAndClick(page, emojiToggle, 700);
    await moveAndClick(page, emojiToggle, 700);
    await moveAndClick(page, 'button[aria-label="Back to main settings"]', 800);

    await moveAndClick(page, 'button:has-text("Open Dispatch Terminal")', 1000);
    await moveAndClick(page, 'button[aria-label="Close dispatch modal"]', 700);

    await moveAndClick(page, 'button[aria-label="Settings and Developer Mode"]', 800);
    await page.evaluate(() => {
      const scrollBox = document.querySelector('div.fixed div.overflow-y-auto');
      if (scrollBox) scrollBox.scrollTo({ top: scrollBox.scrollHeight, behavior: 'smooth' });
    });
    await sleep(600);
    await moveAndClick(page, 'span:has-text("Danger Zone")', 800);
    await moveAndClick(page, 'span:has-text("Developer Controls")', 900);
    await moveAndClick(page, 'button:has-text("Done")', 800);
  });

  // =========================================================================
  // SCENE 7: MAIN INTERFACE — CUSTOM PHOTO COVER & CUSTOM DROP STUDIO
  // =========================================================================
  await runSyncedScene(6, '07 // CUSTOMIZE A DROP: PHOTOS & CUSTOM DROP STUDIO', async () => {
    await moveAndClick(page, 'button:has-text("Customize A Drop")', 900);

    await moveCursorOnly(page, 'button:has-text("Select Photos")', 800);

    await moveAndClick(page, 'button:has-text("Open Custom Drop")', 900);

    await page.locator('input[placeholder*="Unreasonable Elbow"]').fill('Unreasonable Elbows');
    await sleep(350);
    await page.locator('input[placeholder*="Plastic Spoons"]').fill('Plastic Spoons');
    await sleep(350);
    await page.locator('input[placeholder*="1978"]').fill('1978');
    await sleep(350);
    await page
      .locator('textarea[placeholder*="Side A"]')
      .fill('Side A - The Velour Directive\nSide B - Stapler in C Minor');
    await sleep(500);

    await moveAndClick(page, 'button:has-text("Create Custom Drop")', 1800);
    await moveAndClick(page, 'button:has-text("Customize A Drop")', 1200);
  });

  console.log('💾 Saving raw video & scene timeline...');
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const targetWebm = path.join(OUTPUT_DIR, 'raw_walkthrough.webm');
  fs.copyFileSync(videoPath, targetWebm);
  fs.writeFileSync(TIMELINE_JSON, JSON.stringify(timeline, null, 2));
  console.log(`✅ Walkthrough video & timeline saved!`);
})();