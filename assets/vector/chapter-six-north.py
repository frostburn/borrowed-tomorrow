"""Skeld: snow roofs, glacier wrecks and a winter sanctuary, native SVG over Tiled routes."""
import runpy,json
from pathlib import Path
from chapter_six_style import lean
b=runpy.run_path(str(Path(__file__).with_name('chapter-six-jungle.py')))
ROOT=b['ROOT'];manifest=b['manifest'];world=b['world'];rect=b['rect'];poly=b['poly'];line=b['line'];ellipse=b['ellipse'];obj=b['obj'];point=b['point'];control=b['control'];bench=b['bench'];chest=b['chest']
DARK='#233b55';MID='#4d718b';BLUE='#709bb0';SNOW='#d7e2df';LIGHT='#b0cdd5';WOOD='#725a4d';GOLD='#c8ab75'
def mountains():
 return [rect(0,0,1536,1008,'#7d9eae'),poly([(0,215),(215,74),(340,190),(537,30),(741,223),(1026,57),(1243,220),(1411,75),(1536,165),(1536,1008),(0,1008)],'#53778f'),poly([(145,125),(215,74),(284,141),(226,132),(209,112),(188,142)],SNOW),poly([(431,140),(537,30),(663,148),(560,109),(532,75),(499,128)],LIGHT),poly([(918,139),(1026,57),(1158,161),(1067,128),(1023,95),(990,138)],SNOW),poly([(0,410),(280,252),(551,372),(798,199),(1134,384),(1536,226),(1536,1008),(0,1008)],DARK)]
def house(x,y,w=200,h=170):
 return lean([poly([(x,y),(x+w*.5,y-95),(x+w,y),(x+w,y+h),(x,y+h)],WOOD),poly([(x+w*.5,y-95),(x+w,y),(x+w*.5,y)],'#806554'),poly([(x+w-30,y),(x+w,y),(x+w,y+h),(x+w-30,y+h)],'#494c50'),poly([(x-23,y),(x+w*.5,y-110),(x+w+23,y),(x+w-1,y+12),(x+w*.5,y-73),(x,y+12)],SNOW),poly([(x+w*.5,y-110),(x+w+23,y),(x+w-1,y+12),(x+w*.5,y-73)],LIGHT),rect(x+26,y+35,44,61,DARK),rect(x+w-71,y+35,44,61,DARK),rect(x+35,y+42,12,35,'#c2b787'),rect(x+w-62,y+42,12,35,'#c2b787'),rect(x+15,y+h-18,w-30,6,SNOW)],y+h,-.025)

def bell():return [rect(4,0,9,108,WOOD),rect(81,0,9,108,WOOD),poly([(0,0),(47,-24),(95,0)],SNOW),rect(13,5,68,8,GOLD),poly([(35,22),(60,22),(64,56),(74,65),(24,65),(33,53)],GOLD),ellipse(49,66,25,7,DARK),line([(49,13),(49,99)],LIGHT,3)]
def ship(x,y,s=1):
 return [f'<g transform="translate({x} {y}) scale({s})">',poly([(0,49),(47,69),(242,58),(302,21),(274,93),(216,120),(76,125),(24,99)],'#384c5b'),poly([(4,48),(47,63),(240,53),(297,22),(258,50),(220,78),(63,85)],SNOW),poly([(56,61),(102,46),(224,36),(247,48),(215,68),(78,79)],WOOD),rect(109,11,78,42,MID),poly([(97,11),(146,-10),(199,9)],SNOW),line([(230,42),(219,-48)],GOLD,5),'</g>']

