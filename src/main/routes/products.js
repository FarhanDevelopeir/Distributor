// src/main/routes/products.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, companyId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      ...(companyId && { companyId: Number(companyId) }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { company: { name: { contains: search } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
        include: { company: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { company: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, companyId, purchasePrice, salePrice, stockQuantity, unitType } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Product name is required' });
    if (!companyId) return res.status(400).json({ error: 'Company is required' });

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        companyId: Number(companyId),
        purchasePrice: Number(purchasePrice) || 0,
        salePrice: Number(salePrice) || 0,
        stockQuantity: Number(stockQuantity) || 0,
        unitType: unitType || 'pcs',
      },
      include: { company: { select: { id: true, name: true } } },
    });

    if (product.stockQuantity > 0) {
      await prisma.stockLog.create({
        data: { productId: product.id, type: 'in', quantity: product.stockQuantity, reason: 'Initial stock' },
      });
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, companyId, purchasePrice, salePrice, stockQuantity, unitType } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Product name is required' });

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name: name.trim(),
        companyId: Number(companyId),
        purchasePrice: Number(purchasePrice) || 0,
        salePrice: Number(salePrice) || 0,
        stockQuantity: Number(stockQuantity),
        unitType: unitType || 'pcs',
      },
      include: { company: { select: { id: true, name: true } } },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, type, reason } = req.body;
    const id = Number(req.params.id);
    const qty = Number(quantity);

    if (!qty || qty <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });
    if (!['in', 'out', 'adjustment'].includes(type)) {
      return res.status(400).json({ error: 'Type must be in, out, or adjustment' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let newStock = product.stockQuantity;
    if (type === 'in') newStock += qty;
    else if (type === 'out') {
      if (product.stockQuantity < qty) return res.status(400).json({ error: 'Insufficient stock' });
      newStock -= qty;
    } else {
      newStock = qty;
    }

    await prisma.$transaction([
      prisma.product.update({ where: { id }, data: { stockQuantity: newStock } }),
      prisma.stockLog.create({ data: { productId: id, type, quantity: qty, reason } }),
    ]);

    const result = await prisma.product.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true } } },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const itemCount = await prisma.invoiceItem.count({ where: { productId: id } });
    if (itemCount > 0) {
      return res.status(400).json({ error: 'Cannot delete product used in invoices' });
    }
    await prisma.stockLog.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
