export interface AutoRegulationInput {
  actualLoadKg: number;
  actualReps: number;
  perceivedRpe: number; // 1-10 scale
  prescribedLoadKg: number | null;
  prescribedReps: number;
  targetRpe: number;
  trainingAgeLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface AutoRegulationResult {
  estimatedDaily1rmKg: number;
  recommendedNextWeekLoadKg: number;
  adjustmentReason: string;
}

/**
 * Calculates estimated 1RM using Epley formula:
 * 1RM = Load * (1 + Reps / 30)
 */
export function calculateEstimated1RM(loadKg: number, reps: number): number {
  if (reps <= 0 || loadKg <= 0) return 0;
  if (reps === 1) return loadKg;
  return Math.round(loadKg * (1 + reps / 30) * 10) / 10;
}

/**
 * Computes progressive load auto-regulation based on RPE differential and training age level.
 */
export function computeAutoRegulatedLoad(input: AutoRegulationInput): AutoRegulationResult {
  const { actualLoadKg, actualReps, perceivedRpe, prescribedReps, targetRpe, trainingAgeLevel } = input;

  const estimatedDaily1rmKg = calculateEstimated1RM(actualLoadKg, actualReps);

  // RPE Differential (Target RPE - Actual RPE)
  // Positive delta means workout felt easier than prescribed -> increase load
  // Negative delta means workout felt harder than prescribed -> hold or reduce load
  const rpeDelta = targetRpe - perceivedRpe;
  const repsDelta = actualReps - prescribedReps;

  let multiplier = 1.0;
  let reason = 'Load maintained for current adaptation phase';

  if (trainingAgeLevel === 'BEGINNER') {
    // Beginners adapt rapidly; escalate load aggressively if sets were easy
    if (rpeDelta >= 2 || repsDelta >= 2) {
      multiplier = 1.05; // +5.0%
      reason = 'Aggressive 5% load increase applied due to high velocity performance (Beginner adaptation)';
    } else if (rpeDelta >= 0 && repsDelta >= 0) {
      multiplier = 1.025; // +2.5%
      reason = 'Standard 2.5% linear progression applied';
    } else {
      multiplier = 1.0;
      reason = 'Load maintained to stabilize movement mechanics';
    }
  } else if (trainingAgeLevel === 'INTERMEDIATE') {
    if (rpeDelta >= 1.5) {
      multiplier = 1.015; // +1.5%
      reason = 'Moderate 1.5% undulating adjustment applied';
    } else if (rpeDelta >= 0) {
      multiplier = 1.006; // +0.6%
      reason = 'Standard 0.6% progression adjustment applied';
    } else {
      multiplier = 0.98; // -2.0% fatigue reduction
      reason = 'Fatigue mitigation applied (-2% load compensation)';
    }
  } else {
    // ADVANCED
    if (rpeDelta >= 1.5) {
      multiplier = 1.008; // +0.8%
      reason = 'Advanced block micro-periodization adjustment (+0.8%)';
    } else {
      multiplier = 1.001; // +0.1%
      reason = 'Micro-load incremental progression (+0.1%)';
    }
  }

  const recommendedNextWeekLoadKg = Math.round(actualLoadKg * multiplier * 10) / 10;

  return {
    estimatedDaily1rmKg,
    recommendedNextWeekLoadKg,
    adjustmentReason: reason,
  };
}
