import os
from PIL import Image, ImageDraw

def create_pwa_icon(size):
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)

    scale = size / 512.0

    # Tarjeta trasera
    back_card_coords = [
        (int(100 * scale), int(100 * scale)),
        (int(380 * scale), int(260 * scale))
    ]
    draw.rounded_rectangle(back_card_coords, radius=int(18 * scale), fill=(56, 189, 248, 220))

    # Banda magnética trasera
    draw.rectangle([
        (int(100 * scale), int(130 * scale)),
        (int(380 * scale), int(160 * scale))
    ], fill=(15, 23, 42, 180))

    # Tarjeta frontal principal
    front_card_coords = [
        (int(120 * scale), int(170 * scale)),
        (int(420 * scale), int(360 * scale))
    ]
    draw.rounded_rectangle(front_card_coords, radius=int(22 * scale), fill=(37, 99, 235, 255), outline=(147, 197, 253, 255), width=int(3 * scale))

    # Chip dorado
    chip_coords = [
        (int(155 * scale), int(210 * scale)),
        (int(205 * scale), int(250 * scale))
    ]
    draw.rounded_rectangle(chip_coords, radius=int(6 * scale), fill=(251, 191, 36, 255), outline=(254, 240, 138, 255), width=int(1 * scale))

    # Líneas chip
    draw.line([(int(180 * scale), int(210 * scale)), (int(180 * scale), int(250 * scale))], fill=(120, 53, 15, 180), width=int(1 * scale))
    draw.line([(int(155 * scale), int(230 * scale)), (int(205 * scale), int(230 * scale))], fill=(120, 53, 15, 180), width=int(1 * scale))

    # Círculos logotipo Master Accent
    draw.ellipse([(int(340 * scale), int(290 * scale)), (int(376 * scale), int(326 * scale))], fill=(235, 0, 27, 220))
    draw.ellipse([(int(360 * scale), int(290 * scale)), (int(396 * scale), int(326 * scale))], fill=(247, 158, 27, 220))

    # Líneas de relieve blanco en tarjeta
    draw.rounded_rectangle([(int(155 * scale), int(295 * scale)), (int(290 * scale), int(307 * scale))], radius=int(5 * scale), fill=(255, 255, 255, 240))
    draw.rounded_rectangle([(int(155 * scale), int(317 * scale)), (int(230 * scale), int(327 * scale))], radius=int(4 * scale), fill=(147, 197, 253, 220))

    return img

os.makedirs('public', exist_ok=True)
create_pwa_icon(512).save('public/pwa-512x512.png', 'PNG')
create_pwa_icon(192).save('public/pwa-192x192.png', 'PNG')
create_pwa_icon(180).save('public/apple-touch-icon.png', 'PNG')
print("PNG PWA icons created successfully!")
