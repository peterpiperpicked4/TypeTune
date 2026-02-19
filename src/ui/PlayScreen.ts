/**
 * Play screen: composes all renderers into gameplay view.
 * Layout: score bar top, stage, lyrics middle, keyboard bottom, effects overlay.
 */

import type { Beatmap, BeatmapNote, Grade } from '../data/types';
import { StageRenderer } from '../render/StageRenderer';
import { LyricRenderer } from '../render/LyricRenderer';
import { KeyboardVis } from '../render/KeyboardVis';
import { EffectsRenderer } from '../render/EffectsRenderer';

export class PlayScreen {
  private container: HTMLElement;
  private stage: StageRenderer;
  private lyrics: LyricRenderer;
  private keyboard: KeyboardVis;
  private effects: EffectsRenderer;
  private scoreBar: HTMLElement;
  private comboEl: HTMLElement;
  private scoreEl: HTMLElement;
  private progressEl: HTMLElement;
  private progressFill: HTMLElement;
  private timingFeedbackEl: HTMLElement;
  private feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'screen play-screen hidden';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0;
    `;

    // Score bar — minimal, warm
    this.scoreBar = document.createElement('div');
    this.scoreBar.setAttribute('role', 'status');
    this.scoreBar.setAttribute('aria-label', 'Game score');
    this.scoreBar.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: clamp(10px, 1.5vw, 14px) clamp(16px, 3vw, 28px);
      background: rgba(0, 0, 0, 0.25);
      border-bottom: 1px solid rgba(212, 168, 83, 0.06);
      z-index: 10;
    `;

    this.comboEl = document.createElement('div');
    this.comboEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(12px, 1.5vw, 14px);
      font-weight: 500;
      color: var(--tt-text-muted);
      min-width: 80px;
      letter-spacing: 1px;
    `;

    this.scoreEl = document.createElement('div');
    this.scoreEl.setAttribute('aria-label', 'Score');
    this.scoreEl.style.cssText = `
      font-family: var(--tt-font-display);
      font-size: clamp(22px, 3vw, 28px);
      font-weight: 300;
      color: var(--tt-text);
      letter-spacing: 1px;
    `;

    this.progressEl = document.createElement('div');
    this.progressEl.setAttribute('role', 'progressbar');
    this.progressEl.setAttribute('aria-label', 'Song progress');
    this.progressEl.setAttribute('aria-valuemin', '0');
    this.progressEl.setAttribute('aria-valuemax', '100');
    this.progressEl.setAttribute('aria-valuenow', '0');
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
      will-change: transform;
      box-shadow: 0 0 6px rgba(212, 168, 83, 0.2);
    `;
    this.progressEl.appendChild(this.progressFill);

    this.scoreBar.appendChild(this.comboEl);
    this.scoreBar.appendChild(this.scoreEl);
    this.scoreBar.appendChild(this.progressEl);
    this.container.appendChild(this.scoreBar);

    // Stage area
    this.stage = new StageRenderer(this.container);

    // Lyrics area
    this.lyrics = new LyricRenderer(this.container);

    // Keyboard area
    this.keyboard = new KeyboardVis(this.container);

    // Timing feedback indicator (EARLY / PERFECT / GREAT / GOOD / LATE)
    this.timingFeedbackEl = document.createElement('div');
    this.timingFeedbackEl.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: var(--tt-font-display);
      font-size: clamp(14px, 2.5vw, 20px);
      font-weight: 400;
      font-style: italic;
      letter-spacing: 3px;
      text-transform: uppercase;
      pointer-events: none;
      z-index: 20;
      opacity: 0;
      will-change: transform, opacity;
      text-align: center;
    `;
    this.container.appendChild(this.timingFeedbackEl);

    // Inject timing feedback animation
    if (!document.getElementById('tt-timing-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'tt-timing-feedback-styles';
      style.textContent = `
        @keyframes tt-feedback-pop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          30% {
            transform: translate(-50%, -50%) scale(1);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-12px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Effects overlay
    this.effects = new EffectsRenderer(this.container);

    parent.appendChild(this.container);

    this.updateScore(0);
    this.updateCombo(0);
  }

  setBeatmap(beatmap: Beatmap): void {
    this.lyrics.setBeatmap(beatmap);
  }

