import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const canEditCustomer =
      user?.role === "ADMIN" || user?.permissions?.customers?.includes("update");
  
    if (!canEditCustomer) {
      navigate("/404");
    }
  }, [user, navigate]);

  const sanitize = (val: string) => DOMPurify.sanitize(val.trim());


  const fetchCustomers = async () => {
    const res = await api.get(`/customers/${id}`)
    console.log(res.data);
    return res.data.data
  }
  // Fetch existing customer data
  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: fetchCustomers,
    enabled: !!id,
  });

  // Form state (prefilled once customer loads)
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Prefill inputs when customer data is available
  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setAddress(customer.address || "");
      setEmail(customer.email || "");
      setPhoneNumber(customer.phoneNumber || "");
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!name) {
      alert("Name is required");
      return;
    }

    const payload = {
      customerName: sanitize(name),
      customerAddress: sanitize(address) || undefined,
      customerEmail: sanitize(email) || undefined,
      customerPhoneNumber: sanitize(phoneNumber) || undefined,
    };

    try {
      await api.put(`/customers/${id}`, payload);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      navigate("/customers");
    } catch (err: any) {
      console.error(err.response?.data || err);
      alert(
        "Error updating customer: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
    }
  };

  if (isLoading) return <p>Loading customer data...</p>;
  if (isError) return <p>Failed to load customer data.</p>;
  if (!customer) return <p>Customer not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Customer</h1>

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

        {/* Form Buttons */}
        <div className="flex gap-4 mt-4">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/customers")}>
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
