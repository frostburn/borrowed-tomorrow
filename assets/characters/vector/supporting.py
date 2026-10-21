"""Chapter-one cast in the same flat vector vocabulary as the two leads."""
from pathlib import Path
from draw import Drawing, sleeve, boots

CAST=('master','clerk','tomas','alban','tilda','elspeth')


def head(d,name):
    hair={'master':'silver','clerk':'hair','tomas':'brown','alban':'hair','tilda':'copper','elspeth':'silver'}[name]
    if name=='elspeth':d.oval((24,10,29,17),'silver')
    d.oval((15,8,25,24),hair)
    d.poly([(16,12),(24,12),(25,18),(23,24),(20,26),(16,23),(15,18)],'skin')
    d.poly([(15,15),(14,11),(18,7),(24,8),(26,12),(25,16),(22,11),(18,13)],hair)
    if name=='alban':
        d.line([(23,10),(25,14)],'silver',2)
        d.line([(16,16),(19,17)]);d.line([(21,17),(24,16)])
    else:
        d.line([(16,16),(18,16)],hair);d.line([(22,16),(24,16)],hair)
    for x in (17,23):d.rect((x,18,x,19),'ink')
    d.line([(20,18),(19,21),(21,21)],'brown')
    d.line([(18,23),(22,23)],'ink' if name in ('alban','elspeth') else 'brown')
    if name=='master':
        d.poly([(15,21),(18,20),(20,22),(22,20),(25,21),(24,24),(20,23),(16,24)],'white')
        d.line([(15,16),(18,16)],'white',2);d.line([(22,16),(25,16)],'white',2)
    if name in ('clerk','elspeth'):
        d.oval((14,16,19,21),'skin','gold')
        d.oval((21,16,26,21),'skin','gold')
        d.line([(19,18),(21,18)],'gold')
        d.rect((16,18,17,19),'ink');d.rect((23,18,24,19),'ink')
    if name=='clerk':
        d.poly([(14,12),(15,3),(24,3),(26,12)],'slate')
        d.rect((14,9,26,12),'ink');d.oval((12,11,28,14),'slate')
        d.rect((19,6,21,8),'gold')
    if name=='tilda':
        d.poly([(14,12),(15,7),(20,5),(25,8),(26,13),(22,10),(17,10)],'white')
        d.poly([(26,10),(29,11),(27,16),(25,14)],'cream')


