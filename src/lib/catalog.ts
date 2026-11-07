import fs from 'fs';
import path from 'path';

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  sellingPrice: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  hasImage: boolean;
  imageUrl: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isApproved: boolean;
  specifications?: string;
}

let cachedProducts: CatalogProduct[] | null = null;
let cachedCategories: Array<{ id: string; name: string; slug: string; productCount: number; image?: string }> | null = null;

function loadProductsFromFile(): CatalogProduct[] {
  if (cachedProducts) return cachedProducts;
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(raw);

    cachedProducts = items.map((p: any, idx: number) => {
      const slug = `${p.sku}-${(p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)}`;
      return {
        id: `prod_${p.sku}`,
        sku: String(p.sku),
        name: p.name || 'BharatDrop Product',
        slug,
        description: p.description || '',
        categoryName: p.category || 'General',
        sellingPrice: Number(p.selling_price) || 199,
        mrp: Number(p.mrp) || Math.round((Number(p.selling_price) || 199) * 1.35),
        discountPercent: Number(p.discount_percent) || 25,
        stock: Number(p.stock) || 50,
        hasImage: Boolean(p.has_image),
        imageUrl: p.image_url || `/products/images/${p.sku}.jpg`,
        isFeatured: idx < 20,
        isTrending: idx >= 20 && idx < 50,
        isBestSeller: idx >= 50 && idx < 80,
        isApproved: true,
        specifications: typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications || {}),
      };
    });

    return cachedProducts || [];
  } catch (err) {
    console.error('Error loading fallback products:', err);
    return [];
  }
}

export function loadCategoriesFromFile() {
  if (cachedCategories) return cachedCategories;
  try {
    const summaryPath = path.join(process.cwd(), 'data', 'categories_summary.json');
    if (!fs.existsSync(summaryPath)) {
      return [];
    }
    const raw = fs.readFileSync(summaryPath, 'utf-8');
    const summary = JSON.parse(raw);

    cachedCategories = Object.entries(summary).map(([name, count], idx) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        id: `cat_${idx + 1}`,
        name,
        slug,
        productCount: Number(count),
        image: `/products/images/${slug}.jpg`,
      };
    });

    return cachedCategories || [];
  } catch (err) {
    console.error('Error loading fallback categories:', err);
    return [];
  }
}

export function filterCatalogProducts(options: {
  q?: string;
  category?: string;
  sort?: string;
  filter?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const all = loadProductsFromFile();
  const q = (options.q || '').toLowerCase().trim();
  const category = (options.category || '').trim();
  const filter = options.filter || '';
  const sort = options.sort || 'popular';
  const minPrice = options.minPrice ?? 0;
  const maxPrice = options.maxPrice ?? 999999;
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(60, Math.max(1, options.limit || 24));

  let filtered = all.filter((p) => {
    if (p.sellingPrice < minPrice || p.sellingPrice > maxPrice) return false;
    if (category && category !== 'All' && p.categoryName !== category) return false;

    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = p.categoryName.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }

    if (filter === 'featured' && !p.isFeatured) return false;
    if (filter === 'trending' && !p.isTrending) return false;
    if (filter === 'best_seller' && !p.isBestSeller) return false;
    if (filter === 'under199' && p.sellingPrice > 199) return false;
    if (filter === 'under499' && p.sellingPrice > 499) return false;

    return true;
  });

  // Sorting
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
  } else if (sort === 'discount') {
    filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    products: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function getCatalogProductBySku(sku: string) {
  const all = loadProductsFromFile();
  const target = all.find((p) => p.sku === sku || p.slug === sku);
  if (!target) return null;

  const related = all
    .filter((p) => p.categoryName === target.categoryName && p.sku !== target.sku)
    .slice(0, 8);

  return {
    ...target,
    relatedProducts: related,
  };
}
