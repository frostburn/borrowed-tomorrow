import {expressionAsset} from './portrait-expressions';
import { CIVILIAN_SPRITES } from './civilians';
/** Vector-authored railway cast, shared wherever those people reappear. */
export const VECTOR_ACTORS = ['benefactor','edric','signe','egil','winter-dragon','dragon','ines','tavi','namar-watch','samira','sahir','amal','serpent','herald','glasswing','iven','sera','teren','ward-engine','ward-reflector','aurel','enna','dawn-soldier','dawn-gunner','alda','hester','durn','furnace-carrier','nell','orrin','master','clerk','tomas','alban','tilda','elspeth','hound','crow','guardian','rock','kit','petra','celia','dena','inspector','emperor','relay-keeper','boiler-keeper','bram','sluice-keeper',...CIVILIAN_SPRITES] as const;
export const vectorAsset = (name:string) => expressionAsset(name)||VECTOR_ACTORS.some(id=>name===id||name.startsWith(`${id}-`)||name===`portrait-${id}`||name.startsWith(`animation/${id}-`));
export const artPath = (name:string) => vectorAsset(name)?`art/vector/${name}.svg`:`art/${name}.png`;
