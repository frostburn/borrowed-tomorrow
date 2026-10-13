type Mode = 'station' | 'yard' | 'tunnel' | 'battle' | 'ending';
/** A look-ahead sequencer: music timing is independent of frame rate. */
export class Audio {
  private context?: AudioContext;
  private gain?: GainNode;
  private timer?: number;
  private next = 0;
  private step = 0;
  private mode: Mode = 'station';
  enabled = false;
  async toggle(): Promise<boolean> {
    if (!this.context) { this.context = new AudioContext(); this.gain = this.context.createGain(); this.gain.connect(this.context.destination); this.gain.gain.value = 0; }
    await this.context.resume(); this.enabled = !this.enabled;
    this.gain!.gain.setTargetAtTime(this.enabled ? 0.16 : 0, this.context.currentTime, 0.1);
    if (!this.timer) { this.next = this.context.currentTime + 0.05; this.timer = window.setInterval(() => this.schedule(), 25); }
    return this.enabled;
  }
  setMode(mode: Mode) { this.mode = mode; }
  private note(midi: number, when: number, duration: number, volume: number, type: OscillatorType = 'triangle', pan = 0) {
    const c = this.context!; const oscillator = c.createOscillator(), envelope = c.createGain(), panner = c.createStereoPanner();
    oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12); panner.pan.value = pan;
    oscillator.connect(envelope); envelope.connect(panner); panner.connect(this.gain!);
    envelope.gain.setValueAtTime(0, when); envelope.gain.linearRampToValueAtTime(volume, when + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.001, when + duration);
    oscillator.start(when); oscillator.stop(when + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); panner.disconnect(); };
  }
  private schedule() {
    if (!this.context || !this.enabled || this.context.state !== 'running') { if (this.context) this.next = this.context.currentTime + 0.05; return; }
    const c = this.context;
    if (this.next < c.currentTime) this.next = c.currentTime + 0.03;
    const combat = this.mode === 'battle'; const interval = combat ? 0.19 : 0.29;
    const melody = [74, null, 77, 76, 74, null, 69, null, 72, null, 74, 77, 76, null, 72, null,
      69, null, 72, 74, 77, null, 81, 79, 77, 76, 74, null, 72, null, 69, null];
    while (this.next < c.currentTime + 0.13) {
      const n = this.step % 32; const phrase = Math.floor(this.step / 32) % 4;
      const roots = [50, 46, 53, 48]; const root = roots[Math.floor(n / 8)];
      if (n % 4 === 0) this.note(root - 12, this.next, interval * 3.8, 0.34, 'triangle', -0.15);
      if (n % 2 === 0) this.note(root + [0,7,12,7][Math.floor(n/2)%4], this.next, interval * 2.5, this.mode === 'tunnel' ? 0.05 : 0.12, 'sine', 0.4);
      const pitch = melody[n];
      if (pitch !== null && (phrase !== 2 || n > 15)) this.note(pitch + (this.mode === 'ending' ? 12 : 0), this.next, interval * (n % 4 ? 1.8 : 2.8), combat ? 0.21 : 0.14, phrase === 1 ? 'sine' : 'triangle', -0.3);
      if (combat && n % 2 === 0) this.note(n % 4 ? 39 : 33, this.next, 0.07, 0.2, 'sawtooth');
      this.next += interval; this.step++;
    }
  }
  effect(kind: 'hit' | 'move' | 'heal' | 'win' | 'click') {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    if (kind === 'win') [62,65,69,74].forEach((n,i) => this.note(n, now + i * 0.12, 0.45, 0.35));
    else if (kind === 'heal') [74,77,81].forEach((n,i) => this.note(n, now + i * 0.06, 0.22, 0.2, 'sine'));
    else this.note(kind === 'hit' ? 38 : kind === 'move' ? 55 : 79, now, kind === 'hit' ? 0.18 : 0.05, 0.16, kind === 'hit' ? 'sawtooth' : 'triangle');
  }
}
