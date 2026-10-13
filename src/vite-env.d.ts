/// <reference types="vite/client" />
import type { GameState } from './rules/state';
import type { Battle } from './rules/combat';
declare global {
  interface Window {
    borrowedTomorrow: { inspect: () => { mode: string; state: GameState; battle: (Omit<Battle,'obstacles'> & { obstacles: string[] }) | null } };
  }
}
