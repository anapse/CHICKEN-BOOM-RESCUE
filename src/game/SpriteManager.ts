/**
 * Centralized sprite/image loading for Chicken Boom Rescue.
 *
 * This class owns asset loading, cache state, frame cropping and animation timing.
 * It deliberately does NOT own gameplay rules, collision, damage, or bomb logic.
 */
export type SpriteLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface SpriteSheetLayout {
  columns: number;
  rows: number;
  /** Optional animation frame order; indexes are zero-based, row-major by default. */
  frames?: number[];
}

export interface SpriteDrawOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  frame?: number;
  layout?: SpriteSheetLayout;
  flipX?: boolean;
  alpha?: number;
}

interface SpriteEntry {
  image: HTMLImageElement;
  status: SpriteLoadStatus;
  error?: string;
  promise?: Promise<HTMLImageElement | null>;
}

export class SpriteManager {
  private readonly entries = new Map<string, SpriteEntry>();

  /** Load once and reuse the same HTMLImageElement for every renderer/component. */
  public load(src: string): Promise<HTMLImageElement | null> {
    const normalized = this.normalize(src);
    const existing = this.entries.get(normalized);
    if (existing?.status === 'loaded') return Promise.resolve(existing.image);
    if (existing?.status === 'loading' && existing.promise) return existing.promise;
    if (typeof window === 'undefined') return Promise.resolve(null);

    const image = existing?.image ?? new Image();
    const entry: SpriteEntry = { image, status: 'loading' };
    this.entries.set(normalized, entry);

    entry.promise = new Promise((resolve) => {
      image.onload = () => {
        entry.status = 'loaded';
        entry.error = undefined;
        resolve(image);
      };
      image.onerror = () => {
        entry.status = 'error';
        entry.error = `No se pudo cargar el recurso: ${normalized}`;
        resolve(null);
      };
      image.src = normalized;
      // Cached browser images can already be complete before handlers run.
      if (image.complete && image.naturalWidth > 0) {
        entry.status = 'loaded';
        resolve(image);
      }
    });
    return entry.promise;
  }

  /** Non-blocking lookup for the game's requestAnimationFrame renderer. */
  public getImage(src: string): HTMLImageElement | null {
    const normalized = this.normalize(src);
    const entry = this.entries.get(normalized);
    if (entry?.status === 'loaded' && entry.image.naturalWidth > 0) return entry.image;
    if (!entry) void this.load(normalized);
    return null;
  }

  public async preload(sources: string[]): Promise<void> {
    await Promise.all([...new Set(sources)].map((src) => this.load(src)));
  }

  public getStatus(src: string): SpriteLoadStatus {
    return this.entries.get(this.normalize(src))?.status ?? 'idle';
  }

  public getDimensions(src: string): { width: number; height: number } | null {
    const image = this.getImage(src);
    return image ? { width: image.naturalWidth, height: image.naturalHeight } : null;
  }

  public getErrors(): string[] {
    return [...this.entries.values()]
      .filter((entry) => entry.status === 'error' && entry.error)
      .map((entry) => entry.error as string);
  }

  /** Draw a full image or one explicitly configured frame from a sprite sheet. */
  public draw(
    ctx: CanvasRenderingContext2D,
    src: string,
    options: SpriteDrawOptions,
  ): boolean {
    const image = this.getImage(src);
    if (!image || image.naturalWidth <= 0 || image.naturalHeight <= 0) return false;

    const { x, y, width, height, frame = 0, layout, flipX = false, alpha = 1 } = options;
    ctx.save();
    ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));

    if (!layout) {
      if (flipX) {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0, width, height);
      } else {
        ctx.drawImage(image, x, y, width, height);
      }
      ctx.restore();
      return true;
    }

    if (!Number.isInteger(layout.columns) || !Number.isInteger(layout.rows) ||
        layout.columns < 1 || layout.rows < 1) {
      ctx.restore();
      return false;
    }

    const totalFrames = layout.columns * layout.rows;
    const order = layout.frames;
    const frameIndex = order?.[frame] ?? frame;
    if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= totalFrames) {
      ctx.restore();
      return false;
    }

    const frameWidth = image.naturalWidth / layout.columns;
    const frameHeight = image.naturalHeight / layout.rows;
    const sourceX = (frameIndex % layout.columns) * frameWidth;
    const sourceY = Math.floor(frameIndex / layout.columns) * frameHeight;

    if (flipX) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(image, sourceX, sourceY, frameWidth, frameHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(image, sourceX, sourceY, frameWidth, frameHeight, x, y, width, height);
    }
    ctx.restore();
    return true;
  }

  /** Stable animation frame derived from elapsed seconds; no gameplay state is mutated. */
  public static frameAt(elapsedSeconds: number, frameCount: number, framesPerSecond: number, loop = true): number {
    if (frameCount <= 1 || framesPerSecond <= 0) return 0;
    const raw = Math.max(0, Math.floor(Math.max(0, elapsedSeconds) * framesPerSecond));
    return loop ? raw % frameCount : Math.min(frameCount - 1, raw);
  }

  private normalize(src: string): string {
    // Keep Vite/GitHub Pages relative paths working with the current app setup.
    return src.replace(/^\.\//, './');
  }
}

export const spriteManager = new SpriteManager();
