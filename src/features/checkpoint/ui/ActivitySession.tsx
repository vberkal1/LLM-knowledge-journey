import { useEffect, useMemo, useState } from 'react';
import { evaluateAnswer } from 'shared/api/aiService';
import { resolveFeedbackMessage, useI18n } from 'shared/lib/i18n';
import type { Activity, UserAnswer } from 'shared/lib/types';
import styles from './ActivitySession.module.scss';

interface ActivitySessionProps {
  activity: Activity;
  savedAnswer?: UserAnswer;
  onSubmit: (payload: {
    answer: string | string[];
    isCorrect: boolean;
    earnedXP: number;
    feedback: string;
    feedbackKey?: string;
    feedbackParams?: Record<string, string | number>;
  }) => void;
  onNext: () => void;
  isFinalActivity: boolean;
}

function buildInitialAnswer(activity: Activity): string | string[] {
  if (activity.type === 'rank-the-concepts') {
    return [...(activity.options ?? [])];
  }

  return '';
}

function isTextActivity(activity: Activity): boolean {
  return (
    activity.type === 'free-response' ||
    activity.type === 'teach-back' ||
    activity.type === 'explain-like-im-five' ||
    activity.type === 'give-your-example' ||
    activity.type === 'your-custom-component'
  );
}

export function ActivitySession({
  activity,
  savedAnswer,
  onSubmit,
  onNext,
  isFinalActivity,
}: ActivitySessionProps): JSX.Element {
  const { t, language } = useI18n();
  const [answer, setAnswer] = useState<string | string[]>(() => savedAnswer?.answer ?? buildInitialAnswer(activity));
  const [feedback, setFeedback] = useState<string>(
    resolveFeedbackMessage({
      language,
      feedback: savedAnswer?.feedback,
      feedbackKey: savedAnswer?.feedbackKey,
      feedbackParams: savedAnswer?.feedbackParams,
    }),
  );
  const [isCorrect, setIsCorrect] = useState<boolean>(savedAnswer?.isCorrect ?? false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [debugRevealEnabled, setDebugRevealEnabled] = useState<boolean>(false);

  useEffect(() => {
    setAnswer(savedAnswer?.answer ?? buildInitialAnswer(activity));
    setFeedback(
      resolveFeedbackMessage({
        language,
        feedback: savedAnswer?.feedback,
        feedbackKey: savedAnswer?.feedbackKey,
        feedbackParams: savedAnswer?.feedbackParams,
      }),
    );
    setIsCorrect(savedAnswer?.isCorrect ?? false);
    setIsSubmitting(false);
    setDebugRevealEnabled(false);
  }, [activity, language, savedAnswer]);

  const isAnswered = Boolean(savedAnswer);
  useEffect(() => {
    function onWindowKeyDown(event: KeyboardEvent): void {
      if (!event.ctrlKey || event.key.toLowerCase() !== 'z' || isAnswered) {
        return;
      }

      event.preventDefault();
      setDebugRevealEnabled(true);

      if (activity.type === 'rank-the-concepts') {
        setAnswer(buildDebugAnswer());
        return;
      }

      if (activity.options && typeof activity.correctAnswer === 'string') {
        setAnswer(activity.correctAnswer);
        return;
      }

      setAnswer(buildDebugAnswer());
    }

    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [activity, isAnswered]);
  const rankAnswer = Array.isArray(answer) ? answer : [];
  const hasValidInput = useMemo(() => {
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    return answer.trim().length > 0;
  }, [answer]);

  function moveRankItem(index: number, direction: -1 | 1): void {
    if (!Array.isArray(answer)) {
      return;
    }

    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= answer.length) {
      return;
    }

    const nextOrder = [...answer];
    const currentItem = nextOrder[index];

    nextOrder[index] = nextOrder[nextIndex];
    nextOrder[nextIndex] = currentItem;
    setAnswer(nextOrder);
  }

  function buildDebugAnswer(): string | string[] {
    if (activity.type === 'rank-the-concepts') {
      const orderedItems = Array.isArray(activity.correctAnswer)
        ? [...activity.correctAnswer]
        : [...(activity.options ?? [])];

      if (orderedItems.length === 0) {
        return [];
      }

      const lastIndex = orderedItems.length - 1;
      orderedItems[lastIndex] = `${orderedItems[lastIndex]}.`;

      return orderedItems;
    }

    if (typeof activity.correctAnswer === 'string') {
      return `${activity.correctAnswer}.`;
    }

    if (Array.isArray(activity.correctAnswer)) {
      return `${activity.correctAnswer.join(', ')}.`;
    }

    return '';
  }

  async function handleSubmit(): Promise<void> {
    if (!hasValidInput || isAnswered) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await evaluateAnswer(activity, answer);
      const earnedXP = result.isCorrect ? activity.xpReward : 0;
      const resolvedFeedback = resolveFeedbackMessage({
        language,
        feedbackKey: result.feedbackKey,
        feedbackParams: result.feedbackParams,
      });

      setFeedback(resolvedFeedback);
      setIsCorrect(result.isCorrect);
      onSubmit({
        answer,
        isCorrect: result.isCorrect,
        earnedXP,
        feedback: resolvedFeedback,
        feedbackKey: result.feedbackKey,
        feedbackParams: result.feedbackParams,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.session}>
      <p className={styles.debugHint}>{t('activity.debugHint')}</p>
      {activity.options && activity.type !== 'rank-the-concepts' ? (
        <div className={styles.optionGroup}>
          {activity.options.map((option) => {
            const checked = answer === option;
            const label =
              debugRevealEnabled && option === activity.correctAnswer ? `${option}.` : option;

            return (
              <label className={styles.optionCard} key={option}>
                <input
                  checked={checked}
                  className={styles.optionInput}
                  disabled={isAnswered}
                  name={activity.id}
                  onChange={() => setAnswer(option)}
                  type="radio"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      ) : null}

      {activity.type === 'rank-the-concepts' ? (
        <div className={styles.rankList}>
          {rankAnswer.map((item, index) => (
            <div className={styles.rankItem} key={item}>
              <div>
                <span className={styles.rankIndex}>{index + 1}</span>
                <span>{item}</span>
              </div>
              <div className={styles.rankActions}>
                <button disabled={isAnswered || index === 0} onClick={() => moveRankItem(index, -1)} type="button">
                  {t('activity.up')}
                </button>
                <button
                  disabled={isAnswered || index === rankAnswer.length - 1}
                  onClick={() => moveRankItem(index, 1)}
                  type="button"
                >
                  {t('activity.down')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!activity.options || isTextActivity(activity) || activity.type === 'fill-blank' ? (
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {isTextActivity(activity) ? t('activity.response') : t('activity.answer')}
          </span>
          {isTextActivity(activity) ? (
            <textarea
              className={styles.textarea}
              disabled={isAnswered}
              onChange={(event) => setAnswer(event.target.value)}
              rows={6}
              value={typeof answer === 'string' ? answer : ''}
            />
          ) : (
            <input
              className={styles.input}
              disabled={isAnswered}
              onChange={(event) => setAnswer(event.target.value)}
              type="text"
              value={typeof answer === 'string' ? answer : ''}
            />
          )}
        </label>
      ) : null}

      {isAnswered ? (
        <div className={isCorrect ? styles.feedbackSuccess : styles.feedbackError}>
          <strong>{isCorrect ? t('activity.correct') : t('activity.needsWork')}</strong>
          <p>{feedback}</p>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          disabled={!hasValidInput || isAnswered || isSubmitting}
          onClick={() => void handleSubmit()}
          type="button"
        >
          {isSubmitting ? t('activity.checking') : t('activity.submit')}
        </button>
        <button className={styles.nextButton} disabled={!isAnswered} onClick={onNext} type="button">
          {isFinalActivity ? t('activity.finish') : t('activity.next')}
        </button>
      </div>
    </div>
  );
}
