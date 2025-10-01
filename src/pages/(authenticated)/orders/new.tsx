import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/searchable-select";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";

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
    const [noInvoice, setNoInvoice] = useState("");
    const [supplierName, setSupplierName] = useState("");
    const [orderDate, setOrderDate] = useState(() => {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const min = pad(now.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    });

    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [products, setProducts] = useState<OrderProduct[]>([
        { productName: "", brandName: "", categoryName: "", orderQty: "", orderPrice: "" }
    ]);
    const [productNames, setProductNames] = useState<string[]>([]);

    const sanitize = (val: string) => DOMPurify.sanitize(val.trim());

    useEffect(() => {
        api.get("/suppliers").then(res => {
            const supplierArray = res.data.data || []; // <-- fetch from data
            setSuppliers(supplierArray.map((s: any) => s.name)); // use s.name
        }).catch(err => console.error("Error fetching suppliers", err));

        api.get("/brands").then(res => {
            const arr = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.brands)
                    ? res.data.brands
                    : [];
            setBrands(arr.map((b: any) => b.name || b.brandName));
        });

        api.get("/categories").then(res => {
            const arr = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.categories)
                    ? res.data.categories
                    : [];
            setCategories(arr.map((c: any) => c.name || c.categoryName));
        });

        api.get("/products").then(res => {
            const arr = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.product)
                    ? res.data.name
                    : [];
            setProductNames(arr.map((c: any) => c.name || c.productName));
        });

    }, []);

    const addProduct = () => setProducts([...products, { productName: "", brandName: "", categoryName: "", orderQty: "", orderPrice: "" }]);
    const removeProduct = (idx: number) => products.length > 1 && setProducts(products.filter((_, i) => i !== idx));

    const handleProductChange = (idx: number, field: keyof OrderProduct, value: any) => {
        const updated = [...products];
        updated[idx][field] = value;
        setProducts(updated);
    };

    const totalPrice = products.reduce((sum, p) => sum + (Number(p.orderQty) * Number(p.orderPrice) || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- Validation ---
        if (!supplierName) {
            alert("Supplier is required");
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
            alert("All product fields are required");
            return;
        }

        // --- Prepare payload ---
        const payload = {
            noInvoice: sanitize(noInvoice),
            supplierName: sanitize(supplierName),
            orderDate: new Date(orderDate).toISOString(), // include full datetime
            totalPrice: products.reduce(
                (sum, p) => sum + Number(p.orderQty) * Number(p.orderPrice),
                0
            ),
            orderDetails: products.map((p) => ({
                productName: sanitize(p.productName),
                brand: sanitize(p.brandName),          // renamed key for backend
                category: sanitize(p.categoryName),    // renamed key for backend
                orderQty: Number(p.orderQty),
                orderPrice: Number(p.orderPrice),
            })),
        };

        // --- Submit to backend ---
        try {
            await api.post("/orders", payload);
            alert("Order created successfully!");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            navigate("/orders");
        } catch (err: any) {
            console.error(err.response?.data || err);
            alert(
                "Error creating order: " +
                (err.response?.data?.message || err.message || "Unknown error")
            );
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Create New Order</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* No Invoice */}
                <div className="space-y-2">
                    <Label>No Invoice (optional)</Label>
                    <Input
                        value={noInvoice}
                        onChange={e => setNoInvoice(e.target.value)}
                        placeholder="Leave blank to auto-generate"
                    />
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                    <SearchableSelect
                        label="Supplier"
                        options={suppliers}
                        value={supplierName}
                        onChange={v => setSupplierName(v)}
                        onAddNew={newSupplier => setSuppliers(prev => [...prev, newSupplier])}
                    />
                </div>

                {/* Order Date & Time */}
                <div className="space-y-2">
                    <Label>Order Date & Time</Label>
                    <Input
                        type="datetime-local"
                        value={orderDate}
                        onChange={e => setOrderDate(e.target.value)}
                        required
                    />
                </div>

                {/* Products */}
                <div>
                    <h2 className="text-xl font-semibold">Products</h2>
                    <div className="space-y-4 mt-4">
                        {products.map((p, idx) => (
                            <div key={idx} className="border p-4 rounded-md space-y-2">
                                <SearchableSelect
                                    label="Product Name"
                                    options={productNames}
                                    value={p.productName}
                                    onChange={v => handleProductChange(idx, "productName", v)}
                                    onAddNew={newProduct => setProductNames(prev => [...prev, newProduct])}
                                />
                                <SearchableSelect
                                    label="Brand"
                                    options={brands}
                                    value={p.brandName}
                                    onChange={v => handleProductChange(idx, "brandName", v)}
                                    onAddNew={newBrand => setBrands(prev => [...prev, newBrand])}
                                />
                                <SearchableSelect
                                    label="Category"
                                    options={categories}
                                    value={p.categoryName}
                                    onChange={v => handleProductChange(idx, "categoryName", v)}
                                    onAddNew={newCat => setCategories(prev => [...prev, newCat])}
                                />
                                <Input
                                    type="number"
                                    placeholder="Quantity"
                                    value={p.orderQty}
                                    onChange={e => handleProductChange(idx, "orderQty", e.target.value)}
                                    required
                                />
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={p.orderPrice}
                                    onChange={e => handleProductChange(idx, "orderPrice", e.target.value)}
                                    required
                                />
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
                    <Button type="button" variant="secondary" className="mt-4" onClick={addProduct}>
                        + Add Another Product
                    </Button>
                </div>

                {/* Total Price */}
                <div className="text-lg font-bold">Total Price: {totalPrice}</div>

                {/* Form Buttons */}
                <div className="flex gap-4">
                    <Button type="submit">Save Order</Button>
                    <Button type="button" variant="outline" onClick={() => navigate("/orders")}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddOrderPage;
