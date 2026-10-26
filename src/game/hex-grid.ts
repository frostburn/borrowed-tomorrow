import {hexVertices,type Hex} from '../rules/hex';
export interface HexOutline {hex:Hex;color:number;width:number;priority:number}
export interface GridEdge {a:{x:number;y:number};b:{x:number;y:number};color:number;width:number;priority:number}
/** One owner per geometric edge, including the outside of the battlefield.
 * Stronger tactical states win shared edges, independent of cell draw order. */
export function gridEdges(outlines:readonly HexOutline[]):GridEdge[]{
 const edges=new Map<string,GridEdge>();
 for(const style of outlines){
  const points=hexVertices(style.hex);
  for(let i=0;i<6;i++){
   let a=points[i],b=points[(i+1)%6];if(a.x>b.x||a.x===b.x&&a.y>b.y)[a,b]=[b,a];
   const id=`${a.x},${a.y}:${b.x},${b.y}`,previous=edges.get(id),width=Math.max(2,Math.ceil(style.width/2)*2);
   if(!previous||style.priority>previous.priority||style.priority===previous.priority&&(width>previous.width||width===previous.width&&style.color>previous.color))edges.set(id,{a,b,color:style.color,width,priority:style.priority});
  }
 }
 return [...edges.values()];
}
