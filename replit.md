# Jewelry Shop Management System

## Overview

This is a comprehensive full-stack jewelry shop management system built with modern web technologies. The application features a React TypeScript frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence. The system is designed to handle all aspects of jewelry shop operations including customer management, inventory tracking, employee management, and sales processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom jewelry-themed color palette
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API endpoints with proper error handling

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: JWT tokens, secure cookies, role-based access control
- **User Management**: Automatic user creation and profile management

## Key Components

### Database Schema
The system uses a comprehensive PostgreSQL schema with the following main entities:

1. **Users & Sessions**: Core authentication tables for Replit Auth
2. **Employees**: Staff management with roles (admin/manager/staff)
3. **Customers**: Customer profiles with auto-generated IDs
4. **Dealers**: Supplier management with category associations
5. **Jewel Types**: Product categorization (Gold, Silver, Diamond, etc.)
6. **Product Categories**: Tax and HSN code management
7. **Products**: Inventory items with barcode tracking
8. **Price Master**: Dynamic pricing based on jewel types
9. **Purchase Orders**: Order processing and tracking
10. **Stock Movements**: Inventory tracking (in/out movements)
11. **Saving Schemes**: Customer saving programs
12. **Customer Enrollments**: Scheme participation tracking
13. **Monthly Payments**: Payment history for saving schemes

### API Structure
The backend provides comprehensive REST endpoints:
- `/api/auth/*` - Authentication and user management
- `/api/employees` - Employee CRUD operations
- `/api/customers` - Customer management with search
- `/api/dealers` - Dealer/supplier management
- `/api/products` - Product catalog management
- `/api/purchase-orders` - Order processing
- `/api/stock-movements` - Inventory tracking
- `/api/saving-schemes` - Financial product management
- `/api/stats` - Dashboard analytics

### Frontend Pages
- **Dashboard**: Overview with statistics and quick actions
- **Customers**: Customer management with search and enrollment
- **Employees**: Staff management with role-based permissions
- **Dealers**: Supplier relationship management
- **Products**: Inventory catalog with barcode support
- **Purchase Orders**: Order processing workflow
- **Inventory**: Stock movement tracking
- **Saving Schemes**: Financial product management
- **Reports**: Analytics and reporting
- **Price Master**: Dynamic pricing management

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Data Operations**: Frontend makes API calls through TanStack Query for caching
3. **Database Operations**: Drizzle ORM handles all database interactions
4. **Real-time Updates**: Optimistic updates with query invalidation
5. **Error Handling**: Comprehensive error boundaries and user feedback

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **wouter**: Lightweight routing library
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling for server
- **tsx**: TypeScript execution for development

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tools integration

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with environment-based configuration
- **Authentication**: Replit Auth with development OIDC endpoints

### Production Build
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `drizzle-kit push`
4. **Deployment**: Single process serving both API and static files

### Configuration Management
- Environment variables for database and auth configuration
- Separate development and production OIDC configurations
- Database URL validation with clear error messages
- Session secret management for security

The architecture prioritizes type safety, developer experience, and maintainability while providing a comprehensive solution for jewelry shop management. The system is designed to scale with business needs and supports both desktop and mobile usage patterns.

## Recent Updates (July 24, 2025)

### Employee-Based Authentication System (Completed)
- ✓ Completely removed users table - authentication now uses employees table directly
- ✓ Replaced username/password with empCode/password authentication system  
- ✓ Updated login endpoint to return employee data (id, empCode, name, role)
- ✓ Fixed all storage interface methods to use employee-based authentication only
- ✓ Created default admin employee with credentials: empCode="admin", password="admin123"
- ✓ Updated auth page to show "Employee Code" instead of "Username"
- ✓ Fixed TypeScript errors and removed all references to users table
- ✓ Enhanced database reset script with automated fresh setup command
- ✓ Fixed postgres integration with proper client configuration
- ✓ Fixed database schema synchronization between create-schema.sql and Drizzle schema
- ✓ Implemented proper seeding system with jewel types and product categories
- ✓ All API endpoints working correctly with employee-based authentication

### Database & Setup Improvements
- ✓ Created comprehensive SETUP_GUIDE.md with complete setup instructions
- ✓ Enhanced admin user auto-creation on first application startup
- ✓ Fixed SQL query type casting issues for varchar to numeric operations
- ✓ Improved database initialization process with proper seeding
- ✓ Created reset-database.js script with safe/force/fresh reset options
- ✓ Enhanced force/fresh commands to drop all tables and recreate from scratch
- ✓ Eliminated schema migration conflicts by providing clean slate resets
- ✓ Added database troubleshooting commands to setup guide

### System Architecture Updates
- ✓ Migrated from Replit Auth to custom username/password authentication
- ✓ Maintained PostgreSQL session storage for production readiness
- ✓ Updated all authentication endpoints and middleware
- ✓ Fixed frontend authentication state management
- ✓ Resolved infinite loop issues in auth hooks

## Previous Updates (July 23, 2025)

### Product Management Enhancements
- ✓ Added "Per Piece" wastage charge type to product forms
- ✓ Fixed Zod validation issues by converting decimal fields to varchar for precision handling
- ✓ Updated product schema to handle numeric values as strings to avoid validation errors

### Product Categories Management
- ✓ Created comprehensive product categories management page with full CRUD functionality
- ✓ Added category listing with proper jewel type associations
- ✓ Implemented tax percentage and HSN code management
- ✓ Fixed DataTable component compatibility for product categories

### Database & Setup
- ✓ Seeded database with basic jewel types (Gold 22K/18K, Silver, Diamond, Platinum)
- ✓ Added sample product categories with proper tax and HSN configurations
- ✓ Created complete local development setup guide (SETUP_GUIDE.md)
- ✓ Fixed database schema migration process for decimal to varchar conversion

### User Interface Improvements
- ✓ Fixed Tailwind CSS styling issues in sidebar navigation
- ✓ Added Product Categories navigation item with Tag icon
- ✓ Improved button styling consistency across modals
- ✓ Fixed primary color references in sidebar components

### Authentication & Security
- ✓ Implemented proper error handling for unauthorized requests
- ✓ Added user session management with PostgreSQL storage
- ✓ Fixed authentication flow redirection and toast notifications

### Saving Schemes Module Implementation 
- ✓ Created complete 11-Month Gold Plan saving scheme module as per requirements
- ✓ Implemented saving scheme master with jewel type associations
- ✓ Added customer enrollment functionality with auto-generated card numbers (SCH-YYYYMMDD-###)
- ✓ Built monthly payment system with automatic gold gram calculations based on current gold rates
- ✓ Added comprehensive validation for payment amounts and scheme duration limits
- ✓ Created user-friendly modals for scheme creation and customer enrollment
- ✓ Seeded database with sample saving schemes (Gold, Silver, Diamond plans)

### Current State
The system now provides a fully functional jewelry shop management platform with:
- Complete product management including all charge types
- Product categories master with tax and HSN code support  
- **Complete Saving Schemes Module** with 11-Month Gold Plan implementation
- Customer enrollment and monthly payment tracking
- Automatic timestamp handling (no manual form fields required)
- Comprehensive database seeding for immediate use
- Complete local development setup documentation

### Latest Addition (Saving Schemes Module)
The saving schemes module now includes:
- Scheme creation with jewel type selection and terms & conditions
- Customer enrollment with monthly amount and start date
- Monthly payment processing with gold rate calculations
- Payment validation and scheme completion tracking
- Real-time statistics and enrollment management