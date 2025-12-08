import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button as ButtonShad } from "@/components/ui/button";
import { Eye, Plus, LoaderIcon, Minus } from "lucide-react";
import api from "@/api/axios";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdjustmentProduct {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  price?: number;
  role: "SOURCE" | "RESULT";
}

interface Adjustment {
  id: number;
  date: string;
  action: "SPLIT" | "COMBINE";
  products: AdjustmentProduct[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID");
}

function formatRupiah(amount?: number) {
  if (amount == null) return "-";
  return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function AdjustmentsPage() {
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<Adjustment | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreateAdjustment =
    user?.role === "ADMIN" ||
    user?.permissions?.adjustments?.includes("create");

  // Fetch main list
  const fetchAdjustments = async (): Promise<Adjustment[]> => {
    const res = await api.get("/adjustments");
    const data = res.data.data || [];
    return data.map((a: any) => ({
      id: a.id,
      date: a.date,
      action: a.action,
      products: a.products.map((p: any) => ({
        id: p.id,
        productId: p.productId,
        productName: p.productName ?? `Product #${p.productId}`,
        quantity: p.quantity,
        price: p.price,
        role: p.role,
      })),
    }));
  };

  const {
    data: adjustments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adjustments"],
    queryFn: fetchAdjustments,
  });

  // Fetch detail
  const handleView = async (id: number) => {
    const res = await api.get(`/adjustments/${id}`);
    const adj = res.data.data;
    const mapped: Adjustment = {
      id: adj.id,
      date: adj.date,
      action: adj.action,
      products: adj.products.map((p: any) => ({
        id: p.id,
        productId: p.productId,
        productName: p.productName ?? `Product #${p.productId}`,
        quantity: p.quantity,
        price: p.price,
        role: p.role,
      })),
    };
    setSelectedAdjustment(mapped);
  };

  const columns: GridColDef<Adjustment>[] = [
    { field: "id", headerName: "Adj ID", flex: 0.5, minWidth: 150 },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => formatDate(params.row.date),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Badge
          variant={params.row.action === "SPLIT" ? "destructive" : "default"}
          className={
            params.row.action === "SPLIT"
              ? "bg-yellow-500/20 text-yellow-700 border border-yellow-300"
              : "bg-green-500/20 text-green-700 border border-green-300"
          }
        >
          {params.row.action}
        </Badge>
      ),
    },
    {
      field: "view",
      headerName: "View",
      flex: 0.5,
      sortable: false,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<Adjustment>) => (
        <Button
          variant="text"
          size="small"
          color="warning"
          onClick={() => handleView(params.row.id)}
          startIcon={<Eye />}
        />
      ),
    },
  ];

  // Columns for detail DataGrid
  const detailColumns: GridColDef<AdjustmentProduct>[] = [
    { field: "role", headerName: "Role", flex: 1 },
    { field: "productName", headerName: "Product", flex: 2 },
    { field: "quantity", headerName: "Qty", flex: 1 },
    {
      field: "price",
      headerName: "Price",
      flex: 1.5,
      renderCell: (params) => formatRupiah(params.row.price),
    },
  ];

  useEffect(() => {
    const read =
      user?.role === "ADMIN" ||
      user?.permissions?.adjustments?.includes("read");
    if (!read) {
      navigate("/product");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <LoaderIcon className="animate-spin size-10" />
        <p>Loading adjustment...</p>
      </div>
    );
  }
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-red-500">
        Failed to load adjustment.
      </div>
    );

  return (
    <div className="p-6 w-full flex flex-col gap-2">
      {/* LEFT TABLE */}
      <SiteHeader />
      <div className="flex-0.75 w-[100%]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Adjustments</h1>
          {canCreateAdjustment && (
            <>
              <ButtonShad
                variant="default"
                className="cursor-pointer hidden md:flex"
                onClick={() => navigate("/adjustment/new")}
              >
                <Plus /> Add New Adjustment
              </ButtonShad>
              <ButtonShad
                variant="default"
                className="cursor-pointer md:hidden"
                onClick={() => navigate("/adjustment/new")}
              >
                <Plus />
              </ButtonShad>
            </>
          )}
        </div>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={adjustments}
            columns={columns}
            getRowId={(row) => row.id}
            loading={isLoading}
            pageSizeOptions={[5, 10]}
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
      </div>

      {/* RIGHT DETAIL CARD */}
      <div className="w-[100%] mt-14">
        {selectedAdjustment ? (
          <Card className="p-4 mr-10">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Adjustment #{selectedAdjustment.id}</CardTitle>
              <ButtonShad
                variant="destructive"
                size="icon"
                onClick={() => setSelectedAdjustment(null)}
              >
                <Minus className="h-4 w-4" />
              </ButtonShad>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Date:</strong> {formatDate(selectedAdjustment.date)}
              </p>
              <p className="mb-4">
                <strong>Action:</strong> {selectedAdjustment.action}
              </p>

              {/* i want to change this part into shadcn's style */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {selectedAdjustment.products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.role}</TableCell>
                      <TableCell>{p.productName}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{formatRupiah(p.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 text-gray-500">
            <p>Select an adjustment to view details</p>
          </Card>
        )}
      </div>
    </div>
  );
}
