/**
 * Chicken Boom Rescue - Sound & Music Manager
 * Features:
 * - 4 volume levels: 100%, 50%, 25%, 0% (Muted)
 * - Steel band tropical synthesized music for Menu (gentle) and Game (dynamic/energetic)
 * - Comprehensive cartoon arcade SFX generated via Web Audio API
 */

export type SoundVolumeLevel = 100 | 50 | 25 | 0;

class SoundManager {
  private ctx: AudioContext | null = null;
  private volumeLevel: SoundVolumeLevel = 100;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: 'none' | 'menu' | 'game' = 'none';
  private musicInterval: any = null;
  private isInitialized = false;

  constructor() {
    // Lazy init on first user gesture
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateGains();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  public resumeContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getVolumeLevel(): SoundVolumeLevel {
    return this.volumeLevel;
  }

  public cycleVolume(): SoundVolumeLevel {
    this.resumeContext();
    if (this.volumeLevel === 100) this.volumeLevel = 50;
    else if (this.volumeLevel === 50) this.volumeLevel = 25;
    else if (this.volumeLevel === 25) this.volumeLevel = 0;
    else this.volumeLevel = 100;

    this.updateGains();
    this.playClick();
    return this.volumeLevel;
  }

  private updateGains() {
    if (!this.masterGain || !this.musicGain || !this.sfxGain) return;
    const factor = this.volumeLevel / 100;
    this.masterGain.gain.setValueAtTime(factor, this.ctx?.currentTime || 0);
    this.musicGain.gain.setValueAtTime(0.35, this.ctx?.currentTime || 0);
    this.sfxGain.gain.setValueAtTime(0.65, this.ctx?.currentTime || 0);
  }

  // Steel pan note generator with characteristic overtone ring
  private playSteelPanNote(freq: number, duration: number, time: number, gainNode: GainNode) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    // Harmonic ring overtone (approx 2.5x octave + fifth)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.01, time);

    noteGain.gain.setValueAtTime(0.001, time);
    noteGain.gain.exponentialRampToValueAtTime(0.4, time + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(gainNode);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  public playMusic(track: 'menu' | 'game') {
    this.resumeContext();
    if (this.currentTrack === track) return;
    this.stopMusic();
    this.currentTrack = track;

    if (!this.ctx || !this.musicGain) return;

    if (track === 'menu') {
      this.startMenuMusic();
    } else {
      this.startGameMusic();
    }
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = 'none';
  }

  // Menu Music: Gentle, joyful Caribbean Steel Band melody
  private startMenuMusic() {
    if (!this.ctx || !this.musicGain) return;
    // C Major / Calypso style arpeggio
    const melody = [
      { f: 261.63, d: 0.25 }, // C4
      { f: 329.63, d: 0.25 }, // E4
      { f: 392.00, d: 0.25 }, // G4
      { f: 523.25, d: 0.4 },  // C5
      { f: 392.00, d: 0.25 }, // G4
      { f: 440.00, d: 0.3 },  // A4
      { f: 392.00, d: 0.25 }, // G4
      { f: 329.63, d: 0.35 }, // E4

      { f: 293.66, d: 0.25 }, // D4
      { f: 349.23, d: 0.25 }, // F4
      { f: 440.00, d: 0.25 }, // A4
      { f: 493.88, d: 0.4 },  // B4
      { f: 392.00, d: 0.25 }, // G4
      { f: 349.23, d: 0.3 },  // F4
      { f: 293.66, d: 0.3 },  // D4
      { f: 261.63, d: 0.5 },  // C4
    ];

    let noteIdx = 0;
    const intervalTime = 300; // ms per beat

    this.musicInterval = setInterval(() => {
      if (this.currentTrack !== 'menu' || !this.ctx || !this.musicGain) return;
      const cur = melody[noteIdx % melody.length];
      const now = this.ctx.currentTime;
      this.playSteelPanNote(cur.f, cur.d, now, this.musicGain);
      noteIdx++;
    }, intervalTime);
  }

  // Game Music: Dynamic, energetic steel band action with percussive syncopation
  private startGameMusic() {
    if (!this.ctx || !this.musicGain) return;
    // Faster, punchier tropical rhythm in G Major / E minor
    const pattern = [
      { f: 392.00, d: 0.18 }, // G4
      { f: 392.00, d: 0.15 }, // G4
      { f: 493.88, d: 0.2 },  // B4
      { f: 587.33, d: 0.25 }, // D5
      { f: 523.25, d: 0.18 }, // C5
      { f: 493.88, d: 0.18 }, // B4
      { f: 440.00, d: 0.25 }, // A4
      { f: 392.00, d: 0.18 }, // G4

      { f: 329.63, d: 0.18 }, // E4
      { f: 392.00, d: 0.18 }, // G4
      { f: 440.00, d: 0.2 },  // A4
      { f: 587.33, d: 0.3 },  // D5
      { f: 523.25, d: 0.2 },  // C5
      { f: 440.00, d: 0.2 },  // A4
      { f: 493.88, d: 0.25 }, // B4
      { f: 392.00, d: 0.35 }, // G4
    ];

    let noteIdx = 0;
    const intervalTime = 200; // upbeat pace

    this.musicInterval = setInterval(() => {
      if (this.currentTrack !== 'game' || !this.ctx || !this.musicGain) return;
      const cur = pattern[noteIdx % pattern.length];
      const now = this.ctx.currentTime;
      this.playSteelPanNote(cur.f, cur.d, now, this.musicGain);

      // Add a soft percussion tap on 2nd and 4th subdivisions
      if (noteIdx % 2 === 1) {
        this.playWoodBlock(now);
      }

      noteIdx++;
    }, intervalTime);
  }

  private playWoodBlock(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.05);

    g.gain.setValueAtTime(0.08, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  // --- SOUND EFFECTS (SFX) ---

  public playClick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.06);

    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playPlaceBomb() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Cute egg drop 'plop' + chick chirp
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playExplosion() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // 1. Low frequency punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);

    oscGain.gain.setValueAtTime(0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);

    // 2. White noise rumble & blast crackle
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(200, t + 0.45);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
  }

  public playCrateDestroy() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playCollectCoin() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc2.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc1.connect(g);
    osc2.connect(g);
    g.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.08);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.25);
  }

  public playCollectPowerUp() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      g.gain.setValueAtTime(0.28, t + idx * 0.06);
      g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.06 + 0.15);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.15);
    });
  }

  public playKeyFound() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Magical golden key chime
    const notes = [587.33, 739.99, 880.00, 1174.66];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      g.gain.setValueAtTime(0.35, t + idx * 0.07);
      g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.3);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.3);
    });
  }

  public playPlayerHurt() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Cartoon chick distressed squawk
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.2);

    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playEnemyDefeat() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Fox poof yip
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.25);

    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playCageRescueFanfare() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Triumphant victory fanfare (Do - Mi - Sol - DOOO!)
    const chords = [
      { f: 523.25, tOff: 0.0, dur: 0.15 },
      { f: 659.25, tOff: 0.15, dur: 0.15 },
      { f: 783.99, tOff: 0.3, dur: 0.18 },
      { f: 1046.50, tOff: 0.5, dur: 0.7 },
    ];
    chords.forEach(({ f, tOff, dur }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + tOff);
      g.gain.setValueAtTime(0.45, t + tOff);
      g.gain.exponentialRampToValueAtTime(0.01, t + tOff + dur);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + tOff);
      osc.stop(t + tOff + dur);
    });
  }

  public playGameOver() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.6);

    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }
}

export const soundManager = new SoundManager();
