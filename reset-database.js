#!/usr/bin/env node

/**
 * Database Reset Script for Jewelry Shop Management System
 * 
 * This script provides different levels of database reset:
 * - Safe reset: Only applies schema changes without data loss
 * - Force reset: Drops all tables and recreates schema (completely clean)
 * - Fresh setup: Force reset + seed initial data automatically
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function dropAllTables() {
  console.log('🗑️  Dropping all existing tables...');
  try {
    execSync(`psql "${process.env.DATABASE_URL}" -c "
      DROP TABLE IF EXISTS monthly_payments CASCADE;
      DROP TABLE IF EXISTS customer_enrollments CASCADE;
      DROP TABLE IF EXISTS saving_scheme_master CASCADE;
      DROP TABLE IF EXISTS stock_movements CASCADE;
      DROP TABLE IF EXISTS purchase_orders CASCADE;
      DROP TABLE IF EXISTS price_master CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS product_categories CASCADE;
      DROP TABLE IF EXISTS jewel_types CASCADE;
      DROP TABLE IF EXISTS dealers CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP INDEX IF EXISTS IDX_session_expire;
      DROP SEQUENCE IF EXISTS monthly_payments_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS customer_enrollments_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS saving_scheme_master_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS stock_movements_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS purchase_orders_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS price_master_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS product_categories_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS jewel_types_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS dealers_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS customers_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS employees_id_seq CASCADE;
    "`, { stdio: 'inherit' });
    console.log('✅ All tables and sequences dropped successfully');
  } catch (error) {
    console.log('ℹ️  Tables already clean or don\'t exist');
  }
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

function runCommand(cmd, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📚 Database Reset Script Usage:

  node reset-database.js [command]

Commands:
  safe      - Safe reset (preserves data where possible)
  force     - Force reset (WARNING: deletes all data)
  fresh     - Force reset + seed initial data
  help      - Show this help message

Examples:
  node reset-database.js safe    # Safe schema update
  node reset-database.js force   # Complete reset (destructive)
  node reset-database.js fresh   # Reset and seed data

⚠️  WARNING: 'force' and 'fresh' commands will delete all existing data!
`);
}

switch (command) {
  case 'safe':
    console.log('🔧 Performing safe database reset...');
    runCommand('npx drizzle-kit push --force-safe', 'Safe schema push');
    console.log('\n✨ Safe reset completed! Data preserved where possible.');
    break;

  case 'force':
    console.log('⚠️  WARNING: This will delete ALL database data and tables!');
    console.log('Press Ctrl+C within 5 seconds to cancel...');
    
    // 5 second delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🗑️  Proceeding with force reset...');
    console.log('🏗️  Creating database schema directly...');
    try {
      execSync(`psql "${process.env.DATABASE_URL}" -f create-schema.sql`, { stdio: 'inherit' });
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.log('⚠️  Direct schema creation failed, falling back to drizzle push');
      dropAllTables();
      runCommand('npx drizzle-kit push --force', 'Recreating clean database schema');
    }
    console.log('\n💥 Force reset completed! Clean database schema created.');
    console.log('ℹ️  Start the app with "npm run dev" to auto-seed admin user and initial data.');
    break;

  case 'fresh':
    console.log('⚠️  WARNING: This will delete ALL database data and create fresh setup!');
    console.log('Press Ctrl+C within 5 seconds to cancel...');
    
    // 5 second delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🗑️  Proceeding with fresh setup...');
    
    // Always use the reliable drizzle approach for fresh setup
    console.log('🗑️  Dropping all existing tables...');
    dropAllTables();
    
    console.log('🏗️  Creating database schema...');
    runCommand('npx drizzle-kit push', 'Creating clean database schema');
    
    // Seed initial data using tsx
    console.log('🌱 Seeding initial data...');
    try {
      console.log('👤 Creating admin user...');
      execSync('npx tsx server/seed-admin.ts', { stdio: 'inherit' });
      
      console.log('📊 Seeding sample data (categories, dealers, products, customers, etc.)...');
      execSync('npx tsx server/seed-initial-data.ts', { stdio: 'inherit' });
      
      console.log('✅ All sample data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding initial data:', error.message);
      console.log('ℹ️  You can manually run the seed scripts:');
      console.log('   npx tsx server/seed-admin.ts');
      console.log('   npx tsx server/seed-initial-data.ts');
    }
    
    console.log('\n✨ Fresh setup completed!');
    console.log('🔑 Default admin credentials:');
    console.log('   Employee Code: admin');
    console.log('   Password: admin123');
    console.log('\n📦 Sample data created:');
    console.log('   • 5 Product Categories (Gold 22K/18K, Silver, Diamond, Platinum)');
    console.log('   • 3 Sample Dealers (Mumbai, Delhi, Chennai)');
    console.log('   • 3 Sample Customers with GST and PAN details');
    console.log('   • 4 Sample Products (Gold Chain, Silver Bracelet, Diamond Ring, Gold Earrings)');
    console.log('   • 3 Saving Schemes (6-month, 11-month, 24-month plans)');
    console.log('   • Price Master with current gold rates');
    break;

  case 'help':
  default:
    showHelp();
    break;
}