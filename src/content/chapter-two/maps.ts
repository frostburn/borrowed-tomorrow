import type { MapData } from '../maps';
/** Floor-aligned rectangles in native 24-pixel tiles. Scenery stays at 1:1. */
export const CHAPTER_TWO_MAPS = {
  coast: { id: 'coast', name: 'Iron Coast exchange', subtitle: 'A barred coach. A loading gate. The sea beyond the cranes.', width: 1536, height: 1024,
    solid: [[0,0,64,14],[0,14,7,20],[57,14,7,28],[0,34,64,8],[7,14,8,3],[18,14,8,1],[51,14,6,3],[7,26,3,8],[52,29,5,5]], objects: [
      { id: 'kit-contact', x: 28, y: 21, label: 'Kit · the loading gate', sprite: 'kit', hiddenFlag: 'kitJoined' },
      { id: 'loading-gate', x: 23, y: 17, label: 'Loading gate · armored guardian', sign: true, hiddenFlag: 'trainRaidWon' },
      { id: 'signal-walk', x: 48, y: 17, label: 'Signal walk · ranged crows', sign: true, hiddenFlag: 'trainRaidWon' },
      { id: 'prison-coach', x: 26, y: 14, label: 'Open the barred coach', sign: true, doneFlag: 'prisonersFreed', hitArea: { x: 24, y: 8, width: 4, height: 7 } },
      { id: 'coast-ward', x: 14, y: 24, label: 'West · Celia’s ward', sign: true },
      { id: 'coast-engine', x: 26, y: 31, label: 'Orrin’s engine · coal siding', sign: true },
    ] },
  infirmary: { id: 'infirmary', name: 'Iron Coast · the railway ward', subtitle: 'Warm beds for the prisoners. A route for the medical train.', width: 1536, height: 1024,
    solid: [[0,0,64,17],[0,17,9,25],[56,17,8,25],[9,28,8,14],[17,34,39,8],[43,18,13,3],[47,21,9,3],[40,30,16,4],[9,17,13,2]], objects: [
      { id: 'ward-rest', x: 31, y: 19, label: 'Celia · rest', sprite: 'celia', spriteHiddenFlag: 'celiaJoined', doneFlag: 'wardSeen' },
      { id: 'ward-kit', x: 35, y: 23, label: 'Kit · the waiting families', sign: true },
      { id: 'ward-clearance', x: 28, y: 23, label: 'Medical-train clearance · capital', sign: true },
      { id: 'ward-coast', x: 20, y: 22, label: 'Prison-train exchange', sign: true },
      { id: 'ward-siding', x: 43, y: 24, label: 'Cinderbank siding · collect the families', sign: true },
    ] },
  cinderbank: { id: 'cinderbank', name: 'Cinderbank siding', subtitle: 'The medical train waits beside the mining settlement.', width: 1536, height: 1024,
    solid: [[0,0,64,14],[0,14,8,28],[59,14,5,28],[8,14,5,7],[8,21,8,5],[8,30,13,12],[50,14,9,9],[54,23,5,9],[21,35,38,7],[43,30,11,5],[15,27,5,4]], objects: [
      { id: 'siding-collector', x: 41, y: 19, label: 'Coal shed · collector guard', sprite: 'guardian', hiddenFlag: 'coastCollectorWon' },
      { id: 'siding-release', x: 41, y: 19, label: 'The collector casing', sign: true, requiredFlag: 'coastCollectorWon', doneFlag: 'evacuationReady' },
      { id: 'siding-alban', x: 48, y: 23, label: 'Alban · the far crossing', sprite: 'alban', hiddenFlag: 'recaptureWon', requiredFlag: 'evacuationReady' },
      { id: 'siding-coaches', x: 28, y: 16, label: 'Medical coaches · rescued prisoners', sign: true },
      { id: 'capital-engine', x: 51, y: 27, label: 'Board the engine · capital line', sign: true },
      { id: 'siding-ward', x: 24, y: 24, label: 'Return to the ward', sign: true },
    ] },
} satisfies Record<string, MapData>;
