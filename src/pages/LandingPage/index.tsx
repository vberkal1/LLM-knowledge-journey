import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_JOURNEY_TOPIC } from 'shared/api/mocks/journeyMocks';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import styles from './LandingPage.module.scss';

export function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { startJourney, status, journey, resetJourney } = useJourney();
  const [topic, setTopic] = useState<string>(journey?.topic ?? DEFAULT_JOURNEY_TOPIC);
  const [error, setError] = useState<string>('');

  async function handleGenerateJourney(event?: React.FormEvent<HTMLFormElement>): Promise<void> {
    event?.preventDefault();

    const sanitizedTopic = topic.trim();

    if (!sanitizedTopic) {
      setError('Enter a topic before generating a journey.');
      return;
    }

    setError('');

    const isStarted = await startJourney(sanitizedTopic);

    if (isStarted) {
      navigate('/journey');
      return;
    }

    setError('Could not generate the journey. Try again.');
  }

  return (
    <section className={styles.page}>
      <form className={styles.hero} onSubmit={(event) => void handleGenerateJourney(event)}>
        <span className={styles.eyebrow}>Knowledge Journey</span>
        <h1 className={styles.title}>Turn any topic into a guided learning path.</h1>
        <p className={styles.description}>
          Enter a topic, generate a structured journey, and resume from local progress after reload.
        </p>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Topic</span>
          <input
            className={styles.input}
            onChange={(event) => setTopic(event.target.value)}
            placeholder={DEFAULT_JOURNEY_TOPIC}
            type="text"
            value={topic}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Text Upload</span>
          <div className={styles.uploadPlaceholder}>
            Upload source text will be added later. For now, journey generation uses the topic field only.
          </div>
        </label>
        <div className={styles.sessionCard}>
          <div>
            <strong>Saved session</strong>
            <p className={styles.sessionText}>
              {journey
                ? `Resume "${journey.title}" from local storage.`
                : 'No saved journey found yet.'}
            </p>
          </div>
          {journey ? <span className={styles.sessionBadge}>Ready to resume</span> : null}
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button className={styles.primaryAction} disabled={status === 'loading'} type="submit">
            {status === 'loading' ? 'Generating...' : 'Generate Journey'}
          </button>
          <button
            className={styles.secondaryAction}
            disabled={!journey}
            onClick={() => navigate('/journey')}
            type="button"
          >
            Resume Journey
          </button>
          <button className={styles.tertiaryAction} onClick={resetJourney} type="button">
            Reset Progress
          </button>
        </div>
      </form>
    </section>
  );
}