def wreckship(x,y,s=1):
 return [f'<g transform="translate({x} {y}) scale({s})">',
 poly([(0,49),(47,69),(168,60),(177,77),(199,49),(242,58),(302,21),(274,93),(216,120),(76,125),(24,99)],'#384c5b'),
 poly([(4,48),(47,63),(164,55),(177,77),(199,49),(240,53),(297,22),(258,50),(220,78),(63,85)],SNOW),
 poly([(56,61),(102,46),(164,38),(177,77),(148,72),(78,79)],WOOD),rect(109,11,64,42,MID),
 poly([(97,11),(146,-10),(177,8),(167,16),(142,6),(113,21)],SNOW),rect(135,-36,18,44,DARK),rect(131,-39,25,7,GOLD),
 line([(230,42),(243,2),(258,-28)],WOOD,5),line([(36,94),(25,136),(15,140)],GOLD,4),line([(60,104),(56,149),(62,154)],GOLD,4),
 poly([(33,109),(106,97),(141,111),(170,96),(184,119),(227,101),(279,97),(260,143),(153,157),(67,144)],BLUE),
 poly([(33,109),(106,97),(141,111),(170,96),(184,119),(149,127),(87,118)],LIGHT),
 poly([(227,101),(279,97),(260,143),(248,126),(200,138)],SNOW),'</g>']

def caveback():return mountains()+[poly([(178,690),(110,286),(300,94),(598,148),(768,73),(1128,100),(1410,322),(1352,690)],MID),poly([(329,636),(356,277),(552,189),(791,232),(1017,178),(1204,297),(1241,636)],DARK),poly([(110,286),(300,94),(598,148),(530,212),(328,188),(216,358)],LIGHT),poly([(1128,100),(1410,322),(1352,690),(1266,504),(1223,281)],BLUE)]
party={'kit':(30,29),'orrin':(27,30),'petra':(34,30),'celia':(30,32),'nell':(29,32),'signe':(33,27),'egil':(37,29)}
harborfloor=[(6,24,48,13),(25,19,28,6),(46,16,10,6)]
harbor=mountains()+[rect(0,430,1536,578,'#345a75'),poly([(0,726),(391,598),(710,716),(1197,553),(1536,615),(1536,1008),(0,1008)],'#426e87')]+house(129,355,290,206)+house(497,270,260,203)+house(1012,171,300,263)
world('bellharbor','Skeld · the bell harbor','The king meets the expedition at the northern bell. The covered mountain passage begins above the eastern quay.',harborfloor,[(8,24,8,2),(22,24,5,2),(45,19,5,2)],[
 obj('north-king',34,24,'King Edric · the northern pact',sprite='edric',hiddenFlag='northSeen'),obj('north-signe',39,28,'Signe · the mountain expedition',sprite='signe',kind='talk'),obj('north-egil',25,29,'Egil · the harbor bells',sprite='egil',kind='talk'),obj('harbor-stores',17,32,'Harbor shelter · rest and supplies',kind='optional',sign=True),obj('harbor-watch',52,18,'Covered passage · Frostwatch',kind='exit',accessFlag='northSeen',sign=True),obj('harbor-ship',9,34,'Survey launch · return aboard',kind='exit',sign=True),obj('north-records',34,24,'Open records · the relief fleet',requiredFlag='northSealBroken',kind='talk',sign=True)],
 {'start':(14,33),'watch':(50,23),'return':(32,29)}, {'six-north-arrival':{**party,'edric':(34,24)},'six-north-return':{**party,'edric':(34,24)}},
 [point('harbor-fisher',12,29,sprite='civilian-dockhand-rust'),point('harbor-family',43,32,sprite='civilian-family-blue'),point('harbor-patient',20,34,sprite='civilian-patient-green'),point('harbor-loader',49,25,sprite='civilian-traveler-blue')],
 [('harbor-bell',bell(),98,114,758,452,566,{}),('harbor-launch',ship(0,0,.8),250,110,142,863,973,{}),('harbor-shelter',bench('skeld'),168,86,325,673,759,{}),('harbor-rail',[line([(129,576),(1110,576)],LIGHT,4)],1200,600,0,0,-997,{})],harbor)
