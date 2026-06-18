import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.scss';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Spybee - Incidencias en construcción',
  description:
    'Plataforma de supervisión de obras con IA, drones y gemelos digitales. Gestión de incidencias para construcción.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
