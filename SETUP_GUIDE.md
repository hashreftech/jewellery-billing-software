# Jewelry Shop Management System - Setup Guide

## Overview
This is a comprehensive jewelry shop management system built with modern web technologies. The application features a React TypeScript frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence with username/password authentication.

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database access
- Environment variables configured

## Quick Start

### 1. Database Setup

#### Option 1: Standard Setup (Recommended)
Push the database schema and seed initial data:

```bash
npm run db:push
```

#### Option 2: Force Reset Database (When needed)
For a completely fresh database setup, use the reset script:

```bash
# Safe reset (preserves data where possible)
node reset-database.js safe

# Force reset (WARNING: deletes all data)
node reset-database.js force

# Fresh setup (reset + auto-seed initial data)
node reset-database.js fresh
```

**Note for Clean Setup:** The force and fresh reset commands will:
- Drop all existing tables completely
- Recreate the entire schema from scratch  
- Eliminate any migration conflicts or old data remnants
- Provide a completely clean database environment
- **Always choose "+ table_name create table" when prompted during fresh setup**

**Security Enhancement:** All passwords are now automatically hashed using scrypt with salt:
- New user passwords are hashed during creation
- Legacy plain text passwords are supported but logged with security warnings
- Fresh database setup creates all users with properly hashed passwords from the start

**What the setup includes:**
- Create all necessary database tables
- Set up proper indexes and constraints
- Create sample product categories with tax and HSN configurations (Gold 22K/18K, Silver, Diamond, Platinum)
- Seed sample dealers, customers, and products
- Create saving schemes and price master data
- Set up the admin user automatically with secure hashed password

### 2. Start the Application
Run the development server:

```bash
npm run dev
```

The application will be available at the URL shown in the Replit webview.

### 3. Default Login Credentials
Use these credentials to access the system:
- **Username:** `admin`
- **Password:** `admin123`

The system will automatically create this admin user on first startup if it doesn't exist.

## Database Schema

### Core Tables
- **sessions**: PostgreSQL-backed session storage
- **employees**: Staff management with roles (admin/manager/staff)
- **customers**: Customer profiles with auto-generated IDs
- **dealers**: Supplier management with category associations
- **product_categories**: Tax and HSN code management for different jewelry types
- **products**: Inventory items with barcode tracking
- **price_master**: Dynamic pricing for gold rates
- **purchase_orders**: Order processing and tracking
- **stock_movements**: Inventory tracking (in/out movements)
- **saving_scheme_master**: Customer saving programs
- **customer_enrollments**: Scheme participation tracking
- **monthly_payments**: Payment history for saving schemes

### Initial Data Seeded
After running `npm run db:push` or `node reset-database.js fresh`, the following data will be available:

#### Product Categories
- Gold 22K Jewelry (HSN: 71131900, Tax: 3%)
- Gold 18K Jewelry (HSN: 71131900, Tax: 3%)
- Silver Jewelry (HSN: 71131100, Tax: 3%)
- Diamond Jewelry (HSN: 71131910, Tax: 0.25%)
- Platinum Jewelry (HSN: 71131920, Tax: 3%)

#### Sample Dealers
- Mumbai Gold Traders (Gold 22K, Gold 18K, Silver)
- Delhi Diamond House (Diamond, Platinum)
- Chennai Silver Works (Silver, Gold 22K)

#### Sample Customers
- 3 customers with complete GST and PAN details
- Auto-generated customer IDs (CUST-YYYYMMDD-###)

#### Sample Products
- Gold Chain 22K, Gold Earrings 22K
- Silver Bracelet
- Diamond Ring
- Complete with barcode numbers and making charges

#### Saving Schemes
- 6-Month Quick Plan
- 11-Month Gold Plan (most popular)
- 24-Month Premium Plan

#### Default Admin User
- Employee Code: admin
- Username: admin
- Password: admin123
- Role: admin

## Application Features

### 1. Authentication System
- Username/password authentication
- Session-based authentication with PostgreSQL storage
- Automatic admin user creation on first run
- Secure password hashing using scrypt

### 2. Customer Management
- Customer registration with auto-generated IDs (CUST-YYYYMMDD-###)
- Customer search and filtering
- Profile management

### 3. Inventory Management
- Product catalog with barcode support
- Multiple jewel type support
- Stock movement tracking
- Price master for dynamic pricing

### 4. Employee Management
- Staff profiles with role-based access
- Employee code generation (EMP-###)
- Role management (admin/manager/staff)

### 5. Dealer Management
- Supplier relationship management
- Category associations
- Contact information management

### 6. Saving Schemes Module
- 11-Month Gold Plan implementation
- Customer enrollment with auto-generated card numbers (SCH-YYYYMMDD-###)
- Monthly payment tracking with gold rate calculations
- Scheme completion management

### 7. Purchase Orders
- Order processing workflow
- Order tracking and status management
- Integration with inventory system

### 8. Reports & Analytics
- Dashboard with key statistics
- Sales reports
- Inventory reports
- Customer analytics

## Environment Configuration

The following environment variables are automatically configured in Replit:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `PGDATABASE`, `PGHOST`, `PGPASSWORD`, `PGPORT`, `PGUSER`: Database connection details

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Core Resources
- `/api/customers` - Customer management
- `/api/employees` - Employee management
- `/api/dealers` - Dealer management
- `/api/products` - Product catalog
- `/api/product-categories` - Category management
- `/api/purchase-orders` - Order processing
- `/api/stock-movements` - Inventory tracking
- `/api/saving-schemes` - Financial products
- `/api/stats` - Dashboard analytics

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Application pages
│   │   └── App.tsx         # Main application component
├── server/                 # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database operations
├── shared/
│   └── schema.ts          # Database schema definitions
└── package.json           # Dependencies and scripts
```

## Development Workflow

1. **Database Changes**: Update schema in `shared/schema.ts` then run `npm run db:push`
2. **Frontend Changes**: Edit files in `client/src/`, hot reload is enabled
3. **Backend Changes**: Edit files in `server/`, server will auto-restart
4. **Testing**: Use the admin credentials to test all functionality

## Troubleshooting

### Database Issues
- If tables are missing, run `npm run db:push` again
- For complete reset: `node reset-database.js fresh`
- Check that DATABASE_URL environment variable is set
- Verify PostgreSQL connection is working

### Common Database Commands
```bash
# Standard schema push
npm run db:push

# Safe reset (preserves data)
node reset-database.js safe

# Complete fresh start (WARNING: drops all tables)
node reset-database.js fresh

# View available reset options
node reset-database.js help
```

### Authentication Issues
- Ensure admin user exists (should be created automatically)
- Check browser cookies are enabled
- Clear browser cache if login issues persist

### Performance Issues
- Database queries are optimized with proper indexes
- Frontend uses React Query for efficient data fetching
- Session storage uses PostgreSQL for scalability

## Production Deployment

For production deployment:
1. Ensure all environment variables are properly set
2. Run `npm run db:push` to set up production database
3. Use Replit's deployment features for hosting
4. Configure custom domain if needed

## Support & Maintenance

The system includes:
- Comprehensive error handling
- Automatic data validation
- Session management
- Role-based access control
- Audit trails for critical operations

## Security Features

- Password hashing using scrypt with salt
- Session-based authentication
- SQL injection prevention via parameterized queries
- XSS protection via React's built-in sanitization
- CSRF protection via session validation

---

**Note**: This system is designed for jewelry shop operations and includes industry-specific features like gold rate calculations, saving schemes, and HSN code management for tax compliance.