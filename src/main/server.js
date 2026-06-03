// src/main/server.js
// Express backend — runs locally inside Electron, fully offline

const express = require('express');
const cors = require('cors');

const companyRoutes   = require('./routes/companies');
const productRoutes   = require('./routes/products');
const salesmanRoutes  = require('./routes/salesmen');
const customerRoutes  = require('./routes/customers');
const deliveryPersonRoutes = require('./routes/deliveryPersons');
const invoiceRoutes   = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:3000', 'file://'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), offline: true });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/salesmen', salesmanRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[DMS Server] Running at http://127.0.0.1:${PORT} (offline only)`);
});

module.exports = app;
