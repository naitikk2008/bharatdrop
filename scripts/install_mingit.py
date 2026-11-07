import urllib.request
import zipfile
import os
import sys

DEST = r"C:\Users\punja\AppData\Local\MinGit"
URL = "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip"
ZIP_PATH = r"C:\Users\punja\AppData\Local\mingit.zip"

print(f"Downloading MinGit (portable git) to {ZIP_PATH}...")
urllib.request.urlretrieve(URL, ZIP_PATH)
print(f"Downloaded ({os.path.getsize(ZIP_PATH)} bytes). Extracting to {DEST}...")
os.makedirs(DEST, exist_ok=True)
with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
    zip_ref.extractall(DEST)

git_exe = os.path.join(DEST, "cmd", "git.exe")
print("Git binary installed at:", git_exe)
if os.path.exists(git_exe):
    print("MinGit successfully installed without admin rights!")

