import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout/layout";
import DataTable from "@/components/ui/data-table";
import ProductModal from "@/components/modals/product-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Package, QrCode } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { Product } from "@shared/schema";

export default function Products() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/products", { search: searchQuery }],
    enabled: searchQuery.length > 0,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDeletingProduct(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      "No stone": "bg-gray-100 text-gray-800",
      "Stone": "bg-blue-100 text-blue-800", 
      "Diamond Stone": "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const columns = [
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
            <div className="flex items-center text-sm text-gray-500">
              <QrCode className="w-3 h-3 mr-1" />
              {product.barcodeNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (product: Product) => getTypeBadge(product.type),
    },
    {
      key: "weight",
      label: "Weight",
      render: (product: Product) => (
        <div className="text-sm">
          <div className="font-medium">{Number(product.weight).toFixed(2)}g</div>
          {product.stoneWeight && (
            <div className="text-gray-500">Stone: {Number(product.stoneWeight).toFixed(2)}g</div>
          )}
        </div>
      ),
    },
    {
      key: "charges",
      label: "Charges",
      render: (product: Product) => (
        <div className="text-sm space-y-1">
          {product.makingChargeValue && (
            <div>
              Making: {product.makingChargeType === "Percentage" ? `${product.makingChargeValue}%` : 
                      product.makingChargeType === "Per Gram" ? `₹${product.makingChargeValue}/g` :
                      formatCurrency(Number(product.makingChargeValue))}
            </div>
          )}
          {product.wastageChargeValue && (
            <div className="text-gray-600">
              Wastage: {product.wastageChargeType === "Percentage" ? `${product.wastageChargeValue}%` :
                       product.wastageChargeType === "Per Gram" ? `₹${product.wastageChargeValue}/g` :
                       formatCurrency(Number(product.wastageChargeValue))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (product: Product) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(product.createdAt)}
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (product: Product) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(product.updatedAt)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (product: Product) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(product)}
            className="text-primary-600 hover:text-primary-900"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const displayData = searchQuery.length > 0 ? searchResults : products;
  const isLoadingData = searchQuery.length > 0 ? searchLoading : productsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your jewelry inventory</p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products by name or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={displayData || []}
                  loading={isLoadingData}
                  emptyMessage="No products found"
                />
              </CardContent>
            </Card>
          </div>

          {/* Product Modal */}
          <ProductModal
            open={showModal}
            onOpenChange={setShowModal}
            product={editingProduct}
            mode={editingProduct ? "edit" : "create"}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
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
    </Layout>
  );
}
