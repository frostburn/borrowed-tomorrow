import town from './maps/rillbridge.json' with { type: 'json' };
import sluice from './maps/sluice.json' with { type: 'json' };
import { collision, type MapData } from '../disk-a/maps';
export const B_MAPS:Record<'rillbridge'|'sluice',MapData>={
  rillbridge:{id:'rillbridge',name:'Rillbridge',subtitle:'13 October · festival preparations',width:1595,height:986,solid:collision(town),objects:[
    {id:'b-bram',x:23,y:12,label:'Bram · Mira’s father',sprite:'master',doneFlag:'bFatherFound',hiddenFlag:'bEvacuated'},
    {id:'b-baker',x:44,y:13,label:'Tilda · the bakery',sprite:'clerk',hiddenFlag:'bEvacuated'},
    {id:'b-calendar',x:27,y:14,label:'Festival notice',sign:true},
    {id:'b-schoolhouse',x:56,y:35,label:'Elspeth · schoolhouse',sign:true,doneFlag:'bNeighborsReady'},
    {id:'b-carriage',x:58,y:17,label:'The carriage door',sign:true,doneFlag:'bRegistryRefused'},
    {id:'b-to-sluice',x:32,y:11,label:'Upstream sluice',sign:true},
    {id:'b-crossing',x:15,y:18,label:'Bridge · the residents',sign:true},
    {id:'b-to-tunnel',x:2,y:18,label:'Return to the tunnel',sign:true},
  ]},
  sluice:{id:'sluice',name:'Rillbridge sluice',subtitle:'The upstream gauge is still rising.',width:1591,height:988,solid:collision(sluice),objects:[
    {id:'b-overflow',x:51,y:14,label:'Blocked overflow',sprite:'hound',hiddenFlag:'bOverflowCleared'},
    {id:'b-gauge',x:51,y:14,label:'Cracked gauge plate',sign:true,requiredFlag:'bOverflowCleared',doneFlag:'bFloodEvidence'},
    {id:'b-trolley',x:8,y:23,label:'Maintenance trolley',sign:true,doneFlag:'bTrolleyFreed'},
    {id:'b-worksheet',x:10,y:14,label:'Work sheets',sign:true,doneFlag:'bWorksheetRead'},
    {id:'b-wheel',x:32,y:14,label:'Outfall control wheel',sign:true},
    {id:'b-keeper',x:40,y:21,label:'Sluice keeper',sprite:'guardian',hiddenFlag:'bKeeperStopped'},
    {id:'b-to-town',x:33,y:36,label:'Rillbridge square',sign:true},
  ]},
};
