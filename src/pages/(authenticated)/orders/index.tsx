import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import { Eye, Minus, Search, LoaderIcon } from "lucide-react";
import api from "@/api/axios";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Supplier {
  id: number;
  name: string;
}

interface OrderDetail {
  id: number;
  productId: number;
  productName: string;
  brandName?: string;
  categoryName?: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  invoice: string;
  supplierName: string;
  orderDate: string | null; // backend ISO string
  totalPrice: number;
  orderDetail: OrderDetail[];
}

// format helpers
function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID");
}

function formatRupiah(amount: number | null) {
  if (amount == null) return "N/A";
  return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function OrdersPage() {
  const [openReceipts, setOpenReceipts] = useState<Order[]>([]);
  const navigate = useNavigate();

  // const [searchTerm, setSearchTerm] = useState("");
  // const [selectedSupplier, setSelectedSupplier] = useState("all");
  // const [dateTerm, setDateTerm] = useState(""); // 👈 new date filter

  const fetchOrders = async (): Promise<Order[]> => {
    const supplierRes = await api.get("/suppliers");
    const suppliersData: Supplier[] = Array.isArray(supplierRes.data?.data)
      ? supplierRes.data.data
      : [];

    const orderRes = await api.get("/orders");
    const ordersData = Array.isArray(orderRes.data?.data) ? orderRes.data.data : [];

    const mappedOrders: Order[] = ordersData.map((o: any) => ({
      id: o.id,
      invoice: o.invoice ?? "N/A",
      supplierName: suppliersData.find((s) => s.id === o.supplierId)?.name ?? "Unknown",
      orderDate: o.date ?? null,
      totalPrice: o.totalPrice ?? 0,
      orderDetail: o.orderDetail ?? [],
    }));

    return mappedOrders;
  };

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 15,
  });

  const handleView = async (id: number) => {
    if (openReceipts.find((o) => o.id === id)) return;

    const res = await api.get(`/orders/${id}`);
    const o = res.data.data;

    const mappedOrder: Order = {
      id: o.id,
      invoice: o.invoice ?? "N/A",
      supplierName: o.supplierName ?? "Unknown",
      orderDate: o.date ?? null,
      totalPrice: o.totalPrice ?? 0,
      orderDetail: o.orderDetail ?? [],
    };

    setOpenReceipts((prev) => [...prev, mappedOrder]);
  };

  const handleClose = (id: number) => {
    setOpenReceipts((prev) => prev.filter((o) => o.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <LoaderIcon className="animate-spin size-10" />
        <p>Loading orders...</p>
      </div>
    )
  }
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-red-500">Failed to load orders.</div>;

  const columns: GridColDef<Order>[] = [
    { field: "invoice", headerName: "Invoice No.", flex: 1, maxWidth: 200 },
    { field: "supplierName", headerName: "Supplier Name", flex: 1, minWidth: 180, maxWidth: 200 },
    {
      field: "orderDate",
      headerName: "Order Date",
      flex: 1,
      minWidth: 100,
      maxWidth: 150,
      valueGetter: (params: GridRowParams<Order> | null, row: Order) =>
        formatDate(row?.orderDate),
    },
    {
      field: "totalPrice",
      headerName: "Total Price",
      flex: 1,
      minWidth: 100,
      maxWidth: 150,
      valueGetter: (params: GridRowParams<Order> | null, row: Order) =>
        formatRupiah(row?.totalPrice),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1,
      minWidth: 50,
      maxWidth: 80,
      renderCell: (params: GridRenderCellParams<Order>) => (
        <Box sx={{ display: "block" }}>
          <Button
            variant="text"
            size="small"
            color="secondary"
            startIcon={<Eye />}
            onClick={() => handleView(params.row.id)}
          />
        </Box>
      ),
    },
  ];

  // Apply filters
  // const filteredOrders = orders.filter((o) => {
  //   const matchesSearch =
  //     o.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     o.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesSupplier =
  //     selectedSupplier === "all" || o.supplierName === selectedSupplier;

  //   const productDate = o.orderDate ? o.orderDate.slice(0, 10) : "";
  //   const matchesDate = dateTerm === "" || productDate === dateTerm;

  //   return matchesSearch && matchesSupplier && matchesDate;
  // });

  // const suppliers = Array.from(new Set(orders.map((o) => o.supplierName)));

  return (
    <div className="p-6 w-[100%] mx-auto">
      <SiteHeader />

      {/* Header bar with search + filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-4 w-[60%]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>

        {/* Search */}
        {/* <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search invoice or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#209ebb]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
        </div> */}

        {/* Date filter */}
        {/* <div className="relative">
          <Input
            type="date"
            value={dateTerm}
            onChange={(e) => setDateTerm(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#209ebb]"
          />
        </div> */}

        <div className="flex items-center gap-2">
          {/* <Select
            value={selectedSupplier}
            onValueChange={(value) => setSelectedSupplier(value)}
          >
            <SelectTrigger className="w-48 cursor-pointer">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <ButtonShad
            className="cursor-pointer"
            onClick={() => {
              navigate("/orders/new");
            }}
          >
            + Add new order
          </ButtonShad>
        </div>
      </div>

      {/* DataGrid */}
      <Box sx={{ height: 800, width: "60%" }}>
        <DataGrid
          rows={orders}
          columns={columns}
          getRowId={(row) => row.id}
          loading={isLoading}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          sx={{
            fontFamily: "Outfit, sans-serif",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb",
              fontWeight: "bold",
              fontFamily: "Outfit, sans-serif",
            },
          }}
          showToolbar
        />
      </Box>

      {/* Receipts */}
      <div className="mt-6 space-y-4">
        {openReceipts.map((order) => (
          <Card key={order.id} className="p-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice: {order.invoice}</CardTitle>
              <ButtonShad
                variant="ghost"
                size="icon"
                onClick={() => handleClose(order.id)}
              >
                <Minus className="h-4 w-4" />
              </ButtonShad>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-row justify-between">
                <p>
                  <strong>Supplier:</strong> {order.supplierName}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(order.orderDate)}
                </p>
                <p>
                  <strong>Total:</strong> {formatRupiah(order.totalPrice)}
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderDetail.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.productName}</TableCell>
                      <TableCell>{d.brandName ?? "N/A"}</TableCell>
                      <TableCell>{d.categoryName ?? "N/A"}</TableCell>
                      <TableCell>{d.qty}</TableCell>
                      <TableCell>{formatRupiah(d.price)}</TableCell>
                      <TableCell>{formatRupiah(d.qty * d.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
