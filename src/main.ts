import './style.css';
import { Adventure } from './game/adventure';
import { mountGame } from './game/mount';

const root=document.getElementById('app')!;
if(import.meta.env.DEV && ['combat','workshop','inventory','music','sprites','animation','maps','boss'].includes(new URLSearchParams(location.search).get('dev') ?? '')){
  void import('./dev/workshop').then(({startWorkshop})=>startWorkshop(root));
}else{
  mountGame(root,new Adventure());
}
