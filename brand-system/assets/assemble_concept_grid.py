import os
from PIL import Image, ImageDraw, ImageFont

frames_dir = r"G:\Doh-Nut\brand-system\assets\video-breakdown"
out_grid = r"G:\Doh-Nut\brand-system\assets\00-master-claymation-concept-grid.jpg"
out_grid_pub = r"G:\Doh-Nut\public\brand\00-master-claymation-concept-grid.jpg"

frames_info = [
    ("01-knead.jpg", "01. THE KNEAD (ULI DOH)", "Tangan kuning plastisin menguli doh kenyal"),
    ("02-stamp.jpg", "02. THE STAMP (TEKAP ACUAN)", "Acuan bulat biru memotong gelang donat"),
    ("03-cut-ring.jpg", "03. THE RING (BENTUK DONAT)", "Gelang donat terhasil kemas di atas meja"),
    ("04-sizzle.jpg", "04. THE SIZZLE (GORENG KEEMASAN)", "Donat mengembang dalam minyak panas berbuih"),
    ("05-dip.jpg", "05. THE DIP (CELUP SOS STRAWBERI)", "Donat ditekan ke dalam sos merah jambu pekat"),
    ("06-lift-drip.jpg", "06. THE DRIP (LELEHAN PEKAT)", "Sos glaze likat meleleh ditarik keluar"),
    ("07-sprinkles.jpg", "07. THE SPRINKLE (TABUR MANIK)", "Hujan manik pelangi melekat pada glaze"),
    ("08-logo-snap.jpg", "08. LOGO SNAP (DOH-NUT™)", "Lencana 3D timbul merah & biru bersuara \"Doh-Nut!\"")
]

# We will arrange 8 frames in 2 rows of 4 columns
# Standard 16:9 frame aspect ratio e.g. 640x360 per frame
fw, fh = 640, 360
margin = 24
header_h = 130
footer_bar = 60

canvas_w = (fw * 4) + (margin * 5)
canvas_h = header_h + (fh + footer_bar) * 2 + (margin * 3)

grid = Image.new('RGB', (canvas_w, canvas_h), color='#07334F')
draw = ImageDraw.Draw(grid)

try:
    font_title = ImageFont.truetype("arialbd.ttf", 46)
    font_sub = ImageFont.truetype("arial.ttf", 24)
    font_step = ImageFont.truetype("arialbd.ttf", 22)
    font_desc = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font_title = font_sub = font_step = font_desc = ImageFont.load_default()

# Header banner
draw.text((margin, 30), "DOH-NUT™ CANONICAL CONCEPT BREAKDOWN (BENCHMARK VIDEO)", fill="#FEDE33", font=font_title)
draw.text((margin, 85), "Rujukan Mutlak: G:\\Downloads\\Claymation_hands_making_donut_video_20260910104943.mp4", fill="#FFFFFF", font=font_sub)

for idx, (fname, title, desc) in enumerate(frames_info):
    row = idx // 4
    col = idx % 4
    
    x = margin + col * (fw + margin)
    y = header_h + margin + row * (fh + footer_bar + margin)
    
    frame_path = os.path.join(frames_dir, fname)
    if os.path.exists(frame_path):
        fimg = Image.open(frame_path).convert('RGB')
        fimg = fimg.resize((fw, fh), Image.Resampling.LANCZOS)
        grid.paste(fimg, (x, y))
    
    # Text bar below frame
    draw.rounded_rectangle([x, y + fh + 4, x + fw, y + fh + footer_bar - 4], radius=6, fill='#0D2235', outline='#297ABE', width=1)
    draw.text((x + 12, y + fh + 8), title, fill='#FEDE33', font=font_step)
    draw.text((x + 12, y + fh + 34), desc, fill='#94A3B8', font=font_desc)

grid.save(out_grid, quality=92)
grid.save(out_grid_pub, quality=92)
print(f"Generated 2x4 Master Claymation Concept Grid: {out_grid} (Size: {os.path.getsize(out_grid)} bytes)")
