'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false }
);

export default function MapViewClient() {
  return <MapView />;
}
