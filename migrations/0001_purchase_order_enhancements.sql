-- Migration to enhance purchase order system with items and audit log

-- Drop the old purchase_orders table and recreate with new structure
DROP TABLE IF EXISTS "purchase_orders" CASCADE;

-- Create enhanced purchase_orders table
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar NOT NULL,
	"customer_id" integer NOT NULL,
	"order_date" date NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer NOT NULL,
	"updated_by" integer,
	CONSTRAINT "purchase_orders_order_number_unique" UNIQUE("order_number")
);

-- Create purchase_order_items table
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"weight" numeric(12, 2) NOT NULL,
	"price_per_gram" numeric(10, 2) NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2) NOT NULL,
	"final_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create purchase_order_audit_log table
CREATE TABLE "purchase_order_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"changes" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_customer_id_customers_id_fk" 
FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_employees_id_fk" 
FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_updated_by_employees_id_fk" 
FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" 
FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "purchase_order_audit_log" ADD CONSTRAINT "purchase_order_audit_log_purchase_order_id_purchase_orders_id_fk" 
FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "purchase_order_audit_log" ADD CONSTRAINT "purchase_order_audit_log_updated_by_employees_id_fk" 
FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes for better performance
CREATE INDEX "idx_purchase_order_items_purchase_order_id" ON "purchase_order_items"("purchase_order_id");
CREATE INDEX "idx_purchase_order_items_product_id" ON "purchase_order_items"("product_id");
CREATE INDEX "idx_purchase_order_audit_log_purchase_order_id" ON "purchase_order_audit_log"("purchase_order_id");
CREATE INDEX "idx_purchase_order_audit_log_updated_at" ON "purchase_order_audit_log"("updated_at");
