import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import DataTable from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, PiggyBank, Users, CreditCard, Edit } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { SavingScheme, CustomerEnrollment, Customer } from "@shared/schema";

export default function SavingSchemes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<SavingScheme | null>(null);

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

  const { data: schemes, isLoading: schemesLoading } = useQuery<SavingScheme[]>({
    queryKey: ["/api/saving-schemes"],
    retry: false,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<CustomerEnrollment[]>({
    queryKey: ["/api/customer-enrollments"],
    retry: false,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    retry: false,
  });

  const queryClient = useQueryClient();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "Cancelled":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const schemeColumns = [
    {
      key: "scheme",
      label: "Scheme",
      render: (scheme: SavingScheme) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{scheme.schemeName}</div>
              <div className="text-sm text-gray-500">
                {scheme.totalMonths} months plan
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      render: (scheme: SavingScheme) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {scheme.description || "No description"}
        </div>
      ),
    },
    {
      key: "enrollments",
      label: "Enrollments",
      render: (scheme: SavingScheme) => {
        const schemeEnrollments = enrollments?.filter((e: CustomerEnrollment) => e.schemeId === scheme.id) || [];
        return (
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1 text-gray-400" />
            {schemeEnrollments.length} customers
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (scheme: SavingScheme) => (
        <div className="text-sm text-gray-600">
          {scheme.createdAt ? formatDateTime(scheme.createdAt.toString()) : 'N/A'}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (scheme: SavingScheme) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingScheme(scheme);
            setShowSchemeModal(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const enrollmentColumns = [
    {
      key: "customer",
      label: "Customer",
      render: (enrollment: CustomerEnrollment) => (
        <div>
          <div className="font-medium text-gray-900">Customer ID: {enrollment.customerId}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <CreditCard className="w-3 h-3 mr-1" />
            {enrollment.cardNumber}
          </div>
        </div>
      ),
    },
    {
      key: "scheme",
      label: "Scheme",
      render: (enrollment: CustomerEnrollment) => {
        const scheme = schemes?.find((s: SavingScheme) => s.id === enrollment.schemeId);
        return (
          <div>
            <div className="font-medium text-gray-900">{scheme?.schemeName || "Unknown Scheme"}</div>
            <div className="text-sm text-gray-500">{scheme?.totalMonths} months</div>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Monthly Amount",
      render: (enrollment: CustomerEnrollment) => (
        <div className="font-medium">{formatCurrency(Number(enrollment.monthlyAmount))}</div>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (enrollment: CustomerEnrollment) => (
        <div className="text-sm">{new Date(enrollment.startDate).toLocaleDateString()}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (enrollment: CustomerEnrollment) => getStatusBadge(enrollment.status),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (enrollment: CustomerEnrollment) => (
        <div className="text-sm text-gray-600">
          {enrollment.createdAt ? formatDateTime(enrollment.createdAt.toString()) : 'N/A'}
        </div>
      ),
    },
    {
      key: "updatedAt", 
      label: "Updated",
      render: (enrollment: CustomerEnrollment) => (
        <div className="text-sm text-gray-600">
          {enrollment.updatedAt ? formatDateTime(enrollment.updatedAt.toString()) : 'N/A'}
        </div>
      ),
    },
  ];

  // Create Saving Scheme mutation
  const createSchemeMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/saving-schemes", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Saving scheme created successfully" });
      setShowSchemeModal(false);
      setEditingScheme(null);
      queryClient.invalidateQueries({ queryKey: ["/api/saving-schemes"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create saving scheme", variant: "destructive" });
    },
  });

  // Create Customer Enrollment mutation
  const createEnrollmentMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/customer-enrollments", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Customer enrolled successfully" });
      setShowEnrollmentModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/customer-enrollments"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to enroll customer", variant: "destructive" });
    },
  });

  // Form handlers
  const handleCreateScheme = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      schemeName: formData.get("schemeName"),
      totalMonths: parseInt(formData.get("totalMonths") as string),
      description: formData.get("description"),
      termsAndConditions: formData.get("termsAndConditions"),
    };
    createSchemeMutation.mutate(data);
  };

  const handleCreateEnrollment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      customerId: parseInt(formData.get("customerId") as string),
      schemeId: parseInt(formData.get("schemeId") as string),
      monthlyAmount: formData.get("monthlyAmount"),
      startDate: formData.get("startDate"),
    };
    createEnrollmentMutation.mutate(data);
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
                <h1 className="text-3xl font-bold text-gray-900">Saving Schemes</h1>
                <p className="text-gray-600 mt-1">Manage customer saving plans and enrollments</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowSchemeModal(true)}
                  className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Scheme</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEnrollmentModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Enroll Customer</span>
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Active Schemes</h3>
                      <p className="text-2xl font-bold text-purple-600">{schemes?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Total Enrollments</h3>
                      <p className="text-2xl font-bold text-blue-600">{enrollments?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Monthly Collection</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          enrollments?.reduce((sum: number, e: CustomerEnrollment) => 
                            sum + Number(e.monthlyAmount || 0), 0
                          ) || 0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="schemes" className="space-y-6">
              <TabsList>
                <TabsTrigger value="schemes">Schemes</TabsTrigger>
                <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              </TabsList>

              <TabsContent value="schemes">
                <Card>
                  <CardHeader>
                    <CardTitle>All Saving Schemes</CardTitle>
                    <p className="text-sm text-gray-600">Manage available saving schemes for customers</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable
                      columns={schemeColumns}
                      data={schemes || []}
                      loading={schemesLoading}
                      emptyMessage="No saving schemes found"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enrollments">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Enrollments</CardTitle>
                    <p className="text-sm text-gray-600">Track customer participation in saving schemes</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable
                      columns={enrollmentColumns}
                      data={enrollments || []}
                      loading={enrollmentsLoading}
                      emptyMessage="No enrollments found"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Saving Scheme Modal */}
            <Dialog open={showSchemeModal} onOpenChange={setShowSchemeModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingScheme ? "Edit Scheme" : "Create New Saving Scheme"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateScheme} className="space-y-4">
                  <div>
                    <Label htmlFor="schemeName">Scheme Name *</Label>
                    <Input
                      id="schemeName"
                      name="schemeName"
                      defaultValue={editingScheme?.schemeName || ""}
                      placeholder="e.g., 11-Month Gold Plan"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalMonths">Total Months *</Label>
                    <Input
                      id="totalMonths"
                      name="totalMonths"
                      type="number"
                      min="1"
                      max="60"
                      defaultValue={editingScheme?.totalMonths || 11}
                      placeholder="11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingScheme?.description || ""}
                      placeholder="Brief description of the scheme"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                    <Textarea
                      id="termsAndConditions"
                      name="termsAndConditions"
                      defaultValue={editingScheme?.termsAndConditions || ""}
                      placeholder="Detailed terms and conditions"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowSchemeModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSchemeMutation.isPending}>
                      {createSchemeMutation.isPending ? "Creating..." : "Create Scheme"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Customer Enrollment Modal */}
            <Dialog open={showEnrollmentModal} onOpenChange={setShowEnrollmentModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Enroll Customer in Saving Scheme</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEnrollment} className="space-y-4">
                  <div>
                    <Label htmlFor="customerId">Customer *</Label>
                    <Select name="customerId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer: Customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} ({customer.customerId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="schemeId">Saving Scheme *</Label>
                    <Select name="schemeId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemes?.map((scheme: SavingScheme) => (
                          <SelectItem key={scheme.id} value={scheme.id.toString()}>
                            {scheme.schemeName} ({scheme.totalMonths} months)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="monthlyAmount">Monthly Amount (₹) *</Label>
                    <Input
                      id="monthlyAmount"
                      name="monthlyAmount"
                      type="number"
                      min="100"
                      step="0.01"
                      placeholder="5000.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowEnrollmentModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEnrollmentMutation.isPending}>
                      {createEnrollmentMutation.isPending ? "Enrolling..." : "Enroll Customer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
