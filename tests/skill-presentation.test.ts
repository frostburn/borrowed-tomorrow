import {expect,it} from 'vitest';
import {availableSkillPoints,skillCards} from '../src/game/skills';
import {presetSkills} from '../src/rules/skills';
import {chapterFiveStart,chapterSevenRefugeStart,chapterSixStart} from '../src/dev/canonical-saves';

it('explains banked points and mastery in both campaign and workshop cards',()=>{
 const banked=skillCards('nell',9,presetSkills('nell',9),String);
 expect(banked).toContain('1 banked point');expect(banked).toContain('Next upgrade available at character level 10.');
 expect(banked).not.toContain('All skills mastered');
 const mastered=skillCards('celia',15,presetSkills('celia',15),String);
 expect(mastered).toContain('All skills mastered');expect(mastered).not.toContain('upgrade point');expect(mastered).not.toContain('Next upgrade');
 const fresh=skillCards('nell',2,presetSkills('nell',1),String);
 expect(fresh).toContain('1 upgrade point');expect(fresh).not.toContain('banked point');
});

it('counts only spendable points for prompts, including reserves but excluding unavailable heroes',()=>{
 const s=chapterFiveStart();expect(availableSkillPoints(s)).toBe(0);
 s.skills.orrin.rivet=1;expect(s.activeParty).not.toContain('celia');
 s.skills.celia.celestialbolt=2;expect(availableSkillPoints(s)).toBe(2);
 const later=chapterSevenRefugeStart();expect(availableSkillPoints(later)).toBe(0);
 const ill=chapterSixStart();ill.skills.nell.mend=0;
 expect(availableSkillPoints(ill)).toBe(0);
 ill.skills.orrin.rivet=1;expect(availableSkillPoints(ill)).toBe(1);
});
