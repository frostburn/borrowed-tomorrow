"""Vector-authored character models. Export SVGs for browser-native loading."""
from pathlib import Path
import math
from PIL import Image, ImageDraw

PALETTE = {
    'ink': '#142536', 'navy': '#263e53', 'green': '#385d4a',
    'teal': '#638487', 'red': '#a95243', 'plum': '#825875',
    'brown': '#80553d', 'silver': '#b7c1b8', 'shade': '#687478',
    'blue': '#547a96', 'leaf': '#8ca66d', 'ice': '#a9d3cd',
    'skin': '#d49c70', 'rose': '#c58077', 'gold': '#d9ae62', 'white': '#f5dca4',
    'hair': '#593e35', 'cream': '#d8c59b', 'slate': '#626d7f',
    'steel': '#8b9b9b', 'copper': '#b7784e', 'leather': '#9a7151',
}


class Drawing:
    def __init__(self, width=40, height=80):
        self.width, self.height = width, height
        self.shapes = []

    def poly(self, points, fill, outline='ink'):
        self.shapes.append(('polygon', points, fill, outline))

    def oval(self, box, fill, outline='ink'):
        self.shapes.append(('ellipse', box, fill, outline))

    def rect(self, box, fill, outline=None):
        self.shapes.append(('rect', box, fill, outline))

    def line(self, points, fill='ink', width=1):
        self.shapes.append(('line', points, fill, width))

    def transform(self, start, sx, sy, x_origin, y_origin, y_offset):
        """Retarget vector parts before rasterization, keeping contour widths."""
        def point(x,y):return x_origin+(x-x_origin)*sx, y_offset+(y-y_origin)*sy
        for index in range(start,len(self.shapes)):
            kind,coords,fill,edge=self.shapes[index]
            if kind in ('line','polygon'):coords=[point(x,y) for x,y in coords]
            else:coords=(*point(*coords[:2]),*point(*coords[2:]))
            self.shapes[index]=(kind,coords,fill,edge)

    def render(self):
        image = Image.new('RGBA', (self.width, self.height))
        draw = ImageDraw.Draw(image)
        for kind, points, fill, edge in self.shapes:
            color = PALETTE[fill]
            if kind == 'line':
                draw.line(points, fill=color, width=edge)
            else:
                outline = PALETTE[edge] if edge else None
                if kind == 'polygon':
                    draw.polygon(points, fill=color, outline=outline)
                elif kind == 'ellipse':
                    draw.ellipse(points, fill=color, outline=outline)
                else:
                    draw.rectangle(points, fill=color, outline=outline)
        # Original AGI's wide logical pixels inspire this deliberate 2:1 grid.
        # This is exact pixel replication, never arbitrary image downsampling.
        return image.resize((self.width * 2, self.height), Image.Resampling.NEAREST)

    def svg(self):
        elements = []
        for kind, points, fill, edge in self.shapes:
            color = PALETTE[fill]
            if kind == 'line':
                coords = ' '.join(f'{x},{y}' for x, y in points)
                elements.append(f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="{edge}"/>')
                continue
            # Costume/face planes meet directly. Retain intentional gold/metal
            # fittings and explicit tool lines, without outlining every polygon.
            stroke = f' stroke="{PALETTE[edge]}" stroke-width="1"' if edge and edge!='ink' else ''
            if kind == 'polygon':
                coords = ' '.join(f'{x},{y}' for x, y in points)
                elements.append(f'<polygon points="{coords}" fill="{color}"{stroke}/>')
            elif kind == 'ellipse':
                x1, y1, x2, y2 = points
                elements.append(f'<ellipse cx="{(x1+x2)/2}" cy="{(y1+y2)/2}" rx="{(x2-x1)/2}" ry="{(y2-y1)/2}" fill="{color}"{stroke}/>')
            else:
                x1, y1, x2, y2 = points
                elements.append(f'<rect x="{x1}" y="{y1}" width="{x2-x1+1}" height="{y2-y1+1}" fill="{color}"{stroke}/>')
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width*2}" height="{self.height}" '
                f'viewBox="0 0 {self.width} {self.height}" preserveAspectRatio="none" shape-rendering="crispEdges">\n'
                + '\n'.join(elements) + '\n</svg>\n')


def sleeve(d, shoulder, elbow, hand, color, cuff=True):
    sx, sy = shoulder
    ex, ey = elbow
    hx, hy = hand
    d.line([shoulder, elbow, hand], 'ink', 4)
    d.line([shoulder, elbow, hand], color, 2)
    if cuff:
        d.line([(hx-1, hy-2), (hx+1, hy-2)], 'white')
    d.oval((hx-1, hy-1, hx+1, hy+2), 'skin')


