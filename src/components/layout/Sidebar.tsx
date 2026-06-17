'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map, LogOut, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/domain/auth/store';
import { useProjectStore } from '@/domain/project/store';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './Sidebar.module.scss';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Mapa', icon: Map },
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
  const selectedProject = useProjectStore((s) => s.selectedProject);

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
          <img
            src="https://framerusercontent.com/images/KMIp6oxIY5aDYfDah2Rt0hoPC0.png?width=1818&height=900"
            alt="Spybee"
            className={styles.logoImg}
          />
        </div>

        {!collapsed && selectedProject && (
          <div className={styles.projectSection}>
            <span className={styles.projectLabel}>Proyecto</span>
            <p className={styles.projectName}>{selectedProject.name}</p>
          </div>
        )}

        {!collapsed && (
          <span className={styles.navSectionLabel}>Operaciones</span>
        )}

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                onClick={onMobileClose}
              >
                <span className={styles.linkIcon}>
                  <Icon size={18} />
                </span>
                {!collapsed && <span className={styles.linkLabel}>{item.label}</span>}
                {isActive && !collapsed && <span className={styles.activePill} />}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href} label={item.label} position="right">
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerDivider} />

          {user && (
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>Administrador</span>
                  <span className={styles.userEmail}>{user.email}</span>
                  <div className={styles.systemStatus}>
                    <span className={styles.statusDot} />
                    <span>Sistema operativo</span>
                  </div>
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
            <span className={styles.logoutIcon}>
              <LogOut size={16} />
            </span>
            {!collapsed && <span className={styles.logoutLabel}>Cerrar sesión</span>}
          </button>
        </div>

        <button
          type="button"
          className={`${styles.collapseBtn} ${collapsed ? styles.collapseBtnRotated : ''}`}
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <ChevronLeft size={14} />
        </button>
      </aside>
    </>
  );
}
