import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { Button as ButtonShad } from "@/components/ui/button";
import api from "@/api/axios";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";
import { Pencil, LoaderIcon } from "lucide-react";
import { useEffect } from "react";

interface Customer {
  id: number;
  name: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchCustomers = async (): Promise<Customer[]> => {
    const res = await api.get("/customers");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  };

  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    staleTime: 1000 * 60 * 15,
  });

  // ✅ Permissions must be defined BEFORE columns
  const canCreateCustomer =
    user?.role === "ADMIN" || user?.permissions?.customers?.includes("create");
  const canEditCustomer =
    user?.role === "ADMIN" || user?.permissions?.customers?.includes("update");

  const columns: GridColDef<Customer>[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "phoneNumber", headerName: "Phone", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) =>
        canEditCustomer ? (
          <ButtonShad
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate(`/customers/edit/${params.row.id}`)}
          >
            <Pencil className="text-orange-400" />
          </ButtonShad>
        ) : null,
    },
  ];


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <LoaderIcon className="animate-spin size-10" />
        <p>Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-red-500">
        Failed to load customers.
      </div>
    );
  }

  const rows = customers.map((c) => ({
    ...c,
    name: c.name ?? "Unknown",
    address: c.address ?? "N/A",
    email: c.email ?? "N/A",
    phoneNumber: c.phoneNumber ?? "N/A",
  }));

  return (
    <div className="p-6 w-[100%] mx-auto">
      <SiteHeader />
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        {canCreateCustomer && (
          <ButtonShad
            variant="secondary"
            className="cursor-pointer"
            onClick={() => navigate("/customers/new")}
          >
            Add Customer
          </ButtonShad>
        )}
      </div>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
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
        />
      </Box>
    </div>
  );
}
