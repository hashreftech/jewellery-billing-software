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
import { QrCode, Info } from "lucide-react";
import { generateBarcode } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  barcodeNumber: z.string().min(1, "Barcode number is required"),
  type: z.enum(["No stone", "Stone", "Diamond Stone"], {
    required_error: "Product type is required",
  }),
  stoneWeight: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Stone weight must be a valid positive number"),
  dealerId: z.string().min(1, "Dealer is required"),
  netWeight: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Net weight must be a valid positive number"),
  grossWeight: z.string().min(1, "Gross weight is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Gross weight must be a positive number"),
  makingChargeType: z.enum(["Percentage", "Fixed Amount", "Per Gram"]).optional(),
  makingChargeValue: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Making charge must be a valid positive number"),
  wastageChargeType: z.enum(["Percentage", "Fixed Amount", "Per Gram", "Per Piece"]).optional(),
  wastageChargeValue: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Wastage charge must be a valid positive number"),
  centralGovtNumber: z.string().optional(),
  categoryId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  mode?: "create" | "edit";
}

export default function ProductModal({
  open,
  onOpenChange,
  product,
  mode = "create",
}: ProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      barcodeNumber: generateBarcode(),
      type: "No stone",
      stoneWeight: "",
      dealerId: "",
      netWeight: "",
      grossWeight: "",
      makingChargeType: undefined,
      makingChargeValue: "",
      wastageChargeType: undefined,
      wastageChargeValue: "",
      centralGovtNumber: "",
      categoryId: "",
    },
  });

  // Reset form when product data changes or modal opens  
  useEffect(() => {
    if (open) {
      if (product && mode === "edit") {
        const grossWeight = product.grossWeight || 0;
        const stoneWeight = product.stoneWeight || 0;
        const calculatedNetWeight = Math.max(0, grossWeight - stoneWeight);
        
        form.reset({
          name: product.name || "",
          barcodeNumber: product.barcodeNumber || "",
          type: product.type || "No stone",
          stoneWeight: product.stoneWeight ? String(product.stoneWeight) : "",
          dealerId: product.dealerId ? String(product.dealerId) : "",
          netWeight: calculatedNetWeight.toFixed(3),
          grossWeight: product.grossWeight ? String(product.grossWeight) : "",
          makingChargeType: product.makingChargeType || undefined,
          makingChargeValue: product.makingChargeValue ? String(product.makingChargeValue) : "",
          wastageChargeType: product.wastageChargeType || undefined,
          wastageChargeValue: product.wastageChargeValue ? String(product.wastageChargeValue) : "",
          centralGovtNumber: product.centralGovtNumber || "",
          categoryId: product.categoryId ? String(product.categoryId) : "",
        });
      } else {
        form.reset({
          name: "",
          barcodeNumber: generateBarcode(),
          type: "No stone",
          stoneWeight: "",
          dealerId: "",
          netWeight: "",
          grossWeight: "",
          makingChargeType: undefined,
          makingChargeValue: "",
          wastageChargeType: undefined,
          wastageChargeValue: "",
          centralGovtNumber: "",
          categoryId: "",
        });
      }
    }
  }, [open, product, mode, form]);

  // Helper function to calculate and update net weight
  const calculateNetWeight = (grossWeightValue?: string, stoneWeightValue?: string) => {
    const gross = parseFloat(grossWeightValue || "0");
    const stone = parseFloat(stoneWeightValue || "0");
    
    console.log(`🧮 Calculating Net Weight: ${gross}g - ${stone}g = ${Math.max(0, gross - stone)}g`);
    
    if (gross >= 0) {
      setIsCalculating(true);
      const netWeight = Math.max(0, gross - stone);
      form.setValue("netWeight", netWeight.toFixed(3), { shouldValidate: true });
      
      // Remove the highlight after a short delay
      setTimeout(() => {
        setIsCalculating(false);
      }, 300);
    }
  };

  // Auto-calculate net weight when gross weight or stone weight changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "grossWeight" || name === "stoneWeight") {
        calculateNetWeight(value.grossWeight, value.stoneWeight);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const { data: dealers } = useQuery<any[]>({
    queryKey: ["/api/dealers"],
    retry: false,
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/product-categories"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const transformedData = {
        ...data,
        dealerId: parseInt(data.dealerId),
        categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
        netWeight: data.netWeight ? parseFloat(data.netWeight) : 0,
        grossWeight: parseFloat(data.grossWeight),
        stoneWeight: data.stoneWeight ? parseFloat(data.stoneWeight) : undefined,
        makingChargeValue: data.makingChargeValue ? parseFloat(data.makingChargeValue) : undefined,
        wastageChargeValue: data.wastageChargeValue ? parseFloat(data.wastageChargeValue) : undefined,
      };
      const response = await apiRequest("POST", "/api/products", transformedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const transformedData = {
        ...data,
        dealerId: parseInt(data.dealerId),
        categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
        netWeight: data.netWeight ? parseFloat(data.netWeight) : 0,
        grossWeight: parseFloat(data.grossWeight),
        stoneWeight: data.stoneWeight ? parseFloat(data.stoneWeight) : undefined,
        makingChargeValue: data.makingChargeValue ? parseFloat(data.makingChargeValue) : undefined,
        wastageChargeValue: data.wastageChargeValue ? parseFloat(data.wastageChargeValue) : undefined,
      };
      const response = await apiRequest("PUT", `/api/products/${product.id}`, transformedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (mode === "edit") {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const generateNewBarcode = () => {
    form.setValue("barcodeNumber", generateBarcode());
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gold Chain 22K" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcodeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode Number *</FormLabel>
                    <FormControl>
                      <div className="flex rounded-md shadow-sm">
                        <Input
                          placeholder="Auto-generated or scan"
                          className="flex-1 rounded-r-none"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-l-none border-l-0"
                          onClick={generateNewBarcode}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="No stone">No Stone</SelectItem>
                        <SelectItem value="Stone">Stone</SelectItem>
                        <SelectItem value="Diamond Stone">Diamond Stone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grossWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Weight (grams) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001" 
                        placeholder="0.000" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Trigger calculation on every keystroke
                          const stoneWeight = form.getValues("stoneWeight");
                          calculateNetWeight(e.target.value, stoneWeight);
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          // Trigger calculation on blur/mouse out
                          const stoneWeight = form.getValues("stoneWeight");
                          calculateNetWeight(e.target.value, stoneWeight);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stoneWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stone Weight (grams)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001" 
                        placeholder="0.000" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Trigger calculation on every keystroke
                          const grossWeight = form.getValues("grossWeight");
                          calculateNetWeight(grossWeight, e.target.value);
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          // Trigger calculation on blur/mouse out
                          const grossWeight = form.getValues("grossWeight");
                          calculateNetWeight(grossWeight, e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="netWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Weight (grams) - Auto Calculated</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001" 
                        placeholder="0.000" 
                        {...field} 
                        readOnly 
                        className={`bg-gray-50 cursor-not-allowed transition-all duration-300 ${
                          isCalculating ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                        }`}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Calculated as: Gross Weight - Stone Weight
                      {isCalculating && (
                        <span className="text-blue-600 ml-2 font-medium">
                          ✓ Updated!
                        </span>
                      )}
                      {(() => {
                        const gross = parseFloat(form.watch("grossWeight") || "0");
                        const stone = parseFloat(form.watch("stoneWeight") || "0");
                        if (gross > 0 || stone > 0) {
                          return (
                            <span className="block text-xs text-blue-600 mt-1">
                              Example: {gross.toFixed(3)}g - {stone.toFixed(3)}g = {Math.max(0, gross - stone).toFixed(3)}g
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dealerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dealer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dealer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dealers?.map((dealer: any) => (
                          <SelectItem key={dealer.id} value={dealer.id.toString()}>
                            {dealer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="makingChargeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Making Charge Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                        <SelectItem value="Per Gram">Per Gram</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="makingChargeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Making Charge Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wastageChargeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wastage Charge Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                        <SelectItem value="Per Gram">Per Gram</SelectItem>
                        <SelectItem value="Per Piece">Per Piece</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wastageChargeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wastage Charge Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="centralGovtNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Central Government Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter central government number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price calculation info */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Price Calculation</p>
                  <p className="text-blue-700">
                    Product prices are calculated dynamically at order time using current rates from Price Master. 
                    No fixed price is stored.
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamp info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created Time:</span>
                  <p className="text-gray-500">
                    {mode === "edit" && product?.createdAt 
                      ? new Date(product.createdAt).toLocaleString()
                      : "Auto-set on creation"
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated Time:</span>
                  <p className="text-gray-500">
                    {mode === "edit" && product?.updatedAt
                      ? new Date(product.updatedAt).toLocaleString()
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
                className="bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : mode === "edit" ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
