import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import DataTable from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { formatDateTime, formatCurrency, getInitials } from "@/lib/utils";
import CreatePurchaseOrderModal from "@/components/modals/create-purchase-order-modal";
import type { PurchaseOrder } from "@shared/schema";

// Define extended interface for orders with items
interface PurchaseOrderWithDetails extends PurchaseOrder {
  products?: any[];
  overallDiscount?: string;
}

export default function PurchaseOrders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [deletingOrder, setDeletingOrder] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/purchase-orders"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/purchase-orders/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setDeletingOrder(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete purchase order",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (order: PurchaseOrder) => {
    setDeletingOrder(order);
  };

  const confirmDelete = () => {
    if (deletingOrder) {
      deleteMutation.mutate(deletingOrder.id);
    }
  };

  const columns = [
    {
      key: "orderNumber",
      label: "Order Number",
      render: (order: PurchaseOrder) => (
        <div className="font-medium">{order.orderNumber}</div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (order: PurchaseOrder) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {getInitials("Customer Name")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">Customer #{order.customerId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order: PurchaseOrder) => (
        <Badge variant={
          order.status === "completed" ? "default" :
          order.status === "pending" ? "secondary" :
          order.status === "cancelled" ? "destructive" : "outline"
        }>
          {order.status}
        </Badge>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (order: PurchaseOrderWithDetails) => (
        <div className="flex flex-col gap-1">
          {Array.isArray((order as any).products) ? (
            <>
              {(order as any).products.slice(0, 2).map((product: any, index: number) => (
                <div key={index} className="text-sm text-gray-600">
                  {product.name || `Product ${index + 1}`}
                </div>
              ))}
              {(order as any).products.length > 2 && (
                <div className="text-gray-500">+{(order as any).products.length - 2} more</div>
              )}
            </>
          ) : (
            <div className="text-gray-500">No products</div>
          )}
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (order: PurchaseOrder) => (
        <div className="text-right">
          <div className="font-medium">
            {formatCurrency(Number(order.totalAmount))}
          </div>
          {(order as any).overallDiscount && Number((order as any).overallDiscount) > 0 && (
            <div className="text-sm text-green-600">
              Discount: {formatCurrency(Number((order as any).overallDiscount))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "orderDate",
      label: "Order Date",
      render: (order: PurchaseOrder) => (
        <div className="text-sm text-gray-600">
          {new Date(order.orderDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (order: PurchaseOrder) => (
        <div className="text-sm text-gray-600">
          {order.createdAt ? formatDateTime(order.createdAt.toString()) : 'N/A'}
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (order: PurchaseOrder) => (
        <div className="text-sm text-gray-600">
          {order.updatedAt ? formatDateTime(order.updatedAt.toString()) : 'N/A'}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: PurchaseOrder) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(order)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
                <p className="text-gray-600">Manage purchase orders and track inventory procurement</p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Purchase Order
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="spinner mx-auto mb-4"></div>
                    <p>Loading purchase orders...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={Array.isArray(orders) ? orders : []}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Create Purchase Order Modal */}
      <CreatePurchaseOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingOrder} 
        onOpenChange={(open) => !open && setDeletingOrder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order{" "}
              <strong>{deletingOrder?.orderNumber}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