watchfloor=[(7,28,25,8),(28,24,16,8),(40,23,16,3),(47,18,9,5)]
watch=mountains()+house(610,285,325,214)+[poly([(1093,220),(1189,201),(1412,373),(1392,535),(1310,533),(1326,383)],MID),poly([(1130,258),(1191,242),(1355,381),(1337,532),(1220,532),(1246,372)],DARK)]
world('frostwatch','Skeld · Frostwatch passage','The imperial signal post holds the covered passage. The windlass lifts its gate; the western shelter is out of the wind.',watchfloor,[(28,24,6,2)],[
 obj('north-watch',35,28,'Signal post · imperial winter patrol',hiddenFlag='northWatchWon',doneFlag='northWatchWon',sprite='guardian-frost'),obj('north-windlass',43,24,'Gate windlass · reopen the expedition route',hiddenFlag='northPassOpened',doneFlag='northPassOpened',sign=True),obj('watch-glacier',51,21,'Covered passage · the glacier wrecks',kind='exit',accessFlag='northPassOpened',sign=True),obj('watch-harbor',10,32,'Harbor road · return to Skeld',kind='exit',sign=True),obj('watch-rest',21,31,'Signal shelter · rest and supplies',kind='optional',sign=True)],
 {'start':(15,32),'gate':(40,28),'glacier':(48,23)}, {'six-north-watch':party,'six-north-gate':{**party,'signe':(43,25),'orrin':(42,26)}},
 [point('expedition-porter',23,33,sprite='civilian-traveler-blue')],
 [('watch-windlass',[rect(15,25,45,19,WOOD),ellipse(39,24,25,12,GOLD),line([(6,13),(72,31)],LIGHT,5),rect(16,37,7,25,DARK),rect(55,37,7,25,DARK)],80,66,1020,520,586,{}),('north-pass-gate',[rect(0,0,240,55,DARK),line([(0,15),(240,15)],LIGHT,5),line([(0,40),(240,40)],GOLD,5)],240,60,1128,524,584,{'hiddenFlag':'northPassOpened'}),('watch-bench',bench('skeld'),168,86,433,665,751,{})],watch,gated={'north-pass-gate':[(47,22,9,1)]})
glacierfloor=[(6,28,23,8),(26,25,18,8),(40,18,16,10),(18,21,10,9)]
ices=mountains()+[poly([(0,620),(294,390),(644,460),(877,243),(1197,416),(1536,248),(1536,1008),(0,1008)],BLUE),poly([(0,620),(294,390),(644,460),(491,534),(224,481)],SNOW),poly([(877,243),(1197,416),(1077,503),(909,330),(734,460)],LIGHT),poly([(1090,676),(1290,560),(1536,610),(1536,1008),(1189,930)],DARK)]+wreckship(205,405,1.13)+wreckship(890,263,.9)
ices += [poly([(5,722),(58,741),(160,717),(139,767),(55,787),(13,757)],DARK),poly([(8,722),(58,735),(160,717),(117,745),(54,755)],SNOW),poly([(21,812),(67,827),(145,806),(128,849),(62,867),(28,846)],DARK),poly([(25,812),(67,821),(145,806),(116,833),(60,841)],LIGHT),rect(58,733,25,12,WOOD),rect(60,824,22,10,WOOD)]
world('glacier','Skeld · the relief fleet','The wreck’s dispatch cabin is beside the lower ice walk. The sanctuary path climbs above the eastern shelf.',glacierfloor,[(19,21,6,2),(42,18,7,2)],[
 control('north-log',24,25,(22,22,4,3),'Dispatch cabin · the frozen relief fleet',doneFlag='northLogRead',hiddenFlag='northLogRead',sign=True),obj('north-hunters',43,25,'Upper shelf · divine hunters',doneFlag='northHuntersWon',hiddenFlag='northHuntersWon',sprite='herald'),obj('glacier-shrine',52,21,'Winter sanctuary · the upper path',kind='exit',accessFlag='northHuntersWon',sign=True),obj('glacier-watch',9,32,'Covered passage · return to Frostwatch',kind='exit',sign=True),obj('glacier-cache',20,23,'Relief stores · perched patrol',kind='optional',hiddenFlag='northCacheWon',doneFlag='northCacheWon',sign=True),obj('glacier-rest',32,30,'Wreck shelter · rest and supplies',kind='optional',sign=True)],
 {'start':(14,32),'wreck':(27,28),'shrine':(49,24)}, {'six-north-wrecks':{**party,'egil':(23,26),'signe':(27,25)}},
 [],[('glacier-dispatch',[rect(0,17,71,42,DARK),poly([(0,17),(13,0),(58,0),(71,17)],MID),rect(7,20,5,33,GOLD),rect(59,20,5,33,GOLD),rect(27,30,17,12,LIGHT),line([(34,27),(34,44)],GOLD,3)],74,63,548,538,601,{'hiddenFlag':'northLogRead'}),('glacier-dispatch-open',[rect(0,20,71,39,DARK),poly([(0,20),(2,0),(70,0),(71,20)],MID),rect(8,27,55,23,WOOD),poly([(18,28),(47,24),(53,44),(22,48)],SNOW),rect(7,20,5,33,GOLD),rect(59,20,5,33,GOLD)],74,63,548,538,601,{'requiredFlag':'northLogRead'}),('glacier-bench',bench('skeld'),168,86,696,673,759,{}),('glacier-cache',chest(),60,48,445,492,540,{}),('glacier-ice-face',[poly([(0,0),(87,31),(130,144),(72,174),(22,124)],LIGHT),poly([(0,0),(32,77),(22,124),(72,174),(17,160),(-13,56)],SNOW)],150,180,1304,641,-998,{})],ices)
