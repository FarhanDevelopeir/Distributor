// src/main/routes/distributors.js

const router = require('express').Router();
const prisma = require('../db');

// GET /api/distributors
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.distributor.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' } }),
      prisma.distributor.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/distributors/:id
router.get('/:id', async (req, res) => {
  try {
    const distributor = await prisma.distributor.findUnique({
      where: { id: Number(req.params.id) },
      include: { orders: { take: 10, orderBy: { createdAt: 'desc' } }, payments: { take: 10 } },
    });
    if (!distributor) return res.status(404).json({ error: 'Not found' });
    res.json(distributor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/distributors
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, city, region, creditLimit } = req.body;
    const count = await prisma.distributor.count();
    const code = `DIST-${String(count + 1).padStart(4, '0')}`;
    const distributor = await prisma.distributor.create({
      data: { code, name, email, phone, address, city, region, creditLimit: Number(creditLimit) || 0 },
    });
    res.status(201).json(distributor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/distributors/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, city, region, creditLimit, status } = req.body;
    const distributor = await prisma.distributor.update({
      where: { id: Number(req.params.id) },
      data: { name, email, phone, address, city, region, creditLimit: Number(creditLimit), status },
    });
    res.json(distributor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/distributors/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.distributor.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
