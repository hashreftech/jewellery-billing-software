-- Custom migration to add invoice-specific fields to existing database
-- This script safely adds new columns and tables without conflicts

-- Step 1: Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS purity VARCHAR;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS net_weight DECIMAL(12,3);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(12,3);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS labour_rate_per_gram DECIMAL(10,2);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_cost DECIMAL(12,2) DEFAULT 0;

-- Update existing products with default values
UPDATE products SET 
  purity = '22kt',
  net_weight = COALESCE(weight, 0),
  gross_weight = COALESCE(weight, 0) + COALESCE(stone_weight, 0),
  labour_rate_per_gram = 0,
  additional_cost = 0
WHERE purity IS NULL;

-- Make required fields non-null
ALTER TABLE products ALTER COLUMN purity SET NOT NULL;
ALTER TABLE products ALTER COLUMN net_weight SET NOT NULL;
ALTER TABLE products ALTER COLUMN gross_weight SET NOT NULL;

-- Step 2: Add missing columns to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS biller_name VARCHAR;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS sub_total DECIMAL(12,2);

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS total_making_charges DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS making_charge_discount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS making_charge_discount_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS total_gold_gross_weight DECIMAL(12,3);

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS gold_value_discount_per_gram DECIMAL(10,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS total_gold_value_discount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS total_discount_amount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS advance_amount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS outstanding_amount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS grand_total DECIMAL(12,2);

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(12,2);

-- Update existing purchase orders with calculated values
UPDATE purchase_orders SET 
  sub_total = total_amount,
  grand_total = total_amount,
  gst_amount = 0,
  total_gold_gross_weight = 0
WHERE sub_total IS NULL;

-- Make required fields non-null
ALTER TABLE purchase_orders ALTER COLUMN sub_total SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN grand_total SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN gst_amount SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN total_gold_gross_weight SET NOT NULL;

-- Add unique constraint for invoice_number
CREATE UNIQUE INDEX IF NOT EXISTS purchase_orders_invoice_number_unique 
ON purchase_orders(invoice_number) WHERE invoice_number IS NOT NULL;

-- Step 3: Add missing columns to purchase_order_items table
ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS purity VARCHAR;

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS gold_rate_per_gram DECIMAL(10,2);

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS net_weight DECIMAL(12,3);

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(12,3);

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS labour_rate_per_gram DECIMAL(10,2);

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS additional_cost DECIMAL(12,2) DEFAULT 0;

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2);

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(12,2);

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(12,2);

-- Update existing purchase order items with values from old columns
UPDATE purchase_order_items SET 
  purity = '22kt',
  gold_rate_per_gram = COALESCE(price_per_gram, 0),
  net_weight = COALESCE(weight, 0),
  gross_weight = COALESCE(weight, 0),
  labour_rate_per_gram = 0,
  gst_percentage = 3.0,
  gst_amount = COALESCE(tax_amount, 0),
  total_price = COALESCE(final_price, 0)
WHERE purity IS NULL;

-- Make required fields non-null
ALTER TABLE purchase_order_items ALTER COLUMN purity SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gold_rate_per_gram SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN net_weight SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gross_weight SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN labour_rate_per_gram SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gst_percentage SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gst_amount SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN total_price SET NOT NULL;

-- Step 4: Create new tables (using IF NOT EXISTS to avoid conflicts)

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) NOT NULL,
  payment_method VARCHAR NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  transaction_reference VARCHAR,
  notes TEXT,
  processed_by INTEGER REFERENCES employees(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Discount rules table
CREATE TABLE IF NOT EXISTS discount_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  calculation_type VARCHAR NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(12,2),
  max_discount_amount DECIMAL(12,2),
  applicable_categories INTEGER[],
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR NOT NULL,
  address TEXT NOT NULL,
  gst_number VARCHAR NOT NULL,
  website VARCHAR,
  phone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  logo VARCHAR,
  invoice_terms TEXT,
  bank_details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Insert default data

-- Insert default company settings if not exists
INSERT INTO company_settings (
  company_name, 
  address, 
  gst_number, 
  phone, 
  email, 
  invoice_terms
) 
SELECT 
  'GJewel Store',
  'Your Business Address Here',
  'Your GST Number Here',
  'Your Phone Number',
  'your-email@example.com',
  'Thanks for business with us!!! Please visit us again !!!'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Insert default discount rules if not exists
INSERT INTO discount_rules (name, type, calculation_type, value, start_date) 
SELECT 'Making Charge Discount', 'making_charge', 'percentage', 20.00, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM discount_rules WHERE name = 'Making Charge Discount');

INSERT INTO discount_rules (name, type, calculation_type, value, start_date) 
SELECT 'Gold Value Discount', 'gold_value', 'per_gram', 100.00, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM discount_rules WHERE name = 'Gold Value Discount');

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id 
ON payment_transactions(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_discount_rules_active 
ON discount_rules(is_active, start_date, end_date) 
WHERE is_active = true;

COMMIT;
