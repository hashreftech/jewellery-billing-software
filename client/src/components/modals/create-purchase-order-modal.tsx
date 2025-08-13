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
  weight: number;
  pricePerGram: number;
  basePrice: number;
  taxAmount: number;
  finalPrice: number;
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
  const calculateItemPricing = async (productId: number, quantity: number, weight: number) => {
    try {
      console.log('=== Starting Price Calculation ===');
      console.log('Product ID:', productId, 'Quantity:', quantity, 'Weight:', weight);
      
      // Find product in search results
      const product = (productSearchResults as any[]).find((p: any) => p.id === productId);
      
      if (!product) {
        console.error('Product not found in search results for ID:', productId);
        throw new Error('Product not found');
      }
      
      console.log('Found product:', {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        category: product.category
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
      
      // Calculate pricing
      const basePrice = pricePerGram * weight;
      const taxAmount = basePrice * (taxPercentage / 100);
      const finalPrice = basePrice + taxAmount;
      
      console.log('=== Price Calculation Results ===');
      console.log('Price per gram:', pricePerGram);
      console.log('Weight:', weight);
      console.log('Base price:', basePrice);
      console.log('Tax percentage:', taxPercentage);
      console.log('Tax amount:', taxAmount);
      console.log('Final price:', finalPrice);
      
      const result = {
        pricePerGram,
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
  const addProduct = async (product: Product & { category?: ProductCategory }) => {
    const defaultWeight = Number(product.weight) || 1;
    const defaultQuantity = 1;
    
    const pricing = await calculateItemPricing(product.id, defaultQuantity, defaultWeight);
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
      const pricing = await calculateItemPricing(item.productId, updatedItem.quantity, updatedItem.weight);
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

    const { discountAmount } = calculateTotals();

    const orderData = {
      customerId: selectedCustomer.id,
      orderDate,
      status,
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
                                {product.barcodeNumber} • Weight: {product.weight}g
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
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 text-sm font-medium border-b">
                  <div>Product</div>
                  <div>Weight (g)</div>
                  <div>Price/g</div>
                  <div>Base Price</div>
                  <div>Tax</div>
                  <div>Final Price</div>
                  <div>Qty</div>
                  <div>Subtotal</div>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-8 gap-2 p-3 border-b last:border-b-0 items-center">
                    <div>
                      <div className="font-medium text-sm">{item.product?.name}</div>
                      <div className="text-xs text-gray-500">{item.product?.barcodeNumber}</div>
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
                      <Input
                        type="number"
                        step="0.01"
                        value={item.weight}
                        onChange={(e) => updateItem(index, 'weight', Number(e.target.value))}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="text-sm">
                      {formatCurrency(item.pricePerGram)}
                    </div>
                    
                    <div className="text-sm">
                      {formatCurrency(item.basePrice)}
                    </div>
                    
                    <div className="text-sm text-green-600">
                      {formatCurrency(item.taxAmount)}
                    </div>
                    
                    <div className="text-sm font-medium">
                      {formatCurrency(item.finalPrice)}
                    </div>
                    
                    <div>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="text-sm font-medium">
                      {formatCurrency(item.finalPrice * item.quantity)}
                    </div>
                  </div>
                ))}
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
