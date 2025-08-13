import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, FileText, BarChart3, TrendingUp, Users, Package } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedDealer, setSelectedDealer] = useState("");

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

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    retry: false,
  });

  const { data: dealers } = useQuery({
    queryKey: ["/api/dealers"],
    retry: false,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/purchase-orders"],
    retry: false,
  });

  const { data: stockMovements } = useQuery({
    queryKey: ["/api/stock-movements"],
    retry: false,
  });

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Coming Soon",
      description: `${reportType} export functionality will be implemented`,
    });
  };

  const generateSalesReport = () => {
    if (!orders) return [];
    
    return orders.slice(0, 10).map((order: any) => ({
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || "Unknown",
      amount: Number(order.totalAmount || 0),
      status: order.status,
      date: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  };

  const generateStockReport = () => {
    if (!stockMovements) return { stockIn: [], stockOut: [] };
    
    const stockIn = stockMovements.filter((m: any) => m.type === "in").slice(0, 5);
    const stockOut = stockMovements.filter((m: any) => m.type === "out").slice(0, 5);
    
    return { stockIn, stockOut };
  };

  const salesData = generateSalesReport();
  const stockData = generateStockReport();

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
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600 mt-1">Generate comprehensive business reports</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Monthly Sales</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.monthlySales || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-gold-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Stock Value</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.stockValue || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Tabs */}
            <Tabs defaultValue="sales" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sales">Sales Report</TabsTrigger>
                <TabsTrigger value="stock">Stock Report</TabsTrigger>
                <TabsTrigger value="customer">Customer Report</TabsTrigger>
                <TabsTrigger value="valuation">Valuation Report</TabsTrigger>
              </TabsList>

              {/* Sales Report */}
              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Sales Report</CardTitle>
                        <p className="text-sm text-gray-600">Track sales performance and revenue</p>
                      </div>
                      <Button
                        onClick={() => handleExportReport("Sales Report")}
                        className="flex items-center space-x-2"
                        variant="outline"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label htmlFor="from-date">From Date</Label>
                        <Input
                          id="from-date"
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="to-date">To Date</Label>
                        <Input
                          id="to-date"
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Customer</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                          <SelectTrigger>
                            <SelectValue placeholder="All customers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All customers</SelectItem>
                            {customers?.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Sales Data */}
                    <div className="space-y-4">
                      {salesData.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Order Number</th>
                                <th className="text-left py-2">Customer</th>
                                <th className="text-left py-2">Amount</th>
                                <th className="text-left py-2">Status</th>
                                <th className="text-left py-2">Created</th>
                                <th className="text-left py-2">Updated</th>
                              </tr>
                            </thead>
                            <tbody>
                              {salesData.map((sale, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2 font-medium">{sale.orderNumber}</td>
                                  <td className="py-2">{sale.customerName}</td>
                                  <td className="py-2">{formatCurrency(sale.amount)}</td>
                                  <td className="py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                      sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {sale.status}
                                    </span>
                                  </td>
                                  <td className="py-2 text-sm text-gray-600">
                                    {formatDateTime(sale.createdAt)}
                                  </td>
                                  <td className="py-2 text-sm text-gray-600">
                                    {formatDateTime(sale.updatedAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">No sales data found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stock Report */}
              <TabsContent value="stock">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Stock In/Out Report</CardTitle>
                        <p className="text-sm text-gray-600">Track inventory movements</p>
                      </div>
                      <Button
                        onClick={() => handleExportReport("Stock Report")}
                        className="flex items-center space-x-2"
                        variant="outline"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Stock In */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-700">Stock In</h3>
                        <div className="space-y-2">
                          {stockData.stockIn.length > 0 ? (
                            stockData.stockIn.map((movement: any, index: number) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">Product ID: {movement.productId}</p>
                                    <p className="text-sm text-gray-600">Weight: {Number(movement.weight).toFixed(2)}g</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(Number(movement.rateAtTime))}</p>
                                    <p className="text-sm text-gray-600">{formatDateTime(movement.createdAt)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No stock in movements</p>
                          )}
                        </div>
                      </div>

                      {/* Stock Out */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-red-700">Stock Out</h3>
                        <div className="space-y-2">
                          {stockData.stockOut.length > 0 ? (
                            stockData.stockOut.map((movement: any, index: number) => (
                              <div key={index} className="p-3 bg-red-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">Product ID: {movement.productId}</p>
                                    <p className="text-sm text-gray-600">Weight: {Number(movement.weight).toFixed(2)}g</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(Number(movement.rateAtTime))}</p>
                                    <p className="text-sm text-gray-600">{formatDateTime(movement.createdAt)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No stock out movements</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Customer Report */}
              <TabsContent value="customer">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Customer Report</CardTitle>
                        <p className="text-sm text-gray-600">Customer order history and analytics</p>
                      </div>
                      <Button
                        onClick={() => handleExportReport("Customer Report")}
                        className="flex items-center space-x-2"
                        variant="outline"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Report</h3>
                      <p className="text-gray-600">
                        Detailed customer analysis and order history will be available here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Valuation Report */}
              <TabsContent value="valuation">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Valuation Report</CardTitle>
                        <p className="text-sm text-gray-600">Current vs historical inventory valuation</p>
                      </div>
                      <Button
                        onClick={() => handleExportReport("Valuation Report")}
                        className="flex items-center space-x-2"
                        variant="outline"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Valuation Analysis</h3>
                      <p className="text-gray-600">
                        Comprehensive valuation reports comparing original vs current market values.
                      </p>
                    </div>
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
