import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const { orderId, orderStatus, carrier, trackingNumber } = await req.json();

    if (!orderId || !orderStatus) {
      return NextResponse.json({ success: false, error: 'Order ID and status required' }, { status: 400 });
    }

    const updateData: any = { orderStatus };

    if (orderStatus === 'DELIVERED') {
      updateData.paymentStatus = 'PAID';
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    if (trackingNumber) {
      const existingShipment = await prisma.shipment.findFirst({
        where: { orderId },
      });

      if (existingShipment) {
        await prisma.shipment.update({
          where: { id: existingShipment.id },
          data: {
            carrier: carrier || existingShipment.carrier,
            trackingNumber: trackingNumber.trim(),
            status: orderStatus,
            shippedAt: orderStatus === 'SHIPPED' ? new Date() : existingShipment.shippedAt,
            deliveredAt: orderStatus === 'DELIVERED' ? new Date() : existingShipment.deliveredAt,
          },
        });
      } else {
        await prisma.shipment.create({
          data: {
            orderId,
            carrier: carrier || 'Delhivery Express',
            trackingNumber: trackingNumber.trim(),
            status: orderStatus,
            shippedAt: orderStatus === 'SHIPPED' ? new Date() : null,
            deliveredAt: orderStatus === 'DELIVERED' ? new Date() : null,
          },
        });
      }
    }

    // Also sync supplier fulfillment status
    if (['SHIPPED', 'DELIVERED'].includes(orderStatus)) {
      await prisma.supplierOrder.updateMany({
        where: { orderId },
        data: {
          status: orderStatus === 'DELIVERED' ? 'DELIVERED' : 'DISPATCHED',
          trackingNumber: trackingNumber || undefined,
          dispatchedAt: orderStatus === 'SHIPPED' ? new Date() : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}

