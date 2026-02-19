/**
 * Phrase mode play screen: shows full phrase text with cursor, characters light up as typed.
 * Simpler than per-note mode — clean text with cursor, no spotlight/ember system.
 */

import type { Grade, PhraseResult } from '../data/types';

export class PhrasePlayScreen {
  private container: HTMLElement;
  private phraseTextEl: HTMLElement;
  private feedbackEl: HTMLElement;
  private progressEl: HTMLElement;
  private progressFill: HTMLElement;
  private phraseProgressEl: HTMLElement;
  private phraseProgressFill: HTMLElement;
  private scoreEl: HTMLElement;
  private charSpans: HTMLSpanElement[] = [];

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'screen phrase-play-screen hidden';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: clamp(16px, 3vw, 32px);
      gap: 24px;
    `;

    // Score bar at top
    const scoreBar = document.createElement('div');
    scoreBar.setAttribute('role', 'status');
    scoreBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: clamp(10px, 1.5vw, 14px) clamp(16px, 3vw, 28px);
      background: rgba(0, 0, 0, 0.25);
      border-bottom: 1px solid rgba(212, 168, 83, 0.06);
      z-index: 10;
    `;

    this.scoreEl = document.createElement('div');
    this.scoreEl.style.cssText = `
      font-family: var(--tt-font-display);
      font-size: clamp(16px, 2vw, 20px);
      font-weight: 300;
      color: var(--tt-text);
    `;
    this.scoreEl.textContent = 'Phrase Mode';

    // Song progress bar
    this.progressEl = document.createElement('div');
    this.progressEl.setAttribute('role', 'progressbar');
    this.progressEl.setAttribute('aria-label', 'Song progress');
    this.progressEl.style.cssText = `
      width: clamp(60px, 10vw, 100px);
      height: 2px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 1px;
      overflow: hidden;
    `;
    this.progressFill = document.createElement('div');
    this.progressFill.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, var(--tt-accent), var(--tt-accent-glow));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s var(--tt-ease-out);
    `;
    this.progressEl.appendChild(this.progressFill);

    scoreBar.appendChild(this.scoreEl);
    scoreBar.appendChild(this.progressEl);
    this.container.appendChild(scoreBar);

    // Phrase text area
    this.phraseTextEl = document.createElement('div');
    this.phraseTextEl.style.cssText = `
      font-family: var(--tt-font-display);
      font-size: clamp(24px, 4vw, 36px);
      font-weight: 300;
      line-height: 1.8;
      color: var(--tt-text-dim);
      text-align: center;
      max-width: 600px;
      min-height: 80px;
      letter-spacing: 1px;
      word-break: break-word;
    `;
    this.container.appendChild(this.phraseTextEl);

    // Phrase time progress bar
    this.phraseProgressEl = document.createElement('div');
    this.phraseProgressEl.setAttribute('role', 'progressbar');
    this.phraseProgressEl.setAttribute('aria-label', 'Phrase time remaining');
    this.phraseProgressEl.style.cssText = `
      width: clamp(200px, 50vw, 400px);
      height: 3px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 2px;
      overflow: hidden;
    `;
    this.phraseProgressFill = document.createElement('div');
    this.phraseProgressFill.style.cssText = `
      width: 100%;
      height: 100%;
      background: var(--tt-accent);
      transform: scaleX(1);
      transform-origin: left;
      transition: transform 0.1s linear;
    `;
    this.phraseProgressEl.appendChild(this.phraseProgressFill);
    this.container.appendChild(this.phraseProgressEl);

    // Feedback area
    this.feedbackEl = document.createElement('div');
    this.feedbackEl.style.cssText = `
      font-family: var(--tt-font-display);
      font-size: clamp(16px, 2.5vw, 22px);
      font-weight: 300;
      font-style: italic;
      color: var(--tt-text-muted);
      min-height: 30px;
      text-align: center;
    `;
    this.container.appendChild(this.feedbackEl);

    parent.appendChild(this.container);
  }

  /** Set a new phrase to display */
  setPhrase(text: string, _durationMs: number): void {
    this.charSpans = [];
    this.phraseTextEl.innerHTML = '';

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.cssText = `
        transition: color 0.15s ease;
        position: relative;
      `;

      // Highlight cursor position (first char)
      if (i === 0) {
        span.style.borderBottom = '2px solid var(--tt-accent)';
        span.style.color = 'var(--tt-text)';
      }

      this.charSpans.push(span);
      this.phraseTextEl.appendChild(span);
    }

    this.feedbackEl.textContent = '';
    this.phraseProgressFill.style.transform = 'scaleX(1)';
  }

  /** Mark character at index as correctly typed */
  markCharCorrect(charIndex: number): void {
    if (charIndex < this.charSpans.length) {
      const span = this.charSpans[charIndex];
      span.style.color = 'var(--tt-accent)';
      span.style.borderBottom = 'none';
    }
    // Move cursor to next
    const next = charIndex + 1;
    if (next < this.charSpans.length) {
      this.charSpans[next].style.borderBottom = '2px solid var(--tt-accent)';
      this.charSpans[next].style.color = 'var(--tt-text)';
    }
  }

  /** Flash character at index as wrong */
  markCharWrong(charIndex: number): void {
    if (charIndex < this.charSpans.length) {
      const span = this.charSpans[charIndex];
      span.style.color = 'var(--tt-miss, #e74c3c)';
      span.style.borderBottom = 'none';
      // Brief red flash
      setTimeout(() => {
        span.style.color = 'var(--tt-text-dim)';
      }, 300);
    }
    // Move cursor forward
    const next = charIndex + 1;
    if (next < this.charSpans.length) {
      this.charSpans[next].style.borderBottom = '2px solid var(--tt-accent)';
      this.charSpans[next].style.color = 'var(--tt-text)';
    }
  }

  /** Show phrase completion feedback */
  showPhraseFeedback(result: PhraseResult): void {
    const gradeColors: Record<Grade, string> = {
      perfect: 'var(--tt-perfect, #d4a853)',
      great: 'var(--tt-great, #f0ebe3)',
      good: 'var(--tt-good, rgba(200,190,175,0.7))',
      miss: 'var(--tt-miss, #e74c3c)',
    };

    this.feedbackEl.style.color = gradeColors[result.grade];
    this.feedbackEl.textContent = `${result.grade.toUpperCase()} - ${Math.round(result.accuracy * 100)}% accuracy`;
  }

  /** Update the phrase time progress bar (0 = full, 1 = empty) */
  updatePhraseProgress(ratio: number): void {
    this.phraseProgressFill.style.transform = `scaleX(${Math.max(0, 1 - ratio)})`;
  }

  /** Update overall song progress */
  updateProgress(progress: number): void {
    this.progressFill.style.transform = `scaleX(${progress})`;
  }

  show(): void {
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
  }

  get element(): HTMLElement { return this.container; }
}
