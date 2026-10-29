import {type C,poly,rect,line,oval} from './crossing-drawing';
import {surveyShip} from './airfield-crossing-art';
import {floatingCapital} from './refuge-crossing-art';
import {paintEndingPerson as person} from './ending-cast';

function sky(c:C,t:number){
 rect(c,'#344e61',0,0,512,288);
 poly(c,'#647e87',[[0,89],[112,65],[220,85],[344,58],[512,77],[512,168],[0,168]]);
 poly(c,'#a8b3a6',[[0,147],[104,124],[226,146],[367,114],[512,130],[512,220],[0,220]]);
 for(let i=0;i<5;i++){
  const x=(i*139-t*6+700)%700-100;
  poly(c,'#81999a',[[x,229],[x+41,213+i*3],[x+78,222+i*3],[x+139,211+i*3],[x+171,240],[x,248]]);
 }
}
function clouds(c:C,p:number,t:number){
 sky(c,t);
 // Only smoke and scattered metal remain. No survivors, intact fleet or god form.
 for(let i=0;i<5;i++){
  const drift=(t*.06+i/5)%1;
  c.save();c.globalAlpha=(1-drift)*.28;
  oval(c,'#5a7075',45+i*11-drift*18,230-drift*70-i*4,12+drift*16,9+drift*12);
  c.restore();
 }
 for(const [x,y]of [[43,233],[73,244],[110,235]]){
  const fall=(p*31+y)%38;
  poly(c,'#5a6b6b',[[x-p*12,y+fall],[x+8-p*12,y+fall-2],[x+5-p*12,y+fall+3]]);
 }
 // A rigid hull glides through cloud; propellers turn in their own nacelles.
 c.save();c.translate(79+p*37,57+Math.sin(t*.9)*1.1);c.scale(.48,.48);surveyShip(c,t*12);c.restore();
 poly(c,'#9eafa5',[[0,278],[56,265],[102,275],[161,262],[222,280],[265,271],[310,288],[0,288]]);
}
function berth(c:C,_p:number,t:number){
 rect(c,'#34534f',0,0,512,288);
 poly(c,'#526b5b',[[0,0],[512,0],[512,34],[302,21],[149,27],[0,45]]);
 // The clouds pass a fixed window. The patient's body and cot stay still.
 c.save();c.beginPath();c.rect(163,41,294,104);c.clip();
 rect(c,'#68848b',163,41,294,104);
 for(let i=0;i<4;i++){
  const x=124+i*109-t*11;
  poly(c,'#a0b1a5',[[x,123],[x+34,104],[x+64,115],[x+98,101],[x+140,124],[x+140,151],[x,151]]);
 }
 c.restore();
 line(c,'#b7b18c',5,[[160,148],[160,38],[460,38],[460,148],[160,148]]);
 line(c,'#526e65',3,[[309,41],[309,145]]);
 poly(c,'#6a7b66',[[0,225],[512,205],[512,288],[0,288]]);
 for(const y of [237,260,285])line(c,'#829078',1,[[0,y],[512,y-15]]);
 // A single complete portable cot, matching the native Nell-bed construction.
 poly(c,'#9c8969',[[109,174],[322,176],[349,227],[344,244],[120,251],[109,232]]);
 poly(c,'#c5c6aa',[[116,174],[321,178],[343,229],[121,234]]);
 poly(c,'#ded4b1',[[126,180],[179,178],[191,223],[128,227]]);
 // The shared head and collar rest on the pillow; arms/body stay under the cover.
 // Clip the covered figure so a standing sleeve cannot stick out behind the cot.
 c.save();c.beginPath();c.moveTo(122,174);c.lineTo(198,178);c.lineTo(211,214);c.lineTo(201,232);c.lineTo(122,234);c.closePath();c.clip();
 c.translate(303,205);c.rotate(-Math.PI/2);person(c,'nell',0,0,1.6);c.restore();
 poly(c,'#607e7c',[[201,184],[319,183],[329,204],[334,229],[204,232],[190,218]]);
 poly(c,'#aab9a3',[[201,184],[319,183],[322,197],[199,197]]);
 poly(c,'#486965',[[204,213],[327,211],[334,229],[204,232],[190,218]]);
 line(c,'#819b8c',2,[[201,205],[324,203]]);
 poly(c,'#687e78',[[120,234],[344,229],[344,244],[120,251]]);
 line(c,'#b8b493',3,[[121,234],[344,229]]);
 for(const [x,y]of [[125,249],[334,244]])poly(c,'#526a69',[[x,y],[x+9,y],[x+8,y+15],[x+1,y+15]]);
 // Kit keeps the chair beside the berth. His hands stay in his lap.
 poly(c,'#66725e',[[362,229],[417,228],[427,240],[357,243]]);
 poly(c,'#4c6558',[[359,242],[366,242],[365,264],[359,264]]);
 poly(c,'#4c6558',[[415,239],[422,239],[423,260],[417,261]]);
 person(c,'kit',393,250,1.12,false,undefined,{sit:1});
 person(c,'celia',88,246,.96);
 // The lantern remains separated from Nell; moving it has not cured her.
 poly(c,'#8b8061',[[16,221],[69,217],[79,226],[18,232]]);
 for(const x of [24,66])line(c,'#5c6f5b',4,[[x,230],[x,258]]);
 line(c,'#b79b65',2,[[38,202],[39,193],[47,191],[51,200]]);
 poly(c,'#927b54',[[37,202],[51,201],[55,219],[34,220]]);
 poly(c,'#dfc68f',[[40,205],[49,204],[52,216],[38,217]]);
 // An ordinary cabin lamp sways on its joint; no breathing/stretching effect.
 c.save();c.translate(124,14);c.rotate(Math.sin(t*.95)*.025);
 line(c,'#b49c70',2,[[0,0],[0,35]]);
 poly(c,'#d8c496',[[-8,36],[-5,29],[5,29],[8,36],[6,46],[-6,46]]);c.restore();
}
function capital(c:C,p:number,t:number){
 sky(c,t);
 // Reuse the same airborne white-marble city, growing only with the approach.
 floatingCapital(c,352,102,.8+p*.035);
 // The bow is still approaching: the landing bridge has not unfolded or sealed.
 poly(c,'#617b70',[[0,243],[242,211],[371,225],[512,251],[512,288],[0,288]]);
 poly(c,'#83917a',[[0,242],[242,208],[374,222],[512,248],[512,256],[371,231],[243,219],[0,253]]);
 for(const y of [248,269,287])line(c,'#9b9e80',1,[[0,y],[241,y-28],[512,y+4]]);
 // Both companions remain at a fixed scale and foot position on the foredeck.
 person(c,'orrin',151,257,.66,true);
 person(c,'petra',233,255,.67,true);
 line(c,'#c1b48b',3,[[0,265],[255,235],[512,262]]);
 for(const [x,y]of [[20,264],[89,255],[284,238],[422,253]])line(c,'#57786d',4,[[x,y+22],[x,y]]);
 // Rigging frames the view without crossing the faces or the palace crest.
 line(c,'#718d83',2,[[32,0],[58,221]]);
 line(c,'#718d83',2,[[489,0],[461,231]]);
 poly(c,'#36554e',[[4,264],[58,257],[85,288],[0,288]]);
}
export function mooringCrossingShot(c:C,index:number,p:number,t:number){
 if(index===0)clouds(c,p,t);else if(index===1)berth(c,p,t);else capital(c,p,t);
}
