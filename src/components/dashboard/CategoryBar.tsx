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
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <strong>{label}:</strong> {payload[0].value}
    </div>
  );
}

const BAR_COLORS = [
  '#2563EB', '#059669', '#D97706', '#DC2626',
  '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
];

export function CategoryBar({ data }: CategoryBarProps) {
  return (
    <ChartCard title="Incidencias por categoría" fullWidth>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
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
