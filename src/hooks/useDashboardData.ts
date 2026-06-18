import { useMemo } from 'react';
import { useFilteredIncidents } from '@/domain/incident/hooks';
import type { Incident, IncidentStatus, IncidentPriority } from '@/domain/incident/types';

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const MONTH_INDEX: Record<string, number> = {
  Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5,
  Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11,
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  open: '#22C55E',
  on_pause: '#F59E0B',
  closed: '#A3A3A3',
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Abiertas',
  on_pause: 'En pausa',
  closed: 'Cerradas',
};

const PRIORITY_COLORS: Record<IncidentPriority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#F4C400',
};

const PRIORITY_LABELS: Record<IncidentPriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export type StatusDonutItem = { name: string; value: number; color: string };
export type PriorityDonutItem = { name: string; value: number; color: string };
export type CategoryBarItem = { name: string; value: number };
export type TrendLineItem = { month: string; created: number; closed: number };

export type DashboardData = {
  total: number;
  open: number;
  closed: number;
  overdue: number;
  avgResolutionLabel: string;
  statusData: StatusDonutItem[];
  priorityData: PriorityDonutItem[];
  categoryData: CategoryBarItem[];
  trendData: TrendLineItem[];
};

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function avgResolutionLabel(incidents: Incident[]): string {
  const closed = incidents.filter((i) => i.closingDate);
  if (closed.length === 0) return '—';

  const totalMs = closed.reduce((sum, i) => {
    const created = new Date(i.createdAt).getTime();
    const closedAt = new Date(i.closingDate!).getTime();
    return sum + (closedAt - created);
  }, 0);

  const avgMs = totalMs / closed.length;
  const days = Math.floor(avgMs / 86_400_000);
  const hours = Math.floor((avgMs % 86_400_000) / 3_600_000);
  return `${days}d ${hours}h`;
}

export function computeDashboardData(incidents: Incident[], now?: Date): DashboardData {
  const _now = now ?? new Date();

  const total = incidents.length;
  const open = incidents.filter((i) => i.status === 'open').length;
  const closed = incidents.filter((i) => i.status === 'closed').length;
  const overdue = incidents.filter(
    (i) => i.dueDate && new Date(i.dueDate) < _now && i.status !== 'closed'
  ).length;

  const statusMap: Record<IncidentStatus, number> = {
    open: 0,
    on_pause: 0,
    closed: 0,
  };
  const priorityMap: Record<IncidentPriority, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  const categoryMap = new Map<string, number>();
  const trendMap = new Map<string, { created: number; closed: number }>();

  for (const inc of incidents) {
    statusMap[inc.status]++;
    priorityMap[inc.priority]++;
    categoryMap.set(inc.type.name, (categoryMap.get(inc.type.name) ?? 0) + 1);

    const cKey = monthKey(inc.createdAt);
    const cRow = trendMap.get(cKey) ?? { created: 0, closed: 0 };
    cRow.created++;
    trendMap.set(cKey, cRow);

    if (inc.closingDate) {
      const clKey = monthKey(inc.closingDate);
      const clRow = trendMap.get(clKey) ?? { created: 0, closed: 0 };
      clRow.closed++;
      trendMap.set(clKey, clRow);
    }
  }

  const statusData: StatusDonutItem[] = (
    Object.entries(statusMap) as [IncidentStatus, number][]
  ).map(([key, value]) => ({
    name: STATUS_LABELS[key],
    value,
    color: STATUS_COLORS[key],
  }));

  const priorityData: PriorityDonutItem[] = (
    Object.entries(priorityMap) as [IncidentPriority, number][]
  ).map(([key, value]) => ({
    name: PRIORITY_LABELS[key],
    value,
    color: PRIORITY_COLORS[key],
  }));

  const categoryData: CategoryBarItem[] = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const trendData: TrendLineItem[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => {
      const [mA, yA] = a.split(' ');
      const [mB, yB] = b.split(' ');
      if (yA !== yB) return Number(yA) - Number(yB);
      return MONTH_INDEX[mA] - MONTH_INDEX[mB];
    })
    .map(([month, row]) => ({ month, ...row }));

  return {
    total,
    open,
    closed,
    overdue,
    avgResolutionLabel: avgResolutionLabel(incidents),
    statusData,
    priorityData,
    categoryData,
    trendData,
  };
}

export function useDashboardData(): DashboardData {
  const incidents = useFilteredIncidents();
  return useMemo(() => computeDashboardData(incidents), [incidents]);
}
