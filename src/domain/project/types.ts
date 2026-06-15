export type ProjectStatus = 'active' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  name: string;
  address: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
}

export interface ProjectStats {
  totalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  highPriorityIncidents: number;
}
