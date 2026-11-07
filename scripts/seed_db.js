const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeder ---');

  // 1. Seed Website Settings
  console.log('Seeding Website Settings...');
  const defaultSettings = [
    { key: 'store_name', value: 'BharatDrop', description: 'Store Name' },
    { key: 'store_tagline', value: 'India\'s Premier Direct-From-Supplier Dropship Store', description: 'Tagline' },
    { key: 'free_shipping_threshold', value: '499', description: 'Order total for free delivery in INR' },
    { key: 'standard_shipping_charge', value: '49', description: 'Standard shipping charge' },
    { key: 'default_markup_percent', value: '75', description: 'Default dropship markup percentage' },
    { key: 'cod_enabled', value: 'true', description: 'Enable Cash on Delivery' },
    { key: 'razorpay_enabled', value: 'true', description: 'Enable Razorpay Payments' },
    { key: 'announcement_text', value: '🇮🇳 Festive Sale Live! Free Delivery on orders above ₹499 | Cash on Delivery Available', description: 'Announcement bar' },
  ];

  for (const s of defaultSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Seed Default Supplier (DeoDap)
  console.log('Seeding Supplier Record...');
  const supplier = await prisma.supplier.upsert({
    where: { code: 'DEODAP' },
    update: {},
    create: {
      name: 'DeoDap Wholesale',
      code: 'DEODAP',
      contactName: 'Supplier Direct Team',
      email: 'care@deodap.com',
      phone: '+91 96246 66631',
      address: 'Rajkot, Gujarat, India',
      website: 'https://deodap.in',
      status: 'ACTIVE',
    },
  });

  // 3. Seed Super Admin Account
  console.log('Seeding Super Admin...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@BharatDrop2026!', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bharatdrop.in' },
    update: {
      role: 'SUPER_ADMIN',
      passwordHash,
    },
    create: {
      name: 'Store Owner',
      email: 'admin@bharatdrop.in',
      phone: '9876543210',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      permissions: 'SUPER_ADMIN_ALL',
    },
  });

  // 4. Seed Categories
  console.log('Seeding Categories...');
  const catSummaryPath = path.join(__dirname, '..', 'data', 'categories_summary.json');
  const catSummary = JSON.parse(fs.readFileSync(catSummaryPath, 'utf-8'));

  for (const [catName, count] of Object.entries(catSummary)) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.category.upsert({
      where: { name: catName },
      update: { productCount: count },
      create: {
        name: catName,
        slug,
        description: `Explore premium wholesale dropshipping deals in ${catName}.`,
        image: `/products/images/${slug}.jpg`,
        productCount: count,
      },
    });
  }

  // 5. Seed Coupons
  console.log('Seeding Promotional Coupons...');
  const coupons = [
    { code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 299, maxDiscount: 100 },
    { code: 'BHARAT100', discountType: 'FIXED', discountValue: 100, minOrderAmount: 799 },
    { code: 'FREESHIP', discountType: 'FIXED', discountValue: 49, minOrderAmount: 199 },
  ];
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // 6. Seed Catalogue Products & Private Supplier Costs
  console.log('Loading 4,889 extracted products from data/products.json...');
  const productsPath = path.join(__dirname, '..', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

  console.log(`Read ${products.length} products. Inserting in batches...`);
  const batchSize = 100;
  let inserted = 0;

  // Let's mark the first 250 products across diverse categories as APPROVED so that the storefront is immediately full of live products, while all other products remain DRAFT for admin review!
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    for (const p of batch) {
      const isApprovedInitially = (inserted < 200) || (inserted % 10 === 0); // ~700 approved, remainder draft for owner review
      const slug = `${p.sku}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`.slice(0, 100);

      try {
        const productRecord = await prisma.product.upsert({
          where: { sku: p.sku },
          update: {
            name: p.name,
            sellingPrice: p.selling_price,
            mrp: p.mrp,
            discountPercent: p.discount_percent,
            categoryName: p.category,
            imageUrl: p.image_url,
            isApproved: isApprovedInitially,
            status: isApprovedInitially ? 'APPROVED' : 'DRAFT',
            isFeatured: inserted < 20,
            isTrending: inserted >= 20 && inserted < 50,
            isBestSeller: inserted >= 50 && inserted < 80,
          },
          create: {
            sku: p.sku,
            name: p.name,
            slug,
            description: p.description,
            categoryName: p.category,
            sellingPrice: p.selling_price,
            mrp: p.mrp,
            discountPercent: p.discount_percent,
            stock: p.stock || 50,
            status: isApprovedInitially ? 'APPROVED' : 'DRAFT',
            isApproved: isApprovedInitially,
            isFeatured: inserted < 20,
            isTrending: inserted >= 20 && inserted < 50,
            isBestSeller: inserted >= 50 && inserted < 80,
            hasImage: p.has_image,
            imageUrl: p.image_url,
            specifications: JSON.stringify(p.specifications),
            rawName: p.raw_name,
            pageNumber: p.page,
            supplierName: p.supplier_name,
          },
        });

        // Insert strictly separated Supplier Cost
        await prisma.supplierCost.create({
          data: {
            productId: productRecord.id,
            supplierId: supplier.id,
            costPrice: p.supplier_cost,
            moq: 1,
            isVerified: true,
            lastVerifiedAt: new Date(),
          },
        });

        inserted++;
      } catch (err) {
        // Continue if duplicate or constraint
      }
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= products.length) {
      console.log(`Seeded ${inserted}/${products.length} products...`);
    }
  }

  console.log(`--- Seeding Complete! Total products inserted: ${inserted} ---`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

