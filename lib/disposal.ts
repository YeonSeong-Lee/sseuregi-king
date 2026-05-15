import visualActions from '@/data/visual-actions.json';
import type { Locale, VisualAction, VisualActionId, VisualActionsFile } from '@/types';

const file = visualActions as VisualActionsFile;

export function getVisualAction(id: VisualActionId): VisualAction | undefined {
  return file.actions[id];
}

export function getActionLabel(id: VisualActionId, locale: Locale): string {
  const action = file.actions[id];
  if (!action) return id;
  return action.name[locale] || action.name.en || id;
}
