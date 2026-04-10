import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from 'shared/lib/storage';

export type AchievementId = 'first_steps' | 'streak_5' | 'sprinter';

interface GameState {
  totalXP: number;
  currentStreak: number;
  maxStreak: number;
  totalAnswered: number;
  correctAnswers: number;
  achievements: AchievementId[];
  latestUnlockedAchievement: AchievementId | null;
}

interface ApplyAnswerOutcomeInput {
  isCorrect: boolean;
  xpEarned: number;
  timeRemainingSec: number;
  activityTimeLimitSec: number;
}

interface GameContextValue extends GameState {
  nextXpMultiplier: number;
  applyAnswerOutcome: (input: ApplyAnswerOutcomeInput) => void;
  getXpAward: (input: { isCorrect: boolean; baseXp: number }) => number;
  dismissAchievementToast: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  totalXP: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalAnswered: 0,
  correctAnswers: 0,
  achievements: [],
  latestUnlockedAchievement: null,
};

const GameContext = createContext<GameContextValue | null>(null);

function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.totalXP === 'number' &&
    typeof candidate.currentStreak === 'number' &&
    typeof candidate.maxStreak === 'number' &&
    typeof candidate.totalAnswered === 'number' &&
    typeof candidate.correctAnswers === 'number' &&
    Array.isArray(candidate.achievements) &&
    candidate.achievements.every((item) => typeof item === 'string') &&
    (candidate.latestUnlockedAchievement === null || typeof candidate.latestUnlockedAchievement === 'string')
  );
}

function normalizeAchievementId(value: string): AchievementId | null {
  switch (value) {
    case 'first_steps':
    case 'First Steps':
      return 'first_steps';
    case 'streak_5':
    case 'Streak 5':
      return 'streak_5';
    case 'sprinter':
    case 'Sprinter':
      return 'sprinter';
    default:
      return null;
  }
}

function collectUnlockedAchievements(input: {
  previousState: GameState;
  isCorrect: boolean;
  nextStreak: number;
  timeRemainingSec: number;
  activityTimeLimitSec: number;
}): AchievementId[] {
  const unlocked: AchievementId[] = [];

  if (input.previousState.totalAnswered === 0) {
    unlocked.push('first_steps');
  }

  if (input.nextStreak >= 5 && !input.previousState.achievements.includes('streak_5')) {
    unlocked.push('streak_5');
  }

  if (
    input.isCorrect &&
    input.activityTimeLimitSec > 0 &&
    input.timeRemainingSec >= Math.ceil(input.activityTimeLimitSec / 2) &&
    !input.previousState.achievements.includes('sprinter')
  ) {
    unlocked.push('sprinter');
  }

  return unlocked;
}

function getInitialState(): GameState {
  const storedState = readStorage<GameState>(STORAGE_KEYS.game);

  if (!storedState || !isValidGameState(storedState)) {
    return initialState;
  }

  const normalizedAchievements = storedState.achievements
    .map(normalizeAchievementId)
    .filter((achievement): achievement is AchievementId => achievement !== null);
  const normalizedLatestAchievement =
    storedState.latestUnlockedAchievement ? normalizeAchievementId(storedState.latestUnlockedAchievement) : null;

  return {
    ...storedState,
    achievements: normalizedAchievements,
    latestUnlockedAchievement: normalizedLatestAchievement,
  };
}

interface GameStateProviderProps {
  children: React.ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps): JSX.Element {
  const [state, setState] = useState<GameState>(getInitialState);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.game, state);
  }, [state]);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      nextXpMultiplier: state.currentStreak >= 3 ? 2 : 1,
      getXpAward: ({ isCorrect, baseXp }) => {
        if (!isCorrect) {
          return 0;
        }

        const multiplier = state.currentStreak >= 3 ? 2 : 1;

        return baseXp * multiplier;
      },
      applyAnswerOutcome: ({ isCorrect, xpEarned, timeRemainingSec, activityTimeLimitSec }) => {
        setState((currentState) => {
          const nextStreak = isCorrect ? currentState.currentStreak + 1 : 0;
          const unlockedAchievements = collectUnlockedAchievements({
            previousState: currentState,
            isCorrect,
            nextStreak,
            timeRemainingSec,
            activityTimeLimitSec,
          });

          return {
            totalXP: currentState.totalXP + xpEarned,
            currentStreak: nextStreak,
            maxStreak: Math.max(currentState.maxStreak, nextStreak),
            totalAnswered: currentState.totalAnswered + 1,
            correctAnswers: currentState.correctAnswers + (isCorrect ? 1 : 0),
            achievements: [...currentState.achievements, ...unlockedAchievements],
            latestUnlockedAchievement: unlockedAchievements[0] ?? null,
          };
        });
      },
      dismissAchievementToast: () => {
        setState((currentState) => ({
          ...currentState,
          latestUnlockedAchievement: null,
        }));
      },
      resetGame: () => {
        setState(initialState);
        removeStorage(STORAGE_KEYS.game);
      },
    }),
    [state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used inside GameStateProvider');
  }

  return context;
}
