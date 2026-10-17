/** One identity per named character; texture names are independent of save IDs. */
export const CHARACTERS={
  nell:{name:'Nell',sprite:'nell',portrait:'portrait-nell'},
  orrin:{name:'Orrin',sprite:'orrin',portrait:'portrait-orrin'},
  mira:{name:'Mira',sprite:'mira',portrait:'portrait-mira'},
  ansel:{name:'Stationmaster Ansel',sprite:'master',portrait:'portrait-master'},
  iona:{name:'Iona',sprite:'clerk',portrait:'portrait-clerk'},
  bram:{name:'Bram',sprite:'bram',portrait:'portrait-bram'},
  tilda:{name:'Tilda',sprite:'tilda',portrait:'portrait-tilda'},
  elspeth:{name:'Elspeth',sprite:'elspeth',portrait:'portrait-elspeth'},
  dena:{name:'Dena',sprite:'dena',portrait:'portrait-dena'},
  ivo:{name:'Ivo',sprite:'ivo',portrait:'portrait-ivo'},
  celia:{name:'Celia',sprite:'celia',portrait:'portrait-celia'},
  inspector:{name:'The inspector',sprite:'inspector',portrait:'portrait-inspector'},
  'sluice-keeper':{name:'Sluice keeper',sprite:'sluice-keeper',portrait:'portrait-sluice-keeper'},
  'boiler-keeper':{name:'Boiler keeper',sprite:'boiler-keeper',portrait:'portrait-boiler-keeper'},
} as const;
export type CharacterId=keyof typeof CHARACTERS;
const speakers:Record<string,CharacterId>=Object.fromEntries(Object.entries(CHARACTERS).map(([id,c])=>[c.name,id as CharacterId]));
speakers.Stationmaster='ansel';speakers['Stationmaster Ansel']='ansel';
const legacy:Record<string,CharacterId>={master:'ansel',clerk:'iona'};
export function speakerPortrait(name:string):string|undefined{
  const id=Object.hasOwn(speakers,name)?speakers[name]:undefined;return id?CHARACTERS[id].portrait:undefined;
}
export function portraitAsset(id:string):string{
  const character=CHARACTERS[(legacy[id]??id) as CharacterId];return character?.portrait??id;
}
export const NPC_SPRITES=['bram','tilda','elspeth','dena','ivo','celia','sluice-keeper','boiler-keeper'] as const;
