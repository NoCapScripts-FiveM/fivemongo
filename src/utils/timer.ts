// src/utils/timer.ts
import { performance } from 'perf_hooks';

export type TimingOptions = {
  label: string;
  thresholdMs?: number;          // Warn if execution takes longer than this (default 100ms)
  onComplete?: (duration: number) => void;
};

export async function withTiming<T>(
  fn: () => Promise<T>,
  options: TimingOptions
): Promise<T> {
  const { label, thresholdMs = 100, onComplete } = options;

  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    const message = `[MongoDB] ${label} executed in ${duration.toFixed(2)}ms`;

    if (duration > thresholdMs) {
      console.warn(`^3${message}^7`);
    } else {
      console.log(message);
    }

    if (onComplete) {
      onComplete(duration);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[MongoDB] ${label} failed in ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
