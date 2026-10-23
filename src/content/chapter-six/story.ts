import type { GameState } from '../../rules/state';
export const JOURNAL={
 capitalSealed:{title:'The sealed capital',text:'The Emperor has closed a barrier under an old defense pact. Two foreign seals hold it: Namar’s royal observatory and the northern sanctuary. People are still living inside the capital.'},
 sixRoutesKnown:{title:'The two pact seals',text:'Alda has charts for both foreign capitals. Each seal must be released where its kingdom signed the pact. The ship remains a safe berth; Nell stays under care.'},
 jungleLeadKnown:{title:'Sera’s river referral',text:'Sera has found river healers who treated crystal workers before the imperial wards. Her notes may help them interrupt Nell’s connection to the shard. This is a separate journey from the two seals.'},
 desertSeen:{title:'Namar at dusk',text:'Amal’s evening post still connects the city to the railway. Queen Samira has been reading reports from the freed regions and will hear us at the eastern palace.'},
 palaceCoup:{title:'The divided court',text:'Samira recognized her own grain orders in the ledger and chose to withdraw Namar’s seal. Sahir ordered the guardian awakened and the queen held in her court. Reach the western postal stair with her.'},
 palaceEscapeWon:{title:'The cordon falls back',text:'The palace cordon is broken. A sunmesh travel coat goes into the bag. Reach the western postal stair and leave with Samira.'},
 palaceEscaped:{title:'The postal stair',text:'Amal opened the stair above the palace. Follow the water jars across the roofs to the observatory. The postal shelter has supplies.'},
 desertAscentSeen:{title:'Wings over the observatory',text:'The Benefactor’s glasswings hold the release walk and have driven off Sahir’s guards. Clear the upper terrace to reach the observatory. Amal is keeping the lower stair open.'},
 desertAscentWon:{title:'The upper terrace',text:'The upper stair is clear. A fine expansion ring goes into the bag for Orrin. Rest before entering the royal observatory.'},
 sunSerpentSeen:{title:'The sun serpent',text:'The awakened serpent holds the bronze release. Its coils alternately loosen; broken coils weaken its armor and stop reflected lanes. Glass from one breath can reflect the next. The marked attack includes those reflections.'},
 sunSerpentFallen:{title:'The guardian falls',text:'The serpent has released the bronze apparatus. A solar saber guard goes into the bag for Petra. Samira can now lift the pact band from its release.'},
 desertReleaseReady:{title:'The bronze band',text:'Samira has freed Namar’s pact band. She will break it in the evening exchange, in front of the people whose defense it pledged. Sahir must answer to the city watch.'},
 desertSealBroken:{title:'The western seal',text:'Samira broke the pact band publicly. Namar is sending navigators, supplies and evacuation barges. The western return is dark; the northern seal still holds the capital shut.'},
 desertFocusTaken:{title:'The observatory lens',text:'A spare sunstone examination lens was stored on the postal terrace. It is in the bag for Celia to fit by hand.'},
 desertMailSent:{title:'Letters still travel',text:'Amal sent the medical report and Kit’s letter to Tomas through the evening exchange. She supplied a light courier harness for whoever needs to move quickly.'},
 desertReported:{title:'News for Nell',text:'The crew brought Namar’s news back to Nell. She remains under care. Alda is preparing the northern expedition; Sera’s river referral remains a separate lead.'},
};
export function objective(s:GameState):string{
 const f=s.flags,m=s.location.map;
 if(!f.capitalSealed)return 'Reach the capital’s outer mooring.';
 if(!f.sixRoutesKnown)return 'Read the two return lines at Alda’s flight chart.';
 if(m==='outermooring')return f.desertSealBroken?f.desertReported?'Prepare at the outer mooring. The northern pact seal still holds.':'Bring Namar’s news to Nell and Alda.':'Choose the Namar landing at the flight chart.';
 if(m==='namar')return f.desertReleaseReady&&!f.desertSealBroken?'Join Samira at the evening exchange.':f.desertSealBroken?'The western seal is broken. Return to Alda at the survey landing.':'Meet Queen Samira at the eastern palace.';
 if(m==='sunpalace')return !f.palaceCoup?'Ask Samira to withdraw the imperial seal.':!f.palaceEscapeWon?'Choose an escape at the postal stair west of the fountain.':!f.palaceEscaped?'Meet Amal at the western postal stair.':'Take the western stair to the observatory terraces.';
 if(m==='skywalk')return !f.desertAscentWon?'Clear the glasswings from the upper terrace.':'Rest at the postal shelter, then take the eastern observatory stair.';
 return !f.sunSerpentWon?'Stop the sun serpent above the bronze release.':!f.desertReleaseReady?'Lift the pact band at the bronze release.':f.desertSealBroken?'The western seal is broken. The terrace stair returns to Namar.':'Return to the evening exchange with Samira.';
}
