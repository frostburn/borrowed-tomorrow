"""Vector Kit, Petra, Dena, Inspector and silent railway residents.

Independent profiles preserve anatomical handedness. Portrait SVGs are editable
originals and are deliberately not overwritten by this exporter.
"""
from pathlib import Path
import math
from draw import Drawing, PALETTE, legs, sleeve, boots
ROOT=Path(__file__).resolve().parents[3]
DIRECTIONS=('front','left','right','back')

def face(d,name,direction):
    side=direction in ('left','right');hair='hair' if name=='kit' else 'ink' if name=='petra' else 'brown'
    d.rect((19,18,21,25),'skin')
    if direction=='back':
        d.poly([(16,10),(19,7),(24,9),(25,14),(24,23),(17,23),(15,17)],hair)
    elif side:
        if direction=='left':
            d.poly([(18,10),(23,11),(24,18),(22,23),(18,22),(16,18),(16,15)],'skin')
            d.poly([(20,10),(24,11),(25,19),(23,23),(21,17)],hair);d.rect((16,14,17,15),'ink')
        else:
            d.poly([(17,11),(22,10),(23,14),(25,17),(23,20),(21,23),(17,21)],'skin')
            d.poly([(16,11),(20,10),(19,17),(18,23),(15,19)],hair);d.rect((23,14,24,15),'ink')
    else:
        d.poly([(16,11),(20,8),(24,11),(25,16),(23,22),(20,24),(17,22),(15,16)],'skin')
        d.rect((17,15,18,16),'ink');d.rect((22,15,23,16),'ink');d.line([(19,20),(22,20)],'brown')
    if name=='kit':
        d.poly([(14,13),(13,9),(16,9),(15,5),(19,7),(20,3),(22,7),(26,5),(25,9),(28,10),(25,15),(23,11),(21,13),(19,10),(17,15)],'brown')
        d.poly([(15,9),(19,9),(19,7),(22,9),(25,8),(23,11),(20,10),(17,12)],'copper')
    elif name=='petra':
        d.poly([(14,13),(15,8),(19,5),(24,6),(26,10),(25,15),(23,11),(20,10),(18,13),(16,13),(16,22),(14,23)],'ink')
        d.poly([(16,9),(19,7),(24,8),(21,9),(18,11)],'hair')
        if direction=='back':d.poly([(15,13),(25,12),(26,24),(22,28),(16,25)],'ink')
    else:
        d.poly([(14,13),(14,9),(18,5),(23,7),(26,11),(25,18),(23,14),(21,10),(17,12),(16,21),(14,23)],'brown')
        d.poly([(14,9),(16,5),(21,3),(25,7),(26,10),(21,8),(16,11)],'white')

def crossbow(d,grip,raised=False,direction='front'):
    x,y=grip;sign=-1 if direction=='left' else 1
    if not raised:
        # Lower the stock and prod together. Independent profiles retain the
        # anatomical right trigger hand; the other hand supports the fore-stock.
        if direction in ('front','back'):
            d.tube([(x-1,y-3),(x+2,y+13)],'brown',3)
            d.line([(x-8,y+5),(x-5,y+9),(x,y+10),(x+5,y+8),(x+8,y+4)],'leather',3)
            d.line([(x-8,y+5),(x+8,y+4)],'cream',1)
            d.line([(x,y+2),(x+2,y+12)],'silver',1)
        else:
            d.tube([(x-sign*3,y-4),(x+sign*6,y+14)],'brown',3)
            d.line([(x-sign*2,y+11),(x+sign*3,y+10),(x+sign*6,y+7),(x+sign*11,y+3)],'leather',3)
            d.line([(x-sign*2,y+11),(x+sign*11,y+3)],'cream',1)
            d.line([(x,y+1),(x+sign*6,y+13)],'silver',1)
        return
    if direction in ('front','back'):
        d.line([(x-1,y+2),(x+2,y-9)],'brown',3);d.poly([(x-9,y-3),(x-7,y-6),(x-3,y-4),(x,y-5),(x+5,y-8),(x+8,y-7),(x+10,y-3),(x+7,y-4),(x+4,y-5),(x,y-2),(x-4,y-2)],'leather');d.line([(x-9,y-3),(x+10,y-3)],'cream',1)
    else:
        tip=(x+sign*12,y-(2 if raised else -5));d.line([(x-sign*4,y+2),tip],'brown',3);d.line([(x+sign*7,y-5),(x+sign*9,y+6)],'leather',3);d.line([(x+sign*7,y-5),(x+sign*12,y),(x+sign*9,y+6)],'cream',1);d.line([(x-sign*2,y),(tip[0],tip[1]-1)],'silver',1)

