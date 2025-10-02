import { useState, useEffect } from "react";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/searchable-select";
import DOMPurify from "dompurify"; 
import { useQueryClient } from "@tanstack/react-query";

interface SKU {
  code: string;
  name: string;
  desc: string;
  salePrice: string;
}

const AddProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [hasInitialStocks, setHasInitialStocks] = useState(false);
  const [initialQty, setInitialQty] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [skus, setSkus] = useState<SKU[]>([
    { code: "", name: "", desc: "", salePrice: "" },
  ]);
  const [images, setImages] = useState<File[]>([]);

  const sanitize = (val: string) => DOMPurify.sanitize(val.trim());

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

  const addSKU = () =>
    setSkus([...skus, { code: "", name: "", desc: "", salePrice: "" }]);

  const removeSKU = (idx: number) => {
    if (skus.length === 1) return;
    setSkus(skus.filter((_, i) => i !== idx));
  };

  const handleSKUChange = (idx: number, field: keyof SKU, value: string) => {
    const updated = [...skus];
    updated[idx][field] = value;
    setSkus(updated);
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);
    const valid = arr.filter((f) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(f.type)
    );
    if (images.length + valid.length > 3) {
      alert("Max 3 images allowed");
      return;
    }
    setImages([...images, ...valid]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = sanitize(name);
    const cleanBrand = sanitize(brandName || "unknown");
    const cleanCategory = sanitize(categoryName || "unknown");

    const cleanSkus = skus.map((sku) => ({
      code: sanitize(sku.code),
      name: sanitize(sku.name),
      desc: sanitize(sku.desc),
      salePrice: sanitize(sku.salePrice),
    }));

    if (hasInitialStocks) {
      if (!initialQty || isNaN(Number(initialQty)) || Number(initialQty) <= 0) {
        alert("Invalid initial quantity");
        return;
      }
      if (!initialPrice || isNaN(Number(initialPrice)) || Number(initialPrice) <= 0) {
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
    images.forEach((img) => formData.append("images", img));

    try {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/product");
    } catch (err) {
      console.error(err);
      alert("Error creating product");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <SearchableSelect
            label="Brand"
            options={brands}
            value={brandName}
            onChange={(v) => setBrandName(v)}
            onAddNew={(newBrand) => setBrands((prev) => [...prev, newBrand])}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <SearchableSelect
            label="Category"
            options={categories}
            value={categoryName}
            onChange={(v) => setCategoryName(v)}
            onAddNew={(newCat) => setCategories((prev) => [...prev, newCat])}
          />
        </div>

        {/* Has Initial Stocks */}
        <div className="flex items-center space-x-2">
          <Checkbox
            className="border-2 border-[#209ebb] cursor-pointer"
            id="initial-stock"
            checked={hasInitialStocks}
            onCheckedChange={(checked) =>
              setHasInitialStocks(checked as boolean)
            }
          />
          <Label
            htmlFor="initial-stock"
            className="font-bold text-[#209ebb]"
          >
            Has initial stock?
          </Label>
        </div>

        {hasInitialStocks && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Quantity</Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={initialQty}
                onChange={(e) => setInitialQty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Price</Label>
              <Input
                type="number"
                placeholder="e.g. 200000"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* SKUs */}
        <div>
          <h2 className="text-xl font-semibold">Product Variants (SKUs)</h2>
          <div className="space-y-4 mt-4">
            {skus.map((sku, idx) => (
              <div key={idx} className="border p-4 rounded-md space-y-3">
                <Input
                  placeholder="SKU Code"
                  value={sku.code}
                  onChange={(e) => handleSKUChange(idx, "code", e.target.value)}
                  required
                />
                <Input
                  placeholder="SKU Name"
                  value={sku.name}
                  onChange={(e) => handleSKUChange(idx, "name", e.target.value)}
                  required
                />
                <Input
                  placeholder="SKU Description"
                  value={sku.desc}
                  onChange={(e) => handleSKUChange(idx, "desc", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Sale Price"
                  value={sku.salePrice}
                  onChange={(e) =>
                    handleSKUChange(idx, "salePrice", e.target.value)
                  }
                  required
                />
                {idx > 0 && (
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="destructive"
                    onClick={() => removeSKU(idx)}
                  >
                    Remove SKU
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 cursor-pointer"
            onClick={addSKU}
          >
            + Add Another SKU
          </Button>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>Add Product Images (max 3)</Label>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={handleImages}
          />
          <p className="text-sm text-gray-500">
            Accepted file types: <strong>.jpg, .jpeg, .png</strong>
          </p>
          <p className="text-sm text-gray-500">
            Selected: {images.length}/3
          </p>

          {images.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {images.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 cursor-pointer hover:bg-transparent"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button type="submit" className="cursor-pointer">
            Save Product
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate("/product")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
