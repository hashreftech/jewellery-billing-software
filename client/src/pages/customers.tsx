import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import DataTable from "@/components/ui/data-table";
import CustomerModal from "@/components/modals/customer-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";
import type { Customer } from "@shared/schema";

export default function Customers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

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

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
    retry: false,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/customers", { search: searchQuery }],
    enabled: searchQuery.length > 0,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/customers/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDeletingCustomer(null);
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
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (customer: Customer) => {
    setDeletingCustomer(customer);
  };

  const confirmDelete = () => {
    if (deletingCustomer) {
      deleteMutation.mutate(deletingCustomer.id);
    }
  };

  const columns = [
    {
      key: "customer",
      label: "Customer",
      render: (customer: Customer) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.customerId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (customer: Customer) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            {customer.phone}
          </div>
          {customer.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (customer: Customer) => (
        <div className="space-y-1 text-sm">
          {customer.gstNumber && (
            <div>
              <span className="font-medium">GST:</span> {customer.gstNumber}
            </div>
          )}
          {customer.panCard && (
            <div>
              <span className="font-medium">PAN:</span> {customer.panCard}
            </div>
          )}
          {customer.anniversary && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              Anniversary: {new Date(customer.anniversary).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (customer: Customer) => (
        <div className="text-sm text-gray-600">
          {customer.createdAt ? formatDateTime(customer.createdAt) : "N/A"}
        </div>
      ),
    },
    {
      key: "updatedAt", 
      label: "Updated",
      render: (customer: Customer) => (
        <div className="text-sm text-gray-600">
          {customer.updatedAt ? formatDateTime(customer.updatedAt) : "N/A"}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer: Customer) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(customer)}
            className="text-primary-600 hover:text-primary-900"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(customer)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const displayData = searchQuery.length > 0 ? searchResults : customers;
  const isLoadingData = searchQuery.length > 0 ? searchLoading : customersLoading;

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
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600 mt-1">Manage your customer database</p>
              </div>
              <Button
                onClick={() => {
                  setEditingCustomer(null);
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search customers by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Customers</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={displayData || []}
                  loading={isLoadingData}
                  emptyMessage="No customers found"
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        open={showModal}
        onOpenChange={setShowModal}
        customer={editingCustomer}
        mode={editingCustomer ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCustomer?.name}"? This action cannot be undone.
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
