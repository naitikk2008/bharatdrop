import subprocess
import time
import json
import urllib.request
import asyncio
import os
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9334

def start_chrome(w=320, h=800):
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--window-size={w},{h}",
        f"--remote-debugging-port={PORT}",
        "--disable-gpu",
        "--user-data-dir=C:/Users/punja/AppData/Local/Temp/chrome_overflow_profile"
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
            await asyncio.sleep(2)

            await send_cmd(ws, "Emulation.setDeviceMetricsOverride", {
                "width": 320,
                "height": 800,
                "deviceScaleFactor": 1,
                "mobile": True,
                "fitWindow": False
            }, msg_id=msg_id)
            await asyncio.sleep(0.5)

            script = """
            (() => {
                const winW = window.innerWidth;
                const docEl = document.documentElement;
                const body = document.body;
                
                const overflowingElements = [];
                const all = document.querySelectorAll('*');
                for (let el of all) {
                    const rect = el.getBoundingClientRect();
                    if (rect.right > winW + 1) {
                        overflowingElements.push({
                            tag: el.tagName,
                            className: (el.className || '').toString().slice(0, 80),
                            rectRight: Math.round(rect.right),
                            rectWidth: Math.round(rect.width),
                            outerHTML: el.outerHTML.slice(0, 120)
                        });
                    }
                }
                return {
                    winW,
                    docScrollWidth: docEl.scrollWidth,
                    bodyScrollWidth: body.scrollWidth,
                    overflowingCount: overflowingElements.length,
                    elements: overflowingElements.slice(0, 10)
                };
            })()
            """
            resp = await send_cmd(ws, "Runtime.evaluate", {
                "expression": script,
                "returnByValue": True
            }, msg_id=msg_id)
            val = resp.get("result", {}).get("result", {}).get("value", {})
            print(json.dumps(val, indent=2))
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(run())
