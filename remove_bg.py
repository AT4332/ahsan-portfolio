"""
Background Removal Script for Hero/About section image.

OPTION A — remove.bg API (best quality, requires free API key):
  1. Sign up at https://www.remove.bg and get your free API key (50 free calls/month)
  2. Set your key below: REMOVEBG_API_KEY = "your_key_here"
  3. Run: python remove_bg.py

OPTION B — Local rembg (no API key needed, requires dependencies):
  Run: pip install rembg numpy scipy scikit-image tqdm pymatting
  Then run: python remove_bg.py --local

The output PNG is saved to: assets/uploads/profile/ahsan_cutout.png
Django will automatically serve it as the hero/about image once it exists.
"""

import os
import sys
import urllib.request
import urllib.parse

INPUT_IMAGE = "assets/uploads/profile/WhatsApp_Image_2026-08-01_at_5_qBsTnF1.04.46_PM.jpeg"
OUTPUT_PNG  = "assets/uploads/profile/ahsan_cutout.png"

# --- OPTION A: remove.bg API ---
REMOVEBG_API_KEY = ""   # <-- paste your free API key here

def remove_bg_api(input_path, output_path, api_key):
    print(f"Using remove.bg API...")
    with open(input_path, "rb") as f:
        image_data = f.read()

    import urllib.request, json
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="size"\r\n\r\nauto\r\n'
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image_file"; filename="image.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + image_data + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        "https://api.remove.bg/v1.0/removebg",
        data=body,
        headers={
            "X-Api-Key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        if resp.status == 200:
            with open(output_path, "wb") as out:
                out.write(resp.read())
            print(f"✓ Saved background-removed PNG to: {output_path}")
        else:
            print(f"✗ API error {resp.status}: {resp.read().decode()}")

def remove_bg_local(input_path, output_path):
    print("Using local rembg...")
    try:
        from rembg import remove
        from PIL import Image
        with open(input_path, "rb") as f:
            result = remove(f.read())
        with open(output_path, "wb") as f:
            f.write(result)
        img = Image.open(output_path)
        print(f"✓ Saved {img.size} PNG to: {output_path}")
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Run: pip install rembg numpy scipy scikit-image tqdm pymatting")

if __name__ == "__main__":
    use_local = "--local" in sys.argv

    if use_local:
        remove_bg_local(INPUT_IMAGE, OUTPUT_PNG)
    elif REMOVEBG_API_KEY:
        remove_bg_api(INPUT_IMAGE, OUTPUT_PNG, REMOVEBG_API_KEY)
    else:
        print("Choose one of:")
        print("  Option A (remove.bg API): Set REMOVEBG_API_KEY in this file, then run: python remove_bg.py")
        print("  Option B (local):         Install deps, then run: python remove_bg.py --local")
        print()
        print(f"Input image : {INPUT_IMAGE}")
        print(f"Output PNG  : {OUTPUT_PNG}")
        print("Once the PNG exists, Django auto-serves it as your hero/about image.")
