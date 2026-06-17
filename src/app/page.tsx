'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Layers,
  Bot,
  BarChart3,
  Building2,
  Satellite,
  Zap,
  MapPin,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import styles from './page.module.scss';

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`${styles.reveal} ${inView ? styles.revealed : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className={styles.page}>
      {/* ─── Navbar ─────────────────────── */}
      <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <img
              src="https://framerusercontent.com/images/TTtZTL2AMihMgjjJZiD92s2wS0Q.png?width=1818&height=900"
              alt="Spybee"
              height={62}
              className={styles.navLogoImg}
            />
          </Link>

          <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <Link href="/dashboard" className={styles.navLink} onClick={closeMenu}>
              Dashboard
            </Link>
            <Link href="/map" className={styles.navLink} onClick={closeMenu}>
              Mapa
            </Link>
            <Link href="/login" className={styles.navCta} onClick={closeMenu}>
              Iniciar sesión
              <ArrowUpRight size={14} />
            </Link>
          </nav>

          <button
            type="button"
            className={styles.navToggle}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ─── Hero ───────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroTagline}>
              <Zap size={12} />
              Construcción inteligente
            </div>
            <h1 className={styles.heroTitle}>
              Supervisa tu obra en tiempo real
              <br />
              con <span className={styles.yellow}>IA</span>,{' '}
              <span className={styles.yellow}>drones</span> y{' '}
              <span className={styles.yellow}>cámaras 360°</span>
            </h1>
            <p className={styles.heroSub}>
              Centraliza la información de tu proyecto, detecta incidencias y
              toma decisiones basadas en datos.
            </p>
            <div className={styles.heroActions}>
              <Link href="/dashboard" className={styles.btnPrimary}>
                Ir al Dashboard
                <ChevronRight size={16} />
              </Link>
              <Link href="/map" className={styles.btnOutline}>
                Explorar Mapa
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mockupDashboard}>
              <div className={styles.mockupHeader}>
                <span className={styles.mockupDot} />
                <span className={styles.mockupDot} />
                <span className={styles.mockupDot} />
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.mockupTitle}>Panel de control</div>
                <div className={styles.mockupKpis}>
                  <div className={styles.mockupKpi}>
                    <span className={styles.mockupKpiValue}>15</span>
                    <span className={styles.mockupKpiLabel}>Total</span>
                  </div>
                  <div className={styles.mockupKpi}>
                    <span className={styles.mockupKpiValue}>8</span>
                    <span className={styles.mockupKpiLabel}>Abiertas</span>
                  </div>
                  <div className={styles.mockupKpi}>
                    <span className={styles.mockupKpiValue}>5</span>
                    <span className={styles.mockupKpiLabel}>Cerradas</span>
                  </div>
                </div>
                <div className={styles.mockupChart}>
                  {[40, 65, 30, 80, 55, 45, 70].map((h, i) => (
                    <div key={i} className={styles.mockupBar} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className={styles.mockupLegend}>
                  <span className={styles.mockupLegendItem}>
                    <span className={styles.mockupLegendDot} style={{ background: '#22C55E' }} />Abiertas
                  </span>
                  <span className={styles.mockupLegendItem}>
                    <span className={styles.mockupLegendDot} style={{ background: '#A3A3A3' }} />Cerradas
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.mockupMap}>
              <div className={styles.mockupMapGrid} />
              <div className={styles.mockupMarker} style={{ top: '30%', left: '40%', background: '#F4C400' }} />
              <div className={styles.mockupMarker} style={{ top: '55%', left: '65%', background: '#EF4444' }} />
              <div className={styles.mockupMarker} style={{ top: '70%', left: '30%', background: '#22C55E' }} />
              <div className={styles.mockupMarker} style={{ top: '40%', left: '75%', background: '#F4C400' }} />
              <div className={styles.mockupMarkerPulse} style={{ top: '30%', left: '40%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Capabilities ───────────────── */}
      <section className={styles.capabilities}>
        <div className={styles.sectionInner}>
          <AnimatedSection>
            <div className={styles.sectionTag}>Capacidades</div>
            <h2 className={styles.sectionTitle}>
              Todo lo que necesitas para supervisar tu obra
            </h2>
            <p className={styles.sectionSub}>
              Una plataforma unificada con tecnología de punta para la construcción moderna.
            </p>
          </AnimatedSection>

          <div className={styles.cards}>
            {[
              {
                icon: Satellite,
                title: 'Supervisión geográfica',
                desc: 'Mapas interactivos con marcadores de incidencias, vista satelital y control de obra en tiempo real.',
              },
              {
                icon: Bot,
                title: 'Inteligencia artificial',
                desc: 'Detección automática de anomalías, clasificación de incidencias y recomendaciones predictivas.',
              },
              {
                icon: BarChart3,
                title: 'Analítica y KPIs',
                desc: 'Dashboard con métricas clave, tendencias, distribuciones y tiempo promedio de resolución.',
              },
              {
                icon: Building2,
                title: 'Gestión de incidencias',
                desc: 'Registro, seguimiento y cierre de incidencias con asignación de responsables y prioridades.',
              },
            ].map((cap, i) => {
              const Icon = cap.icon;
              return (
                <AnimatedSection key={i}>
                  <div className={styles.card}>
                    <div className={styles.cardIcon}>
                      <Icon size={22} />
                    </div>
                    <h3 className={styles.cardTitle}>{cap.title}</h3>
                    <p className={styles.cardDesc}>{cap.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Metrics ────────────────────── */}
      <section className={styles.metrics}>
        <div className={styles.sectionInner}>
          <div className={styles.metricsGrid}>
            {[
              { icon: Layers, value: '15+', label: 'Incidencias monitoreadas' },
              { icon: Satellite, value: '360°', label: 'Visión del proyecto' },
              { icon: Zap, value: 'Tiempo real', label: 'Actualización instantánea' },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <AnimatedSection key={i} className={styles.metricItem}>
                  <div className={styles.metricIcon}>
                    <Icon size={24} />
                  </div>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={styles.metricLabel}>{m.label}</span>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.sectionInner}>
          <div className={styles.footerContent}>
            <Link href="/" className={styles.footerLogo}>
              <img
                src="https://framerusercontent.com/images/TTtZTL2AMihMgjjJZiD92s2wS0Q.png?width=1818&height=900"
                alt="Spybee"
                height={62}
                className={styles.navLogoImg}
              />
            </Link>
            <p className={styles.footerSub}>ConTech SaaS Platform</p>
            <p className={styles.footerLocation}>Colombia</p>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>
              &copy; {new Date().getFullYear()} Spybee. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
