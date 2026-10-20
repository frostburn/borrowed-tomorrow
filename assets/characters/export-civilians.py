"""Export the four small native sprites from local generated originals.

Usage: python assets/characters/export-civilians.py SOURCE_DIRECTORY
Large originals stay outside the repository; the manifest pins their hashes.
"""
import hashlib
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
    frame.save(root / f"public/art/{entry['sprite']}.png", optimize=True)
