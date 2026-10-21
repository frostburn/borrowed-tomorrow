const decoded = new WeakMap<HTMLImageElement,{url:string;canvas:HTMLCanvasElement}>();

/** Decode a loaded SVG once at its declared size, without rescaling it.
 * Canvas renderers otherwise replay the SVG for every cropped tile/frame.
 * This is an in-memory texture cache; source and network assets remain SVG.
 */
export function vectorSurface(image:HTMLImageElement){
  const cached=decoded.get(image);
  if(cached?.url===image.src)return cached.canvas;
  const canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,0,0);
  decoded.set(image,{url:image.src,canvas});
  return canvas;
}
