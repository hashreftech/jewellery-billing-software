import {
  employees,
  customers,
  dealers,
  productCategories,
  products,
  priceMaster,
  purchaseOrders,
  purchaseOrderItems,
  purchaseOrderAuditLog,
  paymentTransactions,
  discountRules,
  companySettings,
  stockMovements,
  savingSchemeMaster,
  customerEnrollments,
  monthlyPayments,
  type Employee,
  type InsertEmployee,
  type Customer,
  type InsertCustomer,
  type Dealer,
  type InsertDealer,
  type ProductCategory,
  type InsertProductCategory,
  type Product,
  type InsertProduct,
  type PriceMaster,
  type InsertPriceMaster,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type PurchaseOrderItem,
  type InsertPurchaseOrderItem,
  type PurchaseOrderAuditLog,
  type InsertPurchaseOrderAuditLog,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type DiscountRule,
  type InsertDiscountRule,
  type CompanySettings,
  type InsertCompanySettings,
  type StockMovement,
  type InsertStockMovement,
  type SavingScheme,
  type InsertSavingScheme,
  type CustomerEnrollment,
  type InsertCustomerEnrollment,
  type MonthlyPayment,
  type InsertMonthlyPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql, lt } from "drizzle-orm";

export interface IStorage {
  // Employee operations (also handles authentication)
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmpCode(empCode: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  generateNextEmployeeCode(): Promise<string>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByCustomerId(customerId: string): Promise<Customer | undefined>;
  searchCustomers(query: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Dealer operations
  getDealers(): Promise<Dealer[]>;
  getDealer(id: number): Promise<Dealer | undefined>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  updateDealer(id: number, dealer: Partial<InsertDealer>): Promise<Dealer | undefined>;
  deleteDealer(id: number): Promise<boolean>;

  // Product Category operations
  getProductCategories(): Promise<ProductCategory[]>;
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Price Master operations
  getPriceMaster(offset?: number, limit?: number): Promise<any[]>;
  getPriceMasterForDate(date: string): Promise<any[]>;
  getCurrentPrices(): Promise<any[]>;
  createPriceMaster(prices: InsertPriceMaster[]): Promise<PriceMaster[]>;
  updatePriceMaster(id: number, price: Partial<InsertPriceMaster>): Promise<PriceMaster | undefined>;
  getLastAvailablePrice(categoryId: number, beforeDate: string): Promise<PriceMaster | undefined>;

  // Purchase Order operations
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderWithDetails(id: number): Promise<any>;
  getCustomerOrders(customerId: number): Promise<PurchaseOrder[]>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;
  
  // Purchase Order Items operations
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItems(items: InsertPurchaseOrderItem[]): Promise<PurchaseOrderItem[]>;
  updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: number): Promise<boolean>;
  
  // Purchase Order Audit operations
  createPurchaseOrderAuditLog(auditLog: InsertPurchaseOrderAuditLog): Promise<PurchaseOrderAuditLog>;
  getPurchaseOrderAuditLogs(purchaseOrderId: number): Promise<PurchaseOrderAuditLog[]>;
  
  // Price calculation helpers
  getLatestPriceForCategory(categoryId: number, date?: string): Promise<PriceMaster | undefined>;
  generateOrderNumber(): Promise<string>;

  // Stock Movement operations
  getStockMovements(): Promise<StockMovement[]>;
  getProductStockMovements(productId: number): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // Company settings operations
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings>;

  // Discount rules operations
  getDiscountRules(): Promise<DiscountRule[]>;
  getActiveDiscountRules(): Promise<DiscountRule[]>;
  createDiscountRule(rule: InsertDiscountRule): Promise<DiscountRule>;
  updateDiscountRule(id: number, rule: Partial<InsertDiscountRule>): Promise<DiscountRule>;

  // Payment transaction operations
  getPaymentTransactions(purchaseOrderId: number): Promise<PaymentTransaction[]>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;

  // Saving Scheme operations
  getSavingSchemes(): Promise<SavingScheme[]>;
  getSavingScheme(id: number): Promise<SavingScheme | undefined>;
  createSavingScheme(scheme: InsertSavingScheme): Promise<SavingScheme>;
  updateSavingScheme(id: number, scheme: Partial<InsertSavingScheme>): Promise<SavingScheme | undefined>;

  // Customer Enrollment operations
  getCustomerEnrollments(): Promise<CustomerEnrollment[]>;
  getCustomerEnrollmentsByCustomer(customerId: number): Promise<CustomerEnrollment[]>;
  createCustomerEnrollment(enrollment: InsertCustomerEnrollment): Promise<CustomerEnrollment>;
  updateCustomerEnrollment(id: number, enrollment: Partial<InsertCustomerEnrollment>): Promise<CustomerEnrollment | undefined>;

  // Monthly Payment operations
  getMonthlyPayments(enrollmentId: number): Promise<MonthlyPayment[]>;
  createMonthlyPayment(payment: InsertMonthlyPayment): Promise<MonthlyPayment>;

  // Utility functions
  generateCustomerId(): Promise<string>;
  generateOrderNumber(): Promise<string>;
  generateCardNumber(): Promise<string>;
  getStats(): Promise<{
    totalCustomers: number;
    totalProducts: number;
    monthlySales: number;
    stockValue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Employee operations (also handles authentication)
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByEmpCode(empCode: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.empCode, empCode));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return result.length > 0;
  }

