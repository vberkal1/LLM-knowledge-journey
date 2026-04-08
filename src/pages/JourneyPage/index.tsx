import styles from './JourneyPage.module.scss';

export function JourneyPage(): JSX.Element {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1>Journey Page</h1>
        <p>
          This route is ready for Milestones 2-7. The page is wired into the router and theme system.
        </p>
      </div>
    </section>
  );
}
