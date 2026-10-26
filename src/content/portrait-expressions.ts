/** Explicit story cues; unsupported faces retain their independently drawn neutral art. */
export const PORTRAIT_EXPRESSIONS=['neutral','happy','worried','sad','angry','surprised','bashful'] as const;
export type PortraitExpression=typeof PORTRAIT_EXPRESSIONS[number];
const PARTY_PORTRAITS=['portrait-nell','portrait-orrin','portrait-kit','portrait-celia','portrait-petra'];
export function portraitExpressions(portrait?:string):readonly PortraitExpression[]{
 if(!portrait||!PARTY_PORTRAITS.includes(portrait))return ['neutral'];
 return portrait==='portrait-nell'||portrait==='portrait-kit'?PORTRAIT_EXPRESSIONS:PORTRAIT_EXPRESSIONS.filter(e=>e!=='bashful');
}
export function expressivePortrait(portrait:string|undefined,expression:PortraitExpression='neutral'){
 return expression!=='neutral'&&portraitExpressions(portrait).includes(expression)?`${portrait}-${expression}`:portrait;
}
export const expressionAsset=(name:string)=>PARTY_PORTRAITS.some(p=>portraitExpressions(p).some(e=>e!=='neutral'&&name===`${p}-${e}`));
