import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { productCount: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        productCount: true,
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Categories API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

