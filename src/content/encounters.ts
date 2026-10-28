import {ENCOUNTERS as SEVEN} from './chapter-seven/encounters';
import { ENCOUNTERS as ONE } from './chapter-one/encounters';
import { ENCOUNTERS as TWO } from './chapter-two/encounters';
import { ENCOUNTERS as THREE } from './chapter-three/encounters';
import { ENCOUNTERS as FOUR } from './chapter-four/encounters';
import { ENCOUNTERS as SIX } from './chapter-six/encounters';
import { ENCOUNTERS as FIVE } from './chapter-five/encounters';
import type {Encounter} from '../rules/combat';

/** Campaign encounter registry; the combat engine consumes these authored definitions. */
export const ENCOUNTERS={...ONE,...TWO,...THREE,...FOUR,...FIVE,...SIX,...SEVEN};

const chapters=new Map<string,number>(),backdrops=new Map<string,number>();
for(const [index,group]of [ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN].entries())for(const encounter of Object.values(group)){
 const chapter=index+1;chapters.set(encounter.id,chapter);
 if(encounter.backdrop){
  const map=encounter.backdrop.map,previous=backdrops.get(map);
  backdrops.set(map,previous===undefined||previous===chapter?chapter:0);
 }
}
/** Exact authored IDs win; dev copies may retain an unambiguous backdrop. */
export function encounterChapter(encounter:Pick<Encounter,'id'|'backdrop'>){
 return chapters.get(encounter.id)||(encounter.backdrop&&backdrops.get(encounter.backdrop.map))||undefined;
}
