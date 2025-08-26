import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { X, Search, History, Edit3, Save } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface EditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  weight: number; // Keep for backward compatibility
  pricePerGram: number;
  basePrice: number;
  taxAmount: number;
  finalPrice: number;
  // Additional detailed fields from database
  grossWeight?: number;
  stoneWeight?: number;
  netWeight?: number;
  goldRatePerGram?: number;
  labourRatePerGram?: number;
  gstAmount?: number;
  totalPrice?: number;
  purity?: string;
  additionalCost?: number;
}

export default function EditPurchaseOrderModal({ isOpen, onClose, orderId }: EditPurchaseOrderModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState('pending');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Fetch order details
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['/api/purchase-orders', orderId],
    enabled: isOpen && !!orderId,
  }) as { data: any, isLoading: boolean };

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['/api/purchase-orders', orderId, 'audit'],
    enabled: isOpen && !!orderId,
  }) as { data: any[] };

  // Product search
  const { data: productSearchResults = [], isLoading: isSearchingProducts } = useQuery({
    queryKey: ['/api/products/search', productSearch],
    enabled: productSearch.length >= 2,
    staleTime: 0,
  }) as { data: any[], isLoading: boolean };

  // Initialize form when order data loads
  useEffect(() => {
    if (orderDetails) {
      setStatus(orderDetails.status || 'pending');
      setDiscount(Number(orderDetails.totalDiscountAmount || 0));
      setItems(orderDetails.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        quantity: Number(item.quantity),
        weight: parseFloat(item.netWeight?.toString() || item.weight?.toString() || '0'), // Map netWeight to weight for compatibility
        pricePerGram: parseFloat(item.goldRatePerGram?.toString() || item.pricePerGram?.toString() || '0'), // Map goldRatePerGram to pricePerGram
        basePrice: parseFloat(item.basePrice?.toString() || '0'),
        taxAmount: parseFloat(item.gstAmount?.toString() || item.taxAmount?.toString() || '0'), // Map gstAmount to taxAmount
        finalPrice: parseFloat(item.totalPrice?.toString() || item.finalPrice?.toString() || '0'), // Map totalPrice to finalPrice
        // Additional fields for detailed display
        grossWeight: parseFloat(item.grossWeight?.toString() || '0'),
        stoneWeight: parseFloat(item.stoneWeight?.toString() || '0'),
        netWeight: parseFloat(item.netWeight?.toString() || '0'),
        goldRatePerGram: parseFloat(item.goldRatePerGram?.toString() || '0'),
        labourRatePerGram: parseFloat(item.labourRatePerGram?.toString() || '0'),
        gstAmount: parseFloat(item.gstAmount?.toString() || '0'),
        totalPrice: parseFloat(item.totalPrice?.toString() || '0'),
        purity: item.purity || '22K',
        additionalCost: parseFloat(item.additionalCost?.toString() || '0'),
      })) || []);
    }
  }, [orderDetails]);

  // Calculate item pricing
  const calculateItemPricing = async (productId: number, weight: number, productData?: any) => {
    try {
      // Use provided product data or find product in search results
      let product = productData;
      if (!product) {
        product = (productSearchResults as any[]).find((p: any) => p.id === productId);
      }
      
      if (!product || !product.category?.id) {
        console.error('Product category information is missing:', product);
        throw new Error('Product category information is missing');
      }

      console.log('Found product for calculation:', {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        category: product.category,
        weight: product.weight,
        grossWeight: product.grossWeight,
        stoneWeight: product.stoneWeight
      });

      const priceRes = await apiRequest('GET', `/api/price-master/latest?categoryId=${product.category.id}`);
      const priceResponse = await priceRes.json();

      if (!priceResponse?.pricePerGram) {
        throw new Error('Price information not available');
      }
      
      const pricePerGram = Number(priceResponse.pricePerGram);
      const taxPercentage = Number(product.category.taxPercentage || 0);
      
      const basePrice = pricePerGram * weight;
      const taxAmount = basePrice * (taxPercentage / 100);
      const finalPrice = basePrice + taxAmount;
      
      return { pricePerGram, basePrice, taxAmount, finalPrice };
    } catch (error) {
      toast({
        title: 'Price Calculation Failed',
        description: error instanceof Error ? error.message : 'Unable to calculate price',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Add product to order
  const addProduct = async (product: any) => {
    console.log('=== Adding Product to Edit Order ===');
    console.log('Product:', product.name);
    console.log('All product fields:', product);
    
    // Handle string to number conversion for decimal fields from database
    // The API might return netWeight as 'weight' field or as 'netWeight' field
    const netWeightValue = (product.weight || product.netWeight) ? parseFloat((product.weight || product.netWeight).toString()) : 0;
    const grossWeightValue = product.grossWeight ? parseFloat(product.grossWeight.toString()) : 0;
    const stoneWeightValue = product.stoneWeight ? parseFloat(product.stoneWeight.toString()) : 0;
    
    console.log('Parsed weights:');
    console.log('- API weight field:', product.weight, '(should be netWeight)');
    console.log('- API netWeight field:', product.netWeight);
    console.log('- API grossWeight field:', product.grossWeight);
    console.log('- API stoneWeight field:', product.stoneWeight);
    console.log('- Parsed netWeight:', netWeightValue);
    console.log('- Parsed grossWeight:', grossWeightValue);
    console.log('- Parsed stoneWeight:', stoneWeightValue);
    
    const defaultWeight = netWeightValue > 0 ? netWeightValue : 1; // Use netWeight as the main weight
    
    console.log('Using weight for calculation:', defaultWeight);
    
    const pricing = await calculateItemPricing(product.id, defaultWeight, product);
    
    if (!pricing) return;

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      weight: defaultWeight,
      ...pricing,
      // Override with the correct parsed values to ensure UI displays correctly
      stoneWeight: stoneWeightValue,
      grossWeight: grossWeightValue,
      netWeight: netWeightValue,
    };

    setItems(prev => [...prev, newItem]);
    setProductSearch('');
    setShowProductSearch(false);
  };

  // Update item
  const updateItem = (index: number, field: 'quantity' | 'weight', value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      
      const updated = { ...item, [field]: value };
      
      // Recalculate pricing if weight changed
      if (field === 'weight') {
        const basePrice = updated.pricePerGram * value;
        const taxPercentage = 0; // We'd need to store this or recalculate
        const taxAmount = basePrice * (taxPercentage / 100);
        const finalPrice = basePrice + taxAmount;
        
        return {
          ...updated,
          basePrice,
          taxAmount,
          finalPrice,
        };
      }
      
      return updated;
    }));
  };

  // Remove item
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const grandTotal = Math.max(0, subtotal - discount);
    return { subtotal, grandTotal };
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/purchase-orders/${orderId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase order",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      status,
      discount,
      items: items.map(item => ({
        ...(item.id && { id: item.id }),
        productId: item.productId,
        quantity: item.quantity,
        weight: item.weight,
        pricePerGram: item.pricePerGram,
        basePrice: item.basePrice,
        taxAmount: item.taxAmount,
        finalPrice: item.finalPrice,
      })),
    };

    updateMutation.mutate(orderData);
  };

  const handleClose = () => {
    setItems([]);
    setStatus('pending');
    setDiscount(0);
    setProductSearch('');
    setShowProductSearch(false);
    onClose();
  };

  const totals = calculateTotals();

  if (!orderId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <span>Edit Purchase Order #{orderDetails?.orderNumber}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">Loading order details...</div>
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="audit">
                <History className="w-4 h-4 mr-2" />
                Audit History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="p-4">
                  <Label>Customer Information</Label>
                  <div className="mt-2">
                    <p className="font-medium">{orderDetails?.customer?.name || `Customer #${orderDetails?.customerId}`}</p>
                    <p className="text-sm text-gray-600">{orderDetails?.customer?.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Add Product */}
              <div className="space-y-2">
                <Label>Add Product</Label>
                <div className="relative">
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductSearch(e.target.value.length >= 2);
                    }}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  
                  {showProductSearch && (
                    <Card className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1">
                      <CardContent className="p-2">
                        {isSearchingProducts ? (
                          <div className="text-center py-4 text-gray-500">Searching...</div>
                        ) : (productSearchResults as any[]).length > 0 ? (
                          <div className="space-y-1">
                            {(productSearchResults as any[]).map((product: any) => (
                              <div
                                key={product.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => addProduct(product)}
                              >
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">
                                  {product.barcodeNumber} • Net: {product.netWeight}g, Gross: {product.grossWeight}g
                                </div>
                                {product.category && (
                                  <Badge variant="outline" className="mt-1">
                                    {product.category.name} • Tax: {product.category.taxPercentage}%
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">No products found</div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <Label>Order Items ({items.length})</Label>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-2">Product</th>
                            <th className="text-left p-2">Net Wt (g)</th>
                            <th className="text-left p-2">Gross Wt (g)</th>
                            <th className="text-left p-2">Stone Wt (g)</th>
                            <th className="text-left p-2">Gold Rate/g</th>
                            <th className="text-left p-2">Labour/g</th>
                            <th className="text-left p-2">Qty</th>
                            <th className="text-left p-2">GST</th>
                            <th className="text-left p-2">Total</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => {
                            const netWeight = item.netWeight || item.weight;
                            const grossWeight = item.grossWeight || item.weight;
                            const stoneWeight = item.stoneWeight || 0;
                            const goldCost = netWeight * (item.goldRatePerGram || item.pricePerGram);
                            
                            return (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-2">
                                  <div className="font-medium text-sm">{item.productName}</div>
                                  <div className="text-xs text-blue-600">{item.purity || '22K'}</div>
                                </td>
                                <td className="p-2">
                                  <div className="text-sm font-medium text-green-600">
                                    {netWeight.toFixed(3)}g
                                  </div>
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    step="0.001"
                                    value={grossWeight}
                                    onChange={(e) => updateItem(index, 'weight', Number(e.target.value))}
                                    className="w-20 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="text-sm text-amber-600">
                                    {stoneWeight.toFixed(3)}g
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="text-sm">
                                    {formatCurrency(item.goldRatePerGram || item.pricePerGram)}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="text-sm text-blue-600">
                                    {formatCurrency(item.labourRatePerGram || 0)}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                    className="w-16 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="text-sm text-green-600">
                                    {formatCurrency(item.gstAmount || item.taxAmount)}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="text-sm font-medium">
                                    {formatCurrency((item.totalPrice || item.finalPrice) * item.quantity)}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      {/* Detailed breakdown for each item */}
                      <div className="mt-4 space-y-2">
                        {items.map((item, index) => {
                          const netWeight = item.netWeight || item.weight;
                          const goldCost = netWeight * (item.goldRatePerGram || item.pricePerGram);
                          const labourCost = netWeight * (item.labourRatePerGram || 0);
                          
                          return (
                            <div key={`detail-${index}`} className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-sm mb-2">{item.productName} - Detailed Breakdown:</div>
                              <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Gold Cost:</span><br/>
                                  {formatCurrency(goldCost)} ({netWeight.toFixed(3)}g × {formatCurrency(item.goldRatePerGram || item.pricePerGram)})
                                </div>
                                <div>
                                  <span className="font-medium">Labour Cost:</span><br/>
                                  {formatCurrency(labourCost)} ({netWeight.toFixed(3)}g × {formatCurrency(item.labourRatePerGram || 0)})
                                </div>
                                <div>
                                  <span className="font-medium">Additional Cost:</span><br/>
                                  {formatCurrency(item.additionalCost || 0)}
                                </div>
                                <div>
                                  <span className="font-medium">Final Price:</span><br/>
                                  <span className="font-semibold text-lg">{formatCurrency(item.totalPrice || item.finalPrice)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Label>Edit History</Label>
                  <div className="mt-4">
                    {auditLogs?.length > 0 ? (
                      <div className="space-y-4">
                        {auditLogs.map((log: any) => (
                          <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">
                                {log.employeeName} ({log.employeeEmpCode})
                              </div>
                              <Badge variant="outline">
                                {formatDateTime(log.updatedAt)}
                              </Badge>
                            </div>
                            
                            {log.changes.action && (
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Action:</strong> {log.changes.action}
                              </div>
                            )}
                            
                            {log.changes.changedFields?.length > 0 && (
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Fields changed:</strong> {log.changes.changedFields.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No edit history available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending || items.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
