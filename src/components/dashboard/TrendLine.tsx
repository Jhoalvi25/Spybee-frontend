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
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
          <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
          <XAxis
            dataKey="month"
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (value === 'created' ? 'Creadas' : 'Cerradas')}
            wrapperStyle={{ fontSize: '0.8125rem', color: '#6b7280' }}
          />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ r: 3, fill: '#2563EB' }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="closed"
            stroke="#16A34A"
            strokeWidth={2}
            dot={{ r: 3, fill: '#16A34A' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
