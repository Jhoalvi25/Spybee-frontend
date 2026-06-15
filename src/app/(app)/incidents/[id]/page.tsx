import type { Metadata } from 'next';
import { IncidentDetail } from '@/components/incident/IncidentDetail';

export const metadata: Metadata = {
  title: 'Incidencia | Spybee',
};

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IncidentDetail id={id} />;
}
