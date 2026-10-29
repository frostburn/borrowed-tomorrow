import type {MusicMode} from '../game/score';

export interface SoundtrackTrack {mode:MusicMode;title:string;group:string}

export const SOUNDTRACK: readonly SoundtrackTrack[] = [
 {mode:'hollowsill',title:'Under the Hanging Sea',group:'7'},
 {mode:'takenwater',title:'The Bell’s Second Note',group:'7'},
 {mode:'firstfield',title:'The First Good Year',group:'7'},
 {mode:'quietward',title:'You May Leave',group:'7'},
 {mode:'seasonstreet',title:'Snow on the Postal Stair',group:'7'},
 {mode:'lastrefuge',title:'The Unwritten Hour',group:'7'},
 {mode:'sunthrone',title:'The Empty Channels',group:'7'},
 {mode:'homecoming',title:'One Train without Us',group:'7'},
 {mode:'seaholiday',title:'Until Evening · good ending credits',group:'7'},
 {mode:'domain-battle',title:'The Road We Know',group:'7'},
 {mode:'harvest-battle',title:'The Uncut Row',group:'7'},
 {mode:'hospice-battle',title:'Discharge the Patient',group:'7'},
 {mode:'seasons-battle',title:'The Winter Kept Here',group:'7'},
 {mode:'benefactor',title:'The God Who Lent Tomorrow',group:'7'},
 {mode:'hollow-sun',title:'The Broken Meridian',group:'7'},
 {mode:'unborrowed',title:'Tomorrow',group:'7'},

  {mode:'stillcity',title:'The Procession Never Ends',group:'6'},{mode:'lastpalace',title:'A Place at the Table',group:'6'},
  {mode:'lastmorning',title:'Larkspur festival · remembered morning',group:'6'}, {mode:'crown',title:'A Place at the Table · crown',group:'6'},
  {mode:'capital-battle',title:'Open the Patient Stair',group:'6'},{mode:'emperor',title:'The Emperor’s Last Day',group:'6'},
  {mode:'lightbearer',title:'The Hand on the Shutter',group:'6'},{mode:'capital-return',title:'The City Comes Down',group:'6'},
  {mode:'laststation',title:'The Empty Seat · bad ending credits',group:'6'},
  {mode:'bellharbor',title:'Skeld · Answering Bells',group:'6'}, {mode:'frostwatch',title:'The Covered Road',group:'6'},
  {mode:'glacier',title:'The Fleet beneath the Ice',group:'6'}, {mode:'wintershrine',title:'A Bell for the Outer Marker',group:'6'},
  {mode:'north-battle',title:'Skeld · Open the Mountain',group:'6'}, {mode:'winter-dragon',title:'Wings over the Winter Bell',group:'6'},
  {mode:'riverhaven',title:'Iria · The Next Launch',group:'6'}, {mode:'canopy',title:'Under the Green Signal',group:'6'},
  {mode:'rainhouse',title:'The Waiting Basin',group:'6'}, {mode:'rainhouse-rest',title:'A Seat by the River',group:'6'},
  {mode:'river-battle',title:'Iria · Open the Waterway',group:'6'}, {mode:'rain-warden',title:'Wings on the Landing',group:'6'},
  {mode:'outermooring',title:'Two Seals at the Gate',group:'6'}, {mode:'namar',title:'Namar · Letters on the Water',group:'6'},
  {mode:'sunpalace',title:'The Queen’s Half of the Pact',group:'6'}, {mode:'skywalk',title:'Above the Awnings',group:'6'},
  {mode:'observatory',title:'The Bronze Sky',group:'6'}, {mode:'desert-battle',title:'Namar · The Postal Stair',group:'6'},
  {mode:'sun-serpent',title:'Coils around the Sun',group:'6'},
  {mode:'windmere',title:'Windmere · The Garden Walk',group:'5'}, {mode:'dispensary',title:'Beds beside the Water Lift',group:'5'}, {mode:'mirrorward',title:'The Mirrored Ward',group:'5'},
  {mode:'wind-battle',title:'Windmere · Keep the Ward Open',group:'5'}, {mode:'wind-engine',title:'The Light We Keep',group:'5'},
  {mode:'airship',title:'Above the Railway',group:'5'}, {mode:'airfield',title:'The Western Mooring',group:'5'},
  {mode:'hammerplain',title:'The Next Shift',group:'5'}, {mode:'coolingworks',title:'The Cooling Race',group:'5'}, {mode:'anchorforge',title:'Under the Gantry',group:'5'},
  {mode:'five-battle',title:'Hammerplain · Hold the Floor',group:'5'}, {mode:'five-furnace',title:'The Pouring Lane',group:'5'},
  {mode:'dawnwatch',title:'Dawnwatch · The Open Gate',group:'5'}, {mode:'watchbarracks',title:'The Gun Terraces',group:'5'}, {mode:'signalwall',title:'The Town Wheel',group:'5'},
  {mode:'dawn-battle',title:'Dawnwatch · Across the Terraces',group:'5'}, {mode:'dawn-commander',title:'Orders Worth Refusing',group:'5'}, {mode:'observation',title:'The Empty Cabin',group:'5'},
  {mode:'flagship',title:'Iron Above the Clouds',group:'5'}, {mode:'claim',title:'The Sky Answers',group:'5'},
  {mode:'refuge',title:'A Place to Return',group:'4'}, {mode:'breakwater',title:'The Sea Gate',group:'4'},
  {mode:'sanctuary',title:'Under the Hollow Sun',group:'4'}, {mode:'four-battle',title:'Hold the Line',group:'4'}, {mode:'four-warden',title:"The Emperor's Order",group:'4'},
  {mode:'station',title:'Larkspur festival',group:'1'}, {mode:'yard',title:"Orrin's workshop",group:'1'}, {mode:'crossing',title:"Orrin's workshop — full steam",group:'1'}, {mode:'tunnel',title:'After the raid / pass',group:'1'},
  {mode:'rillbridge',title:'Rillbridge freed',group:'1'}, {mode:'battle',title:'Leaving Home battle',group:'1'}, {mode:'inspector',title:'Captain Alban',group:'1'}, {mode:'ending',title:'Departure',group:'1'},
  {mode:'coast',title:'Iron Coast',group:'2'}, {mode:'coast-battle',title:'Iron Coast · train raid',group:'2'}, {mode:'cinderbank',title:'Cinderbank siding',group:'2'}, {mode:'infirmary',title:'Railway ward',group:'2'}, {mode:'shunting',title:'Cinderbank · loading walk',group:'2'}, {mode:'petra-battle',title:'Petra · the last crossing',group:'2'},
  {mode:'northglass',title:'Capital medical siding',group:'3'}, {mode:'relayhall',title:'Control gallery',group:'3'}, {mode:'conduit',title:'Vessel chamber',group:'3'}, {mode:'switching',title:'Beneath the Palace battle',group:'3'},
  {mode:'sluice',title:'Retained sluice',group:'Library'}, {mode:'flood',title:'Retained flood battle',group:'Library'},
];

