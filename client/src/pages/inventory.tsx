import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import DataTable from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { StockMovement, Product } from "@shared/schema";

export default function Inventory() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stockMovements, isLoading: movementsLoading } = useQuery({
    queryKey: ["/api/stock-movements"],
    retry: false,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const getMovementTypeBadge = (type: string) => {
    return type === "in" ? (
      <Badge className="bg-green-100 text-green-800 flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" />
        Stock In
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 flex items-center">
        <TrendingDown className="w-3 h-3 mr-1" />
        Stock Out
      </Badge>
    );
  };

  const movementColumns = [
    {
      key: "product",
      label: "Product",
      render: (movement: StockMovement) => {
        const product = products?.find((p: Product) => p.id === movement.productId);
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{product?.name || "Unknown Product"}</div>
              <div className="text-sm text-gray-500">{product?.barcodeNumber}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Movement",
      render: (movement: StockMovement) => getMovementTypeBadge(movement.type),
    },
    {
      key: "weight",
      label: "Weight",
      render: (movement: StockMovement) => (
        <div className="font-medium">{Number(movement.weight).toFixed(2)}g</div>
      ),
    },
    {
      key: "rate",
      label: "Rate",
      render: (movement: StockMovement) => (
        <div className="font-medium">{formatCurrency(Number(movement.rateAtTime))}</div>
      ),
    },
    {
      key: "value",
      label: "Value",
      render: (movement: StockMovement) => (
        <div className="font-medium">
          {formatCurrency(Number(movement.weight) * Number(movement.rateAtTime))}
        </div>
      ),
    },
    {
      key: "reference",
      label: "Reference",
      render: (movement: StockMovement) => (
        <div className="text-sm text-gray-600">
          {movement.reference || "Manual Entry"}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (movement: StockMovement) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(movement.createdAt)}
        </div>
      ),
    },
  ];

  const productColumns = [
    {
      key: "product",
      label: "Product",
      render: (product: Product) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.barcodeNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "weight",
      label: "Weight",
      render: (product: Product) => (
        <div className="font-medium">{Number(product.weight).toFixed(2)}g</div>
      ),
    },
    {
      key: "currentStock",
      label: "Current Stock",
      render: (product: Product) => {
        // This would be calculated from stock movements in a real implementation
        const stockValue = Math.floor(Math.random() * 20) + 1; // Mock data
        return (
          <div className="flex items-center">
            <span className={`font-medium ${stockValue < 5 ? 'text-red-600' : stockValue < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
              {stockValue} pcs
            </span>
            {stockValue < 5 && (
              <Badge variant="destructive" className="ml-2 text-xs">Low Stock</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "estimatedValue",
      label: "Est. Value",
      render: (product: Product) => {
        // This would be calculated from current rates in a real implementation
        const estimatedValue = Number(product.weight) * 5000; // Mock calculation
        return (
          <div className="font-medium">{formatCurrency(estimatedValue)}</div>
        );
      },
    },
    {
      key: "lastMovement",
      label: "Last Movement",
      render: (product: Product) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(product.updatedAt)}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                <p className="text-gray-600 mt-1">Track stock movements and current inventory</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Total Stock In</h3>
                      <p className="text-2xl font-bold text-green-600">1,234.5g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Total Stock Out</h3>
                      <p className="text-2xl font-bold text-red-600">567.2g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Current Stock</h3>
                      <p className="text-2xl font-bold text-blue-600">667.3g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="movements" className="space-y-6">
              <TabsList>
                <TabsTrigger value="movements">Stock Movements</TabsTrigger>
                <TabsTrigger value="current">Current Stock</TabsTrigger>
              </TabsList>

              <TabsContent value="movements">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Movements</CardTitle>
                    <p className="text-sm text-gray-600">Track all inventory movements in and out</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable
                      columns={movementColumns}
                      data={stockMovements || []}
                      loading={movementsLoading}
                      emptyMessage="No stock movements found"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="current">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Stock Summary</CardTitle>
                    <p className="text-sm text-gray-600">Overview of current inventory levels</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable
                      columns={productColumns}
                      data={products || []}
                      loading={productsLoading}
                      emptyMessage="No products found"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
