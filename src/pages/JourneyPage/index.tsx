import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from 'entities/user-progress/model/gameContext';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import { ActivitySession } from 'features/checkpoint/ui/ActivitySession';
import { TimerDisplay } from 'features/timer/ui/TimerDisplay';
import styles from './JourneyPage.module.scss';

export function JourneyPage(): JSX.Element {
  const navigate = useNavigate();
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
      feedback: `Time is up. Hint: ${activeActivity.hint}`,
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
        <div className={styles.toast}>Achievement unlocked: {latestUnlockedAchievement}</div>
      ) : null}
      {status === 'loading' ? <div className={styles.card}>Generating journey...</div> : null}
      {status !== 'loading' && !journey ? (
        <div className={styles.card}>
          <h1>No active journey</h1>
          <p className={styles.description}>Start a journey from the landing page or restore one from storage.</p>
          <Link className={styles.inlineLink} to="/">
            Go to Landing
          </Link>
        </div>
      ) : null}
      {activeJourney && activeCheckpoint && activeActivity ? (
        <div className={styles.layout}>
          <article className={styles.heroCard}>
            <span className={styles.eyebrow}>Active Journey</span>
            <h1>{activeJourney.title}</h1>
            <p className={styles.description}>{activeJourney.topic}</p>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <strong>{activeJourney.checkpoints.length}</strong>
                <span>Checkpoints</span>
              </div>
              <div className={styles.metric}>
                <strong>
                  {completedActivities}/{totalActivities}
                </strong>
                <span>Completed</span>
              </div>
              <div className={styles.metric}>
                <strong>{totalXP}</strong>
                <span>Total XP</span>
              </div>
            </div>
            <div className={styles.timerGrid}>
              <TimerDisplay
                label="Journey Timer"
                remainingSec={journeyRemainingSec}
                tone={journeyRemainingSec <= 10 ? 'critical' : 'default'}
                totalSec={journeyTimeLimitSec}
              />
              <TimerDisplay
                label="Activity Timer"
                remainingSec={activityRemainingSec}
                tone={activityRemainingSec <= 10 && !savedAnswer ? 'critical' : 'default'}
                totalSec={currentActivityTimeLimitSec}
              />
            </div>
          </article>

          <div className={styles.contentGrid}>
            <article className={styles.card}>
              <header className={styles.cardHeader}>
                <span className={styles.order}>Checkpoint {activeCheckpoint.order}</span>
                <h2>{activeCheckpoint.title}</h2>
              </header>
              <p className={styles.description}>{activeCheckpoint.description}</p>
              <div className={styles.activityItem}>
                <div className={styles.activityMeta}>
                  <span className={styles.badge}>{activeActivity.type}</span>
                  <span>
                    Activity {currentActivityIndex + 1}/{activeCheckpoint.activities.length}
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
                <span className={styles.order}>Progress State</span>
                <h2>Session Snapshot</h2>
              </header>
              <ul className={styles.snapshotList}>
                <li>Checkpoint index: {currentCheckpointIndex}</li>
                <li>Activity index: {currentActivityIndex}</li>
                <li>Saved answers: {answers.length}</li>
                <li>Current streak: {currentStreak}</li>
                <li>Max streak: {maxStreak}</li>
                <li>Next XP multiplier: x{nextXpMultiplier}</li>
                <li>Status: {status}</li>
                <li>Current answer saved: {savedAnswer ? 'yes' : 'no'}</li>
              </ul>
              <p className={styles.hint}>
                Achievements stored: {achievements.length > 0 ? achievements.join(', ') : 'none yet'}
              </p>
              <Link className={styles.inlineLink} to="/report">
                Open Report State
              </Link>
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}
