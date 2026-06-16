'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { TrendLineItem } from '@/hooks/useDashboardData';
import { ChartCard } from './ChartCard';

type TrendLineProps = { data: TrendLineItem[] };

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
      <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ margin: 0, color: p.color }}>
          {p.name === 'created' ? 'Creadas' : 'Cerradas'}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function TrendLine({ data }: TrendLineProps) {
  return (
    <ChartCard title="Tendencia mensual" fullWidth>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--gray-100)" />
          <XAxis
            dataKey="month"
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (value === 'created' ? 'Creadas' : 'Cerradas')}
            wrapperStyle={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}
          />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#F4C400"
            strokeWidth={2}
            dot={{ r: 3, fill: '#F4C400' }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="closed"
            stroke="#1F1F1F"
            strokeWidth={2}
            dot={{ r: 3, fill: '#1F1F1F' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
