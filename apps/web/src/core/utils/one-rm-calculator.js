/**
 * 1RM (One-Repetition Maximum) Sports Science Estimation Formulas
 * Validated formulas by Epley, Brzycki, Lander, and Lombardi (Sports Science Standard)
 */

export function calculate1RM(weightKg, reps) {
  const w = parseFloat(weightKg);
  const r = parseInt(reps);

  if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) {
    return {
      epley: 0,
      brzycki: 0,
      lander: 0,
      lombardi: 0,
      average: 0
    };
  }

  // Exact 1 rep is 100% of weight
  if (r === 1) {
    return {
      epley: Math.round(w),
      brzycki: Math.round(w),
      lander: Math.round(w),
      lombardi: Math.round(w),
      average: Math.round(w)
    };
  }

  // Formula Epley: W * (1 + R / 30)
  const epley = w * (1 + r / 30);

  // Formula Brzycki: W * (36 / (37 - R))
  const brzycki = r < 37 ? w * (36 / (37 - r)) : epley;

  // Formula Lander: (100 * W) / (101.3 - 2.6712 * R)
  const lander = r < 38 ? (100 * w) / (101.3 - 2.6712 * r) : epley;

  // Formula Lombardi: W * (R ^ 0.10)
  const lombardi = w * Math.pow(r, 0.10);

  const average = Math.round((epley + brzycki + lander + lombardi) / 4);

  return {
    epley: Math.round(epley),
    brzycki: Math.round(brzycki),
    lander: Math.round(lander),
    lombardi: Math.round(lombardi),
    average
  };
}

/**
 * RPE (Rate of Perceived Exertion) to % 1RM conversion table (NSCA/RTS Standard)
 */
export const RPE_1RM_TABLE = {
  10: { 1: 100, 2: 95.5, 3: 92.2, 4: 89.2, 5: 86.3, 6: 83.7, 8: 78.6, 10: 73.9 },
  9.5: { 1: 97.8, 2: 93.9, 3: 90.7, 4: 87.8, 5: 85.0, 6: 82.4, 8: 77.4, 10: 72.7 },
  9: { 1: 95.5, 2: 92.2, 3: 89.2, 4: 86.3, 5: 83.7, 6: 81.1, 8: 76.1, 10: 71.4 },
  8.5: { 1: 93.9, 2: 90.7, 3: 87.8, 4: 85.0, 5: 82.4, 6: 79.9, 8: 74.9, 10: 70.1 },
  8: { 1: 92.2, 2: 89.2, 3: 86.3, 4: 83.7, 5: 81.1, 6: 78.6, 8: 73.7, 10: 68.8 },
};
