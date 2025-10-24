const express = require('express');
const path = require('path');
const app = express();
const PORT = 4000;

// Serve static files from dist directory
app.use('/adminhoang/assets', express.static(path.join(__dirname, 'dist/assets')));

// Handle SPA routing - serve index.html for all admin routes
app.get('/adminhoang', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/adminhoang/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Catch-all route for SPA routing using regex
app.get(/^\/adminhoang\/.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Mock API endpoints for admin panel
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Rau củ quả', description: 'Rau củ quả tươi sạch', status: 'active' },
    { id: 2, name: 'Thực phẩm khô', description: 'Thực phẩm khô organic', status: 'active' },
    { id: 3, name: 'Protein thực vật', description: 'Protein từ thực vật', status: 'active' }
  ]);
});

app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Rau xà lách', price: 25000, category: 'Rau củ quả', stock: 100 },
    { id: 2, name: 'Cà chua', price: 30000, category: 'Rau củ quả', stock: 50 },
    { id: 3, name: 'Đậu phụ', price: 15000, category: 'Protein thực vật', stock: 200 }
  ]);
});

app.get('/api/orders', (req, res) => {
  res.json([
    { id: 1, customer: 'Nguyễn Văn A', total: 75000, status: 'completed', date: '2025-10-24' },
    { id: 2, customer: 'Trần Thị B', total: 120000, status: 'pending', date: '2025-10-24' }
  ]);
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'customer' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'admin' }
  ]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT, 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Admin panel running on port ${PORT}`);
  console.log(`📱 Access: http://localhost:${PORT}/adminhoang/`);
});
