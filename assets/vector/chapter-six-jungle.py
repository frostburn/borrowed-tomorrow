"""Extend the Chapter Six SVG/Tiled kit with Iria's river journey.
The desert exporter supplies shared map/manifest writers; it runs first.
No raster sources. All scenery remains directly editable planar vector art.
"""
import runpy,math,json
from pathlib import Path
base=runpy.run_path(str(Path(__file__).with_name('chapter-six.py')))
ROOT=base['ROOT']; ART=base['ART']; MAP=base['MAP']; manifest=base['manifest']
rect=base['rect']; poly=base['poly']; line=base['line']; ellipse=base['ellipse']; point=base['point']; obj=base['obj']; control=base['control']; chest=base['chest']; bench=base['bench']
world=base['world']; INK='#233d3c'; WATER='#315c60'; LIGHT='#d1c99b'; WOOD='#9a8660'; GOLD='#bbac72'
def tree(x,y,s=1):
 return [f'<g transform="translate({x} {y}) scale({s})">',poly([(76,191),(82,85),(101,58),(108,86),(111,188),(158,210),(113,203),(95,211),(50,208)],'#5d6550'),poly([(83,190),(89,90),(99,77),(99,197),(72,206)],'#8c8962'),poly([(0,70),(24,21),(93,0),(151,12),(194,55),(180,91),(116,110),(49,98)],'#254b43'),poly([(11,65),(34,30),(93,11),(143,24),(173,56),(111,79),(53,85)],'#50795a'),poly([(19,58),(64,26),(91,18),(119,28),(80,47)],'#739466'),poly([(116,64),(154,39),(178,61),(166,86),(122,100),(79,96)],'#3a6552'),line([(38,85),(44,143),(38,174)],'#70916a',3),'</g>']
def fern(x,y,s=1):
 return [f'<g transform="translate({x} {y}) scale({s})">',poly([(1,49),(13,22),(32,9),(40,12),(28,24),(17,29),(11,49)],'#557e59'),poly([(9,50),(-4,26),(-24,15),(-39,18),(-18,31),(-7,33)],'#729363'),poly([(11,49),(27,33),(50,31),(66,41),(41,40),(24,45)],'#3b6651'),line([(9,49),(20,14)],'#a0a46f',2),'</g>']
def hut(x,y,w=225,h=155):
 return [poly([(x,y+30),(x+w,y+30),(x+w,y+h),(x,y+h)],'#5b6450'),poly([(x+12,y+35),(x+w-12,y+35),(x+w-12,y+h-12),(x+12,y+h-12)],'#a18d68'),poly([(x-24,y+27),(x+w*.4,y-57),(x+w+22,y+24),(x+w-4,y+44),(x+4,y+45)],'#6b8060'),poly([(x-15,y+23),(x+w*.4,y-47),(x+w+12,y+22),(x+w*.45,y-2)],'#91a079'),rect(x+35,y+54,45,65,INK),rect(x+w-72,y+58,41,40,INK),rect(x+13,y+h,10,40,'#47594b'),rect(x+w-23,y+h,10,40,'#47594b'),rect(x+4,y+h-5,w-8,9,LIGHT)]
def riverback():
 out=[rect(0,0,1536,1008,'#668879'),poly([(0,107),(220,64),(457,149),(735,77),(1014,128),(1302,54),(1536,88),(1536,615),(0,615)],'#456c5c'),poly([(0,289),(260,161),(557,278),(820,177),(1095,300),(1322,160),(1536,234),(1536,1008),(0,1008)],'#294f45'),poly([(331,1008),(445,781),(846,562),(899,299),(1083,210),(1271,225),(1057,397),(1094,648),(782,830),(685,1008)],WATER)]
 for y,x in [(454,951),(530,920),(665,889),(747,721),(831,614),(922,524)]:out+=[poly([(x-65,y),(x+110,y-4),(x+141,y+4),(x-18,y+8)],'#638a7c')]
 for x,y,s in [(3,172,1.6),(242,109,1.3),(501,109,1.2),(1139,113,1.5),(1349,254,1.4)]:out+=tree(x,y,s)
 return out

def ground(floor,wood=False):
 p=' '.join(f'M{x*24} {y*24}h{w*24}v{h*24}h{-w*24}Z'for x,y,w,h in floor)
 out=[f'<defs><clipPath id="jungle-floor"><path d="{p}"/></clipPath></defs><g clip-path="url(#jungle-floor)">',rect(0,0,1536,1008,WOOD if wood else '#85906a'),poly([(0,560),(430,448),(802,588),(1254,414),(1536,478),(1536,590),(862,709),(374,624),(0,713)],'#b4af80'if wood else '#a4ae7d'),poly([(0,698),(411,568),(706,670),(1156,539),(1536,610),(1536,770),(840,832),(308,743),(0,862)],'#677a59')]
 if wood:
  for y in range(360,1008,24):out.append(line([(0,y),(1536,y)],'#66745a',2))
 else:
  for x,y in [(382,731),(530,644),(1108,579),(1206,464),(402,565)]:out.append(poly([(x,y),(x+78,y-11),(x+96,y+7),(x+17,y+18)],'#c0bf90'))
 out.append('</g>');cells={(xx,yy)for x,y,w,h in floor for xx in range(x,x+w)for yy in range(y,y+h)}
 for x,y in sorted(cells):
  if(x,y+1)not in cells:out +=[rect(x*24,(y+1)*24,24,15,'#475e4c'),rect(x*24,(y+1)*24-3,24,3,LIGHT)]
 return out

