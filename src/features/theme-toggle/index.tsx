import { useTheme } from 'shared/lib/theme';
import styles from './ThemeToggle.module.scss';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={styles.toggle} onClick={toggleTheme} type="button">
      <span className={styles.label}>Theme</span>
      <span className={styles.value}>{theme === 'light' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
