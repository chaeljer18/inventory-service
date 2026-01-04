// INVENTORY MANAGEMENT MICROSERVICE
// Michael Jeremi B S (18221136)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9697;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

class Product {
  constructor(id, name, category, price, stock, minStock = 5, expiryDate = null) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.stock = stock;
    this.minStock = minStock;
    this.expiryDate = expiryDate;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  isLowStock() {
    return this.stock <= this.minStock;
  }

  isExpiringSoon(days = 7) {
    if (!this.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(this.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= days && daysUntilExpiry > 0;
  }

  isExpired() {
    if (!this.expiryDate) return false;
    return new Date(this.expiryDate) < new Date();
  }

  canFulfillOrder(quantity) {
    return this.stock >= quantity && !this.isExpired();
  }

  reduceStock(quantity) {
    if (!this.canFulfillOrder(quantity)) {
      throw new Error(`Insufficient stock on product ${this.name}`);
    }
    this.stock -= quantity;
    this.updatedAt = new Date();
  }

  addStock(quantity) {
    this.stock += quantity;
    this.updatedAt = new Date();
  }

  updateMinStock(minStock) {
    this.minStock = minStock;
    this.updatedAt = new Date();
  }
}

class RestockRecord {
  constructor(productId, quantity, reason, performedBy) {
    this.id = Date.now().toString();
    this.productId = productId;
    this.quantity = quantity;
    this.reason = reason;
    this.performedBy = performedBy;
    this.timestamp = new Date();
  }
}

class ProductRepository {
  constructor() {
    this.products = new Map();
    this.restockHistory = [];
    this.initializeSampleData();
  }

  initializeSampleData() {
    const sampleProducts = [
      new Product('P001', 'Nasi Goreng', 'Makanan Berat', 15000, 20, 5),
      new Product('P002', 'Mie Ayam', 'Makanan Berat', 12000, 15, 5),
      new Product('P003', 'Teh Botol', 'Minuman', 5000, 50, 10),
      new Product('P004', 'Air Mineral', 'Minuman', 3000, 100, 20),
      new Product('P005', 'Kopi Susu', 'Minuman', 8000, 25, 8),
      new Product('P006', 'Roti Bakar', 'Snack', 10000, 12, 5),
      new Product('P007', 'Pisang Goreng', 'Snack', 7000, 8, 5),
      new Product('P008', 'Es Teh Manis', 'Minuman', 4000, 30, 10)
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  findAll() {
    return Array.from(this.products.values());
  }

  findById(id) {
    return this.products.get(id);
  }

  findByCategory(category) {
    return this.findAll().filter(p => p.category === category);
  }

  save(product) {
    this.products.set(product.id, product);
    return product;
  }

  delete(id) {
    return this.products.delete(id);
  }

  addRestockRecord(record) {
    this.restockHistory.push(record);
  }

  getRestockHistory(productId = null, limit = 50) {
    let history = this.restockHistory;
    if (productId) {
      history = history.filter(r => r.productId === productId);
    }
    return history.slice(-limit).reverse();
  }

  getLowStockProducts() {
    return this.findAll().filter(p => p.isLowStock());
  }

  getExpiringProducts(days = 7) {
    return this.findAll().filter(p => p.isExpiringSoon(days));
  }

  getExpiredProducts() {
    return this.findAll().filter(p => p.isExpired());
  }
}

class InventoryService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  getAllProducts() {
    return this.productRepository.findAll();
  }

  getProductById(id) {
    const product = this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  getProductsByCategory(category) {
    return this.productRepository.findByCategory(category);
  }

  createProduct(productData) {
    const id = 'P' + Date.now().toString().slice(-6);
    const product = new Product(
      id,
      productData.name,
      productData.category,
      productData.price,
      productData.stock || 0,
      productData.minStock || 5,
      productData.expiryDate || null
    );
    return this.productRepository.save(product);
  }

  updateProduct(id, updates) {
    const product = this.getProductById(id);
    
    if (updates.name) product.name = updates.name;
    if (updates.category) product.category = updates.category;
    if (updates.price) product.price = updates.price;
    if (updates.expiryDate !== undefined) product.expiryDate = updates.expiryDate;
    if (updates.minStock !== undefined) product.updateMinStock(updates.minStock);
    
    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  deleteProduct(id) {
    const product = this.getProductById(id);
    this.productRepository.delete(id);
    return { message: `Product ${product.name} successfully deleted` };
  }

  addStock(id, quantity, reason = 'Manual restock', performedBy = 'Admin') {
    const product = this.getProductById(id);
    product.addStock(quantity);
    
    const record = new RestockRecord(id, quantity, reason, performedBy);
    this.productRepository.addRestockRecord(record);
    this.productRepository.save(product);
    
    return {
      product,
      message: `Added ${quantity} units to ${product.name}. New stock: ${product.stock}`
    };
  }

  reduceStock(id, quantity, reason = 'Order fulfillment') {
    const product = this.getProductById(id);
    product.reduceStock(quantity);
    this.productRepository.save(product);
    
    return {
      product,
      message: `Reduced ${quantity} units from ${product.name}. Remaining stock: ${product.stock}`
    };
  }

  checkStockAvailability(id, quantity) {
    const product = this.getProductById(id);
    return {
      productId: id,
      productName: product.name,
      available: product.canFulfillOrder(quantity),
      currentStock: product.stock,
      requestedQuantity: quantity,
      isExpired: product.isExpired()
    };
  }

  getLowStockAlert() {
    const lowStockProducts = this.productRepository.getLowStockProducts();
    return {
      alertCount: lowStockProducts.length,
      products: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        needsRestock: p.minStock - p.stock
      }))
    };
  }

  getExpiryAlert(days = 7) {
    const expiringProducts = this.productRepository.getExpiringProducts(days);
    const expiredProducts = this.productRepository.getExpiredProducts();
    
    return {
      expiringSoon: expiringProducts.map(p => ({
        id: p.id,
        name: p.name,
        expiryDate: p.expiryDate,
        daysUntilExpiry: Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      })),
      expired: expiredProducts.map(p => ({
        id: p.id,
        name: p.name,
        expiryDate: p.expiryDate
      }))
    };
  }

  getRestockHistory(productId = null, limit = 50) {
    return this.productRepository.getRestockHistory(productId, limit);
  }

  getInventorySummary() {
    const allProducts = this.productRepository.findAll();
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = this.productRepository.getLowStockProducts();
    
    return {
      totalProducts: allProducts.length,
      totalStockValue: totalValue,
      lowStockCount: lowStock.length,
      categories: this.getCategorySummary()
    };
  }

  getCategorySummary() {
    const allProducts = this.productRepository.findAll();
    const summary = {};
    
    allProducts.forEach(product => {
      if (!summary[product.category]) {
        summary[product.category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      summary[product.category].count++;
      summary[product.category].totalStock += product.stock;
      summary[product.category].totalValue += product.price * product.stock;
    });
    
    return summary;
  }
}

const productRepository = new ProductRepository();
const inventoryService = new InventoryService(productRepository);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Inventory Management Service',
    version: '1.0.0',
    author: 'Michael Jeremi B S - 18221136',
    endpoints: {
      health: '/health',
      products: '/api/products',
      alerts: '/api/alerts',
      summary: '/api/summary'
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Inventory Management Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const { category } = req.query;
    const products = category 
      ? inventoryService.getProductsByCategory(category)
      : inventoryService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = inventoryService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// Create new product
app.post('/api/products', (req, res) => {
  try {
    const product = inventoryService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const product = inventoryService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const result = inventoryService.deleteProduct(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// Add stock 
app.post('/api/products/:id/restock', (req, res) => {
  try {
    const { quantity, reason, performedBy } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }
    const result = inventoryService.addStock(req.params.id, quantity, reason, performedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reduce stock (buat order API)
app.post('/api/products/:id/reduce', (req, res) => {
  try {
    const { quantity, reason } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }
    const result = inventoryService.reduceStock(req.params.id, quantity, reason);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Check stock availability (buat order API)
app.post('/api/products/:id/check-availability', (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }
    const result = inventoryService.checkStockAvailability(req.params.id, quantity);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// Get low stock alert
app.get('/api/alerts/low-stock', (req, res) => {
  try {
    const alert = inventoryService.getLowStockAlert();
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get expiry alert
app.get('/api/alerts/expiry', (req, res) => {
  try {
    const { days } = req.query;
    const alert = inventoryService.getExpiryAlert(days ? parseInt(days) : 7);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get restock history
app.get('/api/restock-history', (req, res) => {
  try {
    const { productId, limit } = req.query;
    const history = inventoryService.getRestockHistory(
      productId, 
      limit ? parseInt(limit) : 50
    );
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inventory summary
app.get('/api/summary', (req, res) => {
  try {
    const summary = inventoryService.getInventorySummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch check availability 
app.post('/api/products/batch/check-availability', (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items must be an array' });
    }
    
    const results = items.map(item => {
      try {
        return inventoryService.checkStockAvailability(item.productId, item.quantity);
      } catch (error) {
        return {
          productId: item.productId,
          available: false,
          error: error.message
        };
      }
    });
    
    const allAvailable = results.every(r => r.available);
    res.json({ 
      success: true, 
      allAvailable,
      data: results 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Batch reduce stock (buat order API)
app.post('/api/products/batch/reduce', (req, res) => {
  try {
    const { items, reason } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items must be an array' });
    }
    
    const results = [];
    for (const item of items) {
      const result = inventoryService.reduceStock(item.productId, item.quantity, reason);
      results.push(result);
    }
    
    res.json({ 
      success: true, 
      message: 'Stock successfully reduced for all items',
      data: results 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Error internal server',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint is not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Inventory Management Service');
  console.log('Michael Jeremi B S (18221136)');
  console.log('='.repeat(60));
  console.log(`Service URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base: http://localhost:${PORT}/api`);
  console.log('='.repeat(60));
});

module.exports = app;