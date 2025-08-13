CREATE TABLE "customer_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"scheme_id" integer NOT NULL,
	"monthly_amount" numeric(10, 2) NOT NULL,
	"start_date" date NOT NULL,
	"card_number" varchar NOT NULL,
	"status" varchar DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_enrollments_card_number_unique" UNIQUE("card_number")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"email" varchar,
	"address" text,
	"gst_number" varchar,
	"date_of_birth" date,
	"anniversary" date,
	"pan_card" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "dealers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" text NOT NULL,
	"gst_number" varchar NOT NULL,
	"categories" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"emp_code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"email" varchar,
	"role" varchar NOT NULL,
	"photo" varchar,
	"password" varchar NOT NULL,
	"status" varchar DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_emp_code_unique" UNIQUE("emp_code")
);
--> statement-breakpoint
CREATE TABLE "jewel_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"carat" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "jewel_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "monthly_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"gold_rate" numeric(10, 2) NOT NULL,
	"gold_grams" numeric(8, 3) NOT NULL,
	"month_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"jewel_type_id" integer NOT NULL,
	"effective_date" date NOT NULL,
	"price_per_gram" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"tax_percentage" numeric(5, 2) NOT NULL,
	"hsn_code" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"barcode_number" varchar NOT NULL,
	"type" varchar NOT NULL,
	"stone_weight" numeric(12, 2),
	"dealer_id" integer NOT NULL,
	"weight" numeric(12, 2),
	"making_charge_type" varchar,
	"making_charge_value" numeric(12, 2),
	"wastage_charge_type" varchar,
	"wastage_charge_value" numeric(12, 2),
	"central_govt_number" varchar,
	"category_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_barcode_number_unique" UNIQUE("barcode_number")
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar NOT NULL,
	"customer_id" integer NOT NULL,
	"products" jsonb NOT NULL,
	"overall_discount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(12, 2) NOT NULL,
	"order_date" date NOT NULL,
	"status" varchar DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "saving_scheme_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheme_name" varchar NOT NULL,
	"jewel_type_id" integer NOT NULL,
	"total_months" integer NOT NULL,
	"description" text,
	"terms_and_conditions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"weight" numeric(8, 3) NOT NULL,
	"rate_at_time" numeric(10, 2) NOT NULL,
	"reference" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customer_enrollments" ADD CONSTRAINT "customer_enrollments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_enrollments" ADD CONSTRAINT "customer_enrollments_scheme_id_saving_scheme_master_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."saving_scheme_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_payments" ADD CONSTRAINT "monthly_payments_enrollment_id_customer_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."customer_enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_master" ADD CONSTRAINT "price_master_jewel_type_id_jewel_types_id_fk" FOREIGN KEY ("jewel_type_id") REFERENCES "public"."jewel_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saving_scheme_master" ADD CONSTRAINT "saving_scheme_master_jewel_type_id_jewel_types_id_fk" FOREIGN KEY ("jewel_type_id") REFERENCES "public"."jewel_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");