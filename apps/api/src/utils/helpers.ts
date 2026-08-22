/**
 * helpers.ts — Backend utility functions
 * Port of frontend helpers.js for use by backend engines
 */

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function roundToNearest(val: number, step: number): number {
  return Math.round(val / step) * step;
}

export function roundTo(val: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateSessionId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `WKO-${num}-${suffix}`;
}

export function calculateTUT(tempoCode: string): number {
  const parts = tempoCode.split('-');
  return parts.reduce((sum, p) => {
    if (p === 'X' || p === 'x') return sum + 1;
    return sum + parseInt(p, 10);
  }, 0);
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomIntInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerp(min: number, max: number, factor: number): number {
  return min + (max - min) * clamp(factor, 0, 1);
}

export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function calculateLoadFromRM(oneRM: number, percentage: number, plateStep: number = 2.5): number {
  const rawLoad = oneRM * percentage;
  return roundToNearest(rawLoad, plateStep);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
