import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon code' }, { status: 400 });
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderAmount);

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount: Math.round(discount),
      message: `Coupon ${coupon.code} applied! Saved ₹${Math.round(discount)}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to apply coupon' }, { status: 500 });
  }
}

