import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import { Eye, Minus, LoaderIcon } from "lucide-react";
import api from "@/api/axios";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

// interface SaleDetail {
//   id: number;
//   productId: number;
//   productName: string;
//   qty: number;
//   price: number;
// }

// interface Sale {
//   id: number;
//   invoice: string;
//   customerName: number;
//   date: string | null;
//   totalAmount: number;
//   saleDetail: SaleDetail[];
// }

// helpers
function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID");
}

function formatRupiah(amount: number | null) {
  if (amount == null) return "N/A";
  return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
interface Customer {
  id: number;
  name: string;
}

interface SaleDetail {
  id: number;
  productId: number;
  productName: string;
  brandName: string;
  categoryName: string;
  qty: number;
  price: number;
}

interface Sale {
  id: number;
  invoice: string;
  customerId: number;
  customerName: string;
  date: string | null;
  totalAmount: number;
  saleDetail: SaleDetail[];
}

export default function SalesPage() {
  const [openReceipts, setOpenReceipts] = useState<Sale[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreateSales =
    user?.role === "ADMIN" || user?.permissions?.sales?.includes("create");

  // Fetch sales
  const fetchSales = async (): Promise<Sale[]> => {
    const res = await api.get("/sales");
    const raw = Array.isArray(res.data?.data) ? res.data.data : [];
    return raw.map((s: any) => ({
      id: s.id,
      invoice: s.invoice,
      date: s.date,
      totalAmount: s.totalAmount,
      customerId: s.customerId,
      customerName: s.customerName ?? "Unknown",
      saleDetail:
        s.saleDetail?.map((d: any) => ({
          id: d.id,
          productId: d.productId,
          productName: d.productName,
          brandName: d.brandName ?? "-",
          categoryName: d.categoryName ?? "-",
          qty: d.qty,
          price: d.price,
        })) ?? [],
    }));
  };

  // Fetch customers
  const fetchCustomers = async (): Promise<Customer[]> => {
    const res = await api.get("/customers");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  };

  const {
    data: sales = [],
    isLoading: isLoadingSales,
    error: salesError,
  } = useQuery({ queryKey: ["sales"], queryFn: fetchSales });

  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  // Map sales with customer names
  const mappedSales = sales.map((s) => {
    const customer = customers.find((c) => c.id === s.customerId);
    return {
      ...s,
      customerName: customer ? customer.name : `Customer #${s.customerId}`,
    };
  });

  const grandTotal = mappedSales.reduce(
    (sum, s) => sum + (s.totalAmount || 0),
    0
  );

  const handleView = async (id: number) => {
    if (openReceipts.find((s) => s.id === id)) return;
    const res = await api.get(`/sales/${id}`);
    const s: Sale = res.data.data;
    setOpenReceipts((prev) => [...prev, s]);
  };

  const handleClose = (id: number) => {
    setOpenReceipts((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    const read =
      user?.role === "ADMIN" || user?.permissions?.sales?.includes("read");
    if (!read) {
      navigate("/product");
    }
  }, [user]);

  if (isLoadingSales || isLoadingCustomers) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <LoaderIcon className="animate-spin size-10" />
        <p>Loading sales...</p>
      </div>
    );
  }

  if (salesError || customersError)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-red-5000">
        Failed to load sales.
      </div>
    );

  const columns: GridColDef<Sale>[] = [
    { field: "invoice", headerName: "Invoice No.", flex: 1, minWidth: 120 },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "date", // ✅ ganti ke "date"
      headerName: "Sale Date",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => formatDate(row.date),
    },
    {
      field: "totalAmount",
      headerName: "Total Price",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => formatRupiah(row.totalAmount),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 80,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "block" }}>
          <Button
            variant="text"
            size="small"
            color="warning"
            startIcon={<Eye />}
            onClick={() => handleView(params.row.id)}
          />
        </Box>
      ),
    },
  ];

  return (
    <div className="p-6 w-[100%] mx-auto">
      <SiteHeader />

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-4">
        <h1 className="text-2xl font-bold">Sales
          <div className="text-sm items-center flex gap-2">
          Total
          <Badge>
            <p className="font-semibold">{formatRupiah(grandTotal)}</p>
          </Badge>
        </div>
        </h1>
        

        {canCreateSales && (
          <ButtonShad onClick={() => navigate("/sales/new")}>
            + Add new sale
          </ButtonShad>
        )}
      </div>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={mappedSales}
          columns={columns}
          getRowId={(row) => row.id}
          loading={isLoadingSales}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          sx={{
            fontFamily: "Outfit, sans-serif",

            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "rgba(32, 158, 187, 0.8) !important",
              color: "#FFF !important",
            },
            // Alternating row colors
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "oklch(0.6478 0.1098 218.2180 /5%)",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#ffffff",
            },

            // Optional: keep hover highlight consistent
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "oklch(0.6478 0.1098 218.2180 /10%)",
            },
          }}
          showToolbar
        />
      </Box>

      {/* Receipt cards stay unchanged */}
      <div className="mt-6 space-y-4">
        {openReceipts.map((sale) => (
          <Card key={sale.id} className="p-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice: {sale.invoice}</CardTitle>
              <ButtonShad
                variant="ghost"
                size="icon"
                onClick={() => handleClose(sale.id)}
              >
                <Minus className="h-4 w-4" />
              </ButtonShad>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-row justify-between">
                <p>
                  <strong>Customer:</strong> {sale.customerName}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(sale.date)}
                </p>
                <p>
                  <strong>Total:</strong> {formatRupiah(sale.totalAmount)}
                </p>
              </div>

              <Table>
                <TableHeader className="bg-secondary/50">
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
                  {sale.saleDetail.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.productName}</TableCell>
                      <TableCell>{d.brandName}</TableCell>
                      <TableCell>{d.categoryName}</TableCell>
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
