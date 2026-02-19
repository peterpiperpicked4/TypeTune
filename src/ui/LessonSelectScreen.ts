/**
 * Lesson select screen: choose a practice lesson (home row → full keyboard).
 */

import type { Lesson } from '../data/types';
import { lessons } from '../data/lessons';

export class LessonSelectScreen {
  private container: HTMLElement;
  private onSelect: (lesson: Lesson) => void;
  private onBack: () => void;

  constructor(
    parent: HTMLElement,
    onSelect: (lesson: Lesson) => void,
    onBack: () => void,
  ) {
    this.onSelect = onSelect;
    this.onBack = onBack;
    this.container = document.createElement('div');
    this.container.className = 'screen lesson-select-screen hidden';
    this.container.style.cssText = `
      padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);
      overflow-y: auto;
    `;

    parent.appendChild(this.container);
  }

  show(): void {
    this.render();
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
  }

  private render(): void {
    this.container.innerHTML = `
      <div style="
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(91, 143, 212, 0.04) 0%, transparent 70%);
      " aria-hidden="true"></div>

      <div style="max-width: 520px; width: 100%; margin: 0 auto; position: relative; z-index: 1;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: clamp(24px, 4vw, 40px);">
          <button class="btn btn-secondary tt-back-btn" style="font-size: 13px; padding: 8px 18px; border-radius: 20px;">Back</button>
          <h2 style="
            font-family: var(--tt-font-display);
            font-size: clamp(24px, 4vw, 32px);
            font-weight: 300;
            font-style: italic;
            color: var(--tt-text);
          ">Choose Lesson</h2>
          <div style="width: 60px;"></div>
        </div>

        <ul class="tt-lesson-cards" style="display: flex; flex-direction: column; gap: 8px; list-style: none;" role="list" aria-label="Available lessons"></ul>
      </div>
    `;

    this.container.querySelector('.tt-back-btn')!.addEventListener('click', () => this.onBack());

    const cardsContainer = this.container.querySelector('.tt-lesson-cards')!;

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const li = document.createElement('li');

      const card = document.createElement('div');
      card.className = 'song-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${lesson.title}: ${lesson.description}`);
      card.style.cssText = `
        display: flex;
        align-items: center;
        gap: clamp(10px, 2vw, 16px);
        padding: clamp(14px, 2vw, 18px) clamp(14px, 2vw, 22px);
        background: rgba(255, 255, 255, 0.025);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
        animation: slideUp 0.4s var(--tt-ease-out-expo) forwards;
        animation-delay: ${i * 0.06}s;
        opacity: 0;
        --final-opacity: 1;
        outline: none;
      `;

      const select = () => this.onSelect(lesson);
      card.addEventListener('click', select);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      });

      // Accent bar (blue spectrum for practice)
      const bar = document.createElement('div');
      bar.setAttribute('aria-hidden', 'true');
      const hue = 210 + i * 15; // shift blue hue per lesson
      bar.style.cssText = `
        width: 3px;
        height: 36px;
        border-radius: 2px;
        background: hsl(${hue}, 55%, 60%);
        flex-shrink: 0;
        opacity: 0.8;
      `;

      // Info
      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; min-width: 0;';

      const title = document.createElement('div');
      title.style.cssText = `
        font-family: var(--tt-font-display);
        font-weight: 400;
        font-size: clamp(17px, 2.5vw, 20px);
        color: var(--tt-text);
        line-height: 1.2;
      `;
      title.textContent = lesson.title;

      const desc = document.createElement('div');
      desc.style.cssText = `
        font-size: clamp(11px, 1.5vw, 12px);
        color: var(--tt-text-dim);
        margin-top: 4px;
        font-weight: 300;
      `;
      desc.textContent = lesson.description;

      // Keys preview
      const keysEl = document.createElement('div');
      keysEl.style.cssText = `
        font-family: var(--tt-font-mono);
        font-size: 10px;
        color: var(--tt-text-muted);
        margin-top: 6px;
        letter-spacing: 2px;
      `;
      keysEl.textContent = lesson.keys.filter(k => k !== ' ').join(' ').toUpperCase();

      info.appendChild(title);
      info.appendChild(desc);
      info.appendChild(keysEl);

      card.appendChild(bar);
      card.appendChild(info);
      li.appendChild(card);
      cardsContainer.appendChild(li);
    }
  }

  get element(): HTMLElement { return this.container; }
}
