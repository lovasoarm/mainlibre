import styles from './StatusMessage.module.css';

export function StatusMessage({ children, tone = 'info', live = false }: { children: string; tone?: 'info' | 'warning' | 'error' | 'success'; live?: boolean }) {
  return <p className={`${styles.message} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'} aria-live={live ? 'polite' : 'off'}>{children}</p>;
}
