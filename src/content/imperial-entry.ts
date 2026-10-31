/** Native pieces retain the accepted vessel's dimensions and painter order. */
export const IMPERIAL_ENTRY_PARTS=['frame','arm-left','arm-right','collar-left','collar-right','face','front-left','front-right'] as const;
export const IMPERIAL_ENTRY_ASSETS=IMPERIAL_ENTRY_PARTS.map(part=>({key:`imperial-entry-${part}`,url:`art/vector/chapter-six/imperial-entry-${part}.svg`}));
export type ImperialEntryEffect='imperial-enter'|'imperial-close'|'imperial-unfold';
export const IMPERIAL_WALK_MS=2200;
export const IMPERIAL_CLOSE_MS=1100;
export const IMPERIAL_UNFOLD_MS=2500;
const smooth=(n:number)=>{const p=Math.min(1,Math.max(0,n));return p*p*(3-2*p);};
/** One assembly clock: fast advances settle at the next phase's exact pose. */
export function imperialEntryPose(time:number){
 const closed=smooth(time/IMPERIAL_CLOSE_MS),growth=smooth((time-IMPERIAL_CLOSE_MS)/IMPERIAL_UNFOLD_MS);
 return {closed,growth,scale:.5+growth*.5,y:520-16*growth,plateGap:84*(1-closed),armAngle:.65*(1-growth),
  humanAlpha:1-smooth((closed-.65)/.3),faceAlpha:smooth((growth-.08)/.3),
  supportAlpha:smooth((growth-.05)/.2),supportCenter:780+8*growth,supportSpread:64+174*growth,supportY:520-11*growth};
}
