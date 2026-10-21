import mapSources from '../../assets/maps/manifest.json' with { type: 'json' };
/** Chapters One–Three ship their scene assets with the source. */
export const CHAPTER_TWO_AVAILABLE = true;

export const CHAPTER_THREE_AVAILABLE = true;
export const CHAPTER_FOUR_AVAILABLE = ['infirmary','sluice','sanctuary'].every(id=>Object.hasOwn(mapSources,id));
