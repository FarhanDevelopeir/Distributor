// src/main/routes/salesmen.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? {
          OR: [
            { fullName: { contains: search } },
            { phone: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.salesman.findMany({ where, skip, take: Number(limit), orderBy: { fullName: 'asc' } }),
      prisma.salesman.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (_req, res) => {
  try {
    const data = await prisma.salesman.findMany({
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, commissionPercentage: true },
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const salesman = await prisma.salesman.findUnique({ where: { id: Number(req.params.id) } });
    if (!salesman) return res.status(404).json({ error: 'Salesman not found' });
    res.json(salesman);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { fullName, phone, address, commissionPercentage } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'Full name is required' });

    const salesman = await prisma.salesman.create({
      data: {
        fullName: fullName.trim(),
        phone,
        address,
        commissionPercentage: Number(commissionPercentage) || 0,
      },
    });
    res.status(201).json(salesman);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, address, commissionPercentage } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'Full name is required' });

    const salesman = await prisma.salesman.update({
      where: { id: Number(req.params.id) },
      data: {
        fullName: fullName.trim(),
        phone,
        address,
        commissionPercentage: Number(commissionPercentage) || 0,
      },
    });
    res.json(salesman);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const invoiceCount = await prisma.invoice.count({ where: { salesmanId: id } });
    if (invoiceCount > 0) {
      return res.status(400).json({ error: 'Cannot delete salesman with linked invoices' });
    }
    await prisma.salesman.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
