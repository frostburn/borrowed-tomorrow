"""Authored river/cave silhouettes around Chapter One's unchanged routes.

Long banks and rock faces need deliberate large-scale shapes; displacing a
rectangular tile contour a few pixels cannot give them their own geography.
"""
import re


def poly(points, color):
    return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in points)+'" fill="'+color+'"/>'


def stroke(points, color, width=2):
    return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}"/>'


# The river bends beyond the routes, then narrows at the two existing crossings.
# Both banks use these vertices, including the land clip on the paths layer.
WEST=[(514,0),(488,81),(519,167),(478,252),(505,320),(503,360),
      (488,401),(502,435),(500,478),(482,527),(436,591),(410,672)]
EAST=[(658,0),(685,91),(674,183),(690,271),(661,320),(655,360),
      (669,407),(653,442),(664,485),(704,540),(754,607),(770,672)]
RIVER=WEST+EAST[::-1]


def river_land(w,h):
    return poly([(0,0)]+WEST+[(0,h)],'#fff')+poly([(w,0)]+EAST+[(w,h)],'#fff')


def river():
    out=['<defs><clipPath id="rill-water">',poly(RIVER,'#fff'),'</clipPath></defs>']
    # Rock undercuts, shallow shelves and lit upper banks follow the same bends.
    for bank,side in ((WEST,-1),(EAST,1)):
        widths=[30,24,16,33,18,20,28,12,20,29,38,25]
        out.append(poly([(x+side*width,y)for (x,y),width in zip(bank,widths)]+bank[::-1],'#334950'))
        out.append(poly([(x+side*width*.3,y)for (x,y),width in zip(bank,widths)]+bank[::-1],'#53666b'))
        out.append(poly(bank+[(x-side*9,y+7)for x,y in bank[::-1]],'#142f40'))
    out+=['<g clip-path="url(#rill-water)">',poly(RIVER,'#284b63'),
          poly([(547,0),(559,112),(552,220),(531,327),(535,426),(523,520),(481,608),(464,672),(550,672),(553,570),(566,469),(568,367),(575,241),(589,136),(582,0)],'#315c74'),
          poly([(637,0),(616,107),(644,198),(620,292),(614,401),(633,495),(691,588),(707,672),(790,672),(717,0)],'#203e56')]
    # Unequal ribbons follow local current; avoid the old full-map ripple grid.
    for points in [[(528,33),(556,29),(581,34),(548,36)],[(611,73),(639,69),(652,72),(625,75)],
                   [(539,121),(571,119),(591,124),(559,126)],[(578,174),(612,169),(629,173),(603,177)],
                   [(534,219),(559,216),(582,220),(546,224)],[(593,266),(624,262),(644,266),(613,270)],
                   [(526,308),(557,304),(578,307),(547,311)],[(543,391),(570,387),(590,390),(566,394)],
                   [(532,499),(557,495),(582,501),(550,504)],[(574,533),(606,530),(633,535),(601,538)],
                   [(493,577),(531,573),(555,577),(519,581)],[(594,614),(628,609),(658,613),(624,618)],
                   [(520,658),(547,654),(579,659),(545,663)]]:
        out.append(poly(points,'#60869a'))
    out.append('</g>')
    # Irregular bank stones and a few reeds make the water's scale legible.
    for x,y,s in [(493,100,1),(682,231,.8),(481,283,.8),(682,510,1),(440,590,1.2),(752,636,.7)]:
        def p(points,c):return poly([(x+xx*s,y+yy*s)for xx,yy in points],c)
        out += [p([(-17,0),(-8,-16),(11,-20),(26,-8),(18,8),(-4,11)],'#3c5360'),
                p([(-17,0),(-8,-16),(11,-20),(5,-5)],'#6b7c83'),
                p([(5,-5),(11,-20),(26,-8),(18,8)],'#4c6370')]
    for x,y,lean in [(504,172,-1),(688,293,1),(457,538,-1),(745,580,1)]:
        out += [stroke([(x-7,y+4),(x-8+lean*4,y-19),(x-12+lean*6,y-25)],'#647d70',3),
                stroke([(x,y+5),(x+lean*3,y-27),(x+lean*9,y-33)],'#80907b',3),
                stroke([(x+8,y+5),(x+10+lean*5,y-13)],'#4c6b67',3)]
    out += [poly([(452,428),(485,422),(503,431),(501,467),(477,476),(454,468)],'#607381'),
            poly([(454,460),(480,464),(501,457),(501,467),(477,476),(454,468)],'#384f60'),
            poly([(652,426),(683,419),(706,430),(705,464),(666,477),(652,464)],'#6b7a87'),
            poly([(652,456),(674,465),(705,454),(705,464),(666,477),(652,464)],'#3c5265')]
    return ''.join(out)


