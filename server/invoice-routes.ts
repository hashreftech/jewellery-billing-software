import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { 
  generateInvoiceHTML, 
  generateInvoiceText, 
  type InvoiceData 
} from "@shared/invoice-generator";
import { 
  calculateInvoiceTotal,
  generateInvoiceNumber,
  type InvoiceItemData 
} from "@shared/invoice-utils";

const router = Router();

// Generate invoice for a purchase order
router.get("/api/invoices/:orderId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    // Get purchase order with details
    const order = await storage.getPurchaseOrderWithDetails(orderId);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    // Get customer details
    const customer = await storage.getCustomer(order.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get company settings
    const company = await storage.getCompanySettings();
    if (!company) {
      return res.status(500).json({ message: "Company settings not configured" });
    }

    // Transform order items to invoice items
    const invoiceItems: InvoiceItemData[] = order.items.map((item: any) => ({
      productId: item.productId,
      productName: item.productName || 'Unknown Product',
      purity: item.purity,
      quantity: item.quantity,
      goldRatePerGram: parseFloat(item.goldRatePerGram),
      netWeight: parseFloat(item.netWeight),
      grossWeight: parseFloat(item.grossWeight),
      labourRatePerGram: parseFloat(item.labourRatePerGram),
      additionalCost: parseFloat(item.additionalCost || '0'),
      gstPercentage: parseFloat(item.gstPercentage)
    }));

    // Calculate totals
    const discountRules = {
      makingChargeDiscountPercentage: parseFloat(order.makingChargeDiscountPercentage || '0'),
      goldValueDiscountPerGram: parseFloat(order.goldValueDiscountPerGram || '0')
    };
    
    const advanceAmount = parseFloat(order.advanceAmount || '0');
    const calculatedTotals = calculateInvoiceTotal(invoiceItems, discountRules, advanceAmount);

    // Create invoice data
    const invoiceData: InvoiceData = {
      invoiceNumber: order.invoiceNumber || generateInvoiceNumber(),
      orderNumber: order.orderNumber,
      billDate: order.orderDate,
      dueDate: order.dueDate || undefined,
      billerName: order.billerName || undefined,
      company: {
        companyName: company.companyName,
        address: company.address,
        gstNumber: company.gstNumber,
        website: company.website || undefined,
        phone: company.phone,
        email: company.email,
        logo: company.logo || undefined,
        invoiceTerms: company.invoiceTerms || undefined
      },
      customer: {
        name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone,
        address: customer.address || undefined
      },
      items: invoiceItems,
      totals: {
        subTotal: calculatedTotals.subTotal,
        totalMakingCharges: calculatedTotals.totalMakingCharges,
        makingChargeDiscount: calculatedTotals.makingChargeDiscount,
        makingChargeDiscountPercentage: discountRules.makingChargeDiscountPercentage,
        totalGoldGrossWeight: calculatedTotals.totalGoldGrossWeight,
        goldValueDiscountPerGram: discountRules.goldValueDiscountPerGram,
        totalGoldValueDiscount: calculatedTotals.goldValueDiscount,
        totalDiscountAmount: calculatedTotals.totalDiscountAmount,
        totalAmount: calculatedTotals.totalAmount,
        advanceAmount: advanceAmount,
        grandTotal: calculatedTotals.grandTotal
      }
    };

    // Return format based on query parameter
    const format = req.query.format as string || 'html';
    
    if (format === 'json') {
      res.json(invoiceData);
    } else if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      res.send(generateInvoiceText(invoiceData));
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(generateInvoiceHTML(invoiceData));
    }

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

// Get company settings
router.get("/api/company-settings", async (req, res) => {
  try {
    const settings = await storage.getCompanySettings();
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ message: "Failed to fetch company settings" });
  }
});

// Update company settings
router.put("/api/company-settings", async (req, res) => {
  try {
    const updatedSettings = await storage.updateCompanySettings(req.body);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ message: "Failed to update company settings" });
  }
});

// Get discount rules
router.get("/api/discount-rules", async (req, res) => {
  try {
    const active = req.query.active === 'true';
    const rules = active 
      ? await storage.getActiveDiscountRules()
      : await storage.getDiscountRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching discount rules:', error);
    res.status(500).json({ message: "Failed to fetch discount rules" });
  }
});

// Create discount rule
router.post("/api/discount-rules", async (req, res) => {
  try {
    const newRule = await storage.createDiscountRule(req.body);
    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating discount rule:', error);
    res.status(500).json({ message: "Failed to create discount rule" });
  }
});

// Get payment transactions for an order
router.get("/api/purchase-orders/:orderId/payments", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const payments = await storage.getPaymentTransactions(orderId);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({ message: "Failed to fetch payment transactions" });
  }
});

// Create payment transaction
router.post("/api/purchase-orders/:orderId/payments", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const paymentData = {
      ...req.body,
      purchaseOrderId: orderId,
      processedBy: req.user?.id || 1 // Default to admin if no user
    };
    
    const newPayment = await storage.createPaymentTransaction(paymentData);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    res.status(500).json({ message: "Failed to create payment transaction" });
  }
});

export default router;
