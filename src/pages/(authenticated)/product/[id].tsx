import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, Pencil, ChevronDown, ChevronUp, Eye } from "lucide-react";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";

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

interface Supplier {
  supplierId: number;
  supplierName: string;
  supplierEmail?: string;
  supplierPhoneNumber?: string;
  supplierAddress?: string;
  status: string;
}

interface SupplierPriceHistory {
  orderId: number;
  orderDate: string;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

interface ProductSupplier {
  supplierId: number;
  supplierName: string;
  totalOrders: number;
  totalQuantity: number;
  totalValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}

interface LatestPrice {
  supplierId: number;
  supplierName: string;
  productId: number;
  productName: string;
  latestPrice: number;
  latestQuantity: number;
  latestOrderDate: string;
  latestInvoice: string;
}

interface AdjustmentProduct {
  adjustmentProductId: number;
  adjustmentId: number;
  productId: number;
  adjustmentQuantity: number;
  adjustmentPrice: number;
  adjustmentRole: string;
  adjustment: {
    adjustmentId: number;
    adjustmentDate: string;
    adjustmentAction: string;
  };
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

// Fetch single product
const fetchProduct = async (id: string | undefined): Promise<Product> => {
  const res = await api.get(`/products/${id}`, { headers: { "Content-Type": "application/json" } });
  const raw = res.data;

  return {
    id: raw.id,
    name: raw.name,
    category: { categoryName: raw.category?.categoryName || raw.categoryName || "Unknown" },
    brand: { name: raw.brand?.name || raw.brandName || "Unknown" },
    initialPrice: raw.initialPrice ?? 0,
    skus: raw.skus || [],
    images: raw.images || [],
  };
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSku, setActiveSku] = useState<SKU | null>(null);
  const [expandedSupplier, setExpandedSupplier] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);

