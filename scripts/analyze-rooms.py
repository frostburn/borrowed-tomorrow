"""Analytical audit of the retro room network, not a native-browser recording.
Requires NumPy/SciPy. Run: python3 scripts/analyze-rooms.py --output /tmp/retro-rooms.json
Uses production profiles, delays and one-pole coefficients at 44.1/48 kHz.
"""
import argparse,json,subprocess
from pathlib import Path
import numpy as np
from scipy.signal import fftconvolve

ROOT=Path(__file__).resolve().parents[1]
NODE=r'''
import ts from 'typescript';import {readFileSync} from 'node:fs';
const load=async(path)=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022}}).outputText).toString('base64'));
const {ROOMS}=await load('src/content/rooms.ts');
const {ROOM_DELAYS,reflectionCoefficients}=await load('src/game/room-dsp.ts');
console.log(JSON.stringify({rooms:ROOMS,delays:ROOM_DELAYS,coefficients:Object.fromEntries([44100,48000].map(rate=>[rate,Object.fromEntries(Object.entries(ROOMS).map(([id,p])=>[id,reflectionCoefficients(rate,p.damping)]))]))}));
'''

def response(profile,delays,coefficients,rate,f,ch):
 z=np.exp(-2j*np.pi*f/rate)
 loss=coefficients['feedforward'][0]/(1+coefficients['feedback'][1]*z)
 h=np.ones_like(z);g=profile['feedback']
 for i,t in enumerate(delays):
  samples=t*profile['size']*(1.071+i*.009 if ch else 1)*rate
  whole=np.floor(samples);frac=samples-whole;d=z**whole*(1-frac+frac*z)
  h*=(loss*d-g)/(1-g*loss*d)
 return h

def audit(data):
 rows=[];n=131072
 for rate in [44100,48000]:
  f=np.fft.rfftfreq(n,1/rate)
  for id,p in data['rooms'].items():
   if not p['wet']:continue
   coeff=data['coefficients'][str(rate)][id]
   h=[response(p,data['delays'],coeff,rate,f,ch)for ch in [0,1]]
   ir=[np.fft.irfft(x,n)for x in h]
   for x in ir:assert np.sum(x[-rate:]**2)<np.sum(x*x)*1e-8
   bands={hz:float(10*np.log10(np.mean([abs(x[(f>=hz/2**(1/12))&(f<=hz*2**(1/12))])**2 for x in h])))for hz in [200,400,1000,2000,4000,6500]}
   probes=[]
   for hz in [82,110,165,220,330,400,700,1000,1600,2500,4000,6500]:
    t=np.arange(int(rate*.2))/rate;tone=.15*np.sin(2*np.pi*hz*t)*np.minimum(np.minimum(t/.01,(.2-t)/.01),1)
    for ch,x in enumerate(ir):
     y=fftconvolve(tone,x)[:n];energy=y*y;start=int(.22*rate);tail=energy[start:];total=tail.sum()
     probes.append({'hz':hz,'channel':ch,'t999':float((np.searchsorted(np.cumsum(tail),total*.999)+start)/rate-.2),'late_fraction':float(energy[int(.7*rate):].sum()/total),'wet_tail_energy':float(total/rate*p['wet']**2)})
   rows.append({'id':id,'rate':rate,'relative_band_db':bands,'probes':probes})
 return rows

if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--output',type=Path,default=Path('/tmp/retro-rooms.json'));args=ap.parse_args()
 data=json.loads(subprocess.check_output(['node','--input-type=module','-e',NODE],cwd=ROOT,text=True));rows=audit(data)
 args.output.write_text(json.dumps({'production':data,'results':rows},indent=2)+'\n')
 for r in rows:print(r['rate'],r['id'],'midrange tilt',round(max(r['relative_band_db'][hz]for hz in [200,400,1000,2000])-min(r['relative_band_db'][hz]for hz in [200,400,1000,2000]),2),'dB; max channel t999',round(max(p['t999']for p in r['probes']),3),'s; late fraction',round(max(p['late_fraction']for p in r['probes']),5))
