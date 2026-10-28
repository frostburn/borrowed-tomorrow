"""Act IV's command deck and the opened capital crossing, in native vectors."""
def export(e):
 rect,poly,line,ellipse,sky,world,obj,point,control,ship,svg=(e[n] for n in ('rect','poly','line','ellipse','sky','world','obj','point','control','ship','svg'))
 ART=e['ART']
 gangway=e['gangway']
 OUTLINES=e['OUTLINES']
 # A real view through the breach: the suspended capital is beyond the cordon.
 capital=[poly([(535,215),(680,156),(858,165),(1015,221),(956,276),(772,309),(600,271)],'#334b55'),poly([(535,215),(680,156),(858,165),(1015,221),(823,254),(650,243)],'#8f9f94')]
 for x,y,w,h in [(620,110,61,111),(696,72,56,148),(765,119,68,112),(848,94,66,136)]:
  capital += [rect(x,y,w,h,'#526b6b'),poly([(x-6,y),(x+w/2,y-23),(x+w+6,y),(x+w,y+10),(x,y+10)],'#b7b795')]
  for yy in range(y+22,y+h-10,24):capital.append(rect(x+15,yy,w-30,9,'#cfbc89'))
 capital += [ellipse(776,75,31,31,'#a9a980'),ellipse(776,75,21,21,'#344d58'),line([(776,20),(776,43)],'#c1b58a',5)]
 opened=sky(1536,350)+capital
 for x,y in [(315,230),(1090,232)]:opened += [poly([(x,y),(x+38,y-12),(x+112,y-8),(x+151,y+5),(x+113,y+24),(x+34,y+22)],'#304e5c'),line([(x+44,y+25),(x+101,y+25)],'#c2af78',4)]
 svg(ART/'ship-open-crossing.svg',1536,350,opened)
 # Ship scenery changes on the actual victory flag, even if the intervention is reloaded.
 e['manifest']['airship'].append({'key':'scene-five-ship-open-crossing','url':'art/vector/chapter-five/ship-open-crossing.svg','x':0,'y':0,'width':1536,'height':350,'depth':-998,'layerId':0})
 # Layer visibility comes from Tiled, as it does for every campaign scene.
 import json
 path=e['MAP']/'airship.json';m=json.loads(path.read_text())
 lid=max(l['id'] for l in m['layers'])+1
 m['layers'].append(e['group'](lid,'The open crossing',requiredFlag='flagshipWon'))
 e['manifest']['airship'][-1]['layerId']=lid
 # The armed formation disappears with the boss, not at chapter departure.
 for l in m['layers']:
  if l['name']=='ship-blockade':l['properties'].append({'name':'hiddenFlag','type':'string','value':'flagshipWon'})
 shipcast={'nell':(32,21),'orrin':(29,23),'kit':(36,24),'petra':(38,25),'celia':(29,26),'alda':(34,19)}
 for sid,cast in {'five-flagship-approach':shipcast,'five-retaliation':{**shipcast,'nell':(30,27),'kit':(32,27),'celia':(29,28)},'five-capital-departure':{**shipcast,'nell':(30,27),'kit':(32,27),'celia':(29,28)}}.items():
  lid+=1;m['layers'].append(e['group'](lid,'Scene:'+sid,[point(k,*v) for k,v in cast.items()]))
 inter=next(l for l in m['layers'] if l['name']=='Interactions')['objects']
 inter.append(obj('ship-nell',30,27,'Nell · the medical berth',kind='talk',sprite='nell-ill',requiredFlag='nellIll',hiddenFlag='nellRecovered'))
 inter.append(obj('ship-herald',35,23,'Forward rail · drive off the hunters',kind='story',sprite='herald',requiredFlag='retaliationSeen',doneFlag='retaliationWon',hiddenFlag='retaliationWon'))
 lid+=1;m['layers'].append(e['group'](lid,'Nell’s berth',sort=True,requiredFlag='nellIll',hiddenFlag='nellRecovered'))
 svg(ART/'ship-berth.svg',108,52,[rect(0,8,108,34,'#233c47'),rect(4,4,100,26,'#d2c8a4'),rect(19,29,6,20,'#486665'),rect(88,29,6,20,'#486665')])
 e['manifest']['airship'].append({'key':'scene-five-ship-berth','url':'art/vector/chapter-five/ship-berth.svg','x':680,'y':628,'width':108,'height':52,'depth':650,'layerId':lid})
 arrivals=next(l for l in m['layers'] if l['name']=='Arrivals')['objects']
 arrivals.append(point('flagship',32,26))
 # Unique IDs and the readable row formatting are reproduced by the common writer.
 e['write_map']('airship','Survey ship · the flight deck','The flight chart is forward. The stores and rest bench are by the aft hatch.',m['layers'])
 # Bridge windows and angular ribs frame a broad, navigable deck. Architecture
 # stays behind the actors; the front edge never covers their faces or feet.
 back=sky(1536,1008)+capital+[poly([(145,435),(276,252),(1210,252),(1387,435),(1387,655),(145,655)],'#1b3340'),poly([(276,252),(400,166),(1090,166),(1210,252)],'#506b6c'),poly([(321,292),(432,207),(1059,207),(1177,292),(1177,451),(321,451)],'#9cb2a6'),poly([(347,386),(533,306),(764,330),(1035,291),(1152,355),(1152,438),(347,438)],'#647e83')]
 for x in (303,545,786,1027,1193):back += [poly([(x,254),(x+17,250),(x+30,454),(x+10,454)],'#263f4a'),line([(x+5,264),(x+17,440)],'#b3a777',3)]
 back += [poly([(890,280),(1165,275),(1115,360),(936,329)],'#334c56'),poly([(930,283),(1098,283),(1025,301),(942,297)],'#c7b98c'),poly([(94,470),(1442,470),(1498,1010),(38,1010)],'#203d49')]
 claimcast={'nell':(28,26),'petra':(30,24),'orrin':(26,27),'kit':(25,29),'celia':(27,30),'alban':(34,22)}
 world('flagship','Flagship · the command deck','The command deck lies below the bridge. The survey ship is at the western rail.',OUTLINES['flagship'],[(25,17,14,3),(46,23,4,3)],
  [control('flagship-evacuate',12,30,(5,28,8,6),'Emergency gangway · survey ship',kind='exit',sign=True),],
  {'start':(28,28),'escape':(12,30)},{'five-benefactor-claim':claimcast},
  [point('imperial-marine-west',38,26,sprite='flagship-crew'),point('imperial-marine-east',40,25,sprite='flagship-crew'),point('imperial-engineer',44,28,sprite='civilian-dockhand-rust')],
  [('flagship-console',[poly([(0,24),(83,0),(290,0),(341,31),(278,88),(60,88)],'#aa9d77'),poly([(0,24),(60,66),(278,66),(341,31),(338,68),(279,109),(60,109),(0,62)],'#334f59'),rect(81,13,178,31,'#1c3543')]+[ellipse(x,27,9,9,'#819b8b') for x in (107,164,221)],344,112,604,374,486,{}),
   ('flagship-rail',[line([(122,610),(122,885),(1412,885),(1412,610)],'#bda772',5)],1536,1008,0,0,-997,{}),
   ('flagship-launch',['<g transform="translate(-42 579) scale(.4)">',*ship(),'</g>'],400,800,0,0,-997,{}),
   ('flagship-gangway',gangway((166,704),(320,790)),400,820,0,0,-996,{}),
   ('flagship-sparks',[poly([(0,12),(35,0),(50,13),(37,20),(59,30),(23,38)],'#5e6b68'),poly([(40,42),(63,31),(77,50),(53,65)],'#7d8780')],90,90,1120,360,-996,{})],back)
