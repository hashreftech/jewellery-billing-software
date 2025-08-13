import { db } from './server/db.ts';
import { employees } from './shared/schema.ts';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function migratePasswords() {
  console.log('Starting password migration to hashed format...');
  
  try {
    // Get all employees with unhashed passwords
    const allEmployees = await db.select().from(employees);
    
    const unhashed = allEmployees.filter(emp => 
      emp.password && !emp.password.includes('.')
    );
    
    console.log(`Found ${unhashed.length} employees with unhashed passwords`);
    
    if (unhashed.length === 0) {
      console.log('All passwords are already hashed. No migration needed.');
      return;
    }
    
    // Update each unhashed password
    for (const employee of unhashed) {
      console.log(`Updating password for ${employee.empCode} (${employee.name})`);
      
      const hashedPassword = await hashPassword(employee.password);
      
      await db
        .update(employees)
        .set({ password: hashedPassword })
        .where({ id: employee.id });
      
      console.log(`✓ Updated ${employee.empCode}`);
    }
    
    console.log(`\n✅ Successfully migrated ${unhashed.length} passwords to hashed format`);
    console.log('All user passwords are now securely hashed with salt.');
    
  } catch (error) {
    console.error('❌ Error during password migration:', error);
    process.exit(1);
  }
}

// Run the migration
migratePasswords();
