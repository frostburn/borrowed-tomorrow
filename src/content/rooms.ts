import type {MapId} from '../rules/state';
import type {MusicMode} from '../game/score';

// Fixed geometry: transitions change gains, never the feedback delays.
export const ROOMS={
 dry:{name:'Dry',size:0,feedback:0,wet:0,damping:8000},
 open:{name:'Open air',size:.38,feedback:.38,wet:.045,damping:4400},
 cabin:{name:'Timber cabin',size:.5,feedback:.52,wet:.14,damping:3800},
 ward:{name:'Ward',size:.8,feedback:.57,wet:.17,damping:5200},
 court:{name:'Stone courtyard',size:1.1,feedback:.56,wet:.12,damping:5800},
 works:{name:'Engine hall',size:1.4,feedback:.63,wet:.22,damping:4600},
 hall:{name:'Marble hall',size:2,feedback:.66,wet:.25,damping:6500},
 cave:{name:'Cavern',size:2.8,feedback:.68,wet:.27,damping:3600},
 domain:{name:'Hollow domain',size:3.6,feedback:.7,wet:.28,damping:5400},
}as const;
export type RoomId=keyof typeof ROOMS;

export const MAP_ROOMS:Record<MapId,RoomId>={
 station:'open',yard:'open',rillbridge:'open',tunnel:'cave',
 coast:'open',infirmary:'ward',cinderbank:'open',northglass:'court',relayhall:'works',conduit:'works',
 refuge:'open',breakwater:'open',sanctuary:'court',
 airfield:'open',airship:'open',hammerplain:'works',coolingworks:'works',anchorforge:'works',
 dawnwatch:'court',watchbarracks:'court',signalwall:'open',observation:'cabin',flagship:'open',
 windmere:'court',dispensary:'ward',mirrorward:'hall',
 outermooring:'open',namar:'court',sunpalace:'court',skywalk:'open',observatory:'court',
 riverhaven:'open',canopy:'open',rainhouse:'cabin',bellharbor:'open',frostwatch:'cave',glacier:'open',wintershrine:'cave',
 capitalquay:'court',stillcity:'court',lastpalace:'hall',lastmorning:'open',lastshore:'open',crown:'open',laststation:'open',
 hollowsill:'domain',takenwater:'domain',firstfield:'open',quietward:'hall',seasonstreet:'domain',lastrefuge:'cabin',sunthrone:'domain',homecoming:'open',seaholiday:'open',
};

// Battle/scene cues have a canonical location for review, but campaign music
// never chooses the room: a reused score must retain its actual surroundings.
export const TRACK_ROOMS={...MAP_ROOMS,
 battle:'open',inspector:'cave',ending:'open',sluice:'works',flood:'works',
 'coast-battle':'open','petra-battle':'open',shunting:'open',switching:'works',
 'four-battle':'open','four-warden':'court','five-battle':'works','five-furnace':'works',
 'dawn-battle':'court','dawn-commander':'open','wind-battle':'ward','wind-engine':'hall',claim:'open',
 'desert-battle':'court','sun-serpent':'court','river-battle':'open','rain-warden':'cabin','rainhouse-rest':'cabin',
 'north-battle':'cave','winter-dragon':'cave','capital-battle':'hall',emperor:'open',lightbearer:'open','capital-return':'court',
 'domain-battle':'domain','harvest-battle':'open','hospice-battle':'hall','seasons-battle':'domain',
 benefactor:'domain','hollow-sun':'domain',unborrowed:'domain',
}satisfies Record<MusicMode,RoomId>;
