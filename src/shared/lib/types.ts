export type ActivityType =
  | 'multiple-choice'
  | 'fill-blank'
  | 'free-response'
  | 'explain-like-im-five'
  | 'teach-back'
  | 'give-your-example'
  | 'find-connection'
  | 'predict-outcome'
  | 'debug-logic'
  | 'micro-challenge'
  | 'your-custom-component'
  | 'rank-the-concepts';

export interface Activity {
  id: string;
  type: ActivityType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  hint: string;
  timeLimitSec: number;
  xpReward: number;
}

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
  order: number;
}

export interface Journey {
  id: string;
  title: string;
  topic: string;
  checkpoints: Checkpoint[];
  totalTimeLimitSec?: number;
}

export interface UserAnswer {
  activityId: string;
  answer: string | string[];
  isCorrect: boolean;
  earnedXP: number;
  timestamp: string;
}

export interface JourneyResult {
  journeyId: string;
  totalXP: number;
  correctAnswersCount: number;
  totalActivities: number;
  streak: number;
  achievements: string[];
  detailedAnswers: UserAnswer[];
  feedbackByActivity: Record<string, string>;
}
