// Quick test script to add sample data
import { createStorage } from './server/storage.js';

const storage = createStorage();

async function addTestData() {
  try {
    console.log("Adding test price data...");
    
    // Get categories
    const categories = await storage.getProductCategories();
    console.log("Found categories:", categories);
    
    if (categories.length === 0) {
      console.log("No categories found. Please ensure categories exist first.");
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Add sample prices for today
    const samplePrices = categories.slice(0, 3).map((category, index) => ({
      categoryId: category.id,
      pricePerGram: (5000 + (index * 500)).toString(), // 5000, 5500, 6000
      effectiveDate: today
    }));
    
    console.log("Adding prices:", samplePrices);
    
    const result = await storage.createPriceMaster(samplePrices);
    console.log("Added prices:", result);
    
    // Test getCurrentPrices
    const currentPrices = await storage.getCurrentPrices();
    console.log("Current prices:", currentPrices);
    
  } catch (error) {
    console.error("Error adding test data:", error);
  }
}

addTestData();
