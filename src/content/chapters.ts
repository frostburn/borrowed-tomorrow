import { beginChapterTwo,beginChapterThree,beginChapterFour,beginChapterFive,beginChapterSix,SIXTH_CHAPTER,NEXT_CHAPTER,THIRD_CHAPTER,FOURTH_CHAPTER,FIFTH_CHAPTER,type GameState,type MapId } from '../rules/state';
import { CHAPTER_ONE_MAPS } from './chapter-one/maps';
import { CHAPTER_TWO_MAPS } from './chapter-two/maps';
import { CHAPTER_THREE_MAPS } from './chapter-three/maps';
import { CHAPTER_FOUR_MAPS } from './chapter-four/maps';
import { CHAPTER_FIVE_MAPS } from './chapter-five/maps';
import { interactChapterOne, resumeChapter as resumeOne } from './chapter-one/interactions';
import type { StoryHost } from './story-host';
import { interactChapterTwo,resumeChapterTwo } from './chapter-two/interactions';
import { interactChapterThree,resumeChapterThree } from './chapter-three/interactions';
import { interactChapterFour,resumeChapterFour } from './chapter-four/interactions';
import { interactChapterFive,resumeChapterFive } from './chapter-five/interactions';
import * as one from './chapter-one/story';
import * as two from './chapter-two/story';
import * as three from './chapter-three/story';
import * as four from './chapter-four/story';
import { CHAPTER_SIX_MAPS } from './chapter-six/maps';
import { interactChapterSix,resumeChapterSix } from './chapter-six/interactions';
import * as six from './chapter-six/story';
import * as five from './chapter-five/story';

interface ChapterDefinition {
  title:string;
  maps:readonly MapId[];
  restoreAllMaps:boolean;
  entry?:{
    from:GameState['chapter'];
    boundary:GameState['boundary'];
    loading:string;
    begin:(state:GameState)=>boolean;
  };
  story:{
    journal:Record<string,{title:string;text:string}>;
    objective:(state:GameState)=>string;
    resume:(host:StoryHost)=>void;
    interact:(host:StoryHost,id:string)=>void;
  };
  ending:{html:string;returnLabel:string;exportLabel?:string};
}
const mapIds=(maps:object)=>Object.keys(maps) as MapId[];

/** Shipped chapter wiring. Destination assets must load before entry.begin runs. */
export const CHAPTERS:Record<GameState['chapter'],ChapterDefinition>={
  'chapter-one':{
    title:'Chapter One',maps:mapIds(CHAPTER_ONE_MAPS),restoreAllMaps:false,
    story:{journal:one.JOURNAL,objective:one.objective,resume:resumeOne,interact:interactChapterOne},
    ending:{
      html:'<div class="chapter-name">Next: Chapter Two · Prison Trains</div><p>Rillbridge is awake. Alban has lost the crossing. Tomas is at the prison-train exchange on the Iron Coast.</p><p>Nell and Orrin have their own engine and a way east.</p>',
      returnLabel:'Return to the pass',
    },
  },
  'chapter-two':{
    title:'Chapter Two',maps:mapIds(CHAPTER_TWO_MAPS),restoreAllMaps:false,
    entry:{from:'chapter-one',boundary:NEXT_CHAPTER,loading:'Loading the Iron Coast…',begin:beginChapterTwo},
    story:{journal:two.JOURNAL,objective:two.objective,resume:resumeChapterTwo,interact:interactChapterTwo},
    ending:{
      html:'<div class="chapter-name">Next: Chapter Three · Beneath the Palace</div><p>The rescued prisoners and Cinderbank families are traveling with Nell, Orrin and Kit.</p><p>Tomas is alive at the palace engine works. Your medical-train clearance opens a route to him.</p>',
      returnLabel:'Return to the siding',
    },
  },
  'chapter-three':{
    title:'Chapter Three',maps:mapIds(CHAPTER_THREE_MAPS),restoreAllMaps:true,
    entry:{from:'chapter-two',boundary:THIRD_CHAPTER,loading:'Loading the capital…',begin:beginChapterThree},
    story:{journal:three.JOURNAL,objective:three.objective,resume:resumeChapterThree,interact:interactChapterThree},
    ending:{
      html:'<div class="chapter-name">Next: Chapter Four · A Light on the Water</div><p>Tomas is safe aboard the medical train. The rescued passengers escaped with you. The extraction feeds are shut.</p><p>The emperor has entered the vessel. The capital hangs above the valley, and time is failing beyond it.</p>',
      returnLabel:'Return to the platform',
    },
  },
  'chapter-four':{
    title:'Chapter Four',maps:mapIds(CHAPTER_FOUR_MAPS),restoreAllMaps:true,
    entry:{from:'chapter-three',boundary:FOURTH_CHAPTER,loading:'Loading the railway refuge…',begin:beginChapterFour},
    story:{journal:four.JOURNAL,objective:four.objective,resume:resumeChapterFour,interact:interactChapterFour},
    ending:{
      html:'<div class="chapter-name">Next: Chapter Five · Taking the World Back</div><p>The harbor is open. The coast is moving again, and the three anchors are marked.</p><p>Tomas is safe at the railway refuge, organizing messages between the freed communities. Nell has chosen to lead the counterattack.</p><p>A survey ship is waiting at the western airfield.</p>',
      returnLabel:'Return to the refuge',
    },
  },
  'chapter-five':{
    title:'Chapter Five',maps:mapIds(CHAPTER_FIVE_MAPS),restoreAllMaps:true,
    entry:{from:'chapter-four',boundary:FIFTH_CHAPTER,loading:'Loading the western airfield…',begin:beginChapterFive},
    story:{journal:five.JOURNAL,objective:five.objective,resume:resumeChapterFive,interact:interactChapterFive},
    ending:{
      html:'<div class="chapter-name">Next: Chapter Six · The Emperor’s Last Day</div><p>The three anchors are disconnected. The Benefactor has destroyed Alban and his fleet. Its hunters have been driven off the survey ship. Nell is resting aboard, too ill to fight.</p><p>Kit and the others are holding for the capital’s outer mooring. The Emperor still controls the conduit.</p>',
      returnLabel:'Return to the flight deck',exportLabel:'Export capital departure save',
    },
  },
  'chapter-six':{
    title:'Chapter Six',maps:mapIds(CHAPTER_SIX_MAPS),restoreAllMaps:true,
    entry:{from:'chapter-five',boundary:SIXTH_CHAPTER,loading:'Loading the outer mooring…',begin:beginChapterSix},
    story:{journal:six.JOURNAL,objective:six.objective,resume:resumeChapterSix,interact:interactChapterSix},
    ending:{html:'<p>The western seal is broken. The northern expedition lies ahead.</p>',returnLabel:'Return to the outer mooring'},
  },
};

export function nextChapter(state:Pick<GameState,'chapter'|'boundary'>){
  return Object.values(CHAPTERS).find(chapter=>chapter.entry?.from===state.chapter&&chapter.entry.boundary===state.boundary);
}
export function mapsForRestore(state:Pick<GameState,'chapter'|'location'>):readonly MapId[]{
  const chapter=CHAPTERS[state.chapter];
  return chapter.restoreAllMaps?chapter.maps:[state.location.map];
}
