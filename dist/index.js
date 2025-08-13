var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/constants.ts
var constants_exports = {};
__export(constants_exports, {
  PROTECTED_CATEGORY_CODES: () => PROTECTED_CATEGORY_CODES,
  PROTECTED_JEWEL_TYPE_CODES: () => PROTECTED_JEWEL_TYPE_CODES
});
var PROTECTED_JEWEL_TYPE_CODES, PROTECTED_CATEGORY_CODES;
var init_constants = __esm({
  "shared/constants.ts"() {
    "use strict";
    PROTECTED_JEWEL_TYPE_CODES = [
      "GOLD22K",
      "GOLD18K",
      "SILVER",
      "DIAMOND"
    ];
    PROTECTED_CATEGORY_CODES = [
      "CAT-GOLD22K",
      "CAT-GOLD18K",
      "CAT-SILVER",
      "CAT-DIAMOND"
    ];
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  customerEnrollments: () => customerEnrollments,
  customerEnrollmentsRelations: () => customerEnrollmentsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  dealers: () => dealers,
  dealersRelations: () => dealersRelations,
  employees: () => employees,
  insertCustomerEnrollmentSchema: () => insertCustomerEnrollmentSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertDealerSchema: () => insertDealerSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertMonthlyPaymentSchema: () => insertMonthlyPaymentSchema,
  insertPriceMasterSchema: () => insertPriceMasterSchema,
  insertProductCategorySchema: () => insertProductCategorySchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseOrderSchema: () => insertPurchaseOrderSchema,
  insertSavingSchemeSchema: () => insertSavingSchemeSchema,
  insertStockMovementSchema: () => insertStockMovementSchema,
  monthlyPayments: () => monthlyPayments,
  priceMaster: () => priceMaster,
  priceMasterRelations: () => priceMasterRelations,
  productCategories: () => productCategories,
  productCategoriesRelations: () => productCategoriesRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  purchaseOrders: () => purchaseOrders,
  purchaseOrdersRelations: () => purchaseOrdersRelations,
  savingSchemeMaster: () => savingSchemeMaster,
  savingSchemeMasterRelations: () => savingSchemeMasterRelations,
  sessions: () => sessions,
  stockMovements: () => stockMovements
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  empCode: varchar("emp_code").notNull().unique(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  role: varchar("role").notNull(),
  // admin, manager, staff
  photo: varchar("photo"),
  password: varchar("password").notNull(),
  // hashed password for login
  status: varchar("status").notNull().default("Active"),
  // Active, Inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull().unique(),
  // CUST-YYYYMMDD-XXX
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  address: text("address"),
  gstNumber: varchar("gst_number"),
  dateOfBirth: date("date_of_birth"),
  anniversary: date("anniversary"),
  panCard: varchar("pan_card"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dealers = pgTable("dealers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  gstNumber: varchar("gst_number").notNull(),
  categories: text("categories").array(),
  // multi-select categories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).notNull(),
  hsnCode: varchar("hsn_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  barcodeNumber: varchar("barcode_number").notNull().unique(),
  type: varchar("type").notNull(),
  // No stone, Stone, Diamond Stone
  stoneWeight: decimal("stone_weight", { precision: 12, scale: 2 }),
  dealerId: integer("dealer_id").references(() => dealers.id).notNull(),
  weight: decimal("weight", { precision: 12, scale: 2 }),
  makingChargeType: varchar("making_charge_type"),
  // Percentage, Fixed Amount, Per Gram
  makingChargeValue: decimal("making_charge_value", { precision: 12, scale: 2 }),
  wastageChargeType: varchar("wastage_charge_type"),
  // Percentage, Fixed Amount, Per Gram, Per Piece
  wastageChargeValue: decimal("wastage_charge_value", { precision: 12, scale: 2 }),
  centralGovtNumber: varchar("central_govt_number"),
  categoryId: integer("category_id").references(() => productCategories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var priceMaster = pgTable("price_master", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => productCategories.id).notNull(),
  pricePerGram: decimal("price_per_gram", { precision: 10, scale: 2 }).notNull(),
  effectiveDate: date("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_price_master_category_date").on(table.categoryId, table.effectiveDate)
]);
var purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number").notNull().unique(),
  // Auto-generated
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  products: jsonb("products").notNull(),
  // Array of products with quantities
  overallDiscount: decimal("overall_discount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  orderDate: date("order_date").notNull(),
  status: varchar("status").notNull().default("Pending"),
  // Pending, Processing, Completed, Cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  type: varchar("type").notNull(),
  // in, out
  weight: decimal("weight", { precision: 8, scale: 3 }).notNull(),
  rateAtTime: decimal("rate_at_time", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference"),
  // Reference to order or transaction
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var savingSchemeMaster = pgTable("saving_scheme_master", {
  id: serial("id").primaryKey(),
  schemeName: varchar("scheme_name").notNull(),
  totalMonths: integer("total_months").notNull(),
  description: text("description"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customerEnrollments = pgTable("customer_enrollments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  schemeId: integer("scheme_id").references(() => savingSchemeMaster.id).notNull(),
  monthlyAmount: decimal("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  cardNumber: varchar("card_number").notNull().unique(),
  // SCH-YYYYMMDD-###
  status: varchar("status").notNull().default("Active"),
  // Active, Completed, Cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var monthlyPayments = pgTable("monthly_payments", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").references(() => customerEnrollments.id).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  goldRate: decimal("gold_rate", { precision: 10, scale: 2 }).notNull(),
  goldGrams: decimal("gold_grams", { precision: 8, scale: 3 }).notNull(),
  monthNumber: integer("month_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customersRelations = relations(customers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
  enrollments: many(customerEnrollments)
}));
var dealersRelations = relations(dealers, ({ many }) => ({
  products: many(products)
}));
var productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
  priceMaster: many(priceMaster)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  dealer: one(dealers, {
    fields: [products.dealerId],
    references: [dealers.id]
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id]
  }),
  stockMovements: many(stockMovements)
}));
var purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  customer: one(customers, {
    fields: [purchaseOrders.customerId],
    references: [customers.id]
  })
}));
var savingSchemeMasterRelations = relations(savingSchemeMaster, ({ one, many }) => ({
  enrollments: many(customerEnrollments)
}));
var customerEnrollmentsRelations = relations(customerEnrollments, ({ one, many }) => ({
  customer: one(customers, {
    fields: [customerEnrollments.customerId],
    references: [customers.id]
  }),
  scheme: one(savingSchemeMaster, {
    fields: [customerEnrollments.schemeId],
    references: [savingSchemeMaster.id]
  }),
  payments: many(monthlyPayments)
}));
var priceMasterRelations = relations(priceMaster, ({ one }) => ({
  category: one(productCategories, {
    fields: [priceMaster.categoryId],
    references: [productCategories.id]
  })
}));
var insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
var insertCustomerSchema = createInsertSchema(customers).omit({ id: true, customerId: true, createdAt: true, updatedAt: true });
var insertDealerSchema = createInsertSchema(dealers).omit({ id: true, createdAt: true, updatedAt: true });
var insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true, createdAt: true, updatedAt: true });
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  stoneWeight: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  weight: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  makingChargeValue: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  wastageChargeValue: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  dealerId: z.number().int(),
  categoryId: z.number().int().optional()
});
var insertPriceMasterSchema = createInsertSchema(priceMaster).omit({ id: true, createdAt: true, updatedAt: true });
var insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, orderNumber: true, createdAt: true, updatedAt: true });
var insertStockMovementSchema = createInsertSchema(stockMovements).omit({ id: true, createdAt: true, updatedAt: true });
var insertSavingSchemeSchema = createInsertSchema(savingSchemeMaster).omit({ id: true, createdAt: true, updatedAt: true });
var insertCustomerEnrollmentSchema = createInsertSchema(customerEnrollments).omit({ id: true, cardNumber: true, createdAt: true, updatedAt: true });
var insertMonthlyPaymentSchema = createInsertSchema(monthlyPayments).omit({ id: true, createdAt: true, updatedAt: true });

