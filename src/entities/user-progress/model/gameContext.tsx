import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from 'shared/lib/storage';

interface GameState {
  totalXP: number;
  currentStreak: number;
  maxStreak: number;
  achievements: string[];
}

interface ApplyAnswerOutcomeInput {
  isCorrect: boolean;
  xpEarned: number;
}

interface GameContextValue extends GameState {
  applyAnswerOutcome: (input: ApplyAnswerOutcomeInput) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  totalXP: 0,
  currentStreak: 0,
  maxStreak: 0,
  achievements: [],
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
    Array.isArray(candidate.achievements) &&
    candidate.achievements.every((item) => typeof item === 'string')
  );
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
      applyAnswerOutcome: ({ isCorrect, xpEarned }) => {
        setState((currentState) => {
          const nextStreak = isCorrect ? currentState.currentStreak + 1 : 0;

          return {
            totalXP: currentState.totalXP + xpEarned,
            currentStreak: nextStreak,
            maxStreak: Math.max(currentState.maxStreak, nextStreak),
            achievements: currentState.achievements,
          };
        });
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
