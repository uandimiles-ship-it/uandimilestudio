"""Generate 16:9 collage thumbnail for work-9 (fan-made anime filming)."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\VIEW LIFE\.cursor\projects\c-Users-VIEW-LIFE-Desktop\assets"
)
OUT_DIR = ROOT / "public" / "thumbnails"
SOURCES_DIR = OUT_DIR / "work-9-sources"
OUT_FILE = OUT_DIR / "work-9-fan-anime-collage.jpg"
DESKTOP_COPY = Path(r"C:\Users\VIEW LIFE\Desktop") / "팬메이드_애니_주인공_촬영현장_썸네일.jpg"

SOURCE_NAMES = [
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_12__1_-a783699c-0c64-40e9-a3af-8f8210856e33.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_16-3281d5a1-8b21-4837-8ad3-f028f6ab9ca8.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_10-6fe01bec-a8ef-4ef3-b810-b3e44a327d2c.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_13-b9f40372-e42d-494c-8329-a5c57e48348c.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_9-3d9adfd6-027b-4bd3-becb-5811c87fe41f.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_15-75214757-7ed8-452e-8836-c4864e39c678.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_18-6758f615-9e23-473b-903c-01bb87fce669.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_14-56040738-7161-457e-8218-b119e1cb956d.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_17-b6297fd0-a46d-4c5c-9f0c-042766aa25fa.jpg",
    "c__Users_VIEW_LIFE_AppData_Roaming_Cursor_User_workspaceStorage_a323493ff059b93fddb09a8041cb9286_images_image_11-e5964978-835f-4fdd-9a2f-7215465e0b49.jpg",
]

# center_x, center_y, max_height, angle_deg, z_index — 위치·크기는 최초 배치 유지
# 빨간 표시 3장(인덱스 6·7·8)만 z를 올려 맨 위 레이어
PLACEMENTS = [
    (280, 520, 520, -8, 2),
    (520, 380, 440, 6, 4),
    (780, 560, 480, -5, 3),
    (1020, 340, 500, 4, 5),
    (1280, 520, 460, -7, 2),
    (1580, 400, 430, 9, 4),
    (350, 820, 320, 12, 10),
    (720, 780, 340, -10, 11),
    (1100, 820, 360, 7, 12),
    (1500, 780, 380, -6, 3),
]

W, H = 1920, 1080
TITLE = "팬메이드 애니 주인공 촬영현장"


def load_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    candidates = [
        Path(r"C:\Windows\Fonts\malgunbd.ttf") if bold else Path(r"C:\Windows\Fonts\malgun.ttf"),
        Path(r"C:\Windows\Fonts\malgun.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def make_background() -> Image.Image:
    base = Image.new("RGB", (W, H), (12, 10, 18))
    draw = ImageDraw.Draw(base)
    for y in range(H):
        t = y / H
        r = int(18 + 22 * t)
        g = int(12 + 18 * t)
        b = int(28 + 35 * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((-200, -100, 900, 700), fill=(120, 60, 200, 35))
    od.ellipse((900, 200, 2100, 1200), fill=(220, 80, 60, 28))
    od.rectangle((0, 0, W, H), fill=(0, 0, 0, 90))
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def fit_cover(img: Image.Image, tw: int, th: int) -> Image.Image:
    iw, ih = img.size
    scale = max(tw / iw, th / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def paste_photo(
    canvas: Image.Image,
    photo: Image.Image,
    cx: int,
    cy: int,
    max_h: int,
    angle: float,
) -> None:
    iw, ih = photo.size
    scale = max_h / ih
    tw, th = int(iw * scale), int(ih * scale)
    tw = max(tw, 80)
    th = max(th, 80)
    aspect = tw / th
    tw = int(th * aspect)
    framed = fit_cover(photo.convert("RGB"), tw, th)

    border = 6
    card = Image.new("RGBA", (tw + border * 2, th + border * 2), (255, 255, 255, 240))
    card.paste(framed, (border, border))

    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rectangle((0, 0, card.size[0], card.size[1]), fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))

    rotated = card.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    shadow_rot = shadow.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)

    x = cx - rotated.size[0] // 2
    y = cy - rotated.size[1] // 2
    sx = cx - shadow_rot.size[0] // 2 + 8
    sy = cy - shadow_rot.size[1] // 2 + 10

    base = canvas.convert("RGBA")
    base.alpha_composite(shadow_rot, (sx, sy))
    base.alpha_composite(rotated, (x, y))
    canvas.paste(base.convert("RGB"))


def draw_title(canvas: Image.Image) -> None:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    band_h = 200
    for i in range(band_h):
        a = int(210 * (1 - i / band_h) ** 1.15)
        draw.line([(0, i), (W, i)], fill=(0, 0, 0, a))

    font_main = load_font(96, bold=True)
    text = TITLE
    tb = draw.textbbox((0, 0), text, font=font_main)
    tw = tb[2] - tb[0]
    tx = (W - tw) // 2 - tb[0]
    ty = 40 - tb[1]

    stroke = 5
    for dx in range(-stroke, stroke + 1):
        for dy in range(-stroke, stroke + 1):
            if dx * dx + dy * dy <= stroke * stroke + 2:
                draw.text((tx + dx, ty + dy), text, font=font_main, fill=(0, 0, 0, 240))
    draw.text((tx, ty), text, font=font_main, fill=(255, 255, 255, 255))

    result = Image.alpha_composite(canvas.convert("RGBA"), overlay)
    canvas.paste(result.convert("RGB"))


def draw_fanmade_badge(canvas: Image.Image) -> None:
    """베르세르크·머털도사 썸네일과 동일한 좌상단 팬메이드 뱃지."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    badge_text = "팬메이드"
    font = load_font(40, bold=True)
    tb = draw.textbbox((0, 0), badge_text, font=font)
    text_w = tb[2] - tb[0]
    text_h = tb[3] - tb[1]
    pad_x, pad_y = 20, 12
    x0, y0 = 32, 32
    x1 = x0 + text_w + pad_x * 2
    y1 = y0 + text_h + pad_y * 2
    radius = 16

    red = (214, 32, 32, 255)
    white = (255, 255, 255, 255)

    draw.rounded_rectangle(
        (x0 + 4, y0 + 5, x1 + 4, y1 + 5),
        radius=radius,
        fill=(0, 0, 0, 140),
    )
    draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=red)
    draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, outline=white, width=5)
    inset = 7
    draw.rounded_rectangle(
        (x0 + inset, y0 + inset, x1 - inset, y1 - inset),
        radius=max(8, radius - 6),
        outline=white,
        width=2,
    )

    tx = x0 + pad_x - tb[0]
    ty = y0 + pad_y - tb[1]
    draw.text((tx, ty), badge_text, font=font, fill=white)

    result = Image.alpha_composite(canvas.convert("RGBA"), overlay)
    canvas.paste(result.convert("RGB"))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SOURCES_DIR.mkdir(parents=True, exist_ok=True)

    paths: list[Path] = []
    for i, name in enumerate(SOURCE_NAMES):
        src = ASSETS / name
        if not src.exists():
            raise FileNotFoundError(src)
        dest = SOURCES_DIR / f"{i + 1:02d}.jpg"
        if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
            shutil.copy2(src, dest)
        paths.append(dest)

    canvas = make_background()
    layers: list[tuple[int, Path, tuple]] = []
    for path, place in zip(paths, PLACEMENTS):
        layers.append((place[4], path, place))
    layers.sort(key=lambda x: x[0])

    for _, path, (cx, cy, max_h, angle, _) in layers:
        img = Image.open(path)
        paste_photo(canvas, img, cx, cy, max_h, angle)

    draw_title(canvas)
    draw_fanmade_badge(canvas)
    canvas.save(OUT_FILE, "JPEG", quality=92, optimize=True)
    shutil.copy2(OUT_FILE, DESKTOP_COPY)
    print(f"Wrote {OUT_FILE} ({OUT_FILE.stat().st_size // 1024} KB)")
    print(f"Desktop copy: {DESKTOP_COPY}")


if __name__ == "__main__":
    main()
