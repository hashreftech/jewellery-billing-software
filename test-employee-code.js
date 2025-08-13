// Simple test script to verify employee code generation
import { db } from "./server/db.js";
import { employees } from "./shared/schema.js";
import { like } from "drizzle-orm";

async function testEmployeeCodeGeneration() {
  try {
    console.log("Testing employee code generation...");
    
    // Get all employee codes that follow the EMP-XXX pattern
    const existingEmployees = await db
      .select({ empCode: employees.empCode })
      .from(employees)
      .where(like(employees.empCode, 'EMP-%'));
    
    console.log("Existing employee codes:", existingEmployees.map(e => e.empCode));
    
    // Extract numeric parts and find the highest number
    let highestNumber = 0;
    for (const emp of existingEmployees) {
      const match = emp.empCode.match(/^EMP-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        console.log(`Found EMP code: ${emp.empCode} -> number: ${num}`);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    }
    
    // Generate next code with zero-padded number
    const nextNumber = highestNumber + 1;
    const nextCode = `EMP-${nextNumber.toString().padStart(3, '0')}`;
    
    console.log(`Highest number found: ${highestNumber}`);
    console.log(`Next employee code: ${nextCode}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testEmployeeCodeGeneration();
