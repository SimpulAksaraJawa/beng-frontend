import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

interface OrderDetailRow {
  id: number;
  invoice: string;
  supplierName: string;
  productName: string;
  qty: number;
  price: number;
}

function formatRupiah(amount: number | null) {
  if (amount == null) return "N/A";
  return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function OrderDetailsPage() {
  const {
    data: rows = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order-details"],
    queryFn: async (): Promise<OrderDetailRow[]> => {
      const res = await api.get("/order-details");
      console.log(res.data?.data);
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 15,
  });

  const columns: GridColDef<OrderDetailRow>[] = [
    { field: "invoice", headerName: "Invoice No.", flex: 1, minWidth: 200 },
    {
      field: "supplierName",
      headerName: "Supplier Name",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 1.5,
      minWidth: 200,
    },
    { field: "qty", headerName: "Product Quantity", flex: 1, minWidth: 200 },
    {
      field: "price",
      headerName: "Product Price",
      flex: 1,
      minWidth: 200,
      valueGetter: (
        params: GridRowParams<OrderDetailRow> | null,
        row: OrderDetailRow
      ) => {
        return formatRupiah(row?.price);
      },
    },
  ];

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error)
    return (
      <div className="p-6 text-red-500">Failed to load order details.</div>
    );

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <SiteHeader />
      <h1 className="text-2xl font-bold my-4">Order Details</h1>
      <div className="overflow-x-auto">
        <Box sx={{ height: 800, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
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
      </div>
    </div>
  );
}
