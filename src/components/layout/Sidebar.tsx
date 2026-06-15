'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.scss';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/map', label: 'Mapa', icon: '🗺️' },
];

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <>
      {mobileOpen && (
        <div className={styles.overlay} onClick={onMobileClose} />
      )}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      >
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔷</span>
          {!collapsed && <span className={styles.logoText}>Spybee</span>}
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                onClick={onMobileClose}
              >
                <span className={styles.linkIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.linkLabel}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={styles.toggle}
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <span className={styles.toggleIcon}>{collapsed ? '▶' : '◀'}</span>
          {!collapsed && <span className={styles.toggleLabel}>Colapsar</span>}
        </button>
      </aside>
    </>
  );
}
