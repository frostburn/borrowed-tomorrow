import {expect,it} from 'vitest';
import {FrameCadence} from '../src/game/frame-cadence';

it.each([60,90,120,144])('keeps 30 presentations per second on a %iHz display',refresh=>{
  const clock=new FrameCadence(),frames:number[]=[];
  for(let i=0;i<=refresh*2;i++){
    // Browser timestamps can be rounded slightly below a nominal frame boundary.
    const time=i*1000/refresh+(i%3-1)*.08;
    if(clock.due(time))frames.push(time);
  }
  expect(frames).toHaveLength(61);
  const intervals=frames.slice(1).map((time,i)=>time-frames[i]);
  expect(Math.min(...intervals)).toBeGreaterThanOrEqual(Math.floor(refresh/30)*1000/refresh-.2);
  expect(Math.max(...intervals)).toBeLessThanOrEqual(Math.ceil(refresh/30)*1000/refresh+.2);
});

it('skips missed slots without slowing the clock or rendering catch-up bursts',()=>{
  const clock=new FrameCadence();
  expect(clock.due(0)).toBe(true);
  expect(clock.due(200)).toBe(true);
  expect(clock.due(201)).toBe(false);
  expect(clock.due(233.333)).toBe(true);
  expect(clock.due(30000)).toBe(true);
  expect(clock.due(30001)).toBe(false);
  expect(clock.due(30033.333)).toBe(true);
});

it('starts immediately after a pause without carrying the previous animation phase',()=>{
  const clock=new FrameCadence();
  expect(clock.due(0)).toBe(true);
  expect(clock.due(16)).toBe(false);
  clock.reset();
  expect(clock.due(20)).toBe(true);
  expect(clock.due(36)).toBe(false);
  expect(clock.due(53.333)).toBe(true);
});
