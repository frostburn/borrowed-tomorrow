"""Lossless small-page IO shared by the authoring importer."""
import json,math,re
from io import BytesIO
from PIL import Image,ImageChops
S=24
MAX_IMAGE_BYTES=131072

def load_tiles(root):
    catalog=json.loads((root/'assets/tiles/chapter-one.tileset.json').read_text());tiles=[]
    for page in catalog['pages']:
        image=Image.open(root/'public'/page['url']).convert('RGBA')
        definitions=json.loads((root/'assets/tiles/pages'/f"{page['name']}.json").read_text())['tiles']
        for tile in definitions:
            i=tile['id'];x=i%page['columns']*S;y=i//page['columns']*S
            tiles.append((image.crop((x,y,x+S,y+S)),dict(tile,id=i+page['firstgid']-1)))
    return tiles

def join(image,mask):
    image=image.copy();alpha=Image.new('L',(S,S));pixels=alpha.load()
    for y in range(S):
        for x in range(S):
            d=min([8]+([y] if mask&1 else [])+([23-x] if mask&2 else [])+([23-y] if mask&4 else [])+([x] if mask&8 else []))
            pixels[x,y]=round(min(1,d/7)*255)
    image.putalpha(ImageChops.multiply(image.getchannel('A'),alpha));return image

def write_pages(root,tiles):
    images=root/'public/art/chapter-one';definitions=root/'assets/tiles/pages';pages=[];start=0;outputs=[]
    existing=json.loads((root/'assets/tiles/chapter-one.tileset.json').read_text())
    # Appending definitions must not repack already published image pages.
    plan=existing.get('pages',[]) if existing.get('tilecount',0)<=len(tiles) else []
    def encode(count,cols,extension):
        image=Image.new('RGBA',(cols*S,math.ceil(count/cols)*S))
        for i,(piece,_) in enumerate(tiles[start:start+count]):image.paste(piece,(i%cols*S,i//cols*S))
        output=BytesIO()
        if extension=='.png':image.save(output,format='PNG',optimize=True)
        else:image.save(output,format='WEBP',lossless=True,quality=75,method=2,exact=True)
        return image,output.getvalue()
    while start<len(tiles):
        if len(pages)<len(plan):
            previous=plan[len(pages)];count=previous['tilecount'];cols=previous['columns'];name=previous['name'];extension='.png' if previous['url'].endswith('.png') else '.webp'
            assert previous['firstgid']==start+1
            image,binary=encode(count,cols,extension)
        else:
            low,high=1,min(64,len(tiles)-start);best=None;extension='.webp';name=f'tiles-{len(pages):03}'
            while low<=high:
                count=(low+high)//2;cols=min(8,count);image,binary=encode(count,cols,extension)
                if len(binary)<=MAX_IMAGE_BYTES:best=(count,cols,image,binary);low=count+1
                else:high=count-1
            if best is None:raise ValueError('A single tile exceeds the image budget')
            count,cols,image,binary=best
        assert len(binary)<=MAX_IMAGE_BYTES, 'Page exceeds the 128 KB upload guard'
        assert image.width<=192 and image.height<=192
        assert Image.open(BytesIO(binary)).convert('RGBA').tobytes()==image.tobytes(), 'Lossless page changed native pixels'
        page=dict(type='tileset',version='1.10',tiledversion='1.11.2',name=name,tilewidth=S,tileheight=S,tilecount=count,columns=cols,image=f'../../../public/art/chapter-one/{name}{extension}',imagewidth=image.width,imageheight=image.height,margin=0,spacing=0)
        outputs.append((images/f'{name}{extension}',binary))
        local=[dict(t,id=i) for i,(_,t) in enumerate(tiles[start:start+count])]
        outputs.append((definitions/f'{name}.json',(json.dumps(dict(page,tiles=local),indent=2)+'\n').encode()))
        pages.append(dict(page,firstgid=start+1,source=f'../../../../assets/tiles/pages/{name}.json',url=f'art/chapter-one/{name}{extension}'));start+=count
    # Finish encoding and verification before replacing any working files.
    for folder,pattern in [(images,'*.png'),(images,'*.webp'),(definitions,'*.json')]:
        for file in folder.glob(pattern):file.unlink()
    for path,binary in outputs:path.write_bytes(binary)
    (root/'assets/tiles/chapter-one.tileset.json').write_text(json.dumps(dict(name='Chapter One',tilewidth=S,tileheight=S,tilecount=len(tiles),pages=pages),indent=2)+'\n')
    imports='// Generated native page imports, shared by Vite and content tooling.\n'+''.join(f"import p{i} from './pages/{p['name']}.json' with {{ type: 'json' }};\n" for i,p in enumerate(pages))
    (root/'assets/tiles/tile-definitions.ts').write_text(imports+'export default ['+','.join(f'p{i}' for i in range(len(pages)))+'];\n')
    for file in (root/'src/content/chapter-one/maps').glob('*.json'):
        text=file.read_text();start=text.index('  "tilesets": [');end=text.index('  "tilewidth":',start)
        refs=json.dumps([dict(firstgid=p['firstgid'],source=p['source']) for p in pages],indent=2)
        file.write_text(text[:start]+'  "tilesets": '+refs.replace('\n','\n  ')+',\n'+text[end:])
    return pages
