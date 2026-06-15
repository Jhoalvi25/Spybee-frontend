'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useIncidents, useLoadIncidents } from '@/domain/incident/hooks';
import { CreateIncidentModal } from '@/components/incident/CreateIncidentModal';
import styles from './page.module.scss';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const incidents = useIncidents();
  const loadIncidents = useLoadIncidents();

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Spybee</h1>
        <p className={styles.subtitle}>Gestión de incidencias</p>
      </header>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>
          + Nueva incidencia
        </button>

        <Link href="/dashboard" className={styles.btnOutline}>
          Dashboard
        </Link>

        <Link href="/map" className={styles.btnOutline}>
          Mapa
        </Link>
      </div>

      <p className={styles.counter}>
        {incidents.length} incidencias cargadas
      </p>

      <Link href="/login" className={styles.loginLink}>
        Iniciar sesión
      </Link>

      <CreateIncidentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
