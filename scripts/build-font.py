"""Build the layout font from the exact masks used by the framebuffer painter.

Requires fonttools. The runtime uses the masks directly; this font gives the
semantic DOM the same character metrics for wrapping and hit targets.
"""
import ast
import re
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

root = Path(__file__).resolve().parent.parent
source = (root / 'src/game/pixel-font.ts').read_text().split('export const GLYPHS')[0]
rows = {}
for key, value in re.findall(r"(\"[^\"]*\"|'(?:\\.|[^'])*'|[a-zA-Z])\s*:\s*(\[(?:'[^']*'\s*,?\s*)+\])", source):
    rows[key if len(key) == 1 and key.isalpha() else ast.literal_eval(key)] = ast.literal_eval(value)
font = FontBuilder(1000, isTTF=True)
order = ['.notdef'] + ['g' + str(ord(c)) for c in rows]
font.setupGlyphOrder(order)
characters = {ord(c): 'g' + str(ord(c)) for c in rows}
for char, replacement in {'’':"'", '‘':"'", '“':'"', '”':'"', '−':'-', '—':'-', '–':'-'}.items():
    characters[ord(char)] = characters[ord(replacement)]
font.setupCharacterMap(characters)
glyphs = {}
for name in order:
    mask = rows[chr(int(name[1:]))] if name != '.notdef' else rows['?']
    pen = TTGlyphPen(None)
    for y, row in enumerate(mask):
        for x, bit in enumerate(row):
            if bit != '1':
                continue
            px, py = x * 100, (6 - y) * 100 + 100
            pen.moveTo((px, py))
            pen.lineTo((px + 100, py))
            pen.lineTo((px + 100, py + 100))
            pen.lineTo((px, py + 100))
            pen.closePath()
    glyphs[name] = pen.glyph()
font.setupGlyf(glyphs)
font.setupHorizontalMetrics({name: (600, 0) for name in order})
font.setupHorizontalHeader(ascent=800, descent=-200)
font.setupNameTable({'familyName': 'Switchyard', 'styleName': 'Regular', 'uniqueFontIdentifier': 'Switchyard 1.0', 'fullName': 'Switchyard', 'psName': 'Switchyard', 'version': 'Version 1.0'})
font.setupOS2(sTypoAscender=800, sTypoDescender=-200, sTypoLineGap=0, usWinAscent=800, usWinDescent=200)
font.setupPost()
font.font.flavor = 'woff'
font.save(root / 'src/game/switchyard.woff')
print(f'Built Switchyard: {len(rows)} glyphs')
