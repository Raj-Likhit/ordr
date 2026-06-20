import os
from PIL import Image, ImageDraw, ImageFont

def create_image(filename, width, height, bg_color, text, text_color):
    img = Image.new('RGB', (width, height), color=bg_color)
    d = ImageDraw.Draw(img)
    
    # Try to load a font, otherwise use default
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
    
    # Get text bounding box to center it
    bbox = d.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) / 2
    y = (height - text_height) / 2
    
    d.text((x, y), text, fill=text_color, font=font)
    
    # Add a simple border
    d.rectangle([0, 0, width-1, height-1], outline=text_color, width=2)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename)
    print(f"Generated {filename}")

assets_dir = r"c:\Users\rajli\Downloads\Bazl\bazl\public\assets"

# 1. hero-mosaic-01
create_image(
    os.path.join(assets_dir, "hero-mosaic-01.webp"),
    600, 600,
    "#F2EDE4", # Warm cream
    "hero-mosaic-01\n(2x2 Editorial Grid)",
    "#1C1917"
)

# 2. product-card-placeholder
create_image(
    os.path.join(assets_dir, "product-card-placeholder.webp"),
    400, 500,
    "#FDFAF5", # Warm parchment
    "Product Placeholder\n(Watercolor Wash)",
    "#C4BAB0" # Faint outline color
)

# 3. category-handcrafted
create_image(
    os.path.join(assets_dir, "category-handcrafted.webp"),
    400, 400,
    "#FDFAF5", # Warm parchment
    "Category: Handcrafted",
    "#C84B0F" # Saffron red
)

print("All 3 assets generated successfully.")
