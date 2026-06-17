import styles from './Tooltip.module.scss';
import type { ReactNode } from 'react';

type TooltipProps = {
  label: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

export function Tooltip({ label, children, position = 'top' }: TooltipProps) {
  return (
    <span className={`${styles.wrapper} ${styles[position]}`} data-tooltip={label}>
      {children}
    </span>
  );
}
