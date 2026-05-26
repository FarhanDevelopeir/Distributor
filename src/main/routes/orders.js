// src/main/routes/orders.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, status, distributorId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      ...(status && { status }),
      ...(distributorId && { distributorId: Number(distributorId) }),
      ...(search && { OR: [{ orderNo: { contains: search } }] }),
    };
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { distributor: { select: { name: true, code: true } }, items: { include: { product: { select: { name: true, sku: true } } } } },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ data, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { distributor: true, items: { include: { product: true } }, payments: true },
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { distributorId, items, discount = 0, tax = 0, notes, deliveryDate } = req.body;
    const count = await prisma.order.count();
    const orderNo = `ORD-${String(count + 1).padStart(6, '0')}`;

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice - (i.discount || 0), 0);
    const total = subtotal - Number(discount) + Number(tax);

    const order = await prisma.order.create({
      data: {
        orderNo, distributorId: Number(distributorId),
        subtotal, discount: Number(discount), tax: Number(tax), total,
        notes, deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        items: {
          create: items.map(i => ({
            productId: Number(i.productId), quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice), discount: Number(i.discount || 0),
            total: Number(i.quantity) * Number(i.unitPrice) - Number(i.discount || 0),
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) }, data: { status },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
