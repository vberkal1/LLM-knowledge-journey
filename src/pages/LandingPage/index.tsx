import { Link } from 'react-router-dom';
import styles from './LandingPage.module.scss';

export function LandingPage(): JSX.Element {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Knowledge Journey</span>
        <h1 className={styles.title}>Turn any topic into a guided learning path.</h1>
        <p className={styles.description}>
          Milestone 1 sets up the shell: routing, theming, and Feature-Sliced project structure.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} to="/journey">
            Open Journey Flow
          </Link>
          <Link className={styles.secondaryAction} to="/report">
            Preview Report
          </Link>
        </div>
      </div>
    </section>
  );
}
