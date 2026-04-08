import { DEFAULT_JOURNEY_TOPIC, neuralNetworksJourneyMock } from 'shared/api/mocks/journeyMocks';
import { evaluateActivityAnswer, type EvaluationResult } from 'shared/lib/evaluation';
import type { Activity, Journey } from 'shared/lib/types';

function cloneJourney(journey: Journey): Journey {
  return {
    ...journey,
    checkpoints: journey.checkpoints.map((checkpoint) => ({
      ...checkpoint,
      activities: checkpoint.activities.map((activity) => ({ ...activity })),
    })),
  };
}

// REPLACE_WITH_REAL_API
export async function generateJourney(topicOrText: string): Promise<Journey> {
  const requestedTopic = topicOrText.trim();
  const resolvedTopic = requestedTopic || DEFAULT_JOURNEY_TOPIC; // DEFAULT

  return Promise.resolve({
    ...cloneJourney(neuralNetworksJourneyMock),
    topic: resolvedTopic,
    title: `Knowledge Journey: ${resolvedTopic}`,
  });
}

// REPLACE_WITH_REAL_API
export async function evaluateAnswer(activity: Activity, answer: string | string[]): Promise<EvaluationResult> {
  return Promise.resolve(evaluateActivityAnswer(activity, answer));
}
