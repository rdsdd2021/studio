
'use client'

import type { Assignment, Disposition } from '@/lib/types'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart'
import { CardDescription } from '../ui/card'

interface DispositionChartProps {
  assignments: Assignment[];
}

const chartConfig = {
  total: {
    label: 'Total',
  },
  'Interested': {
    label: 'Interested',
    color: 'hsl(var(--chart-1))',
  },
  'Not Interested': {
    label: 'Not Interested',
    color: 'hsl(var(--chart-2))',
  },
  'Follow-up': {
    label: 'Follow-up',
    color: 'hsl(var(--chart-3))',
  },
  'Callback': {
    label: 'Callback',
    color: 'hsl(var(--chart-4))',
  },
  'Not Reachable': {
    label: 'Not Reachable',
    color: 'hsl(var(--chart-5))',
  },
   'New': {
    label: 'New',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig

export function DispositionChart({ assignments }: DispositionChartProps) {
  const dispositionCounts = assignments.reduce((acc, assignment) => {
    if (assignment.disposition) {
      acc[assignment.disposition] = (acc[assignment.disposition] || 0) + 1;
    }
    return acc;
  }, {} as Record<Disposition, number>);

  const chartData = Object.entries(dispositionCounts).map(([name, total]) => ({ name, total, fill: `var(--color-${name})`}));

  return (
    <div className="flex flex-col gap-2">
      <CardDescription>A breakdown of all lead dispositions in the system.</CardDescription>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 20,
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 15)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
           <Bar dataKey="total" radius={4} />
           <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
