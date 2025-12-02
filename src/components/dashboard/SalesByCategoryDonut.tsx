"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Label, Legend, Cell } from "recharts";

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

export default function SalesByCategoryCard({
  windowLabel,
  data,
  loading,
}: Props) {
  const totalItems = React.useMemo(
    () => data?.sales?.reduce((acc, curr) => acc + curr.totalItems, 0) ?? 0,
    [data]
  );
  const [width, setWidth] = React.useState<number>(0);

  React.useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (loading) {
    return (
      <Card className="col-span-3 row-span-1 flex items-center justify-center p-6">
        Loading...
      </Card>
    );
  }

  if (!data?.sales || data.sales.length === 0 || totalItems === 0) {
    return (
      <Card className="col-span-3 row-span-1 flex flex-col items-center justify-center p-6 gap-4">
        <img src="/favicon.png" alt="Empty" className="w-12 h-12 opacity-70" />
        <p className="text-muted-foreground">No sales data available</p>
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
    <Card className="flex flex-col col-span-3 row-span-1 pt-6 gap-2">
      <CardHeader className="items-center pb-0">
        <CardTitle>Sales by Category</CardTitle>
        {/* <CardDescription>{windowLabel}</CardDescription> */}
      </CardHeader>

      <CardContent className="flex-1 pb-0 w-full max-h-[150px]">
        <div className="flex h-full w-full items-center justify-center gap-4">
          {/* Chart */}
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-full" // bigger so legend fits
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
                innerRadius={40}
                outerRadius={60}
                strokeWidth={2}
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
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} name={entry.name} />
                ))}
              </Pie>
              {!(width >= 768 && width <= 1140) && (
                <Legend
                  className="text-sm"
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              )}
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