def lantern(d, hand):
    x, y = hand
    d.oval((x-2, y+1, x+2, y+7), 'ink')
    d.oval((x-1, y+2, x+1, y+6), 'gold', None)
    d.rect((x-2, y+6, x+2, y+13), 'gold', 'ink')
    d.rect((x-1, y+8, x+1, y+11), 'white')
    d.line([(x, y+7), (x, y+12)], 'brown')
    d.rect((x-3, y+13, x+3, y+14), 'brown', 'ink')


def lance(d, hand, tip):
    x, y = hand
    tx, ty = tip
    # A connected brass barrel with a steel nozzle and wooden rear grip.
    d.line([(x-1, y-2), (tx, ty)], 'ink', 5)
    d.line([(x-1, y-2), (tx, ty)], 'gold', 3)
    d.line([(x-1, y-2), (x+1, y+1)], 'brown', 2)
    nx, ny = tx-(tx-x)*.25, ty-(ty-y)*.25
    d.line([(nx, ny), (tx, ty)], 'silver', 3)
    d.oval((tx-1, ty-1, tx+1, ty+1), 'shade')
    d.line([(x+2, y), (x+3, y+5), (x+1, y+8)], 'ink')


def braid(d, x, y, length=14):
    d.poly([(x-1,y),(x+1,y),(x+2,y+length-3),(x,y+length),(x-2,y+length-3)], 'brown')
    for step in range(3, length-1, 4):
        d.line([(x-1,y+step),(x+1,y+step+1)])
    d.line([(x-1,y+length-2),(x+1,y+length-2)], 'red')


def boots(d, x, top=58, bottom=67, facing='front'):
    toe = -2 if facing == 'left' else 2 if facing == 'right' else 0
    d.poly([(x-1,top),(x+1,top),(x+1,bottom-2),(x+2+toe,bottom-1),
            (x+2+toe,bottom),(x-2+min(toe,0),bottom),(x-2,bottom-3)], 'brown')
    d.line([(x-2+min(toe,0),bottom),(x+2+toe,bottom)])


def legs(d, direction, hero, walk=None):
    wide = hero == 'orrin'
    side=direction in ('left','right')
    hips=(19,21) if side else (17,23) if wide else (18,22)
    for i,hip in enumerate(hips):
        x,y=hip,67
        if walk is not None:
            phase=(walk/6+i*.5)%1
            support=phase<.5
            progress=phase*2 if support else (phase-.5)*2
            # Nell has a 24px stride: support covers half the travel,
            # with x coordinates halved for the actor SVG's 2:1 viewBox.
            travel=(6-12*progress if support else -6+12*progress) if hero=='nell' else (14-28*progress if support else -14+28*progress)
            lift=0 if support else math.sin(progress*math.pi)*4
            if side:x+=travel/2*(-1 if direction=='left' else 1)
            else:y+=travel*(-1 if direction=='back' else 1)/(1 if hero=='nell' else 2)
            y-=lift
        knee_x=(hip+x)/2
        knee_y=(43+y-8)/2
        d.poly([(hip-1.5,39),(hip+1.5,39),(knee_x+1.5,knee_y),
                (x+1,y-7),(x-1,y-7),(knee_x-1.5,knee_y)],'navy')
        boots(d,x,y-10,y,direction)
    if not side:d.line([(20,43),(20,49)],'blue' if direction=='front' else 'ink')


