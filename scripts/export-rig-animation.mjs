// Shared authoring pipeline: native skins and small pages only.
// Requires the existing development dependencies and Python/Pillow; no generated source sheets.
import { createServer } from 'vite';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const python=(code,input)=>{
  const result=spawnSync('python3',['-c',code,root],{input,encoding:'utf8',maxBuffer:4*1024*1024});
  if(result.status!==0)throw new Error(result.stderr);return result.stdout;
};
export async function exportRigAnimation(hero){
if(!['nell','orrin','kit'].includes(hero))throw new Error('Unknown character export.');
const sources=JSON.parse(python(`
hero='${hero}'
import json,sys,base64
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1]);data={};skin=root/f'assets/characters/{hero}-skin';skin.mkdir(exist_ok=True)
for direction in ['front','left','right','back']:
    suffix='' if direction=='front' else '-'+direction
    image=Image.open(root/f'public/art/{hero}{suffix}.png').convert('RGBA')
    image.putalpha(image.getchannel('A').point(lambda a:255 if a>=128 else 0))
    image.save(skin/f'{direction}.png',optimize=True)
    data[direction]={'width':80,'height':80,'rgba':base64.b64encode(image.tobytes()).decode()}
print(json.dumps(data))
`));
const textures=Object.fromEntries(Object.entries(sources).map(([direction,data])=>[direction,{width:data.width,height:data.height,pixels:new Uint8ClampedArray(Buffer.from(data.rgba,'base64'))}]));
const server=await createServer({configFile:false,root,server:{middlewareMode:true},appType:'custom'});
try{
  const model=await server.ssrLoadModule(`/src/art/${hero}-actor.ts`),render=model[`render${hero[0].toUpperCase()}${hero.slice(1)}`];
  const pages=Object.keys(textures).map(direction=>({direction,frames:Array.from({length:8},(_,frame)=>Buffer.from(render(frame,direction,textures)).toString('base64'))}));
  process.stdout.write(python(`
import json,sys,base64
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1])
for data in json.load(sys.stdin):
    path=root/f"public/art/animation/${hero}-{data['direction']}.png"
    page=Image.new('RGBA',(160,320))
    for frame,encoded in enumerate(data['frames']):
        image=Image.frombytes('RGBA',(80,80),base64.b64decode(encoded))
        page.paste(image,(frame%2*80,frame//2*80))
    page.save(path,optimize=True)
    assert path.stat().st_size<=131072
    print(path.relative_to(root),path.stat().st_size,'bytes')
`,JSON.stringify(pages)));
}finally{await server.close();}

}
