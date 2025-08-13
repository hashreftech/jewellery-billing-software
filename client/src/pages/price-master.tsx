import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PriceUpdateModal from "@/components/modals/price-update-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, DollarSign, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PriceMaster, ProductCategory } from "@shared/schema";

interface PriceMasterRow {
  date: string;
  categories: Record<string, {
    id?: number;
    categoryId: number;
    pricePerGram: number | null;
  }>;
  createdAt?: string;
}

interface CategoryPrice {
  categoryId: number;
  categoryName: string;
  pricePerGram: number | null;
  effectiveDate: string | null;
  id: number | null;
}

export default function PriceMaster() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Get product categories
  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
    retry: false,
  });

  // Get current effective prices for all categories
  const { data: currentPrices, isLoading: currentPricesLoading, error: currentPricesError } = useQuery({
    queryKey: ["/api/price-master/current"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/price-master/current");
      return await res.json();
    },
    retry: false,
    enabled: isAuthenticated, // Only run when authenticated
  });

  // Get price master data with pagination
  const { data: prices, isLoading: pricesLoading, refetch } = useQuery<PriceMasterRow[]>({
    queryKey: ["/api/price-master"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/price-master?offset=${offset}&limit=30`);
      return await res.json();
    },
    retry: false,
  });

  // Get prices for selected date
  const { data: dateSpecificPrices, isLoading: dateLoading } = useQuery<CategoryPrice[]>({
    queryKey: ["/api/price-master", selectedDate],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/price-master/${selectedDate}`);
      return await res.json();
    },
    retry: false,
    enabled: !!selectedDate,
  });

  // Mutation for creating/updating prices (kept for potential future use)
  const createPriceMutation = useMutation({
    mutationFn: async (priceData: any) => {
      return apiRequest("POST", "/api/price-master", priceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-master"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-master/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-master", selectedDate] });
      toast({
        title: "Success",
        description: "Price updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      });
    },
  });

  const loadMore = () => {
    setOffset(prev => prev + 1);
  };

  const handleRefresh = () => {
    setOffset(0);
    refetch();
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const openPriceModal = () => {
    setIsModalOpen(true);
  };

  const renderPriceCell = (date: string, category: ProductCategory, price: any) => {
    const currentPrice = price?.pricePerGram;
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;

    return (
      <div className="flex items-center justify-center p-2">
        <span className={`text-sm ${currentPrice ? 'font-medium' : 'text-gray-400'}`}>
          {currentPrice ? formatCurrency(currentPrice) : "—"}
        </span>
        {isToday && (
          <div className="ml-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Today's price" />
          </div>
        )}
      </div>
    );
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Price Master</h1>
                <p className="text-gray-600 mt-1">Manage daily gold prices by category (today's prices only)</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
                <Button
                  onClick={openPriceModal}
                  disabled={currentPricesLoading}
                  className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Update Today's Prices</span>
                </Button>
              </div>
            </div>

            {/* Current Effective Prices */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <CardTitle>Current Effective Prices</CardTitle>
                </div>
                <p className="text-sm text-gray-600">Current effective prices for all categories (today's price or last available)</p>
              </CardHeader>
              <CardContent>
                {currentPricesLoading ? (
                  <div className="text-center py-4">Loading current prices...</div>
                ) : currentPricesError ? (
                  <div className="text-center py-4 text-red-600">
                    Error loading current prices: {currentPricesError.message}
                  </div>
                ) : !currentPrices || currentPrices.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No price data available. Add some prices to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentPrices.map((priceInfo: any) => (
                      <Card key={priceInfo.categoryId} className={`p-4 ${priceInfo.isToday ? 'border-green-500 bg-green-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-600">
                            {priceInfo.categoryName}
                          </div>
                          {priceInfo.isToday && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Updated today" />
                          )}
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {priceInfo.currentPrice ? formatCurrency(priceInfo.currentPrice) : "No price set"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {priceInfo.effectiveDate ? (
                            <>
                              {priceInfo.isToday ? 'Updated today' : `Since ${new Date(priceInfo.effectiveDate).toLocaleDateString()}`}
                            </>
                          ) : (
                            "Never updated"
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date Specific Prices */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <CardTitle>Prices for Specific Date</CardTitle>
                  </div>
                  <Input
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <p className="text-sm text-gray-600">View and edit prices for a specific date</p>
              </CardHeader>
              <CardContent>
                {dateLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dateSpecificPrices?.map((price: CategoryPrice) => (
                      <Card key={price.categoryId} className="p-4">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {price.categoryName}
                        </div>
                        <div className="text-lg font-bold">
                          {price.pricePerGram ? formatCurrency(price.pricePerGram) : "No price set"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {price.effectiveDate ? `Since ${new Date(price.effectiveDate).toLocaleDateString()}` : "Never updated"}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Master Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <CardTitle>Price History Table</CardTitle>
                </div>
                <p className="text-sm text-gray-600">Historical price data with categories as columns (Only today's prices are editable - marked with green dots)</p>
              </CardHeader>
              <CardContent className="p-0">
                {pricesLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Date</th>
                          {categories?.map((category: ProductCategory) => (
                            <th key={category.id} className="text-center p-4 font-medium text-gray-900">
                              {category.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {prices?.map((row: PriceMasterRow, index: number) => (
                          <tr key={row.date} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{new Date(row.date).toLocaleDateString()}</span>
                              </div>
                            </td>
                            {categories?.map((category: ProductCategory) => (
                              <td key={category.id} className="p-4 text-center">
                                {renderPriceCell(row.date, category, row.categories[category.name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Load More Button */}
                    <div className="border-t p-4 text-center">
                      <Button
                        onClick={loadMore}
                        variant="outline"
                        className="w-full"
                      >
                        Show More Days
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Section */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Category-Based Pricing</h3>
                    <p className="text-gray-600 mb-4">
                      Prices are managed per category and date. The system automatically falls back to the last available price if no price is set for a specific date.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-1">How it works:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• <strong>Today's prices only:</strong> You can only edit prices for today's date (marked with green dot)</li>
                        <li>• Prices are effective from the date you set them</li>
                        <li>• If no price exists for a date, the system uses the last available price</li>
                        <li>• Each category can have different prices for the same date</li>
                        <li>• All changes are tracked with timestamps</li>
                        <li>• Historical prices are locked and cannot be modified</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <PriceUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories || []}
        currentPrices={currentPrices || []}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
