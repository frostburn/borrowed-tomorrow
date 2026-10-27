import {hexVertices,type Hex} from '../rules/hex';
export interface HexOutline {hex:Hex;color:number;width:number;priority:number}
export interface GridEdge {a:{x:number;y:number};b:{x:number;y:number};color:number;width:number;priority:number}
/** One owner per geometric edge, including the outside of the battlefield.
 * Stronger tactical states win shared edges, independent of cell draw order. */
export function gridEdges(outlines:readonly HexOutline[],boundaries:readonly (readonly HexOutline[])[]=[]):GridEdge[]{
 const edges=new Map<string,GridEdge>();
 function add(style:HexOutline,boundary?:Map<string,{edge:GridEdge;count:number}>){
  const points=hexVertices(style.hex);
  for(let i=0;i<6;i++){
   let a=points[i],b=points[(i+1)%6];if(a.x>b.x||a.x===b.x&&a.y>b.y)[a,b]=[b,a];
   const id=`${a.x},${a.y}:${b.x},${b.y}`,previous=edges.get(id),width=Math.max(2,Math.ceil(style.width/2)*2);
   const edge={a,b,color:style.color,width,priority:style.priority};
   if(boundary){const old=boundary.get(id);boundary.set(id,{edge,count:(old?.count??0)+1});}
   else if(!previous||style.priority>previous.priority||style.priority===previous.priority&&(width>previous.width||width===previous.width&&style.color>previous.color))edges.set(id,edge);
  }
 }
 for(const style of outlines)add(style);
 for(const group of boundaries){
  const boundary=new Map<string,{edge:GridEdge;count:number}>();
  for(const style of group)add(style,boundary);
  for(const [id,{edge,count}]of boundary)if(count===1){const previous=edges.get(id);if(!previous||edge.priority>previous.priority)edges.set(id,edge);}
 }
 return [...edges.values()];
}
