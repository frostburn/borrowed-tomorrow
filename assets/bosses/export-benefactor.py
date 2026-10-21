#!/usr/bin/env python3
"""Derive a vector portrait from the editable, whole Benefactor SVG.

Usage: python3 assets/bosses/export-benefactor.py
No bitmap input, panel assembly or resizing is involved. The boss and domain
SVGs are editable originals and this exporter never overwrites them.
"""
from pathlib import Path
from xml.etree import ElementTree as ET

root=Path(__file__).resolve().parents[2]
art=root/'src/dev/art'
source=(art/'benefactor.svg').read_text()
svg=ET.fromstring(source)
assert (svg.attrib['width'],svg.attrib['height'])==('360','288')
# Keep the same native face/chest framing as the approved preview.
portrait=source.replace('width="360" height="288" viewBox="0 0 360 288"',
                        'width="128" height="128" viewBox="116 20 128 128"',1)
assert portrait!=source
portrait=portrait.replace('<title>The Benefactor</title>', '<title>The Benefactor, portrait</title>',1)
target=art/'benefactor-portrait.svg'
target.write_text(portrait)
assert target.stat().st_size<=131072
print(f'{target.relative_to(root)}: {target.stat().st_size} bytes; vector viewBox crop, no raster conversion')
