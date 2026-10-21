"""Chapter Three supporting cast, in the shared native 80px vector vocabulary.

These body models are computed artwork. Portrait SVGs are editable originals and
are deliberately not touched by this exporter.
"""
from pathlib import Path
from draw import Drawing, boots, sleeve

CAST=('emperor','relay-keeper','boiler-keeper')

def emperor():
    d=Drawing()
    # A long ivory imperial coat, dark high collar and restrained sun insignia.
    for x in (17,23):
        d.rect((x-2,44,x+2,62),'navy');boots(d,x,top=60,bottom=67)
    d.poly([(14,27),(26,27),(30,39),(29,57),(25,62),(22,56),(20,48),(17,60),(11,58),(11,39)],'cream')
    d.poly([(14,28),(18,29),(17,45),(13,56),(11,55),(12,37)],'white')
    d.poly([(25,29),(28,34),(29,56),(25,60),(23,52)],'gold')
    d.poly([(17,26),(24,26),(26,46),(22,54),(18,54),(15,46)],'navy')
    d.line([(18,28),(18,43),(21,49),(24,43),(23,28)],'gold')
    d.poly([(16,25),(24,25),(25,31),(21,35),(17,31)],'ink')
    d.line([(17,27),(21,32),(24,27)],'gold')
    for y in (36,40,44):d.rect((20,y,21,y+1),'gold')
    d.line([(15,47),(25,47)],'gold')
    sleeve(d,(14,30),(11,39),(12,46),'cream',False)
    sleeve(d,(26,30),(29,39),(28,46),'cream',False)
    d.line([(11,37),(14,39)],'gold',2);d.line([(27,38),(30,36)],'gold',2)
    d.poly([(12,28),(14,26),(17,28),(15,31),(12,31)],'gold')
    d.poly([(24,28),(26,26),(29,28),(29,31),(26,31)],'gold')
    # The Emperor's silver mane has a broad forehead and a swept, uneven part.
    d.poly([(13,12),(15,7),(21,5),(26,9),(28,16),(27,25),(24,29),(22,25),(16,27),(12,23),(13,18)],'shade')
    d.poly([(16,12),(23,11),(26,17),(24,23),(21,26),(17,24),(14,19)],'skin')
    d.poly([(16,15),(16,20),(20,24),(23,24),(21,26),(17,24),(14,19)],'brown')
    d.poly([(12,16),(14,9),(20,5),(26,8),(28,14),(25,12),(22,9),(18,14),(16,16),(14,21),(12,23)],'silver')
    d.poly([(14,11),(20,6),(23,7),(18,10),(15,15),(13,18)],'white')
    d.poly([(25,12),(27,16),(27,23),(25,26),(24,24),(25,21),(24,17)],'silver')
    d.line([(17,15),(24,14)],'gold',2);d.poly([(20,14),(21,12),(22,14),(21,16)],'gold')
    d.line([(16,18),(18,18)],'hair');d.line([(22,18),(24,17)],'hair')
    d.rect((17,19,17,20),'ink');d.rect((23,18,23,19),'ink')
    d.line([(20,19),(19,22),(21,22)],'brown')
    d.line([(18,24),(22,24)],'ink')
    d.poly([(18,25),(21,25),(22,24),(22,26),(20,27)],'silver')
    return d

def engine_warden():
    d=Drawing()
    for x in (16,24):
        d.line([(x,43),(x-1,53),(x,63)],'ink',4)
        d.line([(x,43),(x-1,53),(x,63)],'gold',2)
        d.oval((x-2,50,x+2,55),'copper')
        d.poly([(x-2,62),(x+2,62),(x+4,67),(x-4,67)],'brown')
        d.line([(x-4,67),(x+4,67)])
        d.line([(x-3,65),(x+2,65)],'gold')
    d.poly([(13,30),(17,26),(24,27),(28,32),(27,43),(23,47),(16,46),(12,42)],'brown')
    d.poly([(15,30),(19,28),(24,30),(25,41),(22,44),(15,42)],'teal')
    d.line([(18,30),(18,41)],'ice',2);d.rect((12,41,28,44),'gold')
    # Semaphore lever and horizontal inspection arm are part of one silhouette.
    d.line([(26,32),(30,24),(30,19),(36,8)],'ink',4)
    d.line([(26,32),(30,24),(30,19),(36,8)],'copper',2)
    d.oval((28,20,32,25),'gold')
    d.poly([(30,19),(33,12),(37,5),(39,7),(35,15),(32,21)],'red')
    d.poly([(32,15),(34,12),(37,14),(35,17)],'cream')
    d.line([(27,35),(31,38),(38,38)],'ink',4)
    d.line([(27,35),(31,38),(37,38)],'gold',2)
    d.rect((34,36,38,40),'cream')
    d.line([(12,32),(9,39),(10,47)],'ink',4)
    d.line([(12,32),(9,39),(10,47)],'copper',2)
    d.oval((8,44,12,49),'gold')
    d.line([(19,26),(19,30)],'gold',3)
    d.poly([(13,13),(16,8),(20,3),(24,8),(27,14),(26,22),(22,28),(17,26),(13,21)],'brown')
    d.poly([(15,14),(18,10),(20,7),(23,11),(25,15),(24,22),(21,25),(17,23)],'green')
    d.poly([(15,14),(18,11),(19,12),(18,23),(16,21)],'ice')
    d.poly([(22,11),(24,15),(23,22),(21,24)],'teal')
    d.line([(20,6),(20,25)],'gold')
    d.oval((17,15,21,21),'gold');d.oval((18,16,20,20),'white')
    return d

