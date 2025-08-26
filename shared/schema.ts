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
  date,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Removed users table - authentication now uses employees table directly

// Employees table - now used for authentication directly
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  empCode: varchar("emp_code").notNull().unique(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  role: varchar("role").notNull(), // admin, manager, staff
  photo: varchar("photo"),
  password: varchar("password").notNull(), // hashed password for login
  status: varchar("status").notNull().default("Active"), // Active, Inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull().unique(), // CUST-YYYYMMDD-XXX
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  address: text("address"),
  gstNumber: varchar("gst_number"),
  dateOfBirth: date("date_of_birth"),
  anniversary: date("anniversary"),
  panCard: varchar("pan_card"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dealers table
export const dealers = pgTable("dealers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  gstNumber: varchar("gst_number").notNull(),
  categories: text("categories").array(), // multi-select categories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Product Categories table
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).notNull(),
  hsnCode: varchar("hsn_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  barcodeNumber: varchar("barcode_number").notNull().unique(),
  type: varchar("type").notNull(), // No stone, Stone, Diamond Stone
  purity: varchar("purity").notNull(), // 22kt, 24kt, 18kt, etc.
  stoneWeight: decimal("stone_weight", { precision: 12, scale: 3 }), 
  netWeight: decimal("net_weight", { precision: 12, scale: 3 }).notNull(), // Pure gold weight
  grossWeight: decimal("gross_weight", { precision: 12, scale: 3 }).notNull(), // Total weight including stones
  dealerId: integer("dealer_id").references(() => dealers.id).notNull(),
  makingChargeType: varchar("making_charge_type"), // Percentage, Fixed Amount, Per Gram
  makingChargeValue: decimal("making_charge_value", { precision: 12, scale: 2 }), 
  wastageChargeType: varchar("wastage_charge_type"), // Percentage, Fixed Amount, Per Gram, Per Piece
  wastageChargeValue: decimal("wastage_charge_value", { precision: 12, scale: 2 }), 
  additionalCost: decimal("additional_cost", { precision: 12, scale: 2 }).default("0"), // Additional charges
  centralGovtNumber: varchar("central_govt_number"),
  categoryId: integer("category_id").references(() => productCategories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Price Master table
export const priceMaster = pgTable("price_master", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => productCategories.id).notNull(),
  pricePerGram: decimal("price_per_gram", { precision: 10, scale: 2 }).notNull(),
  effectiveDate: date("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_price_master_category_date").on(table.categoryId, table.effectiveDate),
]);

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number").notNull().unique(), // Auto-generated: PO-YYYYMMDD-###
  invoiceNumber: varchar("invoice_number").unique(), // For invoices: INV-YYYYMMDD-###
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  orderDate: date("order_date").notNull(),
  dueDate: date("due_date"), // Payment due date
  billerName: varchar("biller_name"), // Employee who created the bill
  status: varchar("status").notNull().default("pending"), // pending/confirmed/shipped/received/cancelled/invoiced
  subTotal: decimal("sub_total", { precision: 12, scale: 2 }).notNull(), // Before discounts
  totalMakingCharges: decimal("total_making_charges", { precision: 12, scale: 2 }).default("0"),
  makingChargeDiscount: decimal("making_charge_discount", { precision: 12, scale: 2 }).default("0"),
  makingChargeDiscountPercentage: decimal("making_charge_discount_percentage", { precision: 5, scale: 2 }).default("0"),
  totalGoldGrossWeight: decimal("total_gold_gross_weight", { precision: 12, scale: 3 }).notNull(),
  goldValueDiscountPerGram: decimal("gold_value_discount_per_gram", { precision: 10, scale: 2 }).default("0"),
  totalGoldValueDiscount: decimal("total_gold_value_discount", { precision: 12, scale: 2 }).default("0"),
  totalDiscountAmount: decimal("total_discount_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  advanceAmount: decimal("advance_amount", { precision: 12, scale: 2 }).default("0"), // Amount paid in advance
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).default("0"), // Remaining amount
  grandTotal: decimal("grand_total", { precision: 12, scale: 2 }).notNull(), // Final amount after advance
  gstAmount: decimal("gst_amount", { precision: 12, scale: 2 }).notNull(), // Total GST amount
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => employees.id).notNull(), // Employee who created the order
  updatedBy: integer("updated_by").references(() => employees.id), // Employee who last updated the order
});

