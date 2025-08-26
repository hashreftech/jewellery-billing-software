# GJewel Database Structure and Relationships

This document provides a comprehensive overview of the database structure for the GJewel jewellery shop management system.

## Overview

The GJewel system uses PostgreSQL database with Drizzle ORM for type-safe database operations. The database is designed to handle:

- **Customer Management**: Customer information, orders, and saving scheme enrollments
- **Product Management**: Product catalog with categories, pricing, and inventory
- **Purchase Orders**: Order processing with detailed line items and audit trails
- **Employee Management**: Authentication and role-based access
- **Dealer Management**: Supplier relationships
- **Saving Schemes**: Customer savings program management
- **Audit & Tracking**: Change logs and stock movements

## Database Tables

### 1. Core Entity Tables

#### `employees`
**Purpose**: Employee management and authentication
```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  emp_code VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  role VARCHAR NOT NULL, -- admin, manager, staff
  photo VARCHAR,
  password VARCHAR NOT NULL, -- hashed password
  status VARCHAR DEFAULT 'Active', -- Active, Inactive
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `customers`
**Purpose**: Customer information storage
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR UNIQUE NOT NULL, -- CUST-YYYYMMDD-XXX
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
```

#### `dealers`
**Purpose**: Supplier/dealer management
```sql
CREATE TABLE dealers (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  address TEXT NOT NULL,
  gst_number VARCHAR NOT NULL,
  categories TEXT[], -- multi-select categories
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `product_categories`
**Purpose**: Product classification and tax management
```sql
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  tax_percentage DECIMAL(5,2) NOT NULL,
  hsn_code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `products`
**Purpose**: Product catalog with detailed specifications for invoice generation
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  barcode_number VARCHAR UNIQUE NOT NULL,
  type VARCHAR NOT NULL, -- No stone, Stone, Diamond Stone
  purity VARCHAR NOT NULL, -- 22kt, 24kt, 18kt, etc.
  stone_weight DECIMAL(12,3), -- Weight of stones/other materials
  net_weight DECIMAL(12,3) NOT NULL, -- Pure gold weight
  gross_weight DECIMAL(12,3) NOT NULL, -- Total weight including stones
  dealer_id INTEGER REFERENCES dealers(id) NOT NULL,
  making_charge_type VARCHAR, -- Percentage, Fixed Amount, Per Gram
  making_charge_value DECIMAL(12,2),
  wastage_charge_type VARCHAR, -- Percentage, Fixed Amount, Per Gram, Per Piece
  wastage_charge_value DECIMAL(12,2),
  additional_cost DECIMAL(12,2) DEFAULT 0, -- Additional charges
  central_govt_number VARCHAR,
  category_id INTEGER REFERENCES product_categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Pricing and Orders

#### `price_master`
**Purpose**: Category-wise pricing with date effectiveness
```sql
CREATE TABLE price_master (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES product_categories(id) NOT NULL,
  price_per_gram DECIMAL(10,2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `purchase_orders`
**Purpose**: Main purchase order and invoice information with advanced discount support
```sql
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR UNIQUE NOT NULL, -- PO-YYYYMMDD-###
  invoice_number VARCHAR UNIQUE, -- INV-YYYYMMDD-###
  customer_id INTEGER REFERENCES customers(id) NOT NULL,
  order_date DATE NOT NULL,
  due_date DATE, -- Payment due date
  biller_name VARCHAR, -- Employee who created the bill
  status VARCHAR DEFAULT 'pending', -- pending/confirmed/shipped/received/cancelled/invoiced
  sub_total DECIMAL(12,2) NOT NULL, -- Before discounts
  total_making_charges DECIMAL(12,2) DEFAULT 0,
  making_charge_discount DECIMAL(12,2) DEFAULT 0,
  making_charge_discount_percentage DECIMAL(5,2) DEFAULT 0,
  total_gold_gross_weight DECIMAL(12,3) NOT NULL,
  gold_value_discount_per_gram DECIMAL(10,2) DEFAULT 0,
  total_gold_value_discount DECIMAL(12,2) DEFAULT 0,
  total_discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  advance_amount DECIMAL(12,2) DEFAULT 0, -- Amount paid in advance
  outstanding_amount DECIMAL(12,2) DEFAULT 0, -- Remaining amount
  grand_total DECIMAL(12,2) NOT NULL, -- Final amount after advance
  gst_amount DECIMAL(12,2) NOT NULL, -- Total GST amount
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES employees(id) NOT NULL,
  updated_by INTEGER REFERENCES employees(id)
);
```

#### `purchase_order_items`
**Purpose**: Detailed line items for each purchase order with invoice-specific calculations
```sql
CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) NOT NULL,
  product_id INTEGER REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  purity VARCHAR NOT NULL, -- Gold purity at time of order
  gold_rate_per_gram DECIMAL(10,2) NOT NULL, -- Gold rate at order time
  net_weight DECIMAL(12,3) NOT NULL, -- Pure gold weight
  gross_weight DECIMAL(12,3) NOT NULL, -- Total weight
  labour_rate_per_gram DECIMAL(10,2) NOT NULL, -- Labour charges
  additional_cost DECIMAL(12,2) DEFAULT 0, -- Additional charges
  base_price DECIMAL(12,2) NOT NULL, -- goldRate * netWeight + labour + additional
  gst_percentage DECIMAL(5,2) NOT NULL, -- GST percentage
  gst_amount DECIMAL(12,2) NOT NULL, -- Calculated GST amount
  total_price DECIMAL(12,2) NOT NULL, -- basePrice + gstAmount
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Audit and Tracking

