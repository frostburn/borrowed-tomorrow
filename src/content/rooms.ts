import type {MapId} from '../rules/state';
import type {MusicMode} from '../game/score';

// Wet returns boosted 25% (+1.94 dB) after listening review.
// Retro rooms: two fixed diffusers per side, with gentle one-pole reflection loss.
// Damping is the pole's decay-frequency parameter, not an extra return filter.
export const ROOMS={
 dry:{name:'Dry',size:0,feedback:0,wet:0,damping:12000},
 open:{name:'Open air',size:.35,feedback:.25,wet:.0625,damping:12000},
 cabin:{name:'Timber cabin',size:.5,feedback:.4,wet:.175,damping:8000},
 ward:{name:'Ward',size:.7,feedback:.42,wet:.1875,damping:10000},
 court:{name:'Stone courtyard',size:.9,feedback:.4,wet:.125,damping:12000},
 works:{name:'Engine hall',size:.65,feedback:.35,wet:.2125,damping:9000},
 hall:{name:'Marble hall',size:1.25,feedback:.55,wet:.2375,damping:12000},
 cave:{name:'Cavern',size:1.35,feedback:.5,wet:.2125,damping:8000},
 domain:{name:'Hollow domain',size:1.4,feedback:.52,wet:.25,damping:10000},
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
 'hollow-crossing':'domain','mooring-crossing':'open','airfield-crossing':'open','refuge-crossing':'open','capital-crossing':'court',crossing:'open',battle:'open',inspector:'cave',ending:'open',sluice:'works',flood:'works',
 'coast-battle':'open','petra-battle':'open',shunting:'open',switching:'works',
 'four-battle':'open','four-warden':'court','five-battle':'works','five-furnace':'works',
 'dawn-battle':'court','dawn-commander':'open','wind-battle':'ward','wind-engine':'hall',claim:'open',
 'desert-battle':'court','sun-serpent':'court','river-battle':'open','rain-warden':'cabin','rainhouse-rest':'cabin',
 'north-battle':'cave','winter-dragon':'cave','capital-battle':'hall',emperor:'open',lightbearer:'open','capital-return':'court',
 'domain-battle':'domain','harvest-battle':'open','hospice-battle':'hall','seasons-battle':'domain',
 benefactor:'domain','hollow-sun':'domain',unborrowed:'domain',
}satisfies Record<MusicMode,RoomId>;
