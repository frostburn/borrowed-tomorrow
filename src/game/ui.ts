import type { Choice, Dialogue } from '../content/disk-a/story';
import { portraitAsset, speakerPortrait } from '../content/characters';
const esc = (v: unknown) => String(v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]!));
export const art = (name: string) => `${import.meta.env.BASE_URL}art/${name}.png`;
export interface Button { label: string; action: () => void; disabled?: boolean; selected?: boolean; key?: string; title?: string }
export class UI {
  readonly canvas: HTMLElement;
  readonly controls: HTMLElement;
  readonly initiative: HTMLElement;
  readonly sceneLayer: HTMLElement;
  readonly modal: HTMLElement;
  readonly status: HTMLElement;
  readonly battlePan: HTMLElement;
  private dialogue?: Dialogue;
  private lineIndex = 0;
  private onLine?: (index:number)=>void;
  private modalReturn?: HTMLElement;
  private toastTimer?: number;
  constructor(root: HTMLElement, callbacks: { journal: () => void; saves: () => void; sound: () => void; help: () => void; pan: (direction:-1|1)=>void }) {
    root.innerHTML = `<main class="game-shell">
      <header class="topbar"><div class="brand"><h1>Borrowed Tomorrow</h1><span id="location">The Wrong Platform</span></div>
      <nav aria-label="Game menu"><button id="journal-button">Journal</button><button id="save-button">Save</button><button id="sound-button" aria-pressed="false">Sound off</button><button id="help-button" aria-label="Controls and combat help">?</button></nav></header>
      <div class="initiative" id="initiative"></div>
      <section class="stage-wrap" aria-label="Game world"><div id="canvas" tabindex="0" aria-label="Explore with arrow keys or WASD. E to interact. In battle use pointer or arrow keys to choose a hex."></div><div id="battle-pan" class="battle-pan" hidden aria-label="Battlefield view"><button id="pan-left" aria-label="Pan battlefield left">←</button><button id="pan-right" aria-label="Pan battlefield right">→</button></div><div id="scene-layer" class="scene-layer"></div></section>
      <section class="controls" id="controls" aria-label="Adventure controls"></section>
      <footer><span id="status">Loading the railway…</span><a href="https://github.com/frostburn/borrowed-tomorrow/issues" target="_blank" rel="noopener">Report a bug</a></footer>
    </main><div id="modal" class="modal-backdrop" hidden></div><div id="toast" class="toast" role="status" hidden></div>`;
    const get = (id: string) => document.getElementById(id)!;
    this.canvas = get('canvas'); this.controls = get('controls'); this.initiative = get('initiative'); this.sceneLayer = get('scene-layer'); this.modal = get('modal'); this.status = get('status');this.battlePan=get('battle-pan');
    get('journal-button').onclick = callbacks.journal; get('save-button').onclick = callbacks.saves;
    get('sound-button').onclick = callbacks.sound; get('help-button').onclick = callbacks.help;
    get('pan-left').onclick=()=>callbacks.pan(-1);get('pan-right').onclick=()=>callbacks.pan(1);
    this.modal.addEventListener('click', event => { if (event.target === this.modal) this.closeModal(); });
    document.addEventListener('keydown', e => {
      if (this.modal.hidden || e.key !== 'Tab') return;
      const buttons = [...this.modal.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]')];
      if (!buttons.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  location(name: string) { document.getElementById('location')!.textContent = name; }
  sound(enabled: boolean) { const button = document.getElementById('sound-button')!; button.textContent = enabled ? 'Sound on' : 'Sound off'; button.setAttribute('aria-pressed', String(enabled)); }
  button(b: Button): HTMLButtonElement {
    const button = document.createElement('button'); button.textContent = b.key ? `${b.key}  ${b.label}` : b.label;
    button.disabled = !!b.disabled; button.className = b.selected ? 'selected' : ''; if (b.title) button.setAttribute('aria-description', b.title);
    button.onclick = () => { b.action(); }; return button;
  }
  actionRow(target: HTMLElement, buttons: Button[]) { for (const b of buttons) target.append(this.button(b)); }
  panel(title: string, content: string, buttons: Button[] = []) {
    this.dialogue = undefined;this.onLine=undefined;this.sceneLayer.classList.remove('cinematic');
    this.sceneLayer.innerHTML = `<section class="scene-panel"><h2>${esc(title)}</h2><div class="panel-content">${content}</div><div class="panel-actions"></div></section>`;
    this.actionRow(this.sceneLayer.querySelector<HTMLElement>('.panel-actions')!, buttons);
  }
  clearPanel() { this.dialogue = undefined; this.onLine=undefined;this.sceneLayer.classList.remove('cinematic');this.sceneLayer.innerHTML = ''; }
  showDialogue(dialogue: Dialogue,onLine?:(index:number)=>void) { this.dialogue = dialogue; this.onLine=onLine;this.lineIndex = 0; this.drawDialogue(); }
  private drawDialogue() {
    const d = this.dialogue!; const line = d.lines[this.lineIndex];
    const last = this.lineIndex === d.lines.length - 1;
    this.onLine?.(this.lineIndex);this.sceneLayer.classList.toggle('cinematic',!!d.scene);
    const portrait=line.portrait?portraitAsset(line.portrait):speakerPortrait(line.who);
    this.sceneLayer.innerHTML = `<section class="dialogue" aria-label="Dialogue"><div class="dialogue-portrait">${portrait ? `<img src="${art(portrait)}" alt="${esc(line.who)}"/>` : '<span class="ticket-mark">BT</span>'}</div><div class="dialogue-copy"><h2>${esc(line.who)}</h2><p>${esc(line.text)}</p><div class="dialogue-actions"></div></div><span class="dialogue-page">${this.lineIndex + 1} / ${d.lines.length}</span></section>`;
    const buttons = this.sceneLayer.querySelector<HTMLElement>('.dialogue-actions')!;
    if(d.scene){
      const bar=document.createElement('div');bar.className='cinema-bar';bar.innerHTML=`<span>${esc(d.scene.title)}</span>`;
      bar.append(this.button({label:'Skip scene',action:()=>this.skipDialogue()}));this.sceneLayer.prepend(bar);
      const insert=line.shot?.document;
      if(insert){
        const paper=document.createElement('article');paper.className='cinema-document';paper.innerHTML=`<h3>${esc(insert.heading)}</h3>${insert.lines.map(t=>`<p>${esc(t)}</p>`).join('')}${insert.stamp?`<strong>${esc(insert.stamp)}</strong>`:''}`;
        if(insert.signature){
          const signatures=document.createElement('div');signatures.className='signatures';
          for(const label of insert.compare?['EARLY COPY','JUST SIGNED']:['']){
          const signature=document.createElement('canvas');signature.width=192;signature.height=32;signature.setAttribute('aria-label','Nell’s receipt signature');
          const ctx=signature.getContext('2d')!;ctx.strokeStyle='#382c29';ctx.lineWidth=2;
          ctx.beginPath();for(const [i,[x,y]] of [[8,25],[15,5],[23,25],[33,4],[28,24],[44,17],[48,22],[39,25],[45,11],[55,25],[63,6],[57,24],[71,6],[65,25],[88,21],[82,28],[163,25]].entries())if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);ctx.stroke();
          if(insert.compare){const copy=document.createElement('div');copy.className='signature-copy';copy.innerHTML=`<span>${esc(label)}</span>`;copy.append(signature);signatures.append(copy);}else signatures.append(signature);
          }paper.append(signatures);
        }
        this.sceneLayer.insertBefore(paper,this.sceneLayer.querySelector('.dialogue'));
      }
    }
    if (last && d.choices) this.actionRow(buttons, d.choices.map((c: Choice) => ({ label: c.label, action: () => { this.clearPanel(); c.action(); } })));
    else buttons.append(this.button({ label: last ? 'Continue' : 'Next', key: '↵', action: () => this.advanceDialogue() }));
  }
  advanceDialogue() {
    const d = this.dialogue; if (!d) return;
    if (this.lineIndex < d.lines.length - 1) { this.lineIndex++; this.drawDialogue(); }
    else if (!d.choices) { this.clearPanel(); d.done?.(); }
  }
  skipDialogue(){
    const d=this.dialogue;if(!d?.scene)return;
    if(d.choices){this.lineIndex=d.lines.length-1;this.drawDialogue();}
    else{this.clearPanel();d.done?.();}
  }
  get dialogueOpen() { return !!this.dialogue; }
  get panelOpen() { return this.sceneLayer.childElementCount > 0; }
  get modalOpen() { return !this.modal.hidden; }
  showModal(title: string, content: string, buttons: Button[] = []) {
    this.modalReturn = document.activeElement as HTMLElement;
    this.modal.hidden = false;
    this.modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">${esc(title)}</h2><button class="close-modal" aria-label="Close">×</button></header><div class="modal-content">${content}</div><div class="modal-actions"></div></section>`;
    this.modal.querySelector<HTMLButtonElement>('.close-modal')!.onclick = () => this.closeModal();
    this.actionRow(this.modal.querySelector('.modal-actions')!, buttons);
    this.modal.querySelector<HTMLElement>('button')?.focus();
  }
  closeModal() { this.modal.hidden = true; this.modal.innerHTML = ''; this.modalReturn?.focus(); }
  toast(message: string) {
    const node = document.getElementById('toast')!; node.textContent = message; node.hidden = false;
    window.clearTimeout(this.toastTimer); this.toastTimer = window.setTimeout(() => { node.hidden = true; }, 4000);
  }
  escape = esc;
}
