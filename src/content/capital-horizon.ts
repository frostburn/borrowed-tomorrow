import geometry from './hollow-sun.json';

/** Extra sky above the existing quay artwork; the palace geometry stays put. */
export const CAPITAL_SKY={height:240,color:0x33434f};
export const CAPITAL_SKY_FOCUS={x:32,y:2};
export function capitalHorizon(width:number){
 return {x:780,y:-30,aspect:.42,radius:Math.min(130,(width-32)/(2*geometry.longRayTip))};
}
