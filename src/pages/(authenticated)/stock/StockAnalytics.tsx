import React from "react";
import { Box, Tooltip, CircularProgress, Alert, Button } from "@mui/material";
import { Card } from "@/components/ui/card";
import { IconChevronUp } from "@tabler/icons-react";
import { DataGrid } from "@mui/x-data-grid";

// Types
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

interface StockAnalyticsProps {
  expandedProductId: number;
  analyticsData: AnalyticsResponse | undefined;
  isLoadingAnalytics: boolean;
  analyticsError: unknown;
  onClose: () => void;
}

const StockAnalyticsComponent: React.FC<StockAnalyticsProps> = ({
  expandedProductId,
  analyticsData,
  isLoadingAnalytics,
  analyticsError,
  onClose,
}) => {
  return (
    <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {isLoadingAnalytics
            ? "Loading Analytics..."
            : `Product Analytics: ${
                analyticsData?.data?.analytics?.productName ||
                `ID: ${expandedProductId}`
              }`}
        </h2>
        <Tooltip title="Close Analytics">
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={onClose}
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

      {analyticsError ? (
        <Alert severity="error" className="mb-4">
          Failed to load analytics data. Please try again.
        </Alert>
      ) : null}

      {!isLoadingAnalytics &&
        !analyticsError &&
        analyticsData?.data?.analytics && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="font-medium mb-2">Current Stock</div>
                <div className="text-2xl font-bold">
                  {analyticsData.data.analytics.currentStock}
                </div>
              </Card>
              <Card className="p-4">
                <div className="font-medium mb-2">Units Sold</div>
                <div className="text-2xl font-bold">
                  {analyticsData.data.analytics.soldUnits}
                </div>
              </Card>
              <Card className="p-4">
                <div className="font-medium mb-2">Average Price</div>
                <div className="text-2xl font-bold">
                  Rp.{" "}
                  {analyticsData.data.analytics.averageUnitPrice.toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="font-medium mb-2">Cost of Goods Sold</div>
                <div className="text-2xl font-bold">
                  Rp.{" "}
                  {analyticsData.data.analytics.costOfGoodsSold.toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="font-medium mb-2">Current Value</div>
                <div className="text-2xl font-bold">
                  Rp.{" "}
                  {(
                    analyticsData.data.analytics.currentStock *
                    analyticsData.data.analytics.averageUnitPrice
                  ).toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="font-medium mb-2">Movement Count</div>
                <div className="text-2xl font-bold">
                  {analyticsData.data.logs?.length || 0}
                </div>
              </Card>
            </div>

            {/* Movement History Table */}
            {analyticsData.data.logs && analyticsData.data.logs.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-lg mb-4">
                  Stock Movement History
                </h3>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    sx={{
                      fontFamily: "Outfit, sans-serif",

                      "& .MuiDataGrid-columnHeader": {
                        backgroundColor: "rgba(32, 158, 187, 0.8) !important",
                        color: "#FFF !important",
                      },
                      // Alternating row colors
                      "& .MuiDataGrid-row:nth-of-type(odd)": {
                        backgroundColor: "oklch(0.6478 0.1098 218.2180 /5%)",
                      },
                      "& .MuiDataGrid-row:nth-of-type(even)": {
                        backgroundColor: "#ffffff",
                      },

                      // Optional: keep hover highlight consistent
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "oklch(0.6478 0.1098 218.2180 /10%)",
                      },
                    }}
                    rows={analyticsData.data.logs}
                    columns={[
                      {
                        field: "movementDate",
                        headerName: "Date",
                        flex: 1,
                        renderCell: (params: any) => {
                          const date = new Date(
                            params.row.movementDate
                          ).toLocaleDateString();
                          const time = new Date(
                            params.row.movementDate
                          ).toLocaleTimeString();
                          return (
                            <span>
                              {date} {time}
                            </span>
                          );
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
                            <span
                              className={
                                isPositive ? "text-green-600" : "text-red-600"
                              }
                            >
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
                          return (
                            <span>
                              {type} #{id}
                            </span>
                          );
                        },
                      },
                    ]}
                    getRowId={(row) => row.stockLogId}
                    disableRowSelectionOnClick
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    showToolbar
                  />
                </Box>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default StockAnalyticsComponent;
