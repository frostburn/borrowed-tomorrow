"""Chapter Six perimeters, colored cutaways and visible light fixtures.

Gate necks stay inside their full blocking rows. Moving cinematic pieces are
assigned individual live layers by the shared writer, never flattened away.
"""
import json
from pathlib import Path
from scene_lighting import spill
from chapter_six_floors import floor_paint,poly,line

ROOT=Path(__file__).resolve().parents[2]
LIGHTS=json.loads((ROOT/'src/content/chapter-six/lighting.json').read_text())
OUTLINES={
 'outermooring':[(290,544),(690,526),(702,436),(856,426),(874,528),(1240,546),(1260,846),(1020,878),(760,856),(464,880),(300,852)],
 'namar':[(98,546),(474,526),(490,414),(1168,400),(1184,454),(1434,472),(1450,872),(1120,896),(822,878),(816,720),(744,720),(738,878),(416,898),(110,874)],
 'sunpalace':[(196,656),(236,642),(248,538),(472,526),(488,438),(1046,426),(1062,526),(1314,542),(1328,778),(864,790),(864,856),(650,870),(648,790),(198,784)],
 'skywalk':[(194,686),(640,670),(658,582),(760,574),(778,488),(1098,478),(1110,366),(1312,352),(1330,566),(1290,582),(1288,640),(866,648),(860,764),(744,776),(738,834),(446,856),(204,832)],
 'observatory':[(292,566),(520,550),(538,438),(996,426),(1016,550),(1240,566),(1258,850),(1020,882),(764,860),(488,884),(302,852)],
 'riverhaven':[(146,570),(762,550),(774,642),(1002,648),(1016,488),(1434,472),(1452,822),(1220,854),(1008,836),(1008,744),(768,744),(762,880),(460,902),(158,874)],
 'canopy':[(172,686),(378,670),(394,510),(566,498),(584,670),(624,672),(624,648),(906,648),(918,486),(1122,474),(1134,368),(1336,352),(1376,706),(960,720),(960,744),(696,744),(690,856),(410,880),(180,858)],
 'rainhouse':[(292,614),(520,598),(538,462),(1022,450),(1040,550),(1192,558),(1208,598),(1240,610),(1260,848),(1010,880),(754,858),(484,882),(302,850)],
 'bellharbor':[(148,590),(594,574),(610,462),(1098,450),(1110,392),(1336,378),(1350,520),(1272,536),(1288,580),(1308,872),(1040,900),(756,878),(430,902),(158,874)],
 'frostwatch':[(172,686),(666,670),(682,582),(954,574),(968,554),(1128,552),(1128,438),(1336,426),(1344,618),(1054,624),(1050,766),(768,780),(760,858),(460,882),(182,858)],
 'glacier':[(148,688),(426,670),(442,510),(662,498),(682,596),(954,600),(970,438),(1336,426),(1350,656),(1056,672),(1050,786),(696,804),(690,858),(420,882),(158,858)],
 'wintershrine':[(292,614),(544,598),(562,462),(974,450),(992,598),(1240,614),(1258,850),(1010,882),(766,860),(490,884),(302,852)],
 'capitalquay':[(244,592),(618,574),(634,414),(926,402),(944,574),(1312,592),(1332,850),(1060,884),(778,860),(466,886),(254,852)],
 'stillcity':[(242,588),(594,570),(606,388),(946,378),(956,570),(1288,584),(1308,850),(1060,876),(756,858),(430,880),(248,856)],
 'lastpalace':[(218,614),(474,594),(488,438),(618,426),(630,316),(928,308),(942,434),(1070,446),(1086,592),(1312,610),(1330,874),(1060,902),(764,878),(450,904),(230,876)],
 'crown':[(292,592),(570,574),(586,438),(974,426),(992,574),(1240,592),(1260,850),(1020,884),(764,860),(494,884),(302,852)],
}
FIXTURES={
 'outermooring':[(465,784),(1128,800)],'namar':[(348,796),(1230,772)],
 'sunpalace':[(340,718),(1190,706)],'skywalk':[(362,774),(1198,534)],'observatory':[(416,734),(1144,728)],
 'riverhaven':[(318,786),(1288,750)],'canopy':[(298,788),(1200,636)],'rainhouse':[(562,742),(1090,742)],
 'bellharbor':[(554,790),(1194,760)],'frostwatch':[(530,776),(1232,494)],'glacier':[(340,786),(1194,584)],'wintershrine':[(498,778),(1108,758)],
 'capitalquay':[(526,798),(1174,790)],'stillcity':[(470,788),(1138,790)],'lastpalace':[(552,780),(1216,786)],'crown':[(492,742),(1120,742)],
}
def path(pts):return 'M'+' L'.join(f'{x:g},{y:g}'for x,y in pts)+' Z'
def cells(pts,w,h):
 def inside(x,y):
  result=False
  for (ax,ay),(bx,by)in zip(pts,pts[1:]+pts[:1]):
   if (ay>y)!=(by>y)and x<(bx-ax)*(y-ay)/(by-ay)+ax:result=not result
  return result
 return [3 if inside(x*24+12,y*24+12)else 0 for y in range(h)for x in range(w)]
