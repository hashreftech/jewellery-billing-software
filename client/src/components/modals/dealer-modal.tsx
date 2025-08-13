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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { validateGST, validatePhone } from "@/lib/utils";

const dealerSchema = z.object({
  name: z.string().min(1, "Dealer name is required"),
  phone: z.string().min(1, "Phone is required").refine(validatePhone, "Invalid phone number"),
  address: z.string().min(1, "Address is required"),
  gstNumber: z.string().min(1, "GST number is required").refine(validateGST, "Invalid GST number"),
  categories: z.array(z.string()).default([]),
});

type DealerFormData = z.infer<typeof dealerSchema>;

interface DealerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer?: any;
  mode?: "create" | "edit";
}

export default function DealerModal({
  open,
  onOpenChange,
  dealer,
  mode = "create",
}: DealerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");

  // Fetch product categories for dealer categories
  const { data: productCategories } = useQuery({
    queryKey: ["/api/product-categories"],
    retry: false,
  }) as { data: Array<{ id: number; name: string; code: string; hsnCode: string; taxPercentage: string }> | undefined };

  const form = useForm<DealerFormData>({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      gstNumber: "",
      categories: [],
    },
  });

  // Reset form when dealer data changes or modal opens
  useEffect(() => {
    if (open) {
      if (dealer && mode === "edit") {
        form.reset({
          name: dealer.name || "",
          phone: dealer.phone || "",
          address: dealer.address || "",
          gstNumber: dealer.gstNumber || "",
          categories: dealer.categories || [],
        });
      } else {
        form.reset({
          name: "",
          phone: "",
          address: "",
          gstNumber: "",
          categories: [],
        });
      }
    }
  }, [open, dealer, mode, form]);

  const watchedCategories = form.watch("categories");

  const createMutation = useMutation({
    mutationFn: async (data: DealerFormData) => {
      const response = await apiRequest("POST", "/api/dealers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dealer created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
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
        description: error.message || "Failed to create dealer",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DealerFormData) => {
      const response = await apiRequest("PUT", `/api/dealers/${dealer.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dealer updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
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
        description: error.message || "Failed to update dealer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DealerFormData) => {
    if (mode === "edit") {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addCategory = (category: string) => {
    const currentCategories = form.getValues("categories");
    if (!currentCategories.includes(category)) {
      form.setValue("categories", [...currentCategories, category]);
    }
  };

  const removeCategory = (category: string) => {
    const currentCategories = form.getValues("categories");
    form.setValue("categories", currentCategories.filter(c => c !== category));
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !watchedCategories.includes(newCategory.trim())) {
      addCategory(newCategory.trim());
      setNewCategory("");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Dealer" : "Add New Dealer"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dealer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter dealer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GST number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter complete address" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categories Section */}
            <div className="space-y-3">
              <FormLabel>Categories</FormLabel>
              
              {/* Selected Categories */}
              {watchedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeCategory(category)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Custom Category */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNewCategory())}
                />
                <Button type="button" variant="outline" onClick={addNewCategory}>
                  Add
                </Button>
              </div>

              {/* Available Product Categories */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Available product categories:</p>
                <div className="flex flex-wrap gap-2">
                  {productCategories && productCategories.length > 0 ? (
                    productCategories
                      .filter((cat) => !watchedCategories.includes(cat.name))
                      .map((category) => (
                        <Button
                          key={category.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCategory(category.name)}
                          className="text-xs"
                        >
                          + {category.name}
                        </Button>
                      ))
                  ) : (
                    <p className="text-sm text-gray-400">No product categories available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamp info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created Time:</span>
                  <p className="text-gray-500">
                    {mode === "edit" && dealer?.createdAt 
                      ? new Date(dealer.createdAt).toLocaleString()
                      : "Auto-set on creation"
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated Time:</span>
                  <p className="text-gray-500">
                    {mode === "edit" && dealer?.updatedAt
                      ? new Date(dealer.updatedAt).toLocaleString()
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
                {isLoading ? "Saving..." : mode === "edit" ? "Update Dealer" : "Save Dealer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
