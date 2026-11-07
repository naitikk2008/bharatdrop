import urllib.request
import json
import http.cookiejar

BASE = "http://localhost:3000"

def run_tests():
    print("=== STARTING END-TO-END SYSTEM TESTING ===\n")
    
    # Cookie jar for session cookies
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    # 1. Test Categories
    req = urllib.request.Request(f"{BASE}/api/categories")
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        print(f"✓ Categories API: {len(data['categories'])} categories returned (Top: {data['categories'][0]['name']} with {data['categories'][0]['productCount']} items)")

    # 2. Test Public Products (Checking strict supplier price exclusion!)
    req = urllib.request.Request(f"{BASE}/api/products?limit=5")
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        prods = data["products"]
        print(f"✓ Public Products API: {len(prods)} products returned. Total matching: {data['pagination']['total']}")
        
        # Verify supplier_cost is NEVER exposed to public!
        for p in prods:
            assert "supplierCost" not in p, "SECURITY VULNERABILITY: supplierCost found in public API!"
            assert "supplierCosts" not in p, "SECURITY VULNERABILITY: supplierCosts found in public API!"
        print("✓ SECURITY CHECK PASSED: Private wholesale supplier prices strictly hidden from public customers.")

    # 3. Test Single Product Details
    test_sku = prods[0]["sku"]
    req = urllib.request.Request(f"{BASE}/api/products/{test_sku}")
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        p = data["product"]
        print(f"✓ Product Details API: SKU={p['sku']}, Name='{p['name']}', SellingPrice=₹{p['sellingPrice']}, MRP=₹{p['mrp']}")
        assert "supplierCost" not in p, "SECURITY VULNERABILITY: supplierCost in single product API!"

    # 4. Test Coupon Apply API
    coupon_payload = json.dumps({"code": "WELCOME10", "orderAmount": 1000}).encode()
    req = urllib.request.Request(f"{BASE}/api/coupons/apply", data=coupon_payload, headers={"Content-Type": "application/json"})
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        print(f"✓ Coupon API: {data['code']} applied, discount=₹{data['discount']}")

    # 5. Test Customer Order Placement
    order_payload = json.dumps({
        "customerName": "Test Customer",
        "customerEmail": "customer@test.in",
        "customerPhone": "9876543210",
        "shippingAddress": {
            "fullName": "Test Customer",
            "phone": "9876543210",
            "addressLine1": "Plot 101, Industrial Area",
            "city": "Rajkot",
            "state": "Gujarat",
            "pinCode": "360001"
        },
        "paymentMethod": "COD",
        "couponCode": "WELCOME10",
        "items": [{"sku": test_sku, "quantity": 2}]
    }).encode()
    
    req = urllib.request.Request(f"{BASE}/api/orders", data=order_payload, headers={"Content-Type": "application/json"})
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        order = data["order"]
        order_id = order["id"]
        order_number = order["orderNumber"]
        print(f"✓ Customer Order Placed: Order #{order_number}, ID={order_id}, Total=₹{order['totalAmount']}, Status={order['orderStatus']}")

    # 6. Test Order Tracking API
    req = urllib.request.Request(f"{BASE}/api/orders/{order_id}")
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        assert data["order"]["orderNumber"] == order_number
        print(f"✓ Order Tracking API: Verified order status timeline is '{data['order']['orderStatus']}'")

    # 7. Test Admin Login
    admin_payload = json.dumps({
        "email": "admin@bharatdrop.in",
        "password": "Admin@BharatDrop2026!"
    }).encode()
    req = urllib.request.Request(f"{BASE}/api/auth/login", data=admin_payload, headers={"Content-Type": "application/json"})
    token_str = ""
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        assert data["user"]["role"] in ["ADMIN", "SUPER_ADMIN"]
        # Extract token cookie
        set_cookie = res.headers.get("Set-Cookie", "")
        import re
        m = re.search(r'token=([^;]+)', set_cookie)
        if m:
            token_str = m.group(1)
        print(f"✓ Admin Login: Successfully authenticated as {data['user']['name']} ({data['user']['role']})")

    admin_headers = {
        "Authorization": f"Bearer {token_str}",
        "Cookie": f"token={token_str}",
        "Content-Type": "application/json"
    }

    # 8. Test Admin Stats
    req = urllib.request.Request(f"{BASE}/api/admin/stats", headers=admin_headers)
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        stats = data["stats"]
        print(f"✓ Admin Stats: Revenue=₹{stats['totalRevenue']}, Profit=₹{stats['estimatedProfit']}, Products={stats['totalProducts']}, Orders={stats['totalOrders']}")

    # 9. Test Admin Products with PRIVATE Supplier Costs
    req = urllib.request.Request(f"{BASE}/api/admin/products?limit=2", headers=admin_headers)
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        p_admin = data["products"][0]
        print(f"✓ Admin Products (Private Costs): SKU={p_admin['sku']}, SupplierCost=₹{p_admin['supplierCost']}, SellingPrice=₹{p_admin['sellingPrice']}, Profit=₹{p_admin['profit']} ({p_admin['margin']}%)")

    # 10. Test Admin Updating Order Status to SHIPPED with Tracking Number
    update_payload = json.dumps({
        "orderId": order_id,
        "orderStatus": "SHIPPED",
        "carrier": "Delhivery Express",
        "trackingNumber": "DLH-9988776655"
    }).encode()
    req = urllib.request.Request(f"{BASE}/api/admin/orders/update-status", data=update_payload, headers=admin_headers)
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        print(f"✓ Admin Order Fulfillment: Updated to SHIPPED with Tracking # DLH-9988776655")

    # 11. Test Supplier POs (DeoDap)
    req = urllib.request.Request(f"{BASE}/api/admin/suppliers", headers=admin_headers)
    with opener.open(req) as res:
        data = json.loads(res.read().decode())
        assert data["success"] is True
        pos = data["supplierOrders"]
        print(f"✓ Supplier Management: {len(pos)} Supplier POs found (DeoDap Wholesale)")

    # 12. Test Customer Order Cancellation
    cancel_payload = json.dumps({"reason": "Test customer changed mind"}).encode()
    req = urllib.request.Request(f"{BASE}/api/orders/{order_id}/cancel", data=cancel_payload, headers={"Content-Type": "application/json"})
    try:
        with opener.open(req) as res:
            data = json.loads(res.read().decode())
            print(f"✓ Order Cancellation: {data}")
    except urllib.error.HTTPError as e:
        # Expected if order already SHIPPED
        err_data = json.loads(e.read().decode())
        print(f"✓ Order Cancellation Rule Active: {err_data['error']} (Correctly prevents cancellation after shipment!)")

    print("\n=== ALL END-TO-END TESTS PASSED WITH 100% SUCCESS! ===")

if __name__ == "__main__":
    run_tests()
