export type IncidentStatus = 'open' | 'on_pause' | 'closed';

export type IncidentPriority = 'low' | 'medium' | 'high';

export interface Person {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface IncidentType {
  id: string;
  key: string;
  name: string;
  name_en: string;
}

export interface IncidentProject {
  id: string;
  name: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface IncidentMedia {
  id: string;
  name: string;
  type: 'image' | 'video';
  format: string;
  size: number;
  status: string;
  url: string;
}

export interface IncidentTag {
  id: string;
  name: string;
  color: string;
}

export interface Incident {
  id: string;
  sequenceId: string;
  order: number;
  title: string;
  description: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  approval: boolean;
  project: IncidentProject;
  owner: Person | null;
  whatsappOwner: null;
  assignees: Person[];
  observers: Person[];
  coordinates: Coordinates;
  locationDescription: string;
  dueDate: string | null;
  closingDate: string | null;
  media: IncidentMedia[];
  tags: IncidentTag[];
  deleted: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentMedia {
  name: string;
  url: string;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  typeKey: string;
  priority: IncidentPriority;
  projectId: string;
  status?: IncidentStatus;
  ownerId?: string;
  assigneeIds?: string[];
  observerIds?: string[];
  lat: number;
  lng: number;
  locationDescription: string;
  dueDate?: string;
  tagIds?: string[];
  media?: CreateIncidentMedia[];
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  type?: IncidentType;
  approval?: boolean;
  coordinates?: Coordinates;
  locationDescription?: string;
  owner?: Person | null;
  assignees?: Person[];
  observers?: Person[];
  dueDate?: string | null;
  closingDate?: string | null;
  tags?: IncidentTag[];
  deleted?: boolean | null;
}

export interface IncidentsFilters {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  typeKey?: string;
  search?: string;
  projectId?: string;
  approval?: boolean;
}
