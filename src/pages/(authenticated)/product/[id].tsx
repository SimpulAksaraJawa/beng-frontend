import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, Pencil } from "lucide-react";
import api from "@/api/axios";

// Interfaces
interface SKU {
  skuId: number;
  skuCode: string;
  skuName: string;
  productId: number;
  skuDesc: string | null;
  salePrice: number;
}

interface ProductImage {
  url: { type: string; data: number[] };
  alt?: string | null;
}

interface Category {
  categoryName: string;
}

interface Brand {
  name: string;
}

interface Product {
  id: number;
  name: string;
  category?: Category;
  brand?: Brand;
  initialPrice?: number | null;
  skus: SKU[];
  images: ProductImage[];
}

// Helper convert buffer to base64
function bufferToBase64FromObject(bufferObj: { type: string; data: number[] }): string {
  const bytes = new Uint8Array(bufferObj.data);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSku, setActiveSku] = useState<SKU | null>(null);

  // inside ProductDetailPage:

useEffect(() => {
  async function load() {
    try {
      const res = await api.get(`/products/${id}`, { headers: { "Content-Type": "application/json" } });
      const raw = res.data;

      const mapped: Product = {
        id: raw.id,
        name: raw.name,
        category: { categoryName: raw.category?.categoryName || raw.categoryName || "Unknown" },
        brand: { name: raw.brand?.name || raw.brandName || "Unknown" },
        initialPrice: raw.initialPrice ?? 0,
        skus: raw.skus || [],
        images: raw.images || []
      };

      setProduct(mapped);
      if (mapped.skus.length > 0) setActiveSku(mapped.skus[0]);
    } catch (err) {
      console.error(err);
    }
  }
  load();
}, [id]);


  if (!product) return <div className="p-6">Loading product...</div>;

  const images = product.images || [];
  const hasImages = images.length > 0;
  const currentImageUrl = hasImages
    ? `data:image/jpeg;base64,${bufferToBase64FromObject(images[currentImageIndex].url)}`
    : null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID").format(price);

  return (
    <div className="p-6 space-y-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="px-4 py-2 cursor-pointer"
      >
        <ArrowLeft />Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image section */}
        <div className="relative">
          {hasImages && currentImageUrl && (
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-full max-h-96 object-contain bg-gray-100 rounded-xl"
            />
          )}
          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                onClick={() =>
                  setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)
                }
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full cursor-pointer bg-[#8ecae6]/30 hover:bg-[#8ecae6]/50"
              >
                <ChevronLeft />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() =>
                  setCurrentImageIndex((currentImageIndex + 1) % images.length)
                }
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full cursor-pointer bg-[#8ecae6]/30 hover:bg-[#8ecae6]/50"
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>

        {/* Right side info */}
        <div>
          <Button
            variant="secondary"
            className="mb-2 cursor-pointer"
          >
            <Pencil/>Edit
          </Button>

          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mb-2">
            {product.category?.categoryName || "No Category"} -{" "}
            {product.brand?.name || "No Brand"}
          </p>

          <p className="text-3xl text-[#209ebb] font-extrabold">
            Rp {activeSku ? formatPrice(activeSku.salePrice) : formatPrice(product.initialPrice ?? 0)}
          </p>

          {/* Supplier Table */}
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Suppliers</h2>
            <div className="max-h-40 overflow-y-auto border rounded">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Supplier Name</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Empty for now */}
                  <tr>
                    <td className="px-4 py-2 text-gray-400" colSpan={3}>
                      No supplier data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SKU Buttons */}
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Product Variant</h2>
            <div className="flex flex-wrap gap-2">
              {product.skus.map((sku) => (
                <Button
                  key={sku.skuId}
                  className={`border-2 border-[#8ecae6] bg-transparent text-[#232323] cursor-pointer hover:bg-[#8ecae6] ${
                    activeSku?.skuId === sku.skuId ? "bg-[#209ebb] text-white border-none" : ""
                  }`}
                  onClick={() => setActiveSku(sku)}
                >
                  {sku.skuName}
                </Button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Product Description</h2>
            <p>
            {activeSku?.skuDesc || ""}
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
