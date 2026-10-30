import {expect,it} from 'vitest';
import {skillMessages,skillCards} from '../src/game/skills';
import {newSkillBook,skillsAtLevel} from '../src/rules/skills';
import {newGame,gainExperience,recruitOrrin} from '../src/rules/state';
import {chapterFiveStart} from '../src/dev/canonical-saves';

it('shows read-only automatic milestones, current effects and mastery without point or purchase prompts',()=>{
 const cards=skillCards('nell',2,skillsAtLevel('nell',2),String);
 expect(cards).toContain('Automatic progression');expect(cards).toContain('Next improvement at character level 3.');expect(cards).toContain('Rank 2 at level 3');expect(cards).toContain('Learns at level 4');
 expect(cards).not.toContain('point');expect(cards).not.toContain('data-skill=');expect(cards).not.toContain('<button');
 const mastered=skillCards('celia',15,skillsAtLevel('celia',15),String);expect(mastered).toContain('All skills mastered');expect(mastered).not.toContain('Next improvement');
});

it('names newly learned and upgraded skills, includes reserves, and does not spoil unrecruited companions',()=>{
 const s=newGame();recruitOrrin(s);s.activeParty=['nell'];gainExperience(s,50);
 expect(skillMessages(s,1)).toEqual(['Nell learns Mend.','Orrin learns Rivet shot.']);
 gainExperience(s,80);expect(skillMessages(s,2)).toEqual(['Nell’s Lantern burst reaches rank 2.','Orrin learns Safety guard.']);expect(skillMessages(s,3)).toEqual([]);
});

it('does not announce growth for ill or permanently lost Nell',()=>{
 const s=chapterFiveStart();s.flags.nellIll=true;gainExperience(s,3000);
 expect(skillMessages(s,9).some(m=>m.startsWith('Nell'))).toBe(false);
 s.flags.nellRecovered=true;expect(skillMessages(s,9).some(m=>m.startsWith('Nell'))).toBe(true);
 s.flags.nellLost=true;expect(skillMessages(s,9).some(m=>m.startsWith('Nell'))).toBe(false);
});

it('shows combinations only with known partners and both prerequisite solo skills',()=>{
 const early=skillCards('nell',6,skillsAtLevel('nell',6),String,['nell','orrin','kit']);
 expect(early).not.toContain('Team:');expect(early).not.toContain('Celia');expect(early).not.toContain('Petra');
 const ready=skillCards('nell',7,skillsAtLevel('nell',7),String,['nell','orrin','kit']);
 expect(ready).toContain('Prism lance');expect(ready).toContain('Lantern volley');
 const unequal=newSkillBook(7);unequal.kit=skillsAtLevel('kit',6);
 const cards=skillCards('nell',7,unequal.nell,String,['nell','kit'],{},unequal);expect(cards).not.toContain('Lantern volley');
});
