import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder';
    let isValid = false;

    if (key_secret && !key_secret.includes('placeholder') && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generated_signature === razorpay_signature;
    } else {
      // In development / demo test mode
      isValid = Boolean(razorpay_payment_id);
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || 'TEST_VERIFIED',
        status: 'SUCCESS',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}

