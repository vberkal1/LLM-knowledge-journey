import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from 'entities/user-progress/model/gameContext';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import { ActivitySession } from 'features/checkpoint/ui/ActivitySession';
import { TimerDisplay } from 'features/timer/ui/TimerDisplay';
import { useI18n } from 'shared/lib/i18n';
import styles from './JourneyPage.module.scss';

export function JourneyPage(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    journey,
    status,
    currentCheckpoint,
    currentActivity,
    totalActivities,
    completedActivities,
    currentCheckpointIndex,
    currentActivityIndex,
    answers,
    journeyDeadlineAt,
    activityDeadlineAt,
    journeyTimeLimitSec,
    currentActivityTimeLimitSec,
    submitAnswer,
    completeJourney,
    goToNextActivity,
  } = useJourney();
  const { totalXP, currentStreak, maxStreak, achievements, latestUnlockedAchievement, nextXpMultiplier, dismissAchievementToast } = useGame();
  const [now, setNow] = useState<number>(() => Date.now());
  const activityTimeoutHandledRef = useRef<string | null>(null);

  const isReady = Boolean(journey && currentCheckpoint && currentActivity);
  const activeJourney = isReady ? journey : null;
  const activeCheckpoint = isReady ? currentCheckpoint : null;
  const activeActivity = isReady ? currentActivity : null;
  const savedAnswer = activeActivity ? answers.find((item) => item.activityId === activeActivity.id) : undefined;
  const isFinalActivity = activeJourney && activeCheckpoint && activeActivity
    ? currentCheckpointIndex === activeJourney.checkpoints.length - 1 &&
      currentActivityIndex === activeCheckpoint.activities.length - 1
    : false;
  const journeyRemainingSec = useMemo(() => {
    if (!journeyDeadlineAt || status !== 'active') {
      return 0;
    }

    return Math.max(0, Math.ceil((new Date(journeyDeadlineAt).getTime() - now) / 1000));
  }, [journeyDeadlineAt, now, status]);
  const activityRemainingSec = useMemo(() => {
    if (!activityDeadlineAt || status !== 'active' || savedAnswer) {
      return currentActivityTimeLimitSec;
    }

    return Math.max(0, Math.ceil((new Date(activityDeadlineAt).getTime() - now) / 1000));
  }, [activityDeadlineAt, currentActivityTimeLimitSec, now, savedAnswer, status]);

  useEffect(() => {
    if (status !== 'active') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [status]);

  useEffect(() => {
    if (!latestUnlockedAchievement) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      dismissAchievementToast();
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dismissAchievementToast, latestUnlockedAchievement]);

  useEffect(() => {
    if (!activeActivity) {
      activityTimeoutHandledRef.current = null;
      return;
    }

    activityTimeoutHandledRef.current = null;
  }, [activeActivity?.id]);

  useEffect(() => {
    if (status !== 'active' || journeyRemainingSec > 0) {
      return;
    }

    completeJourney();
    navigate('/report');
  }, [completeJourney, journeyRemainingSec, navigate, status]);

  useEffect(() => {
    if (
      status !== 'active' ||
      !activeActivity ||
      savedAnswer ||
      activityRemainingSec > 0 ||
      activityTimeoutHandledRef.current === activeActivity.id
    ) {
      return;
    }

    activityTimeoutHandledRef.current = activeActivity.id;
    submitAnswer({
      activityId: activeActivity.id,
      answer: '',
      isCorrect: false,
      earnedXP: 0,
      feedback: t('journey.timeoutFeedback', { hint: activeActivity.hint }),
      timeRemainingSec: 0,
      activityTimeLimitSec: activeActivity.timeLimitSec,
    });

    if (isFinalActivity) {
      completeJourney();
      navigate('/report');
      return;
    }

    goToNextActivity();
  }, [
    activeActivity,
    activityRemainingSec,
    completeJourney,
    goToNextActivity,
    isFinalActivity,
    navigate,
    savedAnswer,
    status,
    submitAnswer,
  ]);

  function handleNext(): void {
    goToNextActivity();

    if (isFinalActivity) {
      navigate('/report');
    }
  }

  return (
    <section className={styles.page}>
      {latestUnlockedAchievement ? (
        <div className={styles.toast}>
          {t('journey.toastAchievement', { name: t(`achievement.${latestUnlockedAchievement}`) })}
        </div>
      ) : null}
      {status === 'loading' ? <div className={styles.card}>{t('journey.generating')}</div> : null}
      {status !== 'loading' && !journey ? (
        <div className={styles.card}>
          <h1>{t('journey.noActiveTitle')}</h1>
          <p className={styles.description}>{t('journey.noActiveText')}</p>
          <Link className={styles.inlineLink} to="/">
            {t('journey.goLanding')}
          </Link>
        </div>
      ) : null}
      {activeJourney && activeCheckpoint && activeActivity ? (
        <div className={styles.layout}>
          <article className={styles.heroCard}>
            <span className={styles.eyebrow}>{t('journey.active')}</span>
            <h1>{activeJourney.title}</h1>
            <p className={styles.description}>{activeJourney.topic}</p>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <strong>{activeJourney.checkpoints.length}</strong>
                <span>{t('journey.checkpoints')}</span>
              </div>
              <div className={styles.metric}>
                <strong>
                  {completedActivities}/{totalActivities}
                </strong>
                <span>{t('journey.completed')}</span>
              </div>
              <div className={styles.metric}>
                <strong>{totalXP}</strong>
                <span>{t('journey.totalXp')}</span>
              </div>
            </div>
            <div className={styles.timerGrid}>
              <TimerDisplay
                label={t('journey.timerJourney')}
                remainingSec={journeyRemainingSec}
                tone={journeyRemainingSec <= 10 ? 'critical' : 'default'}
                totalSec={journeyTimeLimitSec}
              />
              <TimerDisplay
                label={t('journey.timerActivity')}
                remainingSec={activityRemainingSec}
                tone={activityRemainingSec <= 10 && !savedAnswer ? 'critical' : 'default'}
                totalSec={currentActivityTimeLimitSec}
              />
            </div>
          </article>

          <div className={styles.contentGrid}>
            <article className={styles.card}>
              <header className={styles.cardHeader}>
                <span className={styles.order}>{t('journey.checkpoint', { order: activeCheckpoint.order })}</span>
                <h2>{activeCheckpoint.title}</h2>
              </header>
              <p className={styles.description}>{activeCheckpoint.description}</p>
              <div className={styles.activityItem}>
                <div className={styles.activityMeta}>
                  <span className={styles.badge}>{activeActivity.type}</span>
                  <span>
                    {t('journey.activity', {
                      current: currentActivityIndex + 1,
                      total: activeCheckpoint.activities.length,
                    })}
                  </span>
                  <span>{activeActivity.timeLimitSec}s</span>
                  <span>{activeActivity.xpReward} XP</span>
                </div>
                <h3>{activeActivity.question}</h3>
                <p className={styles.hint}>Hint: {activeActivity.hint}</p>
                <ActivitySession
                  activity={activeActivity}
                  isFinalActivity={isFinalActivity}
                  onNext={handleNext}
                  onSubmit={({ answer, isCorrect, earnedXP, feedback }) =>
                    submitAnswer({
                      activityId: activeActivity.id,
                      answer,
                      isCorrect,
                      earnedXP,
                      feedback,
                      timeRemainingSec: activityRemainingSec,
                      activityTimeLimitSec: currentActivityTimeLimitSec,
                    })
                  }
                  savedAnswer={savedAnswer}
                />
              </div>
            </article>

            <aside className={styles.card}>
              <header className={styles.cardHeader}>
                <span className={styles.order}>{t('journey.progressState')}</span>
                <h2>{t('journey.sessionSnapshot')}</h2>
              </header>
              <ul className={styles.snapshotList}>
                <li>{t('journey.checkpointIndex', { count: currentCheckpointIndex })}</li>
                <li>{t('journey.activityIndex', { count: currentActivityIndex })}</li>
                <li>{t('journey.savedAnswers', { count: answers.length })}</li>
                <li>{t('journey.currentStreak', { count: currentStreak })}</li>
                <li>{t('journey.maxStreak', { count: maxStreak })}</li>
                <li>{t('journey.nextMultiplier', { value: nextXpMultiplier })}</li>
                <li>{t('journey.status', { value: t(`status.${status}`) })}</li>
                <li>
                  {t('journey.currentAnswerSaved', {
                    value: savedAnswer ? t('journey.currentAnswerSavedYes') : t('journey.currentAnswerSavedNo'),
                  })}
                </li>
              </ul>
              <p className={styles.hint}>
                {t('journey.achievements', {
                  value:
                    achievements.length > 0
                      ? achievements.map((achievement) => t(`achievement.${achievement}`)).join(', ')
                      : t('journey.noneYet'),
                })}
              </p>
              <Link className={styles.inlineLink} to="/report">
                {t('journey.openReport')}
              </Link>
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}
