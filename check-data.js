import { db } from './server/db.ts';
import { priceMaster, productCategories } from './shared/schema.ts';

async function checkData() {
  try {
    console.log('Checking migrated price_master data...');
    const result = await db.select().from(priceMaster);
    console.log('Existing records:', result.length);
    if (result.length > 0) {
      console.log('Sample migrated record:', result[0]);
    }
    
    console.log('\nUpdated price_master columns:');
    const schemaResult = await db.execute(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'price_master' ORDER BY ordinal_position;`);
    schemaResult.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkData();
