import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Spybee - Incidencias',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
