import { useState } from "react";
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
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Receipt, Tag, TrendingDown, TrendingUp } from "lucide-react";

const windowLabels: Record<string, string> = {
  "1d": "Last 1 Day",
  "3d": "Last 3 Days",
  "1w": "Last 1 Week",
  "2w": "Last 2 Weeks",
  "1m": "Last 1 Month",
  "3m": "Last 3 Months",
  "6m": "Last 6 Months",
};

// Format Rupiah
const formatRupiah = (value: number) =>
  value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

// Fetchers
const fetchOrdersTotal = async (windowRange: string) => {
  const res = await api.get(`/dashboard/orders?window=${windowRange}`);
  return res.data.total;
};

const fetchSalesTotal = async (windowRange: string) => {
  const res = await api.get(`/dashboard/sales?window=${windowRange}`);
  return res.data.total;
};

const fetchOrdersChart = async (windowRange: string) => {
  const res = await api.get(`/dashboard/orders/chart?window=${windowRange}`);
  return res.data.data;
};

const fetchSalesChart = async (windowRange: string) => {
  const res = await api.get(`/dashboard/sales/chart?window=${windowRange}`);
  return res.data.data;
};

const chartConfig = {
  orders: { label: "Orders", color: "var(--chart-1)" },
  sales: { label: "Sales", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function Dashboard() {
  const { user } = useAuth();

  const currUser = {
    name: user?.name || "Shadcn",
    email: user?.email || "my-email@example.com",
    avatar: "/otter.png",
    role: user?.role || "USER",
  };

  const [windowRange, setWindowRange] = useState("1m");

  // Queries
  const { data: ordersTotal, isLoading: ordersTotalLoading } = useQuery({
    queryKey: ["orders-total", windowRange],
    queryFn: () => fetchOrdersTotal(windowRange),
  });

  const { data: salesTotal, isLoading: salesTotalLoading } = useQuery({
    queryKey: ["sales-total", windowRange],
    queryFn: () => fetchSalesTotal(windowRange),
  });

  const { data: ordersChart, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-chart", windowRange],
    queryFn: () => fetchOrdersChart(windowRange),
  });

  const { data: salesChart, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-chart", windowRange],
    queryFn: () => fetchSalesChart(windowRange),
  });

  // Loading states
  if (ordersLoading || salesLoading)
    return <p className="p-6">Loading chart...</p>;
  if (!ordersChart || !salesChart)
    return <p className="p-6">No chart data found.</p>;
  if (ordersTotalLoading || salesTotalLoading)
    return <p className="p-6">Loading summary...</p>;
  if (ordersTotal == null || salesTotal == null)
    return <p className="p-6">No summary data found.</p>;

  // Trend logic
  const difference = salesTotal - ordersTotal;
  const isUptrend = difference >= 0;

  // Combine datasets
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
      {/* HEADER + RANGE SELECT */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-semibold text-2xl">
          Welcome Back, <span className="text-primary">{currUser.name}</span>!
        </h1>

        <Select value={windowRange} onValueChange={setWindowRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 1 Day</SelectItem>
            <SelectItem value="3d">Last 3 Days</SelectItem>
            <SelectItem value="1w">Last 1 Week</SelectItem>
            <SelectItem value="2w">Last 2 Weeks</SelectItem>
            <SelectItem value="1m">Last 1 Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3 METRIC CARDS */}
      <div className="grid grid-cols-1 grid-rows-1 md:grid-cols-6 gap-3">
        {/* SALES CARD */}
        <Card className="h-[180px] col-span-2">
          <CardHeader className="pt-6">
            <CardTitle>Sales</CardTitle>
            <CardDescription>{windowLabels[windowRange]}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-yellow-300/50">
              <Tag className="text-yellow-800" size={26} />
            </div>
            <p className="text-2xl font-bold">{formatRupiah(salesTotal)}</p>
          </CardContent>
        </Card>

        {/* ORDERS CARD */}
        <Card className="h-[180px] col-span-2">
          <CardHeader className="pt-6">
            <CardTitle>Orders</CardTitle>
            <CardDescription>{windowLabels[windowRange]}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-300/50">
              <Receipt className="text-blue-800" size={26} />
            </div>
            <p className="text-2xl font-bold">{formatRupiah(ordersTotal)}</p>
          </CardContent>
        </Card>

        {/* PROFIT / DEFICIT CARD */}
        <Card className="h-[180px] col-span-2">
          <CardHeader className="pt-6">
            <CardTitle>Profit / Deficit</CardTitle>
            <CardDescription>{windowLabels[windowRange]}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                isUptrend ? "bg-green-300/50" : "bg-red-300/50"
              }`}
            >
              {isUptrend ? (
                <TrendingUp className="text-green-800" size={26} />
              ) : (
                <TrendingDown className="text-red-800" size={26} />
              )}
            </div>

            <div>
              <p className="text-lg font-semibold">
                {isUptrend ? "Profit" : "Deficit"}
              </p>
              <p
                className={`text-xl font-bold ${
                  isUptrend ? "text-green-700" : "text-red-700"
                }`}
              >
                {formatRupiah(difference)}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* CHART */}
        <Card className="h-[280px] col-span-1 md:col-span-3">
          <CardHeader className="pt-6">
            <CardTitle>Orders & Sales Overview</CardTitle>
            <CardDescription>{windowLabels[windowRange]}</CardDescription>
          </CardHeader>

          <CardContent className="h-[160px] w-full">
            <ChartContainer className="h-full w-full" config={chartConfig}>
              <AreaChart accessibilityLayer data={combined}>
                <CartesianGrid vertical={false} horizontal={true} />

                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(5)}
                  hide={true}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

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
        </Card>
      </div>
    </section>
  );
}
