/**
 * Practice play screen: typing tutor UI for Practice Mode.
 * Shows current sentence with cursor, upcoming sentences, WPM, accuracy, timer.
 * Reuses KeyboardVis for finger guide + wrong-key feedback.
 */

import { KeyboardVis } from '../render/KeyboardVis';

export class PracticePlayScreen {
  private container: HTMLElement;
  private keyboard: KeyboardVis;

  // HUD elements
  private timerEl: HTMLElement;
  private wpmEl: HTMLElement;
  private accuracyEl: HTMLElement;

  // Word display
  private wordContainer: HTMLElement;
  private currentWordEl: HTMLElement;
  private upcomingEl: HTMLElement;

  // Internal state
  private currentWordText = '';
  private currentCharIdx = 0;
  private correctChars = 0;
  private totalChars = 0;
  private startTime = 0;
  private timerInterval = 0;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'screen practice-play-screen hidden';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0;
    `;

    // ── HUD bar ──
    const hud = document.createElement('div');
    hud.setAttribute('role', 'status');
    hud.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: clamp(10px, 1.5vw, 14px) clamp(16px, 3vw, 28px);
      background: rgba(0, 0, 0, 0.25);
      border-bottom: 1px solid rgba(91, 143, 212, 0.08);
      z-index: 10;
    `;

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(14px, 2vw, 18px);
      font-weight: 500;
      color: var(--tt-text);
      min-width: 50px;
    `;

    this.wpmEl = document.createElement('div');
    this.wpmEl.style.cssText = `
      font-family: var(--tt-font-display);
      font-size: clamp(22px, 3vw, 28px);
      font-weight: 300;
      color: var(--tt-text);
      letter-spacing: 1px;
    `;

    this.accuracyEl = document.createElement('div');
    this.accuracyEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(12px, 1.5vw, 14px);
      font-weight: 500;
      color: var(--tt-text-muted);
      min-width: 60px;
      text-align: right;
    `;

    hud.appendChild(this.timerEl);
    hud.appendChild(this.wpmEl);
    hud.appendChild(this.accuracyEl);
    this.container.appendChild(hud);

    // ── Word display area ──
    this.wordContainer = document.createElement('div');
    this.wordContainer.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: clamp(16px, 3vw, 28px);
      padding: clamp(20px, 4vw, 48px) clamp(24px, 5vw, 60px);
    `;

    this.currentWordEl = document.createElement('div');
    this.currentWordEl.setAttribute('aria-live', 'polite');
    this.currentWordEl.setAttribute('aria-label', 'Current sentence');
    this.currentWordEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(16px, 2.5vw, 24px);
      font-weight: 500;
      line-height: 2;
      text-align: left;
      width: 100%;
      max-width: 720px;
    `;

