import os
import math
from PIL import Image, ImageDraw

def generate_png_icon(size, filename):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background rounded rectangle
    radius = int(size * 0.22)
    # Gradient simulation with concentric rounded rects
    for i in range(15):
        alpha_factor = i / 15.0
        r = int(29 + (37 - 29) * alpha_factor)
        g = int(78 + (99 - 78) * alpha_factor)
        b = int(216 + (235 - 216) * alpha_factor)
        inset = int(i * 1.5)
        draw.rounded_rectangle([inset, inset, size - inset, size - inset], radius=radius, fill=(r, g, b, 255))

    # Tri-color accent at bottom
    h_bar = int(size * 0.05)
    y_start = size - int(size * 0.16)
    draw.rectangle([0, y_start, size, y_start + h_bar], fill=(255, 153, 51, 240)) # Saffron
    draw.rectangle([0, y_start + h_bar, size, y_start + 2*h_bar], fill=(255, 255, 255, 240)) # White
    draw.rectangle([0, y_start + 2*h_bar, size, size], fill=(19, 136, 8, 240)) # Green

    # Central Core & Nodes
    cx, cy = size // 2, int(size * 0.42)
    core_r = int(size * 0.16)
    draw.ellipse([cx - core_r, cy - core_r, cx + core_r, cy + core_r], fill=(255, 255, 255, 255))
    draw.ellipse([cx - int(core_r*0.75), cy - int(core_r*0.75), cx + int(core_r*0.75), cy + int(core_r*0.75)], fill=(30, 58, 138, 255))

    # Satellite nodes
    num_nodes = 6
    sat_dist = int(size * 0.28)
    node_r = int(size * 0.045)
    for i in range(num_nodes):
        angle = i * (2 * math.pi / num_nodes)
        nx = int(cx + sat_dist * math.cos(angle))
        ny = int(cy + sat_dist * math.sin(angle))
        # Line to center
        draw.line([cx, cy, nx, ny], fill=(255, 255, 255, 200), width=max(2, size // 60))
        # Node circle
        draw.ellipse([nx - node_r, ny - node_r, nx + node_r, ny + node_r], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=max(1, size // 100))

    # Save PNG
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, "PNG")
    print(f"Generated {filename} ({size}x{size})")

if __name__ == "__main__":
    generate_png_icon(192, "public/icon-192.png")
    generate_png_icon(512, "public/icon-512.png")
    generate_png_icon(180, "public/apple-touch-icon.png")
    generate_png_icon(512, "public/maskable-icon.png")
