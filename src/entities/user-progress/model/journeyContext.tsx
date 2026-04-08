import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateJourney } from 'shared/api/aiService';
import { countJourneyActivities } from 'shared/lib/evaluation';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from 'shared/lib/storage';
import type { Activity, Checkpoint, Journey, UserAnswer } from 'shared/lib/types';
import { useGame } from './gameContext';

type JourneyStatus = 'idle' | 'loading' | 'active' | 'completed';

interface JourneyState {
  journey: Journey | null;
  topic: string;
  status: JourneyStatus;
  currentCheckpointIndex: number;
  currentActivityIndex: number;
  answers: UserAnswer[];
}

interface SubmitAnswerInput {
  activityId: string;
  answer: string | string[];
  isCorrect: boolean;
  earnedXP: number;
}

interface JourneyContextValue extends JourneyState {
  currentCheckpoint: Checkpoint | null;
  currentActivity: Activity | null;
  totalActivities: number;
  completedActivities: number;
  startJourney: (topic: string) => Promise<void>;
  submitAnswer: (input: SubmitAnswerInput) => void;
  goToNextActivity: () => void;
  completeJourney: () => void;
  resetJourney: () => void;
}

const initialState: JourneyState = {
  journey: null,
  topic: '',
  status: 'idle',
  currentCheckpointIndex: 0,
  currentActivityIndex: 0,
  answers: [],
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

function isValidUserAnswer(value: unknown): value is UserAnswer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.activityId === 'string' &&
    (typeof candidate.answer === 'string' ||
      (Array.isArray(candidate.answer) && candidate.answer.every((item) => typeof item === 'string'))) &&
    typeof candidate.isCorrect === 'boolean' &&
    typeof candidate.earnedXP === 'number' &&
    typeof candidate.timestamp === 'string'
  );
}

function isValidActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.question === 'string' &&
    typeof candidate.hint === 'string' &&
    typeof candidate.timeLimitSec === 'number' &&
    typeof candidate.xpReward === 'number'
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

function isValidJourney(value: unknown): value is Journey {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.topic === 'string' &&
    Array.isArray(candidate.checkpoints) &&
    candidate.checkpoints.every(isValidCheckpoint)
  );
}

function isValidJourneyState(value: unknown): value is JourneyState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.topic === 'string' &&
    (candidate.status === 'idle' ||
      candidate.status === 'loading' ||
      candidate.status === 'active' ||
      candidate.status === 'completed') &&
    typeof candidate.currentCheckpointIndex === 'number' &&
    typeof candidate.currentActivityIndex === 'number' &&
    Array.isArray(candidate.answers) &&
    candidate.answers.every(isValidUserAnswer) &&
    (candidate.journey === null || isValidJourney(candidate.journey))
  );
}

function clampState(state: JourneyState): JourneyState {
  if (!state.journey) {
    return {
      ...initialState,
      topic: state.topic,
    };
  }

  const maxCheckpointIndex = Math.max(0, state.journey.checkpoints.length - 1);
  const currentCheckpointIndex = Math.min(Math.max(state.currentCheckpointIndex, 0), maxCheckpointIndex);
  const checkpoint = state.journey.checkpoints[currentCheckpointIndex];
  const maxActivityIndex = Math.max(0, checkpoint.activities.length - 1);
  const currentActivityIndex = Math.min(Math.max(state.currentActivityIndex, 0), maxActivityIndex);

  return {
    ...state,
    currentCheckpointIndex,
    currentActivityIndex,
  };
}

function getInitialState(): JourneyState {
  const storedState = readStorage<JourneyState>(STORAGE_KEYS.progress);

  return storedState && isValidJourneyState(storedState) ? clampState(storedState) : initialState;
}

interface JourneyStateProviderProps {
  children: React.ReactNode;
}

export function JourneyStateProvider({ children }: JourneyStateProviderProps): JSX.Element {
  const { applyAnswerOutcome, resetGame } = useGame();
  const [state, setState] = useState<JourneyState>(getInitialState);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.progress, state);
  }, [state]);

  const currentCheckpoint =
    state.journey?.checkpoints[state.currentCheckpointIndex] ?? null;
  const currentActivity =
    currentCheckpoint?.activities[state.currentActivityIndex] ?? null;
  const totalActivities = state.journey ? countJourneyActivities(state.journey) : 0;
  const completedActivities = state.answers.length;

  const value = useMemo<JourneyContextValue>(
    () => ({
      ...state,
      currentCheckpoint,
      currentActivity,
      totalActivities,
      completedActivities,
      startJourney: async (topic: string) => {
        const sanitizedTopic = topic.trim();

        resetGame();
        removeStorage(STORAGE_KEYS.progress);
        setState({
          ...initialState,
          topic: sanitizedTopic,
          status: 'loading',
        });

        try {
          const journey = await generateJourney(sanitizedTopic);

          setState({
            journey,
            topic: journey.topic,
            status: 'active',
            currentCheckpointIndex: 0,
            currentActivityIndex: 0,
            answers: [],
          });
        } catch {
          setState({
            ...initialState,
            topic: sanitizedTopic,
          });
        }
      },
      submitAnswer: ({ activityId, answer, isCorrect, earnedXP }) => {
        setState((currentState) => {
          if (currentState.answers.some((item) => item.activityId === activityId)) {
            return currentState;
          }

          return {
            ...currentState,
            answers: [
              ...currentState.answers,
              {
                activityId,
                answer,
                isCorrect,
                earnedXP,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        });

        applyAnswerOutcome({ isCorrect, xpEarned: earnedXP });
      },
      goToNextActivity: () => {
        setState((currentState) => {
          if (!currentState.journey) {
            return currentState;
          }

          const checkpoint = currentState.journey.checkpoints[currentState.currentCheckpointIndex];

          if (currentState.currentActivityIndex < checkpoint.activities.length - 1) {
            return {
              ...currentState,
              currentActivityIndex: currentState.currentActivityIndex + 1,
            };
          }

          if (currentState.currentCheckpointIndex < currentState.journey.checkpoints.length - 1) {
            return {
              ...currentState,
              currentCheckpointIndex: currentState.currentCheckpointIndex + 1,
              currentActivityIndex: 0,
            };
          }

          return {
            ...currentState,
            status: 'completed',
          };
        });
      },
      completeJourney: () => {
        setState((currentState) => ({
          ...currentState,
          status: 'completed',
        }));
      },
      resetJourney: () => {
        setState(initialState);
        removeStorage(STORAGE_KEYS.progress);
        resetGame();
      },
    }),
    [applyAnswerOutcome, completedActivities, currentActivity, currentCheckpoint, resetGame, state, totalActivities],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney(): JourneyContextValue {
  const context = useContext(JourneyContext);

  if (!context) {
    throw new Error('useJourney must be used inside JourneyStateProvider');
  }

  return context;
}
