/** Creative credits follow the project's requested author/director billing.
 * Additional musical passages credit Lumi's contributed bars; docs/music-direction.md
 * records examples. License ownership is retained, with tool acknowledgments last. */
export const ENDING_CREDITS=[
 {role:'Borrowed Tomorrow',lines:[],title:true},
 {role:'A game by',lines:['GPT-6.1 Sol']},
 {role:'Directed by',lines:['Lumi Pakkanen']},
 {role:'Game design',lines:['GPT-6.1 Sol','Lumi Pakkanen']},
 {role:'Combat system direction',lines:['Lumi Pakkanen']},
 {role:'Story concepts',lines:['Lumi Pakkanen']},
 {role:'Story and dialogue',lines:['GPT-6.1 Sol']},
 {role:'Programming',lines:['GPT-6.1 Sol']},
 {role:'Art direction',lines:['Lumi Pakkanen']},
 {role:'Character and environment art',lines:['GPT-6.1 Sol']},
 {role:'Animation',lines:['GPT-6.1 Sol']},
 {role:'Music',lines:['GPT-6.1 Sol']},
 {role:'Additional musical passages',lines:['Lumi Pakkanen']},
 {role:'Sound design',lines:['GPT-6.1 Sol']},
 {role:'Automated testing',lines:['GPT-6.1 Sol']},
 {role:'Playtesting',lines:['Lumi Pakkanen']},
 {role:'Copyright',lines:['(c) 2026 Lumi Pakkanen','MIT licensed']},
 {role:'Development tools',lines:['OpenAI Codex','Phaser','Vite and TypeScript'],tooling:true},
 {role:'Writing tools',lines:['deslop','Stephen D. Turner','MIT-licensed adaptation'],tooling:true},
] as const;
/** All offsets are within the shore shot. Arrival/standing finish before the roll. */
export const ENDING_SHORE_DURATION=60000;
export const ENDING_CREDITS_START=16000;
export const ENDING_CREDITS_END=52000;
export const ENDING_CREDIT_PAGE=(ENDING_CREDITS_END-ENDING_CREDITS_START)/ENDING_CREDITS.length;
export function endingCreditPage(milliseconds:number){
 const time=Number.isFinite(milliseconds)?milliseconds:0;
 return Math.max(0,Math.min(ENDING_CREDITS.length-1,Math.floor((time-ENDING_CREDITS_START)/ENDING_CREDIT_PAGE)));
}
