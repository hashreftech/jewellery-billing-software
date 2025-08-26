/**
 * Comprehensive Pricing Calculation Utilities for Jewelry Shop
 * 
 * This module provides utilities for calculating jewelry prices with support for:
 * - Gold value calculation
 * - Making charges (Percentage, Per Gram, Fixed Amount)
 * - Wastage charges (Percentage, Per Gram, Fixed Amount, Per Piece)
 * - Stone value
 * - Additional costs
 * - GST calculations
 * - Rounding options
 */

export type ChargeType = "Percentage" | "Per Gram" | "Fixed Amount" | "Per Piece" | null;

export interface PriceInputs {
  net_weight: number;          // grams
  price_per_gram: number;      // ₹/g
  making_charge_type: ChargeType;
  making_charge_value?: number;
  wastage_charge_type: ChargeType;
  wastage_charge_value?: number;
  additional_cost?: number;    // ₹
  stone_value?: number;        // ₹
  gst_rate: number;            // %
  piece_qty?: number;          // default 1
  round_final_to_rupee?: boolean; // default false
}

export interface PriceBreakdown {
  gold_value: number;
  wastage_charge: number;
  making_charge: number;
  additional_cost: number;
  stone_value: number;
  subtotal: number;
  gst_amount: number;
  final_price: number;           // 2 decimals
  final_price_rounded?: number;  // optional nearest ₹
}

/**
 * Round to 2 decimal places
 */
const to2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Calculate making charge based on type and value
 */
function calculateMakingCharge(
  goldValue: number,
  netWeight: number,
  type: ChargeType,
  value: number = 0
): number {
  switch (type) {
    case "Percentage":
      return goldValue * (value / 100);
    case "Per Gram":
      return netWeight * value;
    case "Fixed Amount":
      return value;
    default:
      return 0;
  }
}

/**
 * Calculate wastage charge based on type and value
 */
function calculateWastageCharge(
  goldValue: number,
  netWeight: number,
  pieceQty: number,
  type: ChargeType,
  value: number = 0
): number {
  switch (type) {
    case "Percentage":
      return goldValue * (value / 100);
    case "Per Gram":
      return netWeight * value;
    case "Fixed Amount":
      return value;
    case "Per Piece":
      return pieceQty * value;
    default:
      return 0;
  }
}

/**
 * Main function to compute final price with comprehensive breakdown
 */
export function computeFinalPrice(i: PriceInputs): PriceBreakdown {
  const netWeight = +(i.net_weight || 0);
  const pricePerGram = +(i.price_per_gram || 0);
  const addCost = +(i.additional_cost || 0);
  const stoneVal = +(i.stone_value || 0);
  const gst = +(i.gst_rate || 0);
  const pieceQty = Math.max(1, +(i.piece_qty || 1));

  const goldValue = netWeight * pricePerGram;

  // Calculate wastage charge
  const wastage = calculateWastageCharge(
    goldValue,
    netWeight,
    pieceQty,
    i.wastage_charge_type,
    i.wastage_charge_value
  );

  // Calculate making charge
  const making = calculateMakingCharge(
    goldValue,
    netWeight,
    i.making_charge_type,
    i.making_charge_value
  );

  const subtotal = goldValue + wastage + making + addCost + stoneVal;
  const gstAmount = subtotal * (gst / 100);
  const finalPrice = to2(subtotal + gstAmount);

  const breakdown: PriceBreakdown = {
    gold_value: to2(goldValue),
    wastage_charge: to2(wastage),
    making_charge: to2(making),
    additional_cost: to2(addCost),
    stone_value: to2(stoneVal),
    subtotal: to2(subtotal),
    gst_amount: to2(gstAmount),
    final_price: finalPrice,
  };

  if (i.round_final_to_rupee) {
    breakdown.final_price_rounded = Math.round(finalPrice);
  }

  return breakdown;
}

/**
 * Helper function to convert database product to pricing inputs
 */
