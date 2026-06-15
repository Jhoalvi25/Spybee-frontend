'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PriorityDonutItem } from '@/hooks/useDashboardData';
import { ChartCard } from './ChartCard';

type PriorityDonutProps = { data: PriorityDonutItem[] };

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
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
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          marginRight: 6,
        }}
      />
      <strong>{name}:</strong> {value}
    </div>
  );
}

export function PriorityDonut({ data }: PriorityDonutProps) {
  return (
    <ChartCard title="Incidencias por prioridad">
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
              color: '#6b7280',
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
