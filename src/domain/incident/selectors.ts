import type { Incident, IncidentsFilters } from './types';
import type { ProjectStats } from '@/domain/project/types';

export const selectFilteredIncidents = (state: {
  incidents: Incident[];
  filters: IncidentsFilters;
}): Incident[] => {
  const { incidents, filters } = state;

  if (!filters.status && !filters.priority && !filters.typeKey && !filters.search && !filters.projectId) {
    return incidents;
  }

  return incidents.filter((incident) => {
    if (filters.status && incident.status !== filters.status) return false;
    if (filters.priority && incident.priority !== filters.priority) return false;
    if (filters.typeKey && incident.type.key !== filters.typeKey) return false;
    if (filters.projectId && incident.project.id !== filters.projectId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        incident.title.toLowerCase().includes(q) ||
        incident.description.toLowerCase().includes(q) ||
        incident.sequenceId.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
};

export const selectIncidentsByProject = (projectId: string) => (state: {
  incidents: Incident[];
}): Incident[] => state.incidents.filter((i) => i.project.id === projectId);

export const selectProjectStats = (projectId: string) => (state: {
  incidents: Incident[];
}): ProjectStats => {
  const projectIncidents = state.incidents.filter((i) => i.project.id === projectId);
  return {
    totalIncidents: projectIncidents.length,
    openIncidents: projectIncidents.filter((i) => i.status === 'open').length,
    closedIncidents: projectIncidents.filter((i) => i.status === 'closed').length,
    highPriorityIncidents: projectIncidents.filter((i) => i.priority === 'high' && i.status !== 'closed').length,
  };
};
