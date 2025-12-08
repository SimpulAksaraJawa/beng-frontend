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
  CardAction,
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

import {
  ArrowUpRightFromSquareIcon,
  Receipt,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import SalesByCategoryCard from "@/components/dashboard/SalesByCategoryDonut";
import ComparisonCard from "@/components/dashboard/ComparisonCard";
import { Spinner } from "@/components/ui/spinner";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const windowLabels: Record<string, string> = {
  "1d": "Today vs Yesterday",
  "3d": "3 days vs last",
  "1w": "This week vs last",
  "2w": "This 2 weeks vs last",
  "1m": "This month vs last",
  "3m": "This trimester vs last",
  "6m": "This semester vs last",
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

// SALES BY CATEGORY (PIE)
const fetchSalesByCategory = async (windowRange: string) => {
  const res = await api.get(`/dashboard/sales/category?window=${windowRange}`);
  return res.data.data; // { sales: [...], total: number }
};

// ORDERS TOTAL COMPARISON
const fetchOrdersComparison = async (windowRange: string) => {
  const res = await api.get(`/dashboard/orders/total?window=${windowRange}`);
  return res.data.data;
};

// SALES TOTAL COMPARISON
const fetchSalesComparison = async (windowRange: string) => {
  const res = await api.get(`/dashboard/sales/total?window=${windowRange}`);
  return res.data.data;
};

// UNIQUE CUSTOMER TOTAL
const fetchUniqueCustomer = async (windowRange: string) => {
  const res = await api.get(`/dashboard/sales/customers?window=${windowRange}`);
  return res.data.data;
};

const chartConfig = {
  orders: { label: "Orders", color: "var(--chart-1)" },
  sales: { label: "Sales", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();


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

  // Sales by Category
  const { data: salesCategory, isLoading: salesCategoryLoading } = useQuery({
    queryKey: ["sales-category", windowRange],
    queryFn: () => fetchSalesByCategory(windowRange),
  });

  // Orders Comparison
  const { data: ordersComparison } = useQuery({
    queryKey: ["orders-comparison", windowRange],
    queryFn: () => fetchOrdersComparison(windowRange),
  });

  // Sales Comparison
  const { data: salesComparison } = useQuery({
    queryKey: ["sales-comparison", windowRange],
    queryFn: () => fetchSalesComparison(windowRange),
  });

  // Unique Customer Comparison
  const { data: uniqueCustomer } = useQuery({
    queryKey: ["unique-customer", windowRange],
    queryFn: () => fetchUniqueCustomer(windowRange),
  });

  // Loading states
  if (ordersLoading || salesLoading)
    return (
      <p className="flex items-center justify-center h-full w-full p-6 gap-2">
        <Spinner decelerate={0.6} /> Loading chart...
      </p>
    );
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
    <section className="h-full w-full flex flex-col overflow-hidden p-6 mx-auto">
      <SiteHeader />

      {/* Scrollable content wrapper */}
      <div className="p-4 md:p-6 flex flex-col gap-4 flex-1 min-h-0">
        {/* HEADER + RANGE SELECT */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="font-semibold text-2xl md:text-3xl break-words">
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

        {/* PROFIT / DEFICIT */}
        <Card className="p-2">
          <CardContent className="px-2 flex items-center justify-between flex-wrap">
            <div className="flex flex-row items-center gap-4">
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
                <CardTitle className="text-lg md:text-xl">Revenue</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {windowLabels[windowRange]}
                </CardDescription>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-md md:text-lg font-semibold">
                {isUptrend ? "Profit" : "Deficit"}
              </p>
              <p
                className={`text-xl md:text-2xl font-bold ${
                  isUptrend ? "text-green-700" : "text-red-700"
                }`}
              >
                {formatRupiah(difference)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* METRICS + CHART GRID */}
        <div className="flex-1 min-h-0">
          <div
            className="
          h-full
          grid
          grid-cols-1
          md:grid-cols-9
          grid-rows-[auto_1fr]
          gap-3
        "
          >
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 items-stretch justify-between col-span-9 lg:col-span-3">
              {/* SALES CARD */}
              <Card className="flex-1">
                <CardHeader className="pt-6">
                  <div className=" flex flex-col lg:flex-row gap-2 lg:items-center">
                    <CardTitle>Sales</CardTitle>
                    <CardDescription>
                      {windowLabels[windowRange]}
                    </CardDescription>
                  </div>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate("/sales");
                      }}
                      className="ml-auto"
                    >
                      <ArrowUpRightFromSquareIcon size={5} />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex items-center gap-4 -mt-4">
                  <div className="size-6 flex items-center justify-center rounded-md bg-yellow-300/50">
                    <Tag className="text-yellow-800" size={16} />
                  </div>
                  <p className="md:text-md lg:text-xl font-bold truncate">
                    {formatRupiah(salesTotal)}
                  </p>
                </CardContent>
              </Card>

              {/* ORDERS CARD */}
              <Card className="flex-1">
                <CardHeader className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>
                      {windowLabels[windowRange]}
                    </CardDescription>
                  </div>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate("/orders");
                      }}
                      className="ml-auto"
                    >
                      <ArrowUpRightFromSquareIcon size={5} />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex items-center gap-4 -mt-4">
                  <div className="size-6  flex items-center justify-center rounded-md bg-blue-300/50">
                    <Receipt className="text-blue-800" size={16} />
                  </div>
                  <p className="md:text-lg lg:text-xl font-bold truncate">
                    {formatRupiah(ordersTotal)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CHART */}
            <Card className="col-span-9 md:col-span-6 h-full">
              <CardHeader className="pt-6">
                <CardTitle>Orders & Sales Overview</CardTitle>
                <CardDescription>{windowLabels[windowRange]}</CardDescription>
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate("/sales");
                    }}
                    className="ml-auto"
                  >
                    <ArrowUpRightFromSquareIcon size={5} />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="h-full w-full">
                <ChartContainer
                  className="h-[140px] max-h-full w-full"
                  config={chartConfig}
                >
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
                      <linearGradient
                        id="fillOrders"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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

                      <linearGradient
                        id="fillSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      stroke="var(--color-sales)"
                      fillOpacity={0.4}
                    />
                    <Area
                      dataKey="orders"
                      type="monotone"
                      fill="url(#fillOrders)"
                      stroke="var(--color-orders)"
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* SALES CATEGORY DONUT */}
            <SalesByCategoryCard
              windowLabel={windowLabels[windowRange]}
              data={salesCategory}
              loading={salesCategoryLoading}
              className="col-span-9 md:col-span-3 h-[320px]  sm:h-full"
            />

            {/* COMPARISON CARDS */}
            <div className="lg:col-span-6 gap-4 grid grid-cols-2 grid-rows-2 col-span-9">
              {ordersComparison && (
                <ComparisonCard
                  title="Orders"
                  windowLabel={windowLabels[windowRange]}
                  data={ordersComparison}
                  icon={Receipt}
                  color="bg-blue-300/50"
                  unit="orders"
                  redirectTo="/orders"
                  className="col-span-2 sm:col-span-1"
                />
              )}

              {salesComparison && (
                <ComparisonCard
                  title="Sales"
                  windowLabel={windowLabels[windowRange]}
                  data={salesComparison}
                  icon={Tag}
                  color="bg-yellow-300/50"
                  unit="sales"
                  redirectTo="/sales"
                  className="col-span-2 sm:col-span-1"
                />
              )}

              {uniqueCustomer && (
                <ComparisonCard
                  title="Unique Customers"
                  windowLabel={windowLabels[windowRange]}
                  data={uniqueCustomer}
                  icon={TrendingUp}
                  color="bg-green-300/50"
                  unit="customers"
                  redirectTo="/customers"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
