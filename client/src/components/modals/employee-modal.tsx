import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validatePhone, validateEmail } from "@/lib/utils";

// Base schema for both create and edit modes
const baseEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required").refine(validatePhone, "Invalid phone number"),
  email: z.string().optional().refine((email) => !email || validateEmail(email), "Invalid email"),
  role: z.enum(["admin", "manager", "staff"], {
    required_error: "Role is required",
  }),
  photo: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

// Schema for creating new employee (password required, empCode auto-generated)
const createEmployeeSchema = baseEmployeeSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for editing employee (password optional, empCode required for display)
const editEmployeeSchema = baseEmployeeSchema.extend({
  empCode: z.string().min(1, "Employee code is required"),
  password: z.string().optional(),
});

// Union type for form data - dynamic based on mode
type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>;
type EmployeeFormData = CreateEmployeeFormData | EditEmployeeFormData;

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
  mode?: "create" | "edit";
}

export default function EmployeeModal({
  open,
  onOpenChange,
  employee,
  mode = "create",
}: EmployeeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nextEmpCode, setNextEmpCode] = useState<string>("");

  // Query to get next employee code for create mode
  const { data: nextCodeData } = useQuery<{empCode: string}>({
    queryKey: ["/api/employees/next-code"],
    enabled: open && mode === "create",
    retry: false,
  });

  // Set up form with dynamic resolver and default values
  const form = useForm({
    resolver: zodResolver(mode === "edit" ? editEmployeeSchema : createEmployeeSchema),
    defaultValues: mode === "edit" 
      ? {
          empCode: "",
          name: "",
          phone: "",
          email: "",
          role: "staff",
          photo: "",
          password: "",
          status: "Active",
        }
      : {
          name: "",
          phone: "",
          email: "",
          role: "staff",
          photo: "",
          password: "",
          status: "Active",
        },
  });

  // Reset form when employee data changes or modal opens
  useEffect(() => {
    if (open) {
      if (employee && mode === "edit") {
        form.reset({
          empCode: employee.empCode || "",
          name: employee.name || "",
          phone: employee.phone || "",
          email: employee.email || "",
          role: employee.role || "staff",
          photo: employee.photo || "",
          password: "", // Always require password input for security
          status: employee.status || "Active",
        });
      } else if (mode === "create") {
        // For create mode, set the next employee code when available
        const empCode = nextCodeData?.empCode || "";
        setNextEmpCode(empCode);
        form.reset({
          name: "",
          phone: "",
          email: "",
          role: "staff",
          photo: "",
          password: "",
          status: "Active",
        });
      }
    }
  }, [open, employee, mode, form, nextCodeData]);

  const createMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await apiRequest("POST", "/api/employees", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      onOpenChange(false);
      form.reset();
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
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      // Remove password from data if it's empty (keep existing password)
      const updateData: Partial<EmployeeFormData> = { ...data };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }
      
      const response = await apiRequest("PUT", `/api/employees/${employee.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      onOpenChange(false);
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
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (mode === "edit") {
      updateMutation.mutate(data as EditEmployeeFormData);
    } else {
      createMutation.mutate(data as CreateEmployeeFormData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Show auto-generated employee code info for create mode */}
            {mode === "create" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-blue-800">
                    Employee Code: 
                  </div>
                  <div className="text-sm font-mono text-blue-900 bg-blue-100 px-2 py-1 rounded">
                    {nextEmpCode || "Generating..."}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This code will be automatically assigned to the new employee
                </p>
              </div>
            )}

            <div className={`grid gap-4 ${mode === "edit" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {/* Show employee code as disabled field only for edit mode */}
              {mode === "edit" && (
                <FormField
                  control={form.control}
                  name="empCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {mode === "create" ? "*" : ""}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={mode === "edit" ? "Enter new password" : "Enter password"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  {mode === "edit" && (
                    <p className="text-xs text-gray-500">Leave blank to keep current password</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter photo URL (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Timestamp info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created Time:</span>
                  <p className="text-gray-500">
                    {mode === "edit" && employee?.createdAt 
                      ? new Date(employee.createdAt).toLocaleString()
                      : "Auto-set on creation"
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated Time:</span>
                  <p className="text-gray-500">
                    {mode === "edit" && employee?.updatedAt
                      ? new Date(employee.updatedAt).toLocaleString()
                      : "Auto-updated on changes"
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : mode === "edit" ? "Update Employee" : "Save Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
