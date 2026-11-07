import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const [suppliers, supplierOrders] = await Promise.all([
      prisma.supplier.findMany({
        include: {
          _count: { select: { orders: true } },
        },
      }),
      prisma.supplierOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          supplier: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true, suppliers, supplierOrders });
  } catch (error: any) {
    console.error('Suppliers API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const { poId, status, trackingNumber, notes } = await req.json();

    const updated = await prisma.supplierOrder.update({
      where: { id: poId },
      data: {
        status: status || undefined,
        trackingNumber: trackingNumber || undefined,
        notes: notes || undefined,
        dispatchedAt: status === 'DISPATCHED' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, supplierOrder: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to update supplier PO' }, { status: 500 });
  }
}

