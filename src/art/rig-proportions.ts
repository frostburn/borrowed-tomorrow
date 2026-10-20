/** Authoring dimensions in native pixels. Motion is solved from these, never image-scaled. */
export interface RigProportions {
  legLength:number;hipHeight:number;hipRise:number;hipHalfWidth:number;
  strideDistance:number;footScale:number;swingHeight:number;
  shoulderHeight:number;shoulderHalfWidth:number;upperArmLength:number;forearmLength:number;
  carryLift:number;torsoHeight:number;headScale:number;
}
export const REFERENCE_PROPORTIONS:Readonly<RigProportions>={
  legLength:15,hipHeight:30.3,hipRise:2.4,hipHalfWidth:4,strideDistance:40,footScale:1,swingHeight:6,
  shoulderHeight:14,shoulderHalfWidth:10,upperArmLength:9,forearmLength:8,carryLift:0,torsoHeight:17,headScale:1,
};
export const NELL_PROPORTIONS:Readonly<RigProportions>={
  legLength:9,hipHeight:18.8,hipRise:.8,hipHalfWidth:3,strideDistance:24,footScale:.65,swingHeight:3.5,
  shoulderHeight:18,shoulderHalfWidth:8,upperArmLength:7,forearmLength:6,carryLift:1,torsoHeight:22,headScale:1.7,
};
