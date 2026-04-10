import { Link, NavLink } from 'react-router-dom';
import { LanguageToggle } from 'features/language-toggle';
import { ThemeToggle } from 'features/theme-toggle';
import { useI18n } from 'shared/lib/i18n';
import styles from './AppShell.module.scss';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  const { t } = useI18n();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          {t('app.title')}
        </Link>
        <nav className={styles.nav}>
          <NavLink
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            to="/"
          >
            {t('nav.home')}
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            to="/journey"
          >
            {t('nav.journey')}
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            to="/report"
          >
            {t('nav.report')}
          </NavLink>
        </nav>
        <div className={styles.controls}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
