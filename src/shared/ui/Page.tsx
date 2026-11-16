import type { ReactNode } from 'react';
import styles from './Page.module.css';

export function Page({ title, description, children, eyebrow }: { title: string; description?: string; children: ReactNode; eyebrow?: string }) {
  return <main className={styles.page} id="main-content" tabIndex={-1}>
    <header className={styles.heading}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
    {children}
  </main>;
}
