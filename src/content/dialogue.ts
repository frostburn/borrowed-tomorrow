import { portraitAsset, speakerPortrait } from './characters';
import type { Cinematic, Shot } from './cinematics';

export interface Line { who: string; text: string; portrait?: string; shot?: Shot }
export interface Choice { label: string; action: () => void }
export interface Dialogue { lines: Line[]; choices?: Choice[]; done?: () => void; scene?: Cinematic }
export const SAY = (who: string, text: string, portrait?: string): Line => ({
  who, text, portrait: portrait ? portraitAsset(portrait) : speakerPortrait(who),
});
