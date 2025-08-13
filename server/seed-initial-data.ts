import { db } from "./db";
import { 
  employees, 
  productCategories, 
  dealers, 
  customers, 
  products, 
  savingSchemeMaster, 
  priceMaster 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPasswordForSeed } from "./auth";

export async function seedInitialData() {
  try {
    console.log("Seeding initial data...");

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
      // Get categories first
      const categories = await db.select().from(productCategories);
      
      if (categories.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const samplePrices = [
          // Today's prices
          { categoryId: categories[0].id, effectiveDate: today, pricePerGram: "6500.00" },
          { categoryId: categories[1]?.id || categories[0].id, effectiveDate: today, pricePerGram: "6200.50" },
          { categoryId: categories[2]?.id || categories[0].id, effectiveDate: today, pricePerGram: "150.75" },
          // Yesterday's prices
          { categoryId: categories[0].id, effectiveDate: yesterday, pricePerGram: "6450.00" },
          { categoryId: categories[1]?.id || categories[0].id, effectiveDate: yesterday, pricePerGram: "6150.25" },
          { categoryId: categories[2]?.id || categories[0].id, effectiveDate: yesterday, pricePerGram: "148.50" },
        ];

        for (const price of samplePrices) {
          await db.insert(priceMaster).values(price);
          console.log(`Created price for category ${price.categoryId}: ₹${price.pricePerGram}/gram on ${price.effectiveDate}`);
        }
        console.log("Sample price master seeded");
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
          stoneWeight: null,
          dealerId: dealersList[0].id,
          weight: "15.50",
          makingChargeType: "Per Gram",
          makingChargeValue: "150.00",
          wastageChargeType: "Percentage", 
          wastageChargeValue: "8.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        },
        {
          name: "Silver Bracelet",
          barcodeNumber: "SLV-BRC-001", 
          type: "Stone",
          stoneWeight: "2.25",
          dealerId: dealersList[2].id,
          weight: "25.75",
          makingChargeType: "Fixed Amount",
          makingChargeValue: "500.00",
          wastageChargeType: "Per Piece",
          wastageChargeValue: "50.00",
          centralGovtNumber: null,
          categoryId: silverCategory?.id || null
        },
        {
          name: "Diamond Ring",
          barcodeNumber: "DMD-RNG-001",
          type: "Diamond Stone", 
          stoneWeight: "1.50",
          dealerId: dealersList[1].id,
          weight: "8.25",
          makingChargeType: "Percentage",
          makingChargeValue: "20.00",
          wastageChargeType: "Fixed Amount",
          wastageChargeValue: "1000.00",
          centralGovtNumber: "IGI123456789",
          categoryId: diamondCategory?.id || null
        },
        {
          name: "Gold Earrings 22K",
          barcodeNumber: "GLD-EAR-001",
          type: "No stone",
          stoneWeight: null,
          dealerId: dealersList[0].id,
          weight: "12.75",
          makingChargeType: "Per Gram", 
          makingChargeValue: "200.00",
          wastageChargeType: "Percentage",
          wastageChargeValue: "10.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        }
      ];

      for (const product of sampleProducts) {
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