"""Export full-resolution reconstructed civilians and their clothing variants.

Usage: python assets/characters/export-civilians.py [--output-dir DIRECTORY]
No image resizing occurs here. The game fits all figures to 63 pixels in height.
"""
import argparse
import colorsys
import hashlib
import json
from io import BytesIO
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-dir', type=Path, default=root / 'public/art')
args = parser.parse_args()
outputs = []
for entry in json.loads((root / 'assets/characters/civilians.json').read_text()):
    source = root / entry['source']
    data = source.read_bytes()
    if hashlib.sha256(data).hexdigest() != entry['sha256']:
        raise ValueError(f'Reconstruction hash mismatch: {source}')
    frame = Image.open(source).convert('RGBA')
    if list(frame.getchannel('A').getbbox()) != entry['bounds']:
        raise ValueError(f'Changed actor bounds: {source}')
    outputs.append((entry['sprite'], data))
    left, top, right, bottom = entry['bounds']
    scale = entry['displayHeight'] / (bottom - top)
    center = (left + right) / 2
    for variant in entry['variants']:
        recolored = frame.copy()
        for y in range(frame.height):
            for x in range(frame.width):
                # Recolor masks use the familiar 80px review coordinates;
                # map the native source into that space without resampling it.
                cx = 40 + (x + .5 - center) * scale
                cy = 68 + (y + .5 - bottom) * scale
                if any(l <= cx < r and t <= cy < b for l, t, r, b in entry['protectedRegions']):
                    continue
                r, g, b, a = recolored.getpixel((x, y))
                if not a:
                    continue
                for rule in variant['rules']:
                    l, t, rr, bb = rule['box']
                    hue, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                    if l <= cx < rr and t <= cy < bb and saturation >= .18 and value >= .16 and rule['hue'][0] <= hue <= rule['hue'][1]:
                        rgb = colorsys.hsv_to_rgb(rule['targetHue'], saturation, value)
                        r, g, b = [round(c * 255) for c in rgb]
                recolored.putpixel((x, y), (r, g, b, a))
        encoded = BytesIO()
        recolored.save(encoded, format='PNG', optimize=True)
        outputs.append((variant['sprite'], encoded.getvalue()))
for name, data in outputs:
    if len(data) > 131072:
        raise ValueError(f'Image exceeds upload budget: {name}')
args.output_dir.mkdir(parents=True, exist_ok=True)
for name, data in outputs:
    (args.output_dir / f'{name}.png').write_bytes(data)
    print(f'{name}: {len(data)} bytes')
