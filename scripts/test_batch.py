import pymupdf
import re
import os
import json
import csv

pdf_path = r"C:\Users\punja\Downloads\All Products-29-8-26.pdf"
doc = pymupdf.open(pdf_path)

output_img_dir = r"C:\Users\punja\Desktop\MR-AI3\public\products\images"
os.makedirs(output_img_dir, exist_ok=True)

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
        raw_price = supplier_cost * 2.2
    elif supplier_cost <= 150:
        raw_price = supplier_cost * 1.9
    elif supplier_cost <= 300:
        raw_price = supplier_cost * 1.7
    elif supplier_cost <= 600:
        raw_price = supplier_cost * 1.5
    else:
        raw_price = supplier_cost * 1.4
    # Round to 9-ending Indian pricing
    rounded = round(raw_price / 10) * 10 - 1
    if rounded <= supplier_cost:
        rounded = supplier_cost + 49
    return int(rounded)

def clean_title(raw_name):
    clean = re.sub(r'^[A-Za-z0-9]+_', '', raw_name)
    clean = clean.replace('_', ' ').strip()
    words = clean.split()
    return " ".join([w.capitalize() for w in words])

test_pages = range(3, 8) # Pages 4 to 8
sample_products = []

for page_idx in test_pages:
    page_num = page_idx + 1
    page = doc[page_idx]
    
    # Header Category
    blocks = page.get_text("blocks")
    header_texts = []
    content_blocks = []
    for b in blocks:
        t = b[4].strip()
        if not t or "DEODAP WHOLESALE" in t or "Page " in t:
            continue
        if b[1] < 100:
            header_texts.extend([l.strip() for l in t.split("\n") if l.strip()])
        else:
            content_blocks.append(b)
            
    category = header_texts[0].title() if header_texts else "General"
    
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
        
        price_match = re.search(r'Price\s*:\s*(\d+(?:\.\d+)?)', full_text, re.IGNORECASE)
        supplier_price = float(price_match.group(1)) if price_match else None
        
        raw_name = re.sub(r'Price\s*:\s*\d+(?:\.\d+)?.*', '', full_text, flags=re.IGNORECASE).strip()
        raw_name = re.sub(r'\s+', ' ', raw_name)
        
        sku_match = re.match(r'^([A-Za-z0-9]+)_', raw_name)
        sku = sku_match.group(1) if sku_match else (raw_name.split()[0] if raw_name else f"P{page_num}_{r}_{c}")
        
        title = clean_title(raw_name) if raw_name else f"Product {sku}"
        selling_price = calculate_selling_price(supplier_price)
        
        # Save image clip
        img_filename = f"{sku}.jpg"
        img_path = os.path.join(output_img_dir, img_filename)
        has_image = False
        if img_info:
            bbox = pymupdf.Rect(img_info['bbox'])
            pix = page.get_pixmap(clip=bbox, dpi=150)
            pix.save(img_path)
            has_image = True
            
        sample_products.append({
            "sku": sku,
            "title": title,
            "raw_name": raw_name,
            "category": category,
            "supplier_price": supplier_price,
            "selling_price": selling_price,
            "image": f"/products/images/{img_filename}" if has_image else None,
            "page": page_num
        })

print(f"Extracted {len(sample_products)} sample products from 5 pages.")
for p in sample_products[:4]:
    print(p)

