import os
import subprocess

video_path = r"G:\Downloads\Claymation_hands_making_donut_video_20260910104943.mp4"
out_dir = r"G:\Doh-Nut\brand-system\assets\video-breakdown"
pub_dir = r"G:\Doh-Nut\public\brand\video-breakdown"

os.makedirs(out_dir, exist_ok=True)
os.makedirs(pub_dir, exist_ok=True)

timestamps = [
    ("01-knead.jpg", "00:00:00.500"),
    ("02-stamp.jpg", "00:00:01.300"),
    ("03-cut-ring.jpg", "00:00:02.200"),
    ("04-sizzle.jpg", "00:00:03.500"),
    ("05-dip.jpg", "00:00:05.100"),
    ("06-lift-drip.jpg", "00:00:06.200"),
    ("07-sprinkles.jpg", "00:00:07.700"),
    ("08-logo-snap.jpg", "00:00:09.000")
]

for fname, ts in timestamps:
    out_file = os.path.join(out_dir, fname)
    pub_file = os.path.join(pub_dir, fname)
    cmd = [
        "ffmpeg", "-y", "-ss", ts, "-i", video_path,
        "-vframes", "1", "-q:v", "2", out_file
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if os.path.exists(out_file):
        # copy to public dir as well
        import shutil
        shutil.copy2(out_file, pub_file)
        print(f"Extracted {fname} at {ts} (Size: {os.path.getsize(out_file)} bytes)")
    else:
        print(f"Failed to extract {fname}")

print("All video breakdown frames extracted successfully!")
