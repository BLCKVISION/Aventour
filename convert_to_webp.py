import os
from PIL import Image
import re

base_dir = r"c:\Users\C Q N X\Downloads\T R A V E L\Landing"
img_dir = os.path.join(base_dir, "img")

exts = {".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG"}

converted_count = 0
for root, dirs, files in os.walk(img_dir):
    for file in files:
        ext = os.path.splitext(file)[1]
        if ext in exts:
            filepath = os.path.join(root, file)
            new_filepath = os.path.splitext(filepath)[0] + ".webp"
            try:
                with Image.open(filepath) as im:
                    im.save(new_filepath, "webp", quality=85)
                os.remove(filepath)
                converted_count += 1
            except Exception as e:
                print(f"Error converting {file}: {e}")

print(f"Converted {converted_count} images to webp.")

code_exts = {".html", ".css", ".js"}
for root, dirs, files in os.walk(base_dir):
    if "img" in root or ".git" in root or "node_modules" in root:
        continue
    for file in files:
        if os.path.splitext(file)[1] in code_exts:
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                new_content = re.sub(r'(?i)\.(png|jpg|jpeg)', '.webp', content)
                
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated references in {file}")
            except Exception as e:
                pass

print("Done converting and updating.")
