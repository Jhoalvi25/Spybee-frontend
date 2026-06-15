import type { Incident } from './types';
import MOCK_INCIDENTS from './incidents.mock.json';

export async function fetchIncidents(): Promise<Incident[]> {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_INCIDENTS as Incident[];
}

export async function fetchIncidentById(id: string): Promise<Incident | undefined> {
  await new Promise((r) => setTimeout(r, 300));
  return (MOCK_INCIDENTS as Incident[]).find((i) => i.id === id);
}