  onNoteHit(note: BeatmapNote, grade: Grade, combo: number, _points: number, globalNoteIndex: number, timingOffset?: number): void {
    const noteIdx = this.lyrics.getNoteIndexInPhrase(globalNoteIndex);
    this.lyrics.markNote(noteIdx, grade);

    this.keyboard.flashHit(note.char);

    const keyEl = this.keyboard.element.querySelector(`[data-key="${note.char.toLowerCase()}"]`);
    if (keyEl) {
      const rect = keyEl.getBoundingClientRect();
      this.effects.spawnParticles(rect.left + rect.width / 2, rect.top, grade);
    }

    this.effects.flashCombo(combo);

    // Show timing feedback
    this.showTimingFeedback(grade, timingOffset ?? 0);
  }

  onNoteMiss(note: BeatmapNote, globalNoteIndex: number): void {
    const noteIdx = this.lyrics.getNoteIndexInPhrase(globalNoteIndex);
    this.lyrics.markNote(noteIdx, 'miss');
    this.keyboard.flashMiss(note.char);
  }

  updateCombo(combo: number): void {
    if (combo > 0) {
      this.comboEl.textContent = `${combo}x`;
      this.comboEl.style.color = combo >= 50 ? 'var(--tt-gold)' : combo >= 10 ? 'var(--tt-accent)' : 'var(--tt-text-muted)';
      if (combo >= 50) {
        this.comboEl.style.textShadow = '0 0 12px rgba(212, 168, 83, 0.3)';
      } else {
        this.comboEl.style.textShadow = 'none';
      }
    } else {
      this.comboEl.textContent = '';
      this.comboEl.style.textShadow = 'none';
    }
  }

  updateScore(score: number): void {
    this.scoreEl.textContent = score.toLocaleString();
  }

  updateProgress(progress: number): void {
    const pct = Math.round(progress * 100);
    this.progressFill.style.transform = `scaleX(${progress})`;
    this.progressEl.setAttribute('aria-valuenow', String(pct));
  }

  updateChoir(size: number): void {
    this.stage.updateChoir(size);
  }

  highlightNextKey(char: string): void {
    this.keyboard.highlightNext(char);
  }

  onPhraseChange(phraseIndex: number): void {
    this.lyrics.setPhrase(phraseIndex);
  }

  updateTimingBall(currentTimeMs: number): void {
    this.lyrics.updateTimingBall(currentTimeMs);
  }

  setKeyboardVisible(visible: boolean): void {
    this.keyboard.setVisible(visible);
  }

  setFingerGuide(enabled: boolean): void {
    this.keyboard.setFingerGuide(enabled);
  }

  private showTimingFeedback(grade: Grade, offset: number): void {
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);

    const isEarly = offset < 0;
    let text: string;
    let color: string;

    switch (grade) {
      case 'perfect':
        text = 'PERFECT';
        color = 'var(--tt-perfect, #d4a853)';
        break;
      case 'great':
        text = isEarly ? 'GREAT' : 'GREAT';
        color = 'var(--tt-great, #f0ebe3)';
        break;
      case 'good':
        text = isEarly ? 'EARLY' : 'LATE';
        color = 'var(--tt-good, rgba(200,190,175,0.7))';
        break;
      default:
        text = 'MISS';
        color = 'var(--tt-miss, #e74c3c)';
        break;
    }

    this.timingFeedbackEl.textContent = text;
    this.timingFeedbackEl.style.color = color;
    this.timingFeedbackEl.style.textShadow = grade === 'perfect'
      ? '0 0 20px rgba(212,168,83,0.5)'
      : 'none';
    this.timingFeedbackEl.style.animation = 'none';
    // Force reflow
    void this.timingFeedbackEl.offsetWidth;
    this.timingFeedbackEl.style.animation = 'tt-feedback-pop 0.6s cubic-bezier(0.25, 0, 0.2, 1) forwards';

    this.feedbackTimeout = setTimeout(() => {
      this.timingFeedbackEl.style.opacity = '0';
      this.timingFeedbackEl.style.animation = '';
    }, 600);
  }

  onWrongKey(pressedKey: string, _expectedKey: string): void {
    this.keyboard.shakeWrongKey(pressedKey, _expectedKey);
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
