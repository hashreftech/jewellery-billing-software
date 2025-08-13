import { db } from "./db";
import { productCategories, priceMaster } from "@shared/schema";

async function seedJewelTypesAndCategories() {
  try {
    console.log("Starting direct seed of jewel types and categories...");
    
    // We need to be more careful about clearing related tables first to avoid foreign key constraint issues
    console.log("Checking for existing categories and related data...");
    
    // We're using SQL directly, so we don't need schema imports here
    
    try {
      // Delete related data in correct order to respect foreign key constraints
      // console.log("Clearing price_master table...");
      // await db.execute('DELETE FROM price_master');
      
      console.log("Clearing products table...");
      await db.execute('DELETE FROM products');
      
      console.log("Clearing product_categories table...");
      await db.execute('DELETE FROM product_categories');
  
    } catch (err) {
      console.log("Error clearing tables:", err);
      console.log("Continuing with seeding anyway...")
    }
    
    console.log("Existing data cleared. Creating new categories...");
    
    // Create jewel types with explicit IDs to ensure correct references
    // Note: jewelTypes table is commented out as it may not exist in current schema
    /*
    const jewelTypesData = [
      { id: 1, code: "GOLD22K", name: "Gold 22K", carat: 22 },
      { id: 2, code: "GOLD18K", name: "Gold 18K", carat: 18 },
      { id: 3, code: "SILVER", name: "Silver", carat: null },
      { id: 4, code: "DIAMOND", name: "Diamond", carat: null },
      { id: 5, code: "PLATINUM", name: "Platinum", carat: null },
    ];
    
    for (const jewelType of jewelTypesData) {
      await db.insert(jewelTypes).values(jewelType);
      console.log(`Created jewel type: ${jewelType.name} with ID ${jewelType.id}`);
    }
    */

    console.log("Creating product categories...");
    
    // Create product categories with correct references to jewel types
    const categoriesData = [
      {
        name: "Gold 22K Jewelry",
        code: "CAT-GOLD22K",
        jewelTypeId: 1,
        hsnCode: "71131900",
        taxPercentage: "3.00"
      },
      {
        name: "Gold 18K Jewelry",
        code: "CAT-GOLD18K", 
        jewelTypeId: 2,
        hsnCode: "71131900",
        taxPercentage: "3.00"
      },
      {
        name: "Silver Jewelry",
        code: "CAT-SILVER",
        jewelTypeId: 3,
        hsnCode: "71131100",
        taxPercentage: "3.00"
      },
      {
        name: "Diamond Jewelry",
        code: "CAT-DIAMOND",
        jewelTypeId: 4,
        hsnCode: "71131910",
        taxPercentage: "0.25"
      },
      {
        name: "Platinum Jewelry",
        code: "CAT-PLATINUM",
        jewelTypeId: 5,
        hsnCode: "71131920",
        taxPercentage: "3.00"
      }
    ];
    
    for (const category of categoriesData) {
      await db.insert(productCategories).values(category);
      console.log(`Created product category: ${category.name} with code ${category.code}`);
    }
    
    console.log("Creating sample prices...");
    
    // Add sample prices for testing
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const samplePrices = [
      // Today's prices for first few categories
      { categoryId: 1, pricePerGram: "6500.00", effectiveDate: today },
      { categoryId: 2, pricePerGram: "6200.50", effectiveDate: today },
      { categoryId: 3, pricePerGram: "150.75", effectiveDate: today },
      // Yesterday's prices 
      { categoryId: 1, pricePerGram: "6450.00", effectiveDate: yesterday },
      { categoryId: 2, pricePerGram: "6150.25", effectiveDate: yesterday },
      { categoryId: 3, pricePerGram: "148.50", effectiveDate: yesterday },
    ];
    
    for (const price of samplePrices) {
      await db.insert(priceMaster).values(price);
      console.log(`Added sample price for category ${price.categoryId}: ${price.pricePerGram} on ${price.effectiveDate}`);
    }
    
    console.log("Direct seeding completed successfully");
  } catch (error) {
    console.error("Error in direct seeding:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedJewelTypesAndCategories()
    .then(() => {
      console.log("✅ Direct seed completed");
      process.exit(0);
    })
    .catch(err => {
      console.error("❌ Direct seed failed:", err);
      process.exit(1);
    });
}

export { seedJewelTypesAndCategories };
