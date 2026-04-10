import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'ru';

type MessageValue = string | ((params?: Record<string, string | number>) => string);

const LANGUAGE_STORAGE_KEY = 'knowledge-journey-language';

const messages: Record<Language, Record<string, MessageValue>> = {
  en: {
    'app.title': 'Knowledge Journey',
    'nav.home': 'Home',
    'nav.journey': 'Journey',
    'nav.report': 'Report',
    'theme.label': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'language.label': 'Language',
    'language.en': 'EN',
    'language.ru': 'RU',
    'landing.eyebrow': 'Knowledge Journey',
    'landing.title': 'Turn any topic into a guided learning path.',
    'landing.description': 'Enter a topic, generate a structured journey, and resume from local progress after reload.',
    'landing.topicLabel': 'Topic',
    'landing.topicPlaceholder': 'Neural Networks and Backpropagation',
    'landing.uploadLabel': 'Text Upload',
    'landing.uploadPlaceholder': 'Upload source text will be added later. For now, journey generation uses the topic field only.',
    'landing.savedSession': 'Saved session',
    'landing.savedSessionResume': 'Resume "{title}" from local storage.',
    'landing.savedSessionEmpty': 'No saved journey found yet.',
    'landing.savedSessionReady': 'Ready to resume',
    'landing.errorEmptyTopic': 'Enter a topic before generating a journey.',
    'landing.errorGenerate': 'Could not generate the journey. Try again.',
    'landing.generating': 'Generating...',
    'landing.generate': 'Generate Journey',
    'landing.resume': 'Resume Journey',
    'landing.reset': 'Reset Progress',
    'journey.generating': 'Generating journey...',
    'journey.noActiveTitle': 'No active journey',
    'journey.noActiveText': 'Start a journey from the landing page or restore one from storage.',
    'journey.goLanding': 'Go to Landing',
    'journey.active': 'Active Journey',
    'journey.checkpoints': 'Checkpoints',
    'journey.completed': 'Completed',
    'journey.totalXp': 'Total XP',
    'journey.checkpoint': 'Checkpoint {order}',
    'journey.activity': 'Activity {current}/{total}',
    'journey.savedAnswers': 'Saved answers: {count}',
    'journey.checkpointIndex': 'Checkpoint index: {count}',
    'journey.activityIndex': 'Activity index: {count}',
    'journey.currentStreak': 'Current streak: {count}',
    'journey.maxStreak': 'Max streak: {count}',
    'journey.nextMultiplier': 'Next XP multiplier: x{value}',
    'journey.status': 'Status: {value}',
    'journey.currentAnswerSaved': 'Current answer saved: {value}',
    'journey.currentAnswerSavedYes': 'yes',
    'journey.currentAnswerSavedNo': 'no',
    'journey.achievements': 'Achievements stored: {value}',
    'journey.noneYet': 'none yet',
    'journey.openReport': 'Open Report State',
    'journey.progressState': 'Progress State',
    'journey.sessionSnapshot': 'Session Snapshot',
    'journey.timerJourney': 'Journey Timer',
    'journey.timerActivity': 'Activity Timer',
    'journey.toastAchievement': 'Achievement unlocked: {name}',
    'journey.timeoutFeedback': 'Time is up. Hint: {hint}',
    'timer.timeUp': 'Time is up',
    'timer.remaining': '{seconds}s remaining',
    'activity.debugHint': 'Dev shortcut: press Ctrl+Z to reveal the expected answer marker.',
    'activity.up': 'Up',
    'activity.down': 'Down',
    'activity.response': 'Your response',
    'activity.answer': 'Your answer',
    'activity.correct': 'Correct',
    'activity.needsWork': 'Needs work',
    'activity.submit': 'Submit Answer',
    'activity.checking': 'Checking...',
    'activity.next': 'Next',
    'activity.finish': 'Finish Journey',
    'report.title': 'Final Report',
    'report.empty': 'No journey state is available yet.',
    'report.topicStatus': 'Topic: {topic}. Status: {status}. Completion: {completion}%.',
    'report.totalXp': 'Total XP',
    'report.correctAnswers': 'Correct Answers',
    'report.maxStreak': 'Max Streak',
    'report.achievements': 'Achievements',
    'report.download': 'Download Report',
    'report.startAgain': 'Start Again',
    'report.snapshot': 'Performance Snapshot',
    'report.journey': 'Journey: {title}',
    'report.answeredActivities': 'Answered activities: {answered}/{total}',
    'report.currentStreak': 'Current streak at finish: {count}',
    'report.nextMultiplier': 'Next multiplier state: x{value}',
    'report.achievementsEarned': 'Achievements earned: {value}',
    'report.typeMeta': 'Type: {type} | Reward: {xp} XP | Time limit: {time}s',
    'report.yourAnswer': 'Your answer: {value}',
    'report.feedback': 'Feedback: {value}',
    'report.xpEarned': 'XP earned: {value}',
    'report.notAnswered': 'Not answered',
    'report.incorrect': 'Incorrect',
    'report.noAnswerSubmitted': 'No answer submitted',
    'report.noFeedback': 'No feedback available',
    'report.backToJourney': 'Back to Journey',
    'report.goHome': 'Go to Home',
    'status.idle': 'idle',
    'status.loading': 'loading',
    'status.active': 'active',
    'status.completed': 'completed',
    'achievement.first_steps': 'First Steps',
    'achievement.streak_5': 'Streak 5',
    'achievement.sprinter': 'Sprinter',
    'feedback.rank.correct': 'Correct order. You understand the sequence of the forward pass.',
    'feedback.rank.incorrect': 'The order is off. Revisit how inputs become activations and then predictions.',
    'feedback.exact.correct': 'Correct. The answer matches the expected result.',
    'feedback.exact.incorrect': 'Not quite. Hint: {hint}',
    'feedback.freeform.correct': 'Good explanation. The key ideas are present.',
    'feedback.freeform.incorrect': 'Needs more detail. Try covering these ideas: {keywords}.',
    'feedback.missingEvaluator': 'No evaluator configured for activity type "{type}".',
  },
  ru: {
    'app.title': 'Knowledge Journey',
    'nav.home': 'Главная',
    'nav.journey': 'Путь',
    'nav.report': 'Отчёт',
    'theme.label': 'Тема',
    'theme.light': 'Светлая',
    'theme.dark': 'Тёмная',
    'language.label': 'Язык',
    'language.en': 'EN',
    'language.ru': 'RU',
    'landing.eyebrow': 'Knowledge Journey',
    'landing.title': 'Превратите любую тему в структурированный маршрут обучения.',
    'landing.description': 'Введите тему, сгенерируйте учебный путь и продолжайте с сохранённого прогресса после перезагрузки.',
    'landing.topicLabel': 'Тема',
    'landing.topicPlaceholder': 'Neural Networks and Backpropagation',
    'landing.uploadLabel': 'Загрузка текста',
    'landing.uploadPlaceholder': 'Загрузка исходного текста будет добавлена позже. Пока генерация пути использует только поле темы.',
    'landing.savedSession': 'Сохранённая сессия',
    'landing.savedSessionResume': 'Продолжить "{title}" из local storage.',
    'landing.savedSessionEmpty': 'Сохранённый путь пока не найден.',
    'landing.savedSessionReady': 'Можно продолжить',
    'landing.errorEmptyTopic': 'Введите тему перед генерацией пути.',
    'landing.errorGenerate': 'Не удалось сгенерировать путь. Попробуйте ещё раз.',
    'landing.generating': 'Генерация...',
    'landing.generate': 'Сгенерировать путь',
    'landing.resume': 'Продолжить путь',
    'landing.reset': 'Сбросить прогресс',
    'journey.generating': 'Генерация пути...',
    'journey.noActiveTitle': 'Нет активного пути',
    'journey.noActiveText': 'Начните путь с главной страницы или восстановите его из хранилища.',
    'journey.goLanding': 'На главную',
    'journey.active': 'Активный путь',
    'journey.checkpoints': 'Чекпоинты',
    'journey.completed': 'Пройдено',
    'journey.totalXp': 'Всего XP',
    'journey.checkpoint': 'Чекпоинт {order}',
    'journey.activity': 'Активность {current}/{total}',
    'journey.savedAnswers': 'Сохранено ответов: {count}',
    'journey.checkpointIndex': 'Индекс чекпоинта: {count}',
    'journey.activityIndex': 'Индекс активности: {count}',
    'journey.currentStreak': 'Текущая серия: {count}',
    'journey.maxStreak': 'Макс. серия: {count}',
    'journey.nextMultiplier': 'Следующий множитель XP: x{value}',
    'journey.status': 'Статус: {value}',
    'journey.currentAnswerSaved': 'Ответ для текущей активности сохранён: {value}',
    'journey.currentAnswerSavedYes': 'да',
    'journey.currentAnswerSavedNo': 'нет',
    'journey.achievements': 'Достижения: {value}',
    'journey.noneYet': 'пока нет',
    'journey.openReport': 'Открыть отчёт',
    'journey.progressState': 'Состояние прогресса',
    'journey.sessionSnapshot': 'Снимок сессии',
    'journey.timerJourney': 'Таймер пути',
    'journey.timerActivity': 'Таймер активности',
    'journey.toastAchievement': 'Получено достижение: {name}',
    'journey.timeoutFeedback': 'Время вышло. Подсказка: {hint}',
    'timer.timeUp': 'Время вышло',
    'timer.remaining': 'Осталось {seconds}с',
    'activity.debugHint': 'Dev shortcut: нажмите Ctrl+Z, чтобы показать маркер правильного ответа.',
    'activity.up': 'Вверх',
    'activity.down': 'Вниз',
    'activity.response': 'Ваш ответ',
    'activity.answer': 'Ваш ответ',
    'activity.correct': 'Верно',
    'activity.needsWork': 'Нужно доработать',
    'activity.submit': 'Отправить ответ',
    'activity.checking': 'Проверка...',
    'activity.next': 'Далее',
    'activity.finish': 'Завершить путь',
    'report.title': 'Финальный отчёт',
    'report.empty': 'Состояние пути пока недоступно.',
    'report.topicStatus': 'Тема: {topic}. Статус: {status}. Завершение: {completion}%.',
    'report.totalXp': 'Всего XP',
    'report.correctAnswers': 'Правильные ответы',
    'report.maxStreak': 'Макс. серия',
    'report.achievements': 'Достижения',
    'report.download': 'Скачать отчёт',
    'report.startAgain': 'Начать заново',
    'report.snapshot': 'Сводка результата',
    'report.journey': 'Путь: {title}',
    'report.answeredActivities': 'Отвечено активностей: {answered}/{total}',
    'report.currentStreak': 'Серия к моменту завершения: {count}',
    'report.nextMultiplier': 'Состояние следующего множителя: x{value}',
    'report.achievementsEarned': 'Полученные достижения: {value}',
    'report.typeMeta': 'Тип: {type} | Награда: {xp} XP | Лимит: {time}с',
    'report.yourAnswer': 'Ваш ответ: {value}',
    'report.feedback': 'Фидбек: {value}',
    'report.xpEarned': 'Получено XP: {value}',
    'report.notAnswered': 'Не отвечено',
    'report.incorrect': 'Неверно',
    'report.noAnswerSubmitted': 'Ответ не отправлен',
    'report.noFeedback': 'Фидбек недоступен',
    'report.backToJourney': 'Вернуться к пути',
    'report.goHome': 'На главную',
    'status.idle': 'ожидание',
    'status.loading': 'загрузка',
    'status.active': 'активен',
    'status.completed': 'завершён',
    'achievement.first_steps': 'Первые шаги',
    'achievement.streak_5': 'Серия 5',
    'achievement.sprinter': 'Спринтер',
    'feedback.rank.correct': 'Порядок верный. Вы понимаете последовательность прямого прохода.',
    'feedback.rank.incorrect': 'Порядок нарушен. Ещё раз проверьте, как входы превращаются в активации и предсказание.',
    'feedback.exact.correct': 'Верно. Ответ совпадает с ожидаемым.',
    'feedback.exact.incorrect': 'Пока неточно. Подсказка: {hint}',
    'feedback.freeform.correct': 'Хорошее объяснение. Ключевые идеи присутствуют.',
    'feedback.freeform.incorrect': 'Не хватает деталей. Попробуйте упомянуть: {keywords}.',
    'feedback.missingEvaluator': 'Для активности типа "{type}" ещё не настроена проверка.',
  },
};

