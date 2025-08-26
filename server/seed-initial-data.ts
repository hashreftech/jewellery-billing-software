import { db } from "./db";
import { 
  employees, 
  productCategories, 
  dealers, 
  customers, 
  products, 
  savingSchemeMaster, 
  priceMaster,
  purchaseOrders,
  purchaseOrderItems,
  purchaseOrderAuditLog,
  stockMovements,
  customerEnrollments,
  monthlyPayments,
  companySettings,
  discountRules,
  paymentTransactions
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { computeFinalPrice, productToPriceInputs, calculateOrderSummary } from "@shared/pricing-utils";
import { hashPasswordForSeed } from "./auth";

export async function seedInitialData() {
  try {
    console.log("Seeding initial data...");

    // Local helpers (must be here, not inside deeper blocks to avoid strict mode issues)
  const generateOrderNumberLocal = async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const existing = await db.select({ orderNumber: purchaseOrders.orderNumber }).from(purchaseOrders).where(eq(purchaseOrders.orderNumber, `PO-${dateStr}-000`));
      // Count matching prefix (simple approach)
      const sameDay = await db.select({ orderNumber: purchaseOrders.orderNumber }).from(purchaseOrders);
      const count = sameDay.filter(o => o.orderNumber.startsWith(`PO-${dateStr}-`)).length;
      return `PO-${dateStr}-${(count + 1).toString().padStart(3,'0')}`;
  };

  const generateCardNumberLocal = async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const sameDay = await db.select({ cardNumber: customerEnrollments.cardNumber }).from(customerEnrollments);
      const count = sameDay.filter(o => o.cardNumber.startsWith(`SCH-${dateStr}-`)).length;
      return `SCH-${dateStr}-${(count + 1).toString().padStart(3,'0')}`;
  };

    // Create admin employee if not exists
    const existingAdmin = await db
      .select()
      .from(employees)
      .where(eq(employees.empCode, "EMP-001"))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPasswordForSeed("temp_password");
      
      await db.insert(employees).values({
        empCode: "EMP-001",
        name: "Administrator",
        phone: "9999999999",
        email: "admin@jewelry.com",
        role: "admin",
        password: hashedPassword,
        status: "Active",
      });
      console.log("Admin employee created with hashed password");
    }

    // Seed product categories if not exists
    const existingCategories = await db.select().from(productCategories).limit(1);
    if (existingCategories.length === 0) {
      // Import the protected category codes to ensure we're using the exact same codes
      const { PROTECTED_CATEGORY_CODES } = await import("@shared/constants");
      
      // Define the default categories directly without jewel type dependency
      const defaultCategories = [
        {
          name: "Gold 22K Jewelry",
          code: "CAT-GOLD22K",
          hsnCode: "71131900",
          taxPercentage: "3.00"
        },
        {
          name: "Gold 18K Jewelry", 
          code: "CAT-GOLD18K",
          hsnCode: "71131900",
          taxPercentage: "3.00"
        },
        {
          name: "Silver Jewelry",
          code: "CAT-SILVER", 
          hsnCode: "71131100",
          taxPercentage: "3.00"
        },
        {
          name: "Diamond Jewelry",
          code: "CAT-DIAMOND",
          hsnCode: "71131910", 
          taxPercentage: "0.25"
        },
        {
          name: "Platinum Jewelry",
          code: "CAT-PLATINUM",
          hsnCode: "71131920",
          taxPercentage: "3.00"
        }
      ];
      
      for (const category of defaultCategories) {
        // Check if this is a protected category (for logging)
        const isProtected = PROTECTED_CATEGORY_CODES.includes(category.code);

        await db.insert(productCategories).values({
          name: category.name,
          code: category.code,
          hsnCode: category.hsnCode,
          taxPercentage: category.taxPercentage,
        });
        
        console.log(`Created category: ${category.name} (${category.code})${isProtected ? ' [PROTECTED]' : ''}`);
      }
      console.log("Product categories seeded");
    }

    // Seed dealers if not exists
    const existingDealers = await db.select().from(dealers).limit(1);
    if (existingDealers.length === 0) {
      const sampleDealers = [
        {
          name: "Mumbai Gold Traders",
          phone: "+91-9876543210",
          address: "123 Zaveri Bazaar, Mumbai, Maharashtra 400003",
          gstNumber: "27ABCDE1234F1Z5",
          categories: ["Gold 22K", "Gold 18K", "Silver"]
        },
        {
          name: "Delhi Diamond House",
          phone: "+91-9876543211", 
          address: "456 Karol Bagh, New Delhi, Delhi 110005",
          gstNumber: "07ABCDE1234F1Z6",
          categories: ["Diamond", "Platinum"]
        },
        {
          name: "Chennai Silver Works",
          phone: "+91-9876543212",
          address: "789 T. Nagar, Chennai, Tamil Nadu 600017", 
          gstNumber: "33ABCDE1234F1Z7",
          categories: ["Silver", "Gold 22K"]
        }
      ];

      for (const dealer of sampleDealers) {
        await db.insert(dealers).values(dealer);
        console.log(`Created dealer: ${dealer.name}`);
      }
      console.log("Sample dealers seeded");
    }

    // Seed customers if not exists
    const existingCustomers = await db.select().from(customers).limit(1);
    if (existingCustomers.length === 0) {
      const sampleCustomers = [
        {
          customerId: "CUST-20250805-001",
          name: "Rajesh Kumar",
          phone: "+91-9876543220",
          email: "rajesh.kumar@email.com",
          address: "Plot 123, Sector 15, Gurgaon, Haryana 122001",
          gstNumber: "06ABCDE1234F1Z8",
          dateOfBirth: "1985-03-15",
          anniversary: "2010-11-25",
          panCard: "ABCDE1234F"
        },
        {
          customerId: "CUST-20250805-002", 
          name: "Priya Sharma",
          phone: "+91-9876543221",
          email: "priya.sharma@email.com",
          address: "Flat 45B, Whitefield, Bangalore, Karnataka 560066",
          gstNumber: null,
          dateOfBirth: "1990-07-22",
          anniversary: "2015-02-14",
          panCard: "FGHIJ5678K"
        },
        {
          customerId: "CUST-20250805-003",
          name: "Amit Patel", 
          phone: "+91-9876543222",
          email: "amit.patel@email.com",
          address: "Bungalow 12, Satellite, Ahmedabad, Gujarat 380015",
          gstNumber: "24ABCDE1234F1Z9",
          dateOfBirth: "1982-12-08",
          anniversary: null,
          panCard: "KLMNO9012P"
        }
      ];

      for (const customer of sampleCustomers) {
        await db.insert(customers).values(customer);
        console.log(`Created customer: ${customer.name} (${customer.customerId})`);
      }
      console.log("Sample customers seeded");
    }

    // Seed price master if not exists  
    const existingPrices = await db.select().from(priceMaster).limit(1);
    if (existingPrices.length === 0) {
      const categories = await db.select().from(productCategories);
      if (categories.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Helper to find category id by code
        const idByCode = (code: string) => categories.find(c => c.code === code)?.id;

        const samplePrices = [
          // Today
          { code: "CAT-GOLD22K", date: today, price: "6500.00" },
          { code: "CAT-GOLD18K", date: today, price: "6200.50" },
          { code: "CAT-SILVER",  date: today, price: "150.75" },
          { code: "CAT-DIAMOND", date: today, price: "75000.00" }, // illustrative diamond rate
          { code: "CAT-PLATINUM", date: today, price: "4200.00" },
          // Yesterday
          { code: "CAT-GOLD22K", date: yesterday, price: "6450.00" },
          { code: "CAT-GOLD18K", date: yesterday, price: "6150.25" },
            { code: "CAT-SILVER",  date: yesterday, price: "148.50" },
          { code: "CAT-DIAMOND", date: yesterday, price: "74500.00" },
          { code: "CAT-PLATINUM", date: yesterday, price: "4150.00" },
        ]
          .map(p => ({ categoryId: idByCode(p.code)!, effectiveDate: p.date, pricePerGram: p.price }))
          .filter(p => !!p.categoryId);

        for (const price of samplePrices) {
          await db.insert(priceMaster).values(price);
          console.log(`Created price for category ${price.categoryId}: ₹${price.pricePerGram}/gram on ${price.effectiveDate}`);
        }
        console.log("Sample price master seeded for all categories");
      } else {
        console.log("No categories found, skipping price seeding");
      }
    }

    // Get dealer and category IDs for product seeding
    const dealersList = await db.select().from(dealers);
    const categoriesList = await db.select().from(productCategories);
    
    // Seed products if not exists
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0 && dealersList.length > 0 && categoriesList.length > 0) {
      const goldCategory = categoriesList.find(c => c.code === "CAT-GOLD22K");
      const silverCategory = categoriesList.find(c => c.code === "CAT-SILVER");
      const diamondCategory = categoriesList.find(c => c.code === "CAT-DIAMOND");
      
      const sampleProducts = [
        {
          name: "Gold Chain 22K",
          barcodeNumber: "GLD-CHN-001",
          type: "No stone",
          purity: "22K",
          stoneWeight: null,
          netWeight: "15.50",
          grossWeight: "16.25",
          dealerId: dealersList[0].id,
          makingChargeType: "Per Gram",
          makingChargeValue: "200.00",
          wastageChargeType: "Percentage", 
          wastageChargeValue: "8.00",
          additionalCost: "0.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        },
        {
          name: "Silver Bracelet",
          barcodeNumber: "SLV-BRC-001",
          type: "No stone",
          purity: "925",
          stoneWeight: null,
          netWeight: "25.00",
          grossWeight: "25.50",
          dealerId: dealersList[2].id,
          makingChargeType: "Fixed Amount",
          makingChargeValue: "500.00",
          wastageChargeType: "Fixed Amount",
          wastageChargeValue: "100.00",
          additionalCost: "0.00",
          centralGovtNumber: null,
          categoryId: silverCategory?.id || null
        },
        {
          name: "Diamond Ring",
          barcodeNumber: "DMD-RNG-001",
          type: "Diamond Stone", 
          purity: "18K",
          stoneWeight: "1.50",
          netWeight: "6.75",
          grossWeight: "8.25",
          dealerId: dealersList[1].id,
          makingChargeType: "Percentage",
          makingChargeValue: "20.00",
          wastageChargeType: "Fixed Amount",
          wastageChargeValue: "1000.00",
          additionalCost: "0.00",
          centralGovtNumber: "IGI123456789",
          categoryId: diamondCategory?.id || null
        },
        {
          name: "Gold Earrings 22K",
          barcodeNumber: "GLD-EAR-001",
          type: "No stone",
          purity: "22K",
          stoneWeight: null,
          netWeight: "11.50",
          grossWeight: "12.75",
          dealerId: dealersList[0].id,
          makingChargeType: "Per Gram", 
          makingChargeValue: "250.00",
          wastageChargeType: "Percentage",
          wastageChargeValue: "10.00",
          additionalCost: "0.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        }
      ];      for (const product of sampleProducts) {
        await db.insert(products).values(product);
        console.log(`Created product: ${product.name} (${product.barcodeNumber})`);
      }
      console.log("Sample products seeded");
    }

    // Seed saving schemes if not exists
    const existingSchemes = await db.select().from(savingSchemeMaster).limit(1);
    if (existingSchemes.length === 0) {
      const sampleSchemes = [
        {
          schemeName: "11-Month Gold Plan",
          totalMonths: 11,
          description: "Pay for 11 months and get gold equivalent to 12 months value",
          termsAndConditions: "1. Monthly payment must be made before 10th of each month\n2. Scheme matures after 11 successful payments\n3. Gold rate will be calculated at the time of purchase\n4. Making charges applicable as per current rates\n5. Scheme cannot be transferred to another person"
        },
        {
          schemeName: "24-Month Premium Plan",
          totalMonths: 24,
          description: "Extended plan with additional benefits and lower making charges",
          termsAndConditions: "1. Monthly payment must be made before 10th of each month\n2. Scheme matures after 24 successful payments\n3. 10% discount on making charges\n4. Gold rate locked for final 6 months\n5. Option to extend scheme for additional months"
        },
        {
          schemeName: "6-Month Quick Plan", 
          totalMonths: 6,
          description: "Short-term plan for quick gold accumulation",
          termsAndConditions: "1. Higher monthly commitment required\n2. Scheme matures after 6 successful payments\n3. Standard making charges applicable\n4. Gold rate calculated at purchase time\n5. Early closure penalty of 2% if closed before maturity"
        }
      ];

      for (const scheme of sampleSchemes) {
        await db.insert(savingSchemeMaster).values(scheme);
        console.log(`Created saving scheme: ${scheme.schemeName} (${scheme.totalMonths} months)`);
      }
      console.log("Sample saving schemes seeded");
    }

  // ------------------------------------------------------------------
  // Extended Demo Data (Purchase Orders, Items, Stock, Enrollments)
  // ------------------------------------------------------------------

    // Seed sample purchase orders (only if none exist)
    const existingPO = await db.select().from(purchaseOrders).limit(1);
    if (existingPO.length === 0) {
      console.log("Seeding sample purchase orders...");
      const allProducts = await db.select().from(products);
      const allCustomers = await db.select().from(customers);
      const allCategories = await db.select().from(productCategories);
      const allPrices = await db.select().from(priceMaster);

  const latestPriceForCategory = (catId: number) => {
        // Filter and pick max effective date
        const perCat = allPrices.filter(p => p.categoryId === catId);
        if (perCat.length === 0) return null;
        return perCat.sort((a,b)=> new Date(b.effectiveDate as any).getTime() - new Date(a.effectiveDate as any).getTime())[0];
  };

      const customer = allCustomers[0];
      if (customer) {
        const chosenProducts = allProducts.slice(0, 2); // first two products for demo
        if (chosenProducts.length > 0) {
          const orderNumber = await generateOrderNumberLocal();
          let totalAmount = 0;

          // Prepare items
            const preparedItems: any[] = [];
          for (const p of chosenProducts) {
            if (!p.categoryId) continue;
            const priceRow = latestPriceForCategory(p.categoryId);
            if (!priceRow) continue;
            const cat = allCategories.find(c => c.id === p.categoryId);
            const taxPct = cat ? parseFloat(String(cat.taxPercentage)) : 0;
            const netWeightNum = parseFloat(String(p.netWeight || '0')) || 0;
            const grossWeightNum = parseFloat(String(p.grossWeight || '0')) || 0;
            const pricePerGram = parseFloat(String(priceRow.pricePerGram));
            
            // Use the comprehensive pricing utility
            const stoneWeight = parseFloat(String(p.stoneWeight || '0')) || 0;
            const stoneValue = stoneWeight * 1000; // Assume ₹1000 per gram for stone value
            
            const inputs = productToPriceInputs(p, pricePerGram, taxPct, 1, stoneValue);
            const breakdown = computeFinalPrice(inputs);
            
            totalAmount += breakdown.final_price;
            preparedItems.push({
              productId: p.id,
              quantity: 1,
              purity: p.purity,
              goldRatePerGram: pricePerGram.toFixed(2),
              netWeight: netWeightNum.toFixed(3),
              grossWeight: grossWeightNum.toFixed(3),
              labourRatePerGram: (breakdown.making_charge / Math.max(netWeightNum, 1)).toFixed(2), // Calculate equivalent labour rate for compatibility
              additionalCost: breakdown.additional_cost.toFixed(2),
              basePrice: breakdown.subtotal.toFixed(2),
              gstPercentage: taxPct.toFixed(2),
              gstAmount: breakdown.gst_amount.toFixed(2),
              totalPrice: breakdown.final_price.toFixed(2)
            });
          }

          if (preparedItems.length > 0) {
            const [po] = await db.insert(purchaseOrders).values({
              invoiceNumber: `INV-${orderNumber}`,
              orderNumber,
              customerId: customer.id,
              orderDate: new Date().toISOString().split('T')[0],
              status: 'pending',
              subTotal: totalAmount.toFixed(2),
              totalAmount: totalAmount.toFixed(2),
              totalGoldGrossWeight: '0.00',
              grandTotal: totalAmount.toFixed(2),
              gstAmount: '0.00',
              advanceAmount: '0.00',
              outstandingAmount: totalAmount.toFixed(2),
              createdBy: 1,
              updatedBy: 1,
            }).returning();

            // Attach order id to items and insert
            const itemsToInsert = preparedItems.map(i => ({ ...i, purchaseOrderId: po.id }));
            await db.insert(purchaseOrderItems).values(itemsToInsert);

            // Simple audit log
            await db.insert(purchaseOrderAuditLog).values({
              purchaseOrderId: po.id,
              updatedBy: 1,
              changes: { action: 'created-seed', itemCount: preparedItems.length, totalAmount: totalAmount.toFixed(2) }
            });
            console.log(`Created sample purchase order ${orderNumber} with ${preparedItems.length} items.`);
          }
        }
      }
    }

    // Seed stock movements (if none)
    const existingStock = await db.select().from(stockMovements).limit(1);
    if (existingStock.length === 0) {
      const productList = await db.select().from(products);
      const priceRows = await db.select().from(priceMaster);
      for (const p of productList) {
        if (!p.categoryId) continue;
        const latestPrice = priceRows.filter(r => r.categoryId === p.categoryId)
          .sort((a,b)=> new Date(b.effectiveDate as any).getTime() - new Date(a.effectiveDate as any).getTime())[0];
        const weightNum = parseFloat(String(p.netWeight || '0')) || 0;
        if (!latestPrice || weightNum === 0) continue;
        await db.insert(stockMovements).values({
          productId: p.id,
          type: 'in',
          weight: weightNum.toFixed(3),
          rateAtTime: latestPrice.pricePerGram,
          reference: 'INITIAL-STOCK'
        });
      }
      console.log('Stock movements seeded for existing products');
    }

    // Seed a sample scheme enrollment + payments (if none)
    const existingEnrollment = await db.select().from(customerEnrollments).limit(1);
    if (existingEnrollment.length === 0) {
      const firstCustomer = await db.select().from(customers).limit(1);
      const firstScheme = await db.select().from(savingSchemeMaster).limit(1);
      if (firstCustomer.length && firstScheme.length) {
        const cardNumber = await generateCardNumberLocal();
        const monthlyAmount = '5000.00';
        const startDate = new Date().toISOString().split('T')[0];
        const [enrollment] = await db.insert(customerEnrollments).values({
          customerId: firstCustomer[0].id,
          schemeId: firstScheme[0].id,
          monthlyAmount,
          startDate,
          cardNumber,
          status: 'Active'
        }).returning();
        console.log(`Created sample scheme enrollment ${cardNumber}`);

        // Create two monthly payments
        const goldCat = await db.select().from(productCategories).where(eq(productCategories.code, 'CAT-GOLD22K')).limit(1);
        let goldRate = '6500.00';
        if (goldCat.length) {
          const rateRow = await db.select().from(priceMaster).where(eq(priceMaster.categoryId, goldCat[0].id)).orderBy(desc(priceMaster.effectiveDate)).limit(1);
          if (rateRow.length) goldRate = String(rateRow[0].pricePerGram);
        }
        const goldRateNum = parseFloat(goldRate);
        for (let m = 1; m <= 2; m++) {
          const goldGrams = (5000 / goldRateNum).toFixed(3);
          await db.insert(monthlyPayments).values({
            enrollmentId: enrollment.id,
            paymentDate: startDate,
            amount: monthlyAmount,
            goldRate: goldRateNum.toFixed(2),
            goldGrams,
            monthNumber: m
          });
        }
        console.log('Created 2 sample monthly payments for enrollment');
      }
    }

    // Seed company settings (if none exist)
    const existingCompanySettings = await db.select().from(companySettings).limit(1);
    if (existingCompanySettings.length === 0) {
      await db.insert(companySettings).values({
        companyName: "Golden Jewellers",
        address: "123 Jewelry Street, Gold Market\nMumbai, Maharashtra 400001\nIndia",
        gstNumber: "27AABCU9603R1ZM",
        website: "www.goldenjewellers.com",
        phone: "+91 98765 43210",
        email: "info@goldenjewellers.com",
        logo: null,
        invoiceTerms: "1. All purchases are subject to our standard terms and conditions.\n2. GST is applicable as per government rates.\n3. Returns accepted within 7 days with original receipt.",
        bankDetails: JSON.stringify({
          bankName: "State Bank of India",
          accountNumber: "1234567890",
          ifscCode: "SBIN0001234",
          accountHolderName: "Golden Jewellers"
        })
      });
      console.log("✅ Company settings seeded");
    }

    // Seed discount rules (if none exist)
    const existingDiscountRules = await db.select().from(discountRules).limit(1);
    if (existingDiscountRules.length === 0) {
      const discountRulesSeed = [
        {
          name: "VIP Customer Making Charge Discount",
          type: "making_charge",
          calculationType: "percentage",
          value: "5.00",
          minOrderAmount: "50000.00",
          startDate: new Date().toISOString().split('T')[0],
          isActive: true
        },
        {
          name: "Bulk Order Gold Value Discount",
          type: "gold_value", 
          calculationType: "percentage",
          value: "3.00",
          minOrderAmount: "100000.00",
          startDate: new Date().toISOString().split('T')[0],
          isActive: true
        },
        {
          name: "Festival Special Total Discount",
          type: "order_total",
          calculationType: "fixed_amount",
          value: "2000.00",
          minOrderAmount: "75000.00",
          maxDiscountAmount: "5000.00",
          startDate: new Date().toISOString().split('T')[0],
          isActive: false
        }
      ];

      for (const rule of discountRulesSeed) {
        await db.insert(discountRules).values(rule);
      }
      console.log("✅ Discount rules seeded");
    }

    console.log("Initial data seeding completed");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}

// Run if called directly  
if (import.meta.url === `file://${process.argv[1]}`) {
  seedInitialData().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}