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
      "CAT-DIAMOND",
      // Include platinum to prevent accidental deletion of base category
      "CAT-PLATINUM"
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
  companySettings: () => companySettings,
  customerEnrollments: () => customerEnrollments,
  customerEnrollmentsRelations: () => customerEnrollmentsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  dealers: () => dealers,
  dealersRelations: () => dealersRelations,
  discountRules: () => discountRules,
  employees: () => employees,
  insertCompanySettingsSchema: () => insertCompanySettingsSchema,
  insertCustomerEnrollmentSchema: () => insertCustomerEnrollmentSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertDealerSchema: () => insertDealerSchema,
  insertDiscountRuleSchema: () => insertDiscountRuleSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertMonthlyPaymentSchema: () => insertMonthlyPaymentSchema,
  insertPaymentTransactionSchema: () => insertPaymentTransactionSchema,
  insertPriceMasterSchema: () => insertPriceMasterSchema,
  insertProductCategorySchema: () => insertProductCategorySchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseOrderAuditLogSchema: () => insertPurchaseOrderAuditLogSchema,
  insertPurchaseOrderItemSchema: () => insertPurchaseOrderItemSchema,
  insertPurchaseOrderSchema: () => insertPurchaseOrderSchema,
  insertSavingSchemeSchema: () => insertSavingSchemeSchema,
  insertStockMovementSchema: () => insertStockMovementSchema,
  monthlyPayments: () => monthlyPayments,
  paymentTransactions: () => paymentTransactions,
  paymentTransactionsRelations: () => paymentTransactionsRelations,
  priceMaster: () => priceMaster,
  priceMasterRelations: () => priceMasterRelations,
  productCategories: () => productCategories,
  productCategoriesRelations: () => productCategoriesRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  purchaseOrderAuditLog: () => purchaseOrderAuditLog,
  purchaseOrderAuditLogRelations: () => purchaseOrderAuditLogRelations,
  purchaseOrderItems: () => purchaseOrderItems,
  purchaseOrderItemsRelations: () => purchaseOrderItemsRelations,
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
  boolean,
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
  purity: varchar("purity").notNull(),
  // 22kt, 24kt, 18kt, etc.
  stoneWeight: decimal("stone_weight", { precision: 12, scale: 3 }),
  netWeight: decimal("net_weight", { precision: 12, scale: 3 }).notNull(),
  // Pure gold weight
  grossWeight: decimal("gross_weight", { precision: 12, scale: 3 }).notNull(),
  // Total weight including stones
  dealerId: integer("dealer_id").references(() => dealers.id).notNull(),
  makingChargeType: varchar("making_charge_type"),
  // Percentage, Fixed Amount, Per Gram
  makingChargeValue: decimal("making_charge_value", { precision: 12, scale: 2 }),
  wastageChargeType: varchar("wastage_charge_type"),
  // Percentage, Fixed Amount, Per Gram, Per Piece
  wastageChargeValue: decimal("wastage_charge_value", { precision: 12, scale: 2 }),
  additionalCost: decimal("additional_cost", { precision: 12, scale: 2 }).default("0"),
  // Additional charges
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
  // Auto-generated: PO-YYYYMMDD-###
  invoiceNumber: varchar("invoice_number").unique(),
  // For invoices: INV-YYYYMMDD-###
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  orderDate: date("order_date").notNull(),
  dueDate: date("due_date"),
  // Payment due date
  billerName: varchar("biller_name"),
  // Employee who created the bill
  status: varchar("status").notNull().default("pending"),
  // pending/confirmed/shipped/received/cancelled/invoiced
  subTotal: decimal("sub_total", { precision: 12, scale: 2 }).notNull(),
  // Before discounts
  totalMakingCharges: decimal("total_making_charges", { precision: 12, scale: 2 }).default("0"),
  makingChargeDiscount: decimal("making_charge_discount", { precision: 12, scale: 2 }).default("0"),
  makingChargeDiscountPercentage: decimal("making_charge_discount_percentage", { precision: 5, scale: 2 }).default("0"),
  totalGoldGrossWeight: decimal("total_gold_gross_weight", { precision: 12, scale: 3 }).notNull(),
  goldValueDiscountPerGram: decimal("gold_value_discount_per_gram", { precision: 10, scale: 2 }).default("0"),
  totalGoldValueDiscount: decimal("total_gold_value_discount", { precision: 12, scale: 2 }).default("0"),
  totalDiscountAmount: decimal("total_discount_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  advanceAmount: decimal("advance_amount", { precision: 12, scale: 2 }).default("0"),
  // Amount paid in advance
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).default("0"),
  // Remaining amount
  grandTotal: decimal("grand_total", { precision: 12, scale: 2 }).notNull(),
  // Final amount after advance
  gstAmount: decimal("gst_amount", { precision: 12, scale: 2 }).notNull(),
  // Total GST amount
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => employees.id).notNull(),
  // Employee who created the order
  updatedBy: integer("updated_by").references(() => employees.id)
  // Employee who last updated the order
});
var purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  purity: varchar("purity").notNull(),
  // Gold purity at time of order
  goldRatePerGram: decimal("gold_rate_per_gram", { precision: 10, scale: 2 }).notNull(),
  // Gold rate at order time
  netWeight: decimal("net_weight", { precision: 12, scale: 3 }).notNull(),
  // Pure gold weight
  grossWeight: decimal("gross_weight", { precision: 12, scale: 3 }).notNull(),
  // Total weight
  labourRatePerGram: decimal("labour_rate_per_gram", { precision: 10, scale: 2 }).notNull(),
  // Labour charges
  additionalCost: decimal("additional_cost", { precision: 12, scale: 2 }).default("0"),
  // Additional charges
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
  // goldRate * netWeight + labour + additional
  gstPercentage: decimal("gst_percentage", { precision: 5, scale: 2 }).notNull(),
  // GST percentage
  gstAmount: decimal("gst_amount", { precision: 12, scale: 2 }).notNull(),
  // Calculated GST amount
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  // basePrice + gstAmount
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var purchaseOrderAuditLog = pgTable("purchase_order_audit_log", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  updatedBy: integer("updated_by").references(() => employees.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  changes: jsonb("changes").notNull(),
  // JSON detailing what was changed
  createdAt: timestamp("created_at").defaultNow()
});
var paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  // cash, card, upi, cheque, bank_transfer
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  transactionReference: varchar("transaction_reference"),
  // Cheque number, UPI reference, etc.
  notes: text("notes"),
  processedBy: integer("processed_by").references(() => employees.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var discountRules = pgTable("discount_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  // making_charge, gold_value, item_total, order_total
  calculationType: varchar("calculation_type").notNull(),
  // percentage, fixed_amount, per_gram
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 12, scale: 2 }),
  applicableCategories: integer("applicable_categories").array(),
  // Array of category IDs
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name").notNull(),
  address: text("address").notNull(),
  gstNumber: varchar("gst_number").notNull(),
  website: varchar("website"),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull(),
  logo: varchar("logo"),
  // Logo file path
  invoiceTerms: text("invoice_terms"),
  // Terms and conditions
  bankDetails: jsonb("bank_details"),
  // Bank account information
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
var purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [purchaseOrders.customerId],
    references: [customers.id]
  }),
  creator: one(employees, {
    fields: [purchaseOrders.createdBy],
    references: [employees.id]
  }),
  updater: one(employees, {
    fields: [purchaseOrders.updatedBy],
    references: [employees.id]
  }),
  items: many(purchaseOrderItems),
  auditLogs: many(purchaseOrderAuditLog),
  paymentTransactions: many(paymentTransactions)
}));
var purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id]
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id]
  })
}));
var purchaseOrderAuditLogRelations = relations(purchaseOrderAuditLog, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderAuditLog.purchaseOrderId],
    references: [purchaseOrders.id]
  }),
  updatedBy: one(employees, {
    fields: [purchaseOrderAuditLog.updatedBy],
    references: [employees.id]
  })
}));
var paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [paymentTransactions.purchaseOrderId],
    references: [purchaseOrders.id]
  }),
  processedBy: one(employees, {
    fields: [paymentTransactions.processedBy],
    references: [employees.id]
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
  stoneWeight: z.union([z.string().regex(/^\d+(\.\d{1,3})?$/), z.number()]).optional(),
  netWeight: z.union([z.string().regex(/^\d+(\.\d{1,3})?$/), z.number()]),
  grossWeight: z.union([z.string().regex(/^\d+(\.\d{1,3})?$/), z.number()]),
  makingChargeValue: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  wastageChargeValue: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  additionalCost: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()]).optional(),
  dealerId: z.number().int(),
  categoryId: z.number().int().optional()
});
var insertPriceMasterSchema = createInsertSchema(priceMaster).omit({ id: true, createdAt: true, updatedAt: true });
var insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, orderNumber: true, createdAt: true, updatedAt: true });
var insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true, updatedAt: true });
var insertPurchaseOrderAuditLogSchema = createInsertSchema(purchaseOrderAuditLog).omit({ id: true, createdAt: true });
var insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({ id: true, createdAt: true, updatedAt: true });
var insertDiscountRuleSchema = createInsertSchema(discountRules).omit({ id: true, createdAt: true, updatedAt: true });
var insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true, createdAt: true, updatedAt: true });
var insertMonthlyPaymentSchema = createInsertSchema(monthlyPayments).omit({ id: true, createdAt: true, updatedAt: true });
var insertStockMovementSchema = createInsertSchema(stockMovements).omit({ id: true, createdAt: true, updatedAt: true });
var insertSavingSchemeSchema = createInsertSchema(savingSchemeMaster).omit({ id: true, createdAt: true, updatedAt: true });
var insertCustomerEnrollmentSchema = createInsertSchema(customerEnrollments).omit({ id: true, cardNumber: true, createdAt: true, updatedAt: true });

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
    const pattern = `%${query}%`;
    const rows = await db.select({
      id: products.id,
      name: products.name,
      barcodeNumber: products.barcodeNumber,
      type: products.type,
      stoneWeight: products.stoneWeight,
      dealerId: products.dealerId,
      weight: products.netWeight,
      // Updated to use netWeight
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
      catHsn: productCategories.hsnCode
    }).from(products).leftJoin(productCategories, eq(products.categoryId, productCategories.id)).where(sql`${products.name} ILIKE ${pattern} OR ${products.barcodeNumber} ILIKE ${pattern}`).orderBy(asc(products.name)).limit(25);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      barcodeNumber: r.barcodeNumber,
      type: r.type,
      stoneWeight: r.stoneWeight,
      dealerId: r.dealerId,
      weight: r.weight,
      grossWeight: r.grossWeight,
      // Add the missing grossWeight field
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
        hsnCode: r.catHsn
      } : null
    }));
  }
  async createProduct(product) {
    const prepared = { ...product };
    ["stoneWeight", "weight", "makingChargeValue", "wastageChargeValue"].forEach((k) => {
      if (prepared[k] !== void 0 && prepared[k] !== null) prepared[k] = prepared[k].toString();
    });
    const [newProduct] = await db.insert(products).values(prepared).returning();
    return newProduct;
  }
  async updateProduct(id, product) {
    const prepared = { ...product, updatedAt: /* @__PURE__ */ new Date() };
    ["stoneWeight", "weight", "makingChargeValue", "wastageChargeValue"].forEach((k) => {
      if (prepared[k] !== void 0 && prepared[k] !== null) prepared[k] = prepared[k].toString();
    });
    const [updatedProduct] = await db.update(products).set(prepared).where(eq(products.id, id)).returning();
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
    const results = [];
    for (const priceData of prices) {
      const existingPrice = await db.select().from(priceMaster).where(and(
        eq(priceMaster.categoryId, priceData.categoryId),
        eq(priceMaster.effectiveDate, priceData.effectiveDate)
      )).limit(1);
      if (existingPrice.length > 0) {
        const [updatedPrice] = await db.update(priceMaster).set({
          pricePerGram: priceData.pricePerGram,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(priceMaster.id, existingPrice[0].id)).returning();
        results.push(updatedPrice);
      } else {
        const [newPrice] = await db.insert(priceMaster).values(priceData).returning();
        results.push(newPrice);
      }
    }
    return results;
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
  async getPurchaseOrderWithDetails(id) {
    const order = await db.select({
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
      creatorName: employees.name
    }).from(purchaseOrders).leftJoin(customers, eq(purchaseOrders.customerId, customers.id)).leftJoin(employees, eq(purchaseOrders.createdBy, employees.id)).where(eq(purchaseOrders.id, id)).limit(1);
    if (order.length === 0) return void 0;
    const items = await this.getPurchaseOrderItems(id);
    const auditLogs = await this.getPurchaseOrderAuditLogs(id);
    return {
      ...order[0],
      items,
      auditLogs
    };
  }
  // Purchase Order Items operations
  async getPurchaseOrderItems(purchaseOrderId) {
    return await db.select({
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
      categoryTaxPercentage: productCategories.taxPercentage
    }).from(purchaseOrderItems).leftJoin(products, eq(purchaseOrderItems.productId, products.id)).leftJoin(productCategories, eq(products.categoryId, productCategories.id)).where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId)).orderBy(asc(purchaseOrderItems.createdAt));
  }
  async createPurchaseOrderItems(items) {
    const newItems = await db.insert(purchaseOrderItems).values(items).returning();
    return newItems;
  }
  async updatePurchaseOrderItem(id, item) {
    const [updatedItem] = await db.update(purchaseOrderItems).set({ ...item, updatedAt: /* @__PURE__ */ new Date() }).where(eq(purchaseOrderItems.id, id)).returning();
    return updatedItem;
  }
  async deletePurchaseOrderItem(id) {
    const result = await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return result.length > 0;
  }
  // Purchase Order Audit operations
  async createPurchaseOrderAuditLog(auditLog) {
    const [newAuditLog] = await db.insert(purchaseOrderAuditLog).values(auditLog).returning();
    return newAuditLog;
  }
  async getPurchaseOrderAuditLogs(purchaseOrderId) {
    return await db.select({
      id: purchaseOrderAuditLog.id,
      purchaseOrderId: purchaseOrderAuditLog.purchaseOrderId,
      updatedBy: purchaseOrderAuditLog.updatedBy,
      updatedAt: purchaseOrderAuditLog.updatedAt,
      changes: purchaseOrderAuditLog.changes,
      createdAt: purchaseOrderAuditLog.createdAt,
      employeeName: employees.name,
      employeeEmpCode: employees.empCode
    }).from(purchaseOrderAuditLog).leftJoin(employees, eq(purchaseOrderAuditLog.updatedBy, employees.id)).where(eq(purchaseOrderAuditLog.purchaseOrderId, purchaseOrderId)).orderBy(desc(purchaseOrderAuditLog.updatedAt));
  }
  async getLatestPriceForCategory(categoryId, date2) {
    const effectiveDate = date2 || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let [price] = await db.select().from(priceMaster).where(and(
      eq(priceMaster.categoryId, categoryId),
      eq(priceMaster.effectiveDate, effectiveDate)
    )).limit(1);
    if (!price) {
      [price] = await db.select().from(priceMaster).where(and(
        eq(priceMaster.categoryId, categoryId),
        lt(priceMaster.effectiveDate, effectiveDate)
      )).orderBy(desc(priceMaster.effectiveDate)).limit(1);
    }
    return price;
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
  // Company settings operations
  async getCompanySettings() {
    const [settings] = await db.select().from(companySettings).limit(1);
    return settings;
  }
  async updateCompanySettings(settings) {
    const existing = await this.getCompanySettings();
    if (existing) {
      const [updated] = await db.update(companySettings).set({ ...settings, updatedAt: /* @__PURE__ */ new Date() }).where(eq(companySettings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(companySettings).values(settings).returning();
      return created;
    }
  }
  // Discount rules operations
  async getDiscountRules() {
    return await db.select().from(discountRules).orderBy(desc(discountRules.createdAt));
  }
  async getActiveDiscountRules() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return await db.select().from(discountRules).where(
      and(
        eq(discountRules.isActive, true),
        sql`${discountRules.startDate} <= ${today}`,
        sql`(${discountRules.endDate} IS NULL OR ${discountRules.endDate} >= ${today})`
      )
    ).orderBy(desc(discountRules.createdAt));
  }
  async createDiscountRule(rule) {
    const [newRule] = await db.insert(discountRules).values(rule).returning();
    return newRule;
  }
  async updateDiscountRule(id, rule) {
    const [updated] = await db.update(discountRules).set({ ...rule, updatedAt: /* @__PURE__ */ new Date() }).where(eq(discountRules.id, id)).returning();
    return updated;
  }
  // Payment transaction operations
  async getPaymentTransactions(purchaseOrderId) {
    return await db.select().from(paymentTransactions).where(eq(paymentTransactions.purchaseOrderId, purchaseOrderId)).orderBy(desc(paymentTransactions.createdAt));
  }
  async createPaymentTransaction(transaction) {
    const [newTransaction] = await db.insert(paymentTransactions).values(transaction).returning();
    return newTransaction;
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
    const todayOrders = await db.select({ orderNumber: purchaseOrders.orderNumber }).from(purchaseOrders).where(like(purchaseOrders.orderNumber, `PO-${dateStr}-%`));
    const sequence = todayOrders.length + 1;
    return `PO-${dateStr}-${sequence.toString().padStart(3, "0")}`;
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
    const monthStartIso = currentMonth.toISOString();
    const [monthlySalesResult] = await db.select({ total: sql`coalesce(sum(cast(${purchaseOrders.totalAmount} as numeric)), 0)` }).from(purchaseOrders).where(sql`${purchaseOrders.createdAt} >= ${monthStartIso}`);
    const [stockValueResult] = await db.select({ value: sql`coalesce(sum(cast(${products.netWeight} as numeric) * 5000), 0)` }).from(products);
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
  app2.get("/api/price-master/latest", isAuthenticated, async (req, res) => {
    try {
      const { categoryId, date: date2 } = req.query;
      if (!categoryId) {
        return res.status(400).json({ message: "categoryId is required" });
      }
      const price = await storage.getLatestPriceForCategory(
        Number(categoryId),
        date2 ? String(date2) : void 0
      );
      if (!price) {
        return res.status(404).json({ message: "No price found for this category" });
      }
      res.json(price);
    } catch (error) {
      console.error("Error fetching latest price:", error);
      res.status(500).json({ message: "Failed to fetch latest price" });
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
      const ordersWithDetails = await Promise.all(orders.map(async (order) => {
        const customer = await storage.getCustomer(order.customerId);
        const creator = order.createdBy ? await storage.getEmployee(order.createdBy) : null;
        const updater = order.updatedBy ? await storage.getEmployee(order.updatedBy) : null;
        return {
          ...order,
          customer: customer ? { name: customer.name, phone: customer.phone, customerId: customer.customerId } : null,
          creator: creator ? { name: creator.name, empCode: creator.empCode } : null,
          updater: updater ? { name: updater.name, empCode: updater.empCode } : null
        };
      }));
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });
  app2.get("/api/purchase-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getPurchaseOrderWithDetails(id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });
  app2.post("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !["admin", "manager"].includes(currentUser.role.toLowerCase())) {
        return res.status(403).json({ message: "Access denied. Only Admin and Manager can create purchase orders." });
      }
      console.log("Full request body:", JSON.stringify(req.body, null, 2));
      const { items, discount = 0, orderDate, customerId, status = "pending", subTotal, totalGoldGrossWeight, grandTotal, gstAmount } = req.body;
      console.log("Extracted fields:", { subTotal, totalGoldGrossWeight, grandTotal, gstAmount });
      console.log("Types:", {
        subTotal: typeof subTotal,
        totalGoldGrossWeight: typeof totalGoldGrossWeight,
        grandTotal: typeof grandTotal,
        gstAmount: typeof gstAmount
      });
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "At least one item is required" });
      }
      if (!customerId) {
        return res.status(400).json({ message: "Customer is required" });
      }
      if (!subTotal || !totalGoldGrossWeight || !grandTotal || !gstAmount) {
        return res.status(400).json({ message: "Missing required total fields: subTotal, totalGoldGrossWeight, grandTotal, gstAmount" });
      }
      let totalAmount = 0;
      const processedItems = [];
      for (const item of items) {
        const { productId, quantity, weight, pricePerGram, basePrice, taxAmount, finalPrice } = item;
        if (!productId || !quantity || !weight || !pricePerGram || basePrice === void 0 || taxAmount === void 0 || finalPrice === void 0) {
          return res.status(400).json({ message: "All item fields are required" });
        }
        totalAmount += Number(finalPrice) * Number(quantity);
        processedItems.push({
          productId: Number(productId),
          quantity: Number(quantity),
          purity: "22K",
          // Default purity - should be fetched from product
          goldRatePerGram: String(pricePerGram),
          netWeight: String(weight),
          // Using weight as netWeight for now
          grossWeight: String(weight),
          // Using weight as grossWeight for now  
          labourRatePerGram: "0",
          // Default - should be calculated properly
          additionalCost: "0",
          basePrice: String(basePrice),
          gstPercentage: "3.0",
          // Default GST percentage
          gstAmount: String(taxAmount),
          totalPrice: String(finalPrice)
        });
      }
      totalAmount = totalAmount - Number(discount);
      const orderData = {
        customerId: Number(customerId),
        orderDate: orderDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        status,
        subTotal: String(subTotal),
        totalGoldGrossWeight: String(totalGoldGrossWeight),
        grandTotal: String(grandTotal),
        gstAmount: String(gstAmount),
        totalAmount: String(grandTotal),
        // Same as grandTotal
        discount: String(discount),
        createdBy: currentUser.id,
        updatedBy: currentUser.id
      };
      const validatedOrderData = insertPurchaseOrderSchema.parse(orderData);
      const order = await storage.createPurchaseOrder(validatedOrderData);
      const itemsWithOrderId = processedItems.map((item) => ({
        ...item,
        purchaseOrderId: order.id
      }));
      const validatedItems = itemsWithOrderId.map((item) => insertPurchaseOrderItemSchema.parse(item));
      const createdItems = await storage.createPurchaseOrderItems(validatedItems);
      await storage.createPurchaseOrderAuditLog({
        purchaseOrderId: order.id,
        updatedBy: currentUser.id,
        changes: {
          action: "created",
          details: `Purchase order created with ${items.length} items`,
          totalAmount,
          itemCount: items.length
        }
      });
      res.status(201).json({
        ...order,
        items: createdItems
      });
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
      const currentUser = req.user;
      if (!currentUser || !["admin", "manager"].includes(currentUser.role.toLowerCase())) {
        return res.status(403).json({ message: "Access denied. Only Admin and Manager can update purchase orders." });
      }
      const id = parseInt(req.params.id);
      const existingOrder = await storage.getPurchaseOrder(id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      const existingItems = await storage.getPurchaseOrderItems(id);
      const { items, discount, status, ...otherUpdates } = req.body;
      let updateData = {
        ...otherUpdates,
        updatedBy: currentUser.id,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (discount !== void 0) updateData.totalDiscountAmount = String(discount);
      if (status !== void 0) updateData.status = status;
      const auditChanges = {
        action: "updated",
        changedFields: [],
        itemChanges: {
          added: [],
          updated: [],
          removed: []
        },
        previousValues: {
          status: existingOrder.status,
          totalAmount: existingOrder.totalAmount,
          totalDiscountAmount: existingOrder.totalDiscountAmount
        },
        newValues: {}
      };
      Object.keys(updateData).forEach((field) => {
        if (field !== "updatedBy" && field !== "updatedAt" && existingOrder[field] !== updateData[field]) {
          auditChanges.changedFields.push(field);
          auditChanges.newValues[field] = updateData[field];
        }
      });
      if (Array.isArray(items)) {
        let totalAmount = 0;
        const existingItemsMap = new Map(
          existingItems.map((item) => [item.id, item])
        );
        const processedItems = [];
        for (const item of items) {
          const {
            productId,
            quantity,
            // Old field names
            weight,
            pricePerGram,
            basePrice,
            taxAmount,
            finalPrice,
            // New field names
            netWeight,
            grossWeight,
            goldRatePerGram,
            gstAmount,
            totalPrice
          } = item;
          const itemNetWeight = netWeight || weight;
          const itemGrossWeight = grossWeight || weight;
          const itemGoldRate = goldRatePerGram || pricePerGram;
          const itemGstAmount = gstAmount || taxAmount;
          const itemTotalPrice = totalPrice || finalPrice;
          if (!quantity || !itemNetWeight || !itemGoldRate || basePrice === void 0 || itemGstAmount === void 0 || itemTotalPrice === void 0) {
            return res.status(400).json({ message: "All item fields are required" });
          }
          totalAmount += Number(itemTotalPrice) * Number(quantity);
          if (item.id) {
            const existingItem = existingItemsMap.get(item.id);
            if (existingItem) {
              existingItemsMap.delete(item.id);
              const before = {};
              const after = {};
              let hasChanges = false;
              const fieldMapping = [
                { old: "quantity", new: "quantity" },
                { old: "weight", new: "netWeight" },
                { old: "pricePerGram", new: "goldRatePerGram" },
                { old: "basePrice", new: "basePrice" },
                { old: "taxAmount", new: "gstAmount" },
                { old: "finalPrice", new: "totalPrice" }
              ];
              fieldMapping.forEach(({ old, new: newField }) => {
                const itemValue = item[old] !== void 0 ? item[old] : item[newField];
                const existingValue = existingItem[newField];
                if (String(existingValue) !== String(itemValue)) {
                  before[newField] = existingValue;
                  after[newField] = itemValue;
                  hasChanges = true;
                }
              });
              if (hasChanges) {
                const updatedItem = await storage.updatePurchaseOrderItem(item.id, {
                  quantity: Number(quantity),
                  netWeight: String(itemNetWeight),
                  grossWeight: String(itemGrossWeight),
                  goldRatePerGram: String(itemGoldRate),
                  basePrice: String(basePrice),
                  gstAmount: String(itemGstAmount),
                  totalPrice: String(itemTotalPrice),
                  purity: "22K",
                  // Default purity
                  labourRatePerGram: "0",
                  // Default labour rate
                  gstPercentage: "3.0",
                  // Default GST percentage
                  additionalCost: "0"
                  // Default additional cost
                });
                auditChanges.itemChanges.updated.push({
                  id: item.id,
                  productId: existingItem.productId,
                  before,
                  after
                });
              }
            }
          } else if (productId) {
            const newItemData = {
              purchaseOrderId: id,
              productId: Number(productId),
              quantity: Number(quantity),
              purity: "22K",
              // Default purity
              netWeight: String(itemNetWeight),
              grossWeight: String(itemGrossWeight),
              goldRatePerGram: String(itemGoldRate),
              labourRatePerGram: "0",
              // Default labour rate
              additionalCost: "0",
              // Default additional cost
              basePrice: String(basePrice),
              gstPercentage: "3.0",
              // Default GST percentage
              gstAmount: String(itemGstAmount),
              totalPrice: String(itemTotalPrice)
            };
            const validatedItem = insertPurchaseOrderItemSchema.parse(newItemData);
            const createdItems = await storage.createPurchaseOrderItems([validatedItem]);
            auditChanges.itemChanges.added.push({
              productId: Number(productId),
              quantity: Number(quantity),
              netWeight: String(itemNetWeight),
              totalPrice: String(itemTotalPrice)
            });
          }
        }
        for (const [itemId, existingItem] of Array.from(existingItemsMap.entries())) {
          await storage.deletePurchaseOrderItem(itemId);
          auditChanges.itemChanges.removed.push({
            id: itemId,
            productId: existingItem.productId,
            quantity: existingItem.quantity,
            netWeight: existingItem.netWeight,
            totalPrice: existingItem.totalPrice
          });
        }
        totalAmount = totalAmount - Number(discount || 0);
        updateData.totalAmount = String(totalAmount);
        auditChanges.newValues.totalAmount = String(totalAmount);
      }
      const validatedData = insertPurchaseOrderSchema.partial().parse(updateData);
      const order = await storage.updatePurchaseOrder(id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      await storage.createPurchaseOrderAuditLog({
        purchaseOrderId: id,
        updatedBy: currentUser.id,
        changes: auditChanges
      });
      res.json(order);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });
  app2.get("/api/purchase-orders/:id/audit", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const auditLogs = await storage.getPurchaseOrderAuditLogs(id);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching purchase order audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.get("/api/customers/search", isAuthenticated, async (req, res) => {
    try {
      const raw = typeof req.query.q === "string" ? req.query.q : "";
      const q = raw.trim();
      if (q.length < 2) return res.json([]);
      const customers2 = await storage.searchCustomers(q);
      return res.json(customers2);
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  });
  app2.get("/api/products/search", isAuthenticated, async (req, res) => {
    try {
      const raw = typeof req.query.q === "string" ? req.query.q : "";
      const q = raw.trim();
      if (q.length < 2) return res.json([]);
      const products2 = await storage.searchProducts(q);
      return res.json(products2);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  app2.get("/api/customers/search/:query", isAuthenticated, async (req, res) => {
    try {
      const { query } = req.params;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const customers2 = await storage.searchCustomers(query);
      res.json(customers2);
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  });
  app2.get("/api/products/search/:query", isAuthenticated, async (req, res) => {
    try {
      const { query } = req.params;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const products2 = await storage.searchProducts(query);
      const productsWithCategories = await Promise.all(products2.map(async (product) => {
        const category = product.categoryId ? await storage.getProductCategory(product.categoryId) : null;
        return {
          ...product,
          category: category ? {
            id: category.id,
            name: category.name,
            taxPercentage: category.taxPercentage
          } : null
        };
      }));
      res.json(productsWithCategories);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
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

// server/invoice-routes.ts
import { Router } from "express";

// shared/invoice-utils.ts
function calculateItemTotal(item) {
  const goldCost = item.goldRatePerGram * item.netWeight;
  const labourCost = item.labourRatePerGram * item.netWeight;
  const basePrice = (goldCost + labourCost + item.additionalCost) * item.quantity;
  const gstAmount = basePrice * item.gstPercentage / 100;
  const totalPrice = basePrice + gstAmount;
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
}
function calculateInvoiceTotal(items, discountRules2 = {}, advanceAmount = 0) {
  let subTotal = 0;
  let totalMakingCharges = 0;
  let totalGoldGrossWeight = 0;
  let gstAmount = 0;
  items.forEach((item) => {
    const itemCalc = calculateItemTotal(item);
    subTotal += itemCalc.totalPrice;
    gstAmount += itemCalc.gstAmount;
    totalMakingCharges += item.labourRatePerGram * item.netWeight * item.quantity;
    totalGoldGrossWeight += item.grossWeight * item.quantity;
  });
  const makingChargeDiscountPercentage = discountRules2.makingChargeDiscountPercentage || 0;
  const makingChargeDiscount = totalMakingCharges * makingChargeDiscountPercentage / 100;
  const goldValueDiscountPerGram = discountRules2.goldValueDiscountPerGram || 0;
  const goldValueDiscount = totalGoldGrossWeight * goldValueDiscountPerGram;
  const totalDiscountAmount = makingChargeDiscount + goldValueDiscount;
  const totalAmount = subTotal - totalDiscountAmount;
  const grandTotal = totalAmount - advanceAmount;
  return {
    subTotal: Math.round(subTotal * 100) / 100,
    totalMakingCharges: Math.round(totalMakingCharges * 100) / 100,
    makingChargeDiscount: Math.round(makingChargeDiscount * 100) / 100,
    totalGoldGrossWeight: Math.round(totalGoldGrossWeight * 1e3) / 1e3,
    // 3 decimal places for weight
    goldValueDiscount: Math.round(goldValueDiscount * 100) / 100,
    totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
}
function generateInvoiceNumber() {
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const randomNum = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
  return `INV-${dateStr}-${randomNum}`;
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}
function formatWeight(weight) {
  return `${weight.toFixed(3)} gm`;
}

// shared/invoice-generator.ts
function generateInvoiceHTML(invoice) {
  const itemsHTML = invoice.items.map((item, index2) => {
    const itemCalc = calculateItemTotal(item);
    return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index2 + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.purity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.goldRatePerGram)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatWeight(item.netWeight)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatWeight(item.grossWeight)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.labourRatePerGram}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.additionalCost)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.gstPercentage}%</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(itemCalc.totalPrice)}</td>
      </tr>
    `;
  }).join("");
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice - ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          border: 2px solid #333;
          padding: 15px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        }
        .header-title {
          background: #d4a574;
          color: white;
          text-align: center;
          padding: 10px;
          font-size: 24px;
          font-weight: bold;
          margin: -15px -15px 15px -15px;
        }
        .company-info {
          float: left;
          width: 60%;
        }
        .logo-section {
          float: right;
          width: 35%;
          text-align: center;
          background: #fffacd;
          padding: 20px;
          border: 1px solid #ddd;
        }
        .bill-details {
          clear: both;
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }
        .bill-to, .bill-info {
          width: 48%;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background: #4a6fa5;
          color: white;
          padding: 10px 8px;
          text-align: center;
          font-size: 12px;
          border: 1px solid #ddd;
        }
        .items-table td {
          font-size: 11px;
        }
        .totals-section {
          float: right;
          width: 50%;
          margin-top: 20px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .totals-row.highlight {
          background: #fff9c4;
          font-weight: bold;
          padding: 8px;
        }
        .footer {
          clear: both;
          margin-top: 40px;
          text-align: center;
          border-top: 2px solid #333;
          padding-top: 15px;
        }
        .signature-section {
          margin: 30px 0;
          border: 1px solid #ddd;
          padding: 15px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-title">Tax Invoice</div>
          <div class="company-info">
            <strong>Company Name:</strong> ${invoice.company.companyName}<br>
            <strong>Address:</strong> ${invoice.company.address}<br><br>
            <strong>GSTN:</strong> ${invoice.company.gstNumber}<br>
            <strong>Website:</strong> ${invoice.company.website || "N/A"}
          </div>
          <div class="logo-section">
            <div style="font-size: 36px; font-weight: bold; color: #666;">Logo</div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <!-- Bill Details -->
        <div class="bill-details">
          <div class="bill-to">
            <strong>Bill To:</strong><br>
            <strong>Name of Client:</strong> ${invoice.customer.name}<br>
            <strong>Email:</strong> ${invoice.customer.email || "N/A"}<br>
            <strong>Phone:</strong> ${invoice.customer.phone}<br>
            <strong>Address:</strong> ${invoice.customer.address || "N/A"}
          </div>
          <div class="bill-info">
            <strong>Bill No.:</strong> ${invoice.invoiceNumber}<br>
            <strong>Bill Date:</strong> ${invoice.billDate}<br>
            <strong>Due Date:</strong> ${invoice.dueDate || "N/A"}<br>
            <strong>Biller Name:</strong> ${invoice.billerName || "N/A"}
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Item Name</th>
              <th>Purity</th>
              <th>Gold Rate/Gm</th>
              <th>Net weight (gm)</th>
              <th>Gross weight (gm)</th>
              <th>Labour Rate/gm</th>
              <th>Additional Cost</th>
              <th>GST</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-row highlight">
            <span>Sub-total Including GST</span>
            <span>${formatCurrency(invoice.totals.subTotal)}</span>
          </div>
          <div class="totals-row">
            <span>Making Charges</span>
            <span>${formatCurrency(invoice.totals.totalMakingCharges)}</span>
          </div>
          <div class="totals-row">
            <span>Discount On Making Charges @ ${invoice.totals.makingChargeDiscountPercentage}%</span>
            <span>${formatCurrency(invoice.totals.makingChargeDiscount)}</span>
          </div>
          <div class="totals-row">
            <span><strong>Total Gold Gross weight (gm)</strong></span>
            <span><strong>${formatWeight(invoice.totals.totalGoldGrossWeight)}</strong></span>
          </div>
          <div class="totals-row">
            <span>Discount On Gold Value per gm @ Rs ${invoice.totals.goldValueDiscountPerGram}</span>
            <span>${formatCurrency(invoice.totals.totalGoldValueDiscount)}</span>
          </div>
          <div class="totals-row">
            <span><strong>Total Discount Amount</strong></span>
            <span><strong>${formatCurrency(invoice.totals.totalDiscountAmount)}</strong></span>
          </div>
          <div class="totals-row highlight">
            <span><strong>Total</strong></span>
            <span><strong>${formatCurrency(invoice.totals.totalAmount)}</strong></span>
          </div>
          <div class="totals-row">
            <span>Amount Paid in Advance</span>
            <span>${formatCurrency(invoice.totals.advanceAmount)}</span>
          </div>
          <div class="totals-row highlight" style="font-size: 16px;">
            <span><strong>Grand Total</strong></span>
            <span><strong>${formatCurrency(invoice.totals.grandTotal)}</strong></span>
          </div>
        </div>

        <div style="clear: both;"></div>

        <!-- Signature Section -->
        <div class="signature-section">
          <strong>Business Signature</strong><br><br>
          <div style="height: 40px;"></div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="background: #d4a574; color: white; padding: 10px; margin: 20px 0;">
            <strong>${invoice.company.invoiceTerms || "Thanks for business with us!!! Please visit us again !!!"}</strong>
          </div>
          <div>
            <strong>Contact Details</strong><br>
            <strong>Phone Number:</strong> ${invoice.company.phone}<br>
            <strong>Email Id:</strong> ${invoice.company.email}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateInvoiceText(invoice) {
  const separator = "=".repeat(80);
  const items = invoice.items.map((item, index2) => {
    const itemCalc = calculateItemTotal(item);
    return `${index2 + 1}. ${item.productName} (${item.purity})
   Gold Rate: ${formatCurrency(item.goldRatePerGram)}/gm | Net: ${formatWeight(item.netWeight)} | Gross: ${formatWeight(item.grossWeight)}
   Labour: ${item.labourRatePerGram}/gm | Additional: ${formatCurrency(item.additionalCost)} | GST: ${item.gstPercentage}%
   Total: ${formatCurrency(itemCalc.totalPrice)}`;
  }).join("\n\n");
  return `
${separator}
                               TAX INVOICE
${separator}

${invoice.company.companyName}
${invoice.company.address}
GSTN: ${invoice.company.gstNumber}
Phone: ${invoice.company.phone} | Email: ${invoice.company.email}

${separator}

Bill No: ${invoice.invoiceNumber}               Order No: ${invoice.orderNumber}
Bill Date: ${invoice.billDate}                 Due Date: ${invoice.dueDate || "N/A"}
Biller: ${invoice.billerName || "N/A"}

Bill To:
${invoice.customer.name}
${invoice.customer.phone}
${invoice.customer.email || ""}
${invoice.customer.address || ""}

${separator}
                                ITEMS
${separator}

${items}

${separator}
                               SUMMARY
${separator}

Sub-total Including GST:                    ${formatCurrency(invoice.totals.subTotal)}
Making Charges:                             ${formatCurrency(invoice.totals.totalMakingCharges)}
Discount On Making Charges @ ${invoice.totals.makingChargeDiscountPercentage}%:        ${formatCurrency(invoice.totals.makingChargeDiscount)}
Total Gold Gross Weight:                    ${formatWeight(invoice.totals.totalGoldGrossWeight)}
Discount On Gold Value @ Rs ${invoice.totals.goldValueDiscountPerGram}/gm:        ${formatCurrency(invoice.totals.totalGoldValueDiscount)}
Total Discount Amount:                      ${formatCurrency(invoice.totals.totalDiscountAmount)}
Total:                                      ${formatCurrency(invoice.totals.totalAmount)}
Amount Paid in Advance:                     ${formatCurrency(invoice.totals.advanceAmount)}
GRAND TOTAL:                                ${formatCurrency(invoice.totals.grandTotal)}

${separator}

${invoice.company.invoiceTerms || "Thanks for business with us!!! Please visit us again !!!"}

${separator}
  `;
}

// server/invoice-routes.ts
var router = Router();
router.get("/api/invoices/:orderId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = await storage.getPurchaseOrderWithDetails(orderId);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    const customer = await storage.getCustomer(order.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const company = await storage.getCompanySettings();
    if (!company) {
      return res.status(500).json({ message: "Company settings not configured" });
    }
    const invoiceItems = order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName || "Unknown Product",
      purity: item.purity,
      quantity: item.quantity,
      goldRatePerGram: parseFloat(item.goldRatePerGram),
      netWeight: parseFloat(item.netWeight),
      grossWeight: parseFloat(item.grossWeight),
      labourRatePerGram: parseFloat(item.labourRatePerGram),
      additionalCost: parseFloat(item.additionalCost || "0"),
      gstPercentage: parseFloat(item.gstPercentage)
    }));
    const discountRules2 = {
      makingChargeDiscountPercentage: parseFloat(order.makingChargeDiscountPercentage || "0"),
      goldValueDiscountPerGram: parseFloat(order.goldValueDiscountPerGram || "0")
    };
    const advanceAmount = parseFloat(order.advanceAmount || "0");
    const calculatedTotals = calculateInvoiceTotal(invoiceItems, discountRules2, advanceAmount);
    const invoiceData = {
      invoiceNumber: order.invoiceNumber || generateInvoiceNumber(),
      orderNumber: order.orderNumber,
      billDate: order.orderDate,
      dueDate: order.dueDate || void 0,
      billerName: order.billerName || void 0,
      company: {
        companyName: company.companyName,
        address: company.address,
        gstNumber: company.gstNumber,
        website: company.website || void 0,
        phone: company.phone,
        email: company.email,
        logo: company.logo || void 0,
        invoiceTerms: company.invoiceTerms || void 0
      },
      customer: {
        name: customer.name,
        email: customer.email || void 0,
        phone: customer.phone,
        address: customer.address || void 0
      },
      items: invoiceItems,
      totals: {
        subTotal: calculatedTotals.subTotal,
        totalMakingCharges: calculatedTotals.totalMakingCharges,
        makingChargeDiscount: calculatedTotals.makingChargeDiscount,
        makingChargeDiscountPercentage: discountRules2.makingChargeDiscountPercentage,
        totalGoldGrossWeight: calculatedTotals.totalGoldGrossWeight,
        goldValueDiscountPerGram: discountRules2.goldValueDiscountPerGram,
        totalGoldValueDiscount: calculatedTotals.goldValueDiscount,
        totalDiscountAmount: calculatedTotals.totalDiscountAmount,
        totalAmount: calculatedTotals.totalAmount,
        advanceAmount,
        grandTotal: calculatedTotals.grandTotal
      }
    };
    const format = req.query.format || "html";
    if (format === "json") {
      res.json(invoiceData);
    } else if (format === "text") {
      res.setHeader("Content-Type", "text/plain");
      res.send(generateInvoiceText(invoiceData));
    } else {
      res.setHeader("Content-Type", "text/html");
      res.send(generateInvoiceHTML(invoiceData));
    }
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});
router.get("/api/company-settings", async (req, res) => {
  try {
    const settings = await storage.getCompanySettings();
    res.json(settings || {});
  } catch (error) {
    console.error("Error fetching company settings:", error);
    res.status(500).json({ message: "Failed to fetch company settings" });
  }
});
router.put("/api/company-settings", async (req, res) => {
  try {
    const updatedSettings = await storage.updateCompanySettings(req.body);
    res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating company settings:", error);
    res.status(500).json({ message: "Failed to update company settings" });
  }
});
router.get("/api/discount-rules", async (req, res) => {
  try {
    const active = req.query.active === "true";
    const rules = active ? await storage.getActiveDiscountRules() : await storage.getDiscountRules();
    res.json(rules);
  } catch (error) {
    console.error("Error fetching discount rules:", error);
    res.status(500).json({ message: "Failed to fetch discount rules" });
  }
});
router.post("/api/discount-rules", async (req, res) => {
  try {
    const newRule = await storage.createDiscountRule(req.body);
    res.status(201).json(newRule);
  } catch (error) {
    console.error("Error creating discount rule:", error);
    res.status(500).json({ message: "Failed to create discount rule" });
  }
});
router.get("/api/purchase-orders/:orderId/payments", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const payments = await storage.getPaymentTransactions(orderId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    res.status(500).json({ message: "Failed to fetch payment transactions" });
  }
});
router.post("/api/purchase-orders/:orderId/payments", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const paymentData = {
      ...req.body,
      purchaseOrderId: orderId,
      processedBy: req.user?.id || 1
      // Default to admin if no user
    };
    const newPayment = await storage.createPaymentTransaction(paymentData);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error creating payment transaction:", error);
    res.status(500).json({ message: "Failed to create payment transaction" });
  }
});
var invoice_routes_default = router;

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
import { eq as eq2, desc as desc2 } from "drizzle-orm";
async function seedInitialData() {
  try {
    console.log("Seeding initial data...");
    const generateOrderNumberLocal = async () => {
      const today = /* @__PURE__ */ new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const existing = await db.select({ orderNumber: purchaseOrders.orderNumber }).from(purchaseOrders).where(eq2(purchaseOrders.orderNumber, `PO-${dateStr}-000`));
      const sameDay = await db.select({ orderNumber: purchaseOrders.orderNumber }).from(purchaseOrders);
      const count = sameDay.filter((o) => o.orderNumber.startsWith(`PO-${dateStr}-`)).length;
      return `PO-${dateStr}-${(count + 1).toString().padStart(3, "0")}`;
    };
    const generateCardNumberLocal = async () => {
      const today = /* @__PURE__ */ new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const sameDay = await db.select({ cardNumber: customerEnrollments.cardNumber }).from(customerEnrollments);
      const count = sameDay.filter((o) => o.cardNumber.startsWith(`SCH-${dateStr}-`)).length;
      return `SCH-${dateStr}-${(count + 1).toString().padStart(3, "0")}`;
    };
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
      const categories = await db.select().from(productCategories);
      if (categories.length > 0) {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
        const idByCode = (code) => categories.find((c) => c.code === code)?.id;
        const samplePrices = [
          // Today
          { code: "CAT-GOLD22K", date: today, price: "6500.00" },
          { code: "CAT-GOLD18K", date: today, price: "6200.50" },
          { code: "CAT-SILVER", date: today, price: "150.75" },
          { code: "CAT-DIAMOND", date: today, price: "75000.00" },
          // illustrative diamond rate
          { code: "CAT-PLATINUM", date: today, price: "4200.00" },
          // Yesterday
          { code: "CAT-GOLD22K", date: yesterday, price: "6450.00" },
          { code: "CAT-GOLD18K", date: yesterday, price: "6150.25" },
          { code: "CAT-SILVER", date: yesterday, price: "148.50" },
          { code: "CAT-DIAMOND", date: yesterday, price: "74500.00" },
          { code: "CAT-PLATINUM", date: yesterday, price: "4150.00" }
        ].map((p) => ({ categoryId: idByCode(p.code), effectiveDate: p.date, pricePerGram: p.price })).filter((p) => !!p.categoryId);
        for (const price of samplePrices) {
          await db.insert(priceMaster).values(price);
          console.log(`Created price for category ${price.categoryId}: \u20B9${price.pricePerGram}/gram on ${price.effectiveDate}`);
        }
        console.log("Sample price master seeded for all categories");
      } else {
        console.log("No categories found, skipping price seeding");
      }
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
          purity: "22K",
          stoneWeight: null,
          netWeight: "15.50",
          grossWeight: "16.25",
          dealerId: dealersList[0].id,
          makingChargeType: "Per Gram",
          makingChargeValue: "200.00",
          wastageChargeType: "Percentage",
          wastageChargeValue: "8.00",
          additionalCost: "0.00",
          centralGovtNumber: null,
          categoryId: goldCategory?.id || null
        },
        {
          name: "Silver Bracelet",
          barcodeNumber: "SLV-BRC-001",
          type: "No stone",
          purity: "925",
          stoneWeight: null,
          netWeight: "25.00",
          grossWeight: "25.50",
          dealerId: dealersList[2].id,
          makingChargeType: "Fixed Amount",
          makingChargeValue: "500.00",
          wastageChargeType: "Fixed Amount",
          wastageChargeValue: "100.00",
          additionalCost: "0.00",
          centralGovtNumber: null,
          categoryId: silverCategory?.id || null
        },
        {
          name: "Diamond Ring",
          barcodeNumber: "DMD-RNG-001",
          type: "Diamond Stone",
          purity: "18K",
          stoneWeight: "1.50",
          netWeight: "6.75",
          grossWeight: "8.25",
          dealerId: dealersList[1].id,
          makingChargeType: "Percentage",
          makingChargeValue: "20.00",
          wastageChargeType: "Fixed Amount",
          wastageChargeValue: "1000.00",
          additionalCost: "0.00",
          centralGovtNumber: "IGI123456789",
          categoryId: diamondCategory?.id || null
        },
        {
          name: "Gold Earrings 22K",
          barcodeNumber: "GLD-EAR-001",
          type: "No stone",
          purity: "22K",
          stoneWeight: null,
          netWeight: "11.50",
          grossWeight: "12.75",
          dealerId: dealersList[0].id,
          makingChargeType: "Per Gram",
          makingChargeValue: "250.00",
          wastageChargeType: "Percentage",
          wastageChargeValue: "10.00",
          additionalCost: "0.00",
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
    const existingPO = await db.select().from(purchaseOrders).limit(1);
    if (existingPO.length === 0) {
      console.log("Seeding sample purchase orders...");
      const allProducts = await db.select().from(products);
      const allCustomers = await db.select().from(customers);
      const allCategories = await db.select().from(productCategories);
      const allPrices = await db.select().from(priceMaster);
      const latestPriceForCategory = (catId) => {
        const perCat = allPrices.filter((p) => p.categoryId === catId);
        if (perCat.length === 0) return null;
        return perCat.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
      };
      const customer = allCustomers[0];
      if (customer) {
        const chosenProducts = allProducts.slice(0, 2);
        if (chosenProducts.length > 0) {
          const orderNumber = await generateOrderNumberLocal();
          let totalAmount = 0;
          const preparedItems = [];
          for (const p of chosenProducts) {
            if (!p.categoryId) continue;
            const priceRow = latestPriceForCategory(p.categoryId);
            if (!priceRow) continue;
            const cat = allCategories.find((c) => c.id === p.categoryId);
            const taxPct = cat ? parseFloat(String(cat.taxPercentage)) : 0;
            const netWeightNum = parseFloat(String(p.netWeight || "0")) || 0;
            const grossWeightNum = parseFloat(String(p.grossWeight || "0")) || 0;
            const pricePerGram = parseFloat(String(priceRow.pricePerGram));
            const makingChargeValue = parseFloat(String(p.makingChargeValue || "0"));
            let makingCharge = 0;
            if (p.makingChargeType === "Per Gram") {
              makingCharge = netWeightNum * makingChargeValue;
            } else if (p.makingChargeType === "Percentage") {
              const goldValue2 = netWeightNum * pricePerGram;
              makingCharge = goldValue2 * (makingChargeValue / 100);
            } else {
              makingCharge = makingChargeValue;
            }
            const goldValue = netWeightNum * pricePerGram;
            const basePrice = goldValue + makingCharge;
            const gstAmount = basePrice * (taxPct / 100);
            const finalPrice = basePrice + gstAmount;
            totalAmount += finalPrice;
            preparedItems.push({
              productId: p.id,
              quantity: 1,
              purity: p.purity,
              goldRatePerGram: pricePerGram.toFixed(2),
              netWeight: netWeightNum.toFixed(3),
              grossWeight: grossWeightNum.toFixed(3),
              labourRatePerGram: makingChargeValue.toFixed(2),
              additionalCost: "0.00",
              basePrice: basePrice.toFixed(2),
              gstPercentage: taxPct.toFixed(2),
              gstAmount: gstAmount.toFixed(2),
              totalPrice: finalPrice.toFixed(2)
            });
          }
          if (preparedItems.length > 0) {
            const [po] = await db.insert(purchaseOrders).values({
              invoiceNumber: `INV-${orderNumber}`,
              orderNumber,
              customerId: customer.id,
              orderDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              status: "pending",
              subTotal: totalAmount.toFixed(2),
              totalAmount: totalAmount.toFixed(2),
              totalGoldGrossWeight: "0.00",
              grandTotal: totalAmount.toFixed(2),
              gstAmount: "0.00",
              advanceAmount: "0.00",
              outstandingAmount: totalAmount.toFixed(2),
              createdBy: 1,
              updatedBy: 1
            }).returning();
            const itemsToInsert = preparedItems.map((i) => ({ ...i, purchaseOrderId: po.id }));
            await db.insert(purchaseOrderItems).values(itemsToInsert);
            await db.insert(purchaseOrderAuditLog).values({
              purchaseOrderId: po.id,
              updatedBy: 1,
              changes: { action: "created-seed", itemCount: preparedItems.length, totalAmount: totalAmount.toFixed(2) }
            });
            console.log(`Created sample purchase order ${orderNumber} with ${preparedItems.length} items.`);
          }
        }
      }
    }
    const existingStock = await db.select().from(stockMovements).limit(1);
    if (existingStock.length === 0) {
      const productList = await db.select().from(products);
      const priceRows = await db.select().from(priceMaster);
      for (const p of productList) {
        if (!p.categoryId) continue;
        const latestPrice = priceRows.filter((r) => r.categoryId === p.categoryId).sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
        const weightNum = parseFloat(String(p.netWeight || "0")) || 0;
        if (!latestPrice || weightNum === 0) continue;
        await db.insert(stockMovements).values({
          productId: p.id,
          type: "in",
          weight: weightNum.toFixed(3),
          rateAtTime: latestPrice.pricePerGram,
          reference: "INITIAL-STOCK"
        });
      }
      console.log("Stock movements seeded for existing products");
    }
    const existingEnrollment = await db.select().from(customerEnrollments).limit(1);
    if (existingEnrollment.length === 0) {
      const firstCustomer = await db.select().from(customers).limit(1);
      const firstScheme = await db.select().from(savingSchemeMaster).limit(1);
      if (firstCustomer.length && firstScheme.length) {
        const cardNumber = await generateCardNumberLocal();
        const monthlyAmount = "5000.00";
        const startDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const [enrollment] = await db.insert(customerEnrollments).values({
          customerId: firstCustomer[0].id,
          schemeId: firstScheme[0].id,
          monthlyAmount,
          startDate,
          cardNumber,
          status: "Active"
        }).returning();
        console.log(`Created sample scheme enrollment ${cardNumber}`);
        const goldCat = await db.select().from(productCategories).where(eq2(productCategories.code, "CAT-GOLD22K")).limit(1);
        let goldRate = "6500.00";
        if (goldCat.length) {
          const rateRow = await db.select().from(priceMaster).where(eq2(priceMaster.categoryId, goldCat[0].id)).orderBy(desc2(priceMaster.effectiveDate)).limit(1);
          if (rateRow.length) goldRate = String(rateRow[0].pricePerGram);
        }
        const goldRateNum = parseFloat(goldRate);
        for (let m = 1; m <= 2; m++) {
          const goldGrams = (5e3 / goldRateNum).toFixed(3);
          await db.insert(monthlyPayments).values({
            enrollmentId: enrollment.id,
            paymentDate: startDate,
            amount: monthlyAmount,
            goldRate: goldRateNum.toFixed(2),
            goldGrams,
            monthNumber: m
          });
        }
        console.log("Created 2 sample monthly payments for enrollment");
      }
    }
    const existingCompanySettings = await db.select().from(companySettings).limit(1);
    if (existingCompanySettings.length === 0) {
      await db.insert(companySettings).values({
        companyName: "Golden Jewellers",
        address: "123 Jewelry Street, Gold Market\nMumbai, Maharashtra 400001\nIndia",
        gstNumber: "27AABCU9603R1ZM",
        website: "www.goldenjewellers.com",
        phone: "+91 98765 43210",
        email: "info@goldenjewellers.com",
        logo: null,
        invoiceTerms: "1. All purchases are subject to our standard terms and conditions.\n2. GST is applicable as per government rates.\n3. Returns accepted within 7 days with original receipt.",
        bankDetails: JSON.stringify({
          bankName: "State Bank of India",
          accountNumber: "1234567890",
          ifscCode: "SBIN0001234",
          accountHolderName: "Golden Jewellers"
        })
      });
      console.log("\u2705 Company settings seeded");
    }
    const existingDiscountRules = await db.select().from(discountRules).limit(1);
    if (existingDiscountRules.length === 0) {
      const discountRulesSeed = [
        {
          name: "VIP Customer Making Charge Discount",
          type: "making_charge",
          calculationType: "percentage",
          value: "5.00",
          minOrderAmount: "50000.00",
          startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          isActive: true
        },
        {
          name: "Bulk Order Gold Value Discount",
          type: "gold_value",
          calculationType: "percentage",
          value: "3.00",
          minOrderAmount: "100000.00",
          startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          isActive: true
        },
        {
          name: "Festival Special Total Discount",
          type: "order_total",
          calculationType: "fixed_amount",
          value: "2000.00",
          minOrderAmount: "75000.00",
          maxDiscountAmount: "5000.00",
          startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          isActive: false
        }
      ];
      for (const rule of discountRulesSeed) {
        await db.insert(discountRules).values(rule);
      }
      console.log("\u2705 Discount rules seeded");
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
  app.use(invoice_routes_default);
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
