import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder';

    let rzpOrderId = `rzp_mock_${Date.now()}`;

    // If real Razorpay credentials provided, create actual order with Razorpay
    if (key_id && !key_id.includes('placeholder') && key_secret && !key_secret.includes('placeholder')) {
      const razorpay = new Razorpay({ key_id, key_secret });
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(order.totalAmount * 100), // amount in paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          customerName: order.customerName,
          orderId: order.id,
        },
      });
      rzpOrderId = rzpOrder.id;
    }

    // Save Payment record in database
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'RAZORPAY_UPI',
        paymentId: rzpOrderId,
        amount: order.totalAmount,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      keyId: key_id,
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      rzpOrderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    });
  } catch (error: any) {
    console.error('Razorpay create order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to initiate payment' }, { status: 500 });
  }
}

