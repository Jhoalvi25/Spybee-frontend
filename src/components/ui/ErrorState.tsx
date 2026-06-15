import styles from './ErrorState.module.scss';

type ErrorStateProps = {
  message?: string;
  details?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Ocurrió un error inesperado',
  details,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className={styles.title}>Error</h2>
      <p className={styles.message}>{message}</p>

      {details && <p className={styles.details}>{details}</p>}

      {onRetry && (
        <button type="button" className={styles.btnRetry} onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
