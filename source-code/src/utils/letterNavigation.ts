import { ACCENT_THEMES, type AccentKey } from '../data/letters';

export type TransitionPhase =
  | 'initial-black'
  | 'idle'
  | 'fading-out'
  | 'blackout'
  | 'fading-in';

export interface ProgressInfo {
  currentNumber: number;
  total: number;
  percent: number;
  stepLabel: string;
  stepCount: string;
  accentColor: string;
}

export const INITIAL_FADE_IN_MS = 1600;
export const FADE_OUT_DURATION_MS = 600;
export const BLACKOUT_HOLD_MS = 220;
export const FADE_IN_DURATION_MS = 1900;

export function clampPageIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(index, total - 1));
}

export function canNavigateToPage(
  targetIndex: number,
  currentIndex: number,
  total: number,
  isTransitioning: boolean
): boolean {
  if (isTransitioning) return false;
  if (targetIndex < 0 || targetIndex >= total) return false;
  return targetIndex !== currentIndex;
}

export function computeFadeOutOpacity(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  // Smooth ease-in-out from 0 -> 1
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function computeFadeInBlackOpacity(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  // Balanced perceptual fade-in from black (1 -> 0)
  return Math.max(0, Math.min(1, 1 - Math.pow(t, 1.55)));
}

export function getProgressInfo(
  pageIndex: number,
  total: number,
  accent: AccentKey
): ProgressInfo {
  const safeTotal = Math.max(1, total);
  const safeIndex = clampPageIndex(pageIndex, safeTotal);
  const currentNumber = safeIndex + 1;
  const percent = (currentNumber / safeTotal) * 100;

  const stepLabel =
    safeIndex === safeTotal - 1
      ? 'PENUTUP'
      : `SURAT ${String(currentNumber).padStart(2, '0')}`;

  const stepCount = `${String(currentNumber).padStart(2, '0')} / ${String(safeTotal).padStart(2, '0')}`;
  const accentColor = ACCENT_THEMES[accent]?.primary ?? ACCENT_THEMES.pink.primary;

  return {
    currentNumber,
    total: safeTotal,
    percent,
    stepLabel,
    stepCount,
    accentColor,
  };
}

export function resolveSwipeDirection(
  dx: number,
  dy: number,
  threshold = 65
): 'next' | 'prev' | null {
  if (Math.abs(dx) <= threshold) return null;
  if (Math.abs(dx) <= Math.abs(dy) * 1.25) return null;
  return dx < 0 ? 'next' : 'prev';
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
