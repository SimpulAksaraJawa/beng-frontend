import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  // CardFooter,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

// --- Fetchers ---
const fetchOrdersChart = async () => {
  const res = await api.get("/dashboard/orders/chart?window=1m");
  return res.data.data; // [{day, total}]
};

const fetchSalesChart = async () => {
  const res = await api.get("/dashboard/sales/chart?window=1m");
  return res.data.data; // [{day, total}]
};

const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--chart-1)",
  },
  sales: {
    label: "Sales",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { user } = useAuth();
  const currUser = {
    name: user?.name || "Shadcn",
    email: user?.email || "my-email@example.com",
    avatar: "/otter.png",
    role: user?.role || "USER",
  };

  // Queries
  const { data: ordersChart, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-chart"],
    queryFn: fetchOrdersChart,
  });

  const { data: salesChart, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-chart"],
    queryFn: fetchSalesChart,
  });

  // Loading or no data
  if (ordersLoading || salesLoading) {
    return <p className="p-6">Loading chart...</p>;
  }
  if (!ordersChart || !salesChart) {
    return <p className="p-6">No chart data found.</p>;
  }

  // Combine datasets by date
  const combined = ordersChart.map((o: any) => {
    const matched = salesChart.find((s: any) => s.day === o.day);
    return {
      day: o.day,
      orders: o.total,
      sales: matched?.total ?? 0,
    };
  });

  return (
    <section className="p-6 w-full flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">
        Welcome Back, <span className="text-primary">{currUser.name}</span>!
      </h1>
      <div className="grid grid-cols-3 grid-rows-2 gap-3">
        <Card className="col-span-1 row-span-1">

        </Card>
      <Card className="col-span-2 row-span-1">
        <CardHeader>
          <CardTitle className="pt-6">Orders & Sales Overview</CardTitle>
          <CardDescription>Last 1 Month</CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={combined}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(5)}
                hide={true}
              />

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <defs>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-orders)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-orders)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-sales)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-sales)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <Area
                dataKey="sales"
                type="monotone"
                fill="url(#fillSales)"
                fillOpacity={0.4}
                stroke="var(--color-sales)"
                stackId="a"
              />

              <Area
                dataKey="orders"
                type="monotone"
                fill="url(#fillOrders)"
                fillOpacity={0.4}
                stroke="var(--color-orders)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>

        {/* <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                Trending up <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                Based on behavior from last 30 days
              </div>
            </div>
          </div>
        </CardFooter> */}
      </Card>
      </div>
      {/* Combined Orders + Sales Chart */}
    </section>
  );
}