// server/db.ts
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var client = postgres(process.env.DATABASE_URL, {
  prepare: false
});
var db = drizzle(client, { schema: schema_exports });

// server/storage.ts
import { eq, desc, asc, like, and, sql, lt } from "drizzle-orm";
var DatabaseStorage = class {
  // Employee operations (also handles authentication)
  async getEmployees() {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }
  async getEmployee(id) {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }
  async getEmployeeByEmpCode(empCode) {
    const [employee] = await db.select().from(employees).where(eq(employees.empCode, empCode));
    return employee;
  }
  async createEmployee(employee) {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }
  async updateEmployee(id, employee) {
    const [updatedEmployee] = await db.update(employees).set({ ...employee, updatedAt: /* @__PURE__ */ new Date() }).where(eq(employees.id, id)).returning();
    return updatedEmployee;
  }
  async deleteEmployee(id) {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return result.length > 0;
  }
  async generateNextEmployeeCode() {
    const existingEmployees = await db.select({ empCode: employees.empCode }).from(employees).where(like(employees.empCode, "EMP-%"));
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
    const nextNumber = highestNumber + 1;
    return `EMP-${nextNumber.toString().padStart(3, "0")}`;
  }
  // Customer operations
  async getCustomers() {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async getCustomerByCustomerId(customerId) {
    const [customer] = await db.select().from(customers).where(eq(customers.customerId, customerId));
    return customer;
  }
  async searchCustomers(query) {
    return await db.select().from(customers).where(
      and(
        sql`${customers.name} ILIKE ${`%${query}%`} OR ${customers.phone} ILIKE ${`%${query}%`}`
      )
    ).orderBy(asc(customers.name));
  }
  async createCustomer(customer) {
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
      anniversary: customer.anniversary || null
    };
    const [newCustomer] = await db.insert(customers).values(customerData).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const [updatedCustomer] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, id)).returning();
    return updatedCustomer;
  }
  async deleteCustomer(id) {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.length > 0;
  }
  // Dealer operations
  async getDealers() {
    return await db.select().from(dealers).orderBy(desc(dealers.createdAt));
  }
  async getDealer(id) {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }
  async createDealer(dealer) {
    const [newDealer] = await db.insert(dealers).values(dealer).returning();
    return newDealer;
  }
  async updateDealer(id, dealer) {
    const [updatedDealer] = await db.update(dealers).set({ ...dealer, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dealers.id, id)).returning();
    return updatedDealer;
  }
  async deleteDealer(id) {
    const result = await db.delete(dealers).where(eq(dealers.id, id));
    return result.length > 0;
  }
  // Product Category operations
  async getProductCategories() {
    return await db.select().from(productCategories).orderBy(asc(productCategories.name));
  }
  async getProductCategory(id) {
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return category;
  }
  async createProductCategory(category) {
    const [newCategory] = await db.insert(productCategories).values(category).returning();
    return newCategory;
  }
  async updateProductCategory(id, category) {
    const [updatedCategory] = await db.update(productCategories).set({ ...category, updatedAt: /* @__PURE__ */ new Date() }).where(eq(productCategories.id, id)).returning();
    return updatedCategory;
  }
  async deleteProductCategory(id) {
    const category = await db.select().from(productCategories).where(eq(productCategories.id, id)).limit(1);
    if (category.length === 0) {
      return false;
    }
    const { PROTECTED_CATEGORY_CODES: PROTECTED_CATEGORY_CODES2 } = await Promise.resolve().then(() => (init_constants(), constants_exports));
    if (PROTECTED_CATEGORY_CODES2.includes(category[0].code)) {
      throw new Error("This category is protected and cannot be deleted. You may edit it but not remove it.");
    }
    const result = await db.delete(productCategories).where(eq(productCategories.id, id));
    return result.length > 0;
  }
  // Product operations
  async getProducts() {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async getProductByBarcode(barcode) {
    const [product] = await db.select().from(products).where(eq(products.barcodeNumber, barcode));
    return product;
  }
  async searchProducts(query) {
    return await db.select().from(products).where(
      sql`${products.name} ILIKE ${`%${query}%`} OR ${products.barcodeNumber} ILIKE ${`%${query}%`}`
    ).orderBy(asc(products.name));
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async updateProduct(id, product) {
    const [updatedProduct] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.length > 0;
  }
  // Price Master operations
  async getPriceMaster(offset = 0, limit = 30) {
    const result = await db.select({
      date: priceMaster.effectiveDate,
      categoryId: priceMaster.categoryId,
      categoryName: productCategories.name,
      pricePerGram: priceMaster.pricePerGram,
      id: priceMaster.id,
      createdAt: priceMaster.createdAt
    }).from(priceMaster).leftJoin(productCategories, eq(priceMaster.categoryId, productCategories.id)).orderBy(desc(priceMaster.effectiveDate), asc(productCategories.name)).limit(limit * 10).offset(offset * 10);
    const groupedByDate = result.reduce((acc, row) => {
      const dateKey = row.date;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, categories: {}, createdAt: row.createdAt };
      }
      acc[dateKey].categories[row.categoryName || ""] = {
        id: row.id,
        categoryId: row.categoryId,
        pricePerGram: row.pricePerGram
      };
      return acc;
    }, {});
    return Object.values(groupedByDate).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  }
  async getPriceMasterForDate(date2) {
    const categories = await db.select().from(productCategories);
    const result = [];
    for (const category of categories) {
      let price = await db.select().from(priceMaster).where(and(eq(priceMaster.categoryId, category.id), eq(priceMaster.effectiveDate, date2))).limit(1);
      if (price.length === 0) {
        price = await db.select().from(priceMaster).where(and(eq(priceMaster.categoryId, category.id), lt(priceMaster.effectiveDate, date2))).orderBy(desc(priceMaster.effectiveDate)).limit(1);
      }
      result.push({
        categoryId: category.id,
        categoryName: category.name,
        pricePerGram: price.length > 0 ? price[0].pricePerGram : null,
        effectiveDate: price.length > 0 ? price[0].effectiveDate : null,
        id: price.length > 0 ? price[0].id : null
      });
    }
    return result;
  }
  async createPriceMaster(prices) {
    const newPrices = await db.insert(priceMaster).values(prices).returning();
    return newPrices;
  }
  async updatePriceMaster(id, price) {
    const [updatedPrice] = await db.update(priceMaster).set({ ...price, updatedAt: /* @__PURE__ */ new Date() }).where(eq(priceMaster.id, id)).returning();
    return updatedPrice;
  }
  async getLastAvailablePrice(categoryId, beforeDate) {
    const [price] = await db.select().from(priceMaster).where(and(eq(priceMaster.categoryId, categoryId), lt(priceMaster.effectiveDate, beforeDate))).orderBy(desc(priceMaster.effectiveDate)).limit(1);
    return price;
  }
  async getCurrentPrices() {
    const categories = await db.select().from(productCategories);
    const result = [];
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    for (const category of categories) {
      let price = await db.select().from(priceMaster).where(and(eq(priceMaster.categoryId, category.id), eq(priceMaster.effectiveDate, today))).limit(1);
      if (price.length === 0) {
        price = await db.select().from(priceMaster).where(eq(priceMaster.categoryId, category.id)).orderBy(desc(priceMaster.effectiveDate)).limit(1);
      }
      result.push({
        categoryId: category.id,
        categoryName: category.name,
        currentPrice: price.length > 0 ? Number(price[0].pricePerGram) : null,
        effectiveDate: price.length > 0 ? price[0].effectiveDate : null,
        isToday: price.length > 0 ? price[0].effectiveDate === today : false,
        lastUpdated: price.length > 0 ? price[0].updatedAt : null
      });
    }
    return result;
  }
  // Purchase Order operations
  async getPurchaseOrders() {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }
  async getPurchaseOrder(id) {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }
  async getCustomerOrders(customerId) {
    return await db.select().from(purchaseOrders).where(eq(purchaseOrders.customerId, customerId)).orderBy(desc(purchaseOrders.createdAt));
  }
  async createPurchaseOrder(order) {
    const orderNumber = await this.generateOrderNumber();
    const [newOrder] = await db.insert(purchaseOrders).values({ ...order, orderNumber }).returning();
    return newOrder;
  }
  async updatePurchaseOrder(id, order) {
    const [updatedOrder] = await db.update(purchaseOrders).set({ ...order, updatedAt: /* @__PURE__ */ new Date() }).where(eq(purchaseOrders.id, id)).returning();
    return updatedOrder;
  }
  async deletePurchaseOrder(id) {
    const result = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    return result.length > 0;
  }
  // Stock Movement operations
  async getStockMovements() {
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }
  async getProductStockMovements(productId) {
    return await db.select().from(stockMovements).where(eq(stockMovements.productId, productId)).orderBy(desc(stockMovements.createdAt));
  }
  async createStockMovement(movement) {
    const [newMovement] = await db.insert(stockMovements).values(movement).returning();
    return newMovement;
  }
  // Saving Scheme operations
  async getSavingSchemes() {
    return await db.select().from(savingSchemeMaster).orderBy(desc(savingSchemeMaster.createdAt));
  }
  async getSavingScheme(id) {
    const [scheme] = await db.select().from(savingSchemeMaster).where(eq(savingSchemeMaster.id, id));
    return scheme;
  }
  async createSavingScheme(scheme) {
    const [newScheme] = await db.insert(savingSchemeMaster).values(scheme).returning();
    return newScheme;
  }
  async updateSavingScheme(id, scheme) {
    const [updatedScheme] = await db.update(savingSchemeMaster).set({ ...scheme, updatedAt: /* @__PURE__ */ new Date() }).where(eq(savingSchemeMaster.id, id)).returning();
    return updatedScheme;
  }
  // Customer Enrollment operations
  async getCustomerEnrollment(id) {
    const [enrollment] = await db.select().from(customerEnrollments).where(eq(customerEnrollments.id, id));
    return enrollment;
  }
  // Customer Enrollment operations
  async getCustomerEnrollments() {
    return await db.select().from(customerEnrollments).orderBy(desc(customerEnrollments.createdAt));
  }
  async getCustomerEnrollmentsByCustomer(customerId) {
    return await db.select().from(customerEnrollments).where(eq(customerEnrollments.customerId, customerId)).orderBy(desc(customerEnrollments.createdAt));
  }
  async createCustomerEnrollment(enrollment) {
    const cardNumber = await this.generateCardNumber();
    const [newEnrollment] = await db.insert(customerEnrollments).values({ ...enrollment, cardNumber }).returning();
    return newEnrollment;
  }
  async updateCustomerEnrollment(id, enrollment) {
    const [updatedEnrollment] = await db.update(customerEnrollments).set({ ...enrollment, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customerEnrollments.id, id)).returning();
    return updatedEnrollment;
  }
  // Monthly Payment operations
  async getMonthlyPayments(enrollmentId) {
    return await db.select().from(monthlyPayments).where(eq(monthlyPayments.enrollmentId, enrollmentId)).orderBy(asc(monthlyPayments.monthNumber));
  }
  async createMonthlyPayment(payment) {
    const [newPayment] = await db.insert(monthlyPayments).values(payment).returning();
    return newPayment;
  }
  // Utility functions
  async generateCustomerId() {
    const today = /* @__PURE__ */ new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const todayCustomers = await db.select({ customerId: customers.customerId }).from(customers).where(like(customers.customerId, `CUST-${dateStr}-%`));
    const sequence = todayCustomers.length + 1;
    return `CUST-${dateStr}-${sequence.toString().padStart(3, "0")}`;
  }
  async generateOrderNumber() {
    const today = /* @__PURE__ */ new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const todayOrders = await db.select({ orderNumber: purchaseOrders.orderNumber }).from(purchaseOrders).where(like(purchaseOrders.orderNumber, `ORD-${dateStr}-%`));
    const sequence = todayOrders.length + 1;
    return `ORD-${dateStr}-${sequence.toString().padStart(3, "0")}`;
  }
  async generateCardNumber() {
    const today = /* @__PURE__ */ new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const todayCards = await db.select({ cardNumber: customerEnrollments.cardNumber }).from(customerEnrollments).where(like(customerEnrollments.cardNumber, `SCH-${dateStr}-%`));
    const sequence = todayCards.length + 1;
    return `SCH-${dateStr}-${sequence.toString().padStart(3, "0")}`;
  }
  async getStats() {
    const [customerCount] = await db.select({ count: sql`count(*)` }).from(customers);
    const [productCount] = await db.select({ count: sql`count(*)` }).from(products);
    const currentMonth = /* @__PURE__ */ new Date();
    currentMonth.setDate(1);
    const [monthlySalesResult] = await db.select({ total: sql`coalesce(sum(cast(${purchaseOrders.totalAmount} as numeric)), 0)` }).from(purchaseOrders).where(sql`${purchaseOrders.createdAt} >= ${currentMonth}`);
    const [stockValueResult] = await db.select({ value: sql`coalesce(sum(cast(${products.weight} as numeric) * 5000), 0)` }).from(products);
    return {
      totalCustomers: customerCount.count,
      totalProducts: productCount.count,
      monthlySales: monthlySalesResult.total,
      stockValue: stockValueResult.value
    };
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  if (!stored.includes(".")) {
    console.warn("Found unhashed password in database. This should be updated for security.");
    return supplied === stored;
  }
  const [hashed, salt] = stored.split(".");
  try {
    const buf = await scryptAsync(supplied, salt, 64);
    return hashed === buf.toString("hex");
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAuth(app2) {
  const PostgresSessionStore = connectPg(session);
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "jewelry-shop-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      tableName: "sessions",
      // Correct table name
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      secure: false,
      // Set to true in production with HTTPS
      httpOnly: true
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const employee = await storage.getEmployeeByEmpCode(username);
        if (!employee) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValidPassword = await comparePasswords(password, employee.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, employee);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const employee = await storage.getEmployee(id);
      if (employee) {
        done(null, employee);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { empCode, name, phone, email, role, password } = req.body;
      const existingEmployee = await storage.getEmployeeByEmpCode(empCode);
      if (existingEmployee) {
        return res.status(400).json({ message: "Employee code already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const employee = await storage.createEmployee({
        empCode,
        name,
        phone,
        email: email || null,
        role,
        password: hashedPassword,
        photo: null,
        status: "Active"
      });
      req.login(employee, (err) => {
        if (err) return next(err);
        const employeeData = employee;
        res.status(201).json({
          id: employeeData.id,
          empCode: employeeData.empCode,
          name: employeeData.name,
          role: employeeData.role
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register employee" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, employee, info) => {
      if (err) {
        return next(err);
      }
      if (!employee) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(employee, (err2) => {
        if (err2) {
          return next(err2);
        }
        const employeeData = employee;
        res.json({
          id: employeeData.id,
          empCode: employeeData.empCode,
          name: employeeData.name,
          role: employeeData.role
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const employee = req.user;
    res.json({
      id: employee.id,
      empCode: employee.empCode,
      name: employee.name,
      role: employee.role,
      email: employee.email,
      phone: employee.phone,
      status: employee.status
    });
  });
}
async function hashPasswordForSeed(password) {
  return await hashPassword(password);
}
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees2 = await storage.getEmployees();
      res.json(employees2);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  app2.get("/api/employees/next-code", isAuthenticated, async (req, res) => {
    try {
      const nextCode = await storage.generateNextEmployeeCode();
      res.json({ empCode: nextCode });
    } catch (error) {
      console.error("Error generating next employee code:", error);
      res.status(500).json({ message: "Failed to generate employee code" });
    }
  });
  app2.get("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });
  app2.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const empCode = await storage.generateNextEmployeeCode();
      const hashedPassword = await hashPassword(req.body.password);
      const validatedData = insertEmployeeSchema.parse({
        ...req.body,
        empCode,
        password: hashedPassword
      });
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });
  app2.put("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let updateData = { ...req.body };
      if (updateData.password && updateData.password.trim() !== "") {
        updateData.password = await hashPassword(updateData.password);
      } else {
        delete updateData.password;
      }
      const validatedData = insertEmployeeSchema.partial().parse(updateData);
      const employee = await storage.updateEmployee(id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });
  app2.delete("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmployee(id);
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });
  app2.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === "string") {
        const customers3 = await storage.searchCustomers(search);
        return res.json(customers3);
      }
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  app2.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") cleanedData.dateOfBirth = null;
      if (cleanedData.anniversary === "") cleanedData.anniversary = null;
      const validatedData = insertCustomerSchema.parse(cleanedData);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  app2.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") cleanedData.dateOfBirth = null;
      if (cleanedData.anniversary === "") cleanedData.anniversary = null;
      const validatedData = insertCustomerSchema.partial().parse(cleanedData);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  app2.get("/api/dealers", isAuthenticated, async (req, res) => {
    try {
      const dealers2 = await storage.getDealers();
      res.json(dealers2);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      res.status(500).json({ message: "Failed to fetch dealers" });
    }
  });
  app2.post("/api/dealers", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(validatedData);
      res.status(201).json(dealer);
    } catch (error) {
      console.error("Error creating dealer:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dealer" });
    }
  });
  app2.put("/api/dealers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDealerSchema.partial().parse(req.body);
      const dealer = await storage.updateDealer(id, validatedData);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      console.error("Error updating dealer:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update dealer" });
    }
  });
  app2.get("/api/product-categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({ message: "Failed to fetch product categories" });
    }
  });
  app2.post("/api/product-categories", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating product category:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product category" });
    }
  });
  app2.put("/api/product-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductCategorySchema.partial().parse(req.body);
      const category = await storage.updateProductCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Product category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating product category:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product category" });
    }
  });
  app2.delete("/api/product-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Product category not found" });
      }
      res.json({ message: "Product category deleted successfully" });
    } catch (error) {
      console.error("Error deleting product category:", error);
      if (error instanceof Error && error.message.includes("protected")) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete product category" });
    }
  });
  app2.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === "string") {
        const products3 = await storage.searchProducts(search);
        return res.json(products3);
      }
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.get("/api/price-master/current", isAuthenticated, async (req, res) => {
    try {
      const currentPrices = await storage.getCurrentPrices();
      res.json(currentPrices);
    } catch (error) {
      console.error("Error fetching current prices:", error);
      res.status(500).json({ message: "Failed to fetch current prices" });
    }
  });
  app2.get("/api/price-master", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || 30;
      const prices = await storage.getPriceMaster(offset, limit);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching price master:", error);
      res.status(500).json({ message: "Failed to fetch price master" });
    }
  });
  app2.get("/api/price-master/:date", isAuthenticated, async (req, res) => {
    try {
      const date2 = req.params.date;
      const prices = await storage.getPriceMasterForDate(date2);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching price master for date:", error);
      res.status(500).json({ message: "Failed to fetch price master for date" });
    }
  });
  app2.post("/api/price-master", isAuthenticated, async (req, res) => {
    try {
      const data = Array.isArray(req.body) ? req.body : [req.body];
      const validatedData = data.map((item) => insertPriceMasterSchema.parse(item));
      const prices = await storage.createPriceMaster(validatedData);
      res.status(201).json(prices);
    } catch (error) {
      console.error("Error creating price master:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create price master" });
    }
  });
  app2.get("/api/price-master/more/:offset", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.params.offset);
      const limit = parseInt(req.query.limit) || 30;
      const prices = await storage.getPriceMaster(offset, limit);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching more price master data:", error);
      res.status(500).json({ message: "Failed to fetch more price master data" });
    }
  });
  app2.get("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });
  app2.post("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });
  app2.put("/api/purchase-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPurchaseOrderSchema.partial().parse(req.body);
      const order = await storage.updatePurchaseOrder(id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });
  app2.get("/api/stock-movements", isAuthenticated, async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });
  app2.post("/api/stock-movements", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating stock movement:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stock movement" });
    }
  });
  app2.get("/api/saving-schemes", isAuthenticated, async (req, res) => {
    try {
      const schemes = await storage.getSavingSchemes();
      res.json(schemes);
    } catch (error) {
      console.error("Error fetching saving schemes:", error);
      res.status(500).json({ message: "Failed to fetch saving schemes" });
    }
  });
  app2.post("/api/saving-schemes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSavingSchemeSchema.parse(req.body);
      const scheme = await storage.createSavingScheme(validatedData);
      res.status(201).json(scheme);
    } catch (error) {
      console.error("Error creating saving scheme:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create saving scheme" });
    }
  });
  app2.put("/api/saving-schemes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSavingSchemeSchema.partial().parse(req.body);
      const scheme = await storage.updateSavingScheme(id, validatedData);
      if (!scheme) {
        return res.status(404).json({ message: "Saving scheme not found" });
      }
      res.json(scheme);
    } catch (error) {
      console.error("Error updating saving scheme:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update saving scheme" });
    }
  });
  app2.get("/api/customer-enrollments", isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.query;
      if (customerId && typeof customerId === "string") {
        const enrollments2 = await storage.getCustomerEnrollmentsByCustomer(parseInt(customerId));
        return res.json(enrollments2);
      }
      const enrollments = await storage.getCustomerEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching customer enrollments:", error);
      res.status(500).json({ message: "Failed to fetch customer enrollments" });
    }
  });
  app2.get("/api/customer-enrollments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enrollment = await storage.getCustomerEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      res.status(500).json({ message: "Failed to fetch enrollment" });
    }
  });
  app2.post("/api/customer-enrollments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createCustomerEnrollment(validatedData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating customer enrollment:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer enrollment" });
    }
  });
  app2.get("/api/monthly-payments/:enrollmentId", isAuthenticated, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.enrollmentId);
      const payments = await storage.getMonthlyPayments(enrollmentId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching monthly payments:", error);
      res.status(500).json({ message: "Failed to fetch monthly payments" });
    }
  });
  app2.post("/api/monthly-payments", isAuthenticated, async (req, res) => {
    try {
      const { enrollmentId, amount, goldRate } = req.body;
      const enrollment = await storage.getCustomerEnrollment(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      if (Number(amount) !== Number(enrollment.monthlyAmount)) {
        return res.status(400).json({
          message: "Payment amount must match enrolled monthly amount",
          expected: enrollment.monthlyAmount,
          received: amount
        });
      }
      const existingPayments = await storage.getMonthlyPayments(enrollmentId);
      const scheme = await storage.getSavingScheme(enrollment.schemeId);
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }
      if (existingPayments.length >= scheme.totalMonths) {
        return res.status(400).json({
          message: "Maximum payments reached for this scheme",
          maxPayments: scheme.totalMonths,
          currentPayments: existingPayments.length
        });
      }
      const goldGrams = Number(amount) / Number(goldRate);
      const paymentData = {
        enrollmentId,
        paymentDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        // Today's date
        amount: amount.toString(),
        goldRate: goldRate.toString(),
        goldGrams: goldGrams.toString(),
        monthNumber: existingPayments.length + 1
      };
      const validatedData = insertMonthlyPaymentSchema.parse(paymentData);
      const payment = await storage.createMonthlyPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating monthly payment:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create monthly payment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/seed-admin.ts
async function createAdminUser() {
  try {
    const existingEmployee = await storage.getEmployeeByEmpCode("admin");
    if (existingEmployee) {
      console.log("Admin user already exists");
      return;
    }
    const hashedPassword = await hashPasswordForSeed("admin123");
    const adminEmployee = await storage.createEmployee({
      empCode: "admin",
      name: "Administrator",
      phone: "9999999999",
      email: "admin@jewelry.com",
      role: "admin",
      photo: null,
      password: hashedPassword,
      status: "Active"
    });
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// server/seed-initial-data.ts
import { eq as eq2 } from "drizzle-orm";
async function seedInitialData() {
  try {
    console.log("Seeding initial data...");
    const existingAdmin = await db.select().from(employees).where(eq2(employees.empCode, "EMP-001")).limit(1);
    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPasswordForSeed("temp_password");
      await db.insert(employees).values({
        empCode: "EMP-001",
        name: "Administrator",
        phone: "9999999999",
        email: "admin@jewelry.com",
        role: "admin",
        password: hashedPassword,
        status: "Active"
      });
      console.log("Admin employee created with hashed password");
    }
    const existingCategories = await db.select().from(productCategories).limit(1);
    if (existingCategories.length === 0) {
      const { PROTECTED_CATEGORY_CODES: PROTECTED_CATEGORY_CODES2 } = await Promise.resolve().then(() => (init_constants(), constants_exports));
      const defaultCategories = [
        {
          name: "Gold 22K Jewelry",
          code: "CAT-GOLD22K",
          hsnCode: "71131900",
          taxPercentage: "3.00"
        },
        {
          name: "Gold 18K Jewelry",
          code: "CAT-GOLD18K",
          hsnCode: "71131900",
          taxPercentage: "3.00"
        },
        {
          name: "Silver Jewelry",
          code: "CAT-SILVER",
          hsnCode: "71131100",
          taxPercentage: "3.00"
        },
        {
          name: "Diamond Jewelry",
          code: "CAT-DIAMOND",
          hsnCode: "71131910",
          taxPercentage: "0.25"
        },
        {
          name: "Platinum Jewelry",
          code: "CAT-PLATINUM",
          hsnCode: "71131920",
          taxPercentage: "3.00"
        }
      ];
      for (const category of defaultCategories) {
        const isProtected = PROTECTED_CATEGORY_CODES2.includes(category.code);
        await db.insert(productCategories).values({
          name: category.name,
          code: category.code,
          hsnCode: category.hsnCode,
          taxPercentage: category.taxPercentage
        });
        console.log(`Created category: ${category.name} (${category.code})${isProtected ? " [PROTECTED]" : ""}`);
      }
      console.log("Product categories seeded");
    }
    const existingDealers = await db.select().from(dealers).limit(1);
    if (existingDealers.length === 0) {
      const sampleDealers = [
        {
          name: "Mumbai Gold Traders",
          phone: "+91-9876543210",
          address: "123 Zaveri Bazaar, Mumbai, Maharashtra 400003",
          gstNumber: "27ABCDE1234F1Z5",
          categories: ["Gold 22K", "Gold 18K", "Silver"]
        },
        {
          name: "Delhi Diamond House",
          phone: "+91-9876543211",
          address: "456 Karol Bagh, New Delhi, Delhi 110005",
          gstNumber: "07ABCDE1234F1Z6",
          categories: ["Diamond", "Platinum"]
        },
        {
          name: "Chennai Silver Works",
          phone: "+91-9876543212",
          address: "789 T. Nagar, Chennai, Tamil Nadu 600017",
          gstNumber: "33ABCDE1234F1Z7",
          categories: ["Silver", "Gold 22K"]
        }
      ];
      for (const dealer of sampleDealers) {
        await db.insert(dealers).values(dealer);
        console.log(`Created dealer: ${dealer.name}`);
      }
      console.log("Sample dealers seeded");
    }
    const existingCustomers = await db.select().from(customers).limit(1);
    if (existingCustomers.length === 0) {
      const sampleCustomers = [
        {
          customerId: "CUST-20250805-001",
          name: "Rajesh Kumar",
          phone: "+91-9876543220",
          email: "rajesh.kumar@email.com",
          address: "Plot 123, Sector 15, Gurgaon, Haryana 122001",
          gstNumber: "06ABCDE1234F1Z8",
          dateOfBirth: "1985-03-15",
          anniversary: "2010-11-25",
          panCard: "ABCDE1234F"
        },
        {
          customerId: "CUST-20250805-002",
          name: "Priya Sharma",
          phone: "+91-9876543221",
          email: "priya.sharma@email.com",
          address: "Flat 45B, Whitefield, Bangalore, Karnataka 560066",
          gstNumber: null,
          dateOfBirth: "1990-07-22",
          anniversary: "2015-02-14",
          panCard: "FGHIJ5678K"
        },
        {
          customerId: "CUST-20250805-003",
          name: "Amit Patel",
          phone: "+91-9876543222",
          email: "amit.patel@email.com",
          address: "Bungalow 12, Satellite, Ahmedabad, Gujarat 380015",
          gstNumber: "24ABCDE1234F1Z9",
          dateOfBirth: "1982-12-08",
          anniversary: null,
          panCard: "KLMNO9012P"
        }
      ];
      for (const customer of sampleCustomers) {
        await db.insert(customers).values(customer);
        console.log(`Created customer: ${customer.name} (${customer.customerId})`);
      }
      console.log("Sample customers seeded");
    }
    const existingPrices = await db.select().from(priceMaster).limit(1);
    if (existingPrices.length === 0) {
      const samplePrices = [
        {
          effectiveDate: "2025-08-01",
          pricePerGram: "6850.00"
        },
        {
          effectiveDate: "2025-08-05",
          pricePerGram: "6920.00"
        }
      ];
      for (const price of samplePrices) {
        await db.insert(priceMaster).values(price);
        console.log(`Created price: \u20B9${price.pricePerGram}/gram on ${price.effectiveDate}`);
      }
      console.log("Sample price master seeded");
    }
    const dealersList = await db.select().from(dealers);
    const categoriesList = await db.select().from(productCategories);
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0 && dealersList.length > 0 && categoriesList.length > 0) {
      const goldCategory = categoriesList.find((c) => c.code === "CAT-GOLD22K");
      const silverCategory = categoriesList.find((c) => c.code === "CAT-SILVER");
      const diamondCategory = categoriesList.find((c) => c.code === "CAT-DIAMOND");
      const sampleProducts = [
        {
          name: "Gold Chain 22K",
          barcodeNumber: "GLD-CHN-001",
          type: "No stone",
          stoneWeight: null,
          dealerId: dealersList[0].id,
          weight: "15.50",
          makingChargeType: "Per Gram",
          makingChargeValue: "150.00",
          wastageChargeType: "Percentage",
          wastageChargeValue: "8.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        },
        {
          name: "Silver Bracelet",
          barcodeNumber: "SLV-BRC-001",
          type: "Stone",
          stoneWeight: "2.25",
          dealerId: dealersList[2].id,
          weight: "25.75",
          makingChargeType: "Fixed Amount",
          makingChargeValue: "500.00",
          wastageChargeType: "Per Piece",
          wastageChargeValue: "50.00",
          centralGovtNumber: null,
          categoryId: silverCategory?.id || null
        },
        {
          name: "Diamond Ring",
          barcodeNumber: "DMD-RNG-001",
          type: "Diamond Stone",
          stoneWeight: "1.50",
          dealerId: dealersList[1].id,
          weight: "8.25",
          makingChargeType: "Percentage",
          makingChargeValue: "20.00",
          wastageChargeType: "Fixed Amount",
          wastageChargeValue: "1000.00",
          centralGovtNumber: "IGI123456789",
          categoryId: diamondCategory?.id || null
        },
        {
          name: "Gold Earrings 22K",
          barcodeNumber: "GLD-EAR-001",
          type: "No stone",
          stoneWeight: null,
          dealerId: dealersList[0].id,
          weight: "12.75",
          makingChargeType: "Per Gram",
          makingChargeValue: "200.00",
          wastageChargeType: "Percentage",
          wastageChargeValue: "10.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        }
      ];
      for (const product of sampleProducts) {
        await db.insert(products).values(product);
        console.log(`Created product: ${product.name} (${product.barcodeNumber})`);
      }
      console.log("Sample products seeded");
    }
    const existingSchemes = await db.select().from(savingSchemeMaster).limit(1);
    if (existingSchemes.length === 0) {
      const sampleSchemes = [
        {
          schemeName: "11-Month Gold Plan",
          totalMonths: 11,
          description: "Pay for 11 months and get gold equivalent to 12 months value",
          termsAndConditions: "1. Monthly payment must be made before 10th of each month\n2. Scheme matures after 11 successful payments\n3. Gold rate will be calculated at the time of purchase\n4. Making charges applicable as per current rates\n5. Scheme cannot be transferred to another person"
        },
        {
          schemeName: "24-Month Premium Plan",
          totalMonths: 24,
          description: "Extended plan with additional benefits and lower making charges",
          termsAndConditions: "1. Monthly payment must be made before 10th of each month\n2. Scheme matures after 24 successful payments\n3. 10% discount on making charges\n4. Gold rate locked for final 6 months\n5. Option to extend scheme for additional months"
        },
        {
          schemeName: "6-Month Quick Plan",
          totalMonths: 6,
          description: "Short-term plan for quick gold accumulation",
          termsAndConditions: "1. Higher monthly commitment required\n2. Scheme matures after 6 successful payments\n3. Standard making charges applicable\n4. Gold rate calculated at purchase time\n5. Early closure penalty of 2% if closed before maturity"
        }
      ];
      for (const scheme of sampleSchemes) {
        await db.insert(savingSchemeMaster).values(scheme);
        console.log(`Created saving scheme: ${scheme.schemeName} (${scheme.totalMonths} months)`);
      }
      console.log("Sample saving schemes seeded");
    }
    console.log("Initial data seeding completed");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  seedInitialData().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await createAdminUser();
  await seedInitialData();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3001", 10);
  server.listen({
    port,
    host: "0.0.0.0"
    //reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
