import { useState } from "react";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import {
    Package,
    ReceiptText,
    Tag,
    Boxes,
    Factory,
    Users
} from "lucide-react";
import { Checkbox } from "@mui/material";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import api from "@/api/axios";

const initialRows = [
    { id: 1, feature: "products", name: `Products`, create: false, read: false, update: false, delete: false },
    { id: 2, feature: "orders", name: `Orders`, create: false, read: false, update: false, delete: false },
    { id: 3, feature: "sales", name: `Sales`, create: false, read: false, update: false, delete: false },
    { id: 4, feature: "stock", name: `Stock`, create: false, read: false, update: false, delete: false },
    { id: 5, feature: "suppliers", name: `Suppliers`, create: false, read: false, update: false, delete: false },
    { id: 6, feature: "customers", name: `Customers`, create: false, read: false, update: false, delete: false },
];

const featureIcons: Record<string, React.ReactNode> = {
    products: <Package size={20} />,
    orders: <ReceiptText size={20} />,
    sales: <Tag size={20} />,
    stock: <Boxes size={20} />,
    suppliers: <Factory size={20} />,
    customers: <Users size={20} />,
};

const PermissionPage = () => {
    const [email, setEmail] = useState("");
    const [noEmail, setNoEmail] = useState(false);
    const [wrongEmail, setWrongEmail] = useState(false);
    const [adminEmail, setAdminEmail] = useState(false);
    const [changedUser, setChangedUser] = useState("");
    const [rows, setRows] = useState(initialRows);

    const handleCheckBoxChange = (id: number, field: string, checked: boolean) => {
        setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: checked } : row));
    }

    const updateUserPermission = async (e: React.FormEvent) => {
        console.log("Updating user permission");
        e.preventDefault();
        // Add logic to update user permission

        if (!email.trim()) {
            setNoEmail(true);
            return;
        } else {
            setNoEmail(false);
        }

        console.log("Pass emails");
        const permissions: Record<string, string[]> = {
            products: [],
            orders: [],
            sales: [],
            stock: [],
            suppliers: [],
            customers: []
        };

        rows.forEach(row => {
            if (row.create) {
                permissions[row.feature].push("create");
            }
            if (row.read) {
                permissions[row.feature].push("read");
            }
            if (row.update) {
                permissions[row.feature].push("update");
            }
            if (row.delete) {
                permissions[row.feature].push("delete");
            }
        });

        try {
            const res = await api.put("/role", { email, permissions }, { withCredentials: true });
            setChangedUser(res.data.user.name);
            setNoEmail(false);
            setWrongEmail(false);
            setAdminEmail(false);
        } catch (error: any) {
            if (error.response.status === 401) {
                setWrongEmail(true);
            } else {
                setWrongEmail(false);
            }

            if (error.response.status === 402) {
                setAdminEmail(true);
            } else {
                setAdminEmail(false);
            }
        }
    }

    const columns = [
        {
            field: "name",
            headerName: "Feature Name",
            flex: 5,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2">
                    {featureIcons[params.row.feature]}
                    <span>{params.row.name}</span>
                </div>
            )
        },
        {
            field: "create",
            headerName: "Create",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params: GridRenderCellParams) => (
                <Checkbox
                    checked={params.row.create}
                    onChange={(e) =>
                        handleCheckBoxChange(params.row.id, "create", e.target.checked)
                    }
                />
            ),
        },
        {
            field: "read",
            headerName: "Read",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params: GridRenderCellParams) => (
                <Checkbox
                    checked={params.row.read}
                    onChange={(e) =>
                        handleCheckBoxChange(params.row.id, "read", e.target.checked)
                    }
                />
            ),
        },
        {
            field: "update",
            headerName: "Update",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params: GridRenderCellParams) => (
                <Checkbox
                    checked={params.row.update}
                    onChange={(e) =>
                        handleCheckBoxChange(params.row.id, "update", e.target.checked)
                    }
                />
            ),
        },
        {
            field: "delete",
            headerName: "Delete",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params: GridRenderCellParams) => (
                <Checkbox
                    checked={params.row.delete}
                    onChange={(e) =>
                        handleCheckBoxChange(params.row.id, "delete", e.target.checked)
                    }
                />
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <SiteHeader />
            <h1 className="text-2xl font-bold">Update Permissions</h1>
            <form className="space-y-6">
                {/* User Email */}
                <div className="space-y-2">
                    <Label>User Email</Label>
                    <Input
                        style={{ border: `${noEmail || wrongEmail || adminEmail ? "1px solid red" : ""}` }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                    />
                    {noEmail && <span className="text-red-500">Email is required</span>}
                    {wrongEmail && <span className="text-red-500">Email does not exist</span>}
                    {adminEmail && <span className="text-red-500">Email is an admin</span>}
                </div>

                <div style={{ width: "100%" }}>
                    <DataGrid rows={rows} columns={columns} hideFooterPagination disableRowSelectionOnClick />
                </div>

                <Button
                    type="submit"
                    className="mt-4 cursor-pointer"
                    onClick={(e) => updateUserPermission(e)}
                >
                    Update User Permissions
                </Button>
            </form >

            {changedUser && (
                <div className="mt-4">
                    <h2 className="text-lg font-bold text-green-500">Succesfully Updated {changedUser} Permissions</h2>
                </div>
            )}
        </div>
    )
}

export default PermissionPage;