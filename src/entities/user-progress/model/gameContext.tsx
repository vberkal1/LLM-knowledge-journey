import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from 'shared/lib/storage';

interface GameState {
  totalXP: number;
  currentStreak: number;
  maxStreak: number;
  totalAnswered: number;
  correctAnswers: number;
  achievements: string[];
  latestUnlockedAchievement: string | null;
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

function collectUnlockedAchievements(input: {
  previousState: GameState;
  isCorrect: boolean;
  nextStreak: number;
  timeRemainingSec: number;
  activityTimeLimitSec: number;
}): string[] {
  const unlocked: string[] = [];

  if (input.previousState.totalAnswered === 0) {
    unlocked.push('First Steps');
  }

  if (input.nextStreak >= 5 && !input.previousState.achievements.includes('Streak 5')) {
    unlocked.push('Streak 5');
  }

  if (
    input.isCorrect &&
    input.activityTimeLimitSec > 0 &&
    input.timeRemainingSec >= Math.ceil(input.activityTimeLimitSec / 2) &&
    !input.previousState.achievements.includes('Sprinter')
  ) {
    unlocked.push('Sprinter');
  }

  return unlocked;
}

function getInitialState(): GameState {
  const storedState = readStorage<GameState>(STORAGE_KEYS.game);

  return storedState && isValidGameState(storedState) ? storedState : initialState;
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
