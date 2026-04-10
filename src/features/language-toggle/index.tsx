import { useI18n } from 'shared/lib/i18n';
import styles from './LanguageToggle.module.scss';

export function LanguageToggle(): JSX.Element {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={styles.toggle}>
      <span className={styles.label}>{t('language.label')}</span>
      <button
        className={language === 'en' ? `${styles.option} ${styles.optionActive}` : styles.option}
        onClick={() => setLanguage('en')}
        type="button"
      >
        {t('language.en')}
      </button>
      <button
        className={language === 'ru' ? `${styles.option} ${styles.optionActive}` : styles.option}
        onClick={() => setLanguage('ru')}
        type="button"
      >
        {t('language.ru')}
      </button>
    </div>
  );
}
