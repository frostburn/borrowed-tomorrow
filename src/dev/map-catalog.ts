import { CHAPTER_FIVE_MAPS,CHAPTER_FIVE_BATTLES } from '../content/chapter-five/maps';
import { MAPS, mapSize, type MapData } from '../content/maps';
import { CHAPTER_ONE_MAPS, CHAPTER_ONE_BATTLES } from '../content/chapter-one/maps';
import { CHAPTER_TWO_MAPS, CHAPTER_TWO_BATTLES } from '../content/chapter-two/maps';
import { CHAPTER_THREE_MAPS, CHAPTER_THREE_BATTLES } from '../content/chapter-three/maps';
import { CHAPTER_FOUR_MAPS, CHAPTER_FOUR_BATTLES } from '../content/chapter-four/maps';
import { properties, type TileMap } from '../content/tilemaps';
import { REGULATOR_ENCOUNTERS } from '../content/chapter-three/regulator';

export interface MapReview {
  id:string; chapter:number; kind:'World'|'Battle'; name:string;
  width:number; height:number; tiles?:TileMap; world?:MapData; image?:string;
}
import { CHAPTER_SIX_MAPS,CHAPTER_SIX_BATTLES } from '../content/chapter-six/maps';
const worlds=[CHAPTER_ONE_MAPS,CHAPTER_TWO_MAPS,CHAPTER_THREE_MAPS,CHAPTER_FOUR_MAPS,CHAPTER_FIVE_MAPS,CHAPTER_SIX_MAPS];
const battles=[CHAPTER_ONE_BATTLES,CHAPTER_TWO_BATTLES,CHAPTER_THREE_BATTLES,CHAPTER_FOUR_BATTLES,CHAPTER_FIVE_BATTLES,CHAPTER_SIX_BATTLES];
export const MAP_REVIEWS:MapReview[]=worlds.flatMap((group,i)=>Object.keys(group).map(id=>{
  const world=MAPS[id as keyof typeof MAPS];
  return {id,chapter:i+1,kind:'World',name:world.name,...mapSize(world),tiles:world.tiles,world};
}));
for(const [i,group] of battles.entries())for(const [id,tiles] of Object.entries(group)){
  MAP_REVIEWS.push(id in REGULATOR_ENCOUNTERS?{id:`battle-${id}`,chapter:i+1,kind:'Battle',name:REGULATOR_ENCOUNTERS[id].name,width:1024,height:480,image:'art/vector/bosses/conduit-chamber.svg'}:{id:`battle-${id}`,chapter:i+1,kind:'Battle',name:String(properties(tiles).name??id),width:tiles.width*24,height:tiles.height*24,tiles});
}
/** Only flags that actually change this map's art, people, gates or markers. */
export function reviewFlags(entry:MapReview){
  const names=new Set<string>();
  const add=(p:Record<string,unknown>)=>{for(const key of ['requiredFlag','hiddenFlag','spriteHiddenFlag','doneFlag','openFlag','storyUntil'])if(p[key])names.add(String(p[key]));};
  for(const l of entry.tiles?.layers??[]){add(properties(l));for(const o of l.objects??[])add(properties(o));}
  for(const o of [...entry.world?.objects??[],...entry.world?.people??[],...entry.world?.gates??[]])add(o as unknown as Record<string,unknown>);
  return [...names].sort();
}

MAP_REVIEWS.push({id:'battle-alban-flagship',chapter:5,kind:'Battle',name:'Alban’s flagship · survey deck',width:1008,height:480,image:'art/vector/bosses/flagship-deck.svg'});
