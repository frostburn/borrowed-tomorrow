/** Authoring dimensions in native pixels. Motion is solved from these, never image-scaled. */
export interface RigProportions {
  legLength:number;hipHeight:number;hipRise:number;hipHalfWidth:number;
  strideDistance:number;footScale:number;swingHeight:number;
  shoulderHeight:number;shoulderHalfWidth:number;upperArmLength:number;forearmLength:number;
  carryLift:number;torsoHeight:number;headScale:number;armWidth:number;legWidth:number;
}
export const REFERENCE_PROPORTIONS:Readonly<RigProportions>={
  legLength:15,hipHeight:30.3,hipRise:2.4,hipHalfWidth:4,strideDistance:40,footScale:1,swingHeight:6,
  shoulderHeight:14,shoulderHalfWidth:10,upperArmLength:9,forearmLength:8,carryLift:0,torsoHeight:17,headScale:1,armWidth:1,legWidth:1,
};
export const NELL_PROPORTIONS:Readonly<RigProportions>={
  legLength:9,hipHeight:18.8,hipRise:.8,hipHalfWidth:3,strideDistance:24,footScale:.65,swingHeight:3.5,
  shoulderHeight:18,shoulderHalfWidth:9,upperArmLength:8,forearmLength:7,carryLift:4,torsoHeight:22,headScale:1.7,armWidth:1,legWidth:1,
};

export const ORRIN_PROPORTIONS:Readonly<RigProportions>={
  legLength:9.5,hipHeight:19.5,hipRise:.8,hipHalfWidth:4.5,strideDistance:28,footScale:.75,swingHeight:3.5,
  shoulderHeight:21,shoulderHalfWidth:11.5,upperArmLength:8,forearmLength:7,carryLift:0,torsoHeight:22,headScale:1.6,armWidth:1,legWidth:1.15,
};

export const KIT_PROPORTIONS:Readonly<RigProportions>={
  legLength:10,hipHeight:20.4,hipRise:.8,hipHalfWidth:3.5,strideDistance:26,footScale:.7,swingHeight:3.5,
  shoulderHeight:17.5,shoulderHalfWidth:9,upperArmLength:8,forearmLength:6.5,carryLift:0,torsoHeight:21,headScale:1.7,armWidth:1,legWidth:.95,
};

export const PETRA_PROPORTIONS:Readonly<RigProportions>={
  legLength:9,hipHeight:18.8,hipRise:.55,hipHalfWidth:3.5,strideDistance:24,footScale:.7,swingHeight:3,
  shoulderHeight:20,shoulderHalfWidth:8.8,upperArmLength:7.5,forearmLength:7,carryLift:0,torsoHeight:22,headScale:1.7,armWidth:1,legWidth:.85,
};
