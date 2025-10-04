import { useState, useEffect } from "react";
import { useParams } from "@/router";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/searchable-select";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface SKU {
  skuId?: number;
  code: string;
  name: string;
  desc: string;
  salePrice: string;
}

type SKUStringFields = "code" | "name" | "desc" | "salePrice";

interface ExistingImage {
  id: number;
  alt?: string | null;
  url: string;
}

export default function EditProductPage() {
  const { id } = useParams("/product/edit/:id");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [hasInitialStocks, setHasInitialStocks] = useState(false);
  const [initialQty, setInitialQty] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [skus, setSkus] = useState<SKU[]>([{ code: "", name: "", desc: "", salePrice: "" }]);
  const [deletedSkuIds, setDeletedSkuIds] = useState<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  useEffect(() => {
    const canCreate =
      user?.role === "ADMIN" || user?.permissions?.products?.includes("update");
  
    if (!canCreate) {
      navigate("/404");
    }
  }, [user, navigate]);

  const sanitize = (val: string) => DOMPurify.sanitize(val.trim());

  // Fetch brands & categories
  useEffect(() => {
    api.get("/brands").then((res) => {
      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.brands)
          ? res.data.brands
          : [];
      setBrands(arr.map((b: any) => b.name || b.brandName));
    });
    api.get("/categories").then((res) => {
      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.categories)
          ? res.data.categories
          : [];
      setCategories(arr.map((c: any) => c.name || c.categoryName));
    });
  }, []);

  // Load product
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        const raw = res.data;

        setName(raw.name || "");
        setBrandName(raw.brand?.name || raw.brandName || "");
        setCategoryName(raw.category?.categoryName || raw.categoryName || "");
        setInitialPrice(raw.initialPrice?.toString() || "");
        setInitialQty(raw.initialQty?.toString() || "");
        setHasInitialStocks(raw.hasInitialStocks || false);

        if (raw.skus && raw.skus.length > 0) {
          setSkus(
            raw.skus.map((s: any) => ({
              skuId: s.skuId,
              code: s.skuCode || "",
              name: s.skuName || "",
              desc: s.skuDesc || "",
              salePrice: s.salePrice?.toString() || "",
            }))
          );
        }

        if (raw.images && raw.images.length > 0) {
          setExistingImages(raw.images); // assuming raw.images = [{id, url}, ...]
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load product");
      }
    }
    loadProduct();
  }, [id]);

  const addSKU = () => setSkus([...skus, { code: "", name: "", desc: "", salePrice: "" }]);

  const removeSKU = (idx: number) => {
    const skuToRemove = skus[idx];
    if (skuToRemove.skuId) {
      setDeletedSkuIds((prev) => [...prev, skuToRemove.skuId!]);
    }
    setSkus(skus.filter((_, i) => i !== idx));
  };

  const handleSKUChange = (idx: number, field: SKUStringFields, value: string) => {
    const updated = [...skus];
    updated[idx][field] = value;
    setSkus(updated);
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(f.type)
    );

    if (newFiles.length === 0) return;

    // Merge existingImages (already uploaded) + new files
    const totalImages = [...existingImages.map(img => img as unknown as File), ...images, ...newFiles];

    if (totalImages.length <= 3) {
      setImages(prev => [...prev, ...newFiles]);
    } else {
      // Replace last images if over limit
      const availableSlots = 3 - existingImages.length;
      if (availableSlots > 0) {
        // Fill remaining slots first
        setImages(prev => [...prev, ...newFiles.slice(0, availableSlots)]);
      } else {
        // Replace last existing image
        const updatedExistingImages = [...existingImages];
        updatedExistingImages[updatedExistingImages.length - 1] = {
          id: -1, // dummy id for the new upload
          url: URL.createObjectURL(newFiles[0]),
        };
        setExistingImages(updatedExistingImages);
        // If there are more new files, put them in images array (max 3 total)
        const remaining = newFiles.slice(1, 3 - updatedExistingImages.length);
        setImages(remaining);
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = sanitize(name);
    const cleanBrand = sanitize(brandName || "unknown");
    const cleanCategory = sanitize(categoryName || "unknown");

    const cleanSkus = skus.map((sku) => ({
      skuId: sku.skuId,
      code: sanitize(sku.code),
      name: sanitize(sku.name),
      desc: sanitize(sku.desc),
      salePrice: Number(sanitize(sku.salePrice)) || 0,
    }));

    if (hasInitialStocks) {
      if (!initialQty || Number(initialQty) <= 0) {
        alert("Invalid initial quantity");
        return;
      }
      if (!initialPrice || Number(initialPrice) <= 0) {
        alert("Invalid initial price");
        return;
      }
    }

    const allowedNameRegex = /^[a-zA-Z0-9\s\-_.()]+$/;
    if (!allowedNameRegex.test(cleanName)) {
      alert("Product name contains invalid characters");
      return;
    }

    const formData = new FormData();
    formData.append("name", cleanName);
    formData.append("brandName", cleanBrand);
    formData.append("categoryName", cleanCategory);
    formData.append("hasInitialStocks", hasInitialStocks.toString());
    if (hasInitialStocks) {
      formData.append("initialQty", sanitize(initialQty));
      formData.append("initialPrice", sanitize(initialPrice));
    }
    formData.append("skus", JSON.stringify(cleanSkus));
    formData.append("deletedSkuIds", JSON.stringify(deletedSkuIds));

    // deleted existing images
    const deletedImageIds = existingImages
      .filter((img) => !existingImages.includes(img))
      .map((img) => img.id);
    formData.append("deletedImageIds", JSON.stringify(deletedImageIds));

    if (images.length > 0) {
      images.forEach((img) => formData.append("images", img));
    }

    try {
      await api.put(`/products/${id}`, formData);
      alert("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(`/product/${id}`);
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err);
      alert("Error updating product");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" required />
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <SearchableSelect
            label="Brand"
            options={brands}
            value={brandName}
            onChange={setBrandName}
            onAddNew={(newBrand) => setBrands((prev) => [...prev, newBrand])}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <SearchableSelect
            label="Category"
            options={categories}
            value={categoryName}
            onChange={setCategoryName}
            onAddNew={(newCat) => setCategories((prev) => [...prev, newCat])}
          />
        </div>

        {/* Has Initial Stocks */}
        <div className="flex items-center space-x-2">
          <Checkbox
            className="cursor-pointer"
            id="initial-stock"
            checked={hasInitialStocks}
            onCheckedChange={(checked) => setHasInitialStocks(checked as boolean)}
          />
          <Label htmlFor="initial-stock" className="font-bold text-[#209ebb]">Has initial stock?</Label>
        </div>

        {hasInitialStocks && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Quantity</Label>
              <Input type="number" value={initialQty} onChange={(e) => setInitialQty(e.target.value)} placeholder="e.g. 50" />
            </div>
            <div className="space-y-2">
              <Label>Initial Price</Label>
              <Input type="number" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} placeholder="e.g. 200000" />
            </div>
          </div>
        )}

        {/* SKUs */}
        <div>
          <h2 className="text-xl font-semibold">Product Variants (SKUs)</h2>
          <div className="space-y-4 mt-4">
            {skus.map((sku, idx) => (
              <div key={idx} className="border p-4 rounded-md space-y-3">
                <Input placeholder="SKU Code" value={sku.code} onChange={(e) => handleSKUChange(idx, "code", e.target.value)} required />
                <Input placeholder="SKU Name" value={sku.name} onChange={(e) => handleSKUChange(idx, "name", e.target.value)} required />
                <Input placeholder="SKU Description" value={sku.desc} onChange={(e) => handleSKUChange(idx, "desc", e.target.value)} />
                <Input type="number" placeholder="Sale Price" value={sku.salePrice} onChange={(e) => handleSKUChange(idx, "salePrice", e.target.value)} required />
                {idx > 0 && <Button type="button" variant="destructive" className="cursor-pointer" onClick={() => removeSKU(idx)}>Remove SKU</Button>}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" className="mt-4 cursor-pointer" onClick={addSKU}>+ Add Another SKU</Button>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <Label>Existing Images</Label>
            <ul className="list-disc space-y-1 text-sm text-gray-700 flex flex-row gap-4">
              {existingImages.map((img) => (
                <li key={img.id} className="flex items-center space-x-2 bg-[#8ecae6]/50 rounded pl-2">
                  <p>{img.alt}</p>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 cursor-pointer hover:bg-transparent" onClick={() => setExistingImages(prev => prev.filter(i => i.id !== img.id))}>Remove</Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* New Images */}
        <div className="space-y-2">
          <Label>Add New Images (max 3)</Label>
          <Input type="file" accept="image/jpeg,image/png,image/jpg" multiple onChange={handleImages} />
          <p className="text-sm text-gray-500">Selected: {images.length}/3</p>
          {images.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {images.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button type="submit">Save Product</Button>
          <Button type="button" className="cursor-pointer" variant="outline" onClick={() => navigate(`/product/${id}`)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
