import api from "@/api/axios";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Pencil, LoaderIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"
import {useEffect} from "react";

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
    user?.role === "ADMIN" || user?.permissions?.scanEditSuppliers?.includes("update");

      useEffect(()=>{
        const read =
          user?.role === "ADMIN" || user?.permissions?.suppliers?.includes("read");
    if (!read) {
      navigate("/product");
    }
  },[user])

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

  if (!user?.permissions.suppliers?.includes("read")) {
    navigate("/product")
  }

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
    { field: "status", headerName: "Status", flex: 1, minWidth: 100 },
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
    useEffect(()=>{
        const read =
          user?.role === "ADMIN" || user?.permissions?.customers?.includes("read");
    if (!read) {
      navigate("/product");
    }
  },[user])

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
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb",
              fontWeight: "bold",
            },
          }}
          showToolbar
        />
      </Box>
    </div>
  );
}
