import api from "@/api/axios";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Pencil, LoaderIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreateSupplier =
    user?.role === "ADMIN" || user?.permissions?.suppliers?.includes("create");
  const canEditSupplier =
    user?.role === "ADMIN" || user?.permissions?.canEditSuppliers?.includes("update");


  const fetchSuppliers = async (): Promise<Supplier[]> => {
    const supplierRes = await api.get("/suppliers");
    const suppliersData: Supplier[] = Array.isArray(supplierRes.data?.data)
      ? supplierRes.data.data
      : [];
    console.log("Fetched suppliers:", suppliersData);
    return suppliersData;
  };

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <LoaderIcon className="animate-spin size-10" />
        <p>Loading suppliers...</p>
      </div>
    )
  }
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-red-500">Failed to load suppliers.</div>;

  const columns: GridColDef<Supplier>[] = [
    { field: "name", headerName: "Supplier Name", flex: 1, minWidth: 150 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Supplier>) => {
        const isActive = params.row.status === "ACTIVE";

        return (
          <Badge variant={isActive ? "default" : "destructive"}
            className={
              isActive
                ? "bg-green-500/20 text-green-700 border border-green-300 rounded-full"
                : "bg-red-500/20 text-red-700 border border-red-300 rounded-full"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1,
      minWidth: 50,
      renderCell: (params: GridRenderCellParams<Supplier>) =>
        canEditSupplier ? (
          <ButtonShad
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate(`/suppliers/edit/${params.row.id}`)}
          >
            <Pencil className="text-orange-400" />
          </ButtonShad>
        ) : null,
    },
  ];

  return (
    <div className="p-6 w-full mx-auto">
      <SiteHeader />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-4">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        {
          canCreateSupplier && (
            <ButtonShad
              className="cursor-pointer"
              onClick={() => navigate("/suppliers/new")}
            >
              + Add new supplier
            </ButtonShad>
          )
        }

      </div>

      <Box sx={{ height: 800, width: "100%" }}>
        <DataGrid
          rows={suppliers}
          columns={columns}
          getRowId={(row) => row.id}
          loading={isLoading}
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
  );
}