export const SOUNDTRACK_CHAPTERS=[
 {id:'1',label:'Chapter One · Leaving Home'},
 {id:'2',label:'Chapter Two · Prison Trains'},
 {id:'3',label:'Chapter Three · Beneath the Palace'},
 {id:'4',label:'Chapter Four · A Light on the Water'},
 {id:'5',label:'Chapter Five · Taking the World Back'},
 {id:'6',label:'Chapter Six · The Emperor’s Last Day'},
 {id:'7',label:'Chapter Seven · The God Who Lent Tomorrow'},
 {id:'Library',label:'Retained themes'},
] as const;
const sections:Record<string,readonly {title:string;modes:readonly MusicMode[]}[]>={
 '5':[
  {title:'The shared voyage',modes:['airfield','airship','observation']},
  {title:'Act I · Hammerplain',modes:['hammerplain','coolingworks','anchorforge','five-battle','five-furnace']},
  {title:'Act II · Dawnwatch',modes:['dawnwatch','watchbarracks','signalwall','dawn-battle','dawn-commander']},
  {title:'Act III · Windmere',modes:['windmere','dispensary','mirrorward','wind-battle','wind-engine']},
  {title:'Act IV · The flagship',modes:['flagship','claim']},
 ],
 '6':[
  {title:'The sealed capital',modes:['outermooring']},
  {title:'Namar · Desert expedition',modes:['namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent']},
  {title:'Iria · River expedition',modes:['riverhaven','canopy','rainhouse','rainhouse-rest','river-battle','rain-warden']},
  {title:'Skeld · Northern expedition',modes:['bellharbor','frostwatch','glacier','wintershrine','north-battle','winter-dragon']},
  {title:'The capital assault',modes:['stillcity','lastpalace','lastmorning','crown','capital-battle','emperor','lightbearer','capital-return','laststation']},
 ],
};
export function soundtrackSections(chapter:string):{title:string;tracks:readonly SoundtrackTrack[]}[]{
 const acts=sections[chapter];
 if(acts)return acts.map(act=>({title:act.title,tracks:act.modes.map(mode=>SOUNDTRACK.find(track=>track.mode===mode)!)}));
 return [{title:'',tracks:SOUNDTRACK.filter(track=>track.group===chapter)}];
}
export const SOUNDTRACK_ORDER=SOUNDTRACK_CHAPTERS.flatMap(chapter=>soundtrackSections(chapter.id).flatMap(section=>section.tracks));
