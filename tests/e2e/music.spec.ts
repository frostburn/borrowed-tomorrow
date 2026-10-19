import { test, expect, type Page } from '@playwright/test';
import { brokenCheckpoint } from '../support/progress';
import { approach, importSave } from './navigation';
import { capture, inspect } from './controls';

test('piano notes decay while sustained arrangements release cleanly at a transition', async ({ page }) => {
  await page.goto('/');
  const levels = await page.evaluate(async () => {
    // @ts-expect-error Vite serves the actual live instrument rack.
    const { Synth }: typeof import('../../src/game/synth') = await import('/src/game/synth.ts');
    const rms = (b: AudioBuffer, from: number, to: number) => {
      const data = b.getChannelData(0).slice(Math.floor(from * b.sampleRate), Math.floor(to * b.sampleRate));
      return Math.sqrt(data.reduce((sum, n) => sum + n * n, 0) / data.length);
    };
    const piano = new OfflineAudioContext(2, 3 * 22050, 22050), keys = new Synth(piano, piano.destination);
    keys.note('keys', 72, .03, 2, .2);
    const struck = await piano.startRendering();
    const held = new OfflineAudioContext(2, 3 * 22050, 22050), pedal = new Synth(held, held.destination);
    pedal.note('strings', 57, .03, 7, .15);
    pedal.release(1);
    // A note in the incoming arrangement must survive the old voices' release.
    pedal.note('keys', 72, 1.5, .7, .2);
    const transition = await held.startRendering();
    return { attack: rms(struck, .05, .18), decay: rms(struck, 1.4, 1.7), held: rms(transition, .5, .8), silence: rms(transition, 1.15, 1.4), incoming: rms(transition, 1.52, 1.65) };
  });
  expect(levels.decay).toBeLessThan(levels.attack * .25);
  expect(levels.held).toBeGreaterThan(.01);
  expect(levels.silence).toBeLessThan(.00001);
  expect(levels.incoming).toBeGreaterThan(.01);
});

async function music(page: Page) {
  return page.evaluate(() => (window as unknown as { musicStatus: () => { mode: string; pending: string; enabled: boolean; running: boolean } }).musicStatus());
}
for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]] as const) {
  test(`Chapter Four routes the live warden music and Sound control on ${device}`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize(viewport); await page.goto('/');
    await expect(page).toHaveTitle(/Borrowed Tomorrow/);
    await page.evaluate(async () => {
      // Observe the real Audio instance without exposing a production debug API.
      // @ts-expect-error Vite serves this browser-only module.
      const { Audio }: typeof import('../../src/game/audio') = await import('/src/game/audio.ts');
      const original = Audio.prototype.setMode;
      Audio.prototype.setMode = function (mode) {
        const audio = this as unknown as { mode: string; pending: string; enabled: boolean; context?: AudioContext };
        (window as unknown as { musicStatus: () => unknown }).musicStatus = () => ({ mode: audio.mode, pending: audio.pending, enabled: audio.enabled, running: audio.context?.state === 'running' });
        original.call(this, mode);
      };
    });
    await importSave(page, brokenCheckpoint('sanctuaryEntered'));
    expect((await music(page)).enabled).toBe(false);
    await page.locator('#sound-button').click();
    await expect.poll(() => music(page)).toMatchObject({ mode: 'sanctuary', enabled: true, running: true });
    await approach(page, 'sanctuary-warden');
    await expect.poll(async () => (await inspect(page)).mode).toBe('battle');
    await expect.poll(async () => (await music(page)).mode, { timeout: 6000 }).toBe('four-warden');
    await capture(page, `warden-music-${device}`);
    await page.getByRole('button', { name: 'Win battle', exact: true }).click();
    await page.getByRole('button', { name: 'Continue the journey', exact: true }).click();
    await expect.poll(async () => (await music(page)).mode, { timeout: 6000 }).toBe('sanctuary');
    await page.locator('#sound-button').click(); expect((await music(page)).enabled).toBe(false);
    await page.locator('#sound-button').click(); expect((await music(page)).enabled).toBe(true);
    expect(errors).toEqual([]);
  });
}
