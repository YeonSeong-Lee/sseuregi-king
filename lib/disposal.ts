import disposalSteps from '@/data/disposal-steps.json';
import type { ActionStepId, DisposalStepsFile, Locale } from '@/types';

const steps = disposalSteps as DisposalStepsFile;

export function getStepLabel(stepId: ActionStepId, locale: Locale): string {
  const labels = steps.steps[stepId]?.labels;
  if (!labels) return stepId;
  return labels[locale] || labels.en || stepId;
}
