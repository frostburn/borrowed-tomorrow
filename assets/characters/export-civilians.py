"""Export the four small native sprites from local generated originals.

Usage: python assets/characters/export-civilians.py SOURCE_DIRECTORY
Large originals stay outside the repository; the manifest pins their hashes.
"""
import hashlib
import colorsys
import json
import sys
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'assets/tiles'))
from native_tiles import clean_cutout

sources = Path(sys.argv[1])
for entry in json.loads((root / 'assets/characters/civilians.json').read_text()):
    source = sources / entry['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['sha256'], source
    image = Image.open(source).convert('RGBA')
    assert list(image.size) == entry['sourceSize'], source
    factor = entry['reductionFactor']
    assert isinstance(factor, int) and factor > 0
    canvas = Image.new('RGBA', (80 * factor, 80 * factor))
    assert image.width <= canvas.width and image.height <= canvas.height, 'Regenerate oversized sources'
    canvas.paste(image, ((canvas.width - image.width) // 2, (canvas.height - image.height) // 2))
    # Filter the smooth source once, including its alpha, before making the
    # native silhouette binary. Faces and bodies use the same sampling grid.
    sprite = clean_cutout(canvas.resize((80, 80), Image.Resampling.LANCZOS))
    bounds = sprite.getbbox()
    assert bounds is not None
    sprite = sprite.crop(bounds)
    assert sprite.width <= 80 and sprite.height <= 68, 'Regenerate oversized actors; do not fit them'
    frame = Image.new('RGBA', (80, 80))
    frame.alpha_composite(sprite, ((80 - sprite.width) // 2, 68 - sprite.height))
    frame.save(root / f"public/art/{entry['sprite']}.png", optimize=True)
    for variant in entry['variants']:
        recolored = frame.copy()
        for rule in variant['rules']:
            left, top, right, bottom = rule['box']
            for y in range(top, bottom):
                for x in range(left, right):
                    if any(l <= x < r and t <= y < b for l, t, r, b in entry['protectedRegions']):
                        continue
                    r, g, b, a = recolored.getpixel((x, y))
                    hue, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                    if a and saturation >= .18 and value >= .16 and rule['hue'][0] <= hue <= rule['hue'][1]:
                        rgb = colorsys.hsv_to_rgb(rule['targetHue'], saturation, value)
                        recolored.putpixel((x, y), (*[round(c * 255) for c in rgb], a))
        recolored.save(root / f"public/art/{variant['sprite']}.png", optimize=True)
