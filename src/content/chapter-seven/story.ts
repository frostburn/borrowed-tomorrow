import type {GameState} from '../../rules/state';
const entry=(title:string,text:string)=>({title,text});
export const JOURNAL={
 domainEntered:entry('Beneath the hollow sun','The fragment opened the crossing beneath a suspended sea. Alda holds the mooring. The Benefactor is visible beyond the stolen landscapes.'),
 domainWaterSeen:entry('The waiting platform','Living captives from Rillbridge are held at a familiar railway platform. Clear the pursuit and defeat the old collector.'),
 domainHoundsWon:entry('The platform is clear','The hounds are stopped. The collector still holds the passengers beyond the bell.'),
 domainCollectorWon:entry('The first collector','The pressure guardian is stopped. Its casing resembles the palace machine; gold veins run through its joins.'),
 takenPeopleFreed:entry('The second bell note','The passengers can move again. Kit marked the route to Alda; the porter is bringing the family across.'),
 firstHarvestSeen:entry('The first good year','A farmer remembers grain ripening through winter while the next valley went dark. The dynasty pledged later generations; the Benefactor knowingly kept the people whose days it took.'),
 domainFurnaceWon:entry('The harvest keeper stops','The casting machine is stopped. Its return circuit became part of Hammerplain’s engines.'),
 harvestFreed:entry('An uncut row','The workers are free, and one stream feeding the Benefactor has gone dark. The old lamp’s reflector can be recovered from the eastern store.'),
 domainReflectorTaken:entry('The empty lamp','A morning-glass reflector is in the bag for Nell. It needs to be fitted from Equipment.'),
 firstHospiceSeen:entry('After the healing','The hospice patient was healed, then kept from leaving. Celia is treating the wounds caused by her confinement. The original mirrored engine holds the exit.'),
 domainWardWon:entry('The original mirrors','The hospice engine is stopped. Its treatment focus is in the equipment bag.'),
 wardPeopleFreed:entry('Out of bed','The patient left with the porter. A second stream broke at the Benefactor’s shoulder. The road continues into stolen seasons.'),
 seasonStreetSeen:entry('The seasons meet','Skeld’s snow, Namar’s terraces and a river stair have been folded together. The winter dragon guards the last return. Kit and Petra are guiding the freed people through.'),
 domainDragonWon:entry('Winter leaves the gate','The dragon fell. Its sound saber guard is in the bag for Petra.'),
 seasonsFreed:entry('One road stays open','Orrin jammed the gate open without its divine supply. The last stream broke and the Benefactor’s ring stopped turning.'),
 domainPatrolWon:entry('The courier stair','The divine hunters are stopped. A far-road survey sight is in the bag for Kit.'),
 lastRefugeSeen:entry('The unwritten hour','The freed people have made a shelter and begun crossing to Alda. Rest, supplies and equipment remain available before and between the final forms.'),
 benefactorSeen:entry('The Benefactor','The god claims the lives its miracles made possible. The three sources are cut; its body can no longer draw from them.'),
 benefactorBodyWon:entry('The mantle breaks','The Benefactor’s body is defeated. It cannot refill the empty shoulder channels.'),
 hollowSunSeen:entry('The hollow sun','The ring rose out of the wreckage. Its rays still reach across the stair. The shelter remains reachable.'),
 benefactorSunWon:entry('The ring splits','The hollow sun is broken. Its heart is exposed inside the ring.'),
 fragmentReturned:entry('The fragment goes home','Nell returned the shard to the heart. The fracture opened, and the cold left the lantern. The last pulse can now be stopped.'),
 benefactorHeartWon:entry('The last pulse','The divine heart is defeated. No further source remains behind it.'),
 daysReturned:entry('The days return','The Benefactor and its power to collect are destroyed. Living captives and stolen futures return. Ordinary deaths, including Ansel’s, have not been reversed.'),
 homecomingSeen:entry('An ordinary departure','Tomas has the tickets at Larkspur. The rescued people are reaching their families and relief crews; ordinary engines are running in the wards.'),
 realSeaSeen:entry('The real coast','Nell, Tomas and their friends reached the sea. The return train leaves in the evening. The lantern is resting beside their bags.'),
 chapterSevenComplete:entry('Tomorrow','The journey is over. The Benefactor cannot collect again. The future belongs to the people who live it.'),
};
export function objective(s:GameState){
 const f=s.flags,m=s.location.map;
 if(f.chapterSevenComplete)return 'Stay beside the sea, or revisit the picnic.';
 if(m==='seaholiday')return 'Join Tomas and the others beside the sea.';
 if(m==='homecoming')return 'Visit Tomas and Iona, then board the sea train.';
 if(m==='sunthrone')return f.fragmentReturned?'Break the exposed heart.':f.hollowSunSeen?'Defeat the hollow sun.':'Face the Benefactor at the top of the stair.';
 if(m==='lastrefuge')return 'Rest and fit equipment, then climb the last stair.';
 if(m==='seasonstreet')return f.seasonsFreed?'Follow the freed people to the shelter.':'Defeat the winter dragon and open the last return.';
 if(m==='quietward')return f.wardPeopleFreed?'Take the northern road into the stolen seasons.':'Break the mirrored engine and free the hospice patients.';
 if(m==='firstfield')return f.harvestFreed?'Take the northern stair to the original hospice.':'Stop the furnace carrier keeping the harvest in place.';
 if(m==='takenwater')return f.takenPeopleFreed?'Take the northern platform toward the first harvest.':f.domainHoundsWon?'Defeat the first collector.':'Clear the hounds from the waiting platform.';
 return 'Cross the suspended pier beneath the sea.';
}
