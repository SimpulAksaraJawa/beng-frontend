import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import { Eye, LoaderIcon } from "lucide-react";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";

interface Customer {
    id: number;
    name: string;
}

interface SaleDetail {
    id: number;
    productId: number;
    productName: string;
    qty: number;
    price: number;
}

interface Sale {
    id: number;
    invoice: string;
    customerName: string;
    saleDate: Date;
    totalAmount: number;
    saledetail: SaleDetail[];
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

export default function SalesPage() {
    const navigate = useNavigate();

    const fetchSales = async (): Promise<Sale[]> => {
        // Fetch suppliers
        const customerRes = await api.get("/customers");
        const customerData: Customer[] = Array.isArray(customerRes.data?.data)
            ? customerRes.data.data
            : [];
        console.log(customerRes)

        // Fetch orders
        const saleRes = await api.get("/sales");
        const salesData = Array.isArray(saleRes.data?.data) ? saleRes.data.data : [];
        console.log(saleRes)

        // Map orders
        const mappedSales: Sale[] = salesData.map((o: any) => ({
            id: o.id,
            invoice: o.invoice ?? "N/A",
            customerName: customerData.find((s) => s.id === o.customerId)?.name ?? "Unknown",
            saleDate: o.date ?? null,
            totalAmount: o.totalAmount ?? 0,
            saledetail: o.saledetail ?? [],
        }));
        console.log(mappedSales)

        return mappedSales;
    };

    const { data: sales = [], isLoading, error } = useQuery({
        queryKey: ["sales"],
        queryFn: fetchSales, // <-- pass the function reference, not call it
        staleTime: 1000 * 60 * 15,
    });

    const handleView = (id: number) => navigate(`/orders/${id}`);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
                <LoaderIcon className="animate-spin size-10" />
                <p>Loading sales...</p>
            </div>
        )
    }
    if (error) return <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-red-500">Failed to load sales.</div>;

    const columns: GridColDef<Sale>[] = [
        { field: "invoice", headerName: "Invoice No.", flex: 1, minWidth: 120 },
        { field: "customerName", headerName: "Customer Name", flex: 1, minWidth: 180 },
        {
            field: "saleDate",
            headerName: "Sale Date",
            flex: 1,
            minWidth: 100,
            valueGetter: (params: GridRowParams<Sale> | null, row: Sale) => {
                console.log(row.saleDate);
                console.log(params?.row?.saleDate);
                return formatDate(row?.saleDate);
            },
        },
        {
            field: "totalAmount",
            headerName: "Total Amount",
            flex: 1,
            minWidth: 100,
            valueGetter: (params: GridRowParams<Sale> | null, row: Sale) => { return formatRupiah(row?.totalAmount) }
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            flex: 1,
            minWidth: 100,
            renderCell: (params: GridRenderCellParams<Sale>) => (
                <Box sx={{ display: "flex", gap: 0.2 }}>
                    <Button
                        variant="text"
                        size="small"
                        color="secondary"
                        startIcon={<Eye />}
                        onClick={() => handleView(params.row.id)}
                    >
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <div className="p-6 w-[100%] mx-auto">
            <div>
                <SiteHeader />
                <div className="flex items-center justify-between mt-4 mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">Sales</h1>
                    </div>
                    <ButtonShad onClick={() => { navigate('/sales/new') }}>+ Add new sale</ButtonShad>
                </div>
                <Box sx={{ height: 600, width: "100%" }}>
                    <DataGrid
                        rows={sales}
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
                    />
                </Box>
            </div>
        </div>
    );
}