  // Fetch product suppliers who have ordered this product
  const { data: productSuppliers, isLoading: isLoadingProductSuppliers } = useQuery({
    queryKey: ["productSuppliers", id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}/suppliers`);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  // Fetch latest prices from all suppliers for this product
  const { data: latestPrices, isLoading: isLoadingLatestPrices } = useQuery({
    queryKey: ["latestPrices", id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}/latest-prices`);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  // Fetch supplier price history when a supplier is expanded
  const { data: supplierPriceHistory, isLoading: isLoadingPriceHistory } = useQuery({
    queryKey: ["supplierPriceHistory", id, expandedSupplier],
    queryFn: async () => {
      if (!expandedSupplier) return [];
      const response = await api.get(`/supplier-price-history?productId=${id}&supplierId=${expandedSupplier}`);
      return response.data.data || [];
    },
    enabled: !!id && !!expandedSupplier,
  });

  // Fetch adjustments for this product (for the adjustment table)
  const { data: adjustments, isLoading: isLoadingAdjustments } = useQuery({
    queryKey: ["productAdjustments", id],
    queryFn: async () => {
      const response = await api.get(`/adjustments/product/${id}`);
      console.log("Adjustments response:", response.data); // Debug log
      return response.data || [];
    },
    enabled: !!id,
  });

  // Get latest price for selected supplier
  const getSelectedSupplierPrice = (supplierId: number) => {
    if (!latestPrices) return null;
    const supplierPrice = latestPrices.find((price: LatestPrice) => price.supplierId === supplierId);
    return supplierPrice?.latestPrice || null;
  };

  // Get all recent adjustments for the adjustment table
  const getAllProductAdjustments = () => {
    if (!adjustments) return [];
    
    console.log("Raw adjustments data:", adjustments); // Debug log
    
    // Ensure adjustments is an array - handle different API response structures
    const adjustmentsArray = Array.isArray(adjustments) ? adjustments : 
                             Array.isArray(adjustments.data) ? adjustments.data :
                             [];
    
    if (!Array.isArray(adjustmentsArray)) {
      console.warn("Adjustments data is not an array:", adjustments);
      return [];
    }
    
    // Process adjustments from the new API endpoint structure
    const processedAdjustments = adjustmentsArray.map((adj: any) => {
      console.log("Processing adjustment:", adj); // Debug log
      
      // Get adjustment quantity from the products array for this product
      const productData = adj.products?.find((p: any) => p.productId === Number(id));
      const quantity = productData?.quantity || 0;
      
      return {
        adjustmentId: adj.id,
        adjustmentDate: adj.date,
        quantityChange: quantity,
        adjustmentAction: adj.action,
      };
    })
    .filter((adj: any) => adj.adjustmentId) // Only show adjustments that have valid data
    .sort((a: any, b: any) => new Date(b.adjustmentDate).getTime() - new Date(a.adjustmentDate).getTime());
    
    console.log("Processed adjustments:", processedAdjustments); // Debug log
    
    return processedAdjustments;
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

  // set initial active SKU when product is loaded
  if (product && !activeSku && product.skus.length > 0) {
    setActiveSku(product.skus[0]);
  }

  if (isLoading || isLoadingProductSuppliers || isLoadingLatestPrices || isLoadingAdjustments) {
    return <div className="p-6">Loading product data...</div>;
  }
  
  if (error) return <div className="p-6 text-red-500">Failed to load product.</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  const images = product.images || [];
  const hasImages = images.length > 0;
  const currentImageUrl = hasImages
    ? `data:image/jpeg;base64,${bufferToBase64FromObject(images[currentImageIndex].url)}`
    : null;

  const formatPrice = (price: number) => new Intl.NumberFormat("id-ID").format(price);
  const allProductAdjustments = getAllProductAdjustments();

  return (
    <div className="p-6 space-y-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/product")}
        className="px-4 py-2 cursor-pointer"
      >
        <ArrowLeft /> Back
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
            onClick={() => navigate(`/product/edit/${id}`)}
          >
            <Pencil /> Edit
          </Button>

          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mb-2">
            {product.category?.categoryName || "No Category"} -{" "}
            {product.brand?.name || "No Brand"}
          </p>

          {/* Price Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Supplier for Price:</label>
            <select 
              value={selectedSupplier || ''} 
              onChange={(e) => setSelectedSupplier(e.target.value ? Number(e.target.value) : null)}
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="">Base Price</option>
              {latestPrices?.map((priceData: LatestPrice) => (
                <option key={priceData.supplierId} value={priceData.supplierId}>
                  {priceData.supplierName} - Rp {formatPrice(priceData.latestPrice)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-3xl text-[#209ebb] font-extrabold">
            Rp {(() => {
              if (selectedSupplier) {
                const supplierPrice = getSelectedSupplierPrice(selectedSupplier);
                if (supplierPrice) {
                  return formatPrice(supplierPrice);
                }
              }
              return formatPrice(activeSku ? activeSku.salePrice : product.initialPrice ?? 0);
            })()}
          </p>

          {/* Supplier and Adjustment Tables Side by Side */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Supplier Table */}
            <div>
              <h2 className="font-semibold mb-3 text-lg">Suppliers & Price History</h2>
              <div className="border rounded-lg overflow-hidden">
                {productSuppliers && productSuppliers.length > 0 ? productSuppliers.map((supplier: ProductSupplier) => {
                  const latestPrice = latestPrices?.find((price: LatestPrice) => price.supplierId === supplier.supplierId);
                  
                  return (
                    <div key={supplier.supplierId} className="border-b last:border-b-0">
                      <div 
                        className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                        onClick={() => setExpandedSupplier(expandedSupplier === supplier.supplierId ? null : supplier.supplierId)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{supplier.supplierName}</div>
                          <div className="text-sm text-gray-600">
                            {latestPrice ? `Latest: Rp ${formatPrice(latestPrice.latestPrice)}` : 'No recent orders'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {supplier.totalOrders} orders • Avg: Rp {formatPrice(supplier.averagePrice)}
                          </div>
                        </div>
                        <div className="ml-2">
                          {expandedSupplier === supplier.supplierId ? 
                            <ChevronUp size={16} /> : 
                            <ChevronDown size={16} />
                          }
                        </div>
                      </div>
                      
                      {expandedSupplier === supplier.supplierId && (
                        <div className="px-4 py-2 bg-white">
                          <div className="text-sm font-medium mb-2">Price History:</div>
                          {isLoadingPriceHistory ? (
                            <div className="text-sm text-gray-500">Loading history...</div>
                          ) : supplierPriceHistory && supplierPriceHistory.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {supplierPriceHistory.slice(0, 5).map((order: SupplierPriceHistory) => (
                                <div key={order.orderId} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                  <div>
                                    <div className="font-medium">
                                      {new Date(order.orderDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {order.invoiceNumber}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">Rp {formatPrice(order.unitPrice)}</div>
                                    <div className="text-xs text-gray-600">
                                      Qty: {order.quantity}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {supplierPriceHistory.length > 5 && (
                                <div className="text-xs text-gray-500 text-center">
                                  And {supplierPriceHistory.length - 5} more orders...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">No Price History found</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No suppliers have ordered this product yet
                  </div>
                )}
              </div>
            </div>

            {/* Adjustment Table */}
            <div>
              <h2 className="font-semibold mb-3 text-lg">Recent Adjustments</h2>
              <div className="border rounded-lg overflow-hidden">
                {allProductAdjustments.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {allProductAdjustments.slice(0, 3).map((adjustment: any, index: number) => {
                      const getActionColor = (action: string) => {
                        switch (action.toLowerCase()) {
                          case 'purchase': return 'text-blue-600 bg-blue-50';
                          case 'sale': return 'text-green-600 bg-green-50';
                          case 'return': return 'text-orange-600 bg-orange-50';
                          case 'adjustment': return 'text-purple-600 bg-purple-50';
                          case 'in': return 'text-green-600 bg-green-50';
                          case 'out': return 'text-red-600 bg-red-50';
                          default: return 'text-gray-600 bg-gray-50';
                        }
                      };

                      return (
                        <div key={adjustment.adjustmentId} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(adjustment.adjustmentDate).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getActionColor(adjustment.adjustmentAction)}`}>
                                  {adjustment.adjustmentAction}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                  Qty: 
                                  <span className={`ml-1 font-medium ${
                                    adjustment.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {adjustment.quantityChange > 0 ? `+${adjustment.quantityChange}` : adjustment.quantityChange}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Navigate to stock page with analytics for this product
                                navigate(`/stock?productId=${id}&view=analytics`);
                              }}
                              className="p-2 h-8 w-8 hover:bg-gray-100"
                            >
                              <Eye size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {allProductAdjustments.length > 3 && (
                      <div className="p-3 bg-gray-50 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/stock?productId=${id}&view=analytics`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all {allProductAdjustments.length} adjustments
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No adjustments recorded for this product
                  </div>
                )}
              </div>
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
            <p>{activeSku?.skuDesc || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
