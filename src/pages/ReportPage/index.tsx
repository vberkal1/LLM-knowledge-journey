import { Link } from 'react-router-dom';
import { useGame } from 'entities/user-progress/model/gameContext';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import styles from './ReportPage.module.scss';

export function ReportPage(): JSX.Element {
  const { journey, status, answers, totalActivities, resetJourney } = useJourney();
  const { totalXP, currentStreak, maxStreak, achievements } = useGame();

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1>Report State</h1>
        {!journey ? (
          <>
            <p>No journey state is available yet.</p>
            <Link className={styles.link} to="/">
              Go to Landing
            </Link>
          </>
        ) : (
          <>
            <p className={styles.description}>
              This is a persistence checkpoint for Milestone 3. Full report UI comes in Milestone 8.
            </p>
            <ul className={styles.metrics}>
              <li>Journey: {journey.title}</li>
              <li>Status: {status}</li>
              <li>
                Answers stored: {answers.length}/{totalActivities}
              </li>
              <li>Total XP: {totalXP}</li>
              <li>Current streak: {currentStreak}</li>
              <li>Max streak: {maxStreak}</li>
              <li>Achievements: {achievements.length > 0 ? achievements.join(', ') : 'none yet'}</li>
            </ul>
            <div className={styles.actions}>
              <Link className={styles.link} to="/journey">
                Back to Journey
              </Link>
              <button className={styles.reset} onClick={resetJourney} type="button">
                Reset All Progress
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
