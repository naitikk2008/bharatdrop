import pymupdf
import re
import os
import json
import csv
import sys
import time

def main():
    t_start = time.time()
    pdf_path = r"C:\Users\punja\Downloads\All Products-29-8-26.pdf"
    output_dir = r"C:\Users\punja\Desktop\MR-AI3"
    data_dir = os.path.join(output_dir, "data")
    img_dir = os.path.join(output_dir, "public", "products", "images")
    
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(img_dir, exist_ok=True)
    
    doc = pymupdf.open(pdf_path)
    total_pages = len(doc)
    print(f"[{time.strftime('%X')}] Starting full catalogue extraction for {total_pages} pages...", flush=True)

    # 4 column slots (width ~595.3 pt)
    col_ranges = [(0, 155), (155, 295), (295, 435), (435, 600)]
    row_ranges = [(100, 330), (330, 550), (550, 780)]

    def get_slot(bbox):
        cx = (bbox[0] + bbox[2]) / 2
        cy = (bbox[1] + bbox[3]) / 2
        c_idx = -1
        for i, (min_x, max_x) in enumerate(col_ranges):
            if min_x <= cx <= max_x:
                c_idx = i
                break
        r_idx = -1
        for j, (min_y, max_y) in enumerate(row_ranges):
            if min_y <= cy <= max_y:
                r_idx = j
                break
        return r_idx, c_idx

    def calculate_selling_price(supplier_cost):
        if not supplier_cost or supplier_cost <= 0:
            return 0
        if supplier_cost <= 50:
            raw = supplier_cost * 2.2
        elif supplier_cost <= 150:
            raw = supplier_cost * 1.9
        elif supplier_cost <= 300:
            raw = supplier_cost * 1.7
        elif supplier_cost <= 600:
            raw = supplier_cost * 1.5
        else:
            raw = supplier_cost * 1.4
        # Indian retail psychological pricing ending in 9 (e.g. 99, 149, 199, 299)
        rounded = round(raw / 10) * 10 - 1
        if rounded <= supplier_cost:
            rounded = supplier_cost + 49
        return int(rounded)

    def clean_title(raw_name):
        clean = re.sub(r'^[A-Za-z0-9]+_', '', raw_name)
        clean = clean.replace('_', ' ').strip()
        words = clean.split()
        return " ".join([w.capitalize() for w in words])

    def extract_specs(raw_name, category):
        specs = {
            "Brand": "DeoDap / Wholesale Verified",
            "Category": category,
            "Country of Origin": "India",
            "Return Policy": "7 Days Easy Replacement for Damaged/Defective Items",
            "Delivery Time": "3-7 Business Days across India",
            "Condition": "Brand New / Wholesale Fresh Stock"
        }
        # Check size or quantity in raw name
        qty_match = re.search(r'(\d+)\s*(?:pc|pcs|pack|set|no\d+)', raw_name, re.IGNORECASE)
        if qty_match:
            specs["Quantity / Pack"] = qty_match.group(0).upper()
            
        dim_match = re.search(r'(\d+x\d+)\s*(?:cm|inch|mm)?', raw_name, re.IGNORECASE)
        if dim_match:
            specs["Dimensions"] = dim_match.group(0)
            
        vol_match = re.search(r'(\d+)\s*(?:ml|ltr|l|kg|gm|g)', raw_name, re.IGNORECASE)
        if vol_match:
            specs["Capacity / Weight"] = vol_match.group(0).upper()
            
        return specs

    all_products = []
    seen_skus = {}
    import_errors = []
    missing_info = []
    categories_found = set()
    current_category = "General"

    # Pages 4 to 440 (0-indexed 3 to 439)
    start_page = 3
    end_page = total_pages - 1 # Last page (440) is back cover

    for page_idx in range(start_page, end_page):
        page_num = page_idx + 1
        page = doc[page_idx]

        # 1. Header category extraction
        blocks = page.get_text("blocks")
        header_texts = []
        content_blocks = []
        for b in blocks:
            t = b[4].strip()
            if not t or "DEODAP WHOLESALE" in t or "Page " in t:
                continue
            if b[1] < 100:
                lines = [l.strip() for l in t.split("\n") if l.strip()]
                header_texts.extend(lines)
            else:
                content_blocks.append(b)

        if header_texts:
            current_category = header_texts[0].title()
            categories_found.add(current_category)

        # 2. Extract images on page
        images = page.get_image_info(xrefs=False)
        valid_images = [img for img in images if 100 <= img['bbox'][1] and img['bbox'][3] <= 750]

        slot_images = {}
        for img in valid_images:
            r, c = get_slot(img['bbox'])
            if r != -1 and c != -1:
                slot_images[(r, c)] = img

        slot_text = {}
        for b in content_blocks:
            r, c = get_slot(b[:4])
            if r != -1 and c != -1:
                slot_text.setdefault((r, c), []).append(b)

        all_slots = sorted(list(set(list(slot_images.keys()) + list(slot_text.keys()))))

        for (r, c) in all_slots:
            img_info = slot_images.get((r, c))
            t_blocks = slot_text.get((r, c), [])
            t_blocks = sorted(t_blocks, key=lambda b: b[1])
            full_text = " ".join([b[4].replace("\n", " ").strip() for b in t_blocks])

            # Extract supplier price
            price_match = re.search(r'Price\s*:\s*(\d+(?:\.\d+)?)', full_text, re.IGNORECASE)
            supplier_price = float(price_match.group(1)) if price_match else None

            # Extract raw name
            raw_name = re.sub(r'Price\s*:\s*\d+(?:\.\d+)?.*', '', full_text, flags=re.IGNORECASE).strip()
            raw_name = re.sub(r'\s+', ' ', raw_name)

            if not raw_name and not supplier_price and not img_info:
                continue

            # Extract SKU
            sku_match = re.match(r'^([A-Za-z0-9]+)_', raw_name)
            if sku_match:
                base_sku = sku_match.group(1)
            elif raw_name:
                base_sku = raw_name.split()[0].replace('/', '_').replace('\\', '_')
            else:
                base_sku = f"P{page_num}_{r}_{c}"

            # Check for duplicate SKU
            if base_sku in seen_skus:
                seen_skus[base_sku] += 1
                unique_sku = f"{base_sku}_v{seen_skus[base_sku]}"
                import_errors.append({
                    "type": "duplicate_sku_disambiguated",
                    "original_sku": base_sku,
                    "assigned_sku": unique_sku,
                    "page": page_num,
                    "raw_name": raw_name
                })
            else:
                seen_skus[base_sku] = 1
                unique_sku = base_sku

            title = clean_title(raw_name) if raw_name else f"{current_category} Item {unique_sku}"
            selling_price = calculate_selling_price(supplier_price)
            specs = extract_specs(raw_name, current_category)

            # Image extraction
            img_filename = f"{unique_sku}.jpg"
            img_relative_path = f"/products/images/{img_filename}"
            img_full_path = os.path.join(img_dir, img_filename)
            has_image = False

            if img_info:
                try:
                    bbox = pymupdf.Rect(img_info['bbox'])
                    pix = page.get_pixmap(clip=bbox, dpi=150)
                    pix.save(img_full_path)
                    has_image = True
                except Exception as e:
                    import_errors.append({
                        "type": "image_render_error",
                        "sku": unique_sku,
                        "page": page_num,
                        "error": str(e)
                    })

            # Check missing or unclear information
            status = "DRAFT"
            needs_review_reasons = []

            if not has_image:
                needs_review_reasons.append("Missing product image in PDF slot")
            if supplier_price is None or supplier_price <= 0:
                needs_review_reasons.append("Missing or unverified supplier price")
            if not raw_name:
                needs_review_reasons.append("Missing raw product name")

            if needs_review_reasons:
                missing_info.append({
                    "sku": unique_sku,
                    "title": title,
                    "page": page_num,
                    "reasons": needs_review_reasons
                })

            prod_record = {
                "sku": unique_sku,
                "name": title,
                "raw_name": raw_name,
                "category": current_category,
                "supplier_cost": supplier_price if supplier_price else 0.0,
                "selling_price": selling_price,
                "mrp": int(selling_price * 1.35) if selling_price else 0, # Strikethrough MRP for Indian e-commerce
                "discount_percent": 26 if selling_price else 0,
                "stock": 50, # Initial wholesale stock estimate
                "status": status, # Always DRAFT initially as per rule
                "is_approved": False,
                "image_url": img_relative_path if has_image else "/products/images/placeholder.jpg",
                "has_image": has_image,
                "page": page_num,
                "specifications": specs,
                "description": f"High quality {title} from {current_category} collection. Tested for durability and wholesale performance.",
                "supplier_name": "DeoDap Wholesale",
                "supplier_sku": base_sku
            }
            all_products.append(prod_record)

        if page_num % 10 == 0 or page_num == end_page:
            elapsed = time.time() - t_start
            print(f"[{time.strftime('%X')}] Processed Page {page_num}/{total_pages} | Products extracted: {len(all_products)} | Categories: {len(categories_found)} | Elapsed: {elapsed:.1f}s", flush=True)

    print(f"[{time.strftime('%X')}] Extraction complete! Total products: {len(all_products)}", flush=True)

    # 1. Save JSON database seed
    json_path = os.path.join(data_dir, "products.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
    print(f"Saved database JSON records: {json_path}")

    # 2. Save CSV import file
    csv_path = os.path.join(data_dir, "products_import.csv")
    csv_fields = [
        "sku", "name", "category", "supplier_cost", "selling_price", "mrp",
        "discount_percent", "stock", "status", "is_approved", "image_url",
        "has_image", "page", "supplier_name", "supplier_sku", "raw_name"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(all_products)
    print(f"Saved product import CSV: {csv_path}")

    # 3. Save Import Error Report
    errors_path = os.path.join(data_dir, "import_errors.json")
    with open(errors_path, "w", encoding="utf-8") as f:
        json.dump(import_errors, f, indent=2)
    print(f"Saved import errors report: {errors_path}")

    # 4. Save Missing Info Report
    missing_path = os.path.join(data_dir, "missing_info.json")
    with open(missing_path, "w", encoding="utf-8") as f:
        json.dump(missing_info, f, indent=2)
    print(f"Saved missing information report: {missing_path}")

    # 5. Save Category Summary
    cat_summary = {}
    for p in all_products:
        cat = p["category"]
        cat_summary[cat] = cat_summary.get(cat, 0) + 1
    with open(os.path.join(data_dir, "categories_summary.json"), "w", encoding="utf-8") as f:
        json.dump(cat_summary, f, indent=2)

    total_time = time.time() - t_start
    print(f"\n================ SUMMARY ================")
    print(f"Total Pages Processed: {end_page - start_page}")
    print(f"Total Products Extracted: {len(all_products)}")
    print(f"Total Unique Categories: {len(categories_found)}")
    print(f"Products with Images: {sum(1 for p in all_products if p['has_image'])}")
    print(f"Products with Valid Supplier Price: {sum(1 for p in all_products if p['supplier_cost'] > 0)}")
    print(f"Import Errors / Disambiguations: {len(import_errors)}")
    print(f"Items Missing Info (for Admin Review): {len(missing_info)}")
    print(f"Total Time Taken: {total_time:.2f} seconds ({total_time/60:.2f} minutes)")
    print("=========================================\n")

if __name__ == "__main__":
    main()
