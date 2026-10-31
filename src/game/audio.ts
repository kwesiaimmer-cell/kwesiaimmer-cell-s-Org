/**
 * AIMMER HOUSE TYCOON - Procedural Web Audio Engine
 * Zero external audio files (100% procedural Web Audio API synthesis)
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Engine sound state
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning: boolean = false;

  private isMuted: boolean = false;
  private sfxVol: number = 0.8;
  private ambientVol: number = 0.5;

  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVol, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch {
      // Audio not permitted or supported
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, ambient: number) {
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.ambientVol = Math.max(0, Math.min(1, ambient));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.05);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVol, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playFootstep(isRunning: boolean = false) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const pitch = isRunning ? 90 + Math.random() * 20 : 75 + Math.random() * 15;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playHammerStrike() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    // Anvil/Wood impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    // Metal clink overlay
    const clink = this.ctx.createOscillator();
    const clinkGain = this.ctx.createGain();
    clink.type = 'triangle';
    clink.frequency.setValueAtTime(1400, now);
    clink.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    clinkGain.gain.setValueAtTime(0.18, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    clink.connect(clinkGain);
    clinkGain.connect(this.sfxGain);

    osc.start(now);
    clink.start(now);
    osc.stop(now + 0.18);
    clink.stop(now + 0.1);
  }

  public playPowerDrill() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(340, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playCoin() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(1479.98, now); // F#6
    osc2.frequency.setValueAtTime(1975.53, now + 0.08); // B6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  public playCashRegister() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    this.playCoin();
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.45);
    }, 90);
  }

  public playLevelUp() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.38);
      }, idx * 100);
    });
  }

  public playCarHorn() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(392, now); // G4
    osc2.frequency.setValueAtTime(466.16, now); // Bb4

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }

  // --- Dynamic Vehicle Engine Sound ---

  public startEngine() {
    if (!this.ctx || !this.sfxGain || this.isEngineRunning) return;
    this.resume();

    const now = this.ctx.currentTime;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.12, now);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, now);

    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = 'triangle';
    this.engineSubOsc.frequency.setValueAtTime(22.5, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    this.engineOsc.connect(filter);
    this.engineSubOsc.connect(filter);
    filter.connect(this.engineGain);

    this.engineOsc.start(now);
    this.engineSubOsc.start(now);
    this.isEngineRunning = true;
  }

  public updateEngine(speedFraction: number) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc || !this.engineGain) return;
    const now = this.ctx.currentTime;
    const baseFreq = 45 + speedFraction * 130;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.08);
    }
    const vol = 0.08 + speedFraction * 0.15;
    this.engineGain.gain.setTargetAtTime(vol, now, 0.08);
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      }
      if (this.engineSubOsc) {
        this.engineSubOsc.stop();
        this.engineSubOsc.disconnect();
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
      }
    } catch {
      // Ignored
    }
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineGain = null;
    this.isEngineRunning = false;
  }
}

export const sound = new SoundEngine();
