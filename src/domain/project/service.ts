import type { Project } from './types';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Edificio Corporativo Centro',
    address: 'Av. Principal 123, Santiago',
    description: 'Construcción de edificio corporativo de 15 pisos.',
    startDate: '2026-01-15',
    endDate: '2027-06-30',
    status: 'active',
  },
  {
    id: 'PRJ-002',
    name: 'Residencial Los Olivos',
    address: 'Calle Los Olivos 456, Santiago',
    description: 'Conjunto habitacional de 40 viviendas.',
    startDate: '2026-03-01',
    status: 'active',
  },
];

export async function fetchProjects(): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_PROJECTS;
}
