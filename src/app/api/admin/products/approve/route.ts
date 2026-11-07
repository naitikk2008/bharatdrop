import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const { productIds, action, allDrafts } = await req.json();

    if (allDrafts) {
      // Batch approve all draft products
      const count = await prisma.product.updateMany({
        where: { isApproved: false },
        data: {
          isApproved: true,
          status: 'APPROVED',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully approved ${count.count} draft products!`,
      });
    }

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ success: false, error: 'Product IDs array required' }, { status: 400 });
    }

    const isApprove = action !== 'reject';

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: {
        isApproved: isApprove,
        status: isApprove ? 'APPROVED' : 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${isApprove ? 'approved' : 'moved to draft'} ${productIds.length} products`,
    });
  } catch (error: any) {
    console.error('Approve product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update approval status' }, { status: 500 });
  }
}

