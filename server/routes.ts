import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import {
  insertEmployeeSchema,
  insertCustomerSchema,
  insertDealerSchema,
  insertProductCategorySchema,
  insertProductSchema,
  insertPriceMasterSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  insertPurchaseOrderAuditLogSchema,
  insertStockMovementSchema,
  insertSavingSchemeSchema,
  insertCustomerEnrollmentSchema,
  insertMonthlyPaymentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are set up in setupAuth function

  // Dashboard stats
  app.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/employees/next-code', isAuthenticated, async (req, res) => {
    try {
      const nextCode = await storage.generateNextEmployeeCode();
      res.json({ empCode: nextCode });
    } catch (error) {
      console.error("Error generating next employee code:", error);
      res.status(500).json({ message: "Failed to generate employee code" });
    }
  });

  app.get('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      // Generate the next employee code automatically
      const empCode = await storage.generateNextEmployeeCode();
      
      // Hash the password before storing
      const hashedPassword = await hashPassword(req.body.password);
      
      // Parse the request data and add the generated empCode and hashed password
      const validatedData = insertEmployeeSchema.parse({
        ...req.body,
        empCode,
        password: hashedPassword
      });
      
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Hash password if it's being updated
      let updateData = { ...req.body };
      if (updateData.password && updateData.password.trim() !== "") {
        updateData.password = await hashPassword(updateData.password);
      } else {
        // Remove password from update if it's empty (keep existing password)
        delete updateData.password;
      }
      
      const validatedData = insertEmployeeSchema.partial().parse(updateData);
      const employee = await storage.updateEmployee(id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmployee(id);
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === 'string') {
        const customers = await storage.searchCustomers(search);
        return res.json(customers);
      }
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      // Clean up empty date strings before validation
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") cleanedData.dateOfBirth = null;
      if (cleanedData.anniversary === "") cleanedData.anniversary = null;
      
      const validatedData = insertCustomerSchema.parse(cleanedData);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Clean up empty date strings before validation
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") cleanedData.dateOfBirth = null;
      if (cleanedData.anniversary === "") cleanedData.anniversary = null;
      
      const validatedData = insertCustomerSchema.partial().parse(cleanedData);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Dealer routes
  app.get('/api/dealers', isAuthenticated, async (req, res) => {
    try {
      const dealers = await storage.getDealers();
      res.json(dealers);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      res.status(500).json({ message: "Failed to fetch dealers" });
    }
  });

  app.post('/api/dealers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(validatedData);
      res.status(201).json(dealer);
    } catch (error) {
      console.error("Error creating dealer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dealer" });
    }
  });

  app.put('/api/dealers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDealerSchema.partial().parse(req.body);
      const dealer = await storage.updateDealer(id, validatedData);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      console.error("Error updating dealer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update dealer" });
    }
  });

  // Product Category routes
  app.get('/api/product-categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({ message: "Failed to fetch product categories" });
    }
  });

  app.post('/api/product-categories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating product category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product category" });
    }
  });

  app.put('/api/product-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductCategorySchema.partial().parse(req.body);
      const category = await storage.updateProductCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Product category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating product category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product category" });
    }
  });

  app.delete('/api/product-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Product category not found" });
      }
      res.json({ message: "Product category deleted successfully" });
    } catch (error) {
      console.error("Error deleting product category:", error);
      // Check if this is a protected category error
      if (error instanceof Error && error.message.includes("protected")) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete product category" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === 'string') {
        const products = await storage.searchProducts(search);
        return res.json(products);
      }
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Price Master routes
  // Get current effective prices for all categories
  app.get('/api/price-master/current', isAuthenticated, async (req, res) => {
    try {
      const currentPrices = await storage.getCurrentPrices();
      res.json(currentPrices);
    } catch (error) {
      console.error("Error fetching current prices:", error);
      res.status(500).json({ message: "Failed to fetch current prices" });
    }
  });

  app.get('/api/price-master', isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 30;
      const prices = await storage.getPriceMaster(offset, limit);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching price master:", error);
      res.status(500).json({ message: "Failed to fetch price master" });
    }
  });

  // Get price for category and date (must be before :date route)
  app.get('/api/price-master/latest', isAuthenticated, async (req, res) => {
    try {
      const { categoryId, date } = req.query;
      
      if (!categoryId) {
        return res.status(400).json({ message: "categoryId is required" });
      }

      const price = await storage.getLatestPriceForCategory(
        Number(categoryId), 
        date ? String(date) : undefined
      );
      
      if (!price) {
        return res.status(404).json({ message: "No price found for this category" });
      }

      res.json(price);
    } catch (error) {
      console.error("Error fetching latest price:", error);
      res.status(500).json({ message: "Failed to fetch latest price" });
    }
  });

  // Get price master for specific date
  app.get('/api/price-master/:date', isAuthenticated, async (req, res) => {
    try {
      const date = req.params.date;
      const prices = await storage.getPriceMasterForDate(date);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching price master for date:", error);
      res.status(500).json({ message: "Failed to fetch price master for date" });
    }
  });

  // Create/update price master (batch operation)
  app.post('/api/price-master', isAuthenticated, async (req, res) => {
    try {
      // Support both single price and array of prices
      const data = Array.isArray(req.body) ? req.body : [req.body];
      const validatedData = data.map(item => insertPriceMasterSchema.parse(item));
      const prices = await storage.createPriceMaster(validatedData);
      res.status(201).json(prices);
    } catch (error) {
      console.error("Error creating price master:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create price master" });
    }
  });

  // Load more price master data (pagination)
  app.get('/api/price-master/more/:offset', isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.params.offset);
      const limit = parseInt(req.query.limit as string) || 30;
      const prices = await storage.getPriceMaster(offset, limit);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching more price master data:", error);
      res.status(500).json({ message: "Failed to fetch more price master data" });
    }
  });

  // Purchase Order routes (Enhanced)
  app.get('/api/purchase-orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      
      // Add customer and creator information
      const ordersWithDetails = await Promise.all(orders.map(async (order) => {
        const customer = await storage.getCustomer(order.customerId);
        const creator = order.createdBy ? await storage.getEmployee(order.createdBy) : null;
        const updater = order.updatedBy ? await storage.getEmployee(order.updatedBy) : null;
        
        return {
          ...order,
          customer: customer ? { name: customer.name, phone: customer.phone, customerId: customer.customerId } : null,
          creator: creator ? { name: creator.name, empCode: creator.empCode } : null,
          updater: updater ? { name: updater.name, empCode: updater.empCode } : null,
        };
      }));
      
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.get('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getPurchaseOrderWithDetails(id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });

  // Create purchase order with items (Requires Admin/Manager role)
  app.post('/api/purchase-orders', isAuthenticated, async (req, res) => {
    try {
      // Check user role
      const currentUser = req.user as any;
      if (!currentUser || !['admin', 'manager'].includes(currentUser.role.toLowerCase())) {
        return res.status(403).json({ message: "Access denied. Only Admin and Manager can create purchase orders." });
      }

      const { items, discount = 0, orderDate, customerId, status = 'pending' } = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "At least one item is required" });
      }
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer is required" });
      }

      // Calculate totals from items
      let totalAmount = 0;
      const processedItems = [];

      for (const item of items) {
        const { productId, quantity, weight, pricePerGram, basePrice, taxAmount, finalPrice } = item;
        
        // Validate required fields
        if (!productId || !quantity || !weight || !pricePerGram || basePrice === undefined || taxAmount === undefined || finalPrice === undefined) {
          return res.status(400).json({ message: "All item fields are required" });
        }

        totalAmount += Number(finalPrice) * Number(quantity);
        processedItems.push({
          productId: Number(productId),
          quantity: Number(quantity),
          weight: String(weight),
          pricePerGram: String(pricePerGram),
          basePrice: String(basePrice),
          taxAmount: String(taxAmount),
          finalPrice: String(finalPrice),
        });
      }

      // Apply discount
      totalAmount = totalAmount - Number(discount);

      // Create purchase order
      const orderData = {
        customerId: Number(customerId),
        orderDate: orderDate || new Date().toISOString().split('T')[0],
        status,
        totalAmount: String(totalAmount),
        discount: String(discount),
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
      };

      const validatedOrderData = insertPurchaseOrderSchema.parse(orderData);
      const order = await storage.createPurchaseOrder(validatedOrderData);

      // Create order items
      const itemsWithOrderId = processedItems.map(item => ({
        ...item,
        purchaseOrderId: order.id,
      }));

      const validatedItems = itemsWithOrderId.map(item => insertPurchaseOrderItemSchema.parse(item));
      const createdItems = await storage.createPurchaseOrderItems(validatedItems);

      // Create audit log
      await storage.createPurchaseOrderAuditLog({
        purchaseOrderId: order.id,
        updatedBy: currentUser.id,
        changes: {
          action: 'created',
          details: `Purchase order created with ${items.length} items`,
          totalAmount: totalAmount,
          itemCount: items.length,
        },
      });

      res.status(201).json({
        ...order,
        items: createdItems,
      });
    } catch (error) {
      console.error("Error creating purchase order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  // Update purchase order (Requires Admin/Manager role)
  app.put('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      // Check user role
      const currentUser = req.user as any;
      if (!currentUser || !['admin', 'manager'].includes(currentUser.role.toLowerCase())) {
        return res.status(403).json({ message: "Access denied. Only Admin and Manager can update purchase orders." });
      }

      const id = parseInt(req.params.id);
      const existingOrder = await storage.getPurchaseOrder(id);
      
      if (!existingOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      const { items, discount, status, ...otherUpdates } = req.body;
      let updateData: any = {
        ...otherUpdates,
        updatedBy: currentUser.id,
      };

      if (discount !== undefined) updateData.discount = String(discount);
      if (status !== undefined) updateData.status = status;

      // If items are being updated, recalculate total
      if (items) {
        let totalAmount = 0;
        for (const item of items) {
          totalAmount += Number(item.finalPrice) * Number(item.quantity);
        }
        totalAmount = totalAmount - Number(discount || 0);
        updateData.totalAmount = String(totalAmount);
      }

      const validatedData = insertPurchaseOrderSchema.partial().parse(updateData);
      const order = await storage.updatePurchaseOrder(id, validatedData);

      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      // Create audit log
      await storage.createPurchaseOrderAuditLog({
        purchaseOrderId: id,
        updatedBy: currentUser.id,
        changes: {
          action: 'updated',
          details: 'Purchase order updated',
          changedFields: Object.keys(updateData),
          previousValues: {
            status: existingOrder.status,
            totalAmount: existingOrder.totalAmount,
            discount: existingOrder.discount,
          },
          newValues: updateData,
        },
      });

      res.json(order);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });

  // Search customers (for order creation)
  app.get('/api/customers/search', isAuthenticated, async (req, res) => {
    try {
  const raw = typeof req.query.q === 'string' ? req.query.q : '';
  const q = raw.trim();
  if (q.length < 2) return res.json([]);
  const customers = await storage.searchCustomers(q);
  return res.json(customers);
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  });

  // Search products (for order creation)
  app.get('/api/products/search', isAuthenticated, async (req, res) => {
    try {
  const raw = typeof req.query.q === 'string' ? req.query.q : '';
  const q = raw.trim();
  if (q.length < 2) return res.json([]);
  const products = await storage.searchProducts(q);
  return res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Path parameter versions for TanStack Query compatibility
  app.get('/api/customers/search/:query', isAuthenticated, async (req, res) => {
    try {
      const { query } = req.params;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const customers = await storage.searchCustomers(query);
      res.json(customers);
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  });

  app.get('/api/products/search/:query', isAuthenticated, async (req, res) => {
    try {
      const { query } = req.params;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const products = await storage.searchProducts(query);
      
      // Include category information for tax calculation
      const productsWithCategories = await Promise.all(products.map(async (product) => {
        const category = product.categoryId ? await storage.getProductCategory(product.categoryId) : null;
        return {
          ...product,
          category: category ? {
            id: category.id,
            name: category.name,
            taxPercentage: category.taxPercentage,
          } : null,
        };
      }));
      
      res.json(productsWithCategories);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Stock Movement routes
  app.get('/api/stock-movements', isAuthenticated, async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.post('/api/stock-movements', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating stock movement:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stock movement" });
    }
  });

  // Saving Scheme routes
  app.get('/api/saving-schemes', isAuthenticated, async (req, res) => {
    try {
      const schemes = await storage.getSavingSchemes();
      res.json(schemes);
    } catch (error) {
      console.error("Error fetching saving schemes:", error);
      res.status(500).json({ message: "Failed to fetch saving schemes" });
    }
  });

  app.post('/api/saving-schemes', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSavingSchemeSchema.parse(req.body);
      const scheme = await storage.createSavingScheme(validatedData);
      res.status(201).json(scheme);
    } catch (error) {
      console.error("Error creating saving scheme:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create saving scheme" });
    }
  });

  app.put('/api/saving-schemes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSavingSchemeSchema.partial().parse(req.body);
      const scheme = await storage.updateSavingScheme(id, validatedData);
      if (!scheme) {
        return res.status(404).json({ message: "Saving scheme not found" });
      }
      res.json(scheme);
    } catch (error) {
      console.error("Error updating saving scheme:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update saving scheme" });
    }
  });

  // Customer Enrollment routes
  app.get('/api/customer-enrollments', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.query;
      if (customerId && typeof customerId === 'string') {
        const enrollments = await storage.getCustomerEnrollmentsByCustomer(parseInt(customerId));
        return res.json(enrollments);
      }
      const enrollments = await storage.getCustomerEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching customer enrollments:", error);
      res.status(500).json({ message: "Failed to fetch customer enrollments" });
    }
  });

  app.get('/api/customer-enrollments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enrollment = await storage.getCustomerEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      res.status(500).json({ message: "Failed to fetch enrollment" });
    }
  });

  app.post('/api/customer-enrollments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createCustomerEnrollment(validatedData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating customer enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer enrollment" });
    }
  });

  // Monthly Payment routes
  app.get('/api/monthly-payments/:enrollmentId', isAuthenticated, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.enrollmentId);
      const payments = await storage.getMonthlyPayments(enrollmentId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching monthly payments:", error);
      res.status(500).json({ message: "Failed to fetch monthly payments" });
    }
  });

  app.post('/api/monthly-payments', isAuthenticated, async (req, res) => {
    try {
      const { enrollmentId, amount, goldRate } = req.body;
      
      // Get current enrollment to verify amount
      const enrollment = await storage.getCustomerEnrollment(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      // Check if amount matches enrolled monthly amount
      if (Number(amount) !== Number(enrollment.monthlyAmount)) {
        return res.status(400).json({ 
          message: "Payment amount must match enrolled monthly amount",
          expected: enrollment.monthlyAmount,
          received: amount
        });
      }

      // Get existing payments for this enrollment
      const existingPayments = await storage.getMonthlyPayments(enrollmentId);
      
      // Get scheme details
      const scheme = await storage.getSavingScheme(enrollment.schemeId);
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      // Check if max payments reached
      if (existingPayments.length >= scheme.totalMonths) {
        return res.status(400).json({ 
          message: "Maximum payments reached for this scheme",
          maxPayments: scheme.totalMonths,
          currentPayments: existingPayments.length
        });
      }

      // Calculate gold grams: amount / gold_rate
      const goldGrams = Number(amount) / Number(goldRate);
      
      const paymentData = {
        enrollmentId,
        paymentDate: new Date().toISOString().split('T')[0], // Today's date
        amount: amount.toString(),
        goldRate: goldRate.toString(),
        goldGrams: goldGrams.toString(),
        monthNumber: existingPayments.length + 1,
      };

      const validatedData = insertMonthlyPaymentSchema.parse(paymentData);
      const payment = await storage.createMonthlyPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating monthly payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create monthly payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