def launch():return [ellipse(111,77,108,14,'#24494b'),poly([(0,32),(44,55),(196,54),(221,28),(204,67),(173,85),(50,84),(18,65)],'#5e705b'),poly([(7,31),(44,45),(192,44),(214,28),(199,51),(47,57)],'#c6bc91'),poly([(38,47),(58,58),(180,57),(194,46)],'#364d49'),rect(70,12,77,33,'#b2b18c'),poly([(55,11),(78,0),(158,0),(171,11)],'#8ba57d'),line([(191,19),(191,71)],GOLD,5)]

havenfloor=[(6,23,26,14),(28,27,17,4),(42,20,18,15)]
haven=riverback()+hut(117,286,298,190)+hut(1048,231,290,207)
for x,y,s in [(0,611,1.4),(1246,562,1.2)]:haven+=tree(x,y,s)
havencast={'kit':(23,30),'orrin':(19,31),'petra':(27,31),'celia':(23,33),'ines':(23,27),'tavi':(31,28)}
world('riverhaven','Iria · the river landing','The river path leaves the eastern quay. Ines is beside the drying racks; the survey launch waits at the western landing.',havenfloor,[(12,23,6,3),(45,20,5,3)],[
 obj('river-ines',23,28,'Ines · Sera’s referral',kind='talk',sprite='ines',hiddenFlag='riverChainOpen'),obj('river-tavi',31,29,'Tavi · the treatment launch',kind='talk',sprite='tavi'),obj('river-canopy',54,22,'Canopy path · the rain house',kind='exit',sign=True),obj('river-ship',9,34,'Survey launch · return aboard',kind='exit',sign=True),obj('river-stores',17,32,'Village shelter · rest and supplies',kind='optional',sign=True),obj('river-notice',27,25,'Drying rack · the next boat',kind='talk',sign=True)],
 {'start':(14,32),'canopy':(50,25),'return':(24,31)}, {'six-river-arrival':havencast,'six-river-thanks':{**havencast,'nell':(28,33)}},
 [point('net-mender',8,28,sprite='civilian-dockhand-rust'),point('waiting-family',26,35,sprite='civilian-family-plum'),point('village-patient',44,29,sprite='civilian-patient-green',hiddenFlag='riverChainOpen'),point('carrying-water',52,29,sprite='civilian-traveler-blue'),point('returning-patient',44,29,sprite='civilian-patient-green',requiredFlag='nellRecovered')],
 [('iria-launch',launch(),224,100,767,626,726,{}),('iria-racks',[rect(0,0,120,6,'#4e6753'),rect(4,6,6,73,GOLD),rect(110,6,6,73,GOLD),poly([(18,8),(100,8),(91,54),(29,60)],'#9daf89'),line([(27,13),(85,54)],'#586f59',3)],125,84,558,542,626,{}),('iria-stores',bench(),168,86,340,680,766,{}),('iria-bank',fern(23,0)+fern(143,20,.8),225,76,104,752,828,{})],haven,ground=ground(havenfloor,True))

forestfloor=[(7,28,22,8),(26,27,14,4),(38,20,19,10),(47,15,9,7),(16,21,8,8)]
forest=riverback()+[poly([(780,390),(900,331),(1060,349),(1110,442),(976,492),(822,467)],'#70846a'),poly([(780,390),(900,331),(1060,349),(1001,379),(828,413)],'#a3ae82')]
forestcast={'kit':(30,29),'orrin':(27,31),'petra':(32,30),'celia':(26,33),'tavi':(31,28)}
world('canopy','Iria · the canopy passage','The old boat chain crosses the middle bridge. The rain house is above the eastern stair; the western shelter stays open.',forestfloor,[(17,21,4,1),(49,15,4,2)],[
 obj('river-patrol',32,29,'Lower crossing · old patrol',doneFlag='riverPatrolWon',sprite='hound-fern',spriteHiddenFlag='riverPatrolWon'),obj('river-chain',33,28,'Boat chain · open the medical passage',doneFlag='riverChainOpen',sign=True),obj('canopy-rainhouse',51,18,'Rain house · treatment terrace',kind='exit',accessFlag='riverChainOpen',sign=True),obj('canopy-village',10,32,'River path · return to Iria',kind='exit',sign=True),obj('canopy-stores',21,32,'Canopy shelter · rest and supplies',kind='optional',sign=True),obj('river-cache',20,23,'Old survey locker · perched patrol',kind='optional',doneFlag='riverCacheWon',sign=True)],
 {'start':(15,32),'chain':(31,29),'rainhouse':(49,20)}, {'six-river-crossing':forestcast,'six-river-chain':forestcast},
 [point('launch-hand',25,34,sprite='civilian-dockhand')],
 [('canopy-launch',launch(),224,100,756,742,-999.5,{}),('river-chain',[line([(0,4),(0,95)],GOLD,7),rect(-6,34,13,23,'#486955'),rect(-17,25,8,55,'#69846a')],50,105,850,639,744,{'requiredFlag':'riverCrossingSeen','hiddenFlag':'riverChainOpen'}),('river-capstan',[ellipse(25,42,24,11,INK),rect(17,15,16,28,GOLD),ellipse(25,17,20,9,LIGHT),line([(6,7),(44,26)],'#d4ca9a',5)],55,58,790,631,689,{}),('forest-cache',chest(),60,48,443,489,537,{}),('forest-shelter',bench(),168,86,419,683,769,{}),('forest-near-fern',fern(35,0)+fern(153,-9),235,71,1042,738,809,{})],forest,ground=ground(forestfloor),gated={'river-chain':[(35,27,1,4)]})

