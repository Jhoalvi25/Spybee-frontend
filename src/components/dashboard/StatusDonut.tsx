'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { StatusDonutItem } from '@/hooks/useDashboardData';
import { ChartCard } from './ChartCard';

type StatusDonutProps = { data: StatusDonutItem[] };

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
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
      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 6 }} />
      <strong>{name}:</strong> {value}
    </div>
  );
}

export function StatusDonut({ data }: StatusDonutProps) {
  return (
    <ChartCard title="Incidencias por estado">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.25rem',
          listStyle: 'none',
          margin: '0.5rem 0 0',
          padding: 0,
          flexWrap: 'wrap',
          color: 'var(--gray-500)',
        }}
      >
        {data.map((d) => (
          <li
            key={d.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8125rem',
              color: 'var(--gray-500)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: d.color,
              }}
            />
            {d.name}: <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
