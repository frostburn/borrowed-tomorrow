/** Explicit story cues; unsupported faces retain their independently drawn neutral art. */
export const PORTRAIT_EXPRESSIONS=['neutral','happy','worried','sad','angry','surprised','bashful','flustered'] as const;
export type PortraitExpression=typeof PORTRAIT_EXPRESSIONS[number];
const EXPRESSIVE_PORTRAITS=['portrait-nell','portrait-orrin','portrait-kit','portrait-celia','portrait-petra','portrait-tomas'];
export function portraitExpressions(portrait?:string):readonly PortraitExpression[]{
 if(!portrait||!EXPRESSIVE_PORTRAITS.includes(portrait))return ['neutral'];
 return PORTRAIT_EXPRESSIONS.filter(e=>(e!=='bashful'||portrait==='portrait-nell'||portrait==='portrait-kit')&&(e!=='flustered'||portrait==='portrait-kit'));
}
export function expressivePortrait(portrait:string|undefined,expression:PortraitExpression='neutral'){
 return expression!=='neutral'&&portraitExpressions(portrait).includes(expression)?`${portrait}-${expression}`:portrait;
}
export const expressionAsset=(name:string)=>EXPRESSIVE_PORTRAITS.some(p=>portraitExpressions(p).some(e=>e!=='neutral'&&name===`${p}-${e}`));
