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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Tag, ShieldAlert } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ProductCategory } from "@shared/schema";
import { PROTECTED_CATEGORY_CODES } from "@shared/constants";
import ProductCategoryModal from "@/components/modals/product-category-modal";

export default function ProductCategories() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null);

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

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/product-categories"],
    retry: false,
  }) as { data: ProductCategory[], isLoading: boolean };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await apiRequest("DELETE", `/api/product-categories/${id}`);
      } catch (error: any) {
        // Check if the error is related to protected categories
        if (error.message && typeof error.message === 'string' && 
            (error.message.includes("protected") || (error.data && error.data.message && error.data.message.includes("protected")))) {
          throw new Error(error.message || (error.data && error.data.message) || "This category is protected and cannot be deleted");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
      setDeletingCategory(null);
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
      // Check if this is our protected category error
      if (error.message && error.message.includes("protected")) {
        toast({
          title: "Protected Category",
          description: error.message,
          variant: "destructive",
        });
        setDeletingCategory(null);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete product category",
        variant: "destructive",
      });
    },
  });

  const columns = [
    {
      key: "details",
      label: "Category Details", 
      render: (category: any) => {
        const isProtected = PROTECTED_CATEGORY_CODES.includes(category.code);
        
        return (
          <div className="space-y-1">
            <div className="font-medium flex items-center">
              {category.name}
              {isProtected && (
                <Badge className="ml-2 bg-amber-100 text-amber-800 flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Protected</span>
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Code: {category.code}</div>
          </div>
        );
      },
    },
    {
      key: "tax",
      label: "Tax & HSN",
      render: (category: any) => {
        return (
          <div className="space-y-1">
            <Badge variant="secondary">{category.taxPercentage}% Tax</Badge>
            <div className="text-sm text-muted-foreground">HSN: {category.hsnCode}</div>
          </div>
        );
      },
    },
    {
      key: "created",
      label: "Created",
      render: (category: any) => formatDateTime(category.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (category: any) => {
        const isProtected = PROTECTED_CATEGORY_CODES.includes(category.code);
        
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCategory(category);
                setShowModal(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {isProtected ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Protected categories cannot be deleted"
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingCategory(category)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading || categoriesLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
              <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-amber-800">Protected Categories</h3>
                <p className="text-sm text-amber-700">
                  The following categories are essential for system operations and cannot be deleted: 
                  Diamond, Gold 22k, Gold 18k, and Silver. You can edit their properties but not remove them.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
                <p className="text-muted-foreground">
                  Manage product categories with tax and HSN configurations
                </p>
              </div>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Categories ({categories.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={categories}
                />
              </CardContent>
            </Card>
          </div>

          {/* Product Category Modal */}
          <ProductCategoryModal 
            open={showModal} 
            onOpenChange={(open) => {
              setShowModal(open);
              if (!open) setEditingCategory(null);
            }} 
            category={editingCategory}
            mode={editingCategory ? "edit" : "create"}
          />

          <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}