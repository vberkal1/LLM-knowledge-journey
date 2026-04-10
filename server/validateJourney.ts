interface Activity {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  hint: string;
  timeLimitSec: number;
  xpReward: number;
}

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
  order: number;
}

export interface JourneyPayload {
  title: string;
  topic: string;
  checkpoints: Checkpoint[];
  totalTimeLimitSec: number;
}

const ACTIVITY_TYPES = new Set([
  'multiple-choice',
  'fill-blank',
  'free-response',
  'explain-like-im-five',
  'teach-back',
  'give-your-example',
  'find-connection',
  'predict-outcome',
  'debug-logic',
  'micro-challenge',
  'your-custom-component',
  'rank-the-concepts',
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    ACTIVITY_TYPES.has(candidate.type) &&
    typeof candidate.question === 'string' &&
    typeof candidate.hint === 'string' &&
    typeof candidate.timeLimitSec === 'number' &&
    typeof candidate.xpReward === 'number' &&
    (candidate.options === undefined || isStringArray(candidate.options)) &&
    (candidate.correctAnswer === undefined ||
      typeof candidate.correctAnswer === 'string' ||
      isStringArray(candidate.correctAnswer))
  );
}

function isValidCheckpoint(value: unknown): value is Checkpoint {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.order === 'number' &&
    Array.isArray(candidate.activities) &&
    candidate.activities.every(isValidActivity)
  );
}

export function validateJourneyPayload(value: unknown): value is JourneyPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.topic === 'string' &&
    typeof candidate.totalTimeLimitSec === 'number' &&
    Array.isArray(candidate.checkpoints) &&
    candidate.checkpoints.length >= 3 &&
    candidate.checkpoints.every(isValidCheckpoint)
  );
}
