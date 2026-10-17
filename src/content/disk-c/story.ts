import { SAY } from '../disk-a/story';
import type { GameState } from '../../rules/state';

export const DISK_C={id:'disk-c',title:'The Last Ambulance Train',next:'disk-d:signal-works'} as const;
export function arrivalC(s:GameState){return [
  SAY('Before departure · Larkspur',s.flags.bOrchardChannel?'Iona puts two rolls of blankets on the barrow. Ansel has signed Tilda’s flour credit; the flooded orchard cannot pay for winter bread.':'Iona puts two rolls of blankets on the barrow. Tilda and Bram are bringing stored apples over the dry orchard bank to pay for flour.'),
  SAY('Orrin','Mira’s asleep beside Bram. She’s got the suitcase handle round her wrist.','orrin'),
  SAY('Nell','The next carbon already has our names on it. We’ll follow it to whoever’s sending these backward. These blankets go with us.','nell'),
  SAY('Cinderbank · 2 December, 04:10','Two ambulance carriages stand beside a boiler shed. A woman holds a hot-water bottle against a man’s coat.'),
  SAY('Dena','Hold this clamp, please. My orderly’s gone for water and the wheels have started to move.'),
  SAY('Nell','Porter and mechanic, from Larkspur. Where are you taking them?','nell'),
  SAY('Dena','Bellwether infirmary. Six miles west. Fourteen wounded men, two carriages. We’re ordered out before dawn.'),
  SAY('Orrin','The brake hose is frozen solid. I’ve pinned it shut. This train stays here until we release it.','orrin'),
  SAY('Dena','Then leave it pinned. Bring the covered kettle from the supply table. Ivo’s trying to carry it and two stretchers.'),
];}

export const C_JOURNAL:Record<string,{title:string;text:string}>={
  'c-arrival':{title:'The ambulance siding',text:'Cinderbank’s local date is 2 December, 04:10. Fourteen wounded soldiers must reach Bellwether infirmary, six miles west. The train is held by a frozen brake hose. Departure waits for our repairs; there is no running countdown. Dena needs the covered kettle from the supply table.'},
  'c-flour-credit':{title:'Winter bread',text:'Ansel approved Tilda’s flour credit at Larkspur. The orchard we flooded cannot supply winter income. Iona has lent two rolls of blankets to the ambulance service. Mira and Bram remain together.'},
  'c-harvest':{title:'The first provisions',text:'The orchard bank stayed dry. Tilda and Bram are bringing stored apples across the maintenance crossing to pay for flour. Iona has lent two rolls of blankets to the ambulance service. Mira remains with Bram.'},
  'c-water':{title:'Warm hands',text:'Dena and Ivo have filled the hot-water bottles. The patients’ fingers are warm enough to grip the stretcher rails. Help them at the carriage door before releasing the brake.'},
  'c-refused':{title:'Attendants refused',text:'The carriage accepted the patients, then shut on Dena’s bag. The registry lists fourteen passengers and no attendants. Its order bears the inspector’s punch mark. We will not dispatch them without care. Read the working-train instructions in the dispatch office.'},
  'c-register':{title:'A working train',text:'Ambulance crews have a separate register. It requires fourteen receiving beds, a tested brake and boiler, and the attendants’ names. The passenger list must stay unchanged. Bellwether holds the receiving copy; its stores handcar is available to railway workers.'},
  'c-beds':{title:'Fourteen places',text:'Celia has reserved fourteen beds in Bellwether’s receiving hall. Its north ward needs the same spare steam connection as the ambulance carriages. Recover the coupling at Cinderbank, then choose the heating plan.'},
  'c-coupling':{title:'A sound coupling',text:'The hounds have released the spare coupling. Orrin cleaned its threads and checked the seal. One working connection can heat the train or open Bellwether’s north ward; it cannot do both.'},
  'c-train-heat':{title:'Heat for the journey',text:'We kept steam in the ambulance carriages. Bellwether’s north ward will stay closed tonight; all fourteen patients will share the receiving hall. The boiler discharges through the two outer vent lanes during the repair.'},
  'c-ward-heat':{title:'Heat for the ward',text:'We sent the spare connection to Bellwether’s north ward. The patients will travel under the Larkspur blankets, with fresh hot-water bottles and both attendants. They can use two wards on arrival. The boiler’s central vent lane is active during the repair.'},
  'c-steam':{title:'Steam tested',text:'The boiler keeper is stopped. Orrin pressure-tested the repaired hose and signed the working copy. Orange vent hexes discharged at the end of each combat round; the chosen bypass determined which lanes were hot.'},
  'c-crew':{title:'Four crew, fourteen passengers',text:'The register accepted Dena as attendant, Ivo as orderly, Nell as porter, and Orrin as mechanic. No passenger name was erased or substituted. Both medical attendants can now enter the ambulance carriage.'},
  'c-transfer':{title:'Received at Bellwether',text:'At 05:20 on 2 December, the ambulance train reached Bellwether with all fourteen patients and all four crew. Dena stayed in the carriage until the last stretcher was lifted. Celia signed for fourteen living arrivals.'},
  'c-receipt':{title:'A signed receiving list',text:'Ivo counted fourteen occupied beds against the original passenger list. Celia countersigned the hospital copy. The patients have care, warmth, and a place to stay. Bring the receipt to Ansel at Larkspur.'},
  'c-workbook':{title:'A second copy',text:'The maintenance delivery book records working-train orders under A.F., signal office. A carbon copy of every crew entry goes to Northglass signal works. There is no full name or explanation of who wrote the return timetable.'},
  'c-coda':{title:'The morning deliveries',text:'Ansel filed Bellwether’s signed receipt. At Larkspur, the Rillbridge residents have breakfast and supplies for the next week. Mira and Bram are still together. The ambulance patients remain at Bellwether under Dena and Celia’s care.'},
  'c-departure':{title:'A letter held for Orrin',text:'A collection slip from Northglass signal works names Orrin, care of Larkspur repairs. Its sender is blank. The bag was sealed three maintenance shifts before today’s crew entry. Someone was waiting for Orrin’s adult signature. Nell kept the signed crew copy required to collect it.'},
};
export function objectiveC(s:GameState):string{
  const f=s.flags;
  if(f.diskCComplete)return 'Fourteen patients are safe at Bellwether. Insert Disk D.';
  if(!f.cWarmed)return 'Bring Dena the covered kettle from Cinderbank’s supply table.';
  if(!f.cManifestRefused)return 'Help Dena and Ivo at the ambulance carriage door.';
  if(!f.cRegisterRead)return 'Read the crew register in Cinderbank’s dispatch office.';
  if(!f.cBedsReserved)return 'Take the stores handcar to Bellwether and reserve fourteen beds.';
  if(!f.cCouplingRecovered)return 'Recover the spare steam coupling at Cinderbank.';
  if(!f.cTrainHeat&&!f.cWardHeat)return 'Choose a heating plan at the steam bypass by the boiler shed.';
  if(!f.cBoilerStopped)return 'Stop the boiler keeper. Leave the marked vents before each round ends.';
  if(!f.cCrewAccepted)return 'File the bed count and steam test in Cinderbank’s crew register.';
  if(!f.cTransferred)return 'Return to the carriage and dispatch the staffed ambulance train.';
  if(!f.cReceiptSigned)return 'Check the fourteen arrivals with Ivo at Bellwether’s receiving ramp.';
  if(!f.cLarkspurReported)return 'Bring the signed receiving list to Ansel at Larkspur.';
  return 'Inspect the collection slip beside Larkspur’s unscheduled train.';
}