def emperor_profile(step=0,reach=False):
    d=Drawing()
    # Independent left profile: silver mane, dark collar and ivory split mantle.
    for x,travel,lift in [(18,-step,0),(23,step,2 if step else 0)]:
        d.poly([(x-2,45),(x+2,45),(x+travel+2,61-lift),(x+travel-2,61-lift)],'navy')
        boots(d,x+travel,top=59-lift,bottom=67-lift,facing='left')
    d.poly([(17,27),(25,27),(28,39),(29+step,57),(25,60),(21,51),(17,58),(12-step,57),(14,39)],'cream')
    d.poly([(17,28),(20,28),(19,47),(15,56),(12-step,57),(14,39)],'white')
    d.poly([(25,29),(27,36),(27,49),(29+step,57),(25,60),(23,49)],'gold')
    d.poly([(17,26),(23,26),(23,43),(20,49),(16,44)],'navy')
    d.line([(17,27),(18,40),(20,47)],'gold')
    d.poly([(15,25),(22,25),(24,30),(19,34),(15,30)],'ink')
    d.line([(15,27),(19,32),(23,28)],'gold')
    sleeve(d,(23,30),(25+step,39),(23+step,46),'cream',False)
    if reach:
        sleeve(d,(17,30),(11,31),(5,37),'cream',False)
        d.line([(6,34),(8,37)],'gold',2)
    else:
        sleeve(d,(17,31),(14-step,39),(15-step,46),'cream',False)
        d.line([(13-step,40),(16-step,40)],'gold',2)
    d.oval((16,28,19,31),'gold')
    d.poly([(15,8),(21,5),(26,9),(28,16),(26,25),(23,28),(20,24),(15,25),(13,19)],'shade')
    d.poly([(16,12),(22,12),(23,17),(21,23),(18,26),(14,23),(13,20),(10,19),(14,16)],'skin')
    d.poly([(20,17),(23,17),(21,23),(18,26),(14,23),(16,21)],'brown')
    d.poly([(13,14),(14,9),(20,5),(26,8),(28,14),(25,13),(22,10),(18,13)],'silver')
    d.poly([(14,11),(20,6),(24,8),(19,9),(16,13)],'white')
    d.poly([(23,11),(27,14),(27,22),(24,27),(21,25),(24,20)],'silver')
    d.line([(13,14),(21,13)],'gold',2);d.rect((13,16,16,16),'hair')
    d.rect((14,18,15,18),'ink');d.line([(12,22),(16,22)],'brown')
    d.poly([(13,23),(17,23),(18,25),(16,27),(14,26)],'silver')
    return d

def regulator():
    d=Drawing()
    for x in (14,26):
        d.rect((x-3,47,x+3,61),'brown');d.oval((x-3,52,x+3,57),'gold')
        d.poly([(x-3,60),(x+2,60),(x+4,67),(x-5,67),(x-5,64)],'brown')
        d.line([(x-5,67),(x+4,67)])
        d.poly([(x-3,62),(x+1,62),(x+2,65),(x-4,65)],'copper')
    d.rect((31,7,35,32),'brown');d.rect((31,9,32,30),'copper')
    for y in (6,16,29):d.rect((30,y,36,y+2),'gold')
    d.poly([(11,23),(28,23),(33,32),(32,47),(28,54),(12,54),(8,47),(8,32)],'ink')
    d.poly([(12,25),(27,25),(30,32),(29,47),(26,51),(13,51),(10,46),(10,32)],'brown')
    d.poly([(12,27),(17,26),(16,48),(13,49),(11,44)],'copper')
    d.rect((15,41,26,49),'ink')
    for x in (17,20,23):d.rect((x,42,x+1,47),'gold')
    d.oval((16,29,26,39),'gold');d.oval((17,30,25,38),'cream')
    d.line([(21,35),(23,31)],'ink');d.rect((20,34,21,35),'brown')
    d.poly([(11,18),(13,12),(18,9),(25,10),(29,15),(30,24),(11,24)],'navy')
    d.poly([(13,15),(18,11),(24,12),(27,15)],'shade')
    d.rect((11,18,29,21),'gold');d.rect((13,21,28,27),'brown')
    for x in (17,24):d.oval((x-1,21,x+1,24),'gold');d.rect((x,22,x,23),'white')
    for x in (8,32):
        d.oval((x-4,27,x+4,35),'gold')
        d.line([(x,33),(x+(-2 if x<20 else 2),42),(x,49)],'ink',5)
        d.line([(x,33),(x+(-2 if x<20 else 2),42),(x,49)],'copper',3)
        d.poly([(x-3,46),(x+2,46),(x+4,51),(x+2,55),(x,52),(x-2,55),(x-4,52)],'brown')
    for x,y in [(14,28),(28,28),(13,49),(28,47)]:d.rect((x,y,x,y+1),'gold')
    return d

def export():
    out=Path(__file__).resolve().parents[3]/'public/art/vector'
    for name,model in zip(CAST,(emperor,engine_warden,regulator)):
        (out/f'{name}.svg').write_text(model().svg())
    for name,pose in [('emperor-left',emperor_profile()),('emperor-left-step-0',emperor_profile(2)),('emperor-left-step-1',emperor_profile(-2)),('emperor-reach',emperor_profile(reach=True))]:
        (out/f'{name}.svg').write_text(pose.svg())
    print('Exported Emperor, Engine Warden and Heart regulator as native SVG actors')

if __name__=='__main__':export()
