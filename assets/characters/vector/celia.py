"""Celia's four independently constructed vector views.

The medical book stays in her anatomical left hand. Her portrait is a separate
editable SVG original, deliberately left untouched by this exporter.
"""
from pathlib import Path
import math
from draw import Drawing, legs, sleeve

ROOT=Path(__file__).resolve().parents[3]


def celia(direction,walk=None):
    d=Drawing()
    side=direction in ('left','right')
    swing=0 if walk is None else math.sin(walk*math.pi/3)
    legs(d,direction,'celia',walk)
    # The book is behind the body in right profile, in front in left profile.
    book={'front':(25,37),'left':(16,38),'right':(22,37),'back':(13,37)}[direction]
    def volume():
        x,y=book
        d.poly([(x-4,y-5),(x+3,y-6),(x+4,y+6),(x-3,y+7)],'brown')
        d.poly([(x-3,y-4),(x+2,y-5),(x+3,y+5),(x-2,y+6)],'leather')
        d.line([(x-3,y-4),(x-2,y+6)],'gold')
        d.line([(x-2,y+5),(x+3,y+4)],'cream')
        d.rect((x,y-2,x+1,y),'gold')
    if direction=='right':volume()
    coat_start=len(d.shapes)
    if side:
        d.poly([(17,23),(22,23),(25,32),(24,47),(27,57),(23,61),(16,60),(14,56),(16,43),(15,31)],'green')
        d.poly([(17,29),(20,31),(20,48),(17,58),(15,55),(16,43)],'navy')
        d.poly([(21,25),(23,29),(22,51),(25,57),(21,58),(20,46)],'teal')
        d.poly([(18,24),(21,24),(21,31),(19,34)],'cream')
    else:
        d.poly([(15,24),(24,24),(27,31),(26,44),(29,57),(24,62),(19,60),(14,62),(11,57),(14,43),(13,31)],'green')
        d.poly([(14,31),(17,35),(17,46),(14,58),(12,56),(15,43)],'navy')
        d.poly([(24,30),(26,34),(24,46),(27,57),(23,59),(21,48)],'teal')
        if direction=='front':
            d.poly([(17,24),(23,24),(22,32),(20,36),(17,31)],'cream')
            d.poly([(16,25),(18,25),(20,36),(17,33),(15,28)],'navy')
            d.line([(20,36),(19,56)],'gold')
            for y in (38,43,48):d.rect((20,y,20,y),'gold')
        else:d.line([(20,29),(20,51)],'teal');d.line([(15,44),(25,44)],'brown')
    # The coat's lower planes follow the stride without moving the shoulders.
    if walk is not None:
        for i in range(coat_start,len(d.shapes)):
            kind,coords,fill,edge=d.shapes[i]
            def hem(x,y):
                weight=max(0,(y-43)/19)
                return x+swing*.8*weight,y-(1+abs(swing))*weight
            if kind in ('polygon','line'):coords=[hem(x,y)for x,y in coords]
            else:coords=(*hem(*coords[:2]),*hem(*coords[2:]))
            d.shapes[i]=(kind,coords,fill,edge)
    # The free right arm swings; the left cradles the book firmly.
    right={'front':((14,28),(11,36),(13,44)),'left':((18,28),(18,36),(18,44)),
           'right':((24,28),(27,36),(25,44)),'back':((25,28),(28,36),(26,44))}[direction]
    left={'front':((25,28),(28,35),(25,39)),'left':((18,28),(15,34),(16,39)),
          'right':((19,28),(21,34),(22,39)),'back':((15,28),(12,34),(13,39))}[direction]
    if walk is not None:
        shoulder,elbow,hand=right
        dx=swing*1.8*(-1 if direction=='left' else 1) if side else swing*.6
        right=(shoulder,(elbow[0]+dx*.5,elbow[1]),(hand[0]+dx,hand[1]+swing*.8))
    if direction!='right':sleeve(d,*right,'green')
    sleeve(d,*left,'green')
    if direction!='right':volume();d.oval((book[0]-1,book[1]+1,book[0]+1,book[1]+3),'skin',None)
    if direction=='right':sleeve(d,*right,'green')
    d.rect((19,19,21,25),'skin')
    if direction=='front':
        d.poly([(16,10),(21,8),(24,12),(24,18),(22,23),(19,24),(16,21),(15,16)],'skin')
        d.poly([(15,11),(16,6),(21,4),(25,8),(27,14),(25,23),(23,24),(23,17),(22,11),(19,10),(17,15),(16,24),(13,22),(13,15)],'silver')
        d.poly([(14,13),(15,9),(19,7),(22,8),(18,10),(16,17),(16,22),(14,21)],'steel')
        d.line([(17,14),(19,14),(19,17),(17,17),(17,14)],'brown',.6)
        d.line([(21,14),(23,14),(23,17),(21,17),(21,14)],'brown',.6)
        d.line([(19,15),(21,15)],'brown',.6)
        d.line([(19,20),(22,20)],'rose',.7)
    elif direction=='back':
        d.poly([(14,10),(17,5),(22,4),(26,9),(27,17),(25,23),(21,25),(16,23),(13,18)],'silver')
        d.poly([(14,13),(17,10),(16,18),(19,23),(16,22),(13,18)],'steel')
        d.line([(24,10),(25,17),(23,22)],'cream')
    elif direction=='left':
        d.poly([(18,10),(23,11),(24,17),(21,23),(18,23),(16,20),(16,16),(15,16)],'skin')
        d.poly([(16,10),(18,5),(23,5),(26,10),(26,18),(24,24),(21,24),(22,18),(22,12),(19,10),(17,15),(15,14)],'silver')
        d.poly([(23,9),(25,12),(25,19),(23,22),(23,14)],'steel')
        d.line([(15,14),(18,14),(18,17),(16,17),(15,14),(23,13)],'brown',.7)
        d.line([(17,21),(20,21)],'rose',.7)
    else:
        d.poly([(17,11),(22,10),(23,14),(25,16),(23,18),(23,21),(21,24),(18,22)],'skin')
        d.poly([(14,10),(17,5),(22,4),(25,9),(25,13),(22,12),(20,9),(18,13),(18,20),(20,24),(16,24),(14,20),(13,14)],'silver')
        d.poly([(14,12),(17,10),(16,18),(18,23),(15,22),(13,17)],'steel')
        d.line([(21,14),(24,14),(24,17),(22,17),(21,14),(17,13)],'brown',.7)
        d.line([(21,21),(23,21)],'rose',.7)
    d.oval((19,25,21,28),'gold',None)
    return d


if __name__=='__main__':
    out=ROOT/'public/art/vector'
    (out/'animation').mkdir(exist_ok=True)
    for direction in ('front','left','right','back'):
        (out/f'celia{"" if direction=="front" else "-"+direction}.svg').write_text(celia(direction).svg())
        frames=[celia(direction,walk=i)for i in range(6)]
        assert len({f.render().tobytes()for f in frames})==6
        page='<svg xmlns="http://www.w3.org/2000/svg" width="160" height="240" viewBox="0 0 160 240">\n'
        for i,frame in enumerate(frames):page+=frame.svg().replace('<svg ',f'<svg x="{i%2*80}" y="{i//2*80}" ',1)
        (out/f'animation/celia-{direction}.svg').write_text(page+'</svg>\n')
    print('Exported Celia views and six-pose walks; left-hand book, 24px stride')
