import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const { id, sellingPrice, mrp, stock, name, description, isApproved } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const data: any = {};
    if (sellingPrice !== undefined) data.sellingPrice = parseFloat(sellingPrice);
    if (mrp !== undefined) data.mrp = parseFloat(mrp);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (isApproved !== undefined) {
      data.isApproved = Boolean(isApproved);
      data.status = isApproved ? 'APPROVED' : 'DRAFT';
    }

    if (data.mrp && data.sellingPrice && data.mrp > data.sellingPrice) {
      data.discountPercent = Math.round(((data.mrp - data.sellingPrice) / data.mrp) * 100);
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

