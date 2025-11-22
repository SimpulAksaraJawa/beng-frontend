import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/searchable-select";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductOption {
  id?: number;
  name: string;
  brand?: string;
  category?: string;
  brandId?: number;
  categoryId?: number;
}

interface OrderProduct {
  productName: string;
  brandName: string;
  categoryName: string;
  orderQty: number | "";
  orderPrice: number | "";
}

const AddOrderPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [noInvoice, setNoInvoice] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsOptions, setProductsOptions] = useState<ProductOption[]>([]);
  const [products, setProducts] = useState<OrderProduct[]>([
    {
      productName: "",
      brandName: "",
      categoryName: "",
      orderQty: "",
      orderPrice: "",
    },
  ]);

  const [showEditWarning, setShowEditWarning] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
      const canCreateOrder =
        user?.role === "ADMIN" || user?.permissions?.orders?.includes("create");
    
      if (!canCreateOrder) {
        navigate("/404");
      }
    }, [user, navigate]);

  const sanitize = (val: string) => DOMPurify.sanitize(val.trim());

  // --- Fetch master data ---
  useEffect(() => {
    api
      .get("/suppliers")
      .then((res) =>
        setSuppliers((res.data.data || []).map((s: any) => s.name))
      )
      .catch((err) => console.error("Error fetching suppliers", err));

    api.get("/brands").then((res) => {
      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.brands)
        ? res.data.brands
        : [];
      setBrands(arr.map((b: any) => ({ id: b.id, name: b.name || b.brandName })));
    });

    api.get("/categories").then((res) => {
      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.categories)
        ? res.data.categories
        : [];
      setCategories(
        arr.map((c: any) => ({ id: c.categoryId, name: c.categoryName || c.categoryName }))
      );
    });

    api.get("/products").then((res) => {
      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.products)
        ? res.data.products
        : [];

      setProductsOptions(
        arr.map((p: any) => ({
          id: p.id,
          name: p.name,
          brandId: p.brandId,
          categoryId: p.categoryId,
        }))
      );
    });
  }, []);

  // --- Handlers ---
  const addProduct = () =>
    setProducts([
      ...products,
      {
        productName: "",
        brandName: "",
        categoryName: "",
        orderQty: "",
        orderPrice: "",
      },
    ]);

  const removeProduct = (idx: number) =>
    products.length > 1 &&
    setProducts(products.filter((_, i) => i !== idx));

  const handleProductChange = (idx: number, value: string) => {
    const updated = [...products];
    updated[idx].productName = value;

    const matched = productsOptions.find((p) => p.name === value);

    if (matched) {
      const brandName =
        brands.find((b) => b.id === matched.brandId)?.name || "";
      const categoryName =
        categories.find((c) => c.id === matched.categoryId)?.name || "";

      updated[idx].brandName = brandName;
      updated[idx].categoryName = categoryName;
    } else {
      updated[idx].brandName = "";
      updated[idx].categoryName = "";
    }

    setProducts(updated);
  };

  const handleDetailChange = (
    idx: number,
    field: keyof OrderProduct,
    value: any
  ) => {
    const updated = [...products];
    updated[idx][field] = value;
    setProducts(updated);
  };

  const totalPrice = products.reduce(
    (sum, p) => sum + (Number(p.orderQty) * Number(p.orderPrice) || 0),
    0
  );

  // --- Submit ---
  const handleSubmit = async () => {
    if (!supplierName) {
      toast.warning("Supplier is required");
      return;
    }
    if (
      products.some(
        (p) =>
          !p.productName ||
          !p.brandName ||
          !p.categoryName ||
          !p.orderQty ||
          !p.orderPrice
      )
    ) {
      toast.warning("All product fields are required");
      return;
    }

    const payload = {
      noInvoice: sanitize(noInvoice),
      supplierName: sanitize(supplierName),
      orderDate: new Date(orderDate).toISOString(),
      totalPrice,
      orderDetails: products.map((p) => ({
        productName: sanitize(p.productName),
        brand: sanitize(p.brandName),
        category: sanitize(p.categoryName),
        orderQty: Number(p.orderQty),
        orderPrice: Number(p.orderPrice),
      })),
    };

    try {
      await api.post("/orders", payload);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order "+ payload.noInvoice+ " successfully added")
      navigate("/orders");
    } catch (err: any) {
      console.error(err.response?.data || err);
      toast.error(
        "Error creating order: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create New Order</h1>

      {/* === EDIT WARNING DIALOG === */}
      <AlertDialog open={showEditWarning} onOpenChange={setShowEditWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Once you fill this order, <b>you cannot edit it later</b>.  
              Please double-check before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowEditWarning(false)}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowSaveConfirm(true);
        }}
        className="space-y-6"
      >
        {/* No Invoice */}
        <div className="space-y-2">
          <Label>No Invoice (optional)</Label>
          <Input
            value={noInvoice}
            onChange={(e) => setNoInvoice(e.target.value)}
            placeholder="Leave blank to auto-generate"
          />
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <SearchableSelect
            label="Supplier"
            options={suppliers}
            value={supplierName}
            onChange={(v) => setSupplierName(v)}
            onAddNew={(newSupplier) =>
              setSuppliers((prev) => [...prev, newSupplier])
            }
          />
        </div>

        {/* Order Date & Time */}
        <div className="space-y-2">
          <Label>Order Date & Time</Label>
          <Input
            type="datetime-local"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            required
          />
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <div className="space-y-4 mt-4">
            {products.map((p, idx) => (
              <div key={idx} className="border p-4 rounded-md space-y-2">
                {/* Product Name */}
                <SearchableSelect
                  label="Product Name"
                  options={productsOptions.map((po) => po.name)}
                  value={p.productName}
                  onChange={(v) => handleProductChange(idx, v)}
                  onAddNew={(newProduct) => handleProductChange(idx, newProduct)}
                />

                {/* Brand */}
                <SearchableSelect
                  label="Brand"
                  options={brands.map((b) => b.name)}
                  value={p.brandName}
                  onChange={(v) => handleDetailChange(idx, "brandName", v)}
                  onAddNew={(newBrand) =>
                    setBrands((prev) => [
                      ...prev,
                      { id: prev.length + 1, name: newBrand },
                    ])
                  }
                />

                {/* Category */}
                <SearchableSelect
                  label="Category"
                  options={categories.map((c) => c.name)}
                  value={p.categoryName}
                  onChange={(v) => handleDetailChange(idx, "categoryName", v)}
                  onAddNew={(newCat) =>
                    setCategories((prev) => [
                      ...prev,
                      { id: prev.length + 1, name: newCat },
                    ])
                  }
                />

                {/* Quantity */}
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={p.orderQty}
                  onChange={(e) =>
                    handleDetailChange(idx, "orderQty", e.target.value)
                  }
                  required
                />

                {/* Price */}
                <Input
                  type="number"
                  placeholder="Price"
                  value={p.orderPrice}
                  onChange={(e) =>
                    handleDetailChange(idx, "orderPrice", e.target.value)
                  }
                  required
                />

                {/* Remove button */}
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeProduct(idx)}
                    className="cursor-pointer"
                  >
                    Remove Product
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            className="mt-4 cursor-pointer"
            onClick={addProduct}
          >
            + Add Another Product
          </Button>
        </div>

        {/* Total Price */}
        <div className="text-lg font-bold">Total Price: {totalPrice}</div>

        {/* Form Buttons */}
        <div className="flex gap-4">
          <Button type="submit" className="cursor-pointer">Save Order</Button>
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={() => navigate("/orders")}
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
              Are you sure all details are correct?  
              You cannot edit this order after saving.
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
};


export default AddOrderPage;
