import { decodeSave, type GameState } from '../rules/state';
export interface SaveRecord { slot: string; savedAt: string; state: GameState }
let connection: Promise<IDBDatabase> | undefined;
function db(): Promise<IDBDatabase> {
  return connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('borrowed-tomorrow', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('saves', { keyPath: 'slot' });
    request.onsuccess = () => { const database = request.result; database.onversionchange = () => { database.close(); connection = undefined; }; resolve(database); };
    request.onerror = () => { connection = undefined; reject(request.error); };
    request.onblocked = () => { connection = undefined; reject(new Error('Close another game tab before opening saves.')); };
  });
}
const pendingKey='borrowed-tomorrow-pending-checkpoint';
/** Keep the latest checkpoint through an immediate tab close while IndexedDB is writing. */
export function checkpoint(state:GameState){
  try{localStorage.setItem(pendingKey,JSON.stringify({slot:'autosave',savedAt:new Date().toISOString(),state}));}catch{/* IndexedDB remains the primary save store. */}
}
function pendingCheckpoint():SaveRecord|undefined{
  try{
    const raw=localStorage.getItem(pendingKey);if(!raw)return;
    const record=JSON.parse(raw);
    if(record.slot!=='autosave'||typeof record.savedAt!=='string'||!Number.isFinite(Date.parse(record.savedAt)))return;
    return {slot:'autosave',savedAt:record.savedAt,state:decodeSave(JSON.stringify(record.state))};
  }catch{return;}
}
function clearCheckpoint(state:GameState){
  try{const pending=pendingCheckpoint();if(pending&&JSON.stringify(pending.state)===JSON.stringify(state))localStorage.removeItem(pendingKey);}catch{/* Retain the pending checkpoint if storage cannot be accessed. */}
}
export async function save(slot: string, state: GameState): Promise<void> {
  const database = await db();
  const snapshot = decodeSave(JSON.stringify(state));
  return new Promise((resolve, reject) => {
    const tx = database.transaction('saves', 'readwrite');
    tx.objectStore('saves').put({ slot, state: snapshot, savedAt: new Date().toISOString() });
    tx.oncomplete = () => {if(slot==='autosave')clearCheckpoint(snapshot);resolve();}; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
}
export async function listSaves(): Promise<SaveRecord[]> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction('saves', 'readonly').objectStore('saves').getAll();
    request.onsuccess = () => {
      const pending=pendingCheckpoint(),records=request.result as SaveRecord[];
      resolve((pending?[pending,...records.filter(r=>r.slot!=='autosave')]:records).flatMap(record=>{try{return [{...record,state:decodeSave(JSON.stringify(record.state))}];}catch{return [];}}).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)));
    };
    request.onerror = () => reject(request.error);
  });
}
export function exportSave(state: GameState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'borrowed-tomorrow-save.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
