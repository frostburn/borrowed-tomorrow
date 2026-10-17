import { SAY } from '../disk-a/story';
import type { GameState } from '../../rules/state';

export const DISK_D={id:'disk-d',title:'The Unsent Letter',next:'disk-e:brinewick-parcel'} as const;
export const ARRIVAL_D=[
  SAY('Northglass · 19 January, 17:35','A tram bell sounds beyond the signal gantry. Six workers wait on its narrow deck. A woman at the dispatch window holds a loose shutter against the wind.'),
  SAY('Petra','Mind that shutter. The latch has gone through the wood.'),
  SAY('Nell','I’ve got it. We have a letter-collection slip and the signed crew copy.'),
  SAY('Petra','For Orrin? It’s in the green bag. Come to the window; I can hand it over while we hold this.'),
  SAY('Orrin','What’s keeping the tram out there?'),
  SAY('Petra','The workers’ road says red here and green at the far end. I won’t move the points with them on it. There’s no departure until we sort it out.'),
];

export const D_JOURNAL:Record<string,{title:string;text:string}>={
  'd-arrival':{title:'Northglass at shift change',text:'Northglass’s local date is 19 January, 17:35. Six workers are stranded on an inspection tram beyond conflicting signals. Petra holds all departures. Present our crew copy at her dispatch window to collect Orrin’s letter. There is no running countdown.'},
  'd-letter':{title:'A letter from Dad',text:'Petra handed over the sealed letter against our signed crew copy. Orrin’s father describes returning to a maintenance lamp room after hearing the viaduct fall. He warns that Northglass’s green repeater feeds the workers’ road backwards: earth both returns before opening the contact. His last parcel contains Orrin’s mother’s brass key and was sent to Brinewick. The letter does not establish that he can return to Larkspur alive.'},
  'd-red':{title:'A protected road',text:'Nell hung a red lamp and clipped the workers’ road shut independently of the faulty repeater. The six workers can get off their tram once its track hounds are clear.'},
  'd-crew':{title:'Six off the tram',text:'Esme and the other five workers are back inside the protected yard. Their tools and wages are accounted for. Esme has taken the burnt return wire into the relay hall; no worker joined the fighting.'},
  'd-circuit':{title:'Two earth contacts',text:'The burnt wire confirms the letter’s warning. The keeper feeds both return contacts. In combat, Nell and Orrin must occupy the two blue earth plates at the same time. The keeper’s shield then drops and stays down; they may leave the plates and attack. Enemies cannot operate them.'},
  'd-red-plan':{title:'Close for the night',text:'We will keep every signal red and close the works for this shift. Petra will send the workers home on paid time. The local siding cannot handle deliveries tonight; its queued parcels will wait until morning.'},
  'd-bell-plan':{title:'A hand-bell service',text:'We will keep the main line red and work only the local siding by hand bell. Petra and Esme will alternate the lamp duty. Tonight’s parcels can move, but both must stay late. This gives no train permission to use the viaduct.'},
  'd-relay':{title:'Return contact open',text:'Both earth plates released the keeper’s shield. Orrin opened the return contact and tested it from each side. The wrong green repeater is out; the protected road stays red. Our chosen night plan can now be put into service.'},
  'd-record':{title:'The parcel counterfoil',text:'The isolated recorder shows the green bag sealed at maintenance shift 783 and our crew copy filed at 786. Orrin’s father signed for a parcel to Brinewick before either entry. Its brass-key description matches his letter. The counterfoil supplies a parcel number, not a new passenger authorization.'},
  'd-engineer':{title:'A name beneath the initials',text:'The cabinet’s calibration order names Ada Fenwick, signal engineer. This identifies the engineer on this order; it does not prove who created the return railway or where she is now.'},
  'd-departure':{title:'The works are safe',text:'All six workers are off the trestle. The faulty return feed is disconnected and Petra has signed the night operating plan. Orrin has his letter and the Brinewick parcel counterfoil. Mira and Bram remain together at Larkspur; the fourteen ambulance patients remain at Bellwether. Next: collect the brass-key parcel at Brinewick.'},
};
export function objectiveD(s:GameState):string{
  const f=s.flags;
  if(f.diskDComplete)return 'Northglass is safe. Insert Disk E to collect the Brinewick parcel.';
  if(!f.dLetterRead)return 'Show Petra the crew copy at the dispatch window and collect Orrin’s letter.';
  if(!f.dLineHeld)return 'Hang the red lamp on the workers’ road before approaching the tram.';
  if(!f.dCrewReturned)return 'Clear the inspection tram’s track hounds and bring all six workers into the yard.';
  if(!f.dCircuitRead)return 'Meet Esme at the relay hall’s insulation bench.';
  if(!f.dHoldRed&&!f.dHandBell)return 'Choose tonight’s operating plan at the relay hall’s route table.';
  if(!f.dRelayStopped)return 'Earth both blue plates together, then stop the relay keeper.';
  if(!f.dRecordRead)return 'Read the isolated shift recorder beside the relay hall’s parcel shelves.';
  return 'Bring the parcel counterfoil to Petra and sign off the safe works.';
}
