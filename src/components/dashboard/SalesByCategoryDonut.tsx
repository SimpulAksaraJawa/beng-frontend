"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Label } from "recharts";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Props {
  windowLabel: string;
  data: {
    sales: { category: string; totalItems: number }[];
    total: number;
  };
  loading: boolean;
}

// Dynamically generate color config
const makePieConfig = (categories: string[]): ChartConfig => {
  const config: any = {
    totalItems: { label: "Items" },
  };

  categories.forEach((cat, i) => {
    config[cat] = {
      label: cat,
      color: `var(--chart-${i + 1})`,
    };
  });

  return config;
};

export default function SalesByCategoryCard({ windowLabel, data, loading }: Props) {
  const totalItems = React.useMemo(
    () =>
      data?.sales?.reduce((acc, curr) => acc + curr.totalItems, 0) ?? 0,
    [data]
  );

  if (loading) {
    return (
      <Card className="col-span-3 row-span-1 flex items-center justify-center p-6">
        Loading...
      </Card>
    );
  }

  const categories = data.sales.map((s) => s.category);
  const chartConfig = makePieConfig(categories);

  // Convert API data format → Recharts format
  const chartData = data.sales.map((s, i) => ({
    name: s.category,
    value: s.totalItems,
    fill: `var(--chart-${i + 1})`,
  }));

  return (
    <Card className="flex flex-col col-span-3 row-span-1 pt-6">
      <CardHeader className="items-center pb-0">
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>{windowLabel}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalItems}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Items
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
