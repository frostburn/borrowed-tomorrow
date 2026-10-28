"""A boarding ramp defined by its actual ship-deck and shore landing anchors."""
def gangway(ship,shore,width=26,rail=20):
    sx,sy=ship;tx,ty=shore
    # Cross-planks follow the same perspective at both ends. The vessel end
    # must be higher on screen; reversing a copied polygon makes an uphill ramp.
    if ty<=sy:raise ValueError('The shore landing must be below the ship deck')
    dx,dy=width/2,-width/4
    a=(sx-dx,sy-dy);b=(sx+dx,sy+dy)
    c=(tx+dx,ty+dy);d=(tx-dx,ty-dy)
    def poly(points,color,id=''):
        return '<polygon'+(f' id="{id}"'if id else '')+' points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="{color}"/>'
    def line(points,color,w=2):
        return '<polyline points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{w}"/>'
    out=[poly([a,b,c,d],'#b59b6c','boarding-surface'),poly([a,d,(d[0],d[1]+6),(a[0],a[1]+6)],'#415b60'),poly([d,c,(c[0],c[1]+6),(d[0],d[1]+6)],'#786d54')]
    for i in range(1,9):
        t=i/9
        out.append(line([(a[0]+(d[0]-a[0])*t,a[1]+(d[1]-a[1])*t),(b[0]+(c[0]-b[0])*t,b[1]+(c[1]-b[1])*t)],'#766b54'))
    if rail:
        for start,end in [(a,d),(b,c)]:
            out.append(line([(start[0],start[1]-rail),(end[0],end[1]-rail)],'#d0b982',3))
            for t in (0,.5,1):
                x=start[0]+(end[0]-start[0])*t;y=start[1]+(end[1]-start[1])*t
                out.append(line([(x,y-rail),(x,y)],'#526b6b',3))
    return out
