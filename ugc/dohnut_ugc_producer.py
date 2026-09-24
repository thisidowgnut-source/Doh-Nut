"""
DOH-NUT Brand UGC Producer Engine
Autonomously generates commercial-grade 1080x1920 9:16 vertical TikTok/Reels ads for Brand Doh-Nut.
"""

import asyncio
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def run_cmd(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True)


async def generate_speech_async(text: str, voice: str, output_path: str):
    import edge_tts

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)


def generate_speech(text: str, voice: str, output_path: str):
    asyncio.run(generate_speech_async(text, voice, output_path))


def get_audio_duration(audio_path: str) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(audio_path),
    ]
    res = run_cmd(cmd)
    return float(res.stdout.strip())


def render_dohnut_frame(
    image_path: str,
    tag: str,
    headline: str,
    subtext: str,
    output_path: str,
    accent_color=(253, 224, 71),  # Doh-Nut Brand Yellow #FDE047
):
    target_w, target_h = 1080, 1920

    with Image.open(image_path) as img:
        img_ratio = img.width / img.height
        target_ratio = target_w / target_h

        if img_ratio > target_ratio:
            new_h = target_h
            new_w = int(target_h * img_ratio)
        else:
            new_w = target_w
            new_h = int(target_w / img_ratio)

        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        left = (new_w - target_w) // 2
        top = (new_h - target_h) // 2
        frame = img_resized.crop((left, top, left + target_w, top + target_h))

    overlay = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    font_path_bold = r"C:\Windows\Fonts\arialbd.ttf"
    font_tag = ImageFont.truetype(font_path_bold, 34)
    font_headline = ImageFont.truetype(font_path_bold, 54)
    font_sub = ImageFont.truetype(font_path_bold, 36)

    # 1. Top Hype Tag Pill (y ~ 140)
    tag_text = f"  {tag.upper()}  "
    bbox_tag = draw.textbbox((0, 0), tag_text, font=font_tag)
    tag_w = bbox_tag[2] - bbox_tag[0] + 34
    tag_h = bbox_tag[3] - bbox_tag[1] + 20
    tag_x = (target_w - tag_w) // 2
    tag_y = 150

    # Draw Yellow & Red Streetwear Pill
    draw.rounded_rectangle(
        [tag_x, tag_y, tag_x + tag_w, tag_y + tag_h],
        radius=16,
        fill=(29, 53, 87, 230),  # Deep Navy #1D3557
        outline=accent_color,  # Doh-Nut Yellow
        width=3,
    )
    draw.text(
        (tag_x + 17, tag_y + 9), tag_text, font=font_tag, fill=accent_color
    )

    # 2. Bottom Kinetic Caption Card (y ~ 1400)
    card_margin = 44
    card_w = target_w - (card_margin * 2)
    card_h = 250
    card_x = card_margin
    card_y = 1410

    # Frosted dark hype card with red accent stripe
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=28,
        fill=(15, 18, 25, 220),
        outline=(239, 35, 60, 200),  # Doh-Nut Red #EF233C
        width=2,
    )

    # Top accent bar on card
    draw.rounded_rectangle(
        [card_x + 20, card_y + 12, card_x + card_w - 20, card_y + 18],
        radius=3,
        fill=(253, 224, 71, 240),
    )

    # Headline
    bbox_head = draw.textbbox((0, 0), headline, font=font_headline)
    head_w = bbox_head[2] - bbox_head[0]
    head_x = (target_w - head_w) // 2
    head_y = card_y + 44

    draw.text(
        (head_x + 3, head_y + 3),
        headline,
        font=font_headline,
        fill=(0, 0, 0, 240),
    )
    draw.text(
        (head_x, head_y), headline, font=font_headline, fill=(253, 224, 71)
    )  # Doh-Nut Yellow

    # Subtext
    bbox_sub = draw.textbbox((0, 0), subtext, font=font_sub)
    sub_w = bbox_sub[2] - bbox_sub[0]
    sub_x = (target_w - sub_w) // 2
    sub_y = head_y + 78

    draw.text(
        (sub_x + 2, sub_y + 2), subtext, font=font_sub, fill=(0, 0, 0, 220)
    )
    draw.text((sub_x, sub_y), subtext, font=font_sub, fill=(245, 245, 255))

    final_frame = Image.alpha_composite(frame.convert("RGBA"), overlay)
    final_frame.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"[+] Composited Doh-Nut frame: {output_path}")


