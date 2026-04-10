import { evaluateActivityAnswer, type EvaluationResult } from 'shared/lib/evaluation';
import type { Language } from 'shared/lib/i18n';
import type { Activity, Journey } from 'shared/lib/types';

// REPLACE_WITH_REAL_API
export async function generateJourney(topicOrText: string, language: Language): Promise<Journey> {
  const response = await fetch('/api/generate-journey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topicOrText.trim(),
      language,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;

    throw new Error(errorBody?.error ?? 'Journey generation failed.');
  }

  return (await response.json()) as Journey;
}

// REPLACE_WITH_REAL_API
export async function evaluateAnswer(activity: Activity, answer: string | string[]): Promise<EvaluationResult> {
  return Promise.resolve(evaluateActivityAnswer(activity, answer));
}
