// prisma/seed.js
// Run with: node prisma/seed.js
// Seeds the local SQLite database with sample data for testing

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DMS database...');

  // ── Distributors ────────────────────────────────────────────────────────────
  const distributors = await Promise.all([
    prisma.distributor.upsert({
      where: { code: 'DIST-0001' },
      update: {},
      create: { code: 'DIST-0001', name: 'Alpha Traders Pvt Ltd', email: 'alpha@example.com', phone: '0300-1234567', city: 'Karachi', region: 'South', creditLimit: 500000, status: 'active' },
    }),
    prisma.distributor.upsert({
      where: { code: 'DIST-0002' },
      update: {},
      create: { code: 'DIST-0002', name: 'Beta Distribution Co.', email: 'beta@example.com', phone: '0321-7654321', city: 'Lahore', region: 'North', creditLimit: 300000, status: 'active' },
    }),
    prisma.distributor.upsert({
      where: { code: 'DIST-0003' },
      update: {},
      create: { code: 'DIST-0003', name: 'Gamma Wholesale', phone: '0333-9876543', city: 'Islamabad', region: 'North', creditLimit: 200000, status: 'active' },
    }),
  ]);

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'SKU-00001' },
      update: {},
      create: { sku: 'SKU-00001', name: 'Mineral Water 500ml', category: 'Beverages', unit: 'carton', costPrice: 280, salePrice: 350, stock: 500, minStock: 50 },
    }),
    prisma.product.upsert({
      where: { sku: 'SKU-00002' },
      update: {},
      create: { sku: 'SKU-00002', name: 'Energy Drink 250ml', category: 'Beverages', unit: 'carton', costPrice: 960, salePrice: 1200, stock: 120, minStock: 20 },
    }),
    prisma.product.upsert({
      where: { sku: 'SKU-00003' },
      update: {},
      create: { sku: 'SKU-00003', name: 'Biscuits Chocolate', category: 'Snacks', unit: 'box', costPrice: 480, salePrice: 600, stock: 8, minStock: 30 },
    }),
  ]);

  // ── Sample Order ─────────────────────────────────────────────────────────────
  const existingOrder = await prisma.order.findUnique({ where: { orderNo: 'ORD-000001' } });
  if (!existingOrder) {
    await prisma.order.create({
      data: {
        orderNo: 'ORD-000001',
        distributorId: distributors[0].id,
        status: 'delivered',
        subtotal: 43500,
        discount: 2000,
        tax: 0,
        total: 41500,
        items: {
          create: [
            { productId: products[0].id, quantity: 50, unitPrice: 350, discount: 0, total: 17500 },
            { productId: products[1].id, quantity: 20, unitPrice: 1200, discount: 2000, total: 22000 },
          ],
        },
      },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
