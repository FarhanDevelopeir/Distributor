// src/main/routes/companies.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { ownerName: { contains: search } },
            { phone: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (_req, res) => {
  try {
    const data = await prisma.company.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: Number(req.params.id) },
      include: { products: true },
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, ownerName, phone, address, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Company name is required' });

    const company = await prisma.company.create({
      data: { name: name.trim(), ownerName, phone, address, notes },
    });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, ownerName, phone, address, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Company name is required' });

    const company = await prisma.company.update({
      where: { id: Number(req.params.id) },
      data: { name: name.trim(), ownerName, phone, address, notes },
    });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const productCount = await prisma.product.count({ where: { companyId: id } });
    if (productCount > 0) {
      return res.status(400).json({ error: 'Cannot delete company with linked products' });
    }
    await prisma.company.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
