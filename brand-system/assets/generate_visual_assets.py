import os
import shutil
from PIL import Image, ImageDraw, ImageFont

brain_dir = r"C:\Users\megat\.gemini\antigravity-cli\brain\4152b238-1e2c-40ac-a2ae-caac572adb02"
assets_dir = r"G:\Doh-Nut\brand-system\assets"
public_brand = r"G:\Doh-Nut\public\brand"

os.makedirs(assets_dir, exist_ok=True)
os.makedirs(public_brand, exist_ok=True)

# Copy AI generated images
img_mappings = {
    "dohnut_claymation_hero_1789502313193.jpg": "dohnut-claymation-hero.jpg",
    "dohnut_box_unboxing_1789502330497.jpg": "dohnut-box-unboxing.jpg",
    "dohnut_3_donut_stack_1789502348557.jpg": "dohnut-3-donut-stack.jpg"
}

for src_name, dst_name in img_mappings.items():
    src_path = os.path.join(brain_dir, src_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, os.path.join(assets_dir, dst_name))
        shutil.copy2(src_path, os.path.join(public_brand, dst_name))
        print(f"Copied {dst_name} to brand-system and public/brand")

# 1. GENERATE HIGH-RES COLOR PALETTE CARD (1200 x 630)
W, H = 1200, 630
img = Image.new('RGB', (W, H), color='#07334F')
draw = ImageDraw.Draw(img)

# Try loading font or default
try:
    font_title = ImageFont.truetype("arial.ttf", 42)
    font_subtitle = ImageFont.truetype("arial.ttf", 20)
    font_color_name = ImageFont.truetype("arialbd.ttf", 22)
    font_color_hex = ImageFont.truetype("consola.ttf", 18)
    font_badge = ImageFont.truetype("arialbd.ttf", 14)
except Exception:
    font_title = font_subtitle = font_color_name = font_color_hex = font_badge = ImageFont.load_default()

# Header
draw.text((60, 40), "DOH-NUT™ OFFICIAL COLOR ARCHITECTURE", fill="#FFFFFF", font=font_title)
draw.text((60, 95), "Calibrated Design Tokens · WCAG AA/AAA Accessibility Certified · Tactile Food Senses", fill="#94A3B8", font=font_subtitle)

colors = [
    {"name": "Frosting Pink", "hex": "#EF9FBD", "role": "Hero Glaze Accent", "wcag": "AA UI", "text_dark": True},
    {"name": "Dough Cream", "hex": "#FDEFEB", "role": "Warm Pastry Base", "wcag": "AAA Base", "text_dark": True},
    {"name": "Classic Blue", "hex": "#297ABE", "role": "Streetwear Action", "wcag": "AA Normal", "text_dark": False},
    {"name": "Navy Dark", "hex": "#07334F", "role": "High Contrast Text", "wcag": "13.5:1 AAA", "text_dark": False, "border": "#225577"},
    {"name": "Butter Yellow", "hex": "#FEDE33", "role": "Claymation Table", "wcag": "9.9:1 AAA", "text_dark": True},
    {"name": "Choc Truffle", "hex": "#2B1408", "role": "Rich Filling Core", "wcag": "AAA Contrast", "text_dark": False}
]

card_w = 160
card_h = 420
start_x = 60
start_y = 150
gap = 24

for i, c in enumerate(colors):
    x = start_x + i * (card_w + gap)
    y = start_y
    
    # Swatch rectangle with rounded corners
    draw.rounded_rectangle([x, y, x + card_w, y + 240], radius=16, fill=c["hex"], outline=c.get("border", None), width=2)
    
    # Badge inside swatch
    badge_bg = "#000000" if c["text_dark"] else "#FFFFFF"
    badge_fg = "#FFFFFF" if c["text_dark"] else "#000000"
    draw.rounded_rectangle([x + 12, y + 12, x + card_w - 12, y + 40], radius=6, fill=badge_bg)
    draw.text((x + 22, y + 18), c["wcag"], fill=badge_fg, font=font_badge)
    
    # Info section below swatch
    draw.text((x, y + 260), c["name"], fill="#FFFFFF", font=font_color_name)
    draw.text((x, y + 295), c["hex"], fill="#38BDF8", font=font_color_hex)
    draw.text((x, y + 330), c["role"], fill="#94A3B8", font=font_subtitle)

