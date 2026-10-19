import type { MapData } from '../maps';
export const CHAPTER_FOUR_MAPS={
 refuge:{id:'refuge',art:'infirmary',name:'Iron Coast · the railway refuge',subtitle:'The medical passengers are safe. Messages are arriving from the valley.',width:1536,height:1024,
  solid:[[0,0,64,17],[0,17,9,25],[56,17,8,25],[9,28,8,14],[17,34,39,8],[43,18,13,3],[47,21,9,3],[40,24,16,10],[9,17,13,2]],objects:[
   {id:'refuge-tomas',x:33,y:22,label:'Tomas · news from the valley',sprite:'tomas'},
   {id:'refuge-rest',x:30,y:19,label:'Dena · ward supplies and rest',sprite:'dena'},
   {id:'refuge-bram',x:24,y:24,label:'Bram · the workers are safe',sprite:'bram',requiredFlag:'worksEvacuated'},
   {id:'refuge-works',x:18,y:24,label:'Breakwater works · the evacuated yard',sign:true,requiredFlag:'partyReunited'},
   {id:'refuge-sanctuary',x:37,y:22,label:'Mountain sanctuary',sign:true,requiredFlag:'partyReunited'},
  ]},
 breakwater:{id:'breakwater',art:'sluice',name:'Breakwater works · the evacuation gate',subtitle:'The flood wheels have stopped. Workers are trapped behind the return gate.',width:1591,height:988,
  solid:[[0,0,66,13],[0,13,7,28],[60,13,6,28],[7,33,16,8],[43,33,17,8],[23,39,20,2]],objects:[
   {id:'works-approach',x:32,y:16,label:'Return gate · choose an approach',sprite:'guardian',spriteHiddenFlag:'worksGateWon',hiddenFlag:'worksEvacuated'},
   {id:'works-evacuate',x:32,y:35,label:'Open the evacuation gate',sign:true,requiredFlag:'worksGateWon',hiddenFlag:'worksEvacuated',hitArea:{x:28,y:33,width:10,height:5}},
   {id:'works-cart',x:10,y:23,label:'Survey cart · folding range sight',sign:true,doneFlag:'worksStoresWon',hitArea:{x:3,y:21,width:8,height:4}},
   {id:'works-bench',x:14,y:16,label:'Gatehouse supplies · rest',sign:true},
   {id:'works-bram',x:29,y:19,label:'Bram · the trapped workers',sprite:'bram',hiddenFlag:'worksEvacuated'},
   {id:'works-refuge',x:32,y:35,label:'Return to the railway refuge',sign:true,requiredFlag:'partyReunited'},
  ]},
 sanctuary:{id:'sanctuary',name:'The guardians’ sanctuary',subtitle:'An older sun above the doors. Fresh bandages beneath the arch.',width:1536,height:1024,
  solid:[[0,0,64,18],[0,18,4,24],[60,18,4,24],[4,32,17,10],[43,32,17,10],[4,18,7,1],[53,18,7,1]],objects:[
   {id:'sanctuary-patrol',x:31,y:25,label:'Protect the patients',sprite:'guardian',requiredFlag:'celiaJoined',hiddenFlag:'roadGuardWon'},
   {id:'sanctuary-seal',x:32,y:18,label:'Celia · read the lower seal',sign:true,requiredFlag:'roadGuardWon',hiddenFlag:'partyReunited',hitArea:{x:25,y:2,width:14,height:16}},
   {id:'sanctuary-warden',x:32,y:22,label:'The Sanctuary Warden',sprite:'sluice-keeper',requiredFlag:'partyReunited',hiddenFlag:'sanctuaryWardenWon'},
   {id:'sanctuary-record',x:32,y:18,label:'The guardians’ record · the hollow sun',sign:true,requiredFlag:'sanctuaryWardenWon',doneFlag:'anchorsKnown',hitArea:{x:25,y:2,width:14,height:16}},
   {id:'sanctuary-bench',x:7,y:20,label:'Sheltered bench · rest',sign:true,hitArea:{x:3,y:15,width:8,height:5}},
   {id:'sanctuary-chest',x:56,y:19,label:'Field chest · silver clasp',sign:true,requiredFlag:'partyReunited',doneFlag:'sanctuaryCache',hitArea:{x:54,y:14,width:5,height:5}},
   {id:'sanctuary-refuge',x:32,y:36,label:'Return to Tomas and the refuge',sign:true,requiredFlag:'partyReunited'},
  ]},
} satisfies Record<string,MapData>;
