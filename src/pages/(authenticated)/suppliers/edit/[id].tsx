import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import DOMPurify from "dompurify";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

export default function EditSupplierPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    useEffect(() => {
        const canEditSupplier =
            user?.role === "ADMIN" || user?.permissions?.suppliers?.includes("update");

        if (!canEditSupplier) {
            navigate("/404");
        }
    }, [user, navigate]);

    const sanitize = (val: string) => DOMPurify.sanitize(val.trim());


    const fetchSuppliers = async () => {
        const res = await api.get(`/suppliers/${id}`)
        console.log(res.data);
        return res.data.data
    }
    // Fetch existing supplier data
    const { data: supplier, isLoading, isError } = useQuery({
        queryKey: ["supplier", id],
        queryFn: fetchSuppliers,
        enabled: !!id,
    });

    // Form state (prefilled once supplier loads)
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [status, setStatus] = useState("");
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Prefill inputs when supplier data is available
    useEffect(() => {
        if (supplier) {
            setName(supplier.name || "");
            setAddress(supplier.address || "");
            setEmail(supplier.email || "");
            setPhoneNumber(supplier.phoneNumber || "");
            setStatus(supplier.status || "");
        }
    }, [supplier]);

    const handleSubmit = async () => {
        if (!name) {
            alert("Name is required");
            return;
        }

        const payload = {
            supplierName: sanitize(name),
            supplierAddress: sanitize(address) || undefined,
            supplierEmail: sanitize(email) || undefined,
            supplierPhoneNumber: sanitize(phoneNumber) || undefined,
            status: sanitize(status) || undefined,
        };

        try {
            await api.put(`/suppliers/${id}`, payload);
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            queryClient.invalidateQueries({ queryKey: ["supplier", id] });
            navigate("/suppliers");
        } catch (err: any) {
            console.error(err.response?.data || err);
            alert(
                "Error updating supplier: " +
                (err.response?.data?.message || err.message || "Unknown error")
            );
        }
    };

    if (isLoading) return <p>Loading supplier data...</p>;
    if (isError) return <p>Failed to load supplier data.</p>;
    if (!supplier) return <p>Supplier not found.</p>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Edit Supplier</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setShowSaveConfirm(true);
                }}
                className="space-y-4"
            >
                {/* Name */}
                <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>


                {/* Status */}
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={status}
                        onValueChange={(val) => setStatus(val as "ACTIVE" | "INACTIVE")}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Form Buttons */}
                <div className="flex gap-4 mt-4">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => navigate("/suppliers")}>
                        Cancel
                    </Button>
                </div>
            </form>

            {/* Save Confirmation */}
            <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Save</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure all details are correct? You can edit later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Yes, Save</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
