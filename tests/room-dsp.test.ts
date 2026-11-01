import {expect,it} from 'vitest';
import {ROOMS} from '../src/content/rooms';
import {reflectionCoefficients} from '../src/game/room-dsp';

function response(coefficients:ReturnType<typeof reflectionCoefficients>,radians:number){
 const polynomial=(values:number[])=>values.reduce(([re,im],value,i)=>[re+value*Math.cos(radians*i),im-value*Math.sin(radians*i)],[0,0]);
 const [nr,ni]=polynomial(coefficients.feedforward),[dr,di]=polynomial(coefficients.feedback),den=dr*dr+di*di;
 return {re:(nr*dr+ni*di)/den,im:(ni*dr-nr*di)/den};
}

for(const rate of [44100,48000]){
 it(`recovers the lossless branch and preserves legacy absorption at ${rate} Hz`,()=>{
  const unity=reflectionCoefficients(rate,1800,0),legacy=reflectionCoefficients(rate,1800,1);
  const pole=Math.exp(-2*Math.PI*1800/rate);
  expect(legacy.feedforward).toEqual([(1-pole)**2]);
  expect(legacy.feedback).toEqual([1,-2*pole,pole*pole]);
  for(const radians of [0,.01,.1,.5,1,2,Math.PI]){
   expect(response(unity,radians).re).toBeCloseTo(1,12);
   expect(response(unity,radians).im).toBeCloseTo(0,12);
  }
 });

 it(`keeps Domain reflection loss passive with unity DC and a mild treble shelf at ${rate} Hz`,()=>{
  const {cutoff,amount}=ROOMS.domain.reflection,coefficients=reflectionCoefficients(rate,cutoff,amount);
  expect(response(coefficients,0).re).toBeCloseTo(1,12);
  for(let i=0;i<=256;i++){
   const {re,im}=response(coefficients,Math.PI*i/256),magnitude=Math.hypot(re,im);
   // A passive delayed branch cannot add energy or destabilize feedback.
   expect(magnitude).toBeLessThanOrEqual(1+1e-12);
   // Six reflections must not erase the midrange as full absorption did.
   expect(magnitude).toBeGreaterThan(.8);
  }
 });
}
