'use client'

import type { Assignment, Disposition } from '@/lib/types'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface DispositionChartProps {
  assignments: Assignment[];
}

export function DispositionChart({ assignments }: DispositionChartProps) {
  const dispositionCounts = assignments.reduce((acc, assignment) => {
    if (assignment.disposition) {
      acc[assignment.disposition] = (acc[assignment.disposition] || 0) + 1;
    }
    return acc;
  }, {} as Record<Disposition, number>);

  const chartData = Object.entries(dispositionCounts).map(([name, total]) => ({ name, total }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--secondary))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
