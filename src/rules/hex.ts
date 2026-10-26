export interface Hex { q: number; r: number }
export const COLS = 11;
export const ROWS = 7;
export const DIRECTIONS: readonly Hex[] = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
];
/** Between the six edge-normal axes: successive centers are two hex steps apart. */
export const DIAGONALS:readonly Hex[]=DIRECTIONS.map((d,i)=>({q:d.q+DIRECTIONS[(i+1)%6].q,r:d.r+DIRECTIONS[(i+1)%6].r}));
export const key = (h: Hex) => `${h.q},${h.r}`;
export const equal = (a: Hex, b: Hex) => a.q === b.q && a.r === b.r;
export const add = (a: Hex, b: Hex): Hex => ({ q: a.q + b.q, r: a.r + b.r });
export const scale = (a: Hex, n: number): Hex => ({ q: a.q * n, r: a.r * n });
export const offset = (col: number, row: number): Hex => ({ q: col - Math.floor(row / 2), r: row });
export const column = (h: Hex) => h.q + Math.floor(h.r / 2);
export const inside = (h: Hex) => h.r >= 0 && h.r < ROWS && column(h) >= 0 && column(h) < COLS;
export const distance = (a: Hex, b: Hex) => Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r));
export const neighbors = (h: Hex) => DIRECTIONS.map(d => add(h, d)).filter(inside);
export const cells = (): Hex[] => Array.from({ length: ROWS * COLS }, (_, i) => offset(i % COLS, Math.floor(i / COLS)));

export function roundHex(q: number, r: number): Hex {
  const s = -q - r;
  let rq = Math.round(q), rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq || 0, r: rr || 0 };
}

export function line(a: Hex, b: Hex): Hex[] {
  const n = distance(a, b);
  if (!n) return [a];
  return Array.from({ length: n + 1 }, (_, i) => roundHex(
    a.q + (b.q - a.q) * i / n + 1e-6,
    a.r + (b.r - a.r) * i / n + 1e-6,
  ));
}

export function visible(a: Hex, b: Hex, obstacles: Set<string>): boolean {
  return line(a, b).slice(1).every(h => !obstacles.has(key(h)));
}

export function blast(center: Hex): Hex[] { return [center, ...neighbors(center)]; }
/** Four touching hexes in the requested down-right slanted square. */
export const quad=(aim:Hex):Hex[]=>[aim,add(aim,{q:1,r:0}),add(aim,{q:0,r:1}),add(aim,{q:1,r:1})].filter(inside);

/** Aim snaps to one of the six hex axes; a ray stops at the first obstacle. */
export function ray(from: Hex, aim: Hex, length: number, obstacles: Set<string>): Hex[] {
  if (equal(from, aim)) return [];
  const dq = aim.q - from.q, dr = aim.r - from.r;
  const direction = [...DIRECTIONS].sort((a, b) =>
    (dq * b.q + dr * b.r + (dq + dr) * (b.q + b.r)) -
    (dq * a.q + dr * a.r + (dq + dr) * (a.q + a.r)),
  )[0];
  const result: Hex[] = [];
  for (let n = 1; n <= length; n++) {
    const h = add(from, scale(direction, n));
    if (!inside(h) || obstacles.has(key(h))) break;
    result.push(h);
  }
  return result;
}

/** A vertex-directed ray touches only the spaced center cells, including its first cover hit. */
export function diagonalRay(from:Hex,aim:Hex,range:number,obstacles:Set<string>):Hex[]{
 if(equal(from,aim))return [];
 const dq=aim.q-from.q,dr=aim.r-from.r;
 const dot=(d:Hex)=>dq*d.q+dr*d.r+(dq+dr)*(d.q+d.r);
 const direction=[...DIAGONALS].sort((a,b)=>dot(b)-dot(a))[0],result:Hex[]=[];
 for(let n=1;n<=Math.floor(range/2);n++){
  const h=add(from,scale(direction,n));if(!inside(h))break;
  result.push(h);if(obstacles.has(key(h)))break;
 }
 return result;
}

export interface Reach { hex: Hex; path: Hex[]; cost: number }
/** Dijkstra search: choose the cheapest route, which may be longer on dry ground. */
export function reachable(start: Hex, movement: number, blocked: Set<string>, cost:(hex:Hex)=>number=()=>1): Map<string, Reach> {
  const first:Reach={hex:start,path:[],cost:0},result=new Map<string,Reach>([[key(start),first]]),queue=[first];
  while(queue.length){
    queue.sort((a,b)=>a.cost-b.cost);const current=queue.shift()!;
    if(result.get(key(current.hex))!==current)continue;
    for(const h of neighbors(current.hex)){
      const total=current.cost+cost(h);
      if(total>movement||blocked.has(key(h))||(result.get(key(h))?.cost??Infinity)<=total)continue;
      const visit={hex:h,path:[...current.path,h],cost:total};result.set(key(h),visit);queue.push(visit);
    }
  }
  return result;
}

/** Near-regular pointy hexes on the shared 2px display lattice. */
export const HEX_SIZE = 36;
export const HEX_WIDTH = 60;
export const HEX_ROW = 54;
export const ORIGIN = { x: 160, y: 104 };
export function toPixel(h: Hex): { x: number; y: number } {
  return { x: ORIGIN.x + HEX_WIDTH * (h.q + h.r / 2), y: ORIGIN.y + HEX_ROW * h.r };
}
/** A diagonal leaves the caster at a vertex joining the next pair of hex edges. */
export function diagonalStart(from:Hex,first:Hex){const a=toPixel(from),b=toPixel(first);return {x:a.x+(b.x-a.x)/3,y:a.y+(b.y-a.y)/3};}
/** Insets and vertices stay on complete 2x2 display pixels. */
export function hexVertices(h:Hex,inset=0):{x:number;y:number}[]{
 const p=toPixel(h),i=Math.round(inset/2)*2,w=HEX_WIDTH/2-i,tip=HEX_SIZE-i,shoulder=18-Math.round(i/4)*2;
 return [[w,-shoulder],[w,shoulder],[0,tip],[-w,shoulder],[-w,-shoulder],[0,-tip]].map(([x,y])=>({x:p.x+x,y:p.y+y}));
}
export function fromPixel(x: number, y: number): Hex {
 const r=(y-ORIGIN.y)/HEX_ROW,q=(x-ORIGIN.x)/HEX_WIDTH-r/2,nearest=roundHex(q,r);
 // Cube rounding alone assumes regular hexagons. Check the actual sloped
 // edges of nearby cells so targeting follows the drawn shape at the tips.
 for(const h of [nearest,...DIRECTIONS.map(d=>add(nearest,d))]){
  const p=toPixel(h),dx=Math.abs(x-p.x),dy=Math.abs(y-p.y);
  if(dx<=HEX_WIDTH/2+1e-8&&dy<=HEX_SIZE-dx*.6+1e-8)return h;
 }
 return nearest;
}