def person(name):
    d=Drawing()
    jacket={'master':'navy','clerk':'slate','tomas':'navy','alban':'navy','tilda':'green','elspeth':'plum'}[name]
    if name=='elspeth':
        # Complete chair: large rear wheels, both armrests, casters and footplate.
        d.rect((11,24,29,57),'brown','ink')
        d.rect((10,24,12,45),'gold','ink');d.rect((28,24,30,45),'gold','ink')
        d.poly([(15,29),(25,29),(28,43),(26,60),(14,60),(12,43)],'navy')
        d.poly([(15,28),(25,28),(28,38),(21,42),(12,38)],'plum')
        d.rect((12,46,28,49),'brown','ink')
        for x in (11,29):
            d.oval((x-4,42,x+4,66),'ink');d.oval((x-3,44,x+3,64),'gold')
            d.oval((x-2,46,x+2,62),'brown');d.line([(x,47),(x,61)],'gold')
            d.line([(x-2,53),(x+2,53)],'gold')
        d.rect((15,61,25,64),'silver','ink')
        d.rect((15,59,18,62),'brown');d.rect((22,59,25,62),'brown')
        d.oval((13,64,16,68),'ink');d.oval((24,64,27,68),'ink')
        d.rect((15,40,25,46),'blue','gold')
        sleeve(d,(14,31),(13,38),(16,42),'plum',False);sleeve(d,(26,31),(27,38),(24,42),'plum',False)
    else:
        if name=='tilda':
            d.poly([(15,30),(25,30),(29,59),(27,64),(13,64),(11,59)],'green')
            for x in (16,24):boots(d,x,top=61,bottom=67)
        else:
            for x in (17,23):d.poly([(x-2,44),(x+2,44),(x+2,64),(x-2,64)],'navy')
            for x in (17,23):boots(d,x,top=60,bottom=67)
        d.rect((18,24,22,30),'skin','ink')
        d.poly([(15,27),(25,27),(27,35),(26,49),(22,52),(20,48),(17,52),(13,49),(13,36)],jacket)
        if name=='master':
            d.poly([(17,28),(23,28),(24,44),(16,44)],'brown')
            d.poly([(18,27),(22,27),(20,33)],'white');d.line([(20,32),(20,40)])
            for y in (35,41):d.rect((19,y,20,y+1),'gold')
            d.line([(22,39),(22,43),(19,44)],'gold')
            d.oval((13,30,15,33),'gold')
        if name=='clerk':
            d.poly([(17,27),(23,27),(21,34),(19,34)],'white');d.line([(20,30),(20,38)])
        if name=='tomas':
            d.poly([(17,27),(23,27),(22,45),(18,45)],'white')
            d.poly([(16,26),(24,27),(23,30),(19,30),(17,40),(14,39)],'red')
            d.line([(24,28),(16,48)],'leather',2);d.rect((13,44,18,52),'brown','ink')
            d.oval((23,30,25,32),'gold')
        if name=='alban':
            d.poly([(16,28),(24,28),(24,40),(20,43),(16,40)],'white')
            d.line([(16,29),(24,42)],'red',2)
            d.oval((19,33,21,37),'gold')
            d.rect((12,28,16,30),'gold','ink');d.rect((24,28,28,30),'gold','ink')
            d.line([(15,44),(25,44)],'gold')
        if name=='tilda':
            d.poly([(17,28),(23,28),(23,38),(26,60),(14,60),(17,38)],'white')
            d.line([(14,39),(26,39)],'cream')
        if name in ('clerk','tilda'):
            sleeve(d,(14,30),(12,38),(17,40),jacket,False)
            sleeve(d,(26,30),(28,38),(23,40),jacket,False)
            if name=='clerk':
                d.rect((16,35,24,45),'brown','ink');d.rect((17,36,23,43),'white')
                d.line([(18,38),(22,38)],'slate');d.line([(18,40),(22,40)],'slate');d.line([(24,34),(26,40)],'gold')
            else:d.poly([(14,39),(25,39),(26,43),(15,44)],'white')
        else:
            sleeve(d,(14,30),(12,38),(12,46),jacket,name!='alban')
            sleeve(d,(26,30),(28,38),(28,46),jacket,name!='alban')
            if name=='alban':
                d.oval((11,44,13,48),'white');d.oval((27,44,29,48),'white')
                d.line([(12,47),(8,64)],'silver',2);d.line([(9,48),(15,49)],'gold',2)
    head(d,name)
    return d


def portrait(name):
    d=Drawing(64,128)
    color={'master':'navy','clerk':'slate','tomas':'navy','alban':'navy','tilda':'green','elspeth':'plum'}[name]
    if name=='elspeth':
        d.rect((9,76,55,127),'brown','ink')
        d.line([(8,79),(8,124)],'gold',2);d.line([(56,79),(56,124)],'gold',2)
    d.poly([(3,127),(6,100),(22,83),(42,83),(58,100),(62,127)],color)
    d.poly([(25,77),(39,77),(40,95),(32,101),(24,94)],'skin')
    if name in ('master','clerk','tomas'):
        d.poly([(23,87),(41,87),(38,127),(26,127)],'brown' if name=='master' else 'white')
    if name=='master':
        d.poly([(25,88),(39,88),(32,99)],'white');d.line([(32,97),(32,110)],'ink',2)
        d.oval((10,101,17,111),'gold');d.line([(39,109),(39,121),(31,123)],'gold')
    if name=='clerk':
        d.line([(32,93),(32,108)],'ink',2);d.poly([(30,96),(34,96),(35,110),(31,114)],'ink')
        d.rect((17,113,48,127),'brown','ink');d.rect((20,116,45,127),'white')
    if name=='tomas':
        d.poly([(20,85),(42,89),(40,97),(31,98),(26,122),(17,120)],'red')
        d.line([(46,92),(28,127)],'leather',4);d.oval((40,95,45,101),'gold')
    if name=='alban':
        d.poly([(21,88),(43,88),(44,119),(32,126),(20,118)],'white')
        d.line([(19,90),(43,125)],'red',4)
        d.oval((29,104,35,114),'gold');d.rect((7,96,17,100),'gold','ink');d.rect((47,96,57,100),'gold','ink')
    if name=='tilda':d.poly([(24,88),(40,88),(39,107),(49,127),(15,127),(25,107)],'white')
    if name=='elspeth':
        d.poly([(22,86),(42,86),(52,106),(33,115),(12,105)],'plum')
        d.rect((20,117,46,127),'blue','gold')
    start=len(d.shapes);head(d,name);d.transform(start,2.5,3,20,4,10)
    return d


