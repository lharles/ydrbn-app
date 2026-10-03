/**
 * Modular 3-Layer Visual Gag Canvas Compositor
 * Emulates the dry, humorous, literal visual-gag aesthetic of the classic
 * "Random Band Names Volume One".
 *
 * Decoupled pipeline where every canvas is procedurally assembled from 3 independent layers:
 * 1. Layer 1: Backdrop (8 procedural mathematical routines)
 * 2. Layer 2: Subject Vector (15 core subjects + legacy/starter routines)
 * 3. Layer 3: Gag Modifier (Applied contextually or randomly)
 *
 * CRITICAL: Zero band name or album title text is rendered to the canvas; all typography is handled
 * exclusively by the React layer in VinylSleeve.tsx to prevent duplicate text clashing.
 */

import {
  BackdropType,
  CanvasRecipe,
  GagModifierType,
  SubjectVectorType,
  VINTAGE_PALETTES,
  VintagePalette,
} from '../types';

import { imageCache } from './assetManager';

export class GagCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context could not be initialized');
    }
    this.ctx = ctx;
  }

  /**
   * Resolves a 1970s vintage color palette for the recipe
   */
  public resolvePalette(recipe: CanvasRecipe): VintagePalette {
    if (recipe.palette) {
      const found = VINTAGE_PALETTES.find((p) => p.name === recipe.palette);
      if (found) return found;
    }
    const randIdx = Math.floor(Math.random() * VINTAGE_PALETTES.length);
    return VINTAGE_PALETTES[randIdx];
  }

  /**
   * Main entry point to render an album cover from a recipe.
   * Backward-compatible signature accepting either (recipe) or (bandName, albumTitle, recipe).
   * NOTE: bandName and albumTitle are NEVER drawn onto the canvas.
   */
  public renderCover(
    arg1: string | CanvasRecipe,
    _arg2?: string,
    arg3?: CanvasRecipe
  ): string {
    let recipe: CanvasRecipe;
    if (typeof arg1 === 'object' && arg1 !== null) {
      recipe = arg1 as CanvasRecipe;
    } else if (arg3) {
      recipe = arg3;
    } else {
      recipe = { backdrop: 'radial_sunburst', subject: 'tooth', modifier: 'caution_stamp' };
    }

    const { ctx, canvas } = this;
    const width = canvas.width;
    const height = canvas.height;

    // --- MASTER CANVAS RESET ---
    // Force-scrubs the buffer and kills leftover blend modes before painting
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.globalCompositeOperation = 'source-over'; 
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
    ctx.clearRect(0, 0, width, height);

    // Resolve Palette
    const palette = this.resolvePalette(recipe);

    // Normalize 3-layer composition parameters
    const { backdrop, subject, modifier } = this.normalizeComposition(recipe);

    // ==========================================
    // LAYER 1: BACKDROP
    // ==========================================
    this.renderBackdrop(backdrop, palette, recipe);

    // ==========================================
    // LAYER 2: SUBJECT VECTOR
    // ==========================================
    this.renderSubject(subject, palette, recipe);

    // ==========================================
    // LAYER 3: GAG MODIFIER
    // ==========================================
    this.renderModifier(modifier, palette, recipe);

    // ==========================================
    // POST-PROCESSING: Analog Ring-Wear & Scuffing
    // ==========================================
    this.applyAnalogRingWearAndScuffing();

    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  /**
   * Maps legacy archetypes or defaults into clean [backdrop, subject, modifier]
   */
  private normalizeComposition(recipe: CanvasRecipe): {
    backdrop: BackdropType;
    subject: SubjectVectorType;
    modifier: GagModifierType;
  } {
    if (recipe.subject) {
      return {
        backdrop: recipe.backdrop || 'split_horizon',
        subject: recipe.subject,
        modifier: recipe.modifier || 'none',
      };
    }

    // Map legacy archetypes gracefully
    switch (recipe.archetype) {
      case 'clothesline_porch':
        return { backdrop: 'split_horizon', subject: 'pants', modifier: 'none' };
      case 'bed_insomnia':
        return { backdrop: 'deep_space', subject: 'bed', modifier: 'none' };
      case 'pack_dogs':
        return { backdrop: 'split_horizon', subject: 'classical_monolith', modifier: 'celestial_glow' };
      case 'office_door':
        return { backdrop: 'minimal_box', subject: 'office_door', modifier: 'none' };
      case 'cards_cheese':
      case 'cards_table':
      case 'trumped_by_cheese':
        return { backdrop: 'minimal_box', subject: 'cheese', modifier: 'none' };
      case 'atomic_pastry':
      case 'atomic_orbit':
        return { backdrop: 'minimal_box', subject: 'atomic_orbits', modifier: 'celestial_glow' };
      case 'cosmic_toilet':
      case 'cosmic_deep_space':
      case 'cosmic_domestic':
        return { backdrop: 'deep_space', subject: 'porcelain_fixture', modifier: 'celestial_glow' };
      case 'ear_bandage':
      case 'anatomical_woodcut':
        return { backdrop: 'vintage_parchment', subject: 'ear', modifier: 'adhesive_bandage' };
      case 'food_bowl':
      case 'kitchen_still_life':
        return { backdrop: 'split_horizon', subject: 'soup_bowl', modifier: 'none' };
      case 'laminated_cheese':
        return { backdrop: 'minimal_box', subject: 'stack_slices', modifier: 'none' };
      case 'grill_denial':
      case 'literal_denial':
        return { backdrop: 'split_horizon', subject: 'soup_bowl', modifier: 'speech_bubble' };
      case 'vortex_spiral':
      case 'hypnotic_swirl':
        return { backdrop: 'hypnotic_rings', subject: 'geometric_cube', modifier: 'none' };
      case 'sunburst_delay':
      case 'optical_hypnotic':
        return { backdrop: 'radial_sunburst', subject: 'clock_face', modifier: 'caution_stamp' };
      case 'abacus_blueprint':
      case 'blueprint_drafting':
      case 'absurd_blueprint':
        return { backdrop: 'drafting_grid', subject: 'geometric_cube', modifier: 'caution_stamp' };
      case 'hazard_atlas':
      case 'surreal_landscape':
      case 'classical_hazard':
      default:
        return { backdrop: 'split_horizon', subject: 'classical_monolith', modifier: 'hazard_triangle' };
    }
  }

  // =========================================================================
  // LAYER 1: BACKDROPS (8 Procedural Mathematical Routines)
  // =========================================================================
  private renderBackdrop(type: BackdropType, palette: VintagePalette, recipe: CanvasRecipe): void {
    const { ctx } = this;
    const cx = 512;
    const cy = 512;

    switch (type) {
      // 0. Clean, slick procedural 2-color gradient
      case 'minimal_gradient': {
        const angle = Math.random() * Math.PI * 2;
        const grad = ctx.createLinearGradient(
          cx + Math.cos(angle) * 1024, cy + Math.sin(angle) * 1024,
          cx - Math.cos(angle) * 1024, cy - Math.sin(angle) * 1024
        );
        grad.addColorStop(0, palette.primary);
        grad.addColorStop(1, palette.secondary);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);
        break;
      }
  
      // 1. Two-tone ground/sky with atmospheric gradient
      case 'split_horizon': {
        const horizonY = 560;
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, palette.background);
        skyGrad.addColorStop(0.7, palette.primary);
        skyGrad.addColorStop(1, palette.secondary);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 1024, horizonY);

        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, 1024);
        groundGrad.addColorStop(0, this.adjustBrightness(palette.accent, 20));
        groundGrad.addColorStop(1, palette.accent);
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizonY, 1024, 1024 - horizonY);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(1024, horizonY);
        ctx.stroke();
        break;
      }

      // 2. Technical blueprint lines with coordinate markers
      case 'drafting_grid': {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        for (let x = 40; x < 1024; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
        }
        for (let y = 40; y < 1024; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1024, y);
          ctx.stroke();
        }

        // Coordinate crosshair ticks
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        const ticks = [160, 320, 480, 640, 800];
        ticks.forEach((t) => {
          ctx.beginPath();
          ctx.moveTo(t - 10, 40);
          ctx.lineTo(t + 10, 40);
          ctx.moveTo(t, 30);
          ctx.lineTo(t, 50);
          ctx.stroke();
        });
        break;
      }

      // 3. Variable count (12 to 36) alternating colored rays
      case 'radial_sunburst': {
        const numRays = 24;
        const step = (Math.PI * 2) / numRays;

        ctx.fillStyle = palette.primary;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.fillStyle = palette.secondary;
        for (let i = 0; i < numRays; i += 2) {
          const start = i * step;
          const end = (i + 1) * step;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 750, start, end);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      // 4. Concentric circles, wavy optical ripples, or spirals
      case 'hypnotic_rings': {
        const style = recipe.spiralStyle || 'archimedean';
        ctx.fillStyle = palette.primary;
        ctx.fillRect(0, 0, 1024, 1024);

        if (style === 'square_rings') {
          ctx.lineWidth = 16;
          for (let s = 60; s <= 500; s += 45) {
            ctx.strokeStyle = s % 90 === 0 ? palette.secondary : palette.accent;
            ctx.strokeRect(cx - s, cy - s, s * 2, s * 2);
          }
        } else if (style === 'concentric') {
          ctx.lineWidth = 16;
          for (let r = 50; r <= 520; r += 45) {
            ctx.strokeStyle = r % 90 === 0 ? palette.secondary : palette.accent;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          ctx.strokeStyle = palette.secondary;
          ctx.lineWidth = 26;
          ctx.lineCap = 'round';
          ctx.beginPath();
          let r = 18;
          for (let a = 0; a < Math.PI * 18; a += 0.08) {
            r += 1.1;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
      }

      // 5. Dark nebula radial wash with procedurally scattered star clusters
      case 'deep_space': {
        const spaceGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 650);
        spaceGrad.addColorStop(0, palette.secondary);
        spaceGrad.addColorStop(0.5, palette.primary);
        spaceGrad.addColorStop(1, '#05050d');
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 220; i++) {
          const sx = (Math.sin(i * 19.3) * 0.5 + 0.5) * 1024;
          const sy = (Math.cos(i * 27.7) * 0.5 + 0.5) * 1024;
          const sRadius = i % 5 === 0 ? 2.5 : i % 2 === 0 ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
          ctx.fill();

          if (i % 20 === 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx - 14, sy);
            ctx.lineTo(sx + 14, sy);
            ctx.moveTo(sx, sy - 14);
            ctx.lineTo(sx + 14, sy);
            ctx.stroke();
          }
        }
        break;
      }

      // 6. Sharp 45-degree angled color split with contrasting borders
      case 'diagonal_duotone': {
        ctx.fillStyle = palette.background;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.fillStyle = palette.primary;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1024, 1024);
        ctx.lineTo(0, 1024);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1024, 1024);
        ctx.stroke();
        break;
      }

      // 7. Aged paper wash with subtle grunge border vignetting
      case 'vintage_parchment': {
        const parchment = ctx.createLinearGradient(0, 0, 1024, 1024);
        parchment.addColorStop(0, palette.background);
        parchment.addColorStop(1, this.adjustBrightness(palette.background, -15));
        ctx.fillStyle = parchment;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 14;
        ctx.strokeRect(36, 36, 952, 952);
        ctx.lineWidth = 2;
        ctx.strokeRect(48, 48, 928, 928);
        break;
      }

      // 8. Centered framed inset panel with double-line borders
      case 'minimal_box': {
        const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
        grad.addColorStop(0, palette.background);
        grad.addColorStop(1, this.adjustBrightness(palette.background, -12));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 8;
        ctx.strokeRect(60, 60, 904, 904);

        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 2;
        ctx.strokeRect(76, 76, 872, 872);
        break;
      }

      // 9. Two-tone background with a warm orange/red sunset sky and a flat sand-colored ground plane
      case 'desert_horizon': {
        const horizonY = 570;
        // Warm orange/red sunset sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#7f1d1d'); // deep crimson red
        skyGrad.addColorStop(0.35, '#c2410c'); // rich rust orange
        skyGrad.addColorStop(0.7, '#ea580c'); // bright orange
        skyGrad.addColorStop(1, '#f59e0b'); // warm amber at horizon
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 1024, horizonY);

        // Low glowing desert sun setting on the horizon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx, horizonY, 80, Math.PI, 0); // half circle above horizon
        ctx.fill();

        // Flat sand-colored ground plane
        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, 1024);
        groundGrad.addColorStop(0, '#d97706'); // warm golden sand
        groundGrad.addColorStop(0.4, '#b45309'); // ochre
        groundGrad.addColorStop(1, '#78350f'); // deep warm sand earth
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizonY, 1024, 1024 - horizonY);

        // Subtle horizontal desert strata lines
        ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
        ctx.lineWidth = 3;
        const sandStrata = [horizonY + 60, horizonY + 130, horizonY + 220, horizonY + 320];
        sandStrata.forEach((sy) => {
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(1024, sy);
          ctx.stroke();
        });

        // Crisp horizon demarcation line
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(1024, horizonY);
        ctx.stroke();
        break;
      }

      // 10. Twilight background with repeating, simplified triangular pine tree silhouettes layered on the horizon
      case 'dark_forest': {
        const horizonY = 620;
        // Twilight sky gradient
        const twilightGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        twilightGrad.addColorStop(0, '#020617'); // night indigo
        twilightGrad.addColorStop(0.4, '#1e1b4b'); // deep twilight purple
        twilightGrad.addColorStop(0.8, '#431407'); // dusty dusky glow
        twilightGrad.addColorStop(1, '#581c87'); // mauve purple horizon
        ctx.fillStyle = twilightGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Back layer of simplified triangular pine tree silhouettes (lighter/faded indigo-green)
        ctx.fillStyle = '#064e3b';
        for (let x = -30; x <= 1050; x += 45) {
          const treeH = 140 + Math.sin(x * 0.05) * 35;
          const treeW = 45;
          ctx.beginPath();
          ctx.moveTo(x, horizonY);
          ctx.lineTo(x + treeW / 2, horizonY - treeH);
          ctx.lineTo(x + treeW, horizonY);
          ctx.closePath();
          ctx.fill();
        }

        // Front layer of simplified triangular pine tree silhouettes (deep midnight pine green/black)
        ctx.fillStyle = '#022c22';
        for (let x = -15; x <= 1040; x += 55) {
          const treeH = 190 + Math.cos(x * 0.03) * 45;
          const treeW = 60;
          ctx.beginPath();
          ctx.moveTo(x, horizonY + 20);
          ctx.lineTo(x + treeW / 2, horizonY + 20 - treeH);
          ctx.lineTo(x + treeW, horizonY + 20);
          ctx.closePath();
          ctx.fill();
        }

        // Dark forest ground plane
        ctx.fillStyle = '#011c15';
        ctx.fillRect(0, horizonY + 20, 1024, 1024 - (horizonY + 20));

        // Ground divider
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, horizonY + 20);
        ctx.lineTo(1024, horizonY + 20);
        ctx.stroke();
        break;
      }

      // 11. Cityscape silhouette of blocky geometric buildings with small yellow square windows against a night sky
      case 'urban_skyline': {
        const groundY = 700;
        // Deep night sky gradient
        const nightGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        nightGrad.addColorStop(0, '#030712'); // midnight obsidian
        nightGrad.addColorStop(0.7, '#0f172a'); // deep slate night
        nightGrad.addColorStop(1, '#1e293b'); // industrial low haze
        ctx.fillStyle = nightGrad;
        ctx.fillRect(0, 0, 1024, groundY);

        // Distant stars / industrial dots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let s = 0; s < 40; s++) {
          const sx = (Math.sin(s * 31.7) * 0.5 + 0.5) * 1024;
          const sy = (Math.cos(s * 19.3) * 0.5 + 0.5) * 320;
          ctx.fillRect(sx, sy, 2, 2);
        }

        // Blocky geometric buildings
        const buildings = [
          { x: 20, w: 90, h: 320 },
          { x: 120, w: 110, h: 420 },
          { x: 240, w: 80, h: 260 },
          { x: 330, w: 130, h: 490 },
          { x: 470, w: 95, h: 360 },
          { x: 575, w: 120, h: 440 },
          { x: 705, w: 85, h: 290 },
          { x: 800, w: 120, h: 510 },
          { x: 930, w: 80, h: 340 },
        ];

        // Draw buildings
        buildings.forEach((bld, idx) => {
          const bldY = groundY - bld.h;
          ctx.fillStyle = idx % 2 === 0 ? '#0b0f19' : '#111827';
          ctx.fillRect(bld.x, bldY, bld.w, bld.h);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeRect(bld.x, bldY, bld.w, bld.h);

          // Small yellow square windows
          for (let wy = bldY + 25; wy < groundY - 20; wy += 26) {
            for (let wx = bld.x + 15; wx < bld.x + bld.w - 15; wx += 22) {
              const isLit = (wx * 7 + wy * 13 + idx * 17) % 3 !== 0;
              ctx.fillStyle = isLit ? '#fde047' : '#1e293b';
              ctx.fillRect(wx, wy, 10, 10);
            }
          }
        });

        // Dark street ground plane
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, groundY, 1024, 1024 - groundY);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(1024, groundY);
        ctx.stroke();
        break;
      }

      // 12. Stylized row of overlapping trapezoidal car shapes with glowing red taillight circles on a dark grey asphalt backdrop
      case 'traffic_jam': {
        // Dark grey asphalt backdrop
        ctx.fillStyle = '#1e2229';
        ctx.fillRect(0, 0, 1024, 1024);

        // Distant city haze or road overhead lights
        const haze = ctx.createLinearGradient(0, 0, 0, 400);
        haze.addColorStop(0, '#0f172a');
        haze.addColorStop(1, '#1e2229');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, 1024, 400);

        // Asphalt road texture / white dashed lane markings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 6;
        ctx.setLineDash([40, 30]);
        for (let laneY = 460; laneY <= 860; laneY += 120) {
          ctx.beginPath();
          ctx.moveTo(0, laneY);
          ctx.lineTo(1024, laneY);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Row of overlapping stylized trapezoidal cars
        const cars = [
          { x: 60, y: 720, w: 220, color: '#334155' },
          { x: 230, y: 710, w: 240, color: '#b91c1c' },
          { x: 420, y: 730, w: 230, color: '#0369a1' },
          { x: 600, y: 705, w: 250, color: '#b45309' },
          { x: 790, y: 725, w: 220, color: '#15803d' },
        ];

        cars.forEach((car) => {
          ctx.save();
          // Shadow under car
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.ellipse(car.x + car.w / 2, car.y + 60, car.w / 2 + 10, 15, 0, 0, Math.PI * 2);
          ctx.fill();

          // Lower rectangular body
          ctx.fillStyle = car.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(car.x, car.y, car.w, 55, 6);
          ctx.fill();
          ctx.stroke();

          // Upper trapezoidal cabin
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(car.x + 30, car.y);
          ctx.lineTo(car.x + 55, car.y - 45);
          ctx.lineTo(car.x + car.w - 55, car.y - 45);
          ctx.lineTo(car.x + car.w - 30, car.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Rear window highlight
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(car.x + 42, car.y - 4);
          ctx.lineTo(car.x + 62, car.y - 40);
          ctx.lineTo(car.x + car.w - 62, car.y - 40);
          ctx.lineTo(car.x + car.w - 42, car.y - 4);
          ctx.closePath();
          ctx.fill();

          // Wheels
          ctx.fillStyle = '#0a0a0a';
          ctx.beginPath();
          ctx.arc(car.x + 45, car.y + 55, 20, 0, Math.PI * 2);
          ctx.arc(car.x + car.w - 45, car.y + 55, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Glowing red taillight circles on the rear
          const tlRadius = 14;
          const tlX1 = car.x + 18;
          const tlX2 = car.x + car.w - 18;
          const tlY = car.y + 26;

          [tlX1, tlX2].forEach((tx) => {
            // Radial taillight glow
            const glow = ctx.createRadialGradient(tx, tlY, 2, tx, tlY, 32);
            glow.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
            glow.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
            glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(tx, tlY, 32, 0, Math.PI * 2);
            ctx.fill();

            // Core bright red taillight lens
            ctx.fillStyle = '#ff1744';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tx, tlY, tlRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });

          ctx.restore();
        });
        break;
      }

     default: {
        // 1. Check if this backdrop is a custom image file
        const backdropStr = String(type || '');
        if (backdropStr.includes('.png') || backdropStr.includes('.jpg') || backdropStr.includes('.webp')) {
          const img = imageCache[backdropStr];
          
          // Require both complete AND naturalWidth > 0 so broken/404 images don't crash the canvas
          if (img && img.complete && img.naturalWidth > 0) {
            try {
              ctx.save();
              this.drawDistortedBackdrop(img, 1024, 1024);
              ctx.restore();
              break;
            } catch (err) {
              console.warn(`Could not draw backdrop ${type}, falling back:`, err);
            }
          }
        }

        // 2. Fallback default minimal box if image is missing, loading, or not an image file
        const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
        grad.addColorStop(0, palette.background);
        grad.addColorStop(1, this.adjustBrightness(palette.background, -12));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 8;
        ctx.strokeRect(60, 60, 904, 904);

        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 2;
        ctx.strokeRect(76, 76, 872, 872);
        break;
      }
    }
  }

  // =========================================================================
  // LAYER 2: SUBJECT VECTORS (15 Core Subjects + Legacy Shapes)
  // =========================================================================
  private renderSubject(subject: SubjectVectorType, palette: VintagePalette, recipe: CanvasRecipe): void {
    const { ctx } = this;
    // Add a randomized offset between -80 and +80 pixels so objects float in different locations
    const offsetX = (Math.random() - 0.5) * 160;
    const offsetY = (Math.random() - 0.5) * 160;
    const cx = 512 + offsetX;
    const cy = 512 + offsetY;

    switch (subject) {
      case 'none':
        // The Minimalist Wrinkle: Draw absolutely nothing
        break;

      // 1. Pants (Blue trousers)
      case 'pants':
      case 'clothesline_pants': {
        this.drawPants(cx, cy, palette);
        break;
      }

      // 2. Bed (Wooden headboard with white sheets)
      case 'bed':
      case 'bed_insomnia': {
        this.drawBed(cx, cy, palette);
        break;
      }

      // 3. Cheese (Yellow wedge with holes)
      case 'cheese':
      case 'cheese_wedge': {
        this.drawCheeseWedge(cx, cy, palette);
        break;
      }

      // 4. Ear (Anatomical ear profile)
      case 'ear':
      case 'anatomical_part': {
        this.drawEar(cx, cy, palette);
        break;
      }

      // 5. Tooth (Stylized anatomical white molar with two roots)
      case 'tooth': {
        this.drawTooth(cx, cy, palette);
        break;
      }

      // 6. Anvil (Heavy, dark iron blacksmith anvil with horn)
      case 'anvil': {
        this.drawAnvil(cx, cy, palette);
        break;
      }

      // 7. UFO (Retro flying saucer with glass dome and thrusters)
      case 'ufo': {
        this.drawUfo(cx, cy, palette);
        break;
      }

      // 8. Cactus (Green saguaro cactus with two bent arms and needles)
      case 'cactus': {
        this.drawCactus(cx, cy, palette);
        break;
      }

      // 9. Magnet (Classic horseshoe magnet with silver tips)
      case 'magnet': {
        this.drawMagnet(cx, cy, palette);
        break;
      }

      // 10. Key (Antique brass skeleton key with ornate bow)
      case 'key': {
        this.drawKey(cx, cy, palette);
        break;
      }

      // 11. Anchor (Heavy navy iron ship anchor with ring and flukes)
      case 'anchor': {
        this.drawAnchor(cx, cy, palette);
        break;
      }

      // 12. Lightbulb (Glowing yellow incandescent bulb with screw base)
      case 'lightbulb': {
        this.drawLightbulb(cx, cy, palette);
        break;
      }

      // 13. Skull (Minimalist stylized white skull with hollow eye sockets)
      case 'skull': {
        this.drawSkull(cx, cy, palette);
        break;
      }

      // 14. Crown (Golden king's crown with 3 peaks and colored jewels)
      case 'crown': {
        this.drawCrown(cx, cy, palette);
        break;
      }

      // 15. Bomb (Classic round black cartoon bomb with sparking lit fuse)
      case 'bomb': {
        this.drawBomb(cx, cy, palette);
        break;
      }

      // 16. Angry Person (Thick-line stick figure with hands on hips and sharp downward-angled eyebrows)
      case 'angry_person': {
        this.drawAngryPerson(cx, cy, palette);
        break;
      }

      // 17. Sneaky Person (Tiptoeing stick figure bent forward with black bandit mask)
      case 'sneaky_person': {
        this.drawSneakyPerson(cx, cy, palette);
        break;
      }

      // 18. Confused Person (Shrugging stick figure with large procedural question mark)
      case 'confused_person': {
        this.drawConfusedPerson(cx, cy, palette);
        break;
      }

      // Legacy: 2 to 4 rotating elliptical paths with orbital electron nodes
      case 'atomic_orbits': {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.setLineDash([14, 8]);
        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
        angles.forEach((angle, idx) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.strokeStyle = idx % 2 === 0 ? palette.primary : palette.accent;
          ctx.beginPath();
          ctx.ellipse(0, 0, 360, 110, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = palette.primary;
          ctx.beginPath();
          ctx.arc(360, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-360, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
        this.drawPastryNucleus(cx, cy, 130);
        break;
      }

      // Legacy: 3 fanned card rectangles with procedural suit pips
      case 'playing_cards': {
        const cards = [
          { rank: 'J', suit: '♣', color: '#0f172a', angle: -18 },
          { rank: 'Q', suit: '♦', color: '#dc2626', angle: 0 },
          { rank: 'K', suit: '♠', color: '#0f172a', angle: 18 },
        ];
        cards.forEach((card) => {
          ctx.save();
          ctx.translate(cx, cy + 40);
          ctx.rotate((card.angle * Math.PI) / 180);
          ctx.fillStyle = '#fefce8';
          ctx.beginPath();
          ctx.roundRect(-75, -150, 150, 230, 10);
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = card.color;
          ctx.font = 'bold 24px "Oswald", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(card.rank, -60, -115);
          ctx.font = '20px serif';
          ctx.fillText(card.suit, -60, -90);

          ctx.font = '64px serif';
          ctx.textAlign = 'center';
          ctx.fillText(card.suit, 0, -20);
          ctx.restore();
        });
        break;
      }

      // Legacy: Steaming bowl with procedural surface ripples and spoon handle
      case 'soup_bowl': {
        this.drawSoupBowl(cx, cy + 80, palette, recipe);
        break;
      }

      // Legacy: Analog clock with hour/minute hands and tick marks
      case 'clock_face': {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 160, Math.sin(a) * 160);
          ctx.lineTo(Math.cos(a) * 185, Math.sin(a) * 185);
          ctx.stroke();
        }

        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(80, 20);
        ctx.stroke();
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-40, -130);
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // Legacy: Retro CRT television set
      case 'antique_tv': {
        ctx.save();
        ctx.translate(cx, cy + 30);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-60, -180);
        ctx.lineTo(-140, -320);
        ctx.moveTo(60, -180);
        ctx.lineTo(140, -320);
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.roundRect(-240, -180, 480, 360, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(-200, -140, 320, 280, 30);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let y = -130; y < 130; y += 12) {
          ctx.fillRect(-190, y, 300, 4);
        }

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(170, -60, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(170, 20, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // Legacy: Vintage rotary telephone base
      case 'rotary_phone': {
        ctx.save();
        ctx.translate(cx, cy + 40);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-220, -160, 440, 60, 20);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-180, 140);
        ctx.lineTo(180, 140);
        ctx.lineTo(120, -100);
        ctx.lineTo(-120, -100);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 20, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.stroke();

        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5.5 + 0.3;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 45, 20 + Math.sin(a) * 45, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        break;
      }

      // Legacy: Minimalist stylized toilet fixture
      case 'porcelain_fixture': {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.16);

        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(-90, -180, 180, 130, 14);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(-100, -200, 200, 26, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(60, -165, 30, 8);

        ctx.beginPath();
        ctx.moveTo(-80, -50);
        ctx.bezierCurveTo(-140, 20, -120, 120, -40, 140);
        ctx.lineTo(40, 140);
        ctx.bezierCurveTo(120, 120, 140, 20, 80, -50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(0, -20, 85, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, -15, 60, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // Legacy: Tapered stone obelisk or trapezoid
      case 'classical_monolith': {
        ctx.save();
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(cx - 110, 600);
        ctx.lineTo(cx - 70, 340);
        ctx.lineTo(cx + 70, 340);
        ctx.lineTo(cx + 110, 600);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.fillStyle = palette.primary;
        ctx.beginPath();
        ctx.arc(cx, 440, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      }

      // Legacy: Erlenmeyer laboratory flask
      case 'laboratory_flask': {
        ctx.save();
        ctx.translate(cx, cy + 40);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-40, -180);
        ctx.lineTo(-40, -80);
        ctx.lineTo(-180, 160);
        ctx.lineTo(180, 160);
        ctx.lineTo(40, -80);
        ctx.lineTo(40, -180);
        ctx.stroke();

        ctx.fillStyle = palette.primary;
        ctx.beginPath();
        ctx.moveTo(-160, 140);
        ctx.lineTo(160, 140);
        ctx.lineTo(100, 30);
        ctx.bezierCurveTo(40, 20, -40, 40, -100, 30);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(-20, 80, 14, 0, Math.PI * 2);
        ctx.arc(40, 60, 18, 0, Math.PI * 2);
        ctx.arc(10, 110, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // Legacy: Paneled office doorway
      case 'office_door': {
        ctx.save();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 220, 140, 440, 720);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 8;
        ctx.strokeRect(cx - 220, 140, 440, 720);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(cx - 170, 200, 340, 360);
        ctx.strokeRect(cx - 170, 200, 340, 360);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 24px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CLONE RECOVERY', cx, 360);
        ctx.fillText('COUNSELING', cx, 400);

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(cx + 150, 620, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // Legacy: Translucent glossy cheese slices
      case 'stack_slices': {
        this.drawLaminatedCheesePlatter(cx, cy + 40, palette);
        break;
      }

      // Legacy: Isometric wireframe cube or interlocking mosaic tiles
      case 'geometric_cube':
      default: {
        // 1. Check if this subject is an image file
        const subjectStr = String(subject || '');
        if (subjectStr.includes('.png') || subjectStr.includes('.jpg') || subjectStr.includes('.webp')) {
          const img = imageCache[subjectStr];

         if (img && img.complete && img.naturalWidth > 0) {
            try {
              ctx.save();
              
              // --- 1. LAYOUT AWARENESS ENGINE ---
              // Calculate a dynamic bounding box (Safe Zone) that actively dodges the text
              let safeX = 512, safeY = 512, safeW = 850, safeH = 850;
              const textLayout = recipe.titleLayout || 'bottom-banner';
              
              if (textLayout === 'top-arc') {
                safeY = 620; safeH = 650; // Push down away from top arc
              } else if (textLayout === 'bottom-banner' || textLayout === 'tiny-caption') {
                safeY = 400; safeH = 650; // Push up away from bottom banner
              } else if (textLayout === 'vertical-edge') {
                safeX = 650; safeW = 600; // Push right away from left edge text
              } else if (textLayout === 'split-corners' || textLayout === 'diagonal-cross') {
                safeW = 550; safeH = 550; // Shrink safe zone tightly to the dead center
              }

              // --- 2. COMPOSITION ENGINE ---
              // Highly varied layout probabilities (No more rigid 75% centering)
              const rand = Math.random();
              let mode = 0;
              if (rand < 0.25) mode = 1;      // 25% The Giant (Massive, skewed off-edge)
              else if (rand < 0.50) mode = 2; // 25% The Floater (Randomly placed entirely inside safe zone)
              else if (rand < 0.65) mode = 3; // 15% The Swarm (Scattered small copies)
              else if (rand < 0.80) mode = 4; // 15% The Twins (Symmetrical pair)
              // Remaining 20% is mode 0 (Classic Safe Center)

              // Calculate base fit ratio based on the safe bounding box
              const ratio = Math.min(safeW / img.naturalWidth, safeH / img.naturalHeight);
              const baseW = img.naturalWidth * ratio;
              const baseH = img.naturalHeight * ratio;

              switch (mode) {
                case 1: { 
                  // THE GIANT: Massively scaled, wild rotation, bleeding off the edges of the canvas
                  const scale = 1.6 + Math.random() * 0.8; // 160% to 240% size
                  const xOff = 512 + (Math.random() * 500 - 250); 
                  const yOff = 512 + (Math.random() * 500 - 250);
                  const rot = (Math.random() * 120 - 60) * (Math.PI / 180); 
                  ctx.translate(xOff, yOff);
                  ctx.rotate(rot);
                  ctx.drawImage(img, -(baseW * scale)/2, -(baseH * scale)/2, baseW * scale, baseH * scale);
                  break;
                }
                case 2: { 
                  // THE FLOATER: Single image, placed completely randomly but STRICTLY inside the safe zone
                  const scale = 0.5 + Math.random() * 0.5; // 50% to 100% of safe size
                  const maxPanX = (safeW - (baseW * scale)) / 2;
                  const maxPanY = (safeH - (baseH * scale)) / 2;
                  const xOff = safeX + (Math.random() * maxPanX * 2 - maxPanX);
                  const yOff = safeY + (Math.random() * maxPanY * 2 - maxPanY);
                  const rot = (Math.random() * 60 - 30) * (Math.PI / 180);
                  
                  ctx.translate(xOff, yOff);
                  ctx.rotate(rot);
                  ctx.drawImage(img, -(baseW * scale)/2, -(baseH * scale)/2, baseW * scale, baseH * scale);
                  break;
                }
                case 3: { 
                  // THE SWARM: 3 to 6 small copies scattered dynamically inside the safe zone
                  const copies = Math.floor(Math.random() * 4) + 3;
                  for (let i = 0; i < copies; i++) {
                    ctx.save();
                    const scale = 0.3 + Math.random() * 0.4;
                    const xOff = safeX + (Math.random() * safeW - safeW/2);
                    const yOff = safeY + (Math.random() * safeH - safeH/2);
                    const rot = (Math.random() * 360) * (Math.PI / 180);
                    
                    ctx.translate(xOff, yOff);
                    ctx.rotate(rot);
                    ctx.drawImage(img, -(baseW * scale)/2, -(baseH * scale)/2, baseW * scale, baseH * scale);
                    ctx.restore();
                  }
                  break;
                }
                case 4: { 
                  // THE TWINS: Mirrored pair scaled and fitted neatly inside the safe zone
                  const scale = 0.6 + Math.random() * 0.2;
                  const spread = (safeW * 0.25) + Math.random() * (safeW * 0.15);
                  const yJiggle = (Math.random() - 0.5) * (safeH * 0.2);
                  const rot = (Math.random() * 20 - 10) * (Math.PI / 180);

                  ctx.save();
                  ctx.translate(safeX - spread, safeY + yJiggle);
                  ctx.rotate(rot);
                  ctx.drawImage(img, -(baseW * scale)/2, -(baseH * scale)/2, baseW * scale, baseH * scale);
                  ctx.restore();

                  ctx.save();
                  ctx.translate(safeX + spread, safeY + yJiggle);
                  ctx.rotate(-rot);
                  ctx.scale(-1, 1);
                  ctx.drawImage(img, -(baseW * scale)/2, -(baseH * scale)/2, baseW * scale, baseH * scale);
                  ctx.restore();
                  break;
                }
                case 0:
                default: { 
                  // CLASSIC SAFE CENTER: Sits perfectly in the middle of the safe zone
                  const scale = 0.85 + Math.random() * 0.15;
                  const rot = (Math.random() * 10 - 5) * (Math.PI / 180);
                  const flipH = Math.random() > 0.5 ? 1 : -1;
                  ctx.translate(safeX, safeY);
                  ctx.rotate(rot);
                  ctx.scale(flipH, 1);
                  ctx.drawImage(img, -(baseW * scale)/2, -(baseH * scale)/2, baseW * scale, baseH * scale);
                  break;
                }
              }
              
              ctx.restore();
              break;
            } catch (err) {
              console.warn(`Could not draw subject ${subject}, falling back:`, err);
            }
          }
        }

        // 2. Fallback procedural wireframe cube
        ctx.save();
        ctx.translate(cx, cy);
        const s = 160;
        ctx.fillStyle = palette.primary;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.866, -s * 0.5);
        ctx.lineTo(0, 0);
        ctx.lineTo(-s * 0.866, -s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = palette.secondary;
        ctx.beginPath();
        ctx.moveTo(-s * 0.866, -s * 0.5);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.866, s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.866, -s * 0.5);
        ctx.lineTo(s * 0.866, s * 0.5);
        ctx.lineTo(0, s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      }
    }
  }

  // =========================================================================
  // CORE 15 SUBJECT DRAWING ROUTINES
  // =========================================================================

  // 1. Pants (Blue trousers)
  private drawPants(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    // Sagging line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 260);
    ctx.quadraticCurveTo(cx, 310, 944, 260);
    ctx.stroke();

    // Billowing trousers
    ctx.translate(cx - 30, 290);
    ctx.rotate(0.22);

    ctx.fillStyle = '#2563eb';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-130, 0);
    ctx.lineTo(130, 0);
    ctx.bezierCurveTo(180, 120, 240, 260, 210, 310);
    ctx.lineTo(110, 310);
    ctx.bezierCurveTo(90, 210, 30, 160, 0, 150);
    ctx.bezierCurveTo(-30, 160, -90, 210, -110, 310);
    ctx.lineTo(-210, 310);
    ctx.bezierCurveTo(-240, 260, -180, 120, -130, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pockets
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 4;
    ctx.strokeRect(-110, 15, 50, 40);
    ctx.strokeRect(60, 15, 50, 40);
    ctx.restore();
  }

  // 2. Bed (Wooden headboard with white sheets)
  private drawBed(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy + 40);

    // Pine headboard
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-300, -220, 600, 260);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 7;
    ctx.strokeRect(-300, -220, 600, 260);

    // Headboard vertical slats
    ctx.fillStyle = '#92400e';
    for (let x = -260; x <= 220; x += 80) {
      ctx.fillRect(x, -200, 45, 230);
      ctx.strokeRect(x, -200, 45, 230);
    }

    // Pillows
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-240, -10, 200, 90, 16);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(40, -10, 200, 90, 16);
    ctx.fill();
    ctx.stroke();

    // Crumpled white sheets
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-310, 50);
    ctx.bezierCurveTo(-160, 10, -50, 90, 80, 40);
    ctx.bezierCurveTo(180, 10, 260, 80, 310, 50);
    ctx.lineTo(310, 230);
    ctx.lineTo(-310, 230);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 3. Cheese (Yellow wedge with holes)
  private drawCheeseWedge(chX: number, chY: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 24;

    ctx.fillStyle = palette.secondary || '#facc15';
    ctx.beginPath();
    ctx.moveTo(chX - 160, chY - 40);
    ctx.lineTo(chX + 130, chY - 140);
    ctx.lineTo(chX + 170, chY + 10);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(chX - 160, chY - 40);
    ctx.lineTo(chX + 170, chY + 10);
    ctx.lineTo(chX + 170, chY + 110);
    ctx.lineTo(chX - 160, chY + 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(chX + 130, chY - 140);
    ctx.lineTo(chX + 170, chY + 10);
    ctx.lineTo(chX + 170, chY + 110);
    ctx.lineTo(chX + 130, chY - 40);
    ctx.closePath();
    ctx.fill();

    const holes = [
      { x: chX - 60, y: chY + 10, rx: 24, ry: 20, fill: '#b45309' },
      { x: chX + 40, y: chY + 50, rx: 32, ry: 26, fill: '#b45309' },
      { x: chX + 110, y: chY + 30, rx: 22, ry: 18, fill: '#b45309' },
      { x: chX - 10, y: chY - 70, rx: 26, ry: 14, fill: '#d97706' },
      { x: chX + 80, y: chY - 80, rx: 28, ry: 16, fill: '#d97706' },
    ];

    holes.forEach((h) => {
      ctx.fillStyle = h.fill;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, h.rx, h.ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(chX - 160, chY - 40);
    ctx.lineTo(chX + 130, chY - 140);
    ctx.lineTo(chX + 170, chY + 10);
    ctx.lineTo(chX + 170, chY + 110);
    ctx.lineTo(chX - 160, chY + 60);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // 4. Ear (Anatomical ear profile)
  private drawEar(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#e7e5e4';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 100, cy - 220);
    ctx.bezierCurveTo(cx + 140, cy - 240, cx + 220, cy - 80, cx + 180, cy + 80);
    ctx.bezierCurveTo(cx + 150, cy + 200, cx + 80, cy + 240, cx - 20, cy + 250);
    ctx.bezierCurveTo(cx - 80, cy + 250, cx - 110, cy + 190, cx - 80, cy + 120);
    ctx.bezierCurveTo(cx - 50, cy + 60, cx - 40, cy - 40, cx - 90, cy - 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 160);
    ctx.bezierCurveTo(cx + 90, cy - 170, cx + 120, cy - 50, cx + 90, cy + 40);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Tooth (Stylized anatomical white molar with two roots)
  private drawTooth(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy + 10);

    // Molar drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 16;

    // Outer molar path: crown cusps, cervical neck, bifurcated roots
    ctx.fillStyle = '#f8fafc'; // White enamel
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Top Left Cusp
    ctx.moveTo(-90, -130);
    ctx.bezierCurveTo(-110, -170, -40, -180, 0, -150); // Valley between cusps
    ctx.bezierCurveTo(40, -180, 110, -170, 90, -130); // Top Right Cusp
    // Right crown side & cervical neck
    ctx.bezierCurveTo(115, -60, 95, 0, 75, 40);
    // Right root curving down & right
    ctx.bezierCurveTo(90, 100, 95, 170, 60, 200);
    ctx.bezierCurveTo(35, 210, 20, 170, 20, 120);
    // Valley between bifurcated roots
    ctx.bezierCurveTo(15, 60, -15, 60, -20, 120);
    // Left root curving down & left
    ctx.bezierCurveTo(-20, 170, -35, 210, -60, 200);
    ctx.bezierCurveTo(-95, 170, -90, 100, -75, 40);
    // Left crown side
    ctx.bezierCurveTo(-95, 0, -115, -60, -90, -130);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Enamel shading on right side
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.bezierCurveTo(40, -180, 110, -170, 90, -130);
    ctx.bezierCurveTo(115, -60, 95, 0, 75, 40);
    ctx.bezierCurveTo(90, 100, 95, 170, 60, 200);
    ctx.bezierCurveTo(45, 205, 30, 180, 25, 130);
    ctx.bezierCurveTo(35, 60, 15, -20, 10, -80);
    ctx.closePath();
    ctx.fill();

    // Dental developmental groove line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.lineTo(0, -50);
    ctx.stroke();

    // Specular highlight gleam on upper-left cusp
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-55, -145, 22, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 6. Anvil (Heavy, dark iron blacksmith anvil with flat top and pointed horn)
  private drawAnvil(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy + 20);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 20;

    // Body of the anvil
    ctx.fillStyle = '#1e293b'; // Cast charcoal iron
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Horn / beak tip on left
    ctx.moveTo(-220, -100);
    // Top face (flat hardened steel plate)
    ctx.quadraticCurveTo(-140, -115, -100, -115);
    ctx.lineTo(190, -115);
    // Heel & cutting step on right
    ctx.lineTo(190, -50);
    ctx.lineTo(130, -50);
    // Waist curving in
    ctx.bezierCurveTo(80, 0, 60, 60, 110, 120);
    // Base right foot
    ctx.lineTo(190, 150);
    ctx.lineTo(190, 170);
    // Bottom mounting arch
    ctx.lineTo(40, 170);
    ctx.bezierCurveTo(0, 140, -40, 140, -40, 170);
    // Base left foot
    ctx.lineTo(-190, 170);
    ctx.lineTo(-190, 150);
    // Waist left side
    ctx.lineTo(-110, 120);
    ctx.bezierCurveTo(-60, 60, -80, 0, -130, -50);
    // Under-curve of the horn
    ctx.quadraticCurveTo(-170, -70, -220, -100);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Top face steel plate highlight
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(-95, -113, 280, 20, 4);
    ctx.fill();

    // Hardy hole on heel
    ctx.fillStyle = '#09090b';
    ctx.fillRect(140, -105, 18, 18);

    // Horn highlight streak
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-205, -102);
    ctx.quadraticCurveTo(-150, -110, -100, -110);
    ctx.stroke();

    ctx.restore();
  }

  // 7. UFO (Retro flying saucer with glass dome and glowing bottom thrusters)
  private drawUfo(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);

    // Glowing propulsion cone/beam radiating downward
    const beamGrad = ctx.createLinearGradient(0, 20, 0, 260);
    beamGrad.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
    beamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
    beamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-70, 30);
    ctx.lineTo(-190, 260);
    ctx.lineTo(190, 260);
    ctx.lineTo(70, 30);
    ctx.closePath();
    ctx.fill();

    // Glass Dome
    ctx.fillStyle = '#67e8f9';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, -50, 110, 85, 0, Math.PI, 0); // top half
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dome reflection streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-35, -75, 45, 22, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Main Saucer Disc Hull
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 16;

    ctx.fillStyle = palette.secondary || '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 240, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Lower Hull Under-rim
    ctx.fillStyle = this.adjustBrightness(palette.secondary || '#94a3b8', -25);
    ctx.beginPath();
    ctx.ellipse(0, 15, 170, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Porthole lights along rim
    const portholes = [-170, -110, -55, 0, 55, 110, 170];
    portholes.forEach((px) => {
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  // 8. Cactus (Green saguaro cactus with two bent arms and dark green needle lines)
  private drawCactus(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy + 30);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 16;

    ctx.fillStyle = '#16a34a'; // Vibrant desert saguaro green
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Left Arm (lower, bends up)
    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.lineTo(-130, 0);
    ctx.bezierCurveTo(-160, 0, -160, -30, -160, -60);
    ctx.lineTo(-160, -130);
    ctx.bezierCurveTo(-160, -160, -110, -160, -110, -130);
    ctx.lineTo(-110, -40);
    ctx.bezierCurveTo(-110, -25, -95, -25, -45, -25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Arm (higher, bends up)
    ctx.beginPath();
    ctx.moveTo(45, -60);
    ctx.lineTo(130, -60);
    ctx.bezierCurveTo(160, -60, 160, -90, 160, -120);
    ctx.lineTo(160, -190);
    ctx.bezierCurveTo(160, -220, 110, -220, 110, -190);
    ctx.lineTo(110, -100);
    ctx.bezierCurveTo(110, -85, 95, -85, 45, -85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Column Trunk
    ctx.beginPath();
    ctx.roundRect(-45, -230, 90, 420, [45, 45, 0, 0]);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Vertical ribbed contours & needle tick marks
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, -210);
    ctx.lineTo(-20, 180);
    ctx.moveTo(20, -210);
    ctx.lineTo(20, 180);
    ctx.stroke();

    // Black needle spikes along side edges
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    for (let y = -200; y <= 160; y += 35) {
      // left trunk
      ctx.beginPath();
      ctx.moveTo(-45, y);
      ctx.lineTo(-58, y - 8);
      ctx.stroke();
      // right trunk
      ctx.beginPath();
      ctx.moveTo(45, y + 15);
      ctx.lineTo(58, y + 7);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 9. Magnet (Classic horseshoe magnet, painted red with silver tips and magnetic wave lines)
  private drawMagnet(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy - 20);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;

    // Red Enamel U-Body
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Outer arch
    ctx.arc(0, -20, 160, Math.PI, 0, false);
    ctx.lineTo(160, 60);
    ctx.lineTo(95, 60);
    ctx.lineTo(95, -20);
    // Inner arch
    ctx.arc(0, -20, 95, 0, Math.PI, true);
    ctx.lineTo(-95, 60);
    ctx.lineTo(-160, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Silver/Chrome Pole Tips
    ctx.fillStyle = '#f1f5f9';
    // Left tip (North)
    ctx.beginPath();
    ctx.rect(-160, 60, 65, 80);
    ctx.fill();
    ctx.stroke();
    // Right tip (South)
    ctx.beginPath();
    ctx.rect(95, 60, 65, 80);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Stamped 'N' and 'S'
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px "Oswald", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', -128, 115);
    ctx.fillText('S', 128, 115);

    // Glossy reflection streak on red curve
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, -20, 140, Math.PI * 1.1, Math.PI * 1.45, false);
    ctx.stroke();

    // Radiating Magnetic Flux Wave Arcs between tips
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    for (let r = 50; r <= 130; r += 35) {
      ctx.beginPath();
      ctx.arc(0, 100, r, 0, Math.PI, false);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.restore();
  }

  // 10. Key (Antique brass skeleton key with ornate bow and blocky teeth)
  private drawKey(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.35); // Vintage angled tilt

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 16;

    ctx.fillStyle = '#eab308'; // Antique warm brass
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';

    // Ornate Trefoil / Cloverleaf Bow at Top
    ctx.beginPath();
    ctx.arc(0, -150, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bow cutout circles
    ctx.fillStyle = palette.background;
    ctx.beginPath();
    ctx.arc(-22, -165, 18, 0, Math.PI * 2);
    ctx.arc(22, -165, 18, 0, Math.PI * 2);
    ctx.arc(0, -125, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Cylindrical Shaft
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-14, -85, 28, 260);
    ctx.strokeRect(-14, -85, 28, 260);

    // Decorative turned collar rings on shaft
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-22, -75, 44, 16);
    ctx.strokeRect(-22, -75, 44, 16);
    ctx.fillRect(-20, 130, 40, 14);
    ctx.strokeRect(-20, 130, 40, 14);

    // Blocky Bit / Flag with teeth at bottom
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(14, 80);
    ctx.lineTo(85, 80);
    ctx.lineTo(85, 110);
    ctx.lineTo(55, 110);
    ctx.lineTo(55, 130);
    ctx.lineTo(85, 130);
    ctx.lineTo(85, 175);
    ctx.lineTo(14, 175);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metallic highlight line down shaft
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -60);
    ctx.lineTo(-6, 160);
    ctx.stroke();

    ctx.restore();
  }

  // 11. Anchor (Heavy navy iron ship anchor with top ring and curved flukes)
  private drawAnchor(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;

    ctx.fillStyle = '#1e293b'; // Cast iron navy slate
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    // Top Shackle / Ring
    ctx.beginPath();
    ctx.arc(0, -180, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.background;
    ctx.beginPath();
    ctx.arc(0, -180, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Horizontal Stock Bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(-150, -145, 300, 26);
    ctx.strokeRect(-150, -145, 300, 26);
    // Ball tips on stock
    ctx.beginPath();
    ctx.arc(-150, -132, 20, 0, Math.PI * 2);
    ctx.arc(150, -132, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Shank
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, -145, 36, 300);
    ctx.strokeRect(-18, -145, 36, 300);

    // Curved Arms & Barbed Flukes at bottom
    ctx.beginPath();
    ctx.moveTo(-18, 120);
    // Left sweeping arm
    ctx.bezierCurveTo(-100, 120, -180, 70, -190, -20);
    // Left fluke triangle point
    ctx.lineTo(-150, 0);
    ctx.lineTo(-135, -45);
    ctx.bezierCurveTo(-130, 80, -60, 170, 0, 175);
    // Right sweeping arm
    ctx.bezierCurveTo(60, 170, 130, 80, 135, -45);
    ctx.lineTo(150, 0);
    ctx.lineTo(190, -20);
    ctx.bezierCurveTo(180, 70, 100, 120, 18, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // 12. Lightbulb (Glowing yellow incandescent glass bulb with grey threaded screw base)
  private drawLightbulb(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);

    // Illumination Halo Glow
    const bulbGlow = ctx.createRadialGradient(0, -60, 30, 0, -60, 260);
    bulbGlow.addColorStop(0, 'rgba(253, 224, 71, 0.6)');
    bulbGlow.addColorStop(0.6, 'rgba(251, 146, 60, 0.2)');
    bulbGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bulbGlow;
    ctx.beginPath();
    ctx.arc(0, -60, 260, 0, Math.PI * 2);
    ctx.fill();

    // Radiating comic spark rays
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 165, -60 + Math.sin(a) * 165);
      ctx.lineTo(Math.cos(a) * 200, -60 + Math.sin(a) * 200);
      ctx.stroke();
    }

    // Glass Bulb Envelope
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(0, -70, 125, Math.PI * 0.78, Math.PI * 0.22, false);
    ctx.bezierCurveTo(75, 40, 50, 70, 45, 95);
    ctx.lineTo(-45, 95);
    ctx.bezierCurveTo(-50, 70, -75, 40, -88, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Tungsten Coiled Filament
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-25, 95);
    ctx.lineTo(-25, -30);
    ctx.lineTo(-12, -75);
    ctx.lineTo(0, -60);
    ctx.lineTo(12, -75);
    ctx.lineTo(25, -30);
    ctx.lineTo(25, 95);
    ctx.stroke();

    // Screw Base with threaded ribs
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 5;
    for (let t = 0; t < 4; t++) {
      ctx.beginPath();
      ctx.roundRect(-42, 95 + t * 20, 84, 18, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Black Contact Terminal at base
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-24, 175, 48, 18, [0, 0, 12, 12]);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // 13. Skull (Minimalist stylized white human skull with hollow eye sockets)
  private drawSkull(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;

    // Bone White Skull Contour
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Rounded Cranium
    ctx.arc(0, -40, 160, Math.PI * 0.9, Math.PI * 0.1, false);
    // Zygomatic cheek arches
    ctx.bezierCurveTo(155, 60, 110, 80, 80, 110);
    // Upper Jaw
    ctx.lineTo(75, 170);
    ctx.lineTo(-75, 170);
    ctx.lineTo(-80, 110);
    ctx.bezierCurveTo(-110, 80, -155, 60, -153, -25);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Hollow Eye Sockets
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(-55, -20, 38, 48, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(55, -20, 38, 48, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Inverted Heart Nasal Cavity
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(16, 65);
    ctx.lineTo(0, 60);
    ctx.lineTo(-16, 65);
    ctx.closePath();
    ctx.fill();

    // Teeth Lines
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, 135);
    ctx.lineTo(60, 135);
    ctx.stroke();

    for (let tx = -40; tx <= 40; tx += 20) {
      ctx.beginPath();
      ctx.moveTo(tx, 115);
      ctx.lineTo(tx, 165);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 14. Crown (Golden king's crown with 3 peaks and colored jewel circles)
  private drawCrown(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 20;

    // Golden Crown Body
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Headband bottom curve
    ctx.moveTo(-180, 100);
    ctx.quadraticCurveTo(0, 125, 180, 100);
    // Right wall
    ctx.lineTo(200, 20);
    // Right Peak
    ctx.lineTo(170, -80);
    // Dip
    ctx.lineTo(85, 10);
    // Center High Peak
    ctx.lineTo(0, -140);
    // Dip
    ctx.lineTo(-85, 10);
    // Left Peak
    ctx.lineTo(-170, -80);
    // Left wall
    ctx.lineTo(-200, 20);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Gold Pearl balls on peaks
    const balls = [
      { x: -170, y: -80 },
      { x: 0, y: -140 },
      { x: 170, y: -80 },
    ];
    balls.forEach((b) => {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Headband trim band
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(-180, 65);
    ctx.quadraticCurveTo(0, 90, 180, 65);
    ctx.lineTo(180, 100);
    ctx.quadraticCurveTo(0, 125, -180, 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inlaid Jewel Circles
    const jewels = [
      { x: -110, y: 80, color: '#3b82f6', r: 14 }, // Sapphire
      { x: 0, y: 92, color: '#ef4444', r: 18 },    // Ruby
      { x: 110, y: 80, color: '#10b981', r: 14 },  // Emerald
      { x: 0, y: -40, color: '#ef4444', r: 16 },   // Center crown ruby
    ];

    jewels.forEach((j) => {
      ctx.fillStyle = j.color;
      ctx.beginPath();
      ctx.arc(j.x, j.y, j.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Gleam
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(j.x - j.r * 0.35, j.y - j.r * 0.35, j.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // 15. Bomb (Classic round black cartoon bomb with sparking lit fuse)
  private drawBomb(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy + 20);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 24;

    // Cannonball Bomb Sphere
    ctx.fillStyle = '#18181b'; // Matte deep charcoal black
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 20, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Specular Curved Crescent Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 20, 130, Math.PI * 1.15, Math.PI * 1.45, false);
    ctx.stroke();

    // Fuse Collar Neck
    ctx.fillStyle = '#3f3f46';
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-30, -165, 60, 35, 6);
    ctx.fill();
    ctx.stroke();

    // Curving Braided Fuse
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -165);
    ctx.bezierCurveTo(-20, -220, 60, -230, 80, -270);
    ctx.stroke();

    // Sparking Starburst Flame at Tip
    const sparkX = 80;
    const sparkY = -270;

    // Outer Yellow Spark
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    const spikes = 10;
    const outerR = 40;
    const innerR = 18;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes;
      const x = sparkX + Math.cos(angle) * r;
      const y = sparkY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Inner Orange Spark
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR * 0.55 : innerR * 0.55;
      const angle = (i * Math.PI) / spikes + 0.2;
      const x = sparkX + Math.cos(angle) * r;
      const y = sparkY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Flying Embers
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(sparkX + 35, sparkY - 30, 6, 0, Math.PI * 2);
    ctx.arc(sparkX - 25, sparkY - 25, 4, 0, Math.PI * 2);
    ctx.arc(sparkX + 20, sparkY + 25, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 16. Angry Person (Thick-line stick figure with hands on hips, circular head, downward-angled eyebrows)
  private drawAngryPerson(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy + 30);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 220, 110, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso / Spine (Thick vertical line)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, -75);
    ctx.lineTo(0, 75);
    ctx.stroke();

    // Sturdy Legs Planted Firmly Apart
    ctx.lineWidth = 13;
    // Left Leg
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(-75, 215);
    ctx.lineTo(-115, 215); // flat planted foot
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(75, 215);
    ctx.lineTo(115, 215); // flat planted foot
    ctx.stroke();

    // Hands on Hips (Bent outward elbows)
    ctx.lineWidth = 12;
    // Left Arm: From neck/shoulder out to elbow, then back in to hip
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(-95, -10);
    ctx.lineTo(-20, 60);
    ctx.stroke();

    // Right Arm: From neck/shoulder out to elbow, then back in to hip
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(95, -10);
    ctx.lineTo(20, 60);
    ctx.stroke();

    // Head (Large circular head)
    const headY = -140;
    const headR = 55;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sharp downward-angled angry eyebrows: \  /
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 8;
    ctx.beginPath();
    // Left eyebrow: high outer to low inner
    ctx.moveTo(-35, headY - 18);
    ctx.lineTo(-8, headY - 2);
    // Right eyebrow: high outer to low inner
    ctx.moveTo(35, headY - 18);
    ctx.lineTo(8, headY - 2);
    ctx.stroke();

    // Glaring Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-20, headY + 8, 7, 0, Math.PI * 2);
    ctx.arc(20, headY + 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Gritted/clenched straight angry mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-24, headY + 28);
    ctx.lineTo(24, headY + 28);
    ctx.stroke();

    // Cartoon Red Anger Steam Ticks (radiating from head)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    // Left steam marks
    ctx.beginPath();
    ctx.moveTo(-65, headY - 50);
    ctx.lineTo(-85, headY - 70);
    ctx.moveTo(-45, headY - 65);
    ctx.lineTo(-58, headY - 90);
    // Right steam marks
    ctx.moveTo(65, headY - 50);
    ctx.lineTo(85, headY - 70);
    ctx.moveTo(45, headY - 65);
    ctx.lineTo(58, headY - 90);
    ctx.stroke();

    ctx.restore();
  }

  // 17. Sneaky Person (Tiptoeing stick figure bent forward, wearing black bandit mask)
  private drawSneakyPerson(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx - 20, cy + 30);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Drop shadow under tiptoes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(85, 215, 25, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(-110, 210, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bent-Forward Spine (from hips to neck)
    const hipX = -50;
    const hipY = 60;
    const neckX = 35;
    const neckY = -70;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(neckX, neckY);
    ctx.stroke();

    // Tiptoeing Legs
    ctx.lineWidth = 13;
    // Front Leg: Lifted high forward, stepping gingerly on extreme tiptoe
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(25, 115); // bent knee forward
    ctx.lineTo(75, 195); // extended lower leg
    ctx.lineTo(85, 215); // vertical tiptoe point
    ctx.stroke();

    // Back Leg: Trailing behind stealthily on tiptoe
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(-95, 125); // knee back
    ctx.lineTo(-105, 195); // foot down
    ctx.lineTo(-115, 210); // tiptoe
    ctx.stroke();

    // Sneaky Creeping Arms
    ctx.lineWidth = 11;
    // Leading Arm reaching forward cautiously with bent wrist
    ctx.beginPath();
    ctx.moveTo(neckX, neckY + 15);
    ctx.lineTo(neckX + 85, neckY + 35); // elbow
    ctx.lineTo(neckX + 135, neckY + 20); // sneaky hand reaching forward
    ctx.stroke();

    // Trailing Arm tucked back stealthily
    ctx.beginPath();
    ctx.moveTo(neckX, neckY + 15);
    ctx.lineTo(hipX - 10, neckY + 45); // elbow back
    ctx.lineTo(hipX - 35, hipY + 10); // hand trailing
    ctx.stroke();

    // Head (Bent forward circle)
    const headX = neckX + 45;
    const headY = neckY - 45;
    const headR = 50;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Black Bandit Mask Across the Eyes
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(headX - 42, headY - 14, 84, 28, 12);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // White eye slits inside mask
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(headX - 18, headY, 9, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + 18, headY, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black pupils focused slyly forward
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headX - 14, headY, 4, 0, Math.PI * 2);
    ctx.arc(headX + 22, headY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mischievous smirk mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(headX + 8, headY + 24, 15, 0.2, Math.PI * 0.7);
    ctx.stroke();

    ctx.restore();
  }

  // 18. Confused Person (Shrugging stick figure with large procedural question mark)
  private drawConfusedPerson(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx - 30, cy + 30);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 215, 90, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso / Spine
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(0, 75);
    ctx.stroke();

    // Casual/Relaxed Stance Legs
    ctx.lineWidth = 13;
    // Left Leg
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(-55, 210);
    ctx.lineTo(-85, 210);
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(45, 210);
    ctx.lineTo(75, 210);
    ctx.stroke();

    // Shrugging Arms (Shoulders hunched high, elbows down, palms raised open skyward)
    ctx.lineWidth = 12;
    // Left Arm
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.lineTo(-65, -20); // elbow down
    ctx.lineTo(-105, -75); // forearm raised up with open palm
    ctx.stroke();
    // Open left palm fingers
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-105, -75);
    ctx.lineTo(-120, -90);
    ctx.moveTo(-105, -75);
    ctx.lineTo(-105, -95);
    ctx.stroke();

    // Right Arm
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.lineTo(65, -20); // elbow down
    ctx.lineTo(105, -75); // forearm raised up with open palm
    ctx.stroke();
    // Open right palm fingers
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(105, -75);
    ctx.lineTo(120, -90);
    ctx.moveTo(105, -75);
    ctx.lineTo(105, -95);
    ctx.stroke();

    // Tilted Head (quizzical angle)
    const headX = -5;
    const headY = -135;
    const headR = 52;
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(-0.15); // quizzical tilt

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Confused Asymmetrical Eyebrows
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    // Left eyebrow: high arched query
    ctx.beginPath();
    ctx.arc(-18, -18, 14, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    // Right eyebrow: flat skeptical line
    ctx.beginPath();
    ctx.moveTo(8, -12);
    ctx.lineTo(32, -8);
    ctx.stroke();

    // Uneven Eyes: Left eye wide open, right eye skeptical dot
    ctx.beginPath();
    ctx.arc(-18, 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Squiggly uncertain mouth line ~
    ctx.beginPath();
    ctx.moveTo(-20, 26);
    ctx.quadraticCurveTo(-10, 20, 0, 26);
    ctx.quadraticCurveTo(10, 32, 20, 26);
    ctx.stroke();
    ctx.restore();

    // Large Procedural Question Mark floating prominently next to head
    const qmX = 110;
    const qmY = -175;

    ctx.save();
    ctx.translate(qmX, qmY);
    ctx.rotate(0.12);

    // Question mark shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.drawQuestionMarkPath(ctx, 6, 6);
    ctx.fill();

    // Question mark main body
    ctx.fillStyle = '#f59e0b'; // vibrant warm amber
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    this.drawQuestionMarkPath(ctx, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  private drawQuestionMarkPath(ctx: CanvasRenderingContext2D, ox: number, oy: number): void {
    // Upper loop hook
    ctx.beginPath();
    ctx.arc(ox + 35, oy + 40, 35, Math.PI * 0.9, Math.PI * 2);
    ctx.arc(ox + 35, oy + 40, 16, 0, Math.PI * 0.9, true);
    ctx.closePath();
    // Stem
    ctx.rect(ox + 25, oy + 72, 20, 28);
    // Dot below
    ctx.arc(ox + 35, oy + 128, 12, 0, Math.PI * 2);
  }

  // =========================================================================
  // LAYER 3: GAG MODIFIERS
  // =========================================================================
  private renderModifier(modifier: GagModifierType, palette: VintagePalette, recipe: CanvasRecipe): void {
    const { ctx } = this;
    const cx = 512;
    const cy = 512;

    // 1. Intercept Emoji Modifiers First
    if (String(modifier).startsWith('emoji_')) {
      const icon = String(modifier).replace('emoji_', '');
      ctx.save();
      
      // Calculate safe peripheral orbit: Left or Right flanks
      // Avoids the center (subject) and top/bottom edges (text)
      const isLeft = Math.random() > 0.5;
      const angle = isLeft 
        ? (Math.PI * 0.75 + Math.random() * (Math.PI * 0.5))  // Mid-left arc
        : (Math.PI * -0.25 + Math.random() * (Math.PI * 0.5)); // Mid-right arc
      
      const radius = 280 + Math.random() * 70; // Keep 280-350px away from the center
      const ex = 512 + Math.cos(angle) * radius;
      const ey = 512 + Math.sin(angle) * radius;
      
      // Smaller, controlled scale limits
      const rot = (Math.random() * 60 - 30) * (Math.PI / 180);
      const scale = 0.6 + Math.random() * 0.4; // Locks size between 60% to 100% of 140px

      ctx.translate(ex, ey);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      
      ctx.font = '140px Arial'; // Reduced base font size
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 8;
      ctx.fillText(icon, 0, 0);
      ctx.restore();
      return; // Exit early so it doesn't hit the switch
    }

    switch (modifier) {
      // 1. Bold red/white road danger sign with exclamation point
      // Randomized coordinate offsets avoiding top-center text zone
      case 'hazard_triangle': {
        ctx.save();
        const hazardPositions = [
          { x: cx + 220 + (Math.random() * 40 - 20), y: 560 + (Math.random() * 60 - 30), rot: 0.14 },
          { x: cx - 220 + (Math.random() * 40 - 20), y: 560 + (Math.random() * 60 - 30), rot: -0.16 },
          { x: cx + 180 + (Math.random() * 40 - 20), y: 720 + (Math.random() * 50 - 25), rot: 0.22 },
          { x: cx - 180 + (Math.random() * 40 - 20), y: 720 + (Math.random() * 50 - 25), rot: -0.2 },
        ];
        const hPos = hazardPositions[Math.floor(Math.random() * hazardPositions.length)];
        ctx.translate(hPos.x, hPos.y);
        ctx.rotate(hPos.rot);

        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 14;
        ctx.lineJoin = 'round';

        const size = 150;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.9, size * 0.6);
        ctx.lineTo(-size * 0.9, size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, -size * 0.45, 20, size * 0.48);
        ctx.beginPath();
        ctx.arc(0, size * 0.28, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // 2. Cross-hatched beige adhesive strip with gauze pad
      // Randomized coordinate offsets actively avoiding top-center text zone
      case 'adhesive_bandage': {
        ctx.save();
        const bandagePositions = [
          { x: cx - 40 + (Math.random() * 60 - 30), y: 670 + (Math.random() * 50 - 25), rot: -0.15 },
          { x: cx + 150 + (Math.random() * 40 - 20), y: 590 + (Math.random() * 60 - 30), rot: 0.22 },
          { x: cx - 160 + (Math.random() * 40 - 20), y: 580 + (Math.random() * 60 - 30), rot: -0.24 },
          { x: cx + 60 + (Math.random() * 50 - 25), y: 750 + (Math.random() * 40 - 20), rot: 0.12 },
        ];
        const bPos = bandagePositions[Math.floor(Math.random() * bandagePositions.length)];
        ctx.translate(bPos.x, bPos.y);
        ctx.rotate(bPos.rot);

        ctx.fillStyle = '#fed7aa';
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 6;
        ctx.fillRect(-120, -50, 240, 100);
        ctx.strokeRect(-120, -50, 240, 100);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-45, -45, 90, 90);
        ctx.strokeRect(-45, -45, 90, 90);

        ctx.fillStyle = '#fdba74';
        for (let x = -95; x <= 95; x += 18) {
          for (let y = -30; y <= 30; y += 20) {
            if (x >= -40 && x <= 40) continue;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.fillStyle = '#b91c1c';
        ctx.font = '900 24px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(recipe.subLabel || recipe.stampText || 'OWIE', 0, 8);
        ctx.restore();
        break;
      }

      // 3. Dynamic comic speech balloon with satirical denial
      // Randomized coordinate offsets actively avoiding top-center text zone
      case 'speech_bubble': {
        const speech = recipe.speechText || "IT'S NOT A FRANKFURTER!";
        ctx.save();
        
        // Position lower to give 400px subjects room above
        const isLeft = Math.random() > 0.5;
        const sbX = cx + (isLeft ? -170 : 170) + (Math.random() * 40 - 20);
        const sbY = 790 + (Math.random() * 30 - 15);

        ctx.translate(sbX, sbY);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 7;
        ctx.lineJoin = 'round';

        // Draw a single CONTINUOUS path for the bubble AND the tail so borders don't overlap
        ctx.beginPath();
        ctx.moveTo(-180, -45); // Top left
        ctx.lineTo(180, -45);  // Top right
        ctx.quadraticCurveTo(200, -45, 200, -20); 
        ctx.lineTo(200, 20);   // Bottom right
        ctx.quadraticCurveTo(200, 45, 180, 45);

        // The Tail
        if (isLeft) {
            ctx.lineTo(60, 45);
            ctx.lineTo(130, 90); // Tip pointing to center-right subject
            ctx.lineTo(20, 45);
        } else {
            ctx.lineTo(-20, 45);
            ctx.lineTo(-130, 90); // Tip pointing to center-left subject
            ctx.lineTo(-60, 45);
        }

        ctx.lineTo(-180, 45); // Bottom left
        ctx.quadraticCurveTo(-200, 45, -200, 20);
        ctx.lineTo(-200, -20);
        ctx.quadraticCurveTo(-200, -45, -180, -45);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Draw the Text inside the unified bubble
        ctx.fillStyle = '#dc2626';
        ctx.font = '900 22px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(speech, 0, 0);

        ctx.restore();
        break;
      }

      // 4. Distressed diagonal rubber-stamp banner
      case 'caution_stamp': {
        ctx.save();
        ctx.translate(cx + 160, 700);
        ctx.rotate(-0.25);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 6;
        ctx.strokeRect(-160, -45, 320, 90);

        ctx.fillStyle = '#dc2626';
        ctx.font = '900 30px "Oswald", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(recipe.stampText || 'INSPECTED', 0, 8);
        ctx.font = 'bold 12px "Courier Prime", monospace';
        ctx.fillText('REF: VOL-1 • CERTIFIED GAG', 0, 28);
        ctx.restore();
        break;
      }

      // 5. Radial neon halo or particle spray behind the subject
      case 'celestial_glow': {
        ctx.save();
        const halo = ctx.createRadialGradient(cx, cy, 60, cx, cy, 340);
        halo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        halo.addColorStop(0.6, 'rgba(192, 132, 252, 0.2)');
        halo.addColorStop(1, 'transparent');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, 340, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // 6. Clean composition
      case 'none':
      default:
        break;
    }
  }

  // =========================================================================
  // HELPER SUBROUTINES FOR LEGACY / STARTER ASSETS
  // =========================================================================
  private drawPastryNucleus(cx: number, cy: number, radius: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    ctx.beginPath();
    let r = 16;
    for (let a = 0; a < Math.PI * 7; a += 0.1) {
      r += 0.58;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const ex = cx + Math.cos(angle) * (radius * 0.7);
      const ey = cy + Math.sin(angle) * (radius * 0.7);
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + Math.cos(angle + 0.3) * 50, cy + Math.sin(angle + 0.3) * 50, ex, ey);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(cx - 35, cy - 40, 25, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawSoupBowl(cx: number, cy: number, palette: VintagePalette, recipe: CanvasRecipe): void {
    const { ctx } = this;
    ctx.save();

    // Check if drawing meatcake on a plate ("The Dog Will Eat It")
    if (recipe.focalItem?.toLowerCase().includes('meatcake') || recipe.focalItem?.toLowerCase().includes('dog')) {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 40, 280, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(cx - 180, cy - 140, 360, 180, [50, 50, 0, 0]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(cx - 140 + Math.random() * 280, cy - 120 + Math.random() * 120, 8, 8);
      }

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 8, cy - 220, 16, 80);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 235, 10, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 24;

    const bowlRadiusX = 260;
    const bowlRadiusY = 160;

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(cx, cy, bowlRadiusX, bowlRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 12;
    ctx.stroke();

    const soupGrad = ctx.createRadialGradient(cx, cy - 10, 20, cx, cy - 10, bowlRadiusX - 30);
    soupGrad.addColorStop(0, palette.primary);
    soupGrad.addColorStop(0.7, this.adjustBrightness(palette.primary, -20));
    soupGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = soupGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10, bowlRadiusX - 24, bowlRadiusY - 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    for (let r = 30; r <= 140; r += 35) {
      ctx.beginPath();
      ctx.ellipse(cx, cy - 10, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(cx - 120, cy - 80);
    ctx.rotate(-0.6);
    ctx.fillRect(-12, -180, 24, 180);
    ctx.strokeRect(-12, -180, 24, 180);
    ctx.restore();

    ctx.restore();
  }

  private drawLaminatedCheesePlatter(cx: number, cy: number, palette: VintagePalette): void {
    const { ctx } = this;
    const slices = [
      { x: cx - 80, y: cy - 40, angle: -12 },
      { x: cx + 70, y: cy - 10, angle: 8 },
      { x: cx, y: cy + 60, angle: -2, isTop: true },
    ];

    slices.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.angle * Math.PI) / 180);

      const size = 300;
      const margin = 24;
      const total = size + margin * 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(-total / 2, -total / 2, total, total, 6);
      ctx.fill();

      ctx.fillStyle = palette.secondary || '#facc15';
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, 4);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-total / 2, -total / 2, total, total);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(-size / 2 + 10, -size / 2);
      ctx.lineTo(-size / 2 + 70, -size / 2);
      ctx.lineTo(size / 2, size / 2 - 20);
      ctx.lineTo(size / 2, size / 2 - 80);
      ctx.closePath();
      ctx.fill();

      if (s.isTop) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-total / 2, -total / 2);
        ctx.lineTo(-total / 2 + 80, -total / 2);
        ctx.lineTo(-total / 2, -total / 2 + 80);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // ==========================================
  // CUSTOM PHOTO: Dynamic Darkroom Engine
  // ==========================================
  public async processCustomPhoto(imageSource: string): Promise<{ url: string; description: string }> {
    const { ctx, canvas } = this;
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.clearRect(0, 0, 1024, 1024);

        // --- 1. RANDOM FIT MODE ---
        const fitMode = Math.floor(Math.random() * 3);
        
        if (fitMode === 0) {
          // Letterbox Fit with cinematic blurred background
          ctx.filter = 'blur(30px) brightness(0.4)';
          ctx.drawImage(img, -50, -50, 1124, 1124); 
          ctx.filter = 'none';
          
          const ratio = Math.min(1024 / img.width, 1024 / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          ctx.drawImage(img, (1024 - w) / 2, (1024 - h) / 2, w, h);

        } else if (fitMode === 1) {
          // Avant-Garde Triptych Split (Mirrors outer edges inward)
          const stripW = img.width / 3;
          // Draw Center strip in the middle
          ctx.drawImage(img, stripW, 0, stripW, img.height, 341, 0, 342, 1024);
          // Draw Left strip on the Right (flipped)
          ctx.save();
          ctx.translate(1024, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, stripW, img.height, 0, 0, 342, 1024);
          ctx.restore();
          // Draw Right strip on the Left (flipped)
          ctx.save();
          ctx.translate(341, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, stripW * 2, 0, stripW, img.height, 0, 0, 341, 1024);
          ctx.restore();

        } else {
          // Classic Center Crop (Fill to edges)
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 1024, 1024);
        }

        // --- 2. RANDOM FILTER MODE ---
        const filterMode = Math.floor(Math.random() * 4);
        
        if (filterMode === 0) {
          // X-Ray / Color Invert (Punk aesthetic)
          ctx.globalCompositeOperation = 'difference';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1024, 1024);
          ctx.globalCompositeOperation = 'source-over';

        } else if (filterMode === 1) {
          // High-Contrast Noir (Grayscale)
          ctx.globalCompositeOperation = 'color';
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 1024, 1024); 
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(120, 120, 120, 0.6)';
          ctx.fillRect(0, 0, 1024, 1024); 

        } else if (filterMode === 2) {
          // Cyanotype / Blueprint Wash
          ctx.globalCompositeOperation = 'color';
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, 0, 1024, 1024);
          ctx.globalCompositeOperation = 'hard-light';
          ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
          ctx.fillRect(0, 0, 1024, 1024);

        } else {
          // Classic 70s Kodachrome (Warm)
          ctx.globalCompositeOperation = 'multiply';
          const warmWash = ctx.createLinearGradient(0, 0, 1024, 1024);
          warmWash.addColorStop(0, 'rgba(255, 237, 213, 0.4)');
          warmWash.addColorStop(1, 'rgba(254, 215, 170, 0.6)');
          ctx.fillStyle = warmWash;
          ctx.fillRect(0, 0, 1024, 1024);
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
          ctx.fillRect(0, 0, 1024, 1024);
        }

        // --- 3. ALWAYS APPLY PHYSICAL WEAR ---
        ctx.globalCompositeOperation = 'source-over';
        this.applyAnalogRingWearAndScuffing();

        ctx.restore();

        // Translate the random selections into a description for the UI Toast
        let fitName = fitMode === 0 ? 'Cinematic Blur' : fitMode === 1 ? 'Triptych Split' : 'Classic Crop';
        let filterName = filterMode === 0 ? 'X-Ray' : filterMode === 1 ? 'Noir Grayscale' : filterMode === 2 ? 'Cyanotype' : 'Kodachrome';

        resolve({
          url: canvas.toDataURL('image/jpeg', 0.92),
          description: `Applied ${filterName} filter with ${fitName} layout!`
        });
      };

      img.onerror = (err) => reject(err);
      img.src = imageSource;
    });
  }
  
  // ==========================================
  // PROCEDURAL BACKDROP DISTORTION ROUTINES
  // ==========================================
  private drawDistortedBackdrop(img: HTMLImageElement, width: number, height: number): void {
    const { ctx } = this;
    const styles = ['wave', 'tilt-zoom', 'mirror-zoom', 'standard'];
    const distortionType = styles[Math.floor(Math.random() * styles.length)];

    ctx.save();

    if (distortionType === 'wave') {
      // 1. Horizontal sine-wave liquid distortion
      const numSlices = 40;
      const waveFreq = 0.08 + Math.random() * 0.06;
      const waveAmp = 12 + Math.random() * 16;
      const phase = Math.random() * Math.PI * 2;

      const overScale = 1.08;
      const baseW = width * overScale;
      const baseH = height * overScale;
      const startX = (width - baseW) / 2;
      const startY = (height - baseH) / 2;

      for (let i = 0; i < numSlices; i++) {
        const sy = (i * img.height) / numSlices;
        const sh = img.height / numSlices;
        const dy = startY + (i * baseH) / numSlices;
        const dh = baseH / numSlices + 0.5;
        const dx = startX + Math.sin(i * waveFreq + phase) * waveAmp;
        ctx.drawImage(img, 0, sy, img.width, sh, dx, dy, baseW, dh);
      }
    } else if (distortionType === 'tilt-zoom') {
      // 2. Zoomed with natural tilt and offset
      const zoomScale = 1.15 + Math.random() * 0.15;
      const tiltAngle = ((Math.random() - 0.5) * 12 * Math.PI) / 180;
      const panX = (Math.random() - 0.5) * 60;
      const panY = (Math.random() - 0.5) * 60;

      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.rotate(tiltAngle);
      ctx.scale(zoomScale, zoomScale);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    } else if (distortionType === 'mirror-zoom') {
      // 3. Mirror-flip with zoom
      const zoomScale = 1.12 + Math.random() * 0.1;
      const flipH = Math.random() > 0.5 ? -1 : 1;
      const panY = (Math.random() - 0.5) * 40;

      ctx.translate(width / 2, height / 2 + panY);
      ctx.scale(flipH * zoomScale, zoomScale);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    } else {
      // 4. Standard full-bleed
      ctx.drawImage(img, 0, 0, width, height);
    }

    // Subtle film grain noise pass
    if (Math.random() > 0.3) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let n = 0; n < 2800; n++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        ctx.fillRect(nx, ny, 1.5, 1.5);
      }
    }

    ctx.restore();
  }

  // ==========================================
  // POST-PROCESSING: Ring-Wear & Scuffing
  // ==========================================
  private applyAnalogRingWearAndScuffing(): void {
    const { ctx } = this;
    const cx = 512;
    const cy = 512;

    ctx.save();

    // 50% chance to apply ring wear. When applied, make it whisper-thin and faint.
    if (Math.random() > 0.5) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(cx, cy, 390, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.025)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 400, 0, Math.PI * 2);
      ctx.stroke();
    }

    const edgeVignette = ctx.createRadialGradient(cx, cy, 420, cx, cy, 720);
    edgeVignette.addColorStop(0, 'transparent');
    edgeVignette.addColorStop(0.85, 'rgba(0, 0, 0, 0.15)');
    edgeVignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = edgeVignette;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    ctx.restore();
  }

  private adjustBrightness(hex: string, percent: number): string {
    const cleaned = hex.replace('#', '');
    if (cleaned.length !== 6) return hex;
    const num = parseInt(cleaned, 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }
}

export const gagCanvasEngine = new GagCanvasEngine();
