import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";

interface Supplier {
  id: number;
  name: string;
}

interface OrderDetail {
  id: number;
  productId: number;
  productName: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  invoice: string;
  supplierName: string;
  orderDate: Date;
  totalPrice: number;
  orderDetail: OrderDetail[];
}

// Helper functions
function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatRupiah(amount: number | null) {
  if (amount == null) return "N/A";
  return (
    "Rp " +
    amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") // add dots as thousands separator
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();

  const fetchOrders = async (): Promise<Order[]> => {
    // Fetch suppliers
    const supplierRes = await api.get("/suppliers");
    const suppliersData: Supplier[] = Array.isArray(supplierRes.data?.data)
      ? supplierRes.data.data
      : [];

    // Fetch orders
    const orderRes = await api.get("/orders");
    const ordersData = Array.isArray(orderRes.data?.data) ? orderRes.data.data : [];

    // Map orders
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
    queryFn: fetchOrders, // <-- pass the function reference, not call it
    staleTime: 1000 * 60 * 15,
  });

  const handleEdit = (id: number) => navigate(`/orders/edit/${id}`);
  const handleView = (id: number) => navigate(`/orders/${id}`);

  if (isLoading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load orders.</div>;

  const columns: GridColDef<Order>[] = [
    { field: "invoice", headerName: "Invoice No.", flex: 1, minWidth: 120 },
    { field: "supplierName", headerName: "Supplier Name", flex: 1, minWidth: 180 },
    {
      field: "orderDate",
      headerName: "Order Date",
      flex: 1,
      minWidth: 100,
      valueGetter: (params: GridRowParams<Order> | null, row: Order) => {
        console.log(row.orderDate);
        console.log(params?.row?.orderDate);
        return formatDate(row?.orderDate);
      },
    },
    {
      field: "totalPrice",
      headerName: "Total Price",
      flex: 1,
      minWidth: 100,
      valueGetter: (params: GridRowParams<Order> | null, row: Order) => { return formatRupiah(row?.totalPrice) }
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<Order>) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<Edit />}
            onClick={() => handleEdit(params.row.id)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<Eye />}
            onClick={() => handleView(params.row.id)}
          >
            View
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div className="p-6 w-[100%] mx-auto">
      <div>
        <SiteHeader/>
        <div className="flex items-center justify-between mt-4 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>
          <ButtonShad onClick={() => {navigate('/orders/new')}}>+ Add new order</ButtonShad>
        </div>
        <Box sx={{ height: 600, width: "100%" }}>
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
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f9fafb",
                fontWeight: "bold",
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
}
