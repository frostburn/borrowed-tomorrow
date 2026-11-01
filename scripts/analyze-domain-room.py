"""Offline analytical audit of the production room coefficients (NumPy/SciPy).
Run: python3 scripts/analyze-domain-room.py --output /tmp/domain-room-audit
Plots additionally use Matplotlib. No packages or audio assets are shipped.
"""
import argparse,json,subprocess
from pathlib import Path
import numpy as np
from scipy.signal import fftconvolve

ROOT=Path(__file__).resolve().parents[1]
BASELINE='ec331478d841646ceb8608bde73e11a6dad2fb07'
NODE=r'''
import ts from 'typescript';import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
const load=async(source)=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const beforeText=execFileSync('git',['show',process.argv[1]+':src/content/rooms.ts'],{encoding:'utf8'});
const oldGraph=execFileSync('git',['show',process.argv[1]+':src/game/room-reverb.ts'],{encoding:'utf8'});
if(!oldGraph.includes('Math.min(damping,1800)')||!oldGraph.includes('[(1-pole)**2]'))throw Error('Baseline is not the legacy fully absorbed graph');
const before=(await load(beforeText)).ROOMS.domain,after=(await load(readFileSync('src/content/rooms.ts','utf8'))).ROOMS.domain;
const {ROOM_DELAYS,reflectionCoefficients}=await load(readFileSync('src/game/room-dsp.ts','utf8'));
const oldDelays=JSON.parse(oldGraph.match(/const delays=(\[[^;]+\]);/)[1].replace(/\[\./g,'[0.').replace(/,\./g,',0.'));
if(JSON.stringify(oldDelays)!==JSON.stringify(ROOM_DELAYS))throw Error('Audit needs the baseline delay geometry');
const states={};for(const [name,p]of Object.entries({before,after})){
 states[name]={...p,rates:{}};
 for(const rate of [44100,48000]){
  const r=p.reflection??{cutoff:Math.min(p.damping,1800),amount:1};
  states[name].rates[rate]={...reflectionCoefficients(rate,r.cutoff,r.amount),delays:[0,1].map(ch=>ROOM_DELAYS.map((t,i)=>t*p.size*(ch?1.071+i*.009:1)*rate))};
 }
}
console.log(JSON.stringify(states));
'''

def response(p,rate,f,ch):
 z=np.exp(-2j*np.pi*f/rate);co=p['rates'][str(rate)]
 poly=lambda values:sum(v*z**i for i,v in enumerate(values))
 loss=poly(co['feedforward'])/poly(co['feedback']);h=np.ones_like(z)
 for samples in co['delays'][ch]:
  whole=np.floor(samples);frac=samples-whole;delay=z**whole*(1-frac+frac*z)
  h*=(loss*delay-p['feedback'])/(1-p['feedback']*loss*delay)
 def biquad(cutoff,high,q):
  w=2*np.pi*cutoff/rate;c=np.cos(w);a=np.sin(w)/(2*10**(q/20));b=(1+c)/2 if high else (1-c)/2
  return (b+(-2*b if high else 2*b)*z+b*z*z)/(1+a-2*c*z+(1-a)*z*z)
 h*=biquad(p['damping'],False,p.get('returnQ',.5))
 if p.get('lowCut'):h*=biquad(p['lowCut'],True,20*np.log10(np.sqrt(.5)))
 return p['wet']*h

def audit(states):
 results={};n=262144
 def tail_metrics(energy,rate,stop):
  start=int((stop+.02)*rate);tail=energy[start:];total=tail.sum()
  return {'tail_energy':float(total/rate),'t999_seconds':float((np.searchsorted(np.cumsum(tail),total*.999)+start)/rate-stop),'late_fraction_after_half_second':float(energy[int((stop+.5)*rate):].sum()/total)}
 for rate in [44100,48000]:
  f=np.fft.rfftfreq(n,1/rate);results[rate]={}
  for name,p in states.items():
   wet=[response(p,rate,f,ch)for ch in [0,1]];irs=[np.fft.irfft(h,n)for h in wet]
   # A finite impulse horizon must not wrap appreciable energy into the start.
   for ir in irs:assert np.sum(ir[-rate:]**2)<np.sum(ir**2)*1e-8
   bands={}
   for hz in [100,200,400,1000,2000,3000,4000]:
    mask=(f>=hz/2**(1/12))&(f<=hz*2**(1/12))
    bands[hz]=float(10*np.log10(np.mean([abs(h[mask])**2 for h in wet])))
   probes=[]
   for hz in [82,110,165,220,330,400,700,1000,1600,2500,4000,6500]:
    t=np.arange(int(rate*.2))/rate;source=.15*np.sin(2*np.pi*hz*t)*np.minimum(np.minimum(t/.01,(.2-t)/.01),1)
    signals=[fftconvolve(source,ir)[:n]for ir in irs]
    probes.append({'hz':hz,**tail_metrics(sum(y*y for y in signals),rate,.2),'channels':[tail_metrics(y*y,rate,.2)for y in signals]})
   impulse=sum(ir*ir for ir in irs);start=int(.001*rate);total=impulse[start:].sum()
   results[rate][name]={'band_gain_db':bands,'probes':probes,'impulse':{'t999_seconds':float((np.searchsorted(np.cumsum(impulse[start:]),total*.999)+start)/rate),'late_fraction_after_second':float(impulse[rate:].sum()/total)}}
 return results

