import type { JourneyPayload } from './validateJourney.js';

type JourneyLanguage = 'en' | 'ru';

type FallbackActivity = {
  type: string;
  question: (topic: string) => string;
  hint: string;
  timeLimitSec: number;
  xpReward: number;
  correctAnswer?: string | string[];
  options?: (topic: string) => string[];
};

type FallbackCheckpoint = {
  title: string;
  description: (topic: string) => string;
  activities: FallbackActivity[];
};

type FallbackContent = {
  defaultTopic: string;
  title: (topic: string) => string;
  checkpoints: FallbackCheckpoint[];
};

const fallbackContent: Record<JourneyLanguage, FallbackContent> = {
  en: {
    defaultTopic: 'General Topic',
    title: (topic) => `Knowledge Journey: ${topic}`,
    checkpoints: [
      {
        title: 'Foundations',
        description: (topic) => `Build a basic understanding of ${topic}.`,
        activities: [
          {
            type: 'multiple-choice',
            question: (topic) => `Which statement best describes the main goal of studying ${topic}?`,
            options: (topic) => [
              `To memorize isolated facts about ${topic}`,
              'To understand its core concepts and how they connect',
              `To avoid applying ${topic} in practice`,
              'To focus only on terminology without meaning',
            ],
            correctAnswer: 'To understand its core concepts and how they connect',
            hint: 'Think about conceptual understanding, not rote memorization.',
            timeLimitSec: 45,
            xpReward: 10,
          },
          {
            type: 'free-response',
            question: (topic) => `In your own words, explain why ${topic} matters.`,
            correctAnswer: ['understand', 'apply', 'concept'],
            hint: 'Mention what it helps you understand or do.',
            timeLimitSec: 60,
            xpReward: 14,
          },
        ],
      },
      {
        title: 'Mechanics',
        description: (topic) => `Focus on how the main pieces of ${topic} work together.`,
        activities: [
          {
            type: 'teach-back',
            question: (topic) => `Teach back one core mechanism or process inside ${topic}.`,
            correctAnswer: ['process', 'step', 'result'],
            hint: 'Describe it as if you were teaching a beginner.',
            timeLimitSec: 75,
            xpReward: 16,
          },
          {
            type: 'rank-the-concepts',
            question: (topic) => `Put these learning steps for ${topic} in a sensible order.`,
            options: () => ['Review the result', 'Learn the core idea', 'Apply it to an example', 'Identify the topic'],
            correctAnswer: ['Identify the topic', 'Learn the core idea', 'Apply it to an example', 'Review the result'],
            hint: 'Start from orientation and end with reflection.',
            timeLimitSec: 60,
            xpReward: 18,
          },
        ],
      },
      {
        title: 'Application',
        description: (topic) => `Transfer ${topic} into a practical or intuitive explanation.`,
        activities: [
          {
            type: 'explain-like-im-five',
            question: (topic) => `Explain ${topic} like you are talking to a five-year-old.`,
            correctAnswer: ['simple', 'idea', 'example'],
            hint: 'Use very simple language and a concrete picture.',
            timeLimitSec: 75,
            xpReward: 15,
          },
          {
            type: 'give-your-example',
            question: (topic) => `Give your own practical example of ${topic} in action.`,
            correctAnswer: ['example', 'use', 'result'],
            hint: 'Use any domain as long as it is concrete.',
            timeLimitSec: 70,
            xpReward: 14,
          },
        ],
      },
    ],
  },
  ru: {
    defaultTopic: 'Общая тема',
    title: (topic) => `Маршрут знаний: ${topic}`,
    checkpoints: [
      {
        title: 'Основы',
        description: (topic) => `Сформируйте базовое понимание темы «${topic}».`,
        activities: [
          {
            type: 'multiple-choice',
            question: (topic) => `Какое утверждение лучше всего описывает главную цель изучения темы «${topic}»?`,
            options: (topic) => [
              `Запомнить разрозненные факты о теме «${topic}»`,
              'Понять ключевые идеи и связи между ними',
              `Избегать практического применения темы «${topic}»`,
              'Сосредоточиться только на терминах без смысла',
            ],
            correctAnswer: 'Понять ключевые идеи и связи между ними',
            hint: 'Подумайте о понимании сути, а не о механическом запоминании.',
            timeLimitSec: 45,
            xpReward: 10,
          },
          {
            type: 'free-response',
            question: (topic) => `Объясните своими словами, почему тема «${topic}» важна.`,
            correctAnswer: ['поним', 'примен', 'иде'],
            hint: 'Упомяните, что именно эта тема помогает понять или сделать.',
            timeLimitSec: 60,
            xpReward: 14,
          },
        ],
      },
      {
        title: 'Механика',
        description: (topic) => `Сосредоточьтесь на том, как основные части темы «${topic}» работают вместе.`,
        activities: [
          {
            type: 'teach-back',
            question: (topic) => `Объясните своими словами один ключевой механизм или процесс внутри темы «${topic}».`,
            correctAnswer: ['процесс', 'шаг', 'результ'],
            hint: 'Расскажите так, как будто объясняете это новичку.',
            timeLimitSec: 75,
            xpReward: 16,
          },
          {
            type: 'rank-the-concepts',
            question: (topic) => `Расположите эти шаги изучения темы «${topic}» в логичном порядке.`,
            options: () => [
              'Проверить итоговый результат',
              'Изучить основную идею',
              'Применить её на примере',
              'Определить тему',
            ],
            correctAnswer: [
              'Определить тему',
              'Изучить основную идею',
              'Применить её на примере',
              'Проверить итоговый результат',
            ],
            hint: 'Начните с ориентации в теме и закончите рефлексией по результату.',
            timeLimitSec: 60,
            xpReward: 18,
          },
        ],
      },
      {
        title: 'Применение',
        description: (topic) => `Перенесите тему «${topic}» в практическое или интуитивное объяснение.`,
        activities: [
          {
            type: 'explain-like-im-five',
            question: (topic) => `Объясните тему «${topic}» так, будто рассказываете пятилетнему ребёнку.`,
            correctAnswer: ['прост', 'иде', 'пример'],
            hint: 'Используйте очень простой язык и наглядный образ.',
            timeLimitSec: 75,
            xpReward: 15,
          },
          {
            type: 'give-your-example',
            question: (topic) => `Придумайте собственный практический пример применения темы «${topic}».`,
            correctAnswer: ['пример', 'примен', 'результ'],
            hint: 'Подойдёт любая область, если пример конкретный.',
            timeLimitSec: 70,
            xpReward: 14,
          },
        ],
      },
    ],
  },
};

export function buildFallbackJourney(
  topic: string,
  language: JourneyLanguage,
): JourneyPayload & { id: string; source: 'mock-fallback' } {
  const content = fallbackContent[language];
  const safeTopic = topic.trim() || content.defaultTopic;
  const journeyId = `journey-fallback-${language}-${Date.now()}`;

  return {
    id: journeyId,
    title: content.title(safeTopic),
    topic: safeTopic,
    totalTimeLimitSec: 1800,
    source: 'mock-fallback',
    checkpoints: content.checkpoints.map((checkpoint, checkpointIndex) => ({
      id: `${journeyId}-checkpoint-${checkpointIndex + 1}`,
      order: checkpointIndex + 1,
      title: checkpoint.title,
      description: checkpoint.description(safeTopic),
      activities: checkpoint.activities.map((activity, activityIndex) => ({
        id: `${journeyId}-activity-${checkpointIndex + 1}-${activityIndex + 1}`,
        type: activity.type,
        question: activity.question(safeTopic),
        options: activity.options ? activity.options(safeTopic) : undefined,
        correctAnswer: activity.correctAnswer,
        hint: activity.hint,
        timeLimitSec: activity.timeLimitSec,
        xpReward: activity.xpReward,
      })),
    })),
  };
}
