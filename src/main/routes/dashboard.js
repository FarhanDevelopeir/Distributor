// src/main/routes/dashboard.js

const router = require('express').Router();
const prisma = require('../db');

router.get('/summary', async (_req, res) => {
  try {
    const [
      totalCompanies,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      totalSalesmen,
      totalInvoices,
      recentInvoices,
      monthlySales,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: { lte: 10 } } }),
      prisma.customer.count(),
      prisma.salesman.count(),
      prisma.invoice.count(),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerName: true, shopName: true } },
          salesman: { select: { fullName: true } },
        },
      }),
      prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', invoiceDate) AS month,
          COUNT(*) AS invoices,
          SUM(total) AS revenue,
          SUM(totalProfit) AS profit
        FROM Invoice
        WHERE invoiceDate >= date('now', '-6 months')
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    const revenueResult = await prisma.invoice.aggregate({ _sum: { total: true, totalProfit: true } });

    res.json({
      stats: {
        totalCompanies,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        totalSalesmen,
        totalInvoices,
        totalRevenue: revenueResult._sum.total || 0,
        totalProfit: revenueResult._sum.totalProfit || 0,
      },
      recentInvoices,
      monthlySales,
    });
  } catch (err) {
    console.error('[Dashboard]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