def crossing(name):
    if name=='river-wall':
        # A single open, faceted masonry arch, rather than a solid wall stamped
        # with small black arches. Its opening shows the actual river beneath.
        return ''.join([
            poly([(0,10),(192,6),(192,96),(171,96),(169,71),(145,43),(111,30),(77,34),(45,52),(27,77),(25,96),(0,96)],'#3d4c63'),
            poly([(25,96),(27,77),(45,52),(77,34),(111,30),(145,43),(169,71),(171,96),(161,96),(159,75),(139,51),(109,39),(80,42),(52,59),(37,80),(35,96)],'#6c7b8a'),
            poly([(37,96),(37,80),(52,59),(80,42),(109,39),(139,51),(159,75),(161,96),(153,96),(151,79),(134,58),(108,47),(83,50),(59,65),(45,84),(45,96)],'#263d52'),
            poly([(0,4),(192,0),(192,11),(0,17)],'#8a959d'),
            poly([(0,17),(192,11),(192,23),(0,30)],'#53647b'),
            poly([(100,29),(111,27),(118,34),(110,45),(100,41)],'#a0a69f'),
            stroke([(27,77),(37,80)],'#3d4c63',2),stroke([(45,52),(52,59)],'#3d4c63',2),
            stroke([(77,34),(80,42)],'#3d4c63',2),stroke([(145,43),(139,51)],'#3d4c63',2),
            poly([(1,70),(17,64),(17,96),(0,96)],'#2c4055'),
            poly([(177,55),(192,46),(192,96),(180,96)],'#2c4055')])
    if name=='footbridge':
        out=[poly([(0,51),(54,44),(132,47),(192,43),(192,79),(136,84),(55,80),(0,86)],'#826e5b'),
             poly([(0,76),(55,71),(136,76),(192,71),(192,84),(136,89),(55,85),(0,91)],'#4c4848')]
        for i,x in enumerate(range(12,192,22)):
            y=45+(i%3)*2
            out.append(stroke([(x,y+3),(x+3,77+(i%2)*4)],'#b49a72',2))
        out += [poly([(0,39),(56,32),(130,35),(192,31),(192,38),(130,43),(56,40),(0,47)],'#394652'),
                poly([(0,35),(56,28),(130,31),(192,27),(192,32),(130,36),(56,34),(0,41)],'#b19b78')]
        for x,y,lean in [(5,26,-3),(58,21,3),(131,24,-3),(185,18,2)]:
            out.append(poly([(x,y),(x+7,y-2),(x+7+lean,y+54),(x+lean,y+56)],'#8d8069'))
        return ''.join(out)
    if name=='footbridge-front':
        out=[poly([(0,91),(54,84),(134,88),(192,82),(192,90),(134,96),(54,92),(0,99)],'#5f5550'),
             poly([(0,87),(54,80),(134,84),(192,78),(192,83),(134,89),(54,85),(0,92)],'#b09a75')]
        for x,y,lean in [(7,73,-3),(181,67,3)]:
            out += [poly([(x,y),(x+8,y-2),(x+8+lean,113),(x+lean,116)],'#736451'),
                    poly([(x-3,y-3),(x+5,y-7),(x+12,y-3),(x+9,y+3),(x,y+4)],'#b4ae8c')]
        return ''.join(out)
    return None


