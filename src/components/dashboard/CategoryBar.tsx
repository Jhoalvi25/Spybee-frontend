'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBarItem } from '@/hooks/useDashboardData';
import { ChartCard } from './ChartCard';

type CategoryBarProps = { data: CategoryBarItem[] };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <strong>{label}:</strong> {payload[0].value}
    </div>
  );
}

const BAR_COLORS = [
  '#F4C400', '#1F1F1F', '#22C55E', '#EF4444',
  '#7C3AED', '#F59E0B', '#A3A3A3', '#0891B2',
];

export function CategoryBar({ data }: CategoryBarProps) {
  return (
    <ChartCard title="Incidencias por categoría" fullWidth>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
            axisLine={{ stroke: 'var(--gray-200)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gray-100)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
