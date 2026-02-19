/**
 * Results screen: theatrical grade reveal with warm stage aesthetic.
 * Responsive typography, semantic structure.
 */

import type { SongResult } from '../data/types';

export class ResultsScreen {
  private container: HTMLElement;
  private onRetry: () => void;
  private onSongSelect: () => void;

  constructor(parent: HTMLElement, onRetry: () => void, onSongSelect: () => void) {
    this.onRetry = onRetry;
    this.onSongSelect = onSongSelect;

    this.container = document.createElement('div');
    this.container.className = 'screen results-screen hidden';
    this.container.style.cssText = `
      padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);
      overflow-y: auto;
    `;

    parent.appendChild(this.container);
  }

  showResult(result: SongResult, songTitle: string): void {
    const gradeColor = result.grade === 'S' ? 'var(--tt-gold)' :
                       result.grade === 'A' ? 'var(--tt-green)' :
                       result.grade === 'B' ? 'var(--tt-blue)' :
                       result.grade === 'C' ? 'var(--tt-text)' :
                       'var(--tt-red)';

    const isGold = result.grade === 'S' || result.grade === 'A';

    this.container.innerHTML = `
      <div style="
        position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(ellipse 50% 40% at 50% 35%, ${isGold ? 'rgba(212, 168, 83, 0.06)' : 'rgba(255, 255, 255, 0.02)'} 0%, transparent 70%);
      " aria-hidden="true"></div>

      <div style="max-width: 480px; width: 100%; margin: 0 auto; text-align: center; position: relative; z-index: 1;" aria-label="Song results">
        <h2 style="
          font-family: var(--tt-font-display);
          font-size: clamp(16px, 2.5vw, 20px);
          font-weight: 300;
          font-style: italic;
          color: var(--tt-text-dim);
          margin-bottom: clamp(20px, 3vw, 32px);
          opacity: 0;
          animation: fadeIn 0.6s 0.1s var(--tt-ease-out-expo) forwards;
        ">${songTitle}</h2>

        <div style="
          font-family: var(--tt-font-display);
          font-size: clamp(80px, 18vw, 140px);
          font-weight: 300;
          font-style: italic;
          color: ${gradeColor};
          line-height: 1;
          margin-bottom: clamp(24px, 4vw, 40px);
          opacity: 0;
          animation: bounceIn 0.7s 0.3s var(--tt-ease-out-expo) forwards;
          ${isGold ? `text-shadow: 0 0 60px rgba(212, 168, 83, 0.3), 0 0 120px rgba(212, 168, 83, 0.1);` : ''}
        " role="text" aria-label="Grade: ${result.grade}">${result.grade}</div>

        <dl style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-bottom: clamp(20px, 3vw, 32px);
          opacity: 0;
          animation: fadeIn 0.6s 0.6s var(--tt-ease-out-expo) forwards;
          border-radius: 12px;
          overflow: hidden;
        ">
          ${this.statCell(result.score.toLocaleString(), 'Score')}
          ${this.statCell(`${Math.round(result.accuracy * 100)}%`, 'Accuracy')}
          ${this.statCell(`${result.maxCombo}x`, 'Max Combo')}
          ${this.statCell(`${result.choirSize}`, 'Choir Size')}
        </dl>

        <div style="
          display: flex;
          justify-content: center;
          gap: clamp(12px, 2vw, 20px);
          font-size: clamp(12px, 1.5vw, 13px);
          color: var(--tt-text-dim);
          margin-bottom: clamp(28px, 4vw, 40px);
          opacity: 0;
          animation: fadeIn 0.6s 0.8s var(--tt-ease-out-expo) forwards;
          font-weight: 300;
          flex-wrap: wrap;
        " aria-label="Note breakdown">
          <span><span style="color: var(--tt-perfect);">${result.perfects}</span> perfect</span>
          <span>${result.greats} great</span>
          <span><span style="color: var(--tt-good);">${result.goods}</span> good</span>
          <span><span style="color: var(--tt-miss);">${result.misses}</span> miss</span>
        </div>

        <nav style="
          display: flex;
          gap: 12px;
          justify-content: center;
          opacity: 0;
          animation: fadeIn 0.6s 1s var(--tt-ease-out-expo) forwards;
        " aria-label="Results actions">
          <button class="btn btn-primary retry-btn" style="border-radius: 24px; padding: 12px 36px;">Retry</button>
          <button class="btn btn-secondary select-btn" style="border-radius: 24px; padding: 12px 36px;">Song Select</button>
        </nav>

        <div style="
          margin-top: 20px;
          font-size: 11px;
          color: var(--tt-text-muted);
          letter-spacing: 1px;
          opacity: 0;
          animation: fadeIn 0.6s 1s var(--tt-ease-out-expo) forwards;
        ">Press <kbd style="color: var(--tt-text-dim); font-family: var(--tt-font-mono); font-size: 10px; padding: 2px 5px; border: 1px solid rgba(255,255,255,0.1); border-radius: 3px;">R</kbd> to retry</div>
      </div>
    `;

    this.container.querySelector('.retry-btn')!.addEventListener('click', () => this.onRetry());
    this.container.querySelector('.select-btn')!.addEventListener('click', () => this.onSongSelect());
  }

  private statCell(value: string, label: string): string {
    return `
      <div style="
        background: rgba(255, 255, 255, 0.025);
        padding: clamp(14px, 2vw, 20px) clamp(10px, 2vw, 16px);
      ">
        <dt style="
          font-size: 10px;
          color: var(--tt-text-muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
          order: 2;
          margin-top: 6px;
        ">${label}</dt>
        <dd style="
          font-family: var(--tt-font-display);
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 300;
          color: var(--tt-text);
          line-height: 1;
          margin: 0;
        ">${value}</dd>
      </div>
    `;
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
