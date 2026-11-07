import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { productId, rating, comment, userName } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'Product ID, rating and comment are required' }, { status: 400 });
    }

    const numRating = Math.max(1, Math.min(5, parseInt(rating) || 5));

    let isVerified = false;
    let reviewerName = userName || 'Customer';

    if (user) {
      reviewerName = user.name;
      // Check if user bought this product
      const pastOrder = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: { userId: user.id },
        },
      });
      if (pastOrder) isVerified = true;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user ? user.id : (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))?.id || 'guest',
        userName: reviewerName,
        rating: numRating,
        comment: comment.trim(),
        isVerifiedPurchase: isVerified,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}

