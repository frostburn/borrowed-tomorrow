"""Build compact 3x5 masks with 2px cells and an 8px advance at font-size 10.
The invisible DOM uses this font for exactly the same metrics as bitmapText.
Requires task-environment fonttools, never a production dependency.
"""
import json
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'src/game/small-font.json').read_text())
for c in 'abcdefghijklmnopqrstuvwxyz':rows[c]=rows[c.upper()]
for c,r in {'♯':'#','’':"'",'‘':"'",'“':'"','”':'"','−':'-','—':'-','–':'-'}.items():rows[c]=rows[r]
font=FontBuilder(1000,isTTF=True);order=['.notdef']+['g'+str(ord(c)) for c in rows]
font.setupGlyphOrder(order);font.setupCharacterMap({ord(c):'g'+str(ord(c)) for c in rows})
glyphs={}
for name in order:
 mask=rows[chr(int(name[1:]))] if name!='.notdef' else rows['?'];pen=TTGlyphPen(None)
 for y,row in enumerate(mask):
  for x,bit in enumerate(row):
   if bit!='1':continue
   px=x*200;py=(4-y)*200
   pen.moveTo((px,py));pen.lineTo((px+200,py));pen.lineTo((px+200,py+200));pen.lineTo((px,py+200));pen.closePath()
 glyphs[name]=pen.glyph()
font.setupGlyf(glyphs);font.setupHorizontalMetrics({n:(800,0) for n in order});font.setupHorizontalHeader(ascent=1000,descent=0)
font.setupNameTable({'familyName':'Switchyard Compact','styleName':'Regular','uniqueFontIdentifier':'SwitchyardCompact 1.0','fullName':'Switchyard Compact','psName':'SwitchyardCompact','version':'Version 1.0'})
font.setupOS2(sTypoAscender=1000,sTypoDescender=0,sTypoLineGap=0,usWinAscent=1000,usWinDescent=0);font.setupPost();font.font.flavor='woff'
font.font['head'].created=font.font['head'].modified=3500000000
font.save(root/'src/game/switchyard-small.woff');print('Built Switchyard Compact')
