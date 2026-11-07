import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
    } = body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
      return NextResponse.json({ success: false, error: 'Missing required order details' }, { status: 400 });
    }

    // 1. Fetch live products from DB to verify price & stock (Never trust frontend prices)
    const skus = items.map((i: any) => i.sku);
    const dbProducts = await prisma.product.findMany({
      where: { sku: { in: skus } },
      include: { supplierCosts: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.sku, p]));

    let subtotal = 0;
    let totalSupplierCost = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const dbProd = productMap.get(item.sku);
      if (!dbProd) {
        return NextResponse.json({ success: false, error: `Product SKU ${item.sku} not found` }, { status: 400 });
      }

      const itemQty = Math.max(1, parseInt(item.quantity) || 1);
      const itemPrice = dbProd.sellingPrice;
      const itemTotal = itemPrice * itemQty;
      subtotal += itemTotal;

      const supCost = dbProd.supplierCosts[0]?.costPrice || 0;
      totalSupplierCost += supCost * itemQty;

      orderItemsData.push({
        productId: dbProd.id,
        sku: dbProd.sku,
        productName: dbProd.name,
        quantity: itemQty,
        price: itemPrice,
        total: itemTotal,
      });
    }

    // 2. Shipping calculation (Free if >= ₹499, else ₹49)
    const freeThresholdSetting = await prisma.websiteSetting.findUnique({ where: { key: 'free_shipping_threshold' } });
    const standardShippingSetting = await prisma.websiteSetting.findUnique({ where: { key: 'standard_shipping_charge' } });

    const threshold = parseFloat(freeThresholdSetting?.value || '499');
    const standardFee = parseFloat(standardShippingSetting?.value || '49');
    const shippingFee = subtotal >= threshold ? 0 : standardFee;

    // 3. Coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
      if (coupon && coupon.isActive && (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)) {
        if (coupon.discountType === 'PERCENT') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else {
          discount = coupon.discountValue;
        }
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discount);
    const orderNumber = `BD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create Order in Database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || `${customerPhone}@bharatdrop.in`,
        customerPhone: customerPhone.trim(),
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        orderStatus: 'ORDER_PLACED',
        subtotal,
        shippingFee,
        discount,
        totalAmount,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 5. Automatically create Supplier Fulfillment record
    const deodapSupplier = await prisma.supplier.findUnique({ where: { code: 'DEODAP' } });
    if (deodapSupplier) {
      await prisma.supplierOrder.create({
        data: {
          poNumber: `PO-${orderNumber}`,
          supplierId: deodapSupplier.id,
          orderId: order.id,
          status: 'PENDING',
          totalCost: totalSupplierCost,
          notes: `Supplier fulfillment request for Order ${orderNumber}. Line items: ${orderItemsData.length}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to place order. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    let whereClause: any = {};
    if (user) {
      whereClause.OR = [
        { userId: user.id },
        { customerEmail: user.email },
      ];
    } else if (phone) {
      whereClause.customerPhone = phone;
    } else if (email) {
      whereClause.customerEmail = email;
    } else {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        shipments: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