def enemy(name):
    d=Drawing()
    if name=='hound':
        for x in (13,27):
            d.line([(x,47),(x-1,57),(x+1,66)],'ink',4);d.line([(x,48),(x-1,57),(x+1,65)],'copper',2)
            d.poly([(x-1,64),(x+3,64),(x+4,67),(x-2,67)],'brown')
        d.poly([(13,32),(29,33),(31,43),(27,50),(14,48),(10,40)],'brown')
        d.oval((17,33,27,48),'copper');d.oval((19,36,25,45),'gold');d.line([(21,37),(21,44)],'brown')
        d.poly([(11,43),(7,39),(6,30),(3,30),(4,24),(8,23),(8,16),(11,20),(14,15),(14,28),(17,34)],'copper')
        d.line([(6,28),(10,29)],'ink');d.rect((7,25,8,26),'gold')
        d.line([(29,36),(35,31),(35,26)],'brown',2)
        for x in (13,27):d.oval((x-2,46,x+2,51),'gold')
    elif name=='crow':
        d.line([(19,58),(18,65),(15,67)],'brown',2);d.line([(25,57),(25,65),(29,67)],'brown',2)
        d.poly([(7,57),(15,42),(22,35),(28,36),(30,42),(27,54),(20,61)],'navy')
        d.poly([(13,54),(19,42),(26,42),(22,55),(8,61)],'slate')
        d.poly([(21,35),(23,28),(28,26),(32,29),(31,36),(27,40)],'ink')
        d.poly([(31,30),(37,33),(31,34)],'gold');d.rect((28,30,29,31),'copper')
        d.line([(17,48),(22,46),(19,54)],'silver')
    elif name=='guardian':
        for x in (15,25):
            d.rect((x-2,46,x+2,62),'copper','ink');d.oval((x-3,50,x+3,56),'gold')
            d.poly([(x-3,61),(x+2,61),(x+4,67),(x-4,67)],'brown')
        d.rect((11,23,29,49),'brown','ink');d.oval((12,21,28,50),'copper')
        d.rect((15,29,25,43),'navy','ink')
        for x in (17,20,23):d.line([(x,31),(x,41)],'gold')
        d.oval((15,10,25,26),'brown');d.rect((16,16,24,19),'gold','ink')
        d.rect((28,9,31,28),'copper','ink');d.rect((27,8,32,10),'gold','ink')
        for x in (8,32):d.oval((x-4,23,x+4,32),'gold')
        d.line([(8,31),(5,41),(7,51)],'ink',5);d.line([(8,31),(5,41),(7,51)],'copper',3)
        d.line([(32,31),(34,41),(31,49)],'ink',5);d.line([(32,31),(34,41),(31,49)],'copper',3)
        d.rect((3,45,10,51),'brown','ink');d.line([(7,49),(4,59)],'silver',2)
    else:
        d.poly([(4,65),(7,53),(14,49),(18,37),(26,38),(31,51),(35,56),(36,67),(9,67)],'slate')
        d.poly([(7,53),(15,51),(18,39),(24,40),(20,54),(14,60)],'silver')
        d.poly([(20,54),(24,40),(29,50),(28,64),(15,67)],'shade')
        d.line([(14,51),(19,55),(17,64)],'ink')
        d.poly([(6,64),(11,61),(15,65),(13,67),(5,67)],'green',None)
    return d


def export(root):
    out=root/'public/art/vector';out.mkdir(parents=True,exist_ok=True)
    for name in CAST:
        (out/f'{name}.svg').write_text(person(name).svg())
        (out/f'portrait-{name}.svg').write_text(portrait(name).svg())
    for name in ('hound','crow','guardian','rock'):(out/f'{name}.svg').write_text(enemy(name).svg())
    print('Exported chapter-one supporting cast and enemies as SVG')

if __name__=='__main__':export(Path(__file__).resolve().parents[3])
