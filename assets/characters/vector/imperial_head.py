"""The Emperor's shared front likeness for his actor and vessel. Actor coordinates."""
def emperor_head(d,fallen=False):
    # Connected silver locks surround a narrow, aged face. The lower jaw and
    # pointed beard remain visible above the high collar at the chunky raster.
    d.poly([(13,13),(15,7),(21,5),(26,9),(27,16),(26,25),(23,28),(20,25),(16,27),(13,23)],'silver-shadow')
    d.poly([(16,12),(21,10),(24,13),(25,18),(23,23),(20,26),(17,24),(15,19)],'skin')
    d.poly([(16,13),(19,11),(21,12),(20,16),(17,18),(16,17)],'skin-light')
    d.poly([(23,13),(25,18),(23,23),(20,26),(19,24),(22,21),(22,17)],'skin-shadow')
    d.poly([(13,16),(14,10),(19,5),(24,6),(27,11),(27,15),(24,12),(21,9),(18,12),(16,17),(15,23),(13,25),(12,21)],'silver')
    d.poly([(14,12),(16,8),(20,6),(23,7),(19,9),(16,14),(14,19)],'silver-light')
    d.poly([(24,11),(26,14),(27,20),(25,25),(23,26),(23,23),(25,19),(23,15)],'silver')
    d.line([(16,14),(24,13)],'gold',1.5)
    d.poly([(20,13),(21,10),(22,13),(21,15)],'gold-light')
    d.line([(16,17),(18.5,17.5)],'silver-shadow',1)
    d.line([(21.5,17.5),(24,17)],'silver-shadow',1)
    if fallen:
        d.line([(16.5,18.5),(19,19)],'navy',.65)
        d.line([(21.5,19),(24,18.5)],'navy',.65)
    else:
        d.rect((17,18,18,18.7),'navy');d.rect((22,18,23,18.7),'navy')
    d.poly([(20,17),(19,21),(21,22),(22,21),(20.5,20)],'skin-shadow')
    d.poly([(20,18),(20,20),(21,20.5)],'skin-light')
    d.line([(17.5,23),(20,22.5),(22,23)],'brown',.7)
    d.poly([(17,23),(19,24),(22,23),(22,25),(20,28),(18,26)],'silver')
    d.poly([(18.5,24),(20,25),(21.5,24),(20,27)],'silver-light')
