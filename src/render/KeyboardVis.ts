/**
 * Keyboard visualizer: display-only QWERTY with responsive key sizing.
 * Supports finger-zone coloring and wrong-key shake feedback.
 * aria-hidden — this is a visual aid, not an interactive keyboard.
 */

import { FINGER_COLORS, getFingerColor, getFingerInfo } from '../data/FingerMap';

export type KeyState = 'idle' | 'next' | 'hit' | 'miss' | 'home';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const HOME_KEYS = new Set(['f', 'j']);

export class KeyboardVis {
  private container: HTMLElement;
  private keyElements: Map<string, HTMLElement> = new Map();
  private resetTimers: Map<string, number> = new Map();
  private fingerGuideEnabled = false;
  private fingerLabelEl: HTMLElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'keyboard-vis';
    this.container.setAttribute('aria-hidden', 'true');
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--tt-key-gap);
      padding: clamp(8px, 1.5vw, 16px);
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      position: relative;
    `;

    // Finger label — floats above keyboard, shows "Left Index" etc.
    this.fingerLabelEl = document.createElement('div');
    this.fingerLabelEl.style.cssText = `
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--tt-font-mono);
      font-size: clamp(10px, 1.2vw, 12px);
      font-weight: 500;
      color: var(--tt-text-muted);
      opacity: 0;
      transition: opacity 0.15s ease, color 0.15s ease;
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: 0.5px;
    `;
    this.container.appendChild(this.fingerLabelEl);

    for (let rowIdx = 0; rowIdx < ROWS.length; rowIdx++) {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = `
        display: flex;
        gap: var(--tt-key-gap);
        margin-left: ${rowIdx * 1.2}em;
      `;

      for (const key of ROWS[rowIdx]) {
        const keyEl = this.createKeyElement(key);
        this.keyElements.set(key, keyEl);
        rowEl.appendChild(keyEl);
      }

      this.container.appendChild(rowEl);
    }

    // Space bar
    const spaceRow = document.createElement('div');
    spaceRow.style.cssText = 'display: flex; justify-content: center; margin-top: 4px;';
    const spaceEl = document.createElement('div');
    spaceEl.dataset.key = ' ';
    spaceEl.style.cssText = `
      width: clamp(120px, 30vw, 200px);
      height: clamp(26px, 4vw, 32px);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease;
    `;
    this.keyElements.set(' ', spaceEl);
    spaceRow.appendChild(spaceEl);
    this.container.appendChild(spaceRow);

    // Inject shake keyframe animation
    this.injectShakeAnimation();

    parent.appendChild(this.container);
  }

  private createKeyElement(key: string): HTMLElement {
    const keyEl = document.createElement('div');
    keyEl.textContent = key;
    keyEl.dataset.key = key;
    keyEl.style.cssText = `
      width: var(--tt-key-size);
      height: var(--tt-key-size);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      color: var(--tt-text-muted);
      font-family: var(--tt-font-mono);
      font-size: clamp(10px, 1.5vw, 13px);
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.1s ease, border-color 0.1s ease, color 0.1s ease, box-shadow 0.1s ease;
      position: relative;
      text-transform: lowercase;
    `;

    if (HOME_KEYS.has(key)) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: absolute;
        bottom: 5px;
        width: 4px;
        height: 1px;
        background: rgba(212, 168, 83, 0.3);
        border-radius: 1px;
      `;
      keyEl.appendChild(dot);
    }

    return keyEl;
  }

  // ── Finger guide ──

  /** Toggle color-coded finger zones on all keys */
  setFingerGuide(enabled: boolean): void {
    this.fingerGuideEnabled = enabled;
    for (const [key, el] of this.keyElements) {
      if (key === ' ') continue; // Skip spacebar
      const color = getFingerColor(key);
      if (enabled && color) {
        // Subtle colored bottom border to indicate finger zone
        el.style.borderBottomColor = color;
        el.style.borderBottomWidth = '2px';
      } else {
        el.style.borderBottomColor = 'rgba(255, 255, 255, 0.04)';
        el.style.borderBottomWidth = '1px';
      }
    }
  }

  /** Show which finger should press the highlighted key */
  private showFingerLabel(key: string): void {
    if (!this.fingerGuideEnabled) return;
    const info = getFingerInfo(key);
    if (info) {
      const color = FINGER_COLORS[info.zone];
      this.fingerLabelEl.textContent = info.label;
      this.fingerLabelEl.style.color = color;
      this.fingerLabelEl.style.opacity = '1';
    }
  }

  private hideFingerLabel(): void {
    this.fingerLabelEl.style.opacity = '0';
  }

  // ── Key state methods ──

  highlightNext(key: string): void {
    this.clearAll();
    const k = key.toLowerCase();
    const el = this.keyElements.get(k);
    if (!el) return;

    // If finger guide is on, tint with finger color; otherwise default gold
    const fingerColor = this.fingerGuideEnabled ? getFingerColor(k) : null;

    if (fingerColor) {
      el.style.background = this.hexToRgba(fingerColor, 0.15);
      el.style.borderColor = this.hexToRgba(fingerColor, 0.5);
      el.style.color = fingerColor;
      el.style.boxShadow = `0 0 16px ${this.hexToRgba(fingerColor, 0.2)}, inset 0 0 8px ${this.hexToRgba(fingerColor, 0.06)}`;
      // Keep the finger zone bottom border
      el.style.borderBottomColor = fingerColor;
      el.style.borderBottomWidth = '2px';
    } else {
      el.style.background = 'rgba(212, 168, 83, 0.12)';
      el.style.borderColor = 'rgba(212, 168, 83, 0.35)';
      el.style.color = 'var(--tt-accent)';
      el.style.boxShadow = '0 0 16px rgba(212, 168, 83, 0.15), inset 0 0 8px rgba(212, 168, 83, 0.05)';
    }

    this.showFingerLabel(k);
  }

  flashHit(key: string): void {
    const k = key.toLowerCase();
    const el = this.keyElements.get(k);
    if (!el) return;
    this.cancelReset(k);
    el.style.background = 'rgba(92, 184, 122, 0.2)';
    el.style.borderColor = 'rgba(92, 184, 122, 0.4)';
    el.style.color = 'var(--tt-green)';
    el.style.boxShadow = '0 0 16px rgba(92, 184, 122, 0.25)';
    this.hideFingerLabel();
    this.scheduleReset(k, 180);
  }

  flashMiss(key: string): void {
    const k = key.toLowerCase();
    const el = this.keyElements.get(k);
    if (!el) return;
    this.cancelReset(k);
    el.style.background = 'rgba(196, 64, 64, 0.2)';
    el.style.borderColor = 'rgba(196, 64, 64, 0.4)';
    el.style.color = 'var(--tt-red)';
    el.style.boxShadow = '0 0 16px rgba(196, 64, 64, 0.25)';
    this.scheduleReset(k, 180);
  }

  // ── Wrong-key shake ──

  /** Shake the entire keyboard on wrong key + flash the wrong key red */
  shakeWrongKey(pressedKey: string, _expectedKey: string): void {
    // Flash the key the player actually pressed in red
    this.flashMiss(pressedKey);

    // Shake the keyboard container
    this.container.style.animation = 'none';
    // Force reflow to restart animation
    void this.container.offsetWidth;
    this.container.style.animation = 'ttKeyboardShake 0.3s ease-in-out';
  }

  private injectShakeAnimation(): void {
    if (document.getElementById('tt-keyboard-shake-style')) return;
    const style = document.createElement('style');
    style.id = 'tt-keyboard-shake-style';
    style.textContent = `
      @keyframes ttKeyboardShake {
        0%, 100% { transform: translateX(0); }
        15% { transform: translateX(-4px); }
        30% { transform: translateX(3px); }
        45% { transform: translateX(-2px); }
        60% { transform: translateX(2px); }
        75% { transform: translateX(-1px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Internal ──

  private scheduleReset(key: string, ms: number): void {
    const timer = window.setTimeout(() => {
      this.resetTimers.delete(key);
      this.resetKey(key);
    }, ms);
    this.resetTimers.set(key, timer);
  }

  private cancelReset(key: string): void {
    const timer = this.resetTimers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.resetTimers.delete(key);
    }
  }

  private resetKey(key: string): void {
    const el = this.keyElements.get(key.toLowerCase());
    if (!el) return;
    el.style.background = 'rgba(255, 255, 255, 0.03)';
    el.style.color = 'var(--tt-text-muted)';
    el.style.boxShadow = 'none';

    // Restore finger guide border if enabled
    if (this.fingerGuideEnabled && key !== ' ') {
      const color = getFingerColor(key);
      if (color) {
        el.style.borderColor = 'rgba(255, 255, 255, 0.04)';
        el.style.borderBottomColor = color;
        el.style.borderBottomWidth = '2px';
      }
    } else {
      el.style.borderColor = 'rgba(255, 255, 255, 0.04)';
      el.style.borderBottomWidth = '1px';
    }
  }

  private clearAll(): void {
    for (const [key] of this.keyElements) {
      this.cancelReset(key);
      this.resetKey(key);
    }
    this.hideFingerLabel();
  }

  /** Convert hex color to rgba string */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'flex' : 'none';
  }

  get element(): HTMLElement {
    return this.container;
  }
}
