import report from '../../assets/characters/pixel-fixer-civilians.json';
import { art } from '../game/ui';
import { civilianPresentation } from '../content/civilians';

const assets=import.meta.glob<string>('./art/civilian-review/*.png',{eager:true,query:'?url',import:'default'});

/** Review the recovered grid at its actual size; never fit it to an actor box. */
export function mountCivilianReconstruction(host:HTMLElement,id:string){
  const role=id.replace('civilian-','');
  const entry=report.entries.find(entry=>entry.role===role);
  if(!entry)return;
  const fit=civilianPresentation(id)!;
  const section=document.createElement('section');section.className='civilian-reconstruction';
  section.setAttribute('aria-label','Pixel Art Fixer review');
  section.innerHTML=`<h3>Pixel Art Fixer / ${role}</h3><p>Recovered ${entry.full.cols} x ${entry.full.rows}. ${entry.confidence}. Source figure height: ${entry.bounds[3]-entry.bounds[1]} pixels.</p><p>Used in campaign at ${report.campaignStandingHeight} pixels tall with uniform filtered scaling. The recovered grid below remains at its original size.</p><p>${entry.review}</p><div role="group" aria-label="Reconstruction zoom">${[1,2,3].map(z=>`<button data-recovery-zoom="${z}" aria-pressed="${z===1}">${z}x</button>`).join('')}</div><div class="sprite-scroll"><div class="civilian-comparisons"></div></div>`;
  host.querySelector('.sprite-review')!.append(section);
  const variants=[
    ['Campaign',art(id)],
    ['Previous point sample',assets[`./art/civilian-review/${role}-sampled.png`]],
    ['Smooth attempt',assets[`./art/civilian-review/${role}-smooth.png`]],
    ['Recovered grid',assets[`./art/civilian-review/${role}-fixed.png`]],
  ];
  const row=section.querySelector('.civilian-comparisons')!;
  let zoom=1;
  const images=variants.map(([label,url])=>{
    const cell=document.createElement('section'),title=document.createElement('h4'),canvas=document.createElement('canvas');
    title.textContent=label;canvas.setAttribute('role','img');cell.append(title,canvas);row.append(cell);
    const image=new Image();image.src=url;
    return {label,image,canvas,title};
  });
  function paint(){
    if(!section.isConnected)return;
    for(const {label,image,canvas,title} of images){
      if(!image.complete||!image.naturalWidth)continue;
      canvas.width=(label==='Campaign'?80:image.naturalWidth)*zoom;canvas.height=(label==='Campaign'?80:image.naturalHeight)*zoom;
      canvas.style.width=`${canvas.width}px`;canvas.style.height=`${canvas.height}px`;
      canvas.setAttribute('aria-label',`${label} ${role} at ${zoom}x`);
      title.textContent=label==='Campaign'?`Campaign / ${report.campaignStandingHeight}px figure`:`${label} / ${image.naturalWidth} x ${image.naturalHeight}`;
      const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=label==='Campaign';
      for(let y=0;y<canvas.height;y+=8)for(let x=0;x<canvas.width;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
      if(label==='Campaign'){
        const scale=fit.scale*zoom;
        ctx.drawImage(image,40*zoom-image.width*fit.originX*scale,68*zoom-image.height*fit.originY*scale,image.width*scale,image.height*scale);
      }else ctx.drawImage(image,0,0,canvas.width,canvas.height);
    }
    section.dataset.paint=String(Number(section.dataset.paint??0)+1);
  }
  for(const {image} of images){image.onload=paint;image.onerror=()=>{section.dataset.error='Artwork unavailable';};}
  for(const button of section.querySelectorAll<HTMLButtonElement>('[data-recovery-zoom]'))button.onclick=()=>{
    zoom=Number(button.dataset.recoveryZoom);
    for(const candidate of section.querySelectorAll<HTMLButtonElement>('[data-recovery-zoom]'))candidate.setAttribute('aria-pressed',String(candidate===button));
    paint();
  };
  paint();
}
