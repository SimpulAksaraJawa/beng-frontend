import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

interface SaleDetailRow {
  id: number;
  invoice: string;
  customerName: string;
  productName: string;
  brand: string | null;
  category: string | null;
  qty: number;
  price: number;
  saleDate: string;
}

function formatRupiah(amount: number | null) {
  if (amount == null) return "-";
  return (
    "Rp " +
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );
}
function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID");
}
export default function SaleDetailsPage() {
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["sale-details"],
    queryFn: async (): Promise<SaleDetailRow[]> => {
      const res = await api.get("/sale-details");
      const raw = res.data?.data ?? [];
      return raw.map((item: any, idx: number) => ({
        id: idx, // required by DataGrid
        invoice: item.invoice,
        customerName: item.customerName,
        productName: item.productName,
        brand: item.brand === "N/A" ? "" : item.brand,
        category: item.category === "N/A" ? "" : item.category,
        qty: item.qty,
        price: item.price,
        saleDate: item.saleDate,
      }));
    },
    staleTime: 1000 * 60 * 15,
  });

const columns: GridColDef<SaleDetailRow>[] = [
  { field: "invoice", headerName: "Invoice No.", flex: 1, minWidth: 150 },
  { field: "customerName", headerName: "Customer", flex: 1.2, minWidth: 150 },
  { field: "productName", headerName: "Product", flex: 1.5, minWidth: 180 },
  { field: "qty", headerName: "Quantity", flex: 0.7, minWidth: 100 },
  {
    field: "price",
    headerName: "Price",
    flex: 1,
    minWidth: 120,
    valueGetter: (params: GridRowParams<SaleDetailRow> | null, row: SaleDetailRow) => { return formatRupiah(row?.price) },
  },
  {
    field: "saleDate",
    headerName: "Sale Date",
    flex: 1.2,
    minWidth: 180,
    valueGetter: (params: GridRowParams<SaleDetailRow> | null, row: SaleDetailRow) => { return formatDate(row?.saleDate) }
  },
];


  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load sale details.</div>;

  return (
    <div className="p-6 w-[100%] mx-auto">
      <SiteHeader />
      <h1 className="text-2xl font-bold my-4">Sale Details</h1>
      <Box sx={{ height: 600, width: "100%" }}>
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
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb",
              fontWeight: "bold",
              fontFamily: "Outfit, sans-serif",
            },
          }}
          showToolbar
        />
      </Box>
    </div>
  );
}