  async generateNextEmployeeCode(): Promise<string> {
    // Get all employee codes that follow the EMP-XXX pattern
    const existingEmployees = await db
      .select({ empCode: employees.empCode })
      .from(employees)
      .where(like(employees.empCode, 'EMP-%'));
    
    // Extract numeric parts and find the highest number
    let highestNumber = 0;
    for (const emp of existingEmployees) {
      const match = emp.empCode.match(/^EMP-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    }
    
    // Generate next code with zero-padded number
    const nextNumber = highestNumber + 1;
    return `EMP-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByCustomerId(customerId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.customerId, customerId));
    return customer;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(
        and(
          sql`${customers.name} ILIKE ${`%${query}%`} OR ${customers.phone} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(asc(customers.name));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customerId = await this.generateCustomerId();
    const customerData = {
      customerId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      address: customer.address || null,
      gstNumber: customer.gstNumber || null,
      panCard: customer.panCard || null,
      dateOfBirth: customer.dateOfBirth || null,
      anniversary: customer.anniversary || null,
    };
    const [newCustomer] = await db
      .insert(customers)
      .values(customerData)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.length > 0;
  }

  // Dealer operations
  async getDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers).orderBy(desc(dealers.createdAt));
  }

  async getDealer(id: number): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }

  async createDealer(dealer: InsertDealer): Promise<Dealer> {
    const [newDealer] = await db.insert(dealers).values(dealer).returning();
    return newDealer;
  }

  async updateDealer(id: number, dealer: Partial<InsertDealer>): Promise<Dealer | undefined> {
    const [updatedDealer] = await db
      .update(dealers)
      .set({ ...dealer, updatedAt: new Date() })
      .where(eq(dealers.id, id))
      .returning();
    return updatedDealer;
  }

  async deleteDealer(id: number): Promise<boolean> {
    const result = await db.delete(dealers).where(eq(dealers.id, id));
    return result.length > 0;
  }

  // Product Category operations
  async getProductCategories(): Promise<ProductCategory[]> {
    return await db.select().from(productCategories).orderBy(asc(productCategories.name));
  }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return category;
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const [newCategory] = await db.insert(productCategories).values(category).returning();
    return newCategory;
  }

  async updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> {
    const [updatedCategory] = await db
      .update(productCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(productCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    // First, fetch the category to check if it's protected
    const category = await db.select().from(productCategories).where(eq(productCategories.id, id)).limit(1);
    
    if (category.length === 0) {
      return false; // Category not found
    }
    
    // Import the protected category codes
    const { PROTECTED_CATEGORY_CODES } = await import("@shared/constants");
    
    // Check if the category is protected
    if (PROTECTED_CATEGORY_CODES.includes(category[0].code)) {
      throw new Error("This category is protected and cannot be deleted. You may edit it but not remove it.");
    }
    
    // Not protected, proceed with deletion
    const result = await db.delete(productCategories).where(eq(productCategories.id, id));
    return result.length > 0;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.barcodeNumber, barcode));
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const pattern = `%${query}%`;
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        barcodeNumber: products.barcodeNumber,
        type: products.type,
        stoneWeight: products.stoneWeight,
        dealerId: products.dealerId,
        weight: products.netWeight, // Updated to use netWeight
        grossWeight: products.grossWeight,
        makingChargeType: products.makingChargeType,
        makingChargeValue: products.makingChargeValue,
        wastageChargeType: products.wastageChargeType,
        wastageChargeValue: products.wastageChargeValue,
        centralGovtNumber: products.centralGovtNumber,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        catId: productCategories.id,
        catName: productCategories.name,
        catCode: productCategories.code,
        catTax: productCategories.taxPercentage,
        catHsn: productCategories.hsnCode,
      })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(sql`${products.name} ILIKE ${pattern} OR ${products.barcodeNumber} ILIKE ${pattern}`)
      .orderBy(asc(products.name))
      .limit(25);

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      barcodeNumber: r.barcodeNumber,
      type: r.type,
      stoneWeight: r.stoneWeight,
      dealerId: r.dealerId,
      weight: r.weight,
      grossWeight: r.grossWeight, // Add the missing grossWeight field
      makingChargeType: r.makingChargeType,
      makingChargeValue: r.makingChargeValue,
      wastageChargeType: r.wastageChargeType,
      wastageChargeValue: r.wastageChargeValue,
      centralGovtNumber: r.centralGovtNumber,
      categoryId: r.categoryId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      category: r.catId ? {
        id: r.catId,
        name: r.catName,
        code: r.catCode,
        taxPercentage: r.catTax,
        hsnCode: r.catHsn,
      } : null
    })) as any[];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const prepared: any = { ...product };
    ['stoneWeight','weight','makingChargeValue','wastageChargeValue'].forEach(k => {
      if (prepared[k] !== undefined && prepared[k] !== null) prepared[k] = prepared[k].toString();
    });
    const [newProduct] = await db.insert(products).values(prepared).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const prepared: any = { ...product, updatedAt: new Date() };
    ['stoneWeight','weight','makingChargeValue','wastageChargeValue'].forEach(k => {
      if (prepared[k] !== undefined && prepared[k] !== null) prepared[k] = prepared[k].toString();
    });
    const [updatedProduct] = await db.update(products).set(prepared).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.length > 0;
  }

  // Price Master operations
  async getPriceMaster(offset: number = 0, limit: number = 30): Promise<any[]> {
    // Get last 30 days (or more with offset) grouped by date with categories as columns
    const result = await db
      .select({
        date: priceMaster.effectiveDate,
        categoryId: priceMaster.categoryId,
        categoryName: productCategories.name,
        pricePerGram: priceMaster.pricePerGram,
        id: priceMaster.id,
        createdAt: priceMaster.createdAt,
      })
      .from(priceMaster)
      .leftJoin(productCategories, eq(priceMaster.categoryId, productCategories.id))
      .orderBy(desc(priceMaster.effectiveDate), asc(productCategories.name))
      .limit(limit * 10) // Rough estimate to get enough data
      .offset(offset * 10);

    // Group by date and transform to table format
    const groupedByDate = result.reduce((acc, row) => {
      const dateKey = row.date;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, categories: {}, createdAt: row.createdAt };
      }
      acc[dateKey].categories[row.categoryName || ''] = {
        id: row.id,
        categoryId: row.categoryId,
        pricePerGram: row.pricePerGram,
      };
      return acc;
    }, {} as any);

    return Object.values(groupedByDate)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getPriceMasterForDate(date: string): Promise<any[]> {
    const categories = await db.select().from(productCategories);
    const result = [];

    for (const category of categories) {
      // Try to get price for exact date first
      let price = await db
        .select()
        .from(priceMaster)
        .where(and(eq(priceMaster.categoryId, category.id), eq(priceMaster.effectiveDate, date)))
        .limit(1);

      // If no price for exact date, get last available price before this date
      if (price.length === 0) {
        price = await db
          .select()
          .from(priceMaster)
          .where(and(eq(priceMaster.categoryId, category.id), lt(priceMaster.effectiveDate, date)))
          .orderBy(desc(priceMaster.effectiveDate))
          .limit(1);
      }

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        pricePerGram: price.length > 0 ? price[0].pricePerGram : null,
        effectiveDate: price.length > 0 ? price[0].effectiveDate : null,
        id: price.length > 0 ? price[0].id : null,
      });
    }

    return result;
  }

  async createPriceMaster(prices: InsertPriceMaster[]): Promise<PriceMaster[]> {
    const results: PriceMaster[] = [];
    
    for (const priceData of prices) {
      // Check if a price already exists for this category and date
      const existingPrice = await db
        .select()
        .from(priceMaster)
        .where(and(
          eq(priceMaster.categoryId, priceData.categoryId),
          eq(priceMaster.effectiveDate, priceData.effectiveDate)
        ))
        .limit(1);

      if (existingPrice.length > 0) {
        // Update existing price
        const [updatedPrice] = await db
          .update(priceMaster)
          .set({ 
            pricePerGram: priceData.pricePerGram,
            updatedAt: new Date() 
          })
          .where(eq(priceMaster.id, existingPrice[0].id))
          .returning();
        results.push(updatedPrice);
      } else {
        // Create new price
        const [newPrice] = await db
          .insert(priceMaster)
          .values(priceData)
          .returning();
        results.push(newPrice);
      }
    }
    
    return results;
  }

  async updatePriceMaster(id: number, price: Partial<InsertPriceMaster>): Promise<PriceMaster | undefined> {
    const [updatedPrice] = await db
      .update(priceMaster)
      .set({ ...price, updatedAt: new Date() })
      .where(eq(priceMaster.id, id))
      .returning();
    return updatedPrice;
  }

  async getLastAvailablePrice(categoryId: number, beforeDate: string): Promise<PriceMaster | undefined> {
    const [price] = await db
      .select()
      .from(priceMaster)
      .where(and(eq(priceMaster.categoryId, categoryId), lt(priceMaster.effectiveDate, beforeDate)))
      .orderBy(desc(priceMaster.effectiveDate))
      .limit(1);
    return price;
  }

  async getCurrentPrices(): Promise<any[]> {
    // Get all categories first
    const categories = await db.select().from(productCategories);
    const result = [];
    const today = new Date().toISOString().split('T')[0];

    for (const category of categories) {
      // Try to get today's price first
      let price = await db
        .select()
        .from(priceMaster)
        .where(and(eq(priceMaster.categoryId, category.id), eq(priceMaster.effectiveDate, today)))
        .limit(1);

      // If no price for today, get the latest available price
      if (price.length === 0) {
        price = await db
          .select()
          .from(priceMaster)
          .where(eq(priceMaster.categoryId, category.id))
          .orderBy(desc(priceMaster.effectiveDate))
          .limit(1);
      }

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        currentPrice: price.length > 0 ? Number(price[0].pricePerGram) : null,
        effectiveDate: price.length > 0 ? price[0].effectiveDate : null,
        isToday: price.length > 0 ? price[0].effectiveDate === today : false,
        lastUpdated: price.length > 0 ? price[0].updatedAt : null,
      });
    }

    return result;
  }

  // Purchase Order operations
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }

  async getCustomerOrders(customerId: number): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.customerId, customerId))
      .orderBy(desc(purchaseOrders.createdAt));
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const orderNumber = await this.generateOrderNumber();
    const [newOrder] = await db
      .insert(purchaseOrders)
      .values({ ...order, orderNumber })
      .returning();
    return newOrder;
  }

  async updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updatedOrder] = await db
      .update(purchaseOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    const result = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    return result.length > 0;
  }

  async getPurchaseOrderWithDetails(id: number): Promise<any> {
    const order = await db
      .select({
        id: purchaseOrders.id,
        orderNumber: purchaseOrders.orderNumber,
        customerId: purchaseOrders.customerId,
        orderDate: purchaseOrders.orderDate,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        totalDiscountAmount: purchaseOrders.totalDiscountAmount,
        createdAt: purchaseOrders.createdAt,
        updatedAt: purchaseOrders.updatedAt,
        createdBy: purchaseOrders.createdBy,
        updatedBy: purchaseOrders.updatedBy,
        customerName: customers.name,
        customerPhone: customers.phone,
        creatorName: employees.name,
      })
      .from(purchaseOrders)
      .leftJoin(customers, eq(purchaseOrders.customerId, customers.id))
      .leftJoin(employees, eq(purchaseOrders.createdBy, employees.id))
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (order.length === 0) return undefined;

    const items = await this.getPurchaseOrderItems(id);
    const auditLogs = await this.getPurchaseOrderAuditLogs(id);

    return {
      ...order[0],
      items,
      auditLogs,
    };
  }

  // Purchase Order Items operations
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return await db
      .select({
        id: purchaseOrderItems.id,
        purchaseOrderId: purchaseOrderItems.purchaseOrderId,
        productId: purchaseOrderItems.productId,
        quantity: purchaseOrderItems.quantity,
        purity: purchaseOrderItems.purity,
        netWeight: purchaseOrderItems.netWeight,
        grossWeight: purchaseOrderItems.grossWeight,
        goldRatePerGram: purchaseOrderItems.goldRatePerGram,
        labourRatePerGram: purchaseOrderItems.labourRatePerGram,
        additionalCost: purchaseOrderItems.additionalCost,
        basePrice: purchaseOrderItems.basePrice,
        gstPercentage: purchaseOrderItems.gstPercentage,
        gstAmount: purchaseOrderItems.gstAmount,
        totalPrice: purchaseOrderItems.totalPrice,
        createdAt: purchaseOrderItems.createdAt,
        updatedAt: purchaseOrderItems.updatedAt,
        productName: products.name,
        productBarcode: products.barcodeNumber,
        categoryName: productCategories.name,
        categoryTaxPercentage: productCategories.taxPercentage,
      })
      .from(purchaseOrderItems)
      .leftJoin(products, eq(purchaseOrderItems.productId, products.id))
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId))
      .orderBy(asc(purchaseOrderItems.createdAt));
  }

  async createPurchaseOrderItems(items: InsertPurchaseOrderItem[]): Promise<PurchaseOrderItem[]> {
    const newItems = await db
      .insert(purchaseOrderItems)
      .values(items)
      .returning();
    return newItems;
  }

  async updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const [updatedItem] = await db
      .update(purchaseOrderItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return updatedItem;
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    const result = await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return result.length > 0;
  }

  // Purchase Order Audit operations
  async createPurchaseOrderAuditLog(auditLog: InsertPurchaseOrderAuditLog): Promise<PurchaseOrderAuditLog> {
    const [newAuditLog] = await db
      .insert(purchaseOrderAuditLog)
      .values(auditLog)
      .returning();
    return newAuditLog;
  }

  async getPurchaseOrderAuditLogs(purchaseOrderId: number): Promise<PurchaseOrderAuditLog[]> {
    return await db
      .select({
        id: purchaseOrderAuditLog.id,
        purchaseOrderId: purchaseOrderAuditLog.purchaseOrderId,
        updatedBy: purchaseOrderAuditLog.updatedBy,
        updatedAt: purchaseOrderAuditLog.updatedAt,
        changes: purchaseOrderAuditLog.changes,
        createdAt: purchaseOrderAuditLog.createdAt,
        employeeName: employees.name,
        employeeEmpCode: employees.empCode,
      })
      .from(purchaseOrderAuditLog)
      .leftJoin(employees, eq(purchaseOrderAuditLog.updatedBy, employees.id))
      .where(eq(purchaseOrderAuditLog.purchaseOrderId, purchaseOrderId))
      .orderBy(desc(purchaseOrderAuditLog.updatedAt));
  }

  async getLatestPriceForCategory(categoryId: number, date?: string): Promise<PriceMaster | undefined> {
    const effectiveDate = date || new Date().toISOString().split('T')[0];
    
    // First try to get price for the exact date
    let [price] = await db
      .select()
      .from(priceMaster)
      .where(and(
        eq(priceMaster.categoryId, categoryId),
        eq(priceMaster.effectiveDate, effectiveDate)
      ))
      .limit(1);
    
    // If no price for exact date, get the last available price before this date
    if (!price) {
      [price] = await db
        .select()
        .from(priceMaster)
        .where(and(
          eq(priceMaster.categoryId, categoryId),
          lt(priceMaster.effectiveDate, effectiveDate)
        ))
        .orderBy(desc(priceMaster.effectiveDate))
        .limit(1);
    }
    
    return price;
  }

  // Stock Movement operations
  async getStockMovements(): Promise<StockMovement[]> {
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }

  async getProductStockMovements(productId: number): Promise<StockMovement[]> {
    return await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [newMovement] = await db.insert(stockMovements).values(movement).returning();
    return newMovement;
  }

  // Company settings operations
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings).limit(1);
    return settings;
  }

  async updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings> {
    const existing = await this.getCompanySettings();
    if (existing) {
      const [updated] = await db
        .update(companySettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(companySettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(companySettings).values(settings as InsertCompanySettings).returning();
      return created;
    }
  }

  // Discount rules operations
  async getDiscountRules(): Promise<DiscountRule[]> {
    return await db.select().from(discountRules).orderBy(desc(discountRules.createdAt));
  }

  async getActiveDiscountRules(): Promise<DiscountRule[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(discountRules)
      .where(
        and(
          eq(discountRules.isActive, true),
          sql`${discountRules.startDate} <= ${today}`,
          sql`(${discountRules.endDate} IS NULL OR ${discountRules.endDate} >= ${today})`
        )
      )
      .orderBy(desc(discountRules.createdAt));
  }

  async createDiscountRule(rule: InsertDiscountRule): Promise<DiscountRule> {
    const [newRule] = await db.insert(discountRules).values(rule).returning();
    return newRule;
  }

  async updateDiscountRule(id: number, rule: Partial<InsertDiscountRule>): Promise<DiscountRule> {
    const [updated] = await db
      .update(discountRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(discountRules.id, id))
      .returning();
    return updated;
  }

  // Payment transaction operations
  async getPaymentTransactions(purchaseOrderId: number): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.purchaseOrderId, purchaseOrderId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [newTransaction] = await db.insert(paymentTransactions).values(transaction).returning();
    return newTransaction;
  }

  // Saving Scheme operations
  async getSavingSchemes(): Promise<SavingScheme[]> {
    return await db.select().from(savingSchemeMaster).orderBy(desc(savingSchemeMaster.createdAt));
  }

  async getSavingScheme(id: number): Promise<SavingScheme | undefined> {
    const [scheme] = await db.select().from(savingSchemeMaster).where(eq(savingSchemeMaster.id, id));
    return scheme;
  }

  async createSavingScheme(scheme: InsertSavingScheme): Promise<SavingScheme> {
    const [newScheme] = await db.insert(savingSchemeMaster).values(scheme).returning();
    return newScheme;
  }

  async updateSavingScheme(id: number, scheme: Partial<InsertSavingScheme>): Promise<SavingScheme | undefined> {
    const [updatedScheme] = await db
      .update(savingSchemeMaster)
      .set({ ...scheme, updatedAt: new Date() })
      .where(eq(savingSchemeMaster.id, id))
      .returning();
    return updatedScheme;
  }

  // Customer Enrollment operations
  async getCustomerEnrollment(id: number): Promise<CustomerEnrollment | undefined> {
    const [enrollment] = await db.select().from(customerEnrollments).where(eq(customerEnrollments.id, id));
    return enrollment;
  }

  // Customer Enrollment operations
  async getCustomerEnrollments(): Promise<CustomerEnrollment[]> {
    return await db.select().from(customerEnrollments).orderBy(desc(customerEnrollments.createdAt));
  }

  async getCustomerEnrollmentsByCustomer(customerId: number): Promise<CustomerEnrollment[]> {
    return await db
      .select()
      .from(customerEnrollments)
      .where(eq(customerEnrollments.customerId, customerId))
      .orderBy(desc(customerEnrollments.createdAt));
  }

  async createCustomerEnrollment(enrollment: InsertCustomerEnrollment): Promise<CustomerEnrollment> {
    const cardNumber = await this.generateCardNumber();
    const [newEnrollment] = await db
      .insert(customerEnrollments)
      .values({ ...enrollment, cardNumber })
      .returning();
    return newEnrollment;
  }

  async updateCustomerEnrollment(id: number, enrollment: Partial<InsertCustomerEnrollment>): Promise<CustomerEnrollment | undefined> {
    const [updatedEnrollment] = await db
      .update(customerEnrollments)
      .set({ ...enrollment, updatedAt: new Date() })
      .where(eq(customerEnrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  // Monthly Payment operations
  async getMonthlyPayments(enrollmentId: number): Promise<MonthlyPayment[]> {
    return await db
      .select()
      .from(monthlyPayments)
      .where(eq(monthlyPayments.enrollmentId, enrollmentId))
      .orderBy(asc(monthlyPayments.monthNumber));
  }

  async createMonthlyPayment(payment: InsertMonthlyPayment): Promise<MonthlyPayment> {
    const [newPayment] = await db.insert(monthlyPayments).values(payment).returning();
    return newPayment;
  }

  // Utility functions
  async generateCustomerId(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const todayCustomers = await db
      .select({ customerId: customers.customerId })
      .from(customers)
      .where(like(customers.customerId, `CUST-${dateStr}-%`));
    
    const sequence = todayCustomers.length + 1;
    return `CUST-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const todayOrders = await db
      .select({ orderNumber: purchaseOrders.orderNumber })
      .from(purchaseOrders)
      .where(like(purchaseOrders.orderNumber, `PO-${dateStr}-%`));
    
    const sequence = todayOrders.length + 1;
    return `PO-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  async generateCardNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const todayCards = await db
      .select({ cardNumber: customerEnrollments.cardNumber })
      .from(customerEnrollments)
      .where(like(customerEnrollments.cardNumber, `SCH-${dateStr}-%`));
    
    const sequence = todayCards.length + 1;
    return `SCH-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  async getStats(): Promise<{
    totalCustomers: number;
    totalProducts: number;
    monthlySales: number;
    stockValue: number;
  }> {
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers);

    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthStartIso = currentMonth.toISOString();

    const [monthlySalesResult] = await db
      .select({ total: sql<number>`coalesce(sum(cast(${purchaseOrders.totalAmount} as numeric)), 0)` })
      .from(purchaseOrders)
      .where(sql`${purchaseOrders.createdAt} >= ${monthStartIso}`);

    // Simple stock value calculation - would be more complex in real implementation
    const [stockValueResult] = await db
      .select({ value: sql<number>`coalesce(sum(cast(${products.netWeight} as numeric) * 5000), 0)` })
      .from(products);

    return {
      totalCustomers: customerCount.count,
      totalProducts: productCount.count,
      monthlySales: monthlySalesResult.total,
      stockValue: stockValueResult.value,
    };
  }
}

export const storage = new DatabaseStorage();