def shield(d,grip,raised=False):
    x,y=grip;d.poly([(x-5,y-8),(x+4,y-9),(x+7,y-4),(x+6,y+6),(x+1,y+11),(x-5,y+7),(x-7,y-2)],'gold');d.poly([(x-3,y-5),(x+2,y-6),(x+4,y-2),(x+3,y+5),(x,y+8),(x-3,y+5),(x-4,y-1)],'navy');d.oval((x-2,y-1,x+2,y+3),'gold',None)

def saber(d,grip,direction,phase=None):
    x,y=grip
    if phase==0:tip=(x+(-6 if direction=='left' else 6),y-18)
    elif phase==1:tip=(x+(-17 if direction=='left' else 17),y-7)
    else:tip=(x+(-4 if direction=='left' else 4),y+20)
    d.line([(x,y),tip],'silver',2);d.line([(x-3,y+1),(x+3,y-1)],'gold',2);d.line([(x,y),(x-1,y-4)],'brown',2)

def hero(name,direction,walk=None,attack=None,bash=None,carry=False,arms=True,unarmed=False):
    d=Drawing();side=direction in ('left','right');swing=0 if walk is None else math.sin(walk*math.pi/3)
    right={'front':(12,39),'left':(17,39),'right':(26,39),'back':(28,39)}[direction]
    left={'front':(26,39),'left':(23,39),'right':(17,39),'back':(12,39)}[direction]
    if attack is not None:
        right={'front':(15+attack*2,29-attack*3),'left':(14-attack*2,29),'right':(28+attack*2,29),'back':(26,28-attack*4)}[direction]
        if name=='kit' and side:
            # Leave room for the entire bow at the edge of each 80px frame.
            right=(15-attack,29) if direction=='left' else (25+attack*2,29)
    if bash is not None:left=(left[0]+((-3 if direction=='left' else 3)*bash),left[1]-5-bash*4)
    # Weapons keep a fixed pitch while walking. Only Kit's light carry sways.
    if name=='kit' and walk is not None:right=(right[0]+(swing*.6 if side else 0),right[1]+swing*.7)
    if name=='kit':
        # Both hands follow the same stock, even during its small carrying sway.
        if attack is None:left=(right[0]+(-3 if direction=='left' else 3),right[1]+6)if side else(right[0]+1,right[1]+5)
        else:left=(right[0]+(-5 if direction=='left' else 5),right[1])if side else(right[0]+1,right[1]-5)
    if carry:
        right=(27 if name=='kit' else 13,35);left=(right[0]+1,37)
    if unarmed:left={'front':(26,40),'back':(12,40),'left':(23,40),'right':(17,40)}[direction]
    coat='navy' if name=='kit' else 'green'
    rshoulder=(15,25) if direction=='front' else (18,25) if direction=='left' else (24,25)
    lshoulder=(25,25) if direction=='front' else (22,25) if direction=='left' else (16,25)
    def arm(which):
        if not arms:return
        grip=right if which=='right' else left;shoulder=rshoulder if which=='right' else lshoulder
        elbow=((shoulder[0]+grip[0])/2+(-1 if which=='right' else 1),(shoulder[1]+grip[1])/2)
        sleeve(d,shoulder,elbow,grip,'navy' if name=='kit' else 'silver')
        if carry or unarmed:return
        if name=='kit' and which=='right':
            crossbow(d,grip,attack is not None,direction)
            # The trigger hand wraps the stock, rather than disappearing under it.
            d.oval((grip[0]-1,grip[1]-1,grip[0]+1,grip[1]+2),'skin',None)
        elif name=='petra' and which=='right':saber(d,grip,direction,attack)
        elif name=='petra':
            start=len(d.shapes)
            shield(d,grip,bash is not None)
            # From behind, the left-arm shield is viewed obliquely at her side.
            # Compress every face/rim/boss together around the same hand grip.
            if direction=='back':d.transform(start,.38,1,grip[0],0,0)
    if name=='kit' and direction=='back':arm('right');arm('left')
    elif direction=='left':arm('right')
    elif direction=='right':arm('left')
    # Kit and Petra share Nell's shorter support travel, with independent costumes.
    legs(d,direction,name,walk)
    if side:
        d.cloth([(17,24),(22,23),(25,31),(24,42),(18,44),(15,37),(16,29)],coat)
        d.line([(18 if direction=='left' else 23,28),(19 if direction=='left' else 23,39)],'gold')
    else:
        d.cloth([(15,24),(24,24),(27,31),(26,42),(22,45),(17,43),(13,39),(14,29)],coat)
        if name=='petra':d.poly([(17,26),(23,26),(24,35),(20,39),(16,34)],'silver');d.line([(20,27),(20,34)],'gold',2)
        else:d.poly([(18,24),(23,24),(23,32),(19,34),(17,29)],'cream')
    if name=='kit':
        d.poly([(16,22),(22,22),(25,26),(20,29),(15,27),(14,25)],'gold');d.poly([(17,27),(20,28),(19,39),(16,36)],'copper')
        # Satchel stays at his anatomical left hip.
        sx=25 if direction=='front' else 22 if direction=='left' else 15
        d.line([(16 if direction=='front' else 22,26),(sx,38)],'brown',2);d.poly([(sx-3,36),(sx+3,36),(sx+4,45),(sx-3,45)],'leather');d.rect((sx-2,37,sx+3,40),'brown')
    else:
        for x in ((15,25) if not side else (20,)):
            d.poly([(x-3,24),(x,22),(x+4,25),(x+4,29),(x-3,30)],'gold');d.poly([(x-2,25),(x+1,24),(x+3,26),(x+3,28),(x-2,29)],'silver')
        d.line([(15,39),(25,39)],'brown',2);d.rect((19,38,21,40),'gold')
    face(d,name,direction)
    if name=='kit' and direction=='back':pass # Bow and hands face away, behind the torso.
    elif direction=='left':arm('left')
    elif direction=='right':
        arm('right')
        if name=='kit':d.oval((left[0]-1,left[1]-1,left[0]+1,left[1]+2),'skin',None)
    elif name=='kit':arm('right');arm('left')
    else:arm('left');arm('right')
    return d

