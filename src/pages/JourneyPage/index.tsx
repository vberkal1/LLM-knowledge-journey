import { Link } from 'react-router-dom';
import { useGame } from 'entities/user-progress/model/gameContext';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import styles from './JourneyPage.module.scss';

export function JourneyPage(): JSX.Element {
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
    completeJourney,
    goToNextActivity,
  } = useJourney();
  const { totalXP, currentStreak, maxStreak, achievements } = useGame();

  const isReady = Boolean(journey && currentCheckpoint && currentActivity);
  const activeJourney = isReady ? journey : null;
  const activeCheckpoint = isReady ? currentCheckpoint : null;
  const activeActivity = isReady ? currentActivity : null;

  return (
    <section className={styles.page}>
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
              </div>
              <div className={styles.actions}>
                <button className={styles.primaryAction} onClick={goToNextActivity} type="button">
                  Next Activity
                </button>
                <button className={styles.secondaryAction} onClick={completeJourney} type="button">
                  Mark Journey Complete
                </button>
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
                <li>Status: {status}</li>
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
