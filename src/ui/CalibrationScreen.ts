/**
 * Audio latency calibration screen.
 * Plays 8 metronome clicks, player taps spacebar on each beat.
 * Calculates median offset to determine latency compensation.
 */

import { AudioEngine } from '../audio/AudioEngine';

export class CalibrationScreen {
  private container: HTMLElement;
  private engine: AudioEngine;
  private onSave: (offsetMs: number) => void;
  private onBack: () => void;

  private clickCount = 8;
  private intervalMs = 750; // 80 BPM
  private beatTimes: number[] = [];
  private tapTimes: number[] = [];
  private currentBeat = 0;
  private running = false;
  private timeoutIds: ReturnType<typeof setTimeout>[] = [];
  private statusEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private tapHint: HTMLElement | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(parent: HTMLElement, engine: AudioEngine, onSave: (offsetMs: number) => void, onBack: () => void) {
    this.engine = engine;
    this.onSave = onSave;
    this.onBack = onBack;

    this.container = document.createElement('div');
    this.container.className = 'screen calibration-screen hidden';
    this.container.style.cssText = `
      padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;

    this.render();
    parent.appendChild(this.container);
  }

  private render(): void {
    this.container.innerHTML = `
      <div style="max-width: 400px; width: 100%; text-align: center;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 48px; width: 100%;">
          <button class="btn btn-secondary back-btn" style="font-size: 13px; padding: 8px 18px; border-radius: 20px;">Back</button>
          <h2 style="
            font-family: var(--tt-font-display);
            font-size: clamp(22px, 3.5vw, 28px);
            font-weight: 300;
            font-style: italic;
            color: var(--tt-text);
          ">Audio Calibration</h2>
          <div style="width: 60px;"></div>
        </div>

        <div style="
          font-size: 14px;
          color: var(--tt-text-dim);
          line-height: 1.7;
          margin-bottom: 36px;
        ">
          Tap <strong style="color: var(--tt-text);">spacebar</strong> in time with each click.<br>
          This helps TypeTune compensate for audio delay.
        </div>

        <div class="hint-text" style="
          font-family: var(--tt-font-mono);
          font-size: 13px;
          color: var(--tt-text-muted);
          margin-bottom: 24px;
          min-height: 20px;
        ">System latency: ${Math.round(this.engine.getSystemLatencyMs())}ms</div>

        <div class="status-area" style="
          font-family: var(--tt-font-display);
          font-size: clamp(18px, 3vw, 24px);
          font-weight: 300;
          font-style: italic;
          color: var(--tt-text);
          min-height: 40px;
          margin-bottom: 24px;
        "></div>

        <div class="tap-hint" style="
          font-size: 48px;
          min-height: 60px;
          margin-bottom: 24px;
          transition: transform 0.1s ease;
        "></div>

        <div class="result-area" style="
          font-size: 14px;
          color: var(--tt-text);
          min-height: 80px;
          margin-bottom: 32px;
        "></div>

        <div class="actions" style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-primary start-btn" style="padding: 12px 32px; border-radius: 24px; font-size: 15px;">Start</button>
        </div>
      </div>
    `;

    this.statusEl = this.container.querySelector('.status-area');
    this.resultEl = this.container.querySelector('.result-area');
    this.tapHint = this.container.querySelector('.tap-hint');

    this.container.querySelector('.back-btn')!.addEventListener('click', () => {
      this.stopCalibration();
      this.onBack();
    });

    this.container.querySelector('.start-btn')!.addEventListener('click', () => {
      this.startCalibration();
    });
  }

  private startCalibration(): void {
    this.stopCalibration();
    this.beatTimes = [];
    this.tapTimes = [];
    this.currentBeat = 0;
    this.running = true;

    if (this.statusEl) this.statusEl.textContent = 'Listen...';
    if (this.resultEl) this.resultEl.innerHTML = '';
    if (this.tapHint) this.tapHint.textContent = '';

    // Update actions to show retry
    const actions = this.container.querySelector('.actions')!;
    actions.innerHTML = '';

    // Schedule clicks
    const startTime = performance.now() + 1000; // 1s lead-in

    for (let i = 0; i < this.clickCount; i++) {
      const beatTime = startTime + i * this.intervalMs;
      this.beatTimes.push(beatTime);

      const id = setTimeout(() => {
        if (!this.running) return;
        this.engine.playCalibrationClick();
        this.currentBeat = i + 1;
        if (this.statusEl) this.statusEl.textContent = `Beat ${this.currentBeat} / ${this.clickCount}`;
        if (this.tapHint) {
          this.tapHint.textContent = '\u266A';
          this.tapHint.style.transform = 'scale(1.2)';
          setTimeout(() => {
            if (this.tapHint) this.tapHint.style.transform = 'scale(1)';
          }, 100);
        }
      }, beatTime - performance.now());

      this.timeoutIds.push(id);
    }

    // End calibration after last beat + buffer
    const endId = setTimeout(() => {
      if (!this.running) return;
      this.finishCalibration();
    }, startTime + (this.clickCount - 1) * this.intervalMs + this.intervalMs - performance.now());
    this.timeoutIds.push(endId);

    // Listen for spacebar taps
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && this.running) {
        e.preventDefault();
        this.tapTimes.push(performance.now());
        if (this.tapHint) {
          this.tapHint.style.transform = 'scale(0.9)';
          setTimeout(() => {
            if (this.tapHint) this.tapHint.style.transform = 'scale(1)';
          }, 80);
        }
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  private finishCalibration(): void {
    this.running = false;
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }

    if (this.tapHint) this.tapHint.textContent = '';

    // Match taps to beats (nearest beat for each tap)
    const offsets: number[] = [];
    for (const tap of this.tapTimes) {
      let minDist = Infinity;
      let bestOffset = 0;
      for (const beat of this.beatTimes) {
        const dist = Math.abs(tap - beat);
        if (dist < minDist) {
          minDist = dist;
          bestOffset = tap - beat;
        }
      }
      // Only count taps within 400ms of a beat
      if (Math.abs(bestOffset) < 400) {
        offsets.push(bestOffset);
      }
    }

    if (offsets.length < 3) {
      if (this.statusEl) this.statusEl.textContent = 'Not enough taps detected';
      if (this.resultEl) this.resultEl.innerHTML = `
        <div style="color: var(--tt-text-muted);">Please try again and tap spacebar on each beat.</div>
      `;
      this.showRetryActions();
      return;
    }

    // Calculate median offset
    offsets.sort((a, b) => a - b);
    const median = offsets[Math.floor(offsets.length / 2)];
    const offsetMs = Math.round(median);

    if (this.statusEl) this.statusEl.textContent = 'Calibration complete!';
    if (this.resultEl) this.resultEl.innerHTML = `
      <div style="
        font-family: var(--tt-font-mono);
        font-size: 28px;
        font-weight: 600;
        color: var(--tt-accent);
        margin-bottom: 8px;
      ">${offsetMs}ms</div>
      <div style="font-size: 12px; color: var(--tt-text-muted);">
        ${offsetMs > 0 ? 'Your taps were slightly late' : offsetMs < 0 ? 'Your taps were slightly early' : 'Perfect timing!'}
        (${offsets.length} taps matched)
      </div>
    `;

    // Show save/retry buttons
    const actions = this.container.querySelector('.actions')!;
    actions.innerHTML = `
      <button class="btn btn-secondary retry-btn" style="padding: 10px 24px; border-radius: 20px; font-size: 14px;">Retry</button>
      <button class="btn btn-primary save-btn" style="padding: 10px 28px; border-radius: 20px; font-size: 14px;">Save</button>
    `;

    actions.querySelector('.retry-btn')!.addEventListener('click', () => this.startCalibration());
    actions.querySelector('.save-btn')!.addEventListener('click', () => {
      this.onSave(offsetMs);
      this.onBack();
    });
  }

  private showRetryActions(): void {
    const actions = this.container.querySelector('.actions')!;
    actions.innerHTML = `
      <button class="btn btn-primary retry-btn" style="padding: 10px 28px; border-radius: 20px; font-size: 14px;">Try Again</button>
    `;
    actions.querySelector('.retry-btn')!.addEventListener('click', () => this.startCalibration());
  }

  private stopCalibration(): void {
    this.running = false;
    for (const id of this.timeoutIds) clearTimeout(id);
    this.timeoutIds = [];
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  show(): void {
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
    // Reset UI
    if (this.statusEl) this.statusEl.textContent = '';
    if (this.resultEl) this.resultEl.innerHTML = '';
    if (this.tapHint) this.tapHint.textContent = '';
    const actions = this.container.querySelector('.actions')!;
    actions.innerHTML = `
      <button class="btn btn-primary start-btn" style="padding: 12px 32px; border-radius: 24px; font-size: 15px;">Start</button>
    `;
    actions.querySelector('.start-btn')!.addEventListener('click', () => this.startCalibration());
  }

  hide(): void {
    this.stopCalibration();
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
  }

  get element(): HTMLElement { return this.container; }
}
