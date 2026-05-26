// src/main/routes/products.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      ...(status && { status }),
      ...(category && { category }),
      ...(search && { OR: [{ name: { contains: search } }, { sku: { contains: search } }] }),
    };
    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' } }),
      prisma.product.count({ where }),
    ]);
    res.json({ data, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, category, unit, costPrice, salePrice, stock, minStock } = req.body;
    const count = await prisma.product.count();
    const sku = `SKU-${String(count + 1).padStart(5, '0')}`;
    const product = await prisma.product.create({
      data: { sku, name, category, unit, costPrice: Number(costPrice), salePrice: Number(salePrice), stock: Number(stock), minStock: Number(minStock) || 10 },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, category, unit, costPrice, salePrice, stock, minStock, status } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { name, category, unit, costPrice: Number(costPrice), salePrice: Number(salePrice), stock: Number(stock), minStock: Number(minStock), status },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
