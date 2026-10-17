import './style.css';
import { Adventure } from './game/adventure';
import { mountGame } from './game/mount';

const root=document.getElementById('app')!;
if(import.meta.env.DEV && new URLSearchParams(location.search).get('dev')==='inventory'){
  void import('./dev/inventory-workshop').then(({startInventoryWorkshop})=>startInventoryWorkshop(root));
}else{
  mountGame(root,new Adventure());
}
