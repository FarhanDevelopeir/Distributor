// prisma/seed.js
// Run with: node prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DMS database...');

  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.company.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.salesman.deleteMany();
  await prisma.deliveryPerson.deleteMany();

  const company1 = await prisma.company.create({
    data: {
      name: 'Nestle Pakistan',
      ownerName: 'Ahmed Khan',
      phone: '0300-1112233',
      address: 'Industrial Area, Karachi',
      notes: 'Primary beverage supplier',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Unilever Foods',
      ownerName: 'Sara Malik',
      phone: '0321-4455667',
      address: 'Ferozepur Road, Lahore',
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: 'Mineral Water 500ml',
      companyId: company1.id,
      purchasePrice: 280,
      salePrice: 350,
      stockQuantity: 450,
      unitType: 'carton',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Energy Drink 250ml',
      companyId: company1.id,
      purchasePrice: 960,
      salePrice: 1200,
      stockQuantity: 100,
      unitType: 'carton',
    },
  });

  await prisma.product.create({
    data: {
      name: 'Tea Bags Premium',
      companyId: company2.id,
      purchasePrice: 480,
      salePrice: 600,
      stockQuantity: 80,
      unitType: 'box',
    },
  });

  const salesman = await prisma.salesman.create({
    data: {
      fullName: 'Ali Hassan',
      phone: '0333-9876543',
      address: 'Gulberg, Lahore',
      commissionPercentage: 5,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      customerName: 'Rashid Ahmed',
      shopName: 'Ahmed General Store',
      phone: '0345-1122334',
      address: 'Model Town, Lahore',
    },
  });

  const deliveryPerson = await prisma.deliveryPerson.create({
    data: {
      fullName: 'Bilal Ahmed',
      phone: '0301-7788990',
      address: 'Johar Town, Lahore',
      vehicleNo: 'LEA-4521',
      notes: 'Handles city deliveries',
    },
  });

  const line1Total = 50 * 350;
  const line1Profit = 50 * (350 - 280);
  const line2Total = 20 * 1200;
  const line2Profit = 20 * (1200 - 960);
  const subtotal = line1Total + line2Total;
  const totalProfit = line1Profit + line2Profit;
  const commission = totalProfit * (salesman.commissionPercentage / 100);

  await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-000001',
      customerId: customer.id,
      salesmanId: salesman.id,
      deliveryPersonId: deliveryPerson.id,
      subtotal,
      total: subtotal,
      totalProfit,
      commission,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 50,
            unitPrice: 350,
            purchasePrice: 280,
            lineTotal: line1Total,
            lineProfit: line1Profit,
          },
          {
            productId: product2.id,
            quantity: 20,
            unitPrice: 1200,
            purchasePrice: 960,
            lineTotal: line2Total,
            lineProfit: line2Profit,
          },
        ],
      },
    },
  });

  await prisma.stockLog.createMany({
    data: [
      { productId: product1.id, type: 'in', quantity: 500, reason: 'Initial stock' },
      { productId: product1.id, type: 'out', quantity: 50, reason: 'Invoice INV-000001' },
      { productId: product2.id, type: 'in', quantity: 120, reason: 'Initial stock' },
      { productId: product2.id, type: 'out', quantity: 20, reason: 'Invoice INV-000001' },
    ],
  });

  console.log('✅ Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
