import { useI18n } from 'shared/lib/i18n';
import styles from './TimerDisplay.module.scss';

interface TimerDisplayProps {
  label: string;
  remainingSec: number;
  totalSec: number;
  tone?: 'default' | 'critical';
}

function formatTime(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TimerDisplay({
  label,
  remainingSec,
  totalSec,
  tone = 'default',
}: TimerDisplayProps): JSX.Element {
  const { t } = useI18n();
  const safeTotal = Math.max(totalSec, 1);
  const safeRemaining = Math.max(remainingSec, 0);
  const progress = (safeRemaining / safeTotal) * 100;
  const className = tone === 'critical' ? `${styles.card} ${styles.cardCritical}` : styles.card;

  return (
    <article className={className}>
      <span className={styles.label}>{label}</span>
      <div
        aria-hidden="true"
        className={styles.ring}
        style={{ ['--timer-progress' as string]: `${progress}%` }}
      >
        <div className={styles.ringInner}>{formatTime(safeRemaining)}</div>
      </div>
      <span className={styles.caption}>
        {safeRemaining === 0 ? t('timer.timeUp') : t('timer.remaining', { seconds: safeRemaining })}
      </span>
    </article>
  );
}
