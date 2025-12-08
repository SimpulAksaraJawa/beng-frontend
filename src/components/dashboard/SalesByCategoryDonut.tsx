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

import { cn } from "@/lib/utils"; // <-- needed for merging classes

interface Props {
  windowLabel: string;
  data: {
    sales: { category: string; totalItems: number }[];
    total: number;
  };
  loading: boolean;
  className?: string; // <-- added
}

// Dynamically generate color config
const makePieConfig = (categories: string[]): ChartConfig => {
  const config: any = { totalItems: { label: "Items" } };

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
  className, // <-- added
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
  const [radius, setRadius] = React.useState({
    inner: 70,
    outer: 90,
  });

  React.useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const xl = window.matchMedia("(min-width: 1280px)");

    const updateRadius = () => {
      if (xl.matches) {
        // >= 1280px
        setRadius({ inner: 60, outer: 80 });
      } else if (lg.matches) {
        // >= 1024px
        setRadius({ inner: 50, outer: 70 });
      } else if (md.matches) {
        // >= 768px
        setRadius({ inner: 40, outer: 50 });
      } else if (sm.matches) {
        // >= 640px
        setRadius({ inner: 60, outer: 80 });
      } else {
        // < 640px
        setRadius({ inner: 40, outer: 60 });
      }
    };

    updateRadius();

    sm.addEventListener("change", updateRadius);
    md.addEventListener("change", updateRadius);
    lg.addEventListener("change", updateRadius);
    xl.addEventListener("change", updateRadius);

    return () => {
      sm.removeEventListener("change", updateRadius);
      md.removeEventListener("change", updateRadius);
      lg.removeEventListener("change", updateRadius);
      xl.removeEventListener("change", updateRadius);
    };
  }, []);

  if (loading) {
    return (
      <Card
        className={cn(
          "col-span-3 row-span-1 flex items-center justify-center p-6",
          className
        )}
      >
        Loading...
      </Card>
    );
  }

  if (!data?.sales || data.sales.length === 0 || totalItems === 0) {
    return (
      <Card
        className={cn(
          "col-span-3 row-span-1 flex flex-col items-center justify-center p-6 gap-4",
          className
        )}
      >
        <img src="/favicon.png" alt="Empty" className="w-12 h-12 opacity-70" />
        <p className="text-muted-foreground">No sales data available</p>
      </Card>
    );
  }

  const categories = data.sales.map((s) => s.category);
  const chartConfig = makePieConfig(categories);

  const chartData = data.sales.map((s, i) => ({
    name: s.category,
    value: s.totalItems,
    fill: `var(--chart-${i + 1})`,
  }));

  return (
    <Card
      className={cn(
        "flex flex-col col-span-3 row-span-1 pt-6 gap-2",
        className // <-- merged
      )}
    >
      <CardHeader className="items-center pb-0">
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-0 md:px-0 lg:px-2 w-full max-h-[250px]">
        <div className="flex h-full items-start justify-center gap-4">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full flex items-center justify-center"
          >
            <PieChart
              className="flex flex-col items-start -p-2"
              style={{ gap: "16px" }}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={radius.inner}
                outerRadius={radius.outer}
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

                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                />

            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
