import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const status = searchParams.get('status') || 'ALL'; // ALL, DRAFT, APPROVED
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status === 'DRAFT') where.isApproved = false;
    if (status === 'APPROVED') where.isApproved = true;

    if (category && category !== 'All') {
      where.categoryName = category;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { categoryName: { contains: q } },
        { rawName: { contains: q } },
      ];
    }

    // Owner-Only: include private supplierCosts!
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          supplierCosts: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      const supplierCost = p.supplierCosts[0]?.costPrice || 0;
      const profit = Math.max(0, p.sellingPrice - supplierCost);
      const margin = p.sellingPrice > 0 ? Math.round((profit / p.sellingPrice) * 100) : 0;

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        categoryName: p.categoryName,
        supplierCost, // PRIVATE FIELD
        sellingPrice: p.sellingPrice,
        mrp: p.mrp,
        discountPercent: p.discountPercent,
        stock: p.stock,
        status: p.status,
        isApproved: p.isApproved,
        imageUrl: p.imageUrl,
        pageNumber: p.pageNumber,
        profit,
        margin,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

