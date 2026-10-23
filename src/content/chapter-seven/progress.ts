import type {GameState} from '../../rules/state';
export const SEVEN_MAP_IDS=['hollowsill','takenwater','firstfield','quietward','seasonstreet','lastrefuge','sunthrone','homecoming','seaholiday'] as const;
export const SEVEN_PREREQUISITES:Record<string,string>={
 domainEntered:'chapterSixComplete',domainWaterSeen:'domainEntered',domainHoundsConfronted:'domainWaterSeen',domainHoundsWon:'domainHoundsConfronted',domainCollectorConfronted:'domainHoundsWon',domainCollectorWon:'domainCollectorConfronted',takenPeopleFreed:'domainCollectorWon',
 firstHarvestSeen:'takenPeopleFreed',domainFurnaceConfronted:'firstHarvestSeen',domainFurnaceWon:'domainFurnaceConfronted',harvestFreed:'domainFurnaceWon',domainReflectorTaken:'harvestFreed',
 firstHospiceSeen:'harvestFreed',domainWardConfronted:'firstHospiceSeen',domainWardWon:'domainWardConfronted',wardPeopleFreed:'domainWardWon',
 seasonStreetSeen:'wardPeopleFreed',domainDragonConfronted:'seasonStreetSeen',domainDragonWon:'domainDragonConfronted',seasonsFreed:'domainDragonWon',domainPatrolConfronted:'seasonStreetSeen',domainPatrolWon:'domainPatrolConfronted',lastRefugeSeen:'seasonsFreed',
 benefactorSeen:'lastRefugeSeen',benefactorBodyConfronted:'benefactorSeen',benefactorBodyWon:'benefactorBodyConfronted',hollowSunSeen:'benefactorBodyWon',benefactorSunConfronted:'hollowSunSeen',benefactorSunWon:'benefactorSunConfronted',fragmentReturned:'benefactorSunWon',benefactorHeartConfronted:'fragmentReturned',benefactorHeartWon:'benefactorHeartConfronted',daysReturned:'benefactorHeartWon',homecomingSeen:'daysReturned',realSeaSeen:'homecomingSeen',chapterSevenComplete:'realSeaSeen',
};
export function validateSeven(chapter:unknown,boundary:unknown,loc:GameState['location'],flags:Record<string,boolean>){
 if(chapter!=='chapter-seven'){
  if(Object.keys(SEVEN_PREREQUISITES).some(id=>flags[id]))throw new Error('The final crossing has not opened yet.');return;
 }
 if(boundary!==null||!flags.chapterSixComplete||!flags.nellRecovered||flags.nellLost||flags.lightbearerEnding||!SEVEN_MAP_IDS.includes(loc.map as typeof SEVEN_MAP_IDS[number]))throw new Error('The final crossing checkpoint is incomplete.');
 const gate:Record<string,string>={hollowsill:'chapterSixComplete',takenwater:'domainEntered',firstfield:'takenPeopleFreed',quietward:'harvestFreed',seasonstreet:'wardPeopleFreed',lastrefuge:'seasonsFreed',sunthrone:'lastRefugeSeen',homecoming:'daysReturned',seaholiday:'homecomingSeen'};
 if(!flags[gate[loc.map]])throw new Error('This final-chapter route has not opened yet.');
 if(flags.daysReturned&&!['sunthrone','homecoming','seaholiday'].includes(loc.map))throw new Error('The return journey has begun.');
 if(flags.chapterSevenComplete&&loc.map!=='seaholiday')throw new Error('The final holiday is incomplete.');
}