    this.upcomingEl = document.createElement('div');
    this.upcomingEl.setAttribute('aria-hidden', 'true');
    this.upcomingEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(12px, 1.5vw, 15px);
      font-weight: 300;
      color: var(--tt-text-muted);
      letter-spacing: 0.5px;
      text-align: left;
      width: 100%;
      max-width: 720px;
      opacity: 0.4;
      line-height: 1.8;
    `;

    this.wordContainer.appendChild(this.currentWordEl);
    this.wordContainer.appendChild(this.upcomingEl);
    this.container.appendChild(this.wordContainer);

    // ── Keyboard ──
    this.keyboard = new KeyboardVis(this.container);

    parent.appendChild(this.container);

    // Init display
    this.updateTimer(60);
    this.updateWpm(0);
    this.updateAccuracy(1);
  }

  /** Set a new word to display. */
  setWord(text: string): void {
    this.currentWordText = text;
    this.currentCharIdx = 0;
    this.renderWord();
    // Highlight first key
    if (text.length > 0) {
      this.keyboard.highlightNext(text[0]);
    }
  }

  /** Mark a character as correct and advance cursor. */
  onCorrectChar(charIndex: number): void {
    this.currentCharIdx = charIndex + 1;
    this.correctChars++;
    this.totalChars++;
    this.renderWord();

    // Highlight next key
    if (this.currentCharIdx < this.currentWordText.length) {
      this.keyboard.highlightNext(this.currentWordText[this.currentCharIdx]);
    }

    this.updateLiveStats();
  }

  /** Flash wrong key. */
  onWrongChar(pressedKey: string, expectedKey: string): void {
    this.totalChars++;
    this.keyboard.shakeWrongKey(pressedKey, expectedKey);
    this.updateLiveStats();
  }

  /** Set upcoming words for preview. */
  setUpcoming(words: string[]): void {
    this.upcomingEl.textContent = words.slice(0, 2).join('  \u00b7  ');
  }

  /**
   * Render current sentence with typed/untyped coloring + cursor.
   * Groups characters into word-level spans so line breaks only happen between words.
   */
  private renderWord(): void {
    // Split text into words (preserving spaces as separators)
    const text = this.currentWordText;
    const words = text.split(' ');

    this.currentWordEl.innerHTML = '';

    let charOffset = 0;

    for (let w = 0; w < words.length; w++) {
      const word = words[w];

      // Create a word wrapper that prevents mid-word breaks
      const wordSpan = document.createElement('span');
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.style.display = 'inline';

      // Render each character in this word
      for (let c = 0; c < word.length; c++) {
        const globalIdx = charOffset + c;
        const ch = document.createElement('span');
        ch.textContent = word[c];

        if (globalIdx < this.currentCharIdx) {
          ch.style.color = 'var(--tt-accent)';
        } else if (globalIdx === this.currentCharIdx) {
          ch.style.color = 'var(--tt-text)';
          ch.style.borderBottom = '2px solid var(--tt-accent)';
          ch.style.paddingBottom = '2px';
        } else {
          ch.style.color = 'var(--tt-text-dim)';
        }

        wordSpan.appendChild(ch);
      }

      this.currentWordEl.appendChild(wordSpan);

      // Add space between words (not after last word)
      charOffset += word.length;
      if (w < words.length - 1) {
        const spaceIdx = charOffset;
        const spaceSpan = document.createElement('span');
        spaceSpan.textContent = ' ';

        if (spaceIdx < this.currentCharIdx) {
          spaceSpan.style.color = 'var(--tt-accent)';
        } else if (spaceIdx === this.currentCharIdx) {
          spaceSpan.style.color = 'var(--tt-text)';
          spaceSpan.style.borderBottom = '2px solid var(--tt-accent)';
          spaceSpan.style.paddingBottom = '2px';
        } else {
          spaceSpan.style.color = 'var(--tt-text-dim)';
        }

        this.currentWordEl.appendChild(spaceSpan);
        charOffset++; // for the space
      }
    }
  }

  private updateLiveStats(): void {
    const elapsed = (performance.now() - this.startTime) / 60_000;
    const wpm = elapsed > 0 ? Math.round((this.correctChars / 5) / elapsed) : 0;
    const accuracy = this.totalChars > 0 ? this.correctChars / this.totalChars : 1;
    this.updateWpm(wpm);
    this.updateAccuracy(accuracy);
  }

  updateTimer(seconds: number): void {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    this.timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    // Warn when low
    if (seconds <= 10) {
      this.timerEl.style.color = 'var(--tt-red)';
    } else {
      this.timerEl.style.color = 'var(--tt-text)';
    }
  }

  updateWpm(wpm: number): void {
    this.wpmEl.textContent = `${wpm} WPM`;
  }

  updateAccuracy(accuracy: number): void {
    this.accuracyEl.textContent = `${Math.round(accuracy * 100)}%`;
  }

  /** Start the live timer countdown. */
  startTimer(durationMs: number): void {
    this.startTime = performance.now();
    this.correctChars = 0;
    this.totalChars = 0;

    window.clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      const elapsed = performance.now() - this.startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      this.updateTimer(remaining / 1000);
      if (remaining <= 0) {
        window.clearInterval(this.timerInterval);
      }
    }, 250);
  }

  stopTimer(): void {
    window.clearInterval(this.timerInterval);
  }

  setFingerGuide(enabled: boolean): void {
    this.keyboard.setFingerGuide(enabled);
  }

  setKeyboardVisible(visible: boolean): void {
    this.keyboard.setVisible(visible);
  }

  show(): void {
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
    this.stopTimer();
  }

  get element(): HTMLElement { return this.container; }
}