def nell(direction, walk=None, attack=None):
    d = Drawing()
    side = direction in ('left','right')
    hands = {'front':(11,39),'left':(17,39),'right':(26,39),'back':(28,39)}
    elbow = {'front':(13,30),'left':(18,31),'right':(25,30),'back':(27,30)}
    if attack is not None:
        hands = [dict(front=(14,29),left=(13,32),right=(29,32),back=(27,27)),
                 dict(front=(19,19),left=(7,26),right=(33,26),back=(25,9)),
                 dict(front=(16,25),left=(10,32),right=(30,32),back=(28,20))][attack]
        elbow = dict(front=(13,25),left=(15,26),right=(27,25),back=(28,24))
    if walk is not None:
        swing=math.sin(walk*math.pi/3)
        hx,hy=hands[direction];ex,ey=elbow[direction]
        hands[direction]=(hx+(swing if side else 0),hy+swing)
        elbow[direction]=(ex+(swing*.5 if side else 0),ey+swing*.5)
    hand=hands[direction]
    far_weapon = direction=='left' or (direction=='back' and attack is not None)
    if far_weapon:
        sleeve(d,(18,24),elbow[direction],hand,'red')
        lantern(d,hand)
    legs(d,direction,'nell',walk)
    # A flared work jacket over a continuous navy bib and trousers.
    if not side:
        d.poly([(16,22),(24,22),(26,30),(26,40),(23,43),(20,40),(17,43),(14,40),(15,29)], 'red')
        if direction=='front':
            d.poly([(18,22),(22,22),(22,29),(20,32),(18,29)], 'white')
            d.rect((18,29,22,40),'navy','ink')
            d.line([(18,25),(18,31)],'navy');d.line([(22,25),(22,31)],'navy')
            d.rect((19,35,21,36),'gold')
        else:
            d.line([(16,37),(24,37)],'brown')
            braid(d,16,19);braid(d,24,19)
        sleeve(d,(25,24),(27,31),(28,40-(swing if walk is not None else 0)),'red') if direction=='front' else sleeve(d,(15,24),(13,32),(12,40-(swing if walk is not None else 0)),'red')
    else:
        front = 17 if direction=='left' else 23
        d.poly([(18,22),(22,22),(24,30),(24,40),(22,43),(17,41),(16,36),(17,28)],'red')
        d.line([(front,26),(front,38)],'navy')
        braid(d,23 if direction=='left' else 17,19)
        # Near left arm in the left profile is empty.
        if direction=='left':sleeve(d,(21,24),(23,32),(22-(swing if walk is not None else 0),41),'red')
    # A small head and visible neck keep adventure-game rather than chibi proportions.
    d.rect((19,19,21,24),'skin')
    if direction=='front':braid(d,16,18,12);braid(d,24,18,12)
    head_start=len(d.shapes)
    if direction in ('front','back'):
        d.oval((17,10,23,21),'brown' if direction=='back' else 'skin')
        if direction=='front':
            d.rect((18,15,18,16),'ink');d.rect((22,15,22,16),'ink')
            d.line([(20,18),(21,18)],'brown')
        d.poly([(16,8),(19,5),(24,7),(25,11),(16,11)],'red')
        d.line([(16,11),(24,11)],'ink')
        if direction=='front':d.rect((20,8,21,9),'gold')
    elif direction=='left':
        d.poly([(18,11),(23,11),(23,21),(19,22),(17,19),(16,17),(17,15)],'skin')
        d.poly([(20,11),(23,11),(24,20),(22,23),(21,16)],'brown')
        d.rect((17,14,17,15),'ink')
        d.poly([(16,7),(21,5),(24,8),(24,11),(15,11)],'red')
        d.line([(14,11),(23,11)],'ink')
    else:
        d.poly([(17,11),(22,11),(23,15),(24,17),(23,19),(21,22),(17,21)],'skin')
        d.poly([(17,11),(20,11),(19,16),(18,23),(16,20)],'brown')
        d.rect((23,14,23,15),'ink')
        d.poly([(16,8),(19,5),(24,7),(25,11),(16,11)],'red')
        d.line([(17,11),(26,11)],'ink')
    d.transform(head_start,1,.75,20,5,8)
    if not far_weapon:
        shoulder=(15,24) if direction=='front' else (24,24)
        sleeve(d,shoulder,elbow[direction],hand,'red')
        lantern(d,hand)
    return d


