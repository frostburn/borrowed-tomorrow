import type {Battle,Unit} from '../rules/combat';
import {abilityFor} from '../rules/skills';
import {rallyRecipients,rallyRemaining} from '../rules/rally';

/** Conservative future focus, not an immediate refill. Count two future
 * rounds, missing focus only, and only the extension of an existing aura. */
export function rallyValue(b:Battle,u:Unit){
 const recipients=rallyRecipients(b,u,abilityFor(u,'rally').rank??1);
 const previous=u.rally?rallyRecipients(b,u,u.rally.rank):[];
 const oldTicks=Math.max(0,rallyRemaining(b,u)-1);
 return recipients.reduce((sum,v)=>{const debt=6-v.focus;return sum+Math.max(0,Math.min(2,debt)-(previous.includes(v)?Math.min(oldTicks,debt):0));},0);
}
