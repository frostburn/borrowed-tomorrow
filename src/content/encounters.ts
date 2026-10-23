import { ENCOUNTERS as ONE } from './chapter-one/encounters';
import { ENCOUNTERS as TWO } from './chapter-two/encounters';
import { ENCOUNTERS as THREE } from './chapter-three/encounters';
import { ENCOUNTERS as FOUR } from './chapter-four/encounters';
import { ENCOUNTERS as SIX } from './chapter-six/encounters';
import { ENCOUNTERS as FIVE } from './chapter-five/encounters';

/** Campaign encounter registry; the combat engine consumes these authored definitions. */
export const ENCOUNTERS={...ONE,...TWO,...THREE,...FOUR,...FIVE,...SIX};
