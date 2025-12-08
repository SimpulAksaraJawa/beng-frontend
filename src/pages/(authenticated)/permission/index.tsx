import { useState, useEffect } from "react";
import {
  Package,
  ReceiptText,
  Tag,
  Boxes,
  Factory,
  Users,
  Settings,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@/router";
import api from "@/api/axios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

const initialRows = [
  { id: 1, feature: "products", name: "Products", read: false },
  { id: 2, feature: "adjustments", name: "Adjustments", read: false },
  { id: 3, feature: "orders", name: "Orders", read: false },
  { id: 4, feature: "sales", name: "Sales", read: false },
  { id: 5, feature: "stocks", name: "Stock", read: false },
  { id: 6, feature: "suppliers", name: "Suppliers", read: false },
  { id: 7, feature: "customers", name: "Customers", read: false },
];

const featureIcons: Record<string, React.ReactNode> = {
  products: <Package size={20} />,
  orders: <ReceiptText size={20} />,
  sales: <Tag size={20} />,
  stocks: <Boxes size={20} />,
  adjustments: <Settings size={20} />,
  suppliers: <Factory size={20} />,
  customers: <Users size={20} />,
};

export default function PermissionPage() {
  const [email, setEmail] = useState("");
  const [noEmail, setNoEmail] = useState(false);
  const [wrongEmail, setWrongEmail] = useState(false);
  const [adminEmail, setAdminEmail] = useState(false);
  const [changedUser, setChangedUser] = useState("");
  const [rows, setRows] = useState(initialRows);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckBoxChange = (id: number, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, read: checked } : row))
    );
  };

  const updateUserPermission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setOpenConfirm(false);

    if (!email.trim()) {
      setNoEmail(true);
      setIsSubmitting(false);
      return;
    }

    setNoEmail(false);

    const permissions: Record<string, string[]> = {
      products: [],
      orders: [],
      sales: [],
      stocks: [],
      suppliers: [],
      customers: [],
      adjustments: [],
    };

    rows.forEach((row) => {
      if (row.read) permissions[row.feature].push("read");
    });

    // Always allow base read
    ["products", "suppliers", "customers"].forEach((feature) => {
      if (!permissions[feature].includes("read")) {
        permissions[feature].push("read");
      }
    });

    try {
      const res = await api.put(
        "/role",
        { email, permissions },
        { withCredentials: true }
      );

      setWrongEmail(false);
      setAdminEmail(false);
      setChangedUser(res.data.user.name);
    } catch (error: any) {
      if (error.response?.status === 401) setWrongEmail(true);
      else setWrongEmail(false);

      if (error.response?.status === 402) setAdminEmail(true);
      else setAdminEmail(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "ADMIN" && user?.permissions.permissions.includes("read")) {
      navigate("/product");
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <SiteHeader />
      <h1 className="text-2xl font-bold">Update Permissions</h1>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setOpenConfirm(true);
        }}
      >
        {/* User Email */}
        <div className="space-y-2">
          <Label>User Email</Label>
          <Input
            className={`${noEmail || wrongEmail || adminEmail ? "border-red-500" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
          {noEmail && <span className="text-red-500">Email is required</span>}
          {wrongEmail && <span className="text-red-500">Email does not exist</span>}
          {adminEmail && <span className="text-red-500">Email is an admin</span>}
        </div>

        {/* Permissions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Feature Name</TableHead>
              <TableHead className="text-center">Read</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {featureIcons[row.feature]}
                    <span>{row.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={row.read}
                    onCheckedChange={(checked) =>
                      handleCheckBoxChange(row.id, Boolean(checked))
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Update Button with Confirmation */}
        <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
          <AlertDialogTrigger asChild>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Updating...
                </>
              ) : (
                "Update Permissions"
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Permission Update</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to update this user’s permissions?
                <br />This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                className="cursor-pointer flex items-center gap-2"
                disabled={isSubmitting}
                onClick={updateUserPermission}
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? "Updating..." : "Yes, Update"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </form>

      {changedUser && (
        <div className="mt-4">
          <h2 className="text-lg font-bold text-green-500">
            Successfully updated {changedUser}'s permissions
          </h2>
        </div>
      )}
    </div>
  );
}
