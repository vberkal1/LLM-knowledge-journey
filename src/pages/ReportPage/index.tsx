import { Link, useNavigate } from 'react-router-dom';
import { useGame } from 'entities/user-progress/model/gameContext';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import styles from './ReportPage.module.scss';

export function ReportPage(): JSX.Element {
  const navigate = useNavigate();
  const { journey, status, answers, totalActivities, resetJourney } = useJourney();
  const { totalXP, currentStreak, maxStreak, achievements, correctAnswers, totalAnswered, nextXpMultiplier } = useGame();

  const answerMap = new Map(answers.map((answer) => [answer.activityId, answer]));
  const maxXP = journey
    ? journey.checkpoints.reduce(
        (total, checkpoint) =>
          total + checkpoint.activities.reduce((checkpointTotal, activity) => checkpointTotal + activity.xpReward, 0),
        0,
      )
    : 0;
  const completionRate = totalActivities > 0 ? Math.round((answers.length / totalActivities) * 100) : 0;

  function handlePrint(): void {
    window.print();
  }

  function handleRestart(): void {
    resetJourney();
    navigate('/');
  }

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        {!journey ? (
          <div className={styles.card}>
            <h1>Report</h1>
            <p>No journey state is available yet.</p>
            <Link className={styles.link} to="/">
              Go to Landing
            </Link>
          </div>
        ) : (
          <>
            <article className={styles.heroCard}>
              <span className={styles.eyebrow}>Final Report</span>
              <h1>{journey.title}</h1>
              <p className={styles.description}>
                Topic: {journey.topic}. Status: {status}. Completion: {completionRate}%.
              </p>
              <div className={styles.summaryGrid}>
                <div className={styles.metricCard}>
                  <strong>
                    {totalXP}/{maxXP}
                  </strong>
                  <span>Total XP</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>
                    {correctAnswers}/{Math.max(totalAnswered, answers.length)}
                  </strong>
                  <span>Correct Answers</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>{maxStreak}</strong>
                  <span>Max Streak</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>{achievements.length}</strong>
                  <span>Achievements</span>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.primaryAction} onClick={handlePrint} type="button">
                  Download Report
                </button>
                <button className={styles.secondaryAction} onClick={handleRestart} type="button">
                  Start Again
                </button>
              </div>
            </article>

            <article className={styles.card}>
              <h2>Performance Snapshot</h2>
              <ul className={styles.metrics}>
                <li>Journey: {journey.title}</li>
                <li>
                  Answered activities: {answers.length}/{totalActivities}
                </li>
                <li>Current streak at finish: {currentStreak}</li>
                <li>Next multiplier state: x{nextXpMultiplier}</li>
                <li>Achievements earned: {achievements.length > 0 ? achievements.join(', ') : 'none yet'}</li>
              </ul>
            </article>

            <div className={styles.checkpointList}>
              {journey.checkpoints.map((checkpoint) => (
                <article className={styles.card} key={checkpoint.id}>
                  <header className={styles.sectionHeader}>
                    <span className={styles.order}>Checkpoint {checkpoint.order}</span>
                    <h2>{checkpoint.title}</h2>
                  </header>
                  <p className={styles.description}>{checkpoint.description}</p>
                  <div className={styles.answerTable}>
                    {checkpoint.activities.map((activity) => {
                      const answer = answerMap.get(activity.id);

                      return (
                        <article className={styles.answerCard} key={activity.id}>
                          <div className={styles.answerHeader}>
                            <strong>{activity.question}</strong>
                            <span className={answer?.isCorrect ? styles.resultSuccess : styles.resultError}>
                              {answer ? (answer.isCorrect ? 'Correct' : 'Incorrect') : 'Not answered'}
                            </span>
                          </div>
                          <span className={styles.meta}>
                            Type: {activity.type} | Reward: {activity.xpReward} XP | Time limit: {activity.timeLimitSec}s
                          </span>
                          <span>
                            Your answer:{' '}
                            {answer
                              ? Array.isArray(answer.answer)
                                ? answer.answer.join(' -> ')
                                : answer.answer || 'No answer submitted'
                              : 'No answer submitted'}
                          </span>
                          <span>Feedback: {answer?.feedback ?? 'No feedback available'}</span>
                          <span>XP earned: {answer?.earnedXP ?? 0}</span>
                        </article>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.footerActions}>
              <Link className={styles.link} to="/journey">
                Back to Journey
              </Link>
              <Link className={styles.link} to="/">
                Go to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
