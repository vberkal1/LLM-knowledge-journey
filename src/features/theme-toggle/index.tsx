import { useI18n } from 'shared/lib/i18n';
import { useTheme } from 'shared/lib/theme';
import styles from './ThemeToggle.module.scss';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <button className={styles.toggle} onClick={toggleTheme} type="button">
      <span className={styles.label}>{t('theme.label')}</span>
      <span className={styles.value}>{theme === 'light' ? t('theme.light') : t('theme.dark')}</span>
    </button>
  );
}
