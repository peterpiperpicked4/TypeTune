/**
 * Practice results screen: shows WPM, accuracy, per-key stats, weakest keys.
 */

import type { PracticeResult } from '../data/types';

export class PracticeResultsScreen {
  private container: HTMLElement;
  private onRetry: () => void;
  private onBack: () => void;

  constructor(
    parent: HTMLElement,
    onRetry: () => void,
    onBack: () => void,
  ) {
    this.onRetry = onRetry;
    this.onBack = onBack;
    this.container = document.createElement('div');
    this.container.className = 'screen practice-results-screen hidden';
    this.container.style.cssText = `
      padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);
      overflow-y: auto;
    `;
    parent.appendChild(this.container);
  }

  showResult(result: PracticeResult, lessonTitle: string): void {
    // Find weakest keys (highest miss rate, min 3 attempts)
    const weakKeys: { key: string; accuracy: number; total: number }[] = [];
    for (const [key, stats] of Object.entries(result.perKeyStats)) {
      const total = stats.hits + stats.misses;
      if (total >= 3) {
        weakKeys.push({ key, accuracy: stats.hits / total, total });
      }
    }
    weakKeys.sort((a, b) => a.accuracy - b.accuracy);
    const topWeak = weakKeys.slice(0, 5);

    const durationSec = Math.round(result.durationMs / 1000);
    const accPct = Math.round(result.accuracy * 100);

    this.container.innerHTML = `
      <div style="
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(91, 143, 212, 0.05) 0%, transparent 70%);
      " aria-hidden="true"></div>

      <div style="max-width: 460px; width: 100%; margin: 0 auto; position: relative; z-index: 1; text-align: center;">
        <h2 style="
          font-family: var(--tt-font-display);
          font-size: clamp(28px, 5vw, 36px);
          font-weight: 300;
          font-style: italic;
          color: var(--tt-text);
          margin-bottom: 6px;
          animation: fadeIn 0.6s var(--tt-ease-out-expo) forwards;
        ">Practice Complete</h2>
        <div style="
          font-size: clamp(12px, 1.5vw, 14px);
          color: var(--tt-text-muted);
          margin-bottom: clamp(28px, 4vw, 40px);
          animation: fadeIn 0.6s 0.1s var(--tt-ease-out-expo) forwards;
          opacity: 0;
        ">${lessonTitle} \u00b7 ${durationSec}s</div>

        <!-- Big WPM -->
        <div style="
          animation: bounceIn 0.5s 0.2s var(--tt-ease-out-expo) forwards;
          opacity: 0;
        ">
          <div style="
            font-family: var(--tt-font-display);
            font-size: clamp(60px, 12vw, 80px);
            font-weight: 300;
            color: #5b8fd4;
            line-height: 1;
          ">${result.wpm}</div>
          <div style="
            font-size: 12px;
            font-weight: 500;
            color: var(--tt-text-muted);
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 4px;
          ">words per minute</div>
        </div>

        <!-- Stats row -->
        <div style="
          display: flex;
          justify-content: center;
          gap: clamp(24px, 5vw, 40px);
          margin-top: clamp(24px, 4vw, 36px);
          animation: fadeIn 0.6s 0.3s var(--tt-ease-out-expo) forwards;
          opacity: 0;
        ">
          <div>
            <div style="font-family: var(--tt-font-display); font-size: clamp(28px, 5vw, 36px); font-weight: 300; color: ${accPct >= 95 ? 'var(--tt-green)' : accPct >= 80 ? 'var(--tt-accent)' : 'var(--tt-red)'};">${accPct}%</div>
            <div style="font-size: 11px; color: var(--tt-text-muted); letter-spacing: 1px;">ACCURACY</div>
          </div>
          <div>
            <div style="font-family: var(--tt-font-display); font-size: clamp(28px, 5vw, 36px); font-weight: 300; color: var(--tt-text);">${result.wordsCompleted}</div>
            <div style="font-size: 11px; color: var(--tt-text-muted); letter-spacing: 1px;">WORDS</div>
          </div>
          <div>
            <div style="font-family: var(--tt-font-display); font-size: clamp(28px, 5vw, 36px); font-weight: 300; color: var(--tt-text);">${result.correctChars}</div>
            <div style="font-size: 11px; color: var(--tt-text-muted); letter-spacing: 1px;">CORRECT</div>
          </div>
        </div>

        <!-- Weak keys -->
        ${topWeak.length > 0 ? `
          <div style="
            margin-top: clamp(28px, 4vw, 40px);
            animation: fadeIn 0.6s 0.4s var(--tt-ease-out-expo) forwards;
            opacity: 0;
          ">
            <div style="font-size: 11px; color: var(--tt-text-muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">Keys to practice</div>
            <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
              ${topWeak.map(k => `
                <div style="
                  font-family: var(--tt-font-mono);
                  font-size: 14px;
                  font-weight: 600;
                  color: ${k.accuracy < 0.7 ? 'var(--tt-red)' : 'var(--tt-accent)'};
                  background: rgba(255, 255, 255, 0.04);
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  border-radius: 8px;
                  padding: 8px 14px;
                  min-width: 44px;
                  text-align: center;
                ">
                  <div>${k.key === ' ' ? 'SPC' : k.key.toUpperCase()}</div>
                  <div style="font-size: 10px; font-weight: 400; color: var(--tt-text-muted); margin-top: 2px;">${Math.round(k.accuracy * 100)}%</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Buttons -->
        <div style="
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: clamp(32px, 5vw, 48px);
          animation: fadeIn 0.6s 0.5s var(--tt-ease-out-expo) forwards;
          opacity: 0;
        ">
          <button class="btn btn-primary tt-retry-btn" style="
            font-size: 15px;
            padding: 14px 40px;
            border-radius: 30px;
            background: linear-gradient(135deg, #5b8fd4 0%, #4a7bc0 100%);
          ">Try Again</button>
          <button class="btn btn-secondary tt-back-btn" style="
            font-size: 13px;
            padding: 12px 24px;
            border-radius: 24px;
          ">Lessons</button>
        </div>
      </div>
    `;

    this.container.querySelector('.tt-retry-btn')!.addEventListener('click', () => this.onRetry());
    this.container.querySelector('.tt-back-btn')!.addEventListener('click', () => this.onBack());
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
