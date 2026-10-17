import siding from './maps/cinderbank.json' with { type:'json' };
import infirmary from './maps/infirmary.json' with { type:'json' };
import { collision, type MapData } from '../disk-a/maps';

export const C_MAPS:Record<'cinderbank'|'infirmary',MapData>={
  cinderbank:{id:'cinderbank',name:'Cinderbank siding',subtitle:'2 December · 04:10 · departure held for repairs',width:1536,height:1024,solid:collision(siding),objects:[
    {id:'c-dena',x:28,y:12,label:'Dena · ambulance attendant',sprite:'dena'},
    {id:'c-water',x:8,y:22,label:'Hot water · supply table',sign:true,doneFlag:'cWarmed'},
    {id:'c-carriage',x:40,y:12,label:'Ambulance carriage',sign:true},
    {id:'c-dispatch',x:13,y:13,label:'Dispatch office · crew register',sign:true},
    {id:'c-couplings',x:9,y:26,label:'Spare steam coupling',sprite:'hound',hiddenFlag:'cCouplingRecovered'},
    {id:'c-toolbox',x:9,y:26,label:'Recovered steam coupling',sign:true,requiredFlag:'cCouplingRecovered'},
    {id:'c-valve',x:49,y:19,label:'Steam bypass · boiler keeper',sign:true},
    {id:'c-workbook',x:16,y:14,label:'Maintenance delivery book',sign:true,doneFlag:'cWorkbookRead'},
    {id:'c-to-infirmary',x:47,y:27,label:'Stores handcar · Bellwether',sign:true},
    {id:'c-to-larkspur',x:20,y:38,label:'Return platform · Larkspur',sign:true},
  ]},
  infirmary:{id:'infirmary',name:'Bellwether infirmary',subtitle:'2 December · the receiving lamps are lit',width:1536,height:1024,solid:collision(infirmary),objects:[
    {id:'c-celia',x:54,y:17,label:'Celia · admissions',sprite:'celia'},
    {id:'c-beds',x:32,y:12,label:'Receiving hall · fourteen beds',sign:true,doneFlag:'cBedsReserved'},
    {id:'c-ward',x:47,y:15,label:'North ward heating',sign:true},
    {id:'c-patients',x:32,y:17,label:'Ivo · the receiving list',sprite:'ivo',requiredFlag:'cTransferred'},
    {id:'c-to-siding',x:16,y:27,label:'Stores handcar · Cinderbank',sign:true},
  ]},
};
