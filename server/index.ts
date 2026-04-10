import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { buildFallbackJourney } from './fallbackJourney.js';
import { journeyResponseSchema } from './journeySchema.js';
import { validateJourneyPayload, type JourneyPayload } from './validateJourney.js';

const port = Number(process.env.PORT ?? 8787);
const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
const openAiApiKey = process.env.OPENAI_API_KEY;
type JourneyLanguage = 'en' | 'ru';

if (!openAiApiKey) {
  throw new Error('OPENAI_API_KEY is missing. Create a .env file based on .env.example.');
}

const openai = new OpenAI({ apiKey: openAiApiKey });
const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

function shouldFallbackToMock(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { status?: number; message?: string };

  if (candidate.status === 429 || candidate.status === 401) {
    return true;
  }

  return typeof candidate.message === 'string' && /quota|billing|insufficient|rate limit/i.test(candidate.message);
}

app.post('/api/generate-journey', async (request, response) => {
  const topic = typeof request.body?.topic === 'string' ? request.body.topic.trim() : '';
  const language: JourneyLanguage = request.body?.language === 'ru' ? 'ru' : 'en';

  if (!topic) {
    response.status(400).json({ error: 'Topic is required.' });
    return;
  }

  const contentLanguage = language === 'ru' ? 'Russian' : 'English';

  try {
    const aiResponse = await openai.responses.create({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                'Generate a valid knowledge journey JSON for a learning app. Return only structured data. ' +
                'The journey must include exactly 3 checkpoints, each with 2 or 3 activities. ' +
                'It must include at least one multiple-choice, one free-response, one teach-back, and one rank-the-concepts activity. ' +
                `Use realistic educational questions and concise hints. Generate all learner-facing text in ${contentLanguage}. ` +
                'This includes the title, topic wording, checkpoint titles, descriptions, questions, options, correct answers, and hints. ' +
                'Set totalTimeLimitSec to 60 for testing. Every activity must have timeLimitSec and xpReward. ' +
                'Keep ids slug-like and unique.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Topic: ${topic}\nLanguage: ${contentLanguage}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'knowledge_journey',
          strict: true,
          schema: journeyResponseSchema,
        },
      },
    });

    const parsed = JSON.parse(aiResponse.output_text) as JourneyPayload;

    if (!validateJourneyPayload(parsed)) {
      response.status(502).json({ error: 'AI returned an invalid journey shape.' });
      return;
    }

    response.json({
      id: `journey-${Date.now()}`,
      title: parsed.title,
      topic: parsed.topic,
      checkpoints: parsed.checkpoints,
      totalTimeLimitSec: parsed.totalTimeLimitSec,
      source: 'ai',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';

    if (shouldFallbackToMock(error)) {
      response.json(buildFallbackJourney(topic, language));
      return;
    }

    response.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Knowledge Journey backend listening on http://localhost:${port}`);
});
