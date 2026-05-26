// src/main/routes/dashboard.js
// Dashboard summary stats — all computed from local SQLite

const router = require('express').Router();
const prisma = require('../db');

// GET /api/dashboard/summary
router.get('/summary', async (_req, res) => {
  try {
    const [
      totalDistributors,
      activeDistributors,
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      recentOrders,
      monthlySales,
    ] = await Promise.all([
      prisma.distributor.count(),
      prisma.distributor.count({ where: { status: 'active' } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: prisma.product.fields.minStock } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),

      // 5 most recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { distributor: { select: { name: true, code: true } } },
      }),

      // Last 6 months revenue
      prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', orderDate) AS month,
          COUNT(*) AS orders,
          SUM(total) AS revenue
        FROM "Order"
        WHERE orderDate >= date('now', '-6 months')
          AND status != 'cancelled'
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    // Total revenue (all non-cancelled orders)
    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'cancelled' } },
    });

    res.json({
      stats: {
        totalDistributors,
        activeDistributors,
        totalProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: revenueResult._sum.total || 0,
      },
      recentOrders,
      monthlySales,
    });
  } catch (err) {
    console.error('[Dashboard]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
