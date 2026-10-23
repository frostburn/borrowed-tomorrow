import { SAY } from '../dialogue';
import { arrival } from '../maps';
import type { StoryHost } from '../story-host';
import type { MapId } from '../../rules/state';
import { receiveItem } from '../../rules/inventory';
import * as scenes from './windmere-scenes';
export function resumeWindmere(h:StoryHost){
 const {state:s}=h,f=s.flags,map=s.location.map;
 if(map==='windmere'){
  if(!f.windmereSeen)return h.talk({...scenes.hospital(),done:()=>{s.location=arrival('windmere','ward');h.commit('windmereSeen','windmereSeen');}});
  if(f.windmereFreed&&!f.windmereComplete)return h.talk({...scenes.night(),done:()=>{s.location=arrival('windmere','night');h.commit('windmereComplete','windmereComplete');}});
 }
 if(map==='dispensary'&&!f.dispensarySeen)return h.talk({...scenes.dispensary(),done:()=>{s.location=arrival('dispensary','junction');h.commit('dispensarySeen','dispensarySeen');}});
 if(map==='mirrorward'&&!f.mirrorWardSeen)return h.talk({...scenes.mirrors(),done:()=>{s.location=arrival('mirrorward','stand');h.commit('mirrorWardSeen','mirrorWardSeen');}});
}
export function interactWindmere(h:StoryHost,id:string){
 const {state:s}=h,f=s.flags;
 const say=(who:string,text:string)=>h.talk({lines:[SAY(who,text)]});
 const go=(map:MapId,name:string)=>{const p=arrival(map,name);h.travel(p.map,p.x,p.y);};
 switch(id){
  case 'wind-ship':return go('airship','windmere');
  case 'wind-dispensary':return go('dispensary','start');
  case 'wind-ward':return go('windmere','dispensary');
  case 'wind-lift-guard':
   if(!f.dispensarySeen)return;
   if(f.windLiftWon)return h.toast('The brake is clear. Turn the wheel on the eastern walk.');
   return h.talk({lines:[SAY('Sera','The guardian covers the brake. Those crows will get behind us if we stay in the doorway.')],choices:[{label:'Clear the water-lift brake',action:()=>{h.commit('windLiftConfronted');h.battle('wind-lift');}},{label:'Prepare first',action:()=>{}}]});
  case 'wind-lift-wheel':
   if(!f.windLiftWon)return say('Sera','Clear the brake before we put anyone on the platform.');
   if(f.waterLiftOpened)return say('Sera','The lift is running. Take the equipment back to the ordinary ward.');
   return h.talk({...scenes.lift(),done:()=>{s.location=arrival('dispensary','wheel');h.commit('waterLiftOpened','waterLiftOpened');}});
  case 'wind-reflector':
   if(!f.waterLiftOpened)return say('Celia','The old lamps are behind the lift stores. Let’s bring the equipment up first.');
   if(f.windReflectorTaken)return say('Nell','The opal reflector’s in our bag unless I’m using it.');
   return h.talk({lines:[SAY('Celia','An opal reflector from the old examination lamp. It should fit your lantern, Nell.')],choices:[{label:'Take the opal reflector',action:()=>{if(receiveItem(s.inventory,'opal-reflector'))h.commit('windReflectorTaken','windReflectorTaken');else h.toast('The bag cannot hold another reflector.');}},{label:'Leave it here',action:()=>{}}]});
  case 'wind-transfer':
   if(!f.waterLiftOpened)return say('Sera','We need the beds and bellows from the lower dispensary. The old water lift can bring them up.');
   if(f.patientsTransferred)return say('Celia','The ward line’s isolated. The treatment gallery is up the eastern stair.');
   return h.talk({...scenes.transfer(),done:()=>{s.location=arrival('windmere','transfer');h.commit('patientsTransferred','patientsTransferred');}});
  case 'wind-mirrorward':return f.patientsTransferred?go('mirrorward','start'):h.toast('Settle the patients in the ordinary ward at the bypass valve first.');
  case 'wind-gallery-return':return go('windmere','mirrorward');
  case 'wind-gallery-guard':
   if(!f.mirrorWardSeen)return;
   if(f.windGalleryWon)return h.toast('The bridge is clear. Reach the engine below its lens.');
   return h.talk({lines:[SAY('Petra','Keep these machines away from the ward doors. There’s room on the bridge to draw them out.')],choices:[{label:'Clear the gallery bridge',action:()=>h.battle('wind-gallery')},{label:'Prepare first',action:()=>{}}]});
  case 'wind-engine':
   if(!f.windGalleryWon)return h.toast('Clear the gallery bridge before approaching the engine.');
   if(f.wardEngineWon)return h.toast('The engine is stopped. Use the support-release controls above it.');
   return h.talk({lines:[SAY('Celia','The lit projection directs this round’s beam. Break it to cancel the beam and expose the core until the next round. Both projections gone leaves the core open.')],choices:[{label:'Stop the mirrored ward engine',action:()=>{h.commit('wardEngineConfronted');h.battle('wind-engine');}},{label:'Prepare our equipment first',action:()=>{}}]});
  case 'wind-anchor':
   if(!f.wardEngineWon)return h.toast('Stop the engine before touching the treatment supply.');
   if(f.windmereFreed)return say('Celia','The ward is on its own supply. The upward contact is open.');
   return h.talk({...scenes.release(),done:()=>{s.location=arrival('mirrorward','release');h.commit('windmereFreed','windmereFreed');}});
  case 'wind-sera':case 'wind-lift-sera':return say('Sera',f.windmereComplete?'The morning clinic’s open. Dena’s next train has the linen we asked for.':f.waterLiftOpened?'The equipment is up. Meet us at the ordinary ward’s bypass valve.':'There are beds in the lower dispensary. We can bring them up together.');
  case 'wind-teren':return say('Teren','She let me carry my own bag today. Sera still made me stop at the first landing.');
  case 'wind-iven':return say('Director Iven',f.windmereFreed?'I’ve opened the ledger. The village representatives are waiting downstairs.':'I know every bed that light has emptied. I should have counted the ones it filled elsewhere.');
 }
}
