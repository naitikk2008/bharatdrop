import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const sort = searchParams.get('sort') || 'popular';
    const filter = searchParams.get('filter') || ''; // featured, trending, best_seller, under199, under499
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(60, Math.max(1, parseInt(searchParams.get('limit') || '24')));
    const skip = (page - 1) * limit;

    const where: any = {
      isApproved: true,
      status: 'APPROVED',
      sellingPrice: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { categoryName: { contains: q } },
        { rawName: { contains: q } },
      ];
    }

    if (category && category !== 'All') {
      where.categoryName = category;
    }

    if (filter === 'featured') where.isFeatured = true;
    if (filter === 'trending') where.isTrending = true;
    if (filter === 'best_seller') where.isBestSeller = true;
    if (filter === 'under199') where.sellingPrice = { lte: 199 };
    if (filter === 'under499') where.sellingPrice = { lte: 499 };

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
    if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    if (sort === 'discount') orderBy = { discountPercent: 'desc' };

    // STRICT: Select only customer safe fields - NO supplier cost!
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          categoryName: true,
          sellingPrice: true,
          mrp: true,
          discountPercent: true,
          stock: true,
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          imageUrl: true,
          hasImage: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

