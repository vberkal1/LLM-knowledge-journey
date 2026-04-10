export const journeyResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'topic', 'totalTimeLimitSec', 'checkpoints'],
  properties: {
    title: { type: 'string' },
    topic: { type: 'string' },
    totalTimeLimitSec: { type: 'number' },
    checkpoints: {
      type: 'array',
      minItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'description', 'order', 'activities'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          order: { type: 'number' },
          activities: {
            type: 'array',
            minItems: 2,
            maxItems: 3,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'type', 'question', 'options', 'correctAnswer', 'hint', 'timeLimitSec', 'xpReward'],
              properties: {
                id: { type: 'string' },
                type: {
                  type: 'string',
                  enum: [
                    'multiple-choice',
                    'fill-blank',
                    'free-response',
                    'explain-like-im-five',
                    'teach-back',
                    'give-your-example',
                    'find-connection',
                    'predict-outcome',
                    'debug-logic',
                    'micro-challenge',
                    'your-custom-component',
                    'rank-the-concepts',
                  ],
                },
                question: { type: 'string' },
                options: {
                  anyOf: [
                    {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    { type: 'null' },
                  ],
                },
                correctAnswer: {
                  anyOf: [
                    { type: 'string' },
                    { type: 'array', items: { type: 'string' } },
                    { type: 'null' },
                  ],
                },
                hint: { type: 'string' },
                timeLimitSec: { type: 'number' },
                xpReward: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
} as const;
