-- Migration: Add invoice-specific fields and tables
-- This migration adds support for detailed invoice generation as per the tax invoice format

-- Update products table to support invoice requirements
ALTER TABLE products 
ADD COLUMN purity VARCHAR,
ADD COLUMN net_weight DECIMAL(12,3),
ADD COLUMN gross_weight DECIMAL(12,3),
ADD COLUMN labour_rate_per_gram DECIMAL(10,2),
ADD COLUMN additional_cost DECIMAL(12,2) DEFAULT 0;

-- Update existing weight column to stone_weight and change precision
ALTER TABLE products 
RENAME COLUMN weight TO old_weight;
ALTER TABLE products 
ALTER COLUMN stone_weight TYPE DECIMAL(12,3);

-- Copy old weight to net_weight for existing records
UPDATE products SET net_weight = old_weight WHERE old_weight IS NOT NULL;
UPDATE products SET gross_weight = COALESCE(old_weight, 0) + COALESCE(stone_weight, 0) WHERE old_weight IS NOT NULL;

-- Drop old weight column
ALTER TABLE products DROP COLUMN old_weight;

-- Make required fields non-null
UPDATE products SET purity = '22kt' WHERE purity IS NULL;
UPDATE products SET net_weight = 0 WHERE net_weight IS NULL;
UPDATE products SET gross_weight = 0 WHERE gross_weight IS NULL;
ALTER TABLE products ALTER COLUMN purity SET NOT NULL;
ALTER TABLE products ALTER COLUMN net_weight SET NOT NULL;
ALTER TABLE products ALTER COLUMN gross_weight SET NOT NULL;

-- Update purchase_orders table with invoice fields
ALTER TABLE purchase_orders 
ADD COLUMN invoice_number VARCHAR UNIQUE,
ADD COLUMN due_date DATE,
ADD COLUMN biller_name VARCHAR,
ADD COLUMN sub_total DECIMAL(12,2),
ADD COLUMN total_making_charges DECIMAL(12,2) DEFAULT 0,
ADD COLUMN making_charge_discount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN making_charge_discount_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN total_gold_gross_weight DECIMAL(12,3),
ADD COLUMN gold_value_discount_per_gram DECIMAL(10,2) DEFAULT 0,
ADD COLUMN total_gold_value_discount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN total_discount_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN advance_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN outstanding_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN grand_total DECIMAL(12,2),
ADD COLUMN gst_amount DECIMAL(12,2);

-- Copy existing total_amount to sub_total and grand_total
UPDATE purchase_orders SET sub_total = total_amount, grand_total = total_amount WHERE sub_total IS NULL;
UPDATE purchase_orders SET gst_amount = 0 WHERE gst_amount IS NULL;
UPDATE purchase_orders SET total_gold_gross_weight = 0 WHERE total_gold_gross_weight IS NULL;

-- Make required fields non-null
ALTER TABLE purchase_orders ALTER COLUMN sub_total SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN grand_total SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN gst_amount SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN total_gold_gross_weight SET NOT NULL;

-- Update status enum to include 'invoiced'
-- Note: This will need to be handled in application logic for existing records

-- Update purchase_order_items table with invoice fields
ALTER TABLE purchase_order_items 
ADD COLUMN purity VARCHAR,
ADD COLUMN gold_rate_per_gram DECIMAL(10,2),
ADD COLUMN net_weight DECIMAL(12,3),
ADD COLUMN gross_weight DECIMAL(12,3),
ADD COLUMN labour_rate_per_gram DECIMAL(10,2),
ADD COLUMN additional_cost DECIMAL(12,2) DEFAULT 0,
ADD COLUMN gst_percentage DECIMAL(5,2),
ADD COLUMN gst_amount DECIMAL(12,2),
ADD COLUMN total_price DECIMAL(12,2);

-- Rename existing columns
ALTER TABLE purchase_order_items RENAME COLUMN weight TO old_weight;
ALTER TABLE purchase_order_items RENAME COLUMN price_per_gram TO old_price_per_gram;
ALTER TABLE purchase_order_items RENAME COLUMN tax_amount TO old_tax_amount;
ALTER TABLE purchase_order_items RENAME COLUMN final_price TO old_final_price;

-- Copy old values to new columns
UPDATE purchase_order_items SET 
  net_weight = old_weight,
  gross_weight = old_weight,
  gold_rate_per_gram = old_price_per_gram,
  gst_amount = old_tax_amount,
  total_price = old_final_price,
  purity = '22kt',
  gst_percentage = 3.0
WHERE old_weight IS NOT NULL;

-- Make required fields non-null
UPDATE purchase_order_items SET purity = '22kt' WHERE purity IS NULL;
UPDATE purchase_order_items SET net_weight = 0 WHERE net_weight IS NULL;
UPDATE purchase_order_items SET gross_weight = 0 WHERE gross_weight IS NULL;
UPDATE purchase_order_items SET gold_rate_per_gram = 0 WHERE gold_rate_per_gram IS NULL;
UPDATE purchase_order_items SET labour_rate_per_gram = 0 WHERE labour_rate_per_gram IS NULL;
UPDATE purchase_order_items SET gst_percentage = 3.0 WHERE gst_percentage IS NULL;
UPDATE purchase_order_items SET gst_amount = 0 WHERE gst_amount IS NULL;
UPDATE purchase_order_items SET total_price = 0 WHERE total_price IS NULL;

ALTER TABLE purchase_order_items ALTER COLUMN purity SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN net_weight SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gross_weight SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gold_rate_per_gram SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN labour_rate_per_gram SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gst_percentage SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN gst_amount SET NOT NULL;
ALTER TABLE purchase_order_items ALTER COLUMN total_price SET NOT NULL;

-- Drop old columns
ALTER TABLE purchase_order_items 
DROP COLUMN old_weight,
DROP COLUMN old_price_per_gram,
DROP COLUMN old_tax_amount,
DROP COLUMN old_final_price;

-- Create payment_transactions table
CREATE TABLE payment_transactions (
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

-- Create discount_rules table
CREATE TABLE discount_rules (
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

-- Create company_settings table
CREATE TABLE company_settings (
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

-- Insert default company settings
INSERT INTO company_settings (
  company_name, 
  address, 
  gst_number, 
  phone, 
  email, 
  invoice_terms
) VALUES (
  'GJewel Store',
  'Your Business Address Here',
  'Your GST Number Here',
  'Your Phone Number',
  'your-email@example.com',
  'Thanks for business with us!!! Please visit us again !!!'
);

-- Insert default discount rules
INSERT INTO discount_rules (name, type, calculation_type, value, start_date) VALUES
('Making Charge Discount', 'making_charge', 'percentage', 20.00, CURRENT_DATE),
('Gold Value Discount', 'gold_value', 'per_gram', 100.00, CURRENT_DATE);

-- Create indexes for better performance
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(purchase_order_id);
CREATE INDEX idx_discount_rules_active ON discount_rules(is_active, start_date, end_date);
CREATE INDEX idx_purchase_orders_invoice_number ON purchase_orders(invoice_number);
