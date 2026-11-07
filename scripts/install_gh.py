import urllib.request
import zipfile
import os

DEST = r"C:\Users\punja\AppData\Local\gh"
URL = "https://github.com/cli/cli/releases/download/v2.45.0/gh_2.45.0_windows_amd64.zip"
ZIP_PATH = r"C:\Users\punja\AppData\Local\gh.zip"

print(f"Downloading GitHub CLI to {ZIP_PATH}...")
urllib.request.urlretrieve(URL, ZIP_PATH)
print(f"Downloaded ({os.path.getsize(ZIP_PATH)} bytes). Extracting...")
os.makedirs(DEST, exist_ok=True)
with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
    zip_ref.extractall(DEST)

# Find gh.exe inside extracted subfolder
gh_exe = None
for root, dirs, files in os.walk(DEST):
    if "gh.exe" in files:
        gh_exe = os.path.join(root, "gh.exe")
        break

print("GitHub CLI binary:", gh_exe)

