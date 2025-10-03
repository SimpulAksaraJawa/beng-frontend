import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button as ButtonShad } from "@/components/ui/button";
import { Eye, X, Plus } from "lucide-react";
import api from "@/api/axios";
import { useNavigate } from "react-router";

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
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);
  const navigate = useNavigate();

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

  const { data: adjustments = [], isLoading, error } = useQuery({
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
    { field: "id", headerName: "Adj ID", flex: 0.5, maxWidth: 150 },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      maxWidth: 200,
      renderCell: (params) => formatDate(params.row.date),
    },
    { field: "action", headerName: "Action", flex: 1, maxWidth: 200 },
    {
      field: "view",
      headerName: "View",
      flex: 0.5,
      sortable: false,
      maxWidth: 150,
      renderCell: (params: GridRenderCellParams<Adjustment>) => (
        <Button
          variant="text"
          size="small"
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

  if (isLoading) return <div className="p-6">Loading adjustments...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load adjustments.</div>;

  return (
    <div className="p-6 w-full flex flex-row gap-2">
      {/* LEFT TABLE */}
      <div className="flex-0.75 w-[50%]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Adjustments</h1>
          <ButtonShad variant="default" className="cursor-pointer" onClick={() => navigate('/adjustment/new')}>
            <Plus /> Add New Adjustment
          </ButtonShad>
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
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f9fafb",
                fontWeight: "bold",
              },
            }}
            showToolbar
          />
        </Box>
      </div>

      {/* RIGHT DETAIL CARD */}
      <div className="w-[50%] mt-14">
        {selectedAdjustment ? (
          <Card className="p-4 mr-10">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Adjustment #{selectedAdjustment.id}</CardTitle>
              <ButtonShad variant="ghost" size="icon" onClick={() => setSelectedAdjustment(null)}>
                <X className="h-4 w-4" />
              </ButtonShad>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Date:</strong> {formatDate(selectedAdjustment.date)}
              </p>
              <p className="mb-4">
                <strong>Action:</strong> {selectedAdjustment.action}
              </p>

              <Box sx={{ height: 300 }}>
                <DataGrid
                  rows={selectedAdjustment.products}
                  columns={detailColumns}
                  getRowId={(row) => row.id}
                  hideFooter
                  sx={{
                    fontFamily: "Outfit, sans-serif",
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f9fafb",
                      fontWeight: "bold",
                    },
                  }}
                  showToolbar
                />
              </Box>
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
