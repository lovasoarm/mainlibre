import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'normal' | 'large';
};

export function Button({ children, tone = 'secondary', size = 'normal', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${styles.button} ${styles[tone]} ${size === 'large' ? styles.large : ''} ${className}`} {...props}>{children}</button>;
}