def floor_shapes(pts,w,h,scene,arena=False):
 out=[f'<defs><clipPath id="floor"><path d="{path(pts)}"/></clipPath></defs><g clip-path="url(#floor)">',*floor_paint(w,h,scene,arena),'</g>']
 if not arena:
  icy=scene in ('bellharbor','frostwatch','glacier','wintershrine');royal=scene in ('capitalquay','stillcity','lastpalace','crown')
  shade='#6e96a6'if icy else'#9baeb8'if royal else'#63745f'if scene in ('riverhaven','canopy','rainhouse')else'#786452'
  lip='#dce6df'if icy or royal else'#b5b28b'
  for a,b in zip(pts,pts[1:]+pts[:1]):
   if b[0]<a[0]:out.extend([poly([b,a,(a[0],a[1]+18),(b[0],b[1]+18)],shade),line([a,b],lip,3)])
 return out
def lean(body,ground,shear=.025):
 return [f'<g transform="matrix(1 0 {shear} 1 {-ground*shear} 0)">',*body,'</g>']
def fixture_kind(scene):
 if scene in ('riverhaven','canopy','rainhouse'):return 'iria-lantern'
 if scene in ('bellharbor','frostwatch','glacier','wintershrine'):return 'skeld-lantern'
 if scene in ('capitalquay','stillcity','lastpalace','crown'):return 'royal-globe'
 return 'namar-opal'
def fixture(kind):
 out=[poly([(8,137),(36,137),(44,143),(2,143)],'#768982'),line([(24,136),(20,42)],'#819184',5),line([(22,134),(18,43)],'#b7b89b',2)]
 if kind=='iria-lantern':
  out.extend([line([(20,42),(23,12),(40,12),(40,27)],'#9a9d70',4),poly([(29,30),(47,30),(45,56),(32,56)],'#d2c38d'),line([(31,35),(46,35),(44,51),(33,51),(31,35)],'#a3a376',2),poly([(35,36),(42,34),(41,49),(36,50)],'#f3dfac')])
 elif kind=='skeld-lantern':
  out.extend([poly([(9,42),(13,17),(32,14),(39,41),(31,54),(15,55)],'#8f9b92'),poly([(14,39),(17,22),(29,20),(34,40),(28,49),(18,49)],'#e7c690'),line([(8,43),(39,43)],'#a3b4af',3),poly([(19,26),(24,22),(24,43),(20,42)],'#fae1ac')])
 else:
  out.extend(['<ellipse cx="24" cy="29" rx="12" ry="18" fill="'+('#e6e9d0'if kind=='royal-globe'else'#e9d1a0')+'"/>',poly([(18,20),(24,13),(23,38),(18,37)],'#fff0cc'),line([(14,48),(33,46)],'#b2a67e',4),line([(20,10),(26,8)],'#c4b78d',3)])
 return out
def arena_fixtures(scene):
 out=[]
 scene={'north-watch':'bellharbor','north-hunters':'glacier','north-cache':'glacier','winter-dragon':'wintershrine','river-patrol':'riverhaven','river-cache':'riverhaven','rainhouse-guard':'rainhouse','imperial-vessel':'crown','lightbearer':'crown','palace-command':'lastpalace','capital-procession':'stillcity','capital-hunters':'stillcity'}.get(scene,scene)
 for x in (100,904):out.extend([f'<g transform="translate({x-24} 12)">',*fixture(fixture_kind(scene)),'</g>'])
 return out
def spill_layer(entries,pts):
 field=spill([(Path(e['url']).stem,e['x'],e['y'])for e in entries],LIGHTS['props'])
 return [f'<defs><clipPath id="spill-floor"><path d="{path(pts)}"/></clipPath></defs><g clip-path="url(#spill-floor)">{field}</g>']if field else[]
