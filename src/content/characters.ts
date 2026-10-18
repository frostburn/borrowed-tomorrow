/** One identity per named character; reused art keeps its original identity. */
export const CHARACTERS = {
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
export const NPC_SPRITES = ['tomas', 'alban', 'tilda', 'elspeth'] as const;