shrines=[(12,25,40,11),(23,19,18,7)]
shrine=caveback()+[poly([(612,340),(768,245),(931,340),(921,454),(612,454)],'#45667e'),line([(649,352),(768,284),(890,352)],LIGHT,8)]
drag=runpy.run_path(str(ROOT/'assets/bosses/export-winter-dragon.py'))['dragon']
world('wintershrine','Skeld · the winter sanctuary','The winter dragon holds the pact bell above the ice walk. Egil’s expedition camp is sheltered at the southern arch.',shrines,[(27,19,10,3)],[
 obj('north-dragon',32,25,'Winter dragon · the pact sanctuary',hiddenFlag='winterDragonWon',doneFlag='winterDragonWon',sign=True),control('north-release',32,22,(28,17,9,5),'Pact bell · release the northern seal',hiddenFlag='northSealBroken',doneFlag='northSealBroken',sign=True),obj('shrine-rest',19,31,'Expedition camp · rest and supplies',kind='optional',sign=True),obj('shrine-glacier',15,33,'Glacier walk · return to the harbor',kind='exit',sign=True),obj('shrine-home',45,31,'Signe · return expedition',kind='exit',requiredFlag='northSealBroken',sprite='signe',sign=True)],
 {'start':(32,32),'stand':(32,28),'release':(32,24)}, {'six-north-shrine':party,'six-north-release':{**party,'signe':(32,23),'egil':(36,25)}},
 [point('sanctuary-porter',22,31,sprite='civilian-dockhand-rust')],
 [('shrine-dragon',drag(),528,280,504,262,542,{'hiddenFlag':'winterDragonWon'}),('shrine-bell',bell(),98,114,718,383,497,{}),('shrine-camp',bench('skeld'),168,86,369,689,775,{})],shrine)

