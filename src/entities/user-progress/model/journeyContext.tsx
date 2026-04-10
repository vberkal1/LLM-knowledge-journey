import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateJourney } from 'shared/api/aiService';
import { countJourneyActivities } from 'shared/lib/evaluation';
import type { Language } from 'shared/lib/i18n';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from 'shared/lib/storage';
import type { Activity, Checkpoint, Journey, UserAnswer } from 'shared/lib/types';
import { useGame } from './gameContext';

type JourneyStatus = 'idle' | 'loading' | 'active' | 'completed';

const DEFAULT_JOURNEY_TIME_LIMIT_SEC = 60; // DEFAULT

interface JourneyState {
  journey: Journey | null;
  topic: string;
  status: JourneyStatus;
  currentCheckpointIndex: number;
  currentActivityIndex: number;
  answers: UserAnswer[];
  feedbackByActivity: Record<string, { key?: string; params?: Record<string, string | number>; text?: string }>;
  journeyDeadlineAt: string | null;
  activityDeadlineAt: string | null;
}

interface SubmitAnswerInput {
  activityId: string;
  answer: string | string[];
  isCorrect: boolean;
  earnedXP: number;
  feedback: string;
  feedbackKey?: string;
  feedbackParams?: Record<string, string | number>;
  timeRemainingSec: number;
  activityTimeLimitSec: number;
}

interface JourneyContextValue extends JourneyState {
  currentCheckpoint: Checkpoint | null;
  currentActivity: Activity | null;
  totalActivities: number;
  completedActivities: number;
  journeyTimeLimitSec: number;
  currentActivityTimeLimitSec: number;
  startJourney: (topic: string, language: Language) => Promise<boolean>;
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
  feedbackByActivity: {},
  journeyDeadlineAt: null,
  activityDeadlineAt: null,
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
    typeof candidate.timestamp === 'string' &&
    (candidate.feedback === undefined || typeof candidate.feedback === 'string') &&
    (candidate.feedbackKey === undefined || typeof candidate.feedbackKey === 'string') &&
    (candidate.feedbackParams === undefined ||
      (candidate.feedbackParams !== null && typeof candidate.feedbackParams === 'object'))
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
    (candidate.feedbackByActivity === undefined ||
      (candidate.feedbackByActivity !== null && typeof candidate.feedbackByActivity === 'object')) &&
    (candidate.journeyDeadlineAt === undefined ||
      candidate.journeyDeadlineAt === null ||
      typeof candidate.journeyDeadlineAt === 'string') &&
    (candidate.activityDeadlineAt === undefined ||
      candidate.activityDeadlineAt === null ||
      typeof candidate.activityDeadlineAt === 'string') &&
    (candidate.journey === null || isValidJourney(candidate.journey))
  );
}

function getJourneyTimeLimitSec(journey: Journey): number {
  return journey.totalTimeLimitSec ?? DEFAULT_JOURNEY_TIME_LIMIT_SEC;
}

function getCheckpointFromState(state: JourneyState): Checkpoint | null {
  return state.journey?.checkpoints[state.currentCheckpointIndex] ?? null;
}

function getActivityFromState(state: JourneyState): Activity | null {
  return getCheckpointFromState(state)?.activities[state.currentActivityIndex] ?? null;
}

