import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ProductImage {
  url: { type: string; data: number[] };
  alt?: string | null;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  images: ProductImage[];
}

// Helper to convert Buffer object to Base64
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

// Fetch products function
const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products", {
    headers: { "Content-Type": "application/json" },
  });
  const rawProducts = response.data;

  return rawProducts.map((p: any) => {
    const firstSku = p.skus && p.skus.length > 0 ? p.skus[0] : null;
    const price = firstSku?.salePrice ?? p.initialPrice ?? 0;

    return {
      id: p.id,
      name: p.name,
      price,
      category: p.category?.categoryName || p.categoryName || "Unknown",
      images: p.images || [],
    };
  });
};

export default function Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const prevImage = (productId: number, total: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) - 1 + total) % total,
    }));
  };

  const nextImage = (productId: number, total: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) + 1) % total,
    }));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID").format(price);

  if (isLoading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load products.</div>;

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <SiteHeader />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Products</h1>
          <Badge className="bg-transparent border-[#209ebb] text-[#023047]">
            {filteredProducts.length} items
          </Badge>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black h-4 w-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full focus:outline-none pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-40 cursor-pointer">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={() => navigate("/product/new")}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const currentIndex = currentImageIndex[product.id] ?? 0;
          const hasImages = product.images.length > 0;
          const currentImageUrl = hasImages
            ? `data:image/jpeg;base64,${bufferToBase64FromObject(
                product.images[currentIndex].url
              )}`
            : null;

          return (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition relative"
            >
              {hasImages && currentImageUrl && (
                <div className="relative">
                  <img
                    src={currentImageUrl}
                    alt={product.name}
                    className="min-h-32 md:min-h-48 w-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => prevImage(product.id, product.images.length)}
                        className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full cursor-pointer bg-[#8ecae6]/30 hover:bg-[#8ecae6]/50"
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => nextImage(product.id, product.images.length)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full cursor-pointer bg-[#8ecae6]/30 hover:bg-[#8ecae6]/50"
                      >
                        <ChevronRight />
                      </Button>
                    </>
                  )}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-end">
                <div>
                  <p className="text-[#209ebb] font-extrabold">
                    Rp{formatPrice(product.price)}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">
                    {product.category}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 text-sm"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
