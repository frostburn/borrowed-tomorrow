import type { GameState,MapId } from '../rules/state';
import type { Dialogue } from './dialogue';

/** Services a chapter can request from the game, without depending on Phaser. */
export interface StoryHost {
  state: GameState;
  talk(dialogue: Dialogue): void;
  commit(flag: string, entry?: string): void;
  refresh(): void;
  save(): void;
  checkpoint(slot:string):Promise<boolean>;
  travel(map: MapId, x: number, y: number): void;
  battle(id: string): void;
  shop(): void;
  boundary(): void;
  toast(message: string): void;
  endingMusic(): void;
}
