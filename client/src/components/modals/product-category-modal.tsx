import { useEffect } from "react";
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

// Form schema for validation
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  code: z.string().min(1, "Category code is required"),
  taxPercentage: z.string().min(1, "Tax percentage is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, "Tax percentage must be between 0 and 100"),
  hsnCode: z.string().min(1, "HSN code is required"),
});

// This is the type we use within the form component
type CategoryFormData = z.infer<typeof categorySchema>;

// This is the type we send to the API after transformation
interface CategoryApiData {
  name: string;
  code: string;
  taxPercentage: number;
  hsnCode: string;
}

interface ProductCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  mode?: "create" | "edit";
}

export default function ProductCategoryModal({
  open,
  onOpenChange,
  category,
  mode = "create",
}: ProductCategoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      code: "",
      taxPercentage: "",
      hsnCode: "",
    },
  });

  // Reset form when category data changes or modal opens
  useEffect(() => {
    if (open) {
      if (category && mode === "edit") {
        form.reset({
          name: category.name || "",
          code: category.code || "",
          taxPercentage: category.taxPercentage ? String(category.taxPercentage) : "",
          hsnCode: category.hsnCode || "",
        });
      } else {
        form.reset({
          name: "",
          code: "",
          taxPercentage: "",
          hsnCode: "",
        });
      }
    }
  }, [open, category, mode, form]);

  // Jewel types query removed as it's no longer needed

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      // Transform the form data into the API format
      const transformedData: CategoryApiData = {
        name: data.name,
        code: data.code,
        taxPercentage: parseFloat(data.taxPercentage),
        hsnCode: data.hsnCode,
      };
      const response = await apiRequest("POST", "/api/product-categories", transformedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
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
        description: error.message || "Failed to create product category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      // Transform the form data into the API format
      const transformedData: CategoryApiData = {
        name: data.name,
        code: data.code,
        taxPercentage: parseFloat(data.taxPercentage),
        hsnCode: data.hsnCode,
      };
      const response = await apiRequest("PUT", `/api/product-categories/${category.id}`, transformedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product category updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
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
        description: error.message || "Failed to update product category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (mode === "edit") {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Product Category" : "Add New Product Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Gold Jewelry 22K" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., GOLD_JEWELRY_22K" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Percentage *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="3.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hsnCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HSN Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="7113" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* JewelType field has been removed */}

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
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : mode === "edit" ? "Update Category" : "Save Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}