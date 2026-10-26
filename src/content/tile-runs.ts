/** Expand build-packed grids back to the original Tiled arrays before use. */
export function expandTileRuns<T extends {layers:{data?:number[]|string}[]}>(map:T):T {
  for(const layer of map.layers){
    if(typeof layer.data!=='string')continue;
    const data:number[]=[];
    let value=0;
    for(const token of layer.data.split(',')){
      const [step,run]=token.split('.'),delta=parseInt(step,36),count=run?parseInt(run,36):1;
      for(let i=0;i<count;i++){value+=delta;data.push(value);}
    }
    layer.data=data;
  }
  return map;
}
