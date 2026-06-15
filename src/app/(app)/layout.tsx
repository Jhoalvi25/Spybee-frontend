'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import styles from './layout.module.scss';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className={styles.layout}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />

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
  );
}
