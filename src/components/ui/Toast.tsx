'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToastStore } from '@/domain/ui/toastStore';
import styles from './Toast.module.scss';

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: import('@/domain/ui/toastStore').Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const open = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(open);
  }, []);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${visible ? styles.visible : ''} ${exiting ? styles.exiting : ''}`}
      role="alert"
    >
      <span className={styles.icon}>
        {toast.type === 'success' ? '✅' : '❌'}
      </span>

      <div className={styles.body}>
        <span className={styles.title}>{toast.title}</span>
        <span className={styles.message}>{toast.message}</span>
      </div>

      <div className={styles.actions}>
        {toast.action && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              toast.action?.onClick();
              handleDismiss();
            }}
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
