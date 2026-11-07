import subprocess
import os
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"c:\Users\punja\Desktop\MR-AI3\public\test_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTHS = [320, 375, 390, 430]
URL = "http://localhost:3000"

print(f"Testing mobile responsive layouts against Chrome at {URL}...")

results = []

for w in WIDTHS:
    screenshot_path = os.path.join(OUTPUT_DIR, f"mobile_{w}px.png")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--hide-scrollbars",
        f"--window-size={w},850",
        f"--screenshot={screenshot_path}",
        "--virtual-time-budget=5000",
        URL
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        file_size = os.path.getsize(screenshot_path) if os.path.exists(screenshot_path) else 0
        status = "PASSED" if file_size > 5000 else "FAILED"
        print(f"Width: {w}px -> Screenshot: {screenshot_path} ({file_size} bytes) -> {status}")
        results.append((w, status, screenshot_path, file_size))
    except Exception as e:
        print(f"Error testing {w}px: {e}")
        results.append((w, "ERROR", str(e), 0))

print("\n--- Summary of Responsive Mobile Tests ---")
for r in results:
    print(f"Width {r[0]}px: {r[1]} ({r[3]} bytes)")

