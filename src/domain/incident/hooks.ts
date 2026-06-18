import { useShallow } from 'zustand/react/shallow';
import { useIncidentStore } from './store';
import type { Incident, IncidentsFilters } from './types';
import { INCIDENT_STATUS_LABELS, INCIDENT_PRIORITY_LABELS } from '@/lib/constants';
import {
  selectFilteredIncidents as _selectFilteredIncidents,
  selectIncidentsByProject as _selectIncidentsByProject,
  selectProjectStats as _selectProjectStats,
} from './selectors';

export const selectFilteredIncidents = _selectFilteredIncidents;
export const selectIncidentsByProject = _selectIncidentsByProject;
export const selectProjectStats = _selectProjectStats;

export const selectIncidents = (state: { incidents: Incident[] }) => state.incidents;

export const selectSelectedId = (state: { selectedId: string | null }) => state.selectedId;

export const selectFilters = (state: { filters: IncidentsFilters }) => state.filters;

export const selectIsLoading = (state: { isLoading: boolean }) => state.isLoading;

export const selectError = (state: { error: string | null }) => state.error;

export const selectSelectedIncident = (state: {
  incidents: Incident[];
  selectedId: string | null;
}): Incident | null =>
  state.incidents.find((i) => i.id === state.selectedId) ?? null;

export function getStatusLabel(status: string): string {
  return INCIDENT_STATUS_LABELS[status] ?? status;
}

export function getPriorityLabel(priority: string): string {
  return INCIDENT_PRIORITY_LABELS[priority] ?? priority;
}

export const useIncidents = () => useIncidentStore(selectIncidents);

export const useSelectedId = () => useIncidentStore(selectSelectedId);

export const useFilters = () => useIncidentStore(selectFilters);

export const useIsLoading = () => useIncidentStore(selectIsLoading);

export const useError = () => useIncidentStore(selectError);

export const useSelectedIncident = () =>
  useIncidentStore(useShallow(selectSelectedIncident));

export const useFilteredIncidents = () =>
  useIncidentStore(useShallow(selectFilteredIncidents));

export const useIncidentsByProject = (projectId: string) =>
  useIncidentStore(useShallow(selectIncidentsByProject(projectId)));

export const useProjectStats = (projectId: string) =>
  useIncidentStore(useShallow(selectProjectStats(projectId)));

export const useLoadIncidents = () => useIncidentStore((s) => s.loadIncidents);
export const useCreateIncident = () => useIncidentStore((s) => s.createIncident);
export const useUpdateIncident = () => useIncidentStore((s) => s.updateIncident);
export const useRemoveIncident = () => useIncidentStore((s) => s.removeIncident);
export const useSelectIncident = () => useIncidentStore((s) => s.selectIncident);
export const useSetFilters = () => useIncidentStore((s) => s.setFilters);
export const useResetFilters = () => useIncidentStore((s) => s.resetFilters);
