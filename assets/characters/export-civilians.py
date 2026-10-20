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
sources = Path(sys.argv[1])
for entry in json.loads((root / 'assets/characters/civilians.json').read_text()):
    source = sources / entry['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['sha256'], source
    image = Image.open(source).convert('RGBA')
    image.putalpha(image.getchannel('A').point(lambda a: 255 if a >= 200 else 0))
    sprite = image.crop(entry['crop']).resize(entry['nativeSize'], Image.Resampling.NEAREST)
    frame = Image.new('RGBA', (80, 80))
    frame.alpha_composite(sprite, entry['offset'])
    # Choose the face's sampling phase independently of the body. This retains
    # small pupils/mouths without moving boots, hands or costume contours.
    x0, y0, x1, y1 = entry['crop']
    w, h = entry['nativeSize']
    for head in entry['headSamples']:
        dx, dy = head['phase']
        dx *= (x1 - x0) / w
        dy *= (y1 - y0) / h
        sampled = image.transform((w, h), Image.Transform.EXTENT,
                                  (x0 + dx, y0 + dy, x1 + dx, y1 + dy), Image.Resampling.NEAREST)
        candidate = Image.new('RGBA', (80, 80))
        candidate.alpha_composite(sampled, entry['offset'])
        frame.paste(candidate.crop(head['box']), head['box'])
    frame.save(root / f"public/art/{entry['sprite']}.png", optimize=True)
    for variant in entry['variants']:
        recolored = frame.copy()
        for rule in variant['rules']:
            left, top, right, bottom = rule['box']
            for y in range(top, bottom):
                for x in range(left, right):
                    r, g, b, a = recolored.getpixel((x, y))
                    hue, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                    if a and saturation >= .18 and value >= .16 and rule['hue'][0] <= hue <= rule['hue'][1]:
                        rgb = colorsys.hsv_to_rgb(rule['targetHue'], saturation, value)
                        recolored.putpixel((x, y), (*[round(c * 255) for c in rgb], a))
        recolored.save(root / f"public/art/{variant['sprite']}.png", optimize=True)