def plot(states,results,path):
 import matplotlib;matplotlib.use('Agg')
 import matplotlib.pyplot as plt
 from matplotlib.ticker import FuncFormatter
 plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False})
 fig,axes=plt.subplots(1,2,figsize=(13,5.6));fig.subplots_adjust(top=.78,bottom=.23,wspace=.24)
 colours={'before':'#c4762e','after':'#2467b0'};freq=np.geomspace(20,16000,1500)
 for name,p in states.items():
  power=[]
  for centre in freq:
   band=np.linspace(centre/2**(1/12),centre*2**(1/12),160)
   power.append(np.mean([abs(response(p,48000,band,ch))**2 for ch in [0,1]]))
  axes[0].semilogx(freq,10*np.log10(power),label=name.capitalize(),color=colours[name],lw=2)
  probes=[r for r in results[48000][name]['probes']if r['hz']<=400]
  axes[1].plot([r['hz']for r in probes],[r['t999_seconds']for r in probes],'o-',color=colours[name],label=name.capitalize())
 axes[0].set(xlim=(20,16000),ylim=(-65,-8),xlabel='Frequency (Hz)',ylabel='Wet return vs dry (dB)',title='Room return · 1/6-octave power mean')
 axes[0].set_xticks([20,50,100,200,500,1000,2000,5000,10000]);axes[0].xaxis.set_major_formatter(FuncFormatter(lambda x,pos:f'{x/1000:g}k'if x>=1000 else f'{x:g}'))
 axes[1].set(xlabel='Probe frequency (Hz)',ylabel='Time after source stops (s)',ylim=(0,1.7),title='Bass tail · 99.9% energy cleared')
 for ax in axes:ax.grid(alpha=.22);ax.legend()
 fig.text(.07,.92,'Hollow Domain — damping retune',fontsize=22,weight='bold')
 fig.text(.07,.85,'Analytical production-coefficient comparison at 48 kHz; 44.1 kHz checked separately.',fontsize=11,color='#526377')
 fig.text(.07,.12,'Tail probes are normalized independently of wet volume. The dry path and input compressor are unchanged.',fontsize=10)
 fig.text(.07,.075,'Model: fractional-delay linear interpolation and Web Audio biquad coefficients. Not a native-browser recording.',fontsize=10,color='#526377')
 fig.savefig(path,dpi=180)

if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--baseline',default=BASELINE);ap.add_argument('--output',type=Path,default=Path('/tmp/domain-room-audit'));ap.add_argument('--no-plot',action='store_true');args=ap.parse_args()
 states=json.loads(subprocess.check_output(['node','--input-type=module','-e',NODE,args.baseline],cwd=ROOT,text=True));results=audit(states)
 args.output.mkdir(parents=True,exist_ok=True);(args.output/'metrics.json').write_text(json.dumps({'baseline':args.baseline,'profiles':states,'results':results},indent=2)+'\n')
 for rate,rows in results.items():
  for name,row in rows.items():
   bass=[r for r in row['probes']if r['hz']<=400]
   channels=[c for r in bass for c in r['channels']]
   print(rate,name,'max bass t999 (stereo / channel)',round(max(r['t999_seconds']for r in bass),3),round(max(r['t999_seconds']for r in channels),3),'max channel late fraction',round(max(r['late_fraction_after_half_second']for r in channels),4),'400Hz / 2kHz dB',round(row['band_gain_db'][400],2),round(row['band_gain_db'][2000],2),'impulse',row['impulse'])
 if not args.no_plot:plot(states,results,args.output/'comparison.png')
