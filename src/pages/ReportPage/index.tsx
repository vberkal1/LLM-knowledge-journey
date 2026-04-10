import { Link, useNavigate } from 'react-router-dom';
import { useGame } from 'entities/user-progress/model/gameContext';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import { useI18n } from 'shared/lib/i18n';
import styles from './ReportPage.module.scss';

export function ReportPage(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useI18n();
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
            <h1>{t('report.title')}</h1>
            <p>{t('report.empty')}</p>
            <Link className={styles.link} to="/">
              {t('journey.goLanding')}
            </Link>
          </div>
        ) : (
          <>
            <article className={styles.heroCard}>
              <span className={styles.eyebrow}>{t('report.title')}</span>
              <h1>{journey.title}</h1>
              <p className={styles.description}>
                {t('report.topicStatus', {
                  topic: journey.topic,
                  status: t(`status.${status}`),
                  completion: completionRate,
                })}
              </p>
              <div className={styles.summaryGrid}>
                <div className={styles.metricCard}>
                  <strong>
                    {totalXP}/{maxXP}
                  </strong>
                  <span>{t('report.totalXp')}</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>
                    {correctAnswers}/{Math.max(totalAnswered, answers.length)}
                  </strong>
                  <span>{t('report.correctAnswers')}</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>{maxStreak}</strong>
                  <span>{t('report.maxStreak')}</span>
                </div>
                <div className={styles.metricCard}>
                  <strong>{achievements.length}</strong>
                  <span>{t('report.achievements')}</span>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.primaryAction} onClick={handlePrint} type="button">
                  {t('report.download')}
                </button>
                <button className={styles.secondaryAction} onClick={handleRestart} type="button">
                  {t('report.startAgain')}
                </button>
              </div>
            </article>

            <article className={styles.card}>
              <h2>{t('report.snapshot')}</h2>
              <ul className={styles.metrics}>
                <li>{t('report.journey', { title: journey.title })}</li>
                <li>{t('report.answeredActivities', { answered: answers.length, total: totalActivities })}</li>
                <li>{t('report.currentStreak', { count: currentStreak })}</li>
                <li>{t('report.nextMultiplier', { value: nextXpMultiplier })}</li>
                <li>
                  {t('report.achievementsEarned', {
                    value:
                      achievements.length > 0
                        ? achievements.map((achievement) => t(`achievement.${achievement}`)).join(', ')
                        : t('journey.noneYet'),
                  })}
                </li>
              </ul>
            </article>

            <div className={styles.checkpointList}>
              {journey.checkpoints.map((checkpoint) => (
                <article className={styles.card} key={checkpoint.id}>
                  <header className={styles.sectionHeader}>
                    <span className={styles.order}>{t('journey.checkpoint', { order: checkpoint.order })}</span>
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
                              {answer ? (answer.isCorrect ? t('activity.correct') : t('report.incorrect')) : t('report.notAnswered')}
                            </span>
                          </div>
                          <span className={styles.meta}>
                            {t('report.typeMeta', {
                              type: activity.type,
                              xp: activity.xpReward,
                              time: activity.timeLimitSec,
                            })}
                          </span>
                          <span>
                            {t('report.yourAnswer', {
                              value: answer
                                ? Array.isArray(answer.answer)
                                  ? answer.answer.join(' -> ')
                                  : answer.answer || t('report.noAnswerSubmitted')
                                : t('report.noAnswerSubmitted'),
                            })}
                          </span>
                          <span>{t('report.feedback', { value: answer?.feedback ?? t('report.noFeedback') })}</span>
                          <span>{t('report.xpEarned', { value: answer?.earnedXP ?? 0 })}</span>
                        </article>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.footerActions}>
              <Link className={styles.link} to="/journey">
                {t('report.backToJourney')}
              </Link>
              <Link className={styles.link} to="/">
                {t('report.goHome')}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
