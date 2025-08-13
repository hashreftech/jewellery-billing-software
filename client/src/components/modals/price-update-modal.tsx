import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Save, X, TrendingUp } from "lucide-react";
import type { ProductCategory } from "@shared/schema";
import { set } from "date-fns";

interface PriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategory[];
  currentPrices: any[];
  onSuccess?: () => void;
}

interface PriceFormData {
  [categoryId: string]: string;
}

export default function PriceUpdateModal({
  isOpen,
  onClose,
  categories,
  currentPrices,
  onSuccess,
}: PriceUpdateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState<PriceFormData>({});
  const [autoCalculated, setAutoCalculated] = useState<Set<string>>(new Set());

  // Find Gold 22K and Gold 18K categories
  const gold22KCategory = categories.find(cat => cat.name.includes('Gold 22K'));
  const gold18KCategory = categories.find(cat => cat.name.includes('Gold 18K'));
  const today = new Date().toISOString().split('T')[0];

  const getCurrentPriceInfo = (categoryId: number) => {
    const priceInfo = currentPrices.find(p => p.categoryId === categoryId);
    return {
      current: priceInfo?.currentPrice || 0,
      isToday: priceInfo?.isToday || false,
      effectiveDate: priceInfo?.effectiveDate,
    };
  };

  // Initialize prices when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      const initialPrices: PriceFormData = {};
      
      // Initialize with current prices if available
      if (currentPrices && currentPrices.length > 0 && categories && categories.length > 0) {
        categories.forEach(category => {
          const priceInfo = currentPrices.find(p => p.categoryId === category.id);
          const currentPrice = priceInfo?.currentPrice;
          initialPrices[category.id.toString()] = currentPrice ? currentPrice.toString() : '';
        });
      }
      
      setPrices(initialPrices);
      setAutoCalculated(new Set());
    } else {
      // Reset prices when modal is closed
      setPrices({});
    }
  }, [isOpen, categories, currentPrices]);

  const createPriceMutation = useMutation({
    mutationFn: async (priceData: any[]) => {
      return apiRequest("POST", "/api/price-master", priceData);
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ["/api/price-master"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-master/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-master", today] });
      
      // Also refetch current prices to update the modal data immediately
      queryClient.refetchQueries({ queryKey: ["/api/price-master/current"] });
      
      toast({
        title: "Success",
        description: "Today's prices updated successfully",
      });
      onClose();
      onSuccess?.(); // Call the onSuccess callback if provided
    },
    onError: (error) => {
      console.error("Error updating prices:", error);
      toast({
        title: "Error",
        description: "Failed to update prices",
        variant: "destructive",
      });
    },
  });

  // Auto-calculate Gold 18K price when Gold 22K price changes
  const handlePriceChange = (categoryId: string, value: string) => {
    const newPrices = { ...prices };
    newPrices[categoryId] = value;
    
    const newAutoCalculated = new Set(autoCalculated);

    // Check if this is Gold 22K category and we have Gold 18K category
    if (gold22KCategory && gold18KCategory && categoryId === gold22KCategory.id.toString()) {
      const gold22KPrice = parseFloat(value);
      
      if (!isNaN(gold22KPrice) && gold22KPrice > 0) {
        // Calculate Gold 18K price: (Gold22KPrice / 22) * 18
        const gold18KPrice = (gold22KPrice / 22) * 18;
        const gold18KCategoryId = gold18KCategory.id.toString();
        
        newPrices[gold18KCategoryId] = gold18KPrice.toFixed(2);
        newAutoCalculated.add(gold18KCategoryId);
        
        toast({
          title: "Auto-calculated",
          description: `Gold 18K price automatically calculated as ${formatCurrency(gold18KPrice)}`,
          duration: 3000,
        });
      } else {
        // Clear Gold 18K if Gold 22K is invalid
        if (gold18KCategory) {
          const gold18KCategoryId = gold18KCategory.id.toString();
          newAutoCalculated.delete(gold18KCategoryId);
        }
      }
    }

    // If manually editing Gold 18K, remove it from auto-calculated set
    if (gold18KCategory && categoryId === gold18KCategory.id.toString()) {
      newAutoCalculated.delete(categoryId);
    }

    setPrices(newPrices);
    setAutoCalculated(newAutoCalculated);
  };

  const handleSave = async () => {
    // Validate and prepare price data
    const priceUpdates = [];
    let hasErrors = false;

    for (const category of categories) {
      const priceValue = prices[category.id];
      if (priceValue && priceValue.trim() !== "") {
        const numericValue = parseFloat(priceValue);
        if (isNaN(numericValue) || numericValue <= 0) {
          toast({
            title: "Invalid Price",
            description: `Please enter a valid price for ${category.name}`,
            variant: "destructive",
          });
          hasErrors = true;
          break;
        }
        priceUpdates.push({
          categoryId: category.id,
          pricePerGram: priceValue,
          effectiveDate: today,
        });
      }
    }

    if (hasErrors) return;

    if (priceUpdates.length === 0) {
      toast({
        title: "No Changes",
        description: "Please enter at least one price to update",
        variant: "destructive",
      });
      return;
    }

    console.log("Sending price updates:", priceUpdates);
    await createPriceMutation.mutateAsync(priceUpdates);
  };

  const handleClose = () => {
    setPrices({});
    setAutoCalculated(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Update Today's Prices</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            Update prices for today ({new Date().toLocaleDateString()}). 
            <span className="font-medium text-blue-600 ml-1">
              Gold 18K price will be automatically calculated when you update Gold 22K price.
            </span>
          </div>

          {/* Auto-calculation Info */}
          {gold22KCategory && gold18KCategory && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Auto-calculation Formula</span>
                </div>
                <div className="text-sm text-blue-700">
                  Gold 18K Price = (Gold 22K Price ÷ 22) × 18
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const currentInfo = getCurrentPriceInfo(category.id);
              const categoryIdStr = category.id.toString();
              const isAutoCalculated = autoCalculated.has(categoryIdStr);
              const isGold22K = gold22KCategory?.id === category.id;
              const isGold18K = gold18KCategory?.id === category.id;

              return (
                <Card key={category.id} className={`p-4 ${isAutoCalculated ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {category.name}
                        {isGold22K && (
                          <Badge variant="outline" className="ml-2 text-xs bg-yellow-100">
                            Master Price
                          </Badge>
                        )}
                        {isGold18K && (
                          <Badge variant="outline" className="ml-2 text-xs bg-green-100">
                            Auto-calculated
                          </Badge>
                        )}
                      </Label>
                      {isAutoCalculated && (
                        <div title="Auto-calculated">
                          <Calculator className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>

                    {/* Price Input */}
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price per gram"
                      value={prices[categoryIdStr] || ''}
                      onChange={(e) => handlePriceChange(categoryIdStr, e.target.value)}
                      className={isAutoCalculated ? 'bg-green-50 border-green-300' : ''}
                      disabled={createPriceMutation.isPending}
                    />

                   {/* Auto-calculation Notice */}
                   {isAutoCalculated && (
                     <div className="text-xs text-green-700 flex items-center space-x-1">
                       <Calculator className="w-3 h-3" />
                       <span>Automatically calculated from Gold 22K price</span>
                     </div>
                   )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createPriceMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createPriceMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {createPriceMutation.isPending ? "Saving..." : "Save Today's Prices"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
