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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Search, Calculator, ShoppingCart, Percent, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Customer, Product, ProductCategory } from '@shared/schema';

interface PurchaseOrderItem {
  productId: number;
  product?: Product & { category?: ProductCategory };
  quantity: number;
  weight: number; // Keep as netWeight for backward compatibility
  pricePerGram: number;
  basePrice: number;
  taxAmount: number;
  finalPrice: number;
  // Additional detailed fields (optional for now)
  grossWeight?: number;
  stoneWeight?: number;
  netWeight?: number;
  goldCost?: number;
  stoneCost?: number;
  wastagePercentage?: number;
  wastageAmount?: number;
  wastageChargeType?: string;
  wastageChargeValue?: number;
  makingChargeType?: string;
  makingChargeValue?: number;
  labourCharges?: number;
}

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePurchaseOrderModal({ isOpen, onClose }: CreatePurchaseOrderModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state (restored)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>("percentage");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("pending");

  // Search states
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Customer search (path param based)
  const { data: customerSearchResults = [], isLoading: isSearchingCustomers } = useQuery({
    // join() in default queryFn will produce /api/customers/search/<term>
    queryKey: ['/api/customers/search', customerSearch],
    enabled: customerSearch.length >= 2,
    staleTime: 0,
  });

  // Product search (path param based)
  const { data: productSearchResults = [], isLoading: isSearchingProducts } = useQuery({
    queryKey: ['/api/products/search', productSearch],
    enabled: productSearch.length >= 2,
    staleTime: 0,
  });

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/purchase-orders', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Purchase order created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create purchase order',
        variant: 'destructive',
      });
    },
  });

  // Auto-calculate price based on product weight and current price
  const calculateItemPricing = async (productId: number, quantity: number, weight: number, productData?: any) => {
    try {
      console.log('=== Starting Price Calculation ===');
      console.log('Product ID:', productId, 'Quantity:', quantity, 'Weight:', weight);
      
      // Use provided product data or find product in search results
      let product = productData;
      if (!product) {
        product = (productSearchResults as any[]).find((p: any) => p.id === productId);
      }
      
      if (!product) {
        console.error('Product not found in search results for ID:', productId);
        throw new Error('Product not found');
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
      
      // Validate category structure
      if (!product.category || !product.category.id) {
        console.error('Product has invalid category structure:', product.category);
        throw new Error('Product category information is missing');
      }
      
      const categoryId = product.category.id;
      console.log('Using category ID:', categoryId);

      // Get latest price for product category
      const priceUrl = `/api/price-master/latest?categoryId=${categoryId}`;
      console.log('Fetching price from:', priceUrl);
      
  // apiRequest returns a Response, we must parse JSON
  const priceRes = await apiRequest('GET', priceUrl);
  const priceResponse = await priceRes.json();
  console.log('Price response:', priceResponse);

  if (!priceResponse || !priceResponse.pricePerGram) {
        console.error('Invalid price response:', priceResponse);
        throw new Error('Price information not available for this product category');
      }
      
      // Parse price per gram - handle PostgreSQL decimal strings
      const pricePerGramRaw = priceResponse.pricePerGram;
      console.log('Raw price per gram:', pricePerGramRaw, 'Type:', typeof pricePerGramRaw);
      
      const pricePerGram = parseFloat(String(pricePerGramRaw));
      console.log('Parsed price per gram:', pricePerGram);
      
      if (isNaN(pricePerGram) || pricePerGram <= 0) {
        console.error('Invalid price per gram value:', pricePerGramRaw);
        throw new Error(`Invalid price per gram: ${pricePerGramRaw}`);
      }
      
      // Parse tax percentage - handle decimal strings
      const taxPercentageRaw = product.category.taxPercentage;
      console.log('Raw tax percentage:', taxPercentageRaw, 'Type:', typeof taxPercentageRaw);
      
      const taxPercentage = parseFloat(String(taxPercentageRaw || '0'));
      console.log('Parsed tax percentage:', taxPercentage);
      
      if (isNaN(taxPercentage) || taxPercentage < 0) {
        console.error('Invalid tax percentage:', taxPercentageRaw);
        throw new Error(`Invalid tax percentage: ${taxPercentageRaw}`);
      }
      
      // Validate weight
      if (isNaN(weight) || weight <= 0) {
        console.error('Invalid weight:', weight);
        throw new Error(`Invalid weight: ${weight}`);
      }
      
      // Calculate detailed pricing breakdown using product's actual weight specifications
      // The API might return different field names than expected
      const productGrossWeight = product.grossWeight ? parseFloat(product.grossWeight.toString()) : 0;
      const productNetWeight = (product.netWeight || product.weight) ? parseFloat((product.netWeight || product.weight).toString()) : 0;
      const productStoneWeight = product.stoneWeight ? parseFloat(product.stoneWeight.toString()) : 0;
      
      // Use the product's actual weights, not the calculated ones
      const grossWeight = productGrossWeight || (productNetWeight + productStoneWeight) || weight; // fallback to provided weight if no product weights
      const stoneWeight = productStoneWeight;
      const netWeight = productNetWeight || (grossWeight - stoneWeight);
      
      console.log('Using product weights - Gross:', grossWeight, 'Stone:', stoneWeight, 'Net:', netWeight);
      
      // Gold cost calculation
      const goldCost = netWeight * pricePerGram;
      
      // Stone cost calculation (example: 10% of gold cost)
      const stoneCost = stoneWeight > 0 ? (stoneWeight * pricePerGram * 0.1) : 0;
      
      // Wastage calculation using product's actual configuration
      let wastageAmount = 0;
      const wastageChargeType = product.wastageChargeType;
      const wastageChargeValue = parseFloat(String(product.wastageChargeValue || '0'));
      
      console.log('Product wastage config - Type:', wastageChargeType, 'Value:', wastageChargeValue);
      
      if (wastageChargeType === "Percentage") {
        wastageAmount = goldCost * (wastageChargeValue / 100);
      } else if (wastageChargeType === "Per Gram") {
        wastageAmount = netWeight * wastageChargeValue;
      } else if (wastageChargeType === "Fixed Amount") {
        wastageAmount = wastageChargeValue;
      } else if (wastageChargeType === "Per Piece") {
        wastageAmount = quantity * wastageChargeValue;
      }
      
      // Making charges using product's actual configuration
      let labourCharges = 0;
      const makingChargeType = product.makingChargeType;
      const makingChargeValue = parseFloat(String(product.makingChargeValue || '0'));
      
      console.log('Product making charge config - Type:', makingChargeType, 'Value:', makingChargeValue);
      
      if (makingChargeType === "Percentage") {
        labourCharges = goldCost * (makingChargeValue / 100);
      } else if (makingChargeType === "Per Gram") {
        labourCharges = netWeight * makingChargeValue;
      } else if (makingChargeType === "Fixed Amount") {
        labourCharges = makingChargeValue;
      }
      
      // Base price calculation
      const basePrice = goldCost + stoneCost + wastageAmount + labourCharges;
      const taxAmount = basePrice * (taxPercentage / 100);
      const finalPrice = basePrice + taxAmount;
      
      console.log('=== Detailed Price Calculation Results ===');
      console.log('Gross weight:', grossWeight);
      console.log('Stone weight:', stoneWeight);
      console.log('Net weight:', netWeight);
      console.log('Gold cost:', goldCost);
      console.log('Stone cost:', stoneCost);
      console.log('Wastage amount:', wastageAmount, `(${wastageChargeType}: ${wastageChargeValue})`);
      console.log('Labour charges:', labourCharges, `(${makingChargeType}: ${makingChargeValue})`);
      console.log('Base price:', basePrice);
      console.log('Tax amount:', taxAmount, `(${taxPercentage}%)`);
      console.log('Final price:', finalPrice);
      
      const result = {
        pricePerGram,
        grossWeight,
        stoneWeight,
        netWeight,
        goldCost,
        stoneCost,
        wastageChargeType,
        wastageChargeValue,
        wastageAmount,
        makingChargeType,
        makingChargeValue,
        labourCharges,
        basePrice,
        taxAmount,
        finalPrice,
      };
      
      console.log('Returning result:', result);
      return result;
      
    } catch (error) {
      console.error('=== Price Calculation Error ===');
      console.error('Error:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Show user-friendly error message
      toast({
        title: 'Price Calculation Failed',
        description: error instanceof Error ? error.message : 'Unable to calculate price for this product',
        variant: 'destructive',
      });
      
      return null;
    }
  };

  // Add product to order
  const addProduct = async (product: any) => {
    console.log('=== Adding Product to Order ===');
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
    const defaultQuantity = 1;
    
    console.log('Using weight for calculation:', defaultWeight);
    
    const pricing = await calculateItemPricing(product.id, defaultQuantity, defaultWeight, product);
    if (!pricing) {
      toast({
        title: 'Error',
        description: 'Unable to calculate pricing for this product',
        variant: 'destructive',
      });
      return;
    }

    const newItem: PurchaseOrderItem = {
      productId: product.id,
      product,
      quantity: defaultQuantity,
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

  // Update item quantity or weight
  const updateItem = async (index: number, field: 'quantity' | 'weight', value: number) => {
    const item = items[index];
    const updatedItem = { ...item, [field]: value };
    
    if (field === 'weight' || field === 'quantity') {
      const pricing = await calculateItemPricing(item.productId, updatedItem.quantity, updatedItem.weight, item.product);
      if (pricing) {
        Object.assign(updatedItem, pricing);
      }
    }

    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  // Remove item
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const totalTax = items.reduce((sum, item) => sum + (item.taxAmount * item.quantity), 0);
    const totalGoldGrossWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    const grandTotal = subtotal - discountAmount;
    
    return {
      subtotal,
      totalTax,
      totalGoldGrossWeight,
      discountAmount,
      grandTotal,
    };
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        variant: 'destructive',
      });
      return;
    }

    const { subtotal, totalTax, totalGoldGrossWeight, discountAmount, grandTotal } = calculateTotals();

    const orderData = {
      customerId: selectedCustomer.id,
      orderDate,
      status,
      subTotal: subtotal.toString(),
      totalGoldGrossWeight: totalGoldGrossWeight.toString(),
      grandTotal: grandTotal.toString(),
      gstAmount: totalTax.toString(),
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        weight: item.weight,
        pricePerGram: item.pricePerGram,
        basePrice: item.basePrice,
        taxAmount: item.taxAmount,
        finalPrice: item.finalPrice,
      })),
      discount: discountAmount,
    };

    console.log('=== Creating Purchase Order ===');
    console.log('Order Data:', orderData);
    
    createMutation.mutate(orderData);
  };

  // Reset form
  const handleClose = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setProductSearch('');
    setItems([]);
    setDiscount(0);
    setDiscountType('percentage');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setStatus('pending');
    setShowCustomerSearch(false);
    setShowProductSearch(false);
    onClose();
  };

  const totals = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Create Purchase Order</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Customer *</Label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div>
                  <div className="font-medium">{selectedCustomer.name}</div>
                  <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>
                  <div className="text-sm text-gray-500">{selectedCustomer.customerId}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search customers by name or phone..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerSearch(e.target.value.length >= 2);
                    }}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
                
                {showCustomerSearch && (
                  <Card className="absolute z-10 w-full max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                      {isSearchingCustomers ? (
                        <div className="text-center py-4 text-gray-500">Searching...</div>
                      ) : (customerSearchResults as any[]).length > 0 ? (
                        <div className="space-y-1">
                          {(customerSearchResults as Customer[]).map((customer: Customer) => (
                            <div
                              key={customer.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setCustomerSearch('');
                                setShowCustomerSearch(false);
                              }}
                            >
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">No customers found</div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order Date</Label>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Addition */}
          <div className="space-y-2">
            <Label>Add Products</Label>
            <div className="relative">
              <Input
                placeholder="Search products by name or barcode..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductSearch(e.target.value.length >= 2);
                }}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            
            {showProductSearch && (
              <Card className="absolute z-10 w-full max-h-60 overflow-y-auto">
                <CardContent className="p-2">
                  {isSearchingProducts ? (
                    <div className="text-center py-4 text-gray-500">Searching...</div>
                  ) : (productSearchResults as any[]).length > 0 ? (
                    <div className="space-y-1">
                      {(productSearchResults as (Product & { category?: ProductCategory })[]).map((product: Product & { category?: ProductCategory }) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
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
                            <Plus className="w-4 h-4 text-green-500" />
                          </div>
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

          {/* Order Items */}
          {items.length > 0 && (
            <div className="space-y-4">
              <Label>Order Items ({items.length})</Label>
              <div className="border rounded-lg">
                <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 text-sm font-medium border-b">
                  <div className="col-span-2">Product</div>
                  <div>Net Wt (g)</div>
                  <div>Gross Wt (g)</div>
                  <div>Stone Wt (g)</div>
                  <div>Gold Rate/g</div>
                  <div>Labour</div>
                  <div>GST</div>
                  <div>Qty</div>
                  <div>Total</div>
                </div>
                
                {items.map((item, index) => {
                  const grossWeight = item.grossWeight || item.weight;
                  const stoneWeight = item.stoneWeight || (item.product?.stoneWeight ? parseFloat(item.product.stoneWeight) : 0);
                  const netWeight = item.netWeight || item.weight;
                  const goldCost = (netWeight * item.pricePerGram);
                  const labourCharges = item.labourCharges || 0;
                  
                  return (
                    <div key={index} className="border-b last:border-b-0">
                      {/* Main item row */}
                      <div className="grid grid-cols-10 gap-2 p-3 items-center">
                        <div className="col-span-2">
                          <div className="font-medium text-sm">{item.product?.name}</div>
                          <div className="text-xs text-gray-500">{item.product?.barcodeNumber}</div>
                          <div className="text-xs text-blue-600">{item.product?.purity || '22K'}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500 p-0 h-auto mt-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-green-600">
                            {netWeight.toFixed(3)}g
                          </div>
                        </div>
                        
                        <div>
                          <Input
                            type="number"
                            step="0.001"
                            value={grossWeight}
                            onChange={(e) => {
                              const newGrossWeight = Number(e.target.value);
                              updateItem(index, 'weight', newGrossWeight);
                            }}
                            className="text-sm w-20"
                          />
                        </div>
                        
                        <div>
                          <div className="text-sm text-amber-600">
                            {stoneWeight.toFixed(3)}g
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          {formatCurrency(item.pricePerGram)}
                        </div>
                        
                        <div className="text-sm text-blue-600">
                          {formatCurrency(labourCharges)}
                        </div>
                        
                        <div className="text-sm text-green-600">
                          {formatCurrency(item.taxAmount)}
                        </div>
                        
                        <div>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            className="text-sm w-16"
                          />
                        </div>
                        
                        <div className="text-sm font-medium">
                          {formatCurrency(item.finalPrice * item.quantity)}
                        </div>
                      </div>
                      
                      {/* Detailed breakdown row */}
                      <div className="px-3 pb-3 bg-gray-50/50">
                        <div className="grid grid-cols-6 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Gold Cost:</span><br/>
                            {formatCurrency(goldCost)} ({netWeight.toFixed(3)}g × {formatCurrency(item.pricePerGram)})
                          </div>
                          <div>
                            <span className="font-medium">Stone Cost:</span><br/>
                            {formatCurrency(item.stoneCost || 0)}
                          </div>
                          <div>
                            <span className="font-medium">Wastage:</span><br/>
                            {formatCurrency(item.wastageAmount || 0)} ({item.wastageChargeType === 'Percentage' ? `${item.wastageChargeValue || 0}%` : item.wastageChargeType})
                          </div>
                          <div>
                            <span className="font-medium">Making Charges:</span><br/>
                            {formatCurrency(item.labourCharges || 0)} ({item.makingChargeType === 'Percentage' ? `${item.makingChargeValue || 0}%` : item.makingChargeType})
                          </div>
                          <div>
                            <span className="font-medium">Base Price:</span><br/>
                            {formatCurrency(item.basePrice)}
                          </div>
                          <div>
                            <span className="font-medium">Final Price:</span><br/>
                            <span className="font-semibold text-lg">{formatCurrency(item.finalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Discount and Totals */}
          {items.length > 0 && (
            <div className="space-y-4">
              <Separator />
              
              {/* Discount */}
              <div className="space-y-2">
                <Label>Discount</Label>
                <div className="flex space-x-2">
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <div className="flex items-center space-x-1">
                          <Percent className="w-4 h-4" />
                          <span>%</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Fixed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder={discountType === 'percentage' ? '0.00' : '0.00'}
                  />
                </div>
              </div>

              {/* Totals */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Weight:</span>
                    <span className="text-blue-600 font-medium">{totals.totalGoldGrossWeight.toFixed(3)}g</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal (Before Tax):</span>
                    <span>{formatCurrency(totals.subtotal - totals.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Tax:</span>
                    <span className="text-green-600">{formatCurrency(totals.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal (After Tax):</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Discount ({discountType === 'percentage' ? `${discount}%` : 'Fixed'}):</span>
                      <span className="text-red-600">-{formatCurrency(totals.discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-primary-600">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCustomer || items.length === 0 || createMutation.isPending}
            className="bg-primary-500 hover:bg-primary-600"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
