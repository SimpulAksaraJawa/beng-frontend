import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import axios from "@/api/axios";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Tooltip, CircularProgress, Alert, Button } from "@mui/material";
import { Card } from "@/components/ui/card";
import { 
  IconEye, 
  IconChartBar,
  IconChevronUp, 
  IconAdjustments
} from "@tabler/icons-react";

interface Product {
  productId: number;
  productName: string;
  unit: string;
  costPrice: number;
  [key: string]: any;
}

interface Stock {
  stockId: number;
  productId: number;
  stockCurrent: number;
  costOfGoodsSold: number;
  unitPrice: number;
  [key: string]: any;
}

interface StockAnalytics {
  currentStock: number;
  productName: string;
  soldUnits: number;
  averageUnitPrice: number;
  costOfGoodsSold: number;
}

interface StockLog {
  stockLogId: number;
  productId: number;
  quantityChange: number;
  unitPrice: number;
  costOfGoodsSold: number;
  totalValue: number;
  movementDate: string;
  referenceId: number;
  referenceType: string;
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    analytics: StockAnalytics;
    logs: StockLog[];
  };
}

export default function StockInventoryPage() {
  const navigate = useNavigate();
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  // Analytics data query for the expanded product
  const { 
    data: analyticsData, 
    isLoading: isLoadingAnalytics,
    error: analyticsError 
  } = useQuery<AnalyticsResponse>({
    queryKey: ["stockAnalytics", expandedProductId],
    queryFn: async () => {
      try {
        if (!expandedProductId) throw new Error("No product ID selected");
        const response = await axios.get(`/stocks/analytics/${expandedProductId}`);
        console.log("Stock analytics response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching stock analytics:", error);
        throw error;
      }
    },
    enabled: expandedProductId !== null, // Only fetch when a product is selected
  });

  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await axios.get("/products");
        
        // Handle different response formats
        if (response.data?.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          return response.data.products;
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching products");
        return [];
      }
    },
  });
  
  // Ensure products is an array
  const products = Array.isArray(productsData) ? productsData : [];

  const { 
    data: stocksData, 
    isLoading: isLoadingStocks, 
    error: stocksError 
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      try {
        const response = await axios.get("/stocks");
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          return response.data;
        } else {
          console.error("Unexpected stocks API response format");
          return [];
        }
      } catch (error) {
        console.error("Error fetching stocks");
        return [];
      }
    },
  });

  // Ensure stocks is an array
  const stocks = Array.isArray(stocksData) ? stocksData : [];

  // Extract unique product IDs from stocks for batch fetching
  const uniqueProductIds = [...new Set(stocks.map(stock => stock.productId))];
  
  // Fetch individual product details using a single hook call
  const individualProductQueries = useQueries({
    queries: uniqueProductIds.map(productId => ({
      queryKey: ["product", productId],
      queryFn: async () => {
        try {
          const response = await axios.get(`/products/${productId}`);
          
          // Handle various response formats
          if (response.data?.success && response.data.data) {
            return response.data.data;
          } else if (typeof response.data === "object" && !Array.isArray(response.data)) {
            return response.data;
          } else {
            return null;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}`);
          return null;
        }
      },
      enabled: productId !== null && productId !== undefined,
    })),
  });
  
  // Keep a batch query as a fallback
  const { data: allProductsData } = useQuery({
    queryKey: ["allProductDetails"],
    queryFn: async () => {
      try {
        const response = await axios.get("/products");
        
        let allProducts;
        if (response.data?.success && Array.isArray(response.data.data)) {
          allProducts = response.data.data;
        } else if (Array.isArray(response.data)) {
          allProducts = response.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          allProducts = response.data.products;
        } else {
          allProducts = [];
        }
        
        return allProducts;
      } catch (error) {
        console.error("Error fetching product details");
        return [];
      }
    },
    enabled: stocks.length > 0,
  });
  
  const allProductDetails = allProductsData || [];
  
  // Create a product details map from all the individual queries
  const productDetailsMap = uniqueProductIds.reduce((map, productId, index) => {
    const queryResult = individualProductQueries[index];
    if (queryResult?.data) {
      map[productId] = queryResult.data;
    }
    return map;
  }, {} as Record<number, any>);

  const stockData = stocks.map((stock: Stock) => {
    try {
      // First try to get the product from our direct API calls
      const productId = Number(stock.productId);
      const productFromDirectQuery = productDetailsMap[productId];
      
      // If not found, fall back to the products list or allProductDetails
      const product = productFromDirectQuery || 
                      products.find((p: Product) => Number(p.productId) === productId) || 
                      allProductDetails.find((p: Product) => Number(p.productId) === productId);
      
      // Extract product name - handle different response structures
      let productName = `Product ID: ${stock.productId}`;
      let productUnit = "Unit";
      let productCost = 0;
      
      if (product) {
        if (product.productName) {
          productName = product.productName;
        } else if (product.name) {
          productName = product.name;
        }
        
        productUnit = product.unit || product.unitType || "Unit";
        productCost = Number(product.costPrice) || Number(product.cost) || 0;
      }
      
      // Calculate total worth (stockCurrent × unitPrice)
      const stockCurrent = Number(stock.stockCurrent) || 0;
      const unitPrice = Number(stock.unitPrice) || 0;
      const totalWorth = stockCurrent * unitPrice;
      
      return {
        ...stock,
        id: stock.stockId,
        productName: productName,
        productUnit: productUnit,
        productCost: productCost,
        totalWorth: totalWorth,
        stockCurrent: stockCurrent,
        unitPrice: unitPrice,
        costOfGoodsSold: Number(stock.costOfGoodsSold) || 0,
      };
    } catch (error) {
      return {
        ...stock,
        id: stock.stockId || Math.random().toString(),
        productName: `Product ID: ${stock.productId}`,
        productUnit: "Unit",
        productCost: 0,
        totalWorth: 0,
        stockCurrent: Number(stock.stockCurrent) || 0,
        unitPrice: Number(stock.unitPrice) || 0,
        costOfGoodsSold: Number(stock.costOfGoodsSold) || 0,
      };
    }
  });

  // Create a backup data array as fallback
  const fallbackData = stocks.map((stock: Stock) => {
    const productId = Number(stock.productId);
    const product = productDetailsMap[productId] || 
                    products.find((p: any) => Number(p.productId) === productId) || 
                    allProductDetails.find((p: any) => Number(p.productId) === productId);
    
    let productName = `Product ID: ${stock.productId}`;
    let productUnit = "Unit";
    
    if (product) {
      productName = product.productName || product.name || productName;
      productUnit = product.unit || product.unitType || "Unit";
    }
    
    return {
      id: stock.stockId,
      stockId: stock.stockId,
      productId: stock.productId,
      stockCurrent: Number(stock.stockCurrent) || 0,
      unitPrice: Number(stock.unitPrice) || 0,
      costOfGoodsSold: Number(stock.costOfGoodsSold) || 0,
      totalWorth: (Number(stock.stockCurrent) || 0) * (Number(stock.unitPrice) || 0),
      productName: productName,
      productUnit: productUnit
    };
  });
  
  // Use stock data if available, otherwise fallback data
  const dataToDisplay = stockData.length > 0 ? stockData : (fallbackData.length > 0 ? fallbackData : []);
  const columns: GridColDef[] = [
    {
      field: "productName",
      headerName: "Product Name",
      flex: 2,
      renderCell: (params: GridRenderCellParams) => {
        try {
          const productName = params.row.productName;
          const productId = params.row.productId;
          return (
            <Tooltip title={productName || productId}>
              <span>{productName || productId}</span>
            </Tooltip>
          );
        } catch (error) {
          return <span>Error</span>;
        }
      },
    },
    {
      field: "stockCurrent",
      headerName: "Quantity",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        try {
          const value = params.row.stockCurrent;
          const unit = params.row.productUnit || "Unit";
          return <span>{value} {unit}</span>;
        } catch (error) {
          return <span>0 Unit</span>;
        }
      },
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        try {
          const value = Number(params.row.unitPrice) || 0;
          return <span>Rp. {value.toLocaleString()}</span>;
        } catch (error) {
          return <span>Rp. 0</span>;
        }
      },
    },
    {
      field: "totalWorth",
      headerName: "Total Worth",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        try {
          const value = Number(params.row.totalWorth) || 
                      (Number(params.row.stockCurrent) * Number(params.row.unitPrice));
          return <span>Rp. {value.toLocaleString()}</span>;
        } catch (error) {
          return <span>Rp. 0</span>;
        }
      },
    },
    {
      field: "costOfGoodsSold",
      headerName: "COGS",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        try {
          const value = Number(params.row.costOfGoodsSold) || 0;
          return <span>Rp. {value.toLocaleString()}</span>;
        } catch (error) {
          return <span>Rp. 0</span>;
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      maxWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        try {
          const productId = params.row.productId;
          if (!productId) {
            return <Box sx={{ display: "block" }}><Button variant="text" size="small" disabled><IconEye size={18} /></Button></Box>;
          }
          
          const isExpanded = expandedProductId === productId;
          
          return (
            <Box sx={{ display: "flex", gap: 0.2, alignItems: "center" }}>
              <Tooltip title="View Product Details">
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  style={{ minWidth: "30px", padding: "4px" }}
                  onClick={() => navigate(`/product/${productId}`)}
                >
                  <IconEye size={18} />
                </Button>
              </Tooltip>
              <Tooltip title={isExpanded ? "Hide Analytics" : "Show Analytics"}>
                <Button
                  variant="text"
                  size="small"
                  color={isExpanded ? "primary" : "secondary"}
                  style={{ minWidth: "30px", padding: "4px" }}
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedProductId(null);
                    } else {
                      setExpandedProductId(productId);
                    }
                  }}
                >
                  {isExpanded ? <IconChevronUp size={18} /> : <IconChartBar size={18} />}
                </Button>
              </Tooltip>
            </Box>
          );
        } catch (error) {
          return <Box sx={{ display: "block" }}><Button variant="text" size="small" disabled><IconEye size={18} /></Button></Box>;
        }
      },
    },
  ];

  // Check if any individual product queries are still loading
  const isAnyProductQueryLoading = individualProductQueries.some(query => query.isLoading);
  const hasAnyProductQueryError = individualProductQueries.some(query => !!query.error);
  
  // Check for loading and error states
  const isLoading = isLoadingProducts || isLoadingStocks || isAnyProductQueryLoading;
  const hasError = productsError || stocksError || hasAnyProductQueryError;

  return (
    <div className="p-6 w-[100%] mx-auto">
      <SiteHeader />
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Stock Inventory</h1>
          {isLoading && <span className="text-gray-500 ml-2">(Loading...)</span>}
        </div>
        <div className="space-x-2">
          <Tooltip title="Adjust Stock">
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<IconAdjustments size={18} />}
              onClick={() => navigate("/adjustment/new")}
            >
              Adjust Stock
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">There was a problem loading the stock data. Please try refreshing the page.</p>
        </div>
      )}
      
      {!isLoading && !hasError && dataToDisplay.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 mb-4 rounded">
          <p className="font-medium">No stock data available</p>
          <p className="text-sm">There are currently no stock entries in the database.</p>
        </div>
      )}
      
      
      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={dataToDisplay}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          loading={isLoading}
          getRowId={(row) => row.id || row.stockId}
          sx={{
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              lineHeight: "1.5",
              padding: "8px"
            }
          }}
        />
      </Box>
      
      {/* Product Analytics Section */}
      {expandedProductId && (
        <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {isLoadingAnalytics ? "Loading Analytics..." : `Product Analytics: ${analyticsData?.data?.analytics?.productName || `ID: ${expandedProductId}`}`}
            </h2>
            <Tooltip title="Close Analytics">
              <Button 
                size="small" 
                variant="outlined"
                color="secondary"
                onClick={() => setExpandedProductId(null)}
                startIcon={<IconChevronUp size={20} />}
              >
                Close
              </Button>
            </Tooltip>
          </div>
          
          {isLoadingAnalytics && (
            <div className="flex justify-center p-8">
              <CircularProgress />
            </div>
          )}
          
          {analyticsError && (
            <Alert severity="error" className="mb-4">
              Failed to load analytics data. Please try again.
            </Alert>
          )}
          
          {!isLoadingAnalytics && !analyticsError && analyticsData?.data?.analytics && (
            <>
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="font-medium mb-2">Current Stock</div>
                  <div className="text-2xl font-bold">{analyticsData.data.analytics.currentStock}</div>
                </Card>
                <Card className="p-4">
                  <div className="font-medium mb-2">Units Sold</div>
                  <div className="text-2xl font-bold">{analyticsData.data.analytics.soldUnits}</div>
                </Card>
                <Card className="p-4">
                  <div className="font-medium mb-2">Average Price</div>
                  <div className="text-2xl font-bold">Rp. {analyticsData.data.analytics.averageUnitPrice.toLocaleString()}</div>
                </Card>
                <Card className="p-4">
                  <div className="font-medium mb-2">Cost of Goods Sold</div>
                  <div className="text-2xl font-bold">Rp. {analyticsData.data.analytics.costOfGoodsSold.toLocaleString()}</div>
                </Card>
                <Card className="p-4">
                  <div className="font-medium mb-2">Current Value</div>
                  <div className="text-2xl font-bold">
                    Rp. {(analyticsData.data.analytics.currentStock * analyticsData.data.analytics.averageUnitPrice).toLocaleString()}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="font-medium mb-2">Movement Count</div>
                  <div className="text-2xl font-bold">{analyticsData.data.logs?.length || 0}</div>
                </Card>
              </div>
              
              {/* Movement History Table */}
              {analyticsData.data.logs && analyticsData.data.logs.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-lg mb-4">Stock Movement History</h3>
                  <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      rows={analyticsData.data.logs}
                      columns={[
                        {
                          field: "movementDate",
                          headerName: "Date",
                          flex: 1,
                          renderCell: (params: any) => {
                            const date = new Date(params.row.movementDate).toLocaleDateString();
                            const time = new Date(params.row.movementDate).toLocaleTimeString();
                            return <span>{date} {time}</span>;
                          },
                        },
                        {
                          field: "quantityChange",
                          headerName: "Quantity Change",
                          flex: 1,
                          renderCell: (params: any) => {
                            const value = params.row.quantityChange;
                            const isPositive = value > 0;
                            return (
                              <span className={isPositive ? "text-green-600" : "text-red-600"}>
                                {value > 0 ? `+${value}` : value}
                              </span>
                            );
                          },
                        },
                        {
                          field: "unitPrice",
                          headerName: "Unit Price",
                          flex: 1,
                          renderCell: (params: any) => {
                            const value = Number(params.row.unitPrice) || 0;
                            return <span>Rp. {value.toLocaleString()}</span>;
                          },
                        },
                        {
                          field: "totalValue",
                          headerName: "Total Value",
                          flex: 1,
                          renderCell: (params: any) => {
                            const value = Number(params.row.totalValue) || 0;
                            return <span>Rp. {value.toLocaleString()}</span>;
                          },
                        },
                        {
                          field: "referenceType",
                          headerName: "Reference",
                          flex: 1,
                          renderCell: (params: any) => {
                            const type = params.row.referenceType;
                            const id = params.row.referenceId;
                            return <span>{type} #{id}</span>;
                          },
                        },
                      ]}
                      getRowId={(row) => row.stockLogId}
                      disableRowSelectionOnClick
                      initialState={{
                        pagination: { paginationModel: { pageSize: 5 } },
                      }}
                      pageSizeOptions={[5, 10, 25]}
                    />
                  </Box>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}