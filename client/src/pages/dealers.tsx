import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import DataTable from "@/components/ui/data-table";
import DealerModal from "@/components/modals/dealer-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Phone, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Dealer } from "@shared/schema";

export default function Dealers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);

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

  const { data: dealers, isLoading: dealersLoading } = useQuery({
    queryKey: ["/api/dealers"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/dealers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dealer deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      setDeletingDealer(null);
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
        description: error.message || "Failed to delete dealer",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setShowModal(true);
  };

  const handleDelete = (dealer: Dealer) => {
    setDeletingDealer(dealer);
  };

  const confirmDelete = () => {
    if (deletingDealer) {
      deleteMutation.mutate(deletingDealer.id);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Dealer Name",
      render: (dealer: Dealer) => (
        <div>
          <div className="font-medium text-gray-900">{dealer.name}</div>
          <div className="text-sm text-gray-500">GST: {dealer.gstNumber}</div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (dealer: Dealer) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            {dealer.phone}
          </div>
          <div className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{dealer.address}</span>
          </div>
        </div>
      ),
    },
    {
      key: "categories",
      label: "Categories",
      render: (dealer: Dealer) => (
        <div className="flex flex-wrap gap-1">
          {dealer.categories && dealer.categories.length > 0 ? (
            dealer.categories.map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No categories</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (dealer: Dealer) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(dealer.createdAt)}
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (dealer: Dealer) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(dealer.updatedAt)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (dealer: Dealer) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(dealer)}
            className="text-primary-600 hover:text-primary-900"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(dealer)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
                <h1 className="text-3xl font-bold text-gray-900">Dealers</h1>
                <p className="text-gray-600 mt-1">Manage your supplier network</p>
              </div>
              <Button
                onClick={() => {
                  setEditingDealer(null);
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dealer</span>
              </Button>
            </div>

            {/* Dealers Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Dealers</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={dealers || []}
                  loading={dealersLoading}
                  emptyMessage="No dealers found"
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dealer Modal */}
      <DealerModal
        open={showModal}
        onOpenChange={setShowModal}
        dealer={editingDealer}
        mode={editingDealer ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDealer} onOpenChange={() => setDeletingDealer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dealer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDealer?.name}"? This action cannot be undone.
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
