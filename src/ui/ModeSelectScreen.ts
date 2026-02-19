/**
 * Mode select screen: choose between Song Mode and Practice Mode.
 * Theatrical card layout matching the concert-hall aesthetic.
 */

import type { GameMode } from '../data/types';

export class ModeSelectScreen {
  private container: HTMLElement;
  private onSelect: (mode: GameMode) => void;
  private onBack: () => void;

  constructor(
    parent: HTMLElement,
    onSelect: (mode: GameMode) => void,
    onBack: () => void,
  ) {
    this.onSelect = onSelect;
    this.onBack = onBack;
    this.container = document.createElement('div');
    this.container.className = 'screen mode-select-screen hidden';
    this.container.setAttribute('aria-label', 'Choose game mode');
    this.container.style.cssText = `
      padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);
      overflow-y: auto;
    `;

    this.render();
    parent.appendChild(this.container);
  }

  private render(): void {
    this.container.innerHTML = `
      <div style="
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212, 168, 83, 0.04) 0%, transparent 70%);
      " aria-hidden="true"></div>

      <div style="max-width: 520px; width: 100%; margin: 0 auto; position: relative; z-index: 1;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: clamp(28px, 5vw, 48px);">
          <button class="btn btn-secondary tt-back-btn" style="font-size: 13px; padding: 8px 18px; border-radius: 20px;">Back</button>
          <h2 style="
            font-family: var(--tt-font-display);
            font-size: clamp(24px, 4vw, 32px);
            font-weight: 300;
            font-style: italic;
            color: var(--tt-text);
          ">Choose Mode</h2>
          <div style="width: 60px;"></div>
        </div>

        <div class="tt-mode-cards" style="display: flex; flex-direction: column; gap: 16px;"></div>
      </div>
    `;

    this.container.querySelector('.tt-back-btn')!.addEventListener('click', () => this.onBack());

    const cardsContainer = this.container.querySelector('.tt-mode-cards')!;

    // Song Mode card
    cardsContainer.appendChild(this.createModeCard(
      'song',
      'Song Mode',
      'Type lyrics to build a virtual choir',
      'Type along with Peter Hollens\u2019 a cappella arrangements. Each correct keystroke adds your voice to the choir.',
      '#d4a853',
      0,
    ));

    // Practice Mode card
    cardsContainer.appendChild(this.createModeCard(
      'practice',
      'Practice Mode',
      'Build speed and accuracy with real music',
      'Peter\u2019s music plays in the background while you type words and sentences. Track your WPM and accuracy.',
      '#5b8fd4',
      1,
    ));
  }

  private createModeCard(
    mode: GameMode,
    title: string,
    subtitle: string,
    description: string,
    accentColor: string,
    index: number,
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = 'song-card'; // reuse hover/focus styles
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${title}: ${subtitle}`);
    card.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: clamp(12px, 2vw, 18px);
      padding: clamp(20px, 3vw, 28px) clamp(18px, 2.5vw, 24px);
      background: rgba(255, 255, 255, 0.025);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer;
      animation: slideUp 0.4s var(--tt-ease-out-expo) forwards;
      animation-delay: ${index * 0.08}s;
      opacity: 0;
      --final-opacity: 1;
      outline: none;
    `;

    const select = () => this.onSelect(mode);
    card.addEventListener('click', select);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select();
      }
    });

    // Accent bar
    const bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = `
      width: 4px;
      height: 48px;
      border-radius: 2px;
      background: ${accentColor};
      flex-shrink: 0;
      opacity: 0.8;
      margin-top: 4px;
    `;

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; min-width: 0;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      font-family: var(--tt-font-display);
      font-weight: 400;
      font-size: clamp(20px, 3vw, 24px);
      color: var(--tt-text);
      line-height: 1.2;
    `;
    titleEl.textContent = title;

    const subtitleEl = document.createElement('div');
    subtitleEl.style.cssText = `
      font-size: clamp(12px, 1.8vw, 14px);
      color: ${accentColor};
      font-weight: 500;
      margin-top: 4px;
      letter-spacing: 0.5px;
    `;
    subtitleEl.textContent = subtitle;

    const descEl = document.createElement('div');
    descEl.style.cssText = `
      font-size: clamp(12px, 1.5vw, 13px);
      color: var(--tt-text-dim);
      font-weight: 300;
      margin-top: 8px;
      line-height: 1.5;
    `;
    descEl.textContent = description;

    content.appendChild(titleEl);
    content.appendChild(subtitleEl);
    content.appendChild(descEl);

    card.appendChild(bar);
    card.appendChild(content);
    return card;
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
