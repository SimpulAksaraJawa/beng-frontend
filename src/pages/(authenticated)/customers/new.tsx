import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
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
import { toast } from "sonner";

export default function NewCustomerPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        const canCreateCustomer =
          user?.role === "ADMIN" || user?.permissions?.customers?.includes("create");
      
        if (!canCreateCustomer) {
          navigate("/404");
        }
      }, [user, navigate]);

    const sanitize = (val: string) => DOMPurify.sanitize(val.trim());

    const handleSubmit = async () => {
        if (!name) {
            toast.warning("Name is required");
            return;
        }

        const payload = {
            customerName: sanitize(name),
            customerAddress: sanitize(address) || undefined,
            customerEmail: sanitize(email) || undefined,
            customerPhoneNumber: sanitize(phoneNumber) || undefined,
        };

        try {
            await api.post("/customers", payload);
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success("Customer " + payload.customerName + " successfully added")
            navigate("/customers");
        } catch (err: any) {
            console.error(err.response?.data || err);
            toast.error(
                "Error creating customer: " +
                (err.response?.data?.message || err.message || "Unknown error")
            );
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Add New Customer</h1>

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
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Customer Name"
                        required
                    />
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Customer Address"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                    />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+62 812 3456 7890"
                    />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-4 mt-4">
                    <Button type="submit" className="cursor-pointer">
                        Save Customer
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => navigate("/customers")}
                    >
                        Cancel
                    </Button>
                </div>
            </form>

            {/* === SAVE CONFIRM DIALOG === */}
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
                        <AlertDialogAction onClick={handleSubmit}>
                            Yes, Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
