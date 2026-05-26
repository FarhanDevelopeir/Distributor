// src/main/routes/payments.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { distributorId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = distributorId ? { distributorId: Number(distributorId) } : {};
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { distributor: { select: { name: true, code: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
    res.json({ data, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { distributorId, orderId, amount, method, reference, paymentDate, notes } = req.body;
    const count = await prisma.payment.count();
    const paymentNo = `PAY-${String(count + 1).padStart(6, '0')}`;
    const payment = await prisma.payment.create({
      data: {
        paymentNo, distributorId: Number(distributorId),
        orderId: orderId ? Number(orderId) : null,
        amount: Number(amount), method, reference, notes,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