#### `purchase_order_audit_log`
**Purpose**: Track all changes to purchase orders
```sql
CREATE TABLE purchase_order_audit_log (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) NOT NULL,
  updated_by INTEGER REFERENCES employees(id) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  changes JSONB NOT NULL, -- JSON detailing what was changed
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `stock_movements`
**Purpose**: Track inventory movements
```sql
CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) NOT NULL,
  type VARCHAR NOT NULL, -- in, out
  weight DECIMAL(8,3) NOT NULL,
  rate_at_time DECIMAL(10,2) NOT NULL,
  reference VARCHAR, -- Reference to order or transaction
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `payment_transactions`
**Purpose**: Track advance payments and settlements for orders
```sql
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) NOT NULL,
  payment_method VARCHAR NOT NULL, -- cash, card, upi, cheque, bank_transfer
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  transaction_reference VARCHAR, -- Cheque number, UPI reference, etc.
  notes TEXT,
  processed_by INTEGER REFERENCES employees(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `discount_rules`
**Purpose**: Manage different types of discounts and promotional offers
```sql
CREATE TABLE discount_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- making_charge, gold_value, item_total, order_total
  calculation_type VARCHAR NOT NULL, -- percentage, fixed_amount, per_gram
  value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(12,2),
  max_discount_amount DECIMAL(12,2),
  applicable_categories INTEGER[], -- Array of category IDs
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `company_settings`
**Purpose**: Store company information for invoice header
```sql
CREATE TABLE company_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR NOT NULL,
  address TEXT NOT NULL,
  gst_number VARCHAR NOT NULL,
  website VARCHAR,
  phone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  logo VARCHAR, -- Logo file path
  invoice_terms TEXT, -- Terms and conditions
  bank_details JSONB, -- Bank account information
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Saving Schemes

#### `saving_scheme_master`
**Purpose**: Define saving scheme templates
```sql
CREATE TABLE saving_scheme_master (
  id SERIAL PRIMARY KEY,
  scheme_name VARCHAR NOT NULL,
  total_months INTEGER NOT NULL,
  description TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `customer_enrollments`
**Purpose**: Customer enrollments in saving schemes
```sql
CREATE TABLE customer_enrollments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) NOT NULL,
  scheme_id INTEGER REFERENCES saving_scheme_master(id) NOT NULL,
  monthly_amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  card_number VARCHAR UNIQUE NOT NULL, -- SCH-YYYYMMDD-###
  status VARCHAR DEFAULT 'Active', -- Active, Completed, Cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `monthly_payments`
**Purpose**: Track monthly payments for saving schemes
```sql
CREATE TABLE monthly_payments (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER REFERENCES customer_enrollments(id) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  gold_rate DECIMAL(10,2) NOT NULL,
  gold_grams DECIMAL(8,3) NOT NULL,
  month_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Session Management

#### `sessions`
**Purpose**: User session storage for authentication
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

## Entity Relationships

### Core Business Flow
```
customers → purchase_orders → purchase_order_items → products
    ↓             ↓                                      ↓
customer_enrollments  purchase_order_audit_log      stock_movements
    ↓
monthly_payments
```

### Detailed Relationships

#### 1. Customer-Centric Relationships
- **Customer** → **Purchase Orders** (1:Many)
  - One customer can have multiple purchase orders
  - Each purchase order belongs to exactly one customer

- **Customer** → **Customer Enrollments** (1:Many)
  - One customer can enroll in multiple saving schemes
  - Each enrollment belongs to exactly one customer

#### 2. Product Management Relationships
- **Dealer** → **Products** (1:Many)
  - One dealer can supply multiple products
  - Each product comes from exactly one dealer

- **Product Category** → **Products** (1:Many)
  - One category can contain multiple products
  - Each product belongs to one category

- **Product Category** → **Price Master** (1:Many)
  - One category can have multiple price entries (historical pricing)
  - Each price entry belongs to one category

- **Product** → **Stock Movements** (1:Many)
  - One product can have multiple stock movements
  - Each movement relates to one product

#### 3. Order Processing Relationships
- **Purchase Order** → **Purchase Order Items** (1:Many)
  - One order can contain multiple line items
  - Each item belongs to exactly one order

- **Product** → **Purchase Order Items** (1:Many)
  - One product can appear in multiple order items
  - Each item refers to exactly one product

- **Purchase Order** → **Audit Log** (1:Many)
  - One order can have multiple audit entries
  - Each audit entry belongs to one order

#### 4. Employee-Related Relationships
- **Employee** → **Purchase Orders** (created_by) (1:Many)
  - One employee can create multiple orders
  - Each order has exactly one creator

- **Employee** → **Purchase Orders** (updated_by) (1:Many)
  - One employee can update multiple orders
  - Each order can have multiple updaters over time

- **Employee** → **Audit Log** (1:Many)
  - One employee can make multiple audit entries
  - Each audit entry is made by exactly one employee

#### 5. Saving Scheme Relationships
- **Saving Scheme Master** → **Customer Enrollments** (1:Many)
  - One scheme can have multiple customer enrollments
  - Each enrollment is for exactly one scheme

- **Customer Enrollment** → **Monthly Payments** (1:Many)
  - One enrollment can have multiple monthly payments
  - Each payment belongs to exactly one enrollment

## Key Features and Constraints

### Unique Identifiers
- **Customer ID**: `CUST-YYYYMMDD-XXX` format
- **Order Number**: `PO-YYYYMMDD-###` format  
- **Invoice Number**: `INV-YYYYMMDD-###` format
- **Card Number**: `SCH-YYYYMMDD-###` format
- **Employee Code**: Unique identifier for each employee
- **Barcode Number**: Unique identifier for each product

### Invoice Generation Features
- **Detailed Product Information**: Supports purity (22kt, 24kt), net weight vs gross weight
- **Advanced Pricing**: Gold rate per gram, labour charges, additional costs
- **Multiple Discount Types**: Making charge discounts, gold value discounts per gram
- **GST Calculations**: Automatic tax calculations with configurable percentages
- **Payment Tracking**: Advance payments, outstanding balances, multiple payment methods
- **Company Branding**: Configurable company details, logo, terms and conditions

### Discount System
- **Making Charge Discounts**: Percentage-based discounts on making charges
- **Gold Value Discounts**: Fixed amount discounts per gram of gold
- **Flexible Rules**: Date-based validity, category restrictions, minimum order amounts
- **Automatic Calculations**: System automatically applies applicable discounts

### Payment Management
- **Multiple Payment Methods**: Cash, card, UPI, cheque, bank transfer
- **Advance Payments**: Track partial payments and outstanding balances
- **Transaction References**: Store cheque numbers, UPI transaction IDs
- **Audit Trail**: Complete payment history with employee tracking

### Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate critical identifiers
- NOT NULL constraints on essential fields
- Default values for status fields and timestamps

### Audit Trail
- All major entities have `created_at` and `updated_at` timestamps
- Purchase orders maintain creator and updater references
- Dedicated audit log table tracks all purchase order changes
- Stock movements provide inventory audit trail

### Pricing Strategy
- Historical pricing through `price_master` with effective dates
- Product-specific charges (making charge, wastage charge)
- Category-based tax percentage
- Multiple charge calculation methods (percentage, fixed, per gram, per piece)

### Status Management
- **Employee Status**: Active/Inactive
- **Purchase Order Status**: pending/confirmed/shipped/received/cancelled
- **Customer Enrollment Status**: Active/Completed/Cancelled

## Indexes and Performance

### Primary Indexes
- All tables have auto-incrementing integer primary keys
- Unique indexes on business identifiers (customer_id, order_number, emp_code, etc.)

### Secondary Indexes
- **Sessions**: Index on expire timestamp for cleanup
- **Price Master**: Composite index on (category_id, effective_date) for efficient price lookups

## Data Types and Precision

### Decimal Fields
- **Weights**: DECIMAL(12,2) - supports up to 10 digits before decimal, 2 after
- **Prices**: DECIMAL(10,2) for monetary values
- **Stone Weight**: DECIMAL(12,2) for precision in jewelry measurements
- **Gold Grams**: DECIMAL(8,3) for precise gold calculations in saving schemes

### Text Fields
- **VARCHAR**: Used for identifiers, names, codes
- **TEXT**: Used for longer content like addresses, descriptions
- **JSONB**: Used for structured data like audit changes

This database structure provides a robust foundation for a comprehensive jewellery shop management system with full audit capabilities, customer relationship management, and financial tracking.
