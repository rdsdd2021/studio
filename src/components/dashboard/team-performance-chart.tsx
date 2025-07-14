'use client'

import type { Assignment, User } from '@/lib/types'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { CardDescription } from '../ui/card'

interface TeamPerformanceChartProps {
  assignments: Assignment[];
  callers: User[];
}

const chartConfig = {
  count: {
    label: 'Leads Handled',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function TeamPerformanceChart({ assignments, callers }: TeamPerformanceChartProps) {
  const assignmentsByCaller = assignments.reduce((acc, assignment) => {
    // We only count assignments that have a disposition other than 'New'
    if (assignment.disposition && assignment.disposition !== 'New') {
        acc[assignment.userName] = (acc[assignment.userName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = callers.map(caller => ({
    name: caller.name,
    count: assignmentsByCaller[caller.name] || 0,
    fill: 'var(--color-count)'
  }));
  
  return (
    <div className="flex flex-col gap-2">
      <CardDescription>A summary of leads handled by each caller.</CardDescription>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: 10,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
            className="text-xs"
          />
          <XAxis
            dataKey="count"
            type="number"
            hide
            />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
           <Bar dataKey="count" layout="vertical" radius={4}>
             {chartData.map((entry, index) => (
                <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
           </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}

// Re-exporting this primitive for the Bar component above
import * as RechartsPrimitive from "recharts"
