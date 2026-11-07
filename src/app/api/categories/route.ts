import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { loadCategoriesFromFile } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

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

    if (categories && categories.length > 0) {
      return NextResponse.json({ success: true, categories });
    }

    const fallbackCats = loadCategoriesFromFile();
    return NextResponse.json({ success: true, categories: fallbackCats });
  } catch (error: any) {
    console.warn('Prisma categories query failed, using fallback:', error?.message);
    const fallbackCats = loadCategoriesFromFile();
    return NextResponse.json({ success: true, categories: fallbackCats });
  }
}
