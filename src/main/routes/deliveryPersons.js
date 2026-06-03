// src/main/routes/deliveryPersons.js

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
            { vehicleNo: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.deliveryPerson.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { fullName: 'asc' },
        include: { _count: { select: { invoices: true } } },
      }),
      prisma.deliveryPerson.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (_req, res) => {
  try {
    const data = await prisma.deliveryPerson.findMany({
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, phone: true, vehicleNo: true },
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const deliveryPerson = await prisma.deliveryPerson.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        invoices: {
          take: 25,
          orderBy: { invoiceDate: 'desc' },
          include: {
            customer: { select: { customerName: true, shopName: true } },
            salesman: { select: { fullName: true } },
            _count: { select: { items: true } },
          },
        },
      },
    });
    if (!deliveryPerson) return res.status(404).json({ error: 'Delivery person not found' });
    res.json(deliveryPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { fullName, phone, address, vehicleNo, notes } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'Full name is required' });

    const deliveryPerson = await prisma.deliveryPerson.create({
      data: { fullName: fullName.trim(), phone, address, vehicleNo, notes },
    });
    res.status(201).json(deliveryPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, address, vehicleNo, notes } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'Full name is required' });

    const deliveryPerson = await prisma.deliveryPerson.update({
      where: { id: Number(req.params.id) },
      data: { fullName: fullName.trim(), phone, address, vehicleNo, notes },
    });
    res.json(deliveryPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const invoiceCount = await prisma.invoice.count({ where: { deliveryPersonId: id } });
    if (invoiceCount > 0) {
      return res.status(400).json({ error: 'Cannot delete delivery person with linked invoices' });
    }
    await prisma.deliveryPerson.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
