'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/domain/auth/store';
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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

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

        {user && (
          <div className={styles.user}>
            <div className={styles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <span className={styles.logoutIcon}>🚪</span>
          {!collapsed && <span className={styles.logoutLabel}>Cerrar sesión</span>}
        </button>
      </aside>
    </>
  );
}