housefloor=[(12,25,40,11),(22,19,21,7),(43,23,7,4)]
house=riverback()+hut(480,235,590,232)+[poly([(378,530),(505,441),(1154,441),(1282,530),(1239,555),(421,555)],'#59785c'),poly([(395,524),(521,456),(1147,456),(1263,524),(845,483)],'#8da57b')]
house+=tree(1111,204,1.4)
party={'kit':(31,29),'orrin':(27,31),'petra':(37,31),'celia':(30,31),'tavi':(40,31)}
care={**party,'nell':(44,31),'ines':(34,25),'tavi':(40,29)}
restcast={**party,'nell':(32,27),'ines':(35,25),'tavi':(42,30)}
world('rainhouse','Iria · the rain house','The treatment terrace is above the open deck. The river launch lands at the eastern rail; supplies are under the western roof.',housefloor,[(25,20,4,3),(38,20,3,3)],[
 obj('rainhouse-guard',33,28,'Treatment terrace · divine hunters',doneFlag='rainhouseWon',sprite='herald',spriteHiddenFlag='rainhouseWon'),obj('river-treatment',32,26,'Treatment bell · bring Nell and the healers',doneFlag='nellRecovered',sign=True),obj('rainhouse-ines',36,26,'Ines · the rain house',requiredFlag='nellRecovered',kind='talk',sprite='ines'),obj('rainhouse-tavi',44,31,'Tavi · return launch',kind='exit',sprite='tavi',sign=True),obj('rainhouse-rest',19,32,'Western awning · rest and supplies',kind='optional',sign=True),obj('rainhouse-canopy',15,33,'Canopy path · return downriver',kind='exit',sign=True)],
 {'start':(32,32),'stand':(32,29),'treatment':(32,29),'return':(29,30)}, {'six-rainhouse':party,'six-river-treatment':care,'six-river-rest':restcast},
 [point('rainhouse-patient',23,25,sprite='civilian-patient-green',requiredFlag='nellRecovered'),point('rainhouse-helper',40,27,sprite='civilian-traveler',requiredFlag='nellRecovered')],
 [('rainhouse-cot',[poly([(0,24),(67,9),(112,31),(49,48)],'#98ac8d'),poly([(0,24),(49,48),(49,58),(0,36)],'#455d4c'),poly([(49,48),(112,31),(112,42),(49,58)],'#6e8568')],116,63,713,561,624,{}),('rainhouse-basin',[ellipse(31,48,30,15,GOLD),ellipse(31,41,25,12,'#85a6a0'),rect(12,52,5,24,INK),rect(46,52,5,24,INK)],65,81,845,552,633,{}),('rainhouse-stores',bench(),168,86,367,684,770,{}),('rainhouse-launch',launch(),224,100,1045,694,794,{}),('rainhouse-ferns',fern(40,15)+fern(157,0),245,93,333,760,853,{})],house,ground=ground(housefloor,True))

for id,title in [('river-patrol','Iria · the lower crossing'),('river-cache','Iria · the old survey locker'),('rainhouse-guard','Iria · the treatment terrace')]:
 floor=[(3,3,34,16)];back=[rect(0,0,1008,480,'#355d50'),poly([(0,175),(218,87),(465,140),(713,68),(1008,141),(1008,480),(0,480)],'#527a58')]
 for x,y,s in [(-40,0,1.3),(809,10,1.3)]:back+=tree(x,y,s)
 world('battle-'+id,title,'',floor,[],[],{'start':(20,17)},{},[],[],back,w=42,h=20,ground=ground(floor,True))

(ROOT/'src/content/chapter-six/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported Iria, canopy, rain house and three tactical floors.')
