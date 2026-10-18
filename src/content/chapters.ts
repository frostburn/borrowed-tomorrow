import mapSources from '../../assets/maps/manifest.json' with { type: 'json' };
/** A source checkpoint can precede its large art pack. Never offer an unavailable departure. */
export const CHAPTER_TWO_AVAILABLE = Object.hasOwn(mapSources, 'coast');

export const CHAPTER_THREE_AVAILABLE = ['northglass','relayhall','conduit'].every(id=>Object.hasOwn(mapSources,id));
