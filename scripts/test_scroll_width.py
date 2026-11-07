import subprocess
import time
import json
import urllib.request
import asyncio
import os
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9336

def start_chrome(w=375, h=800):
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--window-size={w},{h}",
        f"--remote-debugging-port={PORT}",
        "--disable-gpu",
        "--user-data-dir=C:/Users/punja/AppData/Local/Temp/chrome_scroll_profile"
    ]
    return subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

async def send_cmd(ws, method, params=None, msg_id=[1]):
    cid = msg_id[0]
    msg_id[0] += 1
    payload = {"id": cid, "method": method}
    if params:
        payload["params"] = params
    await ws.send(json.dumps(payload))
    while True:
        raw = await ws.recv()
        data = json.loads(raw)
        if data.get("id") == cid:
            return data

async def test_width(w):
    proc = start_chrome(w=w, h=800)
    time.sleep(1.8)
    try:
        new_tab_req = urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?http://localhost:3000", method="PUT")
        with urllib.request.urlopen(new_tab_req) as resp:
            tab_info = json.loads(resp.read().decode())
        ws_url = tab_info.get("webSocketDebuggerUrl")

        import websockets
        async with websockets.connect(ws_url) as ws:
            msg_id = [1]
            await send_cmd(ws, "Page.enable", msg_id=msg_id)
            await send_cmd(ws, "Runtime.enable", msg_id=msg_id)
            await asyncio.sleep(2)

            eval_script = """
            (() => {
                const docEl = document.documentElement;
                const body = document.body;
                const winW = window.innerWidth;
                const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
                const hasHScroll = scrollW > winW;
                
                const loginBtn = document.querySelector('a[href="/auth/login"]');
                const wishlistBtn = document.querySelector('a[href="/wishlist"]');
                const cartBtn = document.querySelector('a[href="/cart"]');
                const trackBtn = document.querySelector('a[href="/track/lookup"]');
                const mobileNav = document.querySelector('nav[aria-label="Mobile Navigation"]');
                const menuBtn = document.querySelector('button[aria-label="Open navigation menu"]');

                return {
                    winW,
                    scrollW,
                    hasHScroll,
                    loginVisible: loginBtn ? (loginBtn.offsetWidth > 0 && loginBtn.offsetHeight > 0) : false,
                    loginText: loginBtn ? loginBtn.innerText.trim() : null,
                    wishlistVisible: wishlistBtn ? (wishlistBtn.offsetWidth > 0) : false,
                    cartVisible: cartBtn ? (cartBtn.offsetWidth > 0) : false,
                    trackVisible: trackBtn ? (trackBtn.offsetWidth > 0) : false,
                    mobileNavVisible: mobileNav ? (mobileNav.offsetWidth > 0) : false,
                    menuVisible: menuBtn ? (menuBtn.offsetWidth > 0) : false
                };
            })()
            """
            resp = await send_cmd(ws, "Runtime.evaluate", {
                "expression": eval_script,
                "returnByValue": True
            }, msg_id=msg_id)
            val = resp.get("result", {}).get("result", {}).get("value", {})
            return val
    finally:
        proc.terminate()

async def main():
    widths = [320, 375, 390, 430]
    print("\n======================= MOBILE RESPONSIVENESS SUITE =======================")
    all_ok = True
    for w in widths:
        res = await test_width(w)
        has_overflow = res.get("hasHScroll")
        login_ok = res.get("loginVisible")
        nav_ok = res.get("mobileNavVisible")
        menu_ok = res.get("menuVisible")
        wish_ok = res.get("wishlistVisible")
        cart_ok = res.get("cartVisible")
        track_ok = res.get("trackVisible")

        passed = (not has_overflow) and login_ok and nav_ok and menu_ok and wish_ok and cart_ok and track_ok
        if not passed:
            all_ok = False

        status = "PASS" if passed else "FAIL"
        print(f"[{status}] Width: {w}px -> Viewport: {res.get('winW')}px, ScrollWidth: {res.get('scrollW')}px, Overflow: {has_overflow}")
        print(f"       Login: {login_ok} ('{res.get('loginText')}') | Nav: {nav_ok} | Menu: {menu_ok} | Wishlist: {wish_ok} | Cart: {cart_ok} | Track: {track_ok}")

    print("===========================================================================")
    if all_ok:
        print(">>> 100% SUCCESS: ZERO CLIPPING, ZERO HORIZONTAL SCROLL, ALL ELEMENTS ACCESSIBLE! <<<")
    else:
        print(">>> FAILED ON SOME CHECKS <<<")

if __name__ == "__main__":
    asyncio.run(main())
