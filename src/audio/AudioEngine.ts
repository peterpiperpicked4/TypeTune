/**
 * Web Audio API engine: manages AudioContext, gain nodes, backing track, sample playback.
 * Includes dynamic backing (lowpass filter + volume) driven by combo performance.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private backingGain!: GainNode;
  private backingFilter!: BiquadFilterNode;
  private sampleGain!: GainNode;

  private backingSource: AudioBufferSourceNode | null = null;
  private backingBuffer: AudioBuffer | null = null;
  private backingStartTime = 0;
  private backingPaused = false;
  private backingPauseOffset = 0;
  private playbackRate = 1.0;

  get context(): AudioContext {
    if (!this.ctx) throw new Error('AudioEngine not initialized. Call init() first.');
    return this.ctx;
  }

  get isInitialized(): boolean {
    return this.ctx !== null;
  }

  /** Must be called from a user gesture handler */
  async init(): Promise<void> {
    if (this.ctx) return;

    this.ctx = new AudioContext({ sampleRate: 44100 });

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // Backing chain: source → filter → backingGain → masterGain
    this.backingFilter = this.ctx.createBiquadFilter();
    this.backingFilter.type = 'lowpass';
    this.backingFilter.frequency.value = 22050; // fully open by default
    this.backingFilter.Q.value = 0.7;
    this.backingFilter.connect(this.masterGain);

    this.backingGain = this.ctx.createGain();
    this.backingGain.connect(this.backingFilter);

    this.sampleGain = this.ctx.createGain();
    this.sampleGain.connect(this.masterGain);

    this.masterGain.gain.value = 0.8;
    this.backingGain.gain.value = 0.6;
    this.sampleGain.gain.value = 1.0;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setMasterVolume(v: number): void {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setBackingVolume(v: number): void {
    if (this.backingGain) this.backingGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setSampleVolume(v: number): void {
    if (this.sampleGain) this.sampleGain.gain.value = Math.max(0, Math.min(1, v));
  }

  /**
   * Set dynamic backing level (0-4) based on combo performance.
   *  0: muffled & quiet (30% vol, 800Hz filter)
   *  1: warming up (50% vol, 2000Hz)
   *  2: getting clear (65% vol, 4000Hz)
   *  3: almost full (75% vol, 8000Hz)
   *  4: full & bright (100% vol, no filter)
   */
  setBackingDynamicLevel(level: number): void {
    if (!this.ctx) return;

    const configs: [number, number][] = [
      [0.3, 800],
      [0.5, 2000],
      [0.65, 4000],
      [0.75, 8000],
      [1.0, 22050],
    ];

    const clamped = Math.max(0, Math.min(4, Math.round(level)));
    const [gain, freq] = configs[clamped];
    const now = this.ctx.currentTime;
    const rampTime = 0.5; // 500ms smooth ramp

    this.backingGain.gain.cancelScheduledValues(now);
    this.backingGain.gain.setValueAtTime(this.backingGain.gain.value, now);
    this.backingGain.gain.linearRampToValueAtTime(gain, now + rampTime);

    this.backingFilter.frequency.cancelScheduledValues(now);
    this.backingFilter.frequency.setValueAtTime(this.backingFilter.frequency.value, now);
    this.backingFilter.frequency.linearRampToValueAtTime(freq, now + rampTime);
  }

  /** Quick dip on combo break — drops to level 1 then recovers */
  dipBackingOnComboBreak(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Quick drop over 200ms
    this.backingGain.gain.cancelScheduledValues(now);
    this.backingGain.gain.setValueAtTime(this.backingGain.gain.value, now);
    this.backingGain.gain.linearRampToValueAtTime(0.5, now + 0.2);

    this.backingFilter.frequency.cancelScheduledValues(now);
    this.backingFilter.frequency.setValueAtTime(this.backingFilter.frequency.value, now);
    this.backingFilter.frequency.linearRampToValueAtTime(2000, now + 0.2);
  }

  /** Read system audio latency (Chrome/Edge only, 0 on other browsers) */
  getSystemLatencyMs(): number {
    if (!this.ctx) return 0;
    const outputLatency = (this.ctx as AudioContext & { outputLatency?: number }).outputLatency ?? 0;
    const baseLatency = this.ctx.baseLatency ?? 0;
    return (outputLatency + baseLatency) * 1000;
  }

  async loadBacking(url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.backingBuffer = await this.context.decodeAudioData(arrayBuffer);
  }

  playBacking(): void {
    if (!this.backingBuffer) return;
    this.stopBacking();

    this.backingSource = this.context.createBufferSource();
    this.backingSource.buffer = this.backingBuffer;
    this.backingSource.playbackRate.value = this.playbackRate;
    this.backingSource.connect(this.backingGain);

    const offset = this.backingPaused ? this.backingPauseOffset : 0;
    // offset is in audio-time seconds, convert to real-time for startTime tracking
    this.backingSource.start(0, offset);
    this.backingStartTime = this.context.currentTime - (offset / this.playbackRate);
    this.backingPaused = false;
  }

  pauseBacking(): void {
    if (!this.backingSource) return;
    // Store pause offset in audio-time (not real-time)
    this.backingPauseOffset = (this.context.currentTime - this.backingStartTime) * this.playbackRate;
    this.backingSource.stop();
    this.backingSource = null;
    this.backingPaused = true;
  }

  stopBacking(): void {
    if (this.backingSource) {
      this.backingSource.stop();
      this.backingSource = null;
    }
    this.backingPaused = false;
    this.backingPauseOffset = 0;
  }

  /** Current playback position in audio-time seconds (accounts for playback rate) */
  get backingPosition(): number {
    if (this.backingPaused) return this.backingPauseOffset;
    if (!this.backingSource) return 0;
    // Real elapsed time * playbackRate = audio position
    return (this.context.currentTime - this.backingStartTime) * this.playbackRate;
  }

  /** Current playback position in milliseconds */
  get backingPositionMs(): number {
    return this.backingPosition * 1000;
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.25, Math.min(1.0, rate));
    if (this.backingSource) {
      this.backingSource.playbackRate.value = this.playbackRate;
    }
  }

  getPlaybackRate(): number {
    return this.playbackRate;
  }

  /** Play a decoded sample buffer with optional gain scaling */
  playSample(buffer: AudioBuffer, gainScale: number = 1.0): void {
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    if (gainScale !== 1.0) {
      const gain = this.context.createGain();
      gain.gain.value = gainScale;
      source.connect(gain);
      gain.connect(this.sampleGain);
    } else {
      source.connect(this.sampleGain);
    }

    source.start();
  }

  /** Play a short error buzz for wrong-key feedback */
  playErrorBuzz(): void {
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sampleGain);

    // Low, short buzz — noticeable but not harsh
    osc.type = 'triangle';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  /** Play a short metronome click for calibration (880Hz, 50ms) */
  playCalibrationClick(): void {
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  /** Decode an ArrayBuffer into an AudioBuffer */
  async decodeAudio(data: ArrayBuffer): Promise<AudioBuffer> {
    return this.context.decodeAudioData(data);
  }
}
