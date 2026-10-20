import type { ActorDirection } from '../content/actors';

/** Local axes: +x anatomical right, +y forward, +z up. Ground anchor: (40,68). */
export interface Point3 { x:number;y:number;z:number }

export function orient(p:Point3,direction:ActorDirection):Point3 {
  switch(direction){
    case 'front':return {x:-p.x,y:p.y,z:p.z};
    case 'back':return {x:p.x,y:-p.y,z:p.z};
    case 'right':return {x:p.y,y:p.x,z:p.z};
    case 'left':return {x:-p.y,y:-p.x,z:p.z};
  }
}

export function project(p:Point3,direction:ActorDirection){
  const v=orient(p,direction);
  return {x:40+v.x,y:68+v.y*.45-v.z,depth:v.y+v.z*.45};
}
