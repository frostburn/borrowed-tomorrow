import {it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {artPath} from '../src/content/art-assets';
import {SAY,STAGED} from '../src/content/dialogue';
import {expressivePortrait,portraitExpressions} from '../src/content/portrait-expressions';
import {opening,raid,recruit} from '../src/content/scenes';
import {rest} from '../src/content/chapter-six/jungle/scenes';
import {refusal} from '../src/content/chapter-three/scenes';

it('resolves only authored expressions, with neutral fallback for other portraits and narration',()=>{
 for(const hero of ['nell','orrin','kit','celia','petra','tomas'])for(const expression of portraitExpressions(`portrait-${hero}`)){
  const asset=expressivePortrait(`portrait-${hero}`,expression)!;expect(artPath(asset)).toMatch(/\.svg$/);expect(existsSync(`public/${artPath(asset)}`)).toBe(true);
 }
 expect(expressivePortrait('portrait-alban','angry')).toBe('portrait-alban');expect(expressivePortrait(undefined,'happy')).toBeUndefined();
 expect(expressivePortrait('portrait-celia','bashful')).toBe('portrait-celia');
 expect(SAY('Nell','A line.').expression).toBeUndefined();expect(SAY('Narrator','A line.').portrait).toBeUndefined();
 expect(SAY('Alias','A line.','master').portrait).toBe('portrait-master');
 const line=STAGED('Nell','A line.',{expression:'worried',focus:{x:2,y:3},duration:500});
 expect(line).toMatchObject({portrait:'portrait-nell',expression:'worried',shot:{focus:{x:2,y:3},duration:500}});expect(line.shot).not.toHaveProperty('expression');
});
it('uses explicit, local emotional cues without retaining one expression for the next line',()=>{
 expect(opening().lines.find(l=>l.who==='Nell')?.expression).toBe('happy');
 expect(raid().lines.find(l=>l.text==='Ansel!')?.expression).toBe('surprised');
 const tomas=raid().lines.filter(l=>l.who==='Tomas');expect(tomas.map(l=>l.expression)).toEqual(['happy','worried','angry','worried']);
 expect(recruit().lines.find(l=>l.who==='Nell')?.expression).toBe('sad');
 expect(refusal().lines.find(l=>l.text==='No. Let the passengers off.')?.expression).toBe('angry');
 const lines=rest().lines;
 expect(lines.find(l=>l.text.startsWith('You. I wanted'))?.expression).toBe('bashful');
 expect(lines.find(l=>l.text==='I was frightened.')?.expression).toBe('worried');
 expect(lines.find(l=>l.text.startsWith('So was I.'))?.expression).toBe('happy');
 expect(lines.find(l=>l.text==='My shoes?')?.expression).toBeUndefined();
});
