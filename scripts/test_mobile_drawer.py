import subprocess
import time
import json
import urllib.request
import asyncio
import os
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9335
OUTPUT_DIR = r"c:\Users\punja\Desktop\MR-AI3\public\test_screenshots"

def start_chrome():
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--window-size=375,850",
        f"--remote-debugging-port={PORT}",
        "--disable-gpu",
        "--user-data-dir=C:/Users/punja/AppData/Local/Temp/chrome_drawer_profile"
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

async def run():
    proc = start_chrome()
    time.sleep(2)
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
            await asyncio.sleep(2.5)

            # 1. Click the hamburger button
            click_script = """
            (() => {
                const btn = document.querySelector('button[aria-label="Open navigation menu"]');
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            })()
            """
            click_resp = await send_cmd(ws, "Runtime.evaluate", {
                "expression": click_script,
                "returnByValue": True
            }, msg_id=msg_id)
            clicked = click_resp.get("result", {}).get("result", {}).get("value")
            print(f"Hamburger button clicked: {clicked}")

            # Wait for drawer animation
            await asyncio.sleep(1)

            # 2. Check drawer elements
            check_script = """
            (() => {
                const drawerLogin = document.querySelector('a[href="/auth/login"]');
                const drawerRegister = document.querySelector('a[href="/auth/register"]');
                const drawerTrack = document.querySelector('a[href="/track/lookup"]');
                const drawerWishlist = document.querySelector('a[href="/wishlist"]');
                const drawerCart = document.querySelector('a[href="/cart"]');
                const drawerUnder199 = document.querySelector('a[href="/shop?filter=under199"]');
                const closeBtn = document.querySelector('button[aria-label="Close menu"]');

                return {
                    drawerRegisterFound: !!drawerRegister,
                    drawerRegisterVisible: drawerRegister ? drawerRegister.offsetWidth > 0 : false,
                    drawerRegisterText: drawerRegister ? drawerRegister.innerText.trim() : null,
                    drawerLoginFound: !!drawerLogin,
                    drawerTrackFound: !!drawerTrack,
                    drawerWishlistFound: !!drawerWishlist,
                    drawerCartFound: !!drawerCart,
                    drawerUnder199Found: !!drawerUnder199,
                    closeBtnFound: !!closeBtn
                };
            })()
            """
            check_resp = await send_cmd(ws, "Runtime.evaluate", {
                "expression": check_script,
                "returnByValue": True
            }, msg_id=msg_id)
            val = check_resp.get("result", {}).get("result", {}).get("value", {})
            print("Drawer verification results:")
            print(json.dumps(val, indent=2))

            # 3. Take screenshot of open drawer
            shot_resp = await send_cmd(ws, "Page.captureScreenshot", {"format": "png"}, msg_id=msg_id)
            import base64
            img_data = base64.b64decode(shot_resp["result"]["data"])
            shot_file = os.path.join(OUTPUT_DIR, "mobile_drawer_open.png")
            with open(shot_file, "wb") as f:
                f.write(img_data)
            print(f"Captured open mobile drawer screenshot: {shot_file} ({len(img_data)} bytes)")

    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(run())

