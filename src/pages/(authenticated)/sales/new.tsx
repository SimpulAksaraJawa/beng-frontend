import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/searchable-select";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";
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
import {useAuth} from "@/contexts/AuthContext"

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
  brandId?: number;
  categoryId?: number;
}

interface SaleProduct {
  productName: string;
  brandName: string;
  categoryName: string;
  saleQty: number | string;
  salePrice: number | string;
}

interface SalePayload {
  noInvoice?: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  saleDetails: Array<{
    productName: string;
    brand: string;
    category: string;
    saleQty: number;
    salePrice: number;
  }>;
}

const AddSalePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [noInvoice, setNoInvoice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const [customers, setCustomers] = useState<string[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsOptions, setProductsOptions] = useState<ProductOption[]>([]);
  const [products, setProducts] = useState<SaleProduct[]>([
    {
      productName: "",
      brandName: "",
      categoryName: "",
      saleQty: "",
      salePrice: "",
    },
  ]);

  const [showEditWarning, setShowEditWarning] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
      const { user } = useAuth();

    useEffect(() => {
        const canCreateSales =
          user?.role === "ADMIN" || user?.permissions?.sales?.includes("create");
      
        if (!canCreateSales) {
          navigate("/404");
        }
      }, [user, navigate]);

  const sanitize = (val: string) => DOMPurify.sanitize(val.trim());

  // ---------- Helper: create safe options ----------
  function toSafeOptions<T extends Record<string, any>>(
    arr: T[] | undefined,
    key: string
  ) {
    if (!Array.isArray(arr)) return [] as string[];
    return arr
      .map((item) => {
        const v = item?.[key];
        return v == null ? "" : String(v);
      })
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // ---------- Fetch master data ----------
  useEffect(() => {
    // customers
    api
      .get("/customers")
      .then((res) => {
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setCustomers(
          items
            .map((c: any) => String(c?.customerName ?? c?.name ?? "").trim())
            .filter(Boolean)
        );
      })
      .catch((err) => console.error("Error fetching customers", err));

    // brands
    api
      .get("/brands")
      .then((res) => {
        // support multiple shapes: {brands: []} or direct array
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.brands)
          ? res.data.brands
          : [];
        setBrands(
          arr.map((b: any) => ({
            id: Number(b?.brandId ?? b?.id ?? 0),
            name: String(b?.brandName ?? b?.name ?? "").trim(),
          }))
        );
      })
      .catch((err) => console.error("Error fetching brands", err));

    // categories
    api
      .get("/categories")
      .then((res) => {
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.categories)
          ? res.data.categories
          : [];
        setCategories(
          arr.map((c: any) => ({
            id: Number(c?.categoryId ?? c?.id ?? 0),
            name: String(c?.categoryName ?? c?.name ?? "").trim(),
          }))
        );
      })
      .catch((err) => console.error("Error fetching categories", err));

    // products
    api
      .get("/products")
      .then((res) => {
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
          ? res.data.products
          : [];
        setProductsOptions(
          arr.map((p: any) => ({
            id: p?.productId ?? p?.id,
            name: String(p?.productName ?? p?.name ?? "").trim(),
            brandId: p?.brandId ?? p?.brand?.brandId ?? p?.brand?.id,
            categoryId:
              p?.categoryId ?? p?.category?.categoryId ?? p?.category?.id,
          }))
        );
      })
      .catch((err) => console.error("Error fetching products", err));
  }, []);

  // ---------- Product handlers ----------
  const addProduct = () =>
    setProducts((prev) => [
      ...prev,
      {
        productName: "",
        brandName: "",
        categoryName: "",
        saleQty: "",
        salePrice: "",
      },
    ]);

  const removeProduct = (idx: number) =>
    setProducts((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );

  const handleProductChange = (idx: number, value: string) => {
    setProducts((prev) => {
      const updated = prev.slice();
      updated[idx] = { ...updated[idx], productName: value };

      // find matching product option by name
      const matched = productsOptions.find(
        (p) => String(p.name).trim() === String(value).trim()
      );

      if (matched) {
        const brandName =
          brands.find((b) => b.id === Number(matched.brandId))?.name ?? "";
        const categoryName =
          categories.find((c) => c.id === Number(matched.categoryId))?.name ??
          "";
        updated[idx].brandName = brandName;
        updated[idx].categoryName = categoryName;
      } else {
        // keep brand/category empty to let user fill or add new
        if (!updated[idx].brandName) updated[idx].brandName = "";
        if (!updated[idx].categoryName) updated[idx].categoryName = "";
      }
      return updated;
    });
  };

  const handleDetailChange = (
    idx: number,
    field: keyof SaleProduct,
    value: any
  ) => {
    setProducts((prev) => {
      const updated = prev.slice();
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // ---------- Totals ----------
  const totalPrice = products.reduce((sum, p) => {
    const qty = Number(p.saleQty || 0);
    const price = Number(p.salePrice || 0);
    if (Number.isFinite(qty) && Number.isFinite(price))
      return sum + qty * price;
    return sum;
  }, 0);

  // ---------- Submit ----------
  const handleSubmit = async () => {
    // basic validation
    if (!customerName?.trim()) {
      alert("Customer is required");
      return;
    }
    if (
      products.some(
        (p) =>
          !p.productName ||
          !p.brandName ||
          !p.categoryName ||
          !p.saleQty ||
          !p.salePrice
      )
    ) {
      alert("All product fields are required");
      return;
    }

    const payload = {
      noInvoice: sanitize(noInvoice) || undefined,
      customerName: sanitize(customerName),
      saleDate: new Date(saleDate).toISOString(),
      totalAmount: totalPrice,
      saledetail: {
        create: products.map((p) => ({
          productName: sanitize(String(p.productName)),
          brand: sanitize(String(p.brandName)),
          category: sanitize(String(p.categoryName)),
          saleQty: Number(p.saleQty),
          salePrice: Number(p.salePrice),
        })),
      },
    };

    try {
      await api.post("/sales", payload);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/sales");
    } catch (err: any) {
      console.error(err?.response?.data ?? err);
      alert(
        "Error creating sale: " +
          (err?.response?.data?.message || err?.message || "Unknown error")
      );
    }
  };

  // ---------- Safe option arrays for selects ----------
  const customerOptions = customers.slice(); // already string[]
  const brandOptions = toSafeOptions(brands, "name");
  const categoryOptions = toSafeOptions(categories, "name");
  const productOptions = toSafeOptions(productsOptions, "name");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create New Sale</h1>

      {/* === WARNING DIALOG === */}
      <AlertDialog open={showEditWarning} onOpenChange={setShowEditWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Once you save this sale, <b>you cannot edit it later</b>. Please
              double-check before saving.
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

        {/* Customer */}
        <div className="space-y-2">
          <SearchableSelect
            label="Customer"
            options={customerOptions}
            value={customerName}
            onChange={(v) => setCustomerName(v)}
            onAddNew={(newCustomer) =>
              setCustomers((prev) => [...prev, newCustomer])
            }
          />
        </div>

        {/* Sale Date & Time */}
        <div className="space-y-2">
          <Label>Sale Date & Time</Label>
          <Input
            type="datetime-local"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
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
                  options={productOptions}
                  value={String(p.productName || "")}
                  onChange={(v) => handleProductChange(idx, v)}
                  onAddNew={(newProduct) =>
                    handleProductChange(idx, newProduct)
                  }
                />

                {/* Brand */}
                <SearchableSelect
                  label="Brand"
                  options={brandOptions}
                  value={String(p.brandName || "")}
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
                  options={categoryOptions}
                  value={String(p.categoryName || "")}
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
                  value={String(p.saleQty ?? "")}
                  onChange={(e) =>
                    handleDetailChange(idx, "saleQty", e.target.value)
                  }
                  required
                />

                {/* Price */}
                <Input
                  type="number"
                  placeholder="Price"
                  value={String(p.salePrice ?? "")}
                  onChange={(e) =>
                    handleDetailChange(idx, "salePrice", e.target.value)
                  }
                  required
                />

                {/* Remove button */}
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeProduct(idx)}
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
            className="mt-4"
            onClick={addProduct}
          >
            + Add Another Product
          </Button>
        </div>

        {/* Total Price */}
        <div className="text-lg font-bold">
          Total Price: Rp {totalPrice.toLocaleString("id-ID")}
        </div>

        {/* Form Buttons */}
        <div className="flex gap-4">
          <Button type="submit">Save Sale</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/sales")}
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
              Are you sure all details are correct? You cannot edit this sale
              after saving.
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
};

export default AddSalePage;
