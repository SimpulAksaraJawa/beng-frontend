import { useState } from "react";
import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, Minus, Search, LoaderIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const PermissionPage = () => {
    const [email, setEmail] = useState("");

    const updateUserPermission = (e: React.FormEvent) => {
        e.preventDefault();
        // Add logic to update user permission
    }

    return (
        <div className="p-6 space-y-6">
            <SiteHeader />
            <h1 className="text-2xl font-bold">Update Permissions</h1>
            <form className="space-y-6">
                {/* User Email */}
                <div className="space-y-2">
                    <Label>User Email</Label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                    />
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4 cursor-pointer"
                    onClick={(e) => updateUserPermission(e)}
                >
                    Update User Permissions
                </Button>
            </form >
        </div>
    )
}

export default PermissionPage;