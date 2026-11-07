import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const sku = params.sku;

    const product = await prisma.product.findUnique({
      where: { sku },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        categoryName: true,
        sellingPrice: true,
        mrp: true,
        discountPercent: true,
        stock: true,
        status: true,
        isApproved: true,
        isFeatured: true,
        isTrending: true,
        isBestSeller: true,
        imageUrl: true,
        hasImage: true,
        specifications: true,
        createdAt: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            userName: true,
            rating: true,
            comment: true,
            isVerifiedPurchase: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Fetch related products in same category
    const related = await prisma.product.findMany({
      where: {
        categoryName: product.categoryName,
        sku: { not: product.sku },
        isApproved: true,
      },
      take: 4,
      select: {
        id: true,
        sku: true,
        name: true,
        categoryName: true,
        sellingPrice: true,
        mrp: true,
        discountPercent: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      related,
    });
  } catch (error: any) {
    console.error('Single product API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch product details' }, { status: 500 });
  }
}

