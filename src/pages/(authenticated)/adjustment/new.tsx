import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { SearchableSelect } from "@/components/searchable-select";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";


interface Product {
    id: number;
    name: string;
    brandId?: number;
    brandName?: string;
    categoryId?: number;
    categoryName?: string;
}

interface AdjustmentProductInput {
    productId?: number;
    name?: string;
    brandId?: number;
    categoryId?: number;
    newBrandName?: string;
    newCategoryName?: string;
    quantity: number | string; // string during typing
    price: number | string; // string during typing
    role: "SOURCE" | "RESULT";
}

export default function NewAdjustmentPage() {
    const [action, setAction] = useState<"COMBINE" | "SPLIT" | "">("");
    const [adjustmentDate, setAdjustmentDate] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [productNames, setProductNames] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [sources, setSources] = useState<AdjustmentProductInput[]>([]);
    const [results, setResults] = useState<AdjustmentProductInput[]>([]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const canCreateAdjustment =
            user?.role === "ADMIN" || user?.permissions?.adjustments?.includes("create");

        if (!canCreateAdjustment) {
            navigate("/404");
        }
    }, [user, navigate]);

    useEffect(() => {
        api.get("/products").then((res) => {
            const arr = Array.isArray(res.data) ? res.data : res.data.data || [];
            setProducts(arr);
            setProductNames(arr.map((p: any) => p.name));
        });

        api.get("/brands").then((res) => {
            const arr = Array.isArray(res.data) ? res.data : res.data.data || [];
            setBrands(arr.map((b: any) => b.name || b.brandName));
        });

        api.get("/categories").then((res) => {
            const arr = Array.isArray(res.data) ? res.data : res.data.data || [];
            setCategories(arr.map((c: any) => c.name || c.categoryName));
        });
    }, []);

    // ✅ Helpers
    const sanitizeNumber = (value: string) => {
        if (value === "") return ""; // allow empty during typing
        const num = Number(value);
        if (isNaN(num) || num < 0) return 0;
        return Number(value.replace(/^0+/, "")) || 0; // remove leading zeros
    };

    const addSource = () =>
        setSources([...sources, { role: "SOURCE", quantity: 1, price: 0 }]);
    const addResult = () =>
        setResults([...results, { role: "RESULT", quantity: 1, price: 0 }]);
    const removeSource = (i: number) =>
        setSources(sources.filter((_, idx) => idx !== i));
    const removeResult = (i: number) =>
        setResults(results.filter((_, idx) => idx !== i));

    const handleProductSelect = (
        i: number,
        role: "SOURCE" | "RESULT",
        productName: string
    ) => {
        // Kalau COMBINE + SOURCE, harus produk existing
        if (action === "COMBINE" && role === "SOURCE") {
            const selected = products.find((p) => p.name === productName);
            if (!selected) {
                toast.warning("In COMBINE, sources must be existing products.");
                return;
            }
        }

        const selected = products.find((p) => p.name === productName);
        const updateFn = role === "SOURCE" ? setSources : setResults;

        updateFn((prev) =>
            prev.map((p, idx) =>
                idx === i
                    ? selected
                        ? {
                            ...p,
                            productId: selected.id,
                            name: selected.name,
                            brandId: selected.brandId,
                            categoryId: selected.categoryId,
                            newBrandName: "",
                            newCategoryName: "",
                        }
                        : { ...p, productId: undefined, name: productName }
                    : p
            )
        );
    };


    // ✅ Enhanced validation
    const validateAdjustment = (): string | null => {
        if (!action) return "Please select an action (COMBINE or SPLIT)";
        if (!adjustmentDate) return "Please select an adjustment date";

        const allRows = [...sources, ...results];
        for (const [i, row] of allRows.entries()) {
            if (!row.name || row.name.trim() === "")
                return `Row ${i + 1}: Product name is required`;
            if (!row.quantity || Number(row.quantity) <= 0)
                return `Row ${i + 1}: Quantity must be > 0`;
            if (row.role === "RESULT" && (row.price === "" || Number(row.price) < 0))
                return `Row ${i + 1}: Price must be 0 or positive`;
            if (!row.productId) {
                if (!row.newBrandName)
                    return `Row ${i + 1}: New product requires brand name`;
                if (!row.newCategoryName)
                    return `Row ${i + 1}: New product requires category name`;
            }
        }

        // logical checks
        if (action === "COMBINE") {
            if (sources.length < 2)
                return "COMBINE requires at least 2 source products.";
            if (results.length !== 1)
                return "COMBINE must have exactly 1 result product.";

            // Source tidak boleh produk baru
            const newSource = sources.find((s) => !s.productId);
            if (newSource) return "Source in COMBINE must be existing products.";

            // Semua quantity source dan result harus sama
            const baseQty = Number(sources[0].quantity);
            const mismatchSource = sources.find(
                (s) => Number(s.quantity) !== baseQty
            );
            if (mismatchSource)
                return "All source quantities in COMBINE must be the same.";

            const resultQty = Number(results[0].quantity);
            if (resultQty !== baseQty)
                return `Result quantity (${resultQty}) must match source quantity (${baseQty}).`;
        }

        if (action === "SPLIT") {
            if (sources.length !== 1)
                return "SPLIT requires exactly 1 source product.";
            if (results.length < 2)
                return "SPLIT requires at least 2 result products.";

            const sourceQty = Number(sources[0].quantity);

            // Semua result harus quantity = source
            const mismatch = results.find(
                (r) => Number(r.quantity) !== sourceQty
            );
            if (mismatch)
                return `Quantity mismatch: each result quantity must equal source quantity (${sourceQty}).`;
        }
        return null;
    };

    const handleSubmit = async () => {
        const error = validateAdjustment();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            const payload = {
                action: DOMPurify.sanitize(action),
                adjustmentDate: new Date(DOMPurify.sanitize(adjustmentDate)),
                products: [...sources, ...results].map((p) => {
                    const base = {
                        adjustmentQuantity: Number(p.quantity),
                        adjustmentPrice: Number(p.price),
                        adjustmentRole: p.role,
                    };
                    return p.productId
                        ? { ...base, productId: p.productId }
                        : {
                            ...base,
                            name: p.name,
                            newBrandName: p.newBrandName,
                            newCategoryName: p.newCategoryName,
                        };
                }),
            };

            console.log("📦 Payload being sent:", payload); // ✅ debug

            const res = await api.post("/adjustments", payload);

            toast.success("Adjustment created successfully!");
            navigate("/adjustment");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to create adjustment");
        }
    };


    return (
        <div className="p-6 space-y-6">
            <h1 className="text-xl font-semibold">Create Adjustment</h1>

            {/* Header */}
            <div className="space-y-4">
                <div>
                    <Label>Adjustment Date</Label>
                    <Input
                        type="date"
                        value={adjustmentDate}
                        onChange={(e) => setAdjustmentDate(e.target.value)}
                    />
                </div>

                <div>
                    <Label>Action</Label>
                    <SearchableSelect
                        label=""
                        options={["COMBINE", "SPLIT"]}
                        value={action}
                        onChange={(v) => {
                            setAction(v as "COMBINE" | "SPLIT");
                            setSources([]);
                            setResults([]);
                        }}
                        onAddNew={() => { }}
                    />
                </div>
            </div>

            {/* SOURCE */}
            <div>
                <h2 className="font-semibold">Source Products</h2>
                {sources.map((src, i) => (
                    <div key={i} className="flex gap-2 mt-2 flex-wrap items-end">
                        <div className="w-[200px]">
                            <Label>Product</Label>
                            <SearchableSelect
                                label=""
                                options={productNames}
                                value={src.name || ""}
                                onChange={(val) => handleProductSelect(i, "SOURCE", val)}
                                onAddNew={() => { }}
                            />
                        </div>
                        <div>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                value={src.quantity}
                                onChange={(e) =>
                                    setSources((prev) =>
                                        prev.map((p, idx) =>
                                            idx === i
                                                ? { ...p, quantity: sanitizeNumber(e.target.value) }
                                                : p
                                        )
                                    )
                                }
                            />
                        </div>
                        <Button
                            variant="destructive"
                            className="mt-6"
                            onClick={() => removeSource(i)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button variant="secondary" className="mt-2" onClick={addSource}>
                    + Add Source
                </Button>
            </div>

            {/* RESULT */}
            <div>
                <h2 className="font-semibold">Result Products</h2>
                {results.map((res, i) => (
                    <div key={i} className="flex gap-2 mt-2 flex-wrap items-end">
                        <div className="w-[200px]">
                            <Label>Product</Label>
                            <SearchableSelect
                                label=""
                                options={productNames}
                                value={res.name || ""}
                                onChange={(val) => handleProductSelect(i, "RESULT", val)}
                                onAddNew={() => { }}
                            />
                        </div>

                        {!res.productId && (
                            <>
                                <div className="w-[180px]">
                                    <Label>Brand</Label>
                                    <SearchableSelect
                                        label=""
                                        options={brands}
                                        value={res.newBrandName || ""}
                                        onChange={(val) =>
                                            setResults((prev) =>
                                                prev.map((p, idx) =>
                                                    idx === i ? { ...p, newBrandName: val } : p
                                                )
                                            )
                                        }
                                        onAddNew={() => { }}
                                    />
                                </div>
                                <div className="w-[180px]">
                                    <Label>Category</Label>
                                    <SearchableSelect
                                        label=""
                                        options={categories}
                                        value={res.newCategoryName || ""}
                                        onChange={(val) =>
                                            setResults((prev) =>
                                                prev.map((p, idx) =>
                                                    idx === i ? { ...p, newCategoryName: val } : p
                                                )
                                            )
                                        }
                                        onAddNew={() => { }}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                value={res.quantity}
                                onChange={(e) =>
                                    setResults((prev) =>
                                        prev.map((p, idx) =>
                                            idx === i
                                                ? { ...p, quantity: sanitizeNumber(e.target.value) }
                                                : p
                                        )
                                    )
                                }
                            />
                        </div>

                        <div>
                            <Label>Price</Label>
                            <Input
                                type="number"
                                value={res.price}
                                onChange={(e) =>
                                    setResults((prev) =>
                                        prev.map((p, idx) =>
                                            idx === i
                                                ? { ...p, price: sanitizeNumber(e.target.value) }
                                                : p
                                        )
                                    )
                                }
                            />
                        </div>

                        <Button
                            variant="destructive"
                            className="mt-6"
                            onClick={() => removeResult(i)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button variant="secondary" className="mt-2" onClick={addResult}>
                    + Add Result
                </Button>
            </div>
            <div className="flex gap-4">
                <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                    {/* Trigger tombol */}
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            className="cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Save Adjustment"
                            )}
                        </Button>
                    </AlertDialogTrigger>

                    {/* Dialog */}
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Adjustment</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to save this adjustment? Make sure all data is
                                correct.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting} className="cursor-pointer">
                                Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="cursor-pointer bg-primary text-white"
                                disabled={isSubmitting}
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    await handleSubmit();
                                    setIsSubmitting(false);
                                    setOpenConfirm(false);
                                }}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner className="w-4 h-4" />
                                        Processing...
                                    </div>
                                ) : (
                                    "Yes, Save"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/adjustment")}
                    className="cursor-pointer"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
