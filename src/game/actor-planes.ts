/** In-memory faceted relief for the flat material regions of a native frame.
 * This is stylized sprite relief, not a mesh or a smooth silhouette bevel.
 * Each row is split into broad, slightly slanted left/front/right planes;
 * exposed material tops catch an upward plane. Tiny features stay flat.
 */
const cache=new WeakMap<ImageData,Int8Array>();
export function actorPlanes(source:ImageData){
  const cached=cache.get(source);if(cached)return cached;
  const {width:w,height:h,data}=source,family=new Int16Array(w*h).fill(-1),planes=new Int8Array(w*h*3);
  for(let i=0;i<family.length;i++){
    if(data[i*4+3]<128)continue;
    const r=data[i*4],g=data[i*4+1],b=data[i*4+2],max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    // Combine a material's existing light/base/shadow colors, while keeping
    // neighboring skin, red cloth, blue cloth and metal regions separate.
    let hue=0;
    if(delta)hue=((max===r?(g-b)/delta:max===g?2+(b-r)/delta:4+(r-g)/delta)*60+360)%360;
    family[i]=delta<22?12:Math.floor((hue+10)%360/30);
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;){
    const id=family[y*w+x];if(id<0){x++;continue;}
    const start=x;while(x<w&&family[y*w+x]===id)x++;const end=x,length=end-start;
    for(let xx=start;xx<end;xx++){
      const i=y*w+xx,across=(xx-start+.5)/length-.08*(y/h-.5);
      let nx=0,ny=12,nz=99;
      if(length>=6){
        if(across<.30){nx=-80;ny=12;nz=59;}
        else if(across>.70){nx=80;ny=12;nz=59;}
        if(y<2||family[(y-2)*w+xx]!==id){ny=65;nz=nx?42:76;nx*=.8;}
      }
      planes[i*3]=nx;planes[i*3+1]=ny;planes[i*3+2]=nz;
    }
  }
  cache.set(source,planes);return planes;
}
