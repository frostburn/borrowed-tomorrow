import {expect,it} from 'vitest';
import {CROSSING_DURATION,crossingFrame,crossingShotStart} from '../src/content/crossing';

it('keeps the three-shot crossing short and reaches each cut exactly once',()=>{
 expect(CROSSING_DURATION).toBe(16000);
 expect(crossingFrame(4999).shot.id).toBe('pass');
 expect(crossingFrame(5000).shot.id).toBe('viaduct');
 expect(crossingFrame(11500).shot.id).toBe('exchange');
 expect(crossingFrame(15999).ended).toBe(false);
 expect(crossingFrame(16000).ended).toBe(true);
 expect([0,1,2].map(crossingShotStart)).toEqual([0,5000,11500]);
 expect(crossingFrame(-1).time).toBe(0);expect(crossingFrame(NaN).time).toBe(0);
});