def orrin(direction, walk=None, attack=None):
    d=Drawing()
    side=direction in ('left','right')
    hands={'front':(11,40),'left':(16,40),'right':(27,40),'back':(29,40)}
    tips={'front':(7,54),'left':(7,54),'right':(35,54),'back':(33,54)}
    if attack is not None:
        hands=[dict(front=(13,30),left=(13,30),right=(28,30),back=(26,27)),
               dict(front=(16,31),left=(10,31),right=(29,31),back=(26,24))][attack]
        tips=[dict(front=(10,42),left=(4,34),right=(36,34),back=(27,15)),
              dict(front=(16,45),left=(2,31),right=(38,31),back=(26,8))][attack]
    hand,tip=hands[direction],tips[direction]
    far_weapon=direction=='left' or (direction=='back' and attack is not None)
    if far_weapon:
        sleeve(d,(17,23),(15,30),hand,'white',False);lance(d,hand,tip)
    legs(d,direction,'orrin',walk)
    if side:
        d.poly([(17,22),(23,22),(26,29),(25,41),(16,41),(15,30)],'white')
        d.poly([(20,23),(23,24),(25,32),(25,43),(16,43),(16,34),(18,31)],'navy')
        d.line([(17,39),(24,39)],'brown')
        if direction=='left':sleeve(d,(22,24),(25,31),(23,41),'white',False)
    else:
        d.poly([(15,22),(25,22),(28,28),(27,39),(24,43),(16,43),(13,38),(12,28)],'white')
        d.poly([(16,24),(18,24),(18,30),(22,30),(22,24),(24,24),(24,42),(16,42)],'navy')
        d.line([(15,39),(25,39)],'brown');d.rect((20,38,21,39),'gold')
        if direction=='front':sleeve(d,(26,24),(29,32),(29,41),'white',False)
        else:sleeve(d,(14,24),(11,32),(11,41),'white',False)
    d.rect((18,17,22,24),'skin')
    head_start=len(d.shapes)
    if direction=='front':
        d.oval((16,10,24,23),'skin')
        d.poly([(16,16),(18,18),(22,18),(24,16),(24,23),(20,26),(16,22)],'brown')
        d.line([(18,15),(18,16)]);d.line([(22,15),(22,16)])
        d.poly([(15,7),(20,4),(25,7),(25,11),(15,11)],'navy')
        d.line([(14,12),(26,12)],'ink')
        for x in (18,22):d.oval((x-1,7,x+1,10),'gold')
    elif direction=='back':
        d.oval((16,10,24,23),'brown')
        d.poly([(15,7),(20,4),(25,7),(25,12),(15,12)],'navy')
        d.line([(17,19),(23,19)],'ink')
    elif direction=='left':
        d.poly([(17,11),(24,11),(24,23),(19,24),(16,21),(14,17),(17,15)],'skin')
        d.poly([(18,16),(20,18),(24,16),(24,23),(20,26),(16,22),(16,19)],'brown')
        d.rect((17,14,17,15),'ink')
        d.poly([(15,7),(21,4),(25,7),(25,11),(14,11)],'navy')
        d.line([(13,12),(24,12)],'ink');d.oval((16,7,18,10),'gold')
    else:
        d.poly([(16,11),(23,11),(23,15),(26,17),(24,21),(21,24),(16,23)],'skin')
        d.poly([(16,16),(20,18),(23,16),(24,19),(24,22),(20,26),(16,23)],'brown')
        d.rect((23,14,23,15),'ink')
        d.poly([(15,7),(20,4),(25,7),(26,11),(15,11)],'navy')
        d.line([(16,12),(27,12)],'ink');d.oval((22,7,24,10),'gold')
    d.transform(head_start,.8,.6,20,4,6)
    if not far_weapon:
        shoulder=(14,24) if direction=='front' else (25,24)
        sleeve(d,shoulder,(hand[0]-1,30),hand,'white',False)
        lance(d,hand,tip)
    return d


def export(root, heroes=('nell','orrin')):
    art=root/'public/art/vector'
    (art/'animation').mkdir(parents=True,exist_ok=True)
    allowed={tuple(bytes.fromhex(c[1:])) for c in PALETTE.values()}
    for hero, model in (('nell',nell),('orrin',orrin)):
        if hero not in heroes:continue
        for direction in ('front','left','right','back'):
            drawing=model(direction)
            suffix='' if direction=='front' else '-'+direction
            (art/f'{hero}{suffix}.svg').write_text(drawing.svg())
            frames=([nell(direction,walk=i) for i in range(6)]+[nell(direction,attack=i) for i in range(3)] if hero=='nell' else
                    [orrin(direction,walk=i) for i in range(6)]+[orrin(direction,attack=i) for i in range(2)])
            height=((len(frames)+1)//2)*80
            page='<svg xmlns="http://www.w3.org/2000/svg" width="160" height="'+str(height)+'" viewBox="0 0 160 '+str(height)+'">\n'
            for i,frame in enumerate(frames):
                svg=frame.svg().replace('<svg ',f'<svg x="{i%2*80}" y="{i//2*80}" ',1)
                page+=svg
            (art/f'animation/{hero}-{direction}.svg').write_text(page+'</svg>\n')
            rendered=[frame.render() for frame in frames]
            stance=drawing.render().crop((0,56,80,80)).tobytes()
            for frame in rendered[6:]:
                assert frame.crop((0,56,80,80)).tobytes()==stance, 'Attack changed the planted stance'
            assert len({frame.tobytes() for frame in rendered[:6]})==6
            for image in [drawing.render(),*rendered]:
                assert all(p[3] in (0,255) and (p[3]==0 or p[:3] in allowed) for _,p in image.getcolors(image.width*image.height))
    print('Exported vector actors:', ', '.join(heroes))


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--hero',choices=('nell','orrin'))
    args=parser.parse_args()
    export(Path(__file__).resolve().parents[3],(args.hero,) if args.hero else ('nell','orrin'))
