#!/usr/bin/env node
/**
 * Complete System Test Script
 * Tests all components of the jewelry shop management system including new invoice features
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Starting Complete System Test...\n');

// Helper function to run database queries
function runQuery(query, description) {
  console.log(`📊 ${description}...`);
  try {
    const result = execSync(`psql "${process.env.DATABASE_URL}" -c "${query}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(result);
    console.log('✅ Success\n');
    return result;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}\n`);
    return null;
  }
}

// Helper function to test API endpoints
function testAPI(endpoint, description) {
  console.log(`🌐 ${description}...`);
  try {
    const result = execSync(`curl -s "http://localhost:3001${endpoint}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.startsWith('<') || result.includes('Cannot')) {
      console.log('❌ API returned error or HTML');
      console.log(result.substring(0, 200) + '...\n');
      return null;
    }
    
    try {
      const jsonData = JSON.parse(result);
      console.log(`✅ Success - Got ${Array.isArray(jsonData) ? jsonData.length : 'single'} record(s)`);
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('📋 Sample record fields:', Object.keys(jsonData[0]).join(', '));
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        console.log('📋 Record fields:', Object.keys(jsonData).join(', '));
      }
      console.log('');
      return jsonData;
    } catch (parseError) {
      console.log('❌ Invalid JSON response');
      console.log(result.substring(0, 200) + '...\n');
      return null;
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`);
    return null;
  }
}

// Test 1: Database Schema Validation
console.log('=== DATABASE SCHEMA TESTS ===\n');

runQuery(
  "SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name IN ('products', 'purchase_orders', 'company_settings', 'discount_rules', 'payment_transactions') ORDER BY table_name, ordinal_position;",
  "Validating database schema for core tables"
);

// Test 2: Products Data Validation
console.log('=== PRODUCTS DATA TESTS ===\n');

runQuery(
  "SELECT id, name, purity, net_weight, gross_weight, labour_rate_per_gram, making_charge_type, making_charge_value FROM products;",
  "Checking products table data with new invoice fields"
);

runQuery(
  "SELECT COUNT(*) as total_products, COUNT(CASE WHEN net_weight IS NOT NULL THEN 1 END) as with_net_weight, COUNT(CASE WHEN labour_rate_per_gram IS NOT NULL THEN 1 END) as with_labour_rate FROM products;",
  "Validating products have required weight and labour rate data"
);

// Test 3: Invoice System Tables
console.log('=== INVOICE SYSTEM TESTS ===\n');

runQuery(
  "SELECT id, company_name, gst_number, phone, email FROM company_settings LIMIT 1;",
  "Checking company settings for invoice generation"
);

runQuery(
  "SELECT id, name, type, calculation_type, value, min_order_amount, is_active FROM discount_rules;",
  "Checking discount rules configuration"
);

runQuery(
  "SELECT COUNT(*) as total_orders, COUNT(CASE WHEN invoice_number IS NOT NULL THEN 1 END) as with_invoice_number FROM purchase_orders;",
  "Validating purchase orders have invoice capabilities"
);

// Test 4: API Endpoints
console.log('=== API ENDPOINTS TESTS ===\n');

testAPI('/api/products', 'Testing products API endpoint');
testAPI('/api/company-settings', 'Testing company settings API endpoint');
testAPI('/api/discount-rules', 'Testing discount rules API endpoint');
testAPI('/api/purchase-orders', 'Testing purchase orders API endpoint');

// Test 5: Detailed Products API Response
console.log('=== DETAILED API RESPONSE TESTS ===\n');

const productsData = testAPI('/api/products', 'Getting detailed products data');
if (productsData && Array.isArray(productsData) && productsData.length > 0) {
  const sampleProduct = productsData[0];
  console.log('🔍 Sample Product Analysis:');
  console.log(`   - Name: ${sampleProduct.name}`);
  console.log(`   - Purity: ${sampleProduct.purity || 'N/A'}`);
  console.log(`   - Weight: ${sampleProduct.weight || 'N/A'} (from netWeight field)`);
  console.log(`   - Gross Weight: ${sampleProduct.grossWeight || 'N/A'}`);
  console.log(`   - Labour Rate: ${sampleProduct.labourRatePerGram || 'N/A'}`);
  console.log(`   - Making Charge: ${sampleProduct.makingChargeValue || 'N/A'} (${sampleProduct.makingChargeType || 'N/A'})`);
  console.log(`   - Additional Cost: ${sampleProduct.additionalCost || 'N/A'}`);
  
  // Check for NaN values
  const numericFields = ['weight', 'grossWeight', 'labourRatePerGram', 'makingChargeValue', 'additionalCost'];
  const nanFields = numericFields.filter(field => {
    const value = sampleProduct[field];
    return value !== null && value !== undefined && isNaN(Number(value));
  });
  
  if (nanFields.length > 0) {
    console.log(`   ❌ NaN values detected in fields: ${nanFields.join(', ')}`);
  } else {
    console.log('   ✅ All numeric fields have valid values');
  }
  console.log('');
}

// Test 6: Invoice Generation Test
console.log('=== INVOICE GENERATION TESTS ===\n');

const orders = testAPI('/api/purchase-orders', 'Getting purchase orders for invoice testing');
if (orders && Array.isArray(orders) && orders.length > 0) {
  const firstOrderId = orders[0].id;
  testAPI(`/api/invoices/${firstOrderId}`, `Testing invoice generation for order ${firstOrderId}`);
  testAPI(`/api/invoices/${firstOrderId}?format=json`, `Testing JSON invoice format for order ${firstOrderId}`);
}

console.log('=== SYSTEM TEST COMPLETED ===\n');
console.log('🎉 Complete system test finished!');
console.log('📊 Review the results above to ensure all components are working correctly.');
console.log('💡 If any tests failed, check the database setup and API server status.');
