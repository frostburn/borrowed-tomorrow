/** One identity per named character; reused art keeps its original identity. */
export const CHARACTERS = {
  benefactor:{name:'Benefactor',sprite:'benefactor',portrait:'portrait-benefactor'},
  edric:{name:'King Edric',sprite:'edric',portrait:'portrait-edric'},
  signe:{name:'Signe',sprite:'signe',portrait:'portrait-signe'},
  egil:{name:'Egil',sprite:'egil',portrait:'portrait-egil'},
  ines:{name:'Ines',sprite:'ines',portrait:'portrait-ines'},
  tavi:{name:'Tavi',sprite:'tavi',portrait:'portrait-tavi'},
  samira:{name:'Queen Samira',sprite:'samira',portrait:'portrait-samira'},
  sahir:{name:'Minister Sahir',sprite:'sahir',portrait:'portrait-sahir'},
  amal:{name:'Amal',sprite:'amal',portrait:'portrait-amal'},
  iven:{name:'Director Iven',sprite:'iven',portrait:'portrait-iven'},
  sera:{name:'Sera',sprite:'sera',portrait:'portrait-sera'},
  teren:{name:'Teren',sprite:'teren',portrait:'portrait-teren'},
  wardEngine:{name:'Mirrored ward engine',sprite:'ward-engine',portrait:'portrait-ward-engine'},
  aurel:{name:'Commander Aurel',sprite:'aurel',portrait:'portrait-aurel'},
  enna:{name:'Enna',sprite:'enna',portrait:'portrait-enna'},
  alda:{name:'Alda',sprite:'alda',portrait:'portrait-alda'},
  hester:{name:'Hester',sprite:'hester',portrait:'portrait-hester'},
  durn:{name:'Superintendent Durn',sprite:'durn',portrait:'portrait-durn'},
  furnaceCarrier:{name:'Furnace carrier',sprite:'furnace-carrier',portrait:'portrait-furnace-carrier'},
  bram:{name:'Bram',sprite:'bram',portrait:'portrait-bram'},
  dena:{name:'Dena',sprite:'dena',portrait:'portrait-dena'},
  sanctuaryWarden:{name:'The Sanctuary Warden',sprite:'sluice-keeper',portrait:'portrait-sluice-keeper'},
  emperor: { name:'The Emperor',sprite:'emperor',portrait:'portrait-emperor' },
  engineWarden: { name:'The Engine Warden',sprite:'relay-keeper',portrait:'portrait-relay-keeper' },
  heartRegulator: { name:'Heart regulator',sprite:'boiler-keeper',portrait:'portrait-boiler-keeper' },
  nell: { name: 'Nell', sprite: 'nell', portrait: 'portrait-nell' },
  orrin: { name: 'Orrin', sprite: 'orrin', portrait: 'portrait-orrin' },
  kit: { name: 'Kit', sprite: 'kit', portrait: 'portrait-kit' },
  celia: { name: 'Celia', sprite: 'celia', portrait: 'portrait-celia' },
  petra: { name: 'Petra', sprite: 'petra', portrait: 'portrait-petra' },
  tomas: { name: 'Tomas', sprite: 'tomas', portrait: 'portrait-tomas' },
  alban: { name: 'Captain Alban', sprite: 'alban', portrait: 'portrait-alban' },
  ansel: { name: 'Stationmaster Ansel', sprite: 'master', portrait: 'portrait-master' },
  iona: { name: 'Iona', sprite: 'clerk', portrait: 'portrait-clerk' },
  tilda: { name: 'Tilda', sprite: 'tilda', portrait: 'portrait-tilda' },
  elspeth: { name: 'Elspeth', sprite: 'elspeth', portrait: 'portrait-elspeth' },
} as const;
export type CharacterId = keyof typeof CHARACTERS;
const speakers: Record<string, CharacterId> = Object.fromEntries(Object.entries(CHARACTERS).map(([id, c]) => [c.name, id as CharacterId]));
speakers.Stationmaster = 'ansel';
export function speakerPortrait(name: string): string | undefined {
  const id = Object.hasOwn(speakers, name) ? speakers[name] : undefined;
  return id ? CHARACTERS[id].portrait : undefined;
}
export function portraitAsset(id: string): string {
  const aliases: Record<string, CharacterId> = { master: 'ansel', clerk: 'iona' };
  return CHARACTERS[(aliases[id] ?? id) as CharacterId]?.portrait ?? id;
}
export const NPC_SPRITES = ['benefactor','edric','signe','egil','ines','tavi','namar-watch','samira','sahir','amal','iven','sera','teren','ward-engine','ward-reflector','aurel','enna','dawn-soldier','dawn-gunner','alda','hester','durn','furnace-carrier','bram','dena','sluice-keeper','emperor','relay-keeper','boiler-keeper','tomas', 'alban', 'tilda', 'elspeth', 'kit', 'celia', 'petra'] as const;
