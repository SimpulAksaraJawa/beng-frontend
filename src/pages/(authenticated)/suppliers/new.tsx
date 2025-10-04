import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query"; // <-- import this
import api from "@/api/axios";
import DOMPurify from "dompurify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
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

export default function NewSupplierPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // <-- create queryClient instance

    const [supplierName, setSupplierName] = useState("");
    const [supplierEmail, setSupplierEmail] = useState("");
    const [supplierPhoneNumber, setSupplierPhoneNumber] = useState("");
    const [supplierAddress, setSupplierAddress] = useState("");
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const sanitize = (val: string) => DOMPurify.sanitize(val.trim());
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/suppliers/new", {
                supplierName: sanitize(supplierName),
                supplierEmail: supplierEmail ? sanitize(supplierEmail) : undefined,
                supplierPhoneNumber: supplierPhoneNumber ? sanitize(supplierPhoneNumber) : undefined,
                supplierAddress: supplierAddress ? sanitize(supplierAddress) : undefined,
                status: sanitize(status), // status is enum, still sanitize in case
            });

            if (res.data?.success) {
                queryClient.invalidateQueries({ queryKey: ["suppliers"] });
                alert("Supplier created successfully!");
                navigate("/suppliers");
            } else {
                alert("Failed to create supplier");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-6 space-y-6 max-w-xl">
            <h1 className="text-2xl font-bold">Add New Supplier</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setShowConfirm(true);
                }}
                className="space-y-4"
            >
                <div className="space-y-2">
                    <Label>Supplier Name</Label>
                    <Input
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="Supplier Name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={supplierEmail}
                        onChange={(e) => setSupplierEmail(e.target.value)}
                        placeholder="supplier@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                        value={supplierPhoneNumber}
                        onChange={(e) => setSupplierPhoneNumber(e.target.value)}
                        placeholder="08123456789"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                        value={supplierAddress}
                        onChange={(e) => setSupplierAddress(e.target.value)}
                        placeholder="123 Main St"
                    />
                </div>

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

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex gap-4 mt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Supplier"}
                    </Button>
                    <Button variant="outline" type="button" onClick={() => navigate("/suppliers")}>
                        Cancel
                    </Button>
                </div>
            </form>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Create</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to create this supplier? You can review the details before saving.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Yes, Create</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
