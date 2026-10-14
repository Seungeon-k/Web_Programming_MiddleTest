export class Sound {
  constructor() { this.enabled = false; this.context = null; }

  async toggle() {
    if (this.enabled) { this.enabled = false; return false; }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context ||= new AudioContext();
      await this.context.resume();
      this.enabled = true;
      this.pop(0);
    } catch { this.enabled = false; }
    return this.enabled;
  }

  tone(from, to, duration, delay = 0, volume = .05, type = 'sine') {
    if (!this.enabled || this.context?.state !== 'running') return;
    const ctx = this.context;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    gain.gain.setValueAtTime(.001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .018);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain);gain.connect(ctx.destination);
    oscillator.start(start);oscillator.stop(start + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  pop(index) { this.tone(230 + index * 70, 720 + index * 85, .2, 0, .035); }
  boot() { this.tone(100, 480, .4, 0, .025, 'triangle'); }
  finale() {
    [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => this.tone(note, note * 1.01, .38, i * .09, .025, 'triangle'));
  }
}
