import type { Activity, Journey } from 'shared/lib/types';

export interface EvaluationResult {
  isCorrect: boolean;
  feedbackKey: string;
  feedbackParams?: Record<string, string | number>;
  matchedKeywords: string[];
}

const FREE_FORM_TYPES = new Set<Activity['type']>([
  'free-response',
  'teach-back',
  'explain-like-im-five',
  'give-your-example',
  'your-custom-component',
]);

const EXACT_MATCH_TYPES = new Set<Activity['type']>([
  'multiple-choice',
  'fill-blank',
  'find-connection',
  'predict-outcome',
  'debug-logic',
  'micro-challenge',
]);

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[.,!?]+$/g, '');
}

function toKeywordList(correctAnswer: Activity['correctAnswer']): string[] {
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.map(normalizeText);
  }

  if (typeof correctAnswer === 'string') {
    return [normalizeText(correctAnswer)];
  }

  return [];
}

export function evaluateActivityAnswer(activity: Activity, answer: string | string[]): EvaluationResult {
  if (activity.type === 'rank-the-concepts') {
    const expectedOrder = Array.isArray(activity.correctAnswer) ? activity.correctAnswer : [];
    const providedOrder = Array.isArray(answer) ? answer : [];
    const isCorrect =
      expectedOrder.length > 0 &&
      expectedOrder.length === providedOrder.length &&
      expectedOrder.every((item, index) => normalizeText(item) === normalizeText(providedOrder[index]));

    return {
      isCorrect,
      feedbackKey: isCorrect ? 'feedback.rank.correct' : 'feedback.rank.incorrect',
      matchedKeywords: isCorrect ? expectedOrder.map(normalizeText) : [],
    };
  }

  if (EXACT_MATCH_TYPES.has(activity.type)) {
    const expected = normalizeText(typeof activity.correctAnswer === 'string' ? activity.correctAnswer : '');
    const received = normalizeText(Array.isArray(answer) ? answer.join(' ') : answer);
    const isCorrect = expected.length > 0 && expected === received;

    return {
      isCorrect,
      feedbackKey: isCorrect ? 'feedback.exact.correct' : 'feedback.exact.incorrect',
      feedbackParams: isCorrect ? undefined : { hint: activity.hint },
      matchedKeywords: isCorrect ? [expected] : [],
    };
  }

  if (FREE_FORM_TYPES.has(activity.type)) {
    const expectedKeywords = toKeywordList(activity.correctAnswer);
    const response = normalizeText(Array.isArray(answer) ? answer.join(' ') : answer);
    const matchedKeywords = expectedKeywords.filter((keyword) => response.includes(keyword));
    const minimumMatches = Math.max(1, Math.ceil(expectedKeywords.length / 2)); // DEFAULT
    const isCorrect = matchedKeywords.length >= minimumMatches;

    return {
      isCorrect,
      feedbackKey: isCorrect ? 'feedback.freeform.correct' : 'feedback.freeform.incorrect',
      feedbackParams: isCorrect ? undefined : { keywords: expectedKeywords.join(', ') },
      matchedKeywords,
    };
  }

  return {
    isCorrect: false,
    feedbackKey: 'feedback.missingEvaluator',
    feedbackParams: { type: activity.type },
    matchedKeywords: [],
  };
}

export function countJourneyActivities(journey: Journey): number {
  return journey.checkpoints.reduce((total, checkpoint) => total + checkpoint.activities.length, 0);
}
