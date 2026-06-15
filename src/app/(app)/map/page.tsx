import type { Metadata } from 'next';
import MapViewClient from './MapViewClient';
import styles from './map.module.scss';

export const metadata: Metadata = {
  title: 'Mapa de incidencias | Spybee',
};

export default function MapPage() {
  return (
    <div className={styles.page}>
      <MapViewClient />
    </div>
  );
}
