/** Creator name/license come from LICENSE; tools and the writing-guide attribution
 * come from package.json / README. Keep names factual rather than inventing roles. */
export const ENDING_CREDITS=[
 {role:'A game by',lines:['Lumi Pakkanen']},
 {role:'Development collaborator',lines:['OpenAI Codex']},
 {role:'Music',lines:['Original procedural score','31-tone equal temperament']},
 {role:'Built with',lines:['Phaser','Vite and TypeScript']},
 {role:'Writing guidance',lines:['Stephen D. Turner','deslop (MIT)']},
 {role:'Special thanks',lines:['Playtesters and reviewers']},
 {role:'Thank you for playing',lines:['Borrowed Tomorrow','(c) 2026 Lumi Pakkanen','MIT licensed']},
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
