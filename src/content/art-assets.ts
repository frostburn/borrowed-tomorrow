import { CIVILIAN_SPRITES } from './civilians';
/** Vector-authored railway cast, shared wherever those people reappear. */
export const VECTOR_ACTORS = ['nell','orrin','master','clerk','tomas','alban','tilda','elspeth','hound','crow','guardian','rock','kit','petra','dena','inspector',...CIVILIAN_SPRITES] as const;
export const vectorAsset = (name:string) => VECTOR_ACTORS.some(id=>name===id||name.startsWith(`${id}-`)||name===`portrait-${id}`||name.startsWith(`animation/${id}-`));
export const artPath = (name:string) => vectorAsset(name)?`art/vector/${name}.svg`:`art/${name}.png`;