messages.en['journey.source'] = 'Source: {value}';
messages.en['journey.source.ai'] = 'AI';
messages.en['journey.source.fallback'] = 'Fallback mock';
messages.en['report.source'] = 'Generation source: {value}';

messages.ru['journey.source'] = 'Источник: {value}';
messages.ru['journey.source.ai'] = 'AI';
messages.ru['journey.source.fallback'] = 'Fallback mock';
messages.ru['report.source'] = 'Источник генерации: {value}';

function formatMessage(template: MessageValue, params?: Record<string, string | number>): string {
  if (typeof template === 'function') {
    return template(params);
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params?.[key] ?? ''));
}

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return savedLanguage === 'ru' ? 'ru' : 'en';
}

export function translate(language: Language, key: string, params?: Record<string, string | number>): string {
  const template = messages[language][key] ?? messages.en[key] ?? key;

  return formatMessage(template, params);
}

export function resolveFeedbackMessage(input: {
  language: Language;
  feedback?: string;
  feedbackKey?: string;
  feedbackParams?: Record<string, string | number>;
}): string {
  if (input.feedbackKey) {
    return translate(input.language, input.feedbackKey, input.feedbackParams);
  }

  return input.feedback ?? '';
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps): JSX.Element {
  const [language, setLanguage] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => translate(language, key, params),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useI18n must be used inside LanguageProvider');
  }

  return context;
}
