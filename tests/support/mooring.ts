import {chapterSixStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
import {SIXTH_CHAPTER} from '../../src/rules/state';

/** Authored Chapter Five completion, before the asset-checked Chapter Six entry. */
export function mooringDeparture(){
 const state=chapterSixStart();state.chapter='chapter-five';state.boundary=SIXTH_CHAPTER;
 state.location=arrival('airship','start');return state;
}
