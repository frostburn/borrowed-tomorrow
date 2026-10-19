import './style.css';
import { Adventure } from './game/adventure';
import { mountGame } from './game/mount';

const root=document.getElementById('app')!;
if(import.meta.env.DEV && ['workshop','inventory','music','sprites'].includes(new URLSearchParams(location.search).get('dev') ?? '')){
  void import('./dev/workshop').then(({startWorkshop})=>startWorkshop(root));
}else{
  mountGame(root,new Adventure());
}