// Purchase Order Items table (detailed line items)
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  purity: varchar("purity").notNull(), // Gold purity at time of order
  goldRatePerGram: decimal("gold_rate_per_gram", { precision: 10, scale: 2 }).notNull(), // Gold rate at order time
  netWeight: decimal("net_weight", { precision: 12, scale: 3 }).notNull(), // Pure gold weight
  grossWeight: decimal("gross_weight", { precision: 12, scale: 3 }).notNull(), // Total weight
  labourRatePerGram: decimal("labour_rate_per_gram", { precision: 10, scale: 2 }).notNull(), // Labour charges
  additionalCost: decimal("additional_cost", { precision: 12, scale: 2 }).default("0"), // Additional charges
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(), // goldRate * netWeight + labour + additional
  gstPercentage: decimal("gst_percentage", { precision: 5, scale: 2 }).notNull(), // GST percentage
  gstAmount: decimal("gst_amount", { precision: 12, scale: 2 }).notNull(), // Calculated GST amount
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(), // basePrice + gstAmount
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Order Audit Log table (for tracking changes)
export const purchaseOrderAuditLog = pgTable("purchase_order_audit_log", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  updatedBy: integer("updated_by").references(() => employees.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  changes: jsonb("changes").notNull(), // JSON detailing what was changed
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Transactions table (for tracking advance payments and settlements)
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  paymentMethod: varchar("payment_method").notNull(), // cash, card, upi, cheque, bank_transfer
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  transactionReference: varchar("transaction_reference"), // Cheque number, UPI reference, etc.
  notes: text("notes"),
  processedBy: integer("processed_by").references(() => employees.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discount Rules table (for managing different types of discounts)
export const discountRules = pgTable("discount_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // making_charge, gold_value, item_total, order_total
  calculationType: varchar("calculation_type").notNull(), // percentage, fixed_amount, per_gram
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 12, scale: 2 }),
  applicableCategories: integer("applicable_categories").array(), // Array of category IDs
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company Settings table (for invoice header information)
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name").notNull(),
  address: text("address").notNull(),
  gstNumber: varchar("gst_number").notNull(),
  website: varchar("website"),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull(),
  logo: varchar("logo"), // Logo file path
  invoiceTerms: text("invoice_terms"), // Terms and conditions
  bankDetails: jsonb("bank_details"), // Bank account information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock Movements table
export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  type: varchar("type").notNull(), // in, out
  weight: decimal("weight", { precision: 8, scale: 3 }).notNull(),
  rateAtTime: decimal("rate_at_time", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference"), // Reference to order or transaction
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saving Scheme Master table
export const savingSchemeMaster = pgTable("saving_scheme_master", {
  id: serial("id").primaryKey(),
  schemeName: varchar("scheme_name").notNull(),
  totalMonths: integer("total_months").notNull(),
  description: text("description"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Enrollments table
export const customerEnrollments = pgTable("customer_enrollments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  schemeId: integer("scheme_id").references(() => savingSchemeMaster.id).notNull(),
  monthlyAmount: decimal("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  cardNumber: varchar("card_number").notNull().unique(), // SCH-YYYYMMDD-###
  status: varchar("status").notNull().default("Active"), // Active, Completed, Cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Monthly Payments table
export const monthlyPayments = pgTable("monthly_payments", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").references(() => customerEnrollments.id).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  goldRate: decimal("gold_rate", { precision: 10, scale: 2 }).notNull(),
  goldGrams: decimal("gold_grams", { precision: 8, scale: 3 }).notNull(),
  monthNumber: integer("month_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
  enrollments: many(customerEnrollments),
}));

export const dealersRelations = relations(dealers, ({ many }) => ({
  products: many(products),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
  priceMaster: many(priceMaster),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  dealer: one(dealers, {
    fields: [products.dealerId],
    references: [dealers.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  stockMovements: many(stockMovements),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [purchaseOrders.customerId],
    references: [customers.id],
  }),
  creator: one(employees, {
    fields: [purchaseOrders.createdBy],
    references: [employees.id],
  }),
  updater: one(employees, {
    fields: [purchaseOrders.updatedBy],
    references: [employees.id],
  }),
  items: many(purchaseOrderItems),
  auditLogs: many(purchaseOrderAuditLog),
  paymentTransactions: many(paymentTransactions),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
}));

export const purchaseOrderAuditLogRelations = relations(purchaseOrderAuditLog, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderAuditLog.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  updatedBy: one(employees, {
    fields: [purchaseOrderAuditLog.updatedBy],
    references: [employees.id],
  }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [paymentTransactions.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  processedBy: one(employees, {
    fields: [paymentTransactions.processedBy],
    references: [employees.id],
  }),
}));

export const savingSchemeMasterRelations = relations(savingSchemeMaster, ({ one, many }) => ({
  enrollments: many(customerEnrollments),
}));

export const customerEnrollmentsRelations = relations(customerEnrollments, ({ one, many }) => ({
  customer: one(customers, {
    fields: [customerEnrollments.customerId],
    references: [customers.id],
  }),
  scheme: one(savingSchemeMaster, {
    fields: [customerEnrollments.schemeId],
    references: [savingSchemeMaster.id],
  }),
  payments: many(monthlyPayments),
}));

export const priceMasterRelations = relations(priceMaster, ({ one }) => ({
  category: one(productCategories, {
    fields: [priceMaster.categoryId],
    references: [productCategories.id],
  }),
}));

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, customerId: true, createdAt: true, updatedAt: true });
export const insertDealerSchema = createInsertSchema(dealers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ 
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
export const insertPriceMasterSchema = createInsertSchema(priceMaster).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, orderNumber: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderAuditLogSchema = createInsertSchema(purchaseOrderAuditLog).omit({ id: true, createdAt: true });
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDiscountRuleSchema = createInsertSchema(discountRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMonthlyPaymentSchema = createInsertSchema(monthlyPayments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSavingSchemeSchema = createInsertSchema(savingSchemeMaster).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerEnrollmentSchema = createInsertSchema(customerEnrollments).omit({ id: true, cardNumber: true, createdAt: true, updatedAt: true });

// Types  
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealers.$inferSelect;

export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertPriceMaster = z.infer<typeof insertPriceMasterSchema>;
export type PriceMaster = typeof priceMaster.$inferSelect;

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

export type InsertPurchaseOrderAuditLog = z.infer<typeof insertPurchaseOrderAuditLogSchema>;
export type PurchaseOrderAuditLog = typeof purchaseOrderAuditLog.$inferSelect;

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

export type InsertSavingScheme = z.infer<typeof insertSavingSchemeSchema>;
export type SavingScheme = typeof savingSchemeMaster.$inferSelect;

export type InsertCustomerEnrollment = z.infer<typeof insertCustomerEnrollmentSchema>;
export type CustomerEnrollment = typeof customerEnrollments.$inferSelect;

export type InsertMonthlyPayment = z.infer<typeof insertMonthlyPaymentSchema>;
export type MonthlyPayment = typeof monthlyPayments.$inferSelect;

export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

export type InsertDiscountRule = z.infer<typeof insertDiscountRuleSchema>;
export type DiscountRule = typeof discountRules.$inferSelect;

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