export function productToPriceInputs(
  product: any,
  pricePerGram: number,
  gstRate: number,
  quantity: number = 1,
  stoneValue: number = 0
): PriceInputs {
  return {
    net_weight: parseFloat(String(product.netWeight || product.net_weight || 0)),
    price_per_gram: pricePerGram,
    making_charge_type: product.makingChargeType || product.making_charge_type,
    making_charge_value: parseFloat(String(product.makingChargeValue || product.making_charge_value || 0)),
    wastage_charge_type: product.wastageChargeType || product.wastage_charge_type,
    wastage_charge_value: parseFloat(String(product.wastageChargeValue || product.wastage_charge_value || 0)),
    additional_cost: parseFloat(String(product.additionalCost || product.additional_cost || 0)),
    stone_value: stoneValue,
    gst_rate: gstRate,
    piece_qty: quantity,
    round_final_to_rupee: false
  };
}

/**
 * Calculate price for a purchase order item
 */
export function calculatePurchaseOrderItemPrice(
  product: any,
  quantity: number,
  goldRatePerGram: number,
  gstPercentage: number,
  stoneValue: number = 0
): {
  breakdown: PriceBreakdown;
  totalPrice: number;
  basePrice: number;
  gstAmount: number;
} {
  const inputs = productToPriceInputs(product, goldRatePerGram, gstPercentage, quantity, stoneValue);
  const breakdown = computeFinalPrice(inputs);
  
  return {
    breakdown,
    totalPrice: breakdown.final_price * quantity,
    basePrice: breakdown.subtotal * quantity,
    gstAmount: breakdown.gst_amount * quantity
  };
}

/**
 * Validate charge type and value combination
 */
export function validateChargeConfiguration(type: ChargeType, value?: number): boolean {
  if (!type || type === null) {
    return true; // No charge is valid
  }
  
  if (value === undefined || value === null || value < 0) {
    return false; // Invalid value for non-null charge type
  }
  
  if (type === "Percentage" && value > 100) {
    return false; // Percentage should not exceed 100%
  }
  
  return true;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Helper function to calculate discounts on making charges
 */
export function applyMakingChargeDiscount(
  makingCharge: number,
  discountPercentage: number
): { discountAmount: number; finalMakingCharge: number } {
  const discountAmount = makingCharge * (discountPercentage / 100);
  const finalMakingCharge = makingCharge - discountAmount;
  
  return {
    discountAmount: to2(discountAmount),
    finalMakingCharge: to2(finalMakingCharge)
  };
}

/**
 * Calculate total order summary with all items
 */
export interface OrderSummary {
  totalGoldValue: number;
  totalMakingCharges: number;
  totalWastageCharges: number;
  totalStoneValue: number;
  totalAdditionalCosts: number;
  subtotal: number;
  totalGstAmount: number;
  grandTotal: number;
  totalGoldWeight: number;
  itemCount: number;
}

export function calculateOrderSummary(items: Array<{
  breakdown: PriceBreakdown;
  quantity: number;
  netWeight: number;
}>): OrderSummary {
  let totalGoldValue = 0;
  let totalMakingCharges = 0;
  let totalWastageCharges = 0;
  let totalStoneValue = 0;
  let totalAdditionalCosts = 0;
  let totalGstAmount = 0;
  let grandTotal = 0;
  let totalGoldWeight = 0;
  let itemCount = 0;

  items.forEach(item => {
    const qty = item.quantity;
    totalGoldValue += item.breakdown.gold_value * qty;
    totalMakingCharges += item.breakdown.making_charge * qty;
    totalWastageCharges += item.breakdown.wastage_charge * qty;
    totalStoneValue += item.breakdown.stone_value * qty;
    totalAdditionalCosts += item.breakdown.additional_cost * qty;
    totalGstAmount += item.breakdown.gst_amount * qty;
    grandTotal += item.breakdown.final_price * qty;
    totalGoldWeight += item.netWeight * qty;
    itemCount += qty;
  });

  const subtotal = totalGoldValue + totalMakingCharges + totalWastageCharges + totalStoneValue + totalAdditionalCosts;

  return {
    totalGoldValue: to2(totalGoldValue),
    totalMakingCharges: to2(totalMakingCharges),
    totalWastageCharges: to2(totalWastageCharges),
    totalStoneValue: to2(totalStoneValue),
    totalAdditionalCosts: to2(totalAdditionalCosts),
    subtotal: to2(subtotal),
    totalGstAmount: to2(totalGstAmount),
    grandTotal: to2(grandTotal),
    totalGoldWeight: to2(totalGoldWeight),
    itemCount
  };
}
