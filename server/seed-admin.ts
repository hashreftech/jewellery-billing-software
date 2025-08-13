import { storage } from "./storage";
import { hashPasswordForSeed } from "./auth";

export async function createAdminUser() {
  try {
    // Check if admin employee already exists  
    const existingEmployee = await storage.getEmployeeByEmpCode("admin");
    if (existingEmployee) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin employee with login capability
    const hashedPassword = await hashPasswordForSeed("admin123");
    
    const adminEmployee = await storage.createEmployee({
      empCode: "admin",
      name: "Administrator",
      phone: "9999999999",
      email: "admin@jewelry.com",
      role: "admin",
      photo: null,
      password: hashedPassword,
      status: "Active",
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}