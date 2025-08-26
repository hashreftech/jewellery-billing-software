import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/layout";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Gem, 
  DollarSign, 
  Package, 
  Download, 
  Plus, 
  UserPlus, 
  QrCode, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import CustomerModal from "@/components/modals/customer-modal";
import ProductModal from "@/components/modals/product-modal";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Redirect to home if not authenticated
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

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/purchase-orders"],
    retry: false,
  });

  // Mock low stock data - would come from API in real implementation
  const lowStockItems = [
    {
      id: 1,
      name: "Gold Chain 22K - GLD001",
      stock: 2,
      level: "critical"
    },
    {
      id: 2, 
      name: "Silver Necklace - SLV015",
      stock: 5,
      level: "warning"
    },
    {
      id: 3,
      name: "Diamond Ring - DMD008", 
      stock: 3,
      level: "low"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "Pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockBadgeColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "low":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your jewelry shop operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
              </Button>
              <Button className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4" />
                <span>New Order</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Customers"
              value={(stats as any)?.totalCustomers || 0}
              icon={Users}
              iconColor="bg-blue-500"
              change="+12%"
              changeType="positive"
              loading={statsLoading}
            />
            <StatsCard
              title="Total Products"
              value={(stats as any)?.totalProducts || 0}
              icon={Gem}
              iconColor="bg-gold-500"
              change="+5%"
              changeType="positive"
              loading={statsLoading}
            />
            <StatsCard
              title="Monthly Sales"
              value={formatCurrency((stats as any)?.monthlySales || 0)}
              icon={DollarSign}
              iconColor="bg-green-500"
              change="+18%"
              changeType="positive"
              loading={statsLoading}
            />
            <StatsCard
              title="Stock Value"
              value={formatCurrency((stats as any)?.stockValue || 0)}
              icon={Package}
              iconColor="bg-purple-500"
              change="-2%"
              changeType="negative"
              loading={statsLoading}
            />
          </div>

          {/* Recent Orders Table */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Latest customer orders and their status</p>
                </div>
                <Button variant="link" className="text-primary-600 hover:text-primary-900">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading orders...
                        </TableCell>
                      </TableRow>
                    ) : !recentOrders || (recentOrders as any[]).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      (recentOrders as any[]).slice(0, 5).map((order: any) => (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gray-300 text-gray-700">
                                  {getInitials(order.customer?.name || "Unknown")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{order.customer?.name || "Unknown"}</div>
                                <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {Array.isArray(order.products) 
                              ? order.products.map((p: any) => p.name).join(", ")
                              : "No products"
                            }
                          </TableCell>
                          <TableCell>{formatCurrency(Number(order.totalAmount) || 0)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDateTime(order.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <Button variant="link" className="text-primary-600 hover:text-primary-900">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Low Stock Alert */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-16"
                    onClick={() => setShowCustomerModal(true)}
                  >
                    <UserPlus className="w-5 h-5 text-primary-500" />
                    <span>Add Customer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-16"
                    onClick={() => setShowProductModal(true)}
                  >
                    <Gem className="w-5 h-5 text-gold-500" />
                    <span>Add Product</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-16"
                    onClick={() => toast({ title: "Coming Soon", description: "Barcode scanning will be implemented" })}
                  >
                    <QrCode className="w-5 h-5 text-blue-500" />
                    <span>Scan Barcode</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-16"
                    onClick={() => toast({ title: "Coming Soon", description: "Price update feature will be implemented" })}
                  >
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Update Prices</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Low Stock Alert</CardTitle>
                <p className="text-sm text-gray-600">Products running low on inventory</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {lowStockItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`px-6 py-4 flex items-center justify-between ${
                        index < lowStockItems.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.level === 'critical' ? 'bg-red-100' :
                          item.level === 'warning' ? 'bg-yellow-100' : 'bg-orange-100'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${
                            item.level === 'critical' ? 'text-red-500' :
                            item.level === 'warning' ? 'text-yellow-500' : 'text-orange-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Only {item.stock} pieces left</p>
                        </div>
                      </div>
                      <span className={`font-medium ${getStockBadgeColor(item.level)}`}>
                        {item.stock} pcs
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modals */}
          <CustomerModal 
            open={showCustomerModal} 
            onOpenChange={setShowCustomerModal}
          />
          <ProductModal 
            open={showProductModal} 
            onOpenChange={setShowProductModal}
          />
    </Layout>
  );
}
