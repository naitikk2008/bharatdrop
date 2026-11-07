import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await req.json();
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Cancellation eligibility check: can only cancel before dispatched/shipped
    const nonCancellable = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (nonCancellable.includes(order.orderStatus)) {
      return NextResponse.json({
        success: false,
        error: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase().replace(/_/g, ' ')}`,
      }, { status: 400 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'CANCELLED',
        isCancelled: true,
        cancellationReason: reason || 'Customer requested cancellation',
      },
    });

    // If paid online, initiate refund record
    if (order.paymentStatus === 'PAID') {
      await prisma.refund.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          reason: `Cancellation: ${reason || 'Customer request'}`,
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'REFUNDED' },
      });
    }

    // Cancel supplier PO if pending
    await prisma.supplierOrder.updateMany({
      where: { orderId: order.id, status: 'PENDING' },
      data: { status: 'CANCELLED', notes: 'Customer cancelled order before dispatch' },
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel order' }, { status: 500 });
  }
}

