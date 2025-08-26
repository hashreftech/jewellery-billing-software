CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar NOT NULL,
	"address" text NOT NULL,
	"gst_number" varchar NOT NULL,
	"website" varchar,
	"phone" varchar NOT NULL,
	"email" varchar NOT NULL,
	"logo" varchar,
	"invoice_terms" text,
	"bank_details" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"calculation_type" varchar NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"min_order_amount" numeric(12, 2),
	"max_discount_amount" numeric(12, 2),
	"applicable_categories" integer[],
	"start_date" date NOT NULL,
	"end_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"payment_method" varchar NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"transaction_reference" varchar,
	"notes" text,
	"processed_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"changes" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"purity" varchar NOT NULL,
	"gold_rate_per_gram" numeric(10, 2) NOT NULL,
	"net_weight" numeric(12, 3) NOT NULL,
	"gross_weight" numeric(12, 3) NOT NULL,
	"labour_rate_per_gram" numeric(10, 2) NOT NULL,
	"additional_cost" numeric(12, 2) DEFAULT '0',
	"base_price" numeric(12, 2) NOT NULL,
	"gst_percentage" numeric(5, 2) NOT NULL,
	"gst_amount" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "jewel_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "jewel_types" CASCADE;--> statement-breakpoint
ALTER TABLE "price_master" DROP CONSTRAINT "price_master_jewel_type_id_jewel_types_id_fk";
--> statement-breakpoint
ALTER TABLE "saving_scheme_master" DROP CONSTRAINT "saving_scheme_master_jewel_type_id_jewel_types_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stone_weight" SET DATA TYPE numeric(12, 3);--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "price_master" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "purity" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "net_weight" numeric(12, 3) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "gross_weight" numeric(12, 3) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "labour_rate_per_gram" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "additional_cost" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "invoice_number" varchar;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "biller_name" varchar;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "sub_total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "total_making_charges" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "making_charge_discount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "making_charge_discount_percentage" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "total_gold_gross_weight" numeric(12, 3) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "gold_value_discount_per_gram" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "total_gold_value_discount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "total_discount_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "advance_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "outstanding_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "grand_total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "gst_amount" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "created_by" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_processed_by_employees_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_audit_log" ADD CONSTRAINT "purchase_order_audit_log_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_audit_log" ADD CONSTRAINT "purchase_order_audit_log_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_master" ADD CONSTRAINT "price_master_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_price_master_category_date" ON "price_master" USING btree ("category_id","effective_date");--> statement-breakpoint
ALTER TABLE "price_master" DROP COLUMN "jewel_type_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP COLUMN "products";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP COLUMN "overall_discount";--> statement-breakpoint
ALTER TABLE "saving_scheme_master" DROP COLUMN "jewel_type_id";--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_invoice_number_unique" UNIQUE("invoice_number");