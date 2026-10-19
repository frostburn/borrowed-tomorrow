import type { MapData } from '../maps';
export const CHAPTER_THREE_MAPS = {
  northglass: { id:'northglass',name:'Capital · south medical siding',subtitle:'The clearance is accepted. The engine works are across the square.',width:1536,height:1024,
    solid:[[0,0,64,12],[0,12,7,30],[58,12,6,30],[7,34,16,8],[41,34,17,8],[23,39,18,3],[7,12,9,2],[56,13,2,11]],objects:[
      {id:'capital-petra',x:38,y:20,label:'Petra · the arrest order',sprite:'petra',hiddenFlag:'petraJoined'},
      {id:'capital-engine',x:32,y:33,label:'Medical engine · rest and supplies',sign:true},
      {id:'capital-cache',x:17,y:16,label:'Maintenance chest · baffled nozzle',sign:true,doneFlag:'capitalCache'},
      {id:'capital-works',x:47,y:13,label:'Palace engine works',sign:true,accessFlag:'petraJoined',hitArea:{x:43,y:8,width:9,height:6}},
      {id:'capital-tomas',x:34,y:30,label:'Tomas · safe at the engine',sprite:'tomas',requiredFlag:'tomasRescued'},
      {id:'capital-departure',x:32,y:35,label:'Leave the rising capital',sign:true,requiredFlag:'emperorMerged'},
    ]},
  relayhall: {id:'relayhall',name:'Palace engine works · control gallery',subtitle:'The intake needles are falling. Someone inside is holding a valve open.',width:1536,height:1024,
    solid:[[0,0,64,12],[0,12,7,30],[58,12,6,30],[7,35,18,7],[39,35,19,7],[25,40,14,2],[25,14,14,8],[16,22,3,6],[45,22,3,6]],objects:[
      {id:'works-warden',x:23,y:16,label:'Engine warden · Tomas',sprite:'relay-keeper',hiddenFlag:'worksWardenWon'},
      {id:'works-tomas',x:23,y:13,label:'Free Tomas',sprite:'tomas',requiredFlag:'worksWardenWon',hiddenFlag:'tomasRescued'},
      {id:'works-locker',x:53,y:19,label:'Sealed stores · courier mechanism',sign:true,doneFlag:'palaceStoresWon'},
      {id:'works-rest',x:20,y:19,label:'Maintenance bench · rest',sign:true,requiredFlag:'tomasRescued'},
      {id:'works-plan',x:32,y:23,label:'Extraction controls · choose an approach',sign:true,accessFlag:'tomasRescued',hitArea:{x:25,y:14,width:14,height:8}},
      {id:'works-depths',x:11,y:12,label:'Stairs beneath the palace',sign:true,accessFlag:'intakePlanned',hitArea:{x:8,y:8,width:5,height:5}},
      {id:'works-siding',x:31,y:35,label:'Return to the medical siding',sign:true},
    ]},
  conduit: {id:'conduit',name:'Beneath the palace · the extraction heart',subtitle:'Iron restraints. Crystal feeds. The same hum as Nell’s lantern.',width:1536,height:1024,
    solid:[[0,0,64,15],[0,15,8,27],[57,15,7,27],[8,36,13,6],[43,36,14,6],[21,41,22,1],[44,15,7,4],[8,15,8,3],[50,15,7,4]],objects:[
      {id:'heart-regulator',x:35,y:22,label:'Heart regulator · shut down the intake',sprite:'boiler-keeper',hiddenFlag:'conduitGuardWon'},
      {id:'heart-release',x:47,y:20,label:'Close the extraction feeds',sign:true,requiredFlag:'conduitGuardWon',doneFlag:'extractionStopped',hitArea:{x:44,y:13,width:7,height:7}},
      {id:'heart-gallery',x:32,y:36,label:'Return to Tomas in the gallery',sign:true},
    ]},
} satisfies Record<string,MapData>;