def dena():
    d=Drawing();legs(d,'front','nell');d.cloth([(15,25),(24,25),(27,36),(28,59),(23,62),(15,60),(12,56),(13,36)],'green');d.poly([(16,29),(23,29),(25,56),(22,59),(14,57)],'white');sleeve(d,(14,27),(12,35),(14,43),'green');sleeve(d,(25,27),(27,35),(25,43),'green');face(d,'dena','front');d.line([(16,31),(23,31)],'cream');return d

def inspector():
    d=Drawing();legs(d,'front','orrin');d.poly([(13,24),(26,24),(28,36),(27,54),(22,57),(17,54),(11,56),(12,36)],'navy');d.line([(16,24),(21,33),(26,26)],'gold',2);d.line([(25,29),(16,44)],'brown',3);d.rect((18,37,21,41),'gold');sleeve(d,(13,27),(10,36),(10,46),'navy');sleeve(d,(26,27),(29,36),(28,46),'navy');d.poly([(16,10),(23,9),(26,14),(25,22),(21,25),(17,22),(14,17)],'silver');d.rect((16,14,24,18),'ink');d.rect((17,15,19,17),'gold');d.rect((22,15,24,17),'copper');d.poly([(13,10),(15,5),(22,3),(27,7),(27,12),(15,13)],'navy');d.line([(13,12),(27,12)],'gold',2);d.line([(28,44),(29,21)],'brown',2);d.oval((26,17,32,24),'gold');d.oval((28,19,30,22),'copper');return d

