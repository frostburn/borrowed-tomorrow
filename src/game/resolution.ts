/** Stable game-space layout; sprite sources may be filtered to their authored display size. */
export const DESKTOP_WIDTH = 1024;
export const DISPLAY_HEIGHT = 768;
export const NARROW_WIDTH = 384;
export const WORLD_VIEW_WIDTH = 1008;
export const WORLD_VIEW_HEIGHT = 480;
export const NARROW_VIEW_HEIGHT = 456;
export function narrowScreen() { return window.innerWidth < DESKTOP_WIDTH; }
export function displayWidth() { return narrowScreen() ? Math.min(NARROW_WIDTH, window.innerWidth) : DESKTOP_WIDTH; }
export function worldView() {
  return { width:narrowScreen()?displayWidth()-16:WORLD_VIEW_WIDTH, height:narrowScreen()?NARROW_VIEW_HEIGHT:WORLD_VIEW_HEIGHT };
}
