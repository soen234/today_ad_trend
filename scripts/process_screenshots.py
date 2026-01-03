#!/usr/bin/env python3
"""
App Store Screenshot Processor
- Resizes to App Store required dimensions
- Adds iPhone-style device frame
- Creates marketing-ready screenshots
"""

from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

# App Store required sizes
SIZES = {
    "6.7": (1290, 2796),  # iPhone 16 Pro Max
    "6.5": (1284, 2778),  # iPhone 11 Pro Max series
}

# Colors
FRAME_COLOR = (28, 28, 30)  # Dark gray like iPhone
BACKGROUND_COLORS = [
    (10, 25, 41),    # Dark blue (matches app splash)
    (30, 41, 59),    # Slate
    (17, 24, 39),    # Gray blue
]

# Marketing text for each screenshot (Korean)
MARKETING_TEXT_KO = [
    "다양한 배너 광고",
    "사이즈별 필터링",
    "전면 광고 체험",
    "리워드 광고",
    "설정 & 계정",
    "광고 트렌드",
    "스크린샷 저장",
]

def create_device_frame(screenshot_path, output_path, size_key="6.7", text=None, bg_color=None):
    """Create a framed screenshot for App Store"""

    target_w, target_h = SIZES[size_key]

    # Load screenshot
    screenshot = Image.open(screenshot_path)
    sw, sh = screenshot.size

    # Calculate frame dimensions
    frame_padding = 40
    corner_radius = 60

    # Scale screenshot to fit with frame
    # Leave space for text at top
    text_area_height = 200 if text else 0
    available_height = target_h - text_area_height - frame_padding * 2
    available_width = target_w - frame_padding * 2

    # Calculate scale to fit
    scale = min(available_width / sw, available_height / sh) * 0.85
    new_sw = int(sw * scale)
    new_sh = int(sh * scale)

    # Resize screenshot
    screenshot_resized = screenshot.resize((new_sw, new_sh), Image.Resampling.LANCZOS)

    # Create canvas with background
    if bg_color is None:
        bg_color = BACKGROUND_COLORS[0]
    canvas = Image.new('RGB', (target_w, target_h), bg_color)
    draw = ImageDraw.Draw(canvas)

    # Calculate position (centered, below text area)
    x = (target_w - new_sw) // 2
    y = text_area_height + (target_h - text_area_height - new_sh) // 2

    # Draw device frame (rounded rectangle behind screenshot)
    frame_margin = 15
    frame_rect = [
        x - frame_margin,
        y - frame_margin,
        x + new_sw + frame_margin,
        y + new_sh + frame_margin
    ]
    draw.rounded_rectangle(frame_rect, radius=corner_radius, fill=FRAME_COLOR)

    # Add subtle border
    draw.rounded_rectangle(frame_rect, radius=corner_radius, outline=(60, 60, 60), width=2)

    # Paste screenshot
    canvas.paste(screenshot_resized, (x, y))

    # Add rounded corners to screenshot area
    # Create mask for rounded corners
    mask = Image.new('L', (new_sw, new_sh), 255)
    mask_draw = ImageDraw.Draw(mask)
    inner_radius = corner_radius - frame_margin
    mask_draw.rounded_rectangle([0, 0, new_sw, new_sh], radius=inner_radius, fill=255)

    # Add marketing text if provided
    if text:
        try:
            # Try to use system font
            font = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 56)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 56)
            except:
                font = ImageFont.load_default()

        # Draw text centered at top
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        text_x = (target_w - text_w) // 2
        text_y = 80

        draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)

    # Save
    canvas.save(output_path, 'PNG', quality=95)
    print(f"Created: {output_path}")

def main():
    # Paths
    input_dir = Path("/Users/ab180-seungheon-mbp/projects/today_ad_trend/assets/images/screenshots")
    output_dir = input_dir / "appstore"
    output_dir.mkdir(exist_ok=True)

    # Get all PNG files
    screenshots = sorted(input_dir.glob("*.png"))

    print(f"Found {len(screenshots)} screenshots")
    print(f"Output directory: {output_dir}")
    print("-" * 50)

    for i, screenshot_path in enumerate(screenshots):
        # Determine marketing text
        text = MARKETING_TEXT_KO[i] if i < len(MARKETING_TEXT_KO) else None

        # Alternate background colors
        bg_color = BACKGROUND_COLORS[i % len(BACKGROUND_COLORS)]

        # Output filename
        output_name = f"screenshot_{i+1:02d}_6.7.png"
        output_path = output_dir / output_name

        create_device_frame(
            screenshot_path,
            output_path,
            size_key="6.7",
            text=text,
            bg_color=bg_color
        )

    print("-" * 50)
    print(f"Done! {len(screenshots)} screenshots processed.")
    print(f"Output: {output_dir}")

if __name__ == "__main__":
    main()
