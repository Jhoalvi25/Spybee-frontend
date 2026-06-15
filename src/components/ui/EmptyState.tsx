import styles from './EmptyState.module.scss';
import type { ReactNode } from 'react';

type Action = {
  label: string;
  onClick: () => void;
};

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: Action;
  secondaryAction?: Action;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      {icon && <div className={styles.icon}>{icon}</div>}

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      {(action || secondaryAction) && (
        <div className={styles.actions}>
          {action && (
            <button type="button" className={styles.btnPrimary} onClick={action.onClick}>
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button type="button" className={styles.btnSecondary} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
