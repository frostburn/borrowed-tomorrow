/** A 30Hz presentation clock driven by requestAnimationFrame timestamps.
 * Preserve the phase after late frames instead of adding drawing time to every
 * interval. Skip missed slots on a slow/backgrounded tab; never catch up in bursts.
 */
export class FrameCadence {
  private next?:number;
  reset(){this.next=undefined;}
  due(time:number){
    const interval=1000/30,tolerance=.5;
    if(this.next===undefined){this.next=time+interval;return true;}
    if(time+tolerance<this.next)return false;
    this.next+=interval*(1+Math.max(0,Math.floor((time-this.next+tolerance)/interval)));
    return true;
  }
}
