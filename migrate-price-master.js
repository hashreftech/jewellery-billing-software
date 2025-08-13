import { db } from './server/db.ts';

async function migratePriceMaster() {
  try {
    console.log('Starting price_master migration...');
    
    // Step 1: Add category_id column with default value
    console.log('Adding category_id column with default value 1 (Gold 22K)...');
    await db.execute(`
      ALTER TABLE price_master 
      ADD COLUMN category_id INTEGER DEFAULT 1 NOT NULL;
    `);
    
    // Step 2: Add foreign key constraint
    console.log('Adding foreign key constraint...');
    await db.execute(`
      ALTER TABLE price_master 
      ADD CONSTRAINT price_master_category_id_fkey 
      FOREIGN KEY (category_id) REFERENCES product_categories(id);
    `);
    
    // Step 3: Add index for better performance
    console.log('Adding index on (category_id, effective_date)...');
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_price_master_category_date 
      ON price_master(category_id, effective_date);
    `);
    
    console.log('Migration completed successfully!');
    console.log('All existing price records are now assigned to Gold 22K category (ID: 1)');
    console.log('You can manually update specific records to other categories if needed.');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
  process.exit(0);
}

migratePriceMaster();
