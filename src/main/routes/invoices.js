// src/main/routes/invoices.js

const router = require('express').Router();
const prisma = require('../db');

async function getNextInvoiceNo(client) {
  const invoices = await client.invoice.findMany({
    select: { invoiceNo: true },
  });

  const maxNo = invoices.reduce((max, invoice) => {
    const match = /^INV-(\d+)$/.exec(invoice.invoiceNo || '');
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `INV-${String(maxNo + 1).padStart(6, '0')}`;
}

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? {
          OR: [
            { invoiceNo: { contains: search } },
            { customer: { customerName: { contains: search } } },
            { customer: { shopName: { contains: search } } },
            { salesman: { fullName: { contains: search } } },
            { deliveryPerson: { fullName: { contains: search } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { invoiceDate: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, shopName: true } },
          salesman: { select: { id: true, fullName: true } },
          deliveryPerson: { select: { id: true, fullName: true, vehicleNo: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        salesman: true,
        deliveryPerson: true,
        items: { include: { product: { include: { company: { select: { name: true } } } } } },
      },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customerId, salesmanId, deliveryPersonId, discount = 0, notes, items = [] } = req.body;

    if (!customerId) return res.status(400).json({ error: 'Customer is required' });
    if (!items.length) return res.status(400).json({ error: 'At least one product is required' });

    const productIds = items.map(i => Number(i.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    for (const item of items) {
      const product = productMap[Number(item.productId)];
      if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });
      if (product.stockQuantity < qty) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    let subtotal = 0;
    let totalProfit = 0;
    const lineItems = items.map(item => {
      const product = productMap[Number(item.productId)];
      const qty = Number(item.quantity);
      const unitPrice = Number(item.unitPrice ?? product.salePrice);
      const purchasePrice = product.purchasePrice;
      const lineTotal = qty * unitPrice;
      const lineProfit = qty * (unitPrice - purchasePrice);
      subtotal += lineTotal;
      totalProfit += lineProfit;
      return { productId: product.id, quantity: qty, unitPrice, purchasePrice, lineTotal, lineProfit };
    });

    const discountAmount = Number(discount) || 0;
    const total = Math.max(0, subtotal - discountAmount);

    let commission = 0;
    if (salesmanId) {
      const salesman = await prisma.salesman.findUnique({ where: { id: Number(salesmanId) } });
      if (salesman) commission = totalProfit * (salesman.commissionPercentage / 100);
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNo = await getNextInvoiceNo(tx);

      const created = await tx.invoice.create({
        data: {
          invoiceNo,
          customerId: Number(customerId),
          salesmanId: salesmanId ? Number(salesmanId) : null,
          deliveryPersonId: deliveryPersonId ? Number(deliveryPersonId) : null,
          subtotal,
          discount: discountAmount,
          total,
          totalProfit,
          commission,
          notes,
          items: { create: lineItems },
        },
        include: {
          customer: true,
          salesman: true,
          deliveryPerson: true,
          items: { include: { product: true } },
        },
      });

      for (const item of lineItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: 'out',
            quantity: item.quantity,
            reason: `Invoice ${invoiceNo}`,
          },
        });
      }

      return created;
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    await prisma.$transaction(async (tx) => {
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: 'in',
            quantity: item.quantity,
            reason: `Invoice ${invoice.invoiceNo} deleted — stock restored`,
          },
        });
      }
      await tx.invoice.delete({ where: { id } });
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
