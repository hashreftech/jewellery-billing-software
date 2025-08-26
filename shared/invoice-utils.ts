import { type PurchaseOrderItem, type Product, type ProductCategory } from "@shared/schema";

// Types for invoice calculations
export interface InvoiceCalculation {
  subTotal: number;
  totalMakingCharges: number;
  makingChargeDiscount: number;
  totalGoldGrossWeight: number;
  goldValueDiscount: number;
  totalDiscountAmount: number;
  gstAmount: number;
  totalAmount: number;
  grandTotal: number;
}

export interface InvoiceItemData {
  productId: number;
  productName: string;
  purity: string;
  quantity: number;
  goldRatePerGram: number;
  netWeight: number;
  grossWeight: number;
  labourRatePerGram: number;
  additionalCost: number;
  gstPercentage: number;
}

export interface DiscountRule {
  type: 'making_charge' | 'gold_value' | 'item_total' | 'order_total';
  calculationType: 'percentage' | 'fixed_amount' | 'per_gram';
  value: number;
  maxDiscountAmount?: number;
}

export interface CompanyInfo {
  companyName: string;
  address: string;
  gstNumber: string;
  website?: string;
  phone: string;
  email: string;
  logo?: string;
  invoiceTerms?: string;
}

// Calculate individual item totals
export function calculateItemTotal(item: InvoiceItemData): {
  basePrice: number;
  gstAmount: number;
  totalPrice: number;
} {
  // Base price calculation: (goldRate * netWeight) + (labourRate * netWeight) + additionalCost
  const goldCost = item.goldRatePerGram * item.netWeight;
  const labourCost = item.labourRatePerGram * item.netWeight;
  const basePrice = (goldCost + labourCost + item.additionalCost) * item.quantity;
  
  // GST calculation
  const gstAmount = (basePrice * item.gstPercentage) / 100;
  
  // Total price including GST
  const totalPrice = basePrice + gstAmount;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
}

// Calculate invoice totals with discounts
export function calculateInvoiceTotal(
  items: InvoiceItemData[],
  discountRules: {
    makingChargeDiscountPercentage?: number;
    goldValueDiscountPerGram?: number;
  } = {},
  advanceAmount: number = 0
): InvoiceCalculation {
  let subTotal = 0;
  let totalMakingCharges = 0;
  let totalGoldGrossWeight = 0;
  let gstAmount = 0;

  // Calculate subtotal and totals
  items.forEach(item => {
    const itemCalc = calculateItemTotal(item);
    subTotal += itemCalc.totalPrice;
    gstAmount += itemCalc.gstAmount;
    
    // Calculate making charges (labour cost)
    totalMakingCharges += item.labourRatePerGram * item.netWeight * item.quantity;
    
    // Calculate total gold weight
    totalGoldGrossWeight += item.grossWeight * item.quantity;
  });

  // Apply making charge discount
  const makingChargeDiscountPercentage = discountRules.makingChargeDiscountPercentage || 0;
  const makingChargeDiscount = (totalMakingCharges * makingChargeDiscountPercentage) / 100;

  // Apply gold value discount
  const goldValueDiscountPerGram = discountRules.goldValueDiscountPerGram || 0;
  const goldValueDiscount = totalGoldGrossWeight * goldValueDiscountPerGram;

  // Total discount amount
  const totalDiscountAmount = makingChargeDiscount + goldValueDiscount;

  // Total amount after discounts
  const totalAmount = subTotal - totalDiscountAmount;

  // Grand total after advance payment
  const grandTotal = totalAmount - advanceAmount;

  return {
    subTotal: Math.round(subTotal * 100) / 100,
    totalMakingCharges: Math.round(totalMakingCharges * 100) / 100,
    makingChargeDiscount: Math.round(makingChargeDiscount * 100) / 100,
    totalGoldGrossWeight: Math.round(totalGoldGrossWeight * 1000) / 1000, // 3 decimal places for weight
    goldValueDiscount: Math.round(goldValueDiscount * 100) / 100,
    totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${randomNum}`;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format weight for display
export function formatWeight(weight: number): string {
  return `${weight.toFixed(3)} gm`;
}

// Convert order status to invoice status
export function getInvoiceStatus(orderStatus: string): string {
  switch (orderStatus) {
    case 'pending':
      return 'Draft';
    case 'confirmed':
      return 'Confirmed';
    case 'invoiced':
      return 'Invoiced';
    case 'shipped':
      return 'Shipped';
    case 'received':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

// Validate invoice data
export function validateInvoiceData(items: InvoiceItemData[]): string[] {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('Invoice must have at least one item');
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.productName || item.productName.trim() === '') {
      errors.push(`Item ${index + 1}: Product name is required`);
    }
    
    if (!item.purity || item.purity.trim() === '') {
      errors.push(`Item ${index + 1}: Purity is required`);
    }
    
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }
    
    if (item.goldRatePerGram <= 0) {
      errors.push(`Item ${index + 1}: Gold rate per gram must be greater than 0`);
    }
    
    if (item.netWeight <= 0) {
      errors.push(`Item ${index + 1}: Net weight must be greater than 0`);
    }
    
    if (item.grossWeight < item.netWeight) {
      errors.push(`Item ${index + 1}: Gross weight cannot be less than net weight`);
    }
    
    if (item.gstPercentage < 0 || item.gstPercentage > 100) {
      errors.push(`Item ${index + 1}: GST percentage must be between 0 and 100`);
    }
  });

  return errors;
}
