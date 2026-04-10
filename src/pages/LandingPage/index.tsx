import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_JOURNEY_TOPIC } from 'shared/api/mocks/journeyMocks';
import { useI18n } from 'shared/lib/i18n';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import styles from './LandingPage.module.scss';

export function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const { startJourney, status, journey, resetJourney } = useJourney();
  const [topic, setTopic] = useState<string>(journey?.topic ?? DEFAULT_JOURNEY_TOPIC);
  const [error, setError] = useState<string>('');

  async function handleGenerateJourney(event?: React.FormEvent<HTMLFormElement>): Promise<void> {
    event?.preventDefault();

    const sanitizedTopic = topic.trim();

    if (!sanitizedTopic) {
      setError(t('landing.errorEmptyTopic'));
      return;
    }

    setError('');

    const isStarted = await startJourney(sanitizedTopic, language);

    if (isStarted) {
      navigate('/journey');
      return;
    }

    setError(t('landing.errorGenerate'));
  }

  function handleResumeJourney(): void {
    if (!journey) {
      return;
    }

    navigate('/journey');
  }

  return (
    <section className={styles.page}>
      <form className={styles.hero} onSubmit={(event) => void handleGenerateJourney(event)}>
        <span className={styles.eyebrow}>{t('landing.eyebrow')}</span>
        <h1 className={styles.title}>{t('landing.title')}</h1>
        <p className={styles.description}>{t('landing.description')}</p>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('landing.topicLabel')}</span>
          <input
            className={styles.input}
            onChange={(event) => setTopic(event.target.value)}
            placeholder={t('landing.topicPlaceholder') || DEFAULT_JOURNEY_TOPIC}
            type="text"
            value={topic}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('landing.uploadLabel')}</span>
          <div className={styles.uploadPlaceholder}>{t('landing.uploadPlaceholder')}</div>
        </label>
        <button
          className={journey ? `${styles.sessionCard} ${styles.sessionCardActive}` : styles.sessionCard}
          disabled={!journey}
          onClick={handleResumeJourney}
          type="button"
        >
          <div>
            <strong>{t('landing.savedSession')}</strong>
            <p className={styles.sessionText}>
              {journey ? t('landing.savedSessionResume', { title: journey.title }) : t('landing.savedSessionEmpty')}
            </p>
          </div>
          {journey ? <span className={styles.sessionBadge}>{t('landing.savedSessionReady')}</span> : null}
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button className={styles.primaryAction} disabled={status === 'loading'} type="submit">
            {status === 'loading' ? t('landing.generating') : t('landing.generate')}
          </button>
          <button
            className={styles.secondaryAction}
            disabled={!journey}
            onClick={handleResumeJourney}
            type="button"
          >
            {t('landing.resume')}
          </button>
          <button className={styles.tertiaryAction} onClick={resetJourney} type="button">
            {t('landing.reset')}
          </button>
        </div>
      </form>
    </section>
  );
}