palette_path = os.path.join(assets_dir, "01-brand-color-palette.png")
palette_path_pub = os.path.join(public_brand, "01-brand-color-palette.png")
img.save(palette_path)
img.save(palette_path_pub)
print(f"Generated color palette card: {palette_path}")

# 2. GENERATE CLAYMATION 6-PHASE STORYBOARD CARD (1200 x 500)
SW, SH = 1200, 500
simg = Image.new('RGB', (SW, SH), color='#121215')
sdraw = ImageDraw.Draw(simg)

sdraw.text((60, 30), "DOH-NUT™ 6-PHASE CLAYMATION SENSORY ARC", fill="#FFFFFF", font=font_title)
sdraw.text((60, 85), "Master Creative Benchmark: public/videos/dohnut-hands-making-donut.mp4", fill="#FEDE33", font=font_subtitle)

steps = [
    {"num": "01", "name": "The Knead", "bm": "ULI", "sfx": "Squish & Thump", "desc": "Tangan plastisin kuning menguli doh kenyal."},
    {"num": "02", "name": "The Stamp", "bm": "ACUAN", "sfx": "Snap & Pop", "desc": "Acuan bulat ditekan menghasilkan gelang donat."},
    {"num": "03", "name": "The Sizzle", "bm": "GORENG", "sfx": "Oil Sizzle", "desc": "Donat mengembang dalam minyak berbuih."},
    {"num": "04", "name": "The Dip", "bm": "CELUP", "sfx": "Viscous Drip", "desc": "Donat dicelup 50% ke sos strawberi likat."},
    {"num": "05", "name": "The Sprinkle", "bm": "TABUR", "sfx": "Slow-mo Rain", "desc": "Manik pelangi gugur melekat pada glaze."},
    {"num": "06", "name": "Brand Stamp", "bm": "LOGO", "sfx": "\"Doh-Nut!\"", "desc": "Lencana 3D timbul snap ke tengah skrin."}
]

step_w = 166
step_gap = 16
step_start_x = 60
step_start_y = 135

for i, s in enumerate(steps):
    sx = step_start_x + i * (step_w + step_gap)
    sy = step_start_y
    
    # Step Card
    sdraw.rounded_rectangle([sx, sy, sx + step_w, sy + 320], radius=12, fill='#1A1A22', outline='#2A2A38', width=2)
    
    # Step Header
    sdraw.rounded_rectangle([sx + 10, sy + 10, sx + step_w - 10, sy + 45], radius=8, fill='#EF9FBD')
    sdraw.text((sx + 18, sy + 16), f"PHASE {s['num']}", fill='#07334F', font=font_color_name)
    
    # Step Title
    sdraw.text((sx + 14, sy + 65), s['name'], fill='#FFFFFF', font=font_color_name)
    sdraw.text((sx + 14, sy + 95), f"({s['bm']})", fill='#FEDE33', font=font_subtitle)
    
    # SFX Pill
    sdraw.rounded_rectangle([sx + 12, sy + 135, sx + step_w - 12, sy + 175], radius=6, fill='#297ABE')
    sdraw.text((sx + 18, sy + 145), f"🔊 {s['sfx']}", fill='#FFFFFF', font=font_badge)
    
    # Description
    # simple word wrap
    words = s['desc'].split()
    line1 = " ".join(words[:4])
    line2 = " ".join(words[4:])
    sdraw.text((sx + 12, sy + 200), line1, fill='#94A3B8', font=font_badge)
    sdraw.text((sx + 12, sy + 225), line2, fill='#94A3B8', font=font_badge)

storyboard_path = os.path.join(assets_dir, "03-claymation-6-phase-storyboard.png")
storyboard_path_pub = os.path.join(public_brand, "03-claymation-6-phase-storyboard.png")
simg.save(storyboard_path)
simg.save(storyboard_path_pub)
print(f"Generated storyboard card: {storyboard_path}")
print("ALL VISUAL ASSETS GENERATED SUCCESSFULLY!")
