import disposalSteps from '@/data/disposal-steps.json';
import type { DisposalStepsFile, Locale, StepId } from '@/types';

const steps = disposalSteps as DisposalStepsFile;

export function getStepLabel(stepId: StepId, locale: Locale): string {
  return steps.steps[stepId]?.labels[locale] ?? stepId;
}