def resident(role,variant=''):
    d=Drawing();coat={'dockhand':'teal','traveler':'plum','family':'green','patient':'cream'}[role]
    if variant:coat={'rust':'copper','blue':'blue','plum':'plum','green':'green'}[variant]
    if role=='family':
        # Different heights and a joined handhold keep the pair one silhouette.
        for cx,top,hip,foot in [(16,8,40,67),(27,28,51,67)]:
            color=coat if cx==16 else 'gold';d.poly([(cx-3,top+16),(cx+3,top+16),(cx+5,hip),(cx+2,hip+3),(cx-4,hip+2)],color)
            for x in (cx-2,cx+2):d.poly([(x-1,hip),(x+1,hip),(x+1,foot-3),(x+2,foot),(x-2,foot),(x-2,foot-4)],'navy');d.rect((x-2,foot-2,x+2,67),'brown')
            d.rect((cx-1,top+12,cx+1,top+17),'skin');d.oval((cx-3,top+2,cx+3,top+13),'skin',None);d.poly([(cx-4,top+6),(cx-3,top+1),(cx,top-1),(cx+4,top+2),(cx+4,top+7),(cx+1,top+4),(cx-2,top+6)],'hair');d.rect((cx+1,top+7,cx+2,top+8),'ink')
        d.line([(19,29),(21,41),(24,48)],'green' if not variant else coat,3);d.line([(24,48),(25,43)],'gold',2);d.oval((22,44,25,48),'skin',None)
    else:
        legs(d,'front','nell');d.cloth([(14,25),(24,24),(27,34),(26,47),(16,48),(12,39)],coat)
        if role=='patient':d.poly([(15,28),(23,28),(27,59),(23,62),(13,59)],coat);d.line([(17,32),(22,32)],'white');d.line([(19,34),(19,55)],'white')
        sleeve(d,(14,27),(12,35),(13,44),coat);sleeve(d,(25,27),(27,35),(26,44),coat)
        d.rect((19,20,21,26),'skin');d.oval((16,9,24,22),'skin',None);d.rect((18,15,19,16),'ink');d.rect((22,15,23,16),'ink')
        if role=='dockhand':d.poly([(15,12),(15,7),(20,4),(25,7),(26,13)],'navy');d.line([(14,13),(26,13)],'gold');d.line([(16,26),(16,44)],'brown',2);d.line([(23,26),(23,44)],'brown',2)
        elif role=='traveler':d.poly([(15,13),(16,7),(21,5),(25,9),(25,14),(21,10),(17,14)],'hair');d.poly([(15,23),(23,23),(26,27),(20,30),(14,27)],'gold');d.poly([(24,39),(29,39),(29,48),(23,48)],'leather')
        else:d.poly([(15,14),(16,7),(21,5),(25,9),(25,14),(22,10),(17,12)],'silver')
    return d

def export():
    out=ROOT/'public/art/vector';(out/'animation').mkdir(exist_ok=True)
    for name in ('kit','petra'):
        for direction in DIRECTIONS:
            drawing=hero(name,direction);(out/f'{name}{"" if direction=="front" else "-"+direction}.svg').write_text(drawing.svg())
            frames=[hero(name,direction,walk=i) for i in range(6)]+[hero(name,direction,attack=i)for i in range(2)]
            if name=='petra':frames += [hero(name,direction,bash=i)for i in range(2)]
            assert len({f.render().tobytes()for f in frames[:6]})==6
            stance=drawing.render().crop((0,64,80,80)).tobytes()
            assert all(f.render().crop((0,64,80,80)).tobytes()==stance for f in frames[6:]), 'Attack moved the feet'
            height=len(frames)//2*80;page=f'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="{height}" viewBox="0 0 160 {height}">\n'
            for i,f in enumerate(frames):page+=f.svg().replace('<svg ',f'<svg x="{i%2*80}" y="{i//2*80}" ',1)
            (out/f'animation/{name}-{direction}.svg').write_text(page+'</svg>\n')
    (out/'dena.svg').write_text(dena().svg());(out/'inspector.svg').write_text(inspector().svg())
    for name in ('dockhand','traveler','family','patient','dockhand-rust','traveler-blue','family-blue','family-plum','patient-green'):
        role,_,variant=name.partition('-');(out/f'civilian-{name}.svg').write_text(resident(role,variant).svg())
    print('Exported Chapter Two vector cast, motion and nine civilian variants')
if __name__=='__main__':export()
