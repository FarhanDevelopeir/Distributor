// src/main/routes/customers.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? {
          OR: [
            { customerName: { contains: search } },
            { shopName: { contains: search } },
            { phone: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: Number(limit), orderBy: { customerName: 'asc' } }),
      prisma.customer.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (_req, res) => {
  try {
    const data = await prisma.customer.findMany({
      orderBy: { customerName: 'asc' },
      select: { id: true, customerName: true, shopName: true },
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: Number(req.params.id) } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customerName, shopName, phone, address } = req.body;
    if (!customerName?.trim()) return res.status(400).json({ error: 'Customer name is required' });

    const customer = await prisma.customer.create({
      data: { customerName: customerName.trim(), shopName, phone, address },
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { customerName, shopName, phone, address } = req.body;
    if (!customerName?.trim()) return res.status(400).json({ error: 'Customer name is required' });

    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { customerName: customerName.trim(), shopName, phone, address },
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const invoiceCount = await prisma.invoice.count({ where: { customerId: id } });
    if (invoiceCount > 0) {
      return res.status(400).json({ error: 'Cannot delete customer with linked invoices' });
    }
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
