import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_JOURNEY_TOPIC } from 'shared/api/mocks/journeyMocks';
import { useJourney } from 'entities/user-progress/model/journeyContext';
import styles from './LandingPage.module.scss';

export function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { startJourney, status, journey, resetJourney } = useJourney();
  const [topic, setTopic] = useState<string>(journey?.topic ?? DEFAULT_JOURNEY_TOPIC);

  async function handleGenerateJourney(): Promise<void> {
    await startJourney(topic);
    navigate('/journey');
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
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
        <div className={styles.actions}>
          <button className={styles.primaryAction} onClick={() => void handleGenerateJourney()} type="button">
            {status === 'loading' ? 'Generating...' : 'Generate Journey'}
          </button>
          <button className={styles.secondaryAction} onClick={() => navigate('/journey')} type="button">
            Resume Journey
          </button>
          <button className={styles.tertiaryAction} onClick={resetJourney} type="button">
            Reset Progress
          </button>
        </div>
      </div>
    </section>
  );
}
