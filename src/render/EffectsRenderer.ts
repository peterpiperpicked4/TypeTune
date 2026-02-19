/**
 * Effects renderer: warm golden combo flashes, particles.
 * Timer cleanup tracked for safe teardown.
 */

import type { Grade } from '../data/types';

export class EffectsRenderer {
  private container: HTMLElement;
  private comboFlash: HTMLElement;
  private activeTimers: Set<number> = new Set();

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'effects-layer';
    this.container.setAttribute('aria-hidden', 'true');
    this.container.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 100;
      overflow: hidden;
    `;

    this.comboFlash = document.createElement('div');
    this.comboFlash.style.cssText = `
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.15s ease;
      pointer-events: none;
    `;
    this.container.appendChild(this.comboFlash);

    parent.appendChild(this.container);
  }

  flashCombo(combo: number): void {
    const milestones = [10, 25, 50, 75, 100];
    if (!milestones.includes(combo)) return;

    this.comboFlash.style.background = 'radial-gradient(ellipse at center 40%, rgba(212, 168, 83, 0.15) 0%, transparent 65%)';
    this.comboFlash.style.opacity = '1';

    const text = document.createElement('div');
    text.textContent = `${combo} COMBO`;
    text.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.5);
      font-family: var(--tt-font-display);
      font-size: clamp(36px, 6vw, 52px);
      font-weight: 300;
      font-style: italic;
      color: var(--tt-gold);
      text-shadow: 0 0 40px rgba(212, 168, 83, 0.4), 0 0 80px rgba(212, 168, 83, 0.15);
      opacity: 0;
      animation: comboText 1.2s var(--tt-ease-out-expo) forwards;
      letter-spacing: 4px;
      will-change: transform, opacity;
    `;
    this.container.appendChild(text);

    const t1 = window.setTimeout(() => {
      this.comboFlash.style.opacity = '0';
      this.activeTimers.delete(t1);
    }, 350);
    this.activeTimers.add(t1);

    const t2 = window.setTimeout(() => {
      text.remove();
      this.activeTimers.delete(t2);
    }, 1200);
    this.activeTimers.add(t2);
  }

  spawnParticles(x: number, y: number, grade: Grade): void {
    const count = grade === 'perfect' ? 8 : grade === 'great' ? 5 : 3;
    const color = grade === 'perfect' ? '#d4a853' : grade === 'great' ? '#f0ebe3' : '#9a8fa0';

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 35 + Math.random() * 55;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance - 35;

      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        --px: ${px}px;
        --py: ${py}px;
        animation: particleFly 0.5s var(--tt-ease-out) forwards;
        box-shadow: 0 0 6px ${color}80;
        will-change: transform, opacity;
      `;
      this.container.appendChild(particle);
      const t = window.setTimeout(() => {
        particle.remove();
        this.activeTimers.delete(t);
      }, 500);
      this.activeTimers.add(t);
    }
  }

  /** Cancel all pending timers — safe for screen transitions */
  cleanup(): void {
    for (const t of this.activeTimers) {
      clearTimeout(t);
    }
    this.activeTimers.clear();
  }

  get element(): HTMLElement {
    return this.container;
  }
}