def patient_hoist(ready=False):
 # A crooked royal quay crane; the manual repair shares its existing footing.
 out=[poly([(22,174),(80,160),(142,178),(84,201),(23,190)],'#899a96'),poly([(23,190),(84,201),(142,178),(142,194),(84,214),(23,202)],'#536f80'),poly([(72,25),(83,23),(91,173),(78,179)],'#547c72'),poly([(83,23),(90,26),(99,174),(91,173)],'#355b58'),poly([(46,26),(153,7),(162,21),(53,41)],'#c8ab75'),poly([(53,41),(162,21),(162,30),(55,49)],'#8e795b'),line([(49,31),(151,13)],'#ead7a3',3),poly([(83,56),(89,66),(145,27),(137,26)],'#809b8c'),ellipse(147,30,14,15,'#9b835b'),ellipse(147,30,8,9,'#d9c18b'),line([(147,26),(147,112)],'#d0b479',3),poly([(139,114),(147,124),(154,113),(154,143),(143,149),(136,140)],'#a0b3ac'),ellipse(76,139,23,19,'#8d785b'),ellipse(76,136,18,15,'#c8ab75'),ellipse(76,136,8,7,'#547c72')]
 if ready:
  out.extend([poly([(28,180),(35,183),(80,93),(72,93)],'#8c6d4f'),poly([(35,183),(40,180),(84,96),(80,93)],'#b19368'),line([(47,157),(147,128)],'#c7b28b',3),line([(40,151),(63,137)],'#a7bab0',5),ellipse(38,153,5,5,'#d5c69b'),poly([(64,126),(86,121),(96,140),(72,148)],'#7f9b8c'),line([(67,128),(87,126)],'#d9c18b',3)])
 else:
  out.extend([poly([(67,122),(81,122),(76,134),(88,141),(72,150),(61,140)],'#8d5b4e'),line([(70,121),(74,132),(69,141)],'#d4ad84',3),line([(47,161),(83,159),(113,171),(145,144)],'#ac9a75',3),poly([(30,183),(48,179),(52,188),(33,193)],'#9b835b')])
 return out

quay=[(10,24,45,12),(26,17,13,8)]
royal=b['base']['capital'][:]
world('capitalquay','The capital · allied landing','The landing bridge is open. Namar’s barges and Skeld’s launches can reach the white quay; the inner capital continues in the next adventure.',quay,[(12,24,5,2),(48,24,4,2),(47,30,6,2)],[
 obj('capital-stores',20,31,'Allied shelter · rest and supplies',kind='optional',sign=True),obj('capital-return',13,33,'Survey launch · return to the flight chart',kind='exit',sign=True),obj('capital-inner',32,19,'Inner capital · next adventure',kind='talk',hiddenFlag='emperorWon',sign=True),obj('capital-after',32,19,'Alda · the open capital',kind='talk',requiredFlag='emperorWon',sign=True),obj('capital-crew',40,28,'Alda · the allied landing',kind='talk',sprite='alda',hiddenFlag='capitalLandingSeen'),obj('capital-departure',40,28,'Alda · prepare the final crossing',sprite='alda',requiredFlag='capitalLandingSeen',storyUntil='chapterSixComplete')],
 {'start':(32,31)}, {'six-capital-open':{**party,'alda':(34,25)},'six-capital-quay':{**party,'alda':(34,25)}},
 [point('capital-cart',42,33,sprite='civilian-dockhand'),point('capital-woman',27,27,sprite='civilian-traveler-blue'),point('western-boat-hand',18,28,sprite='civilian-dockhand-rust'),point('northern-navigator',48,28,sprite='civilian-traveler'),point('hammerplain-fitter',44,29,sprite='civilian-dockhand-rust')],
 [('capital-bench',bench('royal'),168,86,402,674,760,{}),('capital-hoist-damaged',patient_hoist(),168,216,1110,550,751,{'hiddenFlag':'capitalStreetFreed'}),('capital-hoist-hand',patient_hoist(True),168,216,1110,550,751,{'requiredFlag':'capitalStreetFreed'})],royal)
for id,title in [('north-watch','Frostwatch patrol'),('north-hunters','The glacier hunters'),('north-cache','Relief stores'),('winter-dragon','The winter sanctuary')]:
 f=[(3,3,34,16)];back=[rect(0,0,1008,480,DARK),poly([(0,70),(200,5),(440,76),(705,0),(1008,60),(1008,480),(0,480)],MID)]
 if id=='winter-dragon':back+=[poly([(0,85),(100,0),(275,35),(190,126),(61,142),(0,227)],LIGHT),poly([(1008,65),(911,0),(740,27),(814,129),(962,143),(1008,237)],BLUE)]
 world('battle-'+id,title,'',f,[],[],{'start':(20,17)},{},[],[],back,w=42,h=20)
(ROOT/'src/content/chapter-six/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported Skeld, Frostwatch, glacier, winter sanctuary, allied landing and four tactical floors.')
