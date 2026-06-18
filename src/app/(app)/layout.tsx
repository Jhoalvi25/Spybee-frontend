'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Toast } from '@/components/ui/Toast';
import { useTheme } from '@/domain/ui/hooks';
import styles from './layout.module.scss';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <AuthGuard>
      <div className={styles.layout} data-theme={theme}>
        <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />
        <Toast />

        <div className={styles.content}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={openMobile}
            aria-label="Abrir menú"
          >
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </button>

          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