# Broad fractures turn the shelter cutaway into a geological recess. They
# enclose every existing floor centre and retain the lamp/shelter ground anchors.
CUBBY=[(402,372),(430,388),(429,430),(421,474),(430,522),(423,558),
       (450,586),(610,593),(710,578),(723,545),(704,492),(717,440),(699,392),(728,374)]
LEFT_LEDGE=[(0,376),(95,383),(192,370),(303,384)]+CUBBY[:6]+[(450,586),(370,566),(252,549),(134,558),(0,546)]
RIGHT_LEDGE=CUBBY[8:]+[(820,386),(932,373),(957,414),(944,474),(925,531),(831,556)]
FRONT_LEDGE=CUBBY[5:9]+[(711,624),(421,624)]


def cave_ledge():
    out=['<defs><clipPath id="cubby-rock">']+[poly(p,'#fff')for p in (LEFT_LEDGE,RIGHT_LEDGE,FRONT_LEDGE)]+['</clipPath></defs><g clip-path="url(#cubby-rock)">',
         poly([(0,365),(1008,365),(1008,624),(0,624)],'#2b424f')]
    for pts,c in [([(0,376),(95,383),(192,370),(258,420),(185,481),(0,505)],'#4b5f71'),
                  ([(192,370),(303,384),(402,372),(430,388),(429,430),(365,479),(258,420)],'#617588'),
                  ([(0,505),(185,481),(258,420),(365,479),(305,550),(134,558),(0,546)],'#344d5d'),
                  ([(365,479),(429,430),(421,474),(430,522),(423,558),(450,586),(370,566),(305,550)],'#405969'),
                  ([(728,374),(820,386),(932,373),(889,441),(773,457),(717,440),(699,392)],'#536b79'),
                  ([(889,441),(932,373),(957,414),(944,474),(925,531),(831,556),(773,457)],'#334d5d'),
                  ([(773,457),(831,556),(710,578),(723,545),(704,492),(717,440)],'#1f3748'),
                  ([(423,558),(450,586),(610,593),(710,578),(711,624),(421,624)],'#1c3343'),
                  ([(450,586),(610,593),(558,624),(438,624)],'#314b5b')]:out.append(poly(pts,c))
    # Discontinuous, tapered upper faces follow the fractures, not tile rows.
    out += [poly([(0,376),(95,383),(192,370),(303,384),(402,372),(430,388),(423,398),(400,383),(305,393),(191,380),(97,391),(0,386)],'#7b8d96'),
            poly([(728,374),(820,386),(932,373),(925,382),(822,395),(716,384)],'#6e8490'),
            poly([(423,558),(450,586),(610,593),(710,578),(708,586),(612,601),(446,594)],'#526b78'),'</g>']
    return ''.join(out)


def terrain(scene,kind,base,w,h,layer):
    if scene=='rillbridge':
        if kind=='grass':
            # Continuous land behind the new, wider river; no old rectangular
            # water cutout should survive below it.
            base=re.sub(r'<defs>.*?</defs>','',base,count=1)
            return base.replace('<g clip-path="url(#grass)">','<g>')
        if kind=='water' and layer==1:return river()
        if kind in ('earth','paving'):
            # Trim accidental paving bars over water. The railway shelf keeps
            # its original through route; the wooden bridge supplies its deck.
            land=river_land(w,h)+poly([(0,320),(w,320),(w,363),(0,363)],'#fff')
            return f'<defs><clipPath id="rill-land-{kind}">{land}</clipPath></defs><g clip-path="url(#rill-land-{kind})">{base}</g>'
    if scene=='tunnel':
        if kind=='cave-floor':
            # Shapes inside a clipPath union; separate polygons avoid even-odd
            # cancellation where the widened recess overlaps the original floor.
            return base.replace('</clipPath>',poly(CUBBY,'#fff')+'</clipPath>',1)
        if kind=='cave-ledge':return cave_ledge()
    return base
