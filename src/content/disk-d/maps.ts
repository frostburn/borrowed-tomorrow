import exterior from './maps/northglass.json' with {type:'json'};
import interior from './maps/relayhall.json' with {type:'json'};
import { collision, type MapData } from '../disk-a/maps';

export const D_MAPS:Record<'northglass'|'relayhall',MapData>={
  northglass:{id:'northglass',name:'Northglass signal works',subtitle:'19 January · 17:35 · inspection tram held outside the yard',width:1536,height:1024,solid:collision(exterior),objects:[
    {id:'d-petra',x:14,y:15,label:'Petra · dispatch and letter collection',sprite:'petra',hitArea:{x:10,y:8,width:6,height:6}},
    {id:'d-lamp',x:9,y:25,label:'Red lamp · protect the workers’ road',sign:true,doneFlag:'dLineHeld'},
    {id:'d-esme',x:51,y:19,label:'Esme · stranded inspection crew',sprite:'esme',hiddenFlag:'dCrewReturned'},
    {id:'d-tram',x:53,y:24,label:'Inspection tram · six workers',sign:true,doneFlag:'dCrewReturned',hitArea:{x:56,y:15,width:8,height:12}},
    {id:'d-to-hall',x:48,y:14,label:'Relay hall',sign:true,hitArea:{x:44,y:7,width:9,height:7}},
    {id:'d-to-larkspur',x:31,y:38,label:'Return platform · Larkspur',sign:true},
  ]},
  relayhall:{id:'relayhall',name:'Northglass relay hall',subtitle:'19 January · 17:35 · the return contact is still closed',width:1536,height:1024,solid:collision(interior),objects:[
    {id:'d-esme-hall',x:20,y:29,label:'Esme · relay technician',sprite:'esme',requiredFlag:'dCrewReturned',hiddenFlag:'dWorkersHome'},
    {id:'d-circuit',x:10,y:19,label:'Insulation bench · return circuit',sign:true,doneFlag:'dCircuitRead',hitArea:{x:2,y:14,width:8,height:5}},
    {id:'d-plan',x:32,y:23,label:'Route table · operating plan',sign:true,hitArea:{x:25,y:14,width:15,height:9}},
    {id:'d-relay',x:45,y:14,label:'Relay keeper · paired earth contacts',sprite:'relay-keeper',hiddenFlag:'dRelayStopped'},
    {id:'d-recorder',x:53,y:28,label:'Shift recorder · parcel counterfoil',sign:true,doneFlag:'dRecordRead',hitArea:{x:56,y:23,width:8,height:7}},
    {id:'d-plaque',x:33,y:12,label:'Cabinet plate · calibration order',sign:true,doneFlag:'dEngineerRead'},
    {id:'d-to-yard',x:31,y:35,label:'Works yard',sign:true},
  ]},
};
