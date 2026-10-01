"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Tasks",
    color: "#4f46e5", // Indigo 600
  },
} satisfies ChartConfig;

export function TaskChart({ data }: { data: { status: string, count: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="status" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            fontSize={12}
            tickFormatter={(value) => value.replace("_", " ")}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            fontSize={12} 
            allowDecimals={false}
          />
          <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