function createDeadlineFromNow(durationSec: number): string {
  return new Date(Date.now() + durationSec * 1000).toISOString();
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
    feedbackByActivity: state.feedbackByActivity ?? {},
    journeyDeadlineAt:
      state.status === 'active'
        ? state.journeyDeadlineAt ?? createDeadlineFromNow(getJourneyTimeLimitSec(state.journey))
        : null,
    activityDeadlineAt:
      state.status === 'active'
        ? state.activityDeadlineAt ?? createDeadlineFromNow(checkpoint.activities[currentActivityIndex].timeLimitSec)
        : null,
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
  const { applyAnswerOutcome, getXpAward, resetGame } = useGame();
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
  const journeyTimeLimitSec = state.journey ? getJourneyTimeLimitSec(state.journey) : DEFAULT_JOURNEY_TIME_LIMIT_SEC;
  const currentActivityTimeLimitSec = currentActivity?.timeLimitSec ?? 0;

  const value = useMemo<JourneyContextValue>(
    () => ({
      ...state,
      currentCheckpoint,
      currentActivity,
      totalActivities,
      completedActivities,
      journeyTimeLimitSec,
      currentActivityTimeLimitSec,
      startJourney: async (topic: string, language: Language) => {
        const sanitizedTopic = topic.trim();

        resetGame();
        removeStorage(STORAGE_KEYS.progress);
        setState({
          ...initialState,
          topic: sanitizedTopic,
          status: 'loading',
        });

        try {
          const journey = await generateJourney(sanitizedTopic, language);

          setState({
            journey,
            topic: journey.topic,
            status: 'active',
            currentCheckpointIndex: 0,
            currentActivityIndex: 0,
            answers: [],
            feedbackByActivity: {},
            journeyDeadlineAt: createDeadlineFromNow(getJourneyTimeLimitSec(journey)),
            activityDeadlineAt: createDeadlineFromNow(journey.checkpoints[0].activities[0].timeLimitSec),
          });

          return true;
        } catch {
          setState({
            ...initialState,
            topic: sanitizedTopic,
          });

          return false;
        }
      },
      submitAnswer: ({
        activityId,
        answer,
        isCorrect,
        earnedXP,
        feedback,
        feedbackKey,
        feedbackParams,
        timeRemainingSec,
        activityTimeLimitSec,
      }) => {
        let shouldApplyOutcome = false;
        const awardedXP = getXpAward({ isCorrect, baseXp: earnedXP });

        setState((currentState) => {
          if (currentState.answers.some((item) => item.activityId === activityId)) {
            return currentState;
          }

          shouldApplyOutcome = true;

          return {
            ...currentState,
            answers: [
              ...currentState.answers,
              {
                activityId,
                answer,
                isCorrect,
                earnedXP: awardedXP,
                timestamp: new Date().toISOString(),
                feedback,
                feedbackKey,
                feedbackParams,
              },
            ],
            feedbackByActivity: {
              ...currentState.feedbackByActivity,
              [activityId]: {
                text: feedback,
                key: feedbackKey,
                params: feedbackParams,
              },
            },
          };
        });

        if (shouldApplyOutcome) {
          applyAnswerOutcome({
            isCorrect,
            xpEarned: awardedXP,
            timeRemainingSec,
            activityTimeLimitSec,
          });
        }
      },
      goToNextActivity: () => {
        setState((currentState) => {
          if (!currentState.journey) {
            return currentState;
          }

          const checkpoint = currentState.journey.checkpoints[currentState.currentCheckpointIndex];

          if (currentState.currentActivityIndex < checkpoint.activities.length - 1) {
            const nextActivity = checkpoint.activities[currentState.currentActivityIndex + 1];

            return {
              ...currentState,
              currentActivityIndex: currentState.currentActivityIndex + 1,
              activityDeadlineAt: createDeadlineFromNow(nextActivity.timeLimitSec),
            };
          }

          if (currentState.currentCheckpointIndex < currentState.journey.checkpoints.length - 1) {
            const nextCheckpoint = currentState.journey.checkpoints[currentState.currentCheckpointIndex + 1];

            return {
              ...currentState,
              currentCheckpointIndex: currentState.currentCheckpointIndex + 1,
              currentActivityIndex: 0,
              activityDeadlineAt: createDeadlineFromNow(nextCheckpoint.activities[0].timeLimitSec),
            };
          }

          return {
            ...currentState,
            status: 'completed',
            activityDeadlineAt: null,
            journeyDeadlineAt: null,
          };
        });
      },
      completeJourney: () => {
        setState((currentState) => ({
          ...currentState,
          status: 'completed',
          activityDeadlineAt: null,
          journeyDeadlineAt: null,
        }));
      },
      resetJourney: () => {
        setState(initialState);
        removeStorage(STORAGE_KEYS.progress);
        resetGame();
      },
    }),
    [
      applyAnswerOutcome,
      completedActivities,
      currentActivity,
      currentActivityTimeLimitSec,
      currentCheckpoint,
      getXpAward,
      journeyTimeLimitSec,
      resetGame,
      state,
      totalActivities,
    ],
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
