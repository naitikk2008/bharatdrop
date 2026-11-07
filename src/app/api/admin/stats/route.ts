import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const [
      totalProducts,
      draftProducts,
      approvedProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      orders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isApproved: false } }),
      prisma.product.count({ where: { isApproved: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: { in: ['ORDER_PLACED', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        where: { orderStatus: { not: 'CANCELLED' } },
        include: {
          items: {
            include: {
              product: {
                include: { supplierCosts: true },
              },
            },
          },
        },
      }),
    ]);

    let totalRevenue = 0;
    let totalCost = 0;

    for (const order of orders) {
      totalRevenue += order.totalAmount;
      for (const item of order.items) {
        const itemCost = item.product?.supplierCosts[0]?.costPrice || 0;
        totalCost += itemCost * item.quantity;
      }
    }

    const estimatedProfit = Math.max(0, totalRevenue - totalCost);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        draftProducts,
        approvedProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        estimatedProfit: Math.round(estimatedProfit),
        profitMargin: totalRevenue > 0 ? Math.round((estimatedProfit / totalRevenue) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

