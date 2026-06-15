import { create } from 'zustand';
import type { Project, ProjectStats } from './types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  stats: ProjectStats | null;
  isLoading: boolean;

  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setStats: (stats: ProjectStats) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  stats: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