def render_scene_clip(frame_path: str, audio_path: str, output_path: str):
    dur = get_audio_duration(audio_path) + 0.25
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-i",
        str(frame_path),
        "-i",
        str(audio_path),
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-t",
        str(dur),
        "-shortest",
        str(output_path),
    ]
    run_cmd(cmd)
    print(f"[+] Rendered scene: {output_path} ({dur:.2f}s)")


def produce_dohnut_ugc_campaign():
    base_dir = Path("C:/Users/User/projects/Doh-Nut")
    ugc_dir = base_dir / "ugc"
    output_dir = ugc_dir / "output"
    audio_dir = ugc_dir / "audio"
    frames_dir = ugc_dir / "frames"

    voice = "ms-MY-OsmanNeural"  # Energetic local Malaysian voice

    scenes = [
        {
            "tag": "🔥 DONUT DROP VIRAL",
            "headline": "STOP SCROLLING!",
            "subtext": "Unboxing Donut Hypebeast Malaysia",
            "speech": "Stop scrolling guys! Kalau korang craving donut yang lembut macam kapas dan fresh out the fryer, korang wajib tengok unboxing box Doh-Nut ni!",
            "image": base_dir / "public/brand/dohnut-box-unboxing.jpg",
        },
        {
            "tag": "🍩 31 PERISA LOKAL",
            "headline": "PANDAN & MUSANG KING",
            "subtext": "Filling Melimpah & Tekstur Gebu",
            "speech": "Tengok 3-layer stack ni! Ada 31 perisa gila dari Pandan Gula Melaka, Teh Tarik Kaw, sampailah ke Musang King Durian bomb yang pekat meleleh!",
            "image": base_dir / "public/brand/dohnut-3-donut-stack.jpg",
        },
        {
            "tag": "✨ FRESH DARI FRYER",
            "headline": "GLAZE MENITIS PADU",
            "subtext": "Digoreng Panas & Celup Segar",
            "speech": "Semua donut dibuat fresh setiap hari, digoreng panas dan dicelup glaze berkilat. Sekali gigit, serius cair dalam mulut!",
            "image": base_dir / "public/brand/video-breakdown/06-lift-drip.jpg",
        },
        {
            "tag": "🛵 FREE DELIVERY > RM25",
            "headline": "ORDER KAT APP / TIKTOK!",
            "subtext": "Panas-Panas Terus Ke Pintu Rumah",
            "speech": "Paling best, ada free delivery kalau order atas 25 ringgit! Tekan beg kuning atau layari app Doh-Nut sekarang sebelum drop harini habis!",
            "image": base_dir
            / "upload/6095978780254999597_121.jpg_2K_202608311701.jpeg",
        },
    ]

    segment_files = []
    print("[*] Starting Doh-Nut UGC Autonomous Production Pipeline...\n")

    for i, sc in enumerate(scenes):
        audio_file = audio_dir / f"scene_{i + 1}.mp3"
        print(f"[*] [Scene {i + 1}] Synthesizing voiceover: '{sc['speech'][:40]}...'")
        generate_speech(sc["speech"], voice, str(audio_file))

        frame_file = frames_dir / f"frame_{i + 1}.jpg"
        print(f"[*] [Scene {i + 1}] Compositing frame: {sc['headline']}")
        render_dohnut_frame(
            str(sc["image"]),
            sc["tag"],
            sc["headline"],
            sc["subtext"],
            str(frame_file),
        )

        clip_file = output_dir / f"clip_{i + 1}.mp4"
        print(f"[*] [Scene {i + 1}] Rendering video segment...")
        render_scene_clip(str(frame_file), str(audio_file), str(clip_file))
        segment_files.append(clip_file)

    # Concat file
    concat_txt = output_dir / "concat_list.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for clip in segment_files:
            norm = str(clip).replace("\\", "/")
            f.write(f"file '{norm}'\n")

    final_video = output_dir / "dohnut_ugc_viral_ad.mp4"
    concat_cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_txt),
        "-c",
        "copy",
        str(final_video),
    ]
    run_cmd(concat_cmd)
    print(f"\n[COMPLETE] Doh-Nut Viral UGC Video produced at: {final_video}")
    return str(final_video)


if __name__ == "__main__":
    produce_dohnut_ugc_campaign()
