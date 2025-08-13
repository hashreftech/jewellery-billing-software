-- Complete schema creation script that matches Drizzle expectations exactly
-- Drop all tables if they exist
DROP TABLE IF EXISTS monthly_payments CASCADE;
DROP TABLE IF EXISTS customer_enrollments CASCADE;
DROP TABLE IF EXISTS saving_scheme_master CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS price_master CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Create sessions table (required for auth)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IDX_session_expire ON sessions(expire);

-- Create employees table first (referenced by users)
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  emp_code VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  role VARCHAR NOT NULL,
  photo VARCHAR,
  password VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table removed - authentication now uses employees table directly

-- Create customers table  
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  address TEXT,
  gst_number VARCHAR,
  date_of_birth DATE,
  anniversary DATE,
  pan_card VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create dealers table
CREATE TABLE dealers (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  address TEXT NOT NULL,
  gst_number VARCHAR NOT NULL,
  categories TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create product_categories table
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL UNIQUE,
  tax_percentage DECIMAL(5,2) NOT NULL,
  hsn_code VARCHAR NOT NULL,
  jewel_type_id INTEGER REFERENCES jewel_types(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  barcode VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  jewel_type_id INTEGER REFERENCES jewel_types(id),
  category_id INTEGER REFERENCES product_categories(id),
  gross_weight VARCHAR NOT NULL,
  net_weight VARCHAR NOT NULL,
  stone_weight VARCHAR,
  stone_pieces INTEGER,
  wastage_percentage VARCHAR,
  wastage_grams VARCHAR,
  making_charge_per_gram VARCHAR,
  making_charge_percentage VARCHAR,
  making_charge_per_piece VARCHAR,
  stone_charge VARCHAR,
  other_charges VARCHAR,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create price_master table
CREATE TABLE price_master (
  id SERIAL PRIMARY KEY,
  jewel_type_id INTEGER REFERENCES jewel_types(id),
  price_per_gram VARCHAR NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create purchase_orders table
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  order_date DATE NOT NULL,
  total_amount VARCHAR NOT NULL,
  advance_amount VARCHAR,
  balance_amount VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create stock_movements table
CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  movement_type VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type VARCHAR,
  reference_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create saving_scheme_master table
CREATE TABLE saving_scheme_master (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  jewel_type_id INTEGER REFERENCES jewel_types(id),
  duration_months INTEGER NOT NULL,
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create customer_enrollments table
CREATE TABLE customer_enrollments (
  id SERIAL PRIMARY KEY,
  card_number VARCHAR NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  scheme_id INTEGER REFERENCES saving_scheme_master(id),
  monthly_amount VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create monthly_payments table
CREATE TABLE monthly_payments (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER REFERENCES customer_enrollments(id),
  month_year VARCHAR NOT NULL,
  payment_amount VARCHAR NOT NULL,
  gold_rate_per_gram VARCHAR NOT NULL,
  gold_grams_earned VARCHAR NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);