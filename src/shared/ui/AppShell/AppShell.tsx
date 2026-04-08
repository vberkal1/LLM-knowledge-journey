import { Link, NavLink } from 'react-router-dom';
import { ThemeToggle } from 'features/theme-toggle';
import styles from './AppShell.module.scss';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          Knowledge Journey
        </Link>
        <nav className={styles.nav}>
          <NavLink
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            to="/journey"
          >
            Journey
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            to="/report"
          >
            Report
          </NavLink>
        </nav>
        <ThemeToggle />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
